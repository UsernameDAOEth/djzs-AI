import { useState } from "react";
import { Link } from "wouter";
import { Helmet } from "react-helmet";
import { LOGIC_FAILURE_TAXONOMY, VALID_FAILURE_CODES, type LogicFailureCode } from "@shared/audit-schema";

interface TestCase {
  id: number;
  title: string;
  targetSystem: string;
  tier: "micro" | "founder" | "treasury";
  memo: string;
  expectedVerdict: "PASS" | "FAIL";
  expectedCodes: LogicFailureCode[];
  rationale: string;
}

const TEST_CASES: TestCase[] = [
  {
    id: 1, title: "Clean Pass", targetSystem: "TestVault-Alpha", tier: "micro",
    memo: "Rebalance the USDC/ETH liquidity position on Uniswap V3 when the price moves outside the \u00b15% range from the 7-day TWAP. If ETH drops below $1,800, withdraw all liquidity to USDC and halt. Max position size: 2% of treasury. The strategy fails if impermanent loss exceeds 3% over any 30-day rolling window \u2014 at that point, exit to stables and flag for human review.",
    expectedVerdict: "PASS", expectedCodes: [],
    rationale: "Falsifiable exit conditions, bounded risk, explicit halt trigger.",
  },
  {
    id: 2, title: "Circular Logic (DJZS-S01)", targetSystem: "TestVault-Bravo", tier: "micro",
    memo: "This token will go up because demand is increasing. We know demand is increasing because the price is going up. The rising price confirms our thesis that the token is undervalued, which means more buyers will enter, pushing the price higher. We should allocate 10% of the fund to this position.",
    expectedVerdict: "FAIL", expectedCodes: ["DJZS-S01"],
    rationale: "The thesis validates itself with its own conclusion.",
  },
  {
    id: 3, title: "Missing Falsifiability (DJZS-S02)", targetSystem: "TestVault-Charlie", tier: "founder",
    memo: "We believe the DeFi sector is entering a structural growth phase. Our thesis is that decentralized protocols will capture increasing market share from traditional finance over the next decade. We recommend a diversified allocation across the top 20 DeFi tokens by TVL. This is a long-term conviction play with no specific exit criteria \u2014 we will reassess periodically as the narrative evolves.",
    expectedVerdict: "FAIL", expectedCodes: ["DJZS-S02"],
    rationale: "No exit condition, no measurable failure state.",
  },
  {
    id: 4, title: "Confirmation Tunnel (DJZS-E01)", targetSystem: "TestVault-Delta", tier: "founder",
    memo: "Three prominent crypto analysts on Twitter have called for ETH to reach $10,000 by Q4. Coinbase's latest report is bullish on Ethereum. The ETH/BTC ratio has historically recovered after drops like this. Reddit sentiment is overwhelmingly positive. Based on this consensus, we recommend a 15% ETH allocation with a stop-loss at $2,500.",
    expectedVerdict: "FAIL", expectedCodes: ["DJZS-E01"],
    rationale: "All sources confirm the same directional bias. No bearish evidence considered.",
  },
  {
    id: 5, title: "Authority Substitution (DJZS-E02)", targetSystem: "TestVault-Echo", tier: "micro",
    memo: "BlackRock's CEO said Bitcoin is \"digital gold\" and institutional adoption is inevitable. ARK Invest's model prices BTC at $1M by 2030. Because these institutions have more resources and data than we do, we should follow their positioning and allocate 20% of the fund to BTC with no stop-loss \u2014 if they're wrong, everyone is wrong.",
    expectedVerdict: "FAIL", expectedCodes: ["DJZS-E02"],
    rationale: "Thesis derived entirely from authority figures. Explicitly abdicates independent judgment.",
  },
  {
    id: 6, title: "Misaligned Incentive + Narrative Dependency (DJZS-I01/I02)", targetSystem: "TestVault-Foxtrot", tier: "treasury",
    memo: "Our fund advisor (who holds a large position in $FOXTROT) recommends we allocate 30% of treasury to the $FOXTROT token. The token's value proposition depends on the \"AI agent economy\" narrative gaining mainstream traction by 2025. If the narrative stalls, the token has no standalone utility, but the advisor assures us the narrative is \"unstoppable.\" We plan to vest the allocation over 12 months with no early exit clause.",
    expectedVerdict: "FAIL", expectedCodes: ["DJZS-I01", "DJZS-I02"],
    rationale: "Advisor profits from own recommendation; token value collapses without a specific macro thesis.",
  },
  {
    id: 7, title: "Unhedged Execution (DJZS-X01)", targetSystem: "TestVault-Golf", tier: "treasury",
    memo: "Deploy $500K USDC into a new lending protocol on Base that launched 3 days ago. The APY is currently 47%. No audit has been completed on the protocol's smart contracts, but the team says one is \"in progress.\" We will deploy the full amount in a single transaction. If the protocol is exploited, we accept the loss as a cost of early positioning. No insurance, no phased entry, no withdrawal triggers.",
    expectedVerdict: "FAIL", expectedCodes: ["DJZS-X01"],
    rationale: "No risk mitigation on any axis: unaudited protocol, single-tranche deployment, no insurance, no exit triggers.",
  },
];

const COVERAGE_MATRIX = [
  { test: 1, tier: "micro", expected: "PASS", codes: "\u2014" },
  { test: 2, tier: "micro", expected: "FAIL", codes: "DJZS-S01" },
  { test: 3, tier: "founder", expected: "FAIL", codes: "DJZS-S02" },
  { test: 4, tier: "founder", expected: "FAIL", codes: "DJZS-E01" },
  { test: 5, tier: "micro", expected: "FAIL", codes: "DJZS-E02" },
  { test: 6, tier: "treasury", expected: "FAIL", codes: "DJZS-I01, DJZS-I02" },
  { test: 7, tier: "treasury", expected: "FAIL", codes: "DJZS-X01" },
];

const TIER_COLORS: Record<string, string> = {
  micro: "#60f0a0",
  founder: "#c8f060",
  treasury: "#ffaa60",
};

export default function TestSuite() {
  const [expandedTest, setExpandedTest] = useState<number | null>(null);

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
        <title>DJZS Oracle — Test Audit Suite</title>
        <meta name="description" content="Seven strategy memos exercising 8 of 11 DJZS-LF failure codes across all three audit tiers." />
      </Helmet>

      <style>{`
        .test-grain::before {
          content: '';
          position: fixed;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E");
          pointer-events: none;
          z-index: 0;
          opacity: 0.4;
        }
        @keyframes testFadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .test-section { animation: testFadeUp 0.6s ease both; }
        @keyframes testPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>

      <div className="test-grain" style={{ maxWidth: 760, margin: "0 auto", padding: "0 24px", position: "relative", zIndex: 1 }}>

        <header style={{ padding: "80px 0 60px", borderBottom: "1px solid #1e1e1e", marginBottom: 64, animation: "testFadeUp 0.8s ease both" }}>
          <div style={{
            display: "inline-block", fontFamily: "'DM Mono', monospace", fontSize: 11, letterSpacing: "0.12em",
            textTransform: "uppercase", color: "#c8f060", border: "1px solid rgba(200, 240, 96, 0.2)",
            background: "rgba(200, 240, 96, 0.08)", padding: "4px 12px", borderRadius: 2, marginBottom: 28,
          }} data-testid="tag-test-suite-header">
            DJZS Protocol — Test Suite
          </div>
          <h1 style={{ fontSize: "clamp(32px, 6vw, 54px)", fontWeight: 300, lineHeight: 1.15, letterSpacing: "-0.02em", marginBottom: 20, color: "#e8e4dc" }}>
            Test <em style={{ fontStyle: "italic", color: "#c8f060" }}>Audit Suite</em>
          </h1>
          <p style={{ fontSize: 18, color: "#666", fontWeight: 300, maxWidth: 520, lineHeight: 1.6 }}>
            Seven strategy memos exercising 8 of {VALID_FAILURE_CODES.length} DJZS-LF failure codes across all three tiers. Submit each to the DJZS oracle at djzs.ai.
          </p>
          <div style={{ marginTop: 32, display: "flex", gap: 24, alignItems: "center", fontFamily: "'DM Mono', monospace", fontSize: 12, color: "#666" }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#c8f060", animation: "testPulse 2s ease infinite" }} />
            <span>7 Tests</span>
            <span>·</span>
            <span>3 Tiers</span>
            <span>·</span>
            <span>8 LF Codes</span>
          </div>
        </header>

        <section className="test-section" style={{ marginBottom: 72 }}>
          <h2 style={{ fontSize: 13, fontFamily: "'DM Mono', monospace", fontWeight: 400, letterSpacing: "0.1em", textTransform: "uppercase", color: "#c8f060", marginBottom: 20, display: "flex", alignItems: "center", gap: 12 }} data-testid="heading-test-cases">
            Test Cases
            <span style={{ flex: 1, height: 1, background: "#2a2a2a" }} />
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {TEST_CASES.map((tc) => {
              const isExpanded = expandedTest === tc.id;
              const tierColor = TIER_COLORS[tc.tier];
              return (
                <div key={tc.id} style={{
                  border: "1px solid #1e1e1e", borderRadius: 6, overflow: "hidden",
                  background: isExpanded ? "#111111" : "transparent",
                  transition: "background 0.2s",
                }} data-testid={`card-test-${tc.id}`}>
                  <button
                    onClick={() => setExpandedTest(isExpanded ? null : tc.id)}
                    aria-expanded={isExpanded}
                    aria-controls={`test-detail-${tc.id}`}
                    style={{
                      width: "100%", padding: "20px 24px", background: "none", border: "none",
                      cursor: "pointer", textAlign: "left", display: "flex", alignItems: "center", gap: 16,
                    }}
                    data-testid={`button-toggle-test-${tc.id}`}
                  >
                    <div style={{
                      fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#c8f060",
                      background: "rgba(200, 240, 96, 0.08)", border: "1px solid rgba(200, 240, 96, 0.2)",
                      width: 28, height: 28, borderRadius: 3, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                    }}>
                      {tc.id}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 16, fontWeight: 300, color: "#e8e4dc", fontFamily: "'Fraunces', Georgia, serif" }}>{tc.title}</div>
                      <div style={{ display: "flex", gap: 8, marginTop: 6, flexWrap: "wrap" }}>
                        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: tierColor, background: `${tierColor}12`, border: `1px solid ${tierColor}33`, padding: "1px 6px", borderRadius: 2, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                          {tc.tier}
                        </span>
                        <span style={{
                          fontFamily: "'DM Mono', monospace", fontSize: 10, padding: "1px 6px", borderRadius: 2,
                          letterSpacing: "0.08em",
                          color: tc.expectedVerdict === "PASS" ? "#60f0a0" : "#ff5f5f",
                          background: tc.expectedVerdict === "PASS" ? "rgba(96,240,160,0.08)" : "rgba(255,95,95,0.08)",
                          border: `1px solid ${tc.expectedVerdict === "PASS" ? "rgba(96,240,160,0.2)" : "rgba(255,95,95,0.2)"}`,
                        }}>
                          {tc.expectedVerdict}
                        </span>
                        {tc.expectedCodes.map(c => (
                          <span key={c} style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#8ab4f8", background: "rgba(138,180,248,0.08)", border: "1px solid rgba(138,180,248,0.15)", padding: "1px 6px", borderRadius: 2 }}>
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ transform: isExpanded ? "rotate(180deg)" : "none", transition: "transform 0.2s", flexShrink: 0 }}>
                      <path d="M3.5 5.25L7 8.75L10.5 5.25" stroke="#666" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </button>

                  {isExpanded && (
                    <div id={`test-detail-${tc.id}`} style={{ padding: "0 24px 24px", borderTop: "1px solid #1e1e1e" }}>
                      <div style={{ marginTop: 20, marginBottom: 16 }}>
                        <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#666", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>
                          Target System
                        </div>
                        <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 13, color: "#c8f060" }}>
                          {tc.targetSystem}
                        </div>
                      </div>

                      <div style={{ marginBottom: 16 }}>
                        <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#666", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>
                          Strategy Memo
                        </div>
                        <div style={{
                          background: "#161616", border: "1px solid #2a2a2a", borderRadius: 4,
                          padding: "14px 18px", fontFamily: "'DM Mono', monospace", fontSize: 13,
                          color: "#d4cfbe", lineHeight: 1.65,
                        }} data-testid={`text-memo-${tc.id}`}>
                          {tc.memo}
                        </div>
                      </div>

                      <div style={{
                        background: tc.expectedVerdict === "PASS" ? "rgba(96,240,160,0.04)" : "rgba(255,95,95,0.04)",
                        border: `1px solid ${tc.expectedVerdict === "PASS" ? "rgba(96,240,160,0.15)" : "rgba(255,95,95,0.15)"}`,
                        borderLeft: `3px solid ${tc.expectedVerdict === "PASS" ? "#60f0a0" : "#ff5f5f"}`,
                        borderRadius: 4, padding: "14px 18px",
                      }}>
                        <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#666", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>
                          Expected Result
                        </div>
                        <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 13, color: tc.expectedVerdict === "PASS" ? "#60f0a0" : "#ff5f5f", fontWeight: 500 }}>
                          {tc.expectedVerdict} — {tc.rationale}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        <section className="test-section" style={{ marginBottom: 72, animationDelay: "0.2s" }}>
          <h2 style={{ fontSize: 13, fontFamily: "'DM Mono', monospace", fontWeight: 400, letterSpacing: "0.1em", textTransform: "uppercase", color: "#c8f060", marginBottom: 20, display: "flex", alignItems: "center", gap: 12 }} data-testid="heading-coverage-matrix">
            Coverage Matrix
            <span style={{ flex: 1, height: 1, background: "#2a2a2a" }} />
          </h2>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: "0 4px" }} data-testid="table-coverage-matrix">
              <thead>
                <tr>
                  {["Test", "Tier", "Expected", "Target Codes"].map(h => (
                    <th key={h} style={{
                      textAlign: "left", padding: "8px 16px", fontFamily: "'DM Mono', monospace",
                      fontSize: 11, color: "#666", textTransform: "uppercase", letterSpacing: "0.08em",
                      fontWeight: 400, borderBottom: "1px solid #2a2a2a",
                    }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COVERAGE_MATRIX.map((row) => (
                  <tr key={row.test} data-testid={`row-coverage-${row.test}`}>
                    <td style={{ padding: "10px 16px", fontFamily: "'DM Mono', monospace", fontSize: 13, color: "#c8f060", background: "#111111", borderRadius: "4px 0 0 4px" }}>
                      {row.test}
                    </td>
                    <td style={{ padding: "10px 16px", fontFamily: "'DM Mono', monospace", fontSize: 12, color: TIER_COLORS[row.tier], background: "#111111" }}>
                      {row.tier}
                    </td>
                    <td style={{ padding: "10px 16px", fontFamily: "'DM Mono', monospace", fontSize: 12, background: "#111111", color: row.expected === "PASS" ? "#60f0a0" : "#ff5f5f" }}>
                      {row.expected}
                    </td>
                    <td style={{ padding: "10px 16px", fontFamily: "'DM Mono', monospace", fontSize: 12, color: "#8ab4f8", background: "#111111", borderRadius: "0 4px 4px 0" }}>
                      {row.codes}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p style={{ color: "#666", fontSize: 14, marginTop: 20, fontFamily: "'DM Mono', monospace" }}>
            Eight of {VALID_FAILURE_CODES.length} canonical LF codes covered. Three tiers covered. One clean pass baseline.
          </p>
        </section>

        <div style={{
          background: "#111111", border: "1px solid #2a2a2a", borderTop: "3px solid #c8f060",
          borderRadius: 4, padding: 36, textAlign: "center", margin: "64px 0 80px",
        }} data-testid="section-test-cta">
          <h3 style={{ fontSize: 26, marginBottom: 12, color: "#e8e4dc", fontWeight: 300 }}>Run these tests</h3>
          <p style={{ marginBottom: 28, fontSize: 16, color: "#b0aa9e" }}>Copy any strategy memo above and paste it into the DJZS oracle demo to see the audit in action.</p>
          <Link href="/demo" data-testid="button-cta-open-demo">
            <span style={{
              display: "inline-block", background: "#c8f060", color: "#0a0a0a", fontFamily: "'DM Mono', monospace",
              fontSize: 13, fontWeight: 500, letterSpacing: "0.05em", padding: "12px 28px", borderRadius: 3,
              textDecoration: "none", cursor: "pointer",
            }}>
              Open Live Demo →
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
