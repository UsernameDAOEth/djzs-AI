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
    <div className="min-h-screen text-white overflow-hidden" style={{ background: '#2A2E3F' }}>
      <style>{`
        @keyframes breathe {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.03); }
        }
        ::selection { background: rgba(243,126,32,0.3); }
      `}</style>

      <header className="sticky top-0 z-50 backdrop-blur-xl border-b border-white/[0.06]" style={{ background: 'rgba(42,46,63,0.88)', boxShadow: '0 1px 20px rgba(0,0,0,0.15)' }}>
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
                  className="relative inline-flex items-center gap-2 rounded-xl px-5 sm:px-6 py-2 sm:py-2.5 text-sm sm:text-base font-bold text-white transition-all hover:scale-[1.03] active:scale-[0.98]"
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
              className="md:hidden border-t border-white/[0.05] overflow-hidden"
              style={{ background: 'rgba(26,29,38,0.98)' }}
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
                    className="px-4 py-3 rounded-xl text-sm font-medium transition-colors hover:bg-white/[0.04] hover:text-white"
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
        <title>DJZS - Decentralized AI for Sovereign Thinking</title>
        <meta name="description" content="A decentralized, quantum-resilient AI thinking system. Local-first storage, E2E encrypted messaging, and decentralized AI inference via Venice. Your thoughts are not training data." />
        <meta property="og:title" content="DJZS - Decentralized AI for Sovereign Thinking" />
        <meta property="og:description" content="Local-first. End-to-end encrypted. Quantum-resilient by design. A thinking system that compounds your intelligence without giving it away." />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="DJZS - Decentralized AI for Sovereign Thinking" />
        <meta name="twitter:description" content="A decentralized, quantum-resilient AI thinking system. Your thoughts stay local. Your AI runs decentralized. Your intelligence compounds securely." />
      </Helmet>

      <motion.section
        variants={pageContainer}
        initial="hidden"
        animate="show"
        className="relative min-h-[92vh] flex items-center justify-center overflow-hidden"
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
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider" style={{ background: 'rgba(243,126,32,0.08)', border: '1px solid rgba(243,126,32,0.2)', color: '#F37E20' }}>
              <Shield className="w-3.5 h-3.5" />
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
            Your thoughts stay local. Your AI runs decentralized. Your intelligence compounds securely. No centralized model training on your thinking. No cloud surveillance layer.
          </motion.p>

          <motion.div variants={fadeUp} className="flex flex-col items-center gap-4 mb-12">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              {isConnected ? (
                <Link href="/chat">
                  <button
                    className="inline-flex items-center gap-3 rounded-2xl px-10 py-5 text-lg font-bold text-white transition-all duration-250 hover:-translate-y-1"
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
                      className="inline-flex items-center gap-3 rounded-2xl px-10 py-5 text-lg font-bold transition-all duration-250 hover:-translate-y-1"
                      style={{ background: '#F37E20', color: '#fff', boxShadow: '0 8px 30px rgba(243,126,32,0.3)' }}
                      data-testid="button-start-thinking"
                    >
                      Start Thinking
                      <ArrowRight className="w-6 h-6" />
                    </button>
                  </Link>
                  <button
                    onClick={scrollToHowItWorks}
                    className="inline-flex items-center gap-3 rounded-2xl border px-8 py-5 text-lg font-bold transition-all duration-250 hover:text-white"
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
              Local-first. End-to-end encrypted. Quantum-resilient by design.
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
        <section className="relative py-32 border-t border-white/[0.05]" style={{ background: '#1a1d26' }}>
          <div className="max-w-5xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight" data-testid="text-zones-headline">
                Three Zones. One Loop.
              </h2>
              <p className="text-xl max-w-3xl mx-auto" style={{ color: '#7a7b90' }}>
                Each zone feeds the others. Your thinking, research, and insights all connect into a single compounding system.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <ZoneFeatureCard
                icon={<PenLine className="w-7 h-7" style={{ color: '#F37E20' }} />}
                color="orange"
                title="Journal Zone"
                description="Write your daily thinking. AI auto-summarizes and extracts structured insights — key claims, patterns, and open questions."
                examplePrompt="I'm rethinking our go-to-market. The bottleneck isn't distribution..."
                href="/chat"
              />
              <ZoneFeatureCard
                icon={<Search className="w-7 h-7" style={{ color: '#2E8B8B' }} />}
                color="teal"
                title="Research Zone"
                description="Save articles, links, and findings. AI synthesizes research with your daily entries to build a structured knowledge base."
                examplePrompt="This paper contradicts what I wrote about last Tuesday..."
                href="/chat?zone=research"
              />
              <ZoneFeatureCard
                icon={<Brain className="w-7 h-7" style={{ color: '#7B6B8D' }} />}
                color="purple"
                title="Thinking Partner"
                description="One AI agent that connects your ideas, debates your points, and finds patterns across everything you've written and researched."
                examplePrompt="What patterns do you see in my thinking about this market?"
                href="/chat"
              />
            </div>
          </div>
        </section>
      </RevealSection>

      <RevealSection>
        <section className="relative py-32 border-t border-white/[0.05]" style={{ background: '#1a1d26' }}>
          <div className="max-w-5xl mx-auto px-6">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full mb-6" style={{ background: 'rgba(243,126,32,0.08)', border: '1px solid rgba(243,126,32,0.2)' }}>
                <Briefcase className="w-6 h-6" style={{ color: '#F37E20' }} />
                <span className="text-base font-bold uppercase tracking-wider" style={{ color: '#F37E20' }}>For Founders</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight" data-testid="text-founders-headline">
                Build with clarity. Ship with conviction.
              </h2>
              <p className="text-xl max-w-3xl mx-auto" style={{ color: '#7a7b90' }}>
                Founders make hundreds of decisions daily. DJZS turns scattered thinking into structured strategy — track your reasoning, test your assumptions, and compound your founder intelligence.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
              <div className="p-8 rounded-2xl border transition-all hover:border-orange-500/20" style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.05)' }} data-testid="card-founder-research">
                <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-6" style={{ background: 'rgba(46,139,139,0.1)', border: '1px solid rgba(46,139,139,0.25)' }}>
                  <Search className="w-7 h-7" style={{ color: '#2E8B8B' }} />
                </div>
                <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#2E8B8B' }}>Research Zone</p>
                <h3 className="text-xl font-bold text-white mb-3">Market & Competitive Intel</h3>
                <ul className="space-y-2.5">
                  <li className="flex items-start gap-2.5 text-sm" style={{ color: '#9a9bb0' }}>
                    <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#2E8B8B' }} />
                    Save competitor analysis, market data, user feedback
                  </li>
                  <li className="flex items-start gap-2.5 text-sm" style={{ color: '#9a9bb0' }}>
                    <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#2E8B8B' }} />
                    AI synthesizes across all your research sources
                  </li>
                  <li className="flex items-start gap-2.5 text-sm" style={{ color: '#9a9bb0' }}>
                    <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#2E8B8B' }} />
                    Connects market signals to your product strategy
                  </li>
                </ul>
              </div>

              <div className="p-8 rounded-2xl border transition-all hover:border-orange-500/20" style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.05)' }} data-testid="card-founder-journal">
                <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-6" style={{ background: 'rgba(243,126,32,0.1)', border: '1px solid rgba(243,126,32,0.25)' }}>
                  <PenLine className="w-7 h-7" style={{ color: '#F37E20' }} />
                </div>
                <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#F37E20' }}>Journal Zone</p>
                <h3 className="text-xl font-bold text-white mb-3">Founder's Decision Log</h3>
                <ul className="space-y-2.5">
                  <li className="flex items-start gap-2.5 text-sm" style={{ color: '#9a9bb0' }}>
                    <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#F37E20' }} />
                    Document pivots, strategy shifts, and key decisions
                  </li>
                  <li className="flex items-start gap-2.5 text-sm" style={{ color: '#9a9bb0' }}>
                    <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#F37E20' }} />
                    AI tracks your reasoning patterns over time
                  </li>
                  <li className="flex items-start gap-2.5 text-sm" style={{ color: '#9a9bb0' }}>
                    <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#F37E20' }} />
                    Surfaces blind spots before they become costly
                  </li>
                </ul>
              </div>

              <div className="p-8 rounded-2xl border transition-all hover:border-orange-500/20" style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.05)' }} data-testid="card-founder-partner">
                <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-6" style={{ background: 'rgba(123,107,141,0.1)', border: '1px solid rgba(123,107,141,0.25)' }}>
                  <Brain className="w-7 h-7" style={{ color: '#7B6B8D' }} />
                </div>
                <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#7B6B8D' }}>Thinking Partner</p>
                <h3 className="text-xl font-bold text-white mb-3">Strategic Advisor</h3>
                <ul className="space-y-2.5">
                  <li className="flex items-start gap-2.5 text-sm" style={{ color: '#9a9bb0' }}>
                    <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#7B6B8D' }} />
                    Stress-tests your strategy before you commit resources
                  </li>
                  <li className="flex items-start gap-2.5 text-sm" style={{ color: '#9a9bb0' }}>
                    <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#7B6B8D' }} />
                    Connects today's decisions to past lessons learned
                  </li>
                  <li className="flex items-start gap-2.5 text-sm" style={{ color: '#9a9bb0' }}>
                    <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#7B6B8D' }} />
                    Asks the hard questions your team won't
                  </li>
                </ul>
              </div>
            </div>

            <div className="p-8 rounded-2xl border text-center" style={{ background: 'linear-gradient(135deg, rgba(243,126,32,0.04), rgba(255,184,77,0.04))', borderColor: 'rgba(255,184,77,0.15)' }} data-testid="card-founder-cta">
              <p className="text-lg font-bold text-white mb-2">Stop building on gut feel. Start compounding founder intelligence.</p>
              <p className="text-sm mb-6" style={{ color: '#7a7b90' }}>Every decision documented. Every pattern tracked. Every lesson carried forward.</p>
              <Link href="/chat">
                <button
                  className="inline-flex items-center gap-3 rounded-2xl px-8 py-4 text-base font-bold text-white transition-all duration-250 hover:-translate-y-1"
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
        <section className="relative py-32 border-t border-white/[0.05]" style={{ background: '#2A2E3F' }}>
          <div className="max-w-5xl mx-auto px-6">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full mb-6" style={{ background: 'rgba(46,139,139,0.08)', border: '1px solid rgba(46,139,139,0.2)' }}>
                <BarChart3 className="w-6 h-6" style={{ color: '#2E8B8B' }} />
                <span className="text-base font-bold uppercase tracking-wider" style={{ color: '#2E8B8B' }}>For Traders</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight" data-testid="text-traders-headline">
                Trade with conviction. Track every thesis.
              </h2>
              <p className="text-xl max-w-3xl mx-auto" style={{ color: '#7a7b90' }}>
                Crypto moves fast. Your analysis shouldn't live in Discord threads and scattered notes. DJZS turns market thinking into structured strategy — track your theses, stress-test assumptions, and compound your trading intelligence.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
              <div className="p-8 rounded-2xl border transition-all hover:border-teal-500/20" style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.05)' }} data-testid="card-trader-research">
                <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-6" style={{ background: 'rgba(46,139,139,0.1)', border: '1px solid rgba(46,139,139,0.25)' }}>
                  <Search className="w-7 h-7" style={{ color: '#2E8B8B' }} />
                </div>
                <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#2E8B8B' }}>Research Zone</p>
                <h3 className="text-xl font-bold text-white mb-3">Market Intelligence</h3>
                <ul className="space-y-2.5">
                  <li className="flex items-start gap-2.5 text-sm" style={{ color: '#9a9bb0' }}>
                    <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#2E8B8B' }} />
                    Build dossiers on protocols, tokens, and market narratives
                  </li>
                  <li className="flex items-start gap-2.5 text-sm" style={{ color: '#9a9bb0' }}>
                    <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#2E8B8B' }} />
                    AI synthesizes on-chain analysis, whitepapers, and alpha
                  </li>
                  <li className="flex items-start gap-2.5 text-sm" style={{ color: '#9a9bb0' }}>
                    <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#2E8B8B' }} />
                    Track claims with trust levels — separate signal from noise
                  </li>
                </ul>
              </div>

              <div className="p-8 rounded-2xl border transition-all hover:border-orange-500/20" style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.05)' }} data-testid="card-trader-journal">
                <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-6" style={{ background: 'rgba(243,126,32,0.1)', border: '1px solid rgba(243,126,32,0.25)' }}>
                  <PenLine className="w-7 h-7" style={{ color: '#F37E20' }} />
                </div>
                <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#F37E20' }}>Journal Zone</p>
                <h3 className="text-xl font-bold text-white mb-3">Trade Journal</h3>
                <ul className="space-y-2.5">
                  <li className="flex items-start gap-2.5 text-sm" style={{ color: '#9a9bb0' }}>
                    <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#F37E20' }} />
                    Document your thesis before entering a position
                  </li>
                  <li className="flex items-start gap-2.5 text-sm" style={{ color: '#9a9bb0' }}>
                    <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#F37E20' }} />
                    AI tracks how your market views evolve over time
                  </li>
                  <li className="flex items-start gap-2.5 text-sm" style={{ color: '#9a9bb0' }}>
                    <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#F37E20' }} />
                    Surfaces biases and emotional patterns in your trading
                  </li>
                </ul>
              </div>

              <div className="p-8 rounded-2xl border transition-all hover:border-purple-500/20" style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.05)' }} data-testid="card-trader-partner">
                <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-6" style={{ background: 'rgba(123,107,141,0.1)', border: '1px solid rgba(123,107,141,0.25)' }}>
                  <Brain className="w-7 h-7" style={{ color: '#7B6B8D' }} />
                </div>
                <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#7B6B8D' }}>Thinking Partner</p>
                <h3 className="text-xl font-bold text-white mb-3">Strategy Stress-Test</h3>
                <ul className="space-y-2.5">
                  <li className="flex items-start gap-2.5 text-sm" style={{ color: '#9a9bb0' }}>
                    <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#7B6B8D' }} />
                    Challenges your thesis before you risk capital
                  </li>
                  <li className="flex items-start gap-2.5 text-sm" style={{ color: '#9a9bb0' }}>
                    <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#7B6B8D' }} />
                    Connects current market view to past trade reasoning
                  </li>
                  <li className="flex items-start gap-2.5 text-sm" style={{ color: '#9a9bb0' }}>
                    <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#7B6B8D' }} />
                    Finds contradictions between your research and your bets
                  </li>
                </ul>
              </div>
            </div>

            <div className="p-8 rounded-2xl border text-center" style={{ background: 'linear-gradient(135deg, rgba(46,139,139,0.04), rgba(123,107,141,0.04))', borderColor: 'rgba(46,139,139,0.15)' }} data-testid="card-trader-cta">
              <p className="text-lg font-bold text-white mb-2">Stop trading on vibes. Start compounding trading intelligence.</p>
              <p className="text-sm mb-6" style={{ color: '#7a7b90' }}>Every thesis documented. Every pattern tracked. Every lesson carried forward to the next trade.</p>
              <Link href="/chat">
                <button
                  className="inline-flex items-center gap-3 rounded-2xl px-8 py-4 text-base font-bold text-white transition-all duration-250 hover:-translate-y-1"
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
        <section className="relative py-32 border-t border-white/[0.05]" style={{ background: '#1a1d26' }}>
          <div className="max-w-5xl mx-auto px-6">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full mb-6" style={{ background: 'rgba(123,107,141,0.08)', border: '1px solid rgba(123,107,141,0.2)' }}>
                <Video className="w-6 h-6" style={{ color: '#7B6B8D' }} />
                <span className="text-base font-bold uppercase tracking-wider" style={{ color: '#7B6B8D' }}>For Content Creators</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight" data-testid="text-creators-headline">
                Stop creating in a vacuum. Start building a content brain.
              </h2>
              <p className="text-xl max-w-3xl mx-auto" style={{ color: '#7a7b90' }}>
                Great content comes from deep thinking, not just trending topics. DJZS helps you develop original perspectives, track what resonates, and build a content strategy that compounds.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
              <div className="p-8 rounded-2xl border transition-all hover:border-purple-500/20" style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.05)' }} data-testid="card-creator-research">
                <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-6" style={{ background: 'rgba(46,139,139,0.1)', border: '1px solid rgba(46,139,139,0.25)' }}>
                  <Search className="w-7 h-7" style={{ color: '#2E8B8B' }} />
                </div>
                <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#2E8B8B' }}>Research Zone</p>
                <h3 className="text-xl font-bold text-white mb-3">Content Intelligence</h3>
                <ul className="space-y-2.5">
                  <li className="flex items-start gap-2.5 text-sm" style={{ color: '#9a9bb0' }}>
                    <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#2E8B8B' }} />
                    Save trends, audience insights, competitor content
                  </li>
                  <li className="flex items-start gap-2.5 text-sm" style={{ color: '#9a9bb0' }}>
                    <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#2E8B8B' }} />
                    AI identifies patterns across your research
                  </li>
                  <li className="flex items-start gap-2.5 text-sm" style={{ color: '#9a9bb0' }}>
                    <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#2E8B8B' }} />
                    Builds a knowledge base that informs every piece
                  </li>
                </ul>
              </div>

              <div className="p-8 rounded-2xl border transition-all hover:border-orange-500/20" style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.05)' }} data-testid="card-creator-journal">
                <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-6" style={{ background: 'rgba(243,126,32,0.1)', border: '1px solid rgba(243,126,32,0.25)' }}>
                  <PenLine className="w-7 h-7" style={{ color: '#F37E20' }} />
                </div>
                <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#F37E20' }}>Journal Zone</p>
                <h3 className="text-xl font-bold text-white mb-3">Content Lab</h3>
                <ul className="space-y-2.5">
                  <li className="flex items-start gap-2.5 text-sm" style={{ color: '#9a9bb0' }}>
                    <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#F37E20' }} />
                    Draft ideas, angles, and narratives in one place
                  </li>
                  <li className="flex items-start gap-2.5 text-sm" style={{ color: '#9a9bb0' }}>
                    <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#F37E20' }} />
                    AI tracks which themes keep surfacing
                  </li>
                  <li className="flex items-start gap-2.5 text-sm" style={{ color: '#9a9bb0' }}>
                    <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#F37E20' }} />
                    Never lose a content idea again
                  </li>
                </ul>
              </div>

              <div className="p-8 rounded-2xl border transition-all hover:border-purple-500/20" style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.05)' }} data-testid="card-creator-partner">
                <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-6" style={{ background: 'rgba(123,107,141,0.1)', border: '1px solid rgba(123,107,141,0.25)' }}>
                  <Brain className="w-7 h-7" style={{ color: '#7B6B8D' }} />
                </div>
                <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#7B6B8D' }}>Thinking Partner</p>
                <h3 className="text-xl font-bold text-white mb-3">Creative Sparring Partner</h3>
                <ul className="space-y-2.5">
                  <li className="flex items-start gap-2.5 text-sm" style={{ color: '#9a9bb0' }}>
                    <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#7B6B8D' }} />
                    Tests your takes before you publish
                  </li>
                  <li className="flex items-start gap-2.5 text-sm" style={{ color: '#9a9bb0' }}>
                    <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#7B6B8D' }} />
                    Connects new ideas to your existing body of work
                  </li>
                  <li className="flex items-start gap-2.5 text-sm" style={{ color: '#9a9bb0' }}>
                    <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#7B6B8D' }} />
                    Helps you find your unique angle on any topic
                  </li>
                </ul>
              </div>
            </div>

            <div className="p-8 rounded-2xl border text-center" style={{ background: 'linear-gradient(135deg, rgba(123,107,141,0.04), rgba(243,126,32,0.04))', borderColor: 'rgba(123,107,141,0.15)' }} data-testid="card-creator-cta">
              <p className="text-lg font-bold text-white mb-2">Your content gets better because your thinking gets better.</p>
              <p className="text-sm mb-6" style={{ color: '#7a7b90' }}>Every idea tracked. Every angle explored. Every piece backed by a growing knowledge base.</p>
              <Link href="/chat">
                <button
                  className="inline-flex items-center gap-3 rounded-2xl px-8 py-4 text-base font-bold text-white transition-all duration-250 hover:-translate-y-1"
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
        <section className="relative py-32 border-t border-white/[0.05]" style={{ background: '#2A2E3F' }}>
          <div className="max-w-5xl mx-auto px-6">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full mb-6" style={{ background: 'rgba(46,139,139,0.08)', border: '1px solid rgba(46,139,139,0.2)' }}>
                <FlaskConical className="w-6 h-6" style={{ color: '#2E8B8B' }} />
                <span className="text-base font-bold uppercase tracking-wider" style={{ color: '#2E8B8B' }}>For Researchers</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight" data-testid="text-researchers-headline">
                Synthesize faster. Think deeper. Publish with confidence.
              </h2>
              <p className="text-xl max-w-3xl mx-auto" style={{ color: '#7a7b90' }}>
                Research means drowning in sources — papers, datasets, conflicting findings. DJZS turns fragmented knowledge into structured insight, helping you identify gaps, resolve contradictions, and build your thesis incrementally.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
              <div className="p-8 rounded-2xl border transition-all hover:border-teal-500/20" style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.05)' }} data-testid="card-researcher-research">
                <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-6" style={{ background: 'rgba(46,139,139,0.1)', border: '1px solid rgba(46,139,139,0.25)' }}>
                  <Search className="w-7 h-7" style={{ color: '#2E8B8B' }} />
                </div>
                <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#2E8B8B' }}>Research Zone</p>
                <h3 className="text-xl font-bold text-white mb-3">Literature & Data Synthesis</h3>
                <ul className="space-y-2.5">
                  <li className="flex items-start gap-2.5 text-sm" style={{ color: '#9a9bb0' }}>
                    <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#2E8B8B' }} />
                    Build dossiers on papers, datasets, and source materials
                  </li>
                  <li className="flex items-start gap-2.5 text-sm" style={{ color: '#9a9bb0' }}>
                    <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#2E8B8B' }} />
                    AI identifies conflicting findings and research gaps
                  </li>
                  <li className="flex items-start gap-2.5 text-sm" style={{ color: '#9a9bb0' }}>
                    <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#2E8B8B' }} />
                    Track claims with trust levels — separate signal from noise
                  </li>
                </ul>
              </div>

              <div className="p-8 rounded-2xl border transition-all hover:border-orange-500/20" style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.05)' }} data-testid="card-researcher-journal">
                <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-6" style={{ background: 'rgba(243,126,32,0.1)', border: '1px solid rgba(243,126,32,0.25)' }}>
                  <PenLine className="w-7 h-7" style={{ color: '#F37E20' }} />
                </div>
                <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#F37E20' }}>Journal Zone</p>
                <h3 className="text-xl font-bold text-white mb-3">Research Log</h3>
                <ul className="space-y-2.5">
                  <li className="flex items-start gap-2.5 text-sm" style={{ color: '#9a9bb0' }}>
                    <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#F37E20' }} />
                    Document hypotheses, observations, and methodology notes
                  </li>
                  <li className="flex items-start gap-2.5 text-sm" style={{ color: '#9a9bb0' }}>
                    <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#F37E20' }} />
                    AI tracks how your thinking evolves across studies
                  </li>
                  <li className="flex items-start gap-2.5 text-sm" style={{ color: '#9a9bb0' }}>
                    <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#F37E20' }} />
                    Surfaces assumptions and blind spots in your reasoning
                  </li>
                </ul>
              </div>

              <div className="p-8 rounded-2xl border transition-all hover:border-purple-500/20" style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.05)' }} data-testid="card-researcher-partner">
                <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-6" style={{ background: 'rgba(123,107,141,0.1)', border: '1px solid rgba(123,107,141,0.25)' }}>
                  <Brain className="w-7 h-7" style={{ color: '#7B6B8D' }} />
                </div>
                <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#7B6B8D' }}>Thinking Partner</p>
                <h3 className="text-xl font-bold text-white mb-3">Thesis Advisor</h3>
                <ul className="space-y-2.5">
                  <li className="flex items-start gap-2.5 text-sm" style={{ color: '#9a9bb0' }}>
                    <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#7B6B8D' }} />
                    Challenges your thesis before peer review does
                  </li>
                  <li className="flex items-start gap-2.5 text-sm" style={{ color: '#9a9bb0' }}>
                    <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#7B6B8D' }} />
                    Connects findings across papers and datasets
                  </li>
                  <li className="flex items-start gap-2.5 text-sm" style={{ color: '#9a9bb0' }}>
                    <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#7B6B8D' }} />
                    Identifies gaps in your argument before you publish
                  </li>
                </ul>
              </div>
            </div>

            <div className="p-8 rounded-2xl border text-center" style={{ background: 'linear-gradient(135deg, rgba(46,139,139,0.04), rgba(243,126,32,0.04))', borderColor: 'rgba(46,139,139,0.15)' }} data-testid="card-researcher-cta">
              <p className="text-lg font-bold text-white mb-2">Stop drowning in sources. Start compounding research intelligence.</p>
              <p className="text-sm mb-6" style={{ color: '#7a7b90' }}>Every finding documented. Every contradiction surfaced. Every thesis built incrementally.</p>
              <Link href="/chat">
                <button
                  className="inline-flex items-center gap-3 rounded-2xl px-8 py-4 text-base font-bold text-white transition-all duration-250 hover:-translate-y-1"
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
        <section className="relative py-32 border-t border-white/[0.05]" style={{ background: '#1a1d26' }}>
          <div className="max-w-5xl mx-auto px-6">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6" style={{ background: 'rgba(46,139,139,0.08)', border: '1px solid rgba(46,139,139,0.2)' }}>
                <Zap className="w-4 h-4" style={{ color: '#2E8B8B' }} />
                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: '#2E8B8B' }}>Decentralized AI by Design</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight" data-testid="text-different-headline">
                AI becomes a tool, not a data vacuum.
              </h2>
              <p className="text-xl max-w-3xl mx-auto" style={{ color: '#7a7b90' }}>
                DJZS integrates decentralized AI inference via Venice, rather than centralized AI providers. No single company controls the model. No centralized logs of your thinking.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="p-8 rounded-2xl border transition-all hover:border-orange-500/15 group" style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.05)' }} data-testid="card-pillar-privacy">
                <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-6" style={{ background: 'rgba(243,126,32,0.1)', border: '1px solid rgba(243,126,32,0.25)' }}>
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

              <div className="p-8 rounded-2xl border transition-all hover:border-teal-500/15 group" style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.05)' }} data-testid="card-pillar-longevity">
                <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-6" style={{ background: 'rgba(46,139,139,0.1)', border: '1px solid rgba(46,139,139,0.25)' }}>
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

              <div className="p-8 rounded-2xl border transition-all hover:border-purple-500/15 group" style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.05)' }} data-testid="card-pillar-ai">
                <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-6" style={{ background: 'rgba(123,107,141,0.1)', border: '1px solid rgba(123,107,141,0.25)' }}>
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

              <div className="p-8 rounded-2xl border transition-all hover:border-yellow-500/15 group" style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.05)' }} data-testid="card-pillar-calm">
                <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-6" style={{ background: 'rgba(255,184,77,0.1)', border: '1px solid rgba(255,184,77,0.25)' }}>
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
        <section className="relative py-32 border-t border-white/[0.05]" style={{ background: '#1a1d26' }}>
          <div className="max-w-5xl mx-auto px-6">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6" style={{ background: 'rgba(255,184,77,0.08)', border: '1px solid rgba(255,184,77,0.2)' }}>
                <Zap className="w-4 h-4" style={{ color: '#FFB84D' }} />
                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: '#FFB84D' }}>How It Actually Works</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight" data-testid="text-think-with-me-headline">
                What happens when you click "Think with me"
              </h2>
              <p className="text-xl max-w-3xl mx-auto" style={{ color: '#7a7b90' }}>
                The AI doesn't run in the background. It activates only when you ask. Here's exactly what it does.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              <div className="p-8 rounded-2xl border" style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.05)' }} data-testid="card-think-input">
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

              <div className="p-8 rounded-2xl border" style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.05)' }} data-testid="card-think-output">
                <p className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: '#2E8B8B' }}>What you get back</p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3 text-base" style={{ color: '#9a9bb0' }}>
                    <CheckCircle className="w-5 h-5 mt-0.5 shrink-0" style={{ color: '#2E8B8B' }} />
                    Structured summary of your thinking
                  </li>
                  <li className="flex items-start gap-3 text-base" style={{ color: '#9a9bb0' }}>
                    <CheckCircle className="w-5 h-5 mt-0.5 shrink-0" style={{ color: '#2E8B8B' }} />
                    Key claims extracted (with connections to past entries)
                  </li>
                  <li className="flex items-start gap-3 text-base" style={{ color: '#9a9bb0' }}>
                    <CheckCircle className="w-5 h-5 mt-0.5 shrink-0" style={{ color: '#2E8B8B' }} />
                    Open questions and contradictions to explore
                  </li>
                  <li className="flex items-start gap-3 text-base" style={{ color: '#9a9bb0' }}>
                    <CheckCircle className="w-5 h-5 mt-0.5 shrink-0" style={{ color: '#2E8B8B' }} />
                    Suggested Memory Pins to carry forward
                  </li>
                </ul>
              </div>
            </div>

            <div className="p-8 rounded-2xl border" style={{ background: 'linear-gradient(135deg, rgba(255,184,77,0.04), rgba(243,126,32,0.04))', borderColor: 'rgba(255,184,77,0.15)' }} data-testid="card-memory-pins">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(255,184,77,0.1)', border: '1px solid rgba(255,184,77,0.25)' }}>
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
        <section className="relative py-24 border-t border-white/[0.05]" style={{ background: '#2A2E3F' }}>
          <div className="relative z-10 max-w-4xl mx-auto px-6">
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6" style={{ background: 'rgba(243,126,32,0.08)', border: '1px solid rgba(243,126,32,0.2)' }}>
                <Shield className="w-4 h-4" style={{ color: '#F37E20' }} />
                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: '#F37E20' }}>Privacy Architecture</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-black text-white mb-6 tracking-tight" data-testid="text-privacy-headline">
                Privacy & Sovereignty Promise
              </h2>
              <p className="text-xl max-w-2xl mx-auto leading-relaxed" style={{ color: '#9a9bb0' }}>
                Your thoughts are not training data. Your AI is not centralized. Your system is designed to last.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-10">
              <div className="p-8 rounded-2xl border" style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.05)' }}>
                <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-6" style={{ background: 'rgba(243,126,32,0.08)', border: '1px solid rgba(243,126,32,0.2)' }}>
                  <HardDrive className="w-7 h-7" style={{ color: '#F37E20' }} />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Local-First Storage</h3>
                <p className="text-sm leading-relaxed" style={{ color: '#7a7b90' }}>
                  All entries, research, and insights stored in your browser's IndexedDB. Works offline. No cloud database. No server-side copies.
                </p>
              </div>
              <div className="p-8 rounded-2xl border" style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.05)' }}>
                <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-6" style={{ background: 'rgba(46,139,139,0.08)', border: '1px solid rgba(46,139,139,0.2)' }}>
                  <Bot className="w-7 h-7" style={{ color: '#2E8B8B' }} />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">User-Controlled AI</h3>
                <p className="text-sm leading-relaxed" style={{ color: '#7a7b90' }}>
                  AI only sees your data when you click "Think with me." Nothing is sent automatically. No background scanning. No silent learning.
                </p>
              </div>
              <div className="p-8 rounded-2xl border" style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.05)' }}>
                <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-6" style={{ background: 'rgba(255,184,77,0.08)', border: '1px solid rgba(255,184,77,0.2)' }}>
                  <Shield className="w-7 h-7" style={{ color: '#FFB84D' }} />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Decentralized Inference</h3>
                <p className="text-sm leading-relaxed" style={{ color: '#7a7b90' }}>
                  Venice AI runs decentralized inference — no data retention, no centralized training. Brave Search adds privacy-first web search with no tracking or profiling.
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-10">
              <div className="p-6 rounded-2xl border" style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.05)' }} data-testid="card-xmtp-e2e">
                <div className="flex items-center gap-3 mb-3">
                  <Lock className="w-5 h-5" style={{ color: '#2E8B8B' }} />
                  <h4 className="text-base font-bold text-white">XMTP: E2E Encrypted Messaging</h4>
                </div>
                <p className="text-sm leading-relaxed" style={{ color: '#7a7b90' }}>
                  Agent communication via XMTP uses MLS protocol with forward secrecy and post-compromise security. Messages are end-to-end encrypted by default.
                </p>
              </div>
              <div className="p-6 rounded-2xl border" style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.05)' }} data-testid="card-xmtp-quantum">
                <div className="flex items-center gap-3 mb-3">
                  <Shield className="w-5 h-5" style={{ color: '#7B6B8D' }} />
                  <h4 className="text-base font-bold text-white">Quantum-Resistant Key Exchange</h4>
                </div>
                <p className="text-sm leading-relaxed" style={{ color: '#7a7b90' }}>
                  XMTP Welcome messages use XWING KEM — protecting against "harvest now, decrypt later" attacks. Future-proof security for your communication layer.
                </p>
              </div>
            </div>

            <div className="p-8 rounded-2xl border" style={{ background: 'linear-gradient(to right, rgba(243,126,32,0.04), rgba(46,139,139,0.04))', borderColor: 'rgba(255,255,255,0.08)' }}>
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
        <section className="relative py-24 border-t border-white/[0.05]" style={{ background: '#2A2E3F' }}>
          <div className="relative z-10 max-w-4xl mx-auto px-6">
            <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
              <FAQItem question="How is DJZS different from ChatGPT or Notion AI?">
                <p>DJZS is not a chat app, not a note organizer, and not a general AI assistant.</p>
                <p className="mt-2" style={{ color: '#7a7b90' }}>ChatGPT and Notion AI are tools for responding to prompts:</p>
                <ul className="list-disc list-inside ml-2" style={{ color: '#7a7b90' }}>
                  <li>They answer questions you ask</li>
                  <li>Memory is platform-controlled or absent</li>
                  <li>Your data lives on their servers</li>
                </ul>
                <p className="mt-3" style={{ color: '#9a9bb0' }}>DJZS is a daily thinking system:</p>
                <ul className="list-disc list-inside ml-2" style={{ color: '#9a9bb0' }}>
                  <li>You write first — the AI analyzes second</li>
                  <li>Insights compound over time as your knowledge base grows</li>
                  <li>Research and daily thinking connect into one system</li>
                  <li>Everything stays on your device</li>
                </ul>
                <p className="text-white mt-3 font-semibold">DJZS makes you think better. It doesn't think for you.</p>
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

              <FAQItem question="How does the AI thinking partner work?">
                <p>The AI is not a chatbot — it's a structured thinking partner.</p>
                <p className="mt-2">When you click "Think with me," the AI:</p>
                <ul className="list-disc list-inside ml-2">
                  <li>Analyzes your current entry</li>
                  <li>Connects it to your memory pins and past entries</li>
                  <li>Generates structured output — summaries, key claims, patterns, open questions</li>
                  <li>Suggests memories worth pinning for future sessions</li>
                </ul>
                <p className="text-white mt-2 font-semibold">There is no background scanning. There is no silent learning. You control every interaction.</p>
              </FAQItem>

              <FAQItem question="What are the three zones?">
                <p>Three zones, one compounding loop:</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-3">
                  <div>
                    <p className="font-semibold mb-1" style={{ color: '#F37E20' }}>Journal Zone</p>
                    <ul className="list-disc list-inside ml-2 text-sm">
                      <li>Write daily thinking</li>
                      <li>AI extracts insights</li>
                      <li>Patterns surface over time</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-semibold mb-1" style={{ color: '#2E8B8B' }}>Research Zone</p>
                    <ul className="list-disc list-inside ml-2 text-sm">
                      <li>Save and analyze sources</li>
                      <li>Track claims and evidence</li>
                      <li>Synthesize with entries</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-semibold mb-1" style={{ color: '#7B6B8D' }}>Thinking Partner</p>
                    <ul className="list-disc list-inside ml-2 text-sm">
                      <li>Debates your points</li>
                      <li>Connects ideas</li>
                      <li>Finds patterns</li>
                    </ul>
                  </div>
                </div>
                <p className="mt-3 text-white font-semibold">Each zone feeds the others. Your thinking compounds.</p>
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
                <p className="text-white font-semibold">Sovereign thinkers who refuse to trade intelligence for convenience.</p>
                <ul className="list-disc list-inside ml-2 mt-2">
                  <li>Crypto-native builders and privacy maximalists</li>
                  <li>Founders structuring their reasoning</li>
                  <li>Researchers and strategists synthesizing complex domains</li>
                  <li>Traders tracking evolving theses</li>
                  <li>Anyone who thinks long-term</li>
                </ul>
                <p className="mt-3" style={{ color: '#7a7b90' }}>DJZS is not for casual diary-keeping, photo memories, or lifestyle journaling.</p>
                <p className="mt-2 text-white font-semibold">DJZS is cognitive infrastructure for a decentralized, post-surveillance world.</p>
              </FAQItem>
            </div>
          </div>
        </section>
      </RevealSection>

      <RevealSection>
        <section className="relative py-32 border-t border-white/[0.05]" style={{ background: '#1a1d26' }}>
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight" data-testid="text-final-cta-headline">
              Build intelligence that compounds — without giving it away.
            </h2>
            <p className="text-xl mb-12" style={{ color: '#7a7b90' }}>
              Your thoughts stay local. Your AI runs decentralized. Start thinking sovereignly.
            </p>
            <div className="flex flex-col items-center gap-4">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                <Link href="/chat">
                  <button
                    className="inline-flex items-center gap-3 rounded-2xl px-10 py-5 text-lg font-bold text-white transition-all duration-250 hover:-translate-y-1"
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

      <footer className="border-t border-white/[0.05] py-24" style={{ background: '#2A2E3F' }}>
        <div className="max-w-4xl mx-auto px-6 flex flex-col items-center text-center gap-10">
          <div className="flex flex-col items-center gap-3">
            <img src="/logo.png" alt="DJZS" className="w-16 h-16 rounded-2xl" style={{ filter: 'drop-shadow(0 0 4px rgba(243,126,32,0.2))' }} data-testid="img-logo-footer" />
            <h2 className="text-3xl font-black tracking-widest uppercase" style={{ color: '#F37E20' }}>
              DJZS
            </h2>
            <p className="text-xs font-medium uppercase tracking-[0.3em]" style={{ color: '#7a7b90' }}>
              Decentralized AI for sovereign thinking
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 md:gap-4">
            <Link href="/about" className="px-5 py-2 rounded-full text-xs font-semibold uppercase tracking-widest border transition-all hover:bg-white/[0.05] hover:border-white/20" style={{ color: '#9a9bac', borderColor: 'rgba(255,255,255,0.1)' }} data-testid="link-footer-about">
              About
            </Link>
            <Link href="/docs" className="px-5 py-2 rounded-full text-xs font-semibold uppercase tracking-widest border transition-all hover:bg-white/[0.05] hover:border-white/20" style={{ color: '#9a9bac', borderColor: 'rgba(255,255,255,0.1)' }} data-testid="link-footer-docs">
              Docs
            </Link>
            <Link href="/privacy" className="px-5 py-2 rounded-full text-xs font-semibold uppercase tracking-widest border transition-all hover:bg-white/[0.05] hover:border-white/20" style={{ color: '#9a9bac', borderColor: 'rgba(255,255,255,0.1)' }} data-testid="link-footer-privacy">
              Privacy
            </Link>
            <Link href="/security" className="px-5 py-2 rounded-full text-xs font-semibold uppercase tracking-widest border transition-all hover:bg-white/[0.05] hover:border-white/20" style={{ color: '#9a9bac', borderColor: 'rgba(255,255,255,0.1)' }} data-testid="link-footer-security">
              Security
            </Link>
            <Link href="/terms" className="px-5 py-2 rounded-full text-xs font-semibold uppercase tracking-widest border transition-all hover:bg-white/[0.05] hover:border-white/20" style={{ color: '#9a9bac', borderColor: 'rgba(255,255,255,0.1)' }} data-testid="link-footer-terms">
              Terms
            </Link>
            <Link href="/roadmap" className="px-5 py-2 rounded-full text-xs font-semibold uppercase tracking-widest border transition-all hover:bg-white/[0.05] hover:border-white/20" style={{ color: '#9a9bac', borderColor: 'rgba(255,255,255,0.1)' }} data-testid="link-footer-roadmap">
              Roadmap
            </Link>
            {isConnected && (
              <Link href="/chat" className="px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest text-white transition-all hover:opacity-90" style={{ background: '#F37E20' }} data-testid="link-footer-enter">
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
        <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden backdrop-blur-xl border-t border-white/[0.05] p-4 safe-area-inset-bottom" style={{ background: 'rgba(42,46,63,0.95)' }}>
          <div className="flex items-center gap-3 max-w-lg mx-auto">
            <Link href="/chat" className="flex-1">
              <button
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-sm font-bold text-white transition-colors min-h-[48px]"
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

function ZoneFeatureCard({
  icon,
  color,
  title,
  description,
  examplePrompt,
  href,
}: {
  icon: ReactNode;
  color: "orange" | "teal" | "purple";
  title: string;
  description: string;
  examplePrompt: string;
  href: string;
}) {
  return (
    <Link href={href}>
      <motion.div
        whileHover={{ y: -4, scale: 1.01 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="h-full p-10 rounded-2xl cursor-pointer group transition-colors duration-250"
        style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
        data-testid={`card-zone-${color}`}
      >
        <div className="w-16 h-16 rounded-xl flex items-center justify-center mb-8 transition-colors" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
          {icon}
        </div>
        <h3 className="text-2xl font-bold text-white mb-4">{title}</h3>
        <p className="text-base leading-relaxed mb-8" style={{ color: '#7a7b90' }}>{description}</p>
        <div className="px-5 py-4 rounded-lg" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
          <p className="text-sm font-mono italic" style={{ color: '#555668' }}>"{examplePrompt}"</p>
        </div>
      </motion.div>
    </Link>
  );
}

function FAQItem({ question, children }: { question: string; children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="py-8 group" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
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
