import { useState, type ReactNode } from "react";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { HardDrive, Shield, Bot, ArrowRight, BookOpen, Search, Brain, ChevronDown, Plus, PenLine, MessageCircle, ListChecks, Microscope, Lightbulb, Rocket, TrendingUp, Layers, Target, Zap, GitBranch, BarChart3, Clock, Eye, CheckCircle, XCircle, Sun, Moon, Crosshair, Briefcase, Feather, Video } from "lucide-react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { pageContainer, fadeUp } from "@/lib/animations";
import { RevealSection } from "@/components/hero";
import { Helmet } from "react-helmet";

export default function Home() {
  const { isConnected } = useAccount();

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

      <header className="sticky top-0 z-50 backdrop-blur-xl border-b border-white/[0.05]" style={{ background: 'rgba(42,46,63,0.85)' }}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/">
            <span className="flex items-center gap-2" data-testid="link-home-logo">
              <img src="/logo.png" alt="DJZS" className="w-8 h-8 rounded-lg transition-transform hover:scale-105" style={{ filter: 'drop-shadow(0 0 2px rgba(0,0,0,0.3))' }} data-testid="img-logo-header" />
              <span className="text-xl font-black tracking-widest uppercase" style={{ color: '#F37E20' }}>DJZS</span>
            </span>
          </Link>
          <div className="flex items-center gap-4">
            {isConnected ? (
              <Link href="/chat">
                <button
                  className="inline-flex items-center gap-2 rounded-xl px-6 py-2.5 text-base font-semibold text-white transition-colors"
                  style={{ background: '#F37E20', boxShadow: '0 4px 14px rgba(243,126,32,0.25)' }}
                  data-testid="button-header-enter"
                >
                  Enter System
                  <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
            ) : (
              <ConnectButton showBalance={false} />
            )}
          </div>
        </div>
      </header>

      <Helmet>
        <title>DJZS - Your Daily Thinking System | Compound Your Intelligence</title>
        <meta name="description" content="A cognitive operating system that turns daily thinking into structured insight. AI thinking partner, research synthesis, and compounding intelligence — all local-first." />
        <meta property="og:title" content="DJZS - Your Daily Thinking System" />
        <meta property="og:description" content="Turn daily thinking into structured insight. AI thinking partner that connects ideas, debates points, and finds patterns. Local-first, private by design." />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="DJZS - Sharpen Your Thinking Daily" />
        <meta name="twitter:description" content="A daily thinking system that compounds your intelligence. Not a journal — a cognitive operating system for builders." />
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
              <TrendingUp className="w-3.5 h-3.5" />
              Cognitive Infrastructure for Builders
            </span>
          </motion.div>

          <motion.h1
            variants={fadeUp}
            className="text-6xl md:text-8xl lg:text-9xl font-black text-white tracking-tighter leading-[1] mb-8"
          >
            Sharpen your thinking daily.
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="text-2xl md:text-3xl max-w-4xl mx-auto leading-tight mb-12 font-medium"
            style={{ color: '#9a9bb0' }}
          >
            A daily thinking system that compounds your intelligence. Write, research, and let AI connect the dots you'd miss.
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
              No account needed. Your thinking stays on your device — private and compounding.
            </p>
          </motion.div>

          {!isConnected && (
            <motion.div variants={fadeUp} className="mb-12">
              <div className="scale-125 inline-block">
                <ConnectButton showBalance={false} />
              </div>
            </motion.div>
          )}

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
              <span>AI thinking partner</span>
            </div>
            <div className="flex items-center gap-3" data-testid="text-trust-private">
              <TrendingUp className="w-5 h-5" style={{ color: '#FFB84D' }} />
              <span>Intelligence compounds</span>
            </div>
          </motion.div>
        </div>
      </motion.section>

      <RevealSection>
        <section id="how-it-works" className="relative py-24 border-t border-white/[0.05]" style={{ background: '#2A2E3F' }}>
          <div className="max-w-4xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight" data-testid="text-how-it-works-headline">
                The Thinking Loop
              </h2>
              <p className="text-xl max-w-2xl mx-auto" style={{ color: '#7a7b90' }}>
                Write. Analyze. Connect. Your intelligence compounds with every session.
              </p>
            </div>

            <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-0">
              <div className="flex flex-col items-center text-center max-w-[220px]" data-testid="step-write">
                <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-5" style={{ background: 'rgba(243,126,32,0.1)', border: '1px solid rgba(243,126,32,0.25)' }}>
                  <PenLine className="w-9 h-9" style={{ color: '#F37E20' }} />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">1. Think in Writing</h3>
                <p className="text-sm" style={{ color: '#7a7b90' }}>Capture your raw thinking — ideas, analysis, research notes, strategic questions.</p>
              </div>

              <div className="hidden md:flex items-center px-4">
                <ArrowRight className="w-8 h-8" style={{ color: '#555668' }} />
              </div>
              <div className="md:hidden py-2">
                <ChevronDown className="w-6 h-6" style={{ color: '#555668' }} />
              </div>

              <div className="flex flex-col items-center text-center max-w-[220px]" data-testid="step-ask-ai">
                <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-5" style={{ background: 'rgba(46,139,139,0.1)', border: '1px solid rgba(46,139,139,0.25)' }}>
                  <GitBranch className="w-9 h-9" style={{ color: '#2E8B8B' }} />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">2. AI Connects</h3>
                <p className="text-sm" style={{ color: '#7a7b90' }}>Your thinking partner analyzes, connects to past entries, and surfaces patterns you'd miss.</p>
              </div>

              <div className="hidden md:flex items-center px-4">
                <ArrowRight className="w-8 h-8" style={{ color: '#555668' }} />
              </div>
              <div className="md:hidden py-2">
                <ChevronDown className="w-6 h-6" style={{ color: '#555668' }} />
              </div>

              <div className="flex flex-col items-center text-center max-w-[220px]" data-testid="step-get-insights">
                <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-5" style={{ background: 'rgba(255,184,77,0.1)', border: '1px solid rgba(255,184,77,0.25)' }}>
                  <TrendingUp className="w-9 h-9" style={{ color: '#FFB84D' }} />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">3. Insights Compound</h3>
                <p className="text-sm" style={{ color: '#7a7b90' }}>Structured insights build on each other. Your knowledge base grows smarter over time.</p>
              </div>
            </div>
          </div>
        </section>
      </RevealSection>

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
                href={isConnected ? "/chat" : "/chat"}
              />
              <ZoneFeatureCard
                icon={<Search className="w-7 h-7" style={{ color: '#2E8B8B' }} />}
                color="teal"
                title="Research Zone"
                description="Save articles, links, and findings. AI synthesizes research with your daily entries to build a structured knowledge base."
                examplePrompt="This paper contradicts what I wrote about last Tuesday..."
                href={isConnected ? "/chat?zone=research" : "/chat"}
              />
              <ZoneFeatureCard
                icon={<Brain className="w-7 h-7" style={{ color: '#7B6B8D' }} />}
                color="purple"
                title="Thinking Partner"
                description="One AI agent that connects your ideas, debates your points, and finds patterns across everything you've written and researched."
                examplePrompt="What patterns do you see in my thinking about this market?"
                href={isConnected ? "/chat" : "/chat"}
              />
            </div>
          </div>
        </section>
      </RevealSection>

      <RevealSection>
        <section className="relative py-32 border-t border-white/[0.05]" style={{ background: '#2A2E3F' }}>
          <div className="max-w-5xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight" data-testid="text-stability-headline">
                Not Another Note App
              </h2>
              <p className="text-xl max-w-3xl mx-auto" style={{ color: '#7a7b90' }}>
                The competition isn't journaling apps — it's scattered notes, browser bookmarks, and unstructured thinking.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <StabilityCard
                icon={<TrendingUp className="w-6 h-6" style={{ color: '#F37E20' }} />}
                title="Compounding, Not Linear"
                description="Traditional tools accumulate. DJZS compounds — every entry connects to past thinking, building a smarter knowledge base."
              />
              <StabilityCard
                icon={<Brain className="w-6 h-6" style={{ color: '#2E8B8B' }} />}
                title="Thinking Partner, Not Chatbot"
                description="The AI doesn't just respond. It debates your points, finds patterns, and connects ideas across your thinking and research."
              />
              <StabilityCard
                icon={<HardDrive className="w-6 h-6" style={{ color: '#FFB84D' }} />}
                title="Your Data, Your Device"
                description="Local-first by design. Your thinking never leaves your device unless you explicitly send it to AI. No cloud, no lock-in."
              />
            </div>
          </div>
        </section>
      </RevealSection>

      <RevealSection>
        <section className="relative py-28 border-t border-white/[0.05]" style={{ background: '#1a1d26' }}>
          <div className="max-w-5xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight" data-testid="text-who-headline">
                Built for Systems Thinkers
              </h2>
              <p className="text-xl max-w-2xl mx-auto" style={{ color: '#7a7b90' }}>
                DJZS is for people who want cognitive leverage — not a prettier diary.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-8 rounded-2xl border transition-all hover:border-white/10" style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.05)' }} data-testid="card-archetype-founder">
                <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-6" style={{ background: 'rgba(243,126,32,0.1)', border: '1px solid rgba(243,126,32,0.25)' }}>
                  <Rocket className="w-7 h-7" style={{ color: '#F37E20' }} />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Builders & Founders</h3>
                <p className="text-base leading-relaxed" style={{ color: '#9a9bb0' }}>
                  Clarify product vision, think through strategic decisions, and structure your reasoning. Build conviction, not just lists.
                </p>
              </div>
              <div className="p-8 rounded-2xl border transition-all hover:border-white/10" style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.05)' }} data-testid="card-archetype-researcher">
                <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-6" style={{ background: 'rgba(46,139,139,0.1)', border: '1px solid rgba(46,139,139,0.25)' }}>
                  <Microscope className="w-7 h-7" style={{ color: '#2E8B8B' }} />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Researchers & Analysts</h3>
                <p className="text-base leading-relaxed" style={{ color: '#9a9bb0' }}>
                  Synthesize dozens of sources into a coherent thesis. Track claims, evidence, and contradictions. Connect research to your own thinking.
                </p>
              </div>
              <div className="p-8 rounded-2xl border transition-all hover:border-white/10" style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.05)' }} data-testid="card-archetype-thinker">
                <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-6" style={{ background: 'rgba(255,184,77,0.1)', border: '1px solid rgba(255,184,77,0.25)' }}>
                  <Target className="w-7 h-7" style={{ color: '#FFB84D' }} />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Technical Thinkers</h3>
                <p className="text-base leading-relaxed" style={{ color: '#9a9bb0' }}>
                  Crypto analysts, engineers, anyone who thinks in systems. DJZS gives you cognitive leverage — structured insight from daily thinking.
                </p>
              </div>
            </div>
          </div>
        </section>
      </RevealSection>

      <RevealSection>
        <section className="relative py-32 border-t border-white/[0.05]" style={{ background: '#2A2E3F' }}>
          <div className="max-w-5xl mx-auto px-6">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6" style={{ background: 'rgba(255,184,77,0.08)', border: '1px solid rgba(255,184,77,0.2)' }}>
                <BarChart3 className="w-4 h-4" style={{ color: '#FFB84D' }} />
                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: '#FFB84D' }}>For Traders</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight" data-testid="text-traders-headline">
                Most tools give you charts. We give you clarity.
              </h2>
              <p className="text-xl max-w-3xl mx-auto" style={{ color: '#7a7b90' }}>
                DJZS turns reactive trading into systematic thinking. Track your thesis evolution, detect your biases, and compound your market intelligence.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
              <div className="p-8 rounded-2xl border transition-all hover:border-orange-500/20" style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.05)' }} data-testid="card-trader-research">
                <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-6" style={{ background: 'rgba(46,139,139,0.1)', border: '1px solid rgba(46,139,139,0.25)' }}>
                  <Search className="w-7 h-7" style={{ color: '#2E8B8B' }} />
                </div>
                <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#2E8B8B' }}>Research Zone</p>
                <h3 className="text-xl font-bold text-white mb-3">Market Intelligence</h3>
                <ul className="space-y-2.5">
                  <li className="flex items-start gap-2.5 text-sm" style={{ color: '#9a9bb0' }}>
                    <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#2E8B8B' }} />
                    Save tokenomics, on-chain data, market analysis
                  </li>
                  <li className="flex items-start gap-2.5 text-sm" style={{ color: '#9a9bb0' }}>
                    <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#2E8B8B' }} />
                    AI synthesizes across all your research
                  </li>
                  <li className="flex items-start gap-2.5 text-sm" style={{ color: '#9a9bb0' }}>
                    <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#2E8B8B' }} />
                    Connects market events to your trading thesis
                  </li>
                </ul>
              </div>

              <div className="p-8 rounded-2xl border transition-all hover:border-orange-500/20" style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.05)' }} data-testid="card-trader-journal">
                <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-6" style={{ background: 'rgba(243,126,32,0.1)', border: '1px solid rgba(243,126,32,0.25)' }}>
                  <PenLine className="w-7 h-7" style={{ color: '#F37E20' }} />
                </div>
                <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#F37E20' }}>Journal Zone</p>
                <h3 className="text-xl font-bold text-white mb-3">Decision Log</h3>
                <ul className="space-y-2.5">
                  <li className="flex items-start gap-2.5 text-sm" style={{ color: '#9a9bb0' }}>
                    <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#F37E20' }} />
                    Document trade rationale and outcomes
                  </li>
                  <li className="flex items-start gap-2.5 text-sm" style={{ color: '#9a9bb0' }}>
                    <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#F37E20' }} />
                    AI tracks your reasoning quality over time
                  </li>
                  <li className="flex items-start gap-2.5 text-sm" style={{ color: '#9a9bb0' }}>
                    <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#F37E20' }} />
                    Identifies cognitive biases in your patterns
                  </li>
                </ul>
              </div>

              <div className="p-8 rounded-2xl border transition-all hover:border-orange-500/20" style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.05)' }} data-testid="card-trader-partner">
                <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-6" style={{ background: 'rgba(123,107,141,0.1)', border: '1px solid rgba(123,107,141,0.25)' }}>
                  <Brain className="w-7 h-7" style={{ color: '#7B6B8D' }} />
                </div>
                <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#7B6B8D' }}>Thinking Partner</p>
                <h3 className="text-xl font-bold text-white mb-3">Trading Coach</h3>
                <ul className="space-y-2.5">
                  <li className="flex items-start gap-2.5 text-sm" style={{ color: '#9a9bb0' }}>
                    <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#7B6B8D' }} />
                    Debates your trade thesis before execution
                  </li>
                  <li className="flex items-start gap-2.5 text-sm" style={{ color: '#9a9bb0' }}>
                    <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#7B6B8D' }} />
                    Connects current ideas to past wins/losses
                  </li>
                  <li className="flex items-start gap-2.5 text-sm" style={{ color: '#9a9bb0' }}>
                    <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#7B6B8D' }} />
                    Asks the questions you forget to ask yourself
                  </li>
                </ul>
              </div>
            </div>

            <div className="mb-20">
              <h3 className="text-2xl font-bold text-white text-center mb-8" data-testid="text-comparison-headline">DJZS vs. Traditional Trading Tools</h3>
              <div className="overflow-x-auto rounded-2xl border" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                <table className="w-full text-sm" data-testid="table-comparison">
                  <thead>
                    <tr style={{ background: 'rgba(255,255,255,0.03)' }}>
                      <th className="text-left px-6 py-4 font-bold text-white">Feature</th>
                      <th className="text-center px-6 py-4 font-bold" style={{ color: '#7a7b90' }}>TradingView</th>
                      <th className="text-center px-6 py-4 font-bold" style={{ color: '#F37E20' }}>DJZS</th>
                    </tr>
                  </thead>
                  <tbody style={{ color: '#9a9bb0' }}>
                    <tr style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                      <td className="px-6 py-3.5">Chart Analysis</td>
                      <td className="px-6 py-3.5 text-center"><CheckCircle className="w-4 h-4 inline" style={{ color: '#2E8B8B' }} /> Best in class</td>
                      <td className="px-6 py-3.5 text-center" style={{ color: '#555668' }}>Not the focus</td>
                    </tr>
                    <tr style={{ borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}>
                      <td className="px-6 py-3.5">Decision Tracking</td>
                      <td className="px-6 py-3.5 text-center" style={{ color: '#555668' }}>Basic</td>
                      <td className="px-6 py-3.5 text-center"><CheckCircle className="w-4 h-4 inline" style={{ color: '#F37E20' }} /> Core feature</td>
                    </tr>
                    <tr style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                      <td className="px-6 py-3.5">Thesis Evolution</td>
                      <td className="px-6 py-3.5 text-center"><XCircle className="w-4 h-4 inline" style={{ color: '#555668' }} /></td>
                      <td className="px-6 py-3.5 text-center"><CheckCircle className="w-4 h-4 inline" style={{ color: '#F37E20' }} /> AI-powered</td>
                    </tr>
                    <tr style={{ borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}>
                      <td className="px-6 py-3.5">Bias Detection</td>
                      <td className="px-6 py-3.5 text-center"><XCircle className="w-4 h-4 inline" style={{ color: '#555668' }} /></td>
                      <td className="px-6 py-3.5 text-center"><CheckCircle className="w-4 h-4 inline" style={{ color: '#F37E20' }} /> Automated</td>
                    </tr>
                    <tr style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                      <td className="px-6 py-3.5">Market Synthesis</td>
                      <td className="px-6 py-3.5 text-center" style={{ color: '#555668' }}>Siloed data</td>
                      <td className="px-6 py-3.5 text-center"><CheckCircle className="w-4 h-4 inline" style={{ color: '#F37E20' }} /> Connected intelligence</td>
                    </tr>
                    <tr style={{ borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}>
                      <td className="px-6 py-3.5">Local-First</td>
                      <td className="px-6 py-3.5 text-center" style={{ color: '#555668' }}>Cloud-based</td>
                      <td className="px-6 py-3.5 text-center"><CheckCircle className="w-4 h-4 inline" style={{ color: '#F37E20' }} /> Your data, your edge</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mb-16">
              <h3 className="text-2xl font-bold text-white text-center mb-10" data-testid="text-routine-headline">The Trader's Daily Routine</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="relative p-8 rounded-2xl border" style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.05)' }} data-testid="card-routine-morning">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'rgba(255,184,77,0.1)', border: '1px solid rgba(255,184,77,0.25)' }}>
                      <Sun className="w-5 h-5" style={{ color: '#FFB84D' }} />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-white">Morning Prep</h4>
                      <p className="text-xs" style={{ color: '#555668' }}>15 min</p>
                    </div>
                  </div>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2 text-sm" style={{ color: '#9a9bb0' }}>
                      <span style={{ color: '#FFB84D' }}>-</span> Write your market outlook
                    </li>
                    <li className="flex items-start gap-2 text-sm" style={{ color: '#9a9bb0' }}>
                      <span style={{ color: '#FFB84D' }}>-</span> AI connects to existing research
                    </li>
                    <li className="flex items-start gap-2 text-sm" style={{ color: '#9a9bb0' }}>
                      <span style={{ color: '#FFB84D' }}>-</span> Surfaces relevant patterns from history
                    </li>
                  </ul>
                </div>

                <div className="relative p-8 rounded-2xl border" style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.05)' }} data-testid="card-routine-trade">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'rgba(243,126,32,0.1)', border: '1px solid rgba(243,126,32,0.25)' }}>
                      <Crosshair className="w-5 h-5" style={{ color: '#F37E20' }} />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-white">Trade Documentation</h4>
                      <p className="text-xs" style={{ color: '#555668' }}>5 min</p>
                    </div>
                  </div>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2 text-sm" style={{ color: '#9a9bb0' }}>
                      <span style={{ color: '#F37E20' }}>-</span> Log entry/exit rationale
                    </li>
                    <li className="flex items-start gap-2 text-sm" style={{ color: '#9a9bb0' }}>
                      <span style={{ color: '#F37E20' }}>-</span> AI flags inconsistencies with your thesis
                    </li>
                    <li className="flex items-start gap-2 text-sm" style={{ color: '#9a9bb0' }}>
                      <span style={{ color: '#F37E20' }}>-</span> Tracks decision quality metrics
                    </li>
                  </ul>
                </div>

                <div className="relative p-8 rounded-2xl border" style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.05)' }} data-testid="card-routine-evening">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'rgba(46,139,139,0.1)', border: '1px solid rgba(46,139,139,0.25)' }}>
                      <Moon className="w-5 h-5" style={{ color: '#2E8B8B' }} />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-white">Evening Review</h4>
                      <p className="text-xs" style={{ color: '#555668' }}>10 min</p>
                    </div>
                  </div>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2 text-sm" style={{ color: '#9a9bb0' }}>
                      <span style={{ color: '#2E8B8B' }}>-</span> AI synthesizes day's market action
                    </li>
                    <li className="flex items-start gap-2 text-sm" style={{ color: '#9a9bb0' }}>
                      <span style={{ color: '#2E8B8B' }}>-</span> Identifies what you got right/wrong
                    </li>
                    <li className="flex items-start gap-2 text-sm" style={{ color: '#9a9bb0' }}>
                      <span style={{ color: '#2E8B8B' }}>-</span> Updates your cognitive bias profile
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="p-8 rounded-2xl border text-center" style={{ background: 'linear-gradient(135deg, rgba(243,126,32,0.04), rgba(255,184,77,0.04))', borderColor: 'rgba(255,184,77,0.15)' }} data-testid="card-trader-cta">
              <p className="text-lg font-bold text-white mb-2">DJZS fixes the thinking, not the trading.</p>
              <p className="text-sm mb-6" style={{ color: '#7a7b90' }}>The trading improvement follows naturally.</p>
              <Link href="/chat">
                <button
                  className="inline-flex items-center gap-3 rounded-2xl px-8 py-4 text-base font-bold text-white transition-all duration-250 hover:-translate-y-1"
                  style={{ background: '#F37E20', boxShadow: '0 6px 24px rgba(243,126,32,0.3)' }}
                  data-testid="button-start-trading-smarter"
                >
                  Start Trading Smarter
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
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6" style={{ background: 'rgba(243,126,32,0.08)', border: '1px solid rgba(243,126,32,0.2)' }}>
                <Briefcase className="w-4 h-4" style={{ color: '#F37E20' }} />
                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: '#F37E20' }}>For Founders</span>
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
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6" style={{ background: 'rgba(46,139,139,0.08)', border: '1px solid rgba(46,139,139,0.2)' }}>
                <Feather className="w-4 h-4" style={{ color: '#2E8B8B' }} />
                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: '#2E8B8B' }}>For Writers</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight" data-testid="text-writers-headline">
                Write to think. Think to write better.
              </h2>
              <p className="text-xl max-w-3xl mx-auto" style={{ color: '#7a7b90' }}>
                Great writing comes from clear thinking. DJZS helps you develop ideas across sessions, spot recurring themes, and build a personal knowledge system that makes every draft sharper.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
              <div className="p-8 rounded-2xl border transition-all hover:border-teal-500/20" style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.05)' }} data-testid="card-writer-research">
                <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-6" style={{ background: 'rgba(46,139,139,0.1)', border: '1px solid rgba(46,139,139,0.25)' }}>
                  <Search className="w-7 h-7" style={{ color: '#2E8B8B' }} />
                </div>
                <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#2E8B8B' }}>Research Zone</p>
                <h3 className="text-xl font-bold text-white mb-3">Source Library</h3>
                <ul className="space-y-2.5">
                  <li className="flex items-start gap-2.5 text-sm" style={{ color: '#9a9bb0' }}>
                    <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#2E8B8B' }} />
                    Save articles, quotes, references in organized dossiers
                  </li>
                  <li className="flex items-start gap-2.5 text-sm" style={{ color: '#9a9bb0' }}>
                    <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#2E8B8B' }} />
                    AI finds connections between sources you'd miss
                  </li>
                  <li className="flex items-start gap-2.5 text-sm" style={{ color: '#9a9bb0' }}>
                    <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#2E8B8B' }} />
                    Cross-references research with your past writing
                  </li>
                </ul>
              </div>

              <div className="p-8 rounded-2xl border transition-all hover:border-orange-500/20" style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.05)' }} data-testid="card-writer-journal">
                <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-6" style={{ background: 'rgba(243,126,32,0.1)', border: '1px solid rgba(243,126,32,0.25)' }}>
                  <PenLine className="w-7 h-7" style={{ color: '#F37E20' }} />
                </div>
                <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#F37E20' }}>Journal Zone</p>
                <h3 className="text-xl font-bold text-white mb-3">Idea Development</h3>
                <ul className="space-y-2.5">
                  <li className="flex items-start gap-2.5 text-sm" style={{ color: '#9a9bb0' }}>
                    <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#F37E20' }} />
                    Develop raw ideas across multiple sessions
                  </li>
                  <li className="flex items-start gap-2.5 text-sm" style={{ color: '#9a9bb0' }}>
                    <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#F37E20' }} />
                    AI surfaces recurring themes in your thinking
                  </li>
                  <li className="flex items-start gap-2.5 text-sm" style={{ color: '#9a9bb0' }}>
                    <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#F37E20' }} />
                    Tracks how your arguments evolve over time
                  </li>
                </ul>
              </div>

              <div className="p-8 rounded-2xl border transition-all hover:border-purple-500/20" style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.05)' }} data-testid="card-writer-partner">
                <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-6" style={{ background: 'rgba(123,107,141,0.1)', border: '1px solid rgba(123,107,141,0.25)' }}>
                  <Brain className="w-7 h-7" style={{ color: '#7B6B8D' }} />
                </div>
                <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#7B6B8D' }}>Thinking Partner</p>
                <h3 className="text-xl font-bold text-white mb-3">Editor's Eye</h3>
                <ul className="space-y-2.5">
                  <li className="flex items-start gap-2.5 text-sm" style={{ color: '#9a9bb0' }}>
                    <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#7B6B8D' }} />
                    Challenges weak arguments before your readers do
                  </li>
                  <li className="flex items-start gap-2.5 text-sm" style={{ color: '#9a9bb0' }}>
                    <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#7B6B8D' }} />
                    Finds gaps and contradictions in your reasoning
                  </li>
                  <li className="flex items-start gap-2.5 text-sm" style={{ color: '#9a9bb0' }}>
                    <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#7B6B8D' }} />
                    Suggests angles you haven't considered
                  </li>
                </ul>
              </div>
            </div>

            <div className="p-8 rounded-2xl border text-center" style={{ background: 'linear-gradient(135deg, rgba(46,139,139,0.04), rgba(123,107,141,0.04))', borderColor: 'rgba(46,139,139,0.15)' }} data-testid="card-writer-cta">
              <p className="text-lg font-bold text-white mb-2">Your best ideas aren't lost in scattered notes anymore.</p>
              <p className="text-sm mb-6" style={{ color: '#7a7b90' }}>Every thought connected. Every theme tracked. Every draft informed by your full thinking history.</p>
              <Link href="/chat">
                <button
                  className="inline-flex items-center gap-3 rounded-2xl px-8 py-4 text-base font-bold text-white transition-all duration-250 hover:-translate-y-1"
                  style={{ background: '#2E8B8B', boxShadow: '0 6px 24px rgba(46,139,139,0.3)' }}
                  data-testid="button-start-writer-thinking"
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
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6" style={{ background: 'rgba(123,107,141,0.08)', border: '1px solid rgba(123,107,141,0.2)' }}>
                <Video className="w-4 h-4" style={{ color: '#7B6B8D' }} />
                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: '#7B6B8D' }}>For Content Creators</span>
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
                  style={{ background: '#7B6B8D', boxShadow: '0 6px 24px rgba(123,107,141,0.3)' }}
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
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6" style={{ background: 'rgba(46,139,139,0.08)', border: '1px solid rgba(46,139,139,0.2)' }}>
                <Zap className="w-4 h-4" style={{ color: '#2E8B8B' }} />
                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: '#2E8B8B' }}>Why DJZS is Different</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight" data-testid="text-different-headline">
                You're the architect. The AI is just a tool.
              </h2>
              <p className="text-xl max-w-3xl mx-auto" style={{ color: '#7a7b90' }}>
                With other apps, you're the product. With DJZS, your data is your foundation and AI is the instrument you use to build on it.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="p-8 rounded-2xl border transition-all hover:border-orange-500/15 group" style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.05)' }} data-testid="card-pillar-privacy">
                <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-6" style={{ background: 'rgba(243,126,32,0.1)', border: '1px solid rgba(243,126,32,0.25)' }}>
                  <Shield className="w-7 h-7" style={{ color: '#F37E20' }} />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Radical Privacy</h3>
                <p className="text-base leading-relaxed mb-4" style={{ color: '#9a9bb0' }}>
                  Your data stays on your device. The AI only analyzes what you explicitly send — it doesn't build a profile, track you, or retain your data. You're the administrator.
                </p>
                <p className="text-sm italic" style={{ color: '#555668' }}>
                  "A safe space for my thoughts. Complete honesty without worrying about who's reading my data."
                </p>
              </div>

              <div className="p-8 rounded-2xl border transition-all hover:border-teal-500/15 group" style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.05)' }} data-testid="card-pillar-longevity">
                <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-6" style={{ background: 'rgba(46,139,139,0.1)', border: '1px solid rgba(46,139,139,0.25)' }}>
                  <Layers className="w-7 h-7" style={{ color: '#2E8B8B' }} />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Built to Last</h3>
                <p className="text-base leading-relaxed mb-4" style={{ color: '#9a9bb0' }}>
                  Open architecture means you can swap parts without losing data. It's a tool, not a service — no acquisitions, no shutdowns, no hostage situations with your digital brain.
                </p>
                <p className="text-sm italic" style={{ color: '#555668' }}>
                  "I can trust this system for the long run. My investment in organizing my thoughts is safe."
                </p>
              </div>

              <div className="p-8 rounded-2xl border transition-all hover:border-purple-500/15 group" style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.05)' }} data-testid="card-pillar-ai">
                <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-6" style={{ background: 'rgba(123,107,141,0.1)', border: '1px solid rgba(123,107,141,0.25)' }}>
                  <Brain className="w-7 h-7" style={{ color: '#7B6B8D' }} />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">AI That Works for You</h3>
                <p className="text-base leading-relaxed mb-4" style={{ color: '#9a9bb0' }}>
                  Context-aware zones give the AI specific focus. Memory Pins are explicit — you decide what carries forward. Structured output, not conversational fluff.
                </p>
                <p className="text-sm italic" style={{ color: '#555668' }}>
                  "A specialized assistant that understands my task, not a generic chatbot I have to manage."
                </p>
              </div>

              <div className="p-8 rounded-2xl border transition-all hover:border-yellow-500/15 group" style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.05)' }} data-testid="card-pillar-calm">
                <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-6" style={{ background: 'rgba(255,184,77,0.1)', border: '1px solid rgba(255,184,77,0.25)' }}>
                  <Eye className="w-7 h-7" style={{ color: '#FFB84D' }} />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Calm, Focused Experience</h3>
                <p className="text-base leading-relaxed mb-4" style={{ color: '#9a9bb0' }}>
                  No feeds, no notifications, no noise. DJZS is for entering, not scrolling. No timeline to check, no engagement loops. Built for deep work, not shallow validation.
                </p>
                <p className="text-sm italic" style={{ color: '#555668' }}>
                  "A quiet, focused space where I can do my best work without distractions."
                </p>
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
                Your Thinking Stays Yours
              </h2>
              <p className="text-xl max-w-2xl mx-auto leading-relaxed" style={{ color: '#9a9bb0' }}>
                Your ideas are stored locally on your device. AI analysis only happens when you explicitly request it.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-10">
              <div className="p-8 rounded-2xl border" style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.05)' }}>
                <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-6" style={{ background: 'rgba(243,126,32,0.08)', border: '1px solid rgba(243,126,32,0.2)' }}>
                  <HardDrive className="w-7 h-7" style={{ color: '#F37E20' }} />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Local-First Storage</h3>
                <p className="text-sm leading-relaxed" style={{ color: '#7a7b90' }}>
                  All entries, research, and insights are stored in your browser's IndexedDB. Works offline. No cloud database.
                </p>
              </div>
              <div className="p-8 rounded-2xl border" style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.05)' }}>
                <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-6" style={{ background: 'rgba(46,139,139,0.08)', border: '1px solid rgba(46,139,139,0.2)' }}>
                  <Bot className="w-7 h-7" style={{ color: '#2E8B8B' }} />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">User-Controlled AI</h3>
                <p className="text-sm leading-relaxed" style={{ color: '#7a7b90' }}>
                  AI only sees your data when you click "Think with me." Nothing is sent automatically. You control what the AI receives.
                </p>
              </div>
              <div className="p-8 rounded-2xl border" style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.05)' }}>
                <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-6" style={{ background: 'rgba(255,184,77,0.08)', border: '1px solid rgba(255,184,77,0.2)' }}>
                  <Shield className="w-7 h-7" style={{ color: '#FFB84D' }} />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Privacy-Focused Providers</h3>
                <p className="text-sm leading-relaxed" style={{ color: '#7a7b90' }}>
                  Powered by Venice AI (no data retention) and Brave Search (no tracking). Your queries are not stored or used for training.
                </p>
              </div>
            </div>

            <div className="p-8 rounded-2xl border" style={{ background: 'linear-gradient(to right, rgba(243,126,32,0.04), rgba(46,139,139,0.04))', borderColor: 'rgba(255,255,255,0.08)' }}>
              <p className="text-center text-lg leading-relaxed" style={{ color: '#b0b1c0' }}>
                When you request AI insights, only the text you select is sent to privacy-focused AI providers. The response is saved locally on your device. We do not permanently store your data on any server.
              </p>
              <p className="text-center text-[10px] mt-4 uppercase tracking-wider" style={{ color: '#555668' }}>
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
                <p className="mt-2" style={{ color: '#666778' }}>ChatGPT and Notion AI are tools for responding to prompts:</p>
                <ul className="list-disc list-inside ml-2" style={{ color: '#666778' }}>
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
                <p className="text-white font-semibold">Systems thinkers who want cognitive leverage.</p>
                <ul className="list-disc list-inside ml-2 mt-2">
                  <li>Builders and founders structuring their reasoning</li>
                  <li>Researchers synthesizing complex domains</li>
                  <li>Crypto analysts tracking evolving narratives</li>
                  <li>Anyone who thinks in systems, not just emotions</li>
                </ul>
                <p className="mt-3" style={{ color: '#666778' }}>DJZS is not for casual diary-keeping, photo memories, or lifestyle journaling.</p>
                <p className="mt-2 text-white font-semibold">DJZS is a tool for sharper thinking — not a prettier notebook.</p>
              </FAQItem>
            </div>
          </div>
        </section>
      </RevealSection>

      <RevealSection>
        <section className="relative py-32 border-t border-white/[0.05]" style={{ background: '#1a1d26' }}>
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight" data-testid="text-final-cta-headline">
              Think more clearly starting today.
            </h2>
            <p className="text-xl mb-12" style={{ color: '#7a7b90' }}>
              Your first session takes two minutes. Your thinking compounds from there.
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
                {!isConnected && (
                  <div className="scale-125">
                    <ConnectButton showBalance={false} />
                  </div>
                )}
              </div>
              <p className="text-sm" style={{ color: '#7a7b90' }} data-testid="text-final-cta-microcopy">
                No account needed. Your thinking stays on your device — private and compounding.
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
              Your daily thinking system
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

      {!isConnected && (
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
            <div className="flex-1">
              <ConnectButton />
            </div>
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

function StabilityCard({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="p-10 rounded-2xl transition-colors duration-250"
      style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
      data-testid={`card-stability-${title.toLowerCase().replace(/\s+/g, '-')}`}
    >
      <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-6" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
        {icon}
      </div>
      <h3 className="text-xl font-bold text-white mb-4">{title}</h3>
      <p className="text-base leading-relaxed" style={{ color: '#7a7b90' }}>{description}</p>
    </motion.div>
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
