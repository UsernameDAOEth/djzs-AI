import { useState, type ReactNode } from "react";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { HardDrive, Shield, Bot, ArrowRight, BookOpen, Search, Brain, ChevronDown, Plus } from "lucide-react";
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
    <div className="min-h-screen text-white overflow-hidden" style={{ background: '#1a1d2e' }}>
      <style>{`
        @keyframes breathe {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.03); }
        }
        ::selection { background: rgba(232,132,44,0.3); }
      `}</style>

      <header className="sticky top-0 z-50 backdrop-blur-xl border-b border-white/[0.05]" style={{ background: 'rgba(26,29,46,0.85)' }}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/">
            <span className="text-xl font-black tracking-widest uppercase" style={{ color: '#E8842C' }} data-testid="link-home-logo">DJZS</span>
          </Link>
          <div className="flex items-center gap-4">
            {isConnected ? (
              <Link href="/chat">
                <button
                  className="inline-flex items-center gap-2 rounded-xl px-6 py-2.5 text-base font-semibold text-white transition-colors"
                  style={{ background: '#E8842C', boxShadow: '0 4px 14px rgba(232,132,44,0.25)' }}
                  data-testid="button-header-enter"
                >
                  Enter DJZS
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
        <title>DJZS - Private AI Journaling + Research | Local-First Thinking System</title>
        <meta name="description" content="Private AI journaling and research capture with a Thinking Partner. Local-first storage. Your notes stay on your device." />
        <meta property="og:title" content="DJZS - Private AI Journaling + Research" />
        <meta property="og:description" content="Local-first AI journaling and research. Memory that stays yours. No feeds. No surveillance." />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="DJZS - Private AI Journaling" />
        <meta name="twitter:description" content="Local-first AI journaling and research. Your thinking stays yours." />
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
              radial-gradient(800px 400px at 30% 40%, rgba(232,132,44,0.10), transparent 60%),
              radial-gradient(600px 300px at 70% 60%, rgba(59,168,160,0.08), transparent 60%),
              radial-gradient(400px 200px at 50% 80%, rgba(123,107,141,0.06), transparent 60%)
            `,
            animation: "breathe 30s ease-in-out infinite",
          }}
        />

        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          <motion.h1
            variants={fadeUp}
            className="text-6xl md:text-8xl lg:text-9xl font-black text-white tracking-tighter leading-[1] mb-8"
          >
            Your thoughts, structured.
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="text-2xl md:text-3xl max-w-4xl mx-auto leading-tight mb-12 font-medium"
            style={{ color: '#9a9bb0' }}
          >
            A private system to capture, connect, and deepen your ideas. No noise, just clarity.
          </motion.p>

          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-12">
            {isConnected ? (
              <Link href="/chat">
                <button
                  className="inline-flex items-center gap-3 rounded-2xl px-10 py-5 text-lg font-bold text-white transition-all duration-250 hover:-translate-y-1"
                  style={{ background: '#E8842C', boxShadow: '0 8px 30px rgba(232,132,44,0.3)' }}
                  data-testid="button-start-thinking"
                >
                  Start My First Entry
                  <ArrowRight className="w-6 h-6" />
                </button>
              </Link>
            ) : (
              <>
                <Link href="/chat">
                  <button
                    className="inline-flex items-center gap-3 rounded-2xl px-10 py-5 text-lg font-bold transition-all duration-250 hover:-translate-y-1"
                    style={{ background: '#E8842C', color: '#fff', boxShadow: '0 8px 30px rgba(232,132,44,0.3)' }}
                    data-testid="button-start-thinking"
                  >
                    Start My First Entry
                    <ArrowRight className="w-6 h-6" />
                  </button>
                </Link>
                <button
                  onClick={scrollToHowItWorks}
                  className="inline-flex items-center gap-3 rounded-2xl border px-8 py-5 text-lg font-bold transition-all duration-250 hover:text-white"
                  style={{ borderColor: 'rgba(59,168,160,0.3)', color: '#9a9bb0' }}
                  data-testid="button-see-how-it-works"
                >
                  See How It Works
                  <ChevronDown className="w-5 h-5" />
                </button>
              </>
            )}
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
              <HardDrive className="w-5 h-5" style={{ color: '#E8842C' }} />
              <span>Stored on your device</span>
            </div>
            <div className="flex items-center gap-3" data-testid="text-trust-ai">
              <Bot className="w-5 h-5" style={{ color: '#3BA8A0' }} />
              <span>AI only when you ask</span>
            </div>
            <div className="flex items-center gap-3" data-testid="text-trust-private">
              <Shield className="w-5 h-5" style={{ color: '#D4A843' }} />
              <span>Private by default</span>
            </div>
          </motion.div>
        </div>
      </motion.section>

      <RevealSection>
        <section id="how-it-works" className="relative py-32 border-t border-white/[0.05]" style={{ background: '#151828' }}>
          <div className="max-w-5xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight" data-testid="text-zones-headline">
                Three Zones for Clear Thinking
              </h2>
              <p className="text-xl max-w-3xl mx-auto" style={{ color: '#7a7b90' }}>
                DJZS organizes your thoughts into dedicated zones, so you can focus on what matters.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <ZoneFeatureCard
                icon={<BookOpen className="w-7 h-7" style={{ color: '#E8842C' }} />}
                color="orange"
                title="Daily Journaling"
                description="Capture your thoughts and feelings. Get instant summaries, insights, and emotional signals to understand your patterns."
                examplePrompt="Journal: Today I felt scattered and distracted..."
                href={isConnected ? "/chat" : "/chat"}
              />
              <ZoneFeatureCard
                icon={<Search className="w-7 h-7" style={{ color: '#3BA8A0' }} />}
                color="teal"
                title="Deep Research"
                description="Save links, notes, and clippings. When you're ready, synthesize them into a clear thesis with contradictions and open questions."
                examplePrompt="Research: Save this link..."
                href={isConnected ? "/chat?zone=research" : "/chat"}
              />
              <ZoneFeatureCard
                icon={<Brain className="w-7 h-7" style={{ color: '#7B6B8D' }} />}
                color="purple"
                title="Think Through a Problem"
                description="Stuck on a tough decision? Your Thinking Partner helps you explore the core tensions and find your next step."
                examplePrompt="I'm unsure whether to pivot my project toward video diaries."
                href={isConnected ? "/chat" : "/chat"}
              />
            </div>
          </div>
        </section>
      </RevealSection>

      <RevealSection>
        <section className="relative py-32 border-t border-white/[0.05]" style={{ background: '#1a1d2e' }}>
          <div className="max-w-5xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight" data-testid="text-stability-headline">
                Built for Stability, Not Hype
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <StabilityCard
                icon={<HardDrive className="w-6 h-6" style={{ color: '#E8842C' }} />}
                title="Local-First & Private"
                description="Your data is stored on your device, not our servers. Your thinking is yours alone."
              />
              <StabilityCard
                icon={<Bot className="w-6 h-6" style={{ color: '#3BA8A0' }} />}
                title="AI on Your Terms"
                description="The AI only analyzes what you tell it to, when you tell it to. No passive listening, no data mining."
              />
              <StabilityCard
                icon={<Shield className="w-6 h-6" style={{ color: '#D4A843' }} />}
                title="Open & Stable"
                description="Built on a clean, open architecture. This is a tool you can rely on for years, not a disposable app."
              />
            </div>
          </div>
        </section>
      </RevealSection>

      <RevealSection>
        <section className="relative py-24 border-t border-white/[0.05]" style={{ background: '#151828' }}>
          <div className="relative z-10 max-w-4xl mx-auto px-6">
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6" style={{ background: 'rgba(232,132,44,0.08)', border: '1px solid rgba(232,132,44,0.2)' }}>
                <Shield className="w-4 h-4" style={{ color: '#E8842C' }} />
                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: '#E8842C' }}>Privacy Architecture</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-black text-white mb-6 tracking-tight" data-testid="text-privacy-headline">
                How DJZS Handles Your Data
              </h2>
              <p className="text-xl max-w-2xl mx-auto leading-relaxed" style={{ color: '#9a9bb0' }}>
                Your journal and research data is stored locally on your device. AI analysis only happens when you explicitly request it.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-10">
              <div className="p-8 rounded-2xl border" style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.05)' }}>
                <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-6" style={{ background: 'rgba(232,132,44,0.08)', border: '1px solid rgba(232,132,44,0.2)' }}>
                  <HardDrive className="w-7 h-7" style={{ color: '#E8842C' }} />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Local-First Storage</h3>
                <p className="text-sm leading-relaxed" style={{ color: '#7a7b90' }}>
                  All journal entries, research notes, and memories are stored in your browser's IndexedDB. Works offline. No cloud database.
                </p>
              </div>
              <div className="p-8 rounded-2xl border" style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.05)' }}>
                <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-6" style={{ background: 'rgba(59,168,160,0.08)', border: '1px solid rgba(59,168,160,0.2)' }}>
                  <Bot className="w-7 h-7" style={{ color: '#3BA8A0' }} />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">User-Controlled AI</h3>
                <p className="text-sm leading-relaxed" style={{ color: '#7a7b90' }}>
                  AI only sees your data when you click "Think with me." Nothing is sent automatically. You control what the AI receives.
                </p>
              </div>
              <div className="p-8 rounded-2xl border" style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.05)' }}>
                <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-6" style={{ background: 'rgba(212,168,67,0.08)', border: '1px solid rgba(212,168,67,0.2)' }}>
                  <Shield className="w-7 h-7" style={{ color: '#D4A843' }} />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Privacy-Focused Providers</h3>
                <p className="text-sm leading-relaxed" style={{ color: '#7a7b90' }}>
                  Powered by Venice AI (no data retention) and Brave Search (no tracking). Your queries are not stored or used for training.
                </p>
              </div>
            </div>

            <div className="p-8 rounded-2xl border" style={{ background: 'linear-gradient(to right, rgba(232,132,44,0.04), rgba(59,168,160,0.04))', borderColor: 'rgba(255,255,255,0.08)' }}>
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
        <section className="relative py-24 border-t border-white/[0.05]" style={{ background: '#1a1d2e' }}>
          <div className="relative z-10 max-w-4xl mx-auto px-6">
            <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
              <FAQItem question="How is DJZS different from ChatGPT or Claude?">
                <p>DJZS is not a chat app and not a general AI assistant.</p>
                <p className="mt-2" style={{ color: '#666778' }}>ChatGPT and Claude are centralized AI platforms:</p>
                <ul className="list-disc list-inside ml-2" style={{ color: '#666778' }}>
                  <li>Your conversations happen on their servers</li>
                  <li>Memory is global or platform-controlled</li>
                  <li>The primary interaction is asking questions</li>
                </ul>
                <p className="mt-3" style={{ color: '#9a9bb0' }}>DJZS is a local-first thinking system:</p>
                <ul className="list-disc list-inside ml-2" style={{ color: '#9a9bb0' }}>
                  <li>You write first, in your own workspace</li>
                  <li>The AI responds only when you ask it to</li>
                  <li>Memory is explicit, user-controlled, and local</li>
                  <li>There are no feeds, profiles, or engagement loops</li>
                </ul>
                <p className="text-white mt-3 font-semibold">DJZS helps you think. It doesn't replace your thinking.</p>
              </FAQItem>

              <FAQItem question="What does 'decentralized' mean in DJZS?">
                <p>Decentralized does not mean "stored on a server" and it does not mean "everything is on a blockchain."</p>
                <p className="mt-2">In DJZS, decentralized means:</p>
                <ul className="list-disc list-inside ml-2">
                  <li>Your data is not dependent on a single company</li>
                  <li>Your thinking does not live in a central database</li>
                  <li>Ownership starts on your device, not a platform</li>
                </ul>
                <p className="mt-3" style={{ color: '#666778' }}>Centralized servers — and public blockchains — are still single points of failure. They can be indexed, surveilled, or compromised.</p>
                <p className="text-white mt-2 font-semibold">In DJZS, decentralization starts with local-first storage. Everything else is optional.</p>
              </FAQItem>

              <FAQItem question="Is my data really private?">
                <p className="text-white font-semibold">Yes — by design.</p>
                <ul className="list-disc list-inside ml-2 mt-2">
                  <li>Your journal and research live on your device first</li>
                  <li>When you ask AI for insights, only your selected text is sent to privacy-focused providers</li>
                  <li>DJZS does not scan, profile, or monetize your journaling.</li>
                  <li>Nothing syncs unless you choose to sync it</li>
                </ul>
                <p className="mt-3">DJZS works fully offline. If your device is offline, your thoughts are offline.</p>
              </FAQItem>

              <FAQItem question="How does AI memory work in Journal and Research?">
                <p>The AI does not have automatic or global memory.</p>
                <p className="mt-2">DJZS uses explicit, user-controlled memory:</p>
                <ul className="list-disc list-inside ml-2">
                  <li>You write an entry</li>
                  <li>You click "Think with me"</li>
                  <li>The agent sees: your current entry + up to 3 memory pins you previously saved</li>
                  <li>The response is generated and stored locally as an insight</li>
                </ul>
                <p className="mt-3">If something is worth remembering, the AI may suggest a memory — but only you can pin it.</p>
                <p className="text-white mt-2 font-semibold">There is no background memory. There is no silent learning.</p>
              </FAQItem>

              <FAQItem question="What's the difference between Journal mode and Research mode?">
                <p>They use the same system, but different thinking lenses.</p>
                <div className="grid grid-cols-2 gap-4 mt-3">
                  <div>
                    <p className="font-semibold mb-1" style={{ color: '#E8842C' }}>Journal mode</p>
                    <ul className="list-disc list-inside ml-2 text-sm">
                      <li>Summary</li>
                      <li>Insight</li>
                      <li>Reflection question</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-semibold mb-1" style={{ color: '#3BA8A0' }}>Research mode</p>
                    <ul className="list-disc list-inside ml-2 text-sm">
                      <li>Key claims</li>
                      <li>Evidence</li>
                      <li>Unknowns</li>
                      <li>Next question</li>
                    </ul>
                  </div>
                </div>
                <p className="mt-3 text-white font-semibold">The AI adapts its output — not your data.</p>
              </FAQItem>

              <FAQItem question="What is a Memory Pin?">
                <p>A Memory Pin is a thought you choose to keep.</p>
                <ul className="list-disc list-inside ml-2 mt-2">
                  <li>Pins stay on your device</li>
                  <li>Pins are reused as context in future sessions</li>
                  <li>Pins are never added automatically</li>
                </ul>
                <p className="mt-3">This allows your thinking to compound over time without creating a centralized memory graph.</p>
              </FAQItem>

              <FAQItem question="Who owns my data?">
                <p className="text-white font-semibold text-lg">You do.</p>
                <ul className="list-disc list-inside ml-2 mt-2">
                  <li>You write it</li>
                  <li>You store it</li>
                  <li>You choose what's remembered</li>
                  <li>You choose what's shared</li>
                  <li>You can leave at any time with your data intact</li>
                </ul>
                <p className="mt-3 text-white font-semibold">DJZS is a tool you own — not a platform that owns you.</p>
              </FAQItem>
            </div>
          </div>
        </section>
      </RevealSection>

      <RevealSection>
        <section className="relative py-32 border-t border-white/[0.05]" style={{ background: '#151828' }}>
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight" data-testid="text-final-cta-headline">
              Ready to build a better thinking habit?
            </h2>
            <p className="text-xl mb-12" style={{ color: '#7a7b90' }}>
              Start with a single entry.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link href="/chat">
                <button
                  className="inline-flex items-center gap-3 rounded-2xl px-10 py-5 text-lg font-bold text-white transition-all duration-250 hover:-translate-y-1"
                  style={{ background: '#E8842C', boxShadow: '0 8px 30px rgba(232,132,44,0.3)' }}
                  data-testid="button-final-get-started"
                >
                  Start My First Entry
                  <ArrowRight className="w-6 h-6" />
                </button>
              </Link>
              {!isConnected && (
                <div className="scale-125">
                  <ConnectButton showBalance={false} />
                </div>
              )}
            </div>
          </div>
        </section>
      </RevealSection>

      <footer className="border-t border-white/[0.05] py-24" style={{ background: '#1a1d2e' }}>
        <div className="max-w-4xl mx-auto px-6 flex flex-col items-center text-center gap-10">
          <div>
            <h2 className="text-3xl font-black tracking-widest uppercase mb-3" style={{ color: '#E8842C' }}>
              DJZS
            </h2>
            <p className="text-xs font-medium uppercase tracking-[0.3em]" style={{ color: '#7a7b90' }}>
              A thinking system, not a network
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
              <Link href="/chat" className="px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest text-white transition-all hover:opacity-90" style={{ background: '#E8842C' }} data-testid="link-footer-enter">
                Enter
              </Link>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6" style={{ color: '#555668' }}>
            <a href="https://github.com/djzs" target="_blank" rel="noopener noreferrer" className="text-[10px] uppercase tracking-widest transition-colors hover:opacity-80" data-testid="link-footer-github">
              GitHub
            </a>
            <span style={{ color: '#333445' }}>·</span>
            <a href="https://x.com/djzs_box" target="_blank" rel="noopener noreferrer" className="text-[10px] uppercase tracking-widest transition-colors hover:opacity-80" data-testid="link-footer-twitter">
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
        <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden backdrop-blur-xl border-t border-white/[0.05] p-4 safe-area-inset-bottom" style={{ background: 'rgba(26,29,46,0.95)' }}>
          <div className="flex items-center gap-3 max-w-lg mx-auto">
            <Link href="/chat" className="flex-1">
              <button
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-sm font-bold text-white transition-colors min-h-[48px]"
                style={{ background: '#E8842C' }}
                data-testid="button-mobile-try-demo"
              >
                Start My First Entry
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
            <Plus className="w-6 h-6" style={{ color: '#E8842C' }} />
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
