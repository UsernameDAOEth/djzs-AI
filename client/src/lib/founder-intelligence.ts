import { vault, type AuditRecord, type VaultEntry, type DecisionLog, type MemoryPin } from './vault';
import { getSessionKey, isVaultEncryptionSetUp } from './vault-crypto';

const ENC_PREFIX = "🔒";

async function decryptField(text: string): Promise<string> {
  if (!text.startsWith(ENC_PREFIX)) return text;
  const key = getSessionKey();
  if (!key) return text;
  try {
    const { decryptData } = await import('./vault-crypto');
    return await decryptData(text.slice(ENC_PREFIX.length), key);
  } catch {
    return text;
  }
}

export interface BiasPatternSignal {
  type: 'bias_pattern';
  active: boolean;
  dominantBias: string | null;
  biasFrequency: Record<string, number>;
  avgRiskScore: number;
  riskTrend: 'increasing' | 'decreasing' | 'stable' | 'insufficient_data';
  totalAudits: number;
  summary: string;
}

export interface NarrativeDriftSignal {
  type: 'narrative_drift';
  active: boolean;
  driftDetected: boolean;
  currentThemes: string[];
  historicalThemes: string[];
  contradictions: string[];
  summary: string;
}

export interface AssumptionKillSignal {
  type: 'assumption_kill';
  active: boolean;
  criticalAssumptions: string[];
  summary: string;
}

export interface VolatilitySimSignal {
  type: 'volatility_sim';
  active: boolean;
  stressQuestions: string[];
  summary: string;
}

export interface EmotionalSpikeSignal {
  type: 'emotional_spike';
  active: boolean;
  spikeDetected: boolean;
  highConfidenceCount: number;
  recentEntryCount: number;
  flaggedPhrases: string[];
  summary: string;
}

export interface IntelligenceBrief {
  generatedAt: string;
  biasPattern: BiasPatternSignal;
  narrativeDrift: NarrativeDriftSignal;
  assumptionKill: AssumptionKillSignal;
  volatilitySim: VolatilitySimSignal;
  emotionalSpike: EmotionalSpikeSignal;
  activeSignals: number;
}

const HIGH_CONFIDENCE_MARKERS = [
  'obviously', 'clearly', 'definitely', 'guaranteed', 'certain', 'no doubt',
  'slam dunk', 'can\'t lose', 'easy money', 'sure thing', 'no-brainer',
  'moon', 'rocket', 'massive', 'incredible', 'insane', 'huge opportunity',
  'everyone knows', 'trust me', '100%', 'zero risk', 'impossible to fail',
  'once in a lifetime', 'generational', 'this is it', 'all in',
  'unstoppable', 'inevitable', 'dominate', 'crushing it',
];

const FOMO_MARKERS = [
  'missing out', 'last chance', 'before it\'s too late', 'running out of time',
  'everyone is', 'don\'t want to miss', 'fomo', 'left behind',
  'window closing', 'now or never', 'can\'t wait', 'urgently',
];

function extractKeyThemes(text: string): string[] {
  const lower = text.toLowerCase();
  const themes: string[] = [];
  const themePatterns: [string, RegExp][] = [
    ['revenue growth', /revenue|growth|mrr|arr|sales/],
    ['fundraising', /fundrais|raise|investors?|vc|seed|series/],
    ['product market fit', /product.?market|pmf|market fit/],
    ['team building', /hiring|team|recruit|talent/],
    ['market expansion', /market|expand|scale|international/],
    ['cost reduction', /cost|burn|runway|efficiency|cut/],
    ['partnerships', /partner|collab|alliance|integrat/],
    ['competition', /compet|rival|market share|moat/],
    ['technology', /tech|platform|infrastructure|stack/],
    ['regulation', /regulat|compliance|legal|policy/],
    ['crypto/web3', /crypto|blockchain|web3|defi|dao|token/],
    ['AI/ML', /\bai\b|machine learn|model|inference|llm/],
    ['user acquisition', /user|acquisition|customer|retention|churn/],
    ['pricing strategy', /pricing|monetiz|subscription|freemium/],
    ['risk management', /risk|hedge|diversif|exposure/],
  ];

  for (const [theme, pattern] of themePatterns) {
    if (pattern.test(lower)) {
      themes.push(theme);
    }
  }
  return themes;
}

function extractAssumptions(text: string): string[] {
  const sentences = text.split(/[.!?\n]+/).map(s => s.trim()).filter(s => s.length > 15);
  const assumptions: string[] = [];
  const assumptionMarkers = [
    /\bassum/i, /\bexpect/i, /\bshould\b/i, /\bwill\b/i,
    /\bif\s+we/i, /\bbased on/i, /\bbelieve/i, /\bproject/i,
    /\bestimate/i, /\bforecast/i, /\bpredict/i, /\bhypothes/i,
    /\bcount on/i, /\brely on/i, /\bbetting on/i, /\bbank on/i,
  ];

  for (const sentence of sentences) {
    if (assumptionMarkers.some(marker => marker.test(sentence))) {
      const cleaned = sentence.length > 120 ? sentence.slice(0, 117) + '...' : sentence;
      assumptions.push(cleaned);
      if (assumptions.length >= 5) break;
    }
  }
  return assumptions;
}

function generateStressQuestions(text: string, themes: string[]): string[] {
  const questions: string[] = [];
  const lower = text.toLowerCase();

  if (themes.includes('revenue growth') || /revenue|growth/i.test(lower)) {
    questions.push('If revenue drops 40% in 6 months, does this strategy survive?');
  }
  if (themes.includes('fundraising') || /raise|investor/i.test(lower)) {
    questions.push('If this round fails to close, what is the fallback plan?');
  }
  if (themes.includes('user acquisition') || /user|customer/i.test(lower)) {
    questions.push('If customer acquisition cost doubles, is unit economics still viable?');
  }
  if (themes.includes('partnerships') || /partner/i.test(lower)) {
    questions.push('If the key partnership dissolves, can this stand alone?');
  }
  if (themes.includes('crypto/web3') || /token|crypto/i.test(lower)) {
    questions.push('If token price drops 80%, does the protocol still function?');
  }
  if (themes.includes('AI/ML') || /\bai\b|model/i.test(lower)) {
    questions.push('If the underlying AI model is deprecated or restricted, what is Plan B?');
  }
  if (themes.includes('competition') || /compet|moat/i.test(lower)) {
    questions.push('If a well-funded competitor launches an identical product tomorrow, what is your defensible advantage?');
  }
  if (themes.includes('team building') || /team|hiring/i.test(lower)) {
    questions.push('If your top 2 contributors leave in the next quarter, can operations continue?');
  }

  if (questions.length === 0) {
    questions.push('If your core assumption fails, does the entire strategy collapse or is there a degraded-but-viable path?');
    questions.push('What would need to be true for this to fail catastrophically?');
  }

  return questions.slice(0, 4);
}

function countEmotionalMarkers(text: string): { highConfidence: number; fomo: number; flagged: string[] } {
  const lower = text.toLowerCase();
  let highConfidence = 0;
  let fomo = 0;
  const flagged: string[] = [];

  for (const marker of HIGH_CONFIDENCE_MARKERS) {
    if (lower.includes(marker)) {
      highConfidence++;
      flagged.push(marker);
    }
  }
  for (const marker of FOMO_MARKERS) {
    if (lower.includes(marker)) {
      fomo++;
      flagged.push(marker);
    }
  }

  return { highConfidence, fomo, flagged: [...new Set(flagged)].slice(0, 6) };
}

async function analyzeBiasPattern(audits: AuditRecord[]): Promise<BiasPatternSignal> {
  if (audits.length === 0) {
    return {
      type: 'bias_pattern',
      active: false,
      dominantBias: null,
      biasFrequency: {},
      avgRiskScore: 0,
      riskTrend: 'insufficient_data',
      totalAudits: 0,
      summary: 'No audit history. Deploy your first audit to start building pattern memory.',
    };
  }

  const biasFrequency: Record<string, number> = {};
  let totalRisk = 0;

  for (const audit of audits) {
    const bias = audit.primary_bias_detected;
    if (bias && bias !== 'None') {
      biasFrequency[bias] = (biasFrequency[bias] || 0) + 1;
    }
    totalRisk += audit.risk_score;
  }

  const avgRiskScore = Math.round(totalRisk / audits.length);
  const dominantBias = Object.entries(biasFrequency).sort((a, b) => b[1] - a[1])[0]?.[0] || null;

  let riskTrend: BiasPatternSignal['riskTrend'] = 'insufficient_data';
  if (audits.length >= 3) {
    const sorted = [...audits].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    const recentHalf = sorted.slice(Math.floor(sorted.length / 2));
    const olderHalf = sorted.slice(0, Math.floor(sorted.length / 2));
    const recentAvg = recentHalf.reduce((s, a) => s + a.risk_score, 0) / recentHalf.length;
    const olderAvg = olderHalf.reduce((s, a) => s + a.risk_score, 0) / olderHalf.length;
    const diff = recentAvg - olderAvg;
    riskTrend = diff > 5 ? 'increasing' : diff < -5 ? 'decreasing' : 'stable';
  }

  const biasLabel = dominantBias?.replace(/_/g, ' ') || 'None';
  const biasCount = dominantBias ? biasFrequency[dominantBias] : 0;
  const trendLabel = riskTrend === 'increasing' ? 'trending upward' : riskTrend === 'decreasing' ? 'trending downward' : 'holding stable';

  let summary: string;
  if (dominantBias) {
    summary = `Across ${audits.length} audits, ${biasLabel} detected ${biasCount} times (${Math.round(biasCount / audits.length * 100)}%). Avg risk score: ${avgRiskScore}/100, ${trendLabel}.`;
  } else {
    summary = `${audits.length} audits logged. No dominant bias pattern. Avg risk score: ${avgRiskScore}/100, ${trendLabel}.`;
  }

  return {
    type: 'bias_pattern',
    active: audits.length >= 1,
    dominantBias,
    biasFrequency,
    avgRiskScore,
    riskTrend,
    totalAudits: audits.length,
    summary,
  };
}

async function analyzeNarrativeDrift(
  currentMemo: string,
  entries: VaultEntry[],
  pins: MemoryPin[],
  decisions: DecisionLog[]
): Promise<NarrativeDriftSignal> {
  const currentThemes = extractKeyThemes(currentMemo);

  const historicalTexts: string[] = [];
  for (const e of entries.slice(0, 20)) {
    historicalTexts.push(await decryptField(e.text));
  }
  for (const p of pins) {
    historicalTexts.push(p.content);
  }
  for (const d of decisions.slice(0, 10)) {
    historicalTexts.push(d.context + ' ' + d.reasoning);
  }

  const combined = historicalTexts.join(' ');
  const historicalThemes = extractKeyThemes(combined);

  const contradictions: string[] = [];
  const currentLower = currentMemo.toLowerCase();

  if (historicalThemes.includes('cost reduction') && currentThemes.includes('market expansion')) {
    contradictions.push('Historical focus on cost reduction contradicts current expansion thesis.');
  }
  if (historicalThemes.includes('risk management') && (currentLower.includes('all in') || currentLower.includes('aggressive'))) {
    contradictions.push('Previous caution-focused entries conflict with aggressive positioning in this memo.');
  }

  for (const pin of pins) {
    const pinLower = pin.content.toLowerCase();
    if (pinLower.includes('avoid') || pinLower.includes('never') || pinLower.includes('stop')) {
      const avoidTerms = pinLower.match(/(?:avoid|never|stop)\s+(\w+(?:\s+\w+)?)/i);
      if (avoidTerms && currentLower.includes(avoidTerms[1])) {
        contradictions.push(`This memo references "${avoidTerms[1]}" which conflicts with your pinned memory: "${pin.content.slice(0, 80)}..."`);
      }
    }
  }

  const driftDetected = contradictions.length > 0 || 
    (historicalThemes.length > 0 && currentThemes.length > 0 && 
     currentThemes.filter(t => !historicalThemes.includes(t)).length > currentThemes.length / 2);

  let summary: string;
  if (historicalTexts.length === 0) {
    summary = 'No historical entries to compare against. Keep building your audit trail.';
  } else if (contradictions.length > 0) {
    summary = `${contradictions.length} narrative conflict${contradictions.length > 1 ? 's' : ''} detected against your historical thinking.`;
  } else if (driftDetected) {
    summary = 'This memo introduces themes not present in your historical record. Possible strategic pivot — verify intentional.';
  } else {
    summary = 'Current memo aligns with historical themes. No drift detected.';
  }

  return {
    type: 'narrative_drift',
    active: historicalTexts.length > 0,
    driftDetected,
    currentThemes,
    historicalThemes: [...new Set(historicalThemes)],
    contradictions,
    summary,
  };
}

function analyzeAssumptions(currentMemo: string): AssumptionKillSignal {
  const assumptions = extractAssumptions(currentMemo);
  
  let summary: string;
  if (assumptions.length === 0) {
    summary = 'No explicit assumptions detected in this memo. Consider: what must be true for this to work?';
  } else {
    summary = `${assumptions.length} assumption${assumptions.length > 1 ? 's' : ''} identified. If any of these fail, evaluate whether the strategy collapses or degrades gracefully.`;
  }

  return {
    type: 'assumption_kill',
    active: assumptions.length > 0,
    criticalAssumptions: assumptions,
    summary,
  };
}

function analyzeVolatility(currentMemo: string, currentThemes: string[]): VolatilitySimSignal {
  const questions = generateStressQuestions(currentMemo, currentThemes);

  return {
    type: 'volatility_sim',
    active: true,
    stressQuestions: questions,
    summary: `${questions.length} stress scenario${questions.length !== 1 ? 's' : ''} generated. Run each mentally: does the strategy survive?`,
  };
}

async function analyzeEmotionalSpikes(
  currentMemo: string,
  recentEntries: VaultEntry[]
): Promise<EmotionalSpikeSignal> {
  const currentMarkers = countEmotionalMarkers(currentMemo);

  let recentHighConfidence = 0;
  for (const entry of recentEntries.slice(0, 5)) {
    const text = await decryptField(entry.text);
    const markers = countEmotionalMarkers(text);
    if (markers.highConfidence >= 2 || markers.fomo >= 1) {
      recentHighConfidence++;
    }
  }

  const spikeDetected = currentMarkers.highConfidence >= 2 || currentMarkers.fomo >= 1 || recentHighConfidence >= 2;

  let summary: string;
  if (recentEntries.length === 0) {
    if (currentMarkers.highConfidence >= 2 || currentMarkers.fomo >= 1) {
      summary = `High-confidence language detected in this memo (${currentMarkers.flagged.join(', ')}). No historical baseline yet.`;
    } else {
      summary = 'No emotional spikes detected. Baseline language appears measured.';
    }
  } else if (spikeDetected) {
    const parts: string[] = [];
    if (currentMarkers.highConfidence >= 2) parts.push(`${currentMarkers.highConfidence} high-confidence markers in this memo`);
    if (currentMarkers.fomo >= 1) parts.push(`FOMO language detected`);
    if (recentHighConfidence >= 2) parts.push(`${recentHighConfidence} of your last ${Math.min(5, recentEntries.length)} entries also showed elevated confidence`);
    summary = parts.join('. ') + '. Decisions made during confidence spikes historically carry higher risk.';
  } else {
    summary = 'No emotional spikes detected. Language appears measured and deliberate.';
  }

  return {
    type: 'emotional_spike',
    active: true,
    spikeDetected,
    highConfidenceCount: currentMarkers.highConfidence,
    recentEntryCount: recentEntries.length,
    flaggedPhrases: currentMarkers.flagged,
    summary,
  };
}

export async function generateIntelligenceBrief(currentMemo: string): Promise<IntelligenceBrief> {
  const [audits, entries, pins, decisions] = await Promise.all([
    vault.auditRecords.orderBy('timestamp').reverse().limit(50).toArray(),
    vault.entries.orderBy('createdAt').reverse().limit(20).toArray(),
    vault.memoryPins.where('isActive').equals(1).toArray(),
    vault.decisionLogs.orderBy('createdAt').reverse().limit(10).toArray(),
  ]);

  for (const p of pins) {
    p.content = await decryptField(p.content);
  }

  const [biasPattern, narrativeDrift, emotionalSpike] = await Promise.all([
    analyzeBiasPattern(audits),
    analyzeNarrativeDrift(currentMemo, entries, pins, decisions),
    analyzeEmotionalSpikes(currentMemo, entries),
  ]);

  const assumptionKill = analyzeAssumptions(currentMemo);
  const volatilitySim = analyzeVolatility(currentMemo, narrativeDrift.currentThemes);

  const activeSignals = [biasPattern, narrativeDrift, assumptionKill, volatilitySim, emotionalSpike]
    .filter(s => {
      if (s.type === 'bias_pattern') return (s as BiasPatternSignal).dominantBias !== null;
      if (s.type === 'narrative_drift') return (s as NarrativeDriftSignal).driftDetected;
      if (s.type === 'assumption_kill') return (s as AssumptionKillSignal).criticalAssumptions.length > 0;
      if (s.type === 'volatility_sim') return true;
      if (s.type === 'emotional_spike') return (s as EmotionalSpikeSignal).spikeDetected;
      return false;
    }).length;

  return {
    generatedAt: new Date().toISOString(),
    biasPattern,
    narrativeDrift,
    assumptionKill,
    volatilitySim,
    emotionalSpike,
    activeSignals,
  };
}

export function buildIntelligenceContext(brief: IntelligenceBrief): string {
  const sections: string[] = [];

  sections.push('--- FOUNDER INTELLIGENCE BRIEF (Pre-Flight Vault Scan) ---');

  if (brief.biasPattern.active && brief.biasPattern.dominantBias) {
    sections.push(`\nBIAS PATTERN MEMORY: ${brief.biasPattern.summary}`);
    sections.push(`Dominant bias: ${brief.biasPattern.dominantBias.replace(/_/g, ' ')} | Avg risk: ${brief.biasPattern.avgRiskScore}/100 | Trend: ${brief.biasPattern.riskTrend}`);
  }

  if (brief.narrativeDrift.active && brief.narrativeDrift.driftDetected) {
    sections.push(`\nNARRATIVE DRIFT: ${brief.narrativeDrift.summary}`);
    for (const c of brief.narrativeDrift.contradictions) {
      sections.push(`  ⚠ ${c}`);
    }
  }

  if (brief.assumptionKill.criticalAssumptions.length > 0) {
    sections.push(`\nASSUMPTION KILL SWITCH: ${brief.assumptionKill.summary}`);
    for (const a of brief.assumptionKill.criticalAssumptions) {
      sections.push(`  → ${a}`);
    }
  }

  if (brief.volatilitySim.stressQuestions.length > 0) {
    sections.push(`\nVOLATILITY SIMULATION PROMPTS:`);
    for (const q of brief.volatilitySim.stressQuestions) {
      sections.push(`  ? ${q}`);
    }
  }

  if (brief.emotionalSpike.spikeDetected) {
    sections.push(`\nEMOTIONAL SPIKE FLAG: ${brief.emotionalSpike.summary}`);
    if (brief.emotionalSpike.flaggedPhrases.length > 0) {
      sections.push(`  Flagged language: ${brief.emotionalSpike.flaggedPhrases.join(', ')}`);
    }
  }

  sections.push('\n--- END INTELLIGENCE BRIEF ---');

  return sections.join('\n');
}
