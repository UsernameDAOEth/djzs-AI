import JSZip from 'jszip';
import {
  vault,
  type VaultEntry,
  type VaultInsight,
  type MemoryPin,
  type ResearchDossier,
  type ResearchQuery,
  type ResearchClaim,
  type MusicTrack,
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
    researchDossiers: number;
    researchQueries: number;
    researchClaims: number;
    musicTracks: number;
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
  dossiersAdded: number;
  dossiersSkipped: number;
  queriesAdded: number;
  queriesSkipped: number;
  claimsAdded: number;
  claimsSkipped: number;
  musicTracksAdded: number;
  musicTracksSkipped: number;
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
  if (entry.videoAssetId) md += `videoAssetId: ${entry.videoAssetId}\n`;
  if (entry.videoPlaybackId) md += `videoPlaybackId: ${entry.videoPlaybackId}\n`;
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
  const dossiers = await vault.researchDossiers.toArray();
  const queries = await vault.researchQueries.toArray();
  const claims = await vault.researchClaims.toArray();
  const musicTracks = await vault.musicTracks.toArray();

  const allData = JSON.stringify({ entries, insights, pins, dossiers, queries, claims });
  const checksum = simpleHash(allData);

  const manifest: BackupManifest = {
    version: BACKUP_VERSION,
    appVersion: 'djzs-v1',
    createdAt: new Date().toISOString(),
    counts: {
      entries: entries.length,
      insights: insights.length,
      memoryPins: pins.length,
      researchDossiers: dossiers.length,
      researchQueries: queries.length,
      researchClaims: claims.length,
      musicTracks: musicTracks.length,
    },
    checksum,
  };

  zip.file('manifest.json', JSON.stringify(manifest, null, 2));

  const entriesFolder = zip.folder('entries');
  entries.forEach((entry, i) => {
    const id = entry.id ?? i;
    entriesFolder!.file(`${id}.json`, JSON.stringify(entry, null, 2));
    entriesFolder!.file(`${id}.md`, entryToMarkdown(entry));
  });

  zip.file('insights.json', JSON.stringify(insights, null, 2));
  zip.file('pins.json', JSON.stringify(pins, null, 2));

  const researchFolder = zip.folder('research');
  researchFolder!.file('dossiers.json', JSON.stringify(dossiers, null, 2));
  researchFolder!.file('queries.json', JSON.stringify(queries, null, 2));
  researchFolder!.file('claims.json', JSON.stringify(claims, null, 2));

  if (musicTracks.length > 0) {
    const musicMeta = musicTracks.map(({ blob, ...rest }) => rest);
    zip.file('music/tracks.json', JSON.stringify(musicMeta, null, 2));
    musicTracks.forEach((track, i) => {
      const id = track.id ?? i;
      const ext = track.type?.split('/')[1] || 'bin';
      zip.file(`music/${id}.${ext}`, track.blob);
    });
  }

  const blob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE' });
  setLastBackupDate();
  return blob;
}

export async function exportVaultAsJson(): Promise<Blob> {
  const entries = await vault.entries.toArray();
  const insights = await vault.insights.toArray();
  const pins = await vault.memoryPins.toArray();
  const dossiers = await vault.researchDossiers.toArray();
  const queries = await vault.researchQueries.toArray();
  const claims = await vault.researchClaims.toArray();

  const data = { entries, insights, memories: pins, researchDossiers: dossiers, researchQueries: queries, researchClaims: claims };
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

function dossiersMatch(a: ResearchDossier, b: ResearchDossier): boolean {
  return a.name === b.name;
}

export async function importVaultFromZip(file: File): Promise<ImportResult> {
  const zip = await JSZip.loadAsync(file);
  const result: ImportResult = {
    entriesAdded: 0, entriesSkipped: 0,
    insightsAdded: 0, insightsSkipped: 0,
    pinsAdded: 0, pinsSkipped: 0,
    dossiersAdded: 0, dossiersSkipped: 0,
    queriesAdded: 0, queriesSkipped: 0,
    claimsAdded: 0, claimsSkipped: 0,
    musicTracksAdded: 0, musicTracksSkipped: 0,
  };

  const manifestFile = zip.file('manifest.json');
  if (!manifestFile) throw new Error('Invalid backup: missing manifest.json');
  const manifest: BackupManifest = JSON.parse(await manifestFile.async('string'));
  if (manifest.version > BACKUP_VERSION) {
    throw new Error(`Backup version ${manifest.version} is newer than supported version ${BACKUP_VERSION}`);
  }

  const existingEntries = await vault.entries.toArray();
  const existingPins = await vault.memoryPins.toArray();
  const existingDossiers = await vault.researchDossiers.toArray();
  const existingInsights = await vault.insights.toArray();
  const existingQueries = await vault.researchQueries.toArray();
  const existingClaims = await vault.researchClaims.toArray();

  const idMap: Record<string, Record<number, number>> = {
    entries: {},
    dossiers: {},
    queries: {},
  };

  const entryFiles = zip.folder('entries');
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

  const dossiersFile = zip.file('research/dossiers.json');
  if (dossiersFile) {
    const dossiers: ResearchDossier[] = JSON.parse(await dossiersFile.async('string'));
    for (const dossier of dossiers) {
      const oldId = dossier.id;
      const isDup = existingDossiers.some(d => dossiersMatch(d, dossier));
      if (isDup) {
        result.dossiersSkipped++;
        const match = existingDossiers.find(d => dossiersMatch(d, dossier));
        if (match?.id !== undefined && oldId !== undefined) idMap.dossiers[oldId] = match.id;
      } else {
        const { id, ...rest } = dossier;
        rest.createdAt = new Date(rest.createdAt);
        rest.updatedAt = rest.updatedAt ? new Date(rest.updatedAt) : rest.createdAt;
        const newId = await vault.researchDossiers.add(rest as ResearchDossier);
        if (oldId !== undefined) idMap.dossiers[oldId] = newId as number;
        existingDossiers.push({ ...rest, id: newId as number } as ResearchDossier);
        result.dossiersAdded++;
      }
    }
  }

  const queriesFile = zip.file('research/queries.json');
  if (queriesFile) {
    const rQueries: ResearchQuery[] = JSON.parse(await queriesFile.async('string'));
    for (const q of rQueries) {
      const oldId = q.id;
      const mappedDossierId = q.dossierId ? (idMap.dossiers[q.dossierId] ?? q.dossierId) : q.dossierId;
      const isDup = existingQueries.some(eq => eq.dossierId === mappedDossierId && eq.query === q.query);
      if (isDup) {
        result.queriesSkipped++;
        const match = existingQueries.find(eq => eq.dossierId === mappedDossierId && eq.query === q.query);
        if (match?.id !== undefined && oldId !== undefined) idMap.queries[oldId] = match.id;
      } else {
        const { id, ...rest } = q;
        rest.dossierId = mappedDossierId;
        rest.createdAt = new Date(rest.createdAt);
        const newId = await vault.researchQueries.add(rest as ResearchQuery);
        if (oldId !== undefined) idMap.queries[oldId] = newId as number;
        existingQueries.push({ ...rest, id: newId as number } as ResearchQuery);
        result.queriesAdded++;
      }
    }
  }

  const claimsFile = zip.file('research/claims.json');
  if (claimsFile) {
    const rClaims: ResearchClaim[] = JSON.parse(await claimsFile.async('string'));
    for (const c of rClaims) {
      const mappedDossierId = c.dossierId ? (idMap.dossiers[c.dossierId] ?? c.dossierId) : c.dossierId;
      const mappedQueryId = c.queryId ? (idMap.queries[c.queryId] ?? c.queryId) : c.queryId;
      const isDup = existingClaims.some(ec => ec.dossierId === mappedDossierId && ec.claim === c.claim);
      if (isDup) {
        result.claimsSkipped++;
      } else {
        const { id, ...rest } = c;
        rest.dossierId = mappedDossierId;
        rest.queryId = mappedQueryId;
        rest.createdAt = new Date(rest.createdAt);
        rest.updatedAt = rest.updatedAt ? new Date(rest.updatedAt) : rest.createdAt;
        if (rest.linkedJournalEntryId) {
          rest.linkedJournalEntryId = idMap.entries[rest.linkedJournalEntryId] ?? rest.linkedJournalEntryId;
        }
        await vault.researchClaims.add(rest as ResearchClaim);
        existingClaims.push({ ...rest, id: 0 } as ResearchClaim);
        result.claimsAdded++;
      }
    }
  }

  const musicMetaFile = zip.file('music/tracks.json');
  if (musicMetaFile) {
    const tracksMeta = JSON.parse(await musicMetaFile.async('string'));
    const existingTracks = await vault.musicTracks.toArray();
    for (const meta of tracksMeta) {
      const isDup = existingTracks.some(t => t.name === meta.name && t.size === meta.size);
      if (isDup) {
        result.musicTracksSkipped++;
      } else {
        const ext = meta.type?.split('/')[1] || 'bin';
        const blobFile = zip.file(`music/${meta.id}.${ext}`);
        if (blobFile) {
          const blob = await blobFile.async('arraybuffer');
          const { id, ...rest } = meta;
          rest.blob = blob;
          rest.uploadedAt = new Date(rest.uploadedAt);
          await vault.musicTracks.add(rest as MusicTrack);
          result.musicTracksAdded++;
        }
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
    dossiersAdded: 0, dossiersSkipped: 0,
    queriesAdded: 0, queriesSkipped: 0,
    claimsAdded: 0, claimsSkipped: 0,
    musicTracksAdded: 0, musicTracksSkipped: 0,
  };

  const existingEntries = await vault.entries.toArray();
  const existingPins = await vault.memoryPins.toArray();
  const existingInsights = await vault.insights.toArray();
  const existingDossiers = await vault.researchDossiers.toArray();
  const existingQueries = await vault.researchQueries.toArray();
  const existingClaims = await vault.researchClaims.toArray();

  const idMap: Record<string, Record<number, number>> = { entries: {}, dossiers: {}, queries: {} };

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

  if (data.researchDossiers) {
    for (const dossier of data.researchDossiers) {
      const oldId = dossier.id;
      const isDup = existingDossiers.some((d: ResearchDossier) => dossiersMatch(d, dossier));
      if (isDup) {
        result.dossiersSkipped++;
        const match = existingDossiers.find((d: ResearchDossier) => dossiersMatch(d, dossier));
        if (match?.id !== undefined && oldId !== undefined) idMap.dossiers[oldId] = match.id;
      } else {
        const { id, ...rest } = dossier;
        rest.createdAt = new Date(rest.createdAt);
        rest.updatedAt = rest.updatedAt ? new Date(rest.updatedAt) : rest.createdAt;
        const newId = await vault.researchDossiers.add(rest);
        if (oldId !== undefined) idMap.dossiers[oldId] = newId as number;
        existingDossiers.push({ ...rest, id: newId as number } as ResearchDossier);
        result.dossiersAdded++;
      }
    }
  }

  if (data.researchQueries) {
    for (const q of data.researchQueries) {
      const oldId = q.id;
      const mappedDossierId = q.dossierId ? (idMap.dossiers[q.dossierId] ?? q.dossierId) : q.dossierId;
      const isDup = existingQueries.some((eq: ResearchQuery) => eq.dossierId === mappedDossierId && eq.query === q.query);
      if (isDup) {
        result.queriesSkipped++;
        const match = existingQueries.find((eq: ResearchQuery) => eq.dossierId === mappedDossierId && eq.query === q.query);
        if (match?.id !== undefined && oldId !== undefined) idMap.queries[oldId] = match.id;
      } else {
        const { id, ...rest } = q;
        rest.dossierId = mappedDossierId;
        rest.createdAt = new Date(rest.createdAt);
        const newId = await vault.researchQueries.add(rest);
        if (oldId !== undefined) idMap.queries[oldId] = newId as number;
        existingQueries.push({ ...rest, id: newId as number } as ResearchQuery);
        result.queriesAdded++;
      }
    }
  }

  if (data.researchClaims) {
    for (const c of data.researchClaims) {
      const mappedDossierId = c.dossierId ? (idMap.dossiers[c.dossierId] ?? c.dossierId) : c.dossierId;
      const isDup = existingClaims.some((ec: ResearchClaim) => ec.dossierId === mappedDossierId && ec.claim === c.claim);
      if (isDup) { result.claimsSkipped++; }
      else {
        const { id, ...rest } = c;
        rest.dossierId = mappedDossierId;
        if (rest.queryId) rest.queryId = idMap.queries[rest.queryId] ?? rest.queryId;
        rest.createdAt = new Date(rest.createdAt);
        rest.updatedAt = rest.updatedAt ? new Date(rest.updatedAt) : rest.createdAt;
        if (rest.linkedJournalEntryId) {
          rest.linkedJournalEntryId = idMap.entries[rest.linkedJournalEntryId] ?? rest.linkedJournalEntryId;
        }
        await vault.researchClaims.add(rest);
        existingClaims.push({ ...rest, id: 0 } as ResearchClaim);
        result.claimsAdded++;
      }
    }
  }

  return result;
}
