import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { MessageSquare, Shield, Users, Zap, ArrowRight, Lock, Network, Sparkles } from "lucide-react";
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

          {/* Wallet Connect Button */}
          <div
            style={{
              position: "absolute",
              top: "50%",
              right: "20px",
              transform: "translateY(-50%)",
              zIndex: 10,
            }}
          >
            <ConnectButton />
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
              <span className="block">On-<span className="text-purple-400">Chain.</span></span>
              <span className="block"><span className="text-purple-600">Encrypted.</span></span>
            </h1>
          </div>

          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto mb-12 leading-relaxed">
            A zone-based system for private journaling, signals, predictions, and coordination — owned by your wallet.
          </p>

          {isConnected ? (
            <Link href="/chat">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-10 py-7 text-lg font-semibold group"
                data-testid="button-enter-chat"
              >
                Enter Your Zones
                <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          ) : (
            <div className="flex flex-col items-center gap-6">
              <p className="text-gray-400 text-lg">Connect your wallet to access your Zones</p>
              <ConnectButton />
            </div>
          )}

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
            <StatCard label="Signals & Predictions" value="Structured trade signals and markets" />
            <StatCard label="Coordinate Securely" value="Events, payments, and receipts" />
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
                DJZS organizes everything you do into Zones — private, encrypted spaces that accumulate knowledge, decisions, and history over time.
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
                { name: "User Zone", desc: "General coordination & updates" },
                { name: "Trades", desc: "Trade ideas & execution notes" },
                { name: "Predictions", desc: "Markets, votes, and outcomes" },
                { name: "Events", desc: "Calls, launches, milestones" },
                { name: "Payments", desc: "Payments, proofs, records" },
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
              <p className="text-sm text-gray-500">Your Zone Agent will summarize activity automatically</p>
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
              Built For <span className="text-purple-400">Privacy</span>
            </h2>
            <p className="text-gray-400 text-lg">End-to-end encryption meets Web3 identity</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <FeatureItem
              number="01"
              title="E2E Encrypted"
              description="Messages encrypted with XMTP. No one reads them except participants. Your secrets stay secrets."
              icon={<Lock className="w-8 h-8 text-purple-400" />}
            />
            <FeatureItem
              number="02"
              title="ENS Identity"
              description="Your ENS name is your username. No accounts, no passwords, no middlemen. Pure blockchain identity."
              icon={<Users className="w-8 h-8 text-blue-400" />}
            />
            <FeatureItem
              number="03"
              title="In-Chat Actions"
              description="Trade signals, predictions, events, and payments. Everything happens inside the chat. No context switching."
              icon={<Zap className="w-8 h-8 text-yellow-400" />}
            />
            <FeatureItem
              number="04"
              title="Token Gated"
              description="Members-only access via NFT or allowlist. Your community, your rules, your complete control."
              icon={<Network className="w-8 h-8 text-green-400" />}
            />
          </div>
        </div>
      </section>

      {/* Message Types Section */}
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
            Structured <span className="text-purple-400">Messaging</span>
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <MessageTypeCard
              title="Trade Signals"
              description="Post entry, TP levels, and invalidation with leverage indicators"
              badge="📊"
            />
            <MessageTypeCard
              title="Predictions"
              description="YES/NO voting with deadlines. Track the community's consensus"
              badge="🎯"
            />
            <MessageTypeCard
              title="Events"
              description="Coordinate meetups with RSVP tracking and calendar integration"
              badge="📅"
            />
            <MessageTypeCard
              title="Payments"
              description="Send ETH directly from chat with automatic receipt generation"
              badge="💰"
            />
            <MessageTypeCard
              title="Newsletter"
              description="Share articles from Paragraph publications in real-time"
              badge="📰"
            />
            <MessageTypeCard
              title="Text Chat"
              description="Traditional encrypted messages for anything else"
              badge="💬"
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
            How It <span className="text-purple-400">Works</span>
          </h2>

          <div className="space-y-8">
            <StepCard
              step="1"
              title="Connect Your Wallet"
              description="Link your Web3 wallet and resolve your ENS name. That's your identity."
            />
            <StepCard
              step="2"
              title="Join or Create a Room"
              description="Access members-only chat rooms. Trade, predict, coordinate, and communicate."
            />
            <StepCard
              step="3"
              title="Chat End-to-End Encrypted"
              description="All messages are encrypted with XMTP. Only you and recipients can read them."
            />
            <StepCard
              step="4"
              title="Compose Rich Messages"
              description="Send text, trades, predictions, events, or payments. Everything is structured and verifiable."
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
            Ready to Experience <span className="text-purple-400">Private</span> Communication?
          </h2>
          <p className="text-gray-400 text-lg mb-12">
            Join a growing community of privacy-first Web3 builders and traders.
          </p>
          {isConnected ? (
            <Link href="/chat">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-10 py-7 text-lg font-semibold"
                data-testid="button-cta-chat"
              >
                Enter Chat Now
              </Button>
            </Link>
          ) : (
            <ConnectButton />
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
          <p className="text-gray-500 text-sm">© 2025 DJZS Chat. Powered by XMTP. Built on Base.</p>
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
          <span className="text-4xl font-black text-purple-600/40 group-hover:text-purple-500/60 transition-colors">{number}</span>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            {icon}
            <h3 className="text-xl font-bold text-white">{title}</h3>
          </div>
          <p className="text-gray-400 leading-relaxed">{description}</p>
        </div>
      </div>
    </div>
  );
}

function MessageTypeCard({ title, description, badge }: { title: string; description: string; badge: string }) {
  return (
    <div className="p-6 rounded-xl border border-gray-800 hover:border-purple-600/50 hover:bg-purple-950/10 transition-all group cursor-pointer">
      <div className="text-4xl mb-4">{badge}</div>
      <h3 className="text-lg font-bold text-white mb-2 group-hover:text-purple-400 transition-colors">{title}</h3>
      <p className="text-gray-400 text-sm">{description}</p>
    </div>
  );
}

function StepCard({ step, title, description }: { step: string; title: string; description: string }) {
  return (
    <div className="flex gap-6 items-start">
      <div className="flex-shrink-0">
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-purple-600 to-purple-700 font-black text-white text-xl">
          {step}
        </div>
      </div>
      <div className="flex-1 pt-2">
        <h3 className="text-2xl font-bold text-white mb-2">{title}</h3>
        <p className="text-gray-400 text-lg">{description}</p>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-6 rounded-xl border border-gray-800 bg-gray-900/50">
      <div className="text-3xl font-black text-purple-400 mb-2">{value}</div>
      <p className="text-gray-400 text-sm font-semibold">{label}</p>
    </div>
  );
}
