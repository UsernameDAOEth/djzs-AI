import { ShieldAlert, ShieldCheck, Activity, Database, ArrowUpRight, Zap, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import type { AuditLog } from "@shared/schema";

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

function formatTimeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return "Just now";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} min ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr} hr${diffHr > 1 ? "s" : ""} ago`;
  const diffDay = Math.floor(diffHr / 24);
  return `${diffDay} day${diffDay > 1 ? "s" : ""} ago`;
}

function getPrimaryFlagCode(log: AuditLog): string {
  const flags = log.flags as Array<{ code: string; severity: string; message: string }>;
  if (!flags || flags.length === 0) return "NONE";
  const critical = flags.find(f => f.severity === "CRITICAL");
  if (critical) return critical.code;
  const high = flags.find(f => f.severity === "HIGH");
  if (high) return high.code;
  return flags[0]?.code || "NONE";
}

export default function DashboardOverview() {
  const { data: audits = [], isLoading } = useQuery<AuditLog[]>({
    queryKey: ["/api/audit/logs"],
    refetchInterval: 10000,
  });

  const totalAudits = audits.length;
  const threatsPrevented = audits.filter(a => a.verdict === "FAIL").length;
  const avgRisk = totalAudits > 0
    ? Math.round(audits.reduce((acc, curr) => acc + curr.riskScore, 0) / totalAudits)
    : 0;

  const statCards = [
    {
      label: "TOTAL AUDITS (RECORDED)",
      value: totalAudits.toLocaleString(),
      sub: "Live Sync Active",
      subIcon: <ArrowUpRight size={12} className="mr-1" />,
      color: "cyan",
      glow: "rgba(6,182,212,0.15)",
      borderGlow: "rgba(6,182,212,0.3)",
      icon: <Database size={64} />,
    },
    {
      label: "THREATS PREVENTED",
      value: threatsPrevented.toLocaleString(),
      sub: "Capital destruction halted",
      subIcon: <Zap size={12} className="mr-1" />,
      color: "red",
      glow: "rgba(239,68,68,0.15)",
      borderGlow: "rgba(239,68,68,0.3)",
      icon: <ShieldAlert size={64} />,
    },
    {
      label: "AVG RISK SCORE",
      value: String(avgRisk),
      valueSuffix: "/100",
      sub: "Aggregated from ledger",
      subIcon: null,
      color: "purple",
      glow: "rgba(147,51,234,0.15)",
      borderGlow: "rgba(147,51,234,0.3)",
      icon: <Activity size={64} />,
    },
  ];

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <Loader2 size={32} className="animate-spin text-cyan-400" />
        <div className="text-sm font-mono tracking-widest text-cyan-400">SYNCING WITH DATABASE...</div>
      </div>
    );
  }

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
          <h2 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] font-mono flex items-center" data-testid="text-ledger-heading">
            <span className="relative flex h-2 w-2 mr-2">
              <span className="animate-pulse absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
            </span>
            Live Executions
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm font-mono whitespace-nowrap" data-testid="table-recent-audits">
            <thead className="text-muted-foreground/60 text-[10px] border-b border-border tracking-wide" style={{ background: 'hsl(var(--muted) / 0.5)' }}>
              <tr>
                <th className="px-6 py-4 font-medium">REQUEST ID</th>
                <th className="px-6 py-4 font-medium">TIER</th>
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
              {audits.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground/60 text-sm">
                    Awaiting agent payloads... Deploy an audit from the DJZS.ai Workspace to see results here.
                  </td>
                </tr>
              ) : (
                audits.map((audit, i) => {
                  const flagCode = getPrimaryFlagCode(audit);
                  return (
                    <motion.tr
                      key={audit.id}
                      variants={tableRowVariants}
                      custom={i}
                      className="hover:bg-muted/30 transition-colors group cursor-pointer"
                      data-testid={`row-audit-${audit.auditId}`}
                    >
                      <td className="px-6 py-4 text-muted-foreground/60 group-hover:text-cyan-400 transition-colors">
                        {audit.auditId.slice(0, 8)}
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider" style={{
                          background: audit.tier === 'treasury' ? 'rgba(234,179,8,0.1)' : audit.tier === 'founder' ? 'rgba(147,51,234,0.1)' : 'rgba(6,182,212,0.1)',
                          color: audit.tier === 'treasury' ? '#eab308' : audit.tier === 'founder' ? '#a855f7' : '#06b6d4',
                          border: `1px solid ${audit.tier === 'treasury' ? 'rgba(234,179,8,0.3)' : audit.tier === 'founder' ? 'rgba(147,51,234,0.3)' : 'rgba(6,182,212,0.3)'}`,
                        }}>
                          {audit.tier}
                        </span>
                      </td>
                      <td className="px-6 py-4 truncate max-w-[200px] text-muted-foreground">{audit.strategyMemo.slice(0, 60)}...</td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2.5 py-1 rounded-md text-xs font-bold border ${
                            audit.riskScore > 80
                              ? "text-red-400 bg-red-500/10"
                              : audit.riskScore > 50
                              ? "text-yellow-400 bg-yellow-500/10"
                              : "text-muted-foreground bg-muted"
                          }`}
                          style={{
                            borderColor: audit.riskScore > 80
                              ? 'rgba(239,68,68,0.3)'
                              : audit.riskScore > 50
                              ? 'rgba(234,179,8,0.3)'
                              : 'hsl(var(--border))',
                          }}
                          data-testid={`badge-risk-${audit.auditId}`}
                        >
                          {audit.riskScore}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {audit.verdict === "PASS" ? (
                          <span className="inline-flex items-center text-green-400 text-xs font-bold" data-testid={`verdict-${audit.auditId}`}>
                            <ShieldCheck size={14} className="mr-1.5" />
                            PASS
                          </span>
                        ) : (
                          <span className="inline-flex items-center text-red-400 text-xs font-bold" data-testid={`verdict-${audit.auditId}`}>
                            <ShieldAlert size={14} className="mr-1.5" />
                            {flagCode}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right text-muted-foreground/40 text-xs">{formatTimeAgo(String(audit.createdAt))}</td>
                    </motion.tr>
                  );
                })
              )}
            </motion.tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
