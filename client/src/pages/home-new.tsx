import { Link } from "wouter";

export default function Home() {
  return (
    <div style={{ maxWidth: 860, margin: "60px auto", padding: 16 }}>
      <h1 style={{ fontWeight: 900, letterSpacing: 0.2 }}>DJZS</h1>
      <p style={{ opacity: 0.8, lineHeight: 1.5 }}>
        Members-only, end-to-end encrypted chat powered by XMTP. Sign in with your wallet / ENS and
        access rooms for trades, predictions, events, and payments.
      </p>
      <Link
        to="/chat"
        style={{
          display: "inline-flex",
          marginTop: 14,
          padding: "12px 14px",
          borderRadius: 12,
          border: "1px solid rgba(255,255,255,0.18)",
          background: "rgba(255,255,255,0.08)",
          color: "white",
          fontWeight: 800,
          textDecoration: "none",
        }}
        data-testid="link-go-to-chat"
      >
        Go to Chat →
      </Link>
    </div>
  );
}
