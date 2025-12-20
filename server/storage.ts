import { type Member, type InsertMember, type Room, type InsertRoom, type PaymentReceipt, type InsertPaymentReceipt } from "@shared/schema";
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
}

export class MemStorage implements IStorage {
  private members: Map<string, Member>;
  private rooms: Map<string, Room>;
  private paymentReceipts: Map<string, PaymentReceipt>;

  constructor() {
    this.members = new Map();
    this.rooms = new Map();
    this.paymentReceipts = new Map();
    this.seedDefaultRooms();
  }

  private seedDefaultRooms() {
    const defaultRooms = [
      { name: "Members Lounge", description: "General discussion", isDefault: true },
      { name: "Trades", description: "Trade signals and setups", isDefault: true },
      { name: "Predictions", description: "Market predictions", isDefault: true },
      { name: "Events", description: "Community events", isDefault: true },
      { name: "Payments", description: "Payment receipts", isDefault: true },
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
}

export const storage = new MemStorage();
