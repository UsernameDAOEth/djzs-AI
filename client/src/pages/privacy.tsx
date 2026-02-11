import { motion } from "framer-motion";
import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";

export default function Privacy() {
  return (
    <div className="min-h-screen text-gray-400 font-medium selection:bg-orange-500/30" style={{ background: '#1a1d2e' }}>
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b border-white/[0.05]" style={{ background: 'rgba(26,29,46,0.8)' }}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-white hover:text-orange-400 transition-colors group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-xs font-black uppercase tracking-[0.2em]">Back to System</span>
          </Link>
          <div className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">
            DJZS / PRIVACY POLICY
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
            Privacy Policy
          </h1>
          <p className="text-sm text-gray-500 mb-12 font-mono">Last updated: January 23, 2026</p>

          {/* Security Commitment Banner */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-green-500/10 to-transparent border border-green-500/20 mb-12">
            <p className="text-sm leading-relaxed">
              <strong className="text-white">DJ-Z-S.box does not store private keys, custody assets, or initiate transactions on behalf of users.</strong> Wallet connections are used only with explicit user consent for authentication purposes. No funds are accessed or moved.
            </p>
          </div>

          <div className="space-y-12 text-sm leading-relaxed border-l border-white/[0.05] pl-8">
            <section>
              <h2 className="text-white font-black uppercase tracking-widest mb-4 flex items-center gap-3">
                <span className="font-mono text-xs" style={{ color: '#E8842C' }}>01</span> Core Principle
              </h2>
              <p>
                DJZS is built on a fundamental principle: your thoughts belong to you. 
                We operate as a local-first thinking system, meaning your data stays on 
                your device unless you explicitly choose otherwise. This application currently runs 
                without on-chain transactions—wallet connection is used only for identity.
              </p>
            </section>

            <section>
              <h2 className="text-white font-black uppercase tracking-widest mb-4 flex items-center gap-3">
                <span className="font-mono text-xs" style={{ color: '#E8842C' }}>02</span> Data We Don't Collect
              </h2>
              <ul className="space-y-3 list-none">
                <li><span className="text-white">• Personal Information:</span> We do not collect names, emails, phone numbers, or any personally identifiable information.</li>
                <li><span className="text-white">• Journal Entries:</span> Your thoughts, reflections, and journal content remain stored locally in your browser's IndexedDB.</li>
                <li><span className="text-white">• Research Data:</span> Your research notes and dossiers are stored locally. When you run a research query, the query text is sent to AI providers for synthesis.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-white font-black uppercase tracking-widest mb-4 flex items-center gap-3">
                <span className="font-mono text-xs" style={{ color: '#E8842C' }}>03</span> Wallet Authentication
              </h2>
              <p className="mb-4">
                Access to DJZS is granted through cryptographic wallet connection. This means:
              </p>
              <ul className="space-y-3 list-disc pl-4">
                <li>We only see your public blockchain address, which is already public by nature.</li>
                <li>We never have access to your private keys or seed phrases.</li>
                <li>Your identity remains pseudonymous—your wallet is your identity.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-white font-black uppercase tracking-widest mb-4 flex items-center gap-3">
                <span className="font-mono text-xs" style={{ color: '#E8842C' }}>04</span> Local-First Architecture
              </h2>
              <p>
                DJZS uses IndexedDB for persistent local storage. All vault data, journal entries, 
                and research notes are stored directly in your browser's IndexedDB. This data 
                persists across sessions but never leaves your device unless you request AI analysis. Clearing browser data 
                will permanently delete this information.
              </p>
            </section>

            <section>
              <h2 className="text-white font-black uppercase tracking-widest mb-4 flex items-center gap-3">
                <span className="font-mono text-xs" style={{ color: '#E8842C' }}>05</span> AI Processing
              </h2>
              <p className="mb-4">
                When you interact with DJZS AI agents:
              </p>
              <ul className="space-y-3 list-disc pl-4">
                <li>Queries may be processed by third-party AI providers to generate responses.</li>
                <li>We minimize data transmission and do not store conversation history on our servers.</li>
                <li>AI-generated insights are for informational purposes only.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-white font-black uppercase tracking-widest mb-4 flex items-center gap-3">
                <span className="font-mono text-xs" style={{ color: '#E8842C' }}>06</span> Data When Using AI
              </h2>
              <p>
                When you click "Think with me" or run a research query, the text you selected 
                is sent to AI providers (Venice AI, Brave Search). These providers claim no data 
                retention and do not train on your inputs. The AI response is saved locally 
                on your device in IndexedDB.
              </p>
            </section>

            <section>
              <h2 className="text-white font-black uppercase tracking-widest mb-4 flex items-center gap-3">
                <span className="font-mono text-xs" style={{ color: '#E8842C' }}>07</span> Third-Party Services
              </h2>
              <p>
                DJZS may integrate with third-party services for market data, AI processing, 
                and blockchain interactions. Each service operates under its own privacy policy. 
                We recommend reviewing the privacy practices of any connected wallets or 
                external services you use.
              </p>
            </section>

            <section>
              <h2 className="text-white font-black uppercase tracking-widest mb-4 flex items-center gap-3">
                <span className="font-mono text-xs" style={{ color: '#E8842C' }}>08</span> Your Rights
              </h2>
              <ul className="space-y-3 list-none">
                <li><span className="text-white">• Data Portability:</span> Export your local vault data at any time through the interface.</li>
                <li><span className="text-white">• Data Deletion:</span> Clear your browser data to remove all locally stored information.</li>
                <li><span className="text-white">• Disconnection:</span> Disconnect your wallet at any time to revoke access.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-white font-black uppercase tracking-widest mb-4 flex items-center gap-3">
                <span className="font-mono text-xs" style={{ color: '#E8842C' }}>09</span> Contact
              </h2>
              <p>
                For privacy-related inquiries, reach out through our official channels. 
                We are committed to transparency and will respond to all legitimate 
                privacy concerns.
              </p>
            </section>
          </div>

          <div className="mt-20 pt-12 border-t border-white/[0.05] text-center">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-600">
              © 2026 DJZS SYSTEM / YOUR DATA, YOUR CONTROL
            </p>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
