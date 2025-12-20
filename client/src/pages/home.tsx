import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { MessageSquare, Shield, Users, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function Home() {
  const { isConnected } = useAccount();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950">
      <header className="border-b border-gray-800 bg-gray-950/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-white">DJZS Chat</h1>
          <ConnectButton />
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Private. On-Chain. <span className="text-purple-400">Yours.</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-8">
            End-to-end encrypted group chat for DAOs and communities. Your ENS is your identity. Your messages are yours alone.
          </p>
          {isConnected ? (
            <Link href="/chat">
              <Button size="lg" className="bg-purple-600 hover:bg-purple-700 text-white px-8" data-testid="button-enter-chat">
                <MessageSquare className="w-5 h-5 mr-2" />
                Enter Chat
              </Button>
            </Link>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <p className="text-gray-500">Connect your wallet to get started</p>
              <ConnectButton />
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <FeatureCard
            icon={<Shield className="w-8 h-8 text-purple-400" />}
            title="E2E Encrypted"
            description="Messages encrypted with XMTP. No one can read them except participants."
          />
          <FeatureCard
            icon={<Users className="w-8 h-8 text-blue-400" />}
            title="ENS Identity"
            description="Your ENS name is your username. No accounts, no passwords."
          />
          <FeatureCard
            icon={<Zap className="w-8 h-8 text-yellow-400" />}
            title="In-Chat Actions"
            description="Trade signals, predictions, events, and payments—all inside chat."
          />
          <FeatureCard
            icon={<MessageSquare className="w-8 h-8 text-green-400" />}
            title="Token Gated"
            description="Members-only access via NFT or allowlist. Your community, your rules."
          />
        </div>

        <div className="text-center text-gray-500 text-sm">
          <p>Powered by XMTP • Built on Base</p>
        </div>
      </main>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 hover:border-gray-700 transition-colors">
      <div className="mb-4">{icon}</div>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-gray-400 text-sm">{description}</p>
    </div>
  );
}
