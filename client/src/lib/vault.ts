import Dexie, { type EntityTable } from 'dexie';

export type EntryType = 'journal' | 'research';
export type MemoryKind = 'goal' | 'pattern' | 'preference' | 'project' | 'principle' | 'question' | 'person';
export type ClaimStatus = 'verified' | 'uncertain' | 'to_check';
export type TrustLevel = 'high' | 'medium' | 'low' | 'unknown';

export interface VaultEntry {
  id?: number;
  type: EntryType;
  text: string;
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
  videoAssetId?: string;
  videoPlaybackId?: string;
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

export interface ResearchDossier {
  id?: number;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  isArchived: 0 | 1;
}

export interface ResearchQuery {
  id?: number;
  dossierId: number;
  query: string;
  synthesis?: string;
  keyTakeaways?: string[];
  nextSteps?: string[];
  webSearchEnabled: 0 | 1;
  createdAt: Date;
}

export interface ResearchClaim {
  id?: number;
  dossierId: number;
  queryId?: number;
  claim: string;
  status: ClaimStatus;
  sourceNote?: string;
  trustLevel: TrustLevel;
  linkedJournalEntryId?: number;
  createdAt: Date;
  updatedAt: Date;
}

class VaultDatabase extends Dexie {
  entries!: EntityTable<VaultEntry, 'id'>;
  insights!: EntityTable<VaultInsight, 'id'>;
  memoryPins!: EntityTable<MemoryPin, 'id'>;
  researchDossiers!: EntityTable<ResearchDossier, 'id'>;
  researchQueries!: EntityTable<ResearchQuery, 'id'>;
  researchClaims!: EntityTable<ResearchClaim, 'id'>;

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
    
    this.version(3).stores({
      entries: '++id, type, createdAt, updatedAt',
      insights: '++id, entryId, type, createdAt',
      memoryPins: '++id, kind, content, isActive, createdAt',
      tradeRecords: '++id, action, status, createdAt',
      researchDossiers: '++id, name, isArchived, createdAt, updatedAt',
      researchQueries: '++id, dossierId, createdAt',
      researchClaims: '++id, dossierId, queryId, status, trustLevel, createdAt',
    });

    this.version(4).stores({
      entries: '++id, type, createdAt, updatedAt, videoAssetId',
      insights: '++id, entryId, type, createdAt',
      memoryPins: '++id, kind, content, isActive, createdAt',
      tradeRecords: '++id, action, status, createdAt',
      researchDossiers: '++id, name, isArchived, createdAt, updatedAt',
      researchQueries: '++id, dossierId, createdAt',
      researchClaims: '++id, dossierId, queryId, status, trustLevel, createdAt',
    });
  }
}

export const vault = new VaultDatabase();

export async function saveEntry(
  type: EntryType,
  text: string,
  tags: string[] = [],
  videoAssetId?: string,
  videoPlaybackId?: string
): Promise<number> {
  const now = new Date();
  const entry: Omit<VaultEntry, 'id'> = {
    type,
    text,
    createdAt: now,
    updatedAt: now,
    tags,
  };
  if (videoAssetId) entry.videoAssetId = videoAssetId;
  if (videoPlaybackId) entry.videoPlaybackId = videoPlaybackId;
  const id = await vault.entries.add(entry);
  return id as number;
}

export async function updateEntryVideo(
  entryId: number,
  videoAssetId: string,
  videoPlaybackId: string
): Promise<void> {
  await vault.entries.update(entryId, { videoAssetId, videoPlaybackId, updatedAt: new Date() });
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
  researchDossiers: ResearchDossier[];
  researchQueries: ResearchQuery[];
  researchClaims: ResearchClaim[];
}> {
  const entries = await vault.entries.toArray();
  const insights = await vault.insights.toArray();
  const memories = await vault.memoryPins.where('isActive').equals(1).toArray();
  const researchDossiers = await vault.researchDossiers.toArray();
  const researchQueries = await vault.researchQueries.toArray();
  const researchClaims = await vault.researchClaims.toArray();
  return { entries, insights, memories, researchDossiers, researchQueries, researchClaims };
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

export async function createDossier(name: string, description?: string): Promise<number> {
  const now = new Date();
  const id = await vault.researchDossiers.add({
    name,
    description,
    createdAt: now,
    updatedAt: now,
    isArchived: 0,
  });
  return id as number;
}

export async function updateDossier(id: number, updates: Partial<Pick<ResearchDossier, 'name' | 'description'>>): Promise<void> {
  await vault.researchDossiers.update(id, { ...updates, updatedAt: new Date() });
}

export async function archiveDossier(id: number): Promise<void> {
  await vault.researchDossiers.update(id, { isArchived: 1, updatedAt: new Date() });
}

export async function deleteDossier(id: number): Promise<void> {
  await vault.researchClaims.where('dossierId').equals(id).delete();
  await vault.researchQueries.where('dossierId').equals(id).delete();
  await vault.researchDossiers.delete(id);
}

export async function getActiveDossiers(): Promise<ResearchDossier[]> {
  return vault.researchDossiers
    .where('isArchived')
    .equals(0)
    .reverse()
    .sortBy('updatedAt');
}

export async function getDossier(id: number): Promise<ResearchDossier | undefined> {
  return vault.researchDossiers.get(id);
}

export async function addResearchQuery(
  dossierId: number,
  query: string,
  synthesis?: string,
  keyTakeaways?: string[],
  nextSteps?: string[],
  webSearchEnabled: boolean = false
): Promise<number> {
  const id = await vault.researchQueries.add({
    dossierId,
    query,
    synthesis,
    keyTakeaways,
    nextSteps,
    webSearchEnabled: webSearchEnabled ? 1 : 0,
    createdAt: new Date(),
  });
  await vault.researchDossiers.update(dossierId, { updatedAt: new Date() });
  return id as number;
}

export async function getQueriesForDossier(dossierId: number): Promise<ResearchQuery[]> {
  return vault.researchQueries
    .where('dossierId')
    .equals(dossierId)
    .reverse()
    .sortBy('createdAt');
}

export async function addClaim(
  dossierId: number,
  claim: string,
  status: ClaimStatus = 'to_check',
  trustLevel: TrustLevel = 'unknown',
  queryId?: number,
  sourceNote?: string
): Promise<number> {
  const now = new Date();
  const id = await vault.researchClaims.add({
    dossierId,
    queryId,
    claim,
    status,
    sourceNote,
    trustLevel,
    createdAt: now,
    updatedAt: now,
  });
  await vault.researchDossiers.update(dossierId, { updatedAt: new Date() });
  return id as number;
}

export async function updateClaim(
  id: number,
  updates: Partial<Pick<ResearchClaim, 'status' | 'sourceNote' | 'trustLevel' | 'linkedJournalEntryId'>>
): Promise<void> {
  await vault.researchClaims.update(id, { ...updates, updatedAt: new Date() });
}

export async function deleteClaim(id: number): Promise<void> {
  await vault.researchClaims.delete(id);
}

export async function getClaimsForDossier(dossierId: number): Promise<ResearchClaim[]> {
  return vault.researchClaims
    .where('dossierId')
    .equals(dossierId)
    .toArray();
}

export async function getClaimsByStatus(dossierId: number, status: ClaimStatus): Promise<ResearchClaim[]> {
  return vault.researchClaims
    .where('dossierId')
    .equals(dossierId)
    .and(c => c.status === status)
    .toArray();
}

export async function searchJournalEntriesForTopic(keywords: string[], limit: number = 5): Promise<VaultEntry[]> {
  const entries = await vault.entries
    .where('type')
    .equals('journal')
    .toArray();
  
  const lowerKeywords = keywords.map(k => k.toLowerCase());
  
  const matchingEntries = entries.filter(entry => {
    const text = entry.text.toLowerCase();
    return lowerKeywords.some(keyword => text.includes(keyword));
  });
  
  return matchingEntries
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, limit);
}
