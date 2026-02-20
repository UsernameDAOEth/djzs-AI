import { z } from "zod";

const HIGH_CONFIDENCE_MARKERS = [
  'obviously', 'clearly', 'definitely', 'guaranteed', 'certain', 'no doubt',
  'slam dunk', "can't lose", 'easy money', 'sure thing', 'no-brainer',
  'moon', 'rocket', 'massive', 'incredible', 'insane', 'huge opportunity',
  'everyone knows', 'trust me', '100%', 'zero risk', 'impossible to fail',
  'once in a lifetime', 'generational', 'this is it', 'all in',
  'unstoppable', 'inevitable', 'dominate', 'crushing it',
];

const FOMO_MARKERS = [
  'missing out', 'last chance', "before it's too late", 'running out of time',
  'everyone is', "don't want to miss", 'fomo', 'left behind',
  'window closing', 'now or never', "can't wait", 'urgently',
];

const THEME_PATTERNS: [string, RegExp][] = [
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

export const historicalAuditSchema = z.object({
  risk_score: z.number().min(0).max(100),
  primary_bias_detected: z.string(),
  timestamp: z.string(),
});

export const historicalEntrySchema = z.object({
  text: z.string(),
  created_at: z.string().optional(),
});

export const historicalPinSchema = z.object({
  content: z.string(),
  is_active: z.boolean().default(true),
});

export const historicalDecisionSchema = z.object({
  context: z.string(),
  reasoning: z.string(),
});

export const intelligenceRequestSchema = z.object({
  current_memo: z.string().min(20, "Current memo must be at least 20 characters"),
  history: z.object({
    audits: z.array(historicalAuditSchema).max(50).default([]),
    entries: z.array(historicalEntrySchema).max(20).default([]),
    memory_pins: z.array(historicalPinSchema).max(20).default([]),
    decisions: z.array(historicalDecisionSchema).max(10).default([]),
  }).default({}),
});

export type IntelligenceRequest = z.infer<typeof intelligenceRequestSchema>;

export interface BiasPatternSignal {
  type: 'bias_pattern';
  active: boolean;
  dominant_bias: string | null;
  bias_frequency: Record<string, number>;
  avg_risk_score: number;
  risk_trend: 'increasing' | 'decreasing' | 'stable' | 'insufficient_data';
  total_audits: number;
  summary: string;
}

export interface NarrativeDriftSignal {
  type: 'narrative_drift';
  active: boolean;
  drift_detected: boolean;
  current_themes: string[];
  historical_themes: string[];
  contradictions: string[];
  summary: string;
}

export interface AssumptionKillSignal {
  type: 'assumption_kill';
  active: boolean;
  critical_assumptions: string[];
  summary: string;
}

export interface VolatilitySimSignal {
  type: 'volatility_sim';
  active: boolean;
  stress_questions: string[];
  summary: string;
}

export interface EmotionalSpikeSignal {
  type: 'emotional_spike';
  active: boolean;
  spike_detected: boolean;
  high_confidence_count: number;
  recent_entry_count: number;
  flagged_phrases: string[];
  summary: string;
}

export interface ServerIntelligenceBrief {
  generated_at: string;
  bias_pattern: BiasPatternSignal;
  narrative_drift: NarrativeDriftSignal;
  assumption_kill: AssumptionKillSignal;
  volatility_sim: VolatilitySimSignal;
  emotional_spike: EmotionalSpikeSignal;
  active_signals: number;
  intelligence_context: string;
}

function extractKeyThemes(text: string): string[] {
  const lower = text.toLowerCase();
  const themes: string[] = [];
  for (const [theme, pattern] of THEME_PATTERNS) {
    if (pattern.test(lower)) themes.push(theme);
  }
  return themes;
}

function extractAssumptions(text: string): string[] {
  const sentences = text.split(/[.!?\n]+/).map(s => s.trim()).filter(s => s.length > 15);
  const assumptions: string[] = [];
  const markers = [
    /\bassum/i, /\bexpect/i, /\bshould\b/i, /\bwill\b/i,
    /\bif\s+we/i, /\bbased on/i, /\bbelieve/i, /\bproject/i,
    /\bestimate/i, /\bforecast/i, /\bpredict/i, /\bhypothes/i,
    /\bcount on/i, /\brely on/i, /\bbetting on/i, /\bbank on/i,
  ];
  for (const sentence of sentences) {
    if (markers.some(m => m.test(sentence))) {
      assumptions.push(sentence.length > 120 ? sentence.slice(0, 117) + '...' : sentence);
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
    if (lower.includes(marker)) { highConfidence++; flagged.push(marker); }
  }
  for (const marker of FOMO_MARKERS) {
    if (lower.includes(marker)) { fomo++; flagged.push(marker); }
  }
  return { highConfidence, fomo, flagged: [...new Set(flagged)].slice(0, 6) };
}

function analyzeBiasPattern(audits: IntelligenceRequest['history']['audits']): BiasPatternSignal {
  if (audits.length === 0) {
    return {
      type: 'bias_pattern', active: false, dominant_bias: null,
      bias_frequency: {}, avg_risk_score: 0, risk_trend: 'insufficient_data',
      total_audits: 0, summary: 'No audit history provided. Submit past audit results to enable bias pattern detection.',
    };
  }
  const biasFrequency: Record<string, number> = {};
  let totalRisk = 0;
  for (const audit of audits) {
    const bias = audit.primary_bias_detected;
    if (bias && bias !== 'None') biasFrequency[bias] = (biasFrequency[bias] || 0) + 1;
    totalRisk += audit.risk_score;
  }
  const avgRiskScore = Math.round(totalRisk / audits.length);
  const dominantBias = Object.entries(biasFrequency).sort((a, b) => b[1] - a[1])[0]?.[0] || null;
  let riskTrend: BiasPatternSignal['risk_trend'] = 'insufficient_data';
  if (audits.length >= 3) {
    const sorted = [...audits].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    const mid = Math.floor(sorted.length / 2);
    const recentAvg = sorted.slice(mid).reduce((s, a) => s + a.risk_score, 0) / sorted.slice(mid).length;
    const olderAvg = sorted.slice(0, mid).reduce((s, a) => s + a.risk_score, 0) / sorted.slice(0, mid).length;
    const diff = recentAvg - olderAvg;
    riskTrend = diff > 5 ? 'increasing' : diff < -5 ? 'decreasing' : 'stable';
  }
  const biasLabel = dominantBias?.replace(/_/g, ' ') || 'None';
  const biasCount = dominantBias ? biasFrequency[dominantBias] : 0;
  const trendLabel = riskTrend === 'increasing' ? 'trending upward' : riskTrend === 'decreasing' ? 'trending downward' : 'holding stable';
  const summary = dominantBias
    ? `Across ${audits.length} audits, ${biasLabel} detected ${biasCount} times (${Math.round(biasCount / audits.length * 100)}%). Avg risk score: ${avgRiskScore}/100, ${trendLabel}.`
    : `${audits.length} audits analyzed. No dominant bias pattern. Avg risk score: ${avgRiskScore}/100, ${trendLabel}.`;
  return { type: 'bias_pattern', active: audits.length >= 1, dominant_bias: dominantBias, bias_frequency: biasFrequency, avg_risk_score: avgRiskScore, risk_trend: riskTrend, total_audits: audits.length, summary };
}

function analyzeNarrativeDrift(
  currentMemo: string,
  entries: IntelligenceRequest['history']['entries'],
  pins: IntelligenceRequest['history']['memory_pins'],
  decisions: IntelligenceRequest['history']['decisions']
): NarrativeDriftSignal {
  const currentThemes = extractKeyThemes(currentMemo);
  const historicalTexts: string[] = [];
  for (const e of entries) historicalTexts.push(e.text);
  for (const p of pins.filter(p => p.is_active)) historicalTexts.push(p.content);
  for (const d of decisions) historicalTexts.push(d.context + ' ' + d.reasoning);
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
  for (const pin of pins.filter(p => p.is_active)) {
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
    summary = 'No historical entries provided. Submit past entries to enable drift detection.';
  } else if (contradictions.length > 0) {
    summary = `${contradictions.length} narrative conflict${contradictions.length > 1 ? 's' : ''} detected against your historical thinking.`;
  } else if (driftDetected) {
    summary = 'This memo introduces themes not present in your historical record. Possible strategic pivot — verify intentional.';
  } else {
    summary = 'Current memo aligns with historical themes. No drift detected.';
  }
  return { type: 'narrative_drift', active: historicalTexts.length > 0, drift_detected: driftDetected, current_themes: currentThemes, historical_themes: [...new Set(historicalThemes)], contradictions, summary };
}

function analyzeAssumptions(currentMemo: string): AssumptionKillSignal {
  const assumptions = extractAssumptions(currentMemo);
  const summary = assumptions.length === 0
    ? 'No explicit assumptions detected in this memo. Consider: what must be true for this to work?'
    : `${assumptions.length} assumption${assumptions.length > 1 ? 's' : ''} identified. If any of these fail, evaluate whether the strategy collapses or degrades gracefully.`;
  return { type: 'assumption_kill', active: assumptions.length > 0, critical_assumptions: assumptions, summary };
}

function analyzeVolatility(currentMemo: string, currentThemes: string[]): VolatilitySimSignal {
  const questions = generateStressQuestions(currentMemo, currentThemes);
  return { type: 'volatility_sim', active: true, stress_questions: questions, summary: `${questions.length} stress scenario${questions.length !== 1 ? 's' : ''} generated. Run each mentally: does the strategy survive?` };
}

function analyzeEmotionalSpikes(
  currentMemo: string,
  recentEntries: IntelligenceRequest['history']['entries']
): EmotionalSpikeSignal {
  const currentMarkers = countEmotionalMarkers(currentMemo);
  let recentHighConfidence = 0;
  for (const entry of recentEntries.slice(0, 5)) {
    const markers = countEmotionalMarkers(entry.text);
    if (markers.highConfidence >= 2 || markers.fomo >= 1) recentHighConfidence++;
  }
  const spikeDetected = currentMarkers.highConfidence >= 2 || currentMarkers.fomo >= 1 || recentHighConfidence >= 2;
  let summary: string;
  if (recentEntries.length === 0) {
    summary = currentMarkers.highConfidence >= 2 || currentMarkers.fomo >= 1
      ? `High-confidence language detected in this memo (${currentMarkers.flagged.join(', ')}). No historical baseline provided.`
      : 'No emotional spikes detected. Baseline language appears measured.';
  } else if (spikeDetected) {
    const parts: string[] = [];
    if (currentMarkers.highConfidence >= 2) parts.push(`${currentMarkers.highConfidence} high-confidence markers in this memo`);
    if (currentMarkers.fomo >= 1) parts.push(`FOMO language detected`);
    if (recentHighConfidence >= 2) parts.push(`${recentHighConfidence} of your last ${Math.min(5, recentEntries.length)} entries also showed elevated confidence`);
    summary = parts.join('. ') + '. Decisions made during confidence spikes historically carry higher risk.';
  } else {
    summary = 'No emotional spikes detected. Language appears measured and deliberate.';
  }
  return { type: 'emotional_spike', active: true, spike_detected: spikeDetected, high_confidence_count: currentMarkers.highConfidence, recent_entry_count: recentEntries.length, flagged_phrases: currentMarkers.flagged, summary };
}

function buildIntelligenceContext(brief: Omit<ServerIntelligenceBrief, 'intelligence_context'>): string {
  const sections: string[] = [];
  sections.push('--- FOUNDER INTELLIGENCE BRIEF (Server-Side Analysis) ---');
  if (brief.bias_pattern.active && brief.bias_pattern.dominant_bias) {
    sections.push(`\nBIAS PATTERN MEMORY: ${brief.bias_pattern.summary}`);
    sections.push(`Dominant bias: ${brief.bias_pattern.dominant_bias.replace(/_/g, ' ')} | Avg risk: ${brief.bias_pattern.avg_risk_score}/100 | Trend: ${brief.bias_pattern.risk_trend}`);
  }
  if (brief.narrative_drift.active && brief.narrative_drift.drift_detected) {
    sections.push(`\nNARRATIVE DRIFT: ${brief.narrative_drift.summary}`);
    for (const c of brief.narrative_drift.contradictions) sections.push(`  ⚠ ${c}`);
  }
  if (brief.assumption_kill.critical_assumptions.length > 0) {
    sections.push(`\nASSUMPTION KILL SWITCH: ${brief.assumption_kill.summary}`);
    for (const a of brief.assumption_kill.critical_assumptions) sections.push(`  → ${a}`);
  }
  if (brief.volatility_sim.stress_questions.length > 0) {
    sections.push(`\nVOLATILITY SIMULATION PROMPTS:`);
    for (const q of brief.volatility_sim.stress_questions) sections.push(`  ? ${q}`);
  }
  if (brief.emotional_spike.spike_detected) {
    sections.push(`\nEMOTIONAL SPIKE FLAG: ${brief.emotional_spike.summary}`);
    if (brief.emotional_spike.flagged_phrases.length > 0) {
      sections.push(`  Flagged language: ${brief.emotional_spike.flagged_phrases.join(', ')}`);
    }
  }
  sections.push('\n--- END INTELLIGENCE BRIEF ---');
  return sections.join('\n');
}

export function generateServerIntelligenceBrief(input: IntelligenceRequest): ServerIntelligenceBrief {
  const { current_memo, history } = input;
  const biasPattern = analyzeBiasPattern(history.audits);
  const narrativeDrift = analyzeNarrativeDrift(current_memo, history.entries, history.memory_pins, history.decisions);
  const assumptionKill = analyzeAssumptions(current_memo);
  const volatilitySim = analyzeVolatility(current_memo, narrativeDrift.current_themes);
  const emotionalSpike = analyzeEmotionalSpikes(current_memo, history.entries);

  const activeSignals = [biasPattern, narrativeDrift, assumptionKill, volatilitySim, emotionalSpike]
    .filter(s => {
      if (s.type === 'bias_pattern') return (s as BiasPatternSignal).dominant_bias !== null;
      if (s.type === 'narrative_drift') return (s as NarrativeDriftSignal).drift_detected;
      if (s.type === 'assumption_kill') return (s as AssumptionKillSignal).critical_assumptions.length > 0;
      if (s.type === 'volatility_sim') return true;
      if (s.type === 'emotional_spike') return (s as EmotionalSpikeSignal).spike_detected;
      return false;
    }).length;

  const partial = {
    generated_at: new Date().toISOString(),
    bias_pattern: biasPattern,
    narrative_drift: narrativeDrift,
    assumption_kill: assumptionKill,
    volatility_sim: volatilitySim,
    emotional_spike: emotionalSpike,
    active_signals: activeSignals,
  };

  return {
    ...partial,
    intelligence_context: buildIntelligenceContext(partial),
  };
}
