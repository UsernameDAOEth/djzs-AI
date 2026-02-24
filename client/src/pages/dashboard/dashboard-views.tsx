import { ShieldAlert, ShieldCheck, Activity, AlertTriangle, Settings, Key, ExternalLink, Copy, Check } from "lucide-react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import type { AuditLog } from "@shared/schema";
import { LOGIC_FAILURE_TAXONOMY } from "@shared/audit-schema";

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
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
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  return `${diffDay}d ago`;
}

export function AuditLedgerView() {
  const { data: audits = [], isLoading } = useQuery<AuditLog[]>({
    queryKey: ["/api/audit/logs"],
    refetchInterval: 10000,
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1
          className="text-2xl sm:text-3xl font-black tracking-tight text-transparent bg-clip-text mb-1"
          style={{ backgroundImage: 'linear-gradient(135deg, #06b6d4, #9333ea)' }}
          data-testid="text-ledger-title"
        >
          Audit Ledger
        </h1>
        <p className="text-sm text-muted-foreground">Complete forensic log of all ProofOfLogic certificates.</p>
      </motion.div>

      {isLoading ? (
        <div className="text-center py-16 text-muted-foreground/60 font-mono text-sm">Loading ledger...</div>
      ) : audits.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground/60 font-mono text-sm">
          No audit records yet. Deploy an audit from the DJZS.ai Workspace.
        </div>
      ) : (
        <motion.div className="space-y-4" variants={containerVariants} initial="hidden" animate="show">
          {audits.map((audit) => {
            const flags = audit.flags as Array<{ code: string; severity: string; message: string }>;
            return (
              <motion.div
                key={audit.id}
                variants={itemVariants}
                className="rounded-xl border overflow-hidden"
                style={{
                  background: 'hsl(var(--card))',
                  borderColor: audit.verdict === "FAIL" ? 'rgba(239,68,68,0.3)' : 'rgba(34,197,94,0.3)',
                }}
                data-testid={`ledger-record-${audit.auditId}`}
              >
                <div className="px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {audit.verdict === "PASS" ? (
                      <ShieldCheck size={20} className="text-green-400" />
                    ) : (
                      <ShieldAlert size={20} className="text-red-400" />
                    )}
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-sm text-foreground font-bold">{audit.auditId.slice(0, 8)}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider" style={{
                          background: audit.tier === 'treasury' ? 'rgba(234,179,8,0.1)' : audit.tier === 'founder' ? 'rgba(147,51,234,0.1)' : 'rgba(6,182,212,0.1)',
                          color: audit.tier === 'treasury' ? '#eab308' : audit.tier === 'founder' ? '#a855f7' : '#06b6d4',
                        }}>
                          {audit.tier}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${audit.verdict === "PASS" ? "text-green-400 bg-green-500/10" : "text-red-400 bg-red-500/10"}`}>
                          {audit.verdict}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-xs text-muted-foreground/60 font-mono">{formatTimeAgo(String(audit.createdAt))} · Risk: {audit.riskScore}/100 · Hash: {audit.cryptographicHash.slice(0, 12)}...</p>
                        {audit.irysTxId ? (
                          <a
                            href={`https://gateway.irys.xyz/${audit.irysTxId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-teal-500/10 text-teal-400 hover:bg-teal-500/20 transition-colors"
                            data-testid={`badge-irys-verified-${audit.auditId}`}
                          >
                            <ExternalLink size={10} />
                            Irys Verified
                          </a>
                        ) : (
                          <span
                            className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-muted/30 text-muted-foreground/50"
                            data-testid={`badge-local-only-${audit.auditId}`}
                          >
                            Local Only
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <span className={`text-2xl font-black ${audit.riskScore > 80 ? "text-red-400" : audit.riskScore > 50 ? "text-yellow-400" : "text-green-400"}`}>
                    {audit.riskScore}
                  </span>
                </div>
                <div className="px-6 py-3 border-t border-border">
                  <p className="text-xs text-muted-foreground line-clamp-2">{audit.strategyMemo}</p>
                </div>
                {flags && flags.length > 0 && (
                  <div className="px-6 py-3 border-t border-border space-y-1.5">
                    {flags.map((flag, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs">
                        <span className={`px-1.5 py-0.5 rounded font-mono font-bold ${
                          flag.severity === "CRITICAL" ? "text-red-400 bg-red-500/10" :
                          flag.severity === "HIGH" ? "text-orange-400 bg-orange-500/10" :
                          flag.severity === "MEDIUM" ? "text-yellow-400 bg-yellow-500/10" :
                          "text-muted-foreground bg-muted"
                        }`}>{flag.code}</span>
                        <span className="text-muted-foreground/80">{flag.message}</span>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}

export function RiskParametersView() {
  const { data: audits = [] } = useQuery<AuditLog[]>({
    queryKey: ["/api/audit/logs"],
    refetchInterval: 10000,
  });

  const totalAudits = audits.length;
  const failCount = audits.filter(a => a.verdict === "FAIL").length;
  const passCount = audits.filter(a => a.verdict === "PASS").length;
  const avgRisk = totalAudits > 0 ? Math.round(audits.reduce((acc, curr) => acc + curr.riskScore, 0) / totalAudits) : 0;
  const failRate = totalAudits > 0 ? Math.round((failCount / totalAudits) * 100) : 0;

  const codeFrequency: Record<string, number> = {};
  audits.forEach(audit => {
    const flags = audit.flags as Array<{ code: string; severity: string }>;
    if (flags) {
      flags.forEach(flag => {
        codeFrequency[flag.code] = (codeFrequency[flag.code] || 0) + 1;
      });
    }
  });

  const sortedCodes = Object.entries(codeFrequency).sort((a, b) => b[1] - a[1]);

  const biasFrequency: Record<string, number> = {};
  audits.forEach(audit => {
    if (audit.primaryBiasDetected && audit.primaryBiasDetected !== "None") {
      biasFrequency[audit.primaryBiasDetected] = (biasFrequency[audit.primaryBiasDetected] || 0) + 1;
    }
  });
  const sortedBiases = Object.entries(biasFrequency).sort((a, b) => b[1] - a[1]);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1
          className="text-2xl sm:text-3xl font-black tracking-tight text-transparent bg-clip-text mb-1"
          style={{ backgroundImage: 'linear-gradient(135deg, #06b6d4, #9333ea)' }}
          data-testid="text-risk-title"
        >
          Risk Parameters
        </h1>
        <p className="text-sm text-muted-foreground">Aggregated risk intelligence from your audit history.</p>
      </motion.div>

      <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" variants={containerVariants} initial="hidden" animate="show">
        {[
          { label: "TOTAL AUDITS", value: totalAudits, color: "text-cyan-400" },
          { label: "FAIL RATE", value: `${failRate}%`, color: failRate > 50 ? "text-red-400" : "text-yellow-400" },
          { label: "AVG RISK SCORE", value: `${avgRisk}/100`, color: avgRisk > 60 ? "text-red-400" : avgRisk > 40 ? "text-yellow-400" : "text-green-400" },
          { label: "PASS / FAIL", value: `${passCount} / ${failCount}`, color: "text-foreground" },
        ].map(stat => (
          <motion.div
            key={stat.label}
            variants={itemVariants}
            className="p-5 rounded-xl border border-border"
            style={{ background: 'hsl(var(--card))' }}
          >
            <div className="text-[10px] font-mono text-muted-foreground/60 tracking-[0.15em] mb-2">{stat.label}</div>
            <div className={`text-2xl font-black ${stat.color}`}>{stat.value}</div>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-xl border border-border p-6"
          style={{ background: 'hsl(var(--card))' }}
        >
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-[0.2em] font-mono mb-4 flex items-center gap-2">
            <AlertTriangle size={14} className="text-red-400" />
            DJZS-LF Code Frequency
          </h3>
          {sortedCodes.length === 0 ? (
            <p className="text-sm text-muted-foreground/60">No failure codes recorded yet.</p>
          ) : (
            <div className="space-y-3">
              {sortedCodes.map(([code, count]) => {
                const taxonomy = LOGIC_FAILURE_TAXONOMY[code as keyof typeof LOGIC_FAILURE_TAXONOMY];
                const percentage = totalAudits > 0 ? Math.round((count / totalAudits) * 100) : 0;
                return (
                  <div key={code}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-mono font-bold text-foreground">{code}</span>
                      <span className="text-[10px] text-muted-foreground/60 font-mono">{count} ({percentage}%)</span>
                    </div>
                    {taxonomy && <p className="text-[10px] text-muted-foreground/60 mb-1">{taxonomy.name}</p>}
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                      <div className="h-full rounded-full bg-red-400/80 transition-all" style={{ width: `${percentage}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-xl border border-border p-6"
          style={{ background: 'hsl(var(--card))' }}
        >
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-[0.2em] font-mono mb-4 flex items-center gap-2">
            <Activity size={14} className="text-purple-400" />
            Bias Detection Frequency
          </h3>
          {sortedBiases.length === 0 ? (
            <p className="text-sm text-muted-foreground/60">No biases detected yet.</p>
          ) : (
            <div className="space-y-3">
              {sortedBiases.map(([bias, count]) => {
                const percentage = totalAudits > 0 ? Math.round((count / totalAudits) * 100) : 0;
                return (
                  <div key={bias}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-mono font-bold text-foreground">{bias.replace(/_/g, " ")}</span>
                      <span className="text-[10px] text-muted-foreground/60 font-mono">{count} ({percentage}%)</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                      <div className="h-full rounded-full bg-purple-400/80 transition-all" style={{ width: `${percentage}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

export function APISettingsView() {
  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  const endpoints = [
    { method: "POST", path: "/api/audit/micro", tier: "Micro", price: "$2.50 USDC", color: "#06b6d4" },
    { method: "POST", path: "/api/audit/founder", tier: "Founder", price: "$5.00 USDC", color: "#a855f7" },
    { method: "POST", path: "/api/audit/treasury", tier: "Treasury", price: "$50.00 USDC", color: "#eab308" },
    { method: "GET", path: "/api/audit/verify/:txId", tier: "Verify", price: "Free", color: "#14b8a6" },
    { method: "GET", path: "/api/audit/logs", tier: "Console", price: "Free", color: "#22c55e" },
    { method: "GET", path: "/api/audit/schema", tier: "Discovery", price: "Free", color: "#22c55e" },
  ];

  const curlExample = `curl -X POST \\
  https://djzs.ai/api/audit/micro \\
  -H "Content-Type: application/json" \\
  -H "x-payment-proof: <BASE_TX_HASH>" \\
  -d '{
    "strategy_memo": "Buy 50 SOL based on momentum indicators breaking above 200 EMA",
    "audit_type": "general"
  }'`;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1
          className="text-2xl sm:text-3xl font-black tracking-tight text-transparent bg-clip-text mb-1"
          style={{ backgroundImage: 'linear-gradient(135deg, #06b6d4, #9333ea)' }}
          data-testid="text-settings-title"
        >
          API Settings
        </h1>
        <p className="text-sm text-muted-foreground">Endpoints, authentication, and integration details for the DJZS Protocol.</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-border overflow-hidden"
        style={{ background: 'hsl(var(--card))' }}
      >
        <div className="px-6 py-4 border-b border-border" style={{ background: 'hsl(var(--muted))' }}>
          <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] font-mono">API Endpoints</h3>
        </div>
        <div className="divide-y divide-border">
          {endpoints.map(ep => (
            <div key={ep.path} className="px-6 py-4 flex items-center justify-between hover:bg-muted/30 transition-colors" data-testid={`endpoint-${ep.tier.toLowerCase()}`}>
              <div className="flex items-center gap-4">
                <span className="px-2 py-1 rounded text-[10px] font-mono font-bold" style={{
                  background: ep.method === "POST" ? 'rgba(243,126,32,0.1)' : 'rgba(34,197,94,0.1)',
                  color: ep.method === "POST" ? '#F37E20' : '#22c55e',
                }}>
                  {ep.method}
                </span>
                <code className="text-sm font-mono text-foreground">{ep.path}</code>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono" style={{ color: ep.color }}>{ep.price}</span>
                <button
                  onClick={() => copyToClipboard(ep.path, ep.path)}
                  className="p-1.5 rounded-md text-muted-foreground/50 hover:text-foreground hover:bg-muted transition-all"
                  data-testid={`copy-${ep.tier.toLowerCase()}`}
                >
                  {copied === ep.path ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                </button>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-xl border border-border p-6"
        style={{ background: 'hsl(var(--card))' }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] font-mono flex items-center gap-2">
            <Key size={14} className="text-orange-400" />
            Authentication
          </h3>
        </div>
        <div className="space-y-3">
          <div className="p-4 rounded-lg bg-muted/50 border border-border">
            <p className="text-xs font-mono text-muted-foreground mb-1">x-payment-proof</p>
            <p className="text-sm text-foreground/80">Base Mainnet USDC transaction hash. Required for all POST audit endpoints.</p>
          </div>
          <div className="p-4 rounded-lg bg-muted/50 border border-border">
            <p className="text-xs font-mono text-muted-foreground mb-1">x-venice-api-key (optional)</p>
            <p className="text-sm text-foreground/80">Bring Your Own Key for Venice AI. Overrides the shared key for AI processing.</p>
          </div>
          <div className="p-4 rounded-lg bg-muted/50 border border-border">
            <p className="text-xs font-mono text-muted-foreground mb-1">x-wallet-address (optional)</p>
            <p className="text-sm text-foreground/80">Your wallet address for audit log attribution.</p>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-xl border border-border overflow-hidden"
        style={{ background: 'hsl(var(--card))' }}
      >
        <div className="px-6 py-4 border-b border-border flex items-center justify-between" style={{ background: 'hsl(var(--muted))' }}>
          <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] font-mono">Example Request</h3>
          <button
            onClick={() => copyToClipboard(curlExample, "curl")}
            className="text-[10px] font-mono text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1"
            data-testid="button-copy-curl"
          >
            {copied === "curl" ? <><Check size={12} /> Copied</> : <><Copy size={12} /> Copy</>}
          </button>
        </div>
        <pre className="px-6 py-4 text-sm font-mono text-foreground/80 overflow-x-auto whitespace-pre">
          {curlExample}
        </pre>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex gap-3"
      >
        <a
          href="/.well-known/agent.json"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground border border-border hover:bg-muted/50 transition-all"
          data-testid="link-agent-json"
        >
          <Settings size={14} />
          agent.json
          <ExternalLink size={12} className="text-muted-foreground/40" />
        </a>
        <a
          href="/openapi.json"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground border border-border hover:bg-muted/50 transition-all"
          data-testid="link-openapi"
        >
          <Settings size={14} />
          openapi.json
          <ExternalLink size={12} className="text-muted-foreground/40" />
        </a>
      </motion.div>
    </div>
  );
}
