import { motion } from "framer-motion";
import { Link } from "wouter";
import { ArrowLeft, Shield, HardDrive, Lock, Fingerprint, Eye, Server, Smartphone, CheckCircle, MessageSquareLock, Cpu, AlertTriangle, Sun, Moon, Database, ShieldCheck } from "lucide-react";
import { useTheme } from "@/lib/theme";

export default function Security() {
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
              DJZS / SECURITY
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
            Security
          </h1>
          <p className="text-lg text-muted-foreground mb-12 leading-relaxed">
            How DJ-Z-S.box protects your privacy and keeps you in control.
          </p>

          {/* Security Commitment Banner */}
          <div className="p-6 rounded-lg bg-gradient-to-br from-green-500/10 to-transparent border border-green-500/20 mb-12">
            <div className="flex items-start gap-4">
              <Shield className="w-8 h-8 text-green-400 shrink-0" />
              <div>
                <h2 className="text-foreground font-bold mb-2">Our Security Commitment</h2>
                <p className="text-sm leading-relaxed">
                  DJ-Z-S.box does not store private keys, custody assets, or initiate transactions on behalf of users. 
                  Wallet connections are used only with explicit user consent for authentication purposes.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-12 text-sm leading-relaxed border-l border-border pl-8">
            <section>
              <h2 className="text-foreground font-black uppercase tracking-widest mb-4 flex items-center gap-3">
                <span className="font-mono text-xs" style={{ color: '#F37E20' }}>01</span> No Custody, No Risk
              </h2>
              <div className="space-y-4">
                <p>
                  DJ-Z-S.box is a <strong className="text-foreground">non-custodial</strong> application. This means:
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                    <span>We <strong className="text-foreground">never</strong> have access to your private keys or seed phrases</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                    <span>We <strong className="text-foreground">cannot</strong> move, transfer, or access your funds</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                    <span>We <strong className="text-foreground">do not</strong> initiate any transactions automatically</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                    <span>Your wallet is used <strong className="text-foreground">only</strong> for authentication (signing messages)</span>
                  </li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-foreground font-black uppercase tracking-widest mb-4 flex items-center gap-3">
                <span className="font-mono text-xs" style={{ color: '#F37E20' }}>02</span> Local-First Architecture
              </h2>
              <div className="grid gap-4">
                <div className="p-4 rounded-lg bg-muted border border-border flex gap-4">
                  <HardDrive className="w-5 h-5 text-orange-400 shrink-0" />
                  <div>
                    <h3 className="text-foreground font-bold mb-1">Data Stays on Your Device</h3>
                    <p className="text-xs">All audit records, research notes, and memories are stored in your browser's IndexedDB. This data never leaves your device unless you explicitly deploy an audit or export it.</p>
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-muted border border-border flex gap-4">
                  <Smartphone className="w-5 h-5 text-orange-400 shrink-0" />
                  <div>
                    <h3 className="text-foreground font-bold mb-1">Works Offline</h3>
                    <p className="text-xs">The core Architect Console functionality works without an internet connection. Your reasoning doesn't depend on our servers being online.</p>
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-muted border border-border flex gap-4">
                  <Server className="w-5 h-5 text-orange-400 shrink-0" />
                  <div>
                    <h3 className="text-foreground font-bold mb-1">No Server-Side Storage</h3>
                    <p className="text-xs">We do not permanently store your personal data, audit records, or research on any server. When you deploy an audit, your reasoning trace is sent to Venice AI over HTTPS/TLS (not end-to-end encrypted — Venice sees the plaintext to compute a response). Venice claims no data retention.</p>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-foreground font-black uppercase tracking-widest mb-4 flex items-center gap-3">
                <span className="font-mono text-xs" style={{ color: '#F37E20' }}>03</span> User-Initiated Actions Only
              </h2>
              <p className="mb-4">
                Every action in DJ-Z-S.box requires your explicit consent:
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <Lock className="w-4 h-4 text-orange-400 mt-0.5 shrink-0" />
                  <span><strong className="text-foreground">Wallet connection</strong> — Only happens when you click "Connect Wallet"</span>
                </li>
                <li className="flex items-start gap-3">
                  <Lock className="w-4 h-4 text-orange-400 mt-0.5 shrink-0" />
                  <span><strong className="text-foreground">AI queries</strong> — Only sent when you explicitly ask for insights</span>
                </li>
                <li className="flex items-start gap-3">
                  <Lock className="w-4 h-4 text-orange-400 mt-0.5 shrink-0" />
                  <span><strong className="text-foreground">Web searches</strong> — Only performed when you initiate a research query</span>
                </li>
                <li className="flex items-start gap-3">
                  <Lock className="w-4 h-4 text-orange-400 mt-0.5 shrink-0" />
                  <span><strong className="text-foreground">No background requests</strong> — Nothing happens without visible user action</span>
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-foreground font-black uppercase tracking-widest mb-4 flex items-center gap-3">
                <span className="font-mono text-xs" style={{ color: '#F37E20' }}>04</span> Wallet Security
              </h2>
              <div className="p-4 rounded-lg bg-muted border border-border mb-4">
                <div className="flex items-start gap-3">
                  <Fingerprint className="w-5 h-5 text-orange-400 shrink-0" />
                  <div>
                    <h3 className="text-foreground font-bold mb-2">What Wallet Connection Does</h3>
                    <ul className="space-y-2 text-xs">
                      <li>• Reads your <strong className="text-foreground">public address</strong> (already public on the blockchain)</li>
                      <li>• May request message signing for authentication (requires your approval)</li>
                      <li>• Resolves your ENS name for display (if you have one)</li>
                    </ul>
                  </div>
                </div>
              </div>
              <div className="p-4 rounded-lg bg-red-500/5 border border-red-500/20">
                <div className="flex items-start gap-3">
                  <Eye className="w-5 h-5 text-red-400 shrink-0" />
                  <div>
                    <h3 className="text-foreground font-bold mb-2">What Wallet Connection Does NOT Do</h3>
                    <ul className="space-y-2 text-xs">
                      <li>• Does <strong className="text-foreground">not</strong> access your private keys</li>
                      <li>• Does <strong className="text-foreground">not</strong> request transaction permissions</li>
                      <li>• Does <strong className="text-foreground">not</strong> approve any token spending</li>
                      <li>• Does <strong className="text-foreground">not</strong> interact with smart contracts automatically</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-foreground font-black uppercase tracking-widest mb-4 flex items-center gap-3">
                <span className="font-mono text-xs" style={{ color: '#F37E20' }}>05</span> Two Communication Channels
              </h2>
              <p className="mb-4">
                DJZS uses two distinct communication channels with different security properties. We separate them clearly so you know exactly what's protected and how.
              </p>

              <div className="grid gap-4 mb-6">
                <div className="p-5 rounded-lg border" style={{ background: 'rgba(46,139,139,0.08)', borderColor: 'rgba(46,139,139,0.25)' }}>
                  <div className="flex items-start gap-4">
                    <MessageSquareLock className="w-6 h-6 shrink-0" style={{ color: '#2E8B8B' }} />
                    <div>
                      <h3 className="text-foreground font-bold mb-2">Channel A: XMTP Messaging (E2E Encrypted)</h3>
                      <p className="text-xs mb-3">Communication between you and the DJZS agent uses the XMTP network.</p>
                      <ul className="space-y-2 text-xs">
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-3.5 h-3.5 text-green-400 mt-0.5 shrink-0" />
                          <span>Messages are <strong className="text-foreground">encrypted client-side</strong> — only you and the recipient can read them</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-3.5 h-3.5 text-green-400 mt-0.5 shrink-0" />
                          <span><strong className="text-foreground">MLS protocol</strong> with forward secrecy and post-compromise security</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-3.5 h-3.5 text-green-400 mt-0.5 shrink-0" />
                          <span><strong className="text-foreground">XWING KEM</strong> quantum-resistant key encapsulation on Welcome messages</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-3.5 h-3.5 text-green-400 mt-0.5 shrink-0" />
                          <span>Distributed across a <strong className="text-foreground">censorship-resistant</strong> network of nodes</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="p-5 rounded-lg border" style={{ background: 'rgba(243,126,32,0.06)', borderColor: 'rgba(243,126,32,0.2)' }}>
                  <div className="flex items-start gap-4">
                    <Cpu className="w-6 h-6 text-orange-400 shrink-0" />
                    <div>
                      <h3 className="text-foreground font-bold mb-2">Channel B: Venice AI Inference (HTTPS/TLS)</h3>
                      <p className="text-xs mb-3">When you deploy an audit, the reasoning trace is sent to Venice for adversarial analysis.</p>
                      <ul className="space-y-2 text-xs">
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-3.5 h-3.5 text-green-400 mt-0.5 shrink-0" />
                          <span>Data is <strong className="text-foreground">encrypted in transit</strong> via HTTPS/TLS</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-3.5 h-3.5 text-green-400 mt-0.5 shrink-0" />
                          <span>Venice claims <strong className="text-foreground">no data retention</strong> and no training on your inputs</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <AlertTriangle className="w-3.5 h-3.5 text-yellow-400 mt-0.5 shrink-0" />
                          <span>This is <strong className="text-foreground">not end-to-end encrypted</strong> — Venice must see your plaintext prompt to compute a response</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <AlertTriangle className="w-3.5 h-3.5 text-yellow-400 mt-0.5 shrink-0" />
                          <span>Quantum resistance does <strong className="text-foreground">not</strong> apply to Venice API calls</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-muted border border-border">
                <p className="text-xs leading-relaxed">
                  <strong className="text-foreground">In short:</strong> XMTP handles messaging with full E2E encryption. Venice handles AI inference over standard HTTPS — encrypted in transit but not end-to-end. We are transparent about this distinction because trust requires honesty.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-foreground font-black uppercase tracking-widest mb-4 flex items-center gap-3">
                <span className="font-mono text-xs" style={{ color: '#F37E20' }}>06</span> AI Provider Privacy
              </h2>
              <p className="mb-4">
                When you use AI features, only the context you select is transmitted:
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                  <span><strong className="text-foreground">Venice AI</strong> — Claims no data retention or training on your inputs. Your prompt is sent over HTTPS/TLS (not E2E encrypted)</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                  <span><strong className="text-foreground">Irys Datachain</strong> — Permanent, immutable audit provenance with public verification</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                  <span><strong className="text-foreground">Minimal transmission</strong> — Only the current entry + memory context is sent, not your entire history</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                  <span><strong className="text-foreground">User-initiated only</strong> — Nothing is sent unless you explicitly deploy an audit or run a research query</span>
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-foreground font-black uppercase tracking-widest mb-4 flex items-center gap-3">
                <span className="font-mono text-xs" style={{ color: '#F37E20' }}>07</span> A2A Audit API Security
              </h2>
              <p className="mb-4">
                The DJZS audit API (<code className="text-xs px-1.5 py-0.5 rounded bg-white/5 text-orange-300">POST /api/audit</code>) is designed for autonomous agent consumption with the following security properties:
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                  <span><strong className="text-foreground">x402 Payment Gate</strong> — Every audit request must include a valid x402 payment header (USDC on Base). Requests without payment receive HTTP 402 Payment Required.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                  <span><strong className="text-foreground">SHA-256 Cryptographic Hashing</strong> — Every input memo is hashed with SHA-256. The hash is returned in the audit response, enabling on-chain verification and tamper detection.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                  <span><strong className="text-foreground">Zod Schema Validation</strong> — All request inputs and audit outputs are validated against strict Zod schemas, preventing malformed data from entering the system.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                  <span><strong className="text-foreground">No Data Retention</strong> — Strategy memos are processed in real-time and not stored. Venice AI claims no data retention on inference requests.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                  <span><strong className="text-foreground">Structured Output</strong> — Audit responses are machine-readable JSON with typed fields (risk_score, primary_bias_detected, logic_flaws, structural_recommendations), preventing injection or ambiguous output.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                  <span><strong className="text-foreground">Phala TEE Hardware Enclave</strong> — The Oracle runs inside a Phala Cloud Trusted Execution Environment (CVM). Private keys for Venice AI, Irys wallet, and x402 payment verification are isolated in hardware and never touch disk. Even the host operator cannot access secrets at runtime.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                  <span><strong className="text-foreground">Irys Datachain Provenance</strong> — Every completed audit certificate is permanently uploaded to Irys Datachain. Certificates are tamper-proof, publicly verifiable via gateway URL, and include a unique <code className="text-xs px-1.5 py-0.5 rounded bg-white/5 text-orange-300">irys_tx_id</code> for independent verification at <code className="text-xs px-1.5 py-0.5 rounded bg-white/5 text-orange-300">GET /api/audit/verify/:txId</code>.</span>
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-foreground font-black uppercase tracking-widest mb-4 flex items-center gap-3">
                <span className="font-mono text-xs" style={{ color: '#F37E20' }}>07b</span> Trusted Execution Environment (TEE)
              </h2>
              <p className="mb-4">
                The DJZS Oracle is deployed inside a <strong className="text-foreground">Phala Cloud Confidential Virtual Machine (CVM)</strong> — a hardware-isolated enclave that provides cryptographic guarantees about secret management:
              </p>

              <div className="grid gap-4 mb-6">
                <div className="p-5 rounded-lg border" style={{ background: 'rgba(46,139,139,0.08)', borderColor: 'rgba(46,139,139,0.25)' }}>
                  <div className="flex items-start gap-4">
                    <ShieldCheck className="w-6 h-6 shrink-0" style={{ color: '#2E8B8B' }} />
                    <div>
                      <h3 className="text-foreground font-bold mb-2">Hardware-Isolated Secret Management</h3>
                      <ul className="space-y-2 text-xs">
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-3.5 h-3.5 text-green-400 mt-0.5 shrink-0" />
                          <span><strong className="text-foreground">Venice AI API key</strong> — Stored inside the TEE, never exposed to the host</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-3.5 h-3.5 text-green-400 mt-0.5 shrink-0" />
                          <span><strong className="text-foreground">Irys wallet private key</strong> — Used to sign and upload certificates, isolated in hardware</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-3.5 h-3.5 text-green-400 mt-0.5 shrink-0" />
                          <span><strong className="text-foreground">x402 payment verification keys</strong> — Payment gate secrets never touch disk</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-3.5 h-3.5 text-green-400 mt-0.5 shrink-0" />
                          <span><strong className="text-foreground">Remote attestation</strong> — The CVM produces a cryptographic attestation proving the code running inside the enclave has not been tampered with</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="p-5 rounded-lg border" style={{ background: 'rgba(243,126,32,0.06)', borderColor: 'rgba(243,126,32,0.2)' }}>
                  <div className="flex items-start gap-4">
                    <Database className="w-6 h-6 text-orange-400 shrink-0" />
                    <div>
                      <h3 className="text-foreground font-bold mb-2">Irys Datachain: Immutable Certificate Storage</h3>
                      <p className="text-xs mb-3">After the Oracle completes an audit, the ProofOfLogic certificate is permanently uploaded to Irys Datachain.</p>
                      <ul className="space-y-2 text-xs">
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-3.5 h-3.5 text-green-400 mt-0.5 shrink-0" />
                          <span><strong className="text-foreground">Permanent storage</strong> — Certificates cannot be deleted or modified after upload</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-3.5 h-3.5 text-green-400 mt-0.5 shrink-0" />
                          <span><strong className="text-foreground">Public verification</strong> — Anyone can verify a certificate via the Irys gateway URL or the <code className="text-xs px-1 py-0.5 rounded bg-white/5 text-orange-300">GET /api/audit/verify/:txId</code> endpoint</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-3.5 h-3.5 text-green-400 mt-0.5 shrink-0" />
                          <span><strong className="text-foreground">Provenance chain</strong> — Each certificate includes <code className="text-xs px-1 py-0.5 rounded bg-white/5 text-orange-300">irys_tx_id</code>, <code className="text-xs px-1 py-0.5 rounded bg-white/5 text-orange-300">irys_url</code>, input hash, and timestamp for complete audit trail</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-muted border border-border">
                <p className="text-xs leading-relaxed">
                  <strong className="text-foreground">Security guarantee:</strong> The TEE ensures that even the DJZS operator cannot extract private keys or tamper with the audit pipeline. Combined with Irys immutability, this creates a verifiable trust chain from audit request → AI inference → permanent certificate.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-foreground font-black uppercase tracking-widest mb-4 flex items-center gap-3">
                <span className="font-mono text-xs" style={{ color: '#F37E20' }}>09</span> Security Best Practices
              </h2>
              <p className="mb-4">
                To maximize your security while using DJ-Z-S.box:
              </p>
              <ul className="space-y-3">
                <li>• Use a hardware wallet for the strongest protection</li>
                <li>• Never share your seed phrase with anyone</li>
                <li>• Verify the URL is <strong className="text-foreground">dj-z-s.box</strong> before connecting</li>
                <li>• Keep your browser and wallet software updated</li>
                <li>• Disconnect your wallet when not actively using the app</li>
              </ul>
            </section>

            <section>
              <h2 className="text-foreground font-black uppercase tracking-widest mb-4 flex items-center gap-3">
                <span className="font-mono text-xs" style={{ color: '#F37E20' }}>10</span> Report a Vulnerability
              </h2>
              <p>
                If you discover a security vulnerability, please report it responsibly through our 
                official channels. We take all security reports seriously and will respond promptly.
              </p>
            </section>
          </div>

          <div className="mt-20 pt-12 border-t border-border text-center">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/80">
              © 2026 DJZS SYSTEM / SECURITY THROUGH SIMPLICITY
            </p>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
