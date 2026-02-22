import { ShieldAlert, ShieldCheck, Activity, Database, ArrowUpRight } from "lucide-react";

const recentAudits = [
  { id: "req_0091", agent: "Alpha-Trader-Bot", payload: "Buy 50 SOL (Momentum)", verdict: "FAIL", code: "DJZS-I01", risk: 92, time: "2 min ago" },
  { id: "req_0090", agent: "Treasury-Rebalancer", payload: "Bridge 10k USDC to Arbitrum", verdict: "PASS", code: "NONE", risk: 12, time: "15 min ago" },
  { id: "req_0089", agent: "Governance-Voter", payload: "Vote YES on Prop 44 based on Twitter", verdict: "FAIL", code: "DJZS-E01", risk: 85, time: "1 hr ago" },
  { id: "req_0088", agent: "Alpha-Trader-Bot", payload: "DCA 2 ETH at support level", verdict: "PASS", code: "NONE", risk: 18, time: "3 hrs ago" },
];

const statCards = [
  {
    label: "TOTAL AUDITS (24H)",
    value: "1,248",
    sub: "12% from yesterday",
    subIcon: <ArrowUpRight size={12} className="mr-1" />,
    color: "cyan",
    icon: <Database size={64} />,
  },
  {
    label: "THREATS PREVENTED",
    value: "84",
    sub: "Capital destruction halted",
    subIcon: null,
    color: "red",
    icon: <ShieldAlert size={64} />,
  },
  {
    label: "AVG RISK SCORE",
    value: "34",
    valueSuffix: "/100",
    sub: "Stable logic environment",
    subIcon: null,
    color: "purple",
    icon: <Activity size={64} />,
  },
];

const colorMap: Record<string, { border: string; text: string; iconText: string }> = {
  cyan: { border: "hover:border-cyan-500/50", text: "text-cyan-400", iconText: "text-cyan-400" },
  red: { border: "hover:border-red-500/50", text: "text-red-400", iconText: "text-red-400" },
  purple: { border: "hover:border-purple-500/50", text: "text-purple-400", iconText: "text-purple-400" },
};

export default function DashboardOverview() {
  return (
    <div className="max-w-6xl mx-auto space-y-8">

      <div>
        <h1 className="text-2xl font-bold text-foreground mb-1" data-testid="text-page-title">Live Terminal</h1>
        <p className="text-sm text-muted-foreground">Real-time logic monitoring for your autonomous agents.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map((card) => {
          const c = colorMap[card.color];
          return (
            <div
              key={card.label}
              className={`p-6 rounded-xl bg-card border border-border shadow-lg relative overflow-hidden group ${c.border} transition-colors`}
              data-testid={`card-stat-${card.color}`}
            >
              <div className={`absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity ${c.iconText}`}>
                {card.icon}
              </div>
              <div className="text-xs font-mono text-muted-foreground mb-2">{card.label}</div>
              <div className="text-3xl font-bold text-foreground">
                {card.value}
                {"valueSuffix" in card && (
                  <span className="text-muted-foreground/60 text-lg">{card.valueSuffix}</span>
                )}
              </div>
              <div className={`text-xs ${c.text} mt-2 flex items-center`}>
                {card.subIcon}
                {card.sub}
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-2xl">
        <div className="px-6 py-4 border-b border-border flex justify-between items-center bg-muted">
          <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider font-mono" data-testid="text-ledger-heading">
            Recent Executions
          </h2>
          <button
            className="text-xs font-mono text-cyan-400 hover:text-cyan-300 transition-colors flex items-center"
            data-testid="button-view-full-ledger"
          >
            VIEW FULL LEDGER <ArrowUpRight size={14} className="ml-1" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm font-mono whitespace-nowrap" data-testid="table-recent-audits">
            <thead className="bg-muted/50 text-muted-foreground text-xs border-b border-border">
              <tr>
                <th className="px-6 py-4 font-medium">Request ID</th>
                <th className="px-6 py-4 font-medium">Agent Group</th>
                <th className="px-6 py-4 font-medium">Payload Preview</th>
                <th className="px-6 py-4 font-medium">Risk</th>
                <th className="px-6 py-4 font-medium">Verdict</th>
                <th className="px-6 py-4 font-medium text-right">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-foreground/80">
              {recentAudits.map((audit) => (
                <tr
                  key={audit.id}
                  className="hover:bg-muted/50 transition-colors group cursor-pointer"
                  data-testid={`row-audit-${audit.id}`}
                >
                  <td className="px-6 py-4 text-muted-foreground group-hover:text-cyan-400 transition-colors">{audit.id}</td>
                  <td className="px-6 py-4">{audit.agent}</td>
                  <td className="px-6 py-4 truncate max-w-[200px] text-muted-foreground">{audit.payload}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 rounded text-xs border ${
                        audit.risk > 80
                          ? "border-red-500/30 text-red-400 bg-red-500/10"
                          : "border-border text-muted-foreground bg-muted"
                      }`}
                      data-testid={`badge-risk-${audit.id}`}
                    >
                      {audit.risk}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {audit.verdict === "PASS" ? (
                      <span className="flex items-center text-green-400 text-xs" data-testid={`verdict-${audit.id}`}>
                        <ShieldCheck size={14} className="mr-1" /> PASS
                      </span>
                    ) : (
                      <span className="flex items-center text-red-400 text-xs" data-testid={`verdict-${audit.id}`}>
                        <ShieldAlert size={14} className="mr-1" /> {audit.code}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right text-muted-foreground/60 text-xs">{audit.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
