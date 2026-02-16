import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertMemberSchema, insertRoomSchema, insertStoredMessageSchema, insertJournalEntrySchema, insertPinnedMemorySchema } from "@shared/schema";
import { z } from "zod";
import { analyzeJournalEntry, analyzeResearchEntry, synthesizeResearch, synthesizeWithBraveResults, type ResearchSynthesis } from "./venice";
import { analyzeWithAgent, agentInputSchema } from "./agent.api";
import { searchBrave, type BraveSearchResult } from "./brave";
import { runAgent, journalInsightPayloadSchema, researchSynthPayloadSchema, thinkingPartnerPayloadSchema, type AgentName } from "./openclaw";
import { getUncachableGitHubClient } from "./github";
import { createUploadUrl, getAssetStatus, getPlaybackInfo, deleteAsset } from "./livepeer";

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
  app.get("/api/health", (_req, res) => {
    res.json({ 
      ok: true, 
      timestamp: Date.now(), 
      service: "DJZS Box API",
      capabilities: {
        braveSearch: !!process.env.BRAVE_API_KEY,
        redpillAI: !!process.env.REDPILL_API_KEY,
        veniceAI: !!process.env.VENICE_API_KEY,
        livepeerVideo: !!process.env.LIVEPEER_API_KEY,
      }
    });
  });

  // GitHub Integration - check connection and list repos
  app.get("/api/github/status", async (_req, res) => {
    try {
      const octokit = await getUncachableGitHubClient();
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
      const octokit = await getUncachableGitHubClient();
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
      const { agent: agentName, payload } = req.body;

      if (!agentName || !payload) {
        return res.status(400).json({ error: "Missing 'agent' and 'payload' fields" });
      }

      const validAgents: AgentName[] = ["JournalInsight", "ResearchSynth", "ThinkingPartner"];
      if (!validAgents.includes(agentName)) {
        return res.status(400).json({ error: `Unknown agent: ${agentName}. Valid: ${validAgents.join(", ")}` });
      }

      let validatedPayload;
      if (agentName === "JournalInsight") {
        validatedPayload = journalInsightPayloadSchema.parse(payload);
      } else if (agentName === "ResearchSynth") {
        validatedPayload = researchSynthPayloadSchema.parse(payload);
      } else {
        validatedPayload = thinkingPartnerPayloadSchema.parse(payload);
      }

      const result = await runAgent(agentName, validatedPayload);
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

  // ==================== RESEARCH ZONE ====================
  // Research synthesis endpoint - provides AI-powered explanations
  // In "Explain" mode (no web search), uses Venice AI for knowledge synthesis
  // In "Web" mode, uses Venice AI with enable_web_search for real-time data
  const researchCache = new Map<string, { result: ResearchSynthesis; timestamp: number }>();
  const RESEARCH_CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours
  
  app.get("/api/research/search", async (req, res) => {
    try {
      const query = String(req.query.q ?? "").trim();
      const webMode = req.query.web !== "false"; // Default web mode on, but fallback to explain
      const useBrave = req.query.brave === "true"; // Use Brave Search for privacy-first web search
      
      if (!query || query.length < 3) {
        return res.status(400).json({ error: "Query must be at least 3 characters" });
      }
      
      // Check cache first
      const cacheKey = `${query}:${webMode}:${useBrave}`;
      const cached = researchCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < RESEARCH_CACHE_TTL) {
        return res.json({ ...cached.result, cached: true });
      }
      
      let synthesisResult;
      
      // If Brave mode is enabled and we have an API key, use Brave Search
      if (useBrave && webMode && process.env.BRAVE_API_KEY) {
        try {
          const braveResults = await searchBrave(query, { count: 8, extra_snippets: true });
          if (braveResults.length > 0) {
            synthesisResult = await synthesizeWithBraveResults(query, braveResults);
          } else {
            // Fallback to Venice web search if Brave returns no results
            synthesisResult = await synthesizeResearch(query, true);
          }
        } catch (braveError) {
          console.error("Brave Search error, falling back to Venice:", braveError);
          synthesisResult = await synthesizeResearch(query, webMode);
        }
      } else {
        // Use Venice AI for synthesis (with or without its built-in web search)
        synthesisResult = await synthesizeResearch(query, webMode);
      }
      
      // Cache the result
      researchCache.set(cacheKey, { result: synthesisResult, timestamp: Date.now() });
      
      // Clean old cache entries periodically
      if (researchCache.size > 500) {
        const now = Date.now();
        for (const [key, value] of researchCache.entries()) {
          if (now - value.timestamp > RESEARCH_CACHE_TTL) {
            researchCache.delete(key);
          }
        }
      }
      
      res.json(synthesisResult);
    } catch (error) {
      console.error("Research search error:", error);
      res.status(500).json({ error: error instanceof Error ? error.message : "Research failed" });
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

  const httpServer = createServer(app);
  return httpServer;
}
