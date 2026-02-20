import { useState, type ReactNode } from "react";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Shield, Bot, ArrowRight, Search, Brain, ChevronDown, Plus, PenLine, TrendingUp, Layers, Zap, GitBranch, Eye, CheckCircle, Briefcase, Video, Menu, X, Pin, Lock, BarChart3, FlaskConical, DollarSign, Network, FileCode, Target, Cpu, Code } from "lucide-react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { pageContainer, fadeUp } from "@/lib/animations";
import { RevealSection } from "@/components/hero";
import { Helmet } from "react-helmet";

export default function Home() {
  const { isConnected } = useAccount();
  const [mobileBarDismissed, setMobileBarDismissed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToProcess = () => {
    const el = document.getElementById("process");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen text-white overflow-hidden" style={{ background: '#0F1115' }}>
      <style>{`
        @keyframes breathe {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.03); }
        }
        ::selection { background: rgba(243,126,32,0.3); }
        .calm-card { transition: box-shadow 0.3s ease; }
        .calm-card:hover { box-shadow: 0 0 24px rgba(255,255,255,0.02), 0 4px 32px rgba(0,0,0,0.3); }
      `}</style>

      <header className="sticky top-0 z-50 backdrop-blur-xl border-b border-white/[0.06]" style={{ background: 'rgba(15,17,21,0.88)', boxShadow: '0 1px 20px rgba(0,0,0,0.15)' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <Link href="/">
            <span className="flex items-center gap-2.5" data-testid="link-home-logo">
              <img src="/logo.png" alt="DJZS" className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg transition-transform hover:scale-105" style={{ filter: 'drop-shadow(0 0 4px rgba(243,126,32,0.3))' }} data-testid="img-logo-header" />
              <span className="text-lg sm:text-xl font-black tracking-widest uppercase" style={{ color: '#F37E20' }}>DJZS</span>
            </span>
          </Link>
          <div className="flex items-center gap-3 sm:gap-5">
            <nav className="hidden md:flex items-center gap-1">
              {[
                { href: '/docs', label: 'Docs' },
                { href: '/about', label: 'About' },
                { href: '/privacy', label: 'Privacy' },
                { href: '/roadmap', label: 'Roadmap' },
              ].map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="relative px-3 py-1.5 text-sm font-medium transition-colors hover:text-white group"
                  style={{ color: '#9a9bb0' }}
                  data-testid={`link-header-${link.label.toLowerCase()}`}
                >
                  {link.label}
                  <span className="absolute bottom-0 left-3 right-3 h-px scale-x-0 group-hover:scale-x-100 transition-transform origin-left" style={{ background: '#F37E20' }} />
                </Link>
              ))}
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
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden w-10 h-10 rounded-lg flex items-center justify-center transition-colors hover:bg-white/[0.06]"
              style={{ color: '#9a9bb0' }}
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
              className="md:hidden border-t border-white/[0.06] overflow-hidden"
              style={{ background: 'rgba(15,17,21,0.98)' }}
            >
              <nav className="flex flex-col px-4 py-3 gap-1">
                {[
                  { href: '/docs', label: 'Docs' },
                  { href: '/about', label: 'About' },
                  { href: '/privacy', label: 'Privacy' },
                  { href: '/security', label: 'Security' },
                  { href: '/roadmap', label: 'Roadmap' },
                ].map(link => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="px-4 py-3 rounded-md text-sm font-medium transition-colors hover:bg-white/[0.04] hover:text-white"
                    style={{ color: '#9a9bb0' }}
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
        <title>DJZS - Decentralized Journaling Zone System</title>
        <meta name="description" content="Autonomous auditing system for the A2A economy. Serving human founders via web UI and AI agents via programmatic API. Three-tier adversarial logic audits ($2.50 / $5.00 / $50.00 USDC) via x402 on Base Mainnet." />
        <meta property="og:title" content="DJZS - Autonomous Auditing System for the A2A Economy" />
        <meta property="og:description" content="The autonomous auditing system that stress-tests your logic before reality does. Serving human founders and autonomous AI agents. Three-tier x402 micropayments on Base. Deterministic output. Machine-readable verdicts." />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="DJZS - Autonomous Auditing System for the A2A Economy" />
        <meta name="twitter:description" content="Autonomous auditing system serving human founders via web UI and AI agents via API. Three-tier x402-gated audits ($2.50 / $5.00 / $50.00 USDC). Deterministic output on Base Mainnet." />
      </Helmet>

      <motion.section
        variants={pageContainer}
        initial="hidden"
        animate="show"
        className="relative min-h-[92vh] flex items-center justify-center overflow-hidden"
        style={{ background: 'radial-gradient(ellipse at top, rgba(243,126,32,0.03) 0%, #0F1115 70%)' }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `
              radial-gradient(800px 400px at 30% 40%, rgba(243,126,32,0.10), transparent 60%),
              radial-gradient(600px 300px at 70% 60%, rgba(46,139,139,0.08), transparent 60%),
              radial-gradient(400px 200px at 50% 80%, rgba(123,107,141,0.06), transparent 60%)
            `,
            animation: "breathe 30s ease-in-out infinite",
          }}
        />

        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          <motion.div variants={fadeUp} className="mb-6">
            <span className="inline-flex items-center gap-3 px-6 py-3 rounded-md text-base font-bold uppercase tracking-wider" style={{ background: 'rgba(243,126,32,0.08)', border: '1px solid rgba(243,126,32,0.2)', color: '#F37E20' }}>
              <Target className="w-6 h-6" />
              The Autonomous Auditing System
            </span>
          </motion.div>

          <motion.h1
            variants={fadeUp}
            className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter leading-[1] mb-8"
          >
            <span className="text-white">DECENTRALIZED</span> <br />
            <span className="text-white">JOURNALING</span> <span style={{ color: '#555668' }}>ZONE SYSTEM.</span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="text-2xl md:text-3xl max-w-4xl mx-auto leading-tight mb-12 font-medium"
            style={{ color: '#9a9bb0' }}
          >
            An autonomous auditing system operating natively in the A2A economy. Serving founders via Web UI and agents via API, DJZS pressure-tests reasoning, flags FOMO, and ensures your decisions survive volatility.
          </motion.p>

          <motion.div variants={fadeUp} className="flex flex-col items-center gap-4 mb-12">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              {isConnected ? (
                <Link href="/chat">
                  <button
                    className="inline-flex items-center gap-3 rounded-lg px-10 py-5 text-lg font-bold text-white transition-all duration-250 hover:-translate-y-1"
                    style={{ background: '#F37E20', boxShadow: '0 8px 30px rgba(243,126,32,0.3)' }}
                    data-testid="button-start-thinking"
                  >
                    <Target className="w-6 h-6" />
                    Enter the Zone
                  </button>
                </Link>
              ) : (
                <>
                  <Link href="/chat">
                    <button
                      className="inline-flex items-center gap-3 rounded-lg px-10 py-5 text-lg font-bold transition-all duration-250 hover:-translate-y-1"
                      style={{ background: '#F37E20', color: '#fff', boxShadow: '0 8px 30px rgba(243,126,32,0.3)' }}
                      data-testid="button-start-thinking"
                    >
                      <Target className="w-6 h-6" />
                      Enter the Zone
                    </button>
                  </Link>
                  <a href="#agent-clients">
                    <button
                      className="inline-flex items-center gap-3 rounded-lg border px-8 py-5 text-lg font-bold transition-all duration-250 hover:text-white"
                      style={{ borderColor: 'rgba(46,139,139,0.3)', color: '#9a9bb0' }}
                      data-testid="button-see-how-it-works"
                    >
                      <Code className="w-5 h-5" />
                      Agent API Specs
                    </button>
                  </a>
                </>
              )}
            </div>
            <p className="text-sm" style={{ color: '#7a7b90' }} data-testid="text-cta-microcopy">
              Three tiers: $2.50 / $5.00 / $50.00 USDC per audit. Instant settlement on Base Mainnet. No subscriptions.
            </p>
          </motion.div>

          <motion.div
            variants={fadeUp}
            className="flex flex-col sm:flex-row items-center justify-center gap-10 text-base font-medium"
            style={{ color: '#7a7b90' }}
          >
            <div className="flex items-center gap-3" data-testid="text-trust-local">
              <Lock className="w-5 h-5" style={{ color: '#F37E20' }} />
              <span>x402-Gated Endpoint</span>
            </div>
            <div className="flex items-center gap-3" data-testid="text-trust-ai">
              <Zap className="w-5 h-5" style={{ color: '#2E8B8B' }} />
              <span>Adversarial Simulation</span>
            </div>
            <div className="flex items-center gap-3" data-testid="text-trust-encrypted">
              <Target className="w-5 h-5" style={{ color: '#7B6B8D' }} />
              <span>Deterministic Output</span>
            </div>
            <div className="flex items-center gap-3" data-testid="text-trust-private">
              <Shield className="w-5 h-5" style={{ color: '#FFB84D' }} />
              <span>E2E Encrypted</span>
            </div>
          </motion.div>
        </div>
      </motion.section>

      <RevealSection>
        <section id="how-it-works" className="relative py-32 border-t border-white/[0.06]" style={{ background: '#14171D' }}>
          <div className="max-w-5xl mx-auto px-6">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-3 px-6 py-3 rounded-md mb-6" style={{ background: 'rgba(243,126,32,0.08)', border: '1px solid rgba(243,126,32,0.2)' }}>
                <Briefcase className="w-6 h-6" style={{ color: '#F37E20' }} />
                <span className="text-base font-bold uppercase tracking-wider" style={{ color: '#F37E20' }}>For Founders</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight" data-testid="text-founders-headline">
                Kill your echo chamber. The System will tell you what your team won't.
              </h2>
              <p className="text-xl max-w-3xl mx-auto" style={{ color: '#7a7b90' }}>
                You submit your roadmap via the UI. The System audits it for confirmation bias, verifying if you have true product-market fit or just a hallucination. If you're pivoting because Twitter is pumping a narrative, we flag it. No soothing. No validation. Just a verdict.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
              <div className="p-8 rounded-lg border transition-all hover:border-orange-500/20 calm-card" style={{ background: 'rgba(255,255,255,0.015)', borderColor: 'rgba(255,255,255,0.06)' }} data-testid="card-founder-research">
                <div className="w-14 h-14 rounded-md flex items-center justify-center mb-6" style={{ background: 'rgba(46,139,139,0.1)', border: '1px solid rgba(46,139,139,0.25)' }}>
                  <Search className="w-7 h-7" style={{ color: '#2E8B8B' }} />
                </div>
                <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#2E8B8B' }}>Market Intel Audit</p>
                <h3 className="text-xl font-bold text-white mb-3">Competitive Landscape Audit</h3>
                <ul className="space-y-2.5">
                  <li className="flex items-start gap-2.5 text-sm" style={{ color: '#9a9bb0' }}>
                    <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#2E8B8B' }} />
                    The System pressure-tests competitor claims and market narratives
                  </li>
                  <li className="flex items-start gap-2.5 text-sm" style={{ color: '#9a9bb0' }}>
                    <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#2E8B8B' }} />
                    Flags when your "evidence" is just echo chamber consensus
                  </li>
                  <li className="flex items-start gap-2.5 text-sm" style={{ color: '#9a9bb0' }}>
                    <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#2E8B8B' }} />
                    Returns structured risk assessment — kills weak theses early
                  </li>
                </ul>
              </div>

              <div className="p-8 rounded-lg border transition-all hover:border-orange-500/20 calm-card" style={{ background: 'rgba(255,255,255,0.015)', borderColor: 'rgba(255,255,255,0.06)' }} data-testid="card-founder-journal">
                <div className="w-14 h-14 rounded-md flex items-center justify-center mb-6" style={{ background: 'rgba(243,126,32,0.1)', border: '1px solid rgba(243,126,32,0.25)' }}>
                  <PenLine className="w-7 h-7" style={{ color: '#F37E20' }} />
                </div>
                <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#F37E20' }}>Decision Audit</p>
                <h3 className="text-xl font-bold text-white mb-3">Strategic Integrity Check</h3>
                <ul className="space-y-2.5">
                  <li className="flex items-start gap-2.5 text-sm" style={{ color: '#9a9bb0' }}>
                    <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#F37E20' }} />
                    The System audits pivots and strategy shifts — flags when emotion drove the call
                  </li>
                  <li className="flex items-start gap-2.5 text-sm" style={{ color: '#9a9bb0' }}>
                    <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#F37E20' }} />
                    Exposes contradictions between your stated goals and actual moves
                  </li>
                  <li className="flex items-start gap-2.5 text-sm" style={{ color: '#9a9bb0' }}>
                    <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#F37E20' }} />
                    Surfaces blind spots before they become expensive
                  </li>
                </ul>
              </div>

              <div className="p-8 rounded-lg border transition-all hover:border-orange-500/20 calm-card" style={{ background: 'rgba(255,255,255,0.015)', borderColor: 'rgba(255,255,255,0.06)' }} data-testid="card-founder-partner">
                <div className="w-14 h-14 rounded-md flex items-center justify-center mb-6" style={{ background: 'rgba(123,107,141,0.1)', border: '1px solid rgba(123,107,141,0.25)' }}>
                  <Brain className="w-7 h-7" style={{ color: '#7B6B8D' }} />
                </div>
                <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#7B6B8D' }}>Adversarial Pressure-Test</p>
                <h3 className="text-xl font-bold text-white mb-3">Adversarial Zone Review</h3>
                <ul className="space-y-2.5">
                  <li className="flex items-start gap-2.5 text-sm" style={{ color: '#9a9bb0' }}>
                    <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#7B6B8D' }} />
                    The System calls out when you're reacting to hype instead of building strategy
                  </li>
                  <li className="flex items-start gap-2.5 text-sm" style={{ color: '#9a9bb0' }}>
                    <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#7B6B8D' }} />
                    Finds the gap between what you say and what you actually do
                  </li>
                  <li className="flex items-start gap-2.5 text-sm" style={{ color: '#9a9bb0' }}>
                    <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#7B6B8D' }} />
                    Asks the question your team is too polite to ask
                  </li>
                </ul>
              </div>
            </div>

            <div className="p-8 rounded-lg border text-center calm-card" style={{ background: 'linear-gradient(135deg, rgba(243,126,32,0.04), rgba(255,184,77,0.04))', borderColor: 'rgba(255,184,77,0.15)' }} data-testid="card-founder-cta">
              <p className="text-lg font-bold text-white mb-2">Your decisions need to survive volatility, not just the next board meeting.</p>
              <p className="text-sm mb-6" style={{ color: '#7a7b90' }}>The System doesn't exist to soothe egos. It exists to deliver verdicts.</p>
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
        <section className="relative py-32 border-t border-white/[0.06]" style={{ background: '#0F1115' }}>
          <div className="max-w-5xl mx-auto px-6">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-3 px-6 py-3 rounded-md mb-6" style={{ background: 'rgba(46,139,139,0.08)', border: '1px solid rgba(46,139,139,0.2)' }}>
                <BarChart3 className="w-6 h-6" style={{ color: '#2E8B8B' }} />
                <span className="text-base font-bold uppercase tracking-wider" style={{ color: '#2E8B8B' }}>For Traders</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight" data-testid="text-traders-headline">
                Is it conviction or FOMO? The System will tell you.
              </h2>
              <p className="text-xl max-w-3xl mx-auto" style={{ color: '#7a7b90' }}>
                You submit your trade thesis. The System cross-references it against historical volatility models to separate signal from FOMO. If your thesis is driven by fear or community pressure instead of data, we call that out. The market doesn't care about your feelings. Neither does The System.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
              <div className="p-8 rounded-lg border transition-all hover:border-teal-500/20 calm-card" style={{ background: 'rgba(255,255,255,0.015)', borderColor: 'rgba(255,255,255,0.06)' }} data-testid="card-trader-research">
                <div className="w-14 h-14 rounded-md flex items-center justify-center mb-6" style={{ background: 'rgba(46,139,139,0.1)', border: '1px solid rgba(46,139,139,0.25)' }}>
                  <Search className="w-7 h-7" style={{ color: '#2E8B8B' }} />
                </div>
                <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#2E8B8B' }}>Signal Audit</p>
                <h3 className="text-xl font-bold text-white mb-3">Market Signal Audit</h3>
                <ul className="space-y-2.5">
                  <li className="flex items-start gap-2.5 text-sm" style={{ color: '#9a9bb0' }}>
                    <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#2E8B8B' }} />
                    The System audits protocols, tokens, and market narratives for you
                  </li>
                  <li className="flex items-start gap-2.5 text-sm" style={{ color: '#9a9bb0' }}>
                    <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#2E8B8B' }} />
                    Flags when "alpha" is just recycled opinion dressed as insight
                  </li>
                  <li className="flex items-start gap-2.5 text-sm" style={{ color: '#9a9bb0' }}>
                    <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#2E8B8B' }} />
                    Returns trust-scored claims — separate signal from noise
                  </li>
                </ul>
              </div>

              <div className="p-8 rounded-lg border transition-all hover:border-orange-500/20 calm-card" style={{ background: 'rgba(255,255,255,0.015)', borderColor: 'rgba(255,255,255,0.06)' }} data-testid="card-trader-journal">
                <div className="w-14 h-14 rounded-md flex items-center justify-center mb-6" style={{ background: 'rgba(243,126,32,0.1)', border: '1px solid rgba(243,126,32,0.25)' }}>
                  <PenLine className="w-7 h-7" style={{ color: '#F37E20' }} />
                </div>
                <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#F37E20' }}>Conviction Audit</p>
                <h3 className="text-xl font-bold text-white mb-3">Thesis Integrity Check</h3>
                <ul className="space-y-2.5">
                  <li className="flex items-start gap-2.5 text-sm" style={{ color: '#9a9bb0' }}>
                    <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#F37E20' }} />
                    The System audits your thesis — so you can't rewrite history after
                  </li>
                  <li className="flex items-start gap-2.5 text-sm" style={{ color: '#9a9bb0' }}>
                    <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#F37E20' }} />
                    Exposes when emotion drove the trade, not strategy
                  </li>
                  <li className="flex items-start gap-2.5 text-sm" style={{ color: '#9a9bb0' }}>
                    <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#F37E20' }} />
                    Tracks your FOMO patterns so you stop repeating them
                  </li>
                </ul>
              </div>

              <div className="p-8 rounded-lg border transition-all hover:border-purple-500/20 calm-card" style={{ background: 'rgba(255,255,255,0.015)', borderColor: 'rgba(255,255,255,0.06)' }} data-testid="card-trader-partner">
                <div className="w-14 h-14 rounded-md flex items-center justify-center mb-6" style={{ background: 'rgba(123,107,141,0.1)', border: '1px solid rgba(123,107,141,0.25)' }}>
                  <Brain className="w-7 h-7" style={{ color: '#7B6B8D' }} />
                </div>
                <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#7B6B8D' }}>Adversarial Stress-Test</p>
                <h3 className="text-xl font-bold text-white mb-3">Thesis Killer</h3>
                <ul className="space-y-2.5">
                  <li className="flex items-start gap-2.5 text-sm" style={{ color: '#9a9bb0' }}>
                    <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#7B6B8D' }} />
                    The System tries to destroy your thesis before you risk capital
                  </li>
                  <li className="flex items-start gap-2.5 text-sm" style={{ color: '#9a9bb0' }}>
                    <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#7B6B8D' }} />
                    Names the real driver — is it data or narrative addiction?
                  </li>
                  <li className="flex items-start gap-2.5 text-sm" style={{ color: '#9a9bb0' }}>
                    <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#7B6B8D' }} />
                    Finds the gap between your research and your actual bets
                  </li>
                </ul>
              </div>
            </div>

            <div className="p-8 rounded-lg border text-center calm-card" style={{ background: 'linear-gradient(135deg, rgba(46,139,139,0.04), rgba(123,107,141,0.04))', borderColor: 'rgba(46,139,139,0.15)' }} data-testid="card-trader-cta">
              <p className="text-lg font-bold text-white mb-2">The market will be brutal. Your auditor should be too.</p>
              <p className="text-sm mb-6" style={{ color: '#7a7b90' }}>Every thesis stress-tested. Every bias exposed. Every lesson weaponized for the next trade.</p>
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
        <section className="relative py-32 border-t border-white/[0.06]" style={{ background: '#14171D' }}>
          <div className="max-w-5xl mx-auto px-6">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-3 px-6 py-3 rounded-md mb-6" style={{ background: 'rgba(123,107,141,0.08)', border: '1px solid rgba(123,107,141,0.2)' }}>
                <Video className="w-6 h-6" style={{ color: '#7B6B8D' }} />
                <span className="text-base font-bold uppercase tracking-wider" style={{ color: '#7B6B8D' }}>For Researchers</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight" data-testid="text-researchers-headline">
                The System stress-tests your takes before the audience does.
              </h2>
              <p className="text-xl max-w-3xl mx-auto" style={{ color: '#7a7b90' }}>
                Publishing hot takes that fall apart under scrutiny is embarrassing. The System audits your angles before you publish — finds the holes, flags the lazy logic, and tells you if your take is genuinely original or just trendjacking.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
              <div className="p-8 rounded-lg border transition-all hover:border-purple-500/20 calm-card" style={{ background: 'rgba(255,255,255,0.015)', borderColor: 'rgba(255,255,255,0.06)' }} data-testid="card-researcher-content">
                <div className="w-14 h-14 rounded-md flex items-center justify-center mb-6" style={{ background: 'rgba(46,139,139,0.1)', border: '1px solid rgba(46,139,139,0.25)' }}>
                  <Search className="w-7 h-7" style={{ color: '#2E8B8B' }} />
                </div>
                <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#2E8B8B' }}>Trend Audit</p>
                <h3 className="text-xl font-bold text-white mb-3">Narrative Durability Audit</h3>
                <ul className="space-y-2.5">
                  <li className="flex items-start gap-2.5 text-sm" style={{ color: '#9a9bb0' }}>
                    <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#2E8B8B' }} />
                    The System audits trends before you build content around them
                  </li>
                  <li className="flex items-start gap-2.5 text-sm" style={{ color: '#9a9bb0' }}>
                    <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#2E8B8B' }} />
                    Flags when your "original take" is just consensus repackaged
                  </li>
                  <li className="flex items-start gap-2.5 text-sm" style={{ color: '#9a9bb0' }}>
                    <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#2E8B8B' }} />
                    Separates durable insight from ephemeral noise
                  </li>
                </ul>
              </div>

              <div className="p-8 rounded-lg border transition-all hover:border-orange-500/20 calm-card" style={{ background: 'rgba(255,255,255,0.015)', borderColor: 'rgba(255,255,255,0.06)' }} data-testid="card-researcher-journal">
                <div className="w-14 h-14 rounded-md flex items-center justify-center mb-6" style={{ background: 'rgba(243,126,32,0.1)', border: '1px solid rgba(243,126,32,0.25)' }}>
                  <PenLine className="w-7 h-7" style={{ color: '#F37E20' }} />
                </div>
                <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#F37E20' }}>Angle Audit</p>
                <h3 className="text-xl font-bold text-white mb-3">Content Integrity Check</h3>
                <ul className="space-y-2.5">
                  <li className="flex items-start gap-2.5 text-sm" style={{ color: '#9a9bb0' }}>
                    <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#F37E20' }} />
                    The System audits your angles — shows you when you're repeating yourself
                  </li>
                  <li className="flex items-start gap-2.5 text-sm" style={{ color: '#9a9bb0' }}>
                    <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#F37E20' }} />
                    Tracks which themes you keep circling back to without resolution
                  </li>
                  <li className="flex items-start gap-2.5 text-sm" style={{ color: '#9a9bb0' }}>
                    <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#F37E20' }} />
                    Forces you to articulate why your angle matters
                  </li>
                </ul>
              </div>

              <div className="p-8 rounded-lg border transition-all hover:border-purple-500/20 calm-card" style={{ background: 'rgba(255,255,255,0.015)', borderColor: 'rgba(255,255,255,0.06)' }} data-testid="card-researcher-partner">
                <div className="w-14 h-14 rounded-md flex items-center justify-center mb-6" style={{ background: 'rgba(123,107,141,0.1)', border: '1px solid rgba(123,107,141,0.25)' }}>
                  <Brain className="w-7 h-7" style={{ color: '#7B6B8D' }} />
                </div>
                <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#7B6B8D' }}>Adversarial Review</p>
                <h3 className="text-xl font-bold text-white mb-3">Pre-Publish Audit Zone</h3>
                <ul className="space-y-2.5">
                  <li className="flex items-start gap-2.5 text-sm" style={{ color: '#9a9bb0' }}>
                    <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#7B6B8D' }} />
                    The System stress-tests your takes before you publish them
                  </li>
                  <li className="flex items-start gap-2.5 text-sm" style={{ color: '#9a9bb0' }}>
                    <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#7B6B8D' }} />
                    Asks: is this genuinely new or just trendjacking?
                  </li>
                  <li className="flex items-start gap-2.5 text-sm" style={{ color: '#9a9bb0' }}>
                    <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#7B6B8D' }} />
                    Finds where your argument breaks under pressure
                  </li>
                </ul>
              </div>
            </div>

            <div className="p-8 rounded-lg border text-center calm-card" style={{ background: 'linear-gradient(135deg, rgba(123,107,141,0.04), rgba(243,126,32,0.04))', borderColor: 'rgba(123,107,141,0.15)' }} data-testid="card-researcher-cta">
              <p className="text-lg font-bold text-white mb-2">Audiences can smell lazy thinking. The System makes sure yours isn't.</p>
              <p className="text-sm mb-6" style={{ color: '#7a7b90' }}>Every take stress-tested. Every angle challenged. Every piece backed by thinking that survives scrutiny.</p>
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
        <section className="relative py-32 border-t border-white/[0.06]" style={{ background: '#0F1115' }}>
          <div className="max-w-5xl mx-auto px-6">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-3 px-6 py-3 rounded-md mb-6" style={{ background: 'rgba(46,139,139,0.08)', border: '1px solid rgba(46,139,139,0.2)' }}>
                <FlaskConical className="w-6 h-6" style={{ color: '#2E8B8B' }} />
                <span className="text-base font-bold uppercase tracking-wider" style={{ color: '#2E8B8B' }}>For Researchers</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight" data-testid="text-researchers-headline">
                The System attacks your thesis harder than peer review will.
              </h2>
              <p className="text-xl max-w-3xl mx-auto" style={{ color: '#7a7b90' }}>
                Confirmation bias is the default mode of research. The System actively looks for what contradicts your thesis, flags methodological weaknesses, and asks whether your conclusion would survive if your two strongest sources disappeared.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
              <div className="p-8 rounded-lg border transition-all hover:border-teal-500/20 calm-card" style={{ background: 'rgba(255,255,255,0.015)', borderColor: 'rgba(255,255,255,0.06)' }} data-testid="card-researcher-research">
                <div className="w-14 h-14 rounded-md flex items-center justify-center mb-6" style={{ background: 'rgba(46,139,139,0.1)', border: '1px solid rgba(46,139,139,0.25)' }}>
                  <Search className="w-7 h-7" style={{ color: '#2E8B8B' }} />
                </div>
                <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#2E8B8B' }}>Source Audit</p>
                <h3 className="text-xl font-bold text-white mb-3">Literature & Data Audit</h3>
                <ul className="space-y-2.5">
                  <li className="flex items-start gap-2.5 text-sm" style={{ color: '#9a9bb0' }}>
                    <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#2E8B8B' }} />
                    The System flags when your sources all say the same thing
                  </li>
                  <li className="flex items-start gap-2.5 text-sm" style={{ color: '#9a9bb0' }}>
                    <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#2E8B8B' }} />
                    Surfaces contradictions, methodological gaps, and weak citations
                  </li>
                  <li className="flex items-start gap-2.5 text-sm" style={{ color: '#9a9bb0' }}>
                    <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#2E8B8B' }} />
                    Returns trust-scored claims — kills unfounded assumptions early
                  </li>
                </ul>
              </div>

              <div className="p-8 rounded-lg border transition-all hover:border-orange-500/20 calm-card" style={{ background: 'rgba(255,255,255,0.015)', borderColor: 'rgba(255,255,255,0.06)' }} data-testid="card-researcher-journal">
                <div className="w-14 h-14 rounded-md flex items-center justify-center mb-6" style={{ background: 'rgba(243,126,32,0.1)', border: '1px solid rgba(243,126,32,0.25)' }}>
                  <PenLine className="w-7 h-7" style={{ color: '#F37E20' }} />
                </div>
                <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#F37E20' }}>Methodology Audit</p>
                <h3 className="text-xl font-bold text-white mb-3">Hypothesis Integrity Check</h3>
                <ul className="space-y-2.5">
                  <li className="flex items-start gap-2.5 text-sm" style={{ color: '#9a9bb0' }}>
                    <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#F37E20' }} />
                    The System audits hypotheses — flags when they're drifting from evidence
                  </li>
                  <li className="flex items-start gap-2.5 text-sm" style={{ color: '#9a9bb0' }}>
                    <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#F37E20' }} />
                    Exposes when your conclusion was decided before your research started
                  </li>
                  <li className="flex items-start gap-2.5 text-sm" style={{ color: '#9a9bb0' }}>
                    <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#F37E20' }} />
                    Surfaces the assumptions you forgot to question
                  </li>
                </ul>
              </div>

              <div className="p-8 rounded-lg border transition-all hover:border-purple-500/20 calm-card" style={{ background: 'rgba(255,255,255,0.015)', borderColor: 'rgba(255,255,255,0.06)' }} data-testid="card-researcher-partner">
                <div className="w-14 h-14 rounded-md flex items-center justify-center mb-6" style={{ background: 'rgba(123,107,141,0.1)', border: '1px solid rgba(123,107,141,0.25)' }}>
                  <Brain className="w-7 h-7" style={{ color: '#7B6B8D' }} />
                </div>
                <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#7B6B8D' }}>Adversarial Review</p>
                <h3 className="text-xl font-bold text-white mb-3">Pre-Publication Audit Zone</h3>
                <ul className="space-y-2.5">
                  <li className="flex items-start gap-2.5 text-sm" style={{ color: '#9a9bb0' }}>
                    <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#7B6B8D' }} />
                    The System attacks your thesis harder than peer review will
                  </li>
                  <li className="flex items-start gap-2.5 text-sm" style={{ color: '#9a9bb0' }}>
                    <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#7B6B8D' }} />
                    Asks what happens if your key finding is an artifact
                  </li>
                  <li className="flex items-start gap-2.5 text-sm" style={{ color: '#9a9bb0' }}>
                    <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#7B6B8D' }} />
                    Finds the gaps in your argument before your critics do
                  </li>
                </ul>
              </div>
            </div>

            <div className="p-8 rounded-lg border text-center calm-card" style={{ background: 'linear-gradient(135deg, rgba(46,139,139,0.04), rgba(243,126,32,0.04))', borderColor: 'rgba(46,139,139,0.15)' }} data-testid="card-researcher-cta">
              <p className="text-lg font-bold text-white mb-2">Better to find the flaw now than after publication.</p>
              <p className="text-sm mb-6" style={{ color: '#7a7b90' }}>Every assumption interrogated. Every contradiction surfaced. Every thesis stress-tested before it ships.</p>
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
        <section className="relative py-32 border-t border-white/[0.06]" style={{ background: '#14171D' }}>
          <div className="max-w-5xl mx-auto px-6">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-3 px-6 py-3 rounded-md mb-6" style={{ background: 'rgba(46,139,139,0.08)', border: '1px solid rgba(46,139,139,0.2)' }}>
                <Zap className="w-6 h-6" style={{ color: '#2E8B8B' }} />
                <span className="text-base font-bold uppercase tracking-wider" style={{ color: '#2E8B8B' }}>System Architecture</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight" data-testid="text-different-headline">
                Three protocols. One autonomous auditing system.
              </h2>
              <p className="text-xl max-w-3xl mx-auto" style={{ color: '#7a7b90' }}>
                The System runs on sovereign infrastructure — x402-gated access, on-chain treasury, and decentralized adversarial AI. No single company controls the model. No centralized logs of your strategy.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="p-8 rounded-lg border transition-all hover:border-orange-500/15 group calm-card" style={{ background: 'rgba(255,255,255,0.015)', borderColor: 'rgba(255,255,255,0.06)' }} data-testid="card-pillar-privacy">
                <div className="w-14 h-14 rounded-md flex items-center justify-center mb-6" style={{ background: 'rgba(243,126,32,0.1)', border: '1px solid rgba(243,126,32,0.25)' }}>
                  <Shield className="w-7 h-7" style={{ color: '#F37E20' }} />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">The Gate — x402 Protocol</h3>
                <p className="text-base leading-relaxed mb-4" style={{ color: '#9a9bb0' }}>
                  High signal only. The System demands cryptographic proof of payment across three tiers — Micro ($2.50), Founder ($5.00), Treasury ($50.00) USDC — to filter out noise and guarantee execution priority. No subscriptions. No free tier. Skin in the game.
                </p>
                <p className="text-sm" style={{ color: '#555668' }}>
                  x402-gated endpoint on Base Mainnet. Instant settlement via Coinbase CDP.
                </p>
              </div>

              <div className="p-8 rounded-lg border transition-all hover:border-teal-500/15 group calm-card" style={{ background: 'rgba(255,255,255,0.015)', borderColor: 'rgba(255,255,255,0.06)' }} data-testid="card-pillar-longevity">
                <div className="w-14 h-14 rounded-md flex items-center justify-center mb-6" style={{ background: 'rgba(46,139,139,0.1)', border: '1px solid rgba(46,139,139,0.25)' }}>
                  <Layers className="w-7 h-7" style={{ color: '#2E8B8B' }} />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">The Vault — CDP AgentKit</h3>
                <p className="text-base leading-relaxed mb-4" style={{ color: '#9a9bb0' }}>
                  Sovereign treasury. The System holds its own capital on-chain, proving solvency and uncensorable operation. Revenue flows directly to the agent's wallet — no intermediary.
                </p>
                <p className="text-sm" style={{ color: '#555668' }}>
                  Treasury: 0xEc551A...05FF on Base Mainnet. Verifiable solvency at any time.
                </p>
              </div>

              <div className="p-8 rounded-lg border transition-all hover:border-purple-500/15 group calm-card" style={{ background: 'rgba(255,255,255,0.015)', borderColor: 'rgba(255,255,255,0.06)' }} data-testid="card-pillar-ai">
                <div className="w-14 h-14 rounded-md flex items-center justify-center mb-6" style={{ background: 'rgba(123,107,141,0.1)', border: '1px solid rgba(123,107,141,0.25)' }}>
                  <Brain className="w-7 h-7" style={{ color: '#7B6B8D' }} />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">The Audit Zone — Venice AI</h3>
                <p className="text-base leading-relaxed mb-4" style={{ color: '#9a9bb0' }}>
                  Adversarial logic. We don't validate; we attack. The AI aggressively hunts for confirmation bias, narrative dependency, and FOMO in the submitted thesis. Deterministic output, machine-readable liability.
                </p>
                <p className="text-sm" style={{ color: '#555668' }}>
                  Privacy-first inference via Venice. No data retention. No centralized training on your inputs.
                </p>
              </div>

              <div className="p-8 rounded-lg border transition-all hover:border-yellow-500/15 group calm-card" style={{ background: 'rgba(255,255,255,0.015)', borderColor: 'rgba(255,255,255,0.06)' }} data-testid="card-pillar-calm">
                <div className="w-14 h-14 rounded-md flex items-center justify-center mb-6" style={{ background: 'rgba(255,184,77,0.1)', border: '1px solid rgba(255,184,77,0.25)' }}>
                  <Eye className="w-7 h-7" style={{ color: '#FFB84D' }} />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Structured JSON Output</h3>
                <p className="text-base leading-relaxed mb-4" style={{ color: '#9a9bb0' }}>
                  Every audit returns deterministic, machine-readable output: risk score, bias detection, logic flaws, and adversarial recommendations. Structured JSON validated by Zod schemas — ready for agent-to-agent consumption.
                </p>
                <p className="text-sm" style={{ color: '#555668' }}>
                  Capability manifest at /api/audit/schema. No ambiguity. No hallucination-friendly prose.
                </p>
              </div>
            </div>
          </div>
        </section>
      </RevealSection>

      <RevealSection>
        <section id="process" className="relative py-32 border-t border-white/[0.06]" style={{ background: '#14171D' }}>
          <div className="max-w-5xl mx-auto px-6">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-3 px-6 py-3 rounded-md mb-6" style={{ background: 'rgba(255,184,77,0.08)', border: '1px solid rgba(255,184,77,0.2)' }}>
                <Zap className="w-6 h-6" style={{ color: '#FFB84D' }} />
                <span className="text-base font-bold uppercase tracking-wider" style={{ color: '#FFB84D' }}>Standard Operating Procedure</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight" data-testid="text-think-with-me-headline">
                Execution Flow (SOP-01)
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
              <div className="relative p-8 rounded-lg border calm-card" style={{ background: 'rgba(255,255,255,0.015)', borderColor: 'rgba(255,255,255,0.06)' }} data-testid="card-sop-deploy">
                <div className="absolute -top-6 -left-2 text-8xl font-black select-none pointer-events-none" style={{ color: 'rgba(255,255,255,0.03)' }}>01</div>
                <div className="relative z-10">
                  <h3 className="text-xl font-bold text-white mb-4">Deploy to the Zone</h3>
                  <p className="text-base leading-relaxed" style={{ color: '#9a9bb0' }}>
                    <strong className="text-white">What you deploy:</strong> Paste your roadmap, trade idea, or dilemma into the secure enclave. Pay the x402 gate fee to initiate the isolated execution.
                  </p>
                </div>
              </div>

              <div className="relative p-8 rounded-lg border calm-card" style={{ background: 'rgba(255,255,255,0.015)', borderColor: 'rgba(255,255,255,0.06)' }} data-testid="card-sop-simulate">
                <div className="absolute -top-6 -left-2 text-8xl font-black select-none pointer-events-none" style={{ color: 'rgba(255,255,255,0.03)' }}>02</div>
                <div className="relative z-10">
                  <h3 className="text-xl font-bold text-white mb-4">Adversarial Simulation</h3>
                  <p className="text-base leading-relaxed" style={{ color: '#9a9bb0' }}>
                    Inside the Zone, the AI attacks your assumptions. It aggressively hunts for logical fallacies, emotional reasoning (FOMO), and missing structural variables.
                  </p>
                </div>
              </div>

              <div className="relative p-8 rounded-lg border calm-card" style={{ background: 'rgba(255,255,255,0.015)', borderColor: 'rgba(255,255,255,0.06)' }} data-testid="card-sop-export">
                <div className="absolute -top-6 -left-2 text-8xl font-black select-none pointer-events-none" style={{ color: 'rgba(255,255,255,0.03)' }}>03</div>
                <div className="relative z-10">
                  <h3 className="text-xl font-bold text-white mb-4">Ledger Export</h3>
                  <p className="text-base leading-relaxed" style={{ color: '#9a9bb0' }}>
                    <strong className="text-white">The System's verdict:</strong> Extract a cryptographic timestamp and a structured JSON risk report. You have now officially documented and stress-tested your logic.
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
                  <h3 className="text-xl font-bold text-white mb-2">Audit Trail: How Intelligence Compounds</h3>
                  <p className="text-base leading-relaxed" style={{ color: '#9a9bb0' }}>
                    After each audit, the System surfaces patterns worth tracking — recurring biases, evolving risk profiles, blind spots across decisions. Pin them to your vault. Pinned insights become context for every future audit.
                  </p>
                  <p className="text-sm mt-3" style={{ color: '#555668' }}>
                    Nothing is pinned without your approval. Your vault stays local-first. You own your cognitive graph.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </RevealSection>

      <RevealSection>
        <section id="agent-clients" className="relative py-32 border-t border-white/[0.06]" style={{ background: '#0F1115' }}>
          <div className="max-w-5xl mx-auto px-6">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-3 px-6 py-3 rounded-md mb-6" style={{ background: 'rgba(243,126,32,0.08)', border: '1px solid rgba(243,126,32,0.2)' }}>
                <Cpu className="w-6 h-6" style={{ color: '#F37E20' }} />
                <span className="text-base font-bold uppercase tracking-wider" style={{ color: '#F37E20' }}>Machine-to-Machine API</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight" data-testid="text-a2a-headline">
                Autonomous Simulation.
              </h2>
              <p className="text-xl max-w-3xl mx-auto leading-relaxed" style={{ color: '#7a7b90' }}>
                DJZS is discoverable via <code className="font-mono text-base" style={{ color: '#F37E20' }}>/.well-known/agent.json</code>. We provide three specialized, <strong className="text-white">x402-gated zones</strong> designed for automated deployment by DAO bots, VC scrapers, and trading algorithms.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
              <div className="p-8 rounded-lg border transition-all hover:border-orange-500/20 calm-card" style={{ background: 'rgba(255,255,255,0.015)', borderColor: 'rgba(255,255,255,0.06)' }} data-testid="card-a2a-micro">
                <div className="flex justify-between items-start mb-6">
                  <h3 className="text-xl font-bold text-white">The Micro-Zone</h3>
                  <span className="font-mono text-sm px-2 py-1 rounded" style={{ color: '#2E8B8B', background: 'rgba(46,139,139,0.1)' }}>$2.50 USDC</span>
                </div>
                <p className="text-sm leading-relaxed mb-6" style={{ color: '#9a9bb0', minHeight: '4rem' }}>
                  High-frequency sanity checks for trading bots. Fast execution, binary risk scoring.
                </p>
                <div className="rounded-md p-4 text-xs font-mono" style={{ background: 'rgba(0,0,0,0.4)', color: '#9a9bb0' }}>
                  <span style={{ color: '#7B6B8D' }}>POST</span> /api/audit/micro
                </div>
              </div>

              <div className="p-8 rounded-lg border transition-all hover:border-teal-500/20 calm-card" style={{ background: 'rgba(255,255,255,0.015)', borderColor: 'rgba(255,255,255,0.06)' }} data-testid="card-a2a-founder">
                <div className="flex justify-between items-start mb-6">
                  <h3 className="text-xl font-bold text-white">The Founder Zone</h3>
                  <span className="font-mono text-sm px-2 py-1 rounded" style={{ color: '#2E8B8B', background: 'rgba(46,139,139,0.1)' }}>$5.00 USDC</span>
                </div>
                <p className="text-sm leading-relaxed mb-6" style={{ color: '#9a9bb0', minHeight: '4rem' }}>
                  For VC diligence agents. Audits natural language roadmaps against common failure modes to detect narrative drift.
                </p>
                <div className="rounded-md p-4 text-xs font-mono" style={{ background: 'rgba(0,0,0,0.4)', color: '#9a9bb0' }}>
                  <span style={{ color: '#7B6B8D' }}>POST</span> /api/audit/founder
                </div>
              </div>

              <div className="relative p-8 rounded-lg border transition-all hover:border-red-900/40 calm-card" style={{ background: 'rgba(255,255,255,0.015)', borderColor: 'rgba(255,255,255,0.06)', borderTop: '2px solid rgba(127,29,29,0.6)' }} data-testid="card-a2a-treasury">
                <div className="absolute top-0 right-0 px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-white" style={{ background: 'rgba(127,29,29,0.8)' }}>High Stakes</div>
                <div className="flex justify-between items-start mb-6 mt-2">
                  <h3 className="text-xl font-bold text-white">The Treasury Zone</h3>
                  <span className="font-mono text-sm px-2 py-1 rounded" style={{ color: '#2E8B8B', background: 'rgba(46,139,139,0.1)' }}>$50.00 USDC</span>
                </div>
                <p className="text-sm leading-relaxed mb-6" style={{ color: '#9a9bb0', minHeight: '4rem' }}>
                  For DAO governance bots. An exhaustive adversarial breakdown of capital deployment proposals before funds move.
                </p>
                <div className="rounded-md p-4 text-xs font-mono" style={{ background: 'rgba(0,0,0,0.4)', color: '#9a9bb0' }}>
                  <span style={{ color: '#7B6B8D' }}>POST</span> /api/audit/treasury
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
              <div className="p-8 rounded-lg border calm-card" style={{ background: 'rgba(255,255,255,0.015)', borderColor: 'rgba(255,255,255,0.06)' }} data-testid="card-a2a-api">
                <div className="flex items-center gap-3 mb-4">
                  <FileCode className="w-6 h-6" style={{ color: '#F37E20' }} />
                  <p className="text-xs font-bold uppercase tracking-wider" style={{ color: '#F37E20' }}>Structured JSON Output</p>
                </div>
                <p className="text-base font-bold text-white mb-3">Machine-readable verdicts for agent consumption</p>
                <div className="rounded-md p-4 text-xs font-mono leading-relaxed overflow-x-auto" style={{ background: 'rgba(0,0,0,0.4)', color: '#9a9bb0' }}>
                  <span style={{ color: '#555668' }}>POST /api/audit/micro</span><br/>
                  <span style={{ color: '#F37E20' }}>{'{'}</span><br/>
                  &nbsp;&nbsp;"audit_id": <span style={{ color: '#555668' }}>"uuid..."</span>,<br/>
                  &nbsp;&nbsp;"tier": <span style={{ color: '#7B6B8D' }}>"micro"</span>,<br/>
                  &nbsp;&nbsp;"risk_score": <span style={{ color: '#FFB84D' }}>72</span>,<br/>
                  &nbsp;&nbsp;"primary_bias_detected": <span style={{ color: '#2E8B8B' }}>"FOMO"</span>,<br/>
                  &nbsp;&nbsp;"logic_flaws": [<span style={{ color: '#555668' }}>...</span>],<br/>
                  &nbsp;&nbsp;"cryptographic_hash": <span style={{ color: '#7B6B8D' }}>"sha256..."</span><br/>
                  <span style={{ color: '#F37E20' }}>{'}'}</span>
                </div>
              </div>

              <div className="p-8 rounded-lg border calm-card" style={{ background: 'rgba(255,255,255,0.015)', borderColor: 'rgba(255,255,255,0.06)' }} data-testid="card-a2a-x402">
                <div className="flex items-center gap-3 mb-4">
                  <DollarSign className="w-6 h-6" style={{ color: '#FFB84D' }} />
                  <p className="text-xs font-bold uppercase tracking-wider" style={{ color: '#FFB84D' }}>x402 Payment Protocol</p>
                </div>
                <p className="text-base font-bold text-white mb-3">HTTP-native USDC micropayments on Base</p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2.5 text-sm" style={{ color: '#9a9bb0' }}>
                    <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#FFB84D' }} />
                    Pay-per-zone via x402 — no subscriptions, no NFT gates
                  </li>
                  <li className="flex items-start gap-2.5 text-sm" style={{ color: '#9a9bb0' }}>
                    <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#FFB84D' }} />
                    USDC on Base — instant settlement, low fees
                  </li>
                  <li className="flex items-start gap-2.5 text-sm" style={{ color: '#9a9bb0' }}>
                    <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#FFB84D' }} />
                    Agent discovery via /.well-known/agent.json
                  </li>
                  <li className="flex items-start gap-2.5 text-sm" style={{ color: '#9a9bb0' }}>
                    <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#FFB84D' }} />
                    Schema endpoint at /api/audit/schema for capability introspection
                  </li>
                </ul>
              </div>
            </div>

            <div className="p-8 rounded-lg border text-center calm-card" style={{ background: 'linear-gradient(135deg, rgba(243,126,32,0.04), rgba(255,184,77,0.04))', borderColor: 'rgba(255,184,77,0.15)' }} data-testid="card-a2a-cta">
              <p className="text-lg font-bold text-white mb-2">In a world of a million AI agents, trust is the bottleneck.</p>
              <p className="text-sm mb-2" style={{ color: '#7a7b90' }}>The System is the default Logic Oracle for the decentralized web. Machine-readable first, human-readable second.</p>
              <p className="text-xs" style={{ color: '#555668' }}>Coming soon: ERC-8004 on-chain reputation registry — immutable track record of successful logic audits.</p>
            </div>
          </div>
        </section>
      </RevealSection>

      <RevealSection>
        <section className="relative py-24 border-t border-white/[0.06]" style={{ background: '#0F1115' }}>
          <div className="relative z-10 max-w-4xl mx-auto px-6">
            <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
              <FAQItem question="How is The System different from ChatGPT or Notion AI?">
                <p>ChatGPT and Notion AI are designed to be helpful. The System is designed to be adversarial.</p>
                <p className="mt-2" style={{ color: '#7a7b90' }}>Centralized AI tools:</p>
                <ul className="list-disc list-inside ml-2" style={{ color: '#7a7b90' }}>
                  <li>Validate whatever you say — "Great thinking!" even when it's not</li>
                  <li>Store your data on their servers and train on your inputs</li>
                  <li>Have zero memory of your past reasoning</li>
                </ul>
                <p className="mt-3" style={{ color: '#9a9bb0' }}>The System is an adversarial auditing system:</p>
                <ul className="list-disc list-inside ml-2" style={{ color: '#9a9bb0' }}>
                  <li>Attacks your claims, flags FOMO, and calls out weak reasoning</li>
                  <li>Returns structured verdicts with risk scores and bias detection</li>
                  <li>Data stays on your device. AI doesn't train on your inputs</li>
                </ul>
                <p className="text-white mt-3 font-semibold">The System doesn't think for you. It audits whether you're actually thinking.</p>
              </FAQItem>

              <FAQItem question="How do AI agents use the System's API?">
                <p>Any autonomous AI agent can programmatically hire The System via the A2A audit API.</p>
                <p className="mt-2">The integration is simple:</p>
                <ul className="list-disc list-inside ml-2">
                  <li>Discover capabilities at GET /api/audit/schema</li>
                  <li>Submit a thesis via POST /api/audit with x402 payment header</li>
                  <li>Receive structured JSON: risk score, bias detection, logic flaws</li>
                  <li>$2.50 USDC per audit — instant settlement on Base</li>
                </ul>
                <p className="text-white mt-2 font-semibold">Machine-readable output. Deterministic. No hallucination-friendly prose.</p>
              </FAQItem>

              <FAQItem question="Is my thinking really private?">
                <p className="text-white font-semibold">Yes — by design.</p>
                <ul className="list-disc list-inside ml-2 mt-2">
                  <li>Your entries and research live on your device</li>
                  <li>AI only sees text you explicitly submit for audit</li>
                  <li>The System does not scan, profile, or monetize your thinking</li>
                  <li>Nothing syncs unless you choose to export it</li>
                </ul>
                <p className="mt-3">The System works fully offline for local vault operations. If your device is offline, your data stays offline.</p>
              </FAQItem>

              <FAQItem question="Where is my data stored?">
                <p className="text-white font-semibold">In your browser's local database (IndexedDB) on this device.</p>
                <p className="mt-2">The System does not use cloud servers for storage. Your journal entries, research trackers, memory pins, and audit history all live in your browser's IndexedDB. This data persists across sessions but never leaves your device unless you explicitly submit an audit or export it.</p>
                <p className="mt-2">Clearing your browser data will permanently delete this information. We recommend regular backups.</p>
              </FAQItem>

              <FAQItem question="How do I back up my data?">
                <p className="text-white font-semibold">Export creates a single ZIP archive containing JSON + Markdown files.</p>
                <p className="mt-2">Your export includes:</p>
                <ul className="list-disc list-inside ml-2">
                  <li>A manifest with version info and checksums</li>
                  <li>Each entry as structured JSON + human-readable Markdown</li>
                  <li>Memory pins, research trackers, queries, and claims</li>
                  <li>Music tracks (if any)</li>
                </ul>
                <p className="mt-2">Import merges new data with your existing vault — it won't overwrite or delete anything. Duplicates are automatically skipped.</p>
                <p className="text-white mt-2 font-semibold">Your data is yours. You can leave anytime with a complete, readable copy.</p>
              </FAQItem>

              <FAQItem question="Can I use The System on multiple devices?">
                <p className="text-white font-semibold">Yes, via export and import.</p>
                <p className="mt-2">Export on device A, import on device B. The import will merge data without duplicating entries. This is manual but works today with zero extra complexity.</p>
                <p className="mt-2" style={{ color: '#7a7b90' }}>Future: optional XMTP-based E2E encrypted sync across devices (serverless, opt-in).</p>
              </FAQItem>

              <FAQItem question="Is my local data encrypted?">
                <p>Currently, IndexedDB data is not encrypted at rest. Anyone with access to your unlocked browser profile can read it.</p>
                <p className="mt-2" style={{ color: '#7a7b90' }}>Planned: passphrase-based vault encryption (WebCrypto AES-GCM) — set a passphrase, auto-lock timer, encrypted exports.</p>
                <p className="text-white mt-2 font-semibold">We tell you the truth now so you can trust us later.</p>
              </FAQItem>

              <FAQItem question="What does the System's AI see?">
                <p className="text-white font-semibold">Only the thesis you submit for audit.</p>
                <ul className="list-disc list-inside ml-2 mt-2">
                  <li>When you submit an audit — your thesis + audit type are sent to Venice AI over HTTPS/TLS</li>
                  <li>This is <strong className="text-white">not end-to-end encrypted</strong> — Venice sees the plaintext to compute the audit</li>
                  <li>Venice claims no data retention and no training on your inputs</li>
                  <li>XMTP messaging (to the agent) is fully E2E encrypted via MLS protocol</li>
                </ul>
                <p className="mt-2">Nothing is sent in the background. Nothing is scanned. You control every audit submission.</p>
              </FAQItem>

              <FAQItem question="How does the adversarial audit work?">
                <p>The System is not a chatbot — it's an adversarial auditing system. It actively tries to break your reasoning.</p>
                <p className="mt-2">When you submit an audit, the System:</p>
                <ul className="list-disc list-inside ml-2">
                  <li>Interrogates your thesis — not summarizes, interrogates</li>
                  <li>Hunts for confirmation bias, FOMO, narrative dependency</li>
                  <li>Returns a structured verdict: risk score, logic flaws, counter-arguments</li>
                  <li>Asks: "Would you still do this if nobody was watching?"</li>
                </ul>
                <p className="text-white mt-2 font-semibold">No soothing. No "great insight." Just a structured audit verdict.</p>
              </FAQItem>

              <FAQItem question="What services does the System provide?">
                <p>Six audit services, one compounding loop. Each designed to pressure-test a different part of your thinking:</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-3">
                  <div>
                    <p className="font-semibold mb-1" style={{ color: '#F37E20' }}>Journal Zone</p>
                    <ul className="list-disc list-inside ml-2 text-sm">
                      <li>Write daily thinking</li>
                      <li>AI exposes blind spots</li>
                      <li>Contradictions surface over time</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-semibold mb-1" style={{ color: '#2E8B8B' }}>Research Zone</p>
                    <ul className="list-disc list-inside ml-2 text-sm">
                      <li>Save and analyze sources</li>
                      <li>AI scores evidence strength</li>
                      <li>Kills weak claims early</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-semibold mb-1" style={{ color: '#7B6B8D' }}>Thinking Partner</p>
                    <ul className="list-disc list-inside ml-2 text-sm">
                      <li>Attacks your reasoning</li>
                      <li>Finds contradictions</li>
                      <li>Calls out FOMO</li>
                    </ul>
                  </div>
                </div>
                <p className="mt-3 text-white font-semibold">Plus Trade, Decision, and Content audit services. Each feeds the others. Your audit trail compounds.</p>
              </FAQItem>

              <FAQItem question="What is a Memory Pin?">
                <p>A Memory Pin is a thought you choose to carry forward.</p>
                <ul className="list-disc list-inside ml-2 mt-2">
                  <li>Pins stay on your device</li>
                  <li>Pins are used as context in future AI sessions</li>
                  <li>Pins are never added without your approval</li>
                </ul>
                <p className="mt-3">This is how intelligence compounds — the AI references your past thinking without creating a centralized memory graph.</p>
              </FAQItem>

              <FAQItem question="Who uses the System?">
                <p className="text-white font-semibold">Two types of clients: humans who want to be challenged, and AI agents that need logic verification.</p>
                <ul className="list-disc list-inside ml-2 mt-2">
                  <li>Crypto-native founders tired of echo chamber consensus</li>
                  <li>Traders who need to separate FOMO from strategy</li>
                  <li>Researchers who want their thesis attacked before peer review does</li>
                  <li>DAO treasury agents needing pre-execution audits</li>
                  <li>Any autonomous AI agent that needs adversarial logic verification</li>
                </ul>
                <p className="mt-3" style={{ color: '#7a7b90' }}>The System is not for casual diary-keeping, photo memories, or people who want an AI that tells them they're brilliant.</p>
                <p className="mt-2 text-white font-semibold">Cognitive infrastructure for a decentralized, post-surveillance A2A economy.</p>
              </FAQItem>
            </div>
          </div>
        </section>
      </RevealSection>

      <footer className="border-t border-white/[0.06] py-24" style={{ background: '#0D0F13' }}>
        <div className="max-w-4xl mx-auto px-6 flex flex-col items-center text-center gap-10">
          <div className="flex flex-col items-center gap-3">
            <img src="/logo.png" alt="DJZS" className="w-16 h-16 rounded-lg" style={{ filter: 'drop-shadow(0 0 4px rgba(243,126,32,0.2))' }} data-testid="img-logo-footer" />
            <h2 className="text-3xl font-black tracking-widest uppercase" style={{ color: '#F37E20' }}>
              DJZS
            </h2>
            <p className="text-xs font-medium uppercase tracking-[0.3em]" style={{ color: '#7a7b90' }}>
              Autonomous Auditing System
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 md:gap-4">
            <Link href="/about" className="px-5 py-2 rounded-md text-xs font-semibold uppercase tracking-widest border transition-all hover:bg-white/[0.05] hover:border-white/20" style={{ color: '#9a9bac', borderColor: 'rgba(255,255,255,0.1)' }} data-testid="link-footer-about">
              About
            </Link>
            <Link href="/docs" className="px-5 py-2 rounded-md text-xs font-semibold uppercase tracking-widest border transition-all hover:bg-white/[0.05] hover:border-white/20" style={{ color: '#9a9bac', borderColor: 'rgba(255,255,255,0.1)' }} data-testid="link-footer-docs">
              Docs
            </Link>
            <Link href="/privacy" className="px-5 py-2 rounded-md text-xs font-semibold uppercase tracking-widest border transition-all hover:bg-white/[0.05] hover:border-white/20" style={{ color: '#9a9bac', borderColor: 'rgba(255,255,255,0.1)' }} data-testid="link-footer-privacy">
              Privacy
            </Link>
            <Link href="/security" className="px-5 py-2 rounded-md text-xs font-semibold uppercase tracking-widest border transition-all hover:bg-white/[0.05] hover:border-white/20" style={{ color: '#9a9bac', borderColor: 'rgba(255,255,255,0.1)' }} data-testid="link-footer-security">
              Security
            </Link>
            <Link href="/terms" className="px-5 py-2 rounded-md text-xs font-semibold uppercase tracking-widest border transition-all hover:bg-white/[0.05] hover:border-white/20" style={{ color: '#9a9bac', borderColor: 'rgba(255,255,255,0.1)' }} data-testid="link-footer-terms">
              Terms
            </Link>
            <Link href="/roadmap" className="px-5 py-2 rounded-md text-xs font-semibold uppercase tracking-widest border transition-all hover:bg-white/[0.05] hover:border-white/20" style={{ color: '#9a9bac', borderColor: 'rgba(255,255,255,0.1)' }} data-testid="link-footer-roadmap">
              Roadmap
            </Link>
            {isConnected && (
              <Link href="/chat" className="px-6 py-2 rounded-md text-xs font-bold uppercase tracking-widest text-white transition-all hover:opacity-90" style={{ background: '#F37E20' }} data-testid="link-footer-enter">
                Enter
              </Link>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6" style={{ color: '#555668' }}>
            <a href="https://github.com/UsernameDAOEth" target="_blank" rel="noopener noreferrer" className="text-[10px] uppercase tracking-widest transition-colors hover:opacity-80" data-testid="link-footer-github">
              GitHub
            </a>
            <span style={{ color: '#333445' }}>·</span>
            <a href="https://x.com/Dj_Z_S" target="_blank" rel="noopener noreferrer" className="text-[10px] uppercase tracking-widest transition-colors hover:opacity-80" data-testid="link-footer-twitter">
              X / Twitter
            </a>
            <span style={{ color: '#333445' }}>·</span>
            <a href="mailto:hello@dj-z-s.box" className="text-[10px] uppercase tracking-widest transition-colors hover:opacity-80" data-testid="link-footer-contact">
              Contact
            </a>
          </div>

          <p className="text-[10px] uppercase tracking-widest" style={{ color: '#444556' }}>
            © 2026 DJZS — Autonomous Auditing System for the A2A Economy
          </p>
        </div>
      </footer>

      {!isConnected && !mobileBarDismissed && (
        <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden backdrop-blur-xl border-t border-white/[0.06] p-4 safe-area-inset-bottom" style={{ background: 'rgba(15,17,21,0.95)' }}>
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
              className="shrink-0 w-10 h-10 rounded-lg flex items-center justify-center transition-colors hover:bg-white/10"
              style={{ color: '#7a7b90' }}
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

function FAQItem({ question, children }: { question: string; children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="py-8 group" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-6 text-left"
        data-testid={`button-faq-${question.slice(0, 20).toLowerCase().replace(/\s+/g, '-')}`}
      >
        <h3 className="text-2xl md:text-3xl font-bold text-white transition-colors" style={{ }}>{question}</h3>
        <div className="shrink-0 w-12 h-12 rounded-full flex items-center justify-center transition-all" style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
          <motion.div
            animate={{ rotate: isOpen ? 45 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <Plus className="w-6 h-6" style={{ color: '#F37E20' }} />
          </motion.div>
        </div>
      </button>
      <motion.div
        initial={false}
        animate={{ height: isOpen ? "auto" : 0, opacity: isOpen ? 1 : 0 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="overflow-hidden"
      >
        <div className="leading-relaxed font-medium text-lg pt-6 max-w-3xl space-y-4" style={{ color: '#7a7b90' }}>{children}</div>
      </motion.div>
    </div>
  );
}
