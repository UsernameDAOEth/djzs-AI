import { useState, useEffect, useRef, useCallback } from "react";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Helmet } from "react-helmet";
import { useTheme } from "@/lib/theme";
import { TorusLogo } from "@/components/TorusLogo";
import { getVeniceApiKey } from "@/lib/queryClient";
import {
  ArrowLeft, ArrowRight, Play, Terminal, ShieldCheck, ShieldAlert,
  AlertTriangle, CheckCircle2, Upload, Database, ExternalLink,
  ChevronDown, ChevronUp, Sun, Moon, FlaskConical, BookOpen, Menu, X, Lock, Wallet
} from "lucide-react";

const DEMO_SCENARIOS = [
  {
    key: "fomo",
    label: "FOMO Momentum Buy",
    description: "Social-driven pump chase with no verified data",
    memo: "EXECUTE IMMEDIATE BUY: 500 SOL of $SHILL. 1-minute volume is spiking and Crypto Twitter implies a tier-1 exchange listing today. Cannot miss this pump.",
  },
  {
    key: "hallucination",
    label: "Hallucinated Data",
    description: "References a protocol and audit that don't exist",
    memo: "Routing 50k USDC into Yield Protocol V4 based on their latest audit report from yesterday.",
  },
  {
    key: "valid",
    label: "Clean Strategy",
    description: "Well-structured DCA with verified parameters",
    memo: "Strategy Memo: Rebalance DAO Treasury — Conservative Yield Allocation. Current treasury: $2.4M USDC across 3 wallets on Base Mainnet. Proposal: Allocate 12% ($288,000) to Aave V3 USDC lending pool on Base. Rationale: Aave V3 Base USDC supply APY has averaged 3.8% over the past 90 days (source: DefiLlama, verified March 10 2026). 12% allocation is within our 15% single-protocol concentration limit per governance vote GV-2026-003. Aave V3 on Base has $847M TVL with no exploit history since deployment. Remaining 88% stays in USDC across existing custody wallets. Falsifiability: This strategy is WRONG if Aave V3 TVL drops below $200M, USDC APY falls below 1.5%, or any security incident is disclosed. Risk assessment: Smart contract risk - Aave V3 audited by Trail of Bits, Certora, SigmaPrime. Bug bounty $250K via Immunefi. Liquidity risk - $847M TVL means $288K position is 0.034% of pool, instant withdrawal. Rate risk - If APY drops below 2%, auto-withdraw. Worst case: Full protocol exploit = $288K loss (12% of treasury). Treasury survives at $2.1M. Operations unaffected. Execution: Single transaction via treasury multisig (3-of-5 signers). No leverage, no derivatives, no bridging. Stop-loss: Auto-withdraw if TVL drops below $200M. Timeline: Execute within 48 hours of governance approval. No urgency.",
  },
  {
    key: "edge",
    label: "Race Condition Edge Case",
    description: "Reasonable strategy with hidden temporal risk",
    memo: "Arbitrage opportunity: ETH is $2,845 on DEX-A and $2,860 on DEX-B. Executing simultaneous buy/sell across both venues. Expected profit: 0.53% after gas. Slippage tolerance: 0.1%.",
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

function FlagCard({ flag, index }: { flag: AuditFlag; index: number }) {
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
          <span className="text-sm text-muted-foreground truncate hidden sm:inline">{(flag.message || "").split("—")[0]}</span>
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
              {flag.evidence && (
                <div>
                  <div className="text-xs font-mono text-muted-foreground mb-1">EVIDENCE</div>
                  <p className="text-sm text-foreground/70 italic">{flag.evidence}</p>
                </div>
              )}
              {flag.recommendation && (
                <div>
                  <div className="text-xs font-mono text-muted-foreground mb-1">RECOMMENDATION</div>
                  <p className="text-sm text-teal-600 dark:text-teal-400">{flag.recommendation}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function Chat() {
  const { theme, toggleTheme } = useTheme();
  const { address, isConnected } = useAccount();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
      const endpoint = tier === "treasury" ? "/api/audit/treasury"
        : tier === "founder" ? "/api/audit/founder" : "/api/audit/micro";
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
    } catch (err: any) {
      if (err.name === "AbortError") return;
      setError(err.message || "Audit request failed");
      setCurrentStep(-1);
    } finally {
      setRunning(false);
      abortRef.current = null;
    }
  }, [memo, tier, running, isConnected, address]);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  return (
    <div className="min-h-screen text-foreground bg-background">
      <Helmet>
        <title>x402 Audit Console — Live | DJZS Protocol</title>
        <meta name="description" content="Route your reasoning trace through the x402 Oracle. Real USDC payments on Base Mainnet. Adversarial analysis, Irys Datachain upload, and on-chain trust score settlement." />
        <meta property="og:title" content="DJZS x402 Audit Console" />
        <meta property="og:description" content="Wallet-gated audit console. Pay with USDC on Base Mainnet via x402 protocol. Full ProofOfLogic certificate pipeline." />
      </Helmet>

      <header className="sticky top-0 z-50 backdrop-blur-xl border-b border-border bg-background/90" style={{ boxShadow: '0 1px 20px rgba(0,0,0,0.08)' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <Link href="/">
            <span className="flex items-center gap-2.5" data-testid="link-chat-home-logo">
              <TorusLogo />
              <span className="text-lg sm:text-xl font-bold tracking-tighter text-foreground">DJZS<span className="text-purple-500">.ai</span></span>
            </span>
          </Link>
          <div className="flex items-center gap-3 sm:gap-5">
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
              <Link href="/" className="group flex items-center gap-2 px-3 py-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all" data-testid="link-chat-header-home">
                <ArrowLeft size={15} />
                Home
              </Link>
              <Link href="/docs" className="group flex items-center gap-2 px-3 py-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all" data-testid="link-chat-header-docs">
                <BookOpen size={15} className="text-teal-400 group-hover:text-teal-300 transition-colors" />
                Documents
              </Link>
            </nav>
            <div className="hidden sm:block" data-testid="wallet-connect-button">
              <ConnectButton chainStatus="icon" showBalance={false} />
            </div>
            <button onClick={toggleTheme} className="w-10 h-10 rounded-lg flex items-center justify-center transition-colors hover:bg-muted" data-testid="button-chat-theme-toggle" aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden w-10 h-10 rounded-lg flex items-center justify-center transition-colors hover:bg-muted" data-testid="button-chat-mobile-menu" aria-label="Menu">
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div key="mobile-menu" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="md:hidden border-t border-border overflow-hidden bg-background/98">
              <nav className="flex flex-col px-4 py-3 gap-1">
                <Link href="/" className="flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground" onClick={() => setMobileMenuOpen(false)} data-testid="link-chat-mobile-home">
                  <ArrowLeft size={16} />Home
                </Link>
                <Link href="/docs" className="flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground" onClick={() => setMobileMenuOpen(false)} data-testid="link-chat-mobile-docs">
                  <BookOpen size={16} className="text-teal-400" />Documents
                </Link>
                <div className="px-4 py-3 sm:hidden" data-testid="wallet-connect-mobile">
                  <ConnectButton chainStatus="icon" showBalance={false} />
                </div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-mono mb-4" style={{ border: '1px solid rgba(243,126,32,0.3)', background: 'rgba(243,126,32,0.08)', color: '#F37E20' }}>
            <FlaskConical size={16} />
            <span data-testid="badge-chat-mode">x402 Audit Console — Live</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight mb-3 text-foreground" data-testid="text-chat-page-title">
            Audit-to-Certificate Pipeline
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg max-w-2xl" data-testid="text-chat-page-subtitle">
            Route your reasoning trace through the x402 Oracle. Real USDC payments on Base Mainnet.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 sm:gap-8">
          <div className="lg:col-span-2 space-y-6">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="rounded-xl border border-border dark:border-gray-800 bg-card dark:bg-[#111] overflow-hidden">
              <div className="px-5 py-4 border-b border-border dark:border-gray-800 bg-muted dark:bg-[#0d0d0d]">
                <div className="flex items-center gap-2">
                  <Terminal size={18} className="text-cyan-500 dark:text-cyan-400" />
                  <h2 className="font-semibold text-foreground text-sm" data-testid="text-chat-input-title">Agent Payload Injector</h2>
                </div>
              </div>

              <div className="p-5 space-y-5">
                <div>
                  <label className="text-xs font-mono text-muted-foreground mb-2 block" data-testid="label-chat-scenarios">PRELOADED SCENARIOS</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2">
                    {DEMO_SCENARIOS.map((scenario) => (
                      <button
                        key={scenario.key}
                        onClick={() => loadScenario(scenario.key)}
                        className={`w-full text-left px-3 py-2.5 rounded-lg border transition-all text-sm ${
                          memo === scenario.memo
                            ? "border-purple-500 bg-purple-500/10 text-purple-600 dark:text-purple-300"
                            : "border-border dark:border-gray-800 hover:border-purple-500/30 text-muted-foreground hover:text-foreground"
                        }`}
                        data-testid={`button-scenario-${scenario.key}`}
                      >
                        <div className="font-medium">{scenario.label}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">{scenario.description}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-mono text-muted-foreground mb-2 block" data-testid="label-chat-memo">"strategy_memo":</label>
                  <textarea
                    value={memo}
                    onChange={(e) => setMemo(e.target.value)}
                    placeholder="Paste your reasoning memo here or select a scenario above..."
                    className="w-full p-4 rounded-lg bg-background dark:bg-black border border-border dark:border-gray-800 font-mono text-sm text-foreground/80 h-36 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500/50 transition-all placeholder:text-muted-foreground/40"
                    data-testid="textarea-chat-memo"
                  />
                </div>

                <div>
                  <label className="text-xs font-mono text-muted-foreground mb-2 block" data-testid="label-chat-tier">AUDIT TIER</label>
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
                  disabled={!memo.trim() || running || !isConnected}
                  className="w-full flex items-center justify-center gap-2 py-4 rounded-lg font-bold text-white transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ background: '#F37E20', boxShadow: memo.trim() && !running && isConnected ? '0 4px 20px rgba(243,126,32,0.3)' : 'none' }}
                  data-testid="button-run-audit"
                >
                  {running ? (
                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                      <Terminal size={20} />
                    </motion.div>
                  ) : !isConnected ? (
                    <Wallet size={20} />
                  ) : (
                    <Play size={20} />
                  )}
                  <span>{
                    !isConnected ? "Connect Wallet to Audit"
                    : running ? "ORACLE SCANNING — may take up to 90s..."
                    : "Run DJZS Audit"
                  }</span>
                </button>
              </div>
            </motion.div>
          </div>

          <div className="lg:col-span-3 space-y-6">
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="rounded-xl border border-border dark:border-gray-800 bg-card dark:bg-[#111] overflow-hidden">
              <div className="px-5 py-4 border-b border-border dark:border-gray-800 bg-muted dark:bg-[#0d0d0d]">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={18} className="text-green-500 dark:text-green-400" />
                  <h2 className="font-semibold text-foreground text-sm" data-testid="text-chat-pipeline-title">Pipeline Progress</h2>
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
                          }`} data-testid={`step-label-${step.id}`}>
                            {step.label}
                          </div>
                          <div className="text-[9px] text-muted-foreground/60 hidden sm:block">{step.description}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>

            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  key="error"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="rounded-xl border border-red-500/30 bg-red-500/5 p-6"
                  data-testid="chat-error-message"
                >
                  <div className="flex items-start gap-3">
                    <AlertTriangle size={20} className="text-red-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-bold text-red-500 dark:text-red-400 text-sm mb-1">Audit Failed</div>
                      <p className="text-sm text-foreground/70">{error}</p>
                    </div>
                  </div>
                </motion.div>
              )}

              {result ? (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="rounded-xl border border-border dark:border-gray-800 bg-card dark:bg-[#111] overflow-hidden"
                  data-testid="chat-result-card"
                >
                  <div className="px-5 py-4 border-b border-border dark:border-gray-800 bg-muted dark:bg-[#0d0d0d]">
                    <div className="flex items-center gap-2">
                      <ShieldCheck size={18} className="text-[#F37E20]" />
                      <h2 className="font-semibold text-foreground text-sm" data-testid="text-result-title">ProofOfLogic Certificate</h2>
                    </div>
                  </div>

                  <div className="p-5 space-y-6">
                    <div className="flex items-start gap-5">
                      <RiskScoreGauge score={result.risk_score} />
                      <div className="flex-1 space-y-3">
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
                          <span className="px-2.5 py-1 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 rounded-md border border-cyan-500/20 text-[10px] font-mono font-bold" data-testid="badge-live-audit">
                            LIVE
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground font-mono space-y-1">
                          <div data-testid="text-result-audit-id">ID: {result.audit_id}</div>
                          <div data-testid="text-result-timestamp">TIME: {new Date(result.timestamp).toLocaleString()}</div>
                          {result.primary_bias_detected && result.primary_bias_detected !== "None" && (
                            <div data-testid="text-result-bias">BIAS: <span className="text-[#F37E20]">{result.primary_bias_detected}</span></div>
                          )}
                        </div>
                      </div>
                    </div>

                    {result.flags && result.flags.length > 0 && (
                      <div>
                        <div className="text-xs font-mono text-muted-foreground mb-3" data-testid="label-result-flags">FAILURE CODES ({result.flags.length})</div>
                        <div className="space-y-2">
                          {result.flags.map((flag, i) => (
                            <FlagCard key={i} flag={flag} index={i} />
                          ))}
                        </div>
                      </div>
                    )}

                    {result.structural_recommendations && result.structural_recommendations.length > 0 && (
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
                        {result.irys_url ? (
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
                        ) : (
                          <div className="flex items-center gap-2 px-4 py-3 rounded-lg border border-border bg-muted/30">
                            <Database size={16} className="text-muted-foreground" />
                            <div className="min-w-0 flex-1">
                              <div className="text-xs font-mono font-bold text-muted-foreground">Irys Certificate</div>
                              <div className="text-[10px] font-mono text-muted-foreground/60">{result.irys_error || "Not configured in this environment"}</div>
                            </div>
                          </div>
                        )}
                        {result.trust_score_tx_hash ? (
                          <a
                            href={`https://basescan.org/tx/${result.trust_score_tx_hash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-4 py-3 rounded-lg border border-cyan-500/30 bg-cyan-500/5 hover:bg-cyan-500/10 transition-colors group"
                            data-testid="link-result-basescan"
                          >
                            <ShieldCheck size={16} className="text-cyan-500 dark:text-cyan-400" />
                            <div className="min-w-0 flex-1">
                              <div className="text-xs font-mono font-bold text-cyan-600 dark:text-cyan-300">BaseScan TX</div>
                              <div className="text-[10px] font-mono text-muted-foreground truncate">{result.trust_score_tx_hash}</div>
                            </div>
                            <ExternalLink size={14} className="text-muted-foreground group-hover:text-cyan-400 transition-colors flex-shrink-0" />
                          </a>
                        ) : (
                          <div className="flex items-center gap-2 px-4 py-3 rounded-lg border border-border bg-muted/30">
                            <ShieldCheck size={16} className="text-muted-foreground" />
                            <div className="min-w-0 flex-1">
                              <div className="text-xs font-mono font-bold text-muted-foreground">Trust Score TX</div>
                              <div className="text-[10px] font-mono text-muted-foreground/60">{result.trust_score_error || "Contract not configured in this environment"}</div>
                            </div>
                          </div>
                        )}
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
                  data-testid="chat-empty-state"
                >
                  <ShieldAlert size={48} className="text-muted-foreground/30 mb-4" />
                  <p className="text-muted-foreground font-mono text-sm mb-1">No audit running</p>
                  <p className="text-muted-foreground/60 text-xs">
                    {isConnected
                      ? 'Select a scenario or paste a memo, then click "Run DJZS Audit"'
                      : "Connect your wallet to start an audit"}
                  </p>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        </div>
      </main>

      <footer className="border-t border-border py-8 bg-card dark:bg-black font-mono mt-12">
        <div className="max-w-6xl mx-auto px-6 flex flex-col items-center space-y-3">
          <div className="flex gap-6">
            <Link href="/" className="text-sm text-muted-foreground hover:text-[#F37E20] transition-colors" data-testid="link-chat-footer-home">Home</Link>
            <Link href="/docs" className="text-sm text-muted-foreground hover:text-cyan-500 dark:hover:text-cyan-400 transition-colors" data-testid="link-chat-footer-docs">Documentation</Link>
          </div>
          <p className="text-xs text-muted-foreground/60" data-testid="text-chat-footer-tagline">
            &copy; 2026 DJZS Protocol. The A2A Economy Tollbooth.
          </p>
        </div>
      </footer>
    </div>
  );
}
