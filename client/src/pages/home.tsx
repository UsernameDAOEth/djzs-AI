import { useState, type ReactNode } from "react";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { HardDrive, Shield, Bot, ArrowRight, Search, Brain, ChevronDown, Plus, PenLine, TrendingUp, Layers, Zap, GitBranch, Eye, CheckCircle, Briefcase, Video, Menu, X, Pin, Lock, BarChart3, FlaskConical } from "lucide-react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { pageContainer, fadeUp } from "@/lib/animations";
import { RevealSection } from "@/components/hero";
import { Helmet } from "react-helmet";

export default function Home() {
  const { isConnected } = useAccount();
  const [mobileBarDismissed, setMobileBarDismissed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToHowItWorks = () => {
    const el = document.getElementById("how-it-works");
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
                  <span className="hidden sm:inline">Enter System</span>
                  <span className="sm:hidden">Enter</span>
                  <ArrowRight className="w-4 h-4" />
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
        <title>DJZS - Decentralized AI That Cuts Through the Noise</title>
        <meta name="description" content="Adversarial AI for sovereign thinkers. Pressure-tests your reasoning, flags FOMO and narrative dependency, calls out weak logic. Local-first data, decentralized inference, E2E encrypted messaging." />
        <meta property="og:title" content="DJZS - Decentralized AI That Cuts Through the Noise" />
        <meta property="og:description" content="Pressure-test your thinking. DJZS exposes hidden bias and stress-tests your logic, ensuring your decisions survive market volatility—not just the next hype cycle. Local-first. No surveillance." />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="DJZS - Decentralized AI That Cuts Through the Noise" />
        <meta name="twitter:description" content="Adversarial AI for sovereign thinkers. Pressure-tests your reasoning, flags FOMO, calls out weak logic. Local-first. Decentralized. No soothing." />
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
              <Shield className="w-6 h-6" />
              Decentralized Journaling Zone System
            </span>
          </motion.div>

          <motion.h1
            variants={fadeUp}
            className="text-6xl md:text-8xl lg:text-9xl font-black text-white tracking-tighter leading-[1] mb-8"
          >
            Decentralized AI for sovereign thinking.
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="text-2xl md:text-3xl max-w-4xl mx-auto leading-tight mb-12 font-medium"
            style={{ color: '#9a9bb0' }}
          >
            Pressure-test your thinking. DJZS is a Decentralized Journaling Zone System designed to expose hidden bias and stress-test your logic, ensuring your decisions survive volatility—not just the next hype cycle.
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
                    Start Thinking
                    <ArrowRight className="w-6 h-6" />
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
                      Start Thinking
                      <ArrowRight className="w-6 h-6" />
                    </button>
                  </Link>
                  <button
                    onClick={scrollToHowItWorks}
                    className="inline-flex items-center gap-3 rounded-lg border px-8 py-5 text-lg font-bold transition-all duration-250 hover:text-white"
                    style={{ borderColor: 'rgba(46,139,139,0.3)', color: '#9a9bb0' }}
                    data-testid="button-see-how-it-works"
                  >
                    See How It Works
                    <ChevronDown className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>
            <p className="text-sm" style={{ color: '#7a7b90' }} data-testid="text-cta-microcopy">
              Local-first. No data extraction. AI that pushes back, not agrees.
            </p>
          </motion.div>

          <motion.div
            variants={fadeUp}
            className="flex flex-col sm:flex-row items-center justify-center gap-10 text-base font-medium"
            style={{ color: '#7a7b90' }}
          >
            <div className="flex items-center gap-3" data-testid="text-trust-local">
              <HardDrive className="w-5 h-5" style={{ color: '#F37E20' }} />
              <span>Local-first storage</span>
            </div>
            <div className="flex items-center gap-3" data-testid="text-trust-ai">
              <Brain className="w-5 h-5" style={{ color: '#2E8B8B' }} />
              <span>Decentralized AI inference</span>
            </div>
            <div className="flex items-center gap-3" data-testid="text-trust-encrypted">
              <Lock className="w-5 h-5" style={{ color: '#7B6B8D' }} />
              <span>E2E encrypted messaging</span>
            </div>
            <div className="flex items-center gap-3" data-testid="text-trust-private">
              <TrendingUp className="w-5 h-5" style={{ color: '#FFB84D' }} />
              <span>Intelligence compounds</span>
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
                Your echo chamber is killing your company.
              </h2>
              <p className="text-xl max-w-3xl mx-auto" style={{ color: '#7a7b90' }}>
                If your roadmap is a reaction to governance drama instead of long-term goals, DJZS will tell you. If you're pivoting because Twitter is pumping a narrative, it'll flag that too. No soothing. No validation. Just sharper decisions.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
              <div className="p-8 rounded-lg border transition-all hover:border-orange-500/20 calm-card" style={{ background: 'rgba(255,255,255,0.015)', borderColor: 'rgba(255,255,255,0.06)' }} data-testid="card-founder-research">
                <div className="w-14 h-14 rounded-md flex items-center justify-center mb-6" style={{ background: 'rgba(46,139,139,0.1)', border: '1px solid rgba(46,139,139,0.25)' }}>
                  <Search className="w-7 h-7" style={{ color: '#2E8B8B' }} />
                </div>
                <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#2E8B8B' }}>Research Zone</p>
                <h3 className="text-xl font-bold text-white mb-3">Market & Competitive Intel</h3>
                <ul className="space-y-2.5">
                  <li className="flex items-start gap-2.5 text-sm" style={{ color: '#9a9bb0' }}>
                    <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#2E8B8B' }} />
                    Pressure-test competitor claims and market narratives
                  </li>
                  <li className="flex items-start gap-2.5 text-sm" style={{ color: '#9a9bb0' }}>
                    <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#2E8B8B' }} />
                    AI flags when "evidence" is just echo chamber consensus
                  </li>
                  <li className="flex items-start gap-2.5 text-sm" style={{ color: '#9a9bb0' }}>
                    <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#2E8B8B' }} />
                    Separates signal from noise — kills weak theses early
                  </li>
                </ul>
              </div>

              <div className="p-8 rounded-lg border transition-all hover:border-orange-500/20 calm-card" style={{ background: 'rgba(255,255,255,0.015)', borderColor: 'rgba(255,255,255,0.06)' }} data-testid="card-founder-journal">
                <div className="w-14 h-14 rounded-md flex items-center justify-center mb-6" style={{ background: 'rgba(243,126,32,0.1)', border: '1px solid rgba(243,126,32,0.25)' }}>
                  <PenLine className="w-7 h-7" style={{ color: '#F37E20' }} />
                </div>
                <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#F37E20' }}>Journal Zone</p>
                <h3 className="text-xl font-bold text-white mb-3">Founder's Decision Log</h3>
                <ul className="space-y-2.5">
                  <li className="flex items-start gap-2.5 text-sm" style={{ color: '#9a9bb0' }}>
                    <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#F37E20' }} />
                    Document pivots and strategy shifts — see when emotion drove the call
                  </li>
                  <li className="flex items-start gap-2.5 text-sm" style={{ color: '#9a9bb0' }}>
                    <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#F37E20' }} />
                    AI exposes contradictions between your stated goals and actual moves
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
                <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#7B6B8D' }}>Thinking Partner</p>
                <h3 className="text-xl font-bold text-white mb-3">Adversarial Advisor</h3>
                <ul className="space-y-2.5">
                  <li className="flex items-start gap-2.5 text-sm" style={{ color: '#9a9bb0' }}>
                    <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#7B6B8D' }} />
                    Calls out when you're reacting to hype instead of building strategy
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
              <p className="text-sm mb-6" style={{ color: '#7a7b90' }}>DJZS doesn't exist to soothe egos. It exists to cut through the noise.</p>
              <Link href="/chat">
                <button
                  className="inline-flex items-center gap-3 rounded-lg px-8 py-4 text-base font-bold text-white transition-all duration-250 hover:-translate-y-1"
                  style={{ background: '#F37E20', boxShadow: '0 6px 24px rgba(243,126,32,0.3)' }}
                  data-testid="button-start-founder-thinking"
                >
                  Start Thinking
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
                Is it conviction or FOMO? DJZS will tell you.
              </h2>
              <p className="text-xl max-w-3xl mx-auto" style={{ color: '#7a7b90' }}>
                If you're allocating capital because Twitter is pumping a narrative, DJZS flags it. If your thesis is driven by fear or community pressure instead of data, it calls that out too. The market doesn't care about your feelings. Neither does DJZS.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
              <div className="p-8 rounded-lg border transition-all hover:border-teal-500/20 calm-card" style={{ background: 'rgba(255,255,255,0.015)', borderColor: 'rgba(255,255,255,0.06)' }} data-testid="card-trader-research">
                <div className="w-14 h-14 rounded-md flex items-center justify-center mb-6" style={{ background: 'rgba(46,139,139,0.1)', border: '1px solid rgba(46,139,139,0.25)' }}>
                  <Search className="w-7 h-7" style={{ color: '#2E8B8B' }} />
                </div>
                <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#2E8B8B' }}>Research Zone</p>
                <h3 className="text-xl font-bold text-white mb-3">Market Intelligence</h3>
                <ul className="space-y-2.5">
                  <li className="flex items-start gap-2.5 text-sm" style={{ color: '#9a9bb0' }}>
                    <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#2E8B8B' }} />
                    Build research trackers on protocols, tokens, and market narratives
                  </li>
                  <li className="flex items-start gap-2.5 text-sm" style={{ color: '#9a9bb0' }}>
                    <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#2E8B8B' }} />
                    AI interrogates sources — flags when "alpha" is just recycled opinion
                  </li>
                  <li className="flex items-start gap-2.5 text-sm" style={{ color: '#9a9bb0' }}>
                    <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#2E8B8B' }} />
                    Track claims with trust levels — separate signal from noise
                  </li>
                </ul>
              </div>

              <div className="p-8 rounded-lg border transition-all hover:border-orange-500/20 calm-card" style={{ background: 'rgba(255,255,255,0.015)', borderColor: 'rgba(255,255,255,0.06)' }} data-testid="card-trader-journal">
                <div className="w-14 h-14 rounded-md flex items-center justify-center mb-6" style={{ background: 'rgba(243,126,32,0.1)', border: '1px solid rgba(243,126,32,0.25)' }}>
                  <PenLine className="w-7 h-7" style={{ color: '#F37E20' }} />
                </div>
                <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#F37E20' }}>Journal Zone</p>
                <h3 className="text-xl font-bold text-white mb-3">Trade Journal</h3>
                <ul className="space-y-2.5">
                  <li className="flex items-start gap-2.5 text-sm" style={{ color: '#9a9bb0' }}>
                    <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#F37E20' }} />
                    Document your thesis — so you can't rewrite history after
                  </li>
                  <li className="flex items-start gap-2.5 text-sm" style={{ color: '#9a9bb0' }}>
                    <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#F37E20' }} />
                    AI exposes when emotion drove the trade, not strategy
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
                <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#7B6B8D' }}>Thinking Partner</p>
                <h3 className="text-xl font-bold text-white mb-3">Thesis Killer</h3>
                <ul className="space-y-2.5">
                  <li className="flex items-start gap-2.5 text-sm" style={{ color: '#9a9bb0' }}>
                    <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#7B6B8D' }} />
                    Tries to destroy your thesis before you risk capital
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
              <p className="text-lg font-bold text-white mb-2">The market will be brutal. Your thinking partner should be too.</p>
              <p className="text-sm mb-6" style={{ color: '#7a7b90' }}>Every thesis stress-tested. Every bias exposed. Every lesson weaponized for the next trade.</p>
              <Link href="/chat">
                <button
                  className="inline-flex items-center gap-3 rounded-lg px-8 py-4 text-base font-bold text-white transition-all duration-250 hover:-translate-y-1"
                  style={{ background: '#2E8B8B', boxShadow: '0 6px 24px rgba(46,139,139,0.3)' }}
                  data-testid="button-start-trader-thinking"
                >
                  Start Thinking
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
                <span className="text-base font-bold uppercase tracking-wider" style={{ color: '#7B6B8D' }}>For Content Creators</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight" data-testid="text-creators-headline">
                If your takes can't survive a stress test, they're not takes.
              </h2>
              <p className="text-xl max-w-3xl mx-auto" style={{ color: '#7a7b90' }}>
                Publishing hot takes that fall apart under scrutiny is embarrassing. DJZS challenges your thinking before the audience does — finds the holes, flags the lazy logic, and asks if your angle is genuinely original or just trendjacking.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
              <div className="p-8 rounded-lg border transition-all hover:border-purple-500/20 calm-card" style={{ background: 'rgba(255,255,255,0.015)', borderColor: 'rgba(255,255,255,0.06)' }} data-testid="card-creator-research">
                <div className="w-14 h-14 rounded-md flex items-center justify-center mb-6" style={{ background: 'rgba(46,139,139,0.1)', border: '1px solid rgba(46,139,139,0.25)' }}>
                  <Search className="w-7 h-7" style={{ color: '#2E8B8B' }} />
                </div>
                <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#2E8B8B' }}>Research Zone</p>
                <h3 className="text-xl font-bold text-white mb-3">Content Intelligence</h3>
                <ul className="space-y-2.5">
                  <li className="flex items-start gap-2.5 text-sm" style={{ color: '#9a9bb0' }}>
                    <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#2E8B8B' }} />
                    Pressure-test trends before you build content around them
                  </li>
                  <li className="flex items-start gap-2.5 text-sm" style={{ color: '#9a9bb0' }}>
                    <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#2E8B8B' }} />
                    AI flags when your "original take" is just consensus repackaged
                  </li>
                  <li className="flex items-start gap-2.5 text-sm" style={{ color: '#9a9bb0' }}>
                    <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#2E8B8B' }} />
                    Separates durable insight from ephemeral noise
                  </li>
                </ul>
              </div>

              <div className="p-8 rounded-lg border transition-all hover:border-orange-500/20 calm-card" style={{ background: 'rgba(255,255,255,0.015)', borderColor: 'rgba(255,255,255,0.06)' }} data-testid="card-creator-journal">
                <div className="w-14 h-14 rounded-md flex items-center justify-center mb-6" style={{ background: 'rgba(243,126,32,0.1)', border: '1px solid rgba(243,126,32,0.25)' }}>
                  <PenLine className="w-7 h-7" style={{ color: '#F37E20' }} />
                </div>
                <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#F37E20' }}>Journal Zone</p>
                <h3 className="text-xl font-bold text-white mb-3">Content Lab</h3>
                <ul className="space-y-2.5">
                  <li className="flex items-start gap-2.5 text-sm" style={{ color: '#9a9bb0' }}>
                    <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#F37E20' }} />
                    Draft ideas and angles — AI shows you when you're repeating yourself
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

              <div className="p-8 rounded-lg border transition-all hover:border-purple-500/20 calm-card" style={{ background: 'rgba(255,255,255,0.015)', borderColor: 'rgba(255,255,255,0.06)' }} data-testid="card-creator-partner">
                <div className="w-14 h-14 rounded-md flex items-center justify-center mb-6" style={{ background: 'rgba(123,107,141,0.1)', border: '1px solid rgba(123,107,141,0.25)' }}>
                  <Brain className="w-7 h-7" style={{ color: '#7B6B8D' }} />
                </div>
                <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#7B6B8D' }}>Thinking Partner</p>
                <h3 className="text-xl font-bold text-white mb-3">Adversarial Editor</h3>
                <ul className="space-y-2.5">
                  <li className="flex items-start gap-2.5 text-sm" style={{ color: '#9a9bb0' }}>
                    <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#7B6B8D' }} />
                    Stress-tests your takes before you publish them
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

            <div className="p-8 rounded-lg border text-center calm-card" style={{ background: 'linear-gradient(135deg, rgba(123,107,141,0.04), rgba(243,126,32,0.04))', borderColor: 'rgba(123,107,141,0.15)' }} data-testid="card-creator-cta">
              <p className="text-lg font-bold text-white mb-2">Audiences can smell lazy thinking. DJZS makes sure yours isn't.</p>
              <p className="text-sm mb-6" style={{ color: '#7a7b90' }}>Every take stress-tested. Every angle challenged. Every piece backed by thinking that survives scrutiny.</p>
              <Link href="/chat">
                <button
                  className="inline-flex items-center gap-3 rounded-lg px-8 py-4 text-base font-bold text-white transition-all duration-250 hover:-translate-y-1"
                  style={{ background: '#F37E20', boxShadow: '0 6px 24px rgba(243,126,32,0.3)' }}
                  data-testid="button-start-creator-thinking"
                >
                  Start Thinking
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
                Your thesis is only as strong as the hardest question you've answered.
              </h2>
              <p className="text-xl max-w-3xl mx-auto" style={{ color: '#7a7b90' }}>
                Confirmation bias is the default mode of research. DJZS actively looks for what contradicts your thesis, flags methodological weaknesses, and asks whether your conclusion would survive if your two strongest sources disappeared.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
              <div className="p-8 rounded-lg border transition-all hover:border-teal-500/20 calm-card" style={{ background: 'rgba(255,255,255,0.015)', borderColor: 'rgba(255,255,255,0.06)' }} data-testid="card-researcher-research">
                <div className="w-14 h-14 rounded-md flex items-center justify-center mb-6" style={{ background: 'rgba(46,139,139,0.1)', border: '1px solid rgba(46,139,139,0.25)' }}>
                  <Search className="w-7 h-7" style={{ color: '#2E8B8B' }} />
                </div>
                <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#2E8B8B' }}>Research Zone</p>
                <h3 className="text-xl font-bold text-white mb-3">Literature & Data Synthesis</h3>
                <ul className="space-y-2.5">
                  <li className="flex items-start gap-2.5 text-sm" style={{ color: '#9a9bb0' }}>
                    <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#2E8B8B' }} />
                    Build research trackers — AI flags when your sources all say the same thing
                  </li>
                  <li className="flex items-start gap-2.5 text-sm" style={{ color: '#9a9bb0' }}>
                    <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#2E8B8B' }} />
                    Surfaces contradictions, methodological gaps, and weak citations
                  </li>
                  <li className="flex items-start gap-2.5 text-sm" style={{ color: '#9a9bb0' }}>
                    <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#2E8B8B' }} />
                    Track claims with trust levels — kills unfounded assumptions early
                  </li>
                </ul>
              </div>

              <div className="p-8 rounded-lg border transition-all hover:border-orange-500/20 calm-card" style={{ background: 'rgba(255,255,255,0.015)', borderColor: 'rgba(255,255,255,0.06)' }} data-testid="card-researcher-journal">
                <div className="w-14 h-14 rounded-md flex items-center justify-center mb-6" style={{ background: 'rgba(243,126,32,0.1)', border: '1px solid rgba(243,126,32,0.25)' }}>
                  <PenLine className="w-7 h-7" style={{ color: '#F37E20' }} />
                </div>
                <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#F37E20' }}>Journal Zone</p>
                <h3 className="text-xl font-bold text-white mb-3">Research Log</h3>
                <ul className="space-y-2.5">
                  <li className="flex items-start gap-2.5 text-sm" style={{ color: '#9a9bb0' }}>
                    <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#F37E20' }} />
                    Document hypotheses — AI shows you when they're drifting from evidence
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
                <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#7B6B8D' }}>Thinking Partner</p>
                <h3 className="text-xl font-bold text-white mb-3">Adversarial Reviewer</h3>
                <ul className="space-y-2.5">
                  <li className="flex items-start gap-2.5 text-sm" style={{ color: '#9a9bb0' }}>
                    <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#7B6B8D' }} />
                    Attacks your thesis harder than peer review will
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
                  Start Thinking
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
                <span className="text-base font-bold uppercase tracking-wider" style={{ color: '#2E8B8B' }}>Decentralized AI by Design</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight" data-testid="text-different-headline">
                AI becomes a tool, not a data vacuum.
              </h2>
              <p className="text-xl max-w-3xl mx-auto" style={{ color: '#7a7b90' }}>
                DJZS integrates decentralized AI inference via Venice, rather than centralized AI providers. No single company controls the model. No centralized logs of your thinking.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="p-8 rounded-lg border transition-all hover:border-orange-500/15 group calm-card" style={{ background: 'rgba(255,255,255,0.015)', borderColor: 'rgba(255,255,255,0.06)' }} data-testid="card-pillar-privacy">
                <div className="w-14 h-14 rounded-md flex items-center justify-center mb-6" style={{ background: 'rgba(243,126,32,0.1)', border: '1px solid rgba(243,126,32,0.25)' }}>
                  <Shield className="w-7 h-7" style={{ color: '#F37E20' }} />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">No Centralized Surveillance</h3>
                <p className="text-base leading-relaxed mb-4" style={{ color: '#9a9bb0' }}>
                  Your prompts are not stored or reused for training. No centralized AI company owns the interaction. AI execution is distributed, not monopolized. Reduced surveillance risk.
                </p>
                <p className="text-sm" style={{ color: '#555668' }}>
                  DJZS uses decentralized AI infrastructure instead of centralized SaaS AI endpoints.
                </p>
              </div>

              <div className="p-8 rounded-lg border transition-all hover:border-teal-500/15 group calm-card" style={{ background: 'rgba(255,255,255,0.015)', borderColor: 'rgba(255,255,255,0.06)' }} data-testid="card-pillar-longevity">
                <div className="w-14 h-14 rounded-md flex items-center justify-center mb-6" style={{ background: 'rgba(46,139,139,0.1)', border: '1px solid rgba(46,139,139,0.25)' }}>
                  <Layers className="w-7 h-7" style={{ color: '#2E8B8B' }} />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Interoperable & Future-Proof</h3>
                <p className="text-base leading-relaxed mb-4" style={{ color: '#9a9bb0' }}>
                  DJZS remains interoperable with future decentralized models. The MLS-based architecture allows algorithm upgrades and future post-quantum primitives without redesign.
                </p>
                <p className="text-sm" style={{ color: '#555668' }}>
                  This is how you build systems that survive paradigm shifts. Export your data anytime. No lock-in.
                </p>
              </div>

              <div className="p-8 rounded-lg border transition-all hover:border-purple-500/15 group calm-card" style={{ background: 'rgba(255,255,255,0.015)', borderColor: 'rgba(255,255,255,0.06)' }} data-testid="card-pillar-ai">
                <div className="w-14 h-14 rounded-md flex items-center justify-center mb-6" style={{ background: 'rgba(123,107,141,0.1)', border: '1px solid rgba(123,107,141,0.25)' }}>
                  <Brain className="w-7 h-7" style={{ color: '#7B6B8D' }} />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Sovereign Data Ownership</h3>
                <p className="text-base leading-relaxed mb-4" style={{ color: '#9a9bb0' }}>
                  Your data stays on your device. No cloud database. No silent data extraction. Memory Pins are explicit — you decide what carries forward. You own your cognitive graph.
                </p>
                <p className="text-sm" style={{ color: '#555668' }}>
                  Your thoughts are not training data. Your AI is not centralized. Your system is designed to last.
                </p>
              </div>

              <div className="p-8 rounded-lg border transition-all hover:border-yellow-500/15 group calm-card" style={{ background: 'rgba(255,255,255,0.015)', borderColor: 'rgba(255,255,255,0.06)' }} data-testid="card-pillar-calm">
                <div className="w-14 h-14 rounded-md flex items-center justify-center mb-6" style={{ background: 'rgba(255,184,77,0.1)', border: '1px solid rgba(255,184,77,0.25)' }}>
                  <Eye className="w-7 h-7" style={{ color: '#FFB84D' }} />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Quantum-Resilient Design</h3>
                <p className="text-base leading-relaxed mb-4" style={{ color: '#9a9bb0' }}>
                  Built with cryptographic agility. The MLS-based architecture allows algorithm upgrades and future post-quantum primitives. XWING KEM protects against "harvest now, decrypt later" attacks.
                </p>
                <p className="text-sm" style={{ color: '#555668' }}>
                  No feeds, no notifications, no noise. Built for deep work, not shallow validation.
                </p>
              </div>
            </div>
          </div>
        </section>
      </RevealSection>

      <RevealSection>
        <section className="relative py-32 border-t border-white/[0.06]" style={{ background: '#14171D' }}>
          <div className="max-w-5xl mx-auto px-6">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-3 px-6 py-3 rounded-md mb-6" style={{ background: 'rgba(255,184,77,0.08)', border: '1px solid rgba(255,184,77,0.2)' }}>
                <Zap className="w-6 h-6" style={{ color: '#FFB84D' }} />
                <span className="text-base font-bold uppercase tracking-wider" style={{ color: '#FFB84D' }}>How It Actually Works</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight" data-testid="text-think-with-me-headline">
                What happens when you click "Think with me"
              </h2>
              <p className="text-xl max-w-3xl mx-auto" style={{ color: '#7a7b90' }}>
                The AI doesn't run in the background. It activates only when you ask. Here's exactly what it does.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              <div className="p-8 rounded-lg border calm-card" style={{ background: 'rgba(255,255,255,0.015)', borderColor: 'rgba(255,255,255,0.06)' }} data-testid="card-think-input">
                <p className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: '#F37E20' }}>What you send</p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3 text-base" style={{ color: '#9a9bb0' }}>
                    <PenLine className="w-5 h-5 mt-0.5 shrink-0" style={{ color: '#F37E20' }} />
                    Your current entry (only the text you wrote)
                  </li>
                  <li className="flex items-start gap-3 text-base" style={{ color: '#9a9bb0' }}>
                    <Pin className="w-5 h-5 mt-0.5 shrink-0" style={{ color: '#FFB84D' }} />
                    Your Memory Pins (goals, patterns, preferences you've saved)
                  </li>
                  <li className="flex items-start gap-3 text-base" style={{ color: '#9a9bb0' }}>
                    <GitBranch className="w-5 h-5 mt-0.5 shrink-0" style={{ color: '#2E8B8B' }} />
                    Recent entry context (so the AI sees the bigger picture)
                  </li>
                </ul>
              </div>

              <div className="p-8 rounded-lg border calm-card" style={{ background: 'rgba(255,255,255,0.015)', borderColor: 'rgba(255,255,255,0.06)' }} data-testid="card-think-output">
                <p className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: '#2E8B8B' }}>What you get back</p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3 text-base" style={{ color: '#9a9bb0' }}>
                    <CheckCircle className="w-5 h-5 mt-0.5 shrink-0" style={{ color: '#2E8B8B' }} />
                    What you actually said vs. what you think you said
                  </li>
                  <li className="flex items-start gap-3 text-base" style={{ color: '#9a9bb0' }}>
                    <CheckCircle className="w-5 h-5 mt-0.5 shrink-0" style={{ color: '#2E8B8B' }} />
                    Claims extracted — flagged when they contradict past entries
                  </li>
                  <li className="flex items-start gap-3 text-base" style={{ color: '#9a9bb0' }}>
                    <CheckCircle className="w-5 h-5 mt-0.5 shrink-0" style={{ color: '#2E8B8B' }} />
                    Open questions, blind spots, and weak reasoning exposed
                  </li>
                  <li className="flex items-start gap-3 text-base" style={{ color: '#9a9bb0' }}>
                    <CheckCircle className="w-5 h-5 mt-0.5 shrink-0" style={{ color: '#2E8B8B' }} />
                    Suggested Memory Pins to carry forward
                  </li>
                </ul>
              </div>
            </div>

            <div className="p-8 rounded-lg border calm-card" style={{ background: 'linear-gradient(135deg, rgba(255,184,77,0.04), rgba(243,126,32,0.04))', borderColor: 'rgba(255,184,77,0.15)' }} data-testid="card-memory-pins">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-md flex items-center justify-center shrink-0" style={{ background: 'rgba(255,184,77,0.1)', border: '1px solid rgba(255,184,77,0.25)' }}>
                  <Pin className="w-6 h-6" style={{ color: '#FFB84D' }} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Memory Pins: How Intelligence Compounds</h3>
                  <p className="text-base leading-relaxed" style={{ color: '#9a9bb0' }}>
                    After each analysis, the AI suggests thoughts worth remembering — a key insight, a goal you stated, a pattern it noticed. You choose which ones to pin. Pinned memories become context for every future session. This is how your knowledge base gets smarter, not just bigger.
                  </p>
                  <p className="text-sm mt-3" style={{ color: '#555668' }}>
                    Nothing is pinned without your approval. You can view, edit, or remove any Memory Pin at any time.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </RevealSection>

      <RevealSection>
        <section className="relative py-24 border-t border-white/[0.06]" style={{ background: '#0F1115' }}>
          <div className="relative z-10 max-w-4xl mx-auto px-6">
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-3 px-6 py-3 rounded-md mb-6" style={{ background: 'rgba(243,126,32,0.08)', border: '1px solid rgba(243,126,32,0.2)' }}>
                <Shield className="w-6 h-6" style={{ color: '#F37E20' }} />
                <span className="text-base font-bold uppercase tracking-wider" style={{ color: '#F37E20' }}>Privacy Architecture</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight" data-testid="text-privacy-headline">
                Privacy & Sovereignty Promise
              </h2>
              <p className="text-xl max-w-2xl mx-auto leading-relaxed" style={{ color: '#9a9bb0' }}>
                Your thoughts are not training data. Your AI is not centralized. Your system is designed to last.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-10">
              <div className="p-8 rounded-lg border calm-card" style={{ background: 'rgba(255,255,255,0.015)', borderColor: 'rgba(255,255,255,0.06)' }}>
                <div className="w-14 h-14 rounded-md flex items-center justify-center mb-6" style={{ background: 'rgba(243,126,32,0.08)', border: '1px solid rgba(243,126,32,0.2)' }}>
                  <HardDrive className="w-7 h-7" style={{ color: '#F37E20' }} />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Local-First Storage</h3>
                <p className="text-sm leading-relaxed" style={{ color: '#7a7b90' }}>
                  All entries, research, and insights stored in your browser's IndexedDB. Works offline. No cloud database. No server-side copies.
                </p>
              </div>
              <div className="p-8 rounded-lg border calm-card" style={{ background: 'rgba(255,255,255,0.015)', borderColor: 'rgba(255,255,255,0.06)' }}>
                <div className="w-14 h-14 rounded-md flex items-center justify-center mb-6" style={{ background: 'rgba(46,139,139,0.08)', border: '1px solid rgba(46,139,139,0.2)' }}>
                  <Bot className="w-7 h-7" style={{ color: '#2E8B8B' }} />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">User-Controlled AI</h3>
                <p className="text-sm leading-relaxed" style={{ color: '#7a7b90' }}>
                  AI only sees your data when you click "Think with me." Nothing is sent automatically. No background scanning. No silent learning.
                </p>
              </div>
              <div className="p-8 rounded-lg border calm-card" style={{ background: 'rgba(255,255,255,0.015)', borderColor: 'rgba(255,255,255,0.06)' }}>
                <div className="w-14 h-14 rounded-md flex items-center justify-center mb-6" style={{ background: 'rgba(255,184,77,0.08)', border: '1px solid rgba(255,184,77,0.2)' }}>
                  <Shield className="w-7 h-7" style={{ color: '#FFB84D' }} />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Decentralized Inference</h3>
                <p className="text-sm leading-relaxed" style={{ color: '#7a7b90' }}>
                  Venice AI runs decentralized inference — no data retention, no centralized training. Brave Search adds privacy-first web search with no tracking or profiling.
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-10">
              <div className="p-6 rounded-lg border calm-card" style={{ background: 'rgba(255,255,255,0.015)', borderColor: 'rgba(255,255,255,0.06)' }} data-testid="card-xmtp-e2e">
                <div className="flex items-center gap-3 mb-3">
                  <Lock className="w-5 h-5" style={{ color: '#2E8B8B' }} />
                  <h4 className="text-base font-bold text-white">XMTP: E2E Encrypted Messaging</h4>
                </div>
                <p className="text-sm leading-relaxed" style={{ color: '#7a7b90' }}>
                  Agent communication via XMTP uses MLS protocol with forward secrecy and post-compromise security. Messages are end-to-end encrypted by default.
                </p>
              </div>
              <div className="p-6 rounded-lg border calm-card" style={{ background: 'rgba(255,255,255,0.015)', borderColor: 'rgba(255,255,255,0.06)' }} data-testid="card-xmtp-quantum">
                <div className="flex items-center gap-3 mb-3">
                  <Shield className="w-5 h-5" style={{ color: '#7B6B8D' }} />
                  <h4 className="text-base font-bold text-white">Quantum-Resistant Key Exchange</h4>
                </div>
                <p className="text-sm leading-relaxed" style={{ color: '#7a7b90' }}>
                  XMTP Welcome messages use XWING KEM — protecting against "harvest now, decrypt later" attacks. Future-proof security for your communication layer.
                </p>
              </div>
            </div>

            <div className="p-8 rounded-lg border calm-card" style={{ background: 'linear-gradient(to right, rgba(243,126,32,0.04), rgba(46,139,139,0.04))', borderColor: 'rgba(255,255,255,0.08)' }}>
              <p className="text-center text-lg leading-relaxed" style={{ color: '#b0b1c0' }}>
                When you request AI insights, only the text you select is sent to privacy-focused providers via HTTPS. The response is saved locally on your device. We do not permanently store your data on any server.
              </p>
              <p className="text-center text-sm mt-4" style={{ color: '#555668' }}>
                Honest disclosure: Venice AI calls use HTTPS, not E2E encryption. XMTP messaging is E2E encrypted.
              </p>
              <p className="text-center text-[10px] mt-2 uppercase tracking-wider" style={{ color: '#444556' }}>
                Planned: encryption-at-rest for local storage · E2E encrypted AI requests
              </p>
            </div>
          </div>
        </section>
      </RevealSection>

      <RevealSection>
        <section className="relative py-24 border-t border-white/[0.06]" style={{ background: '#0F1115' }}>
          <div className="relative z-10 max-w-4xl mx-auto px-6">
            <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
              <FAQItem question="How is DJZS different from ChatGPT or Notion AI?">
                <p>ChatGPT and Notion AI are designed to be helpful. DJZS is designed to be honest.</p>
                <p className="mt-2" style={{ color: '#7a7b90' }}>Centralized AI tools:</p>
                <ul className="list-disc list-inside ml-2" style={{ color: '#7a7b90' }}>
                  <li>Validate whatever you say — "Great thinking!" even when it's not</li>
                  <li>Store your data on their servers and train on your inputs</li>
                  <li>Have zero memory of your past reasoning</li>
                </ul>
                <p className="mt-3" style={{ color: '#9a9bb0' }}>DJZS is an adversarial thinking system:</p>
                <ul className="list-disc list-inside ml-2" style={{ color: '#9a9bb0' }}>
                  <li>Challenges your claims, flags FOMO, and calls out weak reasoning</li>
                  <li>Tracks your thinking over time — surfaces contradictions</li>
                  <li>Data stays on your device. AI doesn't train on your inputs</li>
                </ul>
                <p className="text-white mt-3 font-semibold">DJZS doesn't think for you. It makes sure you're actually thinking.</p>
              </FAQItem>

              <FAQItem question="What does 'compounding intelligence' mean?">
                <p>Most tools accumulate content linearly — notes pile up, bookmarks collect dust.</p>
                <p className="mt-2">DJZS compounds intelligence:</p>
                <ul className="list-disc list-inside ml-2">
                  <li>Every entry is analyzed and connected to your past thinking</li>
                  <li>Patterns and contradictions are surfaced automatically</li>
                  <li>Memory pins carry forward context across sessions</li>
                  <li>Research and daily entries cross-reference each other</li>
                </ul>
                <p className="text-white mt-2 font-semibold">The more you use DJZS, the smarter your knowledge base becomes.</p>
              </FAQItem>

              <FAQItem question="Is my thinking really private?">
                <p className="text-white font-semibold">Yes — by design.</p>
                <ul className="list-disc list-inside ml-2 mt-2">
                  <li>Your entries and research live on your device</li>
                  <li>AI only sees text you explicitly send via "Think with me"</li>
                  <li>DJZS does not scan, profile, or monetize your thinking</li>
                  <li>Nothing syncs unless you choose to export it</li>
                </ul>
                <p className="mt-3">DJZS works fully offline. If your device is offline, your thinking is offline.</p>
              </FAQItem>

              <FAQItem question="Where is my data stored?">
                <p className="text-white font-semibold">In your browser's local database (IndexedDB) on this device.</p>
                <p className="mt-2">DJZS does not use cloud servers for storage. Your journal entries, research trackers, memory pins, and music tracks all live in your browser's IndexedDB. This data persists across sessions but never leaves your device unless you explicitly send text to the AI or export it.</p>
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

              <FAQItem question="Can I use DJZS on multiple devices?">
                <p className="text-white font-semibold">Yes, via export and import.</p>
                <p className="mt-2">Export on device A, import on device B. The import will merge data without duplicating entries. This is manual but works today with zero extra complexity.</p>
                <p className="mt-2" style={{ color: '#7a7b90' }}>Future: optional XMTP-based E2E encrypted sync across devices (serverless, opt-in).</p>
              </FAQItem>

              <FAQItem question="Is my local data encrypted?">
                <p>Currently, IndexedDB data is not encrypted at rest. Anyone with access to your unlocked browser profile can read it.</p>
                <p className="mt-2" style={{ color: '#7a7b90' }}>Planned: passphrase-based vault encryption (WebCrypto AES-GCM) — set a passphrase, auto-lock timer, encrypted exports.</p>
                <p className="text-white mt-2 font-semibold">We tell you the truth now so you can trust us later.</p>
              </FAQItem>

              <FAQItem question="What does the AI see?">
                <p className="text-white font-semibold">Only the text you choose to send.</p>
                <ul className="list-disc list-inside ml-2 mt-2">
                  <li>When you click "Think with me" — your current entry + selected memory pins are sent to Venice AI over HTTPS/TLS</li>
                  <li>This is <strong className="text-white">not end-to-end encrypted</strong> — Venice sees the plaintext to compute a response</li>
                  <li>Venice claims no data retention and no training on your inputs</li>
                  <li>XMTP messaging (to the agent) is fully E2E encrypted via MLS protocol</li>
                </ul>
                <p className="mt-2">Nothing is sent in the background. Nothing is scanned. You control every interaction.</p>
              </FAQItem>

              <FAQItem question="How does the AI thinking partner work?">
                <p>The AI is not a chatbot — it's an adversarial thinking partner. It actively tries to break your reasoning.</p>
                <p className="mt-2">When you click "Think with me," the AI:</p>
                <ul className="list-disc list-inside ml-2">
                  <li>Interrogates your current entry — not summarizes, interrogates</li>
                  <li>Cross-references against your past claims and pins contradictions</li>
                  <li>Flags FOMO, narrative dependency, ego-driven reasoning</li>
                  <li>Asks: "Would you still do this if nobody was watching?"</li>
                </ul>
                <p className="text-white mt-2 font-semibold">No soothing. No "great insight." Just sharper thinking.</p>
              </FAQItem>

              <FAQItem question="What are the zones?">
                <p>Six zones, one compounding loop. Each designed to pressure-test a different part of your thinking:</p>
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
                <p className="mt-3 text-white font-semibold">Plus Trade, Decision, and Content zones. Each feeds the others. Your thinking compounds.</p>
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

              <FAQItem question="Who is DJZS for?">
                <p className="text-white font-semibold">People who want to be challenged, not validated.</p>
                <ul className="list-disc list-inside ml-2 mt-2">
                  <li>Crypto-native builders tired of echo chamber consensus</li>
                  <li>Founders who want their reasoning stress-tested, not applauded</li>
                  <li>Traders who need to separate FOMO from strategy</li>
                  <li>Researchers who want their thesis attacked before peer review does</li>
                  <li>Anyone whose decisions have real consequences</li>
                </ul>
                <p className="mt-3" style={{ color: '#7a7b90' }}>DJZS is not for casual diary-keeping, photo memories, or people who want an AI that tells them they're brilliant.</p>
                <p className="mt-2 text-white font-semibold">Cognitive infrastructure for a decentralized, post-surveillance world.</p>
              </FAQItem>
            </div>
          </div>
        </section>
      </RevealSection>

      <RevealSection>
        <section className="relative py-32 border-t border-white/[0.06]" style={{ background: '#14171D' }}>
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight" data-testid="text-final-cta-headline">
              The AI that challenges you. Not the one that agrees with you.
            </h2>
            <p className="text-xl mb-12" style={{ color: '#7a7b90' }}>
              Local-first data. Decentralized AI. No surveillance. No soothing. Just sharper decisions.
            </p>
            <div className="flex flex-col items-center gap-4">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                <Link href="/chat">
                  <button
                    className="inline-flex items-center gap-3 rounded-lg px-10 py-5 text-lg font-bold text-white transition-all duration-250 hover:-translate-y-1"
                    style={{ background: '#F37E20', boxShadow: '0 8px 30px rgba(243,126,32,0.3)' }}
                    data-testid="button-final-get-started"
                  >
                    Start Thinking
                    <ArrowRight className="w-6 h-6" />
                  </button>
                </Link>
              </div>
              <p className="text-sm" style={{ color: '#7a7b90' }} data-testid="text-final-cta-microcopy">
                No account needed. Local-first. Decentralized AI. Quantum-resilient by design.
              </p>
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
              Decentralized AI for sovereign thinking
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
            © 2026 DJZS System
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
                Start Thinking
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
