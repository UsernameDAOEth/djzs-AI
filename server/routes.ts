import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertNewsletterIssueSchema, updateNewsletterIssueSchema } from "@shared/schema";
import { z } from "zod";
import { ipfsService, type NFTMetadata } from "./ipfs";

export async function registerRoutes(app: Express): Promise<Server> {
  // Newsletter Issues API
  app.get("/api/newsletter-issues", async (req, res) => {
    try {
      const issues = await storage.getPublishedNewsletterIssues();
      res.json(issues);
    } catch (error) {
      console.error("Error fetching newsletter issues:", error);
      res.status(500).json({ error: "Failed to fetch newsletter issues" });
    }
  });

  app.get("/api/newsletter-issues/:id", async (req, res) => {
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
  });

  app.post("/api/newsletter-issues", async (req, res) => {
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
  });

  app.patch("/api/newsletter-issues/:id", async (req, res) => {
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
  });

  app.delete("/api/newsletter-issues/:id", async (req, res) => {
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
  });

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

  const httpServer = createServer(app);

  return httpServer;
}
