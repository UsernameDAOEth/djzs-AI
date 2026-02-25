import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertMemberSchema, insertRoomSchema, insertStoredMessageSchema, insertJournalEntrySchema } from "@shared/schema";
import { z } from "zod";
import { analyzeJournalEntry } from "./venice";
import { analyzeWithAgent, agentInputSchema } from "./agent.api";
import { searchBrave, type BraveSearchResult } from "./brave";
import { runAgent, journalInsightPayloadSchema, thinkingPartnerPayloadSchema, type AgentName } from "./openclaw";
let _cachedGitHubImport: any = null;
async function getGitHubClient() {
  if (!process.env.REPLIT_CONNECTORS_HOSTNAME) return null;
  if (!_cachedGitHubImport) {
    _cachedGitHubImport = await import("./github");
  }
  return _cachedGitHubImport.getUncachableGitHubClient();
}
import { createUploadUrl, getAssetStatus, getPlaybackInfo, deleteAsset } from "./livepeer";
import { auditRequestSchema, createTieredRequestSchema, TIER_CONFIG, type AuditTier } from "@shared/audit-schema";
import { runLogicAuditAgent } from "./audit-agent";
import { intelligenceRequestSchema, generateServerIntelligenceBrief } from "./intelligence-engine";
import { verifyUsdcPayment } from "./payment-verifier";
import { uploadAuditToIrys } from "./irys";

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

export async function registerRoutes(app: Express): Promise<Server> {
  app.get("/sitemap.xml", (_req, res) => {
    res.setHeader("Content-Type", "application/xml");
    res.send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://djzs.ai/</loc>
    <lastmod>2026-02-22</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://djzs.ai/docs</loc>
    <lastmod>2026-02-22</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://djzs.ai/about</loc>
    <lastmod>2026-02-22</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>`);
  });

  app.get("/api/health", (_req, res) => {
    res.json({ 
      ok: true, 
      timestamp: Date.now(), 
      service: "DJZS - Decentralized Journaling Zone System",
      capabilities: {
        braveSearch: !!process.env.BRAVE_API_KEY,
        redpillAI: !!process.env.REDPILL_API_KEY,
        veniceAI: !!process.env.VENICE_API_KEY,
        livepeerVideo: !!process.env.LIVEPEER_API_KEY,
        x402Payments: true,
        a2aAuditApi: true,
      }
    });
  });

  // GitHub Integration - check connection and list repos (Replit-only)
  app.get("/api/github/status", async (_req, res) => {
    try {
      const octokit = await getGitHubClient();
      if (!octokit) {
        return res.json({ connected: false, error: "GitHub integration not available in this environment" });
      }
      const { data: user } = await octokit.users.getAuthenticated();
      res.json({
        connected: true,
        username: user.login,
        name: user.name,
        avatarUrl: user.avatar_url,
      });
    } catch (error) {
      console.error("GitHub status error:", error);
      res.status(500).json({ 
        connected: false, 
        error: error instanceof Error ? error.message : "GitHub connection failed" 
      });
    }
  });

  app.get("/api/github/repos", async (_req, res) => {
    try {
      const octokit = await getGitHubClient();
      if (!octokit) {
        return res.json([]);
      }
      const { data: repos } = await octokit.repos.listForAuthenticatedUser({
        sort: "updated",
        per_page: 20,
      });
      res.json(repos.map(r => ({
        id: r.id,
        name: r.name,
        fullName: r.full_name,
        private: r.private,
        url: r.html_url,
        description: r.description,
        updatedAt: r.updated_at,
      })));
    } catch (error) {
      console.error("GitHub repos error:", error);
      res.status(500).json({ error: error instanceof Error ? error.message : "Failed to fetch repos" });
    }
  });

  // ==================== OPENCLAW AGENT RUNNER ====================
  app.post("/api/openclaw/run", async (req, res) => {
    try {
      const userVeniceKey = req.headers['x-venice-api-key'] as string | undefined;
      const { agent: agentName, payload } = req.body;

      if (!agentName || !payload) {
        return res.status(400).json({ error: "Missing 'agent' and 'payload' fields" });
      }

      const validAgents: AgentName[] = ["JournalInsight", "ThinkingPartner"];
      if (!validAgents.includes(agentName)) {
        return res.status(400).json({ error: `Unknown agent: ${agentName}. Valid: ${validAgents.join(", ")}` });
      }

      let validatedPayload;
      if (agentName === "JournalInsight") {
        validatedPayload = journalInsightPayloadSchema.parse(payload);
      } else {
        validatedPayload = thinkingPartnerPayloadSchema.parse(payload);
      }

      const result = await runAgent(agentName, validatedPayload, userVeniceKey);
      res.json({ agent: agentName, result });
    } catch (error) {
      console.error("OpenClaw agent error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid payload", details: error.errors });
      }
      res.status(500).json({
        error: error instanceof Error ? error.message : "Agent processing failed",
      });
    }
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
      
      const msg = validatedData.message as Record<string, any> | null;
      const authorAddress = msg
        ? (msg.authorAddress ?? msg.voterAddress ?? null)
        : null;
      
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
      const userVeniceKey = req.headers['x-venice-api-key'] as string | undefined;
      const { content, walletAddress, zone = "journal" } = req.body;
      
      if (!content || !walletAddress) {
        return res.status(400).json({ error: "content and walletAddress required" });
      }
      
      if (typeof content !== "string" || content.length < 10) {
        return res.status(400).json({ error: "Entry must be at least 10 characters" });
      }
      
      // 1. Save the entry
      const entry = await storage.createJournalEntry({ content, walletAddress });
      
      // 2. Retrieve context (3 recent entries)
      const recentEntries = await storage.getRecentJournalEntries(walletAddress, 3);
      
      // Filter out the current entry from recent entries
      const contextEntries = recentEntries.filter(e => e.id !== entry.id);
      
      // 3. Call Venice AI with journal analysis
      const analysis = await analyzeJournalEntry(content, contextEntries, userVeniceKey);
      
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

  // ==================== AGENT API (v1 Thinking Partner) ====================
  
  // Analyze entry with the Thinking Partner agent
  app.post("/api/agent/analyze", async (req, res) => {
    try {
      const userVeniceKey = req.headers['x-venice-api-key'] as string | undefined;
      const input = agentInputSchema.parse(req.body);
      const result = await analyzeWithAgent(input, userVeniceKey);
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

  // ==================== LIVEPEER VIDEO API ====================

  app.post("/api/video/upload", async (req, res) => {
    try {
      const { name } = req.body;
      if (!name || typeof name !== "string") {
        return res.status(400).json({ error: "Video name is required" });
      }
      const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("Livepeer API timeout")), 15000));
      const result = await Promise.race([createUploadUrl(name), timeoutPromise]);
      res.json(result);
    } catch (error) {
      console.error("Error creating video upload URL:", error);
      if (error instanceof Error && error.message.includes("LIVEPEER_API_KEY")) {
        return res.status(503).json({ error: "Video service not configured" });
      }
      if (error instanceof Error && error.message.includes("timeout")) {
        return res.status(504).json({ error: "Video service timed out. Please try again." });
      }
      res.status(500).json({ error: "Failed to create upload URL" });
    }
  });

  app.get("/api/video/asset/:assetId", async (req, res) => {
    try {
      const result = await getAssetStatus(req.params.assetId);
      res.json(result);
    } catch (error) {
      console.error("Error fetching asset status:", error);
      res.status(500).json({ error: "Failed to fetch asset status" });
    }
  });

  app.get("/api/video/playback/:playbackId", async (req, res) => {
    try {
      const result = await getPlaybackInfo(req.params.playbackId);
      res.json(result);
    } catch (error) {
      console.error("Error fetching playback info:", error);
      res.status(500).json({ error: "Failed to fetch playback info" });
    }
  });

  app.delete("/api/video/asset/:assetId", async (req, res) => {
    try {
      await deleteAsset(req.params.assetId);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting video asset:", error);
      res.status(500).json({ error: "Failed to delete video" });
    }
  });

  const COINGECKO_IDS: Record<string, string> = {
    btc: "bitcoin", bitcoin: "bitcoin",
    eth: "ethereum", ethereum: "ethereum",
    sol: "solana", solana: "solana",
    bnb: "binancecoin",
    xrp: "ripple",
    ada: "cardano",
    doge: "dogecoin",
    dot: "polkadot",
    avax: "avalanche-2",
    matic: "matic-network", polygon: "matic-network",
    link: "chainlink",
    uni: "uniswap",
    atom: "cosmos",
    arb: "arbitrum",
    op: "optimism",
    sui: "sui",
    apt: "aptos",
    near: "near",
    ftm: "fantom",
    sei: "sei-network",
    inj: "injective-protocol",
    tia: "celestia",
    jup: "jupiter-exchange-solana",
    render: "render-token",
    pepe: "pepe",
    wif: "dogwifcoin",
    bonk: "bonk",
  };

  app.get("/api/market/price/:asset", async (req, res) => {
    try {
      const raw = req.params.asset.toLowerCase().trim();
      const coinId = COINGECKO_IDS[raw] || raw;
      const response = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${encodeURIComponent(coinId)}&vs_currencies=usd&include_24hr_change=true`
      );
      if (!response.ok) {
        return res.status(502).json({ error: "Failed to fetch price from CoinGecko" });
      }
      const data = await response.json();
      const entry = data[coinId];
      if (!entry) {
        return res.status(404).json({ error: `Asset "${raw}" not found on CoinGecko` });
      }
      res.json({
        asset: raw,
        coinId,
        priceUsd: entry.usd,
        change24h: entry.usd_24h_change ?? null,
      });
    } catch (error) {
      console.error("Market price fetch error:", error);
      res.status(500).json({ error: "Failed to fetch market price" });
    }
  });

  app.get("/api/market/sentiment", async (_req, res) => {
    try {
      const response = await fetch("https://api.alternative.me/fng/?limit=1");
      if (!response.ok) {
        return res.status(502).json({ error: "Failed to fetch Fear & Greed Index" });
      }
      const data = await response.json();
      const entry = data?.data?.[0];
      if (!entry) {
        return res.status(502).json({ error: "No sentiment data available" });
      }
      const score = parseInt(entry.value, 10);
      let label: "FEAR" | "NEUTRAL" | "GREED";
      if (score <= 35) label = "FEAR";
      else if (score <= 65) label = "NEUTRAL";
      else label = "GREED";
      res.json({
        score,
        label,
        classification: entry.value_classification,
        timestamp: entry.timestamp,
      });
    } catch (error) {
      console.error("Sentiment fetch error:", error);
      res.status(500).json({ error: "Failed to fetch market sentiment" });
    }
  });

  app.post("/api/market/batch-price", async (req, res) => {
    try {
      const { assets } = req.body;
      if (!Array.isArray(assets) || assets.length === 0) {
        return res.status(400).json({ error: "assets array required" });
      }
      const coinIds = assets.map((a: string) => {
        const lower = a.toLowerCase().trim();
        return COINGECKO_IDS[lower] || lower;
      });
      const response = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${coinIds.join(",")}&vs_currencies=usd&include_24hr_change=true`
      );
      if (!response.ok) {
        return res.status(502).json({ error: "Failed to fetch prices from CoinGecko" });
      }
      const data = await response.json();
      const results: Record<string, { priceUsd: number; change24h: number | null }> = {};
      assets.forEach((a: string, i: number) => {
        const entry = data[coinIds[i]];
        if (entry) {
          results[a.toUpperCase()] = { priceUsd: entry.usd, change24h: entry.usd_24h_change ?? null };
        }
      });
      res.json(results);
    } catch (error) {
      console.error("Batch price fetch error:", error);
      res.status(500).json({ error: "Failed to fetch batch prices" });
    }
  });

  // ==================== AGENT-TO-AGENT (A2A) AUDIT API ====================
  // x402 payment middleware for the audit endpoint
  // Uses @coinbase/x402 (official CDP facilitator) for USDC micropayments on Base Mainnet
  const TREASURY_WALLET = process.env.TREASURY_WALLET_ADDRESS;
  if (!TREASURY_WALLET) {
    console.warn("TREASURY_WALLET_ADDRESS not set — payment verification will reject all transactions");
  }

  const X402_NETWORK = (process.env.X402_NETWORK || "eip155:8453") as `${string}:${string}`;
  let x402Initialized = false;

  const hasCdpKeys = !!(process.env.CDP_API_KEY_ID && process.env.CDP_API_KEY_SECRET);

  if (hasCdpKeys && TREASURY_WALLET) {
    try {
      const { paymentMiddleware, x402ResourceServer } = await import("@x402/express");
      const { ExactEvmScheme } = await import("@x402/evm/exact/server");
      const { HTTPFacilitatorClient } = await import("@x402/core/server");
      const { facilitator } = await import("@coinbase/x402");

      const facilitatorClient = new HTTPFacilitatorClient(facilitator);

      const resourceServer = new x402ResourceServer(facilitatorClient)
        .register(X402_NETWORK, new ExactEvmScheme());

      app.use(
        paymentMiddleware(
          {
            "POST /api/audit/micro": {
              accepts: {
                scheme: "exact",
                price: "$2.50",
                network: X402_NETWORK,
                payTo: TREASURY_WALLET,
              },
              description: "DJZS Micro-Zone: High-frequency operational ledger and sanity check",
            },
            "POST /api/audit/founder": {
              accepts: {
                scheme: "exact",
                price: "$5.00",
                network: X402_NETWORK,
                payTo: TREASURY_WALLET,
              },
              description: "DJZS Founder Zone: Strategic roadmap diligence and narrative drift detection",
            },
            "POST /api/audit/treasury": {
              accepts: {
                scheme: "exact",
                price: "$50.00",
                network: X402_NETWORK,
                payTo: TREASURY_WALLET,
              },
              description: "DJZS Treasury Zone: Exhaustive adversarial stress-test for capital deployment",
            },
            "POST /api/audit": {
              accepts: {
                scheme: "exact",
                price: "$2.50",
                network: X402_NETWORK,
                payTo: TREASURY_WALLET,
              },
              description: "DJZS Logic Audit (backward-compatible alias for Micro-Zone)",
            },
          },
          resourceServer,
        ),
      );

      x402Initialized = true;
      console.log(`x402 payment middleware initialized for 3 Zone tiers on Base Mainnet via Coinbase CDP`);
      console.log(`  Micro-Zone:    POST /api/audit/micro    ($2.50 USDC)`);
      console.log(`  Founder Zone:  POST /api/audit/founder  ($5.00 USDC)`);
      console.log(`  Treasury Zone: POST /api/audit/treasury ($50.00 USDC)`);
    } catch (error) {
      console.warn("x402 middleware not initialized (non-blocking):", error instanceof Error ? error.message : error);
      console.warn("Audit endpoint will operate without payment gate");
    }
  } else {
    if (process.env.NODE_ENV === "production") {
      console.error("CRITICAL: CDP_API_KEY_ID and CDP_API_KEY_SECRET required in production — audit endpoint is unprotected!");
    }
    console.warn("CDP_API_KEY_ID and CDP_API_KEY_SECRET not set — x402 payment gate disabled");
    console.warn("Get your keys at https://portal.cdp.coinbase.com/projects");
  }

  const x402PaymentGate = (req: any, res: any, next: any) => {
    if (x402Initialized) return next();

    const paymentProof = req.headers['x-payment-proof'];

    if (!paymentProof) {
      return res.status(402).json({
        error: "Payment Required. Provide Base Mainnet TX hash in 'x-payment-proof' header.",
        code: "DJZS-AUTH-402",
      });
    }

    req.paymentProof = paymentProof;
    next();
  };

  const createVerifiedPaymentGate = (tier: AuditTier) => async (req: any, res: any, next: any) => {
    if (x402Initialized) return next();

    if (!TREASURY_WALLET) {
      return res.status(503).json({
        error: "Payment verification not configured. TREASURY_WALLET_ADDRESS required.",
        code: "DJZS-AUTH-CONFIG",
      });
    }

    const txHash = req.headers['x-payment-proof'] as string | undefined;

    if (!txHash) {
      return res.status(402).json({
        error: "Payment Required. Provide Base Mainnet TX hash in 'x-payment-proof' header.",
        code: "DJZS-AUTH-402",
        tier: TIER_CONFIG[tier].name,
        price: TIER_CONFIG[tier].price,
      });
    }

    const existing = await storage.getPaymentReceiptByTxHash(txHash);
    if (existing) {
      return res.status(409).json({
        error: "Transaction hash already used for a previous audit.",
        code: "DJZS-AUTH-REPLAY",
      });
    }

    try {
      const result = await verifyUsdcPayment(txHash, tier, TREASURY_WALLET);

      if (!result.verified) {
        return res.status(402).json({
          error: result.error,
          code: "DJZS-AUTH-INVALID",
          tier: TIER_CONFIG[tier].name,
          expected_price: TIER_CONFIG[tier].price,
        });
      }

      await storage.createPaymentReceipt({
        chainId: 8453,
        tokenSymbol: "USDC",
        amount: result.amount || TIER_CONFIG[tier].price,
        fromAddress: result.from || "unknown",
        toAddress: result.to || TREASURY_WALLET,
        txHash,
        roomId: null,
        note: `${TIER_CONFIG[tier].name} audit payment`,
      });

      req.paymentProof = txHash;
      req.paymentVerified = true;
      next();
    } catch (error) {
      console.error("Payment verification error:", error);
      return res.status(500).json({
        error: "Payment verification failed. Please try again.",
        code: "DJZS-AUTH-ERROR",
      });
    }
  };

  const createTierHandler = (tier: AuditTier) => async (req: any, res: any) => {
    try {
      const userVeniceKey = req.headers['x-venice-api-key'] as string | undefined;
      const walletAddress = req.headers['x-wallet-address'] as string | undefined;
      const schema = createTieredRequestSchema(tier);
      const parsed = schema.safeParse(req.body);

      if (!parsed.success) {
        const config = TIER_CONFIG[tier];
        return res.status(400).json({
          error: "Invalid audit request",
          zone: config.name,
          details: parsed.error.errors,
          expected: {
            strategy_memo: `string (min 20 chars${config.maxMemoLength !== Infinity ? `, max ${config.maxMemoLength} chars` : ""})`,
            audit_type: "treasury | founder_drift | strategy | general (default: general)",
          },
        });
      }

      const audit = await runLogicAuditAgent(parsed.data, tier, userVeniceKey);

      const irysResult = await uploadAuditToIrys(audit);

      try {
        await storage.createAuditLog({
          auditId: audit.audit_id,
          tier: audit.tier,
          verdict: audit.verdict,
          riskScore: audit.risk_score,
          strategyMemo: parsed.data.strategy_memo,
          auditType: parsed.data.audit_type || "general",
          primaryBiasDetected: audit.primary_bias_detected,
          flags: audit.flags,
          logicFlaws: audit.logic_flaws,
          structuralRecommendations: audit.structural_recommendations,
          cryptographicHash: audit.cryptographic_hash,
          walletAddress: walletAddress || null,
          irysTxId: irysResult.irys_tx_id,
        });
      } catch (dbError) {
        console.error("Failed to persist audit log:", dbError);
      }

      const response: Record<string, any> = {
        ...audit,
        provenance_provider: "IRYS_DATACHAIN",
        irys_tx_id: irysResult.irys_tx_id,
        irys_url: irysResult.irys_url,
      };
      if (irysResult.irys_error) {
        response.irys_error = irysResult.irys_error;
      }

      res.json(response);
    } catch (error) {
      console.error(`${TIER_CONFIG[tier].name} Audit failed:`, error);
      if (error instanceof Error && error.message.includes("VENICE_API_KEY")) {
        return res.status(503).json({ error: "AI service not configured" });
      }
      res.status(500).json({
        error: "Audit execution failed",
        zone: TIER_CONFIG[tier].name,
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  app.post("/api/audit/micro", createVerifiedPaymentGate("micro"), createTierHandler("micro"));
  app.post("/api/audit/founder", createVerifiedPaymentGate("founder"), createTierHandler("founder"));
  app.post("/api/audit/treasury", createVerifiedPaymentGate("treasury"), createTierHandler("treasury"));
  app.post("/api/audit", createVerifiedPaymentGate("micro"), createTierHandler("micro"));


  app.get("/api/audit/verify/:txId", async (req, res) => {
    try {
      const { txId } = req.params;
      if (!txId || txId.length < 10) {
        return res.status(400).json({ error: "Invalid Irys transaction ID" });
      }

      const irysResponse = await fetch(`https://gateway.irys.xyz/${txId}`);
      if (!irysResponse.ok) {
        return res.status(404).json({
          error: "Certificate not found on Irys Datachain",
          irys_tx_id: txId,
          irys_url: `https://gateway.irys.xyz/${txId}`,
        });
      }

      const certificate = await irysResponse.json();
      res.json({
        verified: true,
        provenance_provider: "IRYS_DATACHAIN",
        irys_tx_id: txId,
        irys_url: `https://gateway.irys.xyz/${txId}`,
        certificate,
      });
    } catch (error) {
      console.error("Irys verification failed:", error);
      res.status(500).json({ error: "Verification failed" });
    }
  });

  app.get("/api/audit/logs", async (req, res) => {
    try {
      const limit = Math.min(parseInt(req.query.limit as string) || 50, 200);
      const logs = await storage.getAuditLogs(limit);
      res.json(logs);
    } catch (error) {
      console.error("Failed to fetch audit logs:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  app.post("/api/intelligence/brief", (req, res) => {
    try {
      const parsed = intelligenceRequestSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          error: "Invalid intelligence request",
          details: parsed.error.flatten().fieldErrors,
        });
      }
      const brief = generateServerIntelligenceBrief(parsed.data);
      res.json(brief);
    } catch (err) {
      console.error("Intelligence brief generation error:", err);
      res.status(500).json({ error: "Intelligence analysis failed" });
    }
  });

  app.get("/api/audit/schema", (_req, res) => {
    res.json({
      service: "DJZS - Decentralized Journaling Zone System",
      version: "2.0",
      discovery: "/.well-known/agent.json",
      payment: {
        protocol: "x402",
        facilitator: "Coinbase CDP (@coinbase/x402)",
        network: X402_NETWORK,
        chain: "Base Mainnet",
        payTo: TREASURY_WALLET,
        x402_enabled: x402Initialized,
      },
      zones: {
        micro: {
          endpoint: "POST /api/audit/micro",
          price: "$2.50 USDC",
          description: TIER_CONFIG.micro.description,
          memo_limit: "1000 chars",
        },
        founder: {
          endpoint: "POST /api/audit/founder",
          price: "$5.00 USDC",
          description: TIER_CONFIG.founder.description,
          memo_limit: "5000 chars",
        },
        treasury: {
          endpoint: "POST /api/audit/treasury",
          price: "$50.00 USDC",
          description: TIER_CONFIG.treasury.description,
          memo_limit: "unlimited",
        },
      },
      verification: {
        endpoint: "GET /api/audit/verify/:txId",
        price: "Free",
        description: "Verify a ProofOfLogic certificate stored on the Irys Datachain. Pass the irys_tx_id from any audit response to retrieve and verify the permanent certificate.",
      },
      intelligence: {
        endpoint: "POST /api/intelligence/brief",
        price: "Free",
        description: "Pre-flight intelligence analysis. Submit historical data to get a structured brief with 5 signals (bias patterns, narrative drift, assumptions, volatility stress tests, emotional spikes). Returns intelligence_context string for injection into audit requests.",
      },
      backward_compatible: {
        endpoint: "POST /api/audit",
        price: "$2.50 USDC",
        note: "Alias for Micro-Zone. Use tiered endpoints for full control.",
      },
      request: {
        strategy_memo: "string (required, min 20 chars) - The strategy, proposal, or thesis to audit",
        audit_type: "string (optional) - treasury | founder_drift | strategy | general",
      },
      response: {
        audit_id: "UUID - unique identifier for this audit",
        timestamp: "ISO 8601 datetime",
        tier: "micro | founder | treasury",
        risk_score: "number 0-100 (0 = flawless logic, 100 = critically compromised)",
        primary_bias_detected: "FOMO | Sunk_Cost | Narrative_Reaction | Authority_Bias | Confirmation_Bias | Recency_Bias | None",
        logic_flaws: "[{flaw_type, severity (low|medium|critical), explanation}]",
        structural_recommendations: "string[] - concrete steps to fix the logic",
        cryptographic_hash: "SHA-256 hash of the input memo (for ERC-8004 verification)",
        provenance_provider: "IRYS_DATACHAIN - permanent storage provider",
        irys_tx_id: "string | null - Irys Datachain transaction ID for permanent certificate",
        irys_url: "string | null - Direct gateway link to the permanent ProofOfLogic certificate",
      },
    });
  });

  const httpServer = createServer(app);
  return httpServer;
}
