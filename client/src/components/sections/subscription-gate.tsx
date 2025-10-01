import { useAccount } from "wagmi";
import { useIsSubscribed } from "@/hooks/use-subscription";
import { WalletConnectButton } from "@/components/web3/connect-button";
import { MintButton } from "@/components/web3/mint-button";
import { MemberContent } from "./member-content";

export function SubscriptionGate() {
  const { address } = useAccount();
  const { subscribed, loading, supply } = useIsSubscribed(address as `0x${string}` | undefined);

  return (
    <section className="relative">
      <div className="mx-auto max-w-5xl px-6 pb-24">
        <div className="glass-card-strong rounded-3xl p-6 shadow-2xl md:p-10">
          {/* Header with Connect Button */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-white md:text-3xl">Subscribe Access</h2>
              <p className="mt-1 text-white/70" data-testid="text-supply">
                {supply ? (
                  <>
                    Supply: <span data-testid="text-total-supply">{supply.total.toString()}</span> /{" "}
                    <span data-testid="text-max-supply">{supply.max.toString()}</span>
                  </>
                ) : (
                  "Checking supply…"
                )}
              </p>
            </div>
            <WalletConnectButton />
          </div>

          {/* Subscription Status Area */}
          <div className="mt-6">
            {/* Loading State */}
            {loading && (
              <div className="rounded-2xl border border-white/10 bg-black/30 p-5" data-testid="status-loading">
                <div className="flex items-center gap-3">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-primary"></div>
                  <p className="text-white/80">Checking your subscription…</p>
                </div>
              </div>
            )}

            {/* Not Subscribed State */}
            {!loading && !subscribed && (
              <div className="rounded-2xl border border-white/10 bg-black/30 p-6" data-testid="status-not-subscribed">
                <h3 className="text-xl font-semibold text-white md:text-2xl">Mint your Subscribe NFT</h3>
                <p className="mt-2 text-white/70">One per wallet. Holds your access on-chain. Transferable by you.</p>

                {/* Features List */}
                <div className="mt-4 space-y-2">
                  <div className="flex items-start gap-2 text-white/80">
                    <svg className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Access to all premium newsletter issues</span>
                  </div>
                  <div className="flex items-start gap-2 text-white/80">
                    <svg className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Agent-curated alpha and trade setups</span>
                  </div>
                  <div className="flex items-start gap-2 text-white/80">
                    <svg className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Exclusive on-chain flow analysis</span>
                  </div>
                  <div className="flex items-start gap-2 text-white/80">
                    <svg className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Transferable NFT — trade or gift anytime</span>
                  </div>
                </div>

                <MintButton />
              </div>
            )}

            {/* Subscribed State */}
            {!loading && subscribed && (
              <div className="rounded-2xl border border-emerald-400/30 bg-emerald-400/10 p-6" data-testid="status-subscribed">
                <div className="flex items-start gap-4">
                  <div className="rounded-full bg-emerald-400/20 p-3">
                    <svg className="h-6 w-6 text-emerald-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-emerald-300 md:text-2xl">You're subscribed ✅</h3>
                    <p className="mt-2 text-white/80">
                      Enjoy members-only content below. Your AI agent will learn from your interactions and provide personalized insights.
                    </p>

                    {/* NFT Details */}
                    <div className="mt-4 flex flex-wrap gap-4">
                      <div className="rounded-xl border border-white/10 bg-black/30 px-4 py-2">
                        <div className="text-xs text-white/60">Status</div>
                        <div className="mt-1 font-semibold text-emerald-300" data-testid="text-status">Active</div>
                      </div>
                      <div className="rounded-xl border border-white/10 bg-black/30 px-4 py-2">
                        <div className="text-xs text-white/60">Network</div>
                        <div className="mt-1 font-semibold text-primary" data-testid="text-network">Base</div>
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
