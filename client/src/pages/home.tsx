import { useState, type ReactNode } from "react";
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
            Local-first AI journaling and research. Memory that stays yours.
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
                  <span>Privacy</span>
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <ZoneCard 
                title="Journal" 
                desc="Daily reflections with a calm thinking partner" 
                startHere={isConnected}
                href={isConnected ? "/chat" : "#"}
              />
              <ZoneCard 
                title="Research" 
                desc="Gather claims, track evidence, surface unknowns" 
                href={isConnected ? "/chat?zone=research" : "#"}
              />
              <ZoneCard 
                title="Trade" 
                desc="Execute with clarity. Think through trades before you act." 
                href={isConnected ? "/chat?zone=trade" : "#"}
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
                title="Instant & Offline"
                frontText="No spinners. No waiting. The act of thinking never waits on the network."
                status="aligned"
                backItems={[
                  "Writes to IndexedDB immediately — no network required",
                  "Works fully offline: journaling, pins, history, review",
                  "Network only used when you explicitly invoke AI or sync"
                ]}
              />
              <FlipFeatureCard 
                icon={<Shield className="w-6 h-6 text-blue-400" />}
                title="You Own Your Data"
                frontText="Long-term preservation. If DJZS disappears, your thinking remains."
                status="aligned"
                backItems={[
                  "Data lives locally in open, exportable formats",
                  "No proprietary server-locked formats",
                  "No subscription required to access your history",
                  "Exit anytime with your data intact"
                ]}
              />
              <FlipFeatureCard 
                icon={<Bot className="w-6 h-6 text-gray-400" />}
                title="Thinking, Not Collaboration"
                frontText="Personal cognition workflows. Collaboration introduces surveillance risk."
                status="intentional"
                backItems={[
                  "No real-time co-editing or shared cursors",
                  "No multi-user presence or social pressure",
                  "Sync is optional, not assumed",
                  "DJZS chooses clarity over collaboration"
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
                  <li>Data is encrypted end-to-end before it ever leaves your machine</li>
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

              <FAQItem question="Why not store everything on a centralized server or blockchain?">
                <p className="text-white font-semibold">Because that's not decentralized — it's just outsourced risk.</p>
                <div className="grid grid-cols-2 gap-4 mt-3">
                  <div>
                    <p className="text-gray-400 font-semibold mb-1">Centralized servers:</p>
                    <ul className="list-disc list-inside ml-2 text-sm">
                      <li>Attractive targets for breaches</li>
                      <li>Require trust in a company</li>
                      <li>Turn private thinking into stored assets</li>
                    </ul>
                  </div>
                  <div>
                    <p className="text-gray-400 font-semibold mb-1">Public blockchains:</p>
                    <ul className="list-disc list-inside ml-2 text-sm">
                      <li>Permanent and indexable</li>
                      <li>Not designed for private cognition</li>
                      <li>Can expose metadata</li>
                    </ul>
                  </div>
                </div>
                <p className="mt-3">DJZS uses local-first storage and treats cloud or blockchain as optional, secondary, and user-initiated.</p>
              </FAQItem>

              <FAQItem question="Can I sync or back up my data?">
                <p className="text-white font-semibold">Yes — when you choose to.</p>
                <ul className="list-disc list-inside ml-2 mt-2">
                  <li>Export your data</li>
                  <li>Back it up</li>
                  <li>Timestamp or prove ownership using decentralized networks</li>
                </ul>
                <p className="mt-3">But DJZS never requires this. The system works without sync. Sync exists for your convenience, not control.</p>
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

              <FAQItem question="What is a 'Zone'?">
                <p>A Zone is a thinking context.</p>
                <p className="mt-2">Zones help you separate:</p>
                <ul className="list-disc list-inside ml-2">
                  <li>Journaling</li>
                  <li>Research</li>
                  <li>Reflection</li>
                  <li>Long-term memory</li>
                </ul>
                <p className="mt-3">Each Zone changes how the AI responds, without mixing your thoughts into a feed or profile.</p>
                <p className="text-white mt-2 font-semibold">You move through Zones. You don't perform in them.</p>
              </FAQItem>
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
            <Link href="/docs" className="hover:text-purple-400 transition-colors">Docs</Link>
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

function FAQItem({ question, children }: { question: string; children: ReactNode }) {
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
        <div className="text-gray-500 leading-relaxed font-medium text-base pt-4 max-w-2xl space-y-3">{children}</div>
      </motion.div>
    </div>
  );
}
