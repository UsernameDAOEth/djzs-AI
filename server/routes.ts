import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertMemberSchema, insertRoomSchema, insertPaymentReceiptSchema, insertStoredMessageSchema } from "@shared/schema";
import { z } from "zod";
import { verifyMessage } from "viem";
import { ParagraphAPI } from "@paragraph-com/sdk";

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

  // Initialize Paragraph API (with optional API key for draft/private posts)
  const paragraphApi = process.env.PARAGRAPH_API_KEY 
    ? new ParagraphAPI({ apiKey: process.env.PARAGRAPH_API_KEY })
    : new ParagraphAPI();

  // Get publication info by slug
  app.get("/api/paragraph/publications/:slug", async (req, res) => {
    try {
      const publication = await paragraphApi.publications.get({ slug: `@${req.params.slug.replace('@', '')}` }).single();
      res.json(publication);
    } catch (error) {
      console.error("Error fetching publication:", error);
      res.status(500).json({ error: "Failed to fetch publication" });
    }
  });

  // Get posts from a publication
  app.get("/api/paragraph/publications/:slug/posts", async (req, res) => {
    try {
      const slug = `@${req.params.slug.replace('@', '')}`;
      let publication;
      try {
        publication = await paragraphApi.publications.get({ slug }).single();
      } catch {
        return res.status(404).json({ error: "Publication not found" });
      }
      
      const cursor = req.query.cursor as string | undefined;
      const options = { cursor, includeContent: true };
      const result = await paragraphApi.posts.get({ publicationId: publication.id }, options);
      
      res.json({ posts: result.items, pagination: result.pagination, publication });
    } catch (error) {
      console.error("Error fetching posts:", error);
      res.status(500).json({ error: "Failed to fetch posts" });
    }
  });

  // Get a single post by publication slug and post slug
  app.get("/api/paragraph/publications/:pubSlug/posts/:postSlug", async (req, res) => {
    try {
      const pubSlug = `@${req.params.pubSlug.replace('@', '')}`;
      const postSlug = req.params.postSlug;
      
      const post = await paragraphApi.posts.get({ 
        publicationSlug: pubSlug, 
        postSlug 
      }).single();
      
      res.json(post);
    } catch (error) {
      console.error("Error fetching post:", error);
      res.status(500).json({ error: "Failed to fetch post" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
