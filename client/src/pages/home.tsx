import { useState } from "react";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { HardDrive, Shield, Bot, Plus } from "lucide-react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { pageContainer, fadeUp } from "@/lib/animations";
import { StartWritingButton, ScrollCue, ZoneCard, MarqueeBanner, RevealSection, AnimatedBackground, CursorSpotlight, ThinkFlywheel, ZoneFlywheel, ClarityFlywheel, FAQFlywheel, PortalBackground, FlipFeatureCard } from "@/components/hero";

export default function Home() {
  const { isConnected } = useAccount();

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden selection:bg-purple-500/30">
      <CursorSpotlight />
      {/* Time-of-day animated background */}
      <AnimatedBackground />
      {/* Header Banner */}
      <header className="sticky top-0 z-50">
        <div style={{ position: "relative", overflow: "hidden", borderRadius: 0 }}>
          <style>{`
            @keyframes djzsDrift {
              0% { transform: translate3d(0,0,0) scale(1); }
              50% { transform: translate3d(-2%,1.5%,0) scale(1.03); }
              100% { transform: translate3d(0,0,0) scale(1); }
            }
            @keyframes djzsStars {
              0% { background-position: 0 0, 40px 60px; }
              100% { background-position: 800px 600px, 900px 720px; }
            }
            @keyframes djzsShimmer {
              0% { transform: translateX(-12%) rotate(0deg); opacity:0; }
              20% { opacity:.18; }
              50% { transform: translateX(12%) rotate(8deg); opacity:.10; }
              100% { transform: translateX(-12%) rotate(0deg); opacity:0; }
            }
            @keyframes djzsPulse {
              0%,100% { opacity:.45; transform: scale(1); }
              50% { opacity:.7; transform: scale(1.03); }
            }
          `}</style>

          {/* Background */}
          <div
            style={{
              position: "absolute",
              inset: "-30%",
              background: `
                radial-gradient(900px 380px at 15% 35%, rgba(140,80,255,.35), transparent 60%),
                radial-gradient(900px 420px at 85% 55%, rgba(80,210,255,.28), transparent 60%),
                radial-gradient(1100px 520px at 50% -10%, rgba(255,255,255,.14), transparent 60%)
              `,
              filter: "blur(10px)",
              animation: "djzsDrift 16s ease-in-out infinite",
            }}
          />

          {/* Stars */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage: `
                radial-gradient(rgba(255,255,255,.8) 1px, transparent 1px),
                radial-gradient(rgba(255,255,255,.45) 1px, transparent 1px)
              `,
              backgroundSize: "90px 90px, 140px 140px",
              backgroundPosition: "0 0, 40px 60px",
              opacity: 0.25,
              animation: "djzsStars 40s linear infinite",
              pointerEvents: "none",
            }}
          />

          {/* Shimmer */}
          <div
            style={{
              position: "absolute",
              inset: "-40%",
              background:
                "linear-gradient(110deg, transparent 0%, rgba(255,255,255,.12) 45%, transparent 60%)",
              filter: "blur(16px)",
              animation: "djzsShimmer 10s ease-in-out infinite",
              pointerEvents: "none",
            }}
          />

          {/* Glow */}
          <div
            style={{
              position: "absolute",
              left: "10%",
              top: "20%",
              width: "80%",
              height: "70%",
              background:
                "radial-gradient(circle at 30% 40%, rgba(160,110,255,.45), transparent 60%)",
              filter: "blur(20px)",
              animation: "djzsPulse 6s ease-in-out infinite",
              pointerEvents: "none",
            }}
          />

          {/* Vignette */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,.65))",
              pointerEvents: "none",
            }}
          />

          {/* Full-width Marquee Banner */}
          <div
            style={{
              position: "relative",
              zIndex: 2,
              width: "100%",
              overflow: "hidden",
              padding: "20px 0",
            }}
          >
            <div className="marquee-banner" style={{ width: "100%" }}>
              <div className="marquee-content">
                <span
                  style={{
                    fontSize: "clamp(48px, 8vw, 120px)",
                    fontWeight: 900,
                    lineHeight: 1,
                    color: "rgba(255,255,255,.95)",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    textShadow:
                      "0 0 30px rgba(140,80,255,.5), 0 0 60px rgba(80,210,255,.3)",
                  }}
                >
                  DECENTRALIZED JOURNALING ZONE SYSTEM
                </span>
                <span
                  style={{
                    fontSize: "clamp(48px, 8vw, 120px)",
                    fontWeight: 900,
                    lineHeight: 1,
                    color: "rgba(255,255,255,.95)",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    textShadow:
                      "0 0 30px rgba(140,80,255,.5), 0 0 60px rgba(80,210,255,.3)",
                  }}
                >
                  DECENTRALIZED JOURNALING ZONE SYSTEM
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <motion.section
        variants={pageContainer}
        initial="hidden"
        animate="show"
        className="relative min-h-[80vh] flex items-center justify-center overflow-hidden bg-black pb-12"
      >
        <PortalBackground variant="hero" />

        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center pt-12">
          <ThinkFlywheel />

          <motion.p variants={fadeUp} className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto leading-relaxed font-medium mb-4">
            A local-first journal and research system. Your thoughts live with you — not on a platform.
          </motion.p>
          <motion.p variants={fadeUp} className="text-sm md:text-base text-gray-600 max-w-2xl mx-auto font-medium mb-10">
            No feeds. No surveillance. No centralized memory.
          </motion.p>

          <motion.div variants={fadeUp}>
            {isConnected ? (
              <div className="flex flex-col items-center gap-6">
                <StartWritingButton />
                <div className="flex items-center gap-4 text-gray-500 font-bold text-[10px] uppercase tracking-widest opacity-60">
                  <span>Local-first</span>
                  <span>•</span>
                  <span>Your data stays yours</span>
                  <span>•</span>
                  <span>No feed</span>
                </div>
              </div>
            ) : (
              <div className="flex justify-center scale-125">
                <ConnectButton showBalance={false} />
              </div>
            )}
          </motion.div>

          <motion.div variants={fadeUp} className="mt-12">
            <ScrollCue />
          </motion.div>
        </div>
      </motion.section>

      <RevealSection>
        <section className="relative py-12 bg-black border-t border-white/[0.03] overflow-hidden">
          <PortalBackground variant="zone" />
          <div className="relative z-10 max-w-6xl mx-auto px-10">
            <div className="text-center mb-8">
              <ZoneFlywheel />
              <p className="text-xl md:text-2xl text-gray-500 max-w-3xl mx-auto leading-relaxed font-medium">
                Your thinking lives on your device. Sync only when you choose. A tool, not a network.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              <ZoneCard 
                title="Journal" 
                desc="Daily reflections with a calm thinking partner" 
                startHere={isConnected}
              />
              <ZoneCard 
                title="Research" 
                desc="Gather claims, track evidence, surface unknowns" 
              />
            </div>
            
            {!isConnected && (
              <div className="mt-16 text-center">
                <div className="inline-block p-[1px] rounded-full bg-gradient-to-r from-purple-500 to-blue-500 shadow-[0_0_20px_rgba(168,85,247,0.3)]">
                  <div className="px-8 py-3 rounded-full bg-black text-xs font-black uppercase tracking-widest text-white">
                    Connect wallet to enter your zones
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      </RevealSection>

      <RevealSection>
        <section className="relative py-12 bg-[#050505] border-t border-white/[0.03] overflow-hidden">
          <PortalBackground variant="clarity" />
          <div className="relative z-10 max-w-5xl mx-auto px-10 text-center">
            <ClarityFlywheel />
            <p className="text-xl md:text-2xl text-gray-500 leading-relaxed font-medium mb-8 max-w-3xl mx-auto">
              DJZS is infrastructure for your thinking. Not a platform. Not a network. A tool you own.
            </p>
            <div className="grid md:grid-cols-3 gap-8">
              <FlipFeatureCard 
                icon={<HardDrive className="w-6 h-6 text-purple-400" />}
                title="Local-First by Default"
                frontText="Your journal and research live on your device. Nothing syncs unless you choose."
                backItems={[
                  "Entries, insights, and memory pins stay in your browser",
                  "Works offline — no internet required",
                  "Export anytime, sync only when you decide"
                ]}
              />
              <FlipFeatureCard 
                icon={<Shield className="w-6 h-6 text-blue-400" />}
                title="Decentralized Ownership"
                frontText="Back up or timestamp your work without handing your mind to a company."
                backItems={[
                  "Wallet = your portable, platform-free identity",
                  "Optional timestamps for provenance",
                  "No lock-in — take your data anywhere"
                ]}
              />
              <FlipFeatureCard 
                icon={<Bot className="w-6 h-6 text-green-400" />}
                title="AI Without a Platform"
                frontText="A calm Thinking Partner. No feeds. No social graphs. No engagement loops."
                backItems={[
                  "Only your current entry + pinned memories are used",
                  "Journal: summary, insight, reflection question",
                  "Research: claims, evidence, unknowns",
                  "You choose what to remember"
                ]}
              />
            </div>
          </div>
        </section>
      </RevealSection>

      <RevealSection>
        <section className="relative py-12 bg-black border-t border-white/[0.03] overflow-hidden">
          <PortalBackground variant="faq" />
          <div className="relative z-10 max-w-4xl mx-auto px-10">
            <div className="text-center mb-8">
              <FAQFlywheel />
            </div>
            <div className="divide-y divide-white/[0.05]">
              <FAQItem
                question="How is this different from ChatGPT or Claude?"
                answer="We don't optimize for engagement, and we don't generate content for you. DJZS reflects what you write, notices tensions, and asks questions so insight emerges naturally. You stay in the zone; we just hold the mirror."
              />
              <FAQItem
                question="What does 'decentralized' mean in DJZS?"
                answer="Your data doesn't live in one company's database. Your thinking isn't shaped by algorithms or feeds. Your history can't be locked, deleted, or monetized by a platform. DJZS is a tool — not a network."
              />
              <FAQItem
                question="Is my data really private?"
                answer="Your entries live in your browser's local storage (IndexedDB). Nothing syncs unless you choose. No servers see your thoughts."
              />
              <FAQItem
                question="How does the Thinking Partner work?"
                answer="When you tap 'Think with me,' only your current entry and pinned memories are sent to Venice AI. The response stays local. You decide what to remember."
              />
              <FAQItem
                question="What is a 'Zone'?"
                answer="A Zone is a dedicated space for a specific type of thinking — Journal for reflections, Research for facts and claims. Each has its own analysis format."
              />
            </div>
          </div>
        </section>
      </RevealSection>

      <footer className="relative border-t border-white/[0.03] pt-0 pb-20 overflow-hidden">
        <div style={{ position: "relative", overflow: "hidden", borderRadius: 0 }}>
          {/* Background */}
          <div
            style={{
              position: "absolute",
              inset: "-30%",
              background: `
                radial-gradient(900px 380px at 15% 35%, rgba(140,80,255,.35), transparent 60%),
                radial-gradient(900px 420px at 85% 55%, rgba(80,210,255,.28), transparent 60%),
                radial-gradient(1100px 520px at 50% -10%, rgba(255,255,255,.14), transparent 60%)
              `,
              filter: "blur(10px)",
              animation: "djzsDrift 16s ease-in-out infinite",
            }}
          />

          {/* Stars */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage: `
                radial-gradient(rgba(255,255,255,.8) 1px, transparent 1px),
                radial-gradient(rgba(255,255,255,.45) 1px, transparent 1px)
              `,
              backgroundSize: "90px 90px, 140px 140px",
              backgroundPosition: "0 0, 40px 60px",
              opacity: 0.25,
              animation: "djzsStars 40s linear infinite",
              pointerEvents: "none",
            }}
          />

          {/* Shimmer */}
          <div
            style={{
              position: "absolute",
              inset: "-40%",
              background:
                "linear-gradient(110deg, transparent 0%, rgba(255,255,255,.12) 45%, transparent 60%)",
              filter: "blur(16px)",
              animation: "djzsShimmer 10s ease-in-out infinite",
              pointerEvents: "none",
            }}
          />

          {/* Glow */}
          <div
            style={{
              position: "absolute",
              left: "10%",
              top: "20%",
              width: "80%",
              height: "70%",
              background:
                "radial-gradient(circle at 30% 40%, rgba(160,110,255,.45), transparent 60%)",
              filter: "blur(20px)",
              animation: "djzsPulse 6s ease-in-out infinite",
              pointerEvents: "none",
            }}
          />

          {/* Vignette */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,.65))",
              pointerEvents: "none",
            }}
          />

          {/* Footer Marquee Banner */}
          <div
            style={{
              position: "relative",
              zIndex: 2,
              width: "100%",
              overflow: "hidden",
              padding: "20px 0",
              marginBottom: "40px"
            }}
          >
            <div className="marquee-banner" style={{ width: "100%" }}>
              <div className="marquee-content">
                <span
                  style={{
                    fontSize: "clamp(48px, 8vw, 120px)",
                    fontWeight: 900,
                    lineHeight: 1,
                    color: "rgba(255,255,255,.95)",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    textShadow:
                      "0 0 30px rgba(140,80,255,.5), 0 0 60px rgba(80,210,255,.3)",
                  }}
                >
                  DECENTRALIZED JOURNALING ZONE SYSTEM
                </span>
                <span
                  style={{
                    fontSize: "clamp(48px, 8vw, 120px)",
                    fontWeight: 900,
                    lineHeight: 1,
                    color: "rgba(255,255,255,.95)",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    textShadow:
                      "0 0 30px rgba(140,80,255,.5), 0 0 60px rgba(80,210,255,.3)",
                  }}
                >
                  DECENTRALIZED JOURNALING ZONE SYSTEM
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-10 flex flex-col md:flex-row items-center justify-between gap-10">
          <div>
            <h2 className="text-2xl font-black text-white tracking-widest mb-2 uppercase">DJZS</h2>
            <p className="text-gray-600 text-sm font-medium uppercase tracking-widest">A thinking system, not a network</p>
          </div>
          <div className="flex items-center gap-12 text-[10px] font-black uppercase tracking-[0.3em] text-gray-600">
            <span className="opacity-50 cursor-default">Privacy</span>
            <span className="opacity-50 cursor-default">Terms</span>
            <span className="opacity-50 cursor-default">Roadmap</span>
            {isConnected && (
              <Link href="/chat" className="hover:text-purple-400 transition-colors">Enter</Link>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="py-6 group">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-4 text-left"
      >
        <h3 className="text-xl md:text-2xl font-bold text-white group-hover:text-purple-300 transition-colors">{question}</h3>
        <div className="shrink-0 w-10 h-10 rounded-full border border-white/[0.1] flex items-center justify-center group-hover:border-purple-500/30 transition-all">
          <motion.div
            animate={{ rotate: isOpen ? 45 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <Plus className="w-5 h-5 text-purple-400" />
          </motion.div>
        </div>
      </button>
      <motion.div
        initial={false}
        animate={{ height: isOpen ? "auto" : 0, opacity: isOpen ? 1 : 0 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="overflow-hidden"
      >
        <p className="text-gray-500 leading-relaxed font-medium text-lg pt-4 max-w-2xl">{answer}</p>
      </motion.div>
    </div>
  );
}
