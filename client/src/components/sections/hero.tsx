export function Hero() {
  return (
    <header className="relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-6 py-20 lg:py-28">
        <div className="text-center">
          {/* Portal Ring */}
          <div className="mx-auto mb-8 flex items-center justify-center">
            <div className="portal-ring neon-glow relative flex h-40 w-40 items-center justify-center rounded-full border border-white/25 backdrop-blur-sm lg:h-48 lg:w-48">
              <div className="absolute h-32 w-32 rounded-full border border-white/20 lg:h-40 lg:w-40"></div>
              <div className="absolute h-24 w-24 rounded-full border border-white/15 lg:h-32 lg:w-32"></div>
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary to-secondary opacity-50 blur-xl lg:h-20 lg:w-20"></div>
            </div>
          </div>

          {/* Hero Text */}
          <h1 className="mx-auto max-w-4xl text-4xl font-black tracking-tight text-white md:text-6xl lg:text-7xl">
            DJZS ✦ On‑Chain Newsletter
          </h1>
          <p className="mx-auto mt-6 max-w-3xl text-lg text-white/80 md:text-xl lg:text-2xl">
            🚀 Premium crypto insights with NFT subscription. AI-powered writing tools for creating market analysis and trading content.
          </p>

          {/* Quick Stats */}
          <div className="mx-auto mt-12 grid max-w-3xl grid-cols-3 gap-4 md:gap-8">
            <div className="glass-card rounded-2xl p-4 md:p-6">
              <div className="text-2xl font-bold text-primary md:text-3xl" data-testid="text-subscribers">2,347</div>
              <div className="mt-1 text-sm text-white/70 md:text-base">Subscribers</div>
            </div>
            <div className="glass-card rounded-2xl p-4 md:p-6">
              <div className="text-2xl font-bold text-secondary md:text-3xl" data-testid="text-issues">42</div>
              <div className="mt-1 text-sm text-white/70 md:text-base">Issues</div>
            </div>
            <div className="glass-card rounded-2xl p-4 md:p-6">
              <div className="text-2xl font-bold text-white md:text-3xl" data-testid="text-max-supply">∞</div>
              <div className="mt-1 text-sm text-white/70 md:text-base">Max Supply</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
