import { motion } from "framer-motion";
import { Link } from "wouter";
import { ArrowLeft, Sun, Moon } from "lucide-react";
import { useTheme } from "@/lib/theme";

export default function Terms() {
  const { theme, toggleTheme } = useTheme();
  return (
    <div className="min-h-screen bg-background text-gray-400 font-medium selection:bg-orange-500/30">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-background/90 border-b border-border">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-white hover:text-orange-400 transition-colors group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-xs font-black uppercase tracking-[0.2em]">Back to System</span>
          </Link>
          <div className="flex items-center gap-4">
            <div className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">
              DJZS / TERMS OF SERVICE
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
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tighter uppercase">
            Terms of Service
          </h1>
          <p className="text-sm text-gray-500 mb-12 font-mono">Last updated: January 03, 2026</p>

          <div className="space-y-12 text-sm leading-relaxed border-l border-white/[0.06] pl-8">
            <section>
              <h2 className="text-white font-black uppercase tracking-widest mb-4 flex items-center gap-3">
                <span className="font-mono text-xs" style={{ color: '#F37E20' }}>01</span> Purpose
              </h2>
              <p>
                These Terms of Service ("Terms") govern your use of DJZS (the "Service"), 
                an autonomous AI auditing firm operating in the Agent-to-Agent (A2A) economy. 
                The Service includes a web interface for human users and a programmatic API 
                for autonomous agents. By accessing the Service, you agree to be bound by these Terms. 
                If you do not agree, you must not use the Service.
              </p>
            </section>

            <section>
              <h2 className="text-white font-black uppercase tracking-widest mb-4 flex items-center gap-3">
                <span className="font-mono text-xs" style={{ color: '#F37E20' }}>02</span> Definitions
              </h2>
              <ul className="space-y-3 list-none">
                <li><span className="text-white">1. Service</span> refers to the DJZS interface, local-first vaults, A2A audit API, and associated AI agents.</li>
                <li><span className="text-white">2. User</span> means any individual or autonomous agent accessing the Service.</li>
                <li><span className="text-white">3. Zone</span> refers to specific functional environments (Journal, Research, Trade, Decisions, Content, Thinking Partner).</li>
                <li><span className="text-white">4. Audit</span> refers to an adversarial logic analysis performed by the DJZS AI via the A2A API endpoint.</li>
                <li><span className="text-white">5. Agent</span> means any autonomous software system that interacts with the DJZS API programmatically.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-white font-black uppercase tracking-widest mb-4 flex items-center gap-3">
                <span className="font-mono text-xs" style={{ color: '#F37E20' }}>03</span> User Responsibilities & Risk
              </h2>
              <p className="mb-4">
                The Service is provided on an "as is" basis. You acknowledge that:
              </p>
              <ul className="space-y-3 list-disc pl-4">
                <li>Journaling and research data is stored locally in your browser's IndexedDB.</li>
                <li>AI analysis is for informational purposes and does not constitute advice.</li>
                <li>Clearing your browser data will permanently delete locally stored information.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-white font-black uppercase tracking-widest mb-4 flex items-center gap-3">
                <span className="font-mono text-xs" style={{ color: '#F37E20' }}>04</span> Access and Restrictions
              </h2>
              <p>
                DJZS reserves the right to restrict access to certain features for users 
                violating system integrity or bypassing 
                standard interface protocols.
              </p>
            </section>

            <section>
              <h2 className="text-white font-black uppercase tracking-widest mb-4 flex items-center gap-3">
                <span className="font-mono text-xs" style={{ color: '#F37E20' }}>05</span> Data & Privacy
              </h2>
              <p>
                DJZS does not collect personal data. Interactions occur solely through public 
                blockchain addresses. Local-first architecture ensures your thoughts and 
                research remain on your device unless explicitly shared.
              </p>
            </section>

            <section>
              <h2 className="text-white font-black uppercase tracking-widest mb-4 flex items-center gap-3">
                <span className="font-mono text-xs" style={{ color: '#F37E20' }}>06</span> A2A Audit API Usage
              </h2>
              <p className="mb-4">
                The DJZS A2A Audit API (<code className="text-xs px-1.5 py-0.5 rounded bg-white/5 text-orange-300">POST /api/audit</code>) is subject to the following terms:
              </p>
              <ul className="space-y-3 list-disc pl-4">
                <li>Audit responses are generated by AI and represent adversarial analysis, not professional financial, legal, or investment advice.</li>
                <li>Risk scores, bias detection, and recommendations are algorithmic outputs and should not be the sole basis for any financial decision.</li>
                <li>Payment is required via x402 protocol (USDC on Base). Payments are non-refundable once an audit response has been delivered.</li>
                <li>Strategy memos submitted for audit are processed in real-time and are not stored after the response is returned.</li>
                <li>DJZS makes no guarantee of uptime, response time, or availability of the audit API.</li>
                <li>Automated agents using the API must comply with these terms. The operator of an agent is responsible for its usage.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-white font-black uppercase tracking-widest mb-4 flex items-center gap-3">
                <span className="font-mono text-xs" style={{ color: '#F37E20' }}>07</span> No Professional Advice
              </h2>
              <p>
                All information provided through the Service—including AI-generated insights, 
                research synthesis, and A2A audit results—is for informational purposes only. 
                Audit risk scores, bias detection, and recommendations are algorithmic outputs 
                and do not constitute financial, legal, investment, or professional advice. 
                Seek independent advice from qualified professionals before making decisions.
              </p>
            </section>

            <section>
              <h2 className="text-white font-black uppercase tracking-widest mb-4 flex items-center gap-3">
                <span className="font-mono text-xs" style={{ color: '#F37E20' }}>08</span> Limitation of Liability
              </h2>
              <p>
                DJZS shall not be liable for any indirect, incidental, or consequential damages 
                arising from your use of the Service, including but not limited to loss of 
                funds, data, access to local vaults, or decisions made based on audit results. 
                AI-generated audit outputs are provided "as is" without warranty of accuracy, 
                completeness, or fitness for any particular purpose.
              </p>
            </section>
          </div>

          <div className="mt-20 pt-12 border-t border-white/[0.06] text-center">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-600">
              © 2026 DJZS SYSTEM / OPERATIONAL
            </p>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
