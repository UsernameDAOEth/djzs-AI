import { Link } from "wouter";
import { C, MONO, TerminalPage, TerminalHeading, TerminalFooter } from "@/lib/terminal-theme";

export default function Terms() {
  return (
    <TerminalPage>
      <header style={{ padding: "60px 0 40px", borderBottom: `1px solid ${C.border}`, marginBottom: 48 }}>
        <div
          style={{
            display: "inline-block", fontFamily: MONO, fontSize: 11, letterSpacing: "0.12em",
            textTransform: "uppercase", color: C.green, border: `1px solid ${C.green}33`,
            background: C.greenGlow, padding: "4px 12px", borderRadius: 2, marginBottom: 24,
          }}
          data-testid="tag-terms-header"
        >
          DJZS Protocol — Terms of Service
        </div>
        <h1 style={{ fontSize: "clamp(28px, 5vw, 44px)", fontWeight: 700, lineHeight: 1.2, letterSpacing: "-0.02em", marginBottom: 12, color: C.white }}>
          Terms of Service
        </h1>
        <p style={{ fontSize: 13, color: C.textDim }}>Last updated: January 03, 2026</p>
      </header>

      <div style={{ display: "flex", flexDirection: "column", gap: 40, marginBottom: 64 }}>
        <section>
          <TerminalHeading num="01">Purpose</TerminalHeading>
          <p style={{ color: C.text, fontSize: 14, lineHeight: 1.8 }}>
            These Terms of Service ("Terms") govern your use of DJZS (the "Service"),
            an autonomous AI auditing firm operating in the Agent-to-Agent (A2A) economy.
            The Service includes a web interface for human users and a programmatic API
            for autonomous agents. By accessing the Service, you agree to be bound by these Terms.
            If you do not agree, you must not use the Service.
          </p>
        </section>

        <section>
          <TerminalHeading num="02">Definitions</TerminalHeading>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              ["1. Service", "refers to the DJZS interface, local-first vaults, A2A audit API, and associated AI agents."],
              ["2. User", "means any individual or autonomous agent accessing the Service."],
              ["3. Zone", "refers to specific functional environments (Audit Ledger, Research, Trade, Decisions, Content, Adversarial Oracle)."],
              ["4. Audit", "refers to an adversarial logic analysis performed by the DJZS AI via the A2A API endpoint."],
              ["5. Agent", "means any autonomous software system that interacts with the DJZS API programmatically."],
            ].map(([term, desc]) => (
              <div key={term} style={{ padding: "8px 12px", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 4, fontSize: 13 }}>
                <span style={{ color: C.green, fontWeight: 600 }}>{term}</span>{" "}
                <span style={{ color: C.text }}>{desc}</span>
              </div>
            ))}
          </div>
        </section>

        <section>
          <TerminalHeading num="03">User Responsibilities & Risk</TerminalHeading>
          <p style={{ color: C.text, fontSize: 14, lineHeight: 1.8, marginBottom: 12 }}>
            The Service is provided on an "as is" basis. You acknowledge that:
          </p>
          <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: 6 }}>
            {[
              "Journaling and research data is stored locally in your browser's IndexedDB.",
              "AI analysis is for informational purposes and does not constitute advice.",
              "Clearing your browser data will permanently delete locally stored information.",
            ].map((item, i) => (
              <li key={i} style={{ display: "flex", gap: 8, fontSize: 13, color: C.text }}>
                <span style={{ color: C.green, flexShrink: 0 }}>▸</span>
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section>
          <TerminalHeading num="04">Access and Restrictions</TerminalHeading>
          <p style={{ color: C.text, fontSize: 14, lineHeight: 1.8 }}>
            DJZS reserves the right to restrict access to certain features for users
            violating system integrity or bypassing standard interface protocols.
          </p>
        </section>

        <section>
          <TerminalHeading num="05">Data & Privacy</TerminalHeading>
          <p style={{ color: C.text, fontSize: 14, lineHeight: 1.8 }}>
            DJZS does not collect personal data. Interactions occur solely through public
            blockchain addresses. Local-first architecture ensures your thoughts and
            research remain on your device unless explicitly shared.
          </p>
        </section>

        <section>
          <TerminalHeading num="06">A2A Audit API Usage</TerminalHeading>
          <p style={{ color: C.text, fontSize: 14, lineHeight: 1.8, marginBottom: 12 }}>
            The DJZS A2A Audit API (<code style={{ fontFamily: MONO, fontSize: 12, color: C.green, background: `${C.green}15`, padding: "2px 6px", borderRadius: 2 }}>POST /api/audit</code>) is subject to the following terms:
          </p>
          <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: 6 }}>
            {[
              "Audit responses are generated by AI and represent adversarial analysis, not professional financial, legal, or investment advice.",
              "Risk scores, bias detection, and recommendations are algorithmic outputs and should not be the sole basis for any financial decision.",
              "Payment is required via x402 protocol (USDC on Base). Payments are non-refundable once an audit response has been delivered.",
              "Strategy memos submitted for audit are processed in real-time and are not stored after the response is returned.",
              "DJZS makes no guarantee of uptime, response time, or availability of the audit API.",
              "Automated agents using the API must comply with these terms. The operator of an agent is responsible for its usage.",
            ].map((item, i) => (
              <li key={i} style={{ display: "flex", gap: 8, fontSize: 13, color: C.text }}>
                <span style={{ color: C.green, flexShrink: 0 }}>▸</span>
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section>
          <TerminalHeading num="07">No Professional Advice</TerminalHeading>
          <p style={{ color: C.text, fontSize: 14, lineHeight: 1.8 }}>
            All information provided through the Service—including AI-generated insights,
            research synthesis, and A2A audit results—is for informational purposes only.
            Audit risk scores, bias detection, and recommendations are algorithmic outputs
            and do not constitute financial, legal, investment, or professional advice.
            Seek independent advice from qualified professionals before making decisions.
          </p>
        </section>

        <section>
          <TerminalHeading num="08">Limitation of Liability</TerminalHeading>
          <p style={{ color: C.text, fontSize: 14, lineHeight: 1.8 }}>
            DJZS shall not be liable for any indirect, incidental, or consequential damages
            arising from your use of the Service, including but not limited to loss of
            funds, data, access to local vaults, or decisions made based on audit results.
            AI-generated audit outputs are provided "as is" without warranty of accuracy,
            completeness, or fitness for any particular purpose.
          </p>
        </section>
      </div>

      <div style={{ textAlign: "center", padding: "24px 0 40px", borderTop: `1px solid ${C.border}` }}>
        <p style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.3em", textTransform: "uppercase", color: C.textMuted }}>
          © 2026 DJZS SYSTEM / OPERATIONAL
        </p>
      </div>

      <TerminalFooter />
    </TerminalPage>
  );
}
