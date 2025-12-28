import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Lock, Network, Zap, Search as SearchIcon, Sparkles } from "lucide-react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { pageContainer, fadeUp } from "@/lib/animations";
import { StartWritingButton, ZoneFlow, ScrollCue, ZoneCard, MarqueeBanner, RevealSection, AnimatedBackground } from "@/components/hero";

export default function Home() {
  const { isConnected } = useAccount();

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden selection:bg-purple-500/30">
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
        className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black"
      >
        <div
          style={{
            position: "absolute",
            inset: "-30%",
            background: `
              radial-gradient(900px 380px at 20% 40%, rgba(140,80,255,.25), transparent 60%),
              radial-gradient(900px 420px at 80% 60%, rgba(80,210,255,.2), transparent 60%),
              radial-gradient(1100px 520px at 50% 10%, rgba(255,255,255,.08), transparent 60%)
            `,
            filter: "blur(10px)",
            animation: "djzsDrift 16s ease-in-out infinite",
            pointerEvents: "none",
          }}
        />

        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          <motion.h1 variants={fadeUp} className="text-7xl md:text-9xl font-black leading-[0.9] tracking-tighter mb-8">
            <span className="block">Think <span className="text-purple-500">clearly.</span></span>
            <span className="block">Every <span className="text-purple-400">day.</span></span>
          </motion.h1>

          <motion.p variants={fadeUp} className="text-2xl md:text-3xl text-gray-400 max-w-3xl mx-auto leading-relaxed font-medium mb-10">
            DJZS is a private AI journal that summarizes your thinking and surfaces insight over time.
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

          <motion.div variants={fadeUp} className="mt-16">
            <p className="text-[10px] text-gray-500 font-black tracking-[0.4em] uppercase mb-6 text-center opacity-40">The Zone Flow</p>
            <div className="flex justify-center">
              <ZoneFlow />
            </div>
          </motion.div>

          <motion.div variants={fadeUp} className="mt-16">
            <ScrollCue />
          </motion.div>
        </div>
      </motion.section>

      {/* Scrolling Marquee Banner */}
      <MarqueeBanner />

      {isConnected && (
        <RevealSection>
          <section className="relative py-32 bg-black border-t border-white/[0.03] overflow-hidden">
            <div className="relative z-10 max-w-6xl mx-auto px-10">
              <div className="mb-20">
                <h2 className="text-6xl font-black mb-6 tracking-tighter">Your Zones</h2>
                <p className="text-2xl text-gray-500 max-w-3xl leading-relaxed font-medium">
                  Everything you think and track lives here. Private, structured, and accumulating value over time.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ZoneCard 
                  title="Journal" 
                  desc="Write daily thoughts & reflections" 
                  startHere
                />
                <ZoneCard 
                  title="Research" 
                  desc="Log facts & extract intelligence" 
                />
              </div>
            </div>
          </section>
        </RevealSection>
      )}

      <RevealSection>
        <section className="relative py-32 bg-[#050505] border-t border-white/[0.03] overflow-hidden">
          <div className="relative z-10 max-w-7xl mx-auto px-10">
            <div className="grid md:grid-cols-2 gap-20 items-center">
              <div>
                <h2 className="text-6xl font-black mb-8 tracking-tighter">
                  Built For <span className="text-purple-500">Clarity.</span>
                </h2>
                <p className="text-xl text-gray-500 leading-relaxed font-medium mb-12">
                  DJZS isn't a social network. It's a personal operating system for your mind. Private, owned, and AI-assisted.
                </p>
                <div className="space-y-10">
                  <FeatureRow 
                    icon={<Lock className="w-6 h-6 text-purple-400" />}
                    title="Private by Design"
                    desc="Your entries are encrypted locally. Only you hold the keys to your thoughts."
                  />
                  <FeatureRow 
                    icon={<Zap className="w-6 h-6 text-yellow-400" />}
                    title="Insight Extraction"
                    desc="The Zone Agent monitors your entries to surface patterns and answer questions."
                  />
                  <FeatureRow 
                    icon={<Network className="w-6 h-6 text-green-400" />}
                    title="Knowledge Compounding"
                    desc="Turn raw notes into a structured knowledge base that accumulates value over time."
                  />
                </div>
              </div>
              <div className="relative">
                <div className="rounded-[2rem] bg-gradient-to-br from-purple-500/[0.05] to-blue-500/[0.03] border border-purple-500/20 p-6 overflow-hidden">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-purple-600/20 flex items-center justify-center shrink-0">
                      <Sparkles className="w-5 h-5 text-purple-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-[9px] font-black text-purple-400 uppercase tracking-widest mb-3">Zone Agent Insight</p>
                      
                      <div className="space-y-4">
                        <div>
                          <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest mb-1">Summary</p>
                          <p className="text-white text-sm font-medium leading-relaxed">You're exploring a structured framework for organizing thoughts across multiple domains.</p>
                        </div>
                        
                        <div>
                          <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest mb-1">Insight</p>
                          <p className="text-gray-400 text-sm italic leading-relaxed">"This framework could become your personal operating system for structured thinking."</p>
                        </div>
                        
                        <div>
                          <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest mb-1">Reflection Question</p>
                          <p className="text-purple-300 text-sm font-medium">Which zone would benefit most from daily attention?</p>
                        </div>
                        
                        <div>
                          <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest mb-2">Worth Remembering</p>
                          <div className="space-y-2">
                            <div className="p-2 rounded-lg bg-white/[0.02] border border-white/[0.05]">
                              <p className="text-xs text-gray-400">Zones reduce context-switching overhead</p>
                            </div>
                            <div className="p-2 rounded-lg bg-white/[0.02] border border-white/[0.05]">
                              <p className="text-xs text-gray-400">Daily entries compound into insight</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </RevealSection>

      {/* Second Scrolling Marquee */}
      <MarqueeBanner />

      <RevealSection>
        <section className="relative py-32 bg-black border-t border-white/[0.03] overflow-hidden">
          <div className="relative z-10 max-w-3xl mx-auto px-10">
            <h2 className="text-5xl font-black mb-20 text-center tracking-tighter">Frequently Asked</h2>
            <div className="space-y-4">
              <FAQItem
                question="Is my data really private?"
                answer="Every entry is encrypted with XMTP before leaving your browser. Only you hold the keys."
              />
              <FAQItem
                question="How does the Agent work?"
                answer="The Zone Agent runs in a secure environment, extracting insights only from the content you've committed to a Zone."
              />
              <FAQItem
                question="What is a 'Zone'?"
                answer="A Zone is a dedicated encrypted thread for a specific type of thinking or coordination."
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
            <p className="text-gray-600 text-sm font-medium uppercase tracking-widest">Decentralized Journaling Zone System</p>
          </div>
          <div className="flex items-center gap-12 text-[10px] font-black uppercase tracking-[0.3em] text-gray-600">
            <a href="#" className="hover:text-purple-400 transition-colors">Privacy</a>
            <a href="#" className="hover:text-purple-400 transition-colors">Terms</a>
            <a href="#" className="hover:text-purple-400 transition-colors">Roadmap</a>
            <a href="#" className="hover:text-purple-400 transition-colors">Journal</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureRow({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="flex gap-6 items-start group">
      <div className="mt-1 w-12 h-12 rounded-xl bg-white/[0.03] border border-white/[0.05] flex items-center justify-center shrink-0 group-hover:border-purple-500/30 transition-all">
        {icon}
      </div>
      <div>
        <h4 className="text-xl font-black text-white mb-2 tracking-tight group-hover:text-purple-200 transition-colors">{title}</h4>
        <p className="text-gray-500 font-medium leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  return (
    <motion.div
      whileHover={{
        y: -2,
        boxShadow: "0 0 0 1px rgba(255,255,255,0.06), 0 12px 30px rgba(168,85,247,0.06)",
      }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      className="p-8 rounded-3xl bg-white/[0.01] border border-white/[0.03] hover:border-white/[0.1] hover:bg-white/[0.02] transition-all group"
    >
      <h3 className="text-lg font-bold text-white mb-4 group-hover:text-purple-300 transition-colors">{question}</h3>
      <p className="text-gray-500 leading-relaxed font-medium">{answer}</p>
    </motion.div>
  );
}
