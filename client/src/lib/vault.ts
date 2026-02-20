import Dexie, { type EntityTable } from 'dexie';
import type { TradeArtifactRow } from '@/lib/trade-artifacts';
import { getSessionKey, encryptData, decryptData, isVaultEncryptionSetUp } from '@/lib/vault-crypto';

const ENC_PREFIX = "🔒";

async function encryptField(text: string): Promise<string> {
  const key = getSessionKey();
  if (!key || !isVaultEncryptionSetUp()) return text;
  const encrypted = await encryptData(text, key);
  return ENC_PREFIX + encrypted;
}

async function decryptField(text: string): Promise<string> {
  if (!text.startsWith(ENC_PREFIX)) return text;
  const key = getSessionKey();
  if (!key) return text;
  try {
    return await decryptData(text.slice(ENC_PREFIX.length), key);
  } catch {
    return text;
  }
}

export type EntryType = 'journal' | 'research';
export type MemoryKind = 'goal' | 'pattern' | 'preference' | 'project' | 'principle' | 'question' | 'person';
export type ClaimStatus = 'verified' | 'uncertain' | 'to_check';
export type TrustLevel = 'high' | 'medium' | 'low' | 'unknown';
export type MusicZone = 'focus' | 'reflection' | 'creative';

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

export interface MusicTrack {
  id?: number;
  name: string;
  blob: ArrayBuffer;
  size: number;
  type: string;
  zone?: MusicZone;
  uploadedAt: Date;
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

export type AlertCondition = 'price_above' | 'price_below' | 'change_above' | 'change_below';

export interface MarketAlert {
  id?: number;
  asset: string;
  condition: AlertCondition;
  threshold: number;
  artifactHash?: string;
  isActive: 0 | 1;
  lastTriggered?: Date;
  createdAt: Date;
}

export type DecisionStakes = 'low' | 'medium' | 'high' | 'critical';
export type DecisionStatus = 'draft' | 'reviewed' | 'decided' | 'revisited';
export type DecisionOutcome = 'pending' | 'positive' | 'negative' | 'mixed' | 'too_early';

export interface DecisionLog {
  id?: number;
  title: string;
  context: string;
  optionsConsidered: string[];
  reasoning: string;
  stakes: DecisionStakes;
  status: DecisionStatus;
  outcome?: DecisionOutcome;
  outcomeNotes?: string;
  aiReview?: string;
  aiCounterArguments?: string[];
  aiBlindSpots?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export type AuditZoneTier = 'micro' | 'founder' | 'treasury';
export type BiasTy = 'FOMO' | 'Sunk_Cost' | 'Narrative_Reaction' | 'Authority_Bias' | 'Confirmation_Bias' | 'Recency_Bias' | 'None';

export type AuditVerdict = 'PASS' | 'FAIL';
export type AuditFlagSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type LogicFailureCode = 'DJZS-S01' | 'DJZS-S02' | 'DJZS-E01' | 'DJZS-E02' | 'DJZS-I01' | 'DJZS-I02' | 'DJZS-X01';

export interface AuditFlag {
  code: LogicFailureCode;
  severity: AuditFlagSeverity;
  message: string;
}

export interface AuditRecord {
  id?: number;
  audit_id: string;
  zone_tier: AuditZoneTier;
  timestamp: Date;
  original_payload: string;
  audit_type: string;
  risk_score: number;
  verdict: AuditVerdict;
  primary_bias_detected: BiasTy;
  flags: AuditFlag[];
  logic_flaws: Array<{ flaw_type: string; severity: string; explanation: string }>;
  structural_recommendations: string[];
  cryptographic_hash: string;
  transaction_hash?: string;
}

export type ContentFormat = 'article' | 'thread' | 'video' | 'newsletter' | 'podcast' | 'post';
export type ContentStatus = 'idea' | 'drafting' | 'refining' | 'ready' | 'published';

export interface ContentPipelineItem {
  id?: number;
  title: string;
  topic: string;
  angle: string;
  format: ContentFormat;
  audience: string;
  hook: string;
  keyPoints: string[];
  status: ContentStatus;
  aiRefinement?: string;
  aiHookSuggestions?: string[];
  aiAngleSuggestions?: string[];
  publishedUrl?: string;
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
  musicTracks!: EntityTable<MusicTrack, 'id'>;
  tradeArtifacts!: EntityTable<TradeArtifactRow, 'id'>;
  marketAlerts!: EntityTable<MarketAlert, 'id'>;
  decisionLogs!: EntityTable<DecisionLog, 'id'>;
  contentPipeline!: EntityTable<ContentPipelineItem, 'id'>;
  auditRecords!: EntityTable<AuditRecord, 'id'>;

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

    this.version(5).stores({
      entries: '++id, type, createdAt, updatedAt, videoAssetId',
      insights: '++id, entryId, type, createdAt',
      memoryPins: '++id, kind, content, isActive, createdAt',
      tradeRecords: '++id, action, status, createdAt',
      researchDossiers: '++id, name, isArchived, createdAt, updatedAt',
      researchQueries: '++id, dossierId, createdAt',
      researchClaims: '++id, dossierId, queryId, status, trustLevel, createdAt',
      musicTracks: '++id, name, zone, uploadedAt',
    });

    this.version(6).stores({
      entries: '++id, type, createdAt, updatedAt, videoAssetId',
      insights: '++id, entryId, type, createdAt',
      memoryPins: '++id, kind, content, isActive, createdAt',
      tradeRecords: '++id, action, status, createdAt',
      researchDossiers: '++id, name, isArchived, createdAt, updatedAt',
      researchQueries: '++id, dossierId, createdAt',
      researchClaims: '++id, dossierId, queryId, status, trustLevel, createdAt',
      musicTracks: '++id, name, zone, uploadedAt',
      tradeArtifacts: '++id, &hash, createdAt, thesisAsset, thesisSide, thesisTimeframe, *linkedJournalEntryIds, *linkedResearchDossierIds',
    });

    this.version(7).stores({
      entries: '++id, type, createdAt, updatedAt, videoAssetId',
      insights: '++id, entryId, type, createdAt',
      memoryPins: '++id, kind, content, isActive, createdAt',
      tradeRecords: '++id, action, status, createdAt',
      researchDossiers: '++id, name, isArchived, createdAt, updatedAt',
      researchQueries: '++id, dossierId, createdAt',
      researchClaims: '++id, dossierId, queryId, status, trustLevel, createdAt',
      musicTracks: '++id, name, zone, uploadedAt',
      tradeArtifacts: '++id, &hash, createdAt, thesisAsset, thesisSide, thesisTimeframe, *linkedJournalEntryIds, *linkedResearchDossierIds',
      marketAlerts: '++id, asset, condition, isActive, createdAt',
    });

    this.version(8).stores({
      entries: '++id, type, createdAt, updatedAt, videoAssetId',
      insights: '++id, entryId, type, createdAt',
      memoryPins: '++id, kind, content, isActive, createdAt',
      tradeRecords: '++id, action, status, createdAt',
      researchDossiers: '++id, name, isArchived, createdAt, updatedAt',
      researchQueries: '++id, dossierId, createdAt',
      researchClaims: '++id, dossierId, queryId, status, trustLevel, createdAt',
      musicTracks: '++id, name, zone, uploadedAt',
      tradeArtifacts: '++id, &hash, createdAt, thesisAsset, thesisSide, thesisTimeframe, *linkedJournalEntryIds, *linkedResearchDossierIds',
      marketAlerts: '++id, asset, condition, isActive, createdAt',
      decisionLogs: '++id, status, stakes, outcome, createdAt, updatedAt',
      contentPipeline: '++id, status, format, createdAt, updatedAt',
    });

    this.version(9).stores({
      entries: '++id, type, createdAt, updatedAt, videoAssetId',
      insights: '++id, entryId, type, createdAt',
      memoryPins: '++id, kind, content, isActive, createdAt',
      tradeRecords: '++id, action, status, createdAt',
      researchDossiers: '++id, name, isArchived, createdAt, updatedAt',
      researchQueries: '++id, dossierId, createdAt',
      researchClaims: '++id, dossierId, queryId, status, trustLevel, createdAt',
      musicTracks: '++id, name, zone, uploadedAt',
      tradeArtifacts: '++id, &hash, createdAt, thesisAsset, thesisSide, thesisTimeframe, *linkedJournalEntryIds, *linkedResearchDossierIds',
      marketAlerts: '++id, asset, condition, isActive, createdAt',
      decisionLogs: '++id, status, stakes, outcome, createdAt, updatedAt',
      contentPipeline: '++id, status, format, createdAt, updatedAt',
      auditRecords: '++id, &audit_id, zone_tier, risk_score, timestamp, cryptographic_hash',
    });

    this.version(10).stores({
      entries: '++id, type, createdAt, updatedAt, videoAssetId',
      insights: '++id, entryId, type, createdAt',
      memoryPins: '++id, kind, content, isActive, createdAt',
      tradeRecords: '++id, action, status, createdAt',
      researchDossiers: '++id, name, isArchived, createdAt, updatedAt',
      researchQueries: '++id, dossierId, createdAt',
      researchClaims: '++id, dossierId, queryId, status, trustLevel, createdAt',
      musicTracks: '++id, name, zone, uploadedAt',
      tradeArtifacts: '++id, &hash, createdAt, thesisAsset, thesisSide, thesisTimeframe, *linkedJournalEntryIds, *linkedResearchDossierIds',
      marketAlerts: '++id, asset, condition, isActive, createdAt',
      decisionLogs: '++id, status, stakes, outcome, createdAt, updatedAt',
      contentPipeline: '++id, status, format, createdAt, updatedAt',
      auditRecords: '++id, &audit_id, zone_tier, verdict, risk_score, timestamp, cryptographic_hash',
    }).upgrade(tx => {
      return tx.table('auditRecords').toCollection().modify(record => {
        if (!record.verdict) {
          record.verdict = record.risk_score > 60 ? 'FAIL' : 'PASS';
        }
        if (!record.flags) {
          record.flags = [];
        }
      });
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
  const encryptedText = await encryptField(text);
  const entry: Omit<VaultEntry, 'id'> = {
    type,
    text: encryptedText,
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
    said: await encryptField(insight.said),
    matters: await encryptField(insight.matters),
    nextMove: await encryptField(insight.nextMove),
    question: await encryptField(insight.question),
    createdAt: new Date(),
  });
  return id as number;
}

export async function getRecentEntries(type: EntryType, limit: number = 5): Promise<VaultEntry[]> {
  const entries = await vault.entries
    .where('type')
    .equals(type)
    .reverse()
    .sortBy('createdAt')
    .then(entries => entries.slice(0, limit));
  for (const entry of entries) {
    entry.text = await decryptField(entry.text);
  }
  return entries;
}

export async function getInsightForEntry(entryId: number): Promise<VaultInsight | undefined> {
  const insight = await vault.insights.where('entryId').equals(entryId).first();
  if (insight) {
    insight.said = await decryptField(insight.said);
    insight.matters = await decryptField(insight.matters);
    insight.nextMove = await decryptField(insight.nextMove);
    insight.question = await decryptField(insight.question);
  }
  return insight;
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
  
  const encryptedContent = await encryptField(content);
  const id = await vault.memoryPins.add({
    kind,
    content: encryptedContent,
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
  const memories = await vault.memoryPins
    .where('isActive')
    .equals(1)
    .reverse()
    .sortBy('createdAt')
    .then(memories => memories.slice(0, limit));
  for (const m of memories) {
    m.content = await decryptField(m.content);
  }
  return memories;
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
  for (const e of entries) { e.text = await decryptField(e.text); }
  const insights = await vault.insights.toArray();
  for (const i of insights) {
    i.said = await decryptField(i.said);
    i.matters = await decryptField(i.matters);
    i.nextMove = await decryptField(i.nextMove);
    i.question = await decryptField(i.question);
  }
  const memories = await vault.memoryPins.where('isActive').equals(1).toArray();
  for (const m of memories) { m.content = await decryptField(m.content); }
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
  
  const sorted = entries
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, limit);
  const result: Array<{ text: string; createdAt: Date }> = [];
  for (const e of sorted) {
    result.push({ text: await decryptField(e.text), createdAt: e.createdAt });
  }
  return result;
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

export async function addMusicTrack(
  file: File,
  zone?: MusicZone
): Promise<number> {
  const arrayBuffer = await file.arrayBuffer();
  const track: Omit<MusicTrack, 'id'> = {
    name: file.name.replace(/\.[^/.]+$/, ''),
    blob: arrayBuffer,
    size: file.size,
    type: file.type,
    zone,
    uploadedAt: new Date(),
  };
  const id = await vault.musicTracks.add(track);
  return id as number;
}

export async function getAllMusicTracks(): Promise<MusicTrack[]> {
  return vault.musicTracks.orderBy('uploadedAt').reverse().toArray();
}

export async function getMusicTracksByZone(zone: MusicZone): Promise<MusicTrack[]> {
  return vault.musicTracks.where('zone').equals(zone).toArray();
}

export async function updateMusicTrackZone(id: number, zone: MusicZone | undefined): Promise<void> {
  await vault.musicTracks.update(id, { zone });
}

export async function deleteMusicTrack(id: number): Promise<void> {
  await vault.musicTracks.delete(id);
}

export async function searchEntries(query: string, type?: EntryType, limit: number = 50): Promise<VaultEntry[]> {
  if (!query.trim()) return [];
  const lowerQuery = query.toLowerCase().trim();
  const words = lowerQuery.split(/\s+/).filter(w => w.length > 0);
  
  let collection = type 
    ? vault.entries.where('type').equals(type)
    : vault.entries.toCollection();
  
  const entries = await collection.toArray();
  
  const scored = entries
    .map(entry => {
      const text = entry.text.toLowerCase();
      let score = 0;
      if (text.includes(lowerQuery)) score += 10;
      for (const word of words) {
        if (text.includes(word)) score += 1;
      }
      const tagMatch = entry.tags?.some(t => t.toLowerCase().includes(lowerQuery));
      if (tagMatch) score += 5;
      return { entry, score };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || b.entry.createdAt.getTime() - a.entry.createdAt.getTime())
    .slice(0, limit)
    .map(({ entry }) => entry);
  
  return scored;
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

async function encryptStringArray(arr: string[]): Promise<string[]> {
  return Promise.all(arr.map(s => encryptField(s)));
}

async function decryptStringArray(arr: string[]): Promise<string[]> {
  return Promise.all(arr.map(s => decryptField(s)));
}

export async function saveDecisionLog(decision: Omit<DecisionLog, 'id' | 'createdAt' | 'updatedAt'>): Promise<number> {
  const now = new Date();
  const encrypted: Omit<DecisionLog, 'id'> = {
    ...decision,
    title: await encryptField(decision.title),
    context: await encryptField(decision.context),
    optionsConsidered: await encryptStringArray(decision.optionsConsidered),
    reasoning: await encryptField(decision.reasoning),
    outcomeNotes: decision.outcomeNotes ? await encryptField(decision.outcomeNotes) : undefined,
    aiReview: decision.aiReview ? await encryptField(decision.aiReview) : undefined,
    aiCounterArguments: decision.aiCounterArguments ? await encryptStringArray(decision.aiCounterArguments) : undefined,
    aiBlindSpots: decision.aiBlindSpots ? await encryptStringArray(decision.aiBlindSpots) : undefined,
    createdAt: now,
    updatedAt: now,
  };
  const id = await vault.decisionLogs.add(encrypted);
  return id as number;
}

export async function updateDecisionLog(id: number, updates: Partial<DecisionLog>): Promise<void> {
  const toUpdate: Partial<DecisionLog> = { ...updates, updatedAt: new Date() };
  if (updates.title) toUpdate.title = await encryptField(updates.title);
  if (updates.context) toUpdate.context = await encryptField(updates.context);
  if (updates.optionsConsidered) toUpdate.optionsConsidered = await encryptStringArray(updates.optionsConsidered);
  if (updates.reasoning) toUpdate.reasoning = await encryptField(updates.reasoning);
  if (updates.outcomeNotes) toUpdate.outcomeNotes = await encryptField(updates.outcomeNotes);
  if (updates.aiReview) toUpdate.aiReview = await encryptField(updates.aiReview);
  if (updates.aiCounterArguments) toUpdate.aiCounterArguments = await encryptStringArray(updates.aiCounterArguments);
  if (updates.aiBlindSpots) toUpdate.aiBlindSpots = await encryptStringArray(updates.aiBlindSpots);
  await vault.decisionLogs.update(id, toUpdate);
}

export async function getAllDecisionLogs(): Promise<DecisionLog[]> {
  const logs = await vault.decisionLogs.orderBy('createdAt').reverse().toArray();
  for (const log of logs) {
    log.title = await decryptField(log.title);
    log.context = await decryptField(log.context);
    log.optionsConsidered = await decryptStringArray(log.optionsConsidered);
    log.reasoning = await decryptField(log.reasoning);
    if (log.outcomeNotes) log.outcomeNotes = await decryptField(log.outcomeNotes);
    if (log.aiReview) log.aiReview = await decryptField(log.aiReview);
    if (log.aiCounterArguments) log.aiCounterArguments = await decryptStringArray(log.aiCounterArguments);
    if (log.aiBlindSpots) log.aiBlindSpots = await decryptStringArray(log.aiBlindSpots);
  }
  return logs;
}

export async function deleteDecisionLog(id: number): Promise<void> {
  await vault.decisionLogs.delete(id);
}

export async function saveContentItem(item: Omit<ContentPipelineItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<number> {
  const now = new Date();
  const encrypted: Omit<ContentPipelineItem, 'id'> = {
    ...item,
    title: await encryptField(item.title),
    topic: await encryptField(item.topic),
    angle: await encryptField(item.angle),
    audience: await encryptField(item.audience),
    hook: await encryptField(item.hook),
    keyPoints: await encryptStringArray(item.keyPoints),
    aiRefinement: item.aiRefinement ? await encryptField(item.aiRefinement) : undefined,
    aiHookSuggestions: item.aiHookSuggestions ? await encryptStringArray(item.aiHookSuggestions) : undefined,
    aiAngleSuggestions: item.aiAngleSuggestions ? await encryptStringArray(item.aiAngleSuggestions) : undefined,
    createdAt: now,
    updatedAt: now,
  };
  const id = await vault.contentPipeline.add(encrypted);
  return id as number;
}

export async function updateContentItem(id: number, updates: Partial<ContentPipelineItem>): Promise<void> {
  const toUpdate: Partial<ContentPipelineItem> = { ...updates, updatedAt: new Date() };
  if (updates.title) toUpdate.title = await encryptField(updates.title);
  if (updates.topic) toUpdate.topic = await encryptField(updates.topic);
  if (updates.angle) toUpdate.angle = await encryptField(updates.angle);
  if (updates.audience) toUpdate.audience = await encryptField(updates.audience);
  if (updates.hook) toUpdate.hook = await encryptField(updates.hook);
  if (updates.keyPoints) toUpdate.keyPoints = await encryptStringArray(updates.keyPoints);
  if (updates.aiRefinement) toUpdate.aiRefinement = await encryptField(updates.aiRefinement);
  if (updates.aiHookSuggestions) toUpdate.aiHookSuggestions = await encryptStringArray(updates.aiHookSuggestions);
  if (updates.aiAngleSuggestions) toUpdate.aiAngleSuggestions = await encryptStringArray(updates.aiAngleSuggestions);
  await vault.contentPipeline.update(id, toUpdate);
}

export async function getAllContentItems(): Promise<ContentPipelineItem[]> {
  const items = await vault.contentPipeline.orderBy('createdAt').reverse().toArray();
  for (const item of items) {
    item.title = await decryptField(item.title);
    item.topic = await decryptField(item.topic);
    item.angle = await decryptField(item.angle);
    item.audience = await decryptField(item.audience);
    item.hook = await decryptField(item.hook);
    item.keyPoints = await decryptStringArray(item.keyPoints);
    if (item.aiRefinement) item.aiRefinement = await decryptField(item.aiRefinement);
    if (item.aiHookSuggestions) item.aiHookSuggestions = await decryptStringArray(item.aiHookSuggestions);
    if (item.aiAngleSuggestions) item.aiAngleSuggestions = await decryptStringArray(item.aiAngleSuggestions);
  }
  return items;
}

export async function deleteContentItem(id: number): Promise<void> {
  await vault.contentPipeline.delete(id);
}

export async function saveAuditRecord(record: Omit<AuditRecord, 'id'>): Promise<number> {
  const id = await vault.auditRecords.add(record);
  return id as number;
}

export async function getAuditRecords(limit: number = 50): Promise<AuditRecord[]> {
  return vault.auditRecords
    .orderBy('timestamp')
    .reverse()
    .limit(limit)
    .toArray();
}

export async function getAuditRecordsByTier(tier: AuditZoneTier, limit: number = 50): Promise<AuditRecord[]> {
  return vault.auditRecords
    .where('zone_tier')
    .equals(tier)
    .reverse()
    .sortBy('timestamp')
    .then(records => records.slice(0, limit));
}

export async function getAuditRecord(id: number): Promise<AuditRecord | undefined> {
  return vault.auditRecords.get(id);
}

export async function deleteAuditRecord(id: number): Promise<void> {
  await vault.auditRecords.delete(id);
}
