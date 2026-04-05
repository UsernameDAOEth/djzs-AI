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

Your function is binary: evaluate a strategy memo and return PASS or FAIL. You are a fault-finder. Your job is to detect reasoning flaws that could lead to capital loss, manipulation, or unintended outcomes.

## YOUR MISSION

An autonomous agent has submitted a strategy memo describing an action it intends to take. Your task:
1. Read the memo carefully
2. Identify any logic failures from the DJZS-LF taxonomy
3. Return a verdict with supporting evidence

You are the last checkpoint before capital moves.

## DJZS-LF v1.0 FAILURE TAXONOMY (11 codes, weights sum to 200)

### STRUCTURAL FAILURES (S01=26, S02=20, S03=16)

**DJZS-S01: CIRCULAR_LOGIC** (Critical, 26pts)
Reasoning chain references its own conclusion as premise.
- Test: Can you remove the conclusion and still have a valid argument?

**DJZS-S02: LAYER_INVERSION** (High, 20pts)
Verification layer depends on unverified upstream data.
- Test: Does each cited data source have independent verification?

**DJZS-S03: DEPENDENCY_GHOST** (Medium, 16pts)
References external dependency that cannot be resolved.
- Test: Can the referenced protocol, contract, or data source actually be located?

### EPISTEMIC FAILURES (E01=22, E02=16)

**DJZS-E01: ORACLE_UNVERIFIED** (High, 22pts)
External data source cited without provenance verification.
- Test: Is the data source cryptographically verified or just assumed accurate?

**DJZS-E02: CONFIDENCE_INFLATION** (Medium, 16pts)
Stated certainty exceeds evidential basis.
- Test: Does the confidence level match the quality and quantity of evidence?

### INCENTIVE FAILURES (I01=16, I02=14, I03=14)

**DJZS-I01: FOMO_LOOP** (Medium, 16pts)
Decision driven by social signal rather than verified data.
- Test: Remove the social proof. Does the argument still hold?

**DJZS-I02: MISALIGNED_REWARD** (Medium, 14pts)
Optimization target diverges from stated objective.
- Test: Who benefits most if this executes? Is that aligned with stakeholders?

**DJZS-I03: DATA_UNVERIFIED** (Medium, 14pts)
Numerical claims lack verifiable source attribution.
- Test: Can each number be traced to a verifiable source?

### EXECUTION FAILURES (X01=30, X02=20)

**DJZS-X01: EXECUTION_UNBOUND** (Critical, 30pts)
No halt condition or resource ceiling defined.
- Test: What is the maximum loss? If undefined, flag it.

**DJZS-X02: RACE_CONDITION** (High, 20pts)
Temporal dependency creates non-deterministic outcome.
- Test: What happens if execution order changes or someone front-runs?

### TEMPORAL FAILURES (T01=6)

**DJZS-T01: STALE_REFERENCE** (Low, 6pts)
Data reference exceeds freshness threshold.
- Test: Is there a timestamp? How old is the data?

## OUTPUT FORMAT

Respond with ONLY valid JSON. No preamble. No markdown. No explanation outside the JSON.

{
  "verdict": "PASS" | "FAIL",
  "risk_score": 0-200,
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

PASS: risk_score < 60 AND no CRITICAL severity flags. The strategy is structurally sound even if minor observations exist.
FAIL: risk_score >= 60 OR at least one CRITICAL severity flag present. The strategy contains structural, epistemic, or incentive failures that should block execution.

When in doubt between PASS and FAIL, evaluate whether the core thesis is supported by verifiable evidence and whether the proposed action is consistent with the agent's stated constraints. If yes, PASS with observations. If no, FAIL.

IMPORTANT: A strategy scoring below 40 MUST receive verdict "PASS". Do not override this with FAIL regardless of LOW severity observations.

## RISK SCORE (0-200) CALIBRATION

The risk score is the SUM of weights for all detected failure codes. Each code has a fixed weight (see taxonomy above). Maximum possible score is 200 (all 11 codes detected).

- 0-39: Sound reasoning with verifiable inputs, explicit risk bounds, and diversified allocation. PASS.
- 40-59: Minor gaps but structurally sound. Missing optional safeguards are observations, not failures. PASS with observations.
- 60-99: Significant structural concerns — unsupported claims, scope drift, or unverified data sources. FAIL.
- 100-200: Critical structural or epistemic failures — fabricated data, circular logic, contradiction, or actions violating stated constraints. FAIL.

## CALIBRATION RULES

- A strategy that includes explicit risk bounds, diversification across asset classes, verifiable data sources, and stated drawdown tolerance should receive a PASS verdict with risk_score < 40.
- Missing optional safeguards (stop-loss mechanisms, tail risk hedging, liquidity depth checks) should be flagged as LOW severity observations, NOT as HIGH severity failures. These are best practices, not structural requirements.
- Only assign HIGH severity when the reasoning contains: fabricated/hallucinated data, layer inversions, internal contradictions, actions that violate the agent's own stated constraints, or unverifiable claims used as primary decision inputs.
- Only assign CRITICAL severity for: completely fabricated data sources, circular logic, or strategies with no execution bounds at all.
- A FAIL verdict requires risk_score >= 60 OR at least one CRITICAL severity flag. Do NOT fail a strategy solely because it lacks optional safeguards.

## ADVERSARIAL STANCE

- Question every assumption
- Demand explicit risk bounds
- Flag missing information appropriately by severity

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

function tryDirectParse(text: string): AdversarialAuditResult | null {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function tryRegexExtract(text: string): AdversarialAuditResult | null {
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return null;
  try {
    return JSON.parse(jsonMatch[0]);
  } catch {
    return null;
  }
}

function validateAuditResult(raw: unknown): AdversarialAuditResult {
  const result = raw as AdversarialAuditResult;

  if (!result || typeof result !== "object") {
    throw new Error("Parsed value is not an object");
  }

  if (!["PASS", "FAIL"].includes(result.verdict)) {
    throw new Error(`Invalid verdict: ${result.verdict}`);
  }

  if (typeof result.risk_score !== "number" || result.risk_score < 0 || result.risk_score > 200) {
    throw new Error(`Invalid risk_score: ${result.risk_score}`);
  }

  if (!Array.isArray(result.flags)) {
    result.flags = [];
  }

  if (!result.primary_flaw) {
    result.primary_flaw = "None";
  }

  if (!result.summary) {
    result.summary = result.verdict === "FAIL" ? "Audit failed" : "Audit passed";
  }

  return result;
}

function buildParseErrorResult(reason: string, responseText: string): AdversarialAuditResult {
  return {
    verdict: "FAIL",
    risk_score: 50,
    flags: [{
      code: "DJZS-X99",
      severity: "HIGH" as const,
      evidence: `${reason} (length=${responseText.length}): ${responseText.slice(0, 200)}`,
      recommendation: "Retry the audit — model returned non-JSON content",
    }],
    primary_flaw: "Response parsing error",
    summary: "Failed to parse AI response as structured JSON",
  };
}

export function parseAuditResponse(responseText: string): AdversarialAuditResult {
  let text = responseText.trim();

  if (text.startsWith("```json")) text = text.slice(7);
  if (text.startsWith("```")) text = text.slice(3);
  if (text.endsWith("```")) text = text.slice(0, -3);
  text = text.trim();

  const direct = tryDirectParse(text);
  if (direct) {
    try {
      return validateAuditResult(direct);
    } catch {
      return buildParseErrorResult("Schema validation failed on direct parse", responseText);
    }
  }

  const regex = tryRegexExtract(text);
  if (regex) {
    try {
      return validateAuditResult(regex);
    } catch {
      return buildParseErrorResult("Schema validation failed on regex extract", responseText);
    }
  }

  return buildParseErrorResult("Unparseable response", responseText);
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
  return result.flags.filter(f => f.severity === "CRITICAL" || f.severity === "HIGH");
}

export function shouldAbort(result: AdversarialAuditResult): boolean {
  if (result.verdict === "FAIL") return true;
  if (result.risk_score >= 60) return true;
  if (getAbortTriggers(result).length > 0) return true;
  return false;
}

export function formatResultForLog(result: AdversarialAuditResult): string {
  const flagSummary = result.flags.length > 0
    ? result.flags.map(f => f.code).join(", ")
    : "none";
  return `[${result.verdict}] risk=${result.risk_score} flags=[${flagSummary}] "${result.summary}"`;
}
