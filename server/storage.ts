import {
  type Member, type InsertMember,
  type Room, type InsertRoom,
  type PaymentReceipt, type InsertPaymentReceipt,
  type StoredMessage, type InsertStoredMessage,
  type JournalEntry, type InsertJournalEntry,
  type PinnedMemory, type InsertPinnedMemory,
  type AuditLog, type InsertAuditLog,
  members, rooms, paymentReceipts, storedMessages, journalEntries, pinnedMemories, auditLogs
} from "@shared/schema";
import { db } from "./db";
import { desc, eq, sql } from "drizzle-orm";

export interface IStorage {
  getMember(address: string): Promise<Member | undefined>;
  getMemberById(id: string): Promise<Member | undefined>;
  getAllMembers(): Promise<Member[]>;
  createMember(member: InsertMember): Promise<Member>;
  updateMember(address: string, updates: Partial<Member>): Promise<Member | undefined>;
  deleteMember(address: string): Promise<boolean>;

  getAllRooms(): Promise<Room[]>;
  getRoom(id: string): Promise<Room | undefined>;
  createRoom(room: InsertRoom): Promise<Room>;
  updateRoom(id: string, updates: Partial<Room>): Promise<Room | undefined>;
  deleteRoom(id: string): Promise<boolean>;

  createPaymentReceipt(receipt: InsertPaymentReceipt): Promise<PaymentReceipt>;
  getPaymentReceiptByTxHash(txHash: string): Promise<PaymentReceipt | undefined>;
  getPaymentReceiptsByRoom(roomId: string): Promise<PaymentReceipt[]>;

  createMessage(message: InsertStoredMessage): Promise<StoredMessage>;
  getMessagesByRoom(roomId: string): Promise<StoredMessage[]>;

  createJournalEntry(entry: InsertJournalEntry): Promise<JournalEntry>;
  getJournalEntry(id: string): Promise<JournalEntry | undefined>;
  getRecentJournalEntries(walletAddress: string, limit: number): Promise<JournalEntry[]>;

  createPinnedMemory(memory: InsertPinnedMemory): Promise<PinnedMemory>;
  getPinnedMemories(walletAddress: string, limit: number): Promise<PinnedMemory[]>;
  deletePinnedMemory(id: string): Promise<boolean>;

  createAuditLog(log: InsertAuditLog): Promise<AuditLog>;
  getAuditLogs(limit: number): Promise<AuditLog[]>;
  getAuditLogByAuditId(auditId: string): Promise<AuditLog | undefined>;
}

export class DatabaseStorage implements IStorage {
  async getMember(address: string): Promise<Member | undefined> {
    const [member] = await db.select().from(members)
      .where(sql`lower(${members.address}) = lower(${address})`);
    return member;
  }

  async getMemberById(id: string): Promise<Member | undefined> {
    const [member] = await db.select().from(members).where(eq(members.id, id));
    return member;
  }

  async getAllMembers(): Promise<Member[]> {
    return db.select().from(members);
  }

  async createMember(insertMember: InsertMember): Promise<Member> {
    const existing = await this.getMember(insertMember.address);
    if (existing) {
      throw new Error("MEMBER_EXISTS");
    }
    const [member] = await db.insert(members).values(insertMember).returning();
    return member;
  }

  async updateMember(address: string, updates: Partial<Member>): Promise<Member | undefined> {
    const existing = await this.getMember(address);
    if (!existing) return undefined;

    const { id: _, address: __, ...safeUpdates } = updates;
    const [updated] = await db.update(members)
      .set(safeUpdates)
      .where(eq(members.id, existing.id))
      .returning();
    return updated;
  }

  async deleteMember(address: string): Promise<boolean> {
    const existing = await this.getMember(address);
    if (!existing) return false;
    await db.delete(members).where(eq(members.id, existing.id));
    return true;
  }

  async getAllRooms(): Promise<Room[]> {
    return db.select().from(rooms);
  }

  async getRoom(id: string): Promise<Room | undefined> {
    const [room] = await db.select().from(rooms).where(eq(rooms.id, id));
    return room;
  }

  async createRoom(insertRoom: InsertRoom): Promise<Room> {
    const [room] = await db.insert(rooms).values(insertRoom).returning();
    return room;
  }

  async updateRoom(id: string, updates: Partial<Room>): Promise<Room | undefined> {
    const existing = await this.getRoom(id);
    if (!existing) return undefined;

    const { id: _, ...safeUpdates } = updates;
    const [updated] = await db.update(rooms)
      .set(safeUpdates)
      .where(eq(rooms.id, id))
      .returning();
    return updated;
  }

  async deleteRoom(id: string): Promise<boolean> {
    const result = await db.delete(rooms).where(eq(rooms.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async createPaymentReceipt(insertReceipt: InsertPaymentReceipt): Promise<PaymentReceipt> {
    const [receipt] = await db.insert(paymentReceipts).values(insertReceipt).returning();
    return receipt;
  }

  async getPaymentReceiptByTxHash(txHash: string): Promise<PaymentReceipt | undefined> {
    const [receipt] = await db.select().from(paymentReceipts)
      .where(sql`lower(${paymentReceipts.txHash}) = lower(${txHash})`);
    return receipt;
  }

  async getPaymentReceiptsByRoom(roomId: string): Promise<PaymentReceipt[]> {
    return db.select().from(paymentReceipts).where(eq(paymentReceipts.roomId, roomId));
  }

  async createMessage(insertMessage: InsertStoredMessage): Promise<StoredMessage> {
    const [message] = await db.insert(storedMessages).values(insertMessage).returning();
    return message;
  }

  async getMessagesByRoom(roomId: string): Promise<StoredMessage[]> {
    return db.select().from(storedMessages)
      .where(eq(storedMessages.roomId, roomId))
      .orderBy(sql`(${storedMessages.message}->>'createdAt')::text ASC`);
  }

  async createJournalEntry(insertEntry: InsertJournalEntry): Promise<JournalEntry> {
    const [entry] = await db.insert(journalEntries).values(insertEntry).returning();
    return entry;
  }

  async getJournalEntry(id: string): Promise<JournalEntry | undefined> {
    const [entry] = await db.select().from(journalEntries).where(eq(journalEntries.id, id));
    return entry;
  }

  async getRecentJournalEntries(walletAddress: string, limit: number): Promise<JournalEntry[]> {
    return db.select().from(journalEntries)
      .where(sql`lower(${journalEntries.walletAddress}) = lower(${walletAddress})`)
      .orderBy(desc(journalEntries.createdAt))
      .limit(limit);
  }

  async createPinnedMemory(insertMemory: InsertPinnedMemory): Promise<PinnedMemory> {
    const [memory] = await db.insert(pinnedMemories).values(insertMemory).returning();
    return memory;
  }

  async getPinnedMemories(walletAddress: string, limit: number): Promise<PinnedMemory[]> {
    return db.select().from(pinnedMemories)
      .where(sql`lower(${pinnedMemories.walletAddress}) = lower(${walletAddress})`)
      .orderBy(desc(pinnedMemories.createdAt))
      .limit(limit);
  }

  async deletePinnedMemory(id: string): Promise<boolean> {
    const result = await db.delete(pinnedMemories).where(eq(pinnedMemories.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async createAuditLog(insertLog: InsertAuditLog): Promise<AuditLog> {
    const [log] = await db.insert(auditLogs).values(insertLog).returning();
    return log;
  }

  async getAuditLogs(limit: number): Promise<AuditLog[]> {
    return db.select().from(auditLogs).orderBy(desc(auditLogs.createdAt)).limit(limit);
  }

  async getAuditLogByAuditId(auditId: string): Promise<AuditLog | undefined> {
    const [log] = await db.select().from(auditLogs).where(eq(auditLogs.auditId, auditId));
    return log;
  }
}

export const storage = new DatabaseStorage();

export async function seedDefaultRooms() {
  const existingRooms = await db.select().from(rooms);
  if (existingRooms.length === 0) {
    await db.insert(rooms).values([
      { name: "Journal", description: "Daily reflections with AI thinking partner", isDefault: true },
      { name: "Research", description: "Gather claims, track evidence, surface unknowns", isDefault: true },
    ]);
  }
}
