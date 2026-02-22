import { useState } from "react";
import { Activity, Terminal, Shield, History, Settings, LogOut, Menu, X, Sun, Moon, ArrowLeft } from "lucide-react";
import { Link, useLocation } from "wouter";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useDisconnect } from "wagmi";
import { useTheme } from "@/lib/theme";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const navItems = [
  { name: "Live Terminal", icon: <Terminal size={18} />, path: "/dashboard" },
  { name: "Audit Ledger", icon: <History size={18} />, path: "/dashboard/ledger" },
  { name: "Risk Parameters", icon: <Shield size={18} />, path: "/dashboard/risk" },
  { name: "API Settings", icon: <Settings size={18} />, path: "/dashboard/settings" },
];

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [location] = useLocation();
  const { disconnect } = useDisconnect();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-background text-foreground font-sans flex overflow-hidden selection:bg-purple-500/30">

      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/80 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
          data-testid="sidebar-overlay"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-300 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} md:relative md:translate-x-0 flex flex-col`}
        data-testid="dashboard-sidebar"
      >
        <div className="h-16 flex items-center justify-between px-6 border-b border-border">
          <Link href="/dashboard" className="font-bold text-xl tracking-tighter text-foreground" data-testid="link-console-home">
            DJZS<span className="text-purple-500">.console</span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden text-muted-foreground hover:text-foreground"
            data-testid="button-close-sidebar"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4 flex-1">
          <Link
            href="/"
            className="flex items-center space-x-2 px-3 py-2 mb-4 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            data-testid="link-back-home"
          >
            <ArrowLeft size={16} />
            <span className="text-sm font-medium">Back to Home</span>
          </Link>
          <div className="text-xs font-mono text-muted-foreground/60 mb-4 px-2">SYSTEM NAVIGATION</div>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = location === item.path;
              return (
                <Link
                  key={item.name}
                  href={item.path}
                  className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors group ${
                    isActive
                      ? "bg-muted text-cyan-400 border border-border"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted border border-transparent"
                  }`}
                  data-testid={`nav-${item.name.toLowerCase().replace(/\s/g, "-")}`}
                >
                  <span className={`${isActive ? "text-cyan-400" : "text-muted-foreground/60 group-hover:text-cyan-400"} transition-colors`}>
                    {item.icon}
                  </span>
                  <span className="font-medium text-sm">{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-border mt-auto space-y-1">
          <button
            onClick={toggleTheme}
            className="flex items-center space-x-3 w-full px-3 py-2.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            data-testid="button-toggle-theme"
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            <span className="font-medium text-sm">{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
          </button>
          <button
            onClick={() => disconnect()}
            className="flex items-center space-x-3 w-full px-3 py-2.5 rounded-lg text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors"
            data-testid="button-disconnect"
          >
            <LogOut size={18} />
            <span className="font-medium text-sm">Disconnect</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <header className="h-16 flex items-center justify-between px-6 bg-card/80 backdrop-blur-md border-b border-border sticky top-0 z-30">
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden text-muted-foreground hover:text-foreground"
            data-testid="button-open-sidebar"
          >
            <Menu size={20} />
          </button>

          <div className="flex-1" />

          <div className="flex items-center space-x-4">
            <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-md bg-green-500/10 border border-green-500/20" data-testid="status-network">
              <Activity size={14} className="text-green-400" />
              <span className="text-xs font-mono text-green-400">BASE MAINNET</span>
            </div>
            <ConnectButton
              accountStatus="address"
              chainStatus="none"
              showBalance={false}
            />
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
