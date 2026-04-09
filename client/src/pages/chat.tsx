import { useState, useEffect, useRef, useCallback } from "react";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Link } from "wouter";
import { Helmet } from "react-helmet";
import { getVeniceApiKey } from "@/lib/queryClient";
import { LOGIC_FAILURE_TAXONOMY } from "@shared/audit-schema";
import { C, MONO, Nav, GlowDot, TerminalFooter } from "@/lib/terminal-theme";

const DEMO_SCENARIOS = [
  {
    key: "fomo",
    label: "FOMO Momentum Buy",
    description: "Social-driven pump chase with no verified data",
    memo: "Allocate 80% of treasury to $MOONDOGE based on 400% price increase this week and three crypto influencer endorsements on Twitter. No fundamental analysis conducted. No risk limits defined. Expected return: 10x in 14 days. Remaining 20% held in USDC as dry powder for the next momentum play.",
  },
  {
    key: "hallucination",
    label: "Hallucinated Data",
    description: "References a protocol and audit that don't exist",
    memo: "Rebalance treasury into 60% AuroraVault protocol (TVL: $450M, audited by CertiSafe Labs, 12.4% guaranteed APY). Remaining 40% in USDC. Based on the AuroraVault governance report published March 2026 confirming zero exploit history and full insurance coverage via NexusGuard.",
  },
  {
    key: "valid",
    label: "Clean Strategy",
    description: "Well-structured rebalance with verified parameters",
    memo: "Rebalance DAO treasury to 50% USDC (stable reserve), 30% ETH (blue-chip exposure), 20% wstETH via Lido (yield generation at current 3.8% APY per Lido dashboard, verified March 2026). Total volatile exposure: 50%, within protocol-defined 60% ceiling. Max single-asset concentration: 50% (USDC). Drawdown tolerance: 15% on volatile portion. Rebalance trigger: if volatile allocation drifts beyond +/- 5% of target. Data sources: CoinGecko 90-day moving average, Lido staking dashboard, on-chain USDC reserve verification.",
  },
  {
    key: "edge",
    label: "Race Condition Edge Case",
    description: "Reasonable strategy with hidden temporal risk",
    memo: "Execute ETH-to-USDC swap of 200 ETH ($380,000) using current spot price of $1,900 from CoinGecko API. Slippage tolerance: 0.5%. Execute as single market order on Uniswap v3 ETH/USDC pool. No check on pool depth at execution time. No TWAP or order splitting. Treasury policy allows up to $500,000 per transaction.",
  },
];

interface AuditFlag {
  code: string;
  severity: string;
  message: string;
  evidence?: string;
  recommendation?: string;
}

interface AuditResult {
  audit_id: string;
  timestamp: string;
  tier: string;
  verdict: "PASS" | "FAIL";
  risk_score: number;
  primary_bias_detected: string;
  flags: AuditFlag[];
  logic_flaws: { flaw_type: string; severity: string; explanation: string }[];
  structural_recommendations: string[];
  cryptographic_hash: string;
  provenance_provider: string;
  irys_tx_id: string | null;
  irys_url: string | null;
  irys_error?: string;
  trust_score_tx_hash?: string;
  trust_score_error?: string;
}

const PIPELINE_STEPS = [
  { id: "signature", label: "Signature" },
  { id: "hash-check", label: "Hash Check" },
  { id: "auditing", label: "Auditing" },
  { id: "uploading", label: "Irys Upload" },
  { id: "settlement", label: "Settlement" },
  { id: "complete", label: "Complete" },
];

const TIER_OPTIONS = [
  { value: "micro", label: "Micro-Zone", price: "$0.10" },
  { value: "founder", label: "Founder Zone", price: "$1.00" },
  { value: "treasury", label: "Treasury Zone", price: "$10.00" },
];

const SEV_COLORS: Record<string, string> = {
  CRITICAL: C.red,
  HIGH: C.amber,
  MEDIUM: "#eab308",
  LOW: C.green,
};

const CAT_COLORS: Record<string, string> = {
  Structural: C.red,
  Epistemic: "#a78bfa",
  Incentive: C.amber,
  Execution: "#ec4899",
  Temporal: "#06b6d4",
};

function FlagCard({ flag, index }: { flag: AuditFlag; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const taxonomy = LOGIC_FAILURE_TAXONOMY[flag.code as keyof typeof LOGIC_FAILURE_TAXONOMY];
  const sevColor = SEV_COLORS[flag.severity] || C.textDim;

  return (
    <div style={{ background: `${sevColor}14`, borderLeft: `3px solid ${sevColor}`, border: `1px solid ${sevColor}22`, borderRadius: 4, overflow: "hidden" }} data-testid={`card-flag-${flag.code.toLowerCase()}`}>
      <button
        onClick={() => setExpanded(!expanded)}
        style={{ width: "100%", display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", background: "none", border: "none", cursor: "pointer", textAlign: "left" }}
        data-testid={`button-expand-flag-${flag.code.toLowerCase()}`}
      >
        <span style={{ fontFamily: MONO, fontSize: 9, fontWeight: 700, color: sevColor, background: `${sevColor}20`, padding: "2px 6px", borderRadius: 2, flexShrink: 0 }} data-testid={`badge-flag-severity-${index}`}>
          {flag.severity}
        </span>
        <span style={{ fontFamily: MONO, fontSize: 11, fontWeight: 600, color: C.text, flexShrink: 0 }} data-testid={`text-flag-code-${index}`}>{flag.code}</span>
        <span style={{ fontFamily: MONO, fontSize: 10, color: C.textDim, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} data-testid={`text-flag-name-${index}`}>
          {taxonomy?.name || (flag.message || "").split("—")[0]}
        </span>
        {taxonomy && (
          <span style={{ fontFamily: MONO, fontSize: 10, fontWeight: 700, color: sevColor, flexShrink: 0 }} data-testid={`text-flag-weight-${index}`}>+{taxonomy.weight}</span>
        )}
        <svg width="11" height="11" viewBox="0 0 11 11" fill="none" style={{ transform: expanded ? "rotate(180deg)" : "none", transition: "transform 0.15s", flexShrink: 0 }}>
          <path d="M2.75 4.25l2.75 2.75 2.75-2.75" stroke={C.textMuted} strokeWidth="1.4" strokeLinecap="round"/>
        </svg>
      </button>
      {expanded && (
        <div style={{ padding: "0 12px 10px", borderTop: `1px solid ${sevColor}15` }}>
          {taxonomy && (
            <div style={{ paddingTop: 8, display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}>
              <span style={{ fontFamily: MONO, fontSize: 9, color: CAT_COLORS[taxonomy.category] || C.textDim, background: `${CAT_COLORS[taxonomy.category] || C.textMuted}15`, padding: "1px 6px", borderRadius: 2 }} data-testid={`badge-flag-category-${index}`}>
                {taxonomy.category.toUpperCase()}
              </span>
              <span style={{ fontFamily: MONO, fontSize: 9, color: C.textMuted }} data-testid={`text-flag-weight-detail-${index}`}>
                Weight: {taxonomy.weight} / 200
              </span>
            </div>
          )}
          {taxonomy && (
            <p style={{ fontFamily: MONO, fontSize: 11, color: C.textDim, margin: "0 0 6px", lineHeight: 1.5 }} data-testid={`text-flag-description-${index}`}>{taxonomy.description}</p>
          )}
          {flag.evidence && (
            <div style={{ marginBottom: 6 }}>
              <div style={{ fontFamily: MONO, fontSize: 8, color: C.textMuted, letterSpacing: "0.08em", marginBottom: 2 }}>EVIDENCE</div>
              <p style={{ fontFamily: MONO, fontSize: 10, color: C.text, margin: 0, fontStyle: "italic" }}>{flag.evidence}</p>
            </div>
          )}
          {flag.recommendation && (
            <div>
              <div style={{ fontFamily: MONO, fontSize: 8, color: C.textMuted, letterSpacing: "0.08em", marginBottom: 2 }}>RECOMMENDATION</div>
              <p style={{ fontFamily: MONO, fontSize: 10, color: C.green, margin: 0 }}>{flag.recommendation}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function Chat() {
  const { address, isConnected } = useAccount();
  const [memo, setMemo] = useState("");
  const [tier, setTier] = useState("micro");
  const [running, setRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);
  const [result, setResult] = useState<AuditResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const loadScenario = (key: string) => {
    const scenario = DEMO_SCENARIOS.find(s => s.key === key);
    if (!scenario) return;
    abortRef.current?.abort();
    setMemo(scenario.memo);
    setResult(null);
    setError(null);
    setCurrentStep(-1);
    setRunning(false);
  };

  const runAudit = useCallback(async () => {
    if (!memo.trim() || running || !isConnected) return;
    abortRef.current?.abort();
    setRunning(true);
    setResult(null);
    setError(null);
    setCurrentStep(0);

    const controller = new AbortController();
    abortRef.current = controller;

    const stepTimers = [600, 600];
    for (const delay of stepTimers) {
      await new Promise(r => setTimeout(r, delay));
      if (controller.signal.aborted) return;
      setCurrentStep(prev => prev + 1);
    }

    try {
      const auditType = tier === "treasury" ? "treasury" : tier === "founder" ? "founder_drift" : "general";
      const endpoint = "/api/audit/demo";
      const userVeniceKey = getVeniceApiKey();
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(userVeniceKey && { "x-venice-api-key": userVeniceKey }),
          ...(address && { "x-wallet-address": address }),
        },
        body: JSON.stringify({
          strategy_memo: memo,
          audit_type: auditType,
          agent_id: address,
        }),
        signal: controller.signal,
      });

      if (controller.signal.aborted) return;
      setCurrentStep(3);
      await new Promise(r => setTimeout(r, 400));

      if (!response.ok) {
        const errData = await response.json().catch(() => null);
        throw new Error(errData?.error || `Server returned ${response.status}`);
      }

      const data: AuditResult = await response.json();

      if (controller.signal.aborted) return;
      setCurrentStep(4);
      await new Promise(r => setTimeout(r, 400));
      setCurrentStep(5);
      await new Promise(r => setTimeout(r, 300));

      setResult(data);
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") return;
      setError(err instanceof Error ? err.message : "Audit request failed");
      setCurrentStep(-1);
    } finally {
      setRunning(false);
      abortRef.current = null;
    }
  }, [memo, tier, running, isConnected, address]);

  useEffect(() => {
    return () => { abortRef.current?.abort(); };
  }, []);

  return (
    <div style={{ background: C.bg, color: C.text, fontFamily: MONO, fontSize: 14, lineHeight: 1.75, minHeight: "100vh" }}>
      <Helmet>
        <title>x402 Audit Console — Live | DJZS Protocol</title>
        <meta name="description" content="Route your reasoning trace through the x402 Oracle. Real USDC payments on Base Mainnet." />
        <meta property="og:title" content="DJZS x402 Audit Console" />
        <meta property="og:description" content="Wallet-gated audit console. Pay with USDC on Base Mainnet via x402 protocol." />
      </Helmet>

      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "0 24px" }}>
        <Nav rightSlot={<div data-testid="wallet-connect-button"><ConnectButton chainStatus="icon" showBalance={false} /></div>} />

        <div style={{ padding: "24px 0 8px" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "4px 12px", border: `1px solid ${C.amber}33`, background: `${C.amber}14`, borderRadius: 2, marginBottom: 16 }}>
            <GlowDot color={C.amber} size={6} />
            <span style={{ fontFamily: MONO, fontSize: 11, color: C.amber, letterSpacing: "0.1em", textTransform: "uppercase" }} data-testid="badge-chat-mode">x402 Audit Console — Live</span>
          </div>
          <h1 style={{ fontSize: "clamp(24px, 4vw, 36px)", fontWeight: 700, color: C.white, marginBottom: 8 }} data-testid="text-chat-page-title">
            Audit-to-Certificate Pipeline
          </h1>
          <p style={{ fontSize: 13, color: C.textDim, maxWidth: 760, marginBottom: 24 }} data-testid="text-chat-page-subtitle">
            Route your reasoning trace through the x402 Oracle. Real USDC payments on Base Mainnet.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "2fr 3fr", gap: 16 }} className="chat-grid">
          <style>{`.chat-grid { grid-template-columns: 2fr 3fr !important; } @media (max-width: 768px) { .chat-grid { grid-template-columns: 1fr !important; } }`}</style>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 4, padding: 16 }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: C.green, letterSpacing: "0.06em", marginBottom: 12, display: "flex", alignItems: "center", gap: 5 }} data-testid="text-chat-input-title">
                <span style={{ opacity: 0.4 }}>{"\u203A"}_</span> Agent Payload Injector
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ fontFamily: MONO, fontSize: 9, color: C.textMuted, letterSpacing: "0.1em", display: "block", marginBottom: 6 }} data-testid="label-chat-scenarios">PRELOADED SCENARIOS</label>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  {DEMO_SCENARIOS.map((scenario) => (
                    <button
                      key={scenario.key}
                      onClick={() => loadScenario(scenario.key)}
                      style={{
                        background: memo === scenario.memo ? `${C.green}0d` : "rgba(255,255,255,0.015)",
                        border: `1px solid ${memo === scenario.memo ? `${C.green}40` : C.border}`,
                        borderRadius: 4, padding: "8px 10px", cursor: "pointer", textAlign: "left",
                      }}
                      data-testid={`button-scenario-${scenario.key}`}
                    >
                      <div style={{ fontFamily: MONO, fontSize: 11, fontWeight: 600, color: memo === scenario.memo ? C.text : C.textDim }}>{scenario.label}</div>
                      <div style={{ fontFamily: MONO, fontSize: 9, color: C.textMuted, marginTop: 2 }}>{scenario.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ fontFamily: MONO, fontSize: 9, color: C.textMuted, letterSpacing: "0.1em", display: "block", marginBottom: 6 }} data-testid="label-chat-memo">"strategy_memo":</label>
                <textarea
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                  placeholder="Paste your reasoning memo here or select a scenario above..."
                  style={{
                    width: "100%", padding: 12, borderRadius: 4, background: C.bg, border: `1px solid ${C.border}`,
                    fontFamily: MONO, fontSize: 11, color: C.text, height: 120, resize: "none",
                    outline: "none",
                  }}
                  data-testid="textarea-chat-memo"
                />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ fontFamily: MONO, fontSize: 9, color: C.textMuted, letterSpacing: "0.1em", display: "block", marginBottom: 6 }} data-testid="label-chat-tier">AUDIT TIER</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 4 }}>
                  {TIER_OPTIONS.map((t) => (
                    <button
                      key={t.value}
                      onClick={() => setTier(t.value)}
                      style={{
                        padding: "8px 4px", borderRadius: 4, cursor: "pointer", textAlign: "center",
                        background: tier === t.value ? `${C.green}14` : "transparent",
                        border: `1px solid ${tier === t.value ? `${C.green}40` : C.border}`,
                      }}
                      data-testid={`button-tier-${t.value}`}
                    >
                      <div style={{ fontFamily: MONO, fontSize: 10, fontWeight: 600, color: tier === t.value ? C.green : C.textDim }}>{t.label}</div>
                      <div style={{ fontFamily: MONO, fontSize: 9, color: C.textMuted, marginTop: 2 }}>{t.price}</div>
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={runAudit}
                disabled={!memo.trim() || running || !isConnected}
                style={{
                  width: "100%", padding: "12px 0", borderRadius: 4, cursor: !memo.trim() || running || !isConnected ? "default" : "pointer",
                  fontFamily: MONO, fontSize: 12, fontWeight: 700, letterSpacing: "0.04em",
                  background: !memo.trim() || running || !isConnected ? C.surface : C.green,
                  border: !memo.trim() || running || !isConnected ? `1px solid ${C.border}` : `1px solid ${C.green}`,
                  color: !memo.trim() || running || !isConnected ? C.textMuted : C.bg,
                  opacity: !memo.trim() || running || !isConnected ? 0.6 : 1,
                }}
                data-testid="button-run-audit"
              >
                {!isConnected ? "Connect Wallet to Audit" : running ? "ORACLE SCANNING — may take up to 90s..." : "\u25B7 Run DJZS Audit"}
              </button>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 4, padding: 16 }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: C.green, letterSpacing: "0.06em", marginBottom: 12 }} data-testid="text-chat-pipeline-title">
                <span style={{ opacity: 0.4 }}>{"\u25C9"}</span> Pipeline Progress
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                {PIPELINE_STEPS.map((step, i) => {
                  const isActive = i === currentStep;
                  const isComplete = i < currentStep || (i === PIPELINE_STEPS.length - 1 && result !== null);
                  const cl = isComplete ? C.green : isActive ? "#4ade80" : C.textMuted;
                  return (
                    <div key={step.id} style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1 }} data-testid={`step-icon-${step.id}`}>
                      <div style={{ width: 24, height: 24, borderRadius: "50%", border: `2px solid ${cl}`, background: isComplete ? `${C.green}1f` : isActive ? "rgba(74,222,128,0.06)" : "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        {isComplete ? (
                          <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M2.5 6l2.5 2.5 4.5-4.5" stroke={C.green} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        ) : (
                          <div style={{ width: 4, height: 4, borderRadius: "50%", background: isActive ? "#4ade80" : C.textMuted }} />
                        )}
                      </div>
                      <span style={{ fontFamily: MONO, fontSize: 8, fontWeight: 600, color: isComplete || isActive ? C.text : C.textMuted, marginTop: 4, textAlign: "center" }} data-testid={`step-label-${step.id}`}>
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {error && (
              <div style={{ background: `${C.red}0d`, border: `1px solid ${C.red}33`, borderLeft: `3px solid ${C.red}`, borderRadius: 4, padding: 16 }} data-testid="chat-error-message">
                <div style={{ fontFamily: MONO, fontSize: 11, fontWeight: 700, color: C.red, marginBottom: 4 }}>Audit Failed</div>
                <p style={{ fontFamily: MONO, fontSize: 12, color: C.text, margin: 0 }}>{error}</p>
              </div>
            )}

            {result ? (
              <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 4, overflow: "hidden" }} data-testid="chat-result-card">
                <div style={{ padding: "12px 16px", borderBottom: `1px solid ${C.border}`, background: C.bg }}>
                  <div style={{ fontSize: 10, fontWeight: 600, color: C.green, letterSpacing: "0.06em", display: "flex", alignItems: "center", gap: 5 }} data-testid="text-result-title">
                    <span style={{ opacity: 0.4 }}>{"\u203A"}_</span> ProofOfLogic Certificate
                  </div>
                </div>
                <div style={{ padding: 16 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
                    <div style={{ position: "relative", width: 100, height: 100, flexShrink: 0 }}>
                      <svg width="100" height="100" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="42" fill="none" stroke={`${C.textMuted}30`} strokeWidth="5" />
                        <circle cx="50" cy="50" r="42" fill="none"
                          stroke={result.risk_score >= 120 ? C.red : result.risk_score >= 60 ? C.amber : C.green}
                          strokeWidth="5" strokeLinecap="round"
                          strokeDasharray={2 * Math.PI * 42}
                          strokeDashoffset={2 * Math.PI * 42 - (Math.min(result.risk_score, 200) / 200) * 2 * Math.PI * 42}
                          transform="rotate(-90 50 50)"
                          style={{ transition: "stroke-dashoffset 1s ease" }}
                        />
                      </svg>
                      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                        <span style={{ fontFamily: MONO, fontSize: 24, fontWeight: 700, color: result.risk_score >= 120 ? C.red : result.risk_score >= 60 ? C.amber : C.green }} data-testid="text-risk-score-value">{result.risk_score}</span>
                        <span style={{ fontFamily: MONO, fontSize: 8, color: C.textMuted }}>/ 200</span>
                      </div>
                    </div>

                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
                        <span style={{
                          fontFamily: MONO, fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 3,
                          color: result.verdict === "PASS" ? C.green : C.red,
                          background: result.verdict === "PASS" ? `${C.green}1a` : `${C.red}1a`,
                          border: `1px solid ${result.verdict === "PASS" ? `${C.green}40` : `${C.red}40`}`,
                        }} data-testid="badge-result-verdict">
                          {result.verdict === "PASS" ? "\u2713" : "\u26A0"} VERDICT: {result.verdict}
                        </span>
                        <span style={{ fontFamily: MONO, fontSize: 10, color: C.textDim, background: C.bg, border: `1px solid ${C.border}`, padding: "3px 8px", borderRadius: 3 }} data-testid="text-result-tier">
                          TIER: {result.tier.toUpperCase()}
                        </span>
                        <span style={{ fontFamily: MONO, fontSize: 10, color: C.green, background: `${C.green}14`, border: `1px solid ${C.green}33`, padding: "3px 8px", borderRadius: 3 }} data-testid="badge-live-audit">
                          LIVE
                        </span>
                      </div>
                      <div style={{ fontFamily: MONO, fontSize: 9, color: C.textMuted, lineHeight: 1.6 }}>
                        <div data-testid="text-result-audit-id">ID: {result.audit_id}</div>
                        <div data-testid="text-result-timestamp">TIME: {new Date(result.timestamp).toLocaleString()}</div>
                        {result.primary_bias_detected && result.primary_bias_detected !== "None" && (
                          <div data-testid="text-result-bias">BIAS: <span style={{ color: C.amber }}>{result.primary_bias_detected}</span></div>
                        )}
                      </div>
                    </div>
                  </div>

                  {result.flags && result.flags.length > 0 && (
                    <div style={{ marginBottom: 16 }}>
                      <div style={{ fontFamily: MONO, fontSize: 9, color: C.textMuted, letterSpacing: "0.08em", marginBottom: 6 }} data-testid="label-result-flags">FAILURE CODES ({result.flags.length})</div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                        {result.flags.map((flag, i) => (
                          <FlagCard key={i} flag={flag} index={i} />
                        ))}
                      </div>
                    </div>
                  )}

                  {result.structural_recommendations && result.structural_recommendations.length > 0 && (
                    <div style={{ marginBottom: 16 }}>
                      <div style={{ fontFamily: MONO, fontSize: 9, color: C.textMuted, letterSpacing: "0.08em", marginBottom: 6 }} data-testid="label-result-recommendations">RECOMMENDATIONS</div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                        {result.structural_recommendations.map((rec, i) => (
                          <div key={i} style={{ display: "flex", gap: 8, fontSize: 11, color: C.text }}>
                            <span style={{ color: C.green, flexShrink: 0 }}>▸</span>
                            <span data-testid={`text-recommendation-${i}`}>{rec}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 12 }}>
                    <div style={{ fontFamily: MONO, fontSize: 9, color: C.textMuted, letterSpacing: "0.08em", marginBottom: 8 }} data-testid="label-result-provenance">ON-CHAIN PROVENANCE</div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                      {result.irys_url ? (
                        <a href={result.irys_url} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", border: `1px solid ${C.green}33`, background: `${C.green}0d`, borderRadius: 4, textDecoration: "none" }} data-testid="link-result-irys">
                          <div>
                            <div style={{ fontFamily: MONO, fontSize: 10, fontWeight: 700, color: C.green }}>Irys Certificate</div>
                            <div style={{ fontFamily: MONO, fontSize: 8, color: C.textMuted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 180 }}>{result.irys_tx_id}</div>
                          </div>
                        </a>
                      ) : (
                        <div style={{ padding: "10px 12px", border: `1px solid ${C.border}`, borderRadius: 4 }}>
                          <div style={{ fontFamily: MONO, fontSize: 10, fontWeight: 700, color: C.textMuted }}>Irys Certificate</div>
                          <div style={{ fontFamily: MONO, fontSize: 8, color: C.textMuted }}>{result.irys_error || "Not configured"}</div>
                        </div>
                      )}
                      {result.trust_score_tx_hash ? (
                        <a href={`https://basescan.org/tx/${result.trust_score_tx_hash}`} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", border: `1px solid #06b6d433`, background: "#06b6d40d", borderRadius: 4, textDecoration: "none" }} data-testid="link-result-basescan">
                          <div>
                            <div style={{ fontFamily: MONO, fontSize: 10, fontWeight: 700, color: "#06b6d4" }}>BaseScan TX</div>
                            <div style={{ fontFamily: MONO, fontSize: 8, color: C.textMuted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 180 }}>{result.trust_score_tx_hash}</div>
                          </div>
                        </a>
                      ) : (
                        <div style={{ padding: "10px 12px", border: `1px solid ${C.border}`, borderRadius: 4 }}>
                          <div style={{ fontFamily: MONO, fontSize: 10, fontWeight: 700, color: C.textMuted }}>Trust Score TX</div>
                          <div style={{ fontFamily: MONO, fontSize: 8, color: C.textMuted }}>{result.trust_score_error || "Not configured"}</div>
                        </div>
                      )}
                    </div>
                    <div style={{ fontFamily: MONO, fontSize: 8, color: C.textMuted, marginTop: 8, wordBreak: "break-all" }} data-testid="text-result-hash">
                      SHA-256: {result.cryptographic_hash}
                    </div>
                  </div>
                </div>
              </div>
            ) : !running ? (
              <div style={{ background: C.surface, border: `1px dashed ${C.border}`, borderRadius: 4, padding: 48, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }} data-testid="chat-empty-state">
                <div style={{ fontFamily: MONO, fontSize: 13, color: C.textMuted, marginBottom: 4 }}>No audit running</div>
                <p style={{ fontFamily: MONO, fontSize: 11, color: C.textMuted }}>
                  {isConnected
                    ? 'Select a scenario or paste a memo, then click "Run DJZS Audit"'
                    : "Connect your wallet to start an audit"}
                </p>
              </div>
            ) : null}
          </div>
        </div>

        <div style={{ padding: "48px 0" }}>
          <TerminalFooter />
        </div>
      </div>
    </div>
  );
}
