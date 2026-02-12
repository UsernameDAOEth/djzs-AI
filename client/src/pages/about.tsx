import { motion } from "framer-motion";
import { Link } from "wouter";
import { ArrowLeft, Shield, HardDrive, Bot, Lock, Users, Globe } from "lucide-react";

export default function About() {
  return (
    <div className="min-h-screen text-gray-400 font-medium selection:bg-orange-500/30" style={{ background: '#2A2E3F' }}>
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b border-white/[0.05]" style={{ background: 'rgba(42,46,63,0.8)' }}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-white hover:text-orange-400 transition-colors group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-xs font-black uppercase tracking-[0.2em]">Back to System</span>
          </Link>
          <div className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">
            DJZS / ABOUT
          </div>
        </div>
      </nav>
      <main className="max-w-3xl mx-auto px-6 pt-32 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tighter uppercase">About DJ-Z-S</h1>
          <p className="text-lg text-gray-400 mb-12 leading-relaxed">
            A private, local-first AI journaling partner that helps you think more clearly.
          </p>

          <div className="space-y-12 text-sm leading-relaxed border-l border-white/[0.05] pl-8">
            <section>
              <h2 className="text-white font-black uppercase tracking-widest mb-4 flex items-center gap-3">
                <span className="font-mono text-xs" style={{ color: '#F37E20' }}>01</span> Our Mission
              </h2>
              <p className="mb-4">DJ-Z-S exists to give you a private space for thinking. In a world where every thought is tracked, analyzed, and monetized, we believe your inner dialogue should remain yours alone.</p>
              <p>
                We're building tools that amplify your thinking without capturing it. The AI assists 
                when you ask—it doesn't take over. Your data stays on your device, not our servers.
              </p>
            </section>

            <section>
              <h2 className="text-white font-black uppercase tracking-widest mb-4 flex items-center gap-3">
                <span className="font-mono text-xs" style={{ color: '#F37E20' }}>02</span> What We Don't Do
              </h2>
              <div className="p-6 rounded-xl bg-orange-500/5 border border-orange-500/20 mb-4">
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <span className="text-orange-400 mt-0.5">×</span>
                    <span><strong className="text-white">No custody of funds</strong> — We never hold, access, or control your crypto assets</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-orange-400 mt-0.5">×</span>
                    <span><strong className="text-white">No automatic transactions</strong> — Nothing happens without your explicit approval</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-orange-400 mt-0.5">×</span>
                    <span><strong className="text-white">No data harvesting</strong> — Your entries and research stay on your device</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-orange-400 mt-0.5">×</span>
                    <span><strong className="text-white">No tracking or profiling</strong> — We don't analyze your behavior for ads</span>
                  </li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-white font-black uppercase tracking-widest mb-4 flex items-center gap-3">
                <span className="font-mono text-xs" style={{ color: '#F37E20' }}>03</span> How It Works
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                  <HardDrive className="w-5 h-5 text-orange-400 mb-3" />
                  <h3 className="text-white font-bold mb-2">Local-First Storage</h3>
                  <p className="text-xs">All your data lives in your browser's IndexedDB. Works offline. No cloud sync required.</p>
                </div>
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                  <Lock className="w-5 h-5 text-orange-400 mb-3" />
                  <h3 className="text-white font-bold mb-2">Wallet Authentication</h3>
                  <p className="text-xs">Sign in with your wallet. No email, no password, no account to hack. Your wallet = your identity.</p>
                </div>
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                  <Bot className="w-5 h-5 text-orange-400 mb-3" />
                  <h3 className="text-white font-bold mb-2">Privacy-First AI</h3>
                  <p className="text-xs">Venice AI processes your queries without storing or training on your data. Ask when you need, privacy preserved.</p>
                </div>
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                  <Shield className="w-5 h-5 text-orange-400 mb-3" />
                  <h3 className="text-white font-bold mb-2">User-Initiated Only</h3>
                  <p className="text-xs">Every action requires your explicit consent. No background operations, no silent requests.</p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-white font-black uppercase tracking-widest mb-4 flex items-center gap-3">
                <span className="font-mono text-xs" style={{ color: '#F37E20' }}>04</span> The Team
              </h2>
              <p className="mb-4">
                DJ-Z-S.box is built by a small team of privacy advocates and Web3 builders who 
                believe that the best tools are the ones that respect their users.
              </p>
              <p>
                We're not a VC-backed startup racing to monetize your attention. We're building 
                sustainable software that prioritizes your privacy over our growth metrics.
              </p>
            </section>

            <section>
              <h2 className="text-white font-black uppercase tracking-widest mb-4 flex items-center gap-3">
                <span className="font-mono text-xs" style={{ color: '#F37E20' }}>05</span> Open Development
              </h2>
              <div className="flex flex-wrap gap-4">
                <a 
                  href="https://github.com/UsernameDAOEth/djzs-box" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/[0.02] border border-white/[0.05] hover:border-orange-500/30 transition-colors"
                >
                  <Globe className="w-4 h-4 text-orange-400" />
                  <span className="text-white text-xs font-bold">GitHub</span>
                </a>
                <a 
                  href="https://x.com/Dj_Z_S" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/[0.02] border border-white/[0.05] hover:border-orange-500/30 transition-colors"
                >
                  <Users className="w-4 h-4 text-orange-400" />
                  <span className="text-white text-xs font-bold">X / Twitter</span>
                </a>
                <Link 
                  href="/docs"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/[0.02] border border-white/[0.05] hover:border-orange-500/30 transition-colors"
                >
                  <Shield className="w-4 h-4 text-orange-400" />
                  <span className="text-white text-xs font-bold">Documentation</span>
                </Link>
              </div>
            </section>

            <section>
              <h2 className="text-white font-black uppercase tracking-widest mb-4 flex items-center gap-3">
                <span className="font-mono text-xs" style={{ color: '#F37E20' }}>06</span> Contact
              </h2>
              <p>
                Questions? Reach out via our official channels or open an issue on GitHub. 
                We're committed to transparency and respond to all legitimate inquiries.
              </p>
            </section>
          </div>

          <div className="mt-20 pt-12 border-t border-white/[0.05] text-center">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-600">
              © 2026 DJZS SYSTEM / A THINKING SYSTEM, NOT A NETWORK
            </p>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
