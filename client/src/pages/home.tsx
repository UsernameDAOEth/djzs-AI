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
    <div className="min-h-screen bg-black text-white overflow-hidden selection:bg-purple-500/30">
      <style>{`
        @keyframes breathe {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.03); }
        }
      `}</style>

      <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/[0.05]">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/">
            <span className="text-xl font-black tracking-widest uppercase text-white" data-testid="link-home-logo">DJZS</span>
          </Link>
          <div className="flex items-center gap-4">
            {isConnected ? (
              <Link href="/chat">
                <button
                  className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-6 py-2.5 text-base font-semibold text-white hover:bg-purple-500 transition-colors shadow-md shadow-purple-500/20"
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
              radial-gradient(800px 400px at 30% 40%, rgba(140,80,255,0.12), transparent 60%),
              radial-gradient(600px 300px at 70% 60%, rgba(80,130,255,0.08), transparent 60%)
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
            className="text-2xl md:text-3xl text-gray-400 max-w-4xl mx-auto leading-tight mb-12 font-medium"
          >
            A private system to capture, connect, and deepen your ideas. No noise, just clarity.
          </motion.p>

          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-12">
            {isConnected ? (
              <Link href="/chat">
                <button
                  className="inline-flex items-center gap-3 rounded-2xl bg-purple-600 px-10 py-5 text-lg font-bold text-white hover:bg-purple-500 transition-all duration-250 shadow-xl shadow-purple-500/25 hover:shadow-2xl hover:shadow-purple-500/30 hover:-translate-y-1"
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
                    className="inline-flex items-center gap-3 rounded-2xl bg-white px-10 py-5 text-lg font-bold text-black hover:bg-gray-100 transition-all duration-250 shadow-xl hover:shadow-2xl hover:-translate-y-1"
                    data-testid="button-start-thinking"
                  >
                    Start Thinking
                    <ArrowRight className="w-6 h-6" />
                  </button>
                </Link>
                <button
                  onClick={scrollToHowItWorks}
                  className="inline-flex items-center gap-3 rounded-2xl border border-white/10 px-8 py-5 text-lg font-bold text-gray-300 hover:border-white/20 hover:text-white transition-all duration-250"
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
            className="flex flex-col sm:flex-row items-center justify-center gap-10 text-gray-500 text-base font-medium"
          >
            <div className="flex items-center gap-3" data-testid="text-trust-local">
              <HardDrive className="w-5 h-5 text-purple-400/70" />
              <span>Stored on your device</span>
            </div>
            <div className="flex items-center gap-3" data-testid="text-trust-ai">
              <Bot className="w-5 h-5 text-blue-400/70" />
              <span>AI only when you ask</span>
            </div>
            <div className="flex items-center gap-3" data-testid="text-trust-private">
              <Shield className="w-5 h-5 text-green-400/70" />
              <span>Private by default</span>
            </div>
          </motion.div>
        </div>
      </motion.section>

      <RevealSection>
        <section id="how-it-works" className="relative py-32 bg-[#030303] border-t border-white/[0.05]">
          <div className="max-w-5xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight" data-testid="text-zones-headline">
                Three Zones for Clear Thinking
              </h2>
              <p className="text-xl text-gray-500 max-w-3xl mx-auto">
                DJZS organizes your thoughts into dedicated zones, so you can focus on what matters.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <ZoneFeatureCard
                icon={<BookOpen className="w-7 h-7 text-blue-400" />}
                color="blue"
                title="Daily Journaling"
                description="Capture your thoughts and feelings. Get instant summaries, insights, and emotional signals to understand your patterns."
                examplePrompt="Journal: Today I felt scattered and distracted..."
                href={isConnected ? "/chat" : "/chat"}
              />
              <ZoneFeatureCard
                icon={<Search className="w-7 h-7 text-green-400" />}
                color="green"
                title="Deep Research"
                description="Save links, notes, and clippings. When you're ready, synthesize them into a clear thesis with contradictions and open questions."
                examplePrompt="Research: Save this link..."
                href={isConnected ? "/chat?zone=research" : "/chat"}
              />
              <ZoneFeatureCard
                icon={<Brain className="w-7 h-7 text-purple-400" />}
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
        <section className="relative py-32 bg-black border-t border-white/[0.05]">
          <div className="max-w-5xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight" data-testid="text-stability-headline">
                Built for Stability, Not Hype
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <StabilityCard
                icon={<HardDrive className="w-6 h-6 text-purple-400" />}
                title="Local-First & Private"
                description="Your data is stored on your device, not our servers. Your thinking is yours alone."
              />
              <StabilityCard
                icon={<Bot className="w-6 h-6 text-blue-400" />}
                title="AI on Your Terms"
                description="The AI only analyzes what you tell it to, when you tell it to. No passive listening, no data mining."
              />
              <StabilityCard
                icon={<Shield className="w-6 h-6 text-green-400" />}
                title="Open & Stable"
                description="Built on a clean, open architecture. This is a tool you can rely on for years, not a disposable app."
              />
            </div>
          </div>
        </section>
      </RevealSection>

      <RevealSection>
        <section className="relative py-24 bg-[#030303] border-t border-white/[0.05]">
          <div className="relative z-10 max-w-4xl mx-auto px-6">
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 mb-6">
                <Shield className="w-4 h-4 text-purple-400" />
                <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">Privacy Architecture</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-black text-white mb-6 tracking-tight" data-testid="text-privacy-headline">
                How DJZS Handles Your Data
              </h2>
              <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
                Your journal and research data is stored locally on your device. AI analysis only happens when you explicitly request it.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-10">
              <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
                <div className="w-14 h-14 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-6">
                  <HardDrive className="w-7 h-7 text-purple-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Local-First Storage</h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  All journal entries, research notes, and memories are stored in your browser's IndexedDB. Works offline. No cloud database.
                </p>
              </div>
              <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
                <div className="w-14 h-14 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-6">
                  <Bot className="w-7 h-7 text-blue-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">User-Controlled AI</h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  AI only sees your data when you click "Think with me." Nothing is sent automatically. You control what the AI receives.
                </p>
              </div>
              <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
                <div className="w-14 h-14 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center mb-6">
                  <Shield className="w-7 h-7 text-orange-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Privacy-Focused Providers</h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  Powered by Venice AI (no data retention) and Brave Search (no tracking). Your queries are not stored or used for training.
                </p>
              </div>
            </div>

            <div className="p-8 rounded-2xl bg-gradient-to-r from-purple-500/[0.05] to-blue-500/[0.05] border border-white/[0.08]">
              <p className="text-center text-gray-300 text-lg leading-relaxed">
                When you request AI insights, only the text you select is sent to privacy-focused AI providers. The response is saved locally on your device. We do not permanently store your data on any server.
              </p>
              <p className="text-center text-[10px] text-gray-600 mt-4 uppercase tracking-wider">
                Planned: encryption-at-rest for local storage · E2E encrypted AI requests
              </p>
            </div>
          </div>
        </section>
      </RevealSection>

      <RevealSection>
        <section className="relative py-24 bg-black border-t border-white/[0.05]">
          <div className="relative z-10 max-w-4xl mx-auto px-6">
            <div className="divide-y divide-white/[0.05]">
              <FAQItem question="How is DJZS different from ChatGPT or Claude?">
                <p>DJZS is not a chat app and not a general AI assistant.</p>
                <p className="text-gray-600 mt-2">ChatGPT and Claude are centralized AI platforms:</p>
                <ul className="list-disc list-inside text-gray-600 ml-2">
                  <li>Your conversations happen on their servers</li>
                  <li>Memory is global or platform-controlled</li>
                  <li>The primary interaction is asking questions</li>
                </ul>
                <p className="text-gray-400 mt-3">DJZS is a local-first thinking system:</p>
                <ul className="list-disc list-inside text-gray-400 ml-2">
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
                <p className="mt-3 text-gray-600">Centralized servers — and public blockchains — are still single points of failure. They can be indexed, surveilled, or compromised.</p>
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
                    <p className="text-purple-400 font-semibold mb-1">Journal mode</p>
                    <ul className="list-disc list-inside ml-2 text-sm">
                      <li>Summary</li>
                      <li>Insight</li>
                      <li>Reflection question</li>
                    </ul>
                  </div>
                  <div>
                    <p className="text-blue-400 font-semibold mb-1">Research mode</p>
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
        <section className="relative py-32 bg-[#030303] border-t border-white/[0.05]">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight" data-testid="text-final-cta-headline">
              Ready to build a better thinking habit?
            </h2>
            <p className="text-xl text-gray-500 mb-12">
              Start with a single entry.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link href="/chat">
                <button
                  className="inline-flex items-center gap-3 rounded-2xl bg-purple-600 px-10 py-5 text-lg font-bold text-white hover:bg-purple-500 transition-all duration-250 shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/30 hover:-translate-y-1"
                  data-testid="button-final-get-started"
                >
                  Get Started
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

      <footer className="border-t border-white/[0.05] py-24 bg-black">
        <div className="max-w-4xl mx-auto px-6 flex flex-col items-center text-center gap-10">
          <div>
            <h2 className="text-3xl font-black text-white tracking-widest uppercase mb-3">
              DJZS
            </h2>
            <p className="text-gray-500 text-base font-medium">
              A thinking system, not a network
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-8">
            <Link href="/about" className="text-base text-gray-400 hover:text-purple-400 transition-colors" data-testid="link-footer-about">
              About
            </Link>
            <Link href="/docs" className="text-base text-gray-400 hover:text-purple-400 transition-colors" data-testid="link-footer-docs">
              Docs
            </Link>
            <Link href="/privacy" className="text-base text-gray-400 hover:text-purple-400 transition-colors" data-testid="link-footer-privacy">
              Privacy
            </Link>
            <Link href="/security" className="text-base text-gray-400 hover:text-purple-400 transition-colors" data-testid="link-footer-security">
              Security
            </Link>
            <Link href="/terms" className="text-base text-gray-400 hover:text-purple-400 transition-colors" data-testid="link-footer-terms">
              Terms
            </Link>
            <Link href="/roadmap" className="text-base text-gray-400 hover:text-purple-400 transition-colors" data-testid="link-footer-roadmap">
              Roadmap
            </Link>
            {isConnected && (
              <Link href="/chat" className="text-base font-semibold text-purple-400 hover:text-purple-300 transition-colors" data-testid="link-footer-enter">
                Enter
              </Link>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-8 text-gray-600">
            <a href="https://github.com/djzs" target="_blank" rel="noopener noreferrer" className="text-sm hover:text-purple-400 transition-colors" data-testid="link-footer-github">
              GitHub
            </a>
            <span className="text-gray-800">·</span>
            <a href="https://x.com/djzs_box" target="_blank" rel="noopener noreferrer" className="text-sm hover:text-purple-400 transition-colors" data-testid="link-footer-twitter">
              X / Twitter
            </a>
            <span className="text-gray-800">·</span>
            <a href="mailto:hello@dj-z-s.box" className="text-sm hover:text-purple-400 transition-colors" data-testid="link-footer-contact">
              Contact
            </a>
          </div>

          <p className="text-[10px] text-gray-700 uppercase tracking-widest">
            © 2026 DJZS System
          </p>
        </div>
      </footer>

      {!isConnected && (
        <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-black/95 backdrop-blur-xl border-t border-white/[0.05] p-4 safe-area-inset-bottom">
          <div className="flex items-center gap-3 max-w-lg mx-auto">
            <Link href="/chat" className="flex-1">
              <button
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3.5 text-sm font-bold text-black hover:bg-gray-100 transition-colors min-h-[48px]"
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
  color: "blue" | "green" | "purple";
  title: string;
  description: string;
  examplePrompt: string;
  href: string;
}) {
  const borderColors = {
    blue: "hover:border-blue-500/30",
    green: "hover:border-green-500/30",
    purple: "hover:border-purple-500/30",
  };

  return (
    <Link href={href}>
      <motion.div
        whileHover={{ y: -4, scale: 1.01 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className={`h-full p-10 rounded-2xl bg-white/[0.02] border border-white/[0.06] ${borderColors[color]} transition-colors duration-250 cursor-pointer group`}
        data-testid={`card-zone-${color}`}
      >
        <div className="w-16 h-16 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mb-8 group-hover:border-white/[0.12] transition-colors">
          {icon}
        </div>
        <h3 className="text-2xl font-bold text-white mb-4">{title}</h3>
        <p className="text-gray-500 text-base leading-relaxed mb-8">{description}</p>
        <div className="px-5 py-4 rounded-lg bg-white/[0.02] border border-white/[0.04]">
          <p className="text-sm text-gray-600 font-mono italic">"{examplePrompt}"</p>
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
      className="p-10 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.10] transition-colors duration-250"
      data-testid={`card-stability-${title.toLowerCase().replace(/\s+/g, '-')}`}
    >
      <div className="w-14 h-14 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mb-6">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-white mb-4">{title}</h3>
      <p className="text-gray-500 text-base leading-relaxed">{description}</p>
    </motion.div>
  );
}

function FAQItem({ question, children }: { question: string; children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="py-8 group">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-6 text-left"
        data-testid={`button-faq-${question.slice(0, 20).toLowerCase().replace(/\s+/g, '-')}`}
      >
        <h3 className="text-2xl md:text-3xl font-bold text-white group-hover:text-purple-300 transition-colors">{question}</h3>
        <div className="shrink-0 w-12 h-12 rounded-full border border-white/[0.1] flex items-center justify-center group-hover:border-purple-500/30 transition-all">
          <motion.div
            animate={{ rotate: isOpen ? 45 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <Plus className="w-6 h-6 text-purple-400" />
          </motion.div>
        </div>
      </button>
      <motion.div
        initial={false}
        animate={{ height: isOpen ? "auto" : 0, opacity: isOpen ? 1 : 0 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="overflow-hidden"
      >
        <div className="text-gray-500 leading-relaxed font-medium text-lg pt-6 max-w-3xl space-y-4">{children}</div>
      </motion.div>
    </div>
  );
}
