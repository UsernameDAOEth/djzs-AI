import { motion } from "framer-motion";
import { Link } from "wouter";
import { ArrowLeft, Check, Circle, Rocket } from "lucide-react";

const roadmapPhases = [
  {
    phase: "01",
    title: "Foundation",
    status: "completed",
    quarter: "Q4 2025",
    items: [
      { text: "Local-first vault architecture", done: true },
      { text: "Wallet-based authentication", done: true },
      { text: "Journal Zone with AI reflection", done: true },
      { text: "Research Zone with multi-source analysis", done: true },
    ],
  },
  {
    phase: "02",
    title: "Trade Integration",
    status: "completed",
    quarter: "Q1 2026",
    items: [
      { text: "Trade Zone with x402 protocol", done: true },
      { text: "Real-time market data feeds", done: true },
      { text: "AI-powered trade insights", done: true },
      { text: "On-chain transaction execution", done: true },
    ],
  },
  {
    phase: "03",
    title: "Intelligence Layer",
    status: "active",
    quarter: "Q2 2026",
    items: [
      { text: "Cross-zone pattern recognition", done: true },
      { text: "Personalized AI agent tuning", done: false },
      { text: "Advanced market sentiment analysis", done: false },
      { text: "Automated journal-to-trade correlation", done: false },
    ],
  },
  {
    phase: "04",
    title: "Decentralization",
    status: "upcoming",
    quarter: "Q3 2026",
    items: [
      { text: "Encrypted cloud backup (optional)", done: false },
      { text: "Cross-device vault sync", done: false },
      { text: "XMTP messaging integration", done: false },
      { text: "Community governance framework", done: false },
    ],
  },
  {
    phase: "05",
    title: "Ecosystem",
    status: "upcoming",
    quarter: "Q4 2026",
    items: [
      { text: "Plugin architecture for extensions", done: false },
      { text: "API access for developers", done: false },
      { text: "Mobile-native applications", done: false },
      { text: "Institutional-grade features", done: false },
    ],
  },
];

export default function Roadmap() {
  return (
    <div className="min-h-screen bg-[#050505] text-gray-400 font-medium selection:bg-purple-500/30">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#050505]/80 backdrop-blur-md border-b border-white/[0.05]">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-white hover:text-purple-400 transition-colors group">
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
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tighter uppercase">
            Roadmap
          </h1>
          <p className="text-sm text-gray-500 mb-12 font-mono">Building the future of decentralized thinking</p>

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
                        ? "bg-purple-500/20 border border-purple-500/50" 
                        : phase.status === "active"
                        ? "bg-purple-500 animate-pulse"
                        : "bg-white/5 border border-white/10"
                    }`}>
                      {phase.status === "completed" ? (
                        <Check className="w-5 h-5 text-purple-400" />
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
                      <span className="text-purple-500 font-mono text-xs">{phase.phase}</span>
                      <h2 className="text-xl font-black text-white uppercase tracking-widest">
                        {phase.title}
                      </h2>
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded ${
                        phase.status === "completed"
                          ? "bg-purple-500/20 text-purple-400"
                          : phase.status === "active"
                          ? "bg-green-500/20 text-green-400"
                          : "bg-white/5 text-gray-500"
                      }`}>
                        {phase.quarter}
                      </span>
                    </div>

                    <div className="grid gap-2">
                      {phase.items.map((item, itemIndex) => (
                        <div 
                          key={itemIndex}
                          className="flex items-center gap-3 text-sm"
                        >
                          <div className={`w-1.5 h-1.5 rounded-full ${
                            item.done ? "bg-purple-500" : "bg-gray-700"
                          }`} />
                          <span className={item.done ? "text-gray-400" : "text-gray-600"}>
                            {item.text}
                          </span>
                          {item.done && (
                            <Check className="w-3 h-3 text-purple-500" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-12 p-8 rounded-2xl bg-gradient-to-br from-purple-500/10 to-transparent border border-purple-500/20">
            <h3 className="text-white font-black uppercase tracking-widest mb-3">
              Beyond the Horizon
            </h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              Our vision extends beyond this roadmap. We're building a thinking system that 
              evolves with its users—adapting to new market conditions, integrating emerging 
              technologies, and continuously improving the relationship between human insight 
              and machine intelligence. The future is not a destination; it's a process of 
              becoming.
            </p>
          </div>

          <div className="mt-20 pt-12 border-t border-white/[0.05] text-center">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-600">
              © 2026 DJZS SYSTEM / EVOLVING
            </p>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
