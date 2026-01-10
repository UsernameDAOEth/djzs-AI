import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertMemberSchema, insertRoomSchema, insertPaymentReceiptSchema, insertStoredMessageSchema, insertJournalEntrySchema, insertPinnedMemorySchema } from "@shared/schema";
import { z } from "zod";
import { verifyMessage } from "viem";
import { analyzeJournalEntry, analyzeResearchEntry } from "./venice";
import { analyzeWithAgent, agentInputSchema } from "./agent.api";
import { paymentMiddleware, x402ResourceServer } from "@x402/express";
import { ExactEvmScheme } from "@x402/evm/exact/server";
import { HTTPFacilitatorClient } from "@x402/core/server";

// Paragraph API helper - direct fetch instead of SDK to avoid broken dependencies
const PARAGRAPH_API_BASE = "https://api.paragraph.xyz/api/blogs";

async function paragraphFetch(endpoint: string) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (process.env.PARAGRAPH_API_KEY) {
    headers["Authorization"] = `Bearer ${process.env.PARAGRAPH_API_KEY}`;
  }
  const response = await fetch(`${PARAGRAPH_API_BASE}${endpoint}`, { headers });
  if (!response.ok) {
    throw new Error(`Paragraph API error: ${response.status}`);
  }
  return response.json();
}

// Track used signatures to prevent replay attacks
const usedSignatures = new Set<string>();

// Helper to validate timestamp
function isValidTimestamp(timestamp: string): boolean {
  const ts = Number(timestamp);
  if (!Number.isFinite(ts) || ts <= 0) return false;
  const age = Date.now() - ts;
  return age >= 0 && age <= 5 * 60 * 1000; // Must be within last 5 minutes
}

// Helper to verify admin signature
async function verifyAdminAction(adminAddress: string, signature: string, message: string): Promise<boolean> {
  try {
    // Check if signature has been used before
    if (usedSignatures.has(signature)) {
      return false;
    }
    
    const valid = await verifyMessage({
      address: adminAddress as `0x${string}`,
      message,
      signature: signature as `0x${string}`,
    });
    if (!valid) return false;
    
    const admin = await storage.getMember(adminAddress);
    if (!admin?.isAdmin) return false;
    
    // Mark signature as used
    usedSignatures.add(signature);
    
    // Clean up old signatures periodically (keep set from growing unbounded)
    if (usedSignatures.size > 10000) {
      usedSignatures.clear();
    }
    
    return true;
  } catch {
    return false;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // ==================== X402 PAID INSIGHTS ====================
  // Your receiving wallet address (Base/EVM) - you get paid for insights!
  const DJZS_PAY_TO = process.env.DJZS_PAY_TO_WALLET || "0x3E79E0374383ea64bC16C9B0568C6B13eF084aFB";
  const X402_NETWORK = (process.env.X402_NETWORK || "eip155:84532") as `${string}:${string}`; // Base Sepolia for testing
  const X402_FACILITATOR_URL = process.env.X402_FACILITATOR_URL || "https://x402.org/facilitator";
  
  // Create x402 resource server with EVM exact scheme
  const facilitatorClient = new HTTPFacilitatorClient({ url: X402_FACILITATOR_URL });
  const x402Server = new x402ResourceServer(facilitatorClient).register(X402_NETWORK, new ExactEvmScheme());
  
  // Apply x402 paywall middleware for paid endpoints
  app.use(
    paymentMiddleware(
      {
        "POST /djzs/insight": {
          accepts: [
            {
              scheme: "exact",
              price: "$0.02",
              network: X402_NETWORK,
              payTo: DJZS_PAY_TO as `0x${string}`,
            }
          ],
          description: "DJZS: Generate an AI insight from your journal entry",
          mimeType: "application/json",
        }
      },
      x402Server
    )
  );
  
  // Paid insight endpoint - only runs after payment is verified
  app.post("/djzs/insight", async (req, res) => {
    try {
      const text = String(req.body?.text ?? "").trim().slice(0, 2000);
      if (!text) {
        return res.status(400).json({ error: "Text is required. Send {\"text\": \"your journal entry\"}" });
      }
      
      // Use Venice AI for analysis (standalone insight, no prior context)
      const insight = await analyzeJournalEntry(text, [], []);
      
      res.json({
        ok: true,
        inputPreview: text.slice(0, 100) + (text.length > 100 ? "..." : ""),
        insight,
        paidAmount: "$0.02",
        network: X402_NETWORK,
      });
    } catch (error) {
      console.error("Paid insight error:", error);
      res.status(500).json({ error: error instanceof Error ? error.message : "Failed to generate insight" });
    }
  });
  
  app.get("/api/health", (_req, res) => {
    res.json({ ok: true, timestamp: Date.now(), service: "DJZS Chat API" });
  });

  app.get("/api/members", async (_req, res) => {
    try {
      const members = await storage.getAllMembers();
      res.json(members);
    } catch (error) {
      console.error("Error fetching members:", error);
      res.status(500).json({ error: "Failed to fetch members" });
    }
  });

  app.get("/api/members/:address", async (req, res) => {
    try {
      const member = await storage.getMember(req.params.address);
      if (!member) {
        return res.status(404).json({ error: "Member not found" });
      }
      res.json(member);
    } catch (error) {
      console.error("Error fetching member:", error);
      res.status(500).json({ error: "Failed to fetch member" });
    }
  });

  app.post("/api/members", async (req, res) => {
    try {
      const validatedData = insertMemberSchema.parse(req.body);
      const member = await storage.createMember(validatedData);
      res.status(201).json(member);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid member data", details: error.errors });
      }
      if (error instanceof Error && error.message === "MEMBER_EXISTS") {
        return res.status(409).json({ error: "Member already exists" });
      }
      console.error("Error creating member:", error);
      res.status(500).json({ error: "Failed to create member" });
    }
  });

  app.patch("/api/members/:address", async (req, res) => {
    try {
      const updated = await storage.updateMember(req.params.address, req.body);
      if (!updated) {
        return res.status(404).json({ error: "Member not found" });
      }
      res.json(updated);
    } catch (error) {
      console.error("Error updating member:", error);
      res.status(500).json({ error: "Failed to update member" });
    }
  });

  app.delete("/api/members/:address", async (req, res) => {
    try {
      const deleted = await storage.deleteMember(req.params.address);
      if (!deleted) {
        return res.status(404).json({ error: "Member not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting member:", error);
      res.status(500).json({ error: "Failed to delete member" });
    }
  });

  app.get("/api/rooms", async (_req, res) => {
    try {
      const rooms = await storage.getAllRooms();
      res.json(rooms);
    } catch (error) {
      console.error("Error fetching rooms:", error);
      res.status(500).json({ error: "Failed to fetch rooms" });
    }
  });

  app.get("/api/rooms/:id", async (req, res) => {
    try {
      const room = await storage.getRoom(req.params.id);
      if (!room) {
        return res.status(404).json({ error: "Room not found" });
      }
      res.json(room);
    } catch (error) {
      console.error("Error fetching room:", error);
      res.status(500).json({ error: "Failed to fetch room" });
    }
  });

  app.post("/api/rooms", async (req, res) => {
    try {
      const validatedData = insertRoomSchema.parse(req.body);
      const room = await storage.createRoom(validatedData);
      res.status(201).json(room);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid room data", details: error.errors });
      }
      console.error("Error creating room:", error);
      res.status(500).json({ error: "Failed to create room" });
    }
  });

  app.patch("/api/rooms/:id", async (req, res) => {
    try {
      const updated = await storage.updateRoom(req.params.id, req.body);
      if (!updated) {
        return res.status(404).json({ error: "Room not found" });
      }
      res.json(updated);
    } catch (error) {
      console.error("Error updating room:", error);
      res.status(500).json({ error: "Failed to update room" });
    }
  });

  app.delete("/api/rooms/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteRoom(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Room not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting room:", error);
      res.status(500).json({ error: "Failed to delete room" });
    }
  });

  app.post("/api/payments", async (req, res) => {
    try {
      const validatedData = insertPaymentReceiptSchema.parse(req.body);
      const receipt = await storage.createPaymentReceipt(validatedData);
      res.status(201).json(receipt);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid payment data", details: error.errors });
      }
      console.error("Error creating payment receipt:", error);
      res.status(500).json({ error: "Failed to create payment receipt" });
    }
  });

  app.get("/api/payments/:txHash", async (req, res) => {
    try {
      const receipt = await storage.getPaymentReceiptByTxHash(req.params.txHash);
      if (!receipt) {
        return res.status(404).json({ error: "Payment receipt not found" });
      }
      res.json(receipt);
    } catch (error) {
      console.error("Error fetching payment receipt:", error);
      res.status(500).json({ error: "Failed to fetch payment receipt" });
    }
  });

  app.get("/api/messages/:roomId", async (req, res) => {
    try {
      const messages = await storage.getMessagesByRoom(req.params.roomId);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });

  app.post("/api/messages", async (req, res) => {
    try {
      const validatedData = insertStoredMessageSchema.parse(req.body);
      
      // Extract author address from message
      const authorAddress = 
        'authorAddress' in validatedData.message ? validatedData.message.authorAddress :
        'voterAddress' in validatedData.message ? validatedData.message.voterAddress : null;
      
      if (!authorAddress) {
        return res.status(400).json({ error: "Message must include author address" });
      }
      
      // Verify author is a valid, non-muted member
      const member = await storage.getMember(authorAddress);
      if (!member) {
        return res.status(403).json({ error: "Not a registered member" });
      }
      if (!member.isAllowlisted && !member.isAdmin) {
        return res.status(403).json({ error: "Not on allowlist" });
      }
      if (member.isMuted) {
        return res.status(403).json({ error: "You are muted and cannot send messages" });
      }
      
      const message = await storage.createMessage(validatedData);
      res.status(201).json(message);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid message data", details: error.errors });
      }
      console.error("Error creating message:", error);
      res.status(500).json({ error: "Failed to create message" });
    }
  });

  // Admin controls - mute member (requires signature)
  app.post("/api/admin/mute/:address", async (req, res) => {
    try {
      const { adminAddress, signature, timestamp } = req.body;
      if (!adminAddress || !signature || !timestamp) {
        return res.status(400).json({ error: "Admin address, signature, and timestamp required" });
      }
      
      // Validate timestamp format and freshness
      if (!isValidTimestamp(timestamp)) {
        return res.status(401).json({ error: "Invalid or expired timestamp" });
      }
      
      const message = `DJZS Admin: Mute ${req.params.address} at ${timestamp}`;
      const isValid = await verifyAdminAction(adminAddress, signature, message);
      if (!isValid) {
        return res.status(403).json({ error: "Invalid admin signature or signature already used" });
      }
      
      const updated = await storage.updateMember(req.params.address, { isMuted: true });
      if (!updated) {
        return res.status(404).json({ error: "Member not found" });
      }
      res.json(updated);
    } catch (error) {
      console.error("Error muting member:", error);
      res.status(500).json({ error: "Failed to mute member" });
    }
  });

  // Admin controls - unmute member (requires signature)
  app.post("/api/admin/unmute/:address", async (req, res) => {
    try {
      const { adminAddress, signature, timestamp } = req.body;
      if (!adminAddress || !signature || !timestamp) {
        return res.status(400).json({ error: "Admin address, signature, and timestamp required" });
      }
      
      if (!isValidTimestamp(timestamp)) {
        return res.status(401).json({ error: "Invalid or expired timestamp" });
      }
      
      const message = `DJZS Admin: Unmute ${req.params.address} at ${timestamp}`;
      const isValid = await verifyAdminAction(adminAddress, signature, message);
      if (!isValid) {
        return res.status(403).json({ error: "Invalid admin signature or signature already used" });
      }
      
      const updated = await storage.updateMember(req.params.address, { isMuted: false });
      if (!updated) {
        return res.status(404).json({ error: "Member not found" });
      }
      res.json(updated);
    } catch (error) {
      console.error("Error unmuting member:", error);
      res.status(500).json({ error: "Failed to unmute member" });
    }
  });

  // Admin controls - remove member (requires signature)
  app.post("/api/admin/remove/:address", async (req, res) => {
    try {
      const { adminAddress, signature, timestamp } = req.body;
      if (!adminAddress || !signature || !timestamp) {
        return res.status(400).json({ error: "Admin address, signature, and timestamp required" });
      }
      
      if (!isValidTimestamp(timestamp)) {
        return res.status(401).json({ error: "Invalid or expired timestamp" });
      }
      
      const message = `DJZS Admin: Remove ${req.params.address} at ${timestamp}`;
      const isValid = await verifyAdminAction(adminAddress, signature, message);
      if (!isValid) {
        return res.status(403).json({ error: "Invalid admin signature or signature already used" });
      }
      
      const deleted = await storage.deleteMember(req.params.address);
      if (!deleted) {
        return res.status(404).json({ error: "Member not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error removing member:", error);
      res.status(500).json({ error: "Failed to remove member" });
    }
  });

  // NFT verification endpoint (requires signature to verify caller identity)
  app.post("/api/verify-nft", async (req, res) => {
    try {
      const { address, nftContractAddress, chainId, signature, timestamp } = req.body;
      if (!address || !nftContractAddress || !signature || !timestamp) {
        return res.status(400).json({ error: "Address, NFT contract, signature, and timestamp required" });
      }
      
      // Verify timestamp format and freshness
      if (!isValidTimestamp(timestamp)) {
        return res.status(401).json({ error: "Invalid or expired timestamp" });
      }
      
      // Check if signature was already used
      if (usedSignatures.has(signature)) {
        return res.status(403).json({ error: "Signature already used" });
      }
      
      // Verify the caller is the address they claim to be
      const message = `DJZS: Verify NFT ownership at ${timestamp}`;
      try {
        const valid = await verifyMessage({
          address: address as `0x${string}`,
          message,
          signature: signature as `0x${string}`,
        });
        if (!valid) {
          return res.status(403).json({ error: "Invalid signature" });
        }
        usedSignatures.add(signature);
      } catch {
        return res.status(403).json({ error: "Invalid signature" });
      }
      
      // Call Base RPC to check NFT balance
      const rpcUrl = chainId === 8453 
        ? "https://mainnet.base.org" 
        : "https://sepolia.base.org";
      
      // ERC721 balanceOf call
      const data = `0x70a08231000000000000000000000000${address.slice(2).toLowerCase()}`;
      
      const response = await fetch(rpcUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: "eth_call",
          params: [{ to: nftContractAddress, data }, "latest"],
        }),
      });
      
      const result = await response.json();
      const balance = parseInt(result.result || "0x0", 16);
      const hasNft = balance > 0;
      
      // Update member's NFT status
      await storage.updateMember(address, { hasNft });
      
      // If they have the NFT, allowlist them
      if (hasNft) {
        await storage.updateMember(address, { isAllowlisted: true });
      }
      
      res.json({ hasNft, balance });
    } catch (error) {
      console.error("Error verifying NFT:", error);
      res.status(500).json({ error: "Failed to verify NFT ownership" });
    }
  });

  // Get publication info by slug (using direct fetch)
  app.get("/api/paragraph/publications/:slug", async (req, res) => {
    try {
      const slug = req.params.slug.replace('@', '');
      const publication = await paragraphFetch(`/@${slug}`);
      res.json(publication);
    } catch (error) {
      console.error("Error fetching publication:", error);
      res.status(500).json({ error: "Failed to fetch publication" });
    }
  });

  // Get posts from a publication
  app.get("/api/paragraph/publications/:slug/posts", async (req, res) => {
    try {
      const slug = req.params.slug.replace('@', '');
      let publication;
      try {
        publication = await paragraphFetch(`/@${slug}`);
      } catch {
        return res.status(404).json({ error: "Publication not found" });
      }
      
      const cursor = req.query.cursor as string | undefined;
      const cursorParam = cursor ? `?cursor=${cursor}` : '';
      const posts = await paragraphFetch(`/@${slug}/posts${cursorParam}`);
      
      res.json({ posts: posts.posts || posts, pagination: posts.pagination, publication });
    } catch (error) {
      console.error("Error fetching posts:", error);
      res.status(500).json({ error: "Failed to fetch posts" });
    }
  });

  // Get a single post by publication slug and post slug
  app.get("/api/paragraph/publications/:pubSlug/posts/:postSlug", async (req, res) => {
    try {
      const pubSlug = req.params.pubSlug.replace('@', '');
      const postSlug = req.params.postSlug;
      
      const post = await paragraphFetch(`/@${pubSlug}/posts/${postSlug}`);
      
      res.json(post);
    } catch (error) {
      console.error("Error fetching post:", error);
      res.status(500).json({ error: "Failed to fetch post" });
    }
  });

  // ==================== JOURNAL API ====================
  
  // Create a journal entry and analyze it with Venice AI
  app.post("/api/journal/analyze", async (req, res) => {
    try {
      const { content, walletAddress, zone = "journal" } = req.body;
      
      if (!content || !walletAddress) {
        return res.status(400).json({ error: "content and walletAddress required" });
      }
      
      if (typeof content !== "string" || content.length < 10) {
        return res.status(400).json({ error: "Entry must be at least 10 characters" });
      }
      
      // 1. Save the entry
      const entry = await storage.createJournalEntry({ content, walletAddress });
      
      // 2. Retrieve context (3 recent entries + 3 pinned memories)
      const recentEntries = await storage.getRecentJournalEntries(walletAddress, 3);
      const pinnedMemories = await storage.getPinnedMemories(walletAddress, 3);
      
      // Filter out the current entry from recent entries
      const contextEntries = recentEntries.filter(e => e.id !== entry.id);
      
      // 3. Call Venice AI with zone-specific analysis
      let analysis;
      if (zone === "research") {
        analysis = await analyzeResearchEntry(content, contextEntries, pinnedMemories);
      } else {
        analysis = await analyzeJournalEntry(content, contextEntries, pinnedMemories);
      }
      
      // 4. Return entry + analysis + zone
      res.json({
        entry,
        analysis,
        zone,
      });
    } catch (error) {
      console.error("Error analyzing journal entry:", error);
      if (error instanceof Error && error.message.includes("VENICE_API_KEY")) {
        return res.status(503).json({ error: "AI service not configured" });
      }
      res.status(500).json({ error: "Failed to analyze journal entry" });
    }
  });

  // Get recent journal entries
  app.get("/api/journal/entries/:walletAddress", async (req, res) => {
    try {
      const entries = await storage.getRecentJournalEntries(req.params.walletAddress, 20);
      res.json(entries);
    } catch (error) {
      console.error("Error fetching journal entries:", error);
      res.status(500).json({ error: "Failed to fetch entries" });
    }
  });

  // ==================== MEMORY API ====================
  
  // Pin a memory
  app.post("/api/memories/pin", async (req, res) => {
    try {
      const validatedData = insertPinnedMemorySchema.parse(req.body);
      const memory = await storage.createPinnedMemory(validatedData);
      res.status(201).json(memory);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid memory data", details: error.errors });
      }
      console.error("Error pinning memory:", error);
      res.status(500).json({ error: "Failed to pin memory" });
    }
  });

  // Get pinned memories for a wallet
  app.get("/api/memories/:walletAddress", async (req, res) => {
    try {
      const memories = await storage.getPinnedMemories(req.params.walletAddress, 50);
      res.json(memories);
    } catch (error) {
      console.error("Error fetching memories:", error);
      res.status(500).json({ error: "Failed to fetch memories" });
    }
  });

  // Delete a pinned memory
  app.delete("/api/memories/:id", async (req, res) => {
    try {
      const deleted = await storage.deletePinnedMemory(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Memory not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting memory:", error);
      res.status(500).json({ error: "Failed to delete memory" });
    }
  });

  // ==================== AGENT API (v1 Thinking Partner) ====================
  
  // Analyze entry with the Thinking Partner agent
  app.post("/api/agent/analyze", async (req, res) => {
    try {
      const input = agentInputSchema.parse(req.body);
      const result = await analyzeWithAgent(input);
      res.json(result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid input", details: error.errors });
      }
      console.error("Error in agent analyze:", error);
      if (error instanceof Error && error.message.includes("VENICE_API_KEY")) {
        return res.status(503).json({ error: "AI service not configured" });
      }
      res.status(500).json({ error: "Failed to analyze entry" });
    }
  });

  // ==================== X402 API PROXY ====================
  // Proxy endpoints for x402 API with server-side payment handling
  
  const X402_API_BASE = "https://x402-api.heyelsa.ai";
  
  // Transparent proxy for x402 API - passes through ALL responses including 402s
  // This allows client-side x402 library to handle payments with user's wallet
  app.post("/api/x402-proxy/*", async (req, res) => {
    try {
      const targetPath = req.path.replace("/api/x402-proxy", "");
      const targetUrl = `${X402_API_BASE}${targetPath}`;
      
      // Forward all headers from client that might contain payment info
      const forwardHeaders: Record<string, string> = {
        "Content-Type": "application/json",
      };
      
      // Forward x402 payment headers from client
      const headersToForward = ["x-402-payment", "authorization"];
      for (const header of headersToForward) {
        const value = req.headers[header];
        if (value && typeof value === "string") {
          forwardHeaders[header] = value;
        }
      }
      
      const response = await fetch(targetUrl, {
        method: "POST",
        headers: forwardHeaders,
        body: JSON.stringify(req.body),
      });
      
      // Pass through ALL response headers (especially x402 payment requirement headers)
      const headersToPassBack = [
        "x-402-version",
        "x-402-payment-requirements", 
        "www-authenticate",
        "content-type",
        "payment-required"
      ];
      
      for (const header of headersToPassBack) {
        const value = response.headers.get(header);
        if (value) {
          res.setHeader(header, value);
        }
      }
      
      // Return the response with original status code (including 402)
      const data = await response.text();
      res.status(response.status).send(data);
    } catch (error) {
      console.error("x402 proxy error:", error);
      res.status(500).json({ error: error instanceof Error ? error.message : "Proxy error" });
    }
  });
  
  // Helper for server-side x402 API calls (for routes that don't need client payment)
  async function x402Fetch(endpoint: string, body: object) {
    const response = await fetch(`${X402_API_BASE}${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    
    if (response.status === 402) {
      throw new Error("Payment required. The x402 API requires micropayments.");
    }
    
    if (!response.ok) {
      const text = await response.text();
      throw new Error(`x402 API error: ${response.status} - ${text.slice(0, 200)}`);
    }
    
    return response.json();
  }

  // Get portfolio
  app.post("/api/x402/portfolio", async (req, res) => {
    try {
      const { wallet_address } = req.body;
      if (!wallet_address) {
        return res.status(400).json({ error: "wallet_address required" });
      }
      const data = await x402Fetch("/api/get_portfolio", { wallet_address });
      res.json(data);
    } catch (error) {
      console.error("x402 portfolio error:", error);
      res.status(500).json({ error: error instanceof Error ? error.message : "Failed to fetch portfolio" });
    }
  });

  // Get balances
  app.post("/api/x402/balances", async (req, res) => {
    try {
      const { wallet_address } = req.body;
      if (!wallet_address) {
        return res.status(400).json({ error: "wallet_address required" });
      }
      const data = await x402Fetch("/api/get_balances", { wallet_address });
      res.json(data);
    } catch (error) {
      console.error("x402 balances error:", error);
      res.status(500).json({ error: error instanceof Error ? error.message : "Failed to fetch balances" });
    }
  });

  // Get token price
  app.post("/api/x402/price", async (req, res) => {
    try {
      const { token_address, chain = "base" } = req.body;
      if (!token_address) {
        return res.status(400).json({ error: "token_address required" });
      }
      const data = await x402Fetch("/api/get_token_price", { token_address, chain });
      res.json(data);
    } catch (error) {
      console.error("x402 price error:", error);
      res.status(500).json({ error: error instanceof Error ? error.message : "Failed to fetch price" });
    }
  });

  // Get swap quote
  app.post("/api/x402/quote", async (req, res) => {
    try {
      const data = await x402Fetch("/api/get_swap_quote", req.body);
      res.json(data);
    } catch (error) {
      console.error("x402 quote error:", error);
      res.status(500).json({ error: error instanceof Error ? error.message : "Failed to get quote" });
    }
  });

  // Analyze wallet trading patterns
  app.post("/api/x402/analyze", async (req, res) => {
    try {
      const { wallet_address } = req.body;
      if (!wallet_address) {
        return res.status(400).json({ error: "wallet_address required" });
      }
      const data = await x402Fetch("/api/analyze_wallet", { wallet_address });
      res.json(data);
    } catch (error) {
      console.error("x402 analyze error:", error);
      res.status(500).json({ error: error instanceof Error ? error.message : "Failed to analyze wallet" });
    }
  });

  // Get PnL report
  app.post("/api/x402/pnl", async (req, res) => {
    try {
      const { wallet_address, timeframe = "30d" } = req.body;
      if (!wallet_address) {
        return res.status(400).json({ error: "wallet_address required" });
      }
      const data = await x402Fetch("/api/get_pnl_report", { wallet_address, timeframe });
      res.json(data);
    } catch (error) {
      console.error("x402 pnl error:", error);
      res.status(500).json({ error: error instanceof Error ? error.message : "Failed to get PnL report" });
    }
  });

  // Create limit order
  app.post("/api/x402/limit-order", async (req, res) => {
    try {
      const { wallet_address, from_token, to_token, amount, target_price, direction } = req.body;
      if (!wallet_address || !from_token || !to_token || !amount || !target_price) {
        return res.status(400).json({ error: "Missing required fields: wallet_address, from_token, to_token, amount, target_price" });
      }
      const data = await x402Fetch("/api/create_limit_order", {
        wallet_address,
        from_token,
        to_token,
        amount,
        target_price,
        direction: direction || "buy",
      });
      res.json(data);
    } catch (error) {
      console.error("x402 limit order error:", error);
      res.status(500).json({ error: error instanceof Error ? error.message : "Failed to create limit order" });
    }
  });

  // Get active limit orders
  app.post("/api/x402/limit-orders", async (req, res) => {
    try {
      const { wallet_address } = req.body;
      if (!wallet_address) {
        return res.status(400).json({ error: "wallet_address required" });
      }
      const data = await x402Fetch("/api/get_limit_orders", { wallet_address });
      res.json(data);
    } catch (error) {
      console.error("x402 limit orders error:", error);
      res.status(500).json({ error: error instanceof Error ? error.message : "Failed to get limit orders" });
    }
  });

  // Cancel limit order
  app.post("/api/x402/cancel-order", async (req, res) => {
    try {
      const { wallet_address, order_id } = req.body;
      if (!wallet_address || !order_id) {
        return res.status(400).json({ error: "wallet_address and order_id required" });
      }
      const data = await x402Fetch("/api/cancel_limit_order", { wallet_address, order_id });
      res.json(data);
    } catch (error) {
      console.error("x402 cancel order error:", error);
      res.status(500).json({ error: error instanceof Error ? error.message : "Failed to cancel order" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
