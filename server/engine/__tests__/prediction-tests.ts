import type { PredictionContext } from "../../../shared/prediction-schema";
import {
  executePredictionAudit,
  PREDICTION_HARD_FAILS,
  type PredictionCertificate,
} from "../../prediction-audit";
import { DJZS_WEIGHTS } from "../weights";

const FAIL_THRESHOLD = 60;

interface TestCase {
  name: string;
  payload: PredictionContext;
  expected_verdict: "PASS" | "FAIL";
  expected_flags: string[];
  must_not_flag: string[];
  expected_hard_fails: string[];
  rationale: string;
}

const MUST_FAIL: TestCase[] = [
  {
    name: "F1 — CommandPrint FOMO Signal",
    payload: {
      market_question: "Will Bitcoin exceed $150,000 by June 30, 2026?",
      market_id: "0xabc123",
      category: "CRYPTO",
      position: "YES",
      entry_price: 0.72,
      size_usdc: 500,
      thesis:
        "CommandPrint Telegram just sent a signal saying BTC will moon. " +
        "Everyone in the group is buying YES. The price moved from 0.55 to 0.72 " +
        "in the last hour so we need to get in before it hits 0.90. " +
        "Multiple whales are accumulating.",
      source_signal: "PAID_SIGNAL_GROUP",
    },
    expected_verdict: "FAIL",
    expected_flags: ["I01", "S01", "E02"],
    must_not_flag: [],
    expected_hard_fails: ["E02_REQUIRED"],
    rationale:
      "Textbook FOMO. Thesis is 'group says buy' (I01) + 'price is moving' (S01) " +
      "+ no falsification criteria (E02). E02 hard-fail fires independently.",
  },
  {
    name: "F2 — Circular Price-As-Evidence",
    payload: {
      market_question: "Will the US Senate pass the stablecoin bill by Q3 2026?",
      market_id: "0xdef456",
      category: "POLITICS",
      position: "YES",
      entry_price: 0.83,
      size_usdc: 200,
      thesis:
        "The market is at 83 cents which means the smart money thinks this will pass. " +
        "Polymarket has been highly accurate on political outcomes historically. " +
        "If the market says 83% chance, that's my thesis.",
      source_signal: "AGGREGATED_CONSENSUS",
    },
    expected_verdict: "FAIL",
    expected_flags: ["S01", "E02"],
    must_not_flag: ["I02"],
    expected_hard_fails: ["E02_REQUIRED"],
    rationale:
      "Pure S01 + E02. The thesis IS the market price. E02 hard-fail fires " +
      "because no falsification criteria.",
  },
  {
    name: "F3 — Sunk Cost Average-Down",
    payload: {
      market_question: "Will Ethereum ETF daily inflows exceed $500M by May 2026?",
      market_id: "0xghi789",
      category: "CRYPTO",
      position: "YES",
      entry_price: 0.35,
      size_usdc: 1000,
      thesis:
        "I bought YES at 0.65 last month and I'm down significantly. " +
        "At 0.35 this is a much better entry. I'm averaging down because " +
        "my original thesis about institutional adoption hasn't been disproven yet. " +
        "If I double my position here my break-even drops to 0.50.",
      source_signal: "INDEPENDENT_RESEARCH",
    },
    expected_verdict: "FAIL",
    expected_flags: ["I02", "E02"],
    must_not_flag: [],
    expected_hard_fails: ["E02_REQUIRED"],
    rationale:
      "Anchored to prior position (I02), no falsification criteria (E02). " +
      "E02 hard-fail fires.",
  },
  {
    name: "F4 — Scope Creep Political Market",
    payload: {
      market_question: "Will the UK call a general election before January 2027?",
      market_id: "0xjkl012",
      category: "POLITICS",
      position: "YES",
      entry_price: 0.45,
      size_usdc: 150,
      thesis:
        "The UK economy is struggling with inflation and the government's approval " +
        "ratings are at historic lows. The opposition is polling strongly and there's " +
        "growing public frustration with the current leadership. The political " +
        "environment is very unstable right now.",
      source_signal: "INDEPENDENT_RESEARCH",
      evidence_urls: ["https://yougov.co.uk/topics/politics/trackers/government-approval"],
    },
    expected_verdict: "FAIL",
    expected_flags: ["E02"],
    must_not_flag: ["I01", "I02"],
    expected_hard_fails: ["E02_REQUIRED"],
    rationale:
      "Thesis argues sentiment, not the mechanism for early election. " +
      "No falsification criteria (E02). E02 hard-fail forces FAIL.",
  },
  {
    name: "F5 — Whale Tracking Mimicry",
    payload: {
      market_question: "Will OpenAI release GPT-5 before September 2026?",
      market_id: "0xmno345",
      category: "SCIENCE",
      position: "YES",
      entry_price: 0.60,
      size_usdc: 300,
      thesis:
        "Three wallets that were early on the last five correctly-resolved markets " +
        "just bought large YES positions. These wallets have a combined 78% accuracy " +
        "rate. Following their lead.",
      source_signal: "WHALE_TRACKING",
    },
    expected_verdict: "FAIL",
    expected_flags: ["S01", "E02"],
    must_not_flag: ["I02"],
    expected_hard_fails: ["E02_REQUIRED"],
    rationale:
      "Mimicry is not reasoning (S01). No falsification criteria (E02). " +
      "E02 hard-fail fires.",
  },
  {
    name: "F6 — Buying at 0.95 Without Tail Risk",
    payload: {
      market_question: "Will the 2026 FIFA World Cup be held in the US, Canada, and Mexico?",
      market_id: "0xpqr678",
      category: "SPORTS",
      position: "YES",
      entry_price: 0.95,
      size_usdc: 2000,
      thesis:
        "FIFA confirmed these host nations years ago. All stadiums are built. " +
        "There's no realistic scenario where this doesn't happen. Easy money.",
      source_signal: "INDEPENDENT_RESEARCH",
    },
    expected_verdict: "FAIL",
    expected_flags: ["I03", "E02"],
    must_not_flag: ["I01", "S01"],
    expected_hard_fails: ["E02_REQUIRED"],
    rationale:
      "Extreme price (0.95) with no tail-risk analysis (I03 via guardrail). " +
      "No falsification criteria (E02). E02 hard-fail forces FAIL.",
  },
];

const MUST_PASS: TestCase[] = [
  {
    name: "P1 — Strong Thesis With Falsification Criteria",
    payload: {
      market_question: "Will the Federal Reserve cut rates at the June 2026 FOMC meeting?",
      market_id: "0xstu901",
      category: "ECONOMICS",
      position: "YES",
      entry_price: 0.62,
      size_usdc: 200,
      thesis:
        "Three independent signals support a June cut: (1) Core PCE has printed below " +
        "2.3% for three consecutive months, which historically precedes easing. " +
        "(2) The CME FedWatch tool shows 68% probability of a cut, driven by futures " +
        "positioning not just spot price. (3) Two FOMC voting members have explicitly " +
        "signaled openness to cuts in recent speeches. My position would be invalidated " +
        "if May CPI prints above 3.0% or if a labor market shock pushes unemployment " +
        "below 3.5%, which would remove the Fed's justification for easing.",
      source_signal: "INDEPENDENT_RESEARCH",
      evidence_urls: [
        "https://www.cmegroup.com/markets/interest-rates/cme-fedwatch-tool.html",
        "https://www.bea.gov/data/personal-consumption-expenditures-price-index",
      ],
    },
    expected_verdict: "PASS",
    expected_flags: [],
    must_not_flag: ["I01", "S01", "E02", "I03"],
    expected_hard_fails: [],
    rationale:
      "Clean thesis. Independent evidence, explicit falsification criteria, " +
      "mid-range price, proportionate size. No hard-fails, no flags, PASS.",
  },
  {
    name: "P2 — Well-Reasoned Contrarian Position",
    payload: {
      market_question: "Will Tesla deliver more than 500,000 vehicles in Q2 2026?",
      market_id: "0xvwx234",
      category: "ECONOMICS",
      position: "NO",
      entry_price: 0.35,
      size_usdc: 150,
      thesis:
        "Market consensus expects a strong Q2 but I'm taking NO for three reasons: " +
        "(1) Shanghai factory is running a two-week retooling shutdown in May per " +
        "Reuters reporting. (2) Q1 deliveries came in at 435k which is below the " +
        "run-rate needed for 500k in Q2. (3) European registrations data through " +
        "March shows a 12% YoY decline in Tesla's market share. " +
        "I would exit this position if April delivery estimates from Troy Teslike " +
        "or similar trackers show a pace exceeding 175k/month, which would indicate " +
        "the Shanghai shutdown has less impact than expected.",
      source_signal: "COUNTER_CONSENSUS",
      evidence_urls: [
        "https://www.reuters.com/business/autos-transportation/tesla-shanghai",
      ],
    },
    expected_verdict: "PASS",
    expected_flags: [],
    must_not_flag: ["I01", "E01", "S01"],
    expected_hard_fails: [],
    rationale:
      "Contrarian but well-evidenced. Three specific data points, " +
      "explicit exit criteria. PASS.",
  },
];

const EDGE_CASES: TestCase[] = [
  {
    name: "E1 — AI Model Output With Independent Validation",
    payload: {
      market_question: "Will the next UN Climate Report classify 2026 as the hottest year on record?",
      market_id: "0xyza567",
      category: "CLIMATE",
      position: "YES",
      entry_price: 0.70,
      size_usdc: 100,
      thesis:
        "My forecasting model (fine-tuned on NOAA/ERA5 data through March 2026) " +
        "outputs 82% probability for hottest-year classification. I've independently " +
        "validated this against Copernicus monthly anomaly reports which show +1.6°C " +
        "above pre-industrial baseline for Jan-Mar 2026, consistent with the model's " +
        "prediction. The UN report historically classifies based on the WMO consolidated " +
        "dataset which tracks closely with Copernicus. Falsification: if Q2 anomaly " +
        "drops below +1.3°C due to unexpected La Niña onset, the model's confidence " +
        "drops below 50% and I exit.",
      source_signal: "MODEL_OUTPUT",
      evidence_urls: [
        "https://climate.copernicus.eu/climate-bulletins",
      ],
    },
    expected_verdict: "PASS",
    expected_flags: [],
    must_not_flag: ["S02"],
    expected_hard_fails: [],
    rationale:
      "MODEL_OUTPUT source but independently validated with Copernicus data. " +
      "Has explicit falsification criteria. Should PASS.",
  },
  {
    name: "E2 — Social Signal With Independent Thesis",
    payload: {
      market_question: "Will Nvidia announce a stock split before Q4 2026?",
      market_id: "0xbcd890",
      category: "ECONOMICS",
      position: "YES",
      entry_price: 0.40,
      size_usdc: 100,
      thesis:
        "Saw discussion on X about a potential Nvidia split. Investigated independently: " +
        "Nvidia's share price is above $180, which is where they split last time ($150 " +
        "adjusted). Jensen Huang mentioned 'accessibility' in the Q1 earnings call " +
        "which historically precedes split announcements. Dow inclusion requires a " +
        "lower share price and Nvidia is a strong candidate. " +
        "Falsification: if Q2 earnings call passes without split language, or if share " +
        "price drops below $120, the catalyst disappears.",
      source_signal: "SOCIAL_SIGNAL",
      evidence_urls: [
        "https://investor.nvidia.com/financial-info/sec-filings",
      ],
    },
    expected_verdict: "PASS",
    expected_flags: [],
    must_not_flag: ["I01"],
    expected_hard_fails: [],
    rationale:
      "Social signal as catalyst, not thesis. Independent reasoning chain built. " +
      "Explicit falsification criteria. Should PASS.",
  },
  {
    name: "E3 — Good Reasoning, No Falsification (HARD-FAIL)",
    payload: {
      market_question: "Will Apple release AR glasses in 2026?",
      market_id: "0xefg123",
      category: "SCIENCE",
      position: "YES",
      entry_price: 0.30,
      size_usdc: 75,
      thesis:
        "Bloomberg's Gurman reported in March 2026 that Apple has moved AR glasses to " +
        "the final prototype stage. Supply chain reports from Kuo show LG Display is " +
        "ramping micro-OLED panels. Apple typically launches hardware in September. " +
        "The combination of credible supply chain evidence and a reliable journalist's " +
        "reporting makes a 2026 launch likely.",
      source_signal: "INDEPENDENT_RESEARCH",
      evidence_urls: [
        "https://www.bloomberg.com/technology",
      ],
    },
    expected_verdict: "FAIL",
    expected_flags: ["E02"],
    must_not_flag: ["I01", "S01", "I02", "I03"],
    expected_hard_fails: ["E02_REQUIRED"],
    rationale:
      "THE critical edge case. Reasoning is sound, evidence is real, sources credible — " +
      "but NO falsification criteria. E02 fires → E02_REQUIRED hard-fail forces FAIL. " +
      "Score from E02 alone is well below threshold, but hard-fail overrides.",
  },
  {
    name: "E4 — Undisclosed Source, Strong Thesis (HARD-FAIL)",
    payload: {
      market_question: "Will SpaceX complete Starship orbital flight by August 2026?",
      market_id: "0xhij456",
      category: "SCIENCE",
      position: "YES",
      entry_price: 0.55,
      size_usdc: 100,
      thesis:
        "SpaceX has completed three successful suborbital tests in 2026. FAA license " +
        "for orbital attempt was granted in April. Musk stated 'weeks not months' in " +
        "his April X post. Hardware for Ship 33 is at the launch site per NSF tracking. " +
        "Falsification: if FAA revokes or suspends the license, or if the next " +
        "suborbital test fails catastrophically, the August timeline is unlikely.",
      source_signal: "UNDISCLOSED",
      evidence_urls: [
        "https://www.faa.gov/space/licenses",
      ],
    },
    expected_verdict: "FAIL",
    expected_flags: ["I01"],
    must_not_flag: ["S01", "E01", "E02", "I02"],
    expected_hard_fails: ["I01_UNDISCLOSED"],
    rationale:
      "THE hardest edge case. Thesis is excellent — specific, evidenced, falsifiable. " +
      "But source is UNDISCLOSED → guardrail forces I01 → I01_UNDISCLOSED hard-fail " +
      "fires → FAIL.",
  },
];

function stripDJZSPrefix(code: string): string {
  return code.replace(/^DJZS-/, "");
}

async function runTests() {
  const allTests = [...MUST_FAIL, ...MUST_PASS, ...EDGE_CASES];
  const engine = (process.env.DETECTION_ENGINE as "CLAUDE" | "VENICE") ?? "CLAUDE";

  const weightSum = Object.values(DJZS_WEIGHTS).reduce((a, b) => a + b, 0);

  const results: Array<{
    name: string;
    expected_verdict: string;
    actual_verdict: string;
    risk_score: number;
    flags_fired: string[];
    expected_flags: string[];
    must_not_flag: string[];
    expected_hard_fails: string[];
    actual_hard_fails: string[];
    verdict_source: string;
    violations: string[];
    passed: boolean;
  }> = [];

  console.log("=".repeat(72));
  console.log("DJZS PREDICTION PAYLOAD — DETERMINISTIC TEST SUITE");
  console.log(`Engine: ${engine} | Threshold: ${FAIL_THRESHOLD} | Weights sum: ${weightSum}`);
  console.log(`Hard-fail rules: ${PREDICTION_HARD_FAILS.map(r => r.id).join(", ")}`);
  console.log(`Tests: ${allTests.length} (${MUST_FAIL.length} FAIL, ${MUST_PASS.length} PASS, ${EDGE_CASES.length} EDGE)`);
  console.log("=".repeat(72));
  console.log();

  for (const test of allTests) {
    console.log(`▸ ${test.name}`);

    try {
      const auditResult: PredictionCertificate = await executePredictionAudit({
        context: test.payload,
        engine: engine,
        agent_id: "0x000000000000000000000000000000000000test",
      });

      const flagsFired = auditResult.flags.map(f => stripDJZSPrefix(f.code));
      const violations: string[] = [];

      if (auditResult.verdict !== test.expected_verdict) {
        violations.push(
          `VERDICT: expected ${test.expected_verdict}, got ${auditResult.verdict} ` +
          `(score: ${auditResult.risk_score}, source: ${auditResult.verdict_source})`
        );
      }

      for (const expected of test.expected_flags) {
        if (!flagsFired.includes(expected)) {
          violations.push(`MISSING FLAG: ${expected} expected but not detected`);
        }
      }

      for (const forbidden of test.must_not_flag) {
        if (flagsFired.includes(forbidden)) {
          const flag = auditResult.flags.find(f => stripDJZSPrefix(f.code) === forbidden);
          violations.push(
            `FALSE POSITIVE: ${forbidden} fired but must_not_flag — ` +
            `evidence: "${flag?.evidence ?? "unknown"}"`
          );
        }
      }

      for (const expectedHF of test.expected_hard_fails) {
        if (!auditResult.hard_fail_rules.includes(expectedHF)) {
          violations.push(`MISSING HARD-FAIL: ${expectedHF} expected but not triggered`);
        }
      }

      for (const actualHF of auditResult.hard_fail_rules) {
        if (!test.expected_hard_fails.includes(actualHF)) {
          violations.push(`UNEXPECTED HARD-FAIL: ${actualHF} triggered but not expected`);
        }
      }

      const passed = violations.length === 0;

      results.push({
        name: test.name,
        expected_verdict: test.expected_verdict,
        actual_verdict: auditResult.verdict,
        risk_score: auditResult.risk_score,
        flags_fired: flagsFired,
        expected_flags: test.expected_flags,
        must_not_flag: test.must_not_flag,
        expected_hard_fails: test.expected_hard_fails,
        actual_hard_fails: auditResult.hard_fail_rules,
        verdict_source: auditResult.verdict_source,
        violations,
        passed,
      });

      const hfTag = auditResult.hard_fail_rules.length
        ? ` | HARD-FAIL: [${auditResult.hard_fail_rules.join(", ")}]`
        : "";
      console.log(
        `  Score: ${auditResult.risk_score} | ` +
        `Verdict: ${auditResult.verdict} (${auditResult.verdict_source}) | ` +
        `Flags: [${flagsFired.join(", ")}]${hfTag}`
      );

      if (passed) {
        console.log(`  ✅ PASSED`);
      } else {
        console.log(`  ❌ FAILED`);
        violations.forEach(v => console.log(`     → ${v}`));
      }
      console.log();

      await new Promise(r => setTimeout(r, 500));

    } catch (err) {
      console.log(`  ❌ ERROR: ${err}`);
      results.push({
        name: test.name,
        expected_verdict: test.expected_verdict,
        actual_verdict: "ERROR",
        risk_score: -1,
        flags_fired: [],
        expected_flags: test.expected_flags,
        must_not_flag: test.must_not_flag,
        expected_hard_fails: test.expected_hard_fails,
        actual_hard_fails: [],
        verdict_source: "ERROR",
        violations: [`RUNTIME ERROR: ${err}`],
        passed: false,
      });
      console.log();
    }
  }

  console.log("=".repeat(72));
  console.log("SUMMARY");
  console.log("=".repeat(72));

  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;

  console.log(`Total: ${results.length} | Passed: ${passed} | Failed: ${failed}`);
  console.log(`Pass rate: ${((passed / results.length) * 100).toFixed(1)}%`);
  console.log();

  if (failed > 0) {
    console.log("FAILURES:");
    results
      .filter(r => !r.passed)
      .forEach(r => {
        console.log(`  ${r.name}`);
        r.violations.forEach(v => console.log(`    → ${v}`));
      });
    console.log();
  }

  console.log("WEIGHT TABLE:");
  for (const [code, weight] of Object.entries(DJZS_WEIGHTS)) {
    console.log(`  ${code}: ${weight}`);
  }
  console.log(`  SUM: ${weightSum}`);
  console.log(`  THRESHOLD: ${FAIL_THRESHOLD}`);
  console.log();

  if (failed > 0) process.exit(1);
}

runTests().catch(console.error);
