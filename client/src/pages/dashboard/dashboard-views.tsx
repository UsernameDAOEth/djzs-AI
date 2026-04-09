import { ShieldAlert, ShieldCheck, Activity, AlertTriangle, Settings, Key, ExternalLink, Copy, Check } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import type { AuditLog } from "@shared/schema";
import { LOGIC_FAILURE_TAXONOMY } from "@shared/audit-schema";
import { C, MONO } from "@/lib/terminal-theme";

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

const S = {
  sectionTitle: {
    fontFamily: MONO, fontSize: 20, fontWeight: 800, color: C.green, marginBottom: 4,
  } as React.CSSProperties,
  subtitle: {
    fontFamily: MONO, fontSize: 12, color: C.textDim,
  } as React.CSSProperties,
  card: {
    border: `1px solid ${C.border}`, background: C.surface, overflow: "hidden" as const,
  } as React.CSSProperties,
  headerBar: {
    padding: "12px 24px", borderBottom: `1px solid ${C.border}`, background: "#111",
  } as React.CSSProperties,
  headerLabel: {
    fontFamily: MONO, fontSize: 10, fontWeight: 700, color: C.textMuted,
    letterSpacing: "0.2em", textTransform: "uppercase" as const,
  } as React.CSSProperties,
};

export function AuditLedgerView() {
  const { data: audits = [], isLoading } = useQuery<AuditLog[]>({
    queryKey: ["/api/audit/logs"],
    refetchInterval: 10000,
  });

  return (
    <div style={{ maxWidth: 1400, margin: "0 auto" }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={S.sectionTitle} data-testid="text-ledger-title">Audit Ledger</h1>
        <p style={S.subtitle}>Complete forensic log of all ProofOfLogic certificates.</p>
      </div>

      {isLoading ? (
        <div style={{ textAlign: "center", padding: "64px 0", color: C.textMuted, fontFamily: MONO, fontSize: 12 }}>Loading ledger...</div>
      ) : audits.length === 0 ? (
        <div style={{ textAlign: "center", padding: "64px 0", color: C.textMuted, fontFamily: MONO, fontSize: 12 }}>
          No audit records yet. Deploy an audit from the DJZS.ai Workspace.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {audits.map((audit) => {
            const flags = audit.flags as Array<{ code: string; severity: string; message: string }>;
            const borderColor = audit.verdict === "FAIL" ? `${C.red}40` : `${C.green}40`;
            const tierColors: Record<string, string> = { treasury: C.amber, founder: "#a855f7", micro: C.green };
            const tierColor = tierColors[audit.tier] || C.green;
            return (
              <div
                key={audit.id}
                style={{ border: `1px solid ${borderColor}`, background: C.surface, overflow: "hidden" }}
                data-testid={`ledger-record-${audit.auditId}`}
              >
                <div style={{ padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    {audit.verdict === "PASS" ? (
                      <ShieldCheck size={20} color={C.green} />
                    ) : (
                      <ShieldAlert size={20} color={C.red} />
                    )}
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ fontFamily: MONO, fontSize: 13, fontWeight: 700, color: C.text }}>{audit.auditId.slice(0, 8)}</span>
                        <span style={{
                          padding: "2px 8px", fontSize: 10, fontWeight: 700, textTransform: "uppercase",
                          letterSpacing: "0.1em", color: tierColor, background: `${tierColor}15`,
                        }}>
                          {audit.tier}
                        </span>
                        <span style={{
                          padding: "2px 8px", fontSize: 10, fontWeight: 700,
                          color: audit.verdict === "PASS" ? C.green : C.red,
                          background: audit.verdict === "PASS" ? `${C.green}15` : `${C.red}15`,
                        }}>
                          {audit.verdict}
                        </span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                        <p style={{ fontFamily: MONO, fontSize: 10, color: C.textMuted }}>
                          {formatTimeAgo(String(audit.createdAt))} · Risk: {audit.riskScore}/200 · Hash: {audit.cryptographicHash.slice(0, 12)}...
                        </p>
                        {audit.irysTxId ? (
                          <a
                            href={`https://gateway.irys.xyz/${audit.irysTxId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              display: "inline-flex", alignItems: "center", gap: 4,
                              padding: "2px 6px", fontSize: 9, fontWeight: 700, textTransform: "uppercase",
                              letterSpacing: "0.1em", color: "#2dd4bf", background: "#2dd4bf15", textDecoration: "none",
                            }}
                            data-testid={`badge-irys-verified-${audit.auditId}`}
                          >
                            <ExternalLink size={10} />
                            Irys Verified
                          </a>
                        ) : (
                          <span
                            style={{
                              padding: "2px 6px", fontSize: 9, fontWeight: 700, textTransform: "uppercase",
                              letterSpacing: "0.1em", color: C.textMuted, background: "#111",
                            }}
                            data-testid={`badge-local-only-${audit.auditId}`}
                          >
                            Local Only
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <span style={{
                    fontFamily: MONO, fontSize: 24, fontWeight: 900,
                    color: audit.riskScore > 80 ? C.red : audit.riskScore > 50 ? C.amber : C.green,
                  }}>
                    {audit.riskScore}
                  </span>
                </div>
                <div style={{ padding: "12px 24px", borderTop: `1px solid ${C.border}` }}>
                  <p style={{ fontFamily: MONO, fontSize: 11, color: C.textDim, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{audit.strategyMemo}</p>
                </div>
                {flags && flags.length > 0 && (
                  <div style={{ padding: "12px 24px", borderTop: `1px solid ${C.border}`, display: "flex", flexDirection: "column", gap: 6 }}>
                    {flags.map((flag, idx) => {
                      const sevColors: Record<string, string> = { CRITICAL: C.red, HIGH: C.amber, MEDIUM: "#eab308" };
                      const fc = sevColors[flag.severity] || C.textMuted;
                      return (
                        <div key={idx} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11, fontFamily: MONO }}>
                          <span style={{ padding: "1px 6px", fontWeight: 700, color: fc, background: `${fc}15` }}>{flag.code}</span>
                          <span style={{ color: C.textDim }}>{flag.message}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
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
    if (flags) { flags.forEach(flag => { codeFrequency[flag.code] = (codeFrequency[flag.code] || 0) + 1; }); }
  });
  const sortedCodes = Object.entries(codeFrequency).sort((a, b) => b[1] - a[1]);

  const biasFrequency: Record<string, number> = {};
  audits.forEach(audit => {
    if (audit.primaryBiasDetected && audit.primaryBiasDetected !== "None") {
      biasFrequency[audit.primaryBiasDetected] = (biasFrequency[audit.primaryBiasDetected] || 0) + 1;
    }
  });
  const sortedBiases = Object.entries(biasFrequency).sort((a, b) => b[1] - a[1]);

  const stats = [
    { label: "TOTAL AUDITS", value: totalAudits, color: C.green },
    { label: "FAIL RATE", value: `${failRate}%`, color: failRate > 50 ? C.red : C.amber },
    { label: "AVG RISK SCORE", value: `${avgRisk}/200`, color: avgRisk >= 120 ? C.red : avgRisk >= 60 ? C.amber : C.green },
    { label: "PASS / FAIL", value: `${passCount} / ${failCount}`, color: C.text },
  ];

  return (
    <div style={{ maxWidth: 1400, margin: "0 auto" }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={S.sectionTitle} data-testid="text-risk-title">Risk Parameters</h1>
        <p style={S.subtitle}>Aggregated risk intelligence from your audit history.</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 24 }}>
        {stats.map(stat => (
          <div key={stat.label} style={{ padding: 20, border: `1px solid ${C.border}`, background: C.surface }}>
            <div style={{ fontFamily: MONO, fontSize: 10, color: C.textMuted, letterSpacing: "0.15em", marginBottom: 8 }}>{stat.label}</div>
            <div style={{ fontFamily: MONO, fontSize: 22, fontWeight: 900, color: stat.color }}>{stat.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div style={{ ...S.card, padding: 24 }}>
          <h3 style={{ ...S.headerLabel, display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <AlertTriangle size={14} color={C.red} />
            DJZS-LF Code Frequency
          </h3>
          {sortedCodes.length === 0 ? (
            <p style={{ fontFamily: MONO, fontSize: 12, color: C.textMuted }}>No failure codes recorded yet.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {sortedCodes.map(([code, count]) => {
                const taxonomy = LOGIC_FAILURE_TAXONOMY[code as keyof typeof LOGIC_FAILURE_TAXONOMY];
                const percentage = totalAudits > 0 ? Math.round((count / totalAudits) * 100) : 0;
                return (
                  <div key={code}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ fontFamily: MONO, fontSize: 11, fontWeight: 700, color: C.text }}>{code}</span>
                      <span style={{ fontFamily: MONO, fontSize: 10, color: C.textMuted }}>{count} ({percentage}%)</span>
                    </div>
                    {taxonomy && <p style={{ fontFamily: MONO, fontSize: 10, color: C.textMuted, marginBottom: 4 }}>{taxonomy.name}</p>}
                    <div style={{ height: 6, background: "#111", overflow: "hidden" }}>
                      <div style={{ height: "100%", background: `${C.red}cc`, width: `${percentage}%`, transition: "width 0.3s" }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div style={{ ...S.card, padding: 24 }}>
          <h3 style={{ ...S.headerLabel, display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <Activity size={14} color="#a855f7" />
            Bias Detection Frequency
          </h3>
          {sortedBiases.length === 0 ? (
            <p style={{ fontFamily: MONO, fontSize: 12, color: C.textMuted }}>No biases detected yet.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {sortedBiases.map(([bias, count]) => {
                const percentage = totalAudits > 0 ? Math.round((count / totalAudits) * 100) : 0;
                return (
                  <div key={bias}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ fontFamily: MONO, fontSize: 11, fontWeight: 700, color: C.text }}>{bias.replace(/_/g, " ")}</span>
                      <span style={{ fontFamily: MONO, fontSize: 10, color: C.textMuted }}>{count} ({percentage}%)</span>
                    </div>
                    <div style={{ height: 6, background: "#111", overflow: "hidden" }}>
                      <div style={{ height: "100%", background: "#a855f7cc", width: `${percentage}%`, transition: "width 0.3s" }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
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
    { method: "POST", path: "/api/audit/micro", tier: "Micro", price: "$0.10 USDC", color: C.green },
    { method: "POST", path: "/api/audit/founder", tier: "Founder", price: "$1.00 USDC", color: "#a855f7" },
    { method: "POST", path: "/api/audit/treasury", tier: "Treasury", price: "$10.00 USDC", color: C.amber },
    { method: "GET", path: "/api/audit/verify/:txId", tier: "Verify", price: "Free", color: "#2dd4bf" },
    { method: "GET", path: "/api/audit/logs", tier: "Console", price: "Free", color: C.green },
    { method: "GET", path: "/api/audit/schema", tier: "Discovery", price: "Free", color: C.green },
  ];

  const curlExample = `curl -X POST \\
  https://djzs.ai/api/audit/micro \\
  -H "Content-Type: application/json" \\
  -H "x-payment-proof: <BASE_TX_HASH>" \\
  -d '{
    "strategy_memo": "Buy 50 SOL based on momentum indicators breaking above 200 EMA",
    "audit_type": "general"
  }'`;

  const exampleResponse = `{
  "audit_id": "djzs-audit-a1b2c3d4",
  "verdict": "FAIL",
  "risk_score": 72,
  "primary_bias_detected": "MOMENTUM_BIAS",
  "flags": [
    { "code": "DJZS-LF-002", "severity": "HIGH", "message": "No stop-loss defined" }
  ],
  "cryptographic_hash": "0x9f86d081884c...",
  "provenance_provider": "IRYS_DATACHAIN",
  "irys_tx_id": "aBcDeFgHiJkLmNoPqRsTuVwXyZ1234567890abcd",
  "irys_url": "https://gateway.irys.xyz/aBcDeFgHiJkLmNoPqRsTuVwXyZ1234567890abcd",
  "tier": "micro",
  "timestamp": "2026-02-25T12:00:00.000Z"
}`;

  return (
    <div style={{ maxWidth: 1400, margin: "0 auto" }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={S.sectionTitle} data-testid="text-settings-title">API Settings</h1>
        <p style={S.subtitle}>Endpoints, authentication, and integration details for the DJZS Protocol.</p>
      </div>

      <div style={{ ...S.card, marginBottom: 16 }}>
        <div style={S.headerBar}>
          <h3 style={S.headerLabel}>API Endpoints</h3>
        </div>
        {endpoints.map(ep => (
          <div
            key={ep.path}
            style={{ padding: "12px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: `1px solid ${C.border}` }}
            data-testid={`endpoint-${ep.tier.toLowerCase()}`}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <span style={{
                padding: "2px 8px", fontSize: 10, fontWeight: 700, fontFamily: MONO,
                color: ep.method === "POST" ? C.amber : C.green,
                background: ep.method === "POST" ? `${C.amber}15` : `${C.green}15`,
              }}>
                {ep.method}
              </span>
              <code style={{ fontFamily: MONO, fontSize: 13, color: C.text }}>{ep.path}</code>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontFamily: MONO, fontSize: 11, color: ep.color }}>{ep.price}</span>
              <button
                onClick={() => copyToClipboard(ep.path, ep.path)}
                style={{ background: "none", border: "none", cursor: "pointer", color: C.textMuted, padding: 4 }}
                data-testid={`copy-${ep.tier.toLowerCase()}`}
              >
                {copied === ep.path ? <Check size={14} color={C.green} /> : <Copy size={14} />}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div style={{ ...S.card, padding: 24, marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
          <Key size={14} color={C.amber} />
          <h3 style={S.headerLabel}>Authentication</h3>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[
            { label: "x-payment-proof", desc: "Base Mainnet USDC transaction hash. Required for all POST audit endpoints." },
            { label: "x-venice-api-key (optional)", desc: "Bring Your Own Key for Venice AI. Overrides the shared key for AI processing." },
            { label: "x-wallet-address (optional)", desc: "Your wallet address for audit log attribution." },
          ].map(h => (
            <div key={h.label} style={{ padding: 12, background: "#111", border: `1px solid ${C.border}` }}>
              <p style={{ fontFamily: MONO, fontSize: 11, color: C.textMuted, marginBottom: 4 }}>{h.label}</p>
              <p style={{ fontFamily: MONO, fontSize: 12, color: C.textDim }}>{h.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div style={{ ...S.card, marginBottom: 16 }}>
        <div style={{ ...S.headerBar, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={S.headerLabel}>Example Request</h3>
          <button
            onClick={() => copyToClipboard(curlExample, "curl")}
            style={{ background: "none", border: "none", cursor: "pointer", fontFamily: MONO, fontSize: 10, color: C.green, display: "flex", alignItems: "center", gap: 4 }}
            data-testid="button-copy-curl"
          >
            {copied === "curl" ? <><Check size={12} /> Copied</> : <><Copy size={12} /> Copy</>}
          </button>
        </div>
        <pre style={{ padding: "16px 24px", fontFamily: MONO, fontSize: 12, color: C.textDim, overflowX: "auto", whiteSpace: "pre", margin: 0 }}>
          {curlExample}
        </pre>
      </div>

      <div style={{ ...S.card, marginBottom: 16 }}>
        <div style={{ ...S.headerBar, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={S.headerLabel}>Example Response</h3>
          <button
            onClick={() => copyToClipboard(exampleResponse, "response")}
            style={{ background: "none", border: "none", cursor: "pointer", fontFamily: MONO, fontSize: 10, color: C.green, display: "flex", alignItems: "center", gap: 4 }}
            data-testid="button-copy-response"
          >
            {copied === "response" ? <><Check size={12} /> Copied</> : <><Copy size={12} /> Copy</>}
          </button>
        </div>
        <pre style={{ padding: "16px 24px", fontFamily: MONO, fontSize: 12, color: C.textDim, overflowX: "auto", whiteSpace: "pre", margin: 0 }}>
          {exampleResponse}
        </pre>
      </div>

      <div
        style={{ padding: 20, border: `1px solid #2dd4bf30`, background: "#2dd4bf08" }}
        data-testid="card-irys-provenance-note"
      >
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
          <ExternalLink size={16} color="#2dd4bf" style={{ marginTop: 2, flexShrink: 0 }} />
          <div>
            <h4 style={{ fontFamily: MONO, fontSize: 12, fontWeight: 700, color: "#2dd4bf", marginBottom: 4 }}>Irys Datachain Provenance</h4>
            <p style={{ fontFamily: MONO, fontSize: 11, color: C.textDim, lineHeight: 1.7 }}>
              Every ProofOfLogic certificate is permanently uploaded to the Irys Datachain after audit execution. The response includes{" "}
              <code style={{ fontFamily: MONO, fontSize: 10, padding: "1px 4px", background: "#111" }}>irys_tx_id</code> and{" "}
              <code style={{ fontFamily: MONO, fontSize: 10, padding: "1px 4px", background: "#111" }}>irys_url</code>{" "}
              fields for on-chain verification. Certificates are immutable, publicly verifiable, and queryable via{" "}
              <code style={{ fontFamily: MONO, fontSize: 10, padding: "1px 4px", background: "#111" }}>GET /api/audit/verify/:txId</code>.
            </p>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
        <a
          href="/.well-known/agent.json"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "flex", alignItems: "center", gap: 8, padding: "10px 16px",
            fontFamily: MONO, fontSize: 12, color: C.textDim, border: `1px solid ${C.border}`,
            background: C.surface, textDecoration: "none",
          }}
          data-testid="link-agent-json"
        >
          <Settings size={14} />
          agent.json
          <ExternalLink size={12} color={C.textMuted} />
        </a>
        <a
          href="/openapi.json"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "flex", alignItems: "center", gap: 8, padding: "10px 16px",
            fontFamily: MONO, fontSize: 12, color: C.textDim, border: `1px solid ${C.border}`,
            background: C.surface, textDecoration: "none",
          }}
          data-testid="link-openapi-json"
        >
          <Settings size={14} />
          openapi.json
          <ExternalLink size={12} color={C.textMuted} />
        </a>
      </div>
    </div>
  );
}
