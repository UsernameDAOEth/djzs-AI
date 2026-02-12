import { motion } from "framer-motion";
import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";

export default function Terms() {
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
            DJZS / TERMS OF SERVICE
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

          <div className="space-y-12 text-sm leading-relaxed border-l border-white/[0.05] pl-8">
            <section>
              <h2 className="text-white font-black uppercase tracking-widest mb-4 flex items-center gap-3">
                <span className="font-mono text-xs" style={{ color: '#F37E20' }}>01</span> Purpose
              </h2>
              <p>
                These Terms of Service ("Terms") govern your use of DJZS (the "Service"), 
                a decentralized journaling and thinking system. By accessing the Service, 
                you agree to be bound by these Terms. If you do not agree, you must not use the Service.
              </p>
            </section>

            <section>
              <h2 className="text-white font-black uppercase tracking-widest mb-4 flex items-center gap-3">
                <span className="font-mono text-xs" style={{ color: '#F37E20' }}>02</span> Definitions
              </h2>
              <ul className="space-y-3 list-none">
                <li><span className="text-white">1. Service</span> refers to the DJZS interface, local-first vaults, and associated AI agents.</li>
                <li><span className="text-white">2. User</span> means any individual accessing the Service via a cryptographic wallet.</li>
                <li><span className="text-white">3. Zone</span> refers to specific functional environments (Journal, Research).</li>
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
                <span className="font-mono text-xs" style={{ color: '#F37E20' }}>06</span> No Professional Advice
              </h2>
              <p>
                All information provided through the Service—including AI-generated insights 
                and research synthesis—is for informational purposes only. Seek independent 
                advice from qualified professionals before making decisions.
              </p>
            </section>

            <section>
              <h2 className="text-white font-black uppercase tracking-widest mb-4 flex items-center gap-3">
                <span className="font-mono text-xs" style={{ color: '#F37E20' }}>07</span> Limitation of Liability
              </h2>
              <p>
                DJZS shall not be liable for any indirect, incidental, or consequential damages 
                arising from your use of the Service, including but not limited to loss of 
                funds, data, or access to local vaults.
              </p>
            </section>
          </div>

          <div className="mt-20 pt-12 border-t border-white/[0.05] text-center">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-600">
              © 2026 DJZS SYSTEM / OPERATIONAL
            </p>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
