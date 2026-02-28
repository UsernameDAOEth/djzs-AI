import { useState, createContext, useContext } from "react";
import { Activity, Terminal, Shield, History, Settings, LogOut, Menu, X, Sun, Moon, ArrowLeft, Bot, ExternalLink } from "lucide-react";
import { Link } from "wouter";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useDisconnect } from "wagmi";
import { useTheme } from "@/lib/theme";

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
  const { theme, toggleTheme } = useTheme();

  return (
    <DashboardContext.Provider value={{ activeView, setActiveView }}>
      <div className="min-h-screen bg-background text-foreground font-sans flex overflow-hidden selection:bg-purple-500/30">

        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/80 z-40 md:hidden backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
            data-testid="sidebar-overlay"
          />
        )}

        <aside
          className={`fixed inset-y-0 left-0 z-50 w-64 border-r border-border transform transition-transform duration-300 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} md:relative md:translate-x-0 flex flex-col`}
          style={{
            background: theme === 'dark'
              ? 'linear-gradient(180deg, #0a0a0a 0%, #0d0d10 50%, #0a0a0a 100%)'
              : 'hsl(var(--card))',
          }}
          data-testid="dashboard-sidebar"
        >
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.03]"
            style={{
              backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)',
              backgroundSize: '20px 20px',
            }}
          />

          <div className="h-16 flex items-center justify-between px-6 border-b border-border relative z-10">
            <button
              onClick={() => setActiveView("terminal")}
              className="font-bold text-xl tracking-tighter text-foreground group"
              data-testid="link-console-home"
            >
              <span className="relative">
                DJZS
                <span
                  className="text-transparent bg-clip-text"
                  style={{ backgroundImage: 'linear-gradient(135deg, #9333ea, #06b6d4)' }}
                >
                  .console
                </span>
                <span
                  className="absolute -bottom-1 left-0 h-[2px] w-full rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ background: 'linear-gradient(90deg, #9333ea, #06b6d4)' }}
                />
              </span>
            </button>
            <button
              onClick={() => setSidebarOpen(false)}
              className="md:hidden text-muted-foreground hover:text-foreground transition-colors"
              data-testid="button-close-sidebar"
            >
              <X size={20} />
            </button>
          </div>

          <div className="p-4 flex-1 relative z-10">
            <Link
              href="/"
              className="flex items-center space-x-2 px-3 py-2 mb-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all group"
              data-testid="link-back-home"
            >
              <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
              <span className="text-sm font-medium">Back to Home</span>
            </Link>
            <Link
              href="/chat"
              className="flex items-center justify-between px-3 py-2 mb-4 rounded-lg transition-all group"
              style={{
                border: '1px solid rgba(243,126,32,0.2)',
                background: 'rgba(243,126,32,0.05)',
              }}
              data-testid="link-djzs-workspace"
            >
              <div className="flex items-center space-x-2">
                <Bot size={16} className="text-orange-400/80" />
                <span className="text-sm font-bold text-foreground/80 group-hover:text-foreground transition-colors">DJZS.ai Workspace</span>
              </div>
              <ExternalLink size={12} className="text-muted-foreground/40 group-hover:text-orange-400 transition-colors" />
            </Link>

            <div className="text-[10px] font-mono text-muted-foreground/40 mb-4 px-2 tracking-[0.2em] uppercase">System Navigation</div>
            <nav className="space-y-1">
              {navItems.map((item) => {
                const isActive = activeView === item.view;
                return (
                  <button
                    key={item.name}
                    onClick={() => {
                      setActiveView(item.view);
                      setSidebarOpen(false);
                    }}
                    className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all group relative ${
                      isActive
                        ? "text-cyan-400"
                        : "text-muted-foreground hover:text-foreground border border-transparent"
                    }`}
                    style={isActive ? {
                      background: theme === 'dark' ? 'rgba(6,182,212,0.08)' : 'rgba(6,182,212,0.06)',
                      border: '1px solid rgba(6,182,212,0.2)',
                      boxShadow: '0 0 12px rgba(6,182,212,0.05)',
                    } : undefined}
                    data-testid={`nav-${item.name.toLowerCase().replace(/\s/g, "-")}`}
                  >
                    {isActive && (
                      <span
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full"
                        style={{ background: 'linear-gradient(180deg, #06b6d4, #9333ea)' }}
                      />
                    )}
                    <span className={`${isActive ? "text-cyan-400" : "text-muted-foreground/50 group-hover:text-cyan-400"} transition-colors`}>
                      {item.icon}
                    </span>
                    <span className="font-medium text-sm">{item.name}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="p-4 border-t border-border mt-auto space-y-1 relative z-10">
            <button
              onClick={toggleTheme}
              className="flex items-center space-x-3 w-full px-3 py-2.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
              data-testid="button-toggle-theme"
            >
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
              <span className="font-medium text-sm">{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
            </button>
            <button
              onClick={() => disconnect()}
              className="flex items-center space-x-3 w-full px-3 py-2.5 rounded-lg text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-all"
              data-testid="button-disconnect"
            >
              <LogOut size={18} />
              <span className="font-medium text-sm">Disconnect</span>
            </button>
          </div>
        </aside>

        <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
          <header
            className="h-16 flex items-center justify-between px-6 backdrop-blur-xl border-b border-border sticky top-0 z-30"
            style={{
              background: theme === 'dark'
                ? 'rgba(10,10,10,0.85)'
                : 'hsl(var(--card) / 0.9)',
            }}
          >
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden text-muted-foreground hover:text-foreground transition-colors"
              data-testid="button-open-sidebar"
            >
              <Menu size={20} />
            </button>

            <div className="flex-1" />

            <div className="flex items-center space-x-4">
              <div
                className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-md"
                style={{
                  background: 'rgba(34,197,94,0.08)',
                  border: '1px solid rgba(34,197,94,0.2)',
                }}
                data-testid="status-network"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400" />
                </span>
                <span className="text-xs font-mono text-green-400 tracking-wide">BASE MAINNET</span>
              </div>
              <ConnectButton
                accountStatus="address"
                chainStatus="none"
                showBalance={false}
              />
            </div>
          </header>

          <div className="flex-1 overflow-y-auto p-6 md:p-8 relative">
            <div
              className="absolute inset-0 pointer-events-none opacity-[0.015]"
              style={{
                backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)',
                backgroundSize: '24px 24px',
              }}
            />
            <div className="relative z-10">
              {children}
            </div>
          </div>
        </main>
      </div>
    </DashboardContext.Provider>
  );
}
