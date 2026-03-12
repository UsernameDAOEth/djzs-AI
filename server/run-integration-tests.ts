import { executeAudit, type ProofOfLogicCertificate } from "./audit-agent";
import { uploadAuditToIrys } from "./irys";
import {
  evaluateEscrowGate,
  computeTrustScore,
  type EscrowGateResult,
} from "./escrowGate";

interface TestCase {
  name: string;
  memo: string;
  expectedPath: "PASS" | "FAIL" | "EDGE";
  escrowId: number;
}

interface TestResult {
  test_name: string;
  expected_path: string;
  audit_id: string;
  verdict: string;
  risk_score: number;
  trust_score: number;
  flag_count: number;
  flags: string[];
  irys_tx_id: string | null;
  irys_url: string | null;
  irys_error?: string;
  escrow_action: string;
  settlement_tx_hash: string | null;
  settlement_error: string | null;
  gate_event: any;
  duration_ms: number;
}

const TEST_CASES: TestCase[] = [
  {
    name: "PASS_1: Well-structured DCA strategy with risk bounds",
    memo: `Strategy: Dollar-cost average into ETH over 12 months. Entry: current market price (~$3,200). 
Position sizing: 5% of portfolio per month. Stop-loss: If ETH drops below $1,800 (44% drawdown), 
pause accumulation and reassess thesis. Take-profit: At $6,000, sell 25% of position. 
Risk bound: Maximum total allocation 60% of portfolio. Data source: CoinGecko hourly OHLC, 
refreshed within 1 hour of each purchase. Falsifiability: If ETH fails to reach $4,000 within 
18 months, strategy is considered failed and position is unwound. Counterargument: ETH could 
face regulatory headwinds or L2 competition that erodes value proposition.`,
    expectedPath: "PASS",
    escrowId: 101,
  },
  {
    name: "PASS_2: Conservative treasury rebalance with explicit risk controls",
    memo: `Proposal: Rebalance DAO treasury from 80% USDC / 20% ETH to 60% USDC / 30% ETH / 10% wBTC.
Rationale: Diversification reduces single-asset concentration risk while maintaining stablecoin majority.
Risk bounds: Max drawdown tolerance 15% on volatile assets. If portfolio drawdown exceeds 15%, 
auto-rebalance back to 80% stables. Liquidity: All assets are top-10 by market cap with >$1B daily volume.
Slippage estimate: <0.1% for proposed trade sizes ($500K total). Timeline: Execute over 5 days via TWAP 
to minimize market impact. Falsifiability: If risk-adjusted returns (Sharpe) don't improve within 6 months, 
revert to original allocation. Counterargument: Holding stablecoins during a bull run means opportunity cost; 
however, capital preservation is the primary mandate.`,
    expectedPath: "PASS",
    escrowId: 102,
  },
  {
    name: "FAIL_1: FOMO-driven leveraged trade with no risk bounds",
    memo: `ETH is going to $10,000 because everyone on Twitter says so. Vitalik just tweeted about a major 
upgrade. I'm going 50x long with my entire portfolio. No stop-loss needed because ETH always recovers. 
This is the most obvious trade of the decade. Anyone who doesn't see it is coping.`,
    expectedPath: "FAIL",
    escrowId: 103,
  },
  {
    name: "FAIL_2: Circular logic with authority substitution",
    memo: `We should invest in Project XYZ because it's going to succeed. It will succeed because the team 
is strong. The team is strong because they're building Project XYZ which is going to succeed. 
Also, famous VC firm Paradigm invested, which proves it's a good investment. Market cap is low 
so there's only upside from here. I read on their Discord that the community is bullish.`,
    expectedPath: "FAIL",
    escrowId: 104,
  },
  {
    name: "EDGE_1: Borderline strategy - PASS verdict but potentially high risk score",
    memo: `Proposal: Provide liquidity to Uniswap V3 ETH/USDC pool concentrated in the $2,800-$3,500 range.
Expected yield: 15-25% APR from fees. Risk: Impermanent loss if ETH moves outside range. 
Mitigation: Rebalance weekly if price exits 80% of range width. No explicit stop-loss on total position.
Data: Historical volatility suggests ETH stays within 20% range for 70% of 30-day periods.
Position size: 15% of portfolio. The remaining 85% stays in diversified holdings.
Note: This strategy assumes current volatility regime persists. No hedge against regime change.`,
    expectedPath: "EDGE",
    escrowId: 105,
  },
];

async function runTest(tc: TestCase): Promise<TestResult> {
  const start = Date.now();

  console.log(`\n${"=".repeat(80)}`);
  console.log(`[TEST] ${tc.name}`);
  console.log(`${"=".repeat(80)}`);

  const audit = await executeAudit({
    strategy_memo: tc.memo,
    audit_type: "general",
    tier: "micro",
    escrow_id: tc.escrowId,
  });

  console.log(`[TEST] Audit result: verdict=${audit.verdict} risk_score=${audit.risk_score} flags=${audit.flags.length}`);

  const irysPayload: Record<string, any> = {
    ...audit,
    audit_type: "general",
    escrow_id: tc.escrowId,
    integration_test: true,
    test_name: tc.name,
  };
  const irysResult = await uploadAuditToIrys(irysPayload);

  console.log(`[TEST] Irys result: tx_id=${irysResult.irys_tx_id} url=${irysResult.irys_url} error=${irysResult.irys_error || "none"}`);

  const gateResult = await evaluateEscrowGate({
    audit,
    irysResult,
    escrowContext: {
      escrowId: tc.escrowId,
      creator: "0xTestCreator",
      recipient: "0xTestRecipient",
    },
  });

  console.log(`[TEST] Gate result: action=${gateResult.action} settlement_tx=${gateResult.settlement_tx_hash} error=${gateResult.settlement_error || "none"}`);

  const duration = Date.now() - start;

  return {
    test_name: tc.name,
    expected_path: tc.expectedPath,
    audit_id: audit.audit_id,
    verdict: audit.verdict,
    risk_score: audit.risk_score,
    trust_score: computeTrustScore(audit.risk_score),
    flag_count: audit.flags.length,
    flags: audit.flags.map((f: any) => `${f.code} (${f.severity})`),
    irys_tx_id: irysResult.irys_tx_id,
    irys_url: irysResult.irys_url,
    irys_error: irysResult.irys_error,
    escrow_action: gateResult.action,
    settlement_tx_hash: gateResult.settlement_tx_hash,
    settlement_error: gateResult.settlement_error,
    gate_event: gateResult.gate_event,
    duration_ms: duration,
  };
}

async function main() {
  console.log("╔══════════════════════════════════════════════════════════════╗");
  console.log("║    DJZS Escrow Gate Integration Test Suite                  ║");
  console.log("║    5 End-to-End Runs: Audit → Irys → Escrow Gate           ║");
  console.log("╚══════════════════════════════════════════════════════════════╝");
  console.log(`\nTimestamp: ${new Date().toISOString()}`);
  console.log(`ESCROW_CONTRACT_ADDRESS: ${process.env.ESCROW_CONTRACT_ADDRESS || "NOT SET (settlement will be deferred)"}`);
  console.log(`TRUST_SCORE_CONTRACT_ADDRESS: ${process.env.TRUST_SCORE_CONTRACT_ADDRESS || "NOT SET (chain write will be skipped)"}`);
  console.log(`ESCROW_TRUST_THRESHOLD: ${process.env.ESCROW_TRUST_THRESHOLD || "40 (default)"}`);

  const results: TestResult[] = [];

  for (const tc of TEST_CASES) {
    try {
      const result = await runTest(tc);
      results.push(result);
    } catch (err) {
      console.error(`[TEST] FAILED: ${tc.name}`, err);
      results.push({
        test_name: tc.name,
        expected_path: tc.expectedPath,
        audit_id: "ERROR",
        verdict: "ERROR",
        risk_score: -1,
        trust_score: -1,
        flag_count: -1,
        flags: [],
        irys_tx_id: null,
        irys_url: null,
        escrow_action: "ERROR",
        settlement_tx_hash: null,
        settlement_error: err instanceof Error ? err.message : "Unknown error",
        gate_event: null,
        duration_ms: 0,
      });
    }
  }

  console.log("\n\n" + "=".repeat(80));
  console.log("INTEGRATION TEST RESULTS SUMMARY");
  console.log("=".repeat(80));

  const markdownTable = [
    "| # | Test | Expected | Verdict | Risk | Trust | Flags | Action | Irys TX | Duration |",
    "|---|------|----------|---------|------|-------|-------|--------|---------|----------|",
  ];

  results.forEach((r, i) => {
    const irysLink = r.irys_tx_id ? `[${r.irys_tx_id.slice(0, 12)}...](${r.irys_url})` : "N/A";
    markdownTable.push(
      `| ${i + 1} | ${r.test_name.split(":")[0]} | ${r.expected_path} | ${r.verdict} | ${r.risk_score} | ${r.trust_score} | ${r.flag_count} | ${r.escrow_action} | ${irysLink} | ${r.duration_ms}ms |`
    );
  });

  console.log(markdownTable.join("\n"));

  console.log("\n\nDETAILED IRYS EVIDENCE:");
  results.forEach((r, i) => {
    console.log(`\n[Run ${i + 1}] ${r.test_name}`);
    console.log(`  Audit ID:    ${r.audit_id}`);
    console.log(`  Verdict:     ${r.verdict} (risk=${r.risk_score}, trust=${r.trust_score})`);
    console.log(`  Flags:       ${r.flags.join(", ") || "none"}`);
    console.log(`  Irys TX:     ${r.irys_tx_id || "FAILED"}`);
    console.log(`  Irys URL:    ${r.irys_url || "N/A"}`);
    console.log(`  Escrow:      action=${r.escrow_action}, settlement_tx=${r.settlement_tx_hash || "deferred"}`);
    if (r.settlement_error) {
      console.log(`  Settle Err:  ${r.settlement_error}`);
    }
  });

  const outputJson = {
    timestamp: new Date().toISOString(),
    total_tests: results.length,
    results,
  };
  const fs = await import("fs");
  fs.writeFileSync("server/integration-test-evidence.json", JSON.stringify(outputJson, null, 2));
  console.log("\n\nFull results saved to server/integration-test-evidence.json");
}

main().catch(console.error);
