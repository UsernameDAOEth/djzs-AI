import { useState, createContext, useContext } from "react";
import { Activity, Terminal, Shield, History, Settings, LogOut, Menu, X, ArrowLeft, Bot, ExternalLink } from "lucide-react";
import { Link } from "wouter";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useDisconnect } from "wagmi";
import { C, MONO, GlowDot } from "@/lib/terminal-theme";

export type DashboardView = "terminal" | "ledger" | "risk" | "settings";

interface DashboardContextType {
  activeView: DashboardView;
  setActiveView: (view: DashboardView) => void;
}

const DashboardContext = createContext<DashboardContextType>({
  activeView: "terminal",
  setActiveView: () => {},
});

export function useDashboardView() {
  return useContext(DashboardContext);
}

const navItems: { name: string; icon: React.ReactNode; view: DashboardView }[] = [
  { name: "Live Terminal", icon: <Terminal size={18} />, view: "terminal" },
  { name: "Audit Ledger", icon: <History size={18} />, view: "ledger" },
  { name: "Risk Parameters", icon: <Shield size={18} />, view: "risk" },
  { name: "API Settings", icon: <Settings size={18} />, view: "settings" },
];

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [activeView, setActiveView] = useState<DashboardView>("terminal");
  const { disconnect } = useDisconnect();

  return (
    <DashboardContext.Provider value={{ activeView, setActiveView }}>
      <div style={{ minHeight: "100vh", background: C.bg, color: C.text, fontFamily: MONO, display: "flex", overflow: "hidden" }}>

        {isSidebarOpen && (
          <div
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", zIndex: 40 }}
            onClick={() => setSidebarOpen(false)}
            data-testid="sidebar-overlay"
          />
        )}

        <aside
          style={{
            position: "fixed",
            top: 0,
            bottom: 0,
            left: 0,
            zIndex: 50,
            width: 256,
            borderRight: `1px solid ${C.border}`,
            background: C.bg,
            transform: isSidebarOpen ? "translateX(0)" : "translateX(-100%)",
            transition: "transform 0.3s",
            display: "flex",
            flexDirection: "column",
          }}
          data-testid="dashboard-sidebar"
        >
          <div style={{ height: 64, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px", borderBottom: `1px solid ${C.border}` }}>
            <button
              onClick={() => setActiveView("terminal")}
              style={{ background: "none", border: "none", cursor: "pointer", fontFamily: MONO, fontSize: 18, fontWeight: 700, color: C.text }}
              data-testid="link-console-home"
            >
              <span>DJZS</span>
              <span style={{ color: C.green }}>.console</span>
            </button>
            <button
              onClick={() => setSidebarOpen(false)}
              style={{ background: "none", border: "none", cursor: "pointer", color: C.textDim, display: isSidebarOpen ? "block" : "none" }}
              data-testid="button-close-sidebar"
            >
              <X size={20} />
            </button>
          </div>

          <div style={{ padding: 16, flex: 1 }}>
            <Link href="/">
              <span
                style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", marginBottom: 8, color: C.textDim, cursor: "pointer", textDecoration: "none", fontSize: 13 }}
                data-testid="link-back-home"
              >
                <ArrowLeft size={16} />
                Back to Home
              </span>
            </Link>
            <Link href="/chat">
              <span
                style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "8px 12px", marginBottom: 16, border: `1px solid ${C.green}30`,
                  background: C.greenGlow, cursor: "pointer", textDecoration: "none",
                }}
                data-testid="link-djzs-workspace"
              >
                <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Bot size={16} color={C.green} />
                  <span style={{ fontSize: 12, fontWeight: 700, color: C.text }}>DJZS.ai Workspace</span>
                </span>
                <ExternalLink size={12} color={C.textMuted} />
              </span>
            </Link>

            <div style={{ fontSize: 10, color: C.textMuted, marginBottom: 16, padding: "0 8px", letterSpacing: "0.2em", textTransform: "uppercase" }}>System Navigation</div>
            <nav>
              {navItems.map((item) => {
                const isActive = activeView === item.view;
                return (
                  <button
                    key={item.name}
                    onClick={() => { setActiveView(item.view); setSidebarOpen(false); }}
                    style={{
                      width: "100%", display: "flex", alignItems: "center", gap: 12,
                      padding: "10px 12px", marginBottom: 4, border: isActive ? `1px solid ${C.green}40` : "1px solid transparent",
                      background: isActive ? C.greenGlow : "transparent",
                      color: isActive ? C.green : C.textDim, cursor: "pointer",
                      fontFamily: MONO, fontSize: 13, fontWeight: 500, textAlign: "left",
                      position: "relative",
                    }}
                    data-testid={`nav-${item.name.toLowerCase().replace(/\s/g, "-")}`}
                  >
                    {isActive && (
                      <span style={{ position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)", width: 3, height: 20, background: C.green, borderRadius: "0 2px 2px 0" }} />
                    )}
                    {item.icon}
                    <span>{item.name}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          <div style={{ padding: 16, borderTop: `1px solid ${C.border}`, marginTop: "auto" }}>
            <button
              onClick={() => disconnect()}
              style={{
                display: "flex", alignItems: "center", gap: 12, width: "100%",
                padding: "10px 12px", background: "none", border: "none",
                color: C.textDim, cursor: "pointer", fontFamily: MONO, fontSize: 13,
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = C.red; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = C.textDim; }}
              data-testid="button-disconnect"
            >
              <LogOut size={18} />
              <span>Disconnect</span>
            </button>
          </div>
        </aside>

        <main style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, overflow: "hidden", position: "relative" }}>
          <header style={{
            height: 64, display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "0 24px", borderBottom: `1px solid ${C.border}`, background: C.bg,
            position: "sticky", top: 0, zIndex: 30,
          }}>
            <button
              onClick={() => setSidebarOpen(true)}
              style={{ background: "none", border: "none", cursor: "pointer", color: C.textDim }}
              data-testid="button-open-sidebar"
            >
              <Menu size={20} />
            </button>

            <div style={{ flex: 1 }} />

            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div
                style={{
                  display: "flex", alignItems: "center", gap: 8, padding: "6px 12px",
                  background: C.greenGlow, border: `1px solid ${C.green}30`,
                }}
                data-testid="status-network"
              >
                <GlowDot color={C.green} size={8} />
                <span style={{ fontSize: 11, color: C.green, letterSpacing: "0.1em" }}>BASE MAINNET</span>
              </div>
              <ConnectButton accountStatus="address" chainStatus="none" showBalance={false} />
            </div>
          </header>

          <div style={{ flex: 1, overflowY: "auto", padding: 32, position: "relative" }}>
            {children}
          </div>
        </main>
      </div>
    </DashboardContext.Provider>
  );
}
