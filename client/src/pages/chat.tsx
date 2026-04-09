import { useState, useEffect, useRef, useCallback } from "react";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Helmet } from "react-helmet";
import { getVeniceApiKey } from "@/lib/queryClient";
import { C, MONO, GlowDot } from "@/lib/terminal-theme";
import {
  ArrowLeft, ArrowRight, Play, Terminal, ShieldCheck, ShieldAlert,
  AlertTriangle, CheckCircle2, Upload, Database, ExternalLink,
  ChevronDown, ChevronUp, FlaskConical, BookOpen, Menu, X, Lock, Wallet
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
  nft_tx_hash?: string;
  nft_token_id?: number;
  nft_mint_available?: boolean;
  nft_contract_address?: string;
  nft_error?: string;
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
  { value: "micro", label: "Micro-Zone", price: "$0.10", description: "Binary risk scoring" },
  { value: "founder", label: "Founder Zone", price: "$1.00", description: "Strategic diligence" },
  { value: "treasury", label: "Treasury Zone", price: "$10.00", description: "Exhaustive stress-test" },
];

function RiskScoreGauge({ score }: { score: number }) {
  const color = score >= 70 ? C.red : score >= 40 ? C.amber : C.green;
  const circumference = 2 * Math.PI * 45;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div style={{ position: "relative", width: 112, height: 112, flexShrink: 0 }}>
      <svg style={{ width: "100%", height: "100%", transform: "rotate(-90deg)" }} viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="45" fill="none" stroke={C.border} strokeWidth="6" />
        <motion.circle
          cx="50" cy="50" r="45" fill="none" stroke={color} strokeWidth="6"
          strokeLinecap="round" strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontFamily: MONO, fontSize: 24, fontWeight: 700, color }} data-testid="text-risk-score-value">{score}</span>
        <span style={{ fontFamily: MONO, fontSize: 10, color: C.textMuted }}>/ 100</span>
      </div>
    </div>
  );
}

function FlagCard({ flag, index }: { flag: AuditFlag; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const sevColor = flag.severity === "CRITICAL" ? C.red : flag.severity === "HIGH" ? C.amber : "#eab308";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      style={{ border: `1px solid ${C.border}`, background: C.surface, overflow: "hidden" }}
      data-testid={`card-flag-${flag.code.toLowerCase()}`}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: 16, textAlign: "left", background: "transparent", border: "none", cursor: "pointer", color: C.text }}
        data-testid={`button-expand-flag-${flag.code.toLowerCase()}`}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
          <span style={{ fontFamily: MONO, fontSize: 10, fontWeight: 700, padding: "2px 8px", border: `1px solid ${sevColor}40`, background: `${sevColor}15`, color: sevColor }} data-testid={`badge-flag-severity-${index}`}>
            {flag.severity}
          </span>
          <span style={{ fontFamily: MONO, fontSize: 12, fontWeight: 600, color: C.text }} data-testid={`text-flag-code-${index}`}>{flag.code}</span>
          <span className="hidden sm:inline" style={{ fontFamily: MONO, fontSize: 12, color: C.textMuted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{(flag.message || "").split("—")[0]}</span>
        </div>
        {expanded ? <ChevronUp size={16} style={{ color: C.textMuted, flexShrink: 0 }} /> : <ChevronDown size={16} style={{ color: C.textMuted, flexShrink: 0 }} />}
      </button>
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ overflow: "hidden" }}
          >
            <div style={{ padding: "0 16px 16px", display: "flex", flexDirection: "column", gap: 12, borderTop: `1px solid ${C.border}` }}>
              <div style={{ paddingTop: 12 }}>
                <div style={{ fontFamily: MONO, fontSize: 10, color: C.textMuted, marginBottom: 4, letterSpacing: "0.1em" }}>MESSAGE</div>
                <p style={{ fontFamily: MONO, fontSize: 12, color: C.textDim }}>{flag.message}</p>
              </div>
              {flag.evidence && (
                <div>
                  <div style={{ fontFamily: MONO, fontSize: 10, color: C.textMuted, marginBottom: 4, letterSpacing: "0.1em" }}>EVIDENCE</div>
                  <p style={{ fontFamily: MONO, fontSize: 12, color: C.textDim, fontStyle: "italic" }}>{flag.evidence}</p>
                </div>
              )}
              {flag.recommendation && (
                <div>
                  <div style={{ fontFamily: MONO, fontSize: 10, color: C.textMuted, marginBottom: 4, letterSpacing: "0.1em" }}>RECOMMENDATION</div>
                  <p style={{ fontFamily: MONO, fontSize: 12, color: C.green }}>{flag.recommendation}</p>
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
  const { address, isConnected } = useAccount();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [memo, setMemo] = useState("");
  const [tier, setTier] = useState("micro");
  const [running, setRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);
  const [result, setResult] = useState<AuditResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [nftMinting, setNftMinting] = useState(false);
  const [nftMintResult, setNftMintResult] = useState<{ nft_tx_hash: string; nft_token_id: number | null } | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const mintNft = useCallback(async () => {
    if (!result?.irys_tx_id || !address || nftMinting) return;
    setNftMinting(true);
    try {
      const res = await fetch("/api/audit/mint-nft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ irys_tx_id: result.irys_tx_id, wallet_address: address }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Mint failed");
      setNftMintResult({ nft_tx_hash: data.nft_tx_hash, nft_token_id: data.nft_token_id });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "NFT mint failed");
    } finally {
      setNftMinting(false);
    }
  }, [result, address, nftMinting]);

  const loadScenario = (key: string) => {
    const scenario = DEMO_SCENARIOS.find(s => s.key === key);
    if (!scenario) return;
    abortRef.current?.abort();
    setMemo(scenario.memo);
    setResult(null);
    setError(null);
    setNftMintResult(null);
    setCurrentStep(-1);
    setRunning(false);
  };

  const runAudit = useCallback(async () => {
    if (!memo.trim() || running || !isConnected) return;
    abortRef.current?.abort();
    setRunning(true);
    setResult(null);
    setError(null);
    setNftMintResult(null);
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
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      setError(err instanceof Error ? err.message : "Audit request failed");
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
    <div style={{ background: C.bg, color: C.text, fontFamily: MONO, minHeight: "100vh" }}>
      <Helmet>
        <title>x402 Audit Console — Live | DJZS Protocol</title>
        <meta name="description" content="Route your reasoning trace through the x402 Oracle. Real USDC payments on Base Mainnet. Adversarial analysis, Irys Datachain upload, and on-chain trust score settlement." />
        <meta property="og:title" content="DJZS x402 Audit Console" />
        <meta property="og:description" content="Wallet-gated audit console. Pay with USDC on Base Mainnet via x402 protocol. Full ProofOfLogic certificate pipeline." />
      </Helmet>

      <header style={{ position: "sticky", top: 0, zIndex: 50, borderBottom: `1px solid ${C.border}`, background: C.bg, padding: "0 24px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 0" }}>
          <Link href="/">
            <span style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }} data-testid="link-chat-home-logo">
              <GlowDot color={C.green} size={8} />
              <span style={{ fontFamily: MONO, fontSize: 14, fontWeight: 700, color: C.white }}>DJZS.ai</span>
            </span>
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <nav className="hidden md:flex" style={{ alignItems: "center", gap: 16 }}>
              <Link href="/" data-testid="link-chat-header-home">
                <span style={{ fontFamily: MONO, fontSize: 12, color: C.textDim, cursor: "pointer" }}>Home</span>
              </Link>
              <Link href="/docs" data-testid="link-chat-header-docs">
                <span style={{ fontFamily: MONO, fontSize: 12, color: C.textDim, cursor: "pointer" }}>Documents</span>
              </Link>
            </nav>
            <div className="hidden sm:block" data-testid="wallet-connect-button">
              <ConnectButton chainStatus="icon" showBalance={false} />
            </div>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden" style={{ width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", background: "transparent", border: "none", color: C.textDim, cursor: "pointer" }} data-testid="button-chat-mobile-menu" aria-label="Menu">
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div key="mobile-menu" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="md:hidden" style={{ borderTop: `1px solid ${C.border}`, overflow: "hidden", background: C.bg }}>
              <nav style={{ display: "flex", flexDirection: "column", padding: "12px 16px", gap: 4 }}>
                <Link href="/" onClick={() => setMobileMenuOpen(false)} data-testid="link-chat-mobile-home">
                  <span style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 16px", fontFamily: MONO, fontSize: 13, color: C.textDim, cursor: "pointer" }}>
                    <ArrowLeft size={16} />Home
                  </span>
                </Link>
                <Link href="/docs" onClick={() => setMobileMenuOpen(false)} data-testid="link-chat-mobile-docs">
                  <span style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 16px", fontFamily: MONO, fontSize: 13, color: C.textDim, cursor: "pointer" }}>
                    <BookOpen size={16} />Documents
                  </span>
                </Link>
                <div style={{ padding: "10px 16px" }} className="sm:hidden" data-testid="wallet-connect-mobile">
                  <ConnectButton chainStatus="icon" showBalance={false} />
                </div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 24px" }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 32 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "4px 12px", border: `1px solid ${C.green}40`, background: C.greenGlow, color: C.green, fontFamily: MONO, fontSize: 12, marginBottom: 16 }}>
            <GlowDot color={C.green} size={6} />
            <span data-testid="badge-chat-mode">x402 Audit Console — Live</span>
          </div>
          <h1 style={{ fontFamily: MONO, fontSize: 28, fontWeight: 800, color: C.white, marginBottom: 8, letterSpacing: "-0.02em" }} data-testid="text-chat-page-title">
            Audit-to-Certificate Pipeline
          </h1>
          <p style={{ fontFamily: MONO, fontSize: 13, color: C.textDim, maxWidth: 600 }} data-testid="text-chat-page-subtitle">
            Route your reasoning trace through the x402 Oracle. Real USDC payments on Base Mainnet.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 sm:gap-8">
          <div className="lg:col-span-2 space-y-6">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} style={{ border: `1px solid ${C.border}`, background: C.surface, overflow: "hidden" }}>
              <div style={{ padding: "12px 20px", borderBottom: `1px solid ${C.border}`, background: "#0d0d0d", display: "flex", alignItems: "center", gap: 8 }}>
                <Terminal size={16} style={{ color: C.green }} />
                <h2 style={{ fontFamily: MONO, fontSize: 12, fontWeight: 700, color: C.text }} data-testid="text-chat-input-title">Agent Payload Injector</h2>
              </div>

              <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 20 }}>
                <div>
                  <label style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase", color: C.textMuted, display: "block", marginBottom: 8 }} data-testid="label-chat-scenarios">PRELOADED SCENARIOS</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2">
                    {DEMO_SCENARIOS.map((scenario) => (
                      <button
                        key={scenario.key}
                        onClick={() => loadScenario(scenario.key)}
                        style={{
                          width: "100%", textAlign: "left", padding: "10px 12px",
                          border: `1px solid ${memo === scenario.memo ? C.green : C.border}`,
                          background: memo === scenario.memo ? C.greenGlow : "transparent",
                          color: memo === scenario.memo ? C.green : C.textDim,
                          fontFamily: MONO, fontSize: 12, cursor: "pointer",
                          transition: "all 0.2s",
                        }}
                        data-testid={`button-scenario-${scenario.key}`}
                      >
                        <div style={{ fontWeight: 600, color: memo === scenario.memo ? C.green : C.text, fontSize: 12 }}>{scenario.label}</div>
                        <div style={{ fontSize: 10, color: C.textMuted, marginTop: 2 }}>{scenario.description}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase", color: C.textMuted, display: "block", marginBottom: 8 }} data-testid="label-chat-memo">"strategy_memo":</label>
                  <textarea
                    value={memo}
                    onChange={(e) => setMemo(e.target.value)}
                    placeholder="Paste your reasoning memo here or select a scenario above..."
                    style={{
                      width: "100%", padding: 16, background: C.bg, border: `1px solid ${C.border}`,
                      fontFamily: MONO, fontSize: 12, color: C.text, height: 144, resize: "none",
                      outline: "none",
                    }}
                    data-testid="textarea-chat-memo"
                  />
                </div>

                <div>
                  <label style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase", color: C.textMuted, display: "block", marginBottom: 8 }} data-testid="label-chat-tier">AUDIT TIER</label>
                  <div className="grid grid-cols-3 gap-2">
                    {TIER_OPTIONS.map((t) => (
                      <button
                        key={t.value}
                        onClick={() => setTier(t.value)}
                        style={{
                          padding: "10px 12px", textAlign: "center", cursor: "pointer",
                          border: `1px solid ${tier === t.value ? C.green : C.border}`,
                          background: tier === t.value ? C.greenGlow : "transparent",
                          color: tier === t.value ? C.green : C.textDim,
                          fontFamily: MONO, transition: "all 0.2s",
                        }}
                        data-testid={`button-tier-${t.value}`}
                      >
                        <div style={{ fontSize: 11, fontWeight: 700 }}>{t.label}</div>
                        <div style={{ fontSize: 10, marginTop: 2, opacity: 0.7 }}>{t.price}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={runAudit}
                  disabled={!memo.trim() || running || !isConnected}
                  style={{
                    width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    padding: "14px 0", fontFamily: MONO, fontWeight: 700, fontSize: 13,
                    background: (!memo.trim() || running || !isConnected) ? C.greenDim : C.green,
                    color: C.bg, border: "none", cursor: (!memo.trim() || running || !isConnected) ? "not-allowed" : "pointer",
                    opacity: (!memo.trim() || running || !isConnected) ? 0.5 : 1,
                    boxShadow: memo.trim() && !running && isConnected ? `0 0 20px ${C.green}40` : "none",
                    transition: "all 0.2s",
                  }}
                  data-testid="button-run-audit"
                >
                  {running ? (
                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                      <Terminal size={18} />
                    </motion.div>
                  ) : !isConnected ? (
                    <Wallet size={18} />
                  ) : (
                    <Play size={18} />
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
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} style={{ border: `1px solid ${C.border}`, background: C.surface, overflow: "hidden" }}>
              <div style={{ padding: "12px 20px", borderBottom: `1px solid ${C.border}`, background: "#0d0d0d", display: "flex", alignItems: "center", gap: 8 }}>
                <ShieldCheck size={16} style={{ color: C.green }} />
                <h2 style={{ fontFamily: MONO, fontSize: 12, fontWeight: 700, color: C.text }} data-testid="text-chat-pipeline-title">Pipeline Progress</h2>
              </div>

              <div style={{ padding: 20 }}>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-0 sm:justify-between">
                  {PIPELINE_STEPS.map((step, i) => {
                    const StepIcon = step.icon;
                    const isActive = i === currentStep;
                    const isComplete = i < currentStep || (i === PIPELINE_STEPS.length - 1 && result !== null);

                    return (
                      <div key={step.id} className="flex sm:flex-col items-center gap-2 sm:gap-1 sm:flex-1 relative">
                        {i > 0 && (
                          <div className="hidden sm:block absolute -left-1/2 top-[14px] w-full h-[2px] -z-10" style={{ background: C.border }}>
                            {isComplete && (
                              <motion.div
                                style={{ height: "100%", background: C.green }}
                                initial={{ width: "0%" }}
                                animate={{ width: "100%" }}
                                transition={{ duration: 0.3 }}
                              />
                            )}
                          </div>
                        )}
                        <div
                          style={{
                            width: 28, height: 28, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                            background: isComplete ? `${C.green}20` : isActive ? `${C.amber}20` : C.surface,
                            color: isComplete ? C.green : isActive ? C.amber : C.textMuted,
                            border: `1px solid ${isComplete ? `${C.green}40` : isActive ? `${C.amber}40` : C.border}`,
                          }}
                          data-testid={`step-icon-${step.id}`}
                        >
                          {isComplete ? <CheckCircle2 size={14} /> : <StepIcon size={14} />}
                        </div>
                        <div className="sm:text-center">
                          <div style={{
                            fontFamily: MONO, fontSize: 11, fontWeight: 600,
                            color: isComplete ? C.green : isActive ? C.amber : C.textMuted,
                          }} data-testid={`step-label-${step.id}`}>
                            {step.label}
                          </div>
                          <div className="hidden sm:block" style={{ fontSize: 9, color: C.textMuted }}>{step.description}</div>
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
                  style={{ border: `1px solid ${C.red}40`, background: `${C.red}08`, padding: 24 }}
                  data-testid="chat-error-message"
                >
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                    <AlertTriangle size={20} style={{ color: C.red, marginTop: 2, flexShrink: 0 }} />
                    <div>
                      <div style={{ fontFamily: MONO, fontWeight: 700, color: C.red, fontSize: 13, marginBottom: 4 }}>Audit Failed</div>
                      <p style={{ fontFamily: MONO, fontSize: 12, color: C.textDim }}>{error}</p>
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
                  style={{ border: `1px solid ${C.border}`, background: C.surface, overflow: "hidden" }}
                  data-testid="chat-result-card"
                >
                  <div style={{ padding: "12px 20px", borderBottom: `1px solid ${C.border}`, background: "#0d0d0d", display: "flex", alignItems: "center", gap: 8 }}>
                    <ShieldCheck size={16} style={{ color: C.green }} />
                    <h2 style={{ fontFamily: MONO, fontSize: 12, fontWeight: 700, color: C.text }} data-testid="text-result-title">ProofOfLogic Certificate</h2>
                  </div>

                  <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 24 }}>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 20 }}>
                      <RiskScoreGauge score={result.risk_score} />
                      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12 }}>
                        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8 }}>
                          {result.verdict === "FAIL" ? (
                            <span style={{ padding: "4px 12px", background: `${C.red}20`, color: C.red, border: `1px solid ${C.red}40`, fontFamily: MONO, fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }} data-testid="badge-result-verdict">
                              <AlertTriangle size={14} /> VERDICT: FAIL
                            </span>
                          ) : (
                            <span style={{ padding: "4px 12px", background: C.greenGlow, color: C.green, border: `1px solid ${C.green}40`, fontFamily: MONO, fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }} data-testid="badge-result-verdict">
                              <ShieldCheck size={14} /> VERDICT: PASS
                            </span>
                          )}
                          <span style={{ padding: "4px 12px", background: C.surface, color: C.textDim, border: `1px solid ${C.border}`, fontFamily: MONO, fontSize: 11 }} data-testid="text-result-tier">
                            TIER: {result.tier.toUpperCase()}
                          </span>
                          <span style={{ padding: "2px 8px", background: C.greenGlow, color: C.green, border: `1px solid ${C.green}30`, fontFamily: MONO, fontSize: 10, fontWeight: 700 }} data-testid="badge-live-audit">
                            LIVE
                          </span>
                        </div>
                        <div style={{ fontFamily: MONO, fontSize: 11, color: C.textMuted, display: "flex", flexDirection: "column", gap: 4 }}>
                          <div data-testid="text-result-audit-id">ID: {result.audit_id}</div>
                          <div data-testid="text-result-timestamp">TIME: {new Date(result.timestamp).toLocaleString()}</div>
                          {result.primary_bias_detected && result.primary_bias_detected !== "None" && (
                            <div data-testid="text-result-bias">BIAS: <span style={{ color: C.amber }}>{result.primary_bias_detected}</span></div>
                          )}
                        </div>
                      </div>
                    </div>

                    {result.flags && result.flags.length > 0 && (
                      <div>
                        <div style={{ fontFamily: MONO, fontSize: 10, color: C.textMuted, marginBottom: 12, letterSpacing: "0.15em", textTransform: "uppercase" }} data-testid="label-result-flags">FAILURE CODES ({result.flags.length})</div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                          {result.flags.map((flag, i) => (
                            <FlagCard key={i} flag={flag} index={i} />
                          ))}
                        </div>
                      </div>
                    )}

                    {result.structural_recommendations && result.structural_recommendations.length > 0 && (
                      <div>
                        <div style={{ fontFamily: MONO, fontSize: 10, color: C.textMuted, marginBottom: 8, letterSpacing: "0.15em", textTransform: "uppercase" }} data-testid="label-result-recommendations">RECOMMENDATIONS</div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                          {result.structural_recommendations.map((rec, i) => (
                            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontFamily: MONO, fontSize: 12, color: C.textDim }}>
                              <ArrowRight size={14} style={{ marginTop: 2, color: C.green, flexShrink: 0 }} />
                              <span data-testid={`text-recommendation-${i}`}>{rec}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 16, display: "flex", flexDirection: "column", gap: 12 }}>
                      <div style={{ fontFamily: MONO, fontSize: 10, color: C.textMuted, letterSpacing: "0.15em", textTransform: "uppercase" }} data-testid="label-result-provenance">ON-CHAIN PROVENANCE</div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {result.irys_url ? (
                          <a
                            href={result.irys_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 16px", border: `1px solid ${C.green}30`, background: C.greenGlow, textDecoration: "none" }}
                            data-testid="link-result-irys"
                          >
                            <Database size={16} style={{ color: C.green }} />
                            <div style={{ minWidth: 0, flex: 1 }}>
                              <div style={{ fontFamily: MONO, fontSize: 11, fontWeight: 700, color: C.green }}>Irys Certificate</div>
                              <div style={{ fontFamily: MONO, fontSize: 10, color: C.textMuted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{result.irys_tx_id}</div>
                            </div>
                            <ExternalLink size={14} style={{ color: C.textMuted, flexShrink: 0 }} />
                          </a>
                        ) : (
                          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 16px", border: `1px solid ${C.border}`, background: C.surface }}>
                            <Database size={16} style={{ color: C.textMuted }} />
                            <div style={{ minWidth: 0, flex: 1 }}>
                              <div style={{ fontFamily: MONO, fontSize: 11, fontWeight: 700, color: C.textMuted }}>Irys Certificate</div>
                              <div style={{ fontFamily: MONO, fontSize: 10, color: C.textMuted }}>{result.irys_error || "Not configured in this environment"}</div>
                            </div>
                          </div>
                        )}
                        {result.trust_score_tx_hash ? (
                          <a
                            href={`https://basescan.org/tx/${result.trust_score_tx_hash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 16px", border: `1px solid ${C.green}30`, background: C.greenGlow, textDecoration: "none" }}
                            data-testid="link-result-basescan"
                          >
                            <ShieldCheck size={16} style={{ color: C.green }} />
                            <div style={{ minWidth: 0, flex: 1 }}>
                              <div style={{ fontFamily: MONO, fontSize: 11, fontWeight: 700, color: C.green }}>BaseScan TX</div>
                              <div style={{ fontFamily: MONO, fontSize: 10, color: C.textMuted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{result.trust_score_tx_hash}</div>
                            </div>
                            <ExternalLink size={14} style={{ color: C.textMuted, flexShrink: 0 }} />
                          </a>
                        ) : (
                          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 16px", border: `1px solid ${C.border}`, background: C.surface }}>
                            <ShieldCheck size={16} style={{ color: C.textMuted }} />
                            <div style={{ minWidth: 0, flex: 1 }}>
                              <div style={{ fontFamily: MONO, fontSize: 11, fontWeight: 700, color: C.textMuted }}>Trust Score TX</div>
                              <div style={{ fontFamily: MONO, fontSize: 10, color: C.textMuted }}>{result.trust_score_error || "Contract not configured in this environment"}</div>
                            </div>
                          </div>
                        )}
                      </div>
                      {result.verdict === "PASS" && (
                        <div style={{ marginTop: 12 }}>
                          {(result.nft_tx_hash || nftMintResult) ? (
                            <a
                              href={`https://basescan.org/tx/${nftMintResult?.nft_tx_hash || result.nft_tx_hash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 16px", border: `1px solid ${C.green}30`, background: C.greenGlow, textDecoration: "none" }}
                              data-testid="link-result-nft"
                            >
                              <ShieldCheck size={16} style={{ color: C.green }} />
                              <div style={{ minWidth: 0, flex: 1 }}>
                                <div style={{ fontFamily: MONO, fontSize: 11, fontWeight: 700, color: C.green }}>
                                  ProofOfLogic NFT Minted
                                  {(nftMintResult?.nft_token_id || result.nft_token_id) && (
                                    <span style={{ color: C.textMuted, fontWeight: 400, marginLeft: 8 }}>#{nftMintResult?.nft_token_id || result.nft_token_id}</span>
                                  )}
                                </div>
                                <div style={{ fontFamily: MONO, fontSize: 10, color: C.textMuted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{nftMintResult?.nft_tx_hash || result.nft_tx_hash}</div>
                              </div>
                              <ExternalLink size={14} style={{ color: C.textMuted, flexShrink: 0 }} />
                            </a>
                          ) : result.nft_mint_available ? (
                            <button
                              onClick={mintNft}
                              disabled={nftMinting}
                              style={{
                                width: "100%", display: "flex", alignItems: "center", gap: 8, padding: "10px 16px",
                                border: `1px solid ${C.green}30`, background: C.greenGlow, cursor: nftMinting ? "wait" : "pointer",
                                opacity: nftMinting ? 0.5 : 1,
                              }}
                              data-testid="button-mint-nft"
                            >
                              <ShieldCheck size={16} style={{ color: C.green }} />
                              <div style={{ minWidth: 0, flex: 1, textAlign: "left" }}>
                                <div style={{ fontFamily: MONO, fontSize: 11, fontWeight: 700, color: C.green }}>
                                  {nftMinting ? "Minting NFT..." : "Mint ProofOfLogic NFT"}
                                </div>
                                <div style={{ fontFamily: MONO, fontSize: 10, color: C.textMuted }}>
                                  {nftMinting ? "Treasury wallet paying gas on Base Mainnet" : "Full certificate stored on-chain. Treasury pays gas."}
                                </div>
                              </div>
                            </button>
                          ) : result.nft_error ? (
                            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 16px", border: `1px solid ${C.border}`, background: C.surface }}>
                              <ShieldCheck size={16} style={{ color: C.textMuted }} />
                              <div style={{ minWidth: 0, flex: 1 }}>
                                <div style={{ fontFamily: MONO, fontSize: 11, fontWeight: 700, color: C.textMuted }}>ProofOfLogic NFT</div>
                                <div style={{ fontFamily: MONO, fontSize: 10, color: C.textMuted }}>{result.nft_error}</div>
                              </div>
                            </div>
                          ) : null}
                        </div>
                      )}
                      <div style={{ fontFamily: MONO, fontSize: 10, color: C.textMuted, wordBreak: "break-all" }} data-testid="text-result-hash">
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
                  style={{ border: `1px dashed ${C.border}`, background: `${C.surface}80`, padding: 48, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}
                  data-testid="chat-empty-state"
                >
                  <ShieldAlert size={48} style={{ color: C.textMuted, opacity: 0.3, marginBottom: 16 }} />
                  <p style={{ fontFamily: MONO, fontSize: 13, color: C.textMuted, marginBottom: 4 }}>No audit running</p>
                  <p style={{ fontFamily: MONO, fontSize: 11, color: C.textMuted, opacity: 0.6 }}>
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

      <footer style={{ borderTop: `1px solid ${C.border}`, padding: "32px 0", fontFamily: MONO, marginTop: 48 }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", display: "flex", justifyContent: "space-between", fontSize: 12, color: C.textMuted }}>
          <span data-testid="text-chat-footer-tagline">&copy; 2026 DJZS Protocol — djzs.ai</span>
          <span>No agent acts without audit.</span>
        </div>
      </footer>
    </div>
  );
}
