import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertNewsletterIssueSchema, updateNewsletterIssueSchema } from "@shared/schema";
import { z } from "zod";

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

  const httpServer = createServer(app);

  return httpServer;
}
