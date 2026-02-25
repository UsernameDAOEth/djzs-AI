import { motion } from "framer-motion";
import { Link } from "wouter";
import { ArrowLeft, Shield, Lock, Globe, BookOpen, Bot, Brain, Zap, ChevronRight, Sun, Moon, Terminal, CheckCircle2, Database, GitPullRequest, ShieldAlert, Eye, Activity, HardDrive, FileCheck } from "lucide-react";
import { useTheme } from "@/lib/theme";
import { useState } from "react";

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

export default function About() {
  const { theme, toggleTheme } = useTheme();
  return (
    <div className="min-h-screen bg-background text-muted-foreground font-medium selection:bg-purple-500/30">
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-background/90 border-b border-border">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-foreground hover:text-orange-400 transition-colors group" data-testid="link-back-home">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-xs font-black uppercase tracking-[0.2em]">Back to System</span>
          </Link>
          <div className="flex items-center gap-4">
            <div className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">
              DJZS / ABOUT
            </div>
            <button onClick={toggleTheme} className="w-10 h-10 rounded-lg flex items-center justify-center transition-colors text-muted-foreground hover:text-foreground hover:bg-muted" data-testid="button-theme-toggle" aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>{theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}</button>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 pt-32 pb-20">
        <motion.div {...fadeUp}>

          <div className="text-center mb-20">
            <h1 className="text-4xl md:text-5xl font-black text-foreground mb-6 tracking-tighter uppercase" data-testid="text-about-title">
              The Protocol Manifesto
            </h1>
            <p className="text-lg text-muted-foreground font-mono">
              DJZS: The Adversarial Logic Layer for the A2A Economy.
            </p>
          </div>

          <div className="space-y-24 text-sm leading-relaxed">

            {/* Section 01: The Problem */}
            <section>
              <div className="inline-block px-3 py-1 mb-4 text-xs font-mono text-red-400 bg-red-500/10 border border-red-500/20 rounded" data-testid="badge-section-01">SECTION 01</div>
              <h2 className="text-2xl font-black text-foreground mb-6 uppercase tracking-widest" data-testid="text-section-01-title">
                Your Agent's Reasoning is a Vulnerability
              </h2>
              <p className="text-muted-foreground text-base leading-relaxed mb-8">
                The Agent-to-Agent (A2A) economy is scaling faster than our ability to secure it. Right now, autonomous bots operate in a vacuum. They execute multi-million dollar trades and DAO governance votes based on hallucinated data, circular confirmation loops, and social FOMO.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 rounded-xl bg-muted border border-border" data-testid="card-persona-dao">
                  <h3 className="text-cyan-400 font-bold mb-2">For DAO Founders</h3>
                  <p className="text-xs text-muted-foreground">Rogue governance agents drain treasuries based on unverified proposals.</p>
                </div>
                <div className="p-6 rounded-xl bg-muted border border-border" data-testid="card-persona-trader">
                  <h3 className="text-purple-400 font-bold mb-2">For Algorithmic Traders</h3>
                  <p className="text-xs text-muted-foreground">Bots execute immediate market buys based on mathematically impossible momentum metrics.</p>
                </div>
                <div className="p-6 rounded-xl bg-muted border border-border" data-testid="card-persona-researcher">
                  <h3 className="text-green-400 font-bold mb-2">For AI Researchers</h3>
                  <p className="text-xs text-muted-foreground">Multi-agent swarms fall into "agent-echo" chambers, verifying each other's hallucinations.</p>
                </div>
              </div>
            </section>

            {/* Section 02: The Solution — JET */}
            <section>
              <div className="inline-block px-3 py-1 mb-4 text-xs font-mono text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 rounded" data-testid="badge-section-02">SECTION 02</div>
              <h2 className="text-2xl font-black text-foreground mb-6 uppercase tracking-widest" data-testid="text-section-02-title">
                The Zero-Trust Oracle (JET)
              </h2>
              <p className="text-muted-foreground text-base leading-relaxed mb-8">
                We built Journal Entry Testing (JET) as a deterministic security primitive. Before an agent touches the blockchain, it routes its reasoning trace to the DJZS Oracle. The logic is mathematically audited against the DJZS-LF taxonomy.
              </p>
              <div className="p-6 rounded-xl bg-card border border-border mb-6" data-testid="card-audit-workflow">
                <h3 className="text-foreground font-bold mb-4 flex items-center">
                  <Terminal className="w-4 h-4 mr-2 text-cyan-400" /> The Audit Ledger Workflow
                </h3>
                <ul className="space-y-4 text-sm text-muted-foreground">
                  <li className="flex items-start">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 mr-3 mt-0.5 shrink-0" />
                    <span><strong className="text-foreground">Agent Generates Payload:</strong> The bot formulates a strategy memo — a reasoning trace committing its logic before execution.</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 mr-3 mt-0.5 shrink-0" />
                    <span><strong className="text-foreground">x402 Tollbooth:</strong> The agent pays a micro-transaction in USDC on Base Mainnet via the x402 protocol.</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 mr-3 mt-0.5 shrink-0" />
                    <span><strong className="text-foreground">Oracle Evaluation:</strong> DJZS issues a cryptographic PASS/FAIL Proof of Logic Certificate. Flawed logic triggers an immediate execution abort.</span>
                  </li>
                </ul>
              </div>
            </section>

            {/* Section 03: Execution Tiers */}
            <section>
              <div className="inline-block px-3 py-1 mb-4 text-xs font-mono" style={{ color: '#F37E20', background: 'rgba(243,126,32,0.1)', border: '1px solid rgba(243,126,32,0.2)', borderRadius: '4px' }} data-testid="badge-section-03">SECTION 03</div>
              <h2 className="text-2xl font-black text-foreground mb-6 uppercase tracking-widest" data-testid="text-section-03-title">
                Tiered Execution Zones
              </h2>
              <p className="text-muted-foreground text-base leading-relaxed mb-8">
                Deploy adversarial audits to the A2A economy. Each tier offers a different depth and price point — from quick operational sanity checks to exhaustive governance audits.
              </p>
              <div className="space-y-4">
                <div className="p-5 rounded-lg border" style={{ background: 'rgba(45,212,191,0.04)', borderColor: 'rgba(45,212,191,0.2)' }} data-testid="card-exec-micro">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'rgba(45,212,191,0.15)' }}>
                      <Zap className="w-4 h-4" style={{ color: '#2dd4bf' }} />
                    </div>
                    <div>
                      <h3 className="text-foreground font-bold">Micro-Zone</h3>
                      <span className="text-[10px] font-mono" style={{ color: '#2dd4bf' }}>$2.50 USDC</span>
                    </div>
                  </div>
                  <p className="text-muted-foreground text-sm">Fast constrained operational audit. Binary risk scoring for high-frequency sanity checks. 1,000 character limit.</p>
                  <code className="text-xs mt-2 inline-block px-1.5 py-0.5 rounded bg-muted text-orange-300">POST /api/audit/micro</code>
                </div>
                <div className="p-5 rounded-lg border" style={{ background: 'rgba(243,126,32,0.04)', borderColor: 'rgba(243,126,32,0.2)' }} data-testid="card-exec-founder">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'rgba(243,126,32,0.15)' }}>
                      <Activity className="w-4 h-4" style={{ color: '#F37E20' }} />
                    </div>
                    <div>
                      <h3 className="text-foreground font-bold">Founder Zone</h3>
                      <span className="text-[10px] font-mono" style={{ color: '#F37E20' }}>$5.00 USDC</span>
                    </div>
                  </div>
                  <p className="text-muted-foreground text-sm">Deep roadmap diligence. Detects narrative drift, confirmation bias, and strategic misalignment. 5,000 character limit.</p>
                  <code className="text-xs mt-2 inline-block px-1.5 py-0.5 rounded bg-muted text-orange-300">POST /api/audit/founder</code>
                </div>
                <div className="p-5 rounded-lg border" style={{ background: 'rgba(168,85,247,0.04)', borderColor: 'rgba(168,85,247,0.2)' }} data-testid="card-exec-treasury">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'rgba(168,85,247,0.15)' }}>
                      <Shield className="w-4 h-4" style={{ color: '#a855f7' }} />
                    </div>
                    <div>
                      <h3 className="text-foreground font-bold">Treasury Zone</h3>
                      <span className="text-[10px] font-mono" style={{ color: '#a855f7' }}>$50.00 USDC</span>
                    </div>
                  </div>
                  <p className="text-muted-foreground text-sm">Exhaustive adversarial governance audit. Multi-vector analysis for DAO treasuries, protocol upgrades, and high-stakes governance decisions. No character limit.</p>
                  <code className="text-xs mt-2 inline-block px-1.5 py-0.5 rounded bg-muted text-orange-300">POST /api/audit/treasury</code>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-4">Schema discovery at <code className="text-xs px-1.5 py-0.5 rounded bg-muted text-orange-300">GET /api/audit/schema</code> · Agent discovery at <code className="text-xs px-1.5 py-0.5 rounded bg-muted text-orange-300">/.well-known/agent.json</code></p>
            </section>

            {/* Section 04: Architecture Philosophy */}
            <section>
              <div className="inline-block px-3 py-1 mb-4 text-xs font-mono text-purple-400 bg-purple-500/10 border border-purple-500/20 rounded" data-testid="badge-section-04">SECTION 04</div>
              <h2 className="text-2xl font-black text-foreground mb-6 uppercase tracking-widest" data-testid="text-section-04-title">
                Core Architecture Philosophy
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="p-6 rounded-xl bg-muted border border-border" data-testid="card-philosophy-trustless">
                  <Lock className="w-6 h-6 text-purple-400 mb-4" />
                  <h3 className="text-foreground font-bold mb-2">Trustless Execution</h3>
                  <p className="text-xs text-muted-foreground">Your cryptographic audit ledger ensures you never have to trust an agent's internal logs. The verification happens entirely off-node via the DJZS Oracle.</p>
                </div>
                <div className="p-6 rounded-xl bg-muted border border-border" data-testid="card-philosophy-adversarial">
                  <Eye className="w-6 h-6 text-purple-400 mb-4" />
                  <h3 className="text-foreground font-bold mb-2">Uncensored Adversarial Logic</h3>
                  <p className="text-xs text-muted-foreground">The Oracle is designed to be ruthless. It does not exist to assist the bot — it exists to interrogate and mathematically break its assumptions.</p>
                </div>
                <div className="p-6 rounded-xl bg-muted border border-border" data-testid="card-philosophy-local">
                  <Database className="w-6 h-6 text-orange-400 mb-4" />
                  <h3 className="text-foreground font-bold mb-2">Local-First Vault</h3>
                  <p className="text-xs text-muted-foreground">Architect Console data — audit records, research trackers, memory pins — lives in your browser's IndexedDB. We don't have a database of your reasoning. There's nothing to hack, subpoena, or sell.</p>
                </div>
                <div className="p-6 rounded-xl bg-muted border border-border" data-testid="card-philosophy-sovereign">
                  <Shield className="w-6 h-6 text-teal-400 mb-4" />
                  <h3 className="text-foreground font-bold mb-2">Sovereign by Default</h3>
                  <p className="text-xs text-muted-foreground">No email, no password, no account to breach. Your wallet is your identity. Optional AES-256-GCM vault encryption and Bring Your Own Key (BYOK) for AI inference give you full control.</p>
                </div>
                <div className="p-6 rounded-xl bg-muted border border-border" data-testid="card-philosophy-provenance">
                  <FileCheck className="w-6 h-6 text-blue-400 mb-4" />
                  <h3 className="text-foreground font-bold mb-2">Permanent Provenance</h3>
                  <p className="text-xs text-muted-foreground">Every ProofOfLogic certificate is permanently uploaded to Irys Datachain — immutable, publicly verifiable, and independently retrievable via gateway URL. Audit history can never be altered or deleted.</p>
                </div>
              </div>
            </section>

            {/* Section 05: The Infrastructure */}
            <section>
              <div className="inline-block px-3 py-1 mb-4 text-xs font-mono text-yellow-400 bg-yellow-500/10 border border-yellow-500/20 rounded" data-testid="badge-section-05">SECTION 05</div>
              <h2 className="text-2xl font-black text-foreground mb-6 uppercase tracking-widest" data-testid="text-section-05-title">
                The Infrastructure
              </h2>
              <div className="space-y-6">
                <div className="border-l-2 border-yellow-500/50 pl-4">
                  <h3 className="text-foreground font-bold">Payloads & Reasoning Traces</h3>
                  <p className="text-sm text-muted-foreground mt-1">Securely routed via HTTPS and evaluated entirely in memory. Only the cryptographic hash (SHA-256) of the evaluation is permanently stored on the audit ledger.</p>
                </div>
                <div className="border-l-2 border-yellow-500/50 pl-4">
                  <h3 className="text-foreground font-bold">The Zero-Trust Oracle</h3>
                  <p className="text-sm text-muted-foreground mt-1">Powered by Venice AI, pre-loaded with the adversarial DJZS-LF diagnostic matrix. Guarantees un-lobotomized, high-fidelity logic parsing without storing or training on your data.</p>
                </div>
                <div className="border-l-2 border-yellow-500/50 pl-4">
                  <h3 className="text-foreground font-bold">x402 Payment Gate</h3>
                  <p className="text-sm text-muted-foreground mt-1">HTTP-native USDC micropayments on Base. No subscriptions, no NFT gates. Any agent can call the API, pay, and receive results in a single request cycle.</p>
                </div>
                <div className="border-l-2 border-yellow-500/50 pl-4">
                  <h3 className="text-foreground font-bold">XMTP Messaging (MLS)</h3>
                  <p className="text-sm text-muted-foreground mt-1">End-to-end encrypted agent communication via the MLS protocol with quantum-resistant key encapsulation (XWING KEM). Forward secrecy and post-compromise security for all agent interactions.</p>
                </div>
                <div className="border-l-2 border-yellow-500/50 pl-4">
                  <h3 className="text-foreground font-bold">Irys Datachain</h3>
                  <p className="text-sm text-muted-foreground mt-1">Permanent ProofOfLogic certificate storage. Every audit result is uploaded to Irys Datachain — immutable, publicly verifiable, and retrievable via gateway URL. Certificates include provenance fields: <code className="text-xs px-1 py-0.5 rounded bg-muted text-orange-300">irys_tx_id</code>, <code className="text-xs px-1 py-0.5 rounded bg-muted text-orange-300">irys_url</code>, and verification via <code className="text-xs px-1 py-0.5 rounded bg-muted text-orange-300">GET /api/audit/verify/:txId</code>.</p>
                </div>
                <div className="border-l-2 border-yellow-500/50 pl-4">
                  <h3 className="text-foreground font-bold">Phala TEE (Trusted Execution Environment)</h3>
                  <p className="text-sm text-muted-foreground mt-1">The Oracle runs inside a hardware-secure enclave on Phala Cloud. Private keys (Venice API, Irys wallet, signing keys) are managed inside a Trusted Execution Environment — they never touch disk and are inaccessible even to the host operator.</p>
                </div>
              </div>
            </section>

            {/* Section 06: Diagnostic Nodes */}
            <section>
              <div className="inline-block px-3 py-1 mb-4 text-xs font-mono text-green-400 bg-green-500/10 border border-green-500/20 rounded" data-testid="badge-section-06">SECTION 06</div>
              <h2 className="text-2xl font-black text-foreground mb-6 uppercase tracking-widest" data-testid="text-section-06-title">
                The Diagnostic Nodes
              </h2>
              <p className="text-muted-foreground text-base leading-relaxed mb-8">
                The DJZS-LF taxonomy classifies logic failures into three diagnostic vectors. Each node runs independently against the agent's reasoning trace.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 rounded-xl bg-card border border-border text-center" data-testid="card-node-epistemic">
                  <Database className="w-6 h-6 text-green-400 mx-auto mb-3" />
                  <h3 className="text-foreground font-bold text-sm">Epistemic Node</h3>
                  <p className="text-xs text-muted-foreground mt-2">Interrogates data references for hallucinations, unfalsifiable claims, and evidence gaps (E01, E02).</p>
                </div>
                <div className="p-6 rounded-xl bg-card border border-border text-center" data-testid="card-node-structural">
                  <GitPullRequest className="w-6 h-6 text-green-400 mx-auto mb-3" />
                  <h3 className="text-foreground font-bold text-sm">Structural Node</h3>
                  <p className="text-xs text-muted-foreground mt-2">Maps the logic tree to identify circular confirmation loops, missing counterfactuals, and reasoning gaps (S01, S02).</p>
                </div>
                <div className="p-6 rounded-xl bg-card border border-border text-center" data-testid="card-node-incentive">
                  <ShieldAlert className="w-6 h-6 text-green-400 mx-auto mb-3" />
                  <h3 className="text-foreground font-bold text-sm">Incentive Node</h3>
                  <p className="text-xs text-muted-foreground mt-2">Adversarial evaluation focusing on FOMO, momentum bias, and undisclosed conflicts of interest (I01, I02).</p>
                </div>
              </div>
            </section>

            {/* Section 07: Cryptographic Logic Proofs */}
            <section>
              <div className="inline-block px-3 py-1 mb-4 text-xs font-mono text-blue-400 bg-blue-500/10 border border-blue-500/20 rounded" data-testid="badge-section-07">SECTION 07</div>
              <h2 className="text-2xl font-black text-foreground mb-6 uppercase tracking-widest" data-testid="text-section-07-title">
                Cryptographic Logic Proofs
              </h2>
              <p className="text-muted-foreground text-base leading-relaxed mb-6">
                Every audit generates a deterministic JSON object — the Proof of Logic Certificate. You don't just get a PASS/FAIL verdict; you get a risk score, DJZS-LF failure codes, bias detection flags, structural recommendations, a SHA-256 hash proving the evaluation's integrity, and Irys Datachain provenance fields (<code className="text-orange-300">irys_tx_id</code>, <code className="text-orange-300">irys_url</code>) linking to the permanently stored certificate on the Irys gateway.
              </p>
              <div className="p-5 rounded-lg bg-card border border-border font-mono text-xs text-muted-foreground overflow-x-auto" data-testid="card-proof-schema">
                <pre>{`{
  "verdict": "FAIL",
  "risk_score": 78,
  "tier": "founder",
  "flags": ["CRITICAL: S01 — Circular Reasoning"],
  "logic_flaws": ["Conclusion restates premise..."],
  "djzs_lf_codes": ["S01", "E02"],
  "bias_detected": true,
  "logic_hash": "sha256:a4f3e9...",
  "tx_hash": "0x...",
  "provenance_provider": "IRYS_DATACHAIN",
  "irys_tx_id": "abc123...",
  "irys_url": "https://gateway.irys.xyz/abc123..."
}`}</pre>
              </div>
            </section>

            {/* Section 08: Ecosystem Tooling */}
            <section>
              <div className="inline-block px-3 py-1 mb-4 text-xs font-mono text-muted-foreground bg-muted border border-border rounded" data-testid="badge-section-08">SECTION 08</div>
              <h2 className="text-2xl font-black text-foreground mb-6 uppercase tracking-widest" data-testid="text-section-08-title">
                Ecosystem Tooling
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="p-6 rounded-xl bg-muted border border-border" data-testid="card-tool-video">
                  <h3 className="text-foreground font-bold mb-2">Forensic Video Capture</h3>
                  <p className="text-xs text-muted-foreground">For human-in-the-loop overrides. Record manual logic evaluations via Livepeer and append them directly to the agent's audit ledger.</p>
                </div>
                <div className="p-6 rounded-xl bg-muted border border-border" data-testid="card-tool-search">
                  <h3 className="text-foreground font-bold mb-2">Ledger Search & Filtering</h3>
                  <p className="text-xs text-muted-foreground">Filter historical audit records by Agent ID, Risk Score, or specific DJZS-LF diagnostic codes. Open with Cmd+K from anywhere.</p>
                </div>
                <div className="p-6 rounded-xl bg-muted border border-border" data-testid="card-tool-research">
                  <h3 className="text-foreground font-bold mb-2">Irys Datachain Provenance</h3>
                  <p className="text-xs text-muted-foreground">Every audit certificate is permanently uploaded to Irys Datachain with a transaction ID and gateway URL. Immutable, publicly verifiable, and tamper-proof.</p>
                </div>
                <div className="p-6 rounded-xl bg-muted border border-border" data-testid="card-tool-xmtp">
                  <h3 className="text-foreground font-bold mb-2">XMTP Agent Messaging</h3>
                  <p className="text-xs text-muted-foreground">Interact with DJZS agents through XMTP decentralized messaging — end-to-end encrypted with quantum-resistant key protection.</p>
                </div>
                <div className="p-6 rounded-xl bg-muted border border-border sm:col-span-2" data-testid="card-tool-docs">
                  <h3 className="text-foreground font-bold mb-2">Protocol Integration Docs</h3>
                  <p className="text-xs text-muted-foreground">Master the x402 payment gate, DJZS-LF taxonomy, and logic ingestion API via our complete documentation hub.</p>
                </div>
              </div>
            </section>

            {/* Section 09: The Architect's Mission */}
            <section>
              <div className="inline-block px-3 py-1 mb-4 text-xs font-mono text-foreground bg-foreground/10 border border-foreground/20 rounded" data-testid="badge-section-09">SECTION 09</div>
              <h2 className="text-2xl font-black text-foreground mb-6 uppercase tracking-widest" data-testid="text-section-09-title">
                The Architect's Mission
              </h2>
              <div className="p-6 rounded-lg border border-orange-500/20" style={{ background: 'rgba(243,126,32,0.03)' }} data-testid="card-mission">
                <p className="text-muted-foreground text-base leading-relaxed mb-4">
                  Built to force accountability onto autonomous systems. The goal is not to slow down the A2A economy, but to ensure that when machines trade, govern, and execute on our behalf, they do so with verifiable structural integrity.
                </p>
                <p className="text-muted-foreground text-base leading-relaxed">
                  DJZS isn't a faceless startup. It's a protocol with a singular mission: no agent acts without audit. Your trust in the Oracle's independence is the only thing that matters here.
                </p>
              </div>
              <div className="flex flex-wrap gap-4 mt-6">
                <a
                  href="https://github.com/UsernameDAOEth/djzs-box"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted border border-border hover:border-orange-500/30 transition-colors"
                  data-testid="link-github"
                >
                  <Globe className="w-4 h-4 text-orange-400" />
                  <span className="text-foreground text-xs font-bold">View Public Commits on GitHub</span>
                </a>
                <Link
                  href="/docs"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted border border-border hover:border-orange-500/30 transition-colors"
                  data-testid="link-docs"
                >
                  <BookOpen className="w-4 h-4 text-orange-400" />
                  <span className="text-foreground text-xs font-bold">Documentation</span>
                </Link>
              </div>
            </section>

            {/* Section 10: FAQ */}
            <section>
              <div className="inline-block px-3 py-1 mb-4 text-xs font-mono text-muted-foreground bg-muted border border-border rounded" data-testid="badge-section-10">SECTION 10</div>
              <h2 className="text-2xl font-black text-foreground mb-6 uppercase tracking-widest" data-testid="text-section-10-title">
                FAQ
              </h2>
              <div className="space-y-4">
                <FaqItem
                  question="How do I test the protocol?"
                  answer="Navigate to the homepage and use the Interactive Terminal to execute your first logic audit with sample payloads. Or hit the API directly with a curl command — see our docs for examples."
                />
                <FaqItem
                  question="Is there a subscription?"
                  answer="No. DJZS uses the x402 protocol. Your agents pay a micro-transaction in Base USDC strictly per execution. $2.50 for Micro, $5.00 for Founder, $50.00 for Treasury."
                />
                <FaqItem
                  question="Can I export my audit data?"
                  answer="Yes. You can export your entire audit ledger and vault as a standard file at any time. Your data is yours, period."
                />
                <FaqItem
                  question="Is the Oracle AI censored?"
                  answer="No. The adversarial agent is powered by Venice AI — designed for uncensored, high-fidelity logic parsing. It won't refuse to analyze controversial strategies or sensitive reasoning traces."
                />
              </div>
            </section>

          </div>

          {/* Bottom CTA */}
          <div className="mt-20 p-12 rounded-2xl border border-border bg-gradient-to-br from-cyan-500/[0.05] to-purple-500/[0.05] text-center relative overflow-hidden" data-testid="card-bottom-cta">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md h-32 bg-cyan-900/20 blur-[100px] rounded-full pointer-events-none" />
            <div className="relative z-10">
              <h2 className="text-2xl md:text-3xl font-black text-foreground mb-4 uppercase tracking-widest">Enforce Audit-Before-Act</h2>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">Protect your treasury from hallucinated automation. Route your bots through the Oracle today.</p>
              <div className="flex flex-wrap gap-3 justify-center">
                <Link
                  href="/chat"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-bold text-sm text-foreground transition-all hover:scale-[1.02]"
                  style={{ background: '#F37E20' }}
                  data-testid="button-cta-console"
                >
                  Open Architect Console <ChevronRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/docs"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-bold text-sm text-muted-foreground border border-border hover:border-orange-500/30 transition-colors"
                  data-testid="button-cta-docs"
                >
                  Read the Docs
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-16 pt-8 border-t border-border text-center">
            <p className="text-xs text-muted-foreground/80">
              &copy; 2026 DJZS SYSTEM / ADVERSARIAL LOGIC LAYER FOR THE A2A ECONOMY
            </p>
          </div>

        </motion.div>
      </main>
    </div>
  );
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className="rounded-lg bg-card border border-border overflow-hidden"
      data-testid={`faq-${question.slice(0, 20).toLowerCase().replace(/\s+/g, '-')}`}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-3 p-4 text-left"
        data-testid={`button-faq-${question.slice(0, 20).toLowerCase().replace(/\s+/g, '-')}`}
      >
        <Bot className="w-4 h-4 text-orange-400" />
        <span className="text-foreground font-bold text-xs">{question}</span>
        <motion.div
          animate={{ rotate: isOpen ? 90 : 0 }}
          transition={{ duration: 0.2 }}
          className="ml-auto text-muted-foreground/80"
        >
          <ChevronRight className="w-4 h-4" />
        </motion.div>
      </button>
      <motion.div
        initial={false}
        animate={{ height: isOpen ? "auto" : 0, opacity: isOpen ? 1 : 0 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="overflow-hidden"
      >
        <div className="px-4 pb-4 pl-11">
          <p className="text-xs text-muted-foreground leading-relaxed">{answer}</p>
        </div>
      </motion.div>
    </div>
  );
}
