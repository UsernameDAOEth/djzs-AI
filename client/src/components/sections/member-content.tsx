const issues = [
  {
    id: 42,
    title: "DJZS Alpha Drop: DeFi Yield Plays",
    description: "Agent-curated perp setups, liquidity notes, and on-chain flows. Deep dive into emerging yield opportunities.",
    publishedAt: "2 days ago",
    badge: "primary",
  },
  {
    id: 41,
    title: "Base Ecosystem Deep Dive",
    description: "Comprehensive analysis of Base chain growth, major protocols, and upcoming catalysts for Q1 2024.",
    publishedAt: "1 week ago",
    badge: "secondary",
  },
  {
    id: 40,
    title: "AI Trading Agents Analysis",
    description: "How autonomous agents are reshaping crypto markets. Performance metrics and integration strategies.",
    publishedAt: "2 weeks ago",
    badge: "primary",
  },
  {
    id: 39,
    title: "NFT Market Sentiment Report",
    description: "Volume trends, collector behavior, and emerging collections. On-chain data reveals market shifts.",
    publishedAt: "3 weeks ago",
    badge: "secondary",
  },
  {
    id: 38,
    title: "Layer 2 Scaling Wars Update",
    description: "Comparative analysis of Base, Optimism, Arbitrum. TPS metrics, fee comparisons, and developer activity.",
    publishedAt: "4 weeks ago",
    badge: "primary",
  },
  {
    id: 37,
    title: "DeFi Protocol Revenue Models",
    description: "Breaking down fee structures, token economics, and sustainability metrics across top protocols.",
    publishedAt: "1 month ago",
    badge: "secondary",
  },
];

export function MemberContent() {
  return (
    <div className="mt-8">
      {/* Member Content Section Header */}
      <div className="mb-6 flex items-center justify-between">
        <h4 className="text-xl font-bold text-white">Latest Issues</h4>
        <button className="text-sm text-primary hover:text-primary/80 underline" data-testid="button-view-all">
          View All →
        </button>
      </div>

      {/* Newsletter Issue Cards Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {issues.map((issue) => (
          <article key={issue.id} className="glass-card group rounded-2xl p-5 transition hover:bg-white/10" data-testid={`card-issue-${issue.id}`}>
            <div className="mb-3 flex items-center gap-2">
              <span
                className={`rounded-lg px-2 py-1 text-xs font-semibold ${
                  issue.badge === "primary" ? "bg-primary/20 text-primary" : "bg-secondary/20 text-secondary"
                }`}
                data-testid={`text-issue-number-${issue.id}`}
              >
                Issue #{issue.id}
              </span>
              <span className="text-xs text-white/50" data-testid={`text-issue-date-${issue.id}`}>{issue.publishedAt}</span>
            </div>
            <h4 className="font-semibold text-white" data-testid={`text-issue-title-${issue.id}`}>{issue.title}</h4>
            <p className="mt-2 text-sm text-white/70" data-testid={`text-issue-description-${issue.id}`}>{issue.description}</p>

            <div className="mt-4 flex items-center gap-2">
              <button className="flex-1 rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-sm font-medium text-white transition hover:bg-white/20" data-testid={`button-read-pdf-${issue.id}`}>
                Read PDF
              </button>
              <button className="rounded-xl border border-primary/30 bg-primary/10 px-3 py-2 text-sm font-medium text-primary transition hover:bg-primary/20" data-testid={`button-mint-nfi-${issue.id}`}>
                Mint NFI
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
