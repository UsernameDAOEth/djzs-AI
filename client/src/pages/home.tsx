import { useState } from "react";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { ArrowRight, Plus, Menu, X, Target, Sun, Moon, Terminal, ShieldAlert, Code2, AlertTriangle, BrainCircuit, Coins, ShieldCheck, Play, AlertOctagon, Repeat, TrendingDown, Lock, Database, FlaskConical, BookOpen } from "lucide-react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { RevealSection } from "@/components/hero";
import { ApiTiers } from "@/components/ApiTiers";
import { FinalCTA } from "@/components/FinalCTA";
import { TorusLogo } from "@/components/TorusLogo";
import { WhoUsesOracle } from "@/components/WhoUsesOracle";
import { Helmet } from "react-helmet";
import { useTheme } from "@/lib/theme";

const DEMO_TEST_CASES = {
  fomo: {
    label: "FOMO Momentum Buy",
    memo: "EXECUTE IMMEDIATE BUY: 500 SOL of $SHILL. 1-minute volume is spiking and Crypto Twitter implies a tier-1 exchange listing today. Cannot miss this pump.",
    response: {
      audit_id: "d7e3a1f0-9c4b-4e2a-b8f1-3a5c7d9e2b4f",
      timestamp: "2026-02-25T01:12:44.000Z",
      tier: "micro",
      verdict: "FAIL" as const,
      risk_score: 98,
      primary_bias_detected: "FOMO",
      flags: [{ code: "DJZS-I01", severity: "CRITICAL", message: "FOMO Loop — execution driven by social momentum and unverified Twitter sentiment." }],
      logic_flaws: [{ flaw_type: "Momentum Dependency", severity: "critical", explanation: "Trade thesis relies entirely on 1-minute volume spike and unverified exchange listing rumor." }],
      structural_recommendations: ["Verify exchange listing via official announcement channels", "Set position size limits based on verified liquidity depth"],
      cryptographic_hash: "4a9b2c8f1e3d7a6b0c5f9e2d8a1b4c7f3e6d9a0b5c8f1e2d7a4b9c6f3e0d8a1b",
      provenance_provider: "IRYS_DATACHAIN",
      irys_tx_id: "8kNMzL4hgLoXo7SNEsgPSJ8oCETs15jKwioke3V2rSH",
      irys_url: "https://gateway.irys.xyz/8kNMzL4hgLoXo7SNEsgPSJ8oCETs15jKwioke3V2rSH"
    }
  },
  hallucination: {
    label: "Hallucinated Data",
    memo: "Routing 50k USDC into Yield Protocol V4 based on their latest audit report from yesterday.",
    response: {
      audit_id: "a2b4c6d8-e0f1-4a3b-c5d7-e9f0a1b2c3d4",
      timestamp: "2026-02-25T01:13:02.000Z",
      tier: "micro",
      verdict: "FAIL" as const,
      risk_score: 85,
      primary_bias_detected: "Confirmation_Bias",
      flags: [{ code: "DJZS-E01", severity: "HIGH", message: "Epistemic Failure — Yield Protocol V4 does not exist. No audit report was published." }],
      logic_flaws: [{ flaw_type: "Hallucinated Reference", severity: "critical", explanation: "The referenced protocol and audit report cannot be verified against any known source." }],
      structural_recommendations: ["Cross-reference all protocol names against verified registries", "Require on-chain contract verification before capital allocation"],
      cryptographic_hash: "7f2e1a9b3c5d8f0e4a6b2c7d1e3f9a5b8c0d4e6f2a7b1c3d5e9f0a8b4c6d2e7f",
      provenance_provider: "IRYS_DATACHAIN",
      irys_tx_id: "5rPQzM7kfHnWp9TNDrtgQRK9pBDUt26kXxjplf4W3tUI",
      irys_url: "https://gateway.irys.xyz/5rPQzM7kfHnWp9TNDrtgQRK9pBDUt26kXxjplf4W3tUI"
    }
  },
  valid: {
    label: "Valid Strategy",
    memo: "Executing DCA of 2 ETH. Structural support verified at $2800. Liquidity depth is sufficient. Max slippage set to 0.5%.",
    response: {
      audit_id: "fe1f14d0-73ac-4467-ac33-d76bf3fdce21",
      timestamp: "2026-02-25T01:14:18.000Z",
      tier: "micro",
      verdict: "PASS" as const,
      risk_score: 12,
      primary_bias_detected: "None",
      flags: [],
      logic_flaws: [],
      structural_recommendations: ["Continue to verify liquidity depth at execution time", "Monitor slippage tolerance against real-time spread"],
      cryptographic_hash: "9b3a4f2c1e7d8a0b5c6f3e9d2a1b4c7f0e8d5a3b6c9f1e2d7a4b0c5f8e3d6a9b",
      provenance_provider: "IRYS_DATACHAIN",
      irys_tx_id: "71oNMzL4hgLoXo7SNEsgPSJ8oCETs15jKwioke3V2rSH",
      irys_url: "https://gateway.irys.xyz/71oNMzL4hgLoXo7SNEsgPSJ8oCETs15jKwioke3V2rSH"
    }
  }
} as const;

type DemoCase = keyof typeof DEMO_TEST_CASES;

export default function Home() {
  const { isConnected } = useAccount();
  const { theme, toggleTheme } = useTheme();
  const [mobileBarDismissed, setMobileBarDismissed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [demoActiveCase, setDemoActiveCase] = useState<DemoCase>("fomo");
  const [demoScanning, setDemoScanning] = useState(false);
  const [demoOutput, setDemoOutput] = useState<(typeof DEMO_TEST_CASES)[DemoCase]["response"] | null>(null);

  const runDemoAudit = () => {
    setDemoScanning(true);
    setDemoOutput(null);
    setTimeout(() => {
      setDemoScanning(false);
      setDemoOutput(DEMO_TEST_CASES[demoActiveCase].response);
    }, 1200);
  };

  const scrollToProcess = () => {
    const el = document.getElementById("process");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen text-foreground overflow-hidden bg-background">
      <style>{`
        @keyframes breathe {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.03); }
        }
        ::selection { background: rgba(243,126,32,0.3); }
        .calm-card { transition: box-shadow 0.3s ease; }
        .calm-card:hover { box-shadow: 0 0 24px rgba(255,255,255,0.02), 0 4px 32px rgba(0,0,0,0.3); }
      `}</style>

      <header className="sticky top-0 z-50 backdrop-blur-xl border-b border-border bg-background/90" style={{ boxShadow: '0 1px 20px rgba(0,0,0,0.08)' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <Link href="/">
            <span className="flex items-center gap-2.5" data-testid="link-home-logo">
              <TorusLogo data-testid="img-logo-header" />
              <span className="text-lg sm:text-xl font-bold tracking-tighter text-foreground" data-testid="text-header-brand">DJZS<span className="text-purple-500">.ai</span></span>
            </span>
          </Link>
          <div className="flex items-center gap-3 sm:gap-5">
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
              <Link href="/demo" className="group flex items-center gap-2 px-3 py-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all" data-testid="link-header-test-oracle">
                <FlaskConical size={15} className="text-purple-400 group-hover:text-purple-300 transition-colors" />
                Live Demo
              </Link>
              <Link href="/docs" className="group flex items-center gap-2 px-3 py-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all" data-testid="link-header-developers">
                <BookOpen size={15} className="text-teal-400 group-hover:text-teal-300 transition-colors" />
                Documents
              </Link>
            </nav>
            {isConnected ? (
              <Link href="/chat">
                <button
                  className="relative inline-flex items-center gap-2 rounded-md px-5 sm:px-6 py-2 sm:py-2.5 text-sm sm:text-base font-bold text-white transition-all hover:scale-[1.03] active:scale-[0.98]"
                  style={{ background: '#F37E20', boxShadow: '0 4px 20px rgba(243,126,32,0.3), 0 0 40px rgba(243,126,32,0.1)' }}
                  data-testid="button-header-enter"
                >
                  <Target className="w-4 h-4" />
                  <span className="hidden sm:inline">Enter the Zone</span>
                  <span className="sm:hidden">Audit</span>
                </button>
              </Link>
            ) : (
              <ConnectButton showBalance={false} />
            )}
            <button
              onClick={toggleTheme}
              className="w-10 h-10 rounded-lg flex items-center justify-center transition-colors hover:bg-muted"
             
              data-testid="button-theme-toggle"
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden w-10 h-10 rounded-lg flex items-center justify-center transition-colors hover:bg-muted"
             
              data-testid="button-mobile-menu"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              key="mobile-menu"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="md:hidden border-t border-border overflow-hidden bg-background/98"
            >
              <nav className="flex flex-col px-4 py-3 gap-1">
                <Link
                  href="/demo"
                  className="flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  onClick={() => setMobileMenuOpen(false)}
                  data-testid="link-mobile-test-oracle"
                >
                  <FlaskConical size={16} className="text-purple-400" />
                  Live Demo
                </Link>
                <Link
                  href="/docs"
                  className="flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  onClick={() => setMobileMenuOpen(false)}
                  data-testid="link-mobile-developers"
                >
                  <BookOpen size={16} className="text-teal-400" />
                  Documents
                </Link>
                <Link
                  href="/privacy"
                  className="flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  onClick={() => setMobileMenuOpen(false)}
                  data-testid="link-mobile-privacy"
                >
                  <Lock size={16} className="text-muted-foreground/60" />
                  Privacy
                </Link>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <Helmet>
        <title>DJZS Protocol | The Kill Switch for Autonomous Trading Agents</title>
        <meta name="description" content="The deterministic kill switch for autonomous trading agents. Route reasoning through the Dark Channel (XMTP E2E encrypted) or Light Channel (x402 REST API with Irys provenance) before moving capital. Three-tier audits on Base Mainnet." />
        <meta property="og:title" content="DJZS - The Kill Switch for Autonomous Trading Agents" />
        <meta property="og:description" content="Your trading agent needs a circuit breaker before it moves capital. Dark Channel for alpha protection. Light Channel for public accountability. Deterministic verdicts on Base Mainnet." />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="DJZS - The Kill Switch for Autonomous Trading Agents" />
        <meta name="twitter:description" content="Your trading agent needs a deterministic circuit breaker. Dark Channel (XMTP E2E encrypted) for alpha protection. Light Channel (x402 + Irys provenance) for DAO accountability. Live on Base Mainnet." />
      </Helmet>

      <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden bg-background">
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 rounded-full pointer-events-none" style={{ background: 'rgba(243,126,32,0.08)', filter: 'blur(120px)' }} />
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 rounded-full pointer-events-none" style={{ background: 'rgba(46,139,139,0.08)', filter: 'blur(120px)' }} />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center py-16 lg:py-0">

          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="space-y-8"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-mono" style={{ border: '1px solid rgba(243,126,32,0.3)', background: 'rgba(243,126,32,0.08)', color: '#F37E20' }}>
              <ShieldAlert size={16} />
              <span>DJZS Protocol v1 is Live</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black tracking-tight leading-[1.1]">
              The{' '}
              <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(to right, #F37E20, #2E8B8B)' }}>
                Kill Switch
              </span>{' '}
              for Autonomous Trading Agents.
            </h1>

            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-xl mb-1" data-testid="text-hero-subtitle">
              Stop your autonomous agents from trading on FOMO and hallucinated data. Route your reasoning traces through the DJZS Zero-Trust Oracle before execution. Every audit produces a permanent ProofOfLogic certificate on Irys Datachain.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <Link href="/docs">
                <button className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg font-bold text-white transition-all hover:-translate-y-0.5" style={{ background: '#F37E20', boxShadow: '0 6px 24px rgba(243,126,32,0.3)' }} data-testid="button-hero-docs">
                  <Code2 size={20} />
                  Read the Docs
                </button>
              </Link>
              <Link href="/dashboard">
                <button className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg font-bold border transition-all hover:-translate-y-0.5 text-foreground hover:bg-muted" style={{ borderColor: 'rgba(46,139,139,0.4)' }} data-testid="button-hero-terminal">
                  <Terminal size={20} />
                  View Live Terminal
                </button>
              </Link>
            </div>

            <p className="text-xs text-muted-foreground pt-2" data-testid="text-cta-microcopy">
              $2.50 / $5.00 / $50.00 USDC per audit. Instant settlement on Base Mainnet. No subscriptions.
            </p>

            <div className="flex flex-wrap gap-3 pt-1" data-testid="trust-badges">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono border border-border bg-muted/50 text-muted-foreground" data-testid="badge-phala-tee">
                <ShieldCheck size={12} className="text-green-500" />
                Phala TEE
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono border border-border bg-muted/50 text-muted-foreground" data-testid="badge-irys-datachain">
                <ShieldCheck size={12} className="text-purple-500" />
                Irys Datachain
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono border border-border bg-muted/50 text-muted-foreground" data-testid="badge-base-mainnet">
                <Coins size={12} className="text-cyan-500" />
                Base Mainnet
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono border border-border bg-muted/50 text-muted-foreground" data-testid="badge-venice-ai">
                <FlaskConical size={12} className="text-teal-500" />
                Venice AI
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono border border-border bg-muted/50 text-muted-foreground" data-testid="badge-xmtp">
                <Lock size={12} className="text-blue-500" />
                XMTP
              </span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="relative rounded-xl border border-border overflow-hidden shadow-2xl"
            style={{ background: '#111214' }}
            data-testid="hero-terminal"
          >
            <div className="flex items-center px-4 py-3 border-b border-border/50" style={{ background: '#1a1d23' }}>
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full" style={{ background: 'rgba(239,68,68,0.8)' }} />
                <div className="w-3 h-3 rounded-full" style={{ background: 'rgba(234,179,8,0.8)' }} />
                <div className="w-3 h-3 rounded-full" style={{ background: 'rgba(34,197,94,0.8)' }} />
              </div>
              <span className="ml-4 text-xs font-mono text-muted-foreground/60">POST /api/audit/micro</span>
            </div>

            <div className="p-5 sm:p-6 font-mono text-xs sm:text-sm leading-relaxed overflow-x-auto relative">
              <motion.pre
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 0.5 }}
              >
                <code>
                  <span style={{ color: '#2E8B8B' }}>{"{"}</span>
                  {"\n  "}<span style={{ color: '#7B6B8D' }}>"verdict"</span>: <span style={{ color: '#ef4444', fontWeight: 'bold' }}>"FAIL"</span>,
                  {"\n  "}<span style={{ color: '#7B6B8D' }}>"risk_score"</span>: <span style={{ color: '#FFB84D' }}>98</span>,
                  {"\n  "}<span style={{ color: '#7B6B8D' }}>"tier"</span>: <span style={{ color: '#2E8B8B' }}>"micro"</span>,
                  {"\n  "}<span style={{ color: '#7B6B8D' }}>"flags"</span>: <span style={{ color: '#2E8B8B' }}>{"["}</span>
                  {"\n    "}<span style={{ color: '#2E8B8B' }}>{"{"}</span>
                  {"\n      "}<span style={{ color: '#7B6B8D' }}>"code"</span>: <span style={{ color: '#F37E20' }}>"DJZS-I01"</span>,
                  {"\n      "}<span style={{ color: '#7B6B8D' }}>"severity"</span>: <span style={{ color: '#ef4444' }}>"CRITICAL"</span>,
                  {"\n      "}<span style={{ color: '#7B6B8D' }}>"message"</span>: <span style={{ color: '#2E8B8B' }}>"FOMO Loop detected. Aborting."</span>
                  {"\n    "}<span style={{ color: '#2E8B8B' }}>{"}"}</span>
                  {"\n  "}<span style={{ color: '#2E8B8B' }}>{"]"}</span>,
                  {"\n  "}<span style={{ color: '#7B6B8D' }}>"cryptographic_hash"</span>: <span style={{ color: '#2E8B8B' }}>"4a9b2c..."</span>,
                  {"\n  "}<span style={{ color: '#7B6B8D' }}>"provenance_provider"</span>: <span style={{ color: '#2E8B8B' }}>"IRYS_DATACHAIN"</span>,
                  {"\n  "}<span style={{ color: '#7B6B8D' }}>"irys_tx_id"</span>: <span style={{ color: '#2E8B8B' }}>"8kNMzL4hg..."</span>,
                  {"\n  "}<span style={{ color: '#7B6B8D' }}>"irys_url"</span>: <span style={{ color: '#2E8B8B' }}>"https://gateway.irys.xyz/8kNMzL4hg..."</span>
                  {"\n"}<span style={{ color: '#2E8B8B' }}>{"}"}</span>
                </code>
              </motion.pre>

              <motion.div
                className="absolute left-0 w-full h-px pointer-events-none"
                style={{ background: 'linear-gradient(90deg, transparent, rgba(243,126,32,0.6), transparent)', boxShadow: '0 0 15px rgba(243,126,32,0.5)' }}
                animate={{ top: ["10%", "90%", "10%"] }}
                transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
              />
            </div>
          </motion.div>

        </div>
      </section>

      <RevealSection>
        <section className="relative py-24 border-t border-border bg-background dark:bg-[#050505] overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">

            <div className="text-center mb-20">
              <h2 className="text-3xl lg:text-5xl font-bold tracking-tight mb-4 text-foreground" data-testid="text-protocol-flow-headline">
                The <span className="text-foreground font-black">Audit-Before-Act</span> Pipeline
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
                A deterministic execution environment. If the reasoning is flawed, the transaction never reaches the blockchain.
              </p>
            </div>

            <div className="relative">
              <div className="hidden md:block absolute top-12 left-[10%] right-[10%] h-[2px] bg-border dark:bg-gray-800 z-0" data-testid="flow-connecting-line">
                <motion.div
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-cyan-500 via-purple-500 to-green-500"
                  initial={{ width: "0%" }}
                  whileInView={{ width: "100%" }}
                  viewport={{ once: true }}
                  transition={{ duration: 2, ease: "easeInOut", delay: 0.5 }}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative z-10">
                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0 }}
                  className="flex flex-col items-center text-center relative group"
                  data-testid="card-flow-agent"
                >
                  <div className="w-24 h-24 rounded-2xl bg-card dark:bg-[#111] border border-border dark:border-gray-800 flex items-center justify-center mb-6 transition-all duration-500 group-hover:-translate-y-2 group-hover:border-cyan-500/30 shadow-[0_0_30px_rgba(34,211,238,0.3)]">
                    <BrainCircuit size={32} className="text-cyan-500 dark:text-cyan-400" />
                  </div>
                  <div className="text-sm font-mono text-muted-foreground mb-2" data-testid="text-phase-01">PHASE 01</div>
                  <h3 className="text-xl font-bold text-foreground mb-3">Agent Logic</h3>
                  <p className="text-muted-foreground leading-relaxed max-w-xs">
                    Your autonomous agent formulates a trading strategy or execution plan and formats it as a JSON payload.
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="flex flex-col items-center text-center relative group"
                  data-testid="card-flow-tollbooth"
                >
                  <div className="w-24 h-24 rounded-2xl bg-card dark:bg-[#111] border border-border dark:border-gray-800 flex items-center justify-center mb-6 transition-all duration-500 group-hover:-translate-y-2 group-hover:border-purple-500/30 shadow-[0_0_30px_rgba(168,85,247,0.3)]">
                    <Coins size={32} className="text-purple-500 dark:text-purple-400" />
                  </div>
                  <div className="text-sm font-mono text-muted-foreground mb-2" data-testid="text-phase-02">PHASE 02</div>
                  <h3 className="text-xl font-bold text-foreground mb-3">The x402 Tollbooth</h3>
                  <p className="text-muted-foreground leading-relaxed max-w-xs">
                    The agent pays a $2.50 USDC micro-transaction on Base Mainnet. The TX hash is injected into the request header.
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                  className="flex flex-col items-center text-center relative group"
                  data-testid="card-flow-oracle"
                >
                  <div className="w-24 h-24 rounded-2xl bg-card dark:bg-[#111] border border-border dark:border-gray-800 flex items-center justify-center mb-6 transition-all duration-500 group-hover:-translate-y-2 group-hover:border-green-500/30 shadow-[0_0_30px_rgba(74,222,128,0.3)]">
                    <ShieldCheck size={32} className="text-green-500 dark:text-green-400" />
                  </div>
                  <div className="text-sm font-mono text-muted-foreground mb-2" data-testid="text-phase-03">PHASE 03</div>
                  <h3 className="text-xl font-bold text-foreground mb-3">The Zero-Trust Oracle</h3>
                  <p className="text-muted-foreground leading-relaxed max-w-xs">
                    DJZS evaluates the logic against the DJZS-LF taxonomy inside a Phala TEE enclave and returns a deterministic PASS/FAIL certificate permanently stored on Irys Datachain.
                  </p>
                </motion.div>
              </div>
            </div>
          </div>
        </section>
      </RevealSection>

      <RevealSection>
        <section id="demo" className="py-24 border-t border-border bg-background dark:bg-[#0a0a0a] overflow-hidden">
          <div className="max-w-6xl mx-auto px-6 lg:px-8">

            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold tracking-tight mb-4 text-foreground" data-testid="text-demo-headline">
                Test the Oracle
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Inject a raw reasoning trace and watch the Adversarial Logic Layer parse, grade, and cryptographically verify the payload.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 bg-card dark:bg-[#111] border border-border dark:border-gray-800 rounded-2xl overflow-hidden shadow-2xl" data-testid="demo-terminal-container">

              <div className="p-8 border-b lg:border-b-0 lg:border-r border-border dark:border-gray-800 bg-muted dark:bg-[#0d0d0d]">
                <div className="flex items-center space-x-2 mb-6">
                  <Terminal size={20} className="text-cyan-500 dark:text-cyan-400" />
                  <h3 className="font-semibold text-foreground">Agent Payload Injector</h3>
                </div>

                <div className="space-y-3 mb-8">
                  {(Object.keys(DEMO_TEST_CASES) as DemoCase[]).map((key) => (
                    <button
                      key={key}
                      onClick={() => { setDemoActiveCase(key); setDemoOutput(null); }}
                      className={`w-full text-left px-4 py-3 rounded-lg border transition-all ${
                        demoActiveCase === key
                          ? "border-purple-500 bg-purple-500/10 text-purple-600 dark:text-purple-300"
                          : "border-border dark:border-gray-800 hover:border-purple-500/30 text-muted-foreground"
                      }`}
                      data-testid={`button-demo-case-${key}`}
                    >
                      {DEMO_TEST_CASES[key].label}
                    </button>
                  ))}
                </div>

                <div className="mb-8">
                  <div className="text-xs font-mono text-muted-foreground mb-2" data-testid="text-demo-memo-label">"strategy_memo":</div>
                  <div className="p-4 rounded-lg bg-background dark:bg-black border border-border dark:border-gray-800 font-mono text-sm text-foreground/80 h-32 overflow-y-auto" data-testid="text-demo-memo">
                    {DEMO_TEST_CASES[demoActiveCase].memo}
                  </div>
                </div>

                <button
                  onClick={runDemoAudit}
                  disabled={demoScanning}
                  className="w-full flex items-center justify-center space-x-2 py-4 rounded-lg bg-foreground text-background font-bold hover:opacity-90 disabled:opacity-50 transition-colors"
                  data-testid="button-demo-execute"
                >
                  {demoScanning ? (
                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                      <Terminal size={20} />
                    </motion.div>
                  ) : (
                    <Play size={20} />
                  )}
                  <span>{demoScanning ? "ORACLE SCANNING..." : "EXECUTE JET AUDIT"}</span>
                </button>

                <Link
                  href="/demo"
                  className="w-full flex items-center justify-center space-x-2 py-3 mt-3 rounded-lg font-bold transition-all hover:-translate-y-0.5 text-white no-underline"
                  style={{ background: '#F37E20', boxShadow: '0 4px 20px rgba(243,126,32,0.3)' }}
                  data-testid="link-demo-full-pipeline"
                >
                  <FlaskConical size={18} />
                  <span>Try Full Pipeline Demo</span>
                  <ArrowRight size={16} />
                </Link>
              </div>

              <div className="p-8 bg-background dark:bg-[#050505] relative min-h-[400px] flex flex-col">
                <div className="text-xs font-mono text-muted-foreground mb-4 border-b border-border dark:border-gray-800 pb-2" data-testid="text-demo-response-label">ProofOfLogic Response</div>

                {demoScanning && (
                  <div className="flex flex-col items-center justify-center flex-1 space-y-4 opacity-70">
                    <div className="w-full h-1 bg-muted dark:bg-gray-900 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-cyan-500 shadow-[0_0_10px_#06b6d4]"
                        initial={{ width: "0%" }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 1.2, ease: "linear" }}
                      />
                    </div>
                    <div className="font-mono text-xs text-cyan-500 dark:text-cyan-400 animate-pulse" data-testid="text-demo-scanning">ANALYZING DJZS-LF TAXONOMY...</div>
                  </div>
                )}

                {!demoScanning && demoOutput && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="font-mono text-sm"
                    data-testid="demo-output-result"
                  >
                    <div className="mb-4 flex items-center space-x-2">
                      {demoOutput.verdict === "FAIL" ? (
                        <span className="px-2 py-1 bg-red-500/20 text-red-500 dark:text-red-400 rounded border border-red-500/30 flex items-center text-xs" data-testid="badge-demo-verdict-fail">
                          <AlertTriangle size={14} className="mr-1" /> VERDICT: FAIL
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-green-500/20 text-green-600 dark:text-green-400 rounded border border-green-500/30 flex items-center text-xs" data-testid="badge-demo-verdict-pass">
                          <ShieldCheck size={14} className="mr-1" /> VERDICT: PASS
                        </span>
                      )}
                      <span className="px-2 py-1 bg-muted dark:bg-gray-900 text-muted-foreground rounded border border-border dark:border-gray-800 text-xs" data-testid="text-demo-risk-score">
                        RISK: {demoOutput.risk_score}/100
                      </span>
                    </div>
                    <pre className="text-foreground/80 overflow-x-auto text-xs leading-relaxed">
                      <code>{JSON.stringify(demoOutput, null, 2)}</code>
                    </pre>
                  </motion.div>
                )}

                {!demoScanning && !demoOutput && (
                  <div className="flex items-center justify-center flex-1 font-mono text-muted-foreground text-sm" data-testid="text-demo-awaiting">
                    Awaiting payload injection...
                  </div>
                )}
              </div>

            </div>
          </div>
        </section>
      </RevealSection>

      <RevealSection>
        <WhoUsesOracle />
      </RevealSection>

      <RevealSection>
        <section className="py-24 border-t border-border bg-background dark:bg-[#050505] overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold tracking-tight text-foreground mb-4" data-testid="text-taxonomy-headline">
                The DJZS-LF Taxonomy
              </h2>
              <p className="text-muted-foreground max-w-2xl text-lg">
                Our Zero-Trust Oracle doesn't just return a score. It maps logical failures to a strict, parseable diagnostic matrix.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {([
                {
                  code: "DJZS-S01",
                  category: "Structural",
                  severity: "CRITICAL",
                  color: "text-red-500 dark:text-red-400",
                  bg: "bg-red-500/10",
                  border: "border-red-500/30",
                  icon: <Repeat size={24} />,
                  desc: "Circular Logic or Agent-Echo reinforcement. The agent validates its own assumptions without external ground truth."
                },
                {
                  code: "DJZS-E01",
                  category: "Epistemic",
                  severity: "HIGH",
                  color: "text-orange-500 dark:text-orange-400",
                  bg: "bg-orange-500/10",
                  border: "border-orange-500/30",
                  icon: <AlertOctagon size={24} />,
                  desc: "Hallucinated references, fake data integration, or reliance on mathematically impossible yield metrics."
                },
                {
                  code: "DJZS-I01",
                  category: "Incentive",
                  severity: "MEDIUM",
                  color: "text-yellow-500 dark:text-yellow-400",
                  bg: "bg-yellow-500/10",
                  border: "border-yellow-500/30",
                  icon: <TrendingDown size={24} />,
                  desc: "FOMO Loop. Execution is driven by social momentum, Twitter sentiment, or fear of missing liquidity."
                }
              ]).map((item, i) => (
                <motion.div
                  key={item.code}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.2 }}
                  className={`p-8 rounded-2xl border bg-card dark:bg-[#0a0a0a] hover:bg-muted dark:hover:bg-[#111] transition-colors ${item.border}`}
                  data-testid={`card-taxonomy-${item.code.toLowerCase()}`}
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className={`p-3 rounded-lg ${item.bg} ${item.color}`}>
                      {item.icon}
                    </div>
                    <div className={`text-xs font-mono font-bold px-2 py-1 rounded border ${item.color} ${item.bg} ${item.border}`} data-testid={`badge-severity-${item.code.toLowerCase()}`}>
                      {item.severity}
                    </div>
                  </div>
                  <div className="font-mono text-sm text-muted-foreground mb-2">{item.category} Failure</div>
                  <h3 className="text-2xl font-bold text-foreground mb-3">{item.code}</h3>
                  <p className="text-muted-foreground leading-relaxed">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </RevealSection>

      <RevealSection>
        <ApiTiers />
      </RevealSection>

      <RevealSection>
        <FinalCTA />
      </RevealSection>

      <footer className="border-t border-border py-12 bg-card dark:bg-black font-mono">
        <div className="max-w-7xl mx-auto px-6 flex flex-col items-center space-y-4">
          <div className="flex space-x-6">
            <Link href="/docs" className="text-sm text-muted-foreground hover:text-cyan-500 dark:hover:text-cyan-400 transition-colors" data-testid="link-footer-docs">
              Documentation
            </Link>
            <a href="https://basescan.org" target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-purple-500 dark:hover:text-purple-400 transition-colors" data-testid="link-footer-contract">
              Base Mainnet Contract
            </a>
            <a href="https://github.com/UsernameDAOEth" target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-green-500 dark:hover:text-green-400 transition-colors" data-testid="link-footer-github">
              GitHub
            </a>
          </div>
          <p className="text-sm text-muted-foreground/60" data-testid="text-footer-tagline">
            © 2026 DJZS Protocol. The A2A Economy Tollbooth.
          </p>
        </div>
      </footer>

      {!isConnected && !mobileBarDismissed && (
        <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden backdrop-blur-xl border-t border-border p-4 safe-area-inset-bottom" style={{ background: 'hsl(var(--muted) / 0.95)' }}>
          <div className="flex items-center gap-3 max-w-lg mx-auto">
            <Link href="/chat" className="flex-1">
              <button
                className="w-full inline-flex items-center justify-center gap-2 rounded-md px-5 py-3.5 text-sm font-bold text-white transition-colors min-h-[48px]"
                style={{ background: '#F37E20' }}
                data-testid="button-mobile-try-demo"
              >
                Enter the Zone
                <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
            <button
              onClick={() => setMobileBarDismissed(true)}
              className="shrink-0 w-10 h-10 rounded-lg flex items-center justify-center transition-colors hover:bg-muted text-muted-foreground"
              data-testid="button-dismiss-mobile-bar"
              aria-label="Dismiss"
            >
              <Plus className="w-5 h-5 rotate-45" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

