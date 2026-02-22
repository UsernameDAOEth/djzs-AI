import { motion } from "framer-motion";
import { Link } from "wouter";
import { ArrowLeft, Check, Circle, Rocket, Scissors, Sun, Moon, Compass } from "lucide-react";
import { useTheme } from "@/lib/theme";

const roadmapPhases = [
  {
    phase: "01",
    title: "Core Audit Engine",
    status: "completed",
    quarter: "Q4 2025",
    items: [
      { text: "Audit Ledger: ProofOfLogic certificates → verdicts → risk scores → DJZS-LF failure codes", done: true },
      { text: "Local-first vault architecture (IndexedDB / Dexie)", done: true },
      { text: "Wallet-based authentication (RainbowKit / Base)", done: true },
      { text: "Forensic video capture: record & playback audit context via Livepeer", done: true },
    ],
  },
  {
    phase: "02",
    title: "Adversarial Oracle & Depth",
    status: "completed",
    quarter: "Q1 2026",
    items: [
      { text: "Adversarial Oracle: pressure-tests reasoning traces, synthesizes cross-zone intelligence", done: true },
      { text: "Research Zone: Brave Mode privacy-first search + Web Mode + Explain Mode", done: true },
      { text: "Research tracker management & claim tracking with trust levels", done: true },
      { text: "Cross-zone linking (claims ↔ audit records)", done: true },
      { text: "Vault export & data portability", done: true },
    ],
  },
  {
    phase: "03",
    title: "A2A Economy & Audit API",
    status: "completed",
    quarter: "Q1 2026",
    items: [
      { text: "x402 payment middleware — $2.50 USDC micropayments on Base via @x402/express", done: true },
      { text: "POST /api/audit — machine-readable logic audit endpoint for autonomous agents", done: true },
      { text: "GET /api/audit/schema — API schema discovery for agent integration", done: true },
      { text: "Adversarial audit agent — Venice AI with structured JSON output (risk_score, bias, logic_flaws, recommendations)", done: true },
      { text: "SHA-256 cryptographic hashing of input memos for on-chain verification", done: true },
      { text: "Audit types: treasury, founder_drift, strategy, general", done: true },
    ],
  },
  {
    phase: "04",
    title: "Insight Compounding",
    status: "active",
    quarter: "Q2 2026",
    items: [
      { text: "OpenClaw headless AI architecture — replacing direct AI calls with proper agent layer", done: false },
      { text: "XMTP Builder Agent as clean dispatcher (intent detection → structured JSON → formatted reply)", done: false },
      { text: "Cross-zone pattern recognition", done: false },
      { text: "Audit-to-research correlation & personalized agent tuning", done: false },
    ],
  },
  {
    phase: "05",
    title: "On-Chain Reputation & Scale",
    status: "upcoming",
    quarter: "Q3 2026",
    items: [
      { text: "ERC-8004 on-chain reputation registry — immutable track record of successful logic audits", done: false },
      { text: "Tiered audit pricing — treasury ($50), founder_drift ($5), micro-audit ($2.50)", done: false },
      { text: "Encryption-at-rest for local vault", done: false },
      { text: "Optional encrypted cloud backup", done: false },
    ],
  },
  {
    phase: "06",
    title: "Consolidation & Portability",
    status: "upcoming",
    quarter: "Q4 2026",
    items: [
      { text: "Cross-device sync (encrypted, optional)", done: false },
      { text: "Mobile-native application", done: false },
    ],
  },
];

const cutItems = [
  { text: "Community governance framework", reason: "Protocol over governance — focus on deterministic verification before building committees." },
  { text: "Plugin marketplace", reason: "Depth over breadth — one audit primitive that works deeply beats a platform that does everything shallowly." },
  { text: "Ecosystem APIs for developers", reason: "Too early — harden the Oracle first, open the platform later." },
  { text: "Full hardware device", reason: "Software-first prototypes let us learn what audit patterns stick before investing in atoms." },
];

export default function Roadmap() {
  const { theme, toggleTheme } = useTheme();
  return (
    <div className="min-h-screen bg-background text-muted-foreground font-medium selection:bg-orange-500/30">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-background/90 border-b border-border">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-foreground hover:text-orange-400 transition-colors group" data-testid="link-back-to-system">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-xs font-black uppercase tracking-[0.2em]">Back to System</span>
          </Link>
          <div className="flex items-center gap-4">
            <div className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">
              DJZS / ROADMAP
            </div>
            <button onClick={toggleTheme} className="w-10 h-10 rounded-lg flex items-center justify-center transition-colors text-muted-foreground hover:text-foreground hover:bg-muted" data-testid="button-theme-toggle" aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>{theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}</button>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 pt-32 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl md:text-5xl font-black text-foreground mb-4 tracking-tighter uppercase" data-testid="text-roadmap-title">
            Roadmap
          </h1>
          <p className="text-sm text-muted-foreground mb-12 font-mono" data-testid="text-roadmap-subtitle">What's built. What's next. What got cut.</p>

          <div className="space-y-0">
            {roadmapPhases.map((phase, index) => (
              <motion.div
                key={phase.phase}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="relative"
              >
                {/* Timeline connector */}
                {index < roadmapPhases.length - 1 && (
                  <div className="absolute left-[19px] top-12 bottom-0 w-px bg-gradient-to-b from-white/10 to-transparent" />
                )}
                
                <div className="flex gap-6 pb-12">
                  {/* Status indicator */}
                  <div className="shrink-0 relative z-10">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      phase.status === "completed" 
                        ? "bg-orange-500/20 border border-orange-500/50" 
                        : phase.status === "active"
                        ? "animate-pulse"
                        : "bg-muted/50 border border-border"
                    }`} style={phase.status === "active" ? { background: '#F37E20' } : undefined}>
                      {phase.status === "completed" ? (
                        <Check className="w-5 h-5 text-orange-400" />
                      ) : phase.status === "active" ? (
                        <Rocket className="w-4 h-4 text-foreground" />
                      ) : (
                        <Circle className="w-4 h-4 text-muted-foreground/80" />
                      )}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-4">
                      <span className="font-mono text-xs" style={{ color: '#F37E20' }}>{phase.phase}</span>
                      <h2 className="text-xl font-black text-foreground uppercase tracking-widest" data-testid={`text-phase-title-${phase.phase}`}>
                        {phase.title}
                      </h2>
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded ${
                        phase.status === "completed"
                          ? "bg-orange-500/20 text-orange-400"
                          : phase.status === "active"
                          ? "bg-green-500/20 text-green-400"
                          : "bg-white/5 text-muted-foreground"
                      }`} data-testid={`status-phase-${phase.phase}`}>
                        {phase.quarter}
                      </span>
                    </div>

                    <div className="grid gap-2">
                      {phase.items.map((item, itemIndex) => (
                        <div 
                          key={itemIndex}
                          className="flex items-center gap-3 text-sm"
                          data-testid={`text-phase-${phase.phase}-item-${itemIndex}`}
                        >
                          <div className={`w-1.5 h-1.5 rounded-full ${
                            item.done ? "bg-orange-500" : "bg-muted-foreground/40"
                          }`} />
                          <span className={item.done ? "text-muted-foreground" : "text-muted-foreground/80"}>
                            {item.text}
                          </span>
                          {item.done && (
                            <Check className="w-3 h-3 text-orange-500" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* What Got Cut */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="mt-16 p-8 rounded-lg border border-border bg-muted"
          >
            <div className="flex items-center gap-3 mb-6">
              <Scissors className="w-5 h-5 text-muted-foreground" />
              <h3 className="text-foreground font-black uppercase tracking-widest" data-testid="text-what-got-cut-title">
                What Got Cut
              </h3>
            </div>
            <p className="text-xs text-muted-foreground/80 mb-6 font-mono">
              Not every good idea belongs in v1. These were cut deliberately, not forgotten.
            </p>
            <div className="space-y-4">
              {cutItems.map((item, index) => (
                <div key={index} className="flex gap-3" data-testid={`card-cut-item-${index}`}>
                  <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 mt-2 shrink-0" />
                  <div>
                    <span className="text-sm text-muted-foreground line-through">{item.text}</span>
                    <p className="text-xs text-muted-foreground/80 mt-1">{item.reason}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* The Audit-Before-Act Loop */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="mt-8 p-8 rounded-lg border border-orange-500/20 bg-gradient-to-br from-orange-500/[0.08] to-muted"
          >
            <div className="flex items-center gap-3 mb-6">
              <Rocket className="w-5 h-5" style={{ color: '#FFB84D' }} />
              <h3 className="text-foreground font-black uppercase tracking-widest" data-testid="text-audit-loop-title">
                The Audit-Before-Act Loop
              </h3>
            </div>
            <p className="text-xs text-muted-foreground mb-8 font-mono">
              The core operational cycle. No agent acts without audit.
            </p>

            <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-stretch">
              {/* Deploy */}
              <div className="flex-1 p-5 rounded-lg border border-border" style={{ background: 'rgba(255,184,77,0.06)' }} data-testid="card-deploy-audit">
                <div className="flex items-center gap-2 mb-3">
                  <Rocket className="w-4 h-4" style={{ color: '#FFB84D' }} />
                  <span className="text-xs font-black uppercase tracking-widest" style={{ color: '#FFB84D' }} data-testid="text-deploy-title">Deploy</span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Submit your reasoning trace to the Oracle. The adversarial agent pressure-tests 
                  your logic, surfaces blind spots, and returns a ProofOfLogic certificate with a deterministic verdict.
                </p>
              </div>

              {/* Arrow */}
              <div className="flex items-center justify-center text-muted-foreground/80 text-2xl font-thin md:rotate-0 rotate-90">
                →
              </div>

              {/* Review */}
              <div className="flex-1 p-5 rounded-lg border border-border" style={{ background: 'rgba(46,139,139,0.06)' }} data-testid="card-review-compound">
                <div className="flex items-center gap-2 mb-3">
                  <Compass className="w-4 h-4" style={{ color: '#2E8B8B' }} />
                  <span className="text-xs font-black uppercase tracking-widest" style={{ color: '#2E8B8B' }} data-testid="text-review-title">Review & Compound</span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Inspect your Audit Ledger. Track DJZS-LF failure codes across deployments. 
                  Let intelligence compound as patterns emerge across audits, research, and decisions.
                </p>
              </div>
            </div>
          </motion.div>

          {/* The Real North Star */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="mt-8 p-8 rounded-lg bg-gradient-to-br from-orange-500/10 to-transparent border border-orange-500/20"
          >
            <div className="flex items-center gap-3 mb-4">
              <Compass className="w-5 h-5" style={{ color: '#F37E20' }} />
              <h3 className="text-foreground font-black uppercase tracking-widest" data-testid="text-north-star-title">
                The Real North Star
              </h3>
            </div>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground leading-relaxed" data-testid="text-north-star-context">
                Autonomous agents will move billions. When the first treasury gets drained by flawed reasoning, 
                the question won't be "who built the agent?" — it will be "why wasn't there an audit?"
              </p>
              <p className="text-sm leading-relaxed" style={{ color: '#FFB84D' }} data-testid="text-north-star-quote">
                "It caught what we missed."
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed" data-testid="text-north-star-mission">
                That's the metric. That's the mission. Everything on this roadmap either 
                serves that sentence or gets cut.
              </p>
            </div>
          </motion.div>

          <div className="mt-20 pt-12 border-t border-border text-center">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/80" data-testid="text-roadmap-footer">
              © 2026 DJZS SYSTEM / EVOLVING
            </p>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
