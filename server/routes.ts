import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertNewsletterIssueSchema, updateNewsletterIssueSchema } from "@shared/schema";
import { z } from "zod";
import { ipfsService, type NFTMetadata } from "./ipfs";

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check endpoint (using /api/health to avoid Vite catch-all)
  app.get("/api/health", (_req, res) => {
    res.json({ ok: true, timestamp: Date.now(), service: "DJZS Newsletter API" });
  });

  // Newsletter Issues API (with /api/newsletters alias)
  const getNewsletterIssuesHandler = async (req: any, res: any) => {
    try {
      const publishedOnly = req.query.published === 'true';
      const issues = publishedOnly 
        ? await storage.getPublishedNewsletterIssues()
        : await storage.getAllNewsletterIssues();
      res.json(issues);
    } catch (error) {
      console.error("Error fetching newsletter issues:", error);
      res.status(500).json({ error: "Failed to fetch newsletter issues" });
    }
  };

  const getNewsletterIssueHandler = async (req: any, res: any) => {
    try {
      const issue = await storage.getNewsletterIssue(req.params.id);
      if (!issue) {
        return res.status(404).json({ error: "Newsletter issue not found" });
      }
      res.json(issue);
    } catch (error) {
      console.error("Error fetching newsletter issue:", error);
      res.status(500).json({ error: "Failed to fetch newsletter issue" });
    }
  };

  const createNewsletterIssueHandler = async (req: any, res: any) => {
    try {
      const validatedData = insertNewsletterIssueSchema.parse(req.body);
      const issue = await storage.createNewsletterIssue(validatedData);
      res.status(201).json(issue);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid newsletter issue data", details: error.errors });
      }
      if (error instanceof Error && error.message === "DUPLICATE_ISSUE_NUMBER") {
        return res.status(409).json({ error: "Newsletter issue with this issue number already exists" });
      }
      console.error("Error creating newsletter issue:", error);
      res.status(500).json({ error: "Failed to create newsletter issue" });
    }
  };

  const updateNewsletterIssueHandler = async (req: any, res: any) => {
    try {
      const validatedData = updateNewsletterIssueSchema.parse(req.body);
      const updated = await storage.updateNewsletterIssue(req.params.id, validatedData);
      if (!updated) {
        return res.status(404).json({ error: "Newsletter issue not found" });
      }
      res.json(updated);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid update data", details: error.errors });
      }
      console.error("Error updating newsletter issue:", error);
      res.status(500).json({ error: "Failed to update newsletter issue" });
    }
  };

  const deleteNewsletterIssueHandler = async (req: any, res: any) => {
    try {
      const deleted = await storage.deleteNewsletterIssue(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Newsletter issue not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting newsletter issue:", error);
      res.status(500).json({ error: "Failed to delete newsletter issue" });
    }
  };

  // Register routes with both /api/newsletter-issues and /api/newsletters paths
  app.get("/api/newsletter-issues", getNewsletterIssuesHandler);
  app.get("/api/newsletters", getNewsletterIssuesHandler);
  
  app.get("/api/newsletter-issues/:id", getNewsletterIssueHandler);
  app.get("/api/newsletters/:id", getNewsletterIssueHandler);
  
  app.post("/api/newsletter-issues", createNewsletterIssueHandler);
  app.post("/api/newsletters", createNewsletterIssueHandler);
  
  app.patch("/api/newsletter-issues/:id", updateNewsletterIssueHandler);
  app.patch("/api/newsletters/:id", updateNewsletterIssueHandler);
  
  app.delete("/api/newsletter-issues/:id", deleteNewsletterIssueHandler);
  app.delete("/api/newsletters/:id", deleteNewsletterIssueHandler);

  // IPFS Metadata Upload API
  // NOTE: These endpoints should be protected with authentication in production
  // Authentication will be added in the admin dashboard implementation
  const uploadIssueMetadataSchema = z.object({
    image: z.string().url().optional(),
    external_url: z.string().url().optional(),
  });

  app.post("/api/ipfs/upload-issue-metadata/:issueId", async (req, res) => {
    try {
      const validatedBody = uploadIssueMetadataSchema.parse(req.body);
      const issue = await storage.getNewsletterIssue(req.params.issueId);
      
      if (!issue) {
        return res.status(404).json({ error: "Newsletter issue not found" });
      }

      let publishedDate: string;
      try {
        const date = issue.publishedAt instanceof Date 
          ? issue.publishedAt 
          : new Date(issue.publishedAt);
        
        if (!isNaN(date.getTime())) {
          publishedDate = date.toISOString().split('T')[0];
        } else {
          publishedDate = new Date().toISOString().split('T')[0]; // fallback to today
        }
      } catch {
        publishedDate = new Date().toISOString().split('T')[0]; // fallback to today
      }

      const metadata: NFTMetadata = {
        name: issue.title,
        description: issue.description,
        external_url: validatedBody.external_url || `https://djzs.newsletter/issues/${issue.issueNumber}`,
        attributes: [
          {
            trait_type: "Issue Number",
            value: issue.issueNumber,
          },
          {
            trait_type: "Published Date",
            value: publishedDate,
          },
          {
            trait_type: "Type",
            value: "Newsletter Issue",
          },
        ],
      };

      if (validatedBody.image) {
        metadata.image = validatedBody.image;
      }

      const ipfsHash = await ipfsService.pinJSONToIPFS(metadata);
      const ipfsUri = ipfsService.getIPFSUri(ipfsHash);
      const ipfsUrl = ipfsService.getIPFSUrl(ipfsHash);

      await storage.updateNewsletterIssue(req.params.issueId, {
        ipfsMetadataUri: ipfsUri,
      });

      res.json({
        ipfsHash,
        ipfsUri,
        ipfsUrl,
        metadata,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid request body", details: error.errors });
      }
      console.error("Error uploading to IPFS:", error);
      res.status(500).json({ 
        error: "Failed to upload to IPFS",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  const uploadSubscribeMetadataSchema = z.object({
    tokenId: z.coerce.number().int().nonnegative().refine((n) => Number.isFinite(n), "Invalid tokenId"),
    subscriberAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address").optional(),
    image: z.string().url().optional(),
  });

  app.post("/api/ipfs/upload-subscribe-metadata", async (req, res) => {
    try {
      const validatedBody = uploadSubscribeMetadataSchema.parse(req.body);

      const metadata: NFTMetadata = {
        name: `DJZS Subscriber #${validatedBody.tokenId}`,
        description: "Access pass to DJZS on-chain newsletter. Unlock premium content, alpha drops, and agent-powered trade analysis on Base.",
        external_url: "https://djzs.newsletter",
        attributes: [
          {
            trait_type: "Token ID",
            value: validatedBody.tokenId,
          },
          {
            trait_type: "Type",
            value: "Subscribe NFT",
          },
          {
            trait_type: "Platform",
            value: "DJZS Newsletter",
          },
        ],
      };

      if (validatedBody.subscriberAddress) {
        metadata.attributes?.push({
          trait_type: "Subscriber",
          value: validatedBody.subscriberAddress,
        });
      }

      if (validatedBody.image) {
        metadata.image = validatedBody.image;
      }

      const ipfsHash = await ipfsService.pinJSONToIPFS(metadata);
      const ipfsUri = ipfsService.getIPFSUri(ipfsHash);
      const ipfsUrl = ipfsService.getIPFSUrl(ipfsHash);

      res.json({
        ipfsHash,
        ipfsUri,
        ipfsUrl,
        metadata,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid request body", details: error.errors });
      }
      console.error("Error uploading to IPFS:", error);
      res.status(500).json({ 
        error: "Failed to upload to IPFS",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Nous Research AI Chat API
  const aiChatSchema = z.object({
    messages: z.array(z.object({
      role: z.enum(['system', 'user', 'assistant']),
      content: z.string(),
    })),
    model: z.string().default('Hermes-4-70B'),
    temperature: z.number().min(0).max(2).optional(),
    max_tokens: z.number().int().positive().optional(),
  });

  app.post("/api/ai/chat", async (req, res) => {
    try {
      const validatedBody = aiChatSchema.parse(req.body);
      const apiKey = process.env.NOUS_RESEARCH_API_KEY;

      if (!apiKey) {
        return res.status(500).json({ error: "AI service not configured" });
      }

      const response = await fetch('https://inference-api.nousresearch.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: validatedBody.model,
          messages: validatedBody.messages,
          temperature: validatedBody.temperature ?? 0.7,
          max_tokens: validatedBody.max_tokens ?? 2000,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error('Nous Research API error:', error);
        return res.status(response.status).json({ 
          error: 'AI service error',
          details: error 
        });
      }

      const data = await response.json();
      res.json(data);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid request body", details: error.errors });
      }
      console.error("Error calling AI service:", error);
      res.status(500).json({ 
        error: "Failed to get AI response",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
