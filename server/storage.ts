import {
  type Member, type InsertMember,
  type Room, type InsertRoom,
  type PaymentReceipt, type InsertPaymentReceipt,
  type StoredMessage, type InsertStoredMessage,
  type JournalEntry, type InsertJournalEntry,
  type AuditLog, type InsertAuditLog,
  members, rooms, paymentReceipts, storedMessages, journalEntries, auditLogs
} from "@shared/schema";
import { db, dbAvailable } from "./db";
import { desc, eq, sql } from "drizzle-orm";

function getDb() {
  if (!db) throw new Error("Database not available");
  return db;
}

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

  createAuditLog(log: InsertAuditLog): Promise<AuditLog>;
  getAuditLogs(limit: number): Promise<AuditLog[]>;
  getAuditLogByAuditId(auditId: string): Promise<AuditLog | undefined>;
}

export class DatabaseStorage implements IStorage {
  async getMember(address: string): Promise<Member | undefined> {
    const [member] = await getDb().select().from(members)
      .where(sql`lower(${members.address}) = lower(${address})`);
    return member;
  }

  async getMemberById(id: string): Promise<Member | undefined> {
    const [member] = await getDb().select().from(members).where(eq(members.id, id));
    return member;
  }

  async getAllMembers(): Promise<Member[]> {
    return getDb().select().from(members);
  }

  async createMember(insertMember: InsertMember): Promise<Member> {
    const existing = await this.getMember(insertMember.address);
    if (existing) {
      throw new Error("MEMBER_EXISTS");
    }
    const [member] = await getDb().insert(members).values(insertMember).returning();
    return member;
  }

  async updateMember(address: string, updates: Partial<Member>): Promise<Member | undefined> {
    const existing = await this.getMember(address);
    if (!existing) return undefined;

    const { id: _, address: __, ...safeUpdates } = updates;
    const [updated] = await getDb().update(members)
      .set(safeUpdates)
      .where(eq(members.id, existing.id))
      .returning();
    return updated;
  }

  async deleteMember(address: string): Promise<boolean> {
    const existing = await this.getMember(address);
    if (!existing) return false;
    await getDb().delete(members).where(eq(members.id, existing.id));
    return true;
  }

  async getAllRooms(): Promise<Room[]> {
    return getDb().select().from(rooms);
  }

  async getRoom(id: string): Promise<Room | undefined> {
    const [room] = await getDb().select().from(rooms).where(eq(rooms.id, id));
    return room;
  }

  async createRoom(insertRoom: InsertRoom): Promise<Room> {
    const [room] = await getDb().insert(rooms).values(insertRoom).returning();
    return room;
  }

  async updateRoom(id: string, updates: Partial<Room>): Promise<Room | undefined> {
    const existing = await this.getRoom(id);
    if (!existing) return undefined;

    const { id: _, ...safeUpdates } = updates;
    const [updated] = await getDb().update(rooms)
      .set(safeUpdates)
      .where(eq(rooms.id, id))
      .returning();
    return updated;
  }

  async deleteRoom(id: string): Promise<boolean> {
    const result = await getDb().delete(rooms).where(eq(rooms.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async createPaymentReceipt(insertReceipt: InsertPaymentReceipt): Promise<PaymentReceipt> {
    const [receipt] = await getDb().insert(paymentReceipts).values(insertReceipt).returning();
    return receipt;
  }

  async getPaymentReceiptByTxHash(txHash: string): Promise<PaymentReceipt | undefined> {
    const [receipt] = await getDb().select().from(paymentReceipts)
      .where(sql`lower(${paymentReceipts.txHash}) = lower(${txHash})`);
    return receipt;
  }

  async getPaymentReceiptsByRoom(roomId: string): Promise<PaymentReceipt[]> {
    return getDb().select().from(paymentReceipts).where(eq(paymentReceipts.roomId, roomId));
  }

  async createMessage(insertMessage: InsertStoredMessage): Promise<StoredMessage> {
    const [message] = await getDb().insert(storedMessages).values(insertMessage).returning();
    return message;
  }

  async getMessagesByRoom(roomId: string): Promise<StoredMessage[]> {
    return getDb().select().from(storedMessages)
      .where(eq(storedMessages.roomId, roomId))
      .orderBy(sql`(${storedMessages.message}->>'createdAt')::text ASC`);
  }

  async createJournalEntry(insertEntry: InsertJournalEntry): Promise<JournalEntry> {
    const [entry] = await getDb().insert(journalEntries).values(insertEntry).returning();
    return entry;
  }

  async getJournalEntry(id: string): Promise<JournalEntry | undefined> {
    const [entry] = await getDb().select().from(journalEntries).where(eq(journalEntries.id, id));
    return entry;
  }

  async getRecentJournalEntries(walletAddress: string, limit: number): Promise<JournalEntry[]> {
    return getDb().select().from(journalEntries)
      .where(sql`lower(${journalEntries.walletAddress}) = lower(${walletAddress})`)
      .orderBy(desc(journalEntries.createdAt))
      .limit(limit);
  }

  async createAuditLog(insertLog: InsertAuditLog): Promise<AuditLog> {
    const [log] = await getDb().insert(auditLogs).values(insertLog).returning();
    return log;
  }

  async getAuditLogs(limit: number): Promise<AuditLog[]> {
    return getDb().select().from(auditLogs).orderBy(desc(auditLogs.createdAt)).limit(limit);
  }

  async getAuditLogByAuditId(auditId: string): Promise<AuditLog | undefined> {
    const [log] = await getDb().select().from(auditLogs).where(eq(auditLogs.auditId, auditId));
    return log;
  }
}

export const storage = new DatabaseStorage();

export async function seedDefaultRooms() {
  if (!dbAvailable) {
    console.warn("[storage] Database not available - skipping room seeding");
    return;
  }
  const existingRooms = await getDb().select().from(rooms);
  if (existingRooms.length === 0) {
    await getDb().insert(rooms).values([
      { name: "Journal", description: "Daily reflections with AI thinking partner", isDefault: true },
    ]);
  }
}
