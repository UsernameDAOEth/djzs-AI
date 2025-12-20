import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertMemberSchema, insertRoomSchema, insertPaymentReceiptSchema, insertStoredMessageSchema } from "@shared/schema";
import { z } from "zod";

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

  const httpServer = createServer(app);
  return httpServer;
}
