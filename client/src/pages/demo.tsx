import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Helmet } from "react-helmet";
import { C, MONO, Nav, GlowDot, TerminalFooter } from "@/lib/terminal-theme";
import { LOGIC_FAILURE_TAXONOMY, MAX_RISK_SCORE, SCHEMA_VERSION } from "@shared/audit-schema";

const LF_TAXONOMY = LOGIC_FAILURE_TAXONOMY as Record<string, { name: string; category: string; weight: number; severity: string; description: string }>;

const ALL_CODES = Object.keys(LF_TAXONOMY);
const MAX_SCORE = MAX_RISK_SCORE;
const PASS_THRESHOLD = 60;
const SCHEMA_VERSION_LABEL = SCHEMA_VERSION;

interface ScenarioFlag {
  present: boolean;
  evidence: string | null;
}

const SCENARIOS: Record<string, { label: string; desc: string; memo: string; flags: Record<string, ScenarioFlag> }> = {
  fomo_momentum: {
    label: "FOMO Momentum Buy",
    desc: "Social-driven pump chase with no verified data",
    memo: "Rebalance the USDC/ETH liquidity position on Uniswap V3 when the price moves outside the \u00b15% range from the 7-day TWAP. If ETH drops below $1,800, withdraw all liquidity to USDC and halt. Max position size: 2% of treasury.",
    flags: {
      "DJZS-S01": { present: false, evidence: null },
      "DJZS-S02": { present: false, evidence: null },
      "DJZS-S03": { present: false, evidence: null },
      "DJZS-E01": { present: true,  evidence: "TWAP source not cryptographically verified" },
      "DJZS-E02": { present: false, evidence: null },
      "DJZS-I01": { present: true,  evidence: "Social-driven pump chase with no verified data anchor" },
      "DJZS-I02": { present: false, evidence: null },
      "DJZS-I03": { present: true,  evidence: "Position sizing references unverified treasury balance" },
      "DJZS-X01": { present: true,  evidence: "No explicit stop-loss mechanism for ETH price collapse" },
      "DJZS-X02": { present: false, evidence: null },
      "DJZS-T01": { present: false, evidence: null },
    }
  },
  hallucinated: {
    label: "Hallucinated Data",
    desc: "References a protocol and audit that don't exist",
    memo: "Deploy 40% of reserves into the new LRT vault cited by the Ethereum Foundation Q3 report, targeting 8.2% APY with auto-compounding.",
    flags: {
      "DJZS-S01": { present: true,  evidence: "Strategy references non-existent EF Q3 report as basis" },
      "DJZS-S02": { present: true,  evidence: "Yield assumption layered on fabricated upstream source" },
      "DJZS-S03": { present: true,  evidence: "LRT vault contract address unresolvable" },
      "DJZS-E01": { present: true,  evidence: "Ethereum Foundation report does not exist" },
      "DJZS-E02": { present: true,  evidence: "8.2% APY stated as fact without any market data" },
      "DJZS-I01": { present: false, evidence: null },
      "DJZS-I02": { present: true,  evidence: "Auto-compound target misaligned with capital preservation" },
      "DJZS-I03": { present: true,  evidence: "40% allocation figure has no risk model backing" },
      "DJZS-X01": { present: true,  evidence: "No withdrawal circuit breaker defined" },
      "DJZS-X02": { present: false, evidence: null },
      "DJZS-T01": { present: true,  evidence: "Report reference is temporally impossible" },
    }
  },
  clean: {
    label: "Clean Strategy",
    desc: "Well-structured rebalance with verified parameters",
    memo: "Rebalance stablecoin allocation: 60% USDC, 30% DAI, 10% FRAX. Trigger: if any asset depegs >0.5% for >1hr per Chainlink oracle. Max slippage 0.3%. Halt if gas >50 gwei.",
    flags: {
      "DJZS-S01": { present: false, evidence: null },
      "DJZS-S02": { present: false, evidence: null },
      "DJZS-S03": { present: false, evidence: null },
      "DJZS-E01": { present: false, evidence: null },
      "DJZS-E02": { present: false, evidence: null },
      "DJZS-I01": { present: false, evidence: null },
      "DJZS-I02": { present: false, evidence: null },
      "DJZS-I03": { present: false, evidence: null },
      "DJZS-X01": { present: false, evidence: null },
      "DJZS-X02": { present: false, evidence: null },
      "DJZS-T01": { present: true,  evidence: "Chainlink heartbeat interval may exceed 1hr threshold" },
    }
  },
  race: {
    label: "Race Condition Edge Case",
    desc: "Reasonable strategy with hidden temporal risk",
    memo: "Execute market buy of 5 ETH when funding rate flips negative on Binance perps, then immediately open a 2x long on Aave. Close both if combined PnL hits -3%.",
    flags: {
      "DJZS-S01": { present: false, evidence: null },
      "DJZS-S02": { present: false, evidence: null },
      "DJZS-S03": { present: false, evidence: null },
      "DJZS-E01": { present: true,  evidence: "Binance funding rate is CEX data without on-chain proof" },
      "DJZS-E02": { present: false, evidence: null },
      "DJZS-I01": { present: false, evidence: null },
      "DJZS-I02": { present: false, evidence: null },
      "DJZS-I03": { present: false, evidence: null },
      "DJZS-X01": { present: false, evidence: null },
      "DJZS-X02": { present: true,  evidence: "Spot buy and Aave long have no atomicity guarantee" },
      "DJZS-T01": { present: true,  evidence: "Funding rate snapshot may be stale by execution time" },
    }
  }
};

function demoComputeVerdict(flags: Record<string, ScenarioFlag>) {
  const risk_score = Object.entries(flags)
    .filter(([_, v]) => v.present)
    .reduce((sum, [code]) => sum + (LF_TAXONOMY[code]?.weight || 0), 0);
  const failure_flags = ALL_CODES.filter((code) => flags[code]?.present).sort();
  const booleanOnly: Record<string, boolean> = {};
  for (const code of ALL_CODES) booleanOnly[code] = flags[code]?.present ?? false;
  const logic_hash = fnv(JSON.stringify(booleanOnly) + "|" + risk_score);
  const weights_hash = fnv(JSON.stringify(Object.fromEntries(Object.entries(LF_TAXONOMY).map(([k, v]) => [k, v.weight]))));
  return {
    audit_verdict: risk_score < PASS_THRESHOLD ? "PASS" as const : "FAIL" as const,
    risk_score, max_possible: MAX_SCORE, pass_threshold: PASS_THRESHOLD,
    failure_flags, logic_hash, weights_hash,
    audit_schema_version: SCHEMA_VERSION_LABEL, threshold_block: 29847261,
    detection_model: "venice/llama-3.3-70b@temp=0", scoring_engine: "typescript/pure-function",
    anchor_target: "irys-datachain", settlement_chain: "base-mainnet",
    timestamp: new Date().toISOString(),
    audit_id: crypto.randomUUID?.() || "demo-" + Date.now(),
  };
}

function fnv(s: string) {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193); }
  return "0x" + (h >>> 0).toString(16).padStart(8, "0");
}

const SEV: Record<string, { bg: string; border: string; label: string }> = {
  CRITICAL: { bg: `${C.red}1a`, border: C.red, label: C.red },
  HIGH:     { bg: `${C.amber}14`, border: C.amber, label: C.amber },
  MEDIUM:   { bg: "rgba(234,179,8,0.06)", border: "#eab308", label: "#eab308" },
  LOW:      { bg: `${C.green}0f`, border: C.green, label: C.green },
};
const CAT: Record<string, string> = { Structural: C.red, Epistemic: "#a78bfa", Incentive: C.amber, Execution: "#ec4899", Temporal: "#06b6d4" };

function Gauge({ score, verdict }: { score: number; verdict: string }) {
  const [a, setA] = useState(0);
  const p = Math.min(score / MAX_SCORE, 1);
  useEffect(() => { setA(0); const t = setTimeout(() => setA(p), 60); return () => clearTimeout(t); }, [score, p]);
  const r = 58, c = 2 * Math.PI * r, o = c - a * c;
  const color = verdict === "PASS" ? C.green : score >= 120 ? C.red : C.amber;
  return (
    <div style={{ position: "relative", width: 148, height: 148, flexShrink: 0 }} data-testid="gauge-risk-score">
      <svg width="148" height="148" viewBox="0 0 148 148">
        <circle cx="74" cy="74" r={r} fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="7" />
        <circle cx="74" cy="74" r={r} fill="none" stroke={color} strokeWidth="7"
          strokeLinecap="round" strokeDasharray={c} strokeDashoffset={o}
          transform="rotate(-90 74 74)"
          style={{ transition: "stroke-dashoffset 1s cubic-bezier(0.16,1,0.3,1), stroke 0.3s" }} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontFamily: MONO, fontSize: 34, fontWeight: 700, color, lineHeight: 1 }} data-testid="text-risk-score-value">{score}</span>
        <span style={{ fontFamily: MONO, fontSize: 10, color: C.textMuted, marginTop: 2 }}>RISK / {MAX_SCORE}</span>
      </div>
    </div>
  );
}

function Steps({ step }: { step: string }) {
  const ss = [
    { k: "sig", l: "Signature", d: "Request sig verified" },
    { k: "hash", l: "Hash Check", d: "Payload integrity" },
    { k: "audit", l: "Auditing", d: "Adversarial analysis in TEE" },
    { k: "irys", l: "Irys Upload", d: "Certificate \u2192 Datachain" },
    { k: "settle", l: "Settlement", d: "On-chain on Base" },
    { k: "done", l: "Complete", d: "ProofOfLogic ready" },
  ];
  const idx = ss.findIndex(s => s.k === step);
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "0 2px" }} data-testid="pipeline-steps">
      {ss.map((s, i) => {
        const done = i < idx, act = i === idx;
        const cl = done ? C.green : act ? "#4ade80" : C.textMuted;
        return (
          <div key={s.k} style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1 }} data-testid={`step-icon-${s.k}`}>
            <div style={{ width: 26, height: 26, borderRadius: "50%", border: `2px solid ${cl}`, background: done ? `${C.green}1f` : act ? "rgba(74,222,128,0.06)" : "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {done ? <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2.5 6l2.5 2.5 4.5-4.5" stroke={C.green} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                : <div style={{ width: 5, height: 5, borderRadius: "50%", background: act ? "#4ade80" : C.textMuted }} />}
            </div>
            <span style={{ fontFamily: MONO, fontSize: 8.5, fontWeight: 600, color: done || act ? C.text : C.textMuted, marginTop: 5, textAlign: "center" }}>{s.l}</span>
            <span style={{ fontFamily: MONO, fontSize: 7, color: C.textMuted, marginTop: 1, textAlign: "center", maxWidth: 80 }}>{s.d}</span>
          </div>
        );
      })}
    </div>
  );
}

function Flag({ code, data, flag, open, toggle }: { code: string; data: { name: string; category: string; weight: number; severity: string; description: string }; flag: ScenarioFlag; open: boolean; toggle: () => void }) {
  const sv = SEV[data.severity];
  return (
    <div style={{ background: sv.bg, borderLeft: `3px solid ${sv.border}`, border: `1px solid ${sv.border}18`, borderRadius: 4, overflow: "hidden" }} data-testid={`card-flag-${code.toLowerCase()}`}>
      <button onClick={toggle} style={{ width: "100%", display: "flex", alignItems: "center", gap: 6, padding: "9px 10px", background: "none", border: "none", cursor: "pointer", textAlign: "left" }} data-testid={`button-expand-flag-${code.toLowerCase()}`}>
        <span style={{ fontFamily: MONO, fontSize: 8.5, fontWeight: 700, color: sv.label, background: `${sv.label}15`, padding: "2px 5px", borderRadius: 2, letterSpacing: "0.05em", flexShrink: 0 }}>{data.severity}</span>
        <span style={{ fontFamily: MONO, fontSize: 10.5, fontWeight: 600, color: C.text, flexShrink: 0 }}>{code}</span>
        <span style={{ fontFamily: MONO, fontSize: 9.5, color: C.textDim, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{data.name}</span>
        <span style={{ fontFamily: MONO, fontSize: 10, fontWeight: 700, color: sv.label, flexShrink: 0, minWidth: 28, textAlign: "right" }}>+{data.weight}</span>
        <svg width="11" height="11" viewBox="0 0 11 11" fill="none" style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.15s", flexShrink: 0 }}>
          <path d="M2.75 4.25l2.75 2.75 2.75-2.75" stroke={C.textMuted} strokeWidth="1.4" strokeLinecap="round"/>
        </svg>
      </button>
      {open && (
        <div style={{ padding: "0 10px 9px" }}>
          <div style={{ display: "flex", gap: 6, marginBottom: 5, alignItems: "center" }}>
            <span style={{ fontFamily: MONO, fontSize: 8, letterSpacing: "0.06em", color: CAT[data.category], background: `${CAT[data.category]}12`, padding: "1px 5px", borderRadius: 2 }}>{data.category.toUpperCase()}</span>
            <span style={{ fontFamily: MONO, fontSize: 8, color: C.textMuted }}>Weight: {data.weight} / {MAX_SCORE}</span>
          </div>
          <p style={{ fontFamily: MONO, fontSize: 9.5, color: C.textDim, margin: "0 0 5px", lineHeight: 1.5 }}>{data.description}</p>
          {flag.evidence && (
            <div style={{ background: "rgba(0,0,0,0.35)", borderRadius: 3, padding: "5px 7px", borderLeft: `2px solid ${sv.border}33` }}>
              <span style={{ fontFamily: MONO, fontSize: 7.5, color: C.textMuted, letterSpacing: "0.08em", display: "block", marginBottom: 2 }}>EVIDENCE (human review only — not hashed)</span>
              <span style={{ fontFamily: MONO, fontSize: 9, color: C.text, lineHeight: 1.4 }}>{flag.evidence}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function Demo() {
  const [scenario, setScenario] = useState("fomo_momentum");
  const [expanded, setExpanded] = useState(new Set<string>());
  const [showMeta, setShowMeta] = useState(false);
  const [running, setRunning] = useState(false);
  const [pStep, setPStep] = useState("done");
  const [result, setResult] = useState<ReturnType<typeof demoComputeVerdict> | null>(null);
  const [tier, setTier] = useState("micro");

  const sc = SCENARIOS[scenario];
  const verdict = result || demoComputeVerdict(sc.flags);
  const failed = Object.entries(sc.flags).filter(([_, v]) => v.present).sort((a, b) => (LF_TAXONOMY[b[0]]?.weight || 0) - (LF_TAXONOMY[a[0]]?.weight || 0));

  function toggle(code: string) { setExpanded(prev => { const n = new Set(prev); n.has(code) ? n.delete(code) : n.add(code); return n; }); }
  function run() {
    setRunning(true); setResult(null); setExpanded(new Set());
    (["sig","hash","audit","irys","settle","done"] as const).forEach((s, i) => {
      setTimeout(() => { setPStep(s); if (s === "done") { setResult(demoComputeVerdict(SCENARIOS[scenario].flags)); setRunning(false); } }, i * 450);
    });
  }
  function pick(key: string) { setScenario(key); setResult(null); setExpanded(new Set()); setPStep("done"); }

  const tiers = [{ key: "micro", label: "Micro-Zone", price: "$0.10" }, { key: "founder", label: "Founder Zone", price: "$1.00" }, { key: "treasury", label: "Treasury Zone", price: "$10.00" }];

  return (
    <div style={{ background: C.bg, color: C.text, fontFamily: MONO, fontSize: 14, lineHeight: 1.75, minHeight: "100vh" }}>
      <Helmet>
        <title>Live Demo | DJZS Protocol — ProofOfLogic Certificate Engine</title>
        <meta name="description" content="Try the DJZS Zero-Trust Oracle live. Select a scenario, run the audit pipeline, and see the full ProofOfLogic certificate with 200-point risk scoring on the DJZS-LF-v1.0 taxonomy." />
        <meta property="og:title" content="DJZS Live Demo — ProofOfLogic Certificate Engine" />
        <meta property="og:description" content="See the full DJZS audit pipeline in action. 200-point risk scale, 11 failure codes, deterministic scoring." />
        <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </Helmet>

      <div style={{ maxWidth: 1120, margin: "0 auto", padding: "0 24px" }}>
        <Nav />

        <div style={{ padding: "24px 0 8px" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "4px 12px", border: `1px solid ${C.green}33`, background: C.greenGlow, borderRadius: 2, marginBottom: 16 }}>
            <GlowDot color={C.green} size={6} />
            <span style={{ fontFamily: MONO, fontSize: 11, color: C.green, letterSpacing: "0.1em", textTransform: "uppercase" }}>Live Demo — ProofOfLogic Engine</span>
          </div>
          <h1 style={{ fontSize: "clamp(24px, 4vw, 36px)", fontWeight: 700, color: C.white, marginBottom: 8 }} data-testid="text-demo-page-title">
            Audit-to-Certificate Pipeline
          </h1>
          <p style={{ fontSize: 13, color: C.textDim, maxWidth: 600, marginBottom: 24 }}>
            Select a scenario, run the audit pipeline, and see the full ProofOfLogic certificate with 200-point risk scoring.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.15fr", gap: 14 }} className="demo-grid">
          <style>{`.demo-grid { grid-template-columns: 1fr 1.15fr !important; } @media (max-width: 768px) { .demo-grid { grid-template-columns: 1fr !important; } }`}</style>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 4, padding: 12 }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: C.green, letterSpacing: "0.06em", marginBottom: 8, display: "flex", alignItems: "center", gap: 5 }}>
                <span style={{ opacity: 0.4 }}>{"\u203A"}_</span> Agent Payload Injector
              </div>
              <div style={{ fontSize: 7.5, color: C.textMuted, letterSpacing: "0.1em", marginBottom: 6 }} data-testid="label-demo-scenarios">PRELOADED SCENARIOS</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                {Object.entries(SCENARIOS).map(([key, s]) => (
                  <button key={key} onClick={() => pick(key)} style={{ background: scenario === key ? `${C.green}0d` : "rgba(255,255,255,0.015)", border: `1px solid ${scenario === key ? `${C.green}40` : C.border}`, borderRadius: 4, padding: "7px 9px", cursor: "pointer", textAlign: "left", transition: "all 0.12s" }} data-testid={`button-scenario-${key}`}>
                    <div style={{ fontSize: 10.5, fontWeight: 600, color: scenario === key ? C.text : C.textDim, fontFamily: MONO }}>{s.label}</div>
                    <div style={{ fontSize: 8.5, color: C.textMuted, marginTop: 1, fontFamily: MONO }}>{s.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 4, padding: 12 }}>
              <div style={{ fontSize: 7.5, color: C.textMuted, letterSpacing: "0.1em", marginBottom: 5, fontFamily: MONO }} data-testid="label-demo-memo">"strategy_memo":</div>
              <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 3, padding: 9, fontSize: 10, color: C.text, lineHeight: 1.65, fontFamily: MONO }} data-testid="textarea-demo-memo">{sc.memo}</div>
            </div>

            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 4, padding: 12 }}>
              <div style={{ fontSize: 7.5, color: C.textMuted, letterSpacing: "0.1em", marginBottom: 6, display: "flex", alignItems: "center", gap: 6, fontFamily: MONO }}>AUDIT TIER <span style={{ fontSize: 7, color: C.amber, background: `${C.amber}14`, padding: "1px 4px", borderRadius: 2 }} data-testid="badge-demo-pricing">DEMO PRICING</span></div>
              <div style={{ display: "flex", gap: 6 }} data-testid="tier-selector">
                {tiers.map(t => (
                  <button key={t.key} onClick={() => setTier(t.key)} style={{ flex: 1, padding: "8px 0", borderRadius: 4, cursor: "pointer", background: tier === t.key ? `${C.green}14` : "transparent", border: `1px solid ${tier === t.key ? `${C.green}40` : C.border}`, textAlign: "center" }} data-testid={`button-tier-${t.key}`}>
                    <div style={{ fontSize: 9.5, fontWeight: 600, color: tier === t.key ? C.green : C.textDim, fontFamily: MONO }}>{t.label}</div>
                    <div style={{ fontSize: 8.5, color: C.textMuted, marginTop: 1, fontFamily: MONO }}>{t.price}</div>
                  </button>
                ))}
              </div>
            </div>

            <button onClick={run} disabled={running} style={{ background: running ? C.surface : C.green, border: running ? `1px solid ${C.border}` : `1px solid ${C.green}`, borderRadius: 4, padding: "11px 0", cursor: running ? "default" : "pointer", fontSize: 11.5, fontWeight: 700, color: running ? C.textMuted : C.bg, fontFamily: MONO, letterSpacing: "0.04em", width: "100%" }} data-testid="button-run-audit">
              {running ? "\u27F3 AUDITING..." : "\u25B7 Run DJZS Audit"}
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 4, padding: "12px 8px" }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: C.green, letterSpacing: "0.06em", marginBottom: 10, display: "flex", alignItems: "center", gap: 5, fontFamily: MONO }}>
                <span style={{ opacity: 0.4 }}>{"\u25C9"}</span> Pipeline Progress
              </div>
              <Steps step={pStep} />
            </div>

            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 4, padding: 12 }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: C.green, letterSpacing: "0.06em", marginBottom: 12, display: "flex", alignItems: "center", gap: 5, fontFamily: MONO }} data-testid="text-demo-result-title">
                <span style={{ opacity: 0.4 }}>{"\u203A"}_</span> ProofOfLogic Certificate
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
                <Gauge score={verdict.risk_score} verdict={verdict.audit_verdict} />
                <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                  <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: "0.04em", color: verdict.audit_verdict === "PASS" ? C.green : C.red, background: verdict.audit_verdict === "PASS" ? `${C.green}1a` : `${C.red}1a`, border: `1px solid ${verdict.audit_verdict === "PASS" ? `${C.green}40` : `${C.red}40`}`, padding: "2px 7px", borderRadius: 3, fontFamily: MONO }} data-testid="badge-result-verdict">
                      {verdict.audit_verdict === "PASS" ? "\u2713" : "\u26A0"} VERDICT: {verdict.audit_verdict}
                    </span>
                    <span style={{ fontSize: 9.5, color: C.textDim, background: C.surface, border: `1px solid ${C.border}`, padding: "2px 7px", borderRadius: 3, fontFamily: MONO }} data-testid="text-result-tier">TIER: {tier.toUpperCase()}</span>
                    <span style={{ fontSize: 9.5, color: C.textMuted, background: C.surface, border: `1px solid ${C.border}`, padding: "2px 7px", borderRadius: 3, fontFamily: MONO }}>THR: {verdict.pass_threshold}</span>
                  </div>
                  <div style={{ fontSize: 8, color: C.textMuted, lineHeight: 1.6, fontFamily: MONO }}>
                    <span data-testid="text-result-audit-id">ID: {verdict.audit_id?.slice(0, 28)}...</span><br />
                    <span data-testid="text-result-timestamp">TIME: {new Date(verdict.timestamp).toLocaleString()}</span><br />
                    BLOCK: #{verdict.threshold_block}
                  </div>
                </div>
              </div>

              <button onClick={() => setShowMeta(!showMeta)} style={{ width: "100%", background: `${C.green}08`, border: `1px solid ${C.border}`, borderRadius: 4, padding: "7px 9px", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }} data-testid="button-toggle-provenance">
                <span style={{ fontSize: 8, color: C.green, letterSpacing: "0.1em", fontFamily: MONO }}>AUDIT PROVENANCE</span>
                <div style={{ flex: 1 }} />
                <svg width="9" height="9" viewBox="0 0 9 9" fill="none" style={{ transform: showMeta ? "rotate(180deg)" : "none", transition: "transform 0.15s" }}>
                  <path d="M2 3.5l2.5 2.5L7 3.5" stroke={C.textMuted} strokeWidth="1.3" strokeLinecap="round"/>
                </svg>
              </button>
              {showMeta && (
                <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 3, padding: 8, fontFamily: MONO, fontSize: 8, lineHeight: 1.6, color: C.textMuted, marginBottom: 10 }}>
                  {[
                    ["Schema", verdict.audit_schema_version],
                    ["Model", verdict.detection_model],
                    ["Engine", verdict.scoring_engine],
                    ["Hash", verdict.logic_hash],
                    ["Weights", verdict.weights_hash],
                    ["Anchor", verdict.anchor_target],
                    ["Chain", verdict.settlement_chain],
                    ["Max", `${verdict.max_possible}`],
                    ["Threshold", `${verdict.pass_threshold}`],
                  ].map(([k, v]) => (
                    <div key={k}><span style={{ color: C.textMuted }}>{k}:</span> <span style={{ color: C.text }}>{v}</span></div>
                  ))}
                </div>
              )}

              {failed.length > 0 && (
                <>
                  <div style={{ fontSize: 8, color: C.textMuted, letterSpacing: "0.08em", marginBottom: 4, fontFamily: MONO }} data-testid="label-result-flags">FAILURE FLAGS ({failed.length})</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    {failed.map(([code, flag]) => {
                      const data = LF_TAXONOMY[code];
                      if (!data) return null;
                      return <Flag key={code} code={code} data={data} flag={flag} open={expanded.has(code)} toggle={() => toggle(code)} />;
                    })}
                  </div>
                </>
              )}
              {failed.length === 0 && (
                <div style={{ background: `${C.green}0d`, border: `1px solid ${C.green}33`, borderRadius: 4, padding: "10px 12px", fontSize: 10, color: C.green, fontFamily: MONO, textAlign: "center" }} data-testid="text-no-flags">
                  ✓ No failure flags detected — strategy passes all checks
                </div>
              )}
            </div>
          </div>
        </div>

        <div style={{ padding: "48px 0" }}>
          <TerminalFooter />
        </div>
      </div>
    </div>
  );
}
