export function Features() {
  const features = [
    {
      title: "🔐 Aztec Privacy NFTs",
      description: "Mint your content privately. Content hash on-chain, zero data exposure. Perfect for sensitive trading strategies.",
      network: "Aztec Testnet",
      color: "purple",
    },
    {
      title: "🌐 Base Public NFTs",
      description: "Mint publicly tradeable NFTs on Base. Full visibility, transferable on any marketplace. Build your trading portfolio.",
      network: "Base Mainnet",
      color: "blue",
    },
    {
      title: "✨ AI Writing Studio",
      description: "Powered by Nous Research Hermes-4. Get real-time suggestions while writing research, articles, or trading analysis.",
      network: "Live Assistant",
      color: "primary",
    },
    {
      title: "📝 Unlimited Minting",
      description: "Write once, mint many. Create as much content as you want and mint to either chain instantly.",
      network: "Creator Economy",
      color: "secondary",
    },
    {
      title: "💰 Creator Owned",
      description: "You control your content. No intermediaries. Mint, trade, and monetize your work directly on-chain.",
      network: "Web3 Native",
      color: "purple",
    },
    {
      title: "🔄 Subscribe + Mint",
      description: "Get 0.001 ETH Subscribe NFT on Base for premium access, then mint unlimited content NFTs on Aztec or Base.",
      network: "Dual Ecosystem",
      color: "blue",
    },
  ];

  const colorMap = {
    primary: "from-primary/20 to-primary/10 border-primary/30",
    secondary: "from-secondary/20 to-secondary/10 border-secondary/30",
    purple: "from-purple-400/20 to-pink-400/10 border-purple-400/30",
    blue: "from-blue-400/20 to-cyan-400/10 border-blue-400/30",
  };

  return (
    <section className="relative py-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white md:text-4xl">How It Works</h2>
          <p className="mt-4 text-lg text-white/70">Write with AI → Mint as NFT → Trade, Gift, or Hold on any chain</p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <div key={index} className={`glass-card rounded-2xl p-6 transition hover:bg-white/10 bg-gradient-to-br ${colorMap[feature.color as keyof typeof colorMap]} border`} data-testid={`card-feature-${index}`}>
              <h3 className="text-xl font-semibold text-white" data-testid={`text-feature-title-${index}`}>{feature.title}</h3>
              <p className="mt-2 text-white/70" data-testid={`text-feature-description-${index}`}>{feature.description}</p>
              <div className="mt-4 inline-block rounded-full bg-white/10 px-3 py-1 text-xs font-mono text-white/60">
                {feature.network}
              </div>
            </div>
          ))}
        </div>

        {/* Workflow Diagram */}
        <div className="mx-auto mt-16 max-w-4xl">
          <div className="glass-card rounded-2xl p-8">
            <h3 className="text-center text-2xl font-bold text-white mb-8">The Creator Workflow</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-2">
              <div className="flex flex-col items-center">
                <div className="rounded-full bg-primary/20 border border-primary/50 w-16 h-16 flex items-center justify-center mb-3 text-2xl">✍️</div>
                <p className="text-sm text-white/80 text-center font-semibold">Write Content</p>
                <p className="text-xs text-white/50 mt-1">Use AI journal</p>
              </div>
              <div className="flex flex-col items-center justify-between">
                <div className="flex-1 flex items-end mb-2">
                  <p className="text-primary text-2xl">→</p>
                </div>
              </div>
              <div className="flex flex-col items-center">
                <div className="rounded-full bg-purple-400/20 border border-purple-400/50 w-16 h-16 flex items-center justify-center mb-3 text-2xl">🔐</div>
                <p className="text-sm text-white/80 text-center font-semibold">Choose Chain</p>
                <p className="text-xs text-white/50 mt-1">Aztec or Base</p>
              </div>
              <div className="flex flex-col items-center justify-between">
                <div className="flex-1 flex items-end mb-2">
                  <p className="text-primary text-2xl">→</p>
                </div>
              </div>
              <div className="flex flex-col items-center md:col-start-1">
                <div className="rounded-full bg-blue-400/20 border border-blue-400/50 w-16 h-16 flex items-center justify-center mb-3 text-2xl">🎨</div>
                <p className="text-sm text-white/80 text-center font-semibold">Mint NFT</p>
                <p className="text-xs text-white/50 mt-1">One click</p>
              </div>
              <div className="flex flex-col items-center justify-between">
                <div className="flex-1 flex items-end mb-2">
                  <p className="text-primary text-2xl">→</p>
                </div>
              </div>
              <div className="flex flex-col items-center">
                <div className="rounded-full bg-secondary/20 border border-secondary/50 w-16 h-16 flex items-center justify-center mb-3 text-2xl">💰</div>
                <p className="text-sm text-white/80 text-center font-semibold">Trade/Hold</p>
                <p className="text-xs text-white/50 mt-1">Own forever</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
