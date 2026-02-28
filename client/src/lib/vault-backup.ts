import JSZip from 'jszip';
import {
  vault,
  type VaultEntry,
  type VaultInsight,
  type MemoryPin,
} from './vault';

const BACKUP_VERSION = 1;
const LAST_BACKUP_KEY = 'djzs-last-backup';

export interface BackupManifest {
  version: number;
  appVersion: string;
  createdAt: string;
  counts: {
    entries: number;
    insights: number;
    memoryPins: number;
  };
  checksum: string;
}

export interface ImportResult {
  entriesAdded: number;
  entriesSkipped: number;
  insightsAdded: number;
  insightsSkipped: number;
  pinsAdded: number;
  pinsSkipped: number;
}

export async function requestPersistentStorage(): Promise<boolean> {
  if (navigator.storage && navigator.storage.persist) {
    return navigator.storage.persist();
  }
  return false;
}

export async function checkPersistentStorage(): Promise<boolean> {
  if (navigator.storage && navigator.storage.persisted) {
    return navigator.storage.persisted();
  }
  return false;
}

export async function getStorageEstimate(): Promise<{ usage: number; quota: number } | null> {
  if (navigator.storage && navigator.storage.estimate) {
    const est = await navigator.storage.estimate();
    return { usage: est.usage || 0, quota: est.quota || 0 };
  }
  return null;
}

export function getLastBackupDate(): string | null {
  return localStorage.getItem(LAST_BACKUP_KEY);
}

export function setLastBackupDate(): void {
  localStorage.setItem(LAST_BACKUP_KEY, new Date().toISOString());
}

function entryToMarkdown(entry: VaultEntry): string {
  const date = new Date(entry.createdAt).toISOString();
  const tags = entry.tags?.length ? entry.tags.join(', ') : '';
  let md = `---\ntype: ${entry.type}\ncreatedAt: ${date}\n`;
  if (tags) md += `tags: [${tags}]\n`;
  md += `---\n\n${entry.text}\n`;
  return md;
}

function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
}

export async function exportVaultAsZip(): Promise<Blob> {
  const zip = new JSZip();

  const entries = await vault.entries.toArray();
  const insights = await vault.insights.toArray();
  const pins = await vault.memoryPins.toArray();
  const allData = JSON.stringify({ entries, insights, pins });
  const checksum = simpleHash(allData);

  const manifest: BackupManifest = {
    version: BACKUP_VERSION,
    appVersion: 'djzs-v1',
    createdAt: new Date().toISOString(),
    counts: {
      entries: entries.length,
      insights: insights.length,
      memoryPins: pins.length,
    },
    checksum,
  };

  zip.file('manifest.json', JSON.stringify(manifest, null, 2));

  const jetLogsFolder = zip.folder('JET_Logs');
  entries.forEach((entry, i) => {
    const id = entry.id ?? i;
    jetLogsFolder!.file(`${id}.json`, JSON.stringify(entry, null, 2));
    jetLogsFolder!.file(`${id}.md`, entryToMarkdown(entry));
  });

  zip.file('insights.json', JSON.stringify(insights, null, 2));
  zip.file('pins.json', JSON.stringify(pins, null, 2));

  const blob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE' });
  setLastBackupDate();
  return blob;
}

export async function exportVaultAsJson(): Promise<Blob> {
  const entries = await vault.entries.toArray();
  const insights = await vault.insights.toArray();
  const pins = await vault.memoryPins.toArray();

  const data = { entries, insights, memories: pins };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  setLastBackupDate();
  return blob;
}

function entriesMatch(a: VaultEntry, b: VaultEntry): boolean {
  return a.text === b.text &&
    new Date(a.createdAt).getTime() === new Date(b.createdAt).getTime() &&
    a.type === b.type;
}

function pinsMatch(a: MemoryPin, b: MemoryPin): boolean {
  return a.content === b.content && a.kind === b.kind;
}

export async function importVaultFromZip(file: File): Promise<ImportResult> {
  const zip = await JSZip.loadAsync(file);
  const result: ImportResult = {
    entriesAdded: 0, entriesSkipped: 0,
    insightsAdded: 0, insightsSkipped: 0,
    pinsAdded: 0, pinsSkipped: 0,
  };

  const manifestFile = zip.file('manifest.json');
  if (!manifestFile) throw new Error('Invalid backup: missing manifest.json');
  const manifest: BackupManifest = JSON.parse(await manifestFile.async('string'));
  if (manifest.version > BACKUP_VERSION) {
    throw new Error(`Backup version ${manifest.version} is newer than supported version ${BACKUP_VERSION}`);
  }

  const existingEntries = await vault.entries.toArray();
  const existingPins = await vault.memoryPins.toArray();
  const existingInsights = await vault.insights.toArray();

  const idMap: Record<string, Record<number, number>> = {
    entries: {},
  };

  const entryFiles = zip.folder('JET_Logs');
  if (entryFiles) {
    const jsonFiles: string[] = [];
    entryFiles.forEach((relativePath, file) => {
      if (relativePath.endsWith('.json')) jsonFiles.push(relativePath);
    });

    for (const relPath of jsonFiles) {
      const f = entryFiles.file(relPath);
      if (!f) continue;
      const entry: VaultEntry = JSON.parse(await f.async('string'));
      const oldId = entry.id;
      const isDup = existingEntries.some(e => entriesMatch(e, entry));
      if (isDup) {
        result.entriesSkipped++;
        const match = existingEntries.find(e => entriesMatch(e, entry));
        if (match?.id !== undefined && oldId !== undefined) idMap.entries[oldId] = match.id;
      } else {
        const { id, ...rest } = entry;
        rest.createdAt = new Date(rest.createdAt);
        rest.updatedAt = rest.updatedAt ? new Date(rest.updatedAt) : rest.createdAt;
        const newId = await vault.entries.add(rest as VaultEntry);
        if (oldId !== undefined) idMap.entries[oldId] = newId as number;
        existingEntries.push({ ...rest, id: newId as number } as VaultEntry);
        result.entriesAdded++;
      }
    }
  }

  const insightsFile = zip.file('insights.json');
  if (insightsFile) {
    const insights: VaultInsight[] = JSON.parse(await insightsFile.async('string'));
    for (const insight of insights) {
      const mappedEntryId = insight.entryId ? (idMap.entries[insight.entryId] ?? insight.entryId) : insight.entryId;
      const isDup = existingInsights.some(i => i.entryId === mappedEntryId && i.said === insight.said);
      if (isDup) {
        result.insightsSkipped++;
      } else {
        const { id, ...rest } = insight;
        rest.entryId = mappedEntryId;
        rest.createdAt = new Date(rest.createdAt);
        await vault.insights.add(rest as VaultInsight);
        existingInsights.push({ ...rest, id: 0 } as VaultInsight);
        result.insightsAdded++;
      }
    }
  }

  const pinsFile = zip.file('pins.json');
  if (pinsFile) {
    const pins: MemoryPin[] = JSON.parse(await pinsFile.async('string'));
    for (const pin of pins) {
      const isDup = existingPins.some(p => pinsMatch(p, pin));
      if (isDup) {
        result.pinsSkipped++;
      } else {
        const { id, ...rest } = pin;
        rest.createdAt = new Date(rest.createdAt);
        if (rest.lastUsedAt) rest.lastUsedAt = new Date(rest.lastUsedAt);
        if (rest.sourceEntryId) rest.sourceEntryId = idMap.entries[rest.sourceEntryId] ?? rest.sourceEntryId;
        await vault.memoryPins.add(rest as MemoryPin);
        existingPins.push({ ...rest, id: 0 } as MemoryPin);
        result.pinsAdded++;
      }
    }
  }

  return result;
}

export async function importVaultFromJson(file: File): Promise<ImportResult> {
  const text = await file.text();
  const data = JSON.parse(text);

  const result: ImportResult = {
    entriesAdded: 0, entriesSkipped: 0,
    insightsAdded: 0, insightsSkipped: 0,
    pinsAdded: 0, pinsSkipped: 0,
  };

  const existingEntries = await vault.entries.toArray();
  const existingPins = await vault.memoryPins.toArray();
  const existingInsights = await vault.insights.toArray();

  const idMap: Record<string, Record<number, number>> = { entries: {} };

  if (data.entries) {
    for (const entry of data.entries) {
      const oldId = entry.id;
      const isDup = existingEntries.some((e: VaultEntry) => entriesMatch(e, entry));
      if (isDup) {
        result.entriesSkipped++;
        const match = existingEntries.find((e: VaultEntry) => entriesMatch(e, entry));
        if (match?.id !== undefined && oldId !== undefined) idMap.entries[oldId] = match.id;
      } else {
        const { id, ...rest } = entry;
        rest.createdAt = new Date(rest.createdAt);
        rest.updatedAt = rest.updatedAt ? new Date(rest.updatedAt) : rest.createdAt;
        const newId = await vault.entries.add(rest);
        if (oldId !== undefined) idMap.entries[oldId] = newId as number;
        existingEntries.push({ ...rest, id: newId as number } as VaultEntry);
        result.entriesAdded++;
      }
    }
  }

  if (data.insights) {
    for (const insight of data.insights) {
      const mappedEntryId = insight.entryId ? (idMap.entries[insight.entryId] ?? insight.entryId) : insight.entryId;
      const isDup = existingInsights.some((i: VaultInsight) => i.entryId === mappedEntryId && i.said === insight.said);
      if (isDup) { result.insightsSkipped++; }
      else {
        const { id, ...rest } = insight;
        rest.entryId = mappedEntryId;
        rest.createdAt = new Date(rest.createdAt);
        await vault.insights.add(rest);
        existingInsights.push({ ...rest, id: 0 } as VaultInsight);
        result.insightsAdded++;
      }
    }
  }

  const memories = data.memories || data.memoryPins || data.pins;
  if (memories) {
    for (const pin of memories) {
      const isDup = existingPins.some((p: MemoryPin) => pinsMatch(p, pin));
      if (isDup) { result.pinsSkipped++; }
      else {
        const { id, ...rest } = pin;
        rest.createdAt = new Date(rest.createdAt);
        if (rest.lastUsedAt) rest.lastUsedAt = new Date(rest.lastUsedAt);
        if (rest.sourceEntryId) rest.sourceEntryId = idMap.entries[rest.sourceEntryId] ?? rest.sourceEntryId;
        await vault.memoryPins.add(rest);
        existingPins.push({ ...rest, id: 0 } as MemoryPin);
        result.pinsAdded++;
      }
    }
  }

  return result;
}
