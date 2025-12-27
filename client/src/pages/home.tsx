import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Shield, ArrowRight, Lock, Network, Sparkles, BookOpen, Search as SearchIcon, ChevronDown, Home as HomeIcon, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { motion } from "framer-motion";

export default function Home() {
  const { isConnected } = useAccount();

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden selection:bg-purple-500/30">
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
            @keyframes pulse-ring {
              0% { transform: scale(.8); opacity: 0.5; }
              50% { transform: scale(1); opacity: 0.3; }
              100% { transform: scale(1.2); opacity: 0; }
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
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black">
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
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-10"
          >
            <h1 className="text-7xl md:text-9xl font-black leading-[0.9] tracking-tighter mb-8">
              <span className="block">Pri<span className="text-purple-500">vate.</span></span>
              <span className="block">Struc<span className="text-purple-400">tured.</span></span>
              <span className="block"><span className="text-purple-600">Yours.</span></span>
            </h1>
            <p className="text-2xl md:text-3xl text-gray-400 max-w-3xl mx-auto leading-relaxed font-medium">
              Your private space to think, reflect, and extract insight.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            {isConnected ? (
              <div className="flex flex-col items-center gap-6">
                <Link href="/chat">
                  <div className="relative group">
                    <div className="absolute -inset-1 bg-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                    <Button 
                      size="lg" 
                      className="relative bg-purple-600 hover:bg-purple-700 text-white h-20 px-12 text-2xl font-black rounded-2xl shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 group overflow-hidden"
                      style={{ animation: "djzsPulse 4s infinite" }}
                      data-testid="button-start-writing"
                    >
                      <Sparkles className="mr-3 w-6 h-6 group-hover:rotate-12 transition-transform" />
                      Start Writing
                      <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-2 transition-transform" />
                    </Button>
                  </div>
                </Link>
                <Link href="/chat">
                  <button className="text-gray-500 hover:text-gray-300 text-sm font-bold uppercase tracking-widest transition-colors flex items-center gap-2">
                    Open Existing Journals
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </Link>
              </div>
            ) : (
              <div className="flex justify-center scale-125">
                <ConnectButton showBalance={false} />
              </div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="mt-20"
          >
            <div className="max-w-md mx-auto">
              <p className="text-[10px] text-gray-500 font-black tracking-[0.4em] uppercase mb-8 text-center opacity-40">The Zone Flow</p>
              <div className="flex flex-col items-center justify-center space-y-4">
                <FlowStep label="Wallet Identity" index={0} />
                <FlowArrow index={0} />
                <FlowStep label="Zones" index={1} highlight />
                <FlowArrow index={1} />
                <FlowStep label="Insights & Intelligence" index={2} />
              </div>
            </div>
          </motion.div>
        </div>

        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 opacity-20 hover:opacity-100 transition-opacity cursor-pointer">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Scroll to Explore</p>
          <motion.div 
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <ChevronDown className="w-6 h-6 text-purple-400" />
          </motion.div>
        </div>
      </section>

      {isConnected && (
        <section className="relative py-32 bg-black border-t border-white/[0.03] overflow-hidden">
          <div className="relative z-10 max-w-6xl mx-auto px-10">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="mb-20"
            >
              <h2 className="text-6xl font-black mb-6 tracking-tighter">Your Zones</h2>
              <p className="text-2xl text-gray-500 max-w-3xl leading-relaxed font-medium">
                Everything you think and track lives here. Private, structured, and accumulating value over time.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ZoneCard 
                name="Journal" 
                desc="Write daily thoughts & reflections" 
                icon={<BookOpen className="w-8 h-8" />} 
                highlight
                delay={0.1}
              />
              <ZoneCard 
                name="Research" 
                desc="Log facts & extract intelligence" 
                icon={<SearchIcon className="w-8 h-8" />} 
                delay={0.2}
              />
            </div>
          </div>
        </section>
      )}

      <section className="relative py-32 bg-[#050505] border-t border-white/[0.03] overflow-hidden">
        <div className="relative z-10 max-w-7xl mx-auto px-10">
          <div className="grid md:grid-cols-2 gap-20 items-center">
            <div>
              <h2 className="text-6xl font-black mb-8 tracking-tighter">
                Built For <span className="text-purple-500">Clarity.</span>
              </h2>
              <p className="text-xl text-gray-500 leading-relaxed font-medium mb-12">
                DJZS isn't a social network. It's a personal operating system for your mind. End-to-end encrypted, wallet-owned, and AI-assisted.
              </p>
              <div className="space-y-10">
                <FeatureRow 
                  icon={<Lock className="w-6 h-6 text-purple-400" />}
                  title="Zero-Knowledge Privacy"
                  desc="Your entries are encrypted locally. No one, not even us, can read your mind."
                />
                <FeatureRow 
                  icon={<Zap className="w-6 h-6 text-yellow-400" />}
                  title="Insight Extraction"
                  desc="The Zone Agent monitors your entries to surface patterns and answer questions."
                />
                <FeatureRow 
                  icon={<Network className="w-6 h-6 text-green-400" />}
                  title="Knowledge Compounding"
                  desc="Turn raw notes into a structured knowledge base that lives on-chain."
                />
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-[3rem] bg-gradient-to-br from-purple-600/10 to-blue-600/10 border border-white/[0.05] p-10 flex items-center justify-center overflow-hidden group">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(168,85,247,0.1),transparent_70%)]"></div>
                <BookOpen className="w-40 h-40 text-purple-500/20 group-hover:text-purple-500/40 transition-all duration-700 transform group-hover:scale-110" />
              </div>
            </div>
          </div>
        </div>
      </section>

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

      <footer className="relative border-t border-white/[0.03] bg-[#050505] pt-0 pb-20 overflow-hidden">
        {/* Footer Marquee Banner */}
        <div
          style={{
            position: "relative",
            zIndex: 2,
            width: "100%",
            overflow: "hidden",
            padding: "40px 0",
            borderBottom: "1px solid rgba(255,255,255,0.03)",
            marginBottom: "60px"
          }}
        >
          <div className="marquee-banner" style={{ width: "100%" }}>
            <div className="marquee-content">
              <span
                style={{
                  fontSize: "clamp(32px, 5vw, 80px)",
                  fontWeight: 900,
                  lineHeight: 1,
                  color: "rgba(255,255,255,0.15)",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                DECENTRALIZED JOURNALING ZONE SYSTEM &nbsp; • &nbsp;
              </span>
              <span
                style={{
                  fontSize: "clamp(32px, 5vw, 80px)",
                  fontWeight: 900,
                  lineHeight: 1,
                  color: "rgba(255,255,255,0.15)",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                DECENTRALIZED JOURNALING ZONE SYSTEM &nbsp; • &nbsp;
              </span>
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

function FlowStep({ label, index, highlight }: { label: string; index: number; highlight?: boolean }) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ 
        delay: 1.5 + (index * 0.4),
        duration: 0.5
      }}
      className={`px-6 py-2 rounded-full border text-[10px] font-black uppercase tracking-widest transition-all duration-500 ${
        highlight 
          ? "bg-purple-600 border-purple-500 text-white shadow-[0_0_20px_rgba(168,85,247,0.3)]" 
          : "bg-white/5 border-white/10 text-gray-300" 
      }`}
    >
      {label}
    </motion.div>
  );
}

function FlowArrow({ index }: { index: number }) {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, 1, 0.3] }}
      transition={{ 
        delay: 1.7 + (index * 0.4),
        duration: 0.5,
        times: [0, 0.5, 1]
      }}
      className="text-gray-800 font-bold"
    >
      ↓
    </motion.div>
  );
}

function ZoneCard({ name, desc, icon, highlight, delay }: { name: string; desc: string; icon: React.ReactNode; highlight?: boolean; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
    >
      <Link href="/chat">
        <div className={`p-10 rounded-[2.5rem] border transition-all duration-500 group cursor-pointer relative overflow-hidden h-full ${
          highlight 
            ? "bg-white/[0.03] border-purple-500/30 hover:border-purple-500 hover:bg-white/[0.05] hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(168,85,247,0.1)]" 
            : "bg-white/[0.01] border-white/[0.05] hover:border-white/20 hover:bg-white/[0.02] hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(255,255,255,0.05)]"
        }`}>
          <div className={`w-16 h-16 rounded-2xl mb-8 flex items-center justify-center transition-all duration-500 group-hover:scale-110 ${
            highlight ? "bg-purple-600/20 text-purple-400" : "bg-white/5 text-gray-500"
          }`}>
            {icon}
          </div>
          <h3 className="text-3xl font-black text-white mb-3 tracking-tight group-hover:translate-x-1 transition-transform">{name}</h3>
          <p className="text-lg text-gray-500 font-medium group-hover:text-gray-400 transition-colors">{desc}</p>
          
          {highlight && (
            <div className="absolute top-8 right-8 w-2 h-2 rounded-full bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]"></div>
          )}
        </div>
      </Link>
    </motion.div>
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
    <div className="p-8 rounded-3xl bg-white/[0.01] border border-white/[0.03] hover:border-white/[0.1] hover:bg-white/[0.02] transition-all group">
      <h3 className="text-lg font-bold text-white mb-4 group-hover:text-purple-300 transition-colors">{question}</h3>
      <p className="text-gray-500 leading-relaxed font-medium">{answer}</p>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/[0.03] hover:border-white/[0.1] transition-all">
      <p className="text-xs font-black text-purple-400 uppercase tracking-widest mb-4 opacity-50">{label}</p>
      <p className="text-sm text-gray-400 font-bold leading-relaxed">{value}</p>
    </div>
  );
}
