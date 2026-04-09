import { Link } from "wouter";

export const MONO = "'JetBrains Mono', 'Fira Code', 'SF Mono', 'Cascadia Code', monospace";

export const C = {
  bg: "#0a0a0a",
  surface: "#111111",
  surfaceHover: "#1a1a1a",
  border: "#1e1e1e",
  borderActive: "#22c55e",
  green: "#22c55e",
  greenDim: "#166534",
  greenGlow: "rgba(34,197,94,0.15)",
  red: "#ef4444",
  redDim: "#991b1b",
  amber: "#f59e0b",
  text: "#e5e5e5",
  textDim: "#737373",
  textMuted: "#525252",
  white: "#ffffff",
};

export function GlowDot({ color = C.green, size = 8 }: { color?: string; size?: number }) {
  return (
    <span
      style={{
        display: "inline-block",
        width: size,
        height: size,
        borderRadius: "50%",
        backgroundColor: color,
        boxShadow: `0 0 ${size}px ${color}, 0 0 ${size * 2}px ${color}40`,
      }}
    />
  );
}

export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontFamily: MONO,
        fontSize: 11,
        letterSpacing: "0.15em",
        textTransform: "uppercase",
        color: C.textMuted,
        marginBottom: 12,
      }}
    >
      {children}
    </div>
  );
}

export function Badge({ children, color = C.green, filled = false }: { children: React.ReactNode; color?: string; filled?: boolean }) {
  return (
    <span
      style={{
        fontFamily: MONO,
        fontSize: 11,
        padding: "3px 8px",
        borderRadius: 4,
        border: `1px solid ${color}40`,
        backgroundColor: filled ? `${color}20` : "transparent",
        color: color,
        letterSpacing: "0.05em",
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
}

export function Nav({ rightSlot }: { rightSlot?: React.ReactNode } = {}) {
  return (
    <nav
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "16px 0",
        borderBottom: `1px solid ${C.border}`,
        position: "sticky",
        top: 0,
        backgroundColor: C.bg,
        zIndex: 100,
        marginBottom: 8,
      }}
      data-testid="nav-terminal"
    >
      <Link href="/">
        <span style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", textDecoration: "none" }}>
          <GlowDot color={C.green} size={8} />
          <span style={{ fontFamily: MONO, fontSize: 14, fontWeight: 700, color: C.white }}>
            DJZS.ai
          </span>
        </span>
      </Link>

      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        {[
          { label: "Live Demo", href: "/demo" },
          { label: "Documents", href: "/docs" },
        ].map((link) => (
          <Link
            key={link.label}
            href={link.href}
          >
            <span
              style={{
                fontFamily: MONO,
                fontSize: 12,
                color: C.textDim,
                textDecoration: "none",
                cursor: "pointer",
                transition: "color 0.2s",
              }}
              onMouseEnter={(e) => ((e.target as HTMLElement).style.color = C.green)}
              onMouseLeave={(e) => ((e.target as HTMLElement).style.color = C.textDim)}
              data-testid={`link-nav-${link.label.toLowerCase().replace(/\s/g, "-")}`}
            >
              {link.label}
            </span>
          </Link>
        ))}
        {rightSlot || (
          <Link href="/chat">
            <span
              style={{
                fontFamily: MONO,
                fontSize: 11,
                fontWeight: 600,
                padding: "6px 14px",
                borderRadius: 4,
                border: `1px solid ${C.green}`,
                backgroundColor: C.greenGlow,
                color: C.green,
                textDecoration: "none",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLElement).style.backgroundColor = C.green;
                (e.target as HTMLElement).style.color = C.bg;
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLElement).style.backgroundColor = C.greenGlow;
                (e.target as HTMLElement).style.color = C.green;
              }}
              data-testid="link-nav-connect-wallet"
            >
              Connect Wallet
            </span>
          </Link>
        )}
      </div>
    </nav>
  );
}

export function TerminalPage({ children, maxWidth = 760 }: { children: React.ReactNode; maxWidth?: number }) {
  return (
    <div
      style={{
        background: C.bg,
        color: C.text,
        fontFamily: MONO,
        fontSize: 14,
        lineHeight: 1.75,
        minHeight: "100vh",
        position: "relative",
      }}
    >
      <div style={{ maxWidth, margin: "0 auto", padding: "0 24px", position: "relative", zIndex: 1 }}>
        <Nav />
        {children}
      </div>
    </div>
  );
}

export function TerminalHeading({ num, children }: { num: string; children: React.ReactNode }) {
  return (
    <h2
      style={{
        fontFamily: MONO,
        fontSize: 13,
        fontWeight: 700,
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        color: C.green,
        marginBottom: 16,
        display: "flex",
        alignItems: "center",
        gap: 12,
      }}
    >
      <span style={{ color: C.textMuted, fontSize: 11 }}>{num}</span>
      {children}
      <span style={{ flex: 1, height: 1, background: C.border }} />
    </h2>
  );
}

export function TerminalFooter() {
  return (
    <footer
      style={{
        borderTop: `1px solid ${C.border}`,
        padding: "32px 0",
        fontFamily: MONO,
        fontSize: 12,
        color: C.textMuted,
        display: "flex",
        justifyContent: "space-between",
        marginBottom: 40,
      }}
    >
      <span>DJZS Protocol — djzs.ai</span>
      <span>No agent acts without audit.</span>
    </footer>
  );
}
