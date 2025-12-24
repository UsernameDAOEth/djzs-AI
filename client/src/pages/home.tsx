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
      <header className="border-b border-purple-600/30 bg-gradient-to-r from-purple-950/80 to-black/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-8">
          <div className="flex-1">
            <p className="text-xs md:text-sm font-semibold text-purple-300 uppercase tracking-widest mb-1">
              Welcome To
            </p>
            <h1 className="text-2xl md:text-3xl font-black bg-gradient-to-r from-purple-300 via-purple-400 to-purple-500 bg-clip-text text-transparent">
              Decentralized Journaling Zone System
            </h1>
          </div>
          <div className="flex-shrink-0">
            <ConnectButton />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 right-20 w-96 h-96 bg-purple-600 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-20 w-96 h-96 bg-purple-800 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          <div className="mb-8 space-y-4">
            <h1 className="text-6xl md:text-8xl font-black leading-tight">
              <span className="block">Pri<span className="text-purple-500">vate.</span></span>
              <span className="block">On-<span className="text-purple-400">Chain.</span></span>
              <span className="block"><span className="text-purple-600">Encrypted.</span></span>
            </h1>
          </div>

          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto mb-12 leading-relaxed">
            A members-only encrypted chat platform where your ENS is your identity. Trade signals, predictions, events—all end-to-end encrypted on Base blockchain.
          </p>

          {isConnected ? (
            <Link href="/chat">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-10 py-7 text-lg font-semibold group"
                data-testid="button-enter-chat"
              >
                Enter Chat
                <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          ) : (
            <div className="flex flex-col items-center gap-6">
              <p className="text-gray-400 text-lg">Connect your wallet to access the chat</p>
              <ConnectButton />
            </div>
          )}

          <div className="mt-20 grid grid-cols-3 gap-8 max-w-2xl mx-auto">
            <StatCard label="Members" value="∞" />
            <StatCard label="Encrypted" value="✓" />
            <StatCard label="Decentralized" value="✓" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gradient-to-b from-black via-purple-950/20 to-black border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-6">
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
      <section className="py-24 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-6">
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
      <section className="py-24 bg-gradient-to-b from-black via-purple-950/10 to-black border-t border-gray-800">
        <div className="max-w-5xl mx-auto px-6">
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
      <section className="py-24 border-t border-gray-800">
        <div className="max-w-4xl mx-auto px-6 text-center">
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
      <footer className="border-t border-gray-800 bg-black/50 py-8">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
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
