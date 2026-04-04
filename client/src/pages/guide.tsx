import { Link } from "wouter";
import { Helmet } from "react-helmet";

const LF_TAXONOMY = [
  { code: "DJZS-S01", name: "Circular Logic", category: "Structural", weight: 30, severity: "CRITICAL" as const, description: "Reasoning chain references its own conclusion as premise" },
  { code: "DJZS-S02", name: "Layer Inversion", category: "Structural", weight: 25, severity: "HIGH" as const, description: "Verification layer depends on unverified upstream data" },
  { code: "DJZS-S03", name: "Dependency Ghost", category: "Structural", weight: 18, severity: "MEDIUM" as const, description: "References external dependency that cannot be resolved" },
  { code: "DJZS-E01", name: "Oracle Unverified", category: "Epistemic", weight: 25, severity: "HIGH" as const, description: "External data source cited without provenance verification" },
  { code: "DJZS-E02", name: "Confidence Inflation", category: "Epistemic", weight: 18, severity: "MEDIUM" as const, description: "Stated certainty exceeds evidential basis" },
  { code: "DJZS-I01", name: "FOMO Loop", category: "Incentive", weight: 16, severity: "MEDIUM" as const, description: "Decision driven by social signal rather than verified data" },
  { code: "DJZS-I02", name: "Misaligned Reward", category: "Incentive", weight: 16, severity: "MEDIUM" as const, description: "Optimization target diverges from stated objective" },
  { code: "DJZS-I03", name: "Data Unverified", category: "Incentive", weight: 16, severity: "MEDIUM" as const, description: "Numerical claims lack verifiable source attribution" },
  { code: "DJZS-X01", name: "Execution Unbound", category: "Execution", weight: 36, severity: "CRITICAL" as const, description: "No halt condition or resource ceiling defined" },
  { code: "DJZS-X02", name: "Race Condition", category: "Execution", weight: 24, severity: "HIGH" as const, description: "Temporal dependency creates non-deterministic outcome" },
  { code: "DJZS-T01", name: "Stale Reference", category: "Temporal", weight: 12, severity: "LOW" as const, description: "Data reference exceeds freshness threshold" },
];

const SEV_STYLES: Record<string, { color: string; bg: string }> = {
  CRITICAL: { color: "#ff5f5f", bg: "rgba(255, 95, 95, 0.08)" },
  HIGH: { color: "#ffaa60", bg: "rgba(255, 170, 96, 0.08)" },
  MEDIUM: { color: "#666", bg: "rgba(255,255,255,0.04)" },
  LOW: { color: "#60f0a0", bg: "rgba(96, 240, 160, 0.08)" },
};

export default function Guide() {
  return (
    <div style={{
      background: "#0a0a0a",
      color: "#e8e4dc",
      fontFamily: "'Fraunces', Georgia, serif",
      fontSize: 17,
      lineHeight: 1.75,
      minHeight: "100vh",
      position: "relative",
    }}>
      <Helmet>
        <title>DJZS Trust MCP — User Guide</title>
        <meta name="description" content="How to query ProofOfLogic certificates and agent trust scores directly from your AI assistant using the djzs-trust MCP tool." />
      </Helmet>

      <style>{`
        .guide-grain::before {
          content: '';
          position: fixed;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E");
          pointer-events: none;
          z-index: 0;
          opacity: 0.4;
        }
        @keyframes guidePulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        @keyframes guideFadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .guide-section { animation: guideFadeUp 0.6s ease both; }
      `}</style>

      <div className="guide-grain" style={{ maxWidth: 760, margin: "0 auto", padding: "0 24px", position: "relative", zIndex: 1 }}>

        <header style={{ padding: "80px 0 60px", borderBottom: "1px solid #1e1e1e", marginBottom: 64, animation: "guideFadeUp 0.8s ease both" }}>
          <div style={{
            display: "inline-block", fontFamily: "'DM Mono', monospace", fontSize: 11, letterSpacing: "0.12em",
            textTransform: "uppercase", color: "#c8f060", border: "1px solid rgba(200, 240, 96, 0.2)",
            background: "rgba(200, 240, 96, 0.08)", padding: "4px 12px", borderRadius: 2, marginBottom: 28,
          }} data-testid="tag-guide-header">
            DJZS Protocol — User Guide
          </div>
          <h1 style={{ fontSize: "clamp(32px, 6vw, 54px)", fontWeight: 300, lineHeight: 1.15, letterSpacing: "-0.02em", marginBottom: 20, color: "#e8e4dc" }}>
            Using <em style={{ fontStyle: "italic", color: "#c8f060" }}>djzs-trust</em> with Claude
          </h1>
          <p style={{ fontSize: 18, color: "#666", fontWeight: 300, maxWidth: 520, lineHeight: 1.6 }}>
            How to query ProofOfLogic certificates and agent trust scores directly from your AI assistant.
          </p>
          <div style={{ marginTop: 32, display: "flex", gap: 24, alignItems: "center", fontFamily: "'DM Mono', monospace", fontSize: 12, color: "#666" }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#c8f060", animation: "guidePulse 2s ease infinite" }} />
            <span>MCP Tool</span>
            <span>·</span>
            <span>Claude Desktop</span>
            <span>·</span>
            <span>Base Mainnet</span>
          </div>
        </header>

        <section className="guide-section" style={{ marginBottom: 72 }}>
          <h2 style={{ fontSize: 13, fontFamily: "'DM Mono', monospace", fontWeight: 400, letterSpacing: "0.1em", textTransform: "uppercase", color: "#c8f060", marginBottom: 20, display: "flex", alignItems: "center", gap: 12 }} data-testid="heading-what-is">
            What is djzs-trust
            <span style={{ flex: 1, height: 1, background: "#2a2a2a" }} />
          </h2>
          <div style={{ background: "#111111", border: "1px solid #2a2a2a", borderLeft: "3px solid #c8f060", padding: "28px 32px", borderRadius: 4, marginBottom: 32 }}>
            <p style={{ fontSize: 17, lineHeight: 1.8, color: "#e8e4dc", margin: 0 }}>
              djzs-trust is an MCP (Model Context Protocol) tool that connects Claude directly to the DJZS Protocol — a blockchain-based adversarial logic auditor for autonomous agents. Once connected, Claude can query permanent audit records, verify reasoning traces, and check agent trust scores on Base Mainnet without leaving the conversation.
            </p>
          </div>
          <p style={{ color: "#b0aa9e", marginBottom: 16, fontSize: 16 }}>
            Every time the DJZS oracle audits a strategy memo, it writes a ProofOfLogic (PoL) certificate to Irys Datachain — permanently and publicly. djzs-trust gives Claude a live query interface into that certificate history.
          </p>
        </section>

        <section className="guide-section" style={{ marginBottom: 72, animationDelay: "0.1s" }}>
          <h2 style={{ fontSize: 13, fontFamily: "'DM Mono', monospace", fontWeight: 400, letterSpacing: "0.1em", textTransform: "uppercase", color: "#c8f060", marginBottom: 20, display: "flex", alignItems: "center", gap: 12 }} data-testid="heading-setup">
            Setup
            <span style={{ flex: 1, height: 1, background: "#2a2a2a" }} />
          </h2>
          <div style={{ counterReset: "step" }}>
            {[
              { title: "Open Claude Desktop settings", desc: <>Go to Settings → Developer → Edit Config. This opens <code style={{ fontFamily: "'DM Mono', monospace", fontSize: 13, color: "#c8f060" }}>claude_desktop_config.json</code>.</> },
              { title: "Add the MCP server", desc: "Paste this into the config file:", hasConfig: true },
              { title: "Restart Claude Desktop", desc: <>Quit completely (Cmd+Q) and reopen. Go to Settings → Developer to confirm djzs-trust shows <span style={{ color: "#c8f060" }}>running</span>.</> },
              { title: "Enable in conversation", desc: "Click the + button in any Claude chat → Connectors → toggle djzs-trust on. You're ready." },
            ].map((step, i) => (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "40px 1fr", gap: "0 20px", marginBottom: 32, position: "relative" }} data-testid={`step-setup-${i + 1}`}>
                {i < 3 && (
                  <div style={{ position: "absolute", left: 19, top: 40, bottom: -32, width: 1, background: "#2a2a2a" }} />
                )}
                <div style={{
                  width: 40, height: 40, borderRadius: "50%", border: "1px solid #2a2a2a", background: "#111111",
                  display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Mono', monospace",
                  fontSize: 13, color: "#c8f060", flexShrink: 0,
                }}>
                  {i + 1}
                </div>
                <div style={{ paddingTop: 8 }}>
                  <h3 style={{ fontSize: 17, marginBottom: 6, color: "#e8e4dc", fontWeight: 300, letterSpacing: "-0.01em" }}>{step.title}</h3>
                  <p style={{ fontSize: 15, color: "#b0aa9e", marginBottom: 10 }}>{step.desc}</p>
                  {step.hasConfig && (
                    <div style={{ background: "#161616", border: "1px solid #2a2a2a", borderRadius: 6, overflow: "hidden", margin: "16px 0" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 18px", borderBottom: "1px solid #1e1e1e", fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#666" }}>
                        <span>claude_desktop_config.json</span>
                      </div>
                      <div style={{ padding: 18, fontFamily: "'DM Mono', monospace", fontSize: 12, lineHeight: 1.8, color: "#888" }}>
                        {"{"}<br />
                        &nbsp;&nbsp;<span style={{ color: "#666" }}>"mcpServers"</span>: {"{"}<br />
                        &nbsp;&nbsp;&nbsp;&nbsp;<span style={{ color: "#666" }}>"djzs-trust"</span>: {"{"}<br />
                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span style={{ color: "#666" }}>"command"</span>: <span style={{ color: "#b0b0a0" }}>"/Users/YOUR_USER/.npm-global/bin/mcp-remote"</span>,<br />
                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span style={{ color: "#666" }}>"args"</span>: [<span style={{ color: "#b0b0a0" }}>"https://djzs-trust-mcp.easy-less-spoil.workers.dev/mcp"</span>]<br />
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

        <section className="guide-section" style={{ marginBottom: 72, animationDelay: "0.2s" }}>
          <h2 style={{ fontSize: 13, fontFamily: "'DM Mono', monospace", fontWeight: 400, letterSpacing: "0.1em", textTransform: "uppercase", color: "#c8f060", marginBottom: 20, display: "flex", alignItems: "center", gap: 12 }} data-testid="heading-use-cases">
            Use Cases
            <span style={{ flex: 1, height: 1, background: "#2a2a2a" }} />
          </h2>
          {[
            { num: "01", title: "Pre-execution audit check", desc: "Before executing a high-stakes action — deploying a contract, releasing funds, or delegating a task — ask Claude to verify the audit history first.", prompt: "Before we deploy this contract, query djzs-trust for any FAIL verdicts on ProjectName" },
            { num: "02", title: "Agent due diligence", desc: "Check the full audit record of any agent address before trusting it with work or capital. Every verdict is permanent and tamper-proof.", prompt: "Query djzs-trust for all ProofOfLogic certificates for 0xAGENT_ADDRESS" },
            { num: "03", title: "Treasury-tier risk screening", desc: "Filter specifically for high-value audits that failed. Treasury-tier audits are exhaustive stress-tests — a FAIL here is a hard stop.", prompt: "Show me all treasury-tier FAIL verdicts from DJZS" },
            { num: "04", title: "Certificate verification", desc: "Verify any specific ProofOfLogic certificate by its Irys transaction ID. Confirms it's real, unaltered, and permanently stored.", prompt: "Verify this Irys certificate: 71oNMzL4hgLoXo7SNEsgPSJ8oCETs15jKwioke3V2rSH" },
            { num: "05", title: "Pre-payment escrow check", desc: "Before approving a payment or releasing escrow to an agent, run a trust check. This is Audit-Before-Act in practice.", prompt: "Before I approve this payment, check if this agent has any DJZS FAIL flags: 0xAGENT" },
          ].map((uc) => (
            <div key={uc.num} style={{ border: "1px solid #1e1e1e", borderRadius: 6, padding: 28, marginBottom: 16, transition: "border-color 0.2s, background 0.2s" }} data-testid={`card-usecase-${uc.num}`}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 16, marginBottom: 12 }}>
                <div style={{
                  fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#c8f060",
                  background: "rgba(200, 240, 96, 0.08)", border: "1px solid rgba(200, 240, 96, 0.2)",
                  width: 28, height: 28, borderRadius: 3, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2,
                }}>
                  {uc.num}
                </div>
                <h3 style={{ fontSize: 18, margin: "0 0 8px 0", fontWeight: 300, color: "#e8e4dc" }}>{uc.title}</h3>
              </div>
              <p style={{ margin: "0 0 16px 0", fontSize: 15, color: "#b0aa9e" }}>{uc.desc}</p>
              <div style={{
                background: "#161616", border: "1px solid #2a2a2a", borderRadius: 4, padding: "14px 18px",
                fontFamily: "'DM Mono', monospace", fontSize: 13, color: "#d4cfbe", lineHeight: 1.6,
              }}>
                <span style={{ color: "#c8f060", marginRight: 10, fontSize: 16 }}>›</span>
                {uc.prompt}
              </div>
            </div>
          ))}
        </section>

        <section className="guide-section" style={{ marginBottom: 72, animationDelay: "0.3s" }}>
          <h2 style={{ fontSize: 13, fontFamily: "'DM Mono', monospace", fontWeight: 400, letterSpacing: "0.1em", textTransform: "uppercase", color: "#c8f060", marginBottom: 20, display: "flex", alignItems: "center", gap: 12 }} data-testid="heading-what-returns">
            What Claude Returns
            <span style={{ flex: 1, height: 1, background: "#2a2a2a" }} />
          </h2>
          <p style={{ color: "#b0aa9e", marginBottom: 16, fontSize: 16 }}>
            When djzs-trust finds certificates, Claude returns a structured summary. Each certificate contains:
          </p>
          <div style={{ background: "#161616", border: "1px solid #2a2a2a", borderRadius: 6, overflow: "hidden", margin: "24px 0" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 18px", borderBottom: "1px solid #1e1e1e", fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#666" }}>
              <span>ProofOfLogic Certificate — Example Response</span>
              <span style={{ color: "#60f0a0" }}>● PASS</span>
            </div>
            <div style={{ padding: 18, fontFamily: "'DM Mono', monospace", fontSize: 12, lineHeight: 1.8, color: "#888" }} data-testid="code-example-response">
              {"{"}<br />
              &nbsp;&nbsp;<span style={{ color: "#666" }}>"total"</span>: <span style={{ color: "#8ab4f8" }}>3</span>,<br />
              &nbsp;&nbsp;<span style={{ color: "#666" }}>"pass"</span>: <span style={{ color: "#8ab4f8" }}>2</span>,<br />
              &nbsp;&nbsp;<span style={{ color: "#666" }}>"fail"</span>: <span style={{ color: "#8ab4f8" }}>1</span>,<br />
              &nbsp;&nbsp;<span style={{ color: "#666" }}>"certificates"</span>: [{"{"}<br />
              &nbsp;&nbsp;&nbsp;&nbsp;<span style={{ color: "#666" }}>"irys_id"</span>: <span style={{ color: "#b0b0a0" }}>"71oNMzL4hg..."</span>,<br />
              &nbsp;&nbsp;&nbsp;&nbsp;<span style={{ color: "#666" }}>"irys_url"</span>: <span style={{ color: "#c8f060" }}>"https://gateway.irys.xyz/71oNMzL4hg..."</span>,<br />
              &nbsp;&nbsp;&nbsp;&nbsp;<span style={{ color: "#666" }}>"verdict"</span>: <span style={{ color: "#60f0a0" }}>"PASS"</span>,<br />
              &nbsp;&nbsp;&nbsp;&nbsp;<span style={{ color: "#666" }}>"tier"</span>: <span style={{ color: "#b0b0a0" }}>"micro"</span>,<br />
              &nbsp;&nbsp;&nbsp;&nbsp;<span style={{ color: "#666" }}>"target_system"</span>: <span style={{ color: "#b0b0a0" }}>"MyDAOProject"</span>,<br />
              &nbsp;&nbsp;&nbsp;&nbsp;<span style={{ color: "#666" }}>"timestamp"</span>: <span style={{ color: "#8ab4f8" }}>1743000000</span><br />
              &nbsp;&nbsp;{"}]"}<br />
              {"}"}
            </div>
          </div>
          <p style={{ color: "#b0aa9e", marginBottom: 16, fontSize: 16 }}>
            The <span style={{ color: "#c8f060" }}>irys_url</span> is a permanent public link — anyone can verify the certificate without authentication, forever.
          </p>
        </section>

        <section className="guide-section" style={{ marginBottom: 72, animationDelay: "0.4s" }}>
          <h2 style={{ fontSize: 13, fontFamily: "'DM Mono', monospace", fontWeight: 400, letterSpacing: "0.1em", textTransform: "uppercase", color: "#c8f060", marginBottom: 20, display: "flex", alignItems: "center", gap: 12 }} data-testid="heading-taxonomy">
            Failure Taxonomy — DJZS-LF v1.0
            <span style={{ flex: 1, height: 1, background: "#2a2a2a" }} />
          </h2>
          <p style={{ color: "#b0aa9e", marginBottom: 16, fontSize: 16 }}>
            When an audit returns FAIL, the certificate includes one or more DJZS-LF failure codes. 11 codes across 5 categories. Agents must halt on Critical-severity flags.
          </p>

          <div style={{ display: "grid", gap: 8 }}>
            <div style={{
              display: "grid", gridTemplateColumns: "100px 1fr 80px 80px", gap: 12, alignItems: "center",
              padding: "12px 16px", fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#666",
              textTransform: "uppercase", letterSpacing: "0.08em",
            }}>
              <span>Code</span>
              <span>Name</span>
              <span>Severity</span>
              <span>Category</span>
            </div>
            {LF_TAXONOMY.map((lf) => {
              const sev = SEV_STYLES[lf.severity];
              return (
                <div key={lf.code} style={{
                  display: "grid", gridTemplateColumns: "100px 1fr 80px 80px", gap: 12, alignItems: "center",
                  padding: "12px 16px", background: "#111111", border: "1px solid #1e1e1e", borderRadius: 4, fontSize: 14,
                }} data-testid={`row-taxonomy-${lf.code}`}>
                  <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: "#c8f060" }}>{lf.code}</span>
                  <span style={{ color: "#e8e4dc", fontSize: 14 }}>{lf.name}</span>
                  <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: sev.color, background: sev.bg, padding: "2px 8px", borderRadius: 2, textAlign: "center" }}>
                    {lf.severity}
                  </span>
                  <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#666", textAlign: "center" }}>
                    {lf.category}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        <section className="guide-section" style={{ marginBottom: 72, animationDelay: "0.5s" }}>
          <h2 style={{ fontSize: 13, fontFamily: "'DM Mono', monospace", fontWeight: 400, letterSpacing: "0.1em", textTransform: "uppercase", color: "#c8f060", marginBottom: 20, display: "flex", alignItems: "center", gap: 12 }} data-testid="heading-tools">
            Available Tools
            <span style={{ flex: 1, height: 1, background: "#2a2a2a" }} />
          </h2>

          <div style={{ border: "1px solid #1e1e1e", borderRadius: 6, padding: 28, marginBottom: 12 }} data-testid="card-tool-query-pol">
            <h3 style={{ fontFamily: "'DM Mono', monospace", fontSize: 14, color: "#c8f060", marginBottom: 8, fontWeight: 400 }}>query_pol_certificates</h3>
            <p style={{ marginBottom: 12, fontSize: 15, color: "#b0aa9e" }}>Queries Irys Datachain for ProofOfLogic certificates. Filter by project name, wallet address, verdict (PASS/FAIL), or audit tier. Returns up to 100 results.</p>
            <p style={{ fontSize: 13, color: "#666", margin: 0 }}><strong style={{ color: "#666" }}>Parameters:</strong> targetSystem, verdict, tier, limit</p>
          </div>

          <div style={{ border: "1px solid #1e1e1e", borderRadius: 6, padding: 28, marginBottom: 12 }} data-testid="card-tool-query-trust">
            <h3 style={{ fontFamily: "'DM Mono', monospace", fontSize: 14, color: "#c8f060", marginBottom: 8, fontWeight: 400 }}>query_agent_trust</h3>
            <p style={{ marginBottom: 12, fontSize: 15, color: "#b0aa9e" }}>Queries on-chain trust scores, fail rates, staking positions, and LF code history for DJZS-registered agents on Base Mainnet. Returns a PROCEED or HALT safety verdict automatically.</p>
            <p style={{ fontSize: 13, color: "#666", margin: 0 }}><strong style={{ color: "#666" }}>Parameters:</strong> agentAddress</p>
          </div>
        </section>

        <div style={{
          background: "#111111", border: "1px solid #2a2a2a", borderTop: "3px solid #c8f060",
          borderRadius: 4, padding: 36, textAlign: "center", margin: "64px 0 80px",
        }} data-testid="section-cta">
          <h3 style={{ fontSize: 26, marginBottom: 12, color: "#e8e4dc", fontWeight: 300 }}>Run your first audit</h3>
          <p style={{ marginBottom: 28, fontSize: 16, color: "#b0aa9e" }}>The MCP queries certificates that already exist on Irys. Run an audit through the DJZS oracle to create your first ProofOfLogic certificate.</p>
          <Link href="/demo" data-testid="button-cta-open-oracle">
            <span style={{
              display: "inline-block", background: "#c8f060", color: "#0a0a0a", fontFamily: "'DM Mono', monospace",
              fontSize: 13, fontWeight: 500, letterSpacing: "0.05em", padding: "12px 28px", borderRadius: 3,
              textDecoration: "none", cursor: "pointer",
            }}>
              Open DJZS Oracle →
            </span>
          </Link>
        </div>

        <footer style={{
          borderTop: "1px solid #1e1e1e", padding: "32px 0", fontFamily: "'DM Mono', monospace",
          fontSize: 12, color: "#666", display: "flex", justifyContent: "space-between", marginBottom: 40,
        }}>
          <span>DJZS Protocol — djzs.ai</span>
          <span>No agent acts without audit.</span>
        </footer>

      </div>
    </div>
  );
}
