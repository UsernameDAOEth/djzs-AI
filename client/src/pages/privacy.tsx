import { Link } from "wouter";
import { C, MONO, TerminalPage, TerminalHeading, TerminalFooter } from "@/lib/terminal-theme";

export default function Privacy() {
  return (
    <TerminalPage>
      <header style={{ padding: "60px 0 40px", borderBottom: `1px solid ${C.border}`, marginBottom: 48 }}>
        <div
          style={{
            display: "inline-block", fontFamily: MONO, fontSize: 11, letterSpacing: "0.12em",
            textTransform: "uppercase", color: C.green, border: `1px solid ${C.green}33`,
            background: C.greenGlow, padding: "4px 12px", borderRadius: 2, marginBottom: 24,
          }}
          data-testid="tag-privacy-header"
        >
          DJZS Protocol — Privacy Policy
        </div>
        <h1 style={{ fontSize: "clamp(28px, 5vw, 44px)", fontWeight: 700, lineHeight: 1.2, letterSpacing: "-0.02em", marginBottom: 12, color: C.white }}>
          Privacy Policy
        </h1>
        <p style={{ fontSize: 13, color: C.textDim }}>Last updated: February 25, 2026</p>
      </header>

      <div style={{ padding: "16px 20px", background: `${C.green}10`, border: `1px solid ${C.green}33`, borderRadius: 4, marginBottom: 48, fontSize: 13, lineHeight: 1.8 }}>
        <strong style={{ color: C.white }}>DJ-Z-S does not store private keys, custody assets, or initiate transactions on behalf of users.</strong>{" "}
        <span style={{ color: C.text }}>Wallet connections are used only with explicit user consent for authentication purposes. No funds are accessed or moved.</span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 40, marginBottom: 64 }}>
        <section>
          <TerminalHeading num="01">Core Principle</TerminalHeading>
          <p style={{ color: C.text, fontSize: 14, lineHeight: 1.8 }}>
            DJZS is built on a fundamental principle: your thoughts belong to you.
            We operate as a local-first thinking system, meaning your data stays on
            your device unless you explicitly choose otherwise. This application currently runs
            without on-chain transactions—wallet connection is used only for identity.
          </p>
        </section>

        <section>
          <TerminalHeading num="02">Data We Don't Collect</TerminalHeading>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {[
              ["Personal Information:", "We do not collect names, emails, phone numbers, or any personally identifiable information."],
              ["Audit Records:", "Your reasoning traces, audit results, and vault content remain stored locally in your browser's IndexedDB."],
              ["Research Data:", "Your research notes and trackers are stored locally. When you run a research query, the query text is sent to AI providers for synthesis."],
            ].map(([label, desc]) => (
              <div key={label} style={{ display: "flex", gap: 8, fontSize: 13, color: C.text }}>
                <span style={{ color: C.green, flexShrink: 0 }}>▸</span>
                <span><strong style={{ color: C.white }}>{label}</strong> {desc}</span>
              </div>
            ))}
          </div>
        </section>

        <section>
          <TerminalHeading num="03">Wallet Authentication</TerminalHeading>
          <p style={{ color: C.text, fontSize: 14, lineHeight: 1.8, marginBottom: 12 }}>
            Access to DJZS is granted through cryptographic wallet connection. This means:
          </p>
          <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: 6 }}>
            {[
              "We only see your public blockchain address, which is already public by nature.",
              "We never have access to your private keys or seed phrases.",
              "Your identity remains pseudonymous—your wallet is your identity.",
            ].map((item, i) => (
              <li key={i} style={{ display: "flex", gap: 8, fontSize: 13, color: C.text }}>
                <span style={{ color: C.green, flexShrink: 0 }}>▸</span>
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section>
          <TerminalHeading num="04">Local-First Architecture</TerminalHeading>
          <p style={{ color: C.text, fontSize: 14, lineHeight: 1.8 }}>
            DJZS uses IndexedDB for persistent local storage. All vault data, audit records,
            and research notes are stored directly in your browser's IndexedDB. This data
            persists across sessions but never leaves your device unless you request AI analysis. Clearing browser data
            will permanently delete this information.
          </p>
        </section>

        <section>
          <TerminalHeading num="05">Two Data Channels</TerminalHeading>
          <p style={{ color: C.text, fontSize: 14, lineHeight: 1.8, marginBottom: 16 }}>
            DJZS uses two separate channels with different privacy properties. We distinguish them clearly:
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ padding: "16px 20px", background: C.surface, border: `1px solid ${C.green}33`, borderLeft: `3px solid ${C.green}`, borderRadius: 4 }}>
              <h3 style={{ fontFamily: MONO, fontSize: 13, fontWeight: 700, color: C.green, marginBottom: 8 }}>XMTP Messaging — End-to-End Encrypted</h3>
              <p style={{ fontSize: 12, color: C.text, lineHeight: 1.7 }}>
                Messages between you and the DJZS agent travel over the XMTP network with end-to-end encryption (MLS protocol). XMTP nodes cannot read message content. This channel includes forward secrecy, post-compromise security, and quantum-resistant key encapsulation (XWING KEM) on Welcome messages.
              </p>
            </div>
            <div style={{ padding: "16px 20px", background: C.surface, border: `1px solid ${C.amber}33`, borderLeft: `3px solid ${C.amber}`, borderRadius: 4 }}>
              <h3 style={{ fontFamily: MONO, fontSize: 13, fontWeight: 700, color: C.amber, marginBottom: 8 }}>Venice AI Inference — HTTPS/TLS (Not E2E)</h3>
              <p style={{ fontSize: 12, color: C.text, lineHeight: 1.7 }}>
                When you deploy an audit or run a research query, your reasoning trace is sent to Venice AI over HTTPS/TLS. This means your data is encrypted in transit, but Venice must see the plaintext to compute a response. This is standard for all AI inference APIs — it is <strong style={{ color: C.white }}>not end-to-end encrypted</strong>. Venice claims no data retention and does not train on your inputs. Quantum resistance does not apply to these API calls.
              </p>
            </div>
          </div>
          <p style={{ fontSize: 12, color: C.textDim, marginTop: 12 }}>
            AI-generated insights are saved locally on your device in IndexedDB. Audit certificates are permanently stored on Irys Datachain for verifiable provenance.
          </p>
        </section>

        <section>
          <TerminalHeading num="06">What We Send and When</TerminalHeading>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {[
              ["User-initiated only:", "Nothing is sent to any AI provider unless you explicitly deploy an audit or submit a research query."],
              ["Minimal context:", "Only your current entry text and selected memory pins are transmitted — not your entire vault history."],
              ["No server-side storage:", "We do not permanently store your prompts, entries, or AI responses on any server."],
              ["Responses saved locally:", "AI-generated insights are stored in your browser's IndexedDB, not on our infrastructure."],
            ].map(([label, desc]) => (
              <div key={label} style={{ display: "flex", gap: 8, fontSize: 13, color: C.text }}>
                <span style={{ color: C.green, flexShrink: 0 }}>▸</span>
                <span><strong style={{ color: C.white }}>{label}</strong> {desc}</span>
              </div>
            ))}
          </div>
        </section>

        <section>
          <TerminalHeading num="07">A2A Audit API Data Handling</TerminalHeading>
          <p style={{ color: C.text, fontSize: 14, lineHeight: 1.8, marginBottom: 12 }}>
            DJZS operates an Agent-to-Agent (A2A) audit API at <code style={{ fontFamily: MONO, fontSize: 12, color: C.green, background: `${C.green}15`, padding: "2px 6px", borderRadius: 2 }}>POST /api/audit</code>. When autonomous agents submit strategy memos for logic audits:
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 16 }}>
            {[
              ["AI processing:", "The memo text is sent to Venice AI for adversarial analysis. Venice claims no data retention."],
              ["Cryptographic hash:", "A SHA-256 hash of the input memo is included in the audit response for verification purposes."],
              ["Payment data:", "x402 payment verification is handled by the x402 protocol facilitator. DJZS receives USDC to the treasury wallet but does not store payment metadata beyond what is recorded on-chain."],
            ].map(([label, desc]) => (
              <div key={label} style={{ display: "flex", gap: 8, fontSize: 13, color: C.text }}>
                <span style={{ color: C.green, flexShrink: 0 }}>▸</span>
                <span><strong style={{ color: C.white }}>{label}</strong> {desc}</span>
              </div>
            ))}
          </div>
          <div style={{ padding: "16px 20px", background: C.surface, border: `1px solid ${C.amber}33`, borderLeft: `3px solid ${C.amber}`, borderRadius: 4 }}>
            <h3 style={{ fontFamily: MONO, fontSize: 13, fontWeight: 700, color: C.amber, marginBottom: 8 }}>Irys Datachain — Permanent Public Storage</h3>
            <p style={{ fontSize: 12, color: C.text, lineHeight: 1.7, marginBottom: 8 }}>
              After an audit is processed, the resulting ProofOfLogic certificate is permanently uploaded to <strong style={{ color: C.white }}>Irys Datachain</strong>. This is a public, immutable data layer — once uploaded, the certificate cannot be modified or deleted by anyone, including DJZS.
            </p>
            <p style={{ fontSize: 12, color: C.text, lineHeight: 1.7, marginBottom: 8 }}>
              The permanent certificate includes: the audit verdict, risk score, adversarial analysis, SHA-256 input hash, and the <strong style={{ color: C.white }}>strategy memo text submitted by the calling agent</strong>. Users and agents should be aware that any content submitted via the A2A API becomes a permanently verifiable public record on Irys Datachain.
            </p>
            <p style={{ fontSize: 12, color: C.text, lineHeight: 1.7 }}>
              Each certificate is assigned an Irys transaction ID and a gateway URL (e.g., <code style={{ fontFamily: MONO, fontSize: 11, color: C.green, background: `${C.green}15`, padding: "2px 6px", borderRadius: 2 }}>https://gateway.irys.xyz/:txId</code>) for independent verification via <code style={{ fontFamily: MONO, fontSize: 11, color: C.green, background: `${C.green}15`, padding: "2px 6px", borderRadius: 2 }}>GET /api/audit/verify/:txId</code>.
            </p>
          </div>
        </section>

        <section>
          <TerminalHeading num="08">Third-Party Services</TerminalHeading>
          <p style={{ color: C.text, fontSize: 14, lineHeight: 1.8 }}>
            DJZS may integrate with third-party services for market data, AI processing,
            and blockchain interactions. Each service operates under its own privacy policy.
            We recommend reviewing the privacy practices of any connected wallets or
            external services you use.
          </p>
        </section>

        <section>
          <TerminalHeading num="09">Your Rights</TerminalHeading>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {[
              ["Data Portability:", "Export your local vault data at any time through the interface."],
              ["Data Deletion:", "Clear your browser data to remove all locally stored information."],
              ["Disconnection:", "Disconnect your wallet at any time to revoke access."],
            ].map(([label, desc]) => (
              <div key={label} style={{ display: "flex", gap: 8, fontSize: 13, color: C.text }}>
                <span style={{ color: C.green, flexShrink: 0 }}>▸</span>
                <span><strong style={{ color: C.white }}>{label}</strong> {desc}</span>
              </div>
            ))}
          </div>
        </section>

        <section>
          <TerminalHeading num="10">Contact</TerminalHeading>
          <p style={{ color: C.text, fontSize: 14, lineHeight: 1.8 }}>
            For privacy-related inquiries, reach out through our official channels.
            We are committed to transparency and will respond to all legitimate
            privacy concerns.
          </p>
        </section>
      </div>

      <div style={{ textAlign: "center", padding: "24px 0 40px", borderTop: `1px solid ${C.border}` }}>
        <p style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.3em", textTransform: "uppercase", color: C.textMuted }}>
          © 2026 DJZS SYSTEM / YOUR DATA, YOUR CONTROL
        </p>
      </div>

      <TerminalFooter />
    </TerminalPage>
  );
}
