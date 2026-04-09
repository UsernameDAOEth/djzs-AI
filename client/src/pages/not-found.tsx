import { Link } from "wouter";
import { C, MONO, TerminalPage, TerminalFooter } from "@/lib/terminal-theme";

export default function NotFound() {
  return (
    <TerminalPage>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", textAlign: "center" }}>
        <div style={{ fontFamily: MONO, fontSize: 72, fontWeight: 700, color: C.red, lineHeight: 1, marginBottom: 16 }}>
          404
        </div>
        <div style={{ fontFamily: MONO, fontSize: 14, color: C.textDim, marginBottom: 8 }}>
          PAGE_NOT_FOUND
        </div>
        <p style={{ fontFamily: MONO, fontSize: 13, color: C.textMuted, marginBottom: 32 }}>
          The requested route does not exist in the DJZS system.
        </p>
        <Link href="/">
          <span
            style={{
              fontFamily: MONO,
              fontSize: 12,
              fontWeight: 600,
              padding: "10px 24px",
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
            data-testid="button-go-home"
          >
            Return to System →
          </span>
        </Link>
      </div>
      <TerminalFooter />
    </TerminalPage>
  );
}
