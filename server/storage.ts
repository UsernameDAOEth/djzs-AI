import { type Member, type InsertMember, type Room, type InsertRoom, type PaymentReceipt, type InsertPaymentReceipt, type StoredMessage, type InsertStoredMessage, type JournalEntry, type InsertJournalEntry, type PinnedMemory, type InsertPinnedMemory } from "@shared/schema";
import { randomUUID } from "crypto";

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

  // Journal entries
  createJournalEntry(entry: InsertJournalEntry): Promise<JournalEntry>;
  getJournalEntry(id: string): Promise<JournalEntry | undefined>;
  getRecentJournalEntries(walletAddress: string, limit: number): Promise<JournalEntry[]>;
  
  // Pinned memories
  createPinnedMemory(memory: InsertPinnedMemory): Promise<PinnedMemory>;
  getPinnedMemories(walletAddress: string, limit: number): Promise<PinnedMemory[]>;
  deletePinnedMemory(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private members: Map<string, Member>;
  private rooms: Map<string, Room>;
  private paymentReceipts: Map<string, PaymentReceipt>;
  private messages: Map<string, StoredMessage>;
  private journalEntries: Map<string, JournalEntry>;
  private pinnedMemories: Map<string, PinnedMemory>;

  constructor() {
    this.members = new Map();
    this.rooms = new Map();
    this.paymentReceipts = new Map();
    this.messages = new Map();
    this.journalEntries = new Map();
    this.pinnedMemories = new Map();
    this.seedDefaultRooms();
  }

  private seedDefaultRooms() {
    const defaultRooms = [
      { name: "Journal", description: "Daily reflections with AI thinking partner", isDefault: true },
      { name: "Research", description: "Gather claims, track evidence, surface unknowns", isDefault: true },
    ];

    defaultRooms.forEach((room) => {
      const id = randomUUID();
      this.rooms.set(id, {
        id,
        name: room.name,
        description: room.description,
        xmtpGroupId: null,
        isDefault: room.isDefault,
        createdAt: new Date(),
      });
    });
  }

  async getMember(address: string): Promise<Member | undefined> {
    return Array.from(this.members.values()).find(
      (m) => m.address.toLowerCase() === address.toLowerCase()
    );
  }

  async getMemberById(id: string): Promise<Member | undefined> {
    return this.members.get(id);
  }

  async getAllMembers(): Promise<Member[]> {
    return Array.from(this.members.values());
  }

  async createMember(insertMember: InsertMember): Promise<Member> {
    const existing = await this.getMember(insertMember.address);
    if (existing) {
      throw new Error("MEMBER_EXISTS");
    }

    const id = randomUUID();
    const member: Member = {
      id,
      address: insertMember.address,
      ensName: insertMember.ensName ?? null,
      xHandle: insertMember.xHandle ?? null,
      xLinkSignature: insertMember.xLinkSignature ?? null,
      isAdmin: insertMember.isAdmin ?? false,
      isAllowlisted: insertMember.isAllowlisted ?? false,
      isMuted: insertMember.isMuted ?? false,
      hasNft: insertMember.hasNft ?? false,
      createdAt: new Date(),
    };
    this.members.set(id, member);
    return member;
  }

  async updateMember(address: string, updates: Partial<Member>): Promise<Member | undefined> {
    const existing = await this.getMember(address);
    if (!existing) return undefined;

    const { id: _, address: __, ...safeUpdates } = updates;
    const updated = { ...existing, ...safeUpdates };
    this.members.set(existing.id, updated);
    return updated;
  }

  async deleteMember(address: string): Promise<boolean> {
    const existing = await this.getMember(address);
    if (!existing) return false;
    return this.members.delete(existing.id);
  }

  async getAllRooms(): Promise<Room[]> {
    return Array.from(this.rooms.values());
  }

  async getRoom(id: string): Promise<Room | undefined> {
    return this.rooms.get(id);
  }

  async createRoom(insertRoom: InsertRoom): Promise<Room> {
    const id = randomUUID();
    const room: Room = {
      id,
      name: insertRoom.name,
      description: insertRoom.description ?? null,
      xmtpGroupId: insertRoom.xmtpGroupId ?? null,
      isDefault: insertRoom.isDefault ?? false,
      createdAt: new Date(),
    };
    this.rooms.set(id, room);
    return room;
  }

  async updateRoom(id: string, updates: Partial<Room>): Promise<Room | undefined> {
    const existing = this.rooms.get(id);
    if (!existing) return undefined;

    const { id: _, ...safeUpdates } = updates;
    const updated = { ...existing, ...safeUpdates };
    this.rooms.set(id, updated);
    return updated;
  }

  async deleteRoom(id: string): Promise<boolean> {
    return this.rooms.delete(id);
  }

  async createPaymentReceipt(insertReceipt: InsertPaymentReceipt): Promise<PaymentReceipt> {
    const id = randomUUID();
    const receipt: PaymentReceipt = {
      id,
      chainId: insertReceipt.chainId,
      tokenSymbol: insertReceipt.tokenSymbol,
      amount: insertReceipt.amount,
      fromAddress: insertReceipt.fromAddress,
      toAddress: insertReceipt.toAddress,
      txHash: insertReceipt.txHash,
      roomId: insertReceipt.roomId ?? null,
      note: insertReceipt.note ?? null,
      verified: false,
      createdAt: new Date(),
    };
    this.paymentReceipts.set(id, receipt);
    return receipt;
  }

  async getPaymentReceiptByTxHash(txHash: string): Promise<PaymentReceipt | undefined> {
    return Array.from(this.paymentReceipts.values()).find(
      (r) => r.txHash.toLowerCase() === txHash.toLowerCase()
    );
  }

  async getPaymentReceiptsByRoom(roomId: string): Promise<PaymentReceipt[]> {
    return Array.from(this.paymentReceipts.values()).filter(
      (r) => r.roomId === roomId
    );
  }

  async createMessage(insertMessage: InsertStoredMessage): Promise<StoredMessage> {
    const id = randomUUID();
    const message: StoredMessage = {
      id,
      roomId: insertMessage.roomId,
      message: insertMessage.message,
    };
    this.messages.set(id, message);
    return message;
  }

  async getMessagesByRoom(roomId: string): Promise<StoredMessage[]> {
    return Array.from(this.messages.values())
      .filter((m) => m.roomId === roomId)
      .sort((a, b) => new Date(a.message.createdAt).getTime() - new Date(b.message.createdAt).getTime());
  }

  async createJournalEntry(insertEntry: InsertJournalEntry): Promise<JournalEntry> {
    const id = randomUUID();
    const entry: JournalEntry = {
      id,
      walletAddress: insertEntry.walletAddress,
      content: insertEntry.content,
      createdAt: new Date(),
    };
    this.journalEntries.set(id, entry);
    return entry;
  }

  async getJournalEntry(id: string): Promise<JournalEntry | undefined> {
    return this.journalEntries.get(id);
  }

  async getRecentJournalEntries(walletAddress: string, limit: number): Promise<JournalEntry[]> {
    return Array.from(this.journalEntries.values())
      .filter((e) => e.walletAddress.toLowerCase() === walletAddress.toLowerCase())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  async createPinnedMemory(insertMemory: InsertPinnedMemory): Promise<PinnedMemory> {
    const id = randomUUID();
    const memory: PinnedMemory = {
      id,
      walletAddress: insertMemory.walletAddress,
      content: insertMemory.content,
      source: insertMemory.source ?? null,
      sourceEntryId: insertMemory.sourceEntryId ?? null,
      createdAt: new Date(),
    };
    this.pinnedMemories.set(id, memory);
    return memory;
  }

  async getPinnedMemories(walletAddress: string, limit: number): Promise<PinnedMemory[]> {
    return Array.from(this.pinnedMemories.values())
      .filter((m) => m.walletAddress.toLowerCase() === walletAddress.toLowerCase())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  async deletePinnedMemory(id: string): Promise<boolean> {
    return this.pinnedMemories.delete(id);
  }
}

export const storage = new MemStorage();
