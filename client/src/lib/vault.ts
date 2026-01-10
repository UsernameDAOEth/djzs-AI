import Dexie, { type EntityTable } from 'dexie';

export type EntryType = 'journal' | 'research' | 'trade';
export type MemoryKind = 'goal' | 'pattern' | 'preference' | 'project' | 'principle' | 'question' | 'person';

export interface VaultEntry {
  id?: number;
  type: EntryType;
  text: string;
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
}

export interface VaultInsight {
  id?: number;
  entryId: number;
  type: EntryType;
  said: string;
  matters: string;
  nextMove: string;
  question: string;
  createdAt: Date;
}

export interface MemoryPin {
  id?: number;
  kind: MemoryKind;
  content: string;
  sourceEntryId?: number;
  createdAt: Date;
  lastUsedAt?: Date;
  isActive: 0 | 1;
}

export interface TradeRecord {
  id?: number;
  action: 'swap' | 'limit_order' | 'portfolio' | 'balance' | 'analyze' | 'pnl' | 'limit' | 'orders';
  inputCommand: string;
  thesis?: string;
  fromToken?: string;
  toToken?: string;
  amount?: string;
  quoteData?: string;
  txHash?: string;
  status: 'pending' | 'confirmed' | 'failed' | 'cancelled';
  reflection?: string;
  createdAt: Date;
  completedAt?: Date;
}

class VaultDatabase extends Dexie {
  entries!: EntityTable<VaultEntry, 'id'>;
  insights!: EntityTable<VaultInsight, 'id'>;
  memoryPins!: EntityTable<MemoryPin, 'id'>;
  tradeRecords!: EntityTable<TradeRecord, 'id'>;

  constructor() {
    super('djzs-vault');
    
    this.version(1).stores({
      entries: '++id, type, createdAt, updatedAt',
      insights: '++id, entryId, type, createdAt',
      memoryPins: '++id, kind, content, isActive, createdAt',
    });
    
    this.version(2).stores({
      entries: '++id, type, createdAt, updatedAt',
      insights: '++id, entryId, type, createdAt',
      memoryPins: '++id, kind, content, isActive, createdAt',
      tradeRecords: '++id, action, status, createdAt',
    });
  }
}

export const vault = new VaultDatabase();

export async function saveEntry(type: EntryType, text: string, tags: string[] = []): Promise<number> {
  const now = new Date();
  const id = await vault.entries.add({
    type,
    text,
    createdAt: now,
    updatedAt: now,
    tags,
  });
  return id as number;
}

export async function saveInsight(
  entryId: number,
  type: EntryType,
  insight: { said: string; matters: string; nextMove: string; question: string }
): Promise<number> {
  const id = await vault.insights.add({
    entryId,
    type,
    said: insight.said,
    matters: insight.matters,
    nextMove: insight.nextMove,
    question: insight.question,
    createdAt: new Date(),
  });
  return id as number;
}

export async function getRecentEntries(type: EntryType, limit: number = 5): Promise<VaultEntry[]> {
  return vault.entries
    .where('type')
    .equals(type)
    .reverse()
    .sortBy('createdAt')
    .then(entries => entries.slice(0, limit));
}

export async function getInsightForEntry(entryId: number): Promise<VaultInsight | undefined> {
  return vault.insights.where('entryId').equals(entryId).first();
}

export async function pinMemory(
  kind: MemoryKind,
  content: string,
  sourceEntryId?: number
): Promise<number> {
  const existing = await vault.memoryPins
    .where('content')
    .equals(content)
    .and(m => m.isActive === 1)
    .first();
    
  if (existing && existing.id !== undefined) {
    await vault.memoryPins.update(existing.id, { lastUsedAt: new Date() });
    return existing.id;
  }
  
  const id = await vault.memoryPins.add({
    kind,
    content,
    sourceEntryId,
    createdAt: new Date(),
    isActive: 1,
  });
  return id as number;
}

export async function forgetMemory(id: number): Promise<void> {
  await vault.memoryPins.update(id, { isActive: 0 });
}

export async function deleteMemory(id: number): Promise<void> {
  await vault.memoryPins.delete(id);
}

export async function getActiveMemories(limit: number = 10): Promise<MemoryPin[]> {
  return vault.memoryPins
    .where('isActive')
    .equals(1)
    .reverse()
    .sortBy('createdAt')
    .then(memories => memories.slice(0, limit));
}

export async function getMemoriesForAgent(): Promise<Array<{ kind: MemoryKind; content: string }>> {
  const memories = await getActiveMemories(3);
  return memories.map(m => ({ kind: m.kind, content: m.content }));
}

export async function exportVault(): Promise<{
  entries: VaultEntry[];
  insights: VaultInsight[];
  memories: MemoryPin[];
}> {
  const entries = await vault.entries.toArray();
  const insights = await vault.insights.toArray();
  const memories = await vault.memoryPins.where('isActive').equals(1).toArray();
  return { entries, insights, memories };
}

export async function saveTradeRecord(record: Omit<TradeRecord, 'id' | 'createdAt'>): Promise<number> {
  const id = await vault.tradeRecords.add({
    ...record,
    createdAt: new Date(),
  });
  return id as number;
}

export async function updateTradeRecord(id: number, updates: Partial<TradeRecord>): Promise<void> {
  await vault.tradeRecords.update(id, updates);
}

export async function getRecentTrades(limit: number = 10): Promise<TradeRecord[]> {
  return vault.tradeRecords
    .orderBy('createdAt')
    .reverse()
    .limit(limit)
    .toArray();
}

export interface EntryStats {
  totalEntries: number;
  streak: number;
  lastEntryDate: Date | null;
  daysSinceLastEntry: number | null;
}

export async function getEntryStats(type: EntryType): Promise<EntryStats> {
  const entries = await vault.entries
    .where('type')
    .equals(type)
    .toArray();
  
  if (entries.length === 0) {
    return { totalEntries: 0, streak: 0, lastEntryDate: null, daysSinceLastEntry: null };
  }
  
  const sortedDates = entries
    .map(e => new Date(e.createdAt))
    .sort((a, b) => b.getTime() - a.getTime());
  
  const lastEntryDate = sortedDates[0];
  const now = new Date();
  const msPerDay = 24 * 60 * 60 * 1000;
  const daysSinceLastEntry = Math.floor((now.getTime() - lastEntryDate.getTime()) / msPerDay);
  
  const uniqueDays = new Set<string>();
  sortedDates.forEach(d => {
    uniqueDays.add(d.toISOString().split('T')[0]);
  });
  
  const sortedUniqueDays = Array.from(uniqueDays).sort((a, b) => b.localeCompare(a));
  
  let streak = 0;
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - msPerDay).toISOString().split('T')[0];
  
  const startDay = sortedUniqueDays[0];
  if (startDay !== today && startDay !== yesterday) {
    streak = 0;
  } else {
    for (let i = 0; i < sortedUniqueDays.length; i++) {
      const currentDay = sortedUniqueDays[i];
      const expectedDay = new Date(Date.now() - i * msPerDay).toISOString().split('T')[0];
      
      if (i === 0 && currentDay !== today && currentDay === yesterday) {
        const adjustedExpected = new Date(Date.now() - (i + 1) * msPerDay).toISOString().split('T')[0];
        if (currentDay === adjustedExpected || currentDay === yesterday) {
          streak++;
          continue;
        }
      }
      
      if (currentDay === expectedDay) {
        streak++;
      } else {
        break;
      }
    }
  }
  
  return {
    totalEntries: entries.length,
    streak,
    lastEntryDate,
    daysSinceLastEntry,
  };
}

export async function getRecentEntriesForContext(type: EntryType, limit: number = 5): Promise<Array<{ text: string; createdAt: Date }>> {
  const entries = await vault.entries
    .where('type')
    .equals(type)
    .toArray();
  
  return entries
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, limit)
    .map(e => ({ text: e.text, createdAt: e.createdAt }));
}
