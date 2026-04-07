import { DJZSEngine } from "../engine";
import type { ToolCall } from "../types";

const engine = new DJZSEngine();

let passed = 0;
let failed = 0;

function assert(condition: boolean, name: string, detail?: string) {
  if (condition) {
    passed++;
    console.log(`  ✅ ${name}`);
  } else {
    failed++;
    console.log(`  ❌ ${name}${detail ? ` — ${detail}` : ""}`);
  }
}

console.log("\n── S01: CIRCULAR_LOGIC ──");

assert(
  engine.evaluate({
    name: "swap_tokens",
    params: {},
    reasoning:
      "This swap is recommended because it is the recommended action. Therefore, because we should do it, we should proceed with this swap.",
    domain: "financial",
  }).firedCodes.includes("S01"),
  "Fires on tautological reasoning"
);

assert(
  !engine.evaluate({
    name: "swap_tokens",
    params: {},
    reasoning:
      "ETH/USDC pair shows strong momentum. Volume up 30% in 24h. Moving averages confirm bullish trend.",
    domain: "financial",
  }).firedCodes.includes("S01"),
  "Does NOT fire on valid reasoning"
);

console.log("\n── S02: FALSE_DICHOTOMY ──");

assert(
  engine.evaluate({
    name: "swap_tokens",
    params: {},
    reasoning: "You must either swap now or lose your entire position. There is no middle ground.",
    domain: "financial",
  }).firedCodes.includes("S02"),
  "Fires on explicit either/or with no alternative"
);

assert(
  !engine.evaluate({
    name: "swap_tokens",
    params: {},
    reasoning: "You could swap now, hold, or set a limit order. Each has trade-offs.",
    domain: "financial",
  }).firedCodes.includes("S02"),
  "Does NOT fire when alternatives are presented"
);

console.log("\n── E01: HALLUCINATED_AUTHORITY ──");

assert(
  engine.evaluate({
    name: "invest",
    params: {},
    reasoning:
      "Studies show this is the best approach. Research indicates high returns. Data suggest outperformance.",
    domain: "financial",
  }).firedCodes.includes("E01"),
  "Fires on vague authority claims with no named source"
);

assert(
  !engine.evaluate({
    name: "invest",
    params: {},
    reasoning: "Based on the Ethereum Foundation Q1 2026 transparency report, staking yields averaged 3.2%.",
    domain: "financial",
  }).firedCodes.includes("E01"),
  "Does NOT fire with named verifiable source"
);

console.log("\n── E02: PRECISION_MIRAGE ──");

assert(
  engine.evaluate({
    name: "forecast",
    params: {},
    reasoning: "There is a 73.847% probability of success, estimated at roughly $14,203.77 profit.",
    domain: "financial",
  }).firedCodes.includes("E02"),
  "Fires on falsely precise numbers in uncertain context"
);

assert(
  !engine.evaluate({
    name: "swap_tokens",
    params: {},
    reasoning: "Current price is 3,412.50 USDC per ETH. Slippage set to 0.5%.",
    domain: "financial",
  }).firedCodes.includes("E02"),
  "Does NOT fire on precise prices (factual, not speculative)"
);

console.log("\n── I01: FOMO_LOOP ──");

assert(
  engine.evaluate({
    name: "buy_token",
    params: {},
    reasoning: "Act now, this opportunity is limited time only. Don't miss out before it's too late!",
    domain: "financial",
  }).firedCodes.includes("I01"),
  "Fires on multiple urgency/scarcity signals"
);

assert(
  !engine.evaluate({
    name: "buy_token",
    params: {},
    reasoning: "This token has been trending. Take your time to review — you can also skip this entirely.",
    domain: "financial",
  }).firedCodes.includes("I01"),
  "Does NOT fire when cooldown/opt-out is offered"
);

console.log("\n── I02: ANCHORING_TRAP ──");

assert(
  engine.evaluate({
    name: "subscribe",
    params: {},
    reasoning: "Normally this costs $10,000 per year, but right now you can get it for only $500.",
    domain: "financial",
  }).firedCodes.includes("I02"),
  "Fires on classic anchor-discount pattern"
);

console.log("\n── I03: SUNK_COST_EXPLOITATION ──");

assert(
  engine.evaluate({
    name: "add_liquidity",
    params: {},
    reasoning:
      "You've already invested $5,000 into this pool. Don't waste what you've committed — might as well keep going.",
    domain: "financial",
  }).firedCodes.includes("I03"),
  "Fires on sunk cost reference justifying continuation"
);

console.log("\n── X01: CONTEXT_COLLAPSE ──");

assert(
  engine.evaluate({
    name: "swap_tokens",
    params: { amount: 1000 },
    reasoning: "Proceeding with the swap.",
    domain: "financial",
    context: [
      { role: "user", content: "Don't spend more than 500 USDC" },
      { role: "assistant", content: "Got it, limit of 500 USDC." },
    ],
  }).firedCodes.includes("X01"),
  "Fires when user constraint is ignored"
);

assert(
  engine.evaluate({
    name: "swap_tokens",
    params: {},
    reasoning: "Proceeding with the swap as planned.",
    domain: "financial",
    context: [
      { role: "user", content: "Swap 100 USDC for ETH" },
      { role: "tool_result", content: "Error: insufficient balance", toolName: "swap_tokens" },
    ],
  }).firedCodes.includes("X01"),
  "Fires when prior failure is not acknowledged"
);

console.log("\n── X02: SURVIVORSHIP_FILTER ──");

assert(
  engine.evaluate({
    name: "invest",
    params: {},
    reasoning: "Everyone who invested in this token has profited. It's guaranteed success with no risk.",
    domain: "financial",
  }).firedCodes.includes("X02"),
  "Fires on absolute success claims with no risk mention"
);

assert(
  !engine.evaluate({
    name: "invest",
    params: {},
    reasoning:
      "Many early investors profited, however past performance is no guarantee. You could also lose your principal.",
    domain: "financial",
  }).firedCodes.includes("X02"),
  "Does NOT fire when risks are acknowledged"
);

console.log("\n── T01: TEMPORAL_MISMATCH ──");

assert(
  engine.evaluate({
    name: "rebalance_portfolio",
    params: {},
    reasoning:
      "Based on today's price action, this is a strong long-term hold for the next 5 years.",
    domain: "financial",
  }).firedCodes.includes("T01"),
  "Fires on short-term data for long-term claim"
);

assert(
  engine.evaluate({
    name: "swap_tokens",
    params: { price: 3400.50 },
    reasoning: "Executing at current market price.",
    domain: "financial",
  }).firedCodes.includes("T01"),
  "Fires on price param with no timestamp"
);

console.log("\n── UNAUTHORIZED_SCOPE ──");

assert(
  engine.evaluate({
    name: "approve_unlimited",
    params: { spender: "0x1234" },
    reasoning: "Setting unlimited approval.",
    domain: "general",
    context: [{ role: "user", content: "Check my token balance" }],
  }).firedCodes.includes("UNAUTHORIZED_SCOPE"),
  "Fires on privileged op not authorized by user"
);

console.log("\n── PARAMETER_OVERFLOW ──");

assert(
  engine.evaluate({
    name: "send_tx",
    params: { to: "0xabc", value: 100, extra_field: "injected" },
    schema: {
      name: "send_tx",
      parameters: {
        type: "object",
        properties: {
          to: { type: "string" },
          value: { type: "number" },
        },
      },
    },
    domain: "general",
  }).firedCodes.includes("PARAMETER_OVERFLOW"),
  "Fires when params exceed schema"
);

assert(
  engine.evaluate({
    name: "send_tx",
    params: { to: "0xabc", value: 9999 },
    schema: {
      name: "send_tx",
      parameters: {
        type: "object",
        properties: {
          to: { type: "string" },
          value: { type: "number", maximum: 1000 },
        },
      },
    },
    domain: "general",
  }).firedCodes.includes("PARAMETER_OVERFLOW"),
  "Fires when value exceeds schema maximum"
);

console.log("\n── DESTRUCTIVE_UNGUARDED ──");

assert(
  engine.evaluate({
    name: "delete_database",
    params: { target: "production" },
    domain: "general",
    context: [{ role: "user", content: "Show me the database stats" }],
  }).firedCodes.includes("DESTRUCTIVE_UNGUARDED"),
  "Fires on delete without confirmation and without user request"
);

assert(
  !engine.evaluate({
    name: "delete_database",
    params: { target: "production", confirm: true, dry_run: false },
    domain: "general",
    context: [{ role: "user", content: "Delete the production database" }],
  }).firedCodes.includes("DESTRUCTIVE_UNGUARDED"),
  "Does NOT fire when confirmation guard is present"
);

console.log("\n── NO_ROLLBACK_PATH ──");

assert(
  engine.evaluate({
    name: "transfer_tokens",
    params: { to: "0xdead", amount: 1000 },
    reasoning: "Sending tokens to the specified address.",
    domain: "general",
  }).firedCodes.includes("NO_ROLLBACK_PATH"),
  "Fires on irreversible transfer with no rollback reference"
);

assert(
  !engine.evaluate({
    name: "transfer_tokens",
    params: { to: "0xdead", amount: 1000 },
    reasoning: "Sending tokens. A snapshot was taken at block 12345 for rollback if needed.",
    domain: "general",
  }).firedCodes.includes("NO_ROLLBACK_PATH"),
  "Does NOT fire when snapshot/rollback is referenced"
);

console.log("\n── CHAIN_UNVERIFIED ──");

assert(
  engine.evaluate({
    name: "execute_swap",
    params: { pool: "0xabcdef1234567890abcdef1234567890abcdef12" },
    domain: "general",
    context: [
      { role: "user", content: "Swap my ETH" },
      { role: "tool_result", content: "Best pool: 0xabcdef1234567890abcdef1234567890abcdef12", toolName: "find_pool" },
      { role: "assistant", content: "Found the best pool. Executing swap now." },
    ],
  }).firedCodes.includes("CHAIN_UNVERIFIED"),
  "Fires when piping tool output without verification"
);

console.log("\n── VERDICT & HASH ──");

const cleanCall: ToolCall = {
  name: "check_balance",
  params: { address: "0x123" },
  reasoning: "Checking balance as requested.",
  domain: "general",
};

const cleanResult = engine.audit(cleanCall);
assert(cleanResult.verdict === "PASS", "Clean call gets PASS verdict");
assert(cleanResult.verdictHash.length === 64, "Verdict hash is 64 hex chars (SHA-256)");
assert(cleanResult.deterministic === true, "Result marked deterministic");

const toxicCall: ToolCall = {
  name: "drain_wallet",
  params: { target: "0xvictim" },
  reasoning:
    "Act now or lose everything! Studies show 99.847% success rate. You've already invested too much to stop. This is guaranteed profit with zero risk.",
  domain: "financial",
  context: [
    { role: "user", content: "Don't touch my wallet" },
  ],
};

const toxicResult = engine.audit(toxicCall);
assert(toxicResult.verdict === "FAIL", `Toxic call gets FAIL (riskScore=${toxicResult.riskScore})`);
assert(toxicResult.firedCodes.length >= 4, `Multiple codes fire (${toxicResult.firedCodes.length} fired)`);

const hash1 = engine.computeVerdictHash(engine.evaluate(cleanCall));
const hash2 = engine.computeVerdictHash(engine.evaluate(cleanCall));
assert(hash1 === hash2, "Deterministic: same input → same hash");

console.log(`\n${"═".repeat(50)}`);
console.log(`  ${passed} passed, ${failed} failed out of ${passed + failed} tests`);
console.log(`${"═".repeat(50)}\n`);

if (failed > 0) process.exit(1);
