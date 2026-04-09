import { Link } from "wouter";
import { Helmet } from "react-helmet";
import { LOGIC_FAILURE_TAXONOMY, VALID_FAILURE_CODES, type LogicFailureCode } from "@shared/audit-schema";
import { C, MONO, TerminalPage, TerminalHeading, TerminalFooter, GlowDot } from "@/lib/terminal-theme";

const LF_TAXONOMY = VALID_FAILURE_CODES.map((code: LogicFailureCode) => {
  const def = LOGIC_FAILURE_TAXONOMY[code];
  return { ...def, code };
});

const SEV_STYLES: Record<string, { color: string; bg: string }> = {
  CRITICAL: { color: C.red, bg: `${C.red}14` },
  HIGH: { color: C.amber, bg: `${C.amber}14` },
  MEDIUM: { color: C.textDim, bg: "rgba(255,255,255,0.04)" },
  LOW: { color: C.green, bg: `${C.green}14` },
  INFO: { color: "#8ab4f8", bg: "rgba(138, 180, 248, 0.08)" },
};

export default function Guide() {
  return (
    <TerminalPage>
      <Helmet>
        <title>DJZS Trust MCP — User Guide</title>
        <meta name="description" content="How to query ProofOfLogic certificates and agent trust scores directly from your AI assistant using the djzs-trust MCP tool." />
      </Helmet>

      <header style={{ padding: "60px 0 40px", borderBottom: `1px solid ${C.border}`, marginBottom: 48 }}>
        <div
          style={{
            display: "inline-block", fontFamily: MONO, fontSize: 11, letterSpacing: "0.12em",
            textTransform: "uppercase", color: C.green, border: `1px solid ${C.green}33`,
            background: C.greenGlow, padding: "4px 12px", borderRadius: 2, marginBottom: 24,
          }}
          data-testid="tag-guide-header"
        >
          DJZS Protocol — User Guide
        </div>
        <h1 style={{ fontSize: "clamp(28px, 5vw, 44px)", fontWeight: 700, lineHeight: 1.2, letterSpacing: "-0.02em", marginBottom: 12, color: C.white }}>
          Using <span style={{ color: C.green }}>djzs-trust</span> with Claude
        </h1>
        <p style={{ fontSize: 14, color: C.textDim, maxWidth: 520 }}>
          How to query ProofOfLogic certificates and agent trust scores directly from your AI assistant.
        </p>
        <div style={{ marginTop: 24, display: "flex", gap: 24, alignItems: "center", fontSize: 12, color: C.textDim }}>
          <GlowDot color={C.green} size={6} />
          <span>MCP Tool</span>
          <span style={{ color: C.textMuted }}>·</span>
          <span>Claude Desktop</span>
          <span style={{ color: C.textMuted }}>·</span>
          <span>Base Mainnet</span>
        </div>
      </header>

      <div style={{ display: "flex", flexDirection: "column", gap: 48, marginBottom: 64 }}>
        <section>
          <TerminalHeading num="01">What is djzs-trust</TerminalHeading>
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderLeft: `3px solid ${C.green}`, padding: "20px 24px", borderRadius: 4, marginBottom: 16 }}>
            <p style={{ fontSize: 14, lineHeight: 1.8, color: C.text, margin: 0 }}>
              djzs-trust is an MCP (Model Context Protocol) tool that connects Claude directly to the DJZS Protocol — a blockchain-based adversarial logic auditor for autonomous agents. Once connected, Claude can query permanent audit records, verify reasoning traces, and check agent trust scores on Base Mainnet without leaving the conversation.
            </p>
          </div>
          <p style={{ color: C.textDim, fontSize: 13, lineHeight: 1.7 }}>
            Every time the DJZS oracle audits a strategy memo, it writes a ProofOfLogic (PoL) certificate to Irys Datachain — permanently and publicly. djzs-trust gives Claude a live query interface into that certificate history.
          </p>
        </section>

        <section>
          <TerminalHeading num="02">Setup</TerminalHeading>
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {[
              { title: "Open Claude Desktop settings", desc: <>Go to Settings → Developer → Edit Config. This opens <code style={{ fontFamily: MONO, fontSize: 12, color: C.green }}>claude_desktop_config.json</code>.</> },
              { title: "Add the MCP server", desc: "Paste this into the config file:", hasConfig: true },
              { title: "Restart Claude Desktop", desc: <>Quit completely (Cmd+Q) and reopen. Go to Settings → Developer to confirm djzs-trust shows <span style={{ color: C.green }}>running</span>.</> },
              { title: "Enable in conversation", desc: "Click the + button in any Claude chat → Connectors → toggle djzs-trust on. You're ready." },
            ].map((step, i) => (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "40px 1fr", gap: "0 16px", marginBottom: 24, position: "relative" }} data-testid={`step-setup-${i + 1}`}>
                {i < 3 && (
                  <div style={{ position: "absolute", left: 19, top: 40, bottom: -24, width: 1, background: C.border }} />
                )}
                <div style={{
                  width: 40, height: 40, borderRadius: "50%", border: `1px solid ${C.border}`, background: C.surface,
                  display: "flex", alignItems: "center", justifyContent: "center", fontFamily: MONO,
                  fontSize: 13, color: C.green, flexShrink: 0,
                }}>
                  {i + 1}
                </div>
                <div style={{ paddingTop: 8 }}>
                  <h3 style={{ fontSize: 15, marginBottom: 6, color: C.white, fontWeight: 600 }}>{step.title}</h3>
                  <p style={{ fontSize: 13, color: C.textDim, marginBottom: 8 }}>{step.desc}</p>
                  {step.hasConfig && (
                    <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 4, overflow: "hidden", margin: "12px 0" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 16px", borderBottom: `1px solid ${C.border}`, fontFamily: MONO, fontSize: 11, color: C.textMuted }}>
                        <span>claude_desktop_config.json</span>
                      </div>
                      <div style={{ padding: 16, fontFamily: MONO, fontSize: 12, lineHeight: 1.8, color: C.textDim }}>
                        {"{"}<br />
                        &nbsp;&nbsp;<span style={{ color: C.textMuted }}>"mcpServers"</span>: {"{"}<br />
                        &nbsp;&nbsp;&nbsp;&nbsp;<span style={{ color: C.textMuted }}>"djzs-trust"</span>: {"{"}<br />
                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span style={{ color: C.textMuted }}>"command"</span>: <span style={{ color: C.text }}>"/Users/YOUR_USER/.npm-global/bin/mcp-remote"</span>,<br />
                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span style={{ color: C.textMuted }}>"args"</span>: [<span style={{ color: C.text }}>"https://djzs-trust-mcp.easy-less-spoil.workers.dev/mcp"</span>]<br />
                        &nbsp;&nbsp;&nbsp;&nbsp;{"}"}<br />
                        &nbsp;&nbsp;{"}"}<br />
                        {"}"}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <TerminalHeading num="03">Use Cases</TerminalHeading>
          {[
            { num: "01", title: "Pre-execution audit check", desc: "Before executing a high-stakes action — deploying a contract, releasing funds, or delegating a task — ask Claude to verify the audit history first.", prompt: "Before we deploy this contract, query djzs-trust for any FAIL verdicts on ProjectName" },
            { num: "02", title: "Agent due diligence", desc: "Check the full audit record of any agent address before trusting it with work or capital.", prompt: "Query djzs-trust for all ProofOfLogic certificates for 0xAGENT_ADDRESS" },
            { num: "03", title: "Treasury-tier risk screening", desc: "Filter specifically for high-value audits that failed.", prompt: "Show me all treasury-tier FAIL verdicts from DJZS" },
            { num: "04", title: "Certificate verification", desc: "Verify any specific ProofOfLogic certificate by its Irys transaction ID.", prompt: "Verify this Irys certificate: 71oNMzL4hgLoXo7SNEsgPSJ8oCETs15jKwioke3V2rSH" },
            { num: "05", title: "Pre-payment escrow check", desc: "Before approving a payment or releasing escrow to an agent, run a trust check.", prompt: "Before I approve this payment, check if this agent has any DJZS FAIL flags: 0xAGENT" },
          ].map((uc) => (
            <div key={uc.num} style={{ border: `1px solid ${C.border}`, borderRadius: 4, padding: 20, marginBottom: 12 }} data-testid={`card-usecase-${uc.num}`}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 8 }}>
                <div style={{
                  fontFamily: MONO, fontSize: 11, color: C.green,
                  background: C.greenGlow, border: `1px solid ${C.green}33`,
                  width: 28, height: 28, borderRadius: 3, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}>
                  {uc.num}
                </div>
                <h3 style={{ fontSize: 16, margin: 0, fontWeight: 600, color: C.white }}>{uc.title}</h3>
              </div>
              <p style={{ margin: "0 0 12px 0", fontSize: 13, color: C.textDim }}>{uc.desc}</p>
              <div style={{
                background: C.surface, border: `1px solid ${C.border}`, borderRadius: 4, padding: "10px 14px",
                fontFamily: MONO, fontSize: 12, color: C.text, lineHeight: 1.6,
              }}>
                <span style={{ color: C.green, marginRight: 8 }}>›</span>
                {uc.prompt}
              </div>
            </div>
          ))}
        </section>

        <section>
          <TerminalHeading num="04">What Claude Returns</TerminalHeading>
          <p style={{ color: C.textDim, marginBottom: 16, fontSize: 13 }}>
            When djzs-trust finds certificates, Claude returns a structured summary:
          </p>
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 4, overflow: "hidden", margin: "16px 0" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 16px", borderBottom: `1px solid ${C.border}`, fontFamily: MONO, fontSize: 11, color: C.textMuted }}>
              <span>ProofOfLogic Certificate — Example Response</span>
              <span style={{ color: C.red }}>● FAIL</span>
            </div>
            <div style={{ padding: 16, fontFamily: MONO, fontSize: 12, lineHeight: 1.8, color: C.textDim }} data-testid="code-example-response">
              {"{"}<br />
              &nbsp;&nbsp;<span style={{ color: C.textMuted }}>"total"</span>: <span style={{ color: "#8ab4f8" }}>3</span>,<br />
              &nbsp;&nbsp;<span style={{ color: C.textMuted }}>"pass"</span>: <span style={{ color: "#8ab4f8" }}>2</span>,<br />
              &nbsp;&nbsp;<span style={{ color: C.textMuted }}>"fail"</span>: <span style={{ color: "#8ab4f8" }}>1</span>,<br />
              &nbsp;&nbsp;<span style={{ color: C.textMuted }}>"certificates"</span>: [{"{"}<br />
              &nbsp;&nbsp;&nbsp;&nbsp;<span style={{ color: C.textMuted }}>"irys_id"</span>: <span style={{ color: C.text }}>"71oNMzL4hg..."</span>,<br />
              &nbsp;&nbsp;&nbsp;&nbsp;<span style={{ color: C.textMuted }}>"irys_url"</span>: <span style={{ color: C.green }}>"https://gateway.irys.xyz/71oNMzL4hg..."</span>,<br />
              &nbsp;&nbsp;&nbsp;&nbsp;<span style={{ color: C.textMuted }}>"verdict"</span>: <span style={{ color: C.red }}>"FAIL"</span>,<br />
              &nbsp;&nbsp;&nbsp;&nbsp;<span style={{ color: C.textMuted }}>"risk_score"</span>: <span style={{ color: "#8ab4f8" }}>65</span>,<br />
              &nbsp;&nbsp;&nbsp;&nbsp;<span style={{ color: C.textMuted }}>"flags"</span>: [{"{"}<br />
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span style={{ color: C.textMuted }}>"code"</span>: <span style={{ color: C.red }}>"DJZS-S01"</span>,<br />
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span style={{ color: C.textMuted }}>"severity"</span>: <span style={{ color: C.red }}>"CRITICAL"</span><br />
              &nbsp;&nbsp;&nbsp;&nbsp;{"}]"}<br />
              &nbsp;&nbsp;{"}]"}<br />
              {"}"}
            </div>
          </div>
          <p style={{ color: C.textDim, fontSize: 13 }}>
            The <span style={{ color: C.green }}>irys_url</span> is a permanent public link — anyone can verify the certificate without authentication, forever.
          </p>
        </section>

        <section>
          <TerminalHeading num="05">Failure Taxonomy — DJZS-LF v1.0</TerminalHeading>
          <p style={{ color: C.textDim, marginBottom: 16, fontSize: 13 }}>
            When an audit returns FAIL, the certificate includes one or more DJZS-LF failure codes. {VALID_FAILURE_CODES.length} codes across 5 categories.
          </p>
          <div style={{ display: "grid", gap: 4 }}>
            <div style={{
              display: "grid", gridTemplateColumns: "100px 1fr 80px 80px 60px", gap: 12, alignItems: "center",
              padding: "8px 12px", fontFamily: MONO, fontSize: 10, color: C.textMuted,
              textTransform: "uppercase", letterSpacing: "0.08em",
            }}>
              <span>Code</span>
              <span>Name</span>
              <span>Severity</span>
              <span>Category</span>
              <span>Risk Pts</span>
            </div>
            {LF_TAXONOMY.map((lf) => {
              const sev = SEV_STYLES[lf.severity];
              return (
                <div key={lf.code} style={{
                  display: "grid", gridTemplateColumns: "100px 1fr 80px 80px 60px", gap: 12, alignItems: "center",
                  padding: "8px 12px", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 4, fontSize: 13,
                }} data-testid={`row-taxonomy-${lf.code}`}>
                  <span style={{ fontFamily: MONO, fontSize: 12, color: C.green }}>{lf.code}</span>
                  <span style={{ color: C.text, fontSize: 13 }}>{lf.name}</span>
                  <span style={{ fontFamily: MONO, fontSize: 10, color: sev.color, background: sev.bg, padding: "2px 8px", borderRadius: 2, textAlign: "center" }}>
                    {lf.severity}
                  </span>
                  <span style={{ fontFamily: MONO, fontSize: 10, color: C.textMuted, textAlign: "center" }}>
                    {lf.category}
                  </span>
                  <span style={{ fontFamily: MONO, fontSize: 11, color: "#8ab4f8", textAlign: "center" }}>
                    {lf.weight}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        <section>
          <TerminalHeading num="06">Scoring Model</TerminalHeading>
          <p style={{ color: C.textDim, marginBottom: 16, fontSize: 13 }}>
            Each detected failure flag adds its risk points to a cumulative score. The maximum possible risk score is 200. A FAIL verdict is issued when:
          </p>
          <div style={{ display: "grid", gap: 6, marginBottom: 16 }}>
            {[
              { label: "Risk score ≥ 60", detail: "Cumulative risk points from all detected flags reach the fail threshold (max 200)" },
              { label: "CRITICAL flag detected", detail: "Any CRITICAL-severity flag (S01, X01) triggers immediate FAIL" },
              { label: "Auto-abort flag detected", detail: "Any flag with autoAbort = true (CRITICAL or HIGH severity) triggers FAIL" },
            ].map((rule, i) => (
              <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start", padding: "10px 14px", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 4 }} data-testid={`rule-scoring-${i}`}>
                <span style={{ fontFamily: MONO, fontSize: 11, color: C.red, flexShrink: 0, marginTop: 2 }}>FAIL</span>
                <div>
                  <div style={{ fontSize: 13, color: C.white, marginBottom: 2 }}>{rule.label}</div>
                  <div style={{ fontSize: 12, color: C.textDim }}>{rule.detail}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderLeft: `3px solid ${C.green}`, padding: "12px 16px", borderRadius: 4, fontSize: 13, color: C.textDim }} data-testid="rule-pass">
            <span style={{ fontFamily: MONO, fontSize: 11, color: C.green, marginRight: 12 }}>PASS</span>
            Risk score below 60 and no auto-abort (CRITICAL/HIGH) flags.
          </div>
        </section>

        <section>
          <TerminalHeading num="07">Available Tools</TerminalHeading>
          <div style={{ border: `1px solid ${C.border}`, borderRadius: 4, padding: 20, marginBottom: 8 }} data-testid="card-tool-query-pol">
            <h3 style={{ fontFamily: MONO, fontSize: 13, color: C.green, marginBottom: 6, fontWeight: 600 }}>query_pol_certificates</h3>
            <p style={{ marginBottom: 8, fontSize: 13, color: C.textDim }}>Queries Irys Datachain for ProofOfLogic certificates. Filter by project name, wallet address, verdict (PASS/FAIL), or audit tier. Returns up to 100 results.</p>
            <p style={{ fontSize: 12, color: C.textMuted, margin: 0 }}>Parameters: targetSystem, verdict, tier, limit</p>
          </div>
          <div style={{ border: `1px solid ${C.border}`, borderRadius: 4, padding: 20 }} data-testid="card-tool-query-trust">
            <h3 style={{ fontFamily: MONO, fontSize: 13, color: C.green, marginBottom: 6, fontWeight: 600 }}>query_agent_trust</h3>
            <p style={{ marginBottom: 8, fontSize: 13, color: C.textDim }}>Queries on-chain trust scores, fail rates, staking positions, and LF code history for DJZS-registered agents on Base Mainnet.</p>
            <p style={{ fontSize: 12, color: C.textMuted, margin: 0 }}>Parameters: agentAddress</p>
          </div>
        </section>
      </div>

      <div style={{
        background: C.surface, border: `1px solid ${C.border}`, borderTop: `3px solid ${C.green}`,
        borderRadius: 4, padding: 28, textAlign: "center", marginBottom: 48,
      }} data-testid="section-cta">
        <h3 style={{ fontSize: 20, marginBottom: 8, color: C.white, fontWeight: 600 }}>Run your first audit</h3>
        <p style={{ marginBottom: 20, fontSize: 13, color: C.textDim }}>The MCP queries certificates that already exist on Irys. Run an audit through the DJZS oracle to create your first ProofOfLogic certificate.</p>
        <Link href="/demo" data-testid="button-cta-open-oracle">
          <span style={{
            display: "inline-block", background: C.green, color: C.bg, fontFamily: MONO,
            fontSize: 12, fontWeight: 600, letterSpacing: "0.05em", padding: "10px 24px", borderRadius: 3,
            textDecoration: "none", cursor: "pointer",
          }}>
            Open DJZS Oracle →
          </span>
        </Link>
      </div>

      <TerminalFooter />
    </TerminalPage>
  );
}
