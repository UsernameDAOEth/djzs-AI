import { motion } from "framer-motion";
import { Link } from "wouter";
import { ArrowLeft, Sun, Moon } from "lucide-react";
import { useTheme } from "@/lib/theme";

export default function Privacy() {
  const { theme, toggleTheme } = useTheme();
  return (
    <div className="min-h-screen bg-background text-muted-foreground font-medium selection:bg-orange-500/30">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-background/90 border-b border-border">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-foreground hover:text-orange-400 transition-colors group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-xs font-black uppercase tracking-[0.2em]">Back to System</span>
          </Link>
          <div className="flex items-center gap-4">
            <div className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">
              DJZS / PRIVACY POLICY
            </div>
            <button onClick={toggleTheme} className="w-10 h-10 rounded-lg flex items-center justify-center transition-colors text-muted-foreground hover:text-foreground hover:bg-muted" data-testid="button-theme-toggle" aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>{theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}</button>
          </div>
        </div>
      </nav>
      <main className="max-w-3xl mx-auto px-6 pt-32 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl md:text-5xl font-black text-foreground mb-4 tracking-tighter uppercase">
            Privacy Policy
          </h1>
          <p className="text-sm text-muted-foreground mb-12 font-mono">Last updated: January 23, 2026</p>

          {/* Security Commitment Banner */}
          <div className="p-6 rounded-lg bg-gradient-to-br from-green-500/10 to-transparent border border-green-500/20 mb-12">
            <p className="text-sm leading-relaxed">
              <strong className="text-foreground">DJ-Z-S does not store private keys, custody assets, or initiate transactions on behalf of users.</strong> Wallet connections are used only with explicit user consent for authentication purposes. No funds are accessed or moved.
            </p>
          </div>

          <div className="space-y-12 text-sm leading-relaxed border-l border-border pl-8">
            <section>
              <h2 className="text-foreground font-black uppercase tracking-widest mb-4 flex items-center gap-3">
                <span className="font-mono text-xs" style={{ color: '#F37E20' }}>01</span> Core Principle
              </h2>
              <p>
                DJZS is built on a fundamental principle: your thoughts belong to you. 
                We operate as a local-first thinking system, meaning your data stays on 
                your device unless you explicitly choose otherwise. This application currently runs 
                without on-chain transactions—wallet connection is used only for identity.
              </p>
            </section>

            <section>
              <h2 className="text-foreground font-black uppercase tracking-widest mb-4 flex items-center gap-3">
                <span className="font-mono text-xs" style={{ color: '#F37E20' }}>02</span> Data We Don't Collect
              </h2>
              <ul className="space-y-3 list-none">
                <li><span className="text-foreground">• Personal Information:</span> We do not collect names, emails, phone numbers, or any personally identifiable information.</li>
                <li><span className="text-foreground">• Audit Records:</span> Your reasoning traces, audit results, and vault content remain stored locally in your browser's IndexedDB.</li>
                <li><span className="text-foreground">• Research Data:</span> Your research notes and trackers are stored locally. When you run a research query, the query text is sent to AI providers for synthesis.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-foreground font-black uppercase tracking-widest mb-4 flex items-center gap-3">
                <span className="font-mono text-xs" style={{ color: '#F37E20' }}>03</span> Wallet Authentication
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
              <h2 className="text-foreground font-black uppercase tracking-widest mb-4 flex items-center gap-3">
                <span className="font-mono text-xs" style={{ color: '#F37E20' }}>04</span> Local-First Architecture
              </h2>
              <p>
                DJZS uses IndexedDB for persistent local storage. All vault data, audit records, 
                and research notes are stored directly in your browser's IndexedDB. This data 
                persists across sessions but never leaves your device unless you request AI analysis. Clearing browser data 
                will permanently delete this information.
              </p>
            </section>

            <section>
              <h2 className="text-foreground font-black uppercase tracking-widest mb-4 flex items-center gap-3">
                <span className="font-mono text-xs" style={{ color: '#F37E20' }}>05</span> Two Data Channels
              </h2>
              <p className="mb-4">
                DJZS uses two separate channels with different privacy properties. We distinguish them clearly:
              </p>
              <div className="space-y-4 mb-4">
                <div className="p-4 rounded-lg bg-muted border border-border">
                  <h3 className="text-foreground font-bold mb-2">XMTP Messaging — End-to-End Encrypted</h3>
                  <p className="text-xs leading-relaxed">
                    Messages between you and the DJZS agent travel over the XMTP network with end-to-end encryption (MLS protocol). XMTP nodes cannot read message content. This channel includes forward secrecy, post-compromise security, and quantum-resistant key encapsulation (XWING KEM) on Welcome messages.
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-muted border border-border">
                  <h3 className="text-foreground font-bold mb-2">Venice AI Inference — HTTPS/TLS (Not E2E)</h3>
                  <p className="text-xs leading-relaxed">
                    When you deploy an audit or run a research query, your reasoning trace is sent to Venice AI over HTTPS/TLS. This means your data is encrypted in transit, but Venice must see the plaintext to compute a response. This is standard for all AI inference APIs — it is <strong className="text-foreground">not end-to-end encrypted</strong>. Venice claims no data retention and does not train on your inputs. Quantum resistance does not apply to these API calls.
                  </p>
                </div>
              </div>
              <p className="text-xs" style={{ color: '#9a9bb0' }}>
                Brave Search queries (in Research mode) are also sent over HTTPS/TLS. Brave claims no tracking or profiling. AI-generated insights are saved locally on your device in IndexedDB.
              </p>
            </section>

            <section>
              <h2 className="text-foreground font-black uppercase tracking-widest mb-4 flex items-center gap-3">
                <span className="font-mono text-xs" style={{ color: '#F37E20' }}>06</span> What We Send and When
              </h2>
              <ul className="space-y-3 list-none">
                <li><span className="text-foreground">• User-initiated only:</span> Nothing is sent to any AI provider unless you explicitly deploy an audit or submit a research query.</li>
                <li><span className="text-foreground">• Minimal context:</span> Only your current entry text and selected memory pins are transmitted — not your entire vault history.</li>
                <li><span className="text-foreground">• No server-side storage:</span> We do not permanently store your prompts, entries, or AI responses on any server.</li>
                <li><span className="text-foreground">• Responses saved locally:</span> AI-generated insights are stored in your browser's IndexedDB, not on our infrastructure.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-foreground font-black uppercase tracking-widest mb-4 flex items-center gap-3">
                <span className="font-mono text-xs" style={{ color: '#F37E20' }}>07</span> A2A Audit API Data Handling
              </h2>
              <p className="mb-4">
                DJZS operates an Agent-to-Agent (A2A) audit API at <code className="text-xs px-1.5 py-0.5 rounded bg-white/5 text-orange-300">POST /api/audit</code>. When autonomous agents submit strategy memos for logic audits:
              </p>
              <ul className="space-y-3 list-none">
                <li><span className="text-foreground">• No storage:</span> Submitted strategy memos are processed in real-time and not stored on any server after the response is returned.</li>
                <li><span className="text-foreground">• AI processing:</span> The memo text is sent to Venice AI for adversarial analysis. Venice claims no data retention.</li>
                <li><span className="text-foreground">• Cryptographic hash:</span> A SHA-256 hash of the input memo is included in the audit response for verification purposes. The hash is computed server-side and returned to the caller — the original memo is not retained.</li>
                <li><span className="text-foreground">• Payment data:</span> x402 payment verification is handled by the x402 protocol facilitator. DJZS receives USDC to the treasury wallet but does not store payment metadata beyond what is recorded on-chain.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-foreground font-black uppercase tracking-widest mb-4 flex items-center gap-3">
                <span className="font-mono text-xs" style={{ color: '#F37E20' }}>08</span> Third-Party Services
              </h2>
              <p>
                DJZS may integrate with third-party services for market data, AI processing, 
                and blockchain interactions. Each service operates under its own privacy policy. 
                We recommend reviewing the privacy practices of any connected wallets or 
                external services you use.
              </p>
            </section>

            <section>
              <h2 className="text-foreground font-black uppercase tracking-widest mb-4 flex items-center gap-3">
                <span className="font-mono text-xs" style={{ color: '#F37E20' }}>09</span> Your Rights
              </h2>
              <ul className="space-y-3 list-none">
                <li><span className="text-foreground">• Data Portability:</span> Export your local vault data at any time through the interface.</li>
                <li><span className="text-foreground">• Data Deletion:</span> Clear your browser data to remove all locally stored information.</li>
                <li><span className="text-foreground">• Disconnection:</span> Disconnect your wallet at any time to revoke access.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-foreground font-black uppercase tracking-widest mb-4 flex items-center gap-3">
                <span className="font-mono text-xs" style={{ color: '#F37E20' }}>10</span> Contact
              </h2>
              <p>
                For privacy-related inquiries, reach out through our official channels. 
                We are committed to transparency and will respond to all legitimate 
                privacy concerns.
              </p>
            </section>
          </div>

          <div className="mt-20 pt-12 border-t border-border text-center">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/80">
              © 2026 DJZS SYSTEM / YOUR DATA, YOUR CONTROL
            </p>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
