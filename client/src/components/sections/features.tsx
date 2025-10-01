export function Features() {
  const features = [
    {
      title: "AI-Powered Analysis",
      description: "Autonomous agents analyze markets 24/7, surfacing alpha you'd never find manually.",
      icon: (
        <svg className="h-6 w-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
      color: "primary",
    },
    {
      title: "On-Chain Insights",
      description: "Real-time data from Base chain. Track smart money, whale moves, and protocol flows.",
      icon: (
        <svg className="h-6 w-6 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      color: "secondary",
    },
    {
      title: "Trade Setups",
      description: "Actionable perp strategies with entry/exit points, risk management, and sizing guidance.",
      icon: (
        <svg className="h-6 w-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: "primary",
    },
    {
      title: "NFI Collectibles",
      description: "Mint each issue as an NFI (NFT Issue). Build your collection, trade insights on-chain.",
      icon: (
        <svg className="h-6 w-6 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
      color: "secondary",
    },
    {
      title: "Community Access",
      description: "Join exclusive Discord channels. Network with other subscribers and share strategies.",
      icon: (
        <svg className="h-6 w-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      color: "primary",
    },
    {
      title: "Downloadable Reports",
      description: "PDF exports of every issue. Archive your alpha, share with your team, or study offline.",
      icon: (
        <svg className="h-6 w-6 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
      ),
      color: "secondary",
    },
  ];

  return (
    <section className="relative py-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white md:text-4xl">Why Subscribe?</h2>
          <p className="mt-4 text-lg text-white/70">Premium insights powered by AI agents and on-chain analysis</p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <div key={index} className="glass-card rounded-2xl p-6 transition hover:bg-white/10" data-testid={`card-feature-${index}`}>
              <div className={`mb-4 inline-flex rounded-xl bg-${feature.color}/20 p-3`}>{feature.icon}</div>
              <h3 className="text-xl font-semibold text-white" data-testid={`text-feature-title-${index}`}>{feature.title}</h3>
              <p className="mt-2 text-white/70" data-testid={`text-feature-description-${index}`}>{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
