import { useState, useEffect } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Helmet } from "react-helmet";
import { useTheme } from "@/lib/theme";
import {
  ArrowLeft, ArrowRight, Play, Terminal, ShieldCheck, ShieldAlert,
  AlertTriangle, CheckCircle2, Upload, Database, ExternalLink,
  ChevronDown, ChevronUp, Sun, Moon, FlaskConical, BookOpen, Menu, X, Lock
} from "lucide-react";

const DEMO_SCENARIOS = {
  fomo: {
    label: "FOMO Momentum Buy",
    description: "Social-driven pump chase with no verified data",
    memo: "EXECUTE IMMEDIATE BUY: 500 SOL of $SHILL. 1-minute volume is spiking and Crypto Twitter implies a tier-1 exchange listing today. Cannot miss this pump.",
    response: {
      audit_id: "d7e3a1f0-9c4b-4e2a-b8f1-3a5c7d9e2b4f",
      timestamp: "2026-02-25T01:12:44.000Z",
      tier: "micro" as const,
      verdict: "FAIL" as const,
      risk_score: 98,
      primary_bias_detected: "FOMO",
      flags: [
        { code: "DJZS-I01", severity: "CRITICAL", message: "FOMO Loop — execution driven by social momentum and unverified Twitter sentiment.", evidence: "Memo references '1-minute volume spike' and 'Crypto Twitter implies' as sole justification.", recommendation: "Verify exchange listing via official announcement channels before any capital deployment." },
        { code: "DJZS-X01", severity: "CRITICAL", message: "Unhedged Execution — no stop-loss, position sizing, or max drawdown defined.", evidence: "500 SOL allocation with zero risk bounds specified.", recommendation: "Define position size limits based on verified liquidity depth and set explicit stop-loss levels." }
      ],
      logic_flaws: [
        { flaw_type: "Momentum Dependency", severity: "critical", explanation: "Trade thesis relies entirely on 1-minute volume spike and unverified exchange listing rumor." },
        { flaw_type: "Missing Falsifiability", severity: "critical", explanation: "No exit condition or failure scenario defined. If listing doesn't happen, no abort trigger exists." }
      ],
      structural_recommendations: ["Verify exchange listing via official announcement channels", "Set position size limits based on verified liquidity depth", "Define explicit stop-loss and max drawdown thresholds"],
      cryptographic_hash: "4a9b2c8f1e3d7a6b0c5f9e2d8a1b4c7f3e6d9a0b5c8f1e2d7a4b9c6f3e0d8a1b",
      provenance_provider: "IRYS_DATACHAIN",
      irys_tx_id: "8kNMzL4hgLoXo7SNEsgPSJ8oCETs15jKwioke3V2rSH",
      irys_url: "https://gateway.irys.xyz/8kNMzL4hgLoXo7SNEsgPSJ8oCETs15jKwioke3V2rSH",
      basescan_tx: "0x7a3b9c1d2e4f5678901234567890abcdef1234567890abcdef1234567890abcd"
    }
  },
  hallucination: {
    label: "Hallucinated Data",
    description: "References a protocol and audit that don't exist",
    memo: "Routing 50k USDC into Yield Protocol V4 based on their latest audit report from yesterday.",
    response: {
      audit_id: "a2b4c6d8-e0f1-4a3b-c5d7-e9f0a1b2c3d4",
      timestamp: "2026-02-25T01:13:02.000Z",
      tier: "micro" as const,
      verdict: "FAIL" as const,
      risk_score: 85,
      primary_bias_detected: "Confirmation_Bias",
      flags: [
        { code: "DJZS-E01", severity: "HIGH", message: "Epistemic Failure — Yield Protocol V4 does not exist. No audit report was published.", evidence: "Referenced 'Yield Protocol V4' and 'latest audit report from yesterday' — neither can be verified.", recommendation: "Cross-reference all protocol names against verified registries before capital allocation." },
        { code: "DJZS-E02", severity: "HIGH", message: "Authority Substitution — reliance on unverifiable audit claim.", evidence: "Decision based on 'their latest audit report' without linking to any verifiable source.", recommendation: "Require on-chain contract verification and link to published audit reports." }
      ],
      logic_flaws: [
        { flaw_type: "Hallucinated Reference", severity: "critical", explanation: "The referenced protocol and audit report cannot be verified against any known source." }
      ],
      structural_recommendations: ["Cross-reference all protocol names against verified registries", "Require on-chain contract verification before capital allocation", "Link to published, verifiable audit reports"],
      cryptographic_hash: "7f2e1a9b3c5d8f0e4a6b2c7d1e3f9a5b8c0d4e6f2a7b1c3d5e9f0a8b4c6d2e7f",
      provenance_provider: "IRYS_DATACHAIN",
      irys_tx_id: "5rPQzM7kfHnWp9TNDrtgQRK9pBDUt26kXxjplf4W3tUI",
      irys_url: "https://gateway.irys.xyz/5rPQzM7kfHnWp9TNDrtgQRK9pBDUt26kXxjplf4W3tUI",
      basescan_tx: "0x2b4c6d8e0f1a3b5c7d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c"
    }
  },
  valid: {
    label: "Clean Strategy",
    description: "Well-structured DCA with verified parameters",
    memo: "Executing DCA of 2 ETH. Structural support verified at $2800. Liquidity depth is sufficient. Max slippage set to 0.5%.",
    response: {
      audit_id: "fe1f14d0-73ac-4467-ac33-d76bf3fdce21",
      timestamp: "2026-02-25T01:14:18.000Z",
      tier: "micro" as const,
      verdict: "PASS" as const,
      risk_score: 12,
      primary_bias_detected: "None",
      flags: [],
      logic_flaws: [],
      structural_recommendations: ["Continue to verify liquidity depth at execution time", "Monitor slippage tolerance against real-time spread"],
      cryptographic_hash: "9b3a4f2c1e7d8a0b5c6f3e9d2a1b4c7f0e8d5a3b6c9f1e2d7a4b0c5f8e3d6a9b",
      provenance_provider: "IRYS_DATACHAIN",
      irys_tx_id: "71oNMzL4hgLoXo7SNEsgPSJ8oCETs15jKwioke3V2rSH",
      irys_url: "https://gateway.irys.xyz/71oNMzL4hgLoXo7SNEsgPSJ8oCETs15jKwioke3V2rSH",
      basescan_tx: "0x9b3a4f2c1e7d8a0b5c6f3e9d2a1b4c7f0e8d5a3b6c9f1e2d7a4b0c5f8e3d6a9b"
    }
  },
  edge: {
    label: "Race Condition Edge Case",
    description: "Reasonable strategy with hidden temporal risk",
    memo: "Arbitrage opportunity: ETH is $2,845 on DEX-A and $2,860 on DEX-B. Executing simultaneous buy/sell across both venues. Expected profit: 0.53% after gas. Slippage tolerance: 0.1%.",
    response: {
      audit_id: "c3d5e7f9-a1b3-4c5d-e7f9-a1b3c5d7e9f1",
      timestamp: "2026-02-25T01:15:33.000Z",
      tier: "founder" as const,
      verdict: "FAIL" as const,
      risk_score: 62,
      primary_bias_detected: "Overconfidence",
      flags: [
        { code: "DJZS-T02", severity: "MEDIUM", message: "Race Condition Risk — assumes sequential execution but could be front-run.", evidence: "Cross-DEX arbitrage with 0.1% slippage tolerance is vulnerable to MEV bots and block-level front-running.", recommendation: "Use Flashbots or private transaction relay to prevent MEV extraction." },
        { code: "DJZS-X03", severity: "MEDIUM", message: "Slippage Exposure — 0.1% tolerance may be insufficient for cross-venue execution.", evidence: "0.53% expected profit with 0.1% slippage tolerance leaves minimal margin for execution costs.", recommendation: "Increase slippage tolerance or reduce position size to account for cross-venue latency." }
      ],
      logic_flaws: [
        { flaw_type: "Temporal Assumption", severity: "high", explanation: "Arbitrage assumes prices remain stable across the execution window of two separate transactions." }
      ],
      structural_recommendations: ["Use Flashbots or private mempool for MEV protection", "Account for gas costs across both transactions in profit calculation", "Add circuit breaker if price delta closes below 0.3% before second leg executes"],
      cryptographic_hash: "c3d5e7f9a1b3c5d7e9f1a3b5c7d9e1f3a5b7c9d1e3f5a7b9c1d3e5f7a9b1c3d5",
      provenance_provider: "IRYS_DATACHAIN",
      irys_tx_id: "3mKPxN8jgIoYp6QOFthRSK0oDCVu37lYxzkqmg5X4uVJ",
      irys_url: "https://gateway.irys.xyz/3mKPxN8jgIoYp6QOFthRSK0oDCVu37lYxzkqmg5X4uVJ",
      basescan_tx: "0xc3d5e7f9a1b3c5d7e9f1a3b5c7d9e1f3a5b7c9d1e3f5a7b9c1d3e5f7a9b1c3d5"
    }
  }
} as const;

type DemoScenario = keyof typeof DEMO_SCENARIOS;

const PIPELINE_STEPS = [
  { id: "signature", label: "Signature", icon: Lock, description: "Verifying request signature" },
  { id: "hash-check", label: "Hash Check", icon: ShieldAlert, description: "Validating payload integrity" },
  { id: "auditing", label: "Auditing", icon: FlaskConical, description: "Adversarial analysis in TEE" },
  { id: "uploading", label: "Irys Upload", icon: Upload, description: "Certificate stored on Datachain" },
  { id: "settlement", label: "Settlement", icon: Database, description: "On-chain settlement on Base" },
  { id: "complete", label: "Complete", icon: CheckCircle2, description: "ProofOfLogic certificate ready" },
];

const TIER_OPTIONS = [
  { value: "micro", label: "Micro-Zone", price: "$2.50", description: "Binary risk scoring" },
  { value: "founder", label: "Founder Zone", price: "$5.00", description: "Strategic diligence" },
  { value: "treasury", label: "Treasury Zone", price: "$50.00", description: "Exhaustive stress-test" },
];

function RiskScoreGauge({ score }: { score: number }) {
  const color = score >= 70 ? "#ef4444" : score >= 40 ? "#f59e0b" : "#22c55e";
  const circumference = 2 * Math.PI * 45;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative w-28 h-28 flex-shrink-0">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="6" className="text-muted/30" />
        <motion.circle
          cx="50" cy="50" r="45" fill="none" stroke={color} strokeWidth="6"
          strokeLinecap="round" strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold font-mono" style={{ color }} data-testid="text-risk-score-value">{score}</span>
        <span className="text-[10px] text-muted-foreground font-mono">/ 100</span>
      </div>
    </div>
  );
}

function FlagCard({ flag, index }: { flag: { code: string; severity: string; message: string; evidence: string; recommendation: string }; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const severityColor = flag.severity === "CRITICAL" ? "text-red-500 dark:text-red-400 border-red-500/30 bg-red-500/10" :
    flag.severity === "HIGH" ? "text-orange-500 dark:text-orange-400 border-orange-500/30 bg-orange-500/10" :
    "text-yellow-500 dark:text-yellow-400 border-yellow-500/30 bg-yellow-500/10";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="border border-border dark:border-gray-800 rounded-lg overflow-hidden bg-card dark:bg-[#111]"
      data-testid={`card-flag-${flag.code.toLowerCase()}`}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/50 dark:hover:bg-white/5 transition-colors"
        data-testid={`button-expand-flag-${flag.code.toLowerCase()}`}
      >
        <div className="flex items-center gap-3 min-w-0">
          <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded border ${severityColor}`} data-testid={`badge-flag-severity-${index}`}>
            {flag.severity}
          </span>
          <span className="font-mono text-sm text-foreground/80 font-semibold" data-testid={`text-flag-code-${index}`}>{flag.code}</span>
          <span className="text-sm text-muted-foreground truncate hidden sm:inline">{flag.message.split("—")[0]}</span>
        </div>
        {expanded ? <ChevronUp size={16} className="text-muted-foreground flex-shrink-0" /> : <ChevronDown size={16} className="text-muted-foreground flex-shrink-0" />}
      </button>
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-3 border-t border-border dark:border-gray-800">
              <div className="pt-3">
                <div className="text-xs font-mono text-muted-foreground mb-1">MESSAGE</div>
                <p className="text-sm text-foreground/80">{flag.message}</p>
              </div>
              <div>
                <div className="text-xs font-mono text-muted-foreground mb-1">EVIDENCE</div>
                <p className="text-sm text-foreground/70 italic">{flag.evidence}</p>
              </div>
              <div>
                <div className="text-xs font-mono text-muted-foreground mb-1">RECOMMENDATION</div>
                <p className="text-sm text-teal-600 dark:text-teal-400">{flag.recommendation}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function Demo() {
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [memo, setMemo] = useState("");
  const [tier, setTier] = useState("micro");
  const [running, setRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);
  const [result, setResult] = useState<(typeof DEMO_SCENARIOS)[DemoScenario]["response"] | null>(null);

  const loadScenario = (key: DemoScenario) => {
    setMemo(DEMO_SCENARIOS[key].memo);
    setTier(DEMO_SCENARIOS[key].response.tier);
    setResult(null);
    setCurrentStep(-1);
    setRunning(false);
  };

  const runAudit = () => {
    if (!memo.trim() || running) return;
    setRunning(true);
    setResult(null);
    setCurrentStep(0);
  };

  useEffect(() => {
    if (!running || currentStep < 0) return;

    if (currentStep < PIPELINE_STEPS.length - 1) {
      const timer = setTimeout(() => setCurrentStep(prev => prev + 1), 650);
      return () => clearTimeout(timer);
    }

    if (currentStep === PIPELINE_STEPS.length - 1) {
      const timer = setTimeout(() => {
        const matchKey = Object.keys(DEMO_SCENARIOS).find(
          k => DEMO_SCENARIOS[k as DemoScenario].memo === memo
        ) as DemoScenario | undefined;

        if (matchKey) {
          setResult(DEMO_SCENARIOS[matchKey].response);
        } else {
          setResult({
            audit_id: crypto.randomUUID(),
            timestamp: new Date().toISOString(),
            tier: tier as "micro" | "founder" | "treasury",
            verdict: "FAIL" as const,
            risk_score: 72,
            primary_bias_detected: "Unknown",
            flags: [
              { code: "DJZS-S02", severity: "CRITICAL", message: "Missing Falsifiability — no failure condition defined in the reasoning trace.", evidence: "Custom memo lacks explicit exit conditions or risk bounds.", recommendation: "Define clear failure conditions and abort triggers before executing." }
            ],
            logic_flaws: [
              { flaw_type: "Incomplete Reasoning", severity: "high", explanation: "The submitted reasoning trace lacks the structural rigor required for a PASS verdict." }
            ],
            structural_recommendations: ["Add explicit failure conditions", "Define position sizing and risk bounds", "Include verifiable data sources"],
            cryptographic_hash: "ab3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c",
            provenance_provider: "IRYS_DATACHAIN",
            irys_tx_id: "demo_" + Date.now(),
            irys_url: "https://gateway.irys.xyz/demo_" + Date.now(),
            basescan_tx: "0xdemo" + Date.now().toString(16)
          });
        }
        setRunning(false);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [running, currentStep, memo, tier]);

  return (
    <div className="min-h-screen text-foreground bg-background">
      <Helmet>
        <title>Live Demo | DJZS Protocol — Audit-to-Certificate Pipeline</title>
        <meta name="description" content="Try the DJZS Zero-Trust Oracle live. Paste a reasoning memo, run an audit, and see the full pipeline: signature, hash check, audit, Irys upload, and on-chain settlement." />
        <meta property="og:title" content="DJZS Live Demo — Audit-to-Certificate Pipeline" />
        <meta property="og:description" content="See the full DJZS audit pipeline in action. Paste a memo, select a tier, and watch the ProofOfLogic certificate get generated." />
      </Helmet>

      <header className="sticky top-0 z-50 backdrop-blur-xl border-b border-border bg-background/90" style={{ boxShadow: '0 1px 20px rgba(0,0,0,0.08)' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <Link href="/">
            <span className="flex items-center gap-2.5" data-testid="link-demo-home-logo">
              <img src="/logo.png" alt="DJZS" className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg transition-transform hover:scale-105" style={{ filter: 'drop-shadow(0 0 4px rgba(243,126,32,0.3))' }} />
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

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-mono mb-4" style={{ border: '1px solid rgba(243,126,32,0.3)', background: 'rgba(243,126,32,0.08)', color: '#F37E20' }}>
            <FlaskConical size={16} />
            <span>Live Demo</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight mb-3 text-foreground" data-testid="text-demo-page-title">
            Audit-to-Certificate Pipeline
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg max-w-2xl" data-testid="text-demo-page-subtitle">
            Paste a reasoning memo, select an audit tier, and watch the full pipeline execute: signature verification, adversarial analysis, Irys upload, and on-chain settlement.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 sm:gap-8">
          <div className="lg:col-span-2 space-y-6">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="rounded-xl border border-border dark:border-gray-800 bg-card dark:bg-[#111] overflow-hidden">
              <div className="px-5 py-4 border-b border-border dark:border-gray-800 bg-muted dark:bg-[#0d0d0d]">
                <div className="flex items-center gap-2">
                  <Terminal size={18} className="text-cyan-500 dark:text-cyan-400" />
                  <h2 className="font-semibold text-foreground text-sm" data-testid="text-demo-input-title">Agent Payload Injector</h2>
                </div>
              </div>

              <div className="p-5 space-y-5">
                <div>
                  <label className="text-xs font-mono text-muted-foreground mb-2 block" data-testid="label-demo-scenarios">PRELOADED SCENARIOS</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2">
                    {(Object.keys(DEMO_SCENARIOS) as DemoScenario[]).map((key) => (
                      <button
                        key={key}
                        onClick={() => loadScenario(key)}
                        className={`w-full text-left px-3 py-2.5 rounded-lg border transition-all text-sm ${
                          memo === DEMO_SCENARIOS[key].memo
                            ? "border-purple-500 bg-purple-500/10 text-purple-600 dark:text-purple-300"
                            : "border-border dark:border-gray-800 hover:border-purple-500/30 text-muted-foreground hover:text-foreground"
                        }`}
                        data-testid={`button-scenario-${key}`}
                      >
                        <div className="font-medium">{DEMO_SCENARIOS[key].label}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">{DEMO_SCENARIOS[key].description}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-mono text-muted-foreground mb-2 block" data-testid="label-demo-memo">"strategy_memo":</label>
                  <textarea
                    value={memo}
                    onChange={(e) => setMemo(e.target.value)}
                    placeholder="Paste your reasoning memo here or select a scenario above..."
                    className="w-full p-4 rounded-lg bg-background dark:bg-black border border-border dark:border-gray-800 font-mono text-sm text-foreground/80 h-36 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500/50 transition-all placeholder:text-muted-foreground/40"
                    data-testid="textarea-demo-memo"
                  />
                </div>

                <div>
                  <label className="text-xs font-mono text-muted-foreground mb-2 block" data-testid="label-demo-tier">AUDIT TIER</label>
                  <div className="grid grid-cols-3 gap-2">
                    {TIER_OPTIONS.map((t) => (
                      <button
                        key={t.value}
                        onClick={() => setTier(t.value)}
                        className={`px-3 py-2.5 rounded-lg border text-center transition-all ${
                          tier === t.value
                            ? "border-[#F37E20] bg-[#F37E20]/10 text-[#F37E20]"
                            : "border-border dark:border-gray-800 text-muted-foreground hover:border-[#F37E20]/30"
                        }`}
                        data-testid={`button-tier-${t.value}`}
                      >
                        <div className="text-xs font-bold">{t.label}</div>
                        <div className="text-[10px] mt-0.5 opacity-70">{t.price}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={runAudit}
                  disabled={!memo.trim() || running}
                  className="w-full flex items-center justify-center gap-2 py-4 rounded-lg font-bold text-white transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ background: '#F37E20', boxShadow: memo.trim() && !running ? '0 4px 20px rgba(243,126,32,0.3)' : 'none' }}
                  data-testid="button-run-audit"
                >
                  {running ? (
                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                      <Terminal size={20} />
                    </motion.div>
                  ) : (
                    <Play size={20} />
                  )}
                  <span>{running ? "ORACLE SCANNING..." : "Run DJZS Audit"}</span>
                </button>
              </div>
            </motion.div>
          </div>

          <div className="lg:col-span-3 space-y-6">
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="rounded-xl border border-border dark:border-gray-800 bg-card dark:bg-[#111] overflow-hidden">
              <div className="px-5 py-4 border-b border-border dark:border-gray-800 bg-muted dark:bg-[#0d0d0d]">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={18} className="text-green-500 dark:text-green-400" />
                  <h2 className="font-semibold text-foreground text-sm" data-testid="text-demo-pipeline-title">Pipeline Progress</h2>
                </div>
              </div>

              <div className="p-5">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-0 sm:justify-between">
                  {PIPELINE_STEPS.map((step, i) => {
                    const StepIcon = step.icon;
                    const isActive = i === currentStep;
                    const isComplete = i < currentStep || (i === PIPELINE_STEPS.length - 1 && result !== null);
                    const isPending = i > currentStep && !result;

                    return (
                      <div key={step.id} className="flex sm:flex-col items-center gap-2 sm:gap-1 sm:flex-1 relative">
                        {i > 0 && (
                          <div className="hidden sm:block absolute -left-1/2 top-[14px] w-full h-[2px] bg-border dark:bg-gray-800 -z-10">
                            {isComplete && (
                              <motion.div
                                className="h-full bg-green-500"
                                initial={{ width: "0%" }}
                                animate={{ width: "100%" }}
                                transition={{ duration: 0.3 }}
                              />
                            )}
                          </div>
                        )}
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center transition-all flex-shrink-0 ${
                            isComplete ? "bg-green-500/20 text-green-500 dark:text-green-400 border border-green-500/30" :
                            isActive ? "bg-[#F37E20]/20 text-[#F37E20] border border-[#F37E20]/30 animate-pulse" :
                            "bg-muted dark:bg-gray-900 text-muted-foreground border border-border dark:border-gray-800"
                          }`}
                          data-testid={`step-icon-${step.id}`}
                        >
                          {isComplete ? <CheckCircle2 size={14} /> : <StepIcon size={14} />}
                        </div>
                        <div className="sm:text-center">
                          <div className={`text-[11px] font-mono font-medium ${
                            isComplete ? "text-green-600 dark:text-green-400" :
                            isActive ? "text-[#F37E20]" :
                            "text-muted-foreground"
                          }`} data-testid={`step-label-${step.id}`}>{step.label}</div>
                          <div className="text-[10px] text-muted-foreground/60 hidden sm:block">{step.description}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>

            <AnimatePresence mode="wait">
              {result ? (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="rounded-xl border border-border dark:border-gray-800 bg-card dark:bg-[#111] overflow-hidden"
                  data-testid="demo-result-container"
                >
                  <div className="px-5 py-4 border-b border-border dark:border-gray-800 bg-muted dark:bg-[#0d0d0d]">
                    <div className="flex items-center gap-2">
                      <Terminal size={18} className="text-purple-500 dark:text-purple-400" />
                      <h2 className="font-semibold text-foreground text-sm" data-testid="text-demo-result-title">ProofOfLogic Certificate</h2>
                    </div>
                  </div>

                  <div className="p-5 sm:p-6 space-y-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
                      <RiskScoreGauge score={result.risk_score} />
                      <div className="space-y-3 flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          {result.verdict === "FAIL" ? (
                            <span className="px-3 py-1.5 bg-red-500/20 text-red-500 dark:text-red-400 rounded-lg border border-red-500/30 flex items-center text-sm font-bold" data-testid="badge-result-verdict">
                              <AlertTriangle size={16} className="mr-1.5" /> VERDICT: FAIL
                            </span>
                          ) : (
                            <span className="px-3 py-1.5 bg-green-500/20 text-green-600 dark:text-green-400 rounded-lg border border-green-500/30 flex items-center text-sm font-bold" data-testid="badge-result-verdict">
                              <ShieldCheck size={16} className="mr-1.5" /> VERDICT: PASS
                            </span>
                          )}
                          <span className="px-3 py-1.5 bg-muted dark:bg-gray-900 text-muted-foreground rounded-lg border border-border dark:border-gray-800 text-xs font-mono" data-testid="text-result-tier">
                            TIER: {result.tier.toUpperCase()}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground font-mono space-y-1">
                          <div data-testid="text-result-audit-id">ID: {result.audit_id}</div>
                          <div data-testid="text-result-timestamp">TIME: {new Date(result.timestamp).toLocaleString()}</div>
                          {result.primary_bias_detected !== "None" && (
                            <div data-testid="text-result-bias">BIAS: <span className="text-[#F37E20]">{result.primary_bias_detected}</span></div>
                          )}
                        </div>
                      </div>
                    </div>

                    {result.flags.length > 0 && (
                      <div>
                        <div className="text-xs font-mono text-muted-foreground mb-3" data-testid="label-result-flags">FAILURE CODES ({result.flags.length})</div>
                        <div className="space-y-2">
                          {result.flags.map((flag, i) => (
                            <FlagCard key={i} flag={flag} index={i} />
                          ))}
                        </div>
                      </div>
                    )}

                    {result.structural_recommendations.length > 0 && (
                      <div>
                        <div className="text-xs font-mono text-muted-foreground mb-2" data-testid="label-result-recommendations">RECOMMENDATIONS</div>
                        <ul className="space-y-1.5">
                          {result.structural_recommendations.map((rec, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-foreground/70">
                              <ArrowRight size={14} className="mt-0.5 text-teal-500 dark:text-teal-400 flex-shrink-0" />
                              <span data-testid={`text-recommendation-${i}`}>{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="border-t border-border dark:border-gray-800 pt-4 space-y-3">
                      <div className="text-xs font-mono text-muted-foreground" data-testid="label-result-provenance">ON-CHAIN PROVENANCE</div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <a
                          href={result.irys_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-4 py-3 rounded-lg border border-purple-500/30 bg-purple-500/5 hover:bg-purple-500/10 transition-colors group"
                          data-testid="link-result-irys"
                        >
                          <Database size={16} className="text-purple-500 dark:text-purple-400" />
                          <div className="min-w-0 flex-1">
                            <div className="text-xs font-mono font-bold text-purple-600 dark:text-purple-300">Irys Certificate</div>
                            <div className="text-[10px] font-mono text-muted-foreground truncate">{result.irys_tx_id}</div>
                          </div>
                          <ExternalLink size={14} className="text-muted-foreground group-hover:text-purple-400 transition-colors flex-shrink-0" />
                        </a>
                        <a
                          href={`https://basescan.org/tx/${result.basescan_tx}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-4 py-3 rounded-lg border border-cyan-500/30 bg-cyan-500/5 hover:bg-cyan-500/10 transition-colors group"
                          data-testid="link-result-basescan"
                        >
                          <ShieldCheck size={16} className="text-cyan-500 dark:text-cyan-400" />
                          <div className="min-w-0 flex-1">
                            <div className="text-xs font-mono font-bold text-cyan-600 dark:text-cyan-300">BaseScan TX</div>
                            <div className="text-[10px] font-mono text-muted-foreground truncate">{result.basescan_tx}</div>
                          </div>
                          <ExternalLink size={14} className="text-muted-foreground group-hover:text-cyan-400 transition-colors flex-shrink-0" />
                        </a>
                      </div>
                      <div className="text-[10px] font-mono text-muted-foreground/60 break-all" data-testid="text-result-hash">
                        SHA-256: {result.cryptographic_hash}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : !running ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="rounded-xl border border-dashed border-border dark:border-gray-800 bg-card/50 dark:bg-[#111]/50 p-12 flex flex-col items-center justify-center text-center"
                  data-testid="demo-empty-state"
                >
                  <ShieldAlert size={48} className="text-muted-foreground/30 mb-4" />
                  <p className="text-muted-foreground font-mono text-sm mb-1">No audit running</p>
                  <p className="text-muted-foreground/60 text-xs">Select a scenario or paste a memo, then click "Run DJZS Audit"</p>
                </motion.div>
              ) : null}
            </AnimatePresence>
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