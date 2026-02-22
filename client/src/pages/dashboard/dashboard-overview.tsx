import { ShieldAlert, ShieldCheck, Activity, Database, ArrowUpRight, Zap } from "lucide-react";
import { motion } from "framer-motion";

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
    glow: "rgba(6,182,212,0.15)",
    borderGlow: "rgba(6,182,212,0.3)",
    icon: <Database size={64} />,
  },
  {
    label: "THREATS PREVENTED",
    value: "84",
    sub: "Capital destruction halted",
    subIcon: <Zap size={12} className="mr-1" />,
    color: "red",
    glow: "rgba(239,68,68,0.15)",
    borderGlow: "rgba(239,68,68,0.3)",
    icon: <ShieldAlert size={64} />,
  },
  {
    label: "AVG RISK SCORE",
    value: "34",
    valueSuffix: "/100",
    sub: "Stable logic environment",
    subIcon: null,
    color: "purple",
    glow: "rgba(147,51,234,0.15)",
    borderGlow: "rgba(147,51,234,0.3)",
    icon: <Activity size={64} />,
  },
];

const colorMap: Record<string, { border: string; text: string; iconText: string }> = {
  cyan: { border: "hover:border-cyan-500/50", text: "text-cyan-400", iconText: "text-cyan-400" },
  red: { border: "hover:border-red-500/50", text: "text-red-400", iconText: "text-red-400" },
  purple: { border: "hover:border-purple-500/50", text: "text-purple-400", iconText: "text-purple-400" },
};

const containerVariants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.12 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const tableRowVariants = {
  hidden: { opacity: 0, x: -10 },
  show: { opacity: 1, x: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

export default function DashboardOverview() {
  return (
    <div className="max-w-6xl mx-auto space-y-8">

      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-3 mb-1">
          <h1
            className="text-2xl sm:text-3xl font-black tracking-tight text-transparent bg-clip-text"
            style={{ backgroundImage: 'linear-gradient(135deg, #06b6d4, #9333ea)' }}
            data-testid="text-page-title"
          >
            Live Terminal
          </h1>
          <span className="relative flex h-2.5 w-2.5 mt-1">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-400" />
          </span>
        </div>
        <p className="text-sm text-muted-foreground">Real-time logic monitoring for your autonomous agents.</p>
      </motion.div>

      <motion.div
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {statCards.map((card) => {
          const c = colorMap[card.color];
          return (
            <motion.div
              key={card.label}
              variants={itemVariants}
              className={`p-6 rounded-xl border border-border relative overflow-hidden group ${c.border} transition-all cursor-default`}
              style={{
                background: 'hsl(var(--card))',
              }}
              whileHover={{
                boxShadow: `0 0 30px ${card.glow}, 0 0 60px ${card.glow}`,
                borderColor: card.borderGlow,
              }}
              data-testid={`card-stat-${card.color}`}
            >
              <div className={`absolute top-0 right-0 p-4 opacity-[0.04] group-hover:opacity-[0.08] transition-opacity ${c.iconText}`}>
                {card.icon}
              </div>
              <div className="text-[10px] font-mono text-muted-foreground/60 mb-2 tracking-[0.15em]">{card.label}</div>
              <div className="text-3xl font-black text-foreground tracking-tight">
                {card.value}
                {"valueSuffix" in card && card.valueSuffix && (
                  <span className="text-muted-foreground/40 text-lg font-medium">{card.valueSuffix}</span>
                )}
              </div>
              <div className={`text-xs ${c.text} mt-3 flex items-center font-medium`}>
                {card.subIcon}
                {card.sub}
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="rounded-xl border border-border overflow-hidden"
        style={{
          background: 'hsl(var(--card))',
          boxShadow: '0 4px 40px rgba(0,0,0,0.15)',
        }}
      >
        <div className="px-6 py-4 border-b border-border flex justify-between items-center relative overflow-hidden" style={{ background: 'hsl(var(--muted))' }}>
          <div
            className="absolute bottom-0 left-0 right-0 h-[2px]"
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(6,182,212,0.4), rgba(147,51,234,0.4), transparent)',
              animation: 'rz-scan-line 3s ease-in-out infinite',
            }}
          />
          <h2 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] font-mono" data-testid="text-ledger-heading">
            Recent Executions
          </h2>
          <button
            className="text-[10px] font-mono text-cyan-400 hover:text-cyan-300 transition-colors flex items-center tracking-wide"
            data-testid="button-view-full-ledger"
          >
            VIEW FULL LEDGER <ArrowUpRight size={14} className="ml-1" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm font-mono whitespace-nowrap" data-testid="table-recent-audits">
            <thead className="text-muted-foreground/60 text-[10px] border-b border-border tracking-wide" style={{ background: 'hsl(var(--muted) / 0.5)' }}>
              <tr>
                <th className="px-6 py-4 font-medium">REQUEST ID</th>
                <th className="px-6 py-4 font-medium">AGENT GROUP</th>
                <th className="px-6 py-4 font-medium">PAYLOAD PREVIEW</th>
                <th className="px-6 py-4 font-medium">RISK</th>
                <th className="px-6 py-4 font-medium">VERDICT</th>
                <th className="px-6 py-4 font-medium text-right">TIME</th>
              </tr>
            </thead>
            <motion.tbody
              className="divide-y divide-border text-foreground/80"
              variants={containerVariants}
              initial="hidden"
              animate="show"
            >
              {recentAudits.map((audit, i) => (
                <motion.tr
                  key={audit.id}
                  variants={tableRowVariants}
                  custom={i}
                  className="hover:bg-muted/30 transition-colors group cursor-pointer"
                  data-testid={`row-audit-${audit.id}`}
                >
                  <td className="px-6 py-4 text-muted-foreground/60 group-hover:text-cyan-400 transition-colors">{audit.id}</td>
                  <td className="px-6 py-4 font-medium">{audit.agent}</td>
                  <td className="px-6 py-4 truncate max-w-[200px] text-muted-foreground">{audit.payload}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2.5 py-1 rounded-md text-xs font-bold border ${
                        audit.risk > 80
                          ? "text-red-400 bg-red-500/10"
                          : audit.risk > 50
                          ? "text-yellow-400 bg-yellow-500/10"
                          : "text-muted-foreground bg-muted"
                      }`}
                      style={{
                        borderColor: audit.risk > 80
                          ? 'rgba(239,68,68,0.3)'
                          : audit.risk > 50
                          ? 'rgba(234,179,8,0.3)'
                          : 'hsl(var(--border))',
                      }}
                      data-testid={`badge-risk-${audit.id}`}
                    >
                      {audit.risk}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {audit.verdict === "PASS" ? (
                      <span className="inline-flex items-center text-green-400 text-xs font-bold" data-testid={`verdict-${audit.id}`}>
                        <ShieldCheck size={14} className="mr-1.5" />
                        PASS
                      </span>
                    ) : (
                      <span className="inline-flex items-center text-red-400 text-xs font-bold" data-testid={`verdict-${audit.id}`}>
                        <ShieldAlert size={14} className="mr-1.5" />
                        {audit.code}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right text-muted-foreground/40 text-xs">{audit.time}</td>
                </motion.tr>
              ))}
            </motion.tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
