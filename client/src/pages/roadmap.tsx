import { motion } from "framer-motion";
import { Link } from "wouter";
import { ArrowLeft, Check, Circle, Rocket, Scissors, Sun, Moon, Compass } from "lucide-react";

const roadmapPhases = [
  {
    phase: "01",
    title: "Core Ritual Engine",
    status: "completed",
    quarter: "Q4 2025",
    items: [
      { text: "Journal Zone: daily entry → AI reflection → summary → pattern-over-time", done: true },
      { text: "Local-first vault architecture (IndexedDB / Dexie)", done: true },
      { text: "Wallet-based authentication (RainbowKit / Base)", done: true },
      { text: "Video journal: record & playback via Livepeer", done: true },
    ],
  },
  {
    phase: "02",
    title: "Thinking Partner & Depth",
    status: "completed",
    quarter: "Q1 2026",
    items: [
      { text: "Thinking Partner: challenges assumptions in Journal, synthesizes in Research", done: true },
      { text: "Research Zone: Brave Mode privacy-first search + Web Mode + Explain Mode", done: true },
      { text: "Research tracker management & claim tracking with trust levels", done: true },
      { text: "Cross-zone linking (claims ↔ journal entries)", done: true },
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
      { text: "Journal-to-research correlation & personalized AI tuning", done: false },
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
  { text: "Community governance framework", reason: "Ritual over governance — focus on helping individuals think, not building committees." },
  { text: "Plugin marketplace", reason: "Depth over breadth — one tool that works deeply beats a platform that does everything shallowly." },
  { text: "Ecosystem APIs for developers", reason: "Too early — build the ritual first, open the platform later." },
  { text: "Full hardware device", reason: "Software-first prototypes let us learn what rituals stick before investing in atoms." },
];

export default function Roadmap() {
  return (
    <div className="min-h-screen text-gray-400 font-medium selection:bg-orange-500/30" style={{ background: '#0F1115' }}>
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b border-white/[0.06]" style={{ background: 'rgba(15,17,21,0.8)' }}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-white hover:text-orange-400 transition-colors group" data-testid="link-back-to-system">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-xs font-black uppercase tracking-[0.2em]">Back to System</span>
          </Link>
          <div className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">
            DJZS / ROADMAP
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 pt-32 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tighter uppercase" data-testid="text-roadmap-title">
            Roadmap
          </h1>
          <p className="text-sm text-gray-500 mb-12 font-mono" data-testid="text-roadmap-subtitle">What's built. What's next. What got cut.</p>

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
                        : "bg-white/5 border border-white/10"
                    }`} style={phase.status === "active" ? { background: '#F37E20' } : undefined}>
                      {phase.status === "completed" ? (
                        <Check className="w-5 h-5 text-orange-400" />
                      ) : phase.status === "active" ? (
                        <Rocket className="w-4 h-4 text-white" />
                      ) : (
                        <Circle className="w-4 h-4 text-gray-600" />
                      )}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-4">
                      <span className="font-mono text-xs" style={{ color: '#F37E20' }}>{phase.phase}</span>
                      <h2 className="text-xl font-black text-white uppercase tracking-widest" data-testid={`text-phase-title-${phase.phase}`}>
                        {phase.title}
                      </h2>
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded ${
                        phase.status === "completed"
                          ? "bg-orange-500/20 text-orange-400"
                          : phase.status === "active"
                          ? "bg-green-500/20 text-green-400"
                          : "bg-white/5 text-gray-500"
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
                            item.done ? "bg-orange-500" : "bg-gray-700"
                          }`} />
                          <span className={item.done ? "text-gray-400" : "text-gray-600"}>
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
            className="mt-16 p-8 rounded-lg border border-white/[0.06]"
            style={{ background: 'rgba(15,17,21,0.6)' }}
          >
            <div className="flex items-center gap-3 mb-6">
              <Scissors className="w-5 h-5 text-gray-500" />
              <h3 className="text-white font-black uppercase tracking-widest" data-testid="text-what-got-cut-title">
                What Got Cut
              </h3>
            </div>
            <p className="text-xs text-gray-600 mb-6 font-mono">
              Not every good idea belongs in v1. These were cut deliberately, not forgotten.
            </p>
            <div className="space-y-4">
              {cutItems.map((item, index) => (
                <div key={index} className="flex gap-3" data-testid={`card-cut-item-${index}`}>
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-700 mt-2 shrink-0" />
                  <div>
                    <span className="text-sm text-gray-400 line-through">{item.text}</span>
                    <p className="text-xs text-gray-600 mt-1">{item.reason}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* The Sacred Daily Ritual */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="mt-8 p-8 rounded-lg border border-orange-500/20"
            style={{ background: 'linear-gradient(135deg, rgba(243,126,32,0.08) 0%, rgba(15,17,21,0.6) 100%)' }}
          >
            <div className="flex items-center gap-3 mb-6">
              <Sun className="w-5 h-5" style={{ color: '#FFB84D' }} />
              <h3 className="text-white font-black uppercase tracking-widest" data-testid="text-sacred-ritual-title">
                The Sacred Daily Ritual
              </h3>
            </div>
            <p className="text-xs text-gray-500 mb-8 font-mono">
              The core loop that everything else serves.
            </p>

            <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-stretch">
              {/* Morning */}
              <div className="flex-1 p-5 rounded-lg border border-white/[0.06]" style={{ background: 'rgba(255,184,77,0.06)' }} data-testid="card-morning-reflection">
                <div className="flex items-center gap-2 mb-3">
                  <Sun className="w-4 h-4" style={{ color: '#FFB84D' }} />
                  <span className="text-xs font-black uppercase tracking-widest" style={{ color: '#FFB84D' }} data-testid="text-morning-title">Morning Reflection</span>
                </div>
                <p className="text-sm text-gray-400 leading-relaxed">
                  Open your journal. Write what's on your mind. Let the Thinking Partner challenge your assumptions 
                  and surface patterns you missed. Pin what matters.
                </p>
              </div>

              {/* Arrow */}
              <div className="flex items-center justify-center text-gray-600 text-2xl font-thin md:rotate-0 rotate-90">
                →
              </div>

              {/* Evening */}
              <div className="flex-1 p-5 rounded-lg border border-white/[0.06]" style={{ background: 'rgba(46,139,139,0.06)' }} data-testid="card-evening-synthesis">
                <div className="flex items-center gap-2 mb-3">
                  <Moon className="w-4 h-4" style={{ color: '#2E8B8B' }} />
                  <span className="text-xs font-black uppercase tracking-widest" style={{ color: '#2E8B8B' }} data-testid="text-evening-title">Evening Synthesis</span>
                </div>
                <p className="text-sm text-gray-400 leading-relaxed">
                  Review what you wrote. See connections between your journal and research. 
                  Let insights compound over time. Export what you want to keep forever.
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
              <h3 className="text-white font-black uppercase tracking-widest" data-testid="text-north-star-title">
                The Real North Star
              </h3>
            </div>
            <div className="space-y-4">
              <p className="text-sm text-gray-400 leading-relaxed" data-testid="text-north-star-context">
                1,000 people use DJZS daily. 300 of them pay for it. When you ask them why, 
                they don't talk about features or encryption or decentralization.
              </p>
              <p className="text-sm leading-relaxed" style={{ color: '#FFB84D' }} data-testid="text-north-star-quote">
                They say: "It helps me think clearer."
              </p>
              <p className="text-sm text-gray-500 leading-relaxed" data-testid="text-north-star-mission">
                That's the metric. That's the mission. Everything on this roadmap either 
                serves that sentence or gets cut.
              </p>
            </div>
          </motion.div>

          <div className="mt-20 pt-12 border-t border-white/[0.06] text-center">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-600" data-testid="text-roadmap-footer">
              © 2026 DJZS SYSTEM / EVOLVING
            </p>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
