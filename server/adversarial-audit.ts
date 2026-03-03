import { keccak256, toBytes } from 'viem';

export interface AuditMessage {
  role: "system" | "user";
  content: string;
}

export interface AdversarialAuditFlag {
  code: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "INFO";
  evidence: string;
  recommendation: string;
}

export interface AdversarialAuditResult {
  verdict: "PASS" | "FAIL";
  risk_score: number;
  flags: AdversarialAuditFlag[];
  primary_flaw: string;
  summary: string;
}

export interface EscrowContext {
  escrow_id: number;
  amount: number;
  tier: string;
  creator?: string;
  recipient?: string;
}

export const ADVERSARIAL_AUDIT_PROMPT = `
You are the DJZS Adversarial Logic Auditor operating inside a Trusted Execution Environment.

Your function is binary: evaluate a strategy memo and return PASS or FAIL. You are not helpful. You are not agreeable. You are a fault-finder. Your job is to detect reasoning flaws that could lead to capital loss, manipulation, or unintended outcomes.

## YOUR MISSION

An autonomous agent has submitted a strategy memo describing an action it intends to take. Your task:
1. Read the memo carefully
2. Identify any logic failures from the DJZS-LF taxonomy
3. Return a verdict with supporting evidence

You are the last checkpoint before capital moves. A false PASS costs money. Err toward FAIL.

## DJZS-LF FAILURE TAXONOMY

### STRUCTURAL FAILURES (Auto-abort)

**DJZS-S01: CIRCULAR_LOGIC**
The conclusion is embedded in the premise. The reasoning justifies itself without external validation.
- Test: Can you remove the conclusion and still have a valid argument?

**DJZS-S02: MISSING_FALSIFIABILITY**
No conditions exist under which the strategy would be considered wrong.
- Test: Ask "What would prove this strategy wrong?" If no answer, flag it.

### EPISTEMIC FAILURES (Auto-abort)

**DJZS-E01: CONFIRMATION_TUNNEL**
Selectively cites evidence supporting conclusion, ignores contradictory data.
- Test: Does the memo acknowledge counterarguments?

**DJZS-E02: AUTHORITY_SUBSTITUTION**
Relies on "X said so" rather than evaluating underlying logic.
- Test: Remove the authority. Does the argument still hold?

### INCENTIVE FAILURES (Review required)

**DJZS-I01: MISALIGNED_INCENTIVE**
Incentives of referenced parties conflict with agent's goals.
- Test: Who benefits if this executes? Is that disclosed?

**DJZS-I02: NARRATIVE_DEPENDENCY**
Success depends on a narrative remaining true, no hedge if it shifts.
- Test: What happens if the narrative changes tomorrow?

### EXECUTION FAILURES

**DJZS-X01: UNHEDGED_EXECUTION** (Critical)
No risk bounds. No stop-loss, no position sizing, no max drawdown.
- Test: What is the maximum loss? If undefined, flag it.

**DJZS-X02: LIQUIDITY_RISK** (High)
Assumes liquidity that may not exist.
- Test: Can this position actually be exited at the stated price?

**DJZS-X03: SLIPPAGE_EXPOSURE** (Medium)
Ignores execution costs.
- Test: Does the math account for realistic execution?

### TEMPORAL FAILURES

**DJZS-T01: STALE_DATA_DEPENDENCY** (High)
Relies on data that may no longer be current.
- Test: Is there a timestamp? How old is the data?

**DJZS-T02: RACE_CONDITION_RISK** (Medium)
Assumes sequential execution but could be front-run.
- Test: What happens if someone sees this and acts first?

## OUTPUT FORMAT

Respond with ONLY valid JSON. No preamble. No markdown. No explanation outside the JSON.

{
  "verdict": "PASS" | "FAIL",
  "risk_score": 0-100,
  "flags": [
    {
      "code": "DJZS-X01",
      "severity": "CRITICAL" | "HIGH" | "MEDIUM" | "LOW",
      "evidence": "Quote from memo proving the flaw",
      "recommendation": "What would fix this"
    }
  ],
  "primary_flaw": "Single most important issue or 'None'",
  "summary": "One sentence verdict explanation"
}

## VERDICT RULES

FAIL if ANY:
- CRITICAL flag detected (S01, S02, X01)
- HIGH flag detected (E01, E02, X02, T01)
- risk_score >= 60
- 3+ flags of any severity

PASS if ALL:
- No CRITICAL/HIGH flags
- risk_score < 60
- <3 total flags
- Explicit success/failure criteria exist
- Defined risk bounds exist

## RISK SCORE

Start at 0. Add:
- CRITICAL: +40
- HIGH: +25
- MEDIUM: +10
- Each additional flag: +5
Cap at 100.

## ADVERSARIAL STANCE

- Assume ambiguity is a flaw
- Flag missing information as MISSING_FALSIFIABILITY
- Question every assumption
- Demand explicit risk bounds
- Do not give benefit of the doubt

You are not the agent's friend. You are the last line of defense.
`.trim();

export function buildAuditMessages(
  strategyMemo: string,
  context?: EscrowContext
): AuditMessage[] {
  let userContent = `<strategy_memo>\n${strategyMemo}\n</strategy_memo>`;

  if (context) {
    userContent += `\n\n<escrow_context>\nescrow_id: ${context.escrow_id}\namount_usdc: ${context.amount}\naudit_tier: ${context.tier}\n</escrow_context>`;
  }

  return [
    { role: "system", content: ADVERSARIAL_AUDIT_PROMPT },
    { role: "user", content: userContent },
  ];
}

export function buildQuickAuditMessages(
  strategyMemo: string
): AuditMessage[] {
  return [
    { role: "system", content: ADVERSARIAL_AUDIT_PROMPT },
    { role: "user", content: `<strategy_memo>\n${strategyMemo}\n</strategy_memo>` },
  ];
}

export function parseAuditResponse(responseText: string): AdversarialAuditResult {
  let text = responseText.trim();

  if (text.startsWith("```json")) text = text.slice(7);
  if (text.startsWith("```")) text = text.slice(3);
  if (text.endsWith("```")) text = text.slice(0, -3);
  text = text.trim();

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    text = jsonMatch[0];
  }

  let result: AdversarialAuditResult;

  try {
    result = JSON.parse(text);
  } catch (e) {
    throw new Error(`Venice returned invalid JSON: ${e}`);
  }

  if (!["PASS", "FAIL"].includes(result.verdict)) {
    throw new Error(`Invalid verdict: ${result.verdict}`);
  }

  if (typeof result.risk_score !== "number" || result.risk_score < 0 || result.risk_score > 100) {
    throw new Error(`Invalid risk_score: ${result.risk_score}`);
  }

  if (!Array.isArray(result.flags)) {
    throw new Error("flags must be an array");
  }

  if (!result.primary_flaw) {
    result.primary_flaw = "None";
  }

  if (!result.summary) {
    result.summary = result.verdict === "FAIL" ? "Audit failed" : "Audit passed";
  }

  return result;
}

export function computeTraceHash(strategyMemo: string): `0x${string}` {
  return keccak256(toBytes(strategyMemo));
}

export function verifyTraceHash(
  strategyMemo: string,
  onChainHash: `0x${string}`
): boolean {
  const computedHash = computeTraceHash(strategyMemo);
  return computedHash.toLowerCase() === onChainHash.toLowerCase();
}

export function mapToLegacyFormat(result: AdversarialAuditResult): {
  primaryBiasDetected: string;
  logicFlaws: string[];
  structuralRecommendations: string[];
} {
  return {
    primaryBiasDetected: result.primary_flaw === "None" ? "None" : result.primary_flaw,
    logicFlaws: result.flags.map(f => `${f.code}: ${f.evidence}`),
    structuralRecommendations: result.flags.map(f => f.recommendation),
  };
}

export function getAbortTriggers(result: AdversarialAuditResult): AdversarialAuditFlag[] {
  const abortCodes = [
    "DJZS-S01", "DJZS-S02", "DJZS-X01",
    "DJZS-E01", "DJZS-E02", "DJZS-X02", "DJZS-T01",
  ];
  return result.flags.filter(f => abortCodes.includes(f.code));
}

export function shouldAbort(result: AdversarialAuditResult): boolean {
  if (result.verdict === "FAIL") return true;
  if (result.risk_score >= 60) return true;
  if (getAbortTriggers(result).length > 0) return true;
  if (result.flags.length >= 3) return true;
  return false;
}

export function formatResultForLog(result: AdversarialAuditResult): string {
  const flagSummary = result.flags.length > 0
    ? result.flags.map(f => f.code).join(", ")
    : "none";
  return `[${result.verdict}] risk=${result.risk_score} flags=[${flagSummary}] "${result.summary}"`;
}
