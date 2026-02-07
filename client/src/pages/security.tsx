import { motion } from "framer-motion";
import { Link } from "wouter";
import { ArrowLeft, Shield, HardDrive, Lock, Fingerprint, Eye, Server, Smartphone, CheckCircle } from "lucide-react";

export default function Security() {
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
            DJZS / SECURITY
          </div>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 pt-32 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tighter uppercase">
            Security
          </h1>
          <p className="text-lg text-gray-400 mb-12 leading-relaxed">
            How DJ-Z-S.box protects your privacy and keeps you in control.
          </p>

          {/* Security Commitment Banner */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-green-500/10 to-transparent border border-green-500/20 mb-12">
            <div className="flex items-start gap-4">
              <Shield className="w-8 h-8 text-green-400 shrink-0" />
              <div>
                <h2 className="text-white font-bold mb-2">Our Security Commitment</h2>
                <p className="text-sm leading-relaxed">
                  DJ-Z-S.box does not store private keys, custody assets, or initiate transactions on behalf of users. 
                  Wallet connections are used only with explicit user consent for authentication purposes.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-12 text-sm leading-relaxed border-l border-white/[0.05] pl-8">
            <section>
              <h2 className="text-white font-black uppercase tracking-widest mb-4 flex items-center gap-3">
                <span className="text-purple-500 font-mono text-xs">01</span> No Custody, No Risk
              </h2>
              <div className="space-y-4">
                <p>
                  DJ-Z-S.box is a <strong className="text-white">non-custodial</strong> application. This means:
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                    <span>We <strong className="text-white">never</strong> have access to your private keys or seed phrases</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                    <span>We <strong className="text-white">cannot</strong> move, transfer, or access your funds</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                    <span>We <strong className="text-white">do not</strong> initiate any transactions automatically</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                    <span>Your wallet is used <strong className="text-white">only</strong> for authentication (signing messages)</span>
                  </li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-white font-black uppercase tracking-widest mb-4 flex items-center gap-3">
                <span className="text-purple-500 font-mono text-xs">02</span> Local-First Architecture
              </h2>
              <div className="grid gap-4">
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] flex gap-4">
                  <HardDrive className="w-5 h-5 text-purple-400 shrink-0" />
                  <div>
                    <h3 className="text-white font-bold mb-1">Data Stays on Your Device</h3>
                    <p className="text-xs">All journal entries, research notes, and memories are stored in your browser's IndexedDB. This data never leaves your device unless you explicitly ask the AI for insights or export it.</p>
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] flex gap-4">
                  <Smartphone className="w-5 h-5 text-purple-400 shrink-0" />
                  <div>
                    <h3 className="text-white font-bold mb-1">Works Offline</h3>
                    <p className="text-xs">The core journaling functionality works without an internet connection. Your thinking doesn't depend on our servers being online.</p>
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] flex gap-4">
                  <Server className="w-5 h-5 text-purple-400 shrink-0" />
                  <div>
                    <h3 className="text-white font-bold mb-1">No Server-Side Storage</h3>
                    <p className="text-xs">We do not permanently store your personal data, journal entries, or research on any server. When you request AI insights, your selected text is sent to privacy-focused AI providers (Venice AI) which claim no data retention.</p>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-white font-black uppercase tracking-widest mb-4 flex items-center gap-3">
                <span className="text-purple-500 font-mono text-xs">03</span> User-Initiated Actions Only
              </h2>
              <p className="mb-4">
                Every action in DJ-Z-S.box requires your explicit consent:
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <Lock className="w-4 h-4 text-purple-400 mt-0.5 shrink-0" />
                  <span><strong className="text-white">Wallet connection</strong> — Only happens when you click "Connect Wallet"</span>
                </li>
                <li className="flex items-start gap-3">
                  <Lock className="w-4 h-4 text-purple-400 mt-0.5 shrink-0" />
                  <span><strong className="text-white">AI queries</strong> — Only sent when you explicitly ask for insights</span>
                </li>
                <li className="flex items-start gap-3">
                  <Lock className="w-4 h-4 text-purple-400 mt-0.5 shrink-0" />
                  <span><strong className="text-white">Web searches</strong> — Only performed when you initiate a research query</span>
                </li>
                <li className="flex items-start gap-3">
                  <Lock className="w-4 h-4 text-purple-400 mt-0.5 shrink-0" />
                  <span><strong className="text-white">No background requests</strong> — Nothing happens without visible user action</span>
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-white font-black uppercase tracking-widest mb-4 flex items-center gap-3">
                <span className="text-purple-500 font-mono text-xs">04</span> Wallet Security
              </h2>
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] mb-4">
                <div className="flex items-start gap-3">
                  <Fingerprint className="w-5 h-5 text-purple-400 shrink-0" />
                  <div>
                    <h3 className="text-white font-bold mb-2">What Wallet Connection Does</h3>
                    <ul className="space-y-2 text-xs">
                      <li>• Reads your <strong className="text-white">public address</strong> (already public on the blockchain)</li>
                      <li>• May request message signing for authentication (requires your approval)</li>
                      <li>• Resolves your ENS name for display (if you have one)</li>
                    </ul>
                  </div>
                </div>
              </div>
              <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/20">
                <div className="flex items-start gap-3">
                  <Eye className="w-5 h-5 text-red-400 shrink-0" />
                  <div>
                    <h3 className="text-white font-bold mb-2">What Wallet Connection Does NOT Do</h3>
                    <ul className="space-y-2 text-xs">
                      <li>• Does <strong className="text-white">not</strong> access your private keys</li>
                      <li>• Does <strong className="text-white">not</strong> request transaction permissions</li>
                      <li>• Does <strong className="text-white">not</strong> approve any token spending</li>
                      <li>• Does <strong className="text-white">not</strong> interact with smart contracts automatically</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-white font-black uppercase tracking-widest mb-4 flex items-center gap-3">
                <span className="text-purple-500 font-mono text-xs">05</span> AI Privacy
              </h2>
              <p className="mb-4">
                When you use AI features, we prioritize your privacy:
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                  <span><strong className="text-white">Venice AI</strong> — Privacy-first AI with no data retention or training on your inputs</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                  <span><strong className="text-white">Brave Search</strong> — No tracking, no profiling, independent search index</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                  <span><strong className="text-white">Minimal transmission</strong> — Only the current context is sent, not your entire history</span>
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-white font-black uppercase tracking-widest mb-4 flex items-center gap-3">
                <span className="text-purple-500 font-mono text-xs">06</span> Security Best Practices
              </h2>
              <p className="mb-4">
                To maximize your security while using DJ-Z-S.box:
              </p>
              <ul className="space-y-3">
                <li>• Use a hardware wallet for the strongest protection</li>
                <li>• Never share your seed phrase with anyone</li>
                <li>• Verify the URL is <strong className="text-white">dj-z-s.box</strong> before connecting</li>
                <li>• Keep your browser and wallet software updated</li>
                <li>• Disconnect your wallet when not actively using the app</li>
              </ul>
            </section>

            <section>
              <h2 className="text-white font-black uppercase tracking-widest mb-4 flex items-center gap-3">
                <span className="text-purple-500 font-mono text-xs">07</span> Report a Vulnerability
              </h2>
              <p>
                If you discover a security vulnerability, please report it responsibly through our 
                official channels. We take all security reports seriously and will respond promptly.
              </p>
            </section>
          </div>

          <div className="mt-20 pt-12 border-t border-white/[0.05] text-center">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-600">
              © 2026 DJZS SYSTEM / SECURITY THROUGH SIMPLICITY
            </p>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
