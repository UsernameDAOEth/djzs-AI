import { motion } from "framer-motion";
import { Link } from "wouter";
import { ArrowLeft, Shield, HardDrive, Bot, Lock, Users, Globe, BookOpen, Search, Sparkles, Brain, Pin, Video, Headphones, MessageSquare, AlertTriangle, Eye, RefreshCw, TrendingUp } from "lucide-react";
import type { ReactNode } from "react";

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

export default function About() {
  return (
    <div className="min-h-screen text-gray-400 font-medium selection:bg-orange-500/30" style={{ background: '#2A2E3F' }}>
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b border-white/[0.05]" style={{ background: 'rgba(42,46,63,0.8)' }}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-white hover:text-orange-400 transition-colors group">
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
          <p className="text-lg text-gray-400 mb-12 leading-relaxed">A decentralized, quantum-resilient AI thinking system designed for sovereign users. Local-first. End-to-End Encrypted. Built on decentralized inference.</p>

          <div className="space-y-14 text-sm leading-relaxed border-l border-white/[0.05] pl-8">

            <section>
              <h2 className="text-white font-black uppercase tracking-widest mb-4 flex items-center gap-3">
                <span className="font-mono text-xs" style={{ color: '#F37E20' }}>01</span> Our Mission
              </h2>
              <p className="mb-4">DJ-Z-S exists because raw thinking is your most sensitive data. In a world where every thought feeds centralized AI models, we believe your inner dialogue should remain sovereign — locally stored, decentralized when processed, and cryptographically protected in transit.</p>
              <p>
                We're building cognitive infrastructure that amplifies your thinking without capturing it. The AI runs on decentralized inference, not centralized SaaS endpoints. Your data stays on your device, not our servers.
              </p>
            </section>

            <section>
              <h2 className="text-white font-black uppercase tracking-widest mb-4 flex items-center gap-3">
                <span className="font-mono text-xs" style={{ color: '#F37E20' }}>02</span> Why DJZS
              </h2>
              <p className="mb-6">Your thoughts. Your insights. Your edge. Never mined. Never monetized.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <WhyCard
                  icon={<HardDrive className="w-5 h-5" />}
                  title="Your Thinking Stays Yours"
                  description="Your thoughts, insights, and research never leave your device unless you say so. No cloud backups. No server copies. No silent syncing. You own the exit."
                  accent="#F37E20"
                />
                <WhyCard
                  icon={<Brain className="w-5 h-5" />}
                  title="Your AI Doesn't Train on You"
                  description="You're not the training data. Your prompts aren't scraped, stored, or used to train someone else's model. The AI works for you—not the other way around."
                  accent="#2E8B8B"
                />
                <WhyCard
                  icon={<Lock className="w-5 h-5" />}
                  title="Your Conversations Are Private"
                  description="Even if your device is hacked, your past messages stay secure. Encryption keys rotate automatically. Your thinking stays private—no matter what."
                  accent="#7B6B8D"
                />
                <WhyCard
                  icon={<Shield className="w-5 h-5" />}
                  title="Your Past Is Protected"
                  description="If someone gets into your system today, they can't read what you wrote yesterday. Your history is locked—even if your present is exposed."
                  accent="#FFB84D"
                />
                <WhyCard
                  icon={<TrendingUp className="w-5 h-5" />}
                  title="Your Knowledge Grows Smarter"
                  description="Your insights don't just pile up—they connect. Memory Pins link ideas across time. Your thinking gets sharper, not just noisier."
                  accent="#F37E20"
                />
              </div>
            </section>

            <section>
              <h2 className="text-white font-black uppercase tracking-widest mb-4 flex items-center gap-3">
                <span className="font-mono text-xs" style={{ color: '#F37E20' }}>03</span> Three Zones, One Loop
              </h2>
              <p className="mb-6">
                DJZS is built around three interconnected zones that form a single thinking loop: 
                <strong className="text-white"> write → AI analyzes and connects → insights compound</strong>. Each zone serves a specific purpose, but together they make your thinking measurably sharper over time.
              </p>
              <div className="space-y-4">
                <div className="p-5 rounded-xl border border-orange-500/20" style={{ background: 'rgba(243,126,32,0.04)' }} data-testid="card-zone-journal">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-lg bg-orange-500/15 flex items-center justify-center">
                      <BookOpen className="w-4 h-4 text-orange-400" />
                    </div>
                    <h3 className="text-white font-bold">Journal Zone</h3>
                  </div>
                  <p className="text-gray-400 mb-3">Write your daily thinking — ideas, observations, decisions, questions. When you're ready, click <strong className="text-white">"Think with me"</strong> and the AI analyzes your entry, extracts patterns, surfaces open questions, and generates reflective prompts to deepen your thinking.</p>
                  <p className="text-xs text-gray-500">Supports text entries, voice-to-text, and video journal recordings via Livepeer.</p>
                </div>
                <div className="p-5 rounded-xl border border-teal-500/20" style={{ background: 'rgba(46,139,139,0.04)' }} data-testid="card-zone-research">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-lg bg-teal-600/15 flex items-center justify-center">
                      <Search className="w-4 h-4 text-teal-400" />
                    </div>
                    <h3 className="text-white font-bold">Research Zone</h3>
                  </div>
                  <p className="text-gray-400 mb-3">Save articles, links, and research notes. The AI synthesizes your research, identifies where sources agree or contradict each other, and suggests what to investigate next. Organize everything into dossiers with tracked claims and trust levels.</p>
                  <p className="text-xs text-gray-500">Three modes: <strong className="text-teal-400">Brave Mode</strong> (privacy-first web search), <strong className="text-teal-400">Web Mode</strong> (AI web search with citations), <strong className="text-teal-400">Explain Mode</strong> (AI knowledge synthesis).</p>
                </div>
                <div className="p-5 rounded-xl border border-purple-500/20" style={{ background: 'rgba(123,107,141,0.04)' }} data-testid="card-zone-thinking">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-lg bg-purple-600/15 flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-purple-400" />
                    </div>
                    <h3 className="text-white font-bold">Thinking Partner</h3>
                  </div>
                  <p className="text-gray-400">One AI agent that connects ideas across your journal and research, debates your points, finds patterns, and surfaces contradictions. Not a chatbot — a structured thinking coach that helps you see what you might be missing.</p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-white font-black uppercase tracking-widest mb-4 flex items-center gap-3">
                <span className="font-mono text-xs" style={{ color: '#F37E20' }}>04</span> The Thinking Loop
              </h2>
              <p className="mb-6">Every feature in DJZS feeds back into one loop designed to compound your intelligence:</p>
              <div className="p-6 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-7 h-7 rounded-full bg-orange-500/15 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-orange-400">1</span>
                    </div>
                    <div>
                      <p className="text-white font-semibold mb-1">Write your thinking</p>
                      <p className="text-xs text-gray-500">Journal entries, research notes, or questions — saved instantly to your device's local storage.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-7 h-7 rounded-full bg-orange-500/15 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-orange-400">2</span>
                    </div>
                    <div>
                      <p className="text-white font-semibold mb-1">AI analyzes when you ask</p>
                      <p className="text-xs text-gray-500">Click "Think with me" and your entry + memory pins + recent context are sent to Venice AI for analysis. Structured insights come back: patterns, claims, open questions, emotional trends.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-7 h-7 rounded-full bg-orange-500/15 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-orange-400">3</span>
                    </div>
                    <div>
                      <p className="text-white font-semibold mb-1">Insights compound</p>
                      <p className="text-xs text-gray-500">AI results are saved locally. Memory pins carry forward context. Past entries connect to new ones. Your knowledge base grows smarter over time — not just larger.</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-white font-black uppercase tracking-widest mb-4 flex items-center gap-3">
                <span className="font-mono text-xs" style={{ color: '#F37E20' }}>05</span> Why This Level of Privacy
              </h2>
              <div className="p-6 rounded-xl border border-orange-500/20 mb-6" style={{ background: 'rgba(243,126,32,0.03)' }} data-testid="card-why-privacy">
                <div className="flex items-center gap-3 mb-4">
                  <Eye className="w-5 h-5 text-orange-400" />
                  <p className="text-white font-bold">Your raw thinking is more sensitive than anything else you share online.</p>
                </div>
                <div className="space-y-4 text-gray-400">
                  <p>
                    Social posts are curated. Emails are edited. But your daily thinking — the half-formed ideas, the doubts, the unfiltered analysis of what's working and what isn't — that's your most vulnerable data. A thinking system that captures this deserves the highest possible privacy standard.
                  </p>
                  <p>
                    Most apps say "we value your privacy" while building business models that depend on accessing your data. DJZS is designed differently from the ground up:
                  </p>
                  <ul className="space-y-2 text-xs">
                    <li className="flex items-start gap-3">
                      <HardDrive className="w-4 h-4 text-orange-400 mt-0.5 shrink-0" />
                      <span><strong className="text-white">Local-first storage</strong> — All entries, insights, memory pins, research dossiers, and claims live in your browser's IndexedDB. We don't have a database of your thoughts. There's nothing to hack, subpoena, or sell.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Bot className="w-4 h-4 text-orange-400 mt-0.5 shrink-0" />
                      <span><strong className="text-white">User-controlled AI</strong> — Your text is only sent to AI when you explicitly click "Think with me." Venice AI processes it without storing or training on your data. Nothing happens in the background.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Search className="w-4 h-4 text-orange-400 mt-0.5 shrink-0" />
                      <span><strong className="text-white">Privacy-first search</strong> — Brave Search doesn't track or profile you. Venice AI's web search doesn't log queries. Your research stays your research.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Lock className="w-4 h-4 text-orange-400 mt-0.5 shrink-0" />
                      <span><strong className="text-white">Wallet-based identity</strong> — No email, no password, no account to breach. Your wallet is your identity. No personal information is required or stored.</span>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="p-4 rounded-xl bg-amber-500/[0.04] border border-amber-500/15">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-amber-300 font-semibold mb-1">What we're honest about</p>
                    <p className="text-xs text-gray-500">When you click "Think with me," your entry text is sent to Venice AI over the internet for processing. This is not end-to-end encrypted. Venice AI claims no data retention, but we can't independently verify that claim. We're transparent about this because we believe you deserve to know exactly when your data leaves your device.</p>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-white font-black uppercase tracking-widest mb-4 flex items-center gap-3">
                <span className="font-mono text-xs" style={{ color: '#F37E20' }}>06</span> What We Don't Do
              </h2>
              <div className="p-6 rounded-xl bg-orange-500/5 border border-orange-500/20 mb-4">
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <span className="text-orange-400 mt-0.5">×</span>
                    <span><strong className="text-white">No custody of funds</strong> — We never hold, access, or control your crypto assets</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-orange-400 mt-0.5">×</span>
                    <span><strong className="text-white">No automatic transactions</strong> — Nothing happens without your explicit approval</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-orange-400 mt-0.5">×</span>
                    <span><strong className="text-white">No data harvesting</strong> — Your entries and research stay on your device</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-orange-400 mt-0.5">×</span>
                    <span><strong className="text-white">No tracking or profiling</strong> — We don't analyze your behavior for ads</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-orange-400 mt-0.5">×</span>
                    <span><strong className="text-white">No background AI calls</strong> — AI is never triggered without your explicit action</span>
                  </li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-white font-black uppercase tracking-widest mb-4 flex items-center gap-3">
                <span className="font-mono text-xs" style={{ color: '#F37E20' }}>07</span> Decentralized AI by Design
              </h2>
              <p className="mb-5">DJZS integrates decentralized AI inference using Venice, rather than centralized AI providers.</p>
              <div className="p-5 rounded-xl bg-white/[0.02] border border-white/[0.05] mb-4">
                <h3 className="text-white font-bold mb-3 text-xs">What this means in practice</h3>
                <ul className="space-y-2 text-xs text-gray-500">
                  <li className="flex items-start gap-3">
                    <span className="text-orange-400 mt-0.5 shrink-0">+</span>
                    <span>Your prompts are not stored or reused for training</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-orange-400 mt-0.5 shrink-0">+</span>
                    <span>No centralized AI company owns the interaction</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-orange-400 mt-0.5 shrink-0">+</span>
                    <span>AI execution is distributed, not monopolized</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-orange-400 mt-0.5 shrink-0">+</span>
                    <span>DJZS remains interoperable with future decentralized models</span>
                  </li>
                </ul>
              </div>
              <p className="text-xs text-gray-600">AI becomes a tool, not a data vacuum.</p>
            </section>

            <section>
              <h2 className="text-white font-black uppercase tracking-widest mb-4 flex items-center gap-3">
                <span className="font-mono text-xs" style={{ color: '#F37E20' }}>08</span> AI Agents Under the Hood
              </h2>
              <p className="mb-5">Three specialized AI agents power the system. Each one is triggered only when you take action — never automatically.</p>
              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]" data-testid="card-agent-insight">
                  <div className="flex items-center gap-3 mb-2">
                    <Brain className="w-4 h-4 text-orange-400" />
                    <h3 className="text-white font-bold text-xs">JournalInsight Agent</h3>
                    <span className="text-[10px] text-gray-600 ml-auto">Triggered by "Think with me"</span>
                  </div>
                  <p className="text-xs text-gray-500">Analyzes your journal entry along with your recent entries and memory pins. Returns structured insights: what you said, why it matters, patterns it detected, open questions, and a reflective prompt to push your thinking deeper.</p>
                </div>
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]" data-testid="card-agent-synth">
                  <div className="flex items-center gap-3 mb-2">
                    <Brain className="w-4 h-4 text-teal-400" />
                    <h3 className="text-white font-bold text-xs">ResearchSynth Agent</h3>
                    <span className="text-[10px] text-gray-600 ml-auto">Triggered by research actions</span>
                  </div>
                  <p className="text-xs text-gray-500">Synthesizes batches of research entries into a unified thesis. Identifies where sources agree, where they contradict, and suggests follow-up research directions. Works across Brave, Web, and Explain modes.</p>
                </div>
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]" data-testid="card-agent-partner">
                  <div className="flex items-center gap-3 mb-2">
                    <Brain className="w-4 h-4 text-purple-400" />
                    <h3 className="text-white font-bold text-xs">ThinkingPartner Agent</h3>
                    <span className="text-[10px] text-gray-600 ml-auto">Your thinking coach</span>
                  </div>
                  <p className="text-xs text-gray-500">Debates your ideas, asks clarifying questions, identifies core tensions in your reasoning, suggests reframes, and provides actionable next steps. Connects insights across journal and research zones.</p>
                </div>
              </div>
              <p className="text-xs text-gray-600 mt-4">All agents are dispatched through OpenClaw, a unified runner that routes requests and returns structured JSON. You can also access agents via XMTP messaging using prefixes: <span className="font-mono text-gray-500">Journal:</span>, <span className="font-mono text-gray-500">Research:</span>, <span className="font-mono text-gray-500">Thinking:</span></p>
            </section>

            <section>
              <h2 className="text-white font-black uppercase tracking-widest mb-4 flex items-center gap-3">
                <span className="font-mono text-xs" style={{ color: '#F37E20' }}>09</span> Memory Pins & Compounding Intelligence
              </h2>
              <div className="p-5 rounded-xl bg-white/[0.02] border border-white/[0.05] mb-4" data-testid="card-memory-pins">
                <div className="flex items-center gap-3 mb-3">
                  <Pin className="w-4 h-4 text-orange-400" />
                  <h3 className="text-white font-bold">Memory Pins</h3>
                </div>
                <p className="text-gray-400 mb-3">Pin the patterns, goals, principles, and questions that matter most to you. These pins are carried forward as context every time you ask the AI to think with you — so it understands your ongoing projects, recurring themes, and evolving priorities.</p>
                <p className="text-xs text-gray-500">Pin types: goals, patterns, preferences, projects, principles, questions, people. All stored locally. You control what the AI remembers.</p>
              </div>
              <div className="p-5 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                <div className="flex items-center gap-3 mb-3">
                  <RefreshCw className="w-4 h-4 text-orange-400" />
                  <h3 className="text-white font-bold">Compounding Intelligence</h3>
                </div>
                <p className="text-gray-400">Unlike scattered notes that just pile up, DJZS connects today's thinking to yesterday's insights. Memory pins, past-entry connections, and cross-zone synthesis ensure your knowledge base grows smarter over time. Each entry makes the next analysis more useful.</p>
              </div>
            </section>

            <section>
              <h2 className="text-white font-black uppercase tracking-widest mb-4 flex items-center gap-3">
                <span className="font-mono text-xs" style={{ color: '#F37E20' }}>10</span> Additional Tools
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                  <Video className="w-5 h-5 text-orange-400 mb-3" />
                  <h3 className="text-white font-bold mb-2">Video Journal</h3>
                  <p className="text-xs text-gray-500">Record video entries directly in your browser. Videos are stored via Livepeer's decentralized network and linked to your journal entries for playback.</p>
                </div>
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                  <Headphones className="w-5 h-5 text-orange-400 mb-3" />
                  <h3 className="text-white font-bold mb-2">Music Library</h3>
                  <p className="text-xs text-gray-500">Upload your own music and play it while you think. Organize tracks into Focus, Reflection, and Creative zones. All stored locally in your browser.</p>
                </div>
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                  <MessageSquare className="w-5 h-5 text-orange-400 mb-3" />
                  <h3 className="text-white font-bold mb-2">XMTP Messaging</h3>
                  <p className="text-xs text-gray-500">Interact with AI agents through XMTP decentralized messaging — fully end-to-end encrypted with the MLS protocol and quantum-resistant key encapsulation (XWING KEM). Forward secrecy ensures past messages stay secure even if keys are compromised. Send journal entries, research queries, or thinking questions from any XMTP-compatible app.</p>
                </div>
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                  <Search className="w-5 h-5 text-orange-400 mb-3" />
                  <h3 className="text-white font-bold mb-2">Quick Search</h3>
                  <p className="text-xs text-gray-500">Instantly search all your past entries with real-time filtering. Filter by journal or research, with highlighted match previews. Open with Cmd+K from anywhere.</p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-white font-black uppercase tracking-widest mb-4 flex items-center gap-3">
                <span className="font-mono text-xs" style={{ color: '#F37E20' }}>10</span> Messaging Security (XMTP + MLS)
              </h2>
              <p className="mb-5">End-to-end encrypted messaging built on Messaging Layer Security (MLS) and the XMTP network.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                  <Lock className="w-4 h-4 text-teal-400 mb-2" />
                  <h3 className="text-white font-bold mb-2 text-xs">Message Confidentiality</h3>
                  <p className="text-xs text-gray-500">Messages are encrypted using AEAD (Authenticated Encryption with Associated Data). Only intended participants can read the content.</p>
                </div>
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                  <Shield className="w-4 h-4 text-teal-400 mb-2" />
                  <h3 className="text-white font-bold mb-2 text-xs">Forward Secrecy</h3>
                  <p className="text-xs text-gray-500">Encryption keys are ratcheted forward on every message. If a key is compromised, past messages remain secure.</p>
                </div>
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                  <RefreshCw className="w-4 h-4 text-teal-400 mb-2" />
                  <h3 className="text-white font-bold mb-2 text-xs">Post-Compromise Security</h3>
                  <p className="text-xs text-gray-500">Group secrets are regularly rotated via MLS commit updates. An attacker with old state cannot decrypt future messages.</p>
                </div>
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                  <Eye className="w-4 h-4 text-teal-400 mb-2" />
                  <h3 className="text-white font-bold mb-2 text-xs">Authentication & Integrity</h3>
                  <p className="text-xs text-gray-500">Messages are digitally signed, preventing impersonation and spoofing. Any tampering is detected cryptographically through MLS and AEAD verification.</p>
                </div>
              </div>
              <div className="mt-4 p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                <h3 className="text-white font-bold mb-2 text-xs">Quantum-Resilient Design</h3>
                <p className="text-xs text-gray-500">While no production system is fully post-quantum today, the MLS-based architecture allows algorithm upgrades, future post-quantum primitives, and long-term resilience without redesign. XWING KEM protects Welcome messages against "harvest now, decrypt later" attacks.</p>
              </div>
            </section>

            <section>
              <h2 className="text-white font-black uppercase tracking-widest mb-4 flex items-center gap-3">
                <span className="font-mono text-xs" style={{ color: '#F37E20' }}>11</span> Research Dossiers & Claims
              </h2>
              <p className="mb-4">The Research Zone includes a structured system for tracking what you've learned and how much you trust it:</p>
              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                  <h3 className="text-white font-bold mb-2 text-xs">Dossiers</h3>
                  <p className="text-xs text-gray-500">Named folders for organizing research by topic. Each dossier holds search queries, AI synthesis results, and tracked claims. Archive or delete when a topic is resolved.</p>
                </div>
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                  <h3 className="text-white font-bold mb-2 text-xs">Claims & Trust Levels</h3>
                  <p className="text-xs text-gray-500">Track specific claims from your research with status labels (<span className="text-green-400">verified</span>, <span className="text-amber-400">uncertain</span>, <span className="text-red-400">to check</span>) and trust levels (high, medium, low, unknown). Link claims back to journal entries to see how your research connects to your thinking.</p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-white font-black uppercase tracking-widest mb-4 flex items-center gap-3">
                <span className="font-mono text-xs" style={{ color: '#F37E20' }}>12</span> The Team
              </h2>
              <p className="mb-4">
                DJ-Z-S.box is built by a small team of privacy advocates and Web3 builders who 
                believe that the best tools are the ones that respect their users.
              </p>
              <p className="mb-4">
                We build for founders structuring their reasoning, traders tracking evolving theses, 
                and content creators compounding original perspectives. If you think in systems and 
                want cognitive leverage — DJZS is for you.
              </p>
              <p>
                We're not a VC-backed startup racing to monetize your attention. We're building 
                sustainable software that prioritizes your privacy over our growth metrics.
              </p>
            </section>

            <section>
              <h2 className="text-white font-black uppercase tracking-widest mb-4 flex items-center gap-3">
                <span className="font-mono text-xs" style={{ color: '#F37E20' }}>13</span> Open Development
              </h2>
              <div className="flex flex-wrap gap-4">
                <a 
                  href="https://github.com/UsernameDAOEth/djzs-box" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/[0.02] border border-white/[0.05] hover:border-orange-500/30 transition-colors"
                  data-testid="link-github"
                >
                  <Globe className="w-4 h-4 text-orange-400" />
                  <span className="text-white text-xs font-bold">GitHub</span>
                </a>
                <a 
                  href="https://x.com/Dj_Z_S" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/[0.02] border border-white/[0.05] hover:border-orange-500/30 transition-colors"
                  data-testid="link-twitter"
                >
                  <Users className="w-4 h-4 text-orange-400" />
                  <span className="text-white text-xs font-bold">X / Twitter</span>
                </a>
                <Link 
                  href="/docs"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/[0.02] border border-white/[0.05] hover:border-orange-500/30 transition-colors"
                  data-testid="link-docs"
                >
                  <Shield className="w-4 h-4 text-orange-400" />
                  <span className="text-white text-xs font-bold">Documentation</span>
                </Link>
              </div>
            </section>

            <section>
              <h2 className="text-white font-black uppercase tracking-widest mb-4 flex items-center gap-3">
                <span className="font-mono text-xs" style={{ color: '#F37E20' }}>14</span> Contact
              </h2>
              <p>
                Questions? Reach out via our official channels or open an issue on GitHub. 
                We're committed to transparency and respond to all legitimate inquiries.
              </p>
            </section>
          </div>

          <div className="mt-20 pt-12 border-t border-white/[0.05] text-center">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-600">
              © 2026 DJZS SYSTEM / DECENTRALIZED AI FOR SOVEREIGN THINKING
            </p>
          </div>
        </motion.div>
      </main>
    </div>
  );
}

function WhyCard({ icon, title, description, accent = '#F37E20' }: {
  icon: ReactNode;
  title: string;
  description: string;
  accent?: string;
}) {
  return (
    <div
      className="group relative p-5 rounded-xl overflow-hidden transition-all duration-200 hover:-translate-y-0.5"
      style={{
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.06)',
      }}
      data-testid={`card-why-${title.toLowerCase().replace(/\s+/g, '-')}`}
    >
      <div
        className="absolute top-0 left-0 right-0 h-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }}
      />
      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center mb-3"
        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: accent }}
      >
        {icon}
      </div>
      <h3 className="text-white font-bold text-sm mb-2">{title}</h3>
      <p className="text-xs leading-relaxed text-gray-500">{description}</p>
    </div>
  );
}
