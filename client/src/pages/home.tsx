import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Shield, Users, Zap, ArrowRight, Lock, Network, FileText, TrendingUp, BarChart3, Calendar, Receipt, Newspaper, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function Home() {
  const { isConnected } = useAccount();

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
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
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black">
        {/* Animated Background */}
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

        {/* Stars */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `
              radial-gradient(rgba(255,255,255,.6) 1px, transparent 1px),
              radial-gradient(rgba(255,255,255,.3) 1px, transparent 1px)
            `,
            backgroundSize: "90px 90px, 140px 140px",
            backgroundPosition: "0 0, 40px 60px",
            opacity: 0.15,
            animation: "djzsStars 40s linear infinite",
            pointerEvents: "none",
          }}
        />

        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          <div className="mb-8 space-y-4">
            <h1 className="text-6xl md:text-8xl font-black leading-tight">
              <span className="block">Pri<span className="text-purple-500">vate.</span></span>
              <span className="block">Struc<span className="text-purple-400">tured.</span></span>
              <span className="block"><span className="text-purple-600">Yours.</span></span>
            </h1>
          </div>

          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto mb-8 leading-relaxed">
            A zone-based system for private journaling, signals, predictions, and coordination — encrypted and owned by your wallet.
          </p>

          {isConnected ? (
            <Link href="/chat">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-10 py-7 text-lg font-semibold group"
                data-testid="button-enter-zones"
              >
                Enter Your Zones
                <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          ) : (
            <div className="flex justify-center">
              <ConnectButton showBalance={false} />
            </div>
          )}

          <p className="text-sm text-gray-500 mt-4">Your ENS is your identity. Your Zones compound over time.</p>

          {isConnected && (
            <div className="mt-12 border-t border-gray-700 pt-12">
              <p className="text-gray-500 text-sm mb-8 tracking-widest uppercase text-center">Your Zone Flow</p>
              <div className="flex flex-col items-center justify-center gap-2 text-gray-400 text-sm">
                <span>Wallet / ENS Identity</span>
                <span className="text-purple-400">↓</span>
                <strong className="text-purple-400 text-base">Zones</strong>
                <span className="text-purple-400">↓</span>
                <span>Journals · Signals · Predictions · Events</span>
              </div>
            </div>
          )}
          
          <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            <StatCard label="Journal in Zones" value="Private notes, research, and reflections" />
            <StatCard label="Signals & Predictions" value="Structured signals and prediction markets" />
            <StatCard label="Coordinate Securely" value="Events, receipts, and coordination" />
          </div>
        </div>
      </section>

      {/* Your Zones Section - Only when connected */}
      {isConnected && (
        <section className="relative py-24 bg-black border-t border-gray-800 overflow-hidden">
          {/* Animated Background */}
          <div
            style={{
              position: "absolute",
              inset: "-30%",
              background: `
                radial-gradient(900px 380px at 25% 50%, rgba(140,80,255,.2), transparent 60%),
                radial-gradient(900px 420px at 75% 50%, rgba(80,210,255,.15), transparent 60%)
              `,
              filter: "blur(10px)",
              animation: "djzsDrift 16s ease-in-out infinite",
              pointerEvents: "none",
            }}
          />
          <div className="relative z-10 max-w-6xl mx-auto px-6">
            {/* Header */}
            <div className="mb-12">
              <p className="text-xs text-gray-500 tracking-widest uppercase mb-3">DJZS SYSTEM</p>
              <h2 className="text-5xl font-black mb-4">Your Zones</h2>
              <p className="text-gray-400 text-lg max-w-2xl">
                DJZS organizes everything you do into Zones — private, encrypted spaces that accumulate knowledge, decisions, and history over time. Each Zone has structure, memory, and optional AI assistance.
              </p>
            </div>

            {/* System Diagram */}
            <div className="flex gap-3 items-center flex-wrap mb-12 text-gray-400 text-sm">
              <span>Wallet / ENS Identity</span>
              <span>→</span>
              <strong className="text-purple-400">Zones</strong>
              <span>→</span>
              <span>Journals · Signals · Predictions · Events</span>
            </div>

            {/* Zones Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 mb-8">
              {[
                { name: "User Zone", desc: "General coordination, notes, and shared context" },
                { name: "Signals", desc: "Structured trade ideas, execution notes, and outcomes" },
                { name: "Predictions", desc: "Markets, votes, and resolved outcomes" },
                { name: "Events", desc: "Calls, launches, milestones, and timelines" },
                { name: "Receipts", desc: "Payments, proofs, and on-chain records" },
              ].map((zone) => (
                <div
                  key={zone.name}
                  className="p-4 rounded-lg border border-gray-700 bg-gray-900/30 hover:bg-gray-800/50 transition-colors"
                >
                  <div className="font-semibold text-white">{zone.name}</div>
                  <div className="text-sm text-gray-400 mt-1">{zone.desc}</div>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex gap-3 items-center flex-wrap">
              <Link href="/chat">
                <Button 
                  size="lg" 
                  className="bg-purple-600 hover:bg-purple-700 text-white font-semibold"
                  data-testid="button-enter-user-zone"
                >
                  Enter User Zone
                </Button>
              </Link>
              <Button 
                variant="outline"
                size="lg"
                className="border-gray-700 text-gray-300 hover:text-white"
                data-testid="button-create-entry"
              >
                Create New Entry
              </Button>
              <p className="text-sm text-gray-500">Your Zone Agent summarizes activity and maintains Zone memory automatically.</p>
            </div>
          </div>
        </section>
      )}

      {/* Features Section */}
      <section className="relative py-24 bg-black border-t border-gray-800 overflow-hidden">
        {/* Animated Background */}
        <div
          style={{
            position: "absolute",
            inset: "-30%",
            background: `
              radial-gradient(900px 380px at 25% 50%, rgba(140,80,255,.2), transparent 60%),
              radial-gradient(900px 420px at 75% 50%, rgba(80,210,255,.15), transparent 60%)
            `,
            filter: "blur(10px)",
            animation: "djzsDrift 16s ease-in-out infinite",
            pointerEvents: "none",
          }}
        />
        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-4">
              Built for <span className="text-purple-400">Privacy</span> by Design
            </h2>
            <p className="text-gray-400 text-lg">End-to-end encryption meets Web3 identity and local-first thinking</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <FeatureItem
              number="01"
              title="End-to-End Encrypted"
              description="All Zone entries are encrypted with XMTP. Only participants can read them — not servers, not platforms."
              icon={<Lock className="w-8 h-8 text-purple-400" />}
            />
            <FeatureItem
              number="02"
              title="ENS Identity"
              description="Your ENS name is your identity. No accounts, no passwords, no intermediaries. Pure blockchain identity."
              icon={<Users className="w-8 h-8 text-blue-400" />}
            />
            <FeatureItem
              number="03"
              title="Wallet-Owned Data"
              description="Your data belongs to you. Zones are portable, exportable, and verifiable. No vendor lock-in."
              icon={<Shield className="w-8 h-8 text-green-400" />}
            />
            <FeatureItem
              number="04"
              title="NFT or Allowlist Gated"
              description="Members-only access via NFT or allowlist. Your community, your rules, your complete control."
              icon={<Network className="w-8 h-8 text-yellow-400" />}
            />
          </div>
        </div>
      </section>

      {/* Entry Types Section */}
      <section className="relative py-24 bg-black border-t border-gray-800 overflow-hidden">
        {/* Animated Background */}
        <div
          style={{
            position: "absolute",
            inset: "-30%",
            background: `
              radial-gradient(900px 380px at 30% 30%, rgba(140,80,255,.18), transparent 60%),
              radial-gradient(900px 420px at 70% 70%, rgba(80,210,255,.12), transparent 60%)
            `,
            filter: "blur(10px)",
            animation: "djzsDrift 16s ease-in-out infinite",
            pointerEvents: "none",
          }}
        />
        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <h2 className="text-4xl md:text-5xl font-black mb-16 text-center">
            Structured <span className="text-purple-400">Zone Entries</span>
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <EntryTypeCard
              title="Notes"
              description="Private notes, research, and reflections — encrypted and searchable"
              icon={<FileText className="w-6 h-6 text-gray-400" />}
            />
            <EntryTypeCard
              title="Signals"
              description="Structured trade setups with entry, TP levels, and invalidation"
              icon={<TrendingUp className="w-6 h-6 text-green-400" />}
            />
            <EntryTypeCard
              title="Predictions"
              description="YES/NO voting with deadlines. Track outcomes and resolution"
              icon={<BarChart3 className="w-6 h-6 text-blue-400" />}
            />
            <EntryTypeCard
              title="Events"
              description="Coordinate meetups, calls, and milestones with RSVP tracking"
              icon={<Calendar className="w-6 h-6 text-orange-400" />}
            />
            <EntryTypeCard
              title="Receipts"
              description="On-chain payment confirmations with automatic verification"
              icon={<Receipt className="w-6 h-6 text-emerald-400" />}
            />
            <EntryTypeCard
              title="Articles"
              description="Share and discuss newsletter articles from Paragraph"
              icon={<Newspaper className="w-6 h-6 text-indigo-400" />}
            />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="relative py-24 bg-black border-t border-gray-800 overflow-hidden">
        {/* Animated Background */}
        <div
          style={{
            position: "absolute",
            inset: "-30%",
            background: `
              radial-gradient(900px 380px at 20% 60%, rgba(140,80,255,.15), transparent 60%),
              radial-gradient(900px 420px at 80% 40%, rgba(80,210,255,.1), transparent 60%)
            `,
            filter: "blur(10px)",
            animation: "djzsDrift 16s ease-in-out infinite",
            pointerEvents: "none",
          }}
        />
        {/* Stars */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `
              radial-gradient(rgba(255,255,255,.5) 1px, transparent 1px),
              radial-gradient(rgba(255,255,255,.25) 1px, transparent 1px)
            `,
            backgroundSize: "90px 90px, 140px 140px",
            backgroundPosition: "0 0, 40px 60px",
            opacity: 0.1,
            animation: "djzsStars 40s linear infinite",
            pointerEvents: "none",
          }}
        />
        <div className="relative z-10 max-w-5xl mx-auto px-6">
          <h2 className="text-4xl md:text-5xl font-black mb-16 text-center">
            How <span className="text-purple-400">DJZS</span> Works
          </h2>

          <div className="space-y-8">
            <StepCard
              step="1"
              title="Connect Your Wallet"
              description="Your wallet and ENS establish your identity across all Zones."
            />
            <StepCard
              step="2"
              title="Enter or Create Zones"
              description="Zones are purpose-built spaces for journaling, signals, predictions, and coordination."
            />
            <StepCard
              step="3"
              title="Commit Structured Entries"
              description="Notes, signals, predictions, events, and receipts are stored as structured Zone entries — not loose messages."
            />
            <StepCard
              step="4"
              title="Let the Zone Agent Assist"
              description="Each Zone can summarize activity, extract action items, and maintain long-term memory."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 bg-black border-t border-gray-800 overflow-hidden">
        {/* Animated Background */}
        <div
          style={{
            position: "absolute",
            inset: "-30%",
            background: `
              radial-gradient(900px 380px at 50% 50%, rgba(140,80,255,.25), transparent 60%),
              radial-gradient(900px 420px at 50% 50%, rgba(80,210,255,.15), transparent 60%)
            `,
            filter: "blur(10px)",
            animation: "djzsDrift 16s ease-in-out infinite",
            pointerEvents: "none",
          }}
        />
        {/* Shimmer */}
        <div
          style={{
            position: "absolute",
            inset: "-40%",
            background:
              "linear-gradient(110deg, transparent 0%, rgba(255,255,255,.08) 45%, transparent 60%)",
            filter: "blur(16px)",
            animation: "djzsShimmer 10s ease-in-out infinite",
            pointerEvents: "none",
          }}
        />
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-black mb-8">
            Ready to Enter <span className="text-purple-400">Your Zones</span>?
          </h2>
          <p className="text-gray-400 text-lg mb-12">
            Join a growing network of traders, builders, researchers, and DAOs using DJZS as their private operating system.
          </p>
          {isConnected ? (
            <Link href="/chat">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-10 py-7 text-lg font-semibold"
                data-testid="button-cta-zones"
              >
                Enter Your Zones Now
              </Button>
            </Link>
          ) : (
            <div className="flex justify-center">
              <ConnectButton showBalance={false} />
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="relative border-t border-gray-800 bg-black py-8 overflow-hidden">
        {/* Subtle Glow */}
        <div
          style={{
            position: "absolute",
            inset: "-30%",
            background: `
              radial-gradient(600px 200px at 50% 100%, rgba(140,80,255,.1), transparent 60%)
            `,
            filter: "blur(10px)",
            pointerEvents: "none",
          }}
        />
        <div className="relative z-10 max-w-7xl mx-auto px-6 flex items-center justify-between">
          <p className="text-gray-500 text-sm">© 2025 DJZS. Powered by XMTP. Built on Base.</p>
          <div className="flex items-center gap-6 text-sm text-gray-500">
            <a href="#" className="hover:text-purple-400 transition-colors">Privacy</a>
            <a href="#" className="hover:text-purple-400 transition-colors">Terms</a>
            <a href="#" className="hover:text-purple-400 transition-colors">Docs</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureItem({ number, title, description, icon }: { number: string; title: string; description: string; icon: React.ReactNode }) {
  return (
    <div className="group p-8 rounded-2xl border border-gray-800 hover:border-purple-600/50 transition-all hover:bg-purple-950/10">
      <div className="flex items-start gap-6">
        <div className="flex-shrink-0">
          <div className="text-3xl font-black text-purple-500">{number}</div>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            {icon}
            <h3 className="text-xl font-bold">{title}</h3>
          </div>
          <p className="text-gray-400">{description}</p>
        </div>
      </div>
    </div>
  );
}

function StepCard({ step, title, description }: { step: string; title: string; description: string }) {
  return (
    <div className="flex gap-6 items-start">
      <div className="flex-shrink-0">
        <div className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center text-xl font-bold">
          {step}
        </div>
      </div>
      <div className="pt-2">
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="text-gray-400">{description}</p>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-6 rounded-xl border border-gray-800 bg-gray-900/30 text-center hover:border-purple-600/30 transition-colors">
      <div className="text-purple-400 font-semibold text-lg mb-2">{label}</div>
      <div className="text-gray-400 text-sm">{value}</div>
    </div>
  );
}

function EntryTypeCard({ title, description, icon }: { title: string; description: string; icon: React.ReactNode }) {
  return (
    <div className="p-6 rounded-xl border border-gray-800 bg-gray-900/30 hover:border-purple-600/30 transition-all group">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center group-hover:bg-purple-600/20 transition-colors">
          {icon}
        </div>
        <h3 className="font-bold text-lg">{title}</h3>
      </div>
      <p className="text-gray-400 text-sm">{description}</p>
    </div>
  );
}
