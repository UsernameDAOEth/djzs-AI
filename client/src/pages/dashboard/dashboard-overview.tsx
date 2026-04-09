import { ShieldAlert, ShieldCheck, Activity, Database, ArrowUpRight, Zap, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { AuditLog } from "@shared/schema";
import { C, MONO, GlowDot } from "@/lib/terminal-theme";

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
    { label: "TOTAL AUDITS (RECORDED)", value: totalAudits.toLocaleString(), sub: "Live Sync Active", subIcon: <ArrowUpRight size={12} />, color: C.green, icon: <Database size={48} /> },
    { label: "THREATS PREVENTED", value: threatsPrevented.toLocaleString(), sub: "Capital destruction halted", subIcon: <Zap size={12} />, color: C.red, icon: <ShieldAlert size={48} /> },
    { label: "AVG RISK SCORE", value: String(avgRisk), valueSuffix: "/200", sub: "Aggregated from ledger", subIcon: null, color: C.amber, icon: <Activity size={48} /> },
  ];

  if (isLoading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "60vh", gap: 16 }}>
        <Loader2 size={32} color={C.green} style={{ animation: "spin 1s linear infinite" }} />
        <div style={{ fontFamily: MONO, fontSize: 12, letterSpacing: "0.15em", color: C.green }}>SYNCING WITH DATABASE...</div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1400, margin: "0 auto" }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
          <h1 style={{ fontFamily: MONO, fontSize: 22, fontWeight: 800, color: C.green }} data-testid="text-page-title">
            Live Terminal
          </h1>
          <GlowDot color={C.green} size={10} />
        </div>
        <p style={{ fontFamily: MONO, fontSize: 12, color: C.textDim }}>Real-time logic monitoring for your autonomous agents.</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 32 }}>
        {statCards.map((card) => (
          <div
            key={card.label}
            style={{
              padding: 24, border: `1px solid ${card.color}30`, background: C.surface,
              position: "relative", overflow: "hidden",
            }}
            data-testid={`card-stat-${card.color === C.green ? "cyan" : card.color === C.red ? "red" : "purple"}`}
          >
            <div style={{ position: "absolute", top: 12, right: 12, opacity: 0.06, color: card.color }}>{card.icon}</div>
            <div style={{ fontFamily: MONO, fontSize: 10, color: C.textMuted, letterSpacing: "0.15em", marginBottom: 8 }}>{card.label}</div>
            <div style={{ fontFamily: MONO, fontSize: 28, fontWeight: 900, color: C.text }}>
              {card.value}
              {"valueSuffix" in card && card.valueSuffix && (
                <span style={{ color: C.textMuted, fontSize: 16, fontWeight: 400 }}>{card.valueSuffix}</span>
              )}
            </div>
            <div style={{ fontFamily: MONO, fontSize: 11, color: card.color, marginTop: 12, display: "flex", alignItems: "center", gap: 4 }}>
              {card.subIcon}
              {card.sub}
            </div>
          </div>
        ))}
      </div>

      <div style={{ border: `1px solid ${C.border}`, background: C.surface, overflow: "hidden" }}>
        <div style={{ padding: "12px 24px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", background: "#111" }}>
          <h2 style={{ fontFamily: MONO, fontSize: 10, fontWeight: 700, color: C.textMuted, letterSpacing: "0.2em", textTransform: "uppercase", display: "flex", alignItems: "center", gap: 8 }} data-testid="text-ledger-heading">
            <GlowDot color={C.green} size={8} />
            Live Executions
          </h2>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", textAlign: "left", fontFamily: MONO, fontSize: 12, borderCollapse: "collapse" }} data-testid="table-recent-audits">
            <thead>
              <tr style={{ borderBottom: `1px solid ${C.border}`, background: "#111" }}>
                {["REQUEST ID", "TIER", "PAYLOAD PREVIEW", "RISK", "VERDICT", "TIME"].map((h, i) => (
                  <th key={h} style={{ padding: "12px 24px", fontSize: 10, fontWeight: 600, color: C.textMuted, letterSpacing: "0.1em", textAlign: i === 5 ? "right" : "left" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {audits.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: "48px 24px", textAlign: "center", color: C.textMuted, fontSize: 12 }}>
                    Awaiting agent payloads... Deploy an audit from the DJZS.ai Workspace to see results here.
                  </td>
                </tr>
              ) : (
                audits.map((audit) => {
                  const flagCode = getPrimaryFlagCode(audit);
                  const tierColors: Record<string, string> = { treasury: C.amber, founder: "#a855f7", micro: C.green };
                  const tierColor = tierColors[audit.tier] || C.green;
                  return (
                    <tr
                      key={audit.id}
                      style={{ borderBottom: `1px solid ${C.border}`, cursor: "pointer" }}
                      data-testid={`row-audit-${audit.auditId}`}
                    >
                      <td style={{ padding: "12px 24px", color: C.textDim }}>
                        {audit.auditId.slice(0, 8)}
                      </td>
                      <td style={{ padding: "12px 24px" }}>
                        <span style={{
                          padding: "2px 8px", fontSize: 10, fontWeight: 700, textTransform: "uppercase",
                          letterSpacing: "0.1em", color: tierColor, background: `${tierColor}15`, border: `1px solid ${tierColor}30`,
                        }}>
                          {audit.tier}
                        </span>
                      </td>
                      <td style={{ padding: "12px 24px", color: C.textDim, maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {audit.strategyMemo.slice(0, 60)}...
                      </td>
                      <td style={{ padding: "12px 24px" }}>
                        <span
                          style={{
                            padding: "2px 8px", fontSize: 11, fontWeight: 700,
                            color: audit.riskScore > 80 ? C.red : audit.riskScore > 50 ? C.amber : C.textDim,
                            background: audit.riskScore > 80 ? `${C.red}15` : audit.riskScore > 50 ? `${C.amber}15` : "#111",
                            border: `1px solid ${audit.riskScore > 80 ? `${C.red}30` : audit.riskScore > 50 ? `${C.amber}30` : C.border}`,
                          }}
                          data-testid={`badge-risk-${audit.auditId}`}
                        >
                          {audit.riskScore}
                        </span>
                      </td>
                      <td style={{ padding: "12px 24px" }}>
                        {audit.verdict === "PASS" ? (
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 6, color: C.green, fontSize: 11, fontWeight: 700 }} data-testid={`verdict-${audit.auditId}`}>
                            <ShieldCheck size={14} />
                            PASS
                          </span>
                        ) : (
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 6, color: C.red, fontSize: 11, fontWeight: 700 }} data-testid={`verdict-${audit.auditId}`}>
                            <ShieldAlert size={14} />
                            {flagCode}
                          </span>
                        )}
                      </td>
                      <td style={{ padding: "12px 24px", textAlign: "right", color: C.textMuted, fontSize: 11 }}>
                        {formatTimeAgo(String(audit.createdAt))}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
