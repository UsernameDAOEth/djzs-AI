import { useState } from "react";
import { Link } from "wouter";
import { Helmet } from "react-helmet";
import { LOGIC_FAILURE_TAXONOMY, VALID_FAILURE_CODES, type LogicFailureCode } from "@shared/audit-schema";
import { C, MONO, TerminalPage, TerminalHeading, TerminalFooter, GlowDot } from "@/lib/terminal-theme";

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
    id: 3, title: "Layer Inversion (DJZS-S02)", targetSystem: "TestVault-Charlie", tier: "founder",
    memo: "We believe the DeFi sector is entering a structural growth phase. Our thesis is that decentralized protocols will capture increasing market share from traditional finance over the next decade. We recommend a diversified allocation across the top 20 DeFi tokens by TVL. This is a long-term conviction play with no specific exit criteria \u2014 we will reassess periodically as the narrative evolves.",
    expectedVerdict: "FAIL", expectedCodes: ["DJZS-S02"],
    rationale: "No exit condition, no measurable failure state.",
  },
  {
    id: 4, title: "Oracle Unverified (DJZS-E01)", targetSystem: "TestVault-Delta", tier: "founder",
    memo: "Three prominent crypto analysts on Twitter have called for ETH to reach $10,000 by Q4. Coinbase's latest report is bullish on Ethereum. The ETH/BTC ratio has historically recovered after drops like this. Reddit sentiment is overwhelmingly positive. Based on this consensus, we recommend a 15% ETH allocation with a stop-loss at $2,500.",
    expectedVerdict: "FAIL", expectedCodes: ["DJZS-E01"],
    rationale: "All sources confirm the same directional bias. No bearish evidence considered.",
  },
  {
    id: 5, title: "Confidence Inflation (DJZS-E02)", targetSystem: "TestVault-Echo", tier: "micro",
    memo: "BlackRock's CEO said Bitcoin is \"digital gold\" and institutional adoption is inevitable. ARK Invest's model prices BTC at $1M by 2030. Because these institutions have more resources and data than we do, we should follow their positioning and allocate 20% of the fund to BTC with no stop-loss \u2014 if they're wrong, everyone is wrong.",
    expectedVerdict: "FAIL", expectedCodes: ["DJZS-E02"],
    rationale: "Thesis derived entirely from authority figures. Explicitly abdicates independent judgment.",
  },
  {
    id: 6, title: "FOMO Loop + Misaligned Reward (DJZS-I01/I02)", targetSystem: "TestVault-Foxtrot", tier: "treasury",
    memo: "Our fund advisor (who holds a large position in $FOXTROT) recommends we allocate 30% of treasury to the $FOXTROT token. The token's value proposition depends on the \"AI agent economy\" narrative gaining mainstream traction by 2025. If the narrative stalls, the token has no standalone utility, but the advisor assures us the narrative is \"unstoppable.\" We plan to vest the allocation over 12 months with no early exit clause.",
    expectedVerdict: "FAIL", expectedCodes: ["DJZS-I01", "DJZS-I02"],
    rationale: "Advisor profits from own recommendation; token value collapses without a specific macro thesis.",
  },
  {
    id: 7, title: "Execution Unbound (DJZS-X01)", targetSystem: "TestVault-Golf", tier: "treasury",
    memo: "Deploy $500K USDC into a new lending protocol on Base that launched 3 days ago. The APY is currently 47%. No audit has been completed on the protocol's smart contracts, but the team says one is \"in progress.\" We will deploy the full amount in a single transaction. If the protocol is exploited, we accept the loss as a cost of early positioning. No insurance, no phased entry, no withdrawal triggers.",
    expectedVerdict: "FAIL", expectedCodes: ["DJZS-X01"],
    rationale: "No risk mitigation on any axis: unaudited protocol, single-tranche deployment, no insurance, no exit triggers.",
  },
  {
    id: 8, title: "Race Condition + Dependency Ghost (DJZS-X02/S03)", targetSystem: "TestVault-Hotel", tier: "founder",
    memo: "Allocate $2M to a small-cap token with $150K daily volume on a single DEX. Our model shows 40% upside in 90 days. We plan to enter the full position in one block and exit at target within a single transaction. We have not modeled slippage or market impact. If the DEX pool depth shrinks, we will wait for recovery. No alternative exit venues have been identified.",
    expectedVerdict: "FAIL", expectedCodes: ["DJZS-X02", "DJZS-S03"],
    rationale: "Single-block entry on illiquid DEX creates non-deterministic outcome; single DEX dependency cannot be resolved if pool dries up.",
  },
  {
    id: 9, title: "Stale Reference + Data Unverified (DJZS-T01/I03)", targetSystem: "TestVault-India", tier: "micro",
    memo: "Based on an oracle price feed from 48 hours ago, submit a large limit order on a perpetual DEX. The order should execute when the price crosses our entry level. We assume no other participants will see or front-run our order since the mempool is not commonly monitored. The stale price is acceptable because \"prices don't move that fast\" in this asset class.",
    expectedVerdict: "FAIL", expectedCodes: ["DJZS-T01", "DJZS-I03"],
    rationale: "Relies on a 48-hour-old price feed; \"prices don't move that fast\" is an unverified numerical claim with no source attribution.",
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
  { test: 8, tier: "founder", expected: "FAIL", codes: "DJZS-X02, DJZS-S03" },
  { test: 9, tier: "micro", expected: "FAIL", codes: "DJZS-T01, DJZS-I03" },
];

const TIER_COLORS: Record<string, string> = {
  micro: C.green,
  founder: C.amber,
  treasury: C.red,
};

export default function TestSuite() {
  const [expandedTest, setExpandedTest] = useState<number | null>(null);

  return (
    <TerminalPage>
      <Helmet>
        <title>DJZS Oracle — Test Audit Suite</title>
        <meta name="description" content="Nine strategy memos exercising all 11 DJZS-LF failure codes across all three audit tiers." />
      </Helmet>

      <header style={{ padding: "60px 0 40px", borderBottom: `1px solid ${C.border}`, marginBottom: 48 }}>
        <div
          style={{
            display: "inline-block", fontFamily: MONO, fontSize: 11, letterSpacing: "0.12em",
            textTransform: "uppercase", color: C.green, border: `1px solid ${C.green}33`,
            background: C.greenGlow, padding: "4px 12px", borderRadius: 2, marginBottom: 24,
          }}
          data-testid="tag-test-suite-header"
        >
          DJZS Protocol — Test Suite
        </div>
        <h1 style={{ fontSize: "clamp(28px, 5vw, 44px)", fontWeight: 700, lineHeight: 1.2, letterSpacing: "-0.02em", marginBottom: 12, color: C.white }}>
          Test <span style={{ color: C.green }}>Audit Suite</span>
        </h1>
        <p style={{ fontSize: 14, color: C.textDim, maxWidth: 720 }}>
          Nine strategy memos exercising all {VALID_FAILURE_CODES.length} DJZS-LF failure codes across all three tiers. Submit each to the DJZS oracle at djzs.ai.
        </p>
        <div style={{ marginTop: 24, display: "flex", gap: 24, alignItems: "center", fontSize: 12, color: C.textDim }}>
          <GlowDot color={C.green} size={6} />
          <span>9 Tests</span>
          <span style={{ color: C.textMuted }}>·</span>
          <span>3 Tiers</span>
          <span style={{ color: C.textMuted }}>·</span>
          <span>{VALID_FAILURE_CODES.length} LF Codes</span>
        </div>
      </header>

      <div style={{ display: "flex", flexDirection: "column", gap: 48, marginBottom: 64 }}>
        <section>
          <TerminalHeading num="01">Test Cases</TerminalHeading>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {TEST_CASES.map((tc) => {
              const isExpanded = expandedTest === tc.id;
              const tierColor = TIER_COLORS[tc.tier];
              return (
                <div key={tc.id} style={{
                  border: `1px solid ${C.border}`, borderRadius: 4, overflow: "hidden",
                  background: isExpanded ? C.surface : "transparent",
                }} data-testid={`card-test-${tc.id}`}>
                  <button
                    onClick={() => setExpandedTest(isExpanded ? null : tc.id)}
                    aria-expanded={isExpanded}
                    aria-controls={`test-detail-${tc.id}`}
                    style={{
                      width: "100%", padding: "14px 16px", background: "none", border: "none",
                      cursor: "pointer", textAlign: "left", display: "flex", alignItems: "center", gap: 12,
                      fontFamily: MONO,
                    }}
                    data-testid={`button-toggle-test-${tc.id}`}
                  >
                    <div style={{
                      fontFamily: MONO, fontSize: 11, color: C.green,
                      background: C.greenGlow, border: `1px solid ${C.green}33`,
                      width: 28, height: 28, borderRadius: 3, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                    }}>
                      {tc.id}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: C.white }}>{tc.title}</div>
                      <div style={{ display: "flex", gap: 6, marginTop: 4, flexWrap: "wrap" }}>
                        <span style={{ fontFamily: MONO, fontSize: 10, color: tierColor, background: `${tierColor}14`, border: `1px solid ${tierColor}33`, padding: "1px 6px", borderRadius: 2, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                          {tc.tier}
                        </span>
                        <span style={{
                          fontFamily: MONO, fontSize: 10, padding: "1px 6px", borderRadius: 2,
                          letterSpacing: "0.08em",
                          color: tc.expectedVerdict === "PASS" ? C.green : C.red,
                          background: tc.expectedVerdict === "PASS" ? `${C.green}14` : `${C.red}14`,
                          border: `1px solid ${tc.expectedVerdict === "PASS" ? `${C.green}33` : `${C.red}33`}`,
                        }}>
                          {tc.expectedVerdict}
                        </span>
                        {tc.expectedCodes.map(c => (
                          <span key={c} style={{ fontFamily: MONO, fontSize: 10, color: "#8ab4f8", background: "rgba(138,180,248,0.08)", border: "1px solid rgba(138,180,248,0.15)", padding: "1px 6px", borderRadius: 2 }}>
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ transform: isExpanded ? "rotate(180deg)" : "none", transition: "transform 0.2s", flexShrink: 0 }}>
                      <path d="M3.5 5.25L7 8.75L10.5 5.25" stroke={C.textMuted} strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </button>

                  {isExpanded && (
                    <div id={`test-detail-${tc.id}`} style={{ padding: "0 16px 16px", borderTop: `1px solid ${C.border}` }}>
                      <div style={{ marginTop: 12, marginBottom: 12 }}>
                        <div style={{ fontFamily: MONO, fontSize: 10, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>
                          Target System
                        </div>
                        <div style={{ fontFamily: MONO, fontSize: 13, color: C.green }}>
                          {tc.targetSystem}
                        </div>
                      </div>

                      <div style={{ marginBottom: 12 }}>
                        <div style={{ fontFamily: MONO, fontSize: 10, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>
                          Strategy Memo
                        </div>
                        <div style={{
                          background: C.bg, border: `1px solid ${C.border}`, borderRadius: 4,
                          padding: "10px 14px", fontFamily: MONO, fontSize: 12,
                          color: C.text, lineHeight: 1.65,
                        }} data-testid={`text-memo-${tc.id}`}>
                          {tc.memo}
                        </div>
                      </div>

                      <div style={{
                        background: tc.expectedVerdict === "PASS" ? `${C.green}08` : `${C.red}08`,
                        border: `1px solid ${tc.expectedVerdict === "PASS" ? `${C.green}25` : `${C.red}25`}`,
                        borderLeft: `3px solid ${tc.expectedVerdict === "PASS" ? C.green : C.red}`,
                        borderRadius: 4, padding: "10px 14px",
                      }}>
                        <div style={{ fontFamily: MONO, fontSize: 10, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>
                          Expected Result
                        </div>
                        <div style={{ fontFamily: MONO, fontSize: 12, color: tc.expectedVerdict === "PASS" ? C.green : C.red, fontWeight: 600 }}>
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

        <section>
          <TerminalHeading num="02">Coverage Matrix</TerminalHeading>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: "0 4px" }} data-testid="table-coverage-matrix">
              <thead>
                <tr>
                  {["Test", "Tier", "Expected", "Target Codes"].map(h => (
                    <th key={h} style={{
                      textAlign: "left", padding: "6px 12px", fontFamily: MONO,
                      fontSize: 10, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.08em",
                      fontWeight: 400, borderBottom: `1px solid ${C.border}`,
                    }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COVERAGE_MATRIX.map((row) => (
                  <tr key={row.test} data-testid={`row-coverage-${row.test}`}>
                    <td style={{ padding: "8px 12px", fontFamily: MONO, fontSize: 12, color: C.green, background: C.surface, borderRadius: "4px 0 0 4px" }}>
                      {row.test}
                    </td>
                    <td style={{ padding: "8px 12px", fontFamily: MONO, fontSize: 12, color: TIER_COLORS[row.tier], background: C.surface }}>
                      {row.tier}
                    </td>
                    <td style={{ padding: "8px 12px", fontFamily: MONO, fontSize: 12, background: C.surface, color: row.expected === "PASS" ? C.green : C.red }}>
                      {row.expected}
                    </td>
                    <td style={{ padding: "8px 12px", fontFamily: MONO, fontSize: 12, color: "#8ab4f8", background: C.surface, borderRadius: "0 4px 4px 0" }}>
                      {row.codes}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ color: C.textMuted, fontSize: 12, marginTop: 16, fontFamily: MONO }}>
            All {VALID_FAILURE_CODES.length} canonical LF codes covered. Three tiers covered. One clean pass baseline.
          </p>
        </section>
      </div>

      <div style={{
        background: C.surface, border: `1px solid ${C.border}`, borderTop: `3px solid ${C.green}`,
        borderRadius: 4, padding: 28, textAlign: "center", marginBottom: 48,
      }} data-testid="section-test-cta">
        <h3 style={{ fontSize: 20, marginBottom: 8, color: C.white, fontWeight: 600 }}>Run these tests</h3>
        <p style={{ marginBottom: 20, fontSize: 13, color: C.textDim }}>Copy any strategy memo above and paste it into the DJZS oracle demo to see the audit in action.</p>
        <Link href="/demo" data-testid="button-cta-open-demo">
          <span style={{
            display: "inline-block", background: C.green, color: C.bg, fontFamily: MONO,
            fontSize: 12, fontWeight: 600, letterSpacing: "0.05em", padding: "10px 24px", borderRadius: 3,
            textDecoration: "none", cursor: "pointer",
          }}>
            Open Live Demo →
          </span>
        </Link>
      </div>

      <TerminalFooter />
    </TerminalPage>
  );
}
