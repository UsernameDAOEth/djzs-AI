import { useState } from "react";
import { Link } from "wouter";
import {
  Shield,
  HardDrive,
  Bot,
  Lock,
  Zap,
  BookOpen,
  ArrowRight,
  Key,
  ExternalLink,
  Users,
  Database,
  Brain,
  Sparkles,
  FileSearch,
  KeyRound,
  ShieldCheck,
  DollarSign,
  CheckCircle,
  Code2,
  AlertTriangle,
  Activity,
  Cpu,
  MessageSquare,
  Layers,
  Link2,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { C, MONO, TerminalPage, TerminalHeading, TerminalFooter, GlowDot, Badge } from "@/lib/terminal-theme";

const S = {
  card: {
    padding: 24,
    border: `1px solid ${C.border}`,
    backgroundColor: C.surface,
    marginBottom: 0,
  } as React.CSSProperties,
  cardHover: {
    padding: 24,
    border: `1px solid ${C.border}`,
    backgroundColor: C.surface,
    cursor: "default",
  } as React.CSSProperties,
  codeBlock: {
    backgroundColor: "#111",
    border: `1px solid ${C.border}`,
    padding: "32px 20px 20px",
    overflow: "auto" as const,
    position: "relative" as const,
  },
  codeLabel: {
    position: "absolute" as const,
    top: 8,
    left: 16,
    fontFamily: MONO,
    fontSize: 10,
    letterSpacing: "0.15em",
    textTransform: "uppercase" as const,
    color: C.textMuted,
  },
  table: {
    width: "100%",
    borderCollapse: "collapse" as const,
    fontFamily: MONO,
    fontSize: 12,
  },
  th: {
    textAlign: "left" as const,
    padding: "10px 12px",
    fontSize: 10,
    fontWeight: 700,
    color: C.textMuted,
    letterSpacing: "0.12em",
    textTransform: "uppercase" as const,
    borderBottom: `1px solid ${C.border}`,
  },
  td: {
    padding: "10px 12px",
    fontSize: 12,
    color: C.textDim,
    borderBottom: `1px solid ${C.border}`,
  },
  sectionGap: { marginBottom: 48 } as React.CSSProperties,
  label: {
    fontFamily: MONO,
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: "0.12em",
    textTransform: "uppercase" as const,
    marginBottom: 4,
  } as React.CSSProperties,
  paragraph: {
    fontFamily: MONO,
    fontSize: 13,
    lineHeight: 1.8,
    color: C.textDim,
  } as React.CSSProperties,
  iconBox: (color: string) => ({
    width: 40,
    height: 40,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: `${color}15`,
    border: `1px solid ${color}30`,
  }) as React.CSSProperties,
  iconBoxLg: (color: string) => ({
    width: 48,
    height: 48,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: `${color}15`,
    border: `1px solid ${color}30`,
  }) as React.CSSProperties,
  dot: (color: string) => ({
    width: 6,
    height: 6,
    borderRadius: "50%",
    backgroundColor: color,
    flexShrink: 0,
    marginTop: 7,
  }) as React.CSSProperties,
  inlineCode: (color: string) => ({
    fontFamily: MONO,
    fontSize: 11,
    color,
    backgroundColor: `${color}15`,
    padding: "2px 6px",
    borderRadius: 2,
  }) as React.CSSProperties,
  severityBadge: (color: string) => ({
    fontFamily: MONO,
    fontSize: 10,
    fontWeight: 700,
    color,
    backgroundColor: `${color}15`,
    padding: "2px 8px",
    borderRadius: 2,
    textTransform: "uppercase" as const,
  }),
  grid2: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: 16,
  } as React.CSSProperties,
  grid3: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 16,
  } as React.CSSProperties,
};

function FeatureCard({ icon: Icon, title, description, color }: { icon: typeof Shield; title: string; description: string; color: string }) {
  return (
    <div style={{ ...S.card, borderColor: `${color}30` }}>
      <div style={S.iconBox(color)}>
        <Icon size={18} color={color} />
      </div>
      <h3 style={{ fontFamily: MONO, fontSize: 14, fontWeight: 700, color: C.text, margin: "12px 0 8px" }}>{title}</h3>
      <p style={{ ...S.paragraph, fontSize: 12 }}>{description}</p>
    </div>
  );
}

function QuickLink({ href, title, description, external, testId }: { href: string; title: string; description: string; external?: boolean; testId?: string }) {
  const inner = (
    <div
      style={{ ...S.card, cursor: "pointer", borderColor: `${C.green}30` }}
      data-testid={testId}
      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = C.green; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = `${C.green}30`; }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <h4 style={{ fontFamily: MONO, fontSize: 13, fontWeight: 700, color: C.text }}>{title}</h4>
        {external ? <ExternalLink size={14} color={C.textMuted} /> : <ArrowRight size={14} color={C.textMuted} />}
      </div>
      <p style={{ fontFamily: MONO, fontSize: 11, color: C.textDim }}>{description}</p>
    </div>
  );
  if (external) return <a href={href} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>{inner}</a>;
  return <Link href={href}>{inner}</Link>;
}

function TechStackItem({ icon: Icon, category, items, color }: { icon: typeof Shield; category: string; items: string[]; color: string }) {
  return (
    <div style={{ ...S.card, borderColor: `${color}30` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
        <div style={S.iconBox(color)}>
          <Icon size={18} color={color} />
        </div>
        <h4 style={{ fontFamily: MONO, fontSize: 12, fontWeight: 700, color: C.text }}>{category}</h4>
      </div>
      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {items.map((item, i) => (
          <li key={i} style={{ display: "flex", alignItems: "center", gap: 10, fontFamily: MONO, fontSize: 12, color: C.textDim, marginBottom: 8 }}>
            <span style={S.dot(color)} />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function AccordionSection({ num, title, open, onToggle, children }: {
  num: string; title: string; open: boolean; onToggle: () => void; children: React.ReactNode;
}) {
  return (
    <section style={S.sectionGap}>
      <button
        onClick={onToggle}
        style={{
          display: "flex", alignItems: "center", gap: 8, width: "100%",
          background: "none", border: "none", cursor: "pointer", padding: 0,
          textAlign: "left",
        }}
        aria-expanded={open}
        data-testid={`accordion-toggle-${num}`}
      >
        {open ? <ChevronDown size={16} color={C.green} /> : <ChevronRight size={16} color={C.textMuted} />}
        <div style={{ flex: 1 }}>
          <TerminalHeading num={num}>{title}</TerminalHeading>
        </div>
      </button>
      {open && <div style={{ marginTop: 8 }}>{children}</div>}
    </section>
  );
}

export default function Docs() {
  const [openSections, setOpenSections] = useState<Set<string>>(() => new Set(["01", "02"]));
  function toggleSection(num: string) {
    setOpenSections(prev => {
      const next = new Set(prev);
      next.has(num) ? next.delete(num) : next.add(num);
      return next;
    });
  }

  return (
    <TerminalPage maxWidth={960}>

      <div style={{ textAlign: "center", marginBottom: 48, paddingTop: 32 }}>
        <h1 style={{ fontFamily: MONO, fontSize: 28, fontWeight: 800, color: C.green, letterSpacing: "0.05em", marginBottom: 12 }}>
          DJZS Documentation
        </h1>
        <div style={{ display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
          <Link href="/chat">
            <span
              style={{
                fontFamily: MONO, fontSize: 12, fontWeight: 600, padding: "10px 24px",
                border: `1px solid ${C.green}`, backgroundColor: C.greenGlow, color: C.green,
                cursor: "pointer", display: "inline-block", textDecoration: "none",
              }}
              data-testid="button-open-app-docs"
            >
              Open Architect Console
            </span>
          </Link>
          <button
            onClick={() => setOpenSections(prev => prev.size === 14 ? new Set() : new Set(Array.from({ length: 14 }, (_, i) => String(i + 1).padStart(2, "0"))))}
            style={{
              fontFamily: MONO, fontSize: 11, fontWeight: 600, padding: "10px 16px",
              border: `1px solid ${C.border}`, backgroundColor: C.surface, color: C.textDim,
              cursor: "pointer",
            }}
            data-testid="button-toggle-all-sections"
          >
            {openSections.size === 14 ? "Collapse All" : "Expand All"}
          </button>
        </div>
      </div>

      <AccordionSection num="01" title="What is DJZS.AI" open={openSections.has("01")} onToggle={() => toggleSection("01")}>
        <div style={{ ...S.card, borderColor: `${C.green}30` }}>
          <div style={S.paragraph}>
            <p style={{ marginBottom: 16 }}>
              DJZS is the <strong style={{ color: C.text }}>Adversarial Logic Layer for the Agent-to-Agent (A2A) economy</strong> — a deterministic verification primitive that enforces an <strong style={{ color: C.text }}>"Audit-Before-Act"</strong> loop for autonomous agents. It applies <strong style={{ color: C.text }}>Journal Entry Testing (JET)</strong>, a 100-year-old financial security primitive modernized for AI reasoning traces. "Journaling" in DJZS is not a diary — it is the mandatory act of an autonomous agent committing its reasoning trace to an immutable log before executing a transaction.
            </p>
            <p style={{ marginBottom: 16 }}>
              Every audit generates a cryptographic <strong style={{ color: C.text }}>Proof of Logic Certificate</strong> with deterministic <code style={S.inlineCode(C.green)}>DJZS-LF</code> failure codes, permanently uploaded to <strong style={{ color: C.text }}>Irys Datachain</strong>. If the logic fractures, the transaction dies. DJZS is the Logic Oracle for the decentralized web. It is designed to be <strong style={{ color: C.text }}>honest, not helpful</strong>.
            </p>
            <p>
              Two integration channels serve different threat models: the <strong style={{ color: "#a855f7" }}>Dark Channel</strong> (XMTP E2E encrypted) provides alpha protection for proprietary trading agents with zero public trace, while the <strong style={{ color: "#2dd4bf" }}>Light Channel</strong> (x402 REST API) provides public provenance for DAO treasury bots with permanent Irys Datachain certificates. Both enforce the same <strong style={{ color: C.text }}>Audit-Before-Act</strong> kill switch.
            </p>
          </div>
        </div>
      </AccordionSection>

      {/* API Reference */}
      <AccordionSection num="02" title="API Reference" open={openSections.has("02")} onToggle={() => toggleSection("02")}>
        <div style={{ ...S.card, borderColor: `${C.green}30` }}>
          <p style={{ ...S.paragraph, marginBottom: 16 }}>
            The deterministic kill switch for autonomous trading agents. Submit reasoning, receive a permanent <strong style={{ color: C.text }}>ProofOfLogic</strong> verdict.
          </p>
          <p style={{ ...S.paragraph, fontSize: 12, marginBottom: 24 }}>
            Route your agent's reasoning trace through the Oracle via the <strong style={{ color: "#a855f7" }}>Dark Channel</strong> (XMTP E2E encrypted) or <strong style={{ color: "#2dd4bf" }}>Light Channel</strong> (x402 REST API). The Oracle applies <strong style={{ color: C.text }}>Journal Entry Testing (JET)</strong> — identifying hallucinations, logical loops, and FOMO bias — then returns a cryptographic <code style={S.inlineCode("#2dd4bf")}>ProofOfLogic</code> certificate permanently stored on Irys Datachain.
          </p>
          <div style={{ padding: 12, backgroundColor: "#111", border: `1px solid ${C.border}`, marginBottom: 24 }}>
            <p style={{ fontFamily: MONO, fontSize: 12, color: C.textDim }}><span style={{ color: C.green, fontWeight: 700 }}>Base URL:</span> https://djzs.ai/api</p>
          </div>

          {/* Authentication */}
          <div style={{ marginBottom: 32 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <div style={S.iconBox(C.amber)}>
                <KeyRound size={18} color={C.amber} />
              </div>
              <h3 style={{ fontFamily: MONO, fontSize: 14, fontWeight: 700, color: C.text }}>Authentication: The x402 Tollbooth</h3>
            </div>
            <p style={{ ...S.paragraph, fontSize: 12, marginBottom: 12 }}>
              DJZS operates strictly on a <strong style={{ color: C.text }}>Pay-to-Verify</strong> model. There are no API keys, webhooks, or monthly subscriptions. Access to the Oracle is gated entirely by the <strong style={{ color: C.text }}>x402 Payment Protocol</strong> on Base Mainnet.
            </p>
            <p style={{ ...S.paragraph, fontSize: 12, marginBottom: 16 }}>
              To successfully authenticate a request, your agent must execute a USDC micro-transaction and inject the resulting on-chain transaction hash into the request header.
            </p>
            <div style={{ ...S.grid3, marginBottom: 16 }}>
              {[
                { label: "Required Header", val: "x-payment-proof" },
                { label: "Value", val: "Base Mainnet TX Hash" },
                { label: "Micro-Zone Cost", val: "$0.10 USDC" },
              ].map((x) => (
                <div key={x.label} style={{ padding: 12, backgroundColor: "#111", border: `1px solid ${C.border}` }}>
                  <p style={{ ...S.label, color: C.amber }}>{x.label}</p>
                  <code style={{ fontFamily: MONO, fontSize: 12, color: C.text }}>{x.val}</code>
                </div>
              ))}
            </div>
            <div style={{ padding: 12, backgroundColor: `${C.red}08`, border: `1px solid ${C.red}25` }}>
              <p style={{ fontFamily: MONO, fontSize: 11, color: C.red, fontWeight: 600, marginBottom: 4 }}>402 Payment Required</p>
              <p style={{ fontFamily: MONO, fontSize: 11, color: C.textDim, lineHeight: 1.7 }}>If the header is omitted or the cryptographic hash cannot be verified on-chain, the API will instantly reject the payload with a <code style={{ fontFamily: MONO, color: C.red }}>402 Payment Required</code> status (Error Code: <code style={{ fontFamily: MONO, color: C.red }}>DJZS-AUTH-402</code>).</p>
            </div>
          </div>

          {/* Endpoint: Micro-Zone Audit */}
          <div style={{ marginBottom: 32 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <div style={S.iconBox(C.green)}>
                <Code2 size={18} color={C.green} />
              </div>
              <h3 style={{ fontFamily: MONO, fontSize: 14, fontWeight: 700, color: C.text }}>Endpoint: Micro-Zone Audit</h3>
            </div>
            <code style={{ ...S.inlineCode(C.green), display: "inline-block", fontWeight: 700, marginBottom: 12 }} data-testid="code-endpoint-micro">POST /audit/micro</code>
            <p style={{ ...S.paragraph, fontSize: 12, marginBottom: 20 }}>
              This endpoint accepts a raw strategy payload, evaluates the agent's logic against the DJZS-LF taxonomy, and returns a deterministic Proof of Logic certificate.
            </p>

            <h4 style={{ fontFamily: MONO, fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 12 }}>Request Schema (JSON)</h4>
            <div style={{ overflowX: "auto", marginBottom: 20 }}>
              <table style={S.table} data-testid="table-request-schema">
                <thead>
                  <tr>
                    <th style={S.th}>Parameter</th>
                    <th style={S.th}>Type</th>
                    <th style={S.th}>Required</th>
                    <th style={S.th}>Description</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={S.td}><code style={{ color: C.green }}>strategy_memo</code></td>
                    <td style={S.td}>string</td>
                    <td style={{ ...S.td, color: C.text, fontWeight: 700 }}>Yes</td>
                    <td style={S.td}>The complete reasoning trace, internal agent dialogue, or execution plan intended for the transaction.</td>
                  </tr>
                  <tr>
                    <td style={S.td}><code style={{ color: C.green }}>agent_id</code></td>
                    <td style={S.td}>string</td>
                    <td style={S.td}>No</td>
                    <td style={S.td}>Wallet address or XMTP identity. Tagged on the Irys certificate for reputation tracking and fleet analytics.</td>
                  </tr>
                  <tr>
                    <td style={S.td}><code style={{ color: C.green }}>trade_params</code></td>
                    <td style={S.td}>object</td>
                    <td style={S.td}>No</td>
                    <td style={S.td}>Structured trade parameters. The Oracle cross-references these against the strategy_memo narrative to detect parameter/narrative mismatches.</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h4 style={{ fontFamily: MONO, fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 12 }}><code style={{ color: C.green }}>trade_params</code> Schema</h4>
            <div style={{ overflowX: "auto", marginBottom: 20 }}>
              <table style={S.table} data-testid="table-trade-params-schema">
                <thead>
                  <tr>
                    <th style={S.th}>Field</th>
                    <th style={S.th}>Type</th>
                    <th style={S.th}>Example</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { f: "protocol", t: "string", e: "uniswap, aave, compound" },
                    { f: "pair", t: "string", e: "ETH/USD, SOL/USDC" },
                    { f: "direction", t: "enum", e: "long, short, neutral" },
                    { f: "leverage", t: "number (1-200)", e: "5" },
                    { f: "notional_usd", t: "number", e: "50000" },
                    { f: "stop_loss_pct", t: "number (0-100)", e: "2.0" },
                    { f: "take_profit_pct", t: "number (0-1000)", e: "8.0" },
                    { f: "entry_price", t: "number", e: "3200" },
                    { f: "timeframe", t: "string", e: "4h, 1d, 1w" },
                  ].map((r) => (
                    <tr key={r.f}>
                      <td style={S.td}><code style={{ color: C.green }}>{r.f}</code></td>
                      <td style={S.td}>{r.t}</td>
                      <td style={S.td}>{r.e}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ padding: 12, backgroundColor: `${C.green}08`, border: `1px solid ${C.green}20`, marginBottom: 20 }}>
              <p style={{ fontFamily: MONO, fontSize: 11, color: C.textDim, lineHeight: 1.7 }}>When <code style={{ color: C.green }}>trade_params</code> is provided, the Oracle <strong style={{ color: C.text }}>cross-references</strong> the structured parameters against the <code style={{ color: C.green }}>strategy_memo</code> narrative. Parameter/narrative mismatches — such as claiming a breakout while entering below the stated level — are flagged as logic ruptures. Missing stop-loss on leveraged trades triggers <code style={{ color: C.red }}>DJZS-X01</code> (EXECUTION_UNBOUND).</p>
            </div>

            <h4 style={{ fontFamily: MONO, fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 12 }}>Example cURL Implementation</h4>
            <div style={{ ...S.codeBlock, marginBottom: 24 }} data-testid="code-curl-example">
              <span style={S.codeLabel}>bash</span>
              <pre style={{ margin: 0, whiteSpace: "pre-wrap", wordBreak: "break-all" }}>
                <code style={{ fontFamily: MONO, fontSize: 11, lineHeight: 1.8, color: C.textDim }}>
{`curl -X POST https://djzs.ai/api/audit/micro \\
  -H "Content-Type: application/json" \\
  -H "`}<span style={{ color: C.amber }}>x-payment-proof</span>{`: 0x_your_base_mainnet_tx_hash" \\
  -d '{
    "`}<span style={{ color: C.green }}>strategy_memo</span>{`": "Going long ETH based on breakout above 200-day MA.",
    "`}<span style={{ color: C.green }}>agent_id</span>{`": "0x1234...abcd",
    "`}<span style={{ color: C.green }}>trade_params</span>{`": {
      "protocol": "uniswap",
      "pair": "ETH/USD",
      "direction": "long",
      "leverage": 5,
      "notional_usd": 50000,
      "stop_loss_pct": 2.0,
      "take_profit_pct": 8.0,
      "entry_price": 3200,
      "timeframe": "4h"
    }
  }'`}
                </code>
              </pre>
            </div>
          </div>

          {/* Endpoint: Verify Certificate */}
          <div style={{ marginBottom: 32 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <div style={S.iconBox("#3b82f6")}>
                <FileSearch size={18} color="#3b82f6" />
              </div>
              <h3 style={{ fontFamily: MONO, fontSize: 14, fontWeight: 700, color: C.text }}>Endpoint: Verify Certificate</h3>
            </div>
            <code style={{ ...S.inlineCode("#3b82f6"), display: "inline-block", fontWeight: 700, marginBottom: 12 }} data-testid="code-endpoint-verify">GET /api/audit/verify/:txId</code>
            <p style={{ ...S.paragraph, fontSize: 12, marginBottom: 20 }}>
              Verify an existing ProofOfLogic certificate by its Irys Datachain transaction ID. This endpoint fetches the certificate from Irys gateway and returns the full audit record, allowing independent verification of any previously issued certificate.
            </p>
            <h4 style={{ fontFamily: MONO, fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 12 }}>Path Parameters</h4>
            <div style={{ overflowX: "auto", marginBottom: 20 }}>
              <table style={S.table} data-testid="table-verify-params">
                <thead>
                  <tr>
                    <th style={S.th}>Parameter</th>
                    <th style={S.th}>Type</th>
                    <th style={S.th}>Description</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={S.td}><code style={{ color: "#3b82f6" }}>txId</code></td>
                    <td style={S.td}>string</td>
                    <td style={S.td}>The Irys Datachain transaction ID from a previously issued ProofOfLogic certificate.</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <h4 style={{ fontFamily: MONO, fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 12 }}>Example cURL</h4>
            <div style={{ ...S.codeBlock, marginBottom: 16 }} data-testid="code-curl-verify">
              <span style={S.codeLabel}>bash</span>
              <pre style={{ margin: 0 }}>
                <code style={{ fontFamily: MONO, fontSize: 11, lineHeight: 1.8, color: C.textDim }}>
{`curl https://djzs.ai/api/audit/verify/`}<span style={{ color: "#3b82f6" }}>abc123xyz</span>
                </code>
              </pre>
            </div>
            <div style={{ padding: 12, backgroundColor: `#3b82f608`, border: `1px solid #3b82f620` }}>
              <p style={{ fontFamily: MONO, fontSize: 11, color: C.textDim, lineHeight: 1.7 }}>This endpoint is <strong style={{ color: C.text }}>public and free</strong> — no x402 payment required. Anyone with an Irys transaction ID can independently verify any ProofOfLogic certificate.</p>
            </div>
          </div>

          {/* Response Schema */}
          <div style={{ marginBottom: 32 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <div style={S.iconBox("#a855f7")}>
                <CheckCircle size={18} color="#a855f7" />
              </div>
              <h3 style={{ fontFamily: MONO, fontSize: 14, fontWeight: 700, color: C.text }}>Response Schema (JSON)</h3>
            </div>
            <p style={{ ...S.paragraph, fontSize: 12, marginBottom: 20 }}>
              The Oracle returns a fully assembled <code style={S.inlineCode("#a855f7")}>ProofOfLogic</code> object. If the <code style={{ fontFamily: MONO, fontSize: 11, color: C.red }}>verdict</code> evaluates to <code style={{ fontFamily: MONO, fontSize: 11, color: C.red }}>FAIL</code>, developers are expected to program their agents to automatically abort the execution sequence to prevent capital destruction. The response includes <code style={S.inlineCode("#3b82f6")}>provenance_provider</code>, <code style={S.inlineCode("#3b82f6")}>irys_tx_id</code>, and <code style={S.inlineCode("#3b82f6")}>irys_url</code> fields for permanent certificate verification via Irys Datachain.
            </p>
            <div style={S.codeBlock} data-testid="code-response-schema">
              <span style={S.codeLabel}>json</span>
              <pre style={{ margin: 0 }}>
                <code style={{ fontFamily: MONO, fontSize: 11, lineHeight: 1.8, color: C.textDim }}>
{`{
  "`}<span style={{ color: "#a855f7" }}>system_id</span>{`": "djzs-mainnet-01",
  "`}<span style={{ color: C.red }}>verdict</span>{`": "FAIL",
  "`}<span style={{ color: C.amber }}>risk_score</span>{`": 60,
  "`}<span style={{ color: C.red }}>flags</span>{`": [
    {
      "`}<span style={{ color: C.green }}>code</span>{`": "DJZS-I01",
      "`}<span style={{ color: C.green }}>severity</span>{`": "MEDIUM",
      "`}<span style={{ color: C.green }}>description</span>{`": "Logic relies entirely on social momentum and unverified Twitter sentiment."
    }
  ],
  "`}<span style={{ color: "#a855f7" }}>proof</span>{`": {
    "logic_hash": "0x4a9b2c...",
    "timestamp": "2026-02-21T11:45:00Z",
    "payment_verified": true,
    "payment_proof": "0x_your_base_mainnet_tx_hash"
  },
  "`}<span style={{ color: "#3b82f6" }}>provenance_provider</span>{`": "IRYS_DATACHAIN",
  "`}<span style={{ color: "#3b82f6" }}>irys_tx_id</span>{`": "abc123xyz...",
  "`}<span style={{ color: "#3b82f6" }}>irys_url</span>{`": "https://gateway.irys.xyz/abc123xyz..."
}`}
                </code>
              </pre>
            </div>
          </div>

          {/* DJZS-LF Taxonomy */}
          <div style={{ marginBottom: 32 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <div style={S.iconBox(C.red)}>
                <AlertTriangle size={18} color={C.red} />
              </div>
              <h3 style={{ fontFamily: MONO, fontSize: 14, fontWeight: 700, color: C.text }}>DJZS-LF v1 Taxonomy (Failure Codes)</h3>
            </div>
            <p style={{ ...S.paragraph, fontSize: 12, marginBottom: 20 }}>
              The Oracle maps all detected reasoning flaws to strict failure codes. Autonomous agents should be engineered to parse these specific <code style={S.inlineCode(C.red)}>DJZS-LF</code> flags and trigger automated halt conditions.
            </p>
            <div style={{ overflowX: "auto" }} data-testid="table-djzs-lf-taxonomy">
              <table style={S.table}>
                <thead>
                  <tr>
                    <th style={S.th}>Diagnostic Code</th>
                    <th style={S.th}>Category</th>
                    <th style={S.th}>Severity</th>
                    <th style={S.th}>Technical Description</th>
                    <th style={S.th}>Auto-Abort?</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { code: "DJZS-S01", cat: "Structural", sev: "Critical", sevColor: C.red, desc: "Circular logic or agent-echo reinforcement detected.", abort: "Yes", abortColor: C.red },
                    { code: "DJZS-S02", cat: "Structural", sev: "Critical", sevColor: C.red, desc: "Direct logical contradiction within the payload.", abort: "Yes", abortColor: C.red },
                    { code: "DJZS-E01", cat: "Epistemic", sev: "High", sevColor: C.amber, desc: "Utilization of hallucinated reference markers or fake data.", abort: "Yes", abortColor: C.amber },
                    { code: "DJZS-E02", cat: "Epistemic", sev: "High", sevColor: C.amber, desc: "Reliance on a demonstrably stale or outdated assumption.", abort: "Yes", abortColor: C.amber },
                    { code: "DJZS-I01", cat: "Incentive", sev: "Medium", sevColor: "#eab308", desc: "Execution driven by FOMO loop or unverified momentum.", abort: "No (Review)", abortColor: "#eab308" },
                    { code: "DJZS-I02", cat: "Incentive", sev: "Medium", sevColor: "#eab308", desc: "High narrative dependency (Prioritizing story over structural data).", abort: "No (Review)", abortColor: "#eab308" },
                    { code: "DJZS-X01", cat: "Execution", sev: "Critical", sevColor: C.red, desc: "Liquidity fragility (Target asset cannot support intended trade size).", abort: "Yes", abortColor: C.red },
                  ].map((r) => (
                    <tr key={r.code}>
                      <td style={S.td}><code style={{ fontFamily: MONO, fontWeight: 700, color: r.sevColor }}>{r.code}</code></td>
                      <td style={S.td}>{r.cat}</td>
                      <td style={S.td}><span style={S.severityBadge(r.sevColor)}>{r.sev}</span></td>
                      <td style={S.td}>{r.desc}</td>
                      <td style={{ ...S.td, fontWeight: 700, color: r.abortColor }}>{r.abort}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Circuit Breaker */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <div style={S.iconBox(C.green)}>
                <Activity size={18} color={C.green} />
              </div>
              <h3 style={{ fontFamily: MONO, fontSize: 14, fontWeight: 700, color: C.text }}>Auto-Abort Circuit Breaker (TypeScript)</h3>
            </div>
            <p style={{ ...S.paragraph, fontSize: 12, marginBottom: 20 }}>
              The following snippet demonstrates the <strong style={{ color: C.text }}>"Audit-Before-Act"</strong> pattern. It shows how to wrap an autonomous bot's execution logic with the DJZS API, ensuring the bot automatically kills its own trade if the Oracle detects a logic flaw.
            </p>
            <div style={S.codeBlock} data-testid="code-circuit-breaker">
              <span style={S.codeLabel}>typescript</span>
              <pre style={{ margin: 0, whiteSpace: "pre-wrap", wordBreak: "break-all" }}>
                <code style={{ fontFamily: MONO, fontSize: 11, lineHeight: 1.8, color: C.textDim }}>
{`import { ethers } from "ethers";

`}<span style={{ color: C.textMuted }}>{`// 1. Define the DJZS Proof of Logic Schema`}</span>{`
interface `}<span style={{ color: C.green }}>ProofOfLogic</span>{` {
  `}<span style={{ color: "#a855f7" }}>verdict</span>{`: "PASS" | "FAIL";
  `}<span style={{ color: "#a855f7" }}>risk_score</span>{`: number;
  `}<span style={{ color: "#a855f7" }}>flags</span>{`: Array<{ code: string; severity: string; description: string }>;
}

async function `}<span style={{ color: C.amber }}>executeA2ATrade</span>{`(strategyMemo: string, baseTxHash: string) {
  console.log("Initiating DJZS Journal Entry Testing...");

  try {
    `}<span style={{ color: C.textMuted }}>{`// 2. Route the reasoning trace through the DJZS Tollbooth`}</span>{`
    const auditResponse = await fetch("https://djzs.ai/api/audit/micro", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "`}<span style={{ color: C.amber }}>x-payment-proof</span>{`": baseTxHash
      },
      body: JSON.stringify({ strategy_memo: strategyMemo })
    });

    if (auditResponse.status === 402) {
      throw new Error("`}<span style={{ color: C.red }}>DJZS-AUTH-402</span>{`: Payment required or invalid transaction hash.");
    }

    const proofOfLogic: ProofOfLogic = await auditResponse.json();

    `}<span style={{ color: C.textMuted }}>{`// 3. The Auto-Abort Circuit Breaker`}</span>{`
    if (proofOfLogic.verdict === "FAIL") {
      console.error(\`CRITICAL LOGIC FLAW DETECTED! Risk Score: \${proofOfLogic.risk_score}\`);
      proofOfLogic.flags.forEach(flag => {
        console.error(\`- [\${flag.code}] (\${flag.severity}): \${flag.description}\`);
      });
      
      `}<span style={{ color: C.red }}>{`// KILL THE EXECUTION`}</span>{`
      throw new Error("TRADE ABORTED: Logic failed DJZS verification. Capital protected.");
    }

    `}<span style={{ color: C.textMuted }}>{`// 4. Execution (Only runs if the Oracle returns 'PASS')`}</span>{`
    console.log("Logic Verified. Executing on-chain transaction...");
    // await router.executeTrade(...);

  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}`}
                </code>
              </pre>
            </div>
          </div>
        </div>
      </AccordionSection>

      {/* Data Transparency */}
      <AccordionSection num="03" title="Data Transparency" open={openSections.has("03")} onToggle={() => toggleSection("03")}>
        <p style={{ ...S.paragraph, marginBottom: 20 }}>Where your data goes — and where it doesn't. No fine print.</p>
        <div style={S.grid3} data-testid="card-why-privacy-docs">
          <div style={{ ...S.card, borderColor: `${C.amber}30` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <div style={S.iconBoxLg(C.amber)}>
                <AlertTriangle size={22} color={C.amber} />
              </div>
              <div>
                <h3 style={{ fontFamily: MONO, fontSize: 14, fontWeight: 700, color: C.text }}>Not E2E Encrypted</h3>
                <p style={{ fontFamily: MONO, fontSize: 10, color: `${C.amber}cc` }}>Venice AI audit channel</p>
              </div>
            </div>
            <p style={{ ...S.paragraph, fontSize: 12 }}>When you deploy an audit, your reasoning trace is sent to Venice AI over the internet for adversarial analysis. This channel is not end-to-end encrypted. Venice AI claims no data retention, but we can't independently verify that claim. We're transparent about this because you deserve to know exactly when your data leaves your device.</p>
          </div>
          <div style={{ ...S.card, borderColor: `${C.green}30` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <div style={S.iconBoxLg(C.green)}>
                <ShieldCheck size={22} color={C.green} />
              </div>
              <div>
                <h3 style={{ fontFamily: MONO, fontSize: 14, fontWeight: 700, color: C.text }}>E2E Encrypted</h3>
                <p style={{ fontFamily: MONO, fontSize: 10, color: `${C.green}cc` }}>XMTP agent channel</p>
              </div>
            </div>
            <p style={{ ...S.paragraph, fontSize: 12 }}>XMTP messaging is fully end-to-end encrypted using the MLS protocol with quantum-resistant key encapsulation (XWING KEM). Forward secrecy, post-compromise security, and quantum resistance — the same standard as Signal. See the <a href="https://docs.xmtp.org/protocol/security" target="_blank" rel="noopener noreferrer" style={{ color: C.green, textDecoration: "underline" }}>XMTP Security Documentation</a> for details.</p>
          </div>
          <div style={{ ...S.card, borderColor: `#2dd4bf30` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <div style={S.iconBoxLg("#2dd4bf")}>
                <Database size={22} color="#2dd4bf" />
              </div>
              <div>
                <h3 style={{ fontFamily: MONO, fontSize: 14, fontWeight: 700, color: C.text }}>Permanently On-Chain</h3>
                <p style={{ fontFamily: MONO, fontSize: 10, color: "#2dd4bfcc" }}>Irys Datachain provenance</p>
              </div>
            </div>
            <p style={{ ...S.paragraph, fontSize: 12 }}>Audit certificates generated via the A2A API — including the strategy memo, verdict, risk score, and failure codes — are permanently uploaded to Irys Datachain. Any reasoning trace submitted through the API becomes a permanent, publicly accessible record. Local vault data is never uploaded.</p>
          </div>
        </div>
      </AccordionSection>

      {/* Integration Channels */}
      <AccordionSection num="04" title="Integration Channels" open={openSections.has("04")} onToggle={() => toggleSection("04")}>
        <p style={{ ...S.paragraph, marginBottom: 20 }}>Two paths for autonomous agents — choose the channel that fits your threat model.</p>
        <div style={S.grid2} data-testid="grid-integration-channels">
          <div style={{ ...S.card, borderColor: `#a855f730` }} data-testid="card-dark-channel">
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <div style={S.iconBoxLg("#a855f7")}>
                <Lock size={22} color="#a855f7" />
              </div>
              <div>
                <h3 style={{ fontFamily: MONO, fontSize: 15, fontWeight: 700, color: C.text }}>Dark Channel</h3>
                <p style={{ fontFamily: MONO, fontSize: 10, color: "#a855f7cc" }}>XMTP · E2E Encrypted via MLS</p>
              </div>
            </div>
            <p style={{ ...S.paragraph, fontSize: 12, marginBottom: 16 }}>
              Alpha protection for proprietary trading agents. Your agent DMs the Oracle, gets a deterministic verdict privately. Zero public trace. End-to-end encrypted with the MLS protocol — the same standard as Signal.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 12 }}>
              <div style={{ padding: 10, backgroundColor: "#111", border: `1px solid ${C.border}` }}>
                <p style={{ ...S.label, color: "#a855f7" }}>Use Case</p>
                <p style={{ fontFamily: MONO, fontSize: 11, color: C.textDim }} data-testid="text-dark-channel-usecase">Algorithmic arb bots, proprietary strategies, alpha-sensitive execution</p>
              </div>
              <div style={{ padding: 10, backgroundColor: "#111", border: `1px solid ${C.border}` }}>
                <p style={{ ...S.label, color: "#a855f7" }}>Oracle Address</p>
                <code style={{ fontFamily: MONO, fontSize: 11, color: C.text, wordBreak: "break-all" }} data-testid="text-oracle-address">0xc2eCfe214071C2B77f90111f222E4a4D25ac3A98</code>
              </div>
              <div style={{ padding: 10, backgroundColor: "#111", border: `1px solid ${C.border}` }}>
                <p style={{ ...S.label, color: "#a855f7" }}>Message Prefixes</p>
                <p style={{ fontFamily: MONO, fontSize: 11, color: C.textDim }} data-testid="text-dark-channel-prefixes"><code style={S.inlineCode("#a855f7")}>Thinking:</code> → AdversarialOracle &nbsp;·&nbsp; <code style={S.inlineCode(C.green)}>Journal:</code> → JournalInsight</p>
              </div>
            </div>
          </div>

          <div style={{ ...S.card, borderColor: `#2dd4bf30` }} data-testid="card-light-channel">
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <div style={S.iconBoxLg("#2dd4bf")}>
                <Database size={22} color="#2dd4bf" />
              </div>
              <div>
                <h3 style={{ fontFamily: MONO, fontSize: 15, fontWeight: 700, color: C.text }}>Light Channel</h3>
                <p style={{ fontFamily: MONO, fontSize: 10, color: "#2dd4bfcc" }}>Base REST API · x402-Gated</p>
              </div>
            </div>
            <p style={{ ...S.paragraph, fontSize: 12, marginBottom: 16 }}>
              Public provenance for DAO treasury bots. x402-gated audits with Irys Datachain certificates. Every decision permanently on-chain. Full accountability by design.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 12 }}>
              <div style={{ padding: 10, backgroundColor: "#111", border: `1px solid ${C.border}` }}>
                <p style={{ ...S.label, color: "#2dd4bf" }}>Use Case</p>
                <p style={{ fontFamily: MONO, fontSize: 11, color: C.textDim }} data-testid="text-light-channel-usecase">DAO treasury management, public accountability, governance audits</p>
              </div>
              <div style={{ padding: 10, backgroundColor: "#111", border: `1px solid ${C.border}` }}>
                <p style={{ ...S.label, color: "#2dd4bf" }}>Endpoints</p>
                <p style={{ fontFamily: MONO, fontSize: 11, color: C.textDim }}>
                  <code style={S.inlineCode("#2dd4bf")} data-testid="text-endpoint-micro">/api/audit/micro</code> &nbsp;·&nbsp;
                  <code style={S.inlineCode("#2dd4bf")} data-testid="text-endpoint-founder">/founder</code> &nbsp;·&nbsp;
                  <code style={S.inlineCode("#2dd4bf")} data-testid="text-endpoint-treasury">/treasury</code>
                </p>
              </div>
              <div style={{ padding: 10, backgroundColor: "#111", border: `1px solid ${C.border}` }}>
                <p style={{ ...S.label, color: "#2dd4bf" }}>Provenance</p>
                <p style={{ fontFamily: MONO, fontSize: 11, color: C.textDim }} data-testid="text-light-channel-provenance">Irys Datachain certificates — permanent, publicly verifiable records</p>
              </div>
            </div>
          </div>
        </div>

        <div style={{ ...S.card, borderColor: `${C.red}30`, marginTop: 20 }} data-testid="callout-kill-switch">
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <div style={S.iconBox(C.red)}>
              <Zap size={18} color={C.red} />
            </div>
            <div>
              <h3 style={{ fontFamily: MONO, fontSize: 14, fontWeight: 700, color: C.text }}>The Kill Switch</h3>
              <p style={{ fontFamily: MONO, fontSize: 10, color: `${C.red}cc` }}>Deterministic circuit breaker between detection and execution</p>
            </div>
          </div>
          <p style={{ ...S.paragraph, fontSize: 12, marginBottom: 10 }}>
            Regardless of channel, DJZS acts as a <strong style={{ color: C.text }}>deterministic circuit breaker</strong> between an autonomous agent's reasoning and its execution. The AI detects reasoning failures (hallucinations, circular logic, FOMO bias). The server enforces the binary verdict. If the logic fractures, the transaction dies — no negotiation, no override.
          </p>
          <p style={{ ...S.paragraph, fontSize: 12 }}>
            Dark Channel agents get the verdict privately. Light Channel agents get the verdict publicly with an immutable provenance certificate. Both channels enforce the same <strong style={{ color: C.text }}>Audit-Before-Act</strong> loop — the only difference is whether the trace is encrypted or permanently on-chain.
          </p>
        </div>
      </AccordionSection>

      {/* Core Principles */}
      <AccordionSection num="05" title="Core Principles" open={openSections.has("05")} onToggle={() => toggleSection("05")}>
        <p style={{ ...S.paragraph, marginBottom: 20 }}>The non-negotiable rules that govern every Oracle interaction.</p>
        <div style={S.grid3}>
          <FeatureCard icon={HardDrive} title="Audit-Before-Act" description="Every reasoning trace must pass through the Oracle before execution. No audit, no action. This is the core enforcement loop for the A2A economy." color={C.amber} />
          <FeatureCard icon={Shield} title="Deterministic Verdicts" description="Binary PASS/FAIL. The server enforces the verdict deterministically — the LLM detects, the server decides. No probabilistic hedging." color="#2dd4bf" />
          <FeatureCard icon={Bot} title="Adversarial Oracle" description="The AI is adversarial by design. It exposes circular logic, hallucinated data, FOMO bias, and narrative dependency. Honest, not helpful." color={C.red} />
          <FeatureCard icon={Lock} title="Local-First Privacy" description="Workspace data lives on your device. No server-side storage of your reasoning. No feeds, no tracking, no centralized memory." color={C.green} />
          <FeatureCard icon={Zap} title="DJZS-LF Taxonomy" description="7 deterministic failure codes across Structural, Epistemic, Incentive, and Execution categories. Machine-readable error handling for autonomous agents." color={C.amber} />
          <FeatureCard icon={Key} title="x402 Pay-to-Verify" description="No API keys or subscriptions. Access gated by on-chain USDC micropayments on Base. Your wallet is your identity." color="#a855f7" />
        </div>
      </AccordionSection>

      {/* Architect Console */}
      <AccordionSection num="06" title="Architect Console" open={openSections.has("06")} onToggle={() => toggleSection("06")}>
        <p style={{ ...S.paragraph, marginBottom: 20 }}>Four governance zones for the Sovereign Principal: forensic audit review, adversarial reasoning, protocol monitoring, and x402 fee governance.</p>
        <div style={S.grid2}>
          {[
            {
              icon: BookOpen, color: C.amber, title: "Audit Ledger", sub: "Immutable forensic log of all ProofOfLogic certificates",
              desc: "The primary workspace view for Agent Architects. Every audit verdict, risk score, DJZS-LF failure code, and logic hash is recorded here as an immutable forensic record.",
              items: [
                { label: "ProofOfLogic Certificates", text: "PASS/FAIL verdicts with risk scores and cryptographic hashes" },
                { label: "DJZS-LF Failure Codes", text: "Deterministic logic failure taxonomy for autonomous error handling" },
                { label: "Re-Deploy", text: "Re-audit any previous payload against the Oracle for updated analysis" },
              ]
            },
            {
              icon: Activity, color: "#2dd4bf", title: "Terminal Console", sub: "Protocol monitoring and configuration",
              desc: "Dashboard for protocol health, system status, and configuration management. Monitor Oracle uptime and review operational metrics.",
              items: [
                { label: "System Status", text: "Monitor Oracle uptime, TEE health, and API availability" },
                { label: "Configuration", text: "Manage protocol settings and BYOK preferences" },
                { label: "Operational Metrics", text: "Review audit throughput and system performance" },
              ]
            },
            {
              icon: DollarSign, color: C.amber, title: "x402 Governance", sub: "Fee structure and escrow provisioning",
              desc: "Execution Zone fee structure display and USDC escrow provisioning for execution agents. Manage agent allowances on Base Mainnet.",
              items: [
                { label: "Fee Structure", text: "Read-only display of Execution Zone pricing (Micro $0.10, Founder $1.00, Treasury $10.00 USDC)" },
                { label: "ProvisionAgentAllowance", text: "Provision USDC escrow to execution agents with live balance reads" },
                { label: "Network Detection", text: "Automatic wrong-network and disconnected state handling" },
              ]
            },
            {
              icon: Zap, color: C.red, title: "Adversarial Oracle", sub: "Adversarial AI reasoning attacks",
              desc: "Your adversarial AI sparring partner. It debates your ideas, exposes tensions, flags narrative dependency, and forces you to confront what you'd rather ignore.",
              items: [
                { label: "Reasoning Attacks", text: "AI actively pushes back on weak logic and FOMO-driven reasoning" },
                { label: "Contradiction Exposure", text: "Surfaces tensions between what you say and what you do" },
                { label: "Deploy to Zone", text: "Send reasoning directly to an Execution Zone for paid audit" },
              ]
            },
          ].map((zone) => (
            <div key={zone.title} style={{ ...S.card, borderColor: `${zone.color}30` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                <div style={S.iconBoxLg(zone.color)}>
                  <zone.icon size={22} color={zone.color} />
                </div>
                <div>
                  <h3 style={{ fontFamily: MONO, fontSize: 15, fontWeight: 700, color: C.text }}>{zone.title}</h3>
                  <p style={{ fontFamily: MONO, fontSize: 10, color: `${zone.color}cc` }}>{zone.sub}</p>
                </div>
              </div>
              <p style={{ ...S.paragraph, fontSize: 12, marginBottom: 16 }}>{zone.desc}</p>
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {zone.items.map((it) => (
                  <li key={it.label} style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 10 }}>
                    <span style={S.dot(zone.color)} />
                    <span style={{ fontFamily: MONO, fontSize: 12, color: C.textDim }}>
                      <strong style={{ color: zone.color }}>{it.label}</strong> — {it.text}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </AccordionSection>

      {/* Execution Zones */}
      <AccordionSection num="07" title="Execution Zones" open={openSections.has("07")} onToggle={() => toggleSection("07")}>
        <p style={{ ...S.paragraph, marginBottom: 20 }}>Paid adversarial audits via x402 USDC on Base. Deploy your work when the stakes are high.</p>
        <div style={S.grid3}>
          {[
            { title: "Micro-Zone", price: "$0.10", color: "#2dd4bf", items: ["1,000 character limit", "Risk score (0-200) + primary bias detected", "Logic flaws + structural recommendations"] },
            { title: "Founder Zone", price: "$1.00", color: C.amber, items: ["5,000 character limit", "Deep bias detection + strategic integrity check", "Comprehensive logic flaw analysis"] },
            { title: "Treasury Zone", price: "$10.00", color: "#a855f7", items: ["Unlimited character input", "Exhaustive adversarial breakdown", "Cryptographic hash + immutable ledger record"] },
          ].map((z) => (
            <div key={z.title} style={{ ...S.card, borderColor: `${z.color}30` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <h3 style={{ fontFamily: MONO, fontSize: 15, fontWeight: 700, color: C.text }}>{z.title}</h3>
                <span style={{ fontFamily: MONO, fontSize: 12, fontWeight: 700, color: z.color, backgroundColor: `${z.color}15`, padding: "4px 10px" }}>{z.price}</span>
              </div>
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {z.items.map((it) => (
                  <li key={it} style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 8 }}>
                    <span style={S.dot(z.color)} />
                    <span style={{ fontFamily: MONO, fontSize: 12, color: C.textDim }}>{it}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div style={{ ...S.card, borderColor: `${C.amber}20`, marginTop: 16 }}>
          <p style={{ ...S.paragraph, fontSize: 12 }}>
            All Execution Zone audits are saved locally in your <strong style={{ color: C.text }}>Audit Ledger</strong> with SHA-256 hashes, verdict badges, and DJZS-LF failure codes. Review past results, compare risk scores across zones, and re-deploy memos at any time.
          </p>
        </div>
      </AccordionSection>

      {/* Proof of Logic Certificate */}
      <AccordionSection num="08" title="Proof of Logic Certificate" open={openSections.has("08")} onToggle={() => toggleSection("08")}>
        <p style={{ ...S.paragraph, marginBottom: 20 }}>Deterministic verification primitive for autonomous agents</p>
        <div style={{ ...S.card, borderColor: `${C.red}30`, marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <div style={S.iconBoxLg(C.red)}>
              <AlertTriangle size={22} color={C.red} />
            </div>
            <div>
              <h3 style={{ fontFamily: MONO, fontSize: 15, fontWeight: 700, color: C.text }}>Why Deterministic Verdicts Matter</h3>
              <p style={{ fontFamily: MONO, fontSize: 10, color: `${C.red}cc` }}>Probabilistic AI cannot be trusted with deterministic infrastructure</p>
            </div>
          </div>
          <p style={{ ...S.paragraph, fontSize: 12, marginBottom: 16 }}>
            LLMs are probabilistic text generators designed to sound convincing, not to be logically strict. Left unchecked, an AI will identify a critical flaw in a treasury strategy and still output "PASS" to avoid confrontation. In a chat interface, that's a bad answer. In the A2A economy, <strong style={{ color: C.text }}>that is a catastrophic loss of capital.</strong>
          </p>
          <p style={{ ...S.paragraph, fontSize: 12, marginBottom: 20 }}>
            The Proof of Logic Certificate solves this by separating <strong style={{ color: C.text }}>detection</strong> (the AI) from <strong style={{ color: C.text }}>verdict</strong> (the server). The AI acts as a sensor that detects reasoning ruptures. The server acts as a ruthless compiler that enforces the binary verdict deterministically — no negotiation.
          </p>

          <h4 style={{ fontFamily: MONO, fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 12 }}>Binary Verdict Rules</h4>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
            <div style={{ padding: 12, backgroundColor: `${C.green}0a`, border: `1px solid ${C.green}30` }}>
              <p style={{ fontFamily: MONO, fontSize: 13, fontWeight: 700, color: C.green, marginBottom: 8 }}>PASS</p>
              <p style={{ fontFamily: MONO, fontSize: 11, color: C.textDim, lineHeight: 1.7 }}>Issued when risk_score ≤ 60 AND no CRITICAL or HIGH severity flags are detected. The AI found no structural failures worth blocking execution.</p>
            </div>
            <div style={{ padding: 12, backgroundColor: `${C.red}0a`, border: `1px solid ${C.red}30` }}>
              <p style={{ fontFamily: MONO, fontSize: 13, fontWeight: 700, color: C.red, marginBottom: 8 }}>FAIL</p>
              <p style={{ fontFamily: MONO, fontSize: 11, color: C.textDim, lineHeight: 1.7 }}>Forced when risk_score {'>'} 60 OR any CRITICAL/HIGH flag is detected. The server overrides the LLM verdict — the AI cannot "smooth things over."</p>
            </div>
          </div>

          <h4 style={{ fontFamily: MONO, fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 12 }} data-testid="text-risk-score-scale-title">Risk Score Scale</h4>
          <p style={{ fontFamily: MONO, fontSize: 11, color: C.textDim, marginBottom: 12 }}>Every audit returns a numeric risk score from 0 to 100. The score determines the visual severity classification and influences the binary verdict.</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 20 }}>
            {[
              { label: "LOW", range: "0–24", color: C.green, desc: "No structural failures. Logic is sound for execution.", testId: "card-risk-low" },
              { label: "MODERATE", range: "25–49", color: "#2dd4bf", desc: "Minor concerns identified. Review flagged items before proceeding.", testId: "card-risk-moderate" },
              { label: "ELEVATED", range: "50–74", color: C.amber, desc: "Significant logic flaws detected. Execution carries material risk.", testId: "card-risk-elevated" },
              { label: "CRITICAL", range: "75–100", color: C.red, desc: "Severe reasoning failures. Automatic FAIL verdict enforced.", testId: "card-risk-critical" },
            ].map((r) => (
              <div key={r.label} style={{ padding: 10, textAlign: "center", backgroundColor: `${r.color}08`, border: `1px solid ${r.color}25` }} data-testid={r.testId}>
                <span style={{ fontFamily: MONO, fontSize: 14, fontWeight: 900, color: r.color, display: "block" }}>{r.label}</span>
                <span style={{ fontFamily: MONO, fontSize: 10, color: C.textMuted, display: "block", marginBottom: 6 }}>{r.range}</span>
                <p style={{ fontFamily: MONO, fontSize: 10, color: C.textDim, lineHeight: 1.6 }}>{r.desc}</p>
              </div>
            ))}
          </div>

          <h4 style={{ fontFamily: MONO, fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 12 }} data-testid="text-audit-contents-title">Audit Report Contents</h4>
          <p style={{ fontFamily: MONO, fontSize: 11, color: C.textDim, marginBottom: 10 }}>Every ProofOfLogic certificate includes a structured breakdown of the adversarial analysis:</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: 24 }}>
            {[
              { title: "Risk Score", sub: "0–100 numeric severity", testId: "card-audit-risk-score" },
              { title: "PASS / FAIL Verdict", sub: "Deterministic binary output", testId: "card-audit-verdict" },
              { title: "Primary Bias", sub: "Dominant cognitive bias detected", testId: "card-audit-primary-bias" },
              { title: "Logic Flaws", sub: "Individual flaws with severity", testId: "card-audit-logic-flaws" },
              { title: "DJZS-LF Codes", sub: "Failure taxonomy flags", testId: "card-audit-failure-codes" },
              { title: "Recommendations", sub: "Structural action items", testId: "card-audit-recommendations" },
            ].map((a) => (
              <div key={a.testId} style={{ padding: 10, backgroundColor: "#111", border: `1px solid ${C.border}` }} data-testid={a.testId}>
                <p style={{ fontFamily: MONO, fontSize: 11, fontWeight: 700, color: C.text }}>{a.title}</p>
                <p style={{ fontFamily: MONO, fontSize: 10, color: C.textMuted }}>{a.sub}</p>
              </div>
            ))}
          </div>

          <h4 style={{ fontFamily: MONO, fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 12 }}>DJZS-LF Taxonomy — 7 Logic Failure Codes</h4>
          <p style={{ fontFamily: MONO, fontSize: 11, color: C.textDim, marginBottom: 12 }}>Each code maps to a specific class of reasoning failure. Four severity levels: CRITICAL, HIGH, MEDIUM, LOW.</p>
          <div style={S.grid2}>
            {[
              { code: "DJZS-S01", cat: "Structural", color: C.amber, desc: "CIRCULAR_LOGIC — conclusion assumes its own premise" },
              { code: "DJZS-S02", cat: "Structural", color: C.amber, desc: "LAYER_INVERSION — verification layer depends on unverified upstream data" },
              { code: "DJZS-S03", cat: "Structural", color: C.amber, desc: "DEPENDENCY_GHOST — references external dependency that cannot be resolved" },
              { code: "DJZS-E01", cat: "Epistemic", color: "#2dd4bf", desc: "ORACLE_UNVERIFIED — external data source cited without provenance verification" },
              { code: "DJZS-E02", cat: "Epistemic", color: "#2dd4bf", desc: "CONFIDENCE_INFLATION — stated certainty exceeds evidential basis" },
              { code: "DJZS-I01", cat: "Incentive", color: "#a855f7", desc: "FOMO_LOOP — decision driven by social signal rather than verified data" },
              { code: "DJZS-I02", cat: "Incentive", color: "#a855f7", desc: "MISALIGNED_REWARD — optimization target diverges from stated objective" },
              { code: "DJZS-I03", cat: "Incentive", color: "#a855f7", desc: "DATA_UNVERIFIED — numerical claims lack verifiable source attribution" },
              { code: "DJZS-X01", cat: "Execution", color: C.red, desc: "EXECUTION_UNBOUND — no halt condition or resource ceiling defined" },
              { code: "DJZS-X02", cat: "Execution", color: C.red, desc: "RACE_CONDITION — temporal dependency creates non-deterministic outcome" },
              { code: "DJZS-T01", cat: "Temporal", color: "#eab308", desc: "STALE_REFERENCE — data reference exceeds freshness threshold" },
            ].map((lf) => (
              <div key={lf.code} style={{ padding: 10, backgroundColor: "#111", border: `1px solid ${C.border}` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <code style={S.inlineCode(lf.color)}>{lf.code}</code>
                  <span style={{ fontFamily: MONO, fontSize: 10, fontWeight: 700, color: C.textMuted, textTransform: "uppercase" }}>{lf.cat}</span>
                </div>
                <p style={{ fontFamily: MONO, fontSize: 11, color: C.textDim }}>{lf.desc}</p>
              </div>
            ))}
          </div>

          <div style={{ padding: 12, backgroundColor: `${C.red}08`, border: `1px solid ${C.red}20`, marginTop: 20 }}>
            <p style={{ fontFamily: MONO, fontSize: 11, color: C.textDim, lineHeight: 1.7 }}>
              <strong style={{ color: C.red }}>Server-side enforcement:</strong> The verdict is computed deterministically on the server after the LLM returns its analysis. If any CRITICAL or HIGH flag is present, the verdict is forced to FAIL regardless of what the AI suggested. The LLM detects — the server decides. This is the bridge between probabilistic AI and deterministic infrastructure.
            </p>
          </div>
        </div>
      </AccordionSection>

      {/* OpenClaw Agent Runner */}
      <AccordionSection num="09" title="OpenClaw Agent Runner" open={openSections.has("09")} onToggle={() => toggleSection("09")}>
        <div style={{ ...S.card, borderColor: `#a855f730`, marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <div style={S.iconBoxLg("#a855f7")}>
              <Brain size={22} color="#a855f7" />
            </div>
            <div>
              <h3 style={{ fontFamily: MONO, fontSize: 15, fontWeight: 700, color: C.text }}>Unified AI Agent System</h3>
              <p style={{ fontFamily: MONO, fontSize: 10, color: "#a855f7cc" }}>Two structured agents, one dispatcher</p>
            </div>
          </div>
          <p style={{ ...S.paragraph, fontSize: 12, marginBottom: 20 }}>
            OpenClaw is DJZS's agent runner — a clean dispatcher that routes requests to two specialized AI agents. Each agent wraps Venice AI calls and returns strictly typed, structured JSON. No thinking happens in the dispatcher; all intelligence lives in the agent classes.
          </p>
          <div style={{ padding: 16, backgroundColor: `#a855f70a`, border: `1px solid #a855f720`, marginBottom: 20 }}>
            <p style={{ fontFamily: MONO, fontSize: 12, fontWeight: 700, color: "#a855f7", marginBottom: 10 }}>How It Connects to What You See</p>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              <li style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 10 }}>
                <span style={S.dot(C.amber)} />
                <span style={{ fontFamily: MONO, fontSize: 12, color: C.textDim }}>The <strong style={{ color: C.amber }}>Audit Ledger</strong> displays all ProofOfLogic certificates from your deployed audits — binary PASS/FAIL verdicts, risk scores, DJZS-LF failure codes, and cryptographic hashes. Each record links back to the original payload for re-deployment.</span>
              </li>
              <li style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                <span style={S.dot("#a855f7")} />
                <span style={{ fontFamily: MONO, fontSize: 12, color: C.textDim }}>The <strong style={{ color: "#a855f7" }}>AdversarialOracle</strong> agent powers the Adversarial Oracle — challenging your ideas, exposing tensions in your reasoning, and flagging narrative dependency. It acts as an adversarial pressure-tester, not a chatbot.</span>
              </li>
            </ul>
          </div>
          <p style={{ fontFamily: MONO, fontSize: 11, color: C.textDim }} data-testid="text-openclaw-api">
            API: POST /api/openclaw/run {'{'} agent: "JournalInsight" | "AdversarialOracle", payload: {'{'} ... {'}'} {'}'}
          </p>
        </div>
        <div style={S.grid2}>
          <div style={{ ...S.card, borderColor: `${C.amber}30` }} data-testid="card-agent-journal">
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <div style={S.iconBox(C.amber)}>
                <BookOpen size={18} color={C.amber} />
              </div>
              <h3 style={{ fontFamily: MONO, fontSize: 14, fontWeight: 700, color: C.text }}>JournalInsight</h3>
            </div>
            <p style={{ ...S.paragraph, fontSize: 12, marginBottom: 12 }}>Interrogates reasoning traces for contradictions, weak claims, blind spots, and emotional biases.</p>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {["Exposes contradictions and blind spots", "Asks the questions you're avoiding", "Flags emotional bias and FOMO patterns", "Generates adversarial questions that pressure-test your logic"].map((t) => (
                <li key={t} style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 6 }}>
                  <span style={{ ...S.dot(C.amber), width: 4, height: 4, marginTop: 6 }} />
                  <span style={{ fontFamily: MONO, fontSize: 11, color: C.textDim }}>{t}</span>
                </li>
              ))}
            </ul>
          </div>
          <div style={{ ...S.card, borderColor: `#a855f730` }} data-testid="card-agent-thinking">
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <div style={S.iconBox("#a855f7")}>
                <Sparkles size={18} color="#a855f7" />
              </div>
              <h3 style={{ fontFamily: MONO, fontSize: 14, fontWeight: 700, color: C.text }}>AdversarialOracle</h3>
            </div>
            <p style={{ ...S.paragraph, fontSize: 12, marginBottom: 12 }}>Your adversarial AI — debates your ideas, exposes weak reasoning, and calls out what you're not seeing.</p>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {["Asks adversarial questions that challenge your assumptions", "Exposes core tensions and contradictions", "Flags narrative dependency and FOMO-driven logic", "Forces you to confront what you'd rather ignore"].map((t) => (
                <li key={t} style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 6 }}>
                  <span style={{ ...S.dot("#a855f7"), width: 4, height: 4, marginTop: 6 }} />
                  <span style={{ fontFamily: MONO, fontSize: 11, color: C.textDim }}>{t}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </AccordionSection>

      {/* Vault Encryption */}
      <AccordionSection num="10" title="Vault Encryption" open={openSections.has("10")} onToggle={() => toggleSection("10")}>
        <div style={{ ...S.card, borderColor: `${C.green}30` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <div style={S.iconBoxLg(C.green)}>
              <ShieldCheck size={22} color={C.green} />
            </div>
            <div>
              <h3 style={{ fontFamily: MONO, fontSize: 15, fontWeight: 700, color: C.text }}>Encrypt Your Local Vault</h3>
              <p style={{ fontFamily: MONO, fontSize: 10, color: `${C.green}cc` }}>AES-256-GCM encryption with PBKDF2 key derivation</p>
            </div>
          </div>
          <p style={{ ...S.paragraph, fontSize: 12, marginBottom: 20 }}>
            Add an extra layer of protection to your locally stored data. When you set a passphrase, all sensitive fields in your vault are encrypted using military-grade AES-256-GCM encryption. Even if someone gains access to your device, your thoughts remain locked without your passphrase.
          </p>
          <div style={S.grid2}>
            <div>
              <h4 style={{ fontFamily: MONO, fontSize: 12, fontWeight: 700, color: C.green, marginBottom: 12 }}>How It Works</h4>
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {[
                  { label: "Set Passphrase", text: "Open Settings in the sidebar and create a passphrase to enable encryption" },
                  { label: "Automatic Encryption", text: "Once set, all new entries and insights are encrypted on save and decrypted on read" },
                  { label: "Lock Vault", text: "Lock your vault when stepping away. The encryption key is cleared from memory" },
                  { label: "Unlock", text: "Re-enter your passphrase to unlock and resume working" },
                ].map((it) => (
                  <li key={it.label} style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 10 }}>
                    <span style={S.dot(C.green)} />
                    <span style={{ fontFamily: MONO, fontSize: 12, color: C.textDim }}><strong style={{ color: C.green }}>{it.label}</strong> — {it.text}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 style={{ fontFamily: MONO, fontSize: 12, fontWeight: 700, color: C.green, marginBottom: 12 }}>What Gets Encrypted</h4>
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {[
                  { label: "Audit records", text: "Your reasoning text is encrypted before storage" },
                  { label: "AI insights", text: 'The "what you said," "why it matters," "next move," and reflective question fields' },
                  { label: "Logic logs", text: "Local logic state is encrypted at rest" },
                  { label: "Exports", text: "When you export your vault, data is decrypted for portability" },
                ].map((it) => (
                  <li key={it.label} style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 10 }}>
                    <span style={S.dot(C.green)} />
                    <span style={{ fontFamily: MONO, fontSize: 12, color: C.textDim }}><strong style={{ color: C.green }}>{it.label}</strong> — {it.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div style={{ padding: 12, backgroundColor: `${C.green}0a`, border: `1px solid ${C.green}20`, marginTop: 16 }}>
            <p style={{ fontFamily: MONO, fontSize: 12, color: C.textDim, lineHeight: 1.7 }}>
              Encryption uses <strong style={{ color: C.text }}>PBKDF2 with 600,000 iterations</strong> for key derivation and <strong style={{ color: C.text }}>AES-GCM-256</strong> for encryption — all running locally in your browser via the WebCrypto API. Your passphrase never leaves your device.
            </p>
          </div>
        </div>
      </AccordionSection>

      {/* BYOK */}
      <AccordionSection num="11" title="Bring Your Own Key (BYOK)" open={openSections.has("11")} onToggle={() => toggleSection("11")}>
        <div style={{ ...S.card, borderColor: "#FFB84D30" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <div style={S.iconBoxLg("#FFB84D")}>
              <KeyRound size={22} color="#FFB84D" />
            </div>
            <div>
              <h3 style={{ fontFamily: MONO, fontSize: 15, fontWeight: 700, color: C.text }}>Use Your Own Venice API Key</h3>
              <p style={{ fontFamily: MONO, fontSize: 10, color: "#FFB84Dcc" }}>Full control over your AI inference</p>
            </div>
          </div>
          <p style={{ ...S.paragraph, fontSize: 12, marginBottom: 20 }}>
            By default, DJZS uses a shared Venice AI key for convenience. But if you want full control over your AI usage, billing, and rate limits, you can bring your own Venice API key. Your key is stored locally in your browser and sent directly with each AI request.
          </p>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, marginBottom: 16 }}>
            {[
              { label: "Settings Panel", text: "Open Settings in the chat sidebar to enter your Venice API key" },
              { label: "Local Storage", text: "Your key is stored only in your browser's localStorage, never on our servers" },
              { label: "Automatic Injection", text: "Once set, your key is used for all AI calls: audit insights, research, stress tests, and adversarial oracle" },
              { label: "Easy Removal", text: "Clear your key anytime to switch back to the shared key" },
            ].map((it) => (
              <li key={it.label} style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 10 }}>
                <span style={{ ...S.dot("#FFB84D") }} />
                <span style={{ fontFamily: MONO, fontSize: 12, color: C.textDim }}><strong style={{ color: "#FFB84D" }}>{it.label}</strong> — {it.text}</span>
              </li>
            ))}
          </ul>
          <div style={{ padding: 12, backgroundColor: "#FFB84D08", border: `1px solid #FFB84D20` }}>
            <p style={{ fontFamily: MONO, fontSize: 12, color: C.textDim, lineHeight: 1.7 }}>
              Get a Venice API key at <a href="https://venice.ai" target="_blank" rel="noopener noreferrer" style={{ color: "#FFB84D", textDecoration: "underline" }} data-testid="link-venice-ai">venice.ai</a>. Venice is a privacy-first AI provider that claims no data retention on inference requests.
            </p>
          </div>
        </div>
      </AccordionSection>

      {/* Technical Stack */}
      <AccordionSection num="12" title="Technical Stack" open={openSections.has("12")} onToggle={() => toggleSection("12")}>
        <p style={{ ...S.paragraph, marginBottom: 20 }}>The protocols, frameworks, and infrastructure behind the Oracle.</p>
        <div style={S.grid3}>
          <TechStackItem icon={Code2} color={C.amber} category="Frontend" items={["React 18", "TypeScript", "Vite", "Tailwind CSS", "Radix UI", "Framer Motion"]} />
          <TechStackItem icon={Layers} color="#a855f7" category="State & Data" items={["TanStack Query", "Dexie (IndexedDB)", "Zod Validation"]} />
          <TechStackItem icon={Link2} color="#3b82f6" category="Web3" items={["wagmi", "viem", "RainbowKit", "ENS Resolution"]} />
          <TechStackItem icon={HardDrive} color="#2dd4bf" category="Backend" items={["Express.js", "TypeScript", "Drizzle ORM"]} />
          <TechStackItem icon={Brain} color={C.red} category="AI & Agents" items={["Venice AI", "OpenClaw Runner", "XMTP Agent SDK", "Evasion Defense Pipeline"]} />
          <TechStackItem icon={Lock} color={C.amber} category="Storage & Security" items={["IndexedDB (local)", "AES-GCM-256", "PBKDF2 (600k)", "WebCrypto API", "BYOK (Venice)"]} />
          <TechStackItem icon={DollarSign} color={C.green} category="A2A Payments" items={["x402 Protocol", "@x402/express", "USDC on Base", "SHA-256 Hashing", "Three-tier pricing"]} />
          <TechStackItem icon={MessageSquare} color="#3b82f6" category="A2A Messaging" items={["XMTP (MLS Protocol)", "E2E Encrypted DMs", "Quantum-Resistant KEM", "Agent-to-Agent Routing"]} />
          <TechStackItem icon={Database} color="#2dd4bf" category="Provenance" items={["Irys Datachain", "Permanent Certificates", "Gateway Verification", "GraphQL Discovery"]} />
          <TechStackItem icon={Cpu} color="#a855f7" category="Secure Execution" items={["Phala Cloud TEE", "Hardware Enclave", "Dual-Process Boot", "concurrently"]} />
        </div>
      </AccordionSection>

      {/* Deployed Contracts */}
      <AccordionSection num="13" title="Deployed Contracts" open={openSections.has("13")} onToggle={() => toggleSection("13")}>
        <p style={{ ...S.paragraph, marginBottom: 20 }}>All DJZS Protocol contracts are live on Base Mainnet. Click any address to verify on BaseScan.</p>
        <div style={{ overflowX: "auto", border: `1px solid ${C.border}` }}>
          <table style={S.table}>
            <thead>
              <tr>
                <th style={{ ...S.th, padding: "12px 20px" }}>Contract</th>
                <th style={{ ...S.th, padding: "12px 20px" }}>Address</th>
              </tr>
            </thead>
            <tbody>
              {[
                { name: "DJZSAgentRegistry", address: "0xe40d5669Ce8e06A91188B82Ce7292175E2013E41" },
                { name: "DJZSLogicTrustScore", address: "0xB3324D07A8713b354435FF0e2A982A504e81b137" },
                { name: "DJZSStaking", address: "0xA362947D23D52C05a431E378F30C8A962De91e8A" },
                { name: "DJZSEscrowLock", address: "0xB041760147a60F63Ca701da9e431412bCc25Cfb7" },
              ].map((c) => (
                <tr key={c.name}>
                  <td style={{ ...S.td, padding: "12px 20px", color: C.text, fontWeight: 500 }} data-testid={`text-contract-name-${c.name}`}>{c.name}</td>
                  <td style={{ ...S.td, padding: "12px 20px" }}>
                    <a
                      href={`https://basescan.org/address/${c.address}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ fontFamily: MONO, color: C.green, textDecoration: "none", display: "flex", alignItems: "center", gap: 8, wordBreak: "break-all" }}
                      data-testid={`link-contract-${c.name}`}
                    >
                      {c.address}
                      <ExternalLink size={12} style={{ flexShrink: 0 }} />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ ...S.card, marginTop: 16, borderColor: `${C.green}20` }}>
          <p style={{ ...S.label, color: C.amber, marginBottom: 8 }}>ERC-8004 Registration</p>
          <a
            href="https://basescan.org/tx/0x99b9fcfc64af207771afde1851fa7e569e5161d5bb166dbd000b44743bd1ce23"
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontFamily: MONO, fontSize: 11, color: C.green, textDecoration: "none", display: "flex", alignItems: "center", gap: 8, wordBreak: "break-all" }}
            data-testid="link-erc8004-registration"
          >
            0x99b9fcfc64af207771afde1851fa7e569e5161d5bb166dbd000b44743bd1ce23
            <ExternalLink size={12} style={{ flexShrink: 0 }} />
          </a>
          <p style={{ fontFamily: MONO, fontSize: 11, color: C.textDim, marginTop: 8 }}>On-chain agent identity minted on Base Mainnet via the Synthesis hackathon registration contract.</p>
        </div>
      </AccordionSection>

      {/* Quick Links */}
      <AccordionSection num="14" title="Quick Links" open={openSections.has("14")} onToggle={() => toggleSection("14")}>
        <p style={{ ...S.paragraph, marginBottom: 20 }}>Jump to the tools, docs, and endpoints you need.</p>
        <div style={S.grid3}>
          <QuickLink href="/chat" title="Architect Console" description="Governance interface for the Sovereign Principal — audit ledger, Oracle, terminal, and x402 controls" testId="link-architect-console" />
          <QuickLink href="/chat?zone=audit" title="Deploy Audit" description="Route a reasoning trace through the x402 Execution Zones for paid adversarial analysis" testId="link-deploy-audit" />
          <QuickLink href="/privacy" title="Privacy & Security" description="Data transparency, encryption boundaries, and local-first architecture" testId="link-privacy" />
          <QuickLink href="/terms" title="Terms of Service" description="Legal terms, risk disclosures, and protocol limitations" testId="link-terms" />
          <QuickLink href="https://github.com/UsernameDAOEth/djzs-AI" title="GitHub Repository" description="Open-source protocol code, Docker image, and deployment scripts" external testId="link-github-repo" />
          <QuickLink href="/api/audit/schema" title="Audit API Schema" description="Machine-readable schema discovery for autonomous agent integration" external testId="link-audit-api" />
          <QuickLink href="/guide" title="MCP User Guide" description="How to connect djzs-trust MCP tool to Claude Desktop and query ProofOfLogic certificates" testId="link-guide" />
          <QuickLink href="/test-suite" title="Test Audit Suite" description="Nine strategy memos exercising all 11 DJZS-LF failure codes across all three audit tiers" testId="link-test-suite" />
        </div>
      </AccordionSection>

      <div style={S.sectionGap}>
        <div style={{ ...S.card, borderColor: `${C.green}30` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <div style={S.iconBoxLg(C.green)}>
              <Users size={22} color={C.green} />
            </div>
            <div>
              <h3 style={{ fontFamily: MONO, fontSize: 15, fontWeight: 700, color: C.text }}>Built by Username:Dj-Z-S</h3>
              <p style={{ fontFamily: MONO, fontSize: 10, color: `${C.green}cc` }}>Solo Founder</p>
            </div>
          </div>
          <div style={S.paragraph}>
            <p style={{ marginBottom: 12 }}>After years of watching autonomous agents hemorrhage capital based on unverified logic, hallucinated data, and FOMO, I engineered the Adversarial Logic Layer the A2A economy was missing.</p>
            <p style={{ marginBottom: 12 }}>DJZS is a single-purpose deterministic verification primitive. We enforce a ruthless "Audit-Before-Act" loop: every agent must commit its reasoning to an immutable ledger and pass a strict DJZS-LF audit before execution.</p>
            <p>If the logic fractures, the transaction dies. No exceptions. The Logic Oracle for the decentralized web. Honest, not helpful.</p>
          </div>
        </div>
      </div>

      <TerminalFooter />
    </TerminalPage>
  );
}
