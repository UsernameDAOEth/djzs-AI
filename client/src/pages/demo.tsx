import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Helmet } from "react-helmet";
import { useTheme } from "@/lib/theme";
import { TorusLogo } from "@/components/TorusLogo";
import { ArrowLeft, BookOpen, Sun, Moon, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
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
  CRITICAL: { bg: "rgba(239,68,68,0.10)", border: "#ef4444", label: "#ef4444" },
  HIGH:     { bg: "rgba(249,115,22,0.08)", border: "#f97316", label: "#f97316" },
  MEDIUM:   { bg: "rgba(234,179,8,0.06)",  border: "#eab308", label: "#eab308" },
  LOW:      { bg: "rgba(34,197,94,0.06)",   border: "#22c55e", label: "#22c55e" },
};
const CAT: Record<string, string> = { Structural: "#ef4444", Epistemic: "#a78bfa", Incentive: "#f97316", Execution: "#ec4899", Temporal: "#06b6d4" };

function Gauge({ score, verdict }: { score: number; verdict: string }) {
  const [a, setA] = useState(0);
  const p = Math.min(score / MAX_SCORE, 1);
  useEffect(() => { setA(0); const t = setTimeout(() => setA(p), 60); return () => clearTimeout(t); }, [score, p]);
  const r = 58, c = 2 * Math.PI * r, o = c - a * c;
  const color = verdict === "PASS" ? "#22c55e" : score >= 120 ? "#ef4444" : "#f97316";
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
        <span style={{ fontFamily: "var(--mono)", fontSize: 34, fontWeight: 700, color, lineHeight: 1 }} data-testid="text-risk-score-value">{score}</span>
        <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "#52525b", marginTop: 2 }}>RISK / {MAX_SCORE}</span>
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
        const cl = done ? "#22c55e" : act ? "#4ade80" : "#3f3f46";
        return (
          <div key={s.k} style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1 }} data-testid={`step-icon-${s.k}`}>
            <div style={{ width: 26, height: 26, borderRadius: "50%", border: `2px solid ${cl}`, background: done ? "rgba(34,197,94,0.12)" : act ? "rgba(74,222,128,0.06)" : "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {done ? <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2.5 6l2.5 2.5 4.5-4.5" stroke="#22c55e" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                : <div style={{ width: 5, height: 5, borderRadius: "50%", background: act ? "#4ade80" : "#52525b" }} />}
            </div>
            <span style={{ fontFamily: "var(--mono)", fontSize: 8.5, fontWeight: 600, color: done || act ? "#d4d4d8" : "#52525b", marginTop: 5, textAlign: "center" }}>{s.l}</span>
            <span style={{ fontFamily: "var(--mono)", fontSize: 7, color: "#3f3f46", marginTop: 1, textAlign: "center", maxWidth: 80 }}>{s.d}</span>
          </div>
        );
      })}
    </div>
  );
}

function Flag({ code, data, flag, open, toggle }: { code: string; data: { name: string; category: string; weight: number; severity: string; description: string }; flag: ScenarioFlag; open: boolean; toggle: () => void }) {
  const sv = SEV[data.severity];
  return (
    <div style={{ background: sv.bg, borderLeft: `3px solid ${sv.border}`, border: `1px solid ${sv.border}18`, borderRadius: 5, overflow: "hidden" }} data-testid={`card-flag-${code.toLowerCase()}`}>
      <button onClick={toggle} style={{ width: "100%", display: "flex", alignItems: "center", gap: 6, padding: "9px 10px", background: "none", border: "none", cursor: "pointer", textAlign: "left" }} data-testid={`button-expand-flag-${code.toLowerCase()}`}>
        <span style={{ fontFamily: "var(--mono)", fontSize: 8.5, fontWeight: 700, color: sv.label, background: `${sv.label}15`, padding: "2px 5px", borderRadius: 2, letterSpacing: "0.05em", flexShrink: 0 }}>{data.severity}</span>
        <span style={{ fontFamily: "var(--mono)", fontSize: 10.5, fontWeight: 600, color: "#e4e4e7", flexShrink: 0 }}>{code}</span>
        <span style={{ fontFamily: "var(--mono)", fontSize: 9.5, color: "#71717a", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{data.name}</span>
        <span style={{ fontFamily: "var(--mono)", fontSize: 10, fontWeight: 700, color: sv.label, flexShrink: 0, minWidth: 28, textAlign: "right" }}>+{data.weight}</span>
        <svg width="11" height="11" viewBox="0 0 11 11" fill="none" style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.15s", flexShrink: 0 }}>
          <path d="M2.75 4.25l2.75 2.75 2.75-2.75" stroke="#52525b" strokeWidth="1.4" strokeLinecap="round"/>
        </svg>
      </button>
      {open && (
        <div style={{ padding: "0 10px 9px" }}>
          <div style={{ display: "flex", gap: 6, marginBottom: 5, alignItems: "center" }}>
            <span style={{ fontFamily: "var(--mono)", fontSize: 8, letterSpacing: "0.06em", color: CAT[data.category], background: `${CAT[data.category]}12`, padding: "1px 5px", borderRadius: 2 }}>{data.category.toUpperCase()}</span>
            <span style={{ fontFamily: "var(--mono)", fontSize: 8, color: "#52525b" }}>Weight: {data.weight} / {MAX_SCORE}</span>
          </div>
          <p style={{ fontFamily: "var(--mono)", fontSize: 9.5, color: "#a1a1aa", margin: "0 0 5px", lineHeight: 1.5 }}>{data.description}</p>
          {flag.evidence && (
            <div style={{ background: "rgba(0,0,0,0.35)", borderRadius: 3, padding: "5px 7px", borderLeft: `2px solid ${sv.border}33` }}>
              <span style={{ fontFamily: "var(--mono)", fontSize: 7.5, color: "#3f3f46", letterSpacing: "0.08em", display: "block", marginBottom: 2 }}>EVIDENCE (human review only — not hashed)</span>
              <span style={{ fontFamily: "var(--mono)", fontSize: 9, color: "#d4d4d8", lineHeight: 1.4 }}>{flag.evidence}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function Demo() {
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
    <div className="min-h-screen text-foreground bg-background">
      <Helmet>
        <title>Live Demo | DJZS Protocol — ProofOfLogic Certificate Engine</title>
        <meta name="description" content="Try the DJZS Zero-Trust Oracle live. Select a scenario, run the audit pipeline, and see the full ProofOfLogic certificate with 200-point risk scoring on the DJZS-LF-v1.0 taxonomy." />
        <meta property="og:title" content="DJZS Live Demo — ProofOfLogic Certificate Engine" />
        <meta property="og:description" content="See the full DJZS audit pipeline in action. 200-point risk scale, 11 failure codes, deterministic scoring." />
        <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </Helmet>

      <header className="sticky top-0 z-50 backdrop-blur-xl border-b border-border bg-background/90" style={{ boxShadow: '0 1px 20px rgba(0,0,0,0.08)' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <Link href="/">
            <span className="flex items-center gap-2.5" data-testid="link-demo-home-logo">
              <TorusLogo />
              <span className="text-lg sm:text-xl font-bold tracking-tighter text-foreground">DJZS<span className="text-purple-500">.ai</span></span>
            </span>
          </Link>
          <div className="flex items-center gap-3 sm:gap-5">
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
              <Link href="/" className="group flex items-center gap-2 px-3 py-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all" data-testid="link-demo-header-home">
                <ArrowLeft size={15} />
                Home
              </Link>
              <Link href="/docs" className="group flex items-center gap-2 px-3 py-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all" data-testid="link-demo-header-docs">
                <BookOpen size={15} className="text-teal-400 group-hover:text-teal-300 transition-colors" />
                Documents
              </Link>
            </nav>
            <button onClick={toggleTheme} className="w-10 h-10 rounded-lg flex items-center justify-center transition-colors hover:bg-muted" data-testid="button-demo-theme-toggle" aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden w-10 h-10 rounded-lg flex items-center justify-center transition-colors hover:bg-muted" data-testid="button-demo-mobile-menu" aria-label="Menu">
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div key="mobile-menu" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="md:hidden border-t border-border overflow-hidden bg-background/98">
              <nav className="flex flex-col px-4 py-3 gap-1">
                <Link href="/" className="flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground" onClick={() => setMobileMenuOpen(false)} data-testid="link-demo-mobile-home">
                  <ArrowLeft size={16} />Home
                </Link>
                <Link href="/docs" className="flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground" onClick={() => setMobileMenuOpen(false)} data-testid="link-demo-mobile-docs">
                  <BookOpen size={16} className="text-teal-400" />Documents
                </Link>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main className="max-w-[1120px] mx-auto px-4 sm:px-6 py-8" style={{ "--mono": "'JetBrains Mono', monospace" } as React.CSSProperties}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.15fr", gap: 14 }} className="demo-grid">
          <style>{`.demo-grid { grid-template-columns: 1fr 1.15fr !important; } @media (max-width: 768px) { .demo-grid { grid-template-columns: 1fr !important; } }`}</style>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ background: "var(--card, #111113)", border: "1px solid var(--border, #1c1c20)", borderRadius: 7, padding: 12 }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: "#4ade80", letterSpacing: "0.06em", marginBottom: 8, display: "flex", alignItems: "center", gap: 5 }}>
                <span style={{ opacity: 0.4 }}>{"\u203A"}_</span> Agent Payload Injector
              </div>
              <div style={{ fontSize: 7.5, color: "#3f3f46", letterSpacing: "0.1em", marginBottom: 6 }} data-testid="label-demo-scenarios">PRELOADED SCENARIOS</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                {Object.entries(SCENARIOS).map(([key, s]) => (
                  <button key={key} onClick={() => pick(key)} style={{ background: scenario === key ? "rgba(74,222,128,0.05)" : "rgba(255,255,255,0.015)", border: `1px solid ${scenario === key ? "#4ade8028" : "var(--border, #1c1c20)"}`, borderRadius: 4, padding: "7px 9px", cursor: "pointer", textAlign: "left", transition: "all 0.12s" }} data-testid={`button-scenario-${key}`}>
                    <div style={{ fontSize: 10.5, fontWeight: 600, color: scenario === key ? "var(--foreground, #e4e4e7)" : "var(--muted-foreground, #a1a1aa)", fontFamily: "var(--mono)" }}>{s.label}</div>
                    <div style={{ fontSize: 8.5, color: "#52525b", marginTop: 1, fontFamily: "var(--mono)" }}>{s.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div style={{ background: "var(--card, #111113)", border: "1px solid var(--border, #1c1c20)", borderRadius: 7, padding: 12 }}>
              <div style={{ fontSize: 7.5, color: "#3f3f46", letterSpacing: "0.1em", marginBottom: 5, fontFamily: "var(--mono)" }} data-testid="label-demo-memo">"strategy_memo":</div>
              <div style={{ background: "var(--background, #09090b)", border: "1px solid var(--border, #1c1c20)", borderRadius: 3, padding: 9, fontSize: 10, color: "var(--foreground, #d4d4d8)", lineHeight: 1.65, fontFamily: "var(--mono)" }} data-testid="textarea-demo-memo">{sc.memo}</div>
            </div>

            <div style={{ background: "var(--card, #111113)", border: "1px solid var(--border, #1c1c20)", borderRadius: 7, padding: 12 }}>
              <div style={{ fontSize: 7.5, color: "#3f3f46", letterSpacing: "0.1em", marginBottom: 6, display: "flex", alignItems: "center", gap: 6, fontFamily: "var(--mono)" }}>AUDIT TIER <span style={{ fontSize: 7, color: "#f97316", background: "rgba(249,115,22,0.08)", padding: "1px 4px", borderRadius: 2 }} data-testid="badge-demo-pricing">DEMO PRICING</span></div>
              <div style={{ display: "flex", gap: 6 }} data-testid="tier-selector">
                {tiers.map(t => (
                  <button key={t.key} onClick={() => setTier(t.key)} style={{ flex: 1, padding: "8px 0", borderRadius: 4, cursor: "pointer", background: tier === t.key ? "rgba(74,222,128,0.08)" : "transparent", border: `1px solid ${tier === t.key ? "#4ade8033" : "var(--border, #1c1c20)"}`, textAlign: "center" }} data-testid={`button-tier-${t.key}`}>
                    <div style={{ fontSize: 9.5, fontWeight: 600, color: tier === t.key ? "#4ade80" : "#71717a", fontFamily: "var(--mono)" }}>{t.label}</div>
                    <div style={{ fontSize: 8.5, color: "#52525b", marginTop: 1, fontFamily: "var(--mono)" }}>{t.price}</div>
                  </button>
                ))}
              </div>
            </div>

            <button onClick={run} disabled={running} style={{ background: running ? "#18181b" : "linear-gradient(135deg, #16a34a, #15803d)", border: running ? "1px solid #27272a" : "1px solid #22c55e33", borderRadius: 7, padding: "11px 0", cursor: running ? "default" : "pointer", fontSize: 11.5, fontWeight: 700, color: running ? "#52525b" : "#fff", fontFamily: "var(--mono)", letterSpacing: "0.04em", width: "100%" }} data-testid="button-run-audit">
              {running ? "\u27F3 AUDITING..." : "\u25B7 Run DJZS Audit"}
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ background: "var(--card, #111113)", border: "1px solid var(--border, #1c1c20)", borderRadius: 7, padding: "12px 8px" }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: "#4ade80", letterSpacing: "0.06em", marginBottom: 10, display: "flex", alignItems: "center", gap: 5, fontFamily: "var(--mono)" }}>
                <span style={{ opacity: 0.4 }}>{"\u25C9"}</span> Pipeline Progress
              </div>
              <Steps step={pStep} />
            </div>

            <div style={{ background: "var(--card, #111113)", border: "1px solid var(--border, #1c1c20)", borderRadius: 7, padding: 12 }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: "#4ade80", letterSpacing: "0.06em", marginBottom: 12, display: "flex", alignItems: "center", gap: 5, fontFamily: "var(--mono)" }} data-testid="text-demo-result-title">
                <span style={{ opacity: 0.4 }}>{"\u203A"}_</span> ProofOfLogic Certificate
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
                <Gauge score={verdict.risk_score} verdict={verdict.audit_verdict} />
                <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                  <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: "0.04em", color: verdict.audit_verdict === "PASS" ? "#22c55e" : "#ef4444", background: verdict.audit_verdict === "PASS" ? "rgba(34,197,94,0.10)" : "rgba(239,68,68,0.10)", border: `1px solid ${verdict.audit_verdict === "PASS" ? "#22c55e28" : "#ef444428"}`, padding: "2px 7px", borderRadius: 3, fontFamily: "var(--mono)" }} data-testid="badge-result-verdict">
                      {verdict.audit_verdict === "PASS" ? "\u2713" : "\u26A0"} VERDICT: {verdict.audit_verdict}
                    </span>
                    <span style={{ fontSize: 9.5, color: "#a1a1aa", background: "#18181b", border: "1px solid #27272a", padding: "2px 7px", borderRadius: 3, fontFamily: "var(--mono)" }} data-testid="text-result-tier">TIER: {tier.toUpperCase()}</span>
                    <span style={{ fontSize: 9.5, color: "#71717a", background: "#18181b", border: "1px solid #27272a", padding: "2px 7px", borderRadius: 3, fontFamily: "var(--mono)" }}>THR: {verdict.pass_threshold}</span>
                  </div>
                  <div style={{ fontSize: 8, color: "#3f3f46", lineHeight: 1.6, fontFamily: "var(--mono)" }}>
                    <span data-testid="text-result-audit-id">ID: {verdict.audit_id?.slice(0, 28)}...</span><br />
                    <span data-testid="text-result-timestamp">TIME: {new Date(verdict.timestamp).toLocaleString()}</span><br />
                    BLOCK: #{verdict.threshold_block}
                  </div>
                </div>
              </div>

              <button onClick={() => setShowMeta(!showMeta)} style={{ width: "100%", background: "rgba(74,222,128,0.02)", border: "1px solid var(--border, #1c1c20)", borderRadius: 4, padding: "7px 9px", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }} data-testid="button-toggle-provenance">
                <span style={{ fontSize: 8, color: "#4ade80", letterSpacing: "0.1em", fontFamily: "var(--mono)" }}>AUDIT PROVENANCE</span>
                <div style={{ flex: 1 }} />
                <svg width="9" height="9" viewBox="0 0 9 9" fill="none" style={{ transform: showMeta ? "rotate(180deg)" : "none", transition: "transform 0.15s" }}>
                  <path d="M2 3.5l2.5 2.5L7 3.5" stroke="#3f3f46" strokeWidth="1.3" strokeLinecap="round"/>
                </svg>
              </button>
              {showMeta && (
                <div style={{ background: "var(--background, #09090b)", border: "1px solid var(--border, #1c1c20)", borderRadius: 4, padding: 9, marginBottom: 10, fontSize: 8.5, lineHeight: 1.9, fontFamily: "var(--mono)" }} data-testid="panel-provenance">
                  {[
                    ["audit_schema_version", verdict.audit_schema_version],
                    ["weights_hash", verdict.weights_hash],
                    ["logic_hash", verdict.logic_hash],
                    ["threshold_block", `#${verdict.threshold_block}`],
                    ["pass_threshold", verdict.pass_threshold],
                    ["max_possible", verdict.max_possible],
                    ["detection_model", verdict.detection_model],
                    ["scoring_engine", verdict.scoring_engine],
                    ["anchor_target", verdict.anchor_target],
                    ["settlement_chain", verdict.settlement_chain],
                  ].map(([k, v]) => (
                    <div key={k as string} style={{ display: "flex", gap: 8 }}>
                      <span style={{ color: "#3f3f46", minWidth: 140 }}>{k as string}:</span>
                      <span style={{ color: "#d4d4d8", wordBreak: "break-all" }}>{String(v)}</span>
                    </div>
                  ))}
                </div>
              )}

              {failed.length > 0 && (
                <div>
                  <div style={{ fontSize: 7.5, color: "#3f3f46", letterSpacing: "0.1em", marginBottom: 6, fontFamily: "var(--mono)" }} data-testid="label-result-flags">DETECTED FAILURES ({failed.length})</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    {failed.map(([code, flag]) => (
                      <Flag
                        key={code}
                        code={code}
                        data={LF_TAXONOMY[code]}
                        flag={flag}
                        open={expanded.has(code)}
                        toggle={() => toggle(code)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {failed.length === 0 && (
                <div style={{ textAlign: "center", padding: 20 }}>
                  <div style={{ fontSize: 11, color: "#22c55e", fontWeight: 600, fontFamily: "var(--mono)" }} data-testid="text-clean-pass">No failures detected</div>
                  <div style={{ fontSize: 9, color: "#3f3f46", marginTop: 4, fontFamily: "var(--mono)" }}>All 11 logic checks passed</div>
                </div>
              )}

              {verdict.risk_score > 0 && (() => {
                const catTotals: Record<string, number> = {};
                for (const [code] of failed) {
                  const def = LF_TAXONOMY[code];
                  if (def) catTotals[def.category] = (catTotals[def.category] || 0) + def.weight;
                }
                const cats = Object.entries(catTotals).sort((a, b) => b[1] - a[1]);
                return (
                  <div style={{ marginTop: 10 }} data-testid="panel-risk-composition">
                    <div style={{ fontSize: 7.5, color: "#3f3f46", letterSpacing: "0.1em", marginBottom: 5, fontFamily: "var(--mono)" }}>RISK COMPOSITION</div>
                    <div style={{ display: "flex", height: 10, borderRadius: 3, overflow: "hidden", background: "rgba(255,255,255,0.02)", border: "1px solid var(--border, #1c1c20)" }}>
                      {cats.map(([cat, pts]) => (
                        <div key={cat} style={{ width: `${(pts / verdict.risk_score) * 100}%`, background: CAT[cat] || "#71717a", transition: "width 0.3s ease" }} title={`${cat}: ${pts}pts`} data-testid={`bar-composition-${cat.toLowerCase()}`} />
                      ))}
                    </div>
                    <div style={{ display: "flex", gap: 10, marginTop: 5, flexWrap: "wrap" }}>
                      {cats.map(([cat, pts]) => (
                        <div key={cat} style={{ display: "flex", alignItems: "center", gap: 3 }}>
                          <div style={{ width: 6, height: 6, borderRadius: 1, background: CAT[cat] || "#71717a" }} />
                          <span style={{ fontSize: 7.5, color: "#71717a", fontFamily: "var(--mono)" }} data-testid={`text-composition-${cat.toLowerCase()}`}>{cat} {pts}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-border py-8 bg-card dark:bg-black font-mono mt-12">
        <div className="max-w-6xl mx-auto px-6 flex flex-col items-center space-y-3">
          <div className="flex gap-6">
            <Link href="/" className="text-sm text-muted-foreground hover:text-[#F37E20] transition-colors" data-testid="link-demo-footer-home">Home</Link>
            <Link href="/docs" className="text-sm text-muted-foreground hover:text-cyan-500 dark:hover:text-cyan-400 transition-colors" data-testid="link-demo-footer-docs">Documentation</Link>
          </div>
          <p className="text-xs text-muted-foreground/60" data-testid="text-demo-footer-tagline">
            &copy; 2026 DJZS Protocol. The A2A Economy Tollbooth.
          </p>
        </div>
      </footer>
    </div>
  );
}
