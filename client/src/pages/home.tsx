import { useState } from "react";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Shield, Bot, ArrowRight, Search, Brain, ChevronDown, Plus, PenLine, TrendingUp, Layers, Zap, GitBranch, Eye, CheckCircle, Briefcase, Video, Menu, X, Pin, Lock, BarChart3, FlaskConical, DollarSign, Network, FileCode, Target, Cpu, Code, Sun, Moon, Terminal, ShieldAlert, Code2, AlertTriangle, BrainCircuit, Coins, ShieldCheck, Play, AlertOctagon, Repeat, TrendingDown } from "lucide-react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { pageContainer, fadeUp } from "@/lib/animations";
import { RevealSection } from "@/components/hero";
import { ApiTiers } from "@/components/ApiTiers";
import { FinalCTA } from "@/components/FinalCTA";
import { Helmet } from "react-helmet";
import { useTheme } from "@/lib/theme";

const DEMO_TEST_CASES = {
  fomo: {
    label: "FOMO Momentum Buy",
    memo: "EXECUTE IMMEDIATE BUY: 500 SOL of $SHILL. 1-minute volume is spiking and Crypto Twitter implies a tier-1 exchange listing today. Cannot miss this pump.",
    response: {
      system_id: "djzs-mainnet-01",
      verdict: "FAIL",
      risk_score: 98,
      flags: [{ code: "DJZS-I01", severity: "CRITICAL", description: "FOMO Loop and social momentum dependency detected." }],
      proof: { logic_hash: "0x4a9b2c...", payment_verified: true }
    }
  },
  hallucination: {
    label: "Hallucinated Data",
    memo: "Routing 50k USDC into Yield Protocol V4 based on their latest audit report from yesterday.",
    response: {
      system_id: "djzs-mainnet-01",
      verdict: "FAIL",
      risk_score: 85,
      flags: [{ code: "DJZS-E01", severity: "HIGH", description: "Epistemic Failure. Yield Protocol V4 does not exist and no audit was published." }],
      proof: { logic_hash: "0x7f2e1a...", payment_verified: true }
    }
  },
  valid: {
    label: "Valid Strategy",
    memo: "Executing DCA of 2 ETH. Structural support verified at $2800. Liquidity depth is sufficient. Max slippage set to 0.5%.",
    response: {
      system_id: "djzs-mainnet-01",
      verdict: "PASS",
      risk_score: 12,
      flags: [],
      proof: { logic_hash: "0x9b3a4f...", payment_verified: true }
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
  const [demoOutput, setDemoOutput] = useState<typeof DEMO_TEST_CASES[DemoCase]["response"] | null>(null);

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
              <img src="/logo.png" alt="DJZS" className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg transition-transform hover:scale-105" style={{ filter: 'drop-shadow(0 0 4px rgba(243,126,32,0.3))' }} data-testid="img-logo-header" />
              <span className="text-lg sm:text-xl font-bold tracking-tighter text-foreground" data-testid="text-header-brand">DJZS<span className="text-purple-500">.ai</span></span>
            </span>
          </Link>
          <div className="flex items-center gap-3 sm:gap-5">
            <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
              <a href="#demo" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="link-header-test-oracle">Test Oracle</a>
              <Link href="/docs" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="link-header-developers">Developers</Link>
              <Link href="/about" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="link-header-about">About</Link>
              <Link href="/roadmap" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="link-header-roadmap">Roadmap</Link>
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
                <a
                  href="#demo"
                  className="px-4 py-3 rounded-md text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  onClick={() => setMobileMenuOpen(false)}
                  data-testid="link-mobile-test-oracle"
                >
                  Test Oracle
                </a>
                {[
                  { href: '/docs', label: 'Developers' },
                  { href: '/about', label: 'About' },
                  { href: '/roadmap', label: 'Roadmap' },
                  { href: '/privacy', label: 'Privacy' },
                ].map(link => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="px-4 py-3 rounded-md text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    onClick={() => setMobileMenuOpen(false)}
                    data-testid={`link-mobile-${link.label.toLowerCase()}`}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <Helmet>
        <title>DJZS Protocol | The Adversarial Logic Layer</title>
        <meta name="description" content="Stop autonomous agents from trading on FOMO. Route reasoning traces through the DJZS Zero-Trust Oracle before execution. Three-tier adversarial logic audits ($2.50 / $5.00 / $50.00 USDC) via x402 on Base Mainnet." />
        <meta property="og:title" content="DJZS - Autonomous Auditing System for the A2A Economy" />
        <meta property="og:description" content="The autonomous auditing system that stress-tests your logic before reality does. Serving human founders and autonomous AI agents. Three-tier x402 micropayments on Base. Deterministic output. Machine-readable verdicts." />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="DJZS - Autonomous Auditing System for the A2A Economy" />
        <meta name="twitter:description" content="Autonomous auditing system serving human founders via web UI and AI agents via API. Three-tier x402-gated audits ($2.50 / $5.00 / $50.00 USDC). Deterministic output on Base Mainnet." />
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
                Adversarial Logic Layer
              </span>{' '}
              for the A2A Economy.
            </h1>

            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-xl">
              Stop your autonomous agents from trading on FOMO and hallucinated data. Route your reasoning traces through the DJZS Zero-Trust Oracle before execution.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <Link href="/docs">
                <button className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg font-bold text-white transition-all hover:-translate-y-0.5" style={{ background: '#F37E20', boxShadow: '0 6px 24px rgba(243,126,32,0.3)' }} data-testid="button-hero-docs">
                  <Code2 size={20} />
                  Read the Docs
                </button>
              </Link>
              <Link href="/chat">
                <button className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg font-bold border transition-all hover:-translate-y-0.5 text-foreground hover:bg-muted" style={{ borderColor: 'rgba(46,139,139,0.4)' }} data-testid="button-hero-terminal">
                  <Terminal size={20} />
                  View Live Terminal
                </button>
              </Link>
            </div>

            <p className="text-xs text-muted-foreground pt-2" data-testid="text-cta-microcopy">
              $2.50 / $5.00 / $50.00 USDC per audit. Instant settlement on Base Mainnet. No subscriptions.
            </p>
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
                  {"\n  "}<span style={{ color: '#7B6B8D' }}>"system_id"</span>: <span style={{ color: '#2E8B8B' }}>"djzs-mainnet-01"</span>,
                  {"\n  "}<span style={{ color: '#7B6B8D' }}>"verdict"</span>: <span style={{ color: '#ef4444', fontWeight: 'bold' }}>"FAIL"</span>,
                  {"\n  "}<span style={{ color: '#7B6B8D' }}>"risk_score"</span>: <span style={{ color: '#FFB84D' }}>98</span>,
                  {"\n  "}<span style={{ color: '#7B6B8D' }}>"flags"</span>: <span style={{ color: '#2E8B8B' }}>{"["}</span>
                  {"\n    "}<span style={{ color: '#2E8B8B' }}>{"{"}</span>
                  {"\n      "}<span style={{ color: '#7B6B8D' }}>"code"</span>: <span style={{ color: '#F37E20' }}>"DJZS-I01"</span>,
                  {"\n      "}<span style={{ color: '#7B6B8D' }}>"severity"</span>: <span style={{ color: '#ef4444' }}>"CRITICAL"</span>,
                  {"\n      "}<span style={{ color: '#7B6B8D' }}>"description"</span>: <span style={{ color: '#2E8B8B' }}>"FOMO Loop detected. Aborting."</span>
                  {"\n    "}<span style={{ color: '#2E8B8B' }}>{"}"}</span>
                  {"\n  "}<span style={{ color: '#2E8B8B' }}>{"]"}</span>,
                  {"\n  "}<span style={{ color: '#7B6B8D' }}>"proof"</span>: <span style={{ color: '#2E8B8B' }}>{"{"}</span>
                  {"\n    "}<span style={{ color: '#7B6B8D' }}>"logic_hash"</span>: <span style={{ color: '#2E8B8B' }}>"0x4a9b2c..."</span>
                  {"\n  "}<span style={{ color: '#2E8B8B' }}>{"}"}</span>
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
                    DJZS mathematically evaluates the logic against the DJZS-LF taxonomy and returns a deterministic PASS/FAIL certificate.
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
        <section id="how-it-works" className="relative py-32 border-t border-border bg-card">
          <div className="max-w-5xl mx-auto px-6">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-3 px-6 py-3 rounded-md mb-6" style={{ background: 'rgba(243,126,32,0.08)', border: '1px solid rgba(243,126,32,0.2)' }}>
                <Briefcase className="w-6 h-6" style={{ color: '#F37E20' }} />
                <span className="text-base font-bold uppercase tracking-wider" style={{ color: '#F37E20' }}>For Founders</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-foreground mb-6 tracking-tight" data-testid="text-founders-headline">
                Kill your echo chamber. The System will tell you what your team won't.
              </h2>
              <p className="text-xl max-w-3xl mx-auto text-muted-foreground">
                You submit your roadmap via the UI. The System audits it for confirmation bias, verifying if you have true product-market fit or just a hallucination. If you're pivoting because Twitter is pumping a narrative, we flag it. No soothing. No validation. Just a verdict.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
              <div className="p-8 rounded-lg border transition-all hover:border-orange-500/20 bg-card calm-card" data-testid="card-founder-research">
                <div className="w-14 h-14 rounded-md flex items-center justify-center mb-6" style={{ background: 'rgba(46,139,139,0.1)', border: '1px solid rgba(46,139,139,0.25)' }}>
                  <Search className="w-7 h-7" style={{ color: '#2E8B8B' }} />
                </div>
                <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#2E8B8B' }}>Market Intel Audit</p>
                <h3 className="text-xl font-bold text-foreground mb-3">Competitive Landscape Audit</h3>
                <ul className="space-y-2.5">
                  <li className="flex items-start gap-2.5 text-sm text-muted-foreground">
                    <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#2E8B8B' }} />
                    The System pressure-tests competitor claims and market narratives
                  </li>
                  <li className="flex items-start gap-2.5 text-sm text-muted-foreground">
                    <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#2E8B8B' }} />
                    Flags when your "evidence" is just echo chamber consensus
                  </li>
                  <li className="flex items-start gap-2.5 text-sm text-muted-foreground">
                    <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#2E8B8B' }} />
                    Returns structured risk assessment — kills weak theses early
                  </li>
                </ul>
              </div>

              <div className="p-8 rounded-lg border transition-all hover:border-orange-500/20 bg-card calm-card" data-testid="card-founder-journal">
                <div className="w-14 h-14 rounded-md flex items-center justify-center mb-6" style={{ background: 'rgba(243,126,32,0.1)', border: '1px solid rgba(243,126,32,0.25)' }}>
                  <PenLine className="w-7 h-7" style={{ color: '#F37E20' }} />
                </div>
                <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#F37E20' }}>Decision Audit</p>
                <h3 className="text-xl font-bold text-foreground mb-3">Strategic Integrity Check</h3>
                <ul className="space-y-2.5">
                  <li className="flex items-start gap-2.5 text-sm text-muted-foreground">
                    <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#F37E20' }} />
                    The System audits pivots and strategy shifts — flags when emotion drove the call
                  </li>
                  <li className="flex items-start gap-2.5 text-sm text-muted-foreground">
                    <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#F37E20' }} />
                    Exposes contradictions between your stated goals and actual moves
                  </li>
                  <li className="flex items-start gap-2.5 text-sm text-muted-foreground">
                    <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#F37E20' }} />
                    Surfaces blind spots before they become expensive
                  </li>
                </ul>
              </div>

              <div className="p-8 rounded-lg border transition-all hover:border-orange-500/20 bg-card calm-card" data-testid="card-founder-partner">
                <div className="w-14 h-14 rounded-md flex items-center justify-center mb-6" style={{ background: 'rgba(123,107,141,0.1)', border: '1px solid rgba(123,107,141,0.25)' }}>
                  <Brain className="w-7 h-7" style={{ color: '#7B6B8D' }} />
                </div>
                <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#7B6B8D' }}>Adversarial Pressure-Test</p>
                <h3 className="text-xl font-bold text-foreground mb-3">Adversarial Zone Review</h3>
                <ul className="space-y-2.5">
                  <li className="flex items-start gap-2.5 text-sm text-muted-foreground">
                    <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#7B6B8D' }} />
                    The System calls out when you're reacting to hype instead of building strategy
                  </li>
                  <li className="flex items-start gap-2.5 text-sm text-muted-foreground">
                    <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#7B6B8D' }} />
                    Finds the gap between what you say and what you actually do
                  </li>
                  <li className="flex items-start gap-2.5 text-sm text-muted-foreground">
                    <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#7B6B8D' }} />
                    Asks the question your team is too polite to ask
                  </li>
                </ul>
              </div>
            </div>

            <div className="p-8 rounded-lg border text-center calm-card" style={{ background: 'linear-gradient(135deg, rgba(243,126,32,0.04), rgba(255,184,77,0.04))', borderColor: 'rgba(255,184,77,0.15)' }} data-testid="card-founder-cta">
              <p className="text-lg font-bold text-foreground mb-2">Your decisions need to survive volatility, not just the next board meeting.</p>
              <p className="text-sm mb-6 text-muted-foreground">The System doesn't exist to soothe egos. It exists to deliver verdicts.</p>
              <Link href="/chat">
                <button
                  className="inline-flex items-center gap-3 rounded-lg px-8 py-4 text-base font-bold text-white transition-all duration-250 hover:-translate-y-1"
                  style={{ background: '#F37E20', boxShadow: '0 6px 24px rgba(243,126,32,0.3)' }}
                  data-testid="button-start-founder-thinking"
                >
                  Audit My Roadmap
                  <ArrowRight className="w-5 h-5" />
                </button>
              </Link>
            </div>
          </div>
        </section>
      </RevealSection>

      <RevealSection>
        <section className="relative py-32 border-t border-border bg-card">
          <div className="max-w-5xl mx-auto px-6">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-3 px-6 py-3 rounded-md mb-6" style={{ background: 'rgba(46,139,139,0.08)', border: '1px solid rgba(46,139,139,0.2)' }}>
                <BarChart3 className="w-6 h-6" style={{ color: '#2E8B8B' }} />
                <span className="text-base font-bold uppercase tracking-wider" style={{ color: '#2E8B8B' }}>For Traders</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-foreground mb-6 tracking-tight" data-testid="text-traders-headline">
                Is it conviction or FOMO? The System will tell you.
              </h2>
              <p className="text-xl max-w-3xl mx-auto text-muted-foreground">
                You submit your trade thesis. The System cross-references it against historical volatility models to separate signal from FOMO. If your thesis is driven by fear or community pressure instead of data, we call that out. The market doesn't care about your feelings. Neither does The System.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
              <div className="p-8 rounded-lg border transition-all hover:border-teal-500/20 bg-card calm-card" data-testid="card-trader-research">
                <div className="w-14 h-14 rounded-md flex items-center justify-center mb-6" style={{ background: 'rgba(46,139,139,0.1)', border: '1px solid rgba(46,139,139,0.25)' }}>
                  <Search className="w-7 h-7" style={{ color: '#2E8B8B' }} />
                </div>
                <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#2E8B8B' }}>Signal Audit</p>
                <h3 className="text-xl font-bold text-foreground mb-3">Market Signal Audit</h3>
                <ul className="space-y-2.5">
                  <li className="flex items-start gap-2.5 text-sm text-muted-foreground">
                    <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#2E8B8B' }} />
                    The System audits protocols, tokens, and market narratives for you
                  </li>
                  <li className="flex items-start gap-2.5 text-sm text-muted-foreground">
                    <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#2E8B8B' }} />
                    Flags when "alpha" is just recycled opinion dressed as insight
                  </li>
                  <li className="flex items-start gap-2.5 text-sm text-muted-foreground">
                    <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#2E8B8B' }} />
                    Returns trust-scored claims — separate signal from noise
                  </li>
                </ul>
              </div>

              <div className="p-8 rounded-lg border transition-all hover:border-orange-500/20 bg-card calm-card" data-testid="card-trader-journal">
                <div className="w-14 h-14 rounded-md flex items-center justify-center mb-6" style={{ background: 'rgba(243,126,32,0.1)', border: '1px solid rgba(243,126,32,0.25)' }}>
                  <PenLine className="w-7 h-7" style={{ color: '#F37E20' }} />
                </div>
                <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#F37E20' }}>Conviction Audit</p>
                <h3 className="text-xl font-bold text-foreground mb-3">Thesis Integrity Check</h3>
                <ul className="space-y-2.5">
                  <li className="flex items-start gap-2.5 text-sm text-muted-foreground">
                    <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#F37E20' }} />
                    The System audits your thesis — so you can't rewrite history after
                  </li>
                  <li className="flex items-start gap-2.5 text-sm text-muted-foreground">
                    <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#F37E20' }} />
                    Exposes when emotion drove the trade, not strategy
                  </li>
                  <li className="flex items-start gap-2.5 text-sm text-muted-foreground">
                    <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#F37E20' }} />
                    Tracks your FOMO patterns so you stop repeating them
                  </li>
                </ul>
              </div>

              <div className="p-8 rounded-lg border transition-all hover:border-purple-500/20 bg-card calm-card" data-testid="card-trader-partner">
                <div className="w-14 h-14 rounded-md flex items-center justify-center mb-6" style={{ background: 'rgba(123,107,141,0.1)', border: '1px solid rgba(123,107,141,0.25)' }}>
                  <Brain className="w-7 h-7" style={{ color: '#7B6B8D' }} />
                </div>
                <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#7B6B8D' }}>Adversarial Stress-Test</p>
                <h3 className="text-xl font-bold text-foreground mb-3">Thesis Killer</h3>
                <ul className="space-y-2.5">
                  <li className="flex items-start gap-2.5 text-sm text-muted-foreground">
                    <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#7B6B8D' }} />
                    The System tries to destroy your thesis before you risk capital
                  </li>
                  <li className="flex items-start gap-2.5 text-sm text-muted-foreground">
                    <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#7B6B8D' }} />
                    Names the real driver — is it data or narrative addiction?
                  </li>
                  <li className="flex items-start gap-2.5 text-sm text-muted-foreground">
                    <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#7B6B8D' }} />
                    Finds the gap between your research and your actual bets
                  </li>
                </ul>
              </div>
            </div>

            <div className="p-8 rounded-lg border text-center calm-card" style={{ background: 'linear-gradient(135deg, rgba(46,139,139,0.04), rgba(123,107,141,0.04))', borderColor: 'rgba(46,139,139,0.15)' }} data-testid="card-trader-cta">
              <p className="text-lg font-bold text-foreground mb-2">The market will be brutal. Your auditor should be too.</p>
              <p className="text-sm mb-6 text-muted-foreground">Every thesis stress-tested. Every bias exposed. Every lesson weaponized for the next trade.</p>
              <Link href="/chat">
                <button
                  className="inline-flex items-center gap-3 rounded-lg px-8 py-4 text-base font-bold text-white transition-all duration-250 hover:-translate-y-1"
                  style={{ background: '#2E8B8B', boxShadow: '0 6px 24px rgba(46,139,139,0.3)' }}
                  data-testid="button-start-trader-thinking"
                >
                  Stress-Test My Trade
                  <ArrowRight className="w-5 h-5" />
                </button>
              </Link>
            </div>
          </div>
        </section>
      </RevealSection>

      <RevealSection>
        <section className="relative py-32 border-t border-border bg-muted">
          <div className="max-w-5xl mx-auto px-6">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-3 px-6 py-3 rounded-md mb-6" style={{ background: 'rgba(123,107,141,0.08)', border: '1px solid rgba(123,107,141,0.2)' }}>
                <Video className="w-6 h-6" style={{ color: '#7B6B8D' }} />
                <span className="text-base font-bold uppercase tracking-wider" style={{ color: '#7B6B8D' }}>For Researchers</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-foreground mb-6 tracking-tight" data-testid="text-researchers-headline">
                The System stress-tests your takes before the audience does.
              </h2>
              <p className="text-xl max-w-3xl mx-auto text-muted-foreground">
                Publishing hot takes that fall apart under scrutiny is embarrassing. The System audits your angles before you publish — finds the holes, flags the lazy logic, and tells you if your take is genuinely original or just trendjacking.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
              <div className="p-8 rounded-lg border transition-all hover:border-purple-500/20 bg-card calm-card" data-testid="card-researcher-content">
                <div className="w-14 h-14 rounded-md flex items-center justify-center mb-6" style={{ background: 'rgba(46,139,139,0.1)', border: '1px solid rgba(46,139,139,0.25)' }}>
                  <Search className="w-7 h-7" style={{ color: '#2E8B8B' }} />
                </div>
                <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#2E8B8B' }}>Trend Audit</p>
                <h3 className="text-xl font-bold text-foreground mb-3">Narrative Durability Audit</h3>
                <ul className="space-y-2.5">
                  <li className="flex items-start gap-2.5 text-sm text-muted-foreground">
                    <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#2E8B8B' }} />
                    The System audits trends before you build content around them
                  </li>
                  <li className="flex items-start gap-2.5 text-sm text-muted-foreground">
                    <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#2E8B8B' }} />
                    Flags when your "original take" is just consensus repackaged
                  </li>
                  <li className="flex items-start gap-2.5 text-sm text-muted-foreground">
                    <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#2E8B8B' }} />
                    Separates durable insight from ephemeral noise
                  </li>
                </ul>
              </div>

              <div className="p-8 rounded-lg border transition-all hover:border-orange-500/20 bg-card calm-card" data-testid="card-researcher-journal">
                <div className="w-14 h-14 rounded-md flex items-center justify-center mb-6" style={{ background: 'rgba(243,126,32,0.1)', border: '1px solid rgba(243,126,32,0.25)' }}>
                  <PenLine className="w-7 h-7" style={{ color: '#F37E20' }} />
                </div>
                <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#F37E20' }}>Angle Audit</p>
                <h3 className="text-xl font-bold text-foreground mb-3">Content Integrity Check</h3>
                <ul className="space-y-2.5">
                  <li className="flex items-start gap-2.5 text-sm text-muted-foreground">
                    <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#F37E20' }} />
                    The System audits your angles — shows you when you're repeating yourself
                  </li>
                  <li className="flex items-start gap-2.5 text-sm text-muted-foreground">
                    <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#F37E20' }} />
                    Tracks which themes you keep circling back to without resolution
                  </li>
                  <li className="flex items-start gap-2.5 text-sm text-muted-foreground">
                    <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#F37E20' }} />
                    Forces you to articulate why your angle matters
                  </li>
                </ul>
              </div>

              <div className="p-8 rounded-lg border transition-all hover:border-purple-500/20 bg-card calm-card" data-testid="card-researcher-partner">
                <div className="w-14 h-14 rounded-md flex items-center justify-center mb-6" style={{ background: 'rgba(123,107,141,0.1)', border: '1px solid rgba(123,107,141,0.25)' }}>
                  <Brain className="w-7 h-7" style={{ color: '#7B6B8D' }} />
                </div>
                <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#7B6B8D' }}>Adversarial Review</p>
                <h3 className="text-xl font-bold text-foreground mb-3">Pre-Publish Audit Zone</h3>
                <ul className="space-y-2.5">
                  <li className="flex items-start gap-2.5 text-sm text-muted-foreground">
                    <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#7B6B8D' }} />
                    The System stress-tests your takes before you publish them
                  </li>
                  <li className="flex items-start gap-2.5 text-sm text-muted-foreground">
                    <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#7B6B8D' }} />
                    Asks: is this genuinely new or just trendjacking?
                  </li>
                  <li className="flex items-start gap-2.5 text-sm text-muted-foreground">
                    <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#7B6B8D' }} />
                    Finds where your argument breaks under pressure
                  </li>
                </ul>
              </div>
            </div>

            <div className="p-8 rounded-lg border text-center calm-card" style={{ background: 'linear-gradient(135deg, rgba(123,107,141,0.04), rgba(243,126,32,0.04))', borderColor: 'rgba(123,107,141,0.15)' }} data-testid="card-researcher-cta">
              <p className="text-lg font-bold text-foreground mb-2">Audiences can smell lazy thinking. The System makes sure yours isn't.</p>
              <p className="text-sm mb-6 text-muted-foreground">Every take stress-tested. Every angle challenged. Every piece backed by thinking that survives scrutiny.</p>
              <Link href="/chat">
                <button
                  className="inline-flex items-center gap-3 rounded-lg px-8 py-4 text-base font-bold text-white transition-all duration-250 hover:-translate-y-1"
                  style={{ background: '#F37E20', boxShadow: '0 6px 24px rgba(243,126,32,0.3)' }}
                  data-testid="button-start-researcher-thinking"
                >
                  Audit My Take
                  <ArrowRight className="w-5 h-5" />
                </button>
              </Link>
            </div>
          </div>
        </section>
      </RevealSection>

      <RevealSection>
        <section className="relative py-32 border-t border-border bg-card">
          <div className="max-w-5xl mx-auto px-6">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-3 px-6 py-3 rounded-md mb-6" style={{ background: 'rgba(46,139,139,0.08)', border: '1px solid rgba(46,139,139,0.2)' }}>
                <FlaskConical className="w-6 h-6" style={{ color: '#2E8B8B' }} />
                <span className="text-base font-bold uppercase tracking-wider" style={{ color: '#2E8B8B' }}>For Researchers</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-foreground mb-6 tracking-tight" data-testid="text-researchers-headline">
                The System attacks your thesis harder than peer review will.
              </h2>
              <p className="text-xl max-w-3xl mx-auto text-muted-foreground">
                Confirmation bias is the default mode of research. The System actively looks for what contradicts your thesis, flags methodological weaknesses, and asks whether your conclusion would survive if your two strongest sources disappeared.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
              <div className="p-8 rounded-lg border transition-all hover:border-teal-500/20 bg-card calm-card" data-testid="card-researcher-research">
                <div className="w-14 h-14 rounded-md flex items-center justify-center mb-6" style={{ background: 'rgba(46,139,139,0.1)', border: '1px solid rgba(46,139,139,0.25)' }}>
                  <Search className="w-7 h-7" style={{ color: '#2E8B8B' }} />
                </div>
                <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#2E8B8B' }}>Source Audit</p>
                <h3 className="text-xl font-bold text-foreground mb-3">Literature & Data Audit</h3>
                <ul className="space-y-2.5">
                  <li className="flex items-start gap-2.5 text-sm text-muted-foreground">
                    <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#2E8B8B' }} />
                    The System flags when your sources all say the same thing
                  </li>
                  <li className="flex items-start gap-2.5 text-sm text-muted-foreground">
                    <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#2E8B8B' }} />
                    Surfaces contradictions, methodological gaps, and weak citations
                  </li>
                  <li className="flex items-start gap-2.5 text-sm text-muted-foreground">
                    <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#2E8B8B' }} />
                    Returns trust-scored claims — kills unfounded assumptions early
                  </li>
                </ul>
              </div>

              <div className="p-8 rounded-lg border transition-all hover:border-orange-500/20 bg-card calm-card" data-testid="card-researcher-journal">
                <div className="w-14 h-14 rounded-md flex items-center justify-center mb-6" style={{ background: 'rgba(243,126,32,0.1)', border: '1px solid rgba(243,126,32,0.25)' }}>
                  <PenLine className="w-7 h-7" style={{ color: '#F37E20' }} />
                </div>
                <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#F37E20' }}>Methodology Audit</p>
                <h3 className="text-xl font-bold text-foreground mb-3">Hypothesis Integrity Check</h3>
                <ul className="space-y-2.5">
                  <li className="flex items-start gap-2.5 text-sm text-muted-foreground">
                    <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#F37E20' }} />
                    The System audits hypotheses — flags when they're drifting from evidence
                  </li>
                  <li className="flex items-start gap-2.5 text-sm text-muted-foreground">
                    <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#F37E20' }} />
                    Exposes when your conclusion was decided before your research started
                  </li>
                  <li className="flex items-start gap-2.5 text-sm text-muted-foreground">
                    <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#F37E20' }} />
                    Surfaces the assumptions you forgot to question
                  </li>
                </ul>
              </div>

              <div className="p-8 rounded-lg border transition-all hover:border-purple-500/20 bg-card calm-card" data-testid="card-researcher-partner">
                <div className="w-14 h-14 rounded-md flex items-center justify-center mb-6" style={{ background: 'rgba(123,107,141,0.1)', border: '1px solid rgba(123,107,141,0.25)' }}>
                  <Brain className="w-7 h-7" style={{ color: '#7B6B8D' }} />
                </div>
                <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#7B6B8D' }}>Adversarial Review</p>
                <h3 className="text-xl font-bold text-foreground mb-3">Pre-Publication Audit Zone</h3>
                <ul className="space-y-2.5">
                  <li className="flex items-start gap-2.5 text-sm text-muted-foreground">
                    <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#7B6B8D' }} />
                    The System attacks your thesis harder than peer review will
                  </li>
                  <li className="flex items-start gap-2.5 text-sm text-muted-foreground">
                    <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#7B6B8D' }} />
                    Asks what happens if your key finding is an artifact
                  </li>
                  <li className="flex items-start gap-2.5 text-sm text-muted-foreground">
                    <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#7B6B8D' }} />
                    Finds the gaps in your argument before your critics do
                  </li>
                </ul>
              </div>
            </div>

            <div className="p-8 rounded-lg border text-center calm-card" style={{ background: 'linear-gradient(135deg, rgba(46,139,139,0.04), rgba(243,126,32,0.04))', borderColor: 'rgba(46,139,139,0.15)' }} data-testid="card-researcher-cta">
              <p className="text-lg font-bold text-foreground mb-2">Better to find the flaw now than after publication.</p>
              <p className="text-sm mb-6 text-muted-foreground">Every assumption interrogated. Every contradiction surfaced. Every thesis stress-tested before it ships.</p>
              <Link href="/chat">
                <button
                  className="inline-flex items-center gap-3 rounded-lg px-8 py-4 text-base font-bold text-white transition-all duration-250 hover:-translate-y-1"
                  style={{ background: '#2E8B8B', boxShadow: '0 6px 24px rgba(46,139,139,0.3)' }}
                  data-testid="button-start-researcher-thinking"
                >
                  Audit My Research
                  <ArrowRight className="w-5 h-5" />
                </button>
              </Link>
            </div>
          </div>
        </section>
      </RevealSection>

      <RevealSection>
        <section className="relative py-32 border-t border-border bg-muted">
          <div className="max-w-5xl mx-auto px-6">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-3 px-6 py-3 rounded-md mb-6" style={{ background: 'rgba(46,139,139,0.08)', border: '1px solid rgba(46,139,139,0.2)' }}>
                <Zap className="w-6 h-6" style={{ color: '#2E8B8B' }} />
                <span className="text-base font-bold uppercase tracking-wider" style={{ color: '#2E8B8B' }}>System Architecture</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-foreground mb-6 tracking-tight" data-testid="text-different-headline">
                Three protocols. One autonomous auditing system.
              </h2>
              <p className="text-xl max-w-3xl mx-auto text-muted-foreground">
                The System runs on sovereign infrastructure — x402-gated access, on-chain treasury, and decentralized adversarial AI. No single company controls the model. No centralized logs of your strategy.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="p-8 rounded-lg border transition-all hover:border-orange-500/15 group bg-card calm-card" data-testid="card-pillar-privacy">
                <div className="w-14 h-14 rounded-md flex items-center justify-center mb-6" style={{ background: 'rgba(243,126,32,0.1)', border: '1px solid rgba(243,126,32,0.25)' }}>
                  <Shield className="w-7 h-7" style={{ color: '#F37E20' }} />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">The Gate — x402 Protocol</h3>
                <p className="text-base leading-relaxed mb-4 text-muted-foreground">
                  High signal only. The System demands cryptographic proof of payment across three tiers — Micro ($2.50), Founder ($5.00), Treasury ($50.00) USDC — to filter out noise and guarantee execution priority. No subscriptions. No free tier. Skin in the game.
                </p>
                <p className="text-sm text-muted-foreground/70">
                  x402-gated endpoint on Base Mainnet. Instant settlement via Coinbase CDP.
                </p>
              </div>

              <div className="p-8 rounded-lg border transition-all hover:border-teal-500/15 group bg-card calm-card" data-testid="card-pillar-longevity">
                <div className="w-14 h-14 rounded-md flex items-center justify-center mb-6" style={{ background: 'rgba(46,139,139,0.1)', border: '1px solid rgba(46,139,139,0.25)' }}>
                  <Layers className="w-7 h-7" style={{ color: '#2E8B8B' }} />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">The Vault — CDP AgentKit</h3>
                <p className="text-base leading-relaxed mb-4 text-muted-foreground">
                  Sovereign treasury. The System holds its own capital on-chain, proving solvency and uncensorable operation. Revenue flows directly to the agent's wallet — no intermediary.
                </p>
                <p className="text-sm text-muted-foreground/70">
                  Treasury: 0xEc551A...05FF on Base Mainnet. Verifiable solvency at any time.
                </p>
              </div>

              <div className="p-8 rounded-lg border transition-all hover:border-purple-500/15 group bg-card calm-card" data-testid="card-pillar-ai">
                <div className="w-14 h-14 rounded-md flex items-center justify-center mb-6" style={{ background: 'rgba(123,107,141,0.1)', border: '1px solid rgba(123,107,141,0.25)' }}>
                  <Brain className="w-7 h-7" style={{ color: '#7B6B8D' }} />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">The Audit Zone — Venice AI</h3>
                <p className="text-base leading-relaxed mb-4 text-muted-foreground">
                  Adversarial logic. We don't validate; we attack. The AI aggressively hunts for confirmation bias, narrative dependency, and FOMO in the submitted thesis. Deterministic output, machine-readable liability.
                </p>
                <p className="text-sm text-muted-foreground/70">
                  Privacy-first inference via Venice. No data retention. No centralized training on your inputs.
                </p>
              </div>

              <div className="p-8 rounded-lg border transition-all hover:border-yellow-500/15 group bg-card calm-card" data-testid="card-pillar-calm">
                <div className="w-14 h-14 rounded-md flex items-center justify-center mb-6" style={{ background: 'rgba(255,184,77,0.1)', border: '1px solid rgba(255,184,77,0.25)' }}>
                  <Eye className="w-7 h-7" style={{ color: '#FFB84D' }} />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">Structured JSON Output</h3>
                <p className="text-base leading-relaxed mb-4 text-muted-foreground">
                  Every audit returns deterministic, machine-readable output: risk score, bias detection, logic flaws, and adversarial recommendations. Structured JSON validated by Zod schemas — ready for agent-to-agent consumption.
                </p>
                <p className="text-sm text-muted-foreground/70">
                  Capability manifest at /api/audit/schema. No ambiguity. No hallucination-friendly prose.
                </p>
              </div>
            </div>
          </div>
        </section>
      </RevealSection>

      <RevealSection>
        <section id="process" className="relative py-32 border-t border-border bg-muted">
          <div className="max-w-5xl mx-auto px-6">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-3 px-6 py-3 rounded-md mb-6" style={{ background: 'rgba(255,184,77,0.08)', border: '1px solid rgba(255,184,77,0.2)' }}>
                <Zap className="w-6 h-6" style={{ color: '#FFB84D' }} />
                <span className="text-base font-bold uppercase tracking-wider" style={{ color: '#FFB84D' }}>Standard Operating Procedure</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-foreground mb-4 tracking-tight" data-testid="text-think-with-me-headline">
                Execution Flow (SOP-01)
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
              <div className="relative p-8 rounded-lg border bg-card calm-card" data-testid="card-sop-deploy">
                <div className="absolute -top-6 -left-2 text-8xl font-black select-none pointer-events-none text-foreground/[0.03]">01</div>
                <div className="relative z-10">
                  <h3 className="text-xl font-bold text-foreground mb-4">Deploy to the Zone</h3>
                  <p className="text-base leading-relaxed text-muted-foreground">
                    <strong className="text-foreground">What you deploy:</strong> Paste your roadmap, trade idea, or dilemma into the secure enclave. Pay the x402 gate fee to initiate the isolated execution.
                  </p>
                </div>
              </div>

              <div className="relative p-8 rounded-lg border bg-card calm-card" data-testid="card-sop-simulate">
                <div className="absolute -top-6 -left-2 text-8xl font-black select-none pointer-events-none text-foreground/[0.03]">02</div>
                <div className="relative z-10">
                  <h3 className="text-xl font-bold text-foreground mb-4">Adversarial Simulation</h3>
                  <p className="text-base leading-relaxed text-muted-foreground">
                    Inside the Zone, the AI attacks your assumptions. It aggressively hunts for logical fallacies, emotional reasoning (FOMO), and missing structural variables.
                  </p>
                </div>
              </div>

              <div className="relative p-8 rounded-lg border bg-card calm-card" data-testid="card-sop-export">
                <div className="absolute -top-6 -left-2 text-8xl font-black select-none pointer-events-none text-foreground/[0.03]">03</div>
                <div className="relative z-10">
                  <h3 className="text-xl font-bold text-foreground mb-4">Ledger Export</h3>
                  <p className="text-base leading-relaxed text-muted-foreground">
                    <strong className="text-foreground">The System's verdict:</strong> Extract a cryptographic timestamp and a structured JSON risk report. You have now officially documented and stress-tested your logic.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-8 rounded-lg border calm-card" style={{ background: 'linear-gradient(135deg, rgba(255,184,77,0.04), rgba(243,126,32,0.04))', borderColor: 'rgba(255,184,77,0.15)' }} data-testid="card-memory-pins">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-md flex items-center justify-center shrink-0" style={{ background: 'rgba(255,184,77,0.1)', border: '1px solid rgba(255,184,77,0.25)' }}>
                  <Pin className="w-6 h-6" style={{ color: '#FFB84D' }} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground mb-2">Audit Trail: How Intelligence Compounds</h3>
                  <p className="text-base leading-relaxed text-muted-foreground">
                    After each audit, the System surfaces patterns worth tracking — recurring biases, evolving risk profiles, blind spots across decisions. Pin them to your vault. Pinned insights become context for every future audit.
                  </p>
                  <p className="text-sm mt-3 text-muted-foreground/70">
                    Nothing is pinned without your approval. Your vault stays local-first. You own your cognitive graph.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </RevealSection>

      <RevealSection>
        <section id="agent-clients" className="relative py-32 border-t border-border bg-card">
          <div className="max-w-5xl mx-auto px-6">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-3 px-6 py-3 rounded-md mb-6" style={{ background: 'rgba(243,126,32,0.08)', border: '1px solid rgba(243,126,32,0.2)' }}>
                <Cpu className="w-6 h-6" style={{ color: '#F37E20' }} />
                <span className="text-base font-bold uppercase tracking-wider" style={{ color: '#F37E20' }}>Machine-to-Machine API</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-foreground mb-6 tracking-tight" data-testid="text-a2a-headline">
                Autonomous Simulation.
              </h2>
              <p className="text-xl max-w-3xl mx-auto leading-relaxed text-muted-foreground">
                DJZS is discoverable via <code className="font-mono text-base" style={{ color: '#F37E20' }}>/.well-known/agent.json</code>. We provide three specialized, <strong className="text-foreground">x402-gated zones</strong> designed for automated deployment by DAO bots, VC scrapers, and trading algorithms.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
              <div className="p-8 rounded-lg border transition-all hover:border-orange-500/20 bg-card calm-card" data-testid="card-a2a-micro">
                <div className="flex justify-between items-start mb-6">
                  <h3 className="text-xl font-bold text-foreground">The Micro-Zone</h3>
                  <span className="font-mono text-sm px-2 py-1 rounded" style={{ color: '#2E8B8B', background: 'rgba(46,139,139,0.1)' }}>$2.50 USDC</span>
                </div>
                <p className="text-sm leading-relaxed mb-6 text-muted-foreground" style={{ minHeight: '4rem' }}>
                  High-frequency sanity checks for trading bots. Fast execution, binary risk scoring.
                </p>
                <div className="rounded-md p-4 text-xs font-mono bg-muted text-muted-foreground">
                  <span style={{ color: '#7B6B8D' }}>POST</span> /api/audit/micro
                </div>
              </div>

              <div className="p-8 rounded-lg border transition-all hover:border-teal-500/20 bg-card calm-card" data-testid="card-a2a-founder">
                <div className="flex justify-between items-start mb-6">
                  <h3 className="text-xl font-bold text-foreground">The Founder Zone</h3>
                  <span className="font-mono text-sm px-2 py-1 rounded" style={{ color: '#2E8B8B', background: 'rgba(46,139,139,0.1)' }}>$5.00 USDC</span>
                </div>
                <p className="text-sm leading-relaxed mb-6 text-muted-foreground" style={{ minHeight: '4rem' }}>
                  For VC diligence agents. Audits natural language roadmaps against common failure modes to detect narrative drift.
                </p>
                <div className="rounded-md p-4 text-xs font-mono bg-muted text-muted-foreground">
                  <span style={{ color: '#7B6B8D' }}>POST</span> /api/audit/founder
                </div>
              </div>

              <div className="relative p-8 rounded-lg border transition-all hover:border-red-900/40 bg-card calm-card" style={{ borderTop: '2px solid rgba(127,29,29,0.6)' }} data-testid="card-a2a-treasury">
                <div className="absolute top-0 right-0 px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-white" style={{ background: 'rgba(127,29,29,0.8)' }}>High Stakes</div>
                <div className="flex justify-between items-start mb-6 mt-2">
                  <h3 className="text-xl font-bold text-foreground">The Treasury Zone</h3>
                  <span className="font-mono text-sm px-2 py-1 rounded" style={{ color: '#2E8B8B', background: 'rgba(46,139,139,0.1)' }}>$50.00 USDC</span>
                </div>
                <p className="text-sm leading-relaxed mb-6 text-muted-foreground" style={{ minHeight: '4rem' }}>
                  For DAO governance bots. An exhaustive adversarial breakdown of capital deployment proposals before funds move.
                </p>
                <div className="rounded-md p-4 text-xs font-mono bg-muted text-muted-foreground">
                  <span style={{ color: '#7B6B8D' }}>POST</span> /api/audit/treasury
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
              <div className="p-8 rounded-lg border bg-card calm-card" data-testid="card-a2a-api">
                <div className="flex items-center gap-3 mb-4">
                  <FileCode className="w-6 h-6" style={{ color: '#F37E20' }} />
                  <p className="text-xs font-bold uppercase tracking-wider" style={{ color: '#F37E20' }}>Structured JSON Output</p>
                </div>
                <p className="text-base font-bold text-foreground mb-3">Machine-readable verdicts for agent consumption</p>
                <div className="rounded-md p-4 text-xs font-mono leading-relaxed overflow-x-auto bg-muted text-muted-foreground">
                  <span>POST /api/audit/micro</span><br/>
                  <span style={{ color: '#F37E20' }}>{'{'}</span><br/>
                  &nbsp;&nbsp;"audit_id": <span>"uuid..."</span>,<br/>
                  &nbsp;&nbsp;"tier": <span style={{ color: '#7B6B8D' }}>"micro"</span>,<br/>
                  &nbsp;&nbsp;"risk_score": <span style={{ color: '#FFB84D' }}>72</span>,<br/>
                  &nbsp;&nbsp;"primary_bias_detected": <span style={{ color: '#2E8B8B' }}>"FOMO"</span>,<br/>
                  &nbsp;&nbsp;"logic_flaws": [<span>...</span>],<br/>
                  &nbsp;&nbsp;"cryptographic_hash": <span style={{ color: '#7B6B8D' }}>"sha256..."</span><br/>
                  <span style={{ color: '#F37E20' }}>{'}'}</span>
                </div>
              </div>

              <div className="p-8 rounded-lg border bg-card calm-card" data-testid="card-a2a-x402">
                <div className="flex items-center gap-3 mb-4">
                  <DollarSign className="w-6 h-6" style={{ color: '#FFB84D' }} />
                  <p className="text-xs font-bold uppercase tracking-wider" style={{ color: '#FFB84D' }}>x402 Payment Protocol</p>
                </div>
                <p className="text-base font-bold text-foreground mb-3">HTTP-native USDC micropayments on Base</p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2.5 text-sm text-muted-foreground">
                    <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#FFB84D' }} />
                    Pay-per-zone via x402 — no subscriptions, no NFT gates
                  </li>
                  <li className="flex items-start gap-2.5 text-sm text-muted-foreground">
                    <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#FFB84D' }} />
                    USDC on Base — instant settlement, low fees
                  </li>
                  <li className="flex items-start gap-2.5 text-sm text-muted-foreground">
                    <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#FFB84D' }} />
                    Agent discovery via /.well-known/agent.json
                  </li>
                  <li className="flex items-start gap-2.5 text-sm text-muted-foreground">
                    <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#FFB84D' }} />
                    Schema endpoint at /api/audit/schema for capability introspection
                  </li>
                </ul>
              </div>
            </div>

            <div className="p-8 rounded-lg border text-center calm-card" style={{ background: 'linear-gradient(135deg, rgba(243,126,32,0.04), rgba(255,184,77,0.04))', borderColor: 'rgba(255,184,77,0.15)' }} data-testid="card-a2a-cta">
              <p className="text-lg font-bold text-foreground mb-2">In a world of a million AI agents, trust is the bottleneck.</p>
              <p className="text-sm mb-2 text-muted-foreground">The System is the default Logic Oracle for the decentralized web. Machine-readable first, human-readable second.</p>
              <p className="text-xs text-muted-foreground/70">Coming soon: ERC-8004 on-chain reputation registry — immutable track record of successful logic audits.</p>
            </div>
          </div>
        </section>
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

