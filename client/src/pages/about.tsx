import { motion } from "framer-motion";
import { Link } from "wouter";
import { ArrowLeft, Shield, HardDrive, Bot, Lock, Globe, BookOpen, Search, Sparkles, Brain, Pin, Video, Headphones, MessageSquare, AlertTriangle, RefreshCw, Briefcase, BarChart3, Palette, Zap, Download, Wallet, ChevronRight, FlaskConical, User, Receipt, PenLine, Activity, KeyRound, ShieldCheck, HelpCircle } from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

export default function About() {
  return (
    <div className="min-h-screen text-gray-400 font-medium selection:bg-orange-500/30" style={{ background: '#0F1115' }}>
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b border-white/[0.06]" style={{ background: 'rgba(15,17,21,0.8)' }}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-white hover:text-orange-400 transition-colors group" data-testid="link-back-home">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-xs font-black uppercase tracking-[0.2em]">Back to System</span>
          </Link>
          <div className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">
            DJZS / ABOUT
          </div>
        </div>
      </nav>
      <main className="max-w-3xl mx-auto px-6 pt-32 pb-20">
        <motion.div {...fadeUp}>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tighter uppercase" data-testid="text-about-title">About DJ-Z-S</h1>
          <p className="text-lg text-white/90 mb-3 leading-relaxed font-bold">The autonomous auditing system for the A2A economy. DJZS destroys the weak parts.</p>
          <p className="text-sm text-gray-400 mb-12 leading-relaxed">DJ-Z-S is an autonomous AI auditing system operating in the Agent-to-Agent (A2A) economy, serving <strong className="text-white">human founders via web UI and autonomous AI agents via programmatic API</strong>. It pressure-tests reasoning, flags FOMO and narrative dependency, and makes sure decisions survive volatility — for humans and machines alike.</p>

          <div className="space-y-14 text-sm leading-relaxed border-l border-white/[0.06] pl-8">

            <section>
              <h2 className="text-white font-black uppercase tracking-widest mb-4 flex items-center gap-3">
                <span className="font-mono text-xs" style={{ color: '#F37E20' }}>01</span> The Problem — Your Thinking is a Data Mine
              </h2>
              <p className="mb-6">Every day, you capture your most valuable thoughts in digital notebooks. But where does that data really go?</p>
              <div className="space-y-3">
                <PersonaCallout
                  icon={<Briefcase className="w-4 h-4" />}
                  label="For Founders"
                  accent="#F37E20"
                  text="Your product roadmap, fundraising strategy, and competitive analysis are your most valuable assets. Using standard AI note apps is like leaving your M.O. on a coffee shop table. Their business model is to read your mail."
                />
                <PersonaCallout
                  icon={<BarChart3 className="w-4 h-4" />}
                  label="For Traders"
                  accent="#2E8B8B"
                  text="Your thesis on a trade, your analysis of on-chain data, and your risk management rules are your alpha. Exposing that to a third-party AI leaks your edge. You're training a model that will be sold to your competitors."
                />
                <PersonaCallout
                  icon={<FlaskConical className="w-4 h-4" />}
                  label="For Researchers"
                  accent="#2E8B8B"
                  text="Your literature reviews, raw data, and nascent hypotheses are the foundation of your work. Centralized AI platforms can co-opt your findings and flag your inquiries. Your research deserves a sovereign space."
                />
              </div>
            </section>

            <section>
              <h2 className="text-white font-black uppercase tracking-widest mb-4 flex items-center gap-3">
                <span className="font-mono text-xs" style={{ color: '#F37E20' }}>02</span> The Solution — Two Layers, One System
              </h2>
              <p className="mb-6">
                DJ-Z-S operates on two layers: <strong className="text-white">Workspace Zones</strong> for your private thinking, and <strong className="text-white">Execution Zones</strong> for deploying adversarial audits via the A2A API. Capture, pressure-test, compound — and when you're ready, deploy to the economy.
              </p>

              <h3 className="text-white font-bold text-xs uppercase tracking-widest mb-4">Workspace Zones</h3>
              <div className="space-y-4 mb-8">
                <div className="p-5 rounded-lg border border-orange-500/20" style={{ background: 'rgba(243,126,32,0.04)' }} data-testid="card-zone-journal">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-lg bg-orange-500/15 flex items-center justify-center">
                      <PenLine className="w-4 h-4 text-orange-400" />
                    </div>
                    <h3 className="text-white font-bold">Journal</h3>
                  </div>
                  <p className="text-gray-400 mb-3">Your private space to think, reflect, and extract insight. Write daily entries, click <strong className="text-white">"Think with me"</strong> and the AI interrogates your entry — flags contradictions, calls out FOMO-driven logic, exposes blind spots, and asks the questions you're avoiding.</p>
                  <p className="text-xs text-gray-500">Supports text entries, voice-to-text, and video journal recordings via Livepeer.</p>
                </div>
                <div className="p-5 rounded-lg border" style={{ background: 'rgba(45,212,191,0.04)', borderColor: 'rgba(45,212,191,0.2)' }} data-testid="card-zone-research">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'rgba(45,212,191,0.15)' }}>
                      <Search className="w-4 h-4" style={{ color: '#2dd4bf' }} />
                    </div>
                    <h3 className="text-white font-bold">Research</h3>
                  </div>
                  <p className="text-gray-400 mb-3">Search and synthesize information. Save articles, on-chain data, and research notes. The AI flags echo chamber consensus, scores evidence strength, and kills weak assumptions. Organize into trackers with claims and trust levels.</p>
                  <p className="text-xs text-gray-500">Three modes: <strong style={{ color: '#2dd4bf' }}>Brave Mode</strong> (privacy-first web search), <strong style={{ color: '#2dd4bf' }}>Web Mode</strong> (AI web search with citations), <strong style={{ color: '#2dd4bf' }}>Explain Mode</strong> (AI knowledge synthesis).</p>
                </div>
                <div className="p-5 rounded-lg border" style={{ background: 'rgba(96,165,250,0.04)', borderColor: 'rgba(96,165,250,0.2)' }} data-testid="card-zone-trade">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'rgba(96,165,250,0.15)' }}>
                      <Receipt className="w-4 h-4" style={{ color: '#60a5fa' }} />
                    </div>
                    <h3 className="text-white font-bold">Trade</h3>
                  </div>
                  <p className="text-gray-400">Build trade theses, stress-test them with adversarial AI, compute risk, and sign wallet-verified artifacts. Supports paper and live trading modes with autonomous market alerts.</p>
                </div>
                <div className="p-5 rounded-lg border" style={{ background: 'rgba(251,191,36,0.04)', borderColor: 'rgba(251,191,36,0.2)' }} data-testid="card-zone-decisions">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'rgba(251,191,36,0.15)' }}>
                      <Brain className="w-4 h-4" style={{ color: '#fbbf24' }} />
                    </div>
                    <h3 className="text-white font-bold">Decisions</h3>
                  </div>
                  <p className="text-gray-400">Track high-stakes decisions with structured logs. AI pressure-tests your reasoning, flags when emotion is driving strategy instead of data, and ensures decisions survive scrutiny.</p>
                </div>
                <div className="p-5 rounded-lg border border-purple-500/20" style={{ background: 'rgba(192,132,252,0.04)' }} data-testid="card-zone-content">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-lg bg-purple-600/15 flex items-center justify-center">
                      <Palette className="w-4 h-4 text-purple-400" />
                    </div>
                    <h3 className="text-white font-bold">Content</h3>
                  </div>
                  <p className="text-gray-400">Manage your content pipeline. AI challenges your angles, hooks, and positioning — forces you to articulate what's genuinely new before you publish.</p>
                </div>
                <div className="p-5 rounded-lg border" style={{ background: 'rgba(244,63,94,0.04)', borderColor: 'rgba(244,63,94,0.2)' }} data-testid="card-zone-thinking">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'rgba(244,63,94,0.15)' }}>
                      <MessageSquare className="w-4 h-4" style={{ color: '#f43f5e' }} />
                    </div>
                    <h3 className="text-white font-bold">Thinking Partner</h3>
                  </div>
                  <p className="text-gray-400">An adversarial AI that attacks your reasoning, calls out when narrative is driving your strategy instead of data, flags FOMO and ego, and asks whether you'd still do this if nobody was watching.</p>
                </div>
              </div>

              <h3 className="text-white font-bold text-xs uppercase tracking-widest mb-4">Execution Zones</h3>
              <p className="text-gray-400 text-sm mb-4">Deploy adversarial audits to the A2A economy. Each zone offers a different depth and price point — from quick operational sanity checks to exhaustive governance audits.</p>
              <div className="space-y-4 mb-8">
                <div className="p-5 rounded-lg border" style={{ background: 'rgba(45,212,191,0.04)', borderColor: 'rgba(45,212,191,0.2)' }} data-testid="card-exec-micro">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'rgba(45,212,191,0.15)' }}>
                      <Zap className="w-4 h-4" style={{ color: '#2dd4bf' }} />
                    </div>
                    <div>
                      <h3 className="text-white font-bold">Micro-Zone</h3>
                      <span className="text-[10px] font-mono" style={{ color: '#2dd4bf' }}>$2.50 USDC</span>
                    </div>
                  </div>
                  <p className="text-gray-400 text-sm">Fast constrained operational audit. Binary risk scoring for high-frequency sanity checks. 1,000 character limit.</p>
                </div>
                <div className="p-5 rounded-lg border" style={{ background: 'rgba(243,126,32,0.04)', borderColor: 'rgba(243,126,32,0.2)' }} data-testid="card-exec-founder">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'rgba(243,126,32,0.15)' }}>
                      <Activity className="w-4 h-4" style={{ color: '#F37E20' }} />
                    </div>
                    <div>
                      <h3 className="text-white font-bold">Founder Zone</h3>
                      <span className="text-[10px] font-mono" style={{ color: '#F37E20' }}>$5.00 USDC</span>
                    </div>
                  </div>
                  <p className="text-gray-400 text-sm">Deep roadmap diligence. Detects narrative drift, confirmation bias, and strategic misalignment. 5,000 character limit.</p>
                </div>
                <div className="p-5 rounded-lg border" style={{ background: 'rgba(168,85,247,0.04)', borderColor: 'rgba(168,85,247,0.2)' }} data-testid="card-exec-treasury">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'rgba(168,85,247,0.15)' }}>
                      <Shield className="w-4 h-4" style={{ color: '#a855f7' }} />
                    </div>
                    <div>
                      <h3 className="text-white font-bold">Treasury Zone</h3>
                      <span className="text-[10px] font-mono" style={{ color: '#a855f7' }}>$50.00 USDC</span>
                    </div>
                  </div>
                  <p className="text-gray-400 text-sm">Exhaustive adversarial governance audit. Multi-vector analysis for DAO treasuries, protocol upgrades, and high-stakes governance decisions. No character limit.</p>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-white font-bold text-xs uppercase tracking-widest">See how it works for you</h3>
                <PersonaWorkflow
                  icon={<Briefcase className="w-4 h-4" />}
                  label="Founder Workflow"
                  accent="#F37E20"
                  steps={[
                    { step: "Capture", text: "Journal about a new feature idea and go-to-market challenges in the Journal zone." },
                    { step: "Analyze", text: "Click 'Think with me' — AI flags that your pivot is a reaction to Twitter hype, not market data. Exposes confirmation bias." },
                    { step: "Deploy", text: "Send your roadmap to the Founder Zone ($5.00) for deep adversarial diligence. Get a structured risk score and actionable recommendations." },
                  ]}
                />
                <PersonaWorkflow
                  icon={<BarChart3 className="w-4 h-4" />}
                  label="Trader Workflow"
                  accent="#2E8B8B"
                  steps={[
                    { step: "Capture", text: "Build a trade thesis in the Trade zone with on-chain data and your initial gut reaction." },
                    { step: "Analyze", text: "AI flags that your 'gut reaction' is FOMO — same pattern as three failed trades ago. Scores evidence as weak on methodology." },
                    { step: "Deploy", text: "Stress-test via Micro-Zone ($2.50) for a fast sanity check before execution." },
                  ]}
                />
                <PersonaWorkflow
                  icon={<FlaskConical className="w-4 h-4" />}
                  label="Researcher Workflow"
                  accent="#2E8B8B"
                  steps={[
                    { step: "Capture", text: "Save articles and data into the Research zone with claims and evidence scoring." },
                    { step: "Analyze", text: "AI surfaces that all three papers share the same funding source — consensus may be artificial. Flags the assumption you forgot to question." },
                    { step: "Compound", text: "Pin the synthesized literature review to a memory, building the paper incrementally." },
                  ]}
                />
              </div>
            </section>

            <section>
              <h2 className="text-white font-black uppercase tracking-widest mb-4 flex items-center gap-3">
                <span className="font-mono text-xs" style={{ color: '#F37E20' }}>03</span> Our Philosophy
              </h2>
              <div className="space-y-4">
                <div className="p-5 rounded-lg border border-orange-500/20" style={{ background: 'rgba(243,126,32,0.04)' }}>
                  <div className="flex items-center gap-3 mb-3">
                    <HardDrive className="w-5 h-5 text-orange-400" />
                    <h3 className="text-white font-bold">Local-First</h3>
                  </div>
                  <p className="text-gray-400">Your journal and memory vault are stored locally in your browser. They are never on our servers. This isn't a feature; it's the foundation of our privacy model. There's nothing to hack, subpoena, or sell.</p>
                </div>
                <div className="p-5 rounded-lg border border-teal-500/20" style={{ background: 'rgba(46,139,139,0.04)' }}>
                  <div className="flex items-center gap-3 mb-3">
                    <Shield className="w-5 h-5 text-teal-400" />
                    <h3 className="text-white font-bold">Sovereign</h3>
                  </div>
                  <p className="text-gray-400">We believe you should have a digital space that is truly yours. DJ-Z-S is designed to be your sovereign workspace, free from the prying eyes of ad-tech and AI companies. Your roadmap stays your roadmap. Your thesis stays your thesis. Optional vault encryption (AES-256-GCM) and Bring Your Own Key (BYOK) for AI inference give you full control over your data and your tools.</p>
                </div>
                <div className="p-5 rounded-lg border border-purple-500/20" style={{ background: 'rgba(123,107,141,0.04)' }}>
                  <div className="flex items-center gap-3 mb-3">
                    <Brain className="w-5 h-5 text-purple-400" />
                    <h3 className="text-white font-bold">Adversarial by Design</h3>
                  </div>
                  <p className="text-gray-400">The AI actively pushes back. It doesn't validate — it interrogates. It looks for the weakest link in your reasoning and applies maximum pressure there.</p>
                </div>
                <div className="p-5 rounded-lg border" style={{ background: 'rgba(244,63,94,0.04)', borderColor: 'rgba(244,63,94,0.2)' }}>
                  <div className="flex items-center gap-3 mb-3">
                    <Sparkles className="w-5 h-5" style={{ color: '#f43f5e' }} />
                    <h3 className="text-white font-bold">Uncensored</h3>
                  </div>
                  <p className="text-gray-400">Our AI is designed to be your thinking partner, not your censor. It won't refuse to explore controversial ideas or sensitive strategies. Your thoughts are your own.</p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-white font-black uppercase tracking-widest mb-4 flex items-center gap-3">
                <span className="font-mono text-xs" style={{ color: '#F37E20' }}>04</span> The Tech — How We Keep It Private
              </h2>
              <p className="mb-6">We use a hybrid architecture to balance powerful AI with uncompromising privacy.</p>
              <div className="space-y-3 mb-6">
                <div className="flex items-start gap-4 p-4 rounded-lg bg-[#14171D] border border-white/[0.06]">
                  <HardDrive className="w-5 h-5 text-orange-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-white font-bold text-xs mb-1">Your Data</p>
                    <p className="text-xs text-gray-500">Your journal entries, memory vault, research trackers, and claims are stored locally in your browser's IndexedDB. They never touch our servers.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 rounded-lg bg-[#14171D] border border-white/[0.06]">
                  <Bot className="w-5 h-5 text-orange-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-white font-bold text-xs mb-1">AI Inference</p>
                    <p className="text-xs text-gray-500">When you use "Think with me," your prompt is sent to a decentralized inference network (via Venice AI) for processing. Your prompts are not stored or used for training. No centralized AI company owns the interaction.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 rounded-lg bg-[#14171D] border border-white/[0.06]">
                  <Wallet className="w-5 h-5 text-orange-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-white font-bold text-xs mb-1">Identity</p>
                    <p className="text-xs text-gray-500">You connect with a crypto wallet. It's a login you own, not an email address we can sell. No marketing emails. Ever.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 rounded-lg bg-[#14171D] border border-white/[0.06]">
                  <Lock className="w-5 h-5 text-orange-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-white font-bold text-xs mb-1">Messaging (XMTP + MLS)</p>
                    <p className="text-xs text-gray-500">End-to-end encrypted via the MLS protocol with forward secrecy, post-compromise security, and quantum-resistant key encapsulation (XWING KEM). Past messages stay secure even if keys are compromised.</p>
                  </div>
                </div>
              </div>
              <p className="text-xs text-gray-500 mb-4">This is the most private way to access powerful AI today. We are actively researching on-device models to eliminate the inference step in the future.</p>
              <div className="p-4 rounded-lg bg-amber-500/[0.04] border border-amber-500/15">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-amber-300 font-semibold mb-1">What we're honest about</p>
                    <p className="text-xs text-gray-500">When you click "Think with me," your entry text is sent to Venice AI over the internet for processing. This is not end-to-end encrypted. Venice AI claims no data retention, but we can't independently verify that claim. We're transparent about this because you deserve to know exactly when your data leaves your device.</p>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-white font-black uppercase tracking-widest mb-4 flex items-center gap-3">
                <span className="font-mono text-xs" style={{ color: '#F37E20' }}>05</span> Your AI Team
              </h2>
              <p className="mb-5">Four specialized AI agents power the system. Each one is triggered only when you take action — never automatically. They work for you, not on you.</p>
              <div className="space-y-3">
                <div className="p-4 rounded-lg bg-[#14171D] border border-white/[0.06]" data-testid="card-agent-insight">
                  <div className="flex items-center gap-3 mb-2">
                    <Brain className="w-4 h-4 text-orange-400" />
                    <h3 className="text-white font-bold text-xs">Your Adversarial Analyst</h3>
                    <span className="text-[10px] text-gray-600 ml-auto">Triggered by "Think with me"</span>
                  </div>
                  <p className="text-xs text-gray-500">Interrogates your journal entry. Doesn't summarize — pressure-tests. Flags when your reasoning contradicts past entries, calls out FOMO and narrative dependency, and asks the hard questions you're avoiding.</p>
                </div>
                <div className="p-4 rounded-lg bg-[#14171D] border border-white/[0.06]" data-testid="card-agent-synth">
                  <div className="flex items-center gap-3 mb-2">
                    <Brain className="w-4 h-4 text-teal-400" />
                    <h3 className="text-white font-bold text-xs">Your Research Interrogator</h3>
                    <span className="text-[10px] text-gray-600 ml-auto">Triggered by research actions</span>
                  </div>
                  <p className="text-xs text-gray-500">Attacks your research. Flags echo chamber consensus, scores evidence strength across four axes, surfaces methodological weaknesses, and kills unfounded assumptions before you build on them.</p>
                </div>
                <div className="p-4 rounded-lg bg-[#14171D] border border-white/[0.06]" data-testid="card-agent-partner">
                  <div className="flex items-center gap-3 mb-2">
                    <Brain className="w-4 h-4 text-purple-400" />
                    <h3 className="text-white font-bold text-xs">Your Adversarial Thinking Partner</h3>
                    <span className="text-[10px] text-gray-600 ml-auto">Your sparring partner</span>
                  </div>
                  <p className="text-xs text-gray-500">Tries to break your reasoning. Names the real driver behind your decisions — is it strategy or ego? Data or narrative addiction? Finds the gap between what you claim and what you actually do.</p>
                </div>
                <div className="p-4 rounded-lg bg-[#14171D] border border-white/[0.06]" data-testid="card-agent-audit">
                  <div className="flex items-center gap-3 mb-2">
                    <Shield className="w-4 h-4" style={{ color: '#a855f7' }} />
                    <h3 className="text-white font-bold text-xs">A2A Audit Agent</h3>
                    <span className="text-[10px] text-gray-600 ml-auto">Powers the Execution Zones</span>
                  </div>
                  <p className="text-xs text-gray-500">The adversarial engine behind the three-tier audit API. Performs tier-specific prompt engineering — from fast binary risk scoring (Micro) to exhaustive multi-vector governance audits (Treasury). Serves both the web UI and autonomous AI agents via API.</p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-white font-black uppercase tracking-widest mb-4 flex items-center gap-3">
                <span className="font-mono text-xs" style={{ color: '#F37E20' }}>06</span> Memory Pins & Compounding Intelligence
              </h2>
              <div className="p-5 rounded-lg bg-[#14171D] border border-white/[0.06] mb-4" data-testid="card-memory-pins">
                <div className="flex items-center gap-3 mb-3">
                  <Pin className="w-4 h-4 text-orange-400" />
                  <h3 className="text-white font-bold">Memory Pins</h3>
                </div>
                <p className="text-gray-400 mb-3">Pin the patterns, goals, theses, and questions that matter most to you. These pins are carried forward as context every time you ask the AI to think with you — so it understands your ongoing projects, evolving strategy, and active priorities.</p>
                <p className="text-xs text-gray-500">Pin types: goals, patterns, preferences, projects, principles, questions, people. All stored locally. You control what the AI remembers about your edge.</p>
              </div>
              <div className="p-5 rounded-lg bg-[#14171D] border border-white/[0.06]">
                <div className="flex items-center gap-3 mb-3">
                  <RefreshCw className="w-4 h-4 text-orange-400" />
                  <h3 className="text-white font-bold">Compounding Intelligence</h3>
                </div>
                <p className="text-gray-400">Unlike scattered notes that just pile up, DJ-Z-S connects today's thinking to yesterday's insights. Memory pins, past-entry connections, and cross-zone synthesis ensure your knowledge base grows smarter over time. Each entry makes the next analysis more valuable — your edge compounds daily.</p>
              </div>
            </section>

            <section>
              <h2 className="text-white font-black uppercase tracking-widest mb-4 flex items-center gap-3">
                <span className="font-mono text-xs" style={{ color: '#F37E20' }}>07</span> The A2A Economy — Agents Hiring Agents
              </h2>
              <p className="mb-6">DJZS serves two clients: human founders who use the web UI, and autonomous AI agents who pay for logic audits via API. In the Agent-to-Agent economy, trust is the bottleneck. DJZS is the default Logic Oracle — the "Senior Partner" that other agents hire to stress-test their logic before execution.</p>
              <div className="space-y-4">
                <div className="p-5 rounded-lg border border-orange-500/20" style={{ background: 'rgba(243,126,32,0.04)' }} data-testid="card-a2a-api-about">
                  <div className="flex items-center gap-3 mb-3">
                    <Bot className="w-5 h-5 text-orange-400" />
                    <h3 className="text-white font-bold">Machine-Readable Tiered API</h3>
                  </div>
                  <p className="text-gray-400 mb-3">Agents discover DJZS via <code className="text-xs px-1.5 py-0.5 rounded bg-white/5 text-orange-300">/.well-known/agent.json</code> and call tiered endpoints with a strategy memo. Each tier returns structured JSON: risk score (0-100), primary bias detected, logic flaws, and recommendations. Every audit is cryptographically hashed (SHA-256) for on-chain verification.</p>
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center gap-3 text-xs">
                      <code className="px-1.5 py-0.5 rounded bg-white/5 text-orange-300">POST /api/audit/micro</code>
                      <span className="text-gray-500">— $2.50 USDC — fast operational audit (1K chars)</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs">
                      <code className="px-1.5 py-0.5 rounded bg-white/5 text-orange-300">POST /api/audit/founder</code>
                      <span className="text-gray-500">— $5.00 USDC — deep roadmap diligence (5K chars)</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs">
                      <code className="px-1.5 py-0.5 rounded bg-white/5 text-orange-300">POST /api/audit/treasury</code>
                      <span className="text-gray-500">— $50.00 USDC — exhaustive governance audit (unlimited)</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-3">Schema discovery at <code className="text-xs px-1.5 py-0.5 rounded bg-white/5 text-orange-300">GET /api/audit/schema</code></p>
                </div>
                <div className="p-5 rounded-lg border border-teal-500/20" style={{ background: 'rgba(46,139,139,0.04)' }} data-testid="card-a2a-payment-about">
                  <div className="flex items-center gap-3 mb-3">
                    <Zap className="w-5 h-5 text-teal-400" />
                    <h3 className="text-white font-bold">x402 Micropayments on Base</h3>
                  </div>
                  <p className="text-gray-400">Revenue model: pay-per-audit via the x402 protocol across three tiers. No subscriptions, no NFT gates. HTTP-native payments mean any agent can call the API, pay, and receive results in a single request cycle.</p>
                </div>
                <div className="p-5 rounded-lg border border-purple-500/20" style={{ background: 'rgba(123,107,141,0.04)' }} data-testid="card-a2a-usecases-about">
                  <div className="flex items-center gap-3 mb-3">
                    <Brain className="w-5 h-5 text-purple-400" />
                    <h3 className="text-white font-bold">Use Cases</h3>
                  </div>
                  <ul className="space-y-2 text-sm text-gray-400">
                    <li>• <strong className="text-white">DAO Treasury Stress-Test ($50.00)</strong> — A DAO agent pings DJZS Treasury Zone before signing a multi-sig, flagging FOMO-driven allocation</li>
                    <li>• <strong className="text-white">Founder Drift Audit ($5.00)</strong> — A VC screening bot calls the Founder Zone to check if a founder is building what they promised</li>
                    <li>• <strong className="text-white">Micro-Audit ($2.50)</strong> — A trading agent stress-tests an arbitrage strategy in the Micro-Zone before execution</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-white font-black uppercase tracking-widest mb-4 flex items-center gap-3">
                <span className="font-mono text-xs" style={{ color: '#F37E20' }}>08</span> Additional Tools
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-[#14171D] border border-white/[0.06]">
                  <ShieldCheck className="w-5 h-5 text-green-400 mb-3" />
                  <h3 className="text-white font-bold mb-2">Vault Encryption</h3>
                  <p className="text-xs text-gray-500">Set a passphrase to encrypt your local vault with AES-256-GCM. PBKDF2 with 600,000 iterations for key derivation — all running in your browser via WebCrypto. Lock and unlock your vault at any time.</p>
                </div>
                <div className="p-4 rounded-lg bg-[#14171D] border border-white/[0.06]">
                  <KeyRound className="w-5 h-5 mb-3" style={{ color: '#FFB84D' }} />
                  <h3 className="text-white font-bold mb-2">Bring Your Own Key</h3>
                  <p className="text-xs text-gray-500">Use your own Venice API key for full control over AI inference, billing, and rate limits. Stored locally in your browser, never on our servers. Switch back to the shared key anytime.</p>
                </div>
                <div className="p-4 rounded-lg bg-[#14171D] border border-white/[0.06]">
                  <Video className="w-5 h-5 text-orange-400 mb-3" />
                  <h3 className="text-white font-bold mb-2">Video Journal</h3>
                  <p className="text-xs text-gray-500">Record video entries directly in your browser. Videos are stored via Livepeer's decentralized network and linked to your journal entries for playback.</p>
                </div>
                <div className="p-4 rounded-lg bg-[#14171D] border border-white/[0.06]">
                  <Headphones className="w-5 h-5 text-orange-400 mb-3" />
                  <h3 className="text-white font-bold mb-2">Music Library</h3>
                  <p className="text-xs text-gray-500">Upload your own music and play it while you think. Organize tracks into Focus, Reflection, and Creative zones. All stored locally in your browser.</p>
                </div>
                <div className="p-4 rounded-lg bg-[#14171D] border border-white/[0.06]">
                  <MessageSquare className="w-5 h-5 text-orange-400 mb-3" />
                  <h3 className="text-white font-bold mb-2">XMTP Messaging</h3>
                  <p className="text-xs text-gray-500">Interact with AI agents through XMTP decentralized messaging — fully end-to-end encrypted with quantum-resistant key protection. Send journal entries, research queries, or thinking questions from any XMTP-compatible app.</p>
                </div>
                <div className="p-4 rounded-lg bg-[#14171D] border border-white/[0.06]">
                  <Search className="w-5 h-5 text-orange-400 mb-3" />
                  <h3 className="text-white font-bold mb-2">Quick Search</h3>
                  <p className="text-xs text-gray-500">Instantly search all your past entries with real-time filtering. Filter by journal or research, with highlighted match previews. Open with Cmd+K from anywhere.</p>
                </div>
                <div className="p-4 rounded-lg bg-[#14171D] border border-white/[0.06]">
                  <HelpCircle className="w-5 h-5 text-orange-400 mb-3" />
                  <h3 className="text-white font-bold mb-2">Interactive Tutorial</h3>
                  <p className="text-xs text-gray-500">Guided 7-step onboarding walkthrough with spotlight highlights covering Workspace Zones and Execution Zones. Keyboard navigation, auto-shown for new users, re-accessible via sidebar.</p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-white font-black uppercase tracking-widest mb-4 flex items-center gap-3">
                <span className="font-mono text-xs" style={{ color: '#F37E20' }}>09</span> Built by Dj-z-s
              </h2>
              <div className="p-6 rounded-lg border border-orange-500/20" style={{ background: 'rgba(243,126,32,0.03)' }}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-orange-500/15 flex items-center justify-center">
                    <User className="w-5 h-5 text-orange-400" />
                  </div>
                  <div>
                    <p className="text-white font-bold">Dj-z-s</p>
                    <p className="text-xs text-gray-500">Solo Founder</p>
                  </div>
                </div>
                <div className="space-y-4 text-gray-400">
                  <p>After years of building in Web3 and watching founders, traders, and researchers have their most valuable ideas scraped and profited from by centralized platforms, I decided to build the tool I desperately needed.</p>
                  <p>DJ-Z-S isn't a faceless startup; it's a project with a singular mission: to give you a private space to do your best work. Your trust is the only thing that matters here.</p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-white font-black uppercase tracking-widest mb-4 flex items-center gap-3">
                <span className="font-mono text-xs" style={{ color: '#F37E20' }}>10</span> Open Development
              </h2>
              <p className="mb-5">We believe in transparency. You can see exactly what we're building, in real-time. Our development is open for anyone to inspect.</p>
              <div className="flex flex-wrap gap-4">
                <a 
                  href="https://github.com/UsernameDAOEth/djzs-box" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#14171D] border border-white/[0.06] hover:border-orange-500/30 transition-colors"
                  data-testid="link-github"
                >
                  <Globe className="w-4 h-4 text-orange-400" />
                  <span className="text-white text-xs font-bold">View Public Commits on GitHub</span>
                </a>
                <a 
                  href="https://x.com/Dj_Z_S" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#14171D] border border-white/[0.06] hover:border-orange-500/30 transition-colors"
                  data-testid="link-twitter"
                >
                  <Sparkles className="w-4 h-4 text-orange-400" />
                  <span className="text-white text-xs font-bold">Follow Progress on X</span>
                </a>
                <Link 
                  href="/docs"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#14171D] border border-white/[0.06] hover:border-orange-500/30 transition-colors"
                  data-testid="link-docs"
                >
                  <BookOpen className="w-4 h-4 text-orange-400" />
                  <span className="text-white text-xs font-bold">Documentation</span>
                </Link>
              </div>
            </section>

            <section>
              <h2 className="text-white font-black uppercase tracking-widest mb-4 flex items-center gap-3">
                <span className="font-mono text-xs" style={{ color: '#F37E20' }}>11</span> FAQ
              </h2>
              <div className="space-y-3">
                <PracticalItem
                  icon={<Download className="w-4 h-4" />}
                  question="Can I export my data?"
                  answer="Yes. You can export your entire journal and memory vault as a standard file at any time. Your data is yours, period."
                />
                <PracticalItem
                  icon={<Wallet className="w-4 h-4" />}
                  question="How do I get started?"
                  answer="Connect your wallet in 10 seconds and start your first journal entry. No email, no signup."
                />
                <PracticalItem
                  icon={<Zap className="w-4 h-4" />}
                  question="Is it fast?"
                  answer="Yes. We know your edge depends on it. AI insights are delivered in seconds, not minutes."
                />
              </div>
            </section>

          </div>

          <div className="mt-16 pt-12 border-t border-white/[0.06]">
            <div className="text-center">
              <p className="text-white font-bold text-lg mb-3">Ready to pressure-test your thinking?</p>
              <p className="text-gray-500 text-sm mb-6">Human founders start here. AI agents hit the API.</p>
              <div className="flex flex-wrap gap-3 justify-center">
                <Link
                  href="/chat"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-bold text-sm text-white transition-all hover:scale-[1.02]"
                  style={{ background: '#F37E20' }}
                  data-testid="button-cta-sharpen"
                >
                  Sharpen Your Edge <ChevronRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/docs"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-bold text-sm text-gray-400 border border-white/10 hover:border-orange-500/30 transition-colors"
                  data-testid="button-cta-docs"
                >
                  Read the Docs
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-16 pt-8 border-t border-white/[0.06] text-center">
            <p className="text-xs text-gray-600">
              &copy; 2026 DJZS SYSTEM / AUTONOMOUS AUDITING SYSTEM FOR THE A2A ECONOMY
            </p>
          </div>
        </motion.div>
      </main>
    </div>
  );
}

function PersonaCallout({ icon, label, accent, text }: {
  icon: ReactNode;
  label: string;
  accent: string;
  text: string;
}) {
  return (
    <div
      className="p-4 rounded-lg"
      style={{ background: `${accent}08`, border: `1px solid ${accent}25` }}
      data-testid={`callout-${label.toLowerCase().replace(/\s+/g, '-')}`}
    >
      <div className="flex items-center gap-2 mb-2" style={{ color: accent }}>
        {icon}
        <span className="text-xs font-bold uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-xs text-gray-400 leading-relaxed">{text}</p>
    </div>
  );
}

function PersonaWorkflow({ icon, label, accent, steps }: {
  icon: ReactNode;
  label: string;
  accent: string;
  steps: { step: string; text: string }[];
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className="rounded-lg overflow-hidden"
      style={{ background: `${accent}06`, border: `1px solid ${accent}20` }}
      data-testid={`workflow-${label.toLowerCase().replace(/\s+/g, '-')}`}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-2 p-4 text-left"
        data-testid={`button-toggle-${label.toLowerCase().replace(/\s+/g, '-')}`}
      >
        <span style={{ color: accent }}>{icon}</span>
        <span className="text-xs font-bold text-white uppercase tracking-wider">{label}</span>
        <motion.div
          animate={{ rotate: isOpen ? 90 : 0 }}
          transition={{ duration: 0.2 }}
          className="ml-auto"
          style={{ color: accent }}
        >
          <ChevronRight className="w-4 h-4" />
        </motion.div>
      </button>
      <motion.div
        initial={false}
        animate={{ height: isOpen ? "auto" : 0, opacity: isOpen ? 1 : 0 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="overflow-hidden"
      >
        <div className="px-4 pb-4 space-y-3">
          {steps.map((s, i) => (
            <div key={i} className="flex items-start gap-3">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                style={{ background: `${accent}20` }}
              >
                <span className="text-[10px] font-bold" style={{ color: accent }}>{i + 1}</span>
              </div>
              <div>
                <p className="text-white font-semibold text-xs mb-0.5">{s.step}</p>
                <p className="text-xs text-gray-500">{s.text}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

function PracticalItem({ icon, question, answer }: {
  icon: ReactNode;
  question: string;
  answer: string;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className="rounded-lg bg-[#14171D] border border-white/[0.06] overflow-hidden"
      data-testid={`faq-${question.slice(0, 20).toLowerCase().replace(/\s+/g, '-')}`}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-3 p-4 text-left"
        data-testid={`button-faq-${question.slice(0, 20).toLowerCase().replace(/\s+/g, '-')}`}
      >
        <span className="text-orange-400">{icon}</span>
        <span className="text-white font-bold text-xs">{question}</span>
        <motion.div
          animate={{ rotate: isOpen ? 90 : 0 }}
          transition={{ duration: 0.2 }}
          className="ml-auto text-gray-600"
        >
          <ChevronRight className="w-4 h-4" />
        </motion.div>
      </button>
      <motion.div
        initial={false}
        animate={{ height: isOpen ? "auto" : 0, opacity: isOpen ? 1 : 0 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="overflow-hidden"
      >
        <div className="px-4 pb-4 pl-11">
          <p className="text-xs text-gray-500 leading-relaxed">{answer}</p>
        </div>
      </motion.div>
    </div>
  );
}
