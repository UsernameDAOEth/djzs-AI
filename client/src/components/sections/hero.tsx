export function Hero() {
  return (
    <header className="relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-6 py-20 lg:py-28">
        <div className="text-center">
          {/* Dual Chain Rings */}
          <div className="mx-auto mb-8 flex items-center justify-center gap-8">
            {/* Aztec - Purple/Pink */}
            <div className="portal-ring neon-glow relative flex h-32 w-32 items-center justify-center rounded-full border border-purple-400/50 backdrop-blur-sm lg:h-40 lg:w-40">
              <div className="absolute h-24 w-24 rounded-full border border-purple-400/30 lg:h-32 lg:w-32"></div>
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 opacity-60 blur-lg lg:h-16 lg:w-16"></div>
              <div className="absolute bottom-1 text-xs font-bold text-purple-300">AZTEC</div>
            </div>

            {/* Arrow */}
            <div className="text-primary text-3xl">⇄</div>

            {/* Base - Blue */}
            <div className="portal-ring neon-glow relative flex h-32 w-32 items-center justify-center rounded-full border border-blue-400/50 backdrop-blur-sm lg:h-40 lg:w-40">
              <div className="absolute h-24 w-24 rounded-full border border-blue-400/30 lg:h-32 lg:w-32"></div>
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 opacity-60 blur-lg lg:h-16 lg:w-16"></div>
              <div className="absolute bottom-1 text-xs font-bold text-blue-300">BASE</div>
            </div>
          </div>

          {/* Hero Text */}
          <h1 className="mx-auto max-w-4xl text-4xl font-black tracking-tight text-white md:text-6xl lg:text-7xl">
            DJZS ✦ Dual‑Chain NFT Marketplace
          </h1>
          <p className="mx-auto mt-6 max-w-3xl text-lg text-white/80 md:text-xl lg:text-2xl">
            Write content with AI assistance. Mint as Privacy NFTs on Aztec or Public NFTs on Base. Full Web3 creator ecosystem.
          </p>

          {/* Features Grid */}
          <div className="mx-auto mt-12 grid max-w-4xl grid-cols-1 gap-4 md:grid-cols-2 lg:gap-8">
            <div className="glass-card rounded-2xl border border-purple-400/30 bg-purple-400/5 p-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-bold text-white">Aztec Privacy</h3>
                <span className="text-2xl">🔐</span>
              </div>
              <p className="text-sm text-white/70">Private NFTs - content hash on-chain, zero private data exposure</p>
              <div className="mt-4 text-xs text-purple-300 font-mono">testnet.aztec.network</div>
            </div>
            
            <div className="glass-card rounded-2xl border border-blue-400/30 bg-blue-400/5 p-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-bold text-white">Base Public</h3>
                <span className="text-2xl">🌐</span>
              </div>
              <p className="text-sm text-white/70">Public NFTs - tradeable, transferable, full transparency</p>
              <div className="mt-4 text-xs text-blue-300 font-mono">mainnet.base.org</div>
            </div>

            <div className="glass-card rounded-2xl border border-primary/30 bg-primary/5 p-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-bold text-white">AI Writing</h3>
                <span className="text-2xl">✨</span>
              </div>
              <p className="text-sm text-white/70">Nous Research Hermes-4 powered journal with real-time suggestions</p>
              <div className="mt-4 text-xs text-primary font-mono">Hermes-4-70B</div>
            </div>

            <div className="glass-card rounded-2xl border border-secondary/30 bg-secondary/5 p-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-bold text-white">Creator Owned</h3>
                <span className="text-2xl">👑</span>
              </div>
              <p className="text-sm text-white/70">Own your content, mint whenever you want, unlimited supply</p>
              <div className="mt-4 text-xs text-secondary font-mono">Web3 Native</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
