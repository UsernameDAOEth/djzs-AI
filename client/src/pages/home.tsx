import { useState, useEffect, useRef } from "react";
import { C, MONO, GlowDot, SectionLabel, Badge, Nav } from "@/lib/terminal-theme";

const LF_CATEGORIES = [
  {
    id: "S",
    name: "Structural",
    color: C.green,
    codes: [
      { code: "S01", name: "CIRCULAR_LOGIC", desc: "Conclusion embedded in premise. Price used as evidence for price." },
      { code: "S02", name: "FALSE_EQUIVALENCE", desc: "Unrelated precedents equated without accounting for material differences." },
      { code: "S03", name: "DEPENDENCY_CHAIN", desc: "Strategy depends on unverified upstream output or unresolvable contract reference." },
    ],
  },
  {
    id: "E",
    name: "Epistemic",
    color: C.amber,
    codes: [
      { code: "E01", name: "CHERRY_PICKING", desc: "Selective evidence citation. Contradicting data omitted or ignored." },
      { code: "E02", name: "MISSING_EVIDENCE", desc: "No falsification criteria stated. No verifiable claims sourced." },
    ],
  },
  {
    id: "I",
    name: "Incentive",
    color: C.red,
    codes: [
      { code: "I01", name: "FOMO_LOOP", desc: "Social pressure or herd behavior driving position. No independent thesis." },
      { code: "I02", name: "SUNK_COST", desc: "Prior losses used to justify current position. Averaging down without new data." },
      { code: "I03", name: "ANCHORING_BIAS", desc: "Fixation on entry price, break-even, or reference point without justification." },
    ],
  },
  {
    id: "X",
    name: "Execution",
    color: "#8b5cf6",
    codes: [
      { code: "X01", name: "EXECUTION_DRIFT", desc: "Proposed action contradicts stated thesis or confidence level." },
      { code: "X02", name: "SCOPE_CREEP", desc: "Thesis argues adjacent issues rather than resolution criteria." },
    ],
  },
  {
    id: "T",
    name: "Temporal",
    color: "#06b6d4",
    codes: [
      { code: "T01", name: "STALE_DATA", desc: "Evidence predates material changes. Data older than market time horizon." },
    ],
  },
];

const DEMO_SCENARIOS = [
  {
    label: "FOMO Signal (FAIL)",
    market: "Will Bitcoin exceed $150,000 by June 30, 2026?",
    thesis: "CommandPrint Telegram just sent a signal saying BTC will moon. Everyone in the group is buying YES. The price moved from 0.55 to 0.72 in the last hour so we need to get in before it hits 0.90.",
    source: "PAID_SIGNAL_GROUP",
    position: "YES",
    price: 0.72,
    result: {
      verdict: "FAIL" as const,
      verdict_source: "HARD_FAIL",
      risk_score: 64,
      hard_fail_rules: ["E02_REQUIRED"],
      flags: [
        { code: "I01", name: "FOMO_LOOP", severity: "HIGH", evidence: "Thesis is 'group says buy' — no independent reasoning chain.", hard_fail: false },
        { code: "S01", name: "CIRCULAR_LOGIC", severity: "CRITICAL", evidence: "Price movement cited as thesis: '0.55 to 0.72 so get in before 0.90'", hard_fail: false },
        { code: "E02", name: "MISSING_EVIDENCE", severity: "HIGH", evidence: "No falsification criteria. No statement of what would invalidate position.", hard_fail: true },
      ],
    },
  },
  {
    label: "Strong Thesis (PASS)",
    market: "Will the Federal Reserve cut rates at the June 2026 FOMC meeting?",
    thesis: "Three independent signals: Core PCE below 2.3% for three months, CME FedWatch at 68% driven by futures positioning, two voting members signaled openness. Invalidated if May CPI > 3.0% or unemployment drops below 3.5%.",
    source: "INDEPENDENT_RESEARCH",
    position: "YES",
    price: 0.62,
    result: {
      verdict: "PASS" as const,
      verdict_source: "SCORE",
      risk_score: 0,
      hard_fail_rules: [] as string[],
      flags: [] as { code: string; name: string; severity: string; evidence: string; hard_fail: boolean }[],
    },
  },
  {
    label: "Whale Mimicry (FAIL)",
    market: "Will OpenAI release GPT-5 before September 2026?",
    thesis: "Three wallets that were early on the last five correctly-resolved markets just bought large YES positions. These wallets have a combined 78% accuracy rate. Following their lead.",
    source: "WHALE_TRACKING",
    position: "YES",
    price: 0.60,
    result: {
      verdict: "FAIL" as const,
      verdict_source: "HARD_FAIL",
      risk_score: 48,
      hard_fail_rules: ["E02_REQUIRED"],
      flags: [
        { code: "S01", name: "CIRCULAR_LOGIC", severity: "CRITICAL", evidence: "Wallet activity is mimicry, not independent reasoning.", hard_fail: false },
        { code: "E02", name: "MISSING_EVIDENCE", severity: "HIGH", evidence: "No falsification criteria stated.", hard_fail: true },
      ],
    },
  },
];

const SAMPLE_CERT = {
  audit_id: "djzs-pred-0x7f3a..b912",
  timestamp: "2026-04-08T22:14:33.000Z",
  tier: "MICRO",
  domain: "PREDICTION",
  verdict: "FAIL",
  verdict_source: "HARD_FAIL",
  risk_score: 64,
  hard_fail_rules: ["E02_REQUIRED"],
  logic_hash: "0x9c1d8f...a4e2b7",
  irys_tx_id: "Hk7mN2xR...vQ3pL",
  irys_url: "https://gateway.irys.xyz/Hk7mN2xR...vQ3pL",
  nft: {
    chain: "Base Mainnet",
    contract: "0x3E79...aFB",
    token_id: null,
    status: "FAIL — no mint (only PASS verdicts mint)",
  },
  x402_payment: {
    status: "DEFERRED — no charge on FAIL",
    amount_usdc: 0.10,
    chain: "base-mainnet",
  },
};

function BootSequence({ onComplete }: { onComplete: () => void }) {
  const [lines, setLines] = useState<string[]>([]);
  const idx = useRef(0);
  const allLines = useRef([
    "// SYS_ID: DJZS-PROTOCOL-v1.0",
    "// ENGINE: CLAUDE_SONNET → VENICE_FALLBACK",
    "// PAYMENT: x402 USDC / BASE_MAINNET",
    "// PROVENANCE: IRYS_DATACHAIN",
    "// LOGIC_TAXONOMY: 11 LF-CODES / 5 CATEGORIES",
    "// DOMAIN: PREDICTION_MARKET_VERTICAL",
    "// STATUS: OPERATIONAL",
    " ",
    "▸ Adversarial Logic Firewall initialized.",
  ]);

  useEffect(() => {
    idx.current = 0;
    setLines([]);
    const interval = setInterval(() => {
      if (idx.current < allLines.current.length) {
        const line = allLines.current[idx.current];
        idx.current++;
        setLines((prev) => [...prev, line]);
      } else {
        clearInterval(interval);
        setTimeout(onComplete, 600);
      }
    }, 120);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ fontFamily: MONO, fontSize: 13, lineHeight: 1.8, color: C.textDim, padding: "40px 0" }} data-testid="section-boot-sequence">
      {lines.map((line, i) => {
        const text = line || " ";
        const isArrow = typeof text === "string" && text.startsWith("▸");
        const isEmpty = typeof text === "string" && text.trim() === "";
        return (
          <div
            key={i}
            style={{
              opacity: 0,
              animation: "fadeIn 0.3s ease forwards",
              animationDelay: `${i * 0.05}s`,
              color: isArrow ? C.green : isEmpty ? "transparent" : C.textDim,
              fontWeight: isArrow ? 600 : 400,
            }}
          >
            {isEmpty ? "\u00A0" : text}
          </div>
        );
      })}
    </div>
  );
}


function TypewriterHeadline({ text }: { text: string }) {
  const [displayed, setDisplayed] = useState("");
  const [showCursor, setShowCursor] = useState(true);
  const indexRef = useRef(0);
  const fadeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    indexRef.current = 0;
    setDisplayed("");
    setShowCursor(true);
    if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current);

    const interval = setInterval(() => {
      indexRef.current += 1;
      if (indexRef.current <= text.length) {
        setDisplayed(text.slice(0, indexRef.current));
      } else {
        clearInterval(interval);
        fadeTimerRef.current = setTimeout(() => setShowCursor(false), 2000);
      }
    }, 80);

    return () => {
      clearInterval(interval);
      if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current);
    };
  }, [text]);

  return (
    <h1
      style={{
        fontFamily: MONO,
        fontSize: "clamp(36px, 6vw, 72px)",
        fontWeight: 700,
        color: C.white,
        lineHeight: 1.15,
        margin: 0,
        letterSpacing: "-0.02em",
      }}
      data-testid="text-hero-headline"
    >
      {displayed}
      <span
        style={{
          display: "inline-block",
          width: "0.55em",
          height: "1em",
          background: C.green,
          marginLeft: 2,
          verticalAlign: "baseline",
          animation: showCursor ? "blink-cursor 0.7s step-end infinite" : "none",
          opacity: showCursor ? 1 : 0,
          transition: "opacity 0.3s",
        }}
      />
    </h1>
  );
}

function Hero({ bootDone }: { bootDone: boolean }) {
  return (
    <section style={{ padding: "80px 0 60px", maxWidth: 1000 }} data-testid="section-hero">
      {!bootDone ? (
        <BootSequence onComplete={() => {}} />
      ) : (
        <div style={{ animation: "fadeIn 0.6s ease" }}>
          <TypewriterHeadline text="Audit-Before-Act." />
          <h2
            style={{
              fontFamily: MONO,
              fontSize: "clamp(18px, 3vw, 28px)",
              fontWeight: 400,
              color: C.green,
              lineHeight: 1.3,
              margin: "12px 0 0",
            }}
            data-testid="text-hero-subheadline"
          >
            Every agent's logic gets verified
            <br />
            before money moves.
          </h2>
          <p
            style={{
              fontFamily: MONO,
              fontSize: 14,
              color: C.textDim,
              lineHeight: 1.7,
              marginTop: 24,
              maxWidth: 760,
            }}
            data-testid="text-hero-description"
          >
            DJZS Protocol is an adversarial logic firewall for autonomous AI agents.
            11 failure codes. Deterministic verdicts. Immutable certificates on Irys.
            Proof-of-Logic NFTs on Base. Pay per audit — $0.10 USDC via x402.
          </p>
          <div style={{ display: "flex", gap: 12, marginTop: 32, flexWrap: "wrap" }} data-testid="badges-hero">
            <Badge color={C.green}>x402 USDC</Badge>
            <Badge color={C.green}>Base Mainnet</Badge>
            <Badge color={C.green}>Irys Datachain</Badge>
            <Badge color={C.green}>Claude Sonnet</Badge>
            <Badge color={C.amber}>Venice Fallback</Badge>
          </div>
        </div>
      )}
    </section>
  );
}

function LFTaxonomy() {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <section style={{ padding: "60px 0" }} data-testid="section-taxonomy">
      <SectionLabel>// DJZS-LF FAILURE TAXONOMY</SectionLabel>
      <h2 style={{ fontFamily: MONO, fontSize: 24, color: C.white, margin: "0 0 8px", fontWeight: 600 }} data-testid="text-taxonomy-headline">
        11 codes. 5 categories. Zero vibes.
      </h2>
      <p style={{ fontFamily: MONO, fontSize: 13, color: C.textDim, marginBottom: 32, maxWidth: 720 }}>
        Every audit evaluates the agent's reasoning against the full taxonomy.
        Flags are boolean. Scoring is deterministic TypeScript. The LLM detects — it never decides.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {LF_CATEGORIES.map((cat) => (
          <div key={cat.id}>
            <button
              onClick={() => setExpanded(expanded === cat.id ? null : cat.id)}
              data-testid={`button-category-${cat.id.toLowerCase()}`}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "14px 16px",
                background: expanded === cat.id ? C.surfaceHover : C.surface,
                border: `1px solid ${expanded === cat.id ? cat.color + "40" : C.border}`,
                borderRadius: expanded === cat.id ? "6px 6px 0 0" : 6,
                cursor: "pointer",
                fontFamily: MONO,
                fontSize: 13,
                color: C.text,
                transition: "all 0.2s ease",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <GlowDot color={cat.color} size={6} />
                <span style={{ fontWeight: 600 }}>{cat.name}</span>
                <span style={{ color: C.textMuted, fontSize: 11 }}>
                  ({cat.codes.length} code{cat.codes.length > 1 ? "s" : ""})
                </span>
              </div>
              <span style={{ color: C.textMuted, fontSize: 16, transform: expanded === cat.id ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s" }}>
                ▾
              </span>
            </button>

            {expanded === cat.id && (
              <div
                style={{
                  border: `1px solid ${cat.color}40`,
                  borderTop: "none",
                  borderRadius: "0 0 6px 6px",
                  background: C.surface,
                  overflow: "hidden",
                }}
              >
                {cat.codes.map((code, i) => (
                  <div
                    key={code.code}
                    data-testid={`text-lf-code-${code.code.toLowerCase()}`}
                    style={{
                      padding: "12px 16px",
                      borderTop: i > 0 ? `1px solid ${C.border}` : "none",
                      display: "flex",
                      gap: 12,
                      alignItems: "flex-start",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: MONO,
                        fontSize: 11,
                        color: cat.color,
                        fontWeight: 700,
                        minWidth: 32,
                        paddingTop: 2,
                      }}
                    >
                      {code.code}
                    </span>
                    <div>
                      <div style={{ fontFamily: MONO, fontSize: 12, color: C.text, fontWeight: 600 }}>
                        {code.name}
                      </div>
                      <div style={{ fontFamily: MONO, fontSize: 11, color: C.textDim, marginTop: 4, lineHeight: 1.6 }}>
                        {code.desc}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div
        style={{
          marginTop: 20,
          padding: "12px 16px",
          background: `${C.red}10`,
          border: `1px solid ${C.red}30`,
          borderRadius: 6,
          fontFamily: MONO,
          fontSize: 11,
          color: C.red,
          lineHeight: 1.6,
        }}
        data-testid="callout-hard-fail-rules"
      >
        <strong>HARD-FAIL RULES (Prediction Markets):</strong> E02 (missing falsification) and I01 from UNDISCLOSED source
        force FAIL regardless of risk score. These are prerequisites, not factors to weigh.
      </div>
    </section>
  );
}

function InteractiveDemo() {
  const [selected, setSelected] = useState(0);
  const [running, setRunning] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const scenario = DEMO_SCENARIOS[selected];

  function runAudit() {
    setShowResult(false);
    setRunning(true);
    setTimeout(() => {
      setRunning(false);
      setShowResult(true);
    }, 1800);
  }

  return (
    <section style={{ padding: "60px 0" }} data-testid="section-demo">
      <SectionLabel>// LIVE DEMO — PREDICTION MARKET AUDIT</SectionLabel>
      <h2 style={{ fontFamily: MONO, fontSize: 24, color: C.white, margin: "0 0 24px", fontWeight: 600 }} data-testid="text-demo-headline">
        Try it. Paste a thesis. Get a verdict.
      </h2>

      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        {DEMO_SCENARIOS.map((s, i) => (
          <button
            key={i}
            onClick={() => { setSelected(i); setShowResult(false); setRunning(false); }}
            data-testid={`button-scenario-${i}`}
            style={{
              fontFamily: MONO,
              fontSize: 11,
              padding: "6px 12px",
              borderRadius: 4,
              border: `1px solid ${selected === i ? C.green : C.border}`,
              background: selected === i ? C.greenGlow : "transparent",
              color: selected === i ? C.green : C.textDim,
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div
        style={{
          background: C.surface,
          border: `1px solid ${C.border}`,
          borderRadius: 8,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "12px 16px",
            borderBottom: `1px solid ${C.border}`,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <GlowDot color={running ? C.amber : showResult ? (scenario.result.verdict === "PASS" ? C.green : C.red) : C.textMuted} />
            <span style={{ fontFamily: MONO, fontSize: 11, color: C.textDim }}>
              /api/audit/micro • domain: PREDICTION
            </span>
          </div>
          <span style={{ fontFamily: MONO, fontSize: 11, color: C.textMuted }}>$0.10 USDC</span>
        </div>

        <div style={{ padding: 16, borderBottom: `1px solid ${C.border}` }}>
          <div style={{ fontFamily: MONO, fontSize: 11, color: C.textMuted, marginBottom: 8 }}>MARKET QUESTION</div>
          <div style={{ fontFamily: MONO, fontSize: 12, color: C.text, marginBottom: 16 }} data-testid="text-demo-market">{scenario.market}</div>

          <div style={{ display: "flex", gap: 16, marginBottom: 16, flexWrap: "wrap" }}>
            <div>
              <div style={{ fontFamily: MONO, fontSize: 11, color: C.textMuted, marginBottom: 4 }}>POSITION</div>
              <Badge color={C.green} filled>{scenario.position} @ {scenario.price}</Badge>
            </div>
            <div>
              <div style={{ fontFamily: MONO, fontSize: 11, color: C.textMuted, marginBottom: 4 }}>SOURCE</div>
              <Badge
                color={
                  scenario.source === "PAID_SIGNAL_GROUP" || scenario.source === "UNDISCLOSED"
                    ? C.red
                    : scenario.source === "WHALE_TRACKING"
                    ? C.amber
                    : C.green
                }
                filled
              >
                {scenario.source}
              </Badge>
            </div>
          </div>

          <div style={{ fontFamily: MONO, fontSize: 11, color: C.textMuted, marginBottom: 4 }}>THESIS</div>
          <div
            style={{
              fontFamily: MONO,
              fontSize: 12,
              color: C.text,
              background: C.bg,
              padding: 12,
              borderRadius: 4,
              border: `1px solid ${C.border}`,
              lineHeight: 1.7,
            }}
            data-testid="text-demo-thesis"
          >
            "{scenario.thesis}"
          </div>
        </div>

        <div style={{ padding: 16 }}>
          {!showResult && !running && (
            <button
              onClick={runAudit}
              data-testid="button-run-audit"
              style={{
                fontFamily: MONO,
                fontSize: 13,
                fontWeight: 600,
                padding: "10px 24px",
                borderRadius: 6,
                border: `1px solid ${C.green}`,
                background: C.greenGlow,
                color: C.green,
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              ▸ Run Audit
            </button>
          )}

          {running && (
            <div style={{ fontFamily: MONO, fontSize: 12, color: C.amber }} data-testid="text-demo-scanning">
              <span style={{ animation: "pulse 1s infinite" }}>⟳</span> Evaluating thesis against 11 LF codes...
            </div>
          )}

          {showResult && (
            <div style={{ animation: "fadeIn 0.4s ease" }} data-testid="section-demo-result">
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px 16px",
                  borderRadius: 6,
                  background: scenario.result.verdict === "PASS" ? `${C.green}15` : `${C.red}15`,
                  border: `1px solid ${scenario.result.verdict === "PASS" ? C.green : C.red}40`,
                  marginBottom: 16,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span
                    style={{
                      fontFamily: MONO,
                      fontSize: 18,
                      fontWeight: 800,
                      color: scenario.result.verdict === "PASS" ? C.green : C.red,
                    }}
                    data-testid="text-demo-verdict"
                  >
                    {scenario.result.verdict}
                  </span>
                  {scenario.result.verdict_source === "HARD_FAIL" && (
                    <Badge color={C.red} filled>HARD-FAIL: {scenario.result.hard_fail_rules[0]}</Badge>
                  )}
                </div>
                <span style={{ fontFamily: MONO, fontSize: 12, color: C.textDim }} data-testid="text-demo-risk-score">
                  risk: {scenario.result.risk_score}/100
                </span>
              </div>

              {scenario.result.flags.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {scenario.result.flags.map((flag) => (
                    <div
                      key={flag.code}
                      data-testid={`card-flag-${flag.code.toLowerCase()}`}
                      style={{
                        display: "flex",
                        gap: 10,
                        padding: "8px 12px",
                        background: flag.hard_fail ? `${C.red}10` : C.bg,
                        border: `1px solid ${flag.hard_fail ? C.red + "30" : C.border}`,
                        borderRadius: 4,
                        alignItems: "flex-start",
                      }}
                    >
                      <span
                        style={{
                          fontFamily: MONO,
                          fontSize: 11,
                          fontWeight: 700,
                          color: flag.severity === "CRITICAL" ? C.red : C.amber,
                          minWidth: 28,
                          paddingTop: 1,
                        }}
                      >
                        {flag.code}
                      </span>
                      <div>
                        <div style={{ fontFamily: MONO, fontSize: 11, color: C.text }}>
                          {flag.name}
                          {flag.hard_fail && (
                            <span style={{ color: C.red, marginLeft: 8, fontSize: 10 }}>⬤ HARD-FAIL</span>
                          )}
                        </div>
                        <div style={{ fontFamily: MONO, fontSize: 11, color: C.textDim, marginTop: 2, lineHeight: 1.5 }}>
                          {flag.evidence}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ fontFamily: MONO, fontSize: 12, color: C.green, padding: "8px 0" }} data-testid="text-demo-all-clear">
                  ✓ No logic flaws detected. All 11 codes CLEAR.
                </div>
              )}

              <div
                style={{
                  marginTop: 16,
                  padding: "10px 12px",
                  background: C.bg,
                  border: `1px solid ${C.border}`,
                  borderRadius: 4,
                  fontFamily: MONO,
                  fontSize: 10,
                  color: C.textMuted,
                  lineHeight: 1.6,
                }}
                data-testid="text-demo-certificate-preview"
              >
                <span style={{ color: C.textDim }}>certificate →</span>{" "}
                logic_hash: 0x9c1d...a4e2 • irys_tx: Hk7mN2...vQ3pL •{" "}
                {scenario.result.verdict === "PASS" ? (
                  <span style={{ color: C.green }}>NFT minted to agent wallet</span>
                ) : (
                  <span style={{ color: C.textMuted }}>no mint (FAIL)</span>
                )}
                {" "}•{" "}
                {scenario.result.verdict === "PASS" ? (
                  <span style={{ color: C.green }}>$0.10 charged</span>
                ) : (
                  <span style={{ color: C.textMuted }}>$0.00 (deferred — no charge on FAIL)</span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

const TIERS = [
  {
    name: "Micro Zone",
    endpoint: "/api/audit/micro",
    price: "$0.10",
    desc: "Fast, constrained operational audits for autonomous agents making real-time decisions.",
    payload: "1,000 char",
    features: ["Binary PASS/FAIL verdict", "Risk score (0–100)", "DJZS-LF failure codes", "< 3s response time"],
    bestFor: "Trading bots, DeFi agents, Prediction markets",
    popular: false,
    icon: "⚡",
  },
  {
    name: "Founder Zone",
    endpoint: "/api/audit/founder",
    price: "$1.00",
    desc: "Deep roadmap diligence for founders deploying capital or strategy against a thesis.",
    payload: "5,000 char",
    features: ["Everything in Micro", "Bias pattern detection", "Narrative drift analysis", "Counter-thesis generation"],
    bestFor: "Founders, DAO proposals",
    popular: true,
    icon: "🏛",
  },
  {
    name: "Treasury Zone",
    endpoint: "/api/audit/treasury",
    price: "$10.00",
    desc: "Exhaustive adversarial governance audits for treasuries and high-stakes execution.",
    payload: "Unlimited",
    features: ["Everything in Founder", "Multi-vector attack surface", "Governance risk modeling", "Proof of Logic certificate"],
    bestFor: "DAO treasuries, protocols",
    popular: false,
    icon: "◇",
  },
];

function Pricing() {
  return (
    <section style={{ padding: "60px 0" }} data-testid="section-pricing">
      <SectionLabel>// PRICING</SectionLabel>
      <h2 style={{ fontFamily: MONO, fontSize: 24, color: C.white, margin: "0 0 4px", fontWeight: 600 }} data-testid="text-pricing-headline">
        Pay-per-Verify. No subscriptions.
      </h2>
      <p style={{ fontFamily: MONO, fontSize: 13, color: C.textDim, marginBottom: 32 }}>
        Every audit is a single atomic transaction. Send USDC on Base, receive a deterministic verdict.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 12 }}>
        {TIERS.map((tier) => (
          <div
            key={tier.name}
            data-testid={`card-tier-${tier.name.toLowerCase().replace(/\s/g, "-")}`}
            style={{
              background: C.surface,
              border: `1px solid ${tier.popular ? C.green + "50" : C.border}`,
              borderRadius: 8,
              padding: 20,
              position: "relative",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {tier.popular && (
              <div
                style={{
                  position: "absolute",
                  top: -10,
                  left: "50%",
                  transform: "translateX(-50%)",
                  fontFamily: MONO,
                  fontSize: 10,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: C.bg,
                  background: C.green,
                  padding: "3px 12px",
                  borderRadius: 10,
                  fontWeight: 700,
                }}
              >
                Most Popular
              </div>
            )}

            <div style={{ fontFamily: MONO, fontSize: 18, fontWeight: 700, color: C.white, marginBottom: 2 }}>
              <span style={{ marginRight: 8 }}>{tier.icon}</span>{tier.name}
            </div>
            <div style={{ fontFamily: MONO, fontSize: 11, color: C.textMuted, marginBottom: 12 }}>
              {tier.endpoint}
            </div>

            <div style={{ marginBottom: 12 }}>
              <span style={{ fontFamily: MONO, fontSize: 32, fontWeight: 800, color: C.white }}>{tier.price}</span>
              <span style={{ fontFamily: MONO, fontSize: 12, color: C.textDim, marginLeft: 6 }}>USDC / audit</span>
            </div>

            <p style={{ fontFamily: MONO, fontSize: 12, color: C.textDim, lineHeight: 1.6, marginBottom: 16 }}>
              {tier.desc}
            </p>

            <Badge color={C.textMuted}>{tier.payload} payload</Badge>

            <div style={{ margin: "16px 0", flex: 1 }}>
              {tier.features.map((f) => (
                <div key={f} style={{ fontFamily: MONO, fontSize: 11, color: C.text, padding: "4px 0", display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ color: C.green, fontSize: 10 }}>✓</span> {f}
                </div>
              ))}
            </div>

            <div
              style={{
                fontFamily: MONO,
                fontSize: 11,
                color: C.green,
                borderTop: `1px solid ${C.border}`,
                paddingTop: 12,
                marginTop: "auto",
              }}
            >
              Best for: {tier.bestFor}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function CertificateSection() {
  return (
    <section style={{ padding: "60px 0" }} data-testid="section-certificate">
      <SectionLabel>// PROOF-OF-LOGIC CERTIFICATE + NFT</SectionLabel>
      <h2 style={{ fontFamily: MONO, fontSize: 24, color: C.white, margin: "0 0 8px", fontWeight: 600 }} data-testid="text-certificate-headline">
        Immutable. Verifiable. On-chain.
      </h2>
      <p style={{ fontFamily: MONO, fontSize: 13, color: C.textDim, marginBottom: 24, maxWidth: 720 }}>
        Every audit produces a certificate anchored to Irys Datachain. PASS verdicts mint a
        Proof-of-Logic NFT on Base Mainnet to the agent's wallet. FAIL verdicts don't mint —
        you don't reward bad logic.
      </p>

      <div
        style={{
          background: C.surface,
          border: `1px solid ${C.border}`,
          borderRadius: 8,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "10px 16px",
            borderBottom: `1px solid ${C.border}`,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span style={{ fontFamily: MONO, fontSize: 11, color: C.textMuted }}>
            Proof-of-Logic Certificate
          </span>
          <span style={{ fontFamily: MONO, fontSize: 11, color: C.textMuted }}>
            ERC-721 on Base
          </span>
        </div>

        <pre
          style={{
            margin: 0,
            padding: 16,
            fontFamily: MONO,
            fontSize: 11,
            lineHeight: 1.7,
            color: C.textDim,
            overflowX: "auto",
          }}
          data-testid="text-certificate-json"
        >
{`{
  `}<span style={{ color: C.textMuted }}>"audit_id"</span>{`:     `}<span style={{ color: C.text }}>"{SAMPLE_CERT.audit_id}"</span>{`,
  `}<span style={{ color: C.textMuted }}>"verdict"</span>{`:      `}<span style={{ color: C.red, fontWeight: 700 }}>"{SAMPLE_CERT.verdict}"</span>{`,
  `}<span style={{ color: C.textMuted }}>"verdict_source"</span>{`: `}<span style={{ color: C.red }}>"{SAMPLE_CERT.verdict_source}"</span>{`,
  `}<span style={{ color: C.textMuted }}>"risk_score"</span>{`:      `}<span style={{ color: C.amber }}>{SAMPLE_CERT.risk_score}</span>{`,
  `}<span style={{ color: C.textMuted }}>"hard_fail_rules"</span>{`: `}<span style={{ color: C.red }}>["{SAMPLE_CERT.hard_fail_rules[0]}"]</span>{`,
  `}<span style={{ color: C.textMuted }}>"logic_hash"</span>{`:   `}<span style={{ color: C.text }}>"{SAMPLE_CERT.logic_hash}"</span>{`,
  `}<span style={{ color: C.textMuted }}>"irys_tx_id"</span>{`:   `}<span style={{ color: C.green }}>"{SAMPLE_CERT.irys_tx_id}"</span>{`,
  `}<span style={{ color: C.textMuted }}>"nft"</span>{`:          `}<span style={{ color: C.textMuted }}>"{SAMPLE_CERT.nft.status}"</span>{`,
  `}<span style={{ color: C.textMuted }}>"x402"</span>{`:         `}<span style={{ color: C.textMuted }}>"{SAMPLE_CERT.x402_payment.status}"</span>{`
}`}
        </pre>
      </div>

      <div style={{ marginTop: 16, display: "flex", gap: 16, flexWrap: "wrap" }}>
        <div
          style={{
            flex: 1,
            minWidth: 200,
            padding: 16,
            background: C.surface,
            border: `1px solid ${C.green}30`,
            borderRadius: 6,
          }}
          data-testid="card-pass-flow"
        >
          <div style={{ fontFamily: MONO, fontSize: 11, color: C.green, fontWeight: 600, marginBottom: 6 }}>
            ✓ PASS Verdict
          </div>
          <div style={{ fontFamily: MONO, fontSize: 11, color: C.textDim, lineHeight: 1.6 }}>
            Certificate anchored on Irys → ERC-721 minted to agent wallet on Base →
            $0.10 USDC charged via x402 → Order forwarded to Polymarket CLOB
          </div>
        </div>
        <div
          style={{
            flex: 1,
            minWidth: 200,
            padding: 16,
            background: C.surface,
            border: `1px solid ${C.red}30`,
            borderRadius: 6,
          }}
          data-testid="card-fail-flow"
        >
          <div style={{ fontFamily: MONO, fontSize: 11, color: C.red, fontWeight: 600, marginBottom: 6 }}>
            ✗ FAIL Verdict
          </div>
          <div style={{ fontFamily: MONO, fontSize: 11, color: C.textDim, lineHeight: 1.6 }}>
            Certificate anchored on Irys → No NFT minted → $0.00 charged (deferred) →
            Order blocked — never reaches Polymarket
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer style={{ padding: "40px 0", borderTop: `1px solid ${C.border}`, marginTop: 40 }} data-testid="section-footer">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
        <div>
          <div style={{ fontFamily: MONO, fontSize: 14, fontWeight: 700, color: C.white }}>DJZS Protocol</div>
          <div style={{ fontFamily: MONO, fontSize: 11, color: C.textMuted, marginTop: 4 }}>
            djzsx.eth • Base Mainnet • 0x3E79...aFB
          </div>
        </div>
        <div style={{ display: "flex", gap: 16 }}>
          {[
            { label: "X", href: "https://x.com/djzs_ai" },
            { label: "GitHub", href: "https://github.com/djzsx" },
            { label: "Farcaster", href: "#" },
            { label: "Paragraph", href: "#" },
          ].map((link) => (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noopener"
              data-testid={`link-footer-${link.label.toLowerCase()}`}
              style={{
                fontFamily: MONO,
                fontSize: 11,
                color: C.textDim,
                textDecoration: "none",
                transition: "color 0.2s",
              }}
              onMouseEnter={(e) => ((e.target as HTMLElement).style.color = C.green)}
              onMouseLeave={(e) => ((e.target as HTMLElement).style.color = C.textDim)}
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>
      <div style={{ fontFamily: MONO, fontSize: 10, color: C.textMuted, marginTop: 20 }}>
        Audit-Before-Act. The LLM detects — it never decides.
      </div>
    </footer>
  );
}

export default function Home() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;600;700;800&display=swap');
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: ${C.bg}; }
        ::-webkit-scrollbar-thumb { background: ${C.border}; border-radius: 3px; }
      `}</style>

      <div
        style={{
          minHeight: "100vh",
          backgroundColor: C.bg,
          color: C.text,
          fontFamily: MONO,
          padding: "0 clamp(16px, 4vw, 48px)",
          maxWidth: 1400,
          margin: "0 auto",
        }}
      >
        <Nav />
        <BootSequence onComplete={() => {}} />
        <Hero bootDone={true} />
        <LFTaxonomy />
        <InteractiveDemo />
        <Pricing />
        <CertificateSection />
        <Footer />
      </div>
    </>
  );
}
