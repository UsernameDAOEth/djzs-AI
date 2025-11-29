import { useAccount } from "wagmi";
import { useIsSubscribed } from "@/hooks/use-subscription";
import { useSupply } from "@/hooks/use-supply";
import { WalletConnectButton } from "@/components/web3/connect-button";
import { MintButton } from "@/components/web3/mint-button";
import { PrivacyMintButton } from "@/components/web3/privacy-mint-button";
import { MemberContent } from "./member-content";
import { Lock, Globe } from "lucide-react";

export function SubscriptionGate() {
  const { address } = useAccount();
  const { subscribed, loading } = useIsSubscribed(address as `0x${string}` | undefined);
  const { supply } = useSupply();

  // Check if current user is admin
  const adminAddress = import.meta.env.VITE_ADMIN_ADDRESS?.toLowerCase();
  const isAdmin = address && adminAddress && address.toLowerCase() === adminAddress;
  const hasAccess = subscribed || isAdmin;

  return (
    <section className="relative">
      <div className="mx-auto max-w-5xl px-6 pb-24">
        <div className="glass-card-strong rounded-3xl p-6 shadow-2xl md:p-10">
          {/* Header with Connect Button */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-white md:text-3xl">Start Minting NFTs</h2>
              <p className="mt-1 text-white/70" data-testid="text-supply">
                Choose your chain: Aztec (Private) or Base (Public)
              </p>
            </div>
            <WalletConnectButton />
          </div>

          {/* Minting Entry Area */}
          <div className="mt-6">
            {/* Loading State */}
            {loading && (
              <div className="rounded-2xl border border-white/10 bg-black/30 p-5" data-testid="status-loading">
                <div className="flex items-center gap-3">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-primary"></div>
                  <p className="text-white/80">Checking your access…</p>
                </div>
              </div>
            )}

            {/* Not Subscribed State - Minting Entry */}
            {!loading && !hasAccess && (
              <div className="rounded-2xl border border-white/10 bg-black/30 p-6" data-testid="status-not-subscribed">
                <h3 className="text-xl font-semibold text-white md:text-2xl">Get Access to Mint on Both Chains</h3>
                <p className="mt-2 text-white/70">Get a Subscribe NFT (0.001 ETH) to unlock unlimited minting on Aztec & Base</p>

                {/* Benefits List */}
                <div className="mt-4 space-y-2">
                  <div className="flex items-start gap-2 text-white/80">
                    <Lock className="mt-0.5 h-5 w-5 flex-shrink-0 text-purple-400" />
                    <span>Mint private NFTs on Aztec testnet</span>
                  </div>
                  <div className="flex items-start gap-2 text-white/80">
                    <Globe className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-400" />
                    <span>Mint tradeable NFTs on Base mainnet</span>
                  </div>
                  <div className="flex items-start gap-2 text-white/80">
                    <svg className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Unlimited content creation & minting</span>
                  </div>
                  <div className="flex items-start gap-2 text-white/80">
                    <svg className="mt-0.5 h-5 w-5 flex-shrink-0 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Access to AI Writing Studio with Hermes-4</span>
                  </div>
                </div>

                <div className="mt-6">
                  <p className="text-sm font-semibold text-white mb-3">First: Get Your Subscribe NFT</p>
                  <MintButton />
                </div>
              </div>
            )}

            {/* Subscribed State - Minting Ready */}
            {!loading && hasAccess && (
              <div className="rounded-2xl border border-emerald-400/30 bg-emerald-400/10 p-6" data-testid="status-subscribed">
                <div className="flex items-start gap-4">
                  <div className="rounded-full bg-emerald-400/20 p-3">
                    <svg className="h-6 w-6 text-emerald-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="text-xl font-semibold text-emerald-300 md:text-2xl">
                        {isAdmin ? "Admin Access ✅" : "Ready to Mint ✅"}
                      </h3>
                      {isAdmin && (
                        <span className="px-3 py-1 bg-primary/20 border border-primary/50 rounded-full text-xs text-primary font-semibold">
                          ADMIN
                        </span>
                      )}
                    </div>
                    <p className="mt-2 text-white/80">
                      You can now mint content NFTs on both Aztec and Base. Go to the journal to write and mint!
                    </p>

                    {/* Minting Options */}
                    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="rounded-xl border border-purple-400/30 bg-purple-400/5 p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <Lock className="h-4 w-4 text-purple-400" />
                          <h4 className="font-semibold text-white">Aztec Privacy</h4>
                        </div>
                        <p className="text-sm text-white/70 mb-4">Mint private NFTs - content hash only on-chain</p>
                        <a href="/journal" className="inline-block px-4 py-2 rounded-lg bg-purple-400/20 border border-purple-400/50 text-purple-300 text-sm font-semibold hover:bg-purple-400/30 transition">
                          Go to Journal
                        </a>
                      </div>

                      <div className="rounded-xl border border-blue-400/30 bg-blue-400/5 p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <Globe className="h-4 w-4 text-blue-400" />
                          <h4 className="font-semibold text-white">Base Public</h4>
                        </div>
                        <p className="text-sm text-white/70 mb-4">Mint tradeable NFTs - full visibility on Base</p>
                        <a href="/journal" className="inline-block px-4 py-2 rounded-lg bg-blue-400/20 border border-blue-400/50 text-blue-300 text-sm font-semibold hover:bg-blue-400/30 transition">
                          Go to Journal
                        </a>
                      </div>
                    </div>

                    <MemberContent />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
