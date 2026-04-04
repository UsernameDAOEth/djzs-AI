import { Link } from "wouter";
import { 
  Shield, 
  HardDrive, 
  Bot, 
  Lock, 
  Zap, 
  BookOpen, 
  ArrowRight,
  Key,
  ExternalLink,
  Users,
  Database,
  Brain,
  Sparkles,
  FileSearch,
  KeyRound,
  ShieldCheck,
  DollarSign,
  CheckCircle,
  Code2,
  AlertTriangle,
  Activity,
  Sun,
  Moon,
  Cpu,
  MessageSquare,
  Layers,
  Link2
} from "lucide-react";
import { motion } from "framer-motion";
import { useTheme } from "@/lib/theme";
import { TorusLogo } from "@/components/TorusLogo";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

const stagger = {
  show: { transition: { staggerChildren: 0.1 } }
};

const colorMap = {
  orange: { gradient: "from-orange-500/[0.08]", border: "border-orange-500/20 hover:border-orange-500/30", bg: "bg-orange-600/20", text: "text-orange-400", dot: "bg-orange-400" },
  teal: { gradient: "from-teal-500/[0.08]", border: "border-teal-500/20 hover:border-teal-500/30", bg: "bg-teal-600/20", text: "text-teal-400", dot: "bg-teal-400" },
  purple: { gradient: "from-purple-500/[0.08]", border: "border-purple-500/20 hover:border-purple-500/30", bg: "bg-purple-600/20", text: "text-purple-400", dot: "bg-purple-400" },
  blue: { gradient: "from-blue-500/[0.08]", border: "border-blue-500/20 hover:border-blue-500/30", bg: "bg-blue-600/20", text: "text-blue-400", dot: "bg-blue-400" },
  green: { gradient: "from-green-500/[0.08]", border: "border-green-500/20 hover:border-green-500/30", bg: "bg-green-600/20", text: "text-green-400", dot: "bg-green-400" },
  amber: { gradient: "from-amber-500/[0.08]", border: "border-amber-500/20 hover:border-amber-500/30", bg: "bg-amber-600/20", text: "text-amber-400", dot: "bg-amber-400" },
  red: { gradient: "from-red-500/[0.08]", border: "border-red-500/20 hover:border-red-500/30", bg: "bg-red-600/20", text: "text-red-400", dot: "bg-red-400" },
};

interface FeatureCardProps {
  icon: typeof Shield;
  title: string;
  description: string;
  color?: "orange" | "teal" | "purple" | "blue" | "green" | "amber" | "red";
}

function FeatureCard({ icon: Icon, title, description, color = "orange" }: FeatureCardProps) {
  const c = colorMap[color];
  return (
    <div className={`p-6 rounded-lg bg-gradient-to-br ${c.gradient} to-transparent border ${c.border} transition-all`}>
      <div className={`w-10 h-10 rounded-lg ${c.bg} flex items-center justify-center mb-4`}>
        <Icon className={`w-5 h-5 ${c.text}`} />
      </div>
      <h3 className="text-lg font-bold text-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}

interface QuickLinkProps {
  href: string;
  title: string;
  description: string;
  external?: boolean;
  testId?: string;
}

function QuickLink({ href, title, description, external, testId }: QuickLinkProps) {
  const content = (
    <div className="p-5 rounded-lg bg-gradient-to-br from-orange-500/[0.08] to-transparent border border-orange-500/20 hover:border-orange-500/30 transition-all group cursor-pointer" data-testid={testId}>
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-bold text-foreground group-hover:text-orange-300 transition-colors">{title}</h4>
        {external ? (
          <ExternalLink className="w-4 h-4 text-muted-foreground/80 group-hover:text-orange-400 transition-colors" />
        ) : (
          <ArrowRight className="w-4 h-4 text-muted-foreground/80 group-hover:text-orange-400 group-hover:translate-x-1 transition-all" />
        )}
      </div>
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
  );

  if (external) {
    return <a href={href} target="_blank" rel="noopener noreferrer">{content}</a>;
  }
  return <Link href={href}>{content}</Link>;
}

interface TechStackItemProps {
  icon: typeof Shield;
  category: string;
  items: string[];
  color: "orange" | "teal" | "purple" | "blue" | "green" | "amber" | "red";
}

function TechStackItem({ icon: Icon, category, items, color }: TechStackItemProps) {
  const c = colorMap[color];
  return (
    <div className={`p-5 rounded-lg bg-gradient-to-br ${c.gradient} to-transparent border ${c.border} transition-all`}>
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-10 h-10 rounded-lg ${c.bg} flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${c.text}`} />
        </div>
        <h4 className={`text-sm font-bold text-foreground`}>{category}</h4>
      </div>
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={i} className="flex items-center gap-2.5 text-sm text-muted-foreground">
            <span className={`w-1.5 h-1.5 rounded-full ${c.dot} shrink-0`}></span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Docs() {
  const { theme, toggleTheme } = useTheme();
  return (
    <div className="min-h-screen bg-background text-muted-foreground selection:bg-orange-500/30">
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/90 border-b border-border">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/">
            <button className="flex items-center gap-2 text-sm font-bold text-foreground tracking-wide uppercase opacity-60 hover:opacity-100 hover:text-orange-400 transition-all group">
              <TorusLogo size="sm" data-testid="img-logo-docs" />
              <span>DJZS</span>
            </button>
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/chat">
              <button className="text-sm font-bold text-muted-foreground hover:text-foreground transition-colors" data-testid="button-open-app-docs">
                Open App
              </button>
            </Link>
            <button onClick={toggleTheme} className="w-10 h-10 rounded-lg flex items-center justify-center transition-colors text-muted-foreground hover:text-foreground hover:bg-muted" data-testid="button-theme-toggle" aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>{theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}</button>
          </div>
        </div>
      </header>
      <motion.main 
        initial="hidden" 
        animate="show" 
        variants={stagger}
        className="max-w-6xl mx-auto px-6 py-16"
      >
        <motion.div variants={fadeUp} className="text-center mb-20">
          <h1 className="text-4xl md:text-6xl font-black text-foreground tracking-tight mb-6">
            DJZS Documentation
          </h1>
          <div className="flex justify-center gap-4 mt-8">
            <Link href="/chat">
              <button className="px-6 py-3 rounded-lg text-white font-bold transition-colors" style={{ background: '#F37E20' }} data-testid="button-start-writing">
                Open Architect Console
              </button>
            </Link>
          </div>
        </motion.div>

        <motion.section variants={fadeUp} className="mb-20">
          <div className="p-8 rounded-3xl bg-gradient-to-br from-orange-500/10 to-transparent border border-orange-500/20">
            <h2 className="text-2xl font-bold text-foreground mb-4">What is DJZS.AI?</h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p className="text-lg">
                DJZS is the <strong className="text-foreground">Adversarial Logic Layer for the Agent-to-Agent (A2A) economy</strong> — a deterministic verification primitive that enforces an <strong className="text-foreground">"Audit-Before-Act"</strong> loop for autonomous agents. It applies <strong className="text-foreground">Journal Entry Testing (JET)</strong>, a 100-year-old financial security primitive modernized for AI reasoning traces. "Journaling" in DJZS is not a diary — it is the mandatory act of an autonomous agent committing its reasoning trace to an immutable log before executing a transaction.
              </p>
              <p>
                Every audit generates a cryptographic <strong className="text-foreground">Proof of Logic Certificate</strong> with deterministic <code className="text-orange-400 bg-orange-500/10 px-1.5 py-0.5 rounded font-mono text-xs">DJZS-LF</code> failure codes, permanently uploaded to <strong className="text-foreground">Irys Datachain</strong>. If the logic fractures, the transaction dies. DJZS is the Logic Oracle for the decentralized web. It is designed to be <strong className="text-foreground">honest, not helpful</strong>.
              </p>
              <p>
                Two integration channels serve different threat models: the <strong className="text-purple-400">Dark Channel</strong> (XMTP E2E encrypted) provides alpha protection for proprietary trading agents with zero public trace, while the <strong className="text-teal-400">Light Channel</strong> (x402 REST API) provides public provenance for DAO treasury bots with permanent Irys Datachain certificates. Both enforce the same <strong className="text-foreground">Audit-Before-Act</strong> kill switch.
              </p>
            </div>
          </div>
        </motion.section>

        <motion.section variants={fadeUp} className="mb-20" data-testid="section-api-reference">
          <div className="p-8 rounded-3xl bg-gradient-to-br from-teal-500/10 to-transparent border border-teal-500/20">
            <h2 className="text-3xl font-black text-foreground mb-3 tracking-tight">API Reference</h2>
            <p className="text-lg text-muted-foreground mb-4 leading-relaxed max-w-3xl">
              The deterministic kill switch for autonomous trading agents. Submit reasoning, receive a permanent <strong className="text-foreground">ProofOfLogic</strong> verdict.
            </p>
            <p className="text-sm text-muted-foreground mb-8 leading-relaxed max-w-3xl">
              Route your agent's reasoning trace through the Oracle via the <strong className="text-purple-400">Dark Channel</strong> (XMTP E2E encrypted) or <strong className="text-teal-400">Light Channel</strong> (x402 REST API). The Oracle applies <strong className="text-foreground">Journal Entry Testing (JET)</strong> — identifying hallucinations, logical loops, and FOMO bias — then returns a cryptographic <code className="text-teal-400 bg-teal-500/10 px-1.5 py-0.5 rounded font-mono text-xs">ProofOfLogic</code> certificate permanently stored on Irys Datachain.
            </p>
            <div className="p-4 rounded-lg bg-muted border border-border mb-10">
              <p className="text-xs text-muted-foreground font-mono"><span className="text-teal-400 font-bold">Base URL:</span> https://djzs.ai/api</p>
            </div>

            <div className="mb-12">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                  <KeyRound className="w-5 h-5 text-orange-400" />
                </div>
                <h3 className="text-xl font-bold text-foreground">Authentication: The x402 Tollbooth</h3>
              </div>
              <div className="space-y-4 text-sm text-muted-foreground leading-relaxed mb-6">
                <p>
                  DJZS operates strictly on a <strong className="text-foreground">Pay-to-Verify</strong> model. There are no API keys, webhooks, or monthly subscriptions. Access to the Oracle is gated entirely by the <strong className="text-foreground">x402 Payment Protocol</strong> on Base Mainnet.
                </p>
                <p>
                  To successfully authenticate a request, your agent must execute a USDC micro-transaction and inject the resulting on-chain transaction hash into the request header.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="p-4 rounded-lg bg-muted border border-border">
                  <p className="text-[10px] font-bold text-orange-400 uppercase tracking-wider mb-1">Required Header</p>
                  <code className="text-xs text-foreground font-mono">x-payment-proof</code>
                </div>
                <div className="p-4 rounded-lg bg-muted border border-border">
                  <p className="text-[10px] font-bold text-orange-400 uppercase tracking-wider mb-1">Value</p>
                  <code className="text-xs text-foreground font-mono">Base Mainnet TX Hash</code>
                </div>
                <div className="p-4 rounded-lg bg-muted border border-border">
                  <p className="text-[10px] font-bold text-orange-400 uppercase tracking-wider mb-1">Micro-Zone Cost</p>
                  <code className="text-xs text-foreground font-mono">$0.10 USDC</code>
                </div>
              </div>
              <div className="p-4 rounded-lg bg-red-500/[0.04] border border-red-500/15">
                <p className="text-xs text-red-400 font-semibold mb-1">402 Payment Required</p>
                <p className="text-xs text-muted-foreground leading-relaxed">If the header is omitted or the cryptographic hash cannot be verified on-chain, the API will instantly reject the payload with a <code className="text-red-400 font-mono">402 Payment Required</code> status (Error Code: <code className="text-red-400 font-mono">DJZS-AUTH-402</code>).</p>
              </div>
            </div>

            <div className="mb-12">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-teal-500/10 flex items-center justify-center">
                  <Code2 className="w-5 h-5 text-teal-400" />
                </div>
                <h3 className="text-xl font-bold text-foreground">Endpoint: Micro-Zone Audit</h3>
              </div>
              <code className="inline-block text-sm text-teal-300 bg-teal-500/10 px-4 py-2 rounded font-mono font-bold mb-4" data-testid="code-endpoint-micro">POST /audit/micro</code>
              <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                This endpoint accepts a raw strategy payload, evaluates the agent's logic against the DJZS-LF taxonomy, and returns a deterministic Proof of Logic certificate.
              </p>

              <h4 className="text-sm font-bold text-foreground mb-3">Request Schema (JSON)</h4>
              <div className="overflow-x-auto mb-6">
                <table className="w-full text-sm" data-testid="table-request-schema">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Parameter</th>
                      <th className="text-left py-3 px-4 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Type</th>
                      <th className="text-left py-3 px-4 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Required</th>
                      <th className="text-left py-3 px-4 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-border/50">
                      <td className="py-3 px-4"><code className="text-teal-400 font-mono text-xs">strategy_memo</code></td>
                      <td className="py-3 px-4 text-xs text-muted-foreground font-mono">string</td>
                      <td className="py-3 px-4 text-xs font-bold text-foreground">Yes</td>
                      <td className="py-3 px-4 text-xs text-muted-foreground">The complete reasoning trace, internal agent dialogue, or execution plan intended for the transaction.</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-3 px-4"><code className="text-teal-400 font-mono text-xs">agent_id</code></td>
                      <td className="py-3 px-4 text-xs text-muted-foreground font-mono">string</td>
                      <td className="py-3 px-4 text-xs text-muted-foreground">No</td>
                      <td className="py-3 px-4 text-xs text-muted-foreground">Wallet address or XMTP identity. Tagged on the Irys certificate for reputation tracking and fleet analytics.</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-3 px-4"><code className="text-teal-400 font-mono text-xs">trade_params</code></td>
                      <td className="py-3 px-4 text-xs text-muted-foreground font-mono">object</td>
                      <td className="py-3 px-4 text-xs text-muted-foreground">No</td>
                      <td className="py-3 px-4 text-xs text-muted-foreground">Structured trade parameters. The Oracle cross-references these against the strategy_memo narrative to detect parameter/narrative mismatches.</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h4 className="text-sm font-bold text-foreground mb-3"><code className="text-teal-400 font-mono text-xs">trade_params</code> Schema</h4>
              <div className="overflow-x-auto mb-6">
                <table className="w-full text-sm" data-testid="table-trade-params-schema">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Field</th>
                      <th className="text-left py-3 px-4 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Type</th>
                      <th className="text-left py-3 px-4 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Example</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-border/50">
                      <td className="py-2 px-4"><code className="text-teal-400 font-mono text-xs">protocol</code></td>
                      <td className="py-2 px-4 text-xs text-muted-foreground font-mono">string</td>
                      <td className="py-2 px-4 text-xs text-muted-foreground">uniswap, aave, compound</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-2 px-4"><code className="text-teal-400 font-mono text-xs">pair</code></td>
                      <td className="py-2 px-4 text-xs text-muted-foreground font-mono">string</td>
                      <td className="py-2 px-4 text-xs text-muted-foreground">ETH/USD, SOL/USDC</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-2 px-4"><code className="text-teal-400 font-mono text-xs">direction</code></td>
                      <td className="py-2 px-4 text-xs text-muted-foreground font-mono">enum</td>
                      <td className="py-2 px-4 text-xs text-muted-foreground">long, short, neutral</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-2 px-4"><code className="text-teal-400 font-mono text-xs">leverage</code></td>
                      <td className="py-2 px-4 text-xs text-muted-foreground font-mono">number (1-200)</td>
                      <td className="py-2 px-4 text-xs text-muted-foreground">5</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-2 px-4"><code className="text-teal-400 font-mono text-xs">notional_usd</code></td>
                      <td className="py-2 px-4 text-xs text-muted-foreground font-mono">number</td>
                      <td className="py-2 px-4 text-xs text-muted-foreground">50000</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-2 px-4"><code className="text-teal-400 font-mono text-xs">stop_loss_pct</code></td>
                      <td className="py-2 px-4 text-xs text-muted-foreground font-mono">number (0-100)</td>
                      <td className="py-2 px-4 text-xs text-muted-foreground">2.0</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-2 px-4"><code className="text-teal-400 font-mono text-xs">take_profit_pct</code></td>
                      <td className="py-2 px-4 text-xs text-muted-foreground font-mono">number (0-1000)</td>
                      <td className="py-2 px-4 text-xs text-muted-foreground">8.0</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-2 px-4"><code className="text-teal-400 font-mono text-xs">entry_price</code></td>
                      <td className="py-2 px-4 text-xs text-muted-foreground font-mono">number</td>
                      <td className="py-2 px-4 text-xs text-muted-foreground">3200</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-4"><code className="text-teal-400 font-mono text-xs">timeframe</code></td>
                      <td className="py-2 px-4 text-xs text-muted-foreground font-mono">string</td>
                      <td className="py-2 px-4 text-xs text-muted-foreground">4h, 1d, 1w</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="p-4 rounded-lg bg-teal-500/[0.04] border border-teal-500/15 mb-6">
                <p className="text-xs text-muted-foreground leading-relaxed">When <code className="text-teal-400 font-mono">trade_params</code> is provided, the Oracle <strong className="text-foreground">cross-references</strong> the structured parameters against the <code className="text-teal-400 font-mono">strategy_memo</code> narrative. Parameter/narrative mismatches — such as claiming a breakout while entering below the stated level — are flagged as logic ruptures. Missing stop-loss on leveraged trades triggers <code className="text-red-400 font-mono">DJZS-X01</code> (UNHEDGED_EXECUTION).</p>
              </div>

              <h4 className="text-sm font-bold text-foreground mb-3">Example cURL Implementation</h4>
              <div className="relative mb-8" data-testid="code-curl-example">
                <div className="absolute top-0 left-0 right-0 h-8 bg-[#1a1d23] rounded-t-lg flex items-center px-4">
                  <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">bash</span>
                </div>
                <pre className="bg-[#1a1d23] rounded-lg pt-10 pb-5 px-5 overflow-x-auto border border-border/50">
                  <code className="text-xs font-mono leading-relaxed text-muted-foreground">
{`curl -X POST https://djzs.ai/api/audit/micro \\
  -H "Content-Type: application/json" \\
  -H "`}<span className="text-orange-400">x-payment-proof</span>{`: 0x_your_base_mainnet_tx_hash" \\
  -d '{
    "`}<span className="text-teal-400">strategy_memo</span>{`": "Going long ETH based on breakout above 200-day MA.",
    "`}<span className="text-teal-400">agent_id</span>{`": "0x1234...abcd",
    "`}<span className="text-teal-400">trade_params</span>{`": {
      "protocol": "uniswap",
      "pair": "ETH/USD",
      "direction": "long",
      "leverage": 5,
      "notional_usd": 50000,
      "stop_loss_pct": 2.0,
      "take_profit_pct": 8.0,
      "entry_price": 3200,
      "timeframe": "4h"
    }
  }'`}
                  </code>
                </pre>
              </div>
            </div>

            <div className="mb-12">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <FileSearch className="w-5 h-5 text-blue-400" />
                </div>
                <h3 className="text-xl font-bold text-foreground">Endpoint: Verify Certificate</h3>
              </div>
              <code className="inline-block text-sm text-blue-300 bg-blue-500/10 px-4 py-2 rounded font-mono font-bold mb-4" data-testid="code-endpoint-verify">GET /api/audit/verify/:txId</code>
              <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                Verify an existing ProofOfLogic certificate by its Irys Datachain transaction ID. This endpoint fetches the certificate from Irys gateway and returns the full audit record, allowing independent verification of any previously issued certificate.
              </p>
              <h4 className="text-sm font-bold text-foreground mb-3">Path Parameters</h4>
              <div className="overflow-x-auto mb-6">
                <table className="w-full text-sm" data-testid="table-verify-params">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Parameter</th>
                      <th className="text-left py-3 px-4 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Type</th>
                      <th className="text-left py-3 px-4 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-border/50">
                      <td className="py-3 px-4"><code className="text-blue-400 font-mono text-xs">txId</code></td>
                      <td className="py-3 px-4 text-xs text-muted-foreground font-mono">string</td>
                      <td className="py-3 px-4 text-xs text-muted-foreground">The Irys Datachain transaction ID from a previously issued ProofOfLogic certificate.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <h4 className="text-sm font-bold text-foreground mb-3">Example cURL</h4>
              <div className="relative mb-8" data-testid="code-curl-verify">
                <div className="absolute top-0 left-0 right-0 h-8 bg-[#1a1d23] rounded-t-lg flex items-center px-4">
                  <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">bash</span>
                </div>
                <pre className="bg-[#1a1d23] rounded-lg pt-10 pb-5 px-5 overflow-x-auto border border-border/50">
                  <code className="text-xs font-mono leading-relaxed text-muted-foreground">
{`curl https://djzs.ai/api/audit/verify/`}<span className="text-blue-400">abc123xyz</span>
                  </code>
                </pre>
              </div>
              <div className="p-4 rounded-lg bg-blue-500/[0.04] border border-blue-500/15">
                <p className="text-xs text-muted-foreground leading-relaxed">This endpoint is <strong className="text-foreground">public and free</strong> — no x402 payment required. Anyone with an Irys transaction ID can independently verify any ProofOfLogic certificate.</p>
              </div>
            </div>

            <div className="mb-12">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-purple-400" />
                </div>
                <h3 className="text-xl font-bold text-foreground">Response Schema (JSON)</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                The Oracle returns a fully assembled <code className="text-purple-400 bg-purple-500/10 px-1.5 py-0.5 rounded font-mono text-xs">ProofOfLogic</code> object. If the <code className="text-red-400 font-mono text-xs">verdict</code> evaluates to <code className="text-red-400 font-mono text-xs">FAIL</code>, developers are expected to program their agents to automatically abort the execution sequence to prevent capital destruction. The response includes <code className="text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded font-mono text-xs">provenance_provider</code>, <code className="text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded font-mono text-xs">irys_tx_id</code>, and <code className="text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded font-mono text-xs">irys_url</code> fields for permanent certificate verification via Irys Datachain.
              </p>
              <div className="relative mb-4" data-testid="code-response-schema">
                <div className="absolute top-0 left-0 right-0 h-8 bg-[#1a1d23] rounded-t-lg flex items-center px-4">
                  <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">json</span>
                </div>
                <pre className="bg-[#1a1d23] rounded-lg pt-10 pb-5 px-5 overflow-x-auto border border-border/50">
                  <code className="text-xs font-mono leading-relaxed text-muted-foreground">
{`{
  "`}<span className="text-purple-400">system_id</span>{`": "djzs-mainnet-01",
  "`}<span className="text-red-400">verdict</span>{`": "FAIL",
  "`}<span className="text-orange-400">risk_score</span>{`": 60,
  "`}<span className="text-red-400">flags</span>{`": [
    {
      "`}<span className="text-teal-400">code</span>{`": "DJZS-I01",
      "`}<span className="text-teal-400">severity</span>{`": "MEDIUM",
      "`}<span className="text-teal-400">description</span>{`": "Logic relies entirely on social momentum and unverified Twitter sentiment."
    }
  ],
  "`}<span className="text-purple-400">proof</span>{`": {
    "logic_hash": "0x4a9b2c...",
    "timestamp": "2026-02-21T11:45:00Z",
    "payment_verified": true,
    "payment_proof": "0x_your_base_mainnet_tx_hash"
  },
  "`}<span className="text-blue-400">provenance_provider</span>{`": "IRYS_DATACHAIN",
  "`}<span className="text-blue-400">irys_tx_id</span>{`": "abc123xyz...",
  "`}<span className="text-blue-400">irys_url</span>{`": "https://gateway.irys.xyz/abc123xyz..."
}`}
                  </code>
                </pre>
              </div>
            </div>

            <div className="mb-12">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                </div>
                <h3 className="text-xl font-bold text-foreground">DJZS-LF v1 Taxonomy (Failure Codes)</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                The Oracle maps all detected reasoning flaws to strict failure codes. Autonomous agents should be engineered to parse these specific <code className="text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded font-mono text-xs">DJZS-LF</code> flags and trigger automated halt conditions.
              </p>
              <div className="overflow-x-auto" data-testid="table-djzs-lf-taxonomy">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Diagnostic Code</th>
                      <th className="text-left py-3 px-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Category</th>
                      <th className="text-left py-3 px-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Severity</th>
                      <th className="text-left py-3 px-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider hidden sm:table-cell">Technical Description</th>
                      <th className="text-left py-3 px-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Auto-Abort?</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-border/50">
                      <td className="py-3 px-3"><code className="text-red-400 font-mono text-xs font-bold">DJZS-S01</code></td>
                      <td className="py-3 px-3 text-xs text-muted-foreground">Structural</td>
                      <td className="py-3 px-3"><span className="text-[10px] font-bold text-red-400 bg-red-500/10 px-2 py-0.5 rounded uppercase">Critical</span></td>
                      <td className="py-3 px-3 text-xs text-muted-foreground hidden sm:table-cell">Circular logic or agent-echo reinforcement detected.</td>
                      <td className="py-3 px-3 text-xs font-bold text-red-400">Yes</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-3 px-3"><code className="text-red-400 font-mono text-xs font-bold">DJZS-S02</code></td>
                      <td className="py-3 px-3 text-xs text-muted-foreground">Structural</td>
                      <td className="py-3 px-3"><span className="text-[10px] font-bold text-red-400 bg-red-500/10 px-2 py-0.5 rounded uppercase">Critical</span></td>
                      <td className="py-3 px-3 text-xs text-muted-foreground hidden sm:table-cell">Direct logical contradiction within the payload.</td>
                      <td className="py-3 px-3 text-xs font-bold text-red-400">Yes</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-3 px-3"><code className="text-orange-400 font-mono text-xs font-bold">DJZS-E01</code></td>
                      <td className="py-3 px-3 text-xs text-muted-foreground">Epistemic</td>
                      <td className="py-3 px-3"><span className="text-[10px] font-bold text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded uppercase">High</span></td>
                      <td className="py-3 px-3 text-xs text-muted-foreground hidden sm:table-cell">Utilization of hallucinated reference markers or fake data.</td>
                      <td className="py-3 px-3 text-xs font-bold text-orange-400">Yes</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-3 px-3"><code className="text-orange-400 font-mono text-xs font-bold">DJZS-E02</code></td>
                      <td className="py-3 px-3 text-xs text-muted-foreground">Epistemic</td>
                      <td className="py-3 px-3"><span className="text-[10px] font-bold text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded uppercase">High</span></td>
                      <td className="py-3 px-3 text-xs text-muted-foreground hidden sm:table-cell">Reliance on a demonstrably stale or outdated assumption.</td>
                      <td className="py-3 px-3 text-xs font-bold text-orange-400">Yes</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-3 px-3"><code className="text-yellow-400 font-mono text-xs font-bold">DJZS-I01</code></td>
                      <td className="py-3 px-3 text-xs text-muted-foreground">Incentive</td>
                      <td className="py-3 px-3"><span className="text-[10px] font-bold text-yellow-400 bg-yellow-500/10 px-2 py-0.5 rounded uppercase">Medium</span></td>
                      <td className="py-3 px-3 text-xs text-muted-foreground hidden sm:table-cell">Execution driven by FOMO loop or unverified momentum.</td>
                      <td className="py-3 px-3 text-xs text-yellow-400">No (Review)</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-3 px-3"><code className="text-yellow-400 font-mono text-xs font-bold">DJZS-I02</code></td>
                      <td className="py-3 px-3 text-xs text-muted-foreground">Incentive</td>
                      <td className="py-3 px-3"><span className="text-[10px] font-bold text-yellow-400 bg-yellow-500/10 px-2 py-0.5 rounded uppercase">Medium</span></td>
                      <td className="py-3 px-3 text-xs text-muted-foreground hidden sm:table-cell">High narrative dependency (Prioritizing story over structural data).</td>
                      <td className="py-3 px-3 text-xs text-yellow-400">No (Review)</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-3"><code className="text-red-400 font-mono text-xs font-bold">DJZS-X01</code></td>
                      <td className="py-3 px-3 text-xs text-muted-foreground">Execution</td>
                      <td className="py-3 px-3"><span className="text-[10px] font-bold text-red-400 bg-red-500/10 px-2 py-0.5 rounded uppercase">Critical</span></td>
                      <td className="py-3 px-3 text-xs text-muted-foreground hidden sm:table-cell">Liquidity fragility (Target asset cannot support intended trade size).</td>
                      <td className="py-3 px-3 text-xs font-bold text-red-400">Yes</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-teal-500/10 flex items-center justify-center">
                  <Activity className="w-5 h-5 text-teal-400" />
                </div>
                <h3 className="text-xl font-bold text-foreground">Auto-Abort Circuit Breaker (TypeScript)</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                The following snippet demonstrates the <strong className="text-foreground">"Audit-Before-Act"</strong> pattern. It shows how to wrap an autonomous bot's execution logic with the DJZS API, ensuring the bot automatically kills its own trade if the Oracle detects a logic flaw.
              </p>
              <div className="relative" data-testid="code-circuit-breaker">
                <div className="absolute top-0 left-0 right-0 h-8 bg-[#1a1d23] rounded-t-lg flex items-center px-4">
                  <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">typescript</span>
                </div>
                <pre className="bg-[#1a1d23] rounded-lg pt-10 pb-5 px-5 overflow-x-auto border border-border/50">
                  <code className="text-xs font-mono leading-relaxed text-muted-foreground">
{`import { ethers } from "ethers";

`}<span className="text-muted-foreground/60">{`// 1. Define the DJZS Proof of Logic Schema`}</span>{`
interface `}<span className="text-teal-400">ProofOfLogic</span>{` {
  `}<span className="text-purple-400">verdict</span>{`: "PASS" | "FAIL";
  `}<span className="text-purple-400">risk_score</span>{`: number;
  `}<span className="text-purple-400">flags</span>{`: Array<{ code: string; severity: string; description: string }>;
}

async function `}<span className="text-orange-400">executeA2ATrade</span>{`(strategyMemo: string, baseTxHash: string) {
  console.log("Initiating DJZS Journal Entry Testing...");

  try {
    `}<span className="text-muted-foreground/60">{`// 2. Route the reasoning trace through the DJZS Tollbooth`}</span>{`
    const auditResponse = await fetch("https://djzs.ai/api/audit/micro", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "`}<span className="text-orange-400">x-payment-proof</span>{`": baseTxHash
      },
      body: JSON.stringify({ strategy_memo: strategyMemo })
    });

    if (auditResponse.status === 402) {
      throw new Error("`}<span className="text-red-400">DJZS-AUTH-402</span>{`: Payment required or invalid transaction hash.");
    }

    const proofOfLogic: ProofOfLogic = await auditResponse.json();

    `}<span className="text-muted-foreground/60">{`// 3. The Auto-Abort Circuit Breaker`}</span>{`
    if (proofOfLogic.verdict === "FAIL") {
      console.error(\`CRITICAL LOGIC FLAW DETECTED! Risk Score: \${proofOfLogic.risk_score}\`);
      proofOfLogic.flags.forEach(flag => {
        console.error(\`- [\${flag.code}] (\${flag.severity}): \${flag.description}\`);
      });
      
      `}<span className="text-red-400">{`// KILL THE EXECUTION`}</span>{`
      throw new Error("TRADE ABORTED: Logic failed DJZS verification. Capital protected.");
    }

    `}<span className="text-muted-foreground/60">{`// 4. Execution (Only runs if the Oracle returns 'PASS')`}</span>{`
    console.log("Logic Verified. Executing on-chain transaction...");
    // await router.executeTrade(...);

  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}`}
                  </code>
                </pre>
              </div>
            </div>

          </div>
        </motion.section>

        <motion.section variants={fadeUp} className="mb-20">
          <h2 className="text-2xl font-bold text-foreground mb-2">Data Transparency</h2>
          <p className="text-muted-foreground mb-8">Where your data goes — and where it doesn't. No fine print.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6" data-testid="card-why-privacy-docs">
            <div className="p-6 rounded-lg bg-gradient-to-br from-amber-500/[0.08] to-transparent border border-amber-500/20 hover:border-amber-500/30 transition-all">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-lg bg-amber-600/20 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground">Not E2E Encrypted</h3>
                  <p className="text-xs text-amber-400/80">Venice AI audit channel</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">When you deploy an audit, your reasoning trace is sent to Venice AI over the internet for adversarial analysis. This channel is not end-to-end encrypted. Venice AI claims no data retention, but we can't independently verify that claim. We're transparent about this because you deserve to know exactly when your data leaves your device.</p>
            </div>
            <div className="p-6 rounded-lg bg-gradient-to-br from-green-500/[0.08] to-transparent border border-green-500/20 hover:border-green-500/30 transition-all">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-lg bg-green-600/20 flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground">E2E Encrypted</h3>
                  <p className="text-xs text-green-400/80">XMTP agent channel</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">XMTP messaging is fully end-to-end encrypted using the MLS protocol with quantum-resistant key encapsulation (XWING KEM). Forward secrecy, post-compromise security, and quantum resistance — the same standard as Signal. See the <a href="https://docs.xmtp.org/protocol/security" target="_blank" rel="noopener noreferrer" className="text-green-400 hover:text-green-300 underline underline-offset-2">XMTP Security Documentation</a> for details.</p>
            </div>
            <div className="p-6 rounded-lg bg-gradient-to-br from-teal-500/[0.08] to-transparent border border-teal-500/20 hover:border-teal-500/30 transition-all">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-lg bg-teal-600/20 flex items-center justify-center">
                  <Database className="w-6 h-6 text-teal-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground">Permanently On-Chain</h3>
                  <p className="text-xs text-teal-400/80">Irys Datachain provenance</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">Audit certificates generated via the A2A API — including the strategy memo, verdict, risk score, and failure codes — are permanently uploaded to Irys Datachain. Any reasoning trace submitted through the API becomes a permanent, publicly accessible record. Local vault data is never uploaded.</p>
            </div>
          </div>
        </motion.section>

        <motion.section variants={fadeUp} className="mb-20" data-testid="section-integration-channels">
          <h2 className="text-2xl font-bold text-foreground mb-2">Integration Channels</h2>
          <p className="text-muted-foreground mb-8">Two paths for autonomous agents — choose the channel that fits your threat model.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6" data-testid="grid-integration-channels">
            <div className="p-6 rounded-lg bg-gradient-to-br from-purple-500/[0.08] via-green-500/[0.04] to-transparent border border-purple-500/20 hover:border-purple-500/30 transition-all" data-testid="card-dark-channel">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-lg bg-purple-600/20 flex items-center justify-center">
                  <Lock className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground">Dark Channel</h3>
                  <p className="text-xs text-purple-400/80">XMTP · E2E Encrypted via MLS</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                Alpha protection for proprietary trading agents. Your agent DMs the Oracle, gets a deterministic verdict privately. Zero public trace. End-to-end encrypted with the MLS protocol — the same standard as Signal.
              </p>
              <div className="space-y-3 mb-4">
                <div className="p-3 rounded-lg bg-muted border border-border">
                  <p className="text-[10px] font-bold text-purple-400 uppercase tracking-wider mb-1">Use Case</p>
                  <p className="text-xs text-muted-foreground" data-testid="text-dark-channel-usecase">Algorithmic arb bots, proprietary strategies, alpha-sensitive execution</p>
                </div>
                <div className="p-3 rounded-lg bg-muted border border-border">
                  <p className="text-[10px] font-bold text-purple-400 uppercase tracking-wider mb-1">Oracle Address</p>
                  <code className="text-xs text-foreground font-mono break-all" data-testid="text-oracle-address">0xc2eCfe214071C2B77f90111f222E4a4D25ac3A98</code>
                </div>
                <div className="p-3 rounded-lg bg-muted border border-border">
                  <p className="text-[10px] font-bold text-purple-400 uppercase tracking-wider mb-1">Message Prefixes</p>
                  <p className="text-xs text-muted-foreground" data-testid="text-dark-channel-prefixes"><code className="text-purple-400 font-mono bg-purple-500/10 px-1.5 py-0.5 rounded">Thinking:</code> → AdversarialOracle &nbsp;·&nbsp; <code className="text-green-400 font-mono bg-green-500/10 px-1.5 py-0.5 rounded">Journal:</code> → JournalInsight</p>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-lg bg-gradient-to-br from-teal-500/[0.08] via-orange-500/[0.04] to-transparent border border-teal-500/20 hover:border-teal-500/30 transition-all" data-testid="card-light-channel">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-lg bg-teal-600/20 flex items-center justify-center">
                  <Database className="w-6 h-6 text-teal-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground">Light Channel</h3>
                  <p className="text-xs text-teal-400/80">Base REST API · x402-Gated</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                Public provenance for DAO treasury bots. x402-gated audits with Irys Datachain certificates. Every decision permanently on-chain. Full accountability by design.
              </p>
              <div className="space-y-3 mb-4">
                <div className="p-3 rounded-lg bg-muted border border-border">
                  <p className="text-[10px] font-bold text-teal-400 uppercase tracking-wider mb-1">Use Case</p>
                  <p className="text-xs text-muted-foreground" data-testid="text-light-channel-usecase">DAO treasury management, public accountability, governance audits</p>
                </div>
                <div className="p-3 rounded-lg bg-muted border border-border">
                  <p className="text-[10px] font-bold text-teal-400 uppercase tracking-wider mb-1">Endpoints</p>
                  <p className="text-xs text-muted-foreground font-mono">
                    <code className="text-teal-400 bg-teal-500/10 px-1.5 py-0.5 rounded" data-testid="text-endpoint-micro">/api/audit/micro</code> &nbsp;·&nbsp;
                    <code className="text-teal-400 bg-teal-500/10 px-1.5 py-0.5 rounded" data-testid="text-endpoint-founder">/founder</code> &nbsp;·&nbsp;
                    <code className="text-teal-400 bg-teal-500/10 px-1.5 py-0.5 rounded" data-testid="text-endpoint-treasury">/treasury</code>
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-muted border border-border">
                  <p className="text-[10px] font-bold text-teal-400 uppercase tracking-wider mb-1">Provenance</p>
                  <p className="text-xs text-muted-foreground" data-testid="text-light-channel-provenance">Irys Datachain certificates — permanent, publicly verifiable records</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 p-6 rounded-lg bg-gradient-to-br from-red-500/[0.08] to-transparent border border-red-500/20" data-testid="callout-kill-switch">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-red-600/20 flex items-center justify-center">
                <Zap className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">The Kill Switch</h3>
                <p className="text-xs text-red-400/80">Deterministic circuit breaker between detection and execution</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed mb-3">
              Regardless of channel, DJZS acts as a <strong className="text-foreground">deterministic circuit breaker</strong> between an autonomous agent's reasoning and its execution. The AI detects reasoning failures (hallucinations, circular logic, FOMO bias). The server enforces the binary verdict. If the logic fractures, the transaction dies — no negotiation, no override.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Dark Channel agents get the verdict privately. Light Channel agents get the verdict publicly with an immutable provenance certificate. Both channels enforce the same <strong className="text-foreground">Audit-Before-Act</strong> loop — the only difference is whether the trace is encrypted or permanently on-chain.
            </p>
          </div>
        </motion.section>

        <motion.section variants={fadeUp} className="mb-20">
          <h2 className="text-2xl font-bold text-foreground mb-2">Core Principles</h2>
          <p className="text-muted-foreground mb-8">The non-negotiable rules that govern every Oracle interaction.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard 
              icon={HardDrive}
              color="orange"
              title="Audit-Before-Act"
              description="Every reasoning trace must pass through the Oracle before execution. No audit, no action. This is the core enforcement loop for the A2A economy."
            />
            <FeatureCard 
              icon={Shield}
              color="teal"
              title="Deterministic Verdicts"
              description="Binary PASS/FAIL. The server enforces the verdict deterministically — the LLM detects, the server decides. No probabilistic hedging."
            />
            <FeatureCard 
              icon={Bot}
              color="red"
              title="Adversarial Oracle"
              description="The AI is adversarial by design. It exposes circular logic, hallucinated data, FOMO bias, and narrative dependency. Honest, not helpful."
            />
            <FeatureCard 
              icon={Lock}
              color="green"
              title="Local-First Privacy"
              description="Workspace data lives on your device. No server-side storage of your reasoning. No feeds, no tracking, no centralized memory."
            />
            <FeatureCard 
              icon={Zap}
              color="amber"
              title="DJZS-LF Taxonomy"
              description="7 deterministic failure codes across Structural, Epistemic, Incentive, and Execution categories. Machine-readable error handling for autonomous agents."
            />
            <FeatureCard 
              icon={Key}
              color="purple"
              title="x402 Pay-to-Verify"
              description="No API keys or subscriptions. Access gated by on-chain USDC micropayments on Base. Your wallet is your identity."
            />
          </div>
        </motion.section>

        <motion.section variants={fadeUp} className="mb-20">
          <h2 className="text-2xl font-bold text-foreground mb-2">Architect Console</h2>
          <p className="text-muted-foreground mb-8">Four governance zones for the Sovereign Principal: forensic audit review, adversarial reasoning, protocol monitoring, and x402 fee governance.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-lg bg-gradient-to-br from-orange-500/[0.08] to-transparent border border-orange-500/20 hover:border-orange-500/30 transition-all">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-lg bg-orange-500/20 flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-orange-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground">Audit Ledger</h3>
                  <p className="text-xs text-orange-400/80">Immutable forensic log of all ProofOfLogic certificates</p>
                </div>
              </div>
              <p className="text-muted-foreground mb-5 leading-relaxed">The primary workspace view for Agent Architects. Every audit verdict, risk score, DJZS-LF failure code, and logic hash is recorded here as an immutable forensic record.</p>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-2 shrink-0"></span>
                  <span><strong className="text-orange-300">ProofOfLogic Certificates</strong> - PASS/FAIL verdicts with risk scores and cryptographic hashes</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-2 shrink-0"></span>
                  <span><strong className="text-orange-300">DJZS-LF Failure Codes</strong> - Deterministic logic failure taxonomy for autonomous error handling</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-2 shrink-0"></span>
                  <span><strong className="text-orange-300">Re-Deploy</strong> - Re-audit any previous payload against the Oracle for updated analysis</span>
                </li>
              </ul>
            </div>
            <div className="p-6 rounded-lg bg-gradient-to-br from-teal-500/[0.08] to-transparent border border-teal-500/20 hover:border-teal-500/30 transition-all">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-lg bg-teal-600/20 flex items-center justify-center">
                  <Activity className="w-6 h-6 text-teal-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground">Terminal Console</h3>
                  <p className="text-xs text-teal-400/80">Protocol monitoring and configuration</p>
                </div>
              </div>
              <p className="text-muted-foreground mb-5 leading-relaxed">Dashboard for protocol health, system status, and configuration management. Monitor Oracle uptime and review operational metrics.</p>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-2 shrink-0"></span>
                  <span><strong className="text-teal-300">System Status</strong> - Monitor Oracle uptime, TEE health, and API availability</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-2 shrink-0"></span>
                  <span><strong className="text-teal-300">Configuration</strong> - Manage protocol settings and BYOK preferences</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-2 shrink-0"></span>
                  <span><strong className="text-teal-300">Operational Metrics</strong> - Review audit throughput and system performance</span>
                </li>
              </ul>
            </div>

            <div className="p-6 rounded-lg bg-gradient-to-br from-amber-500/[0.08] to-transparent border border-amber-500/20 hover:border-amber-500/30 transition-all">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-lg bg-amber-600/20 flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground">x402 Governance</h3>
                  <p className="text-xs text-amber-400/80">Fee structure and escrow provisioning</p>
                </div>
              </div>
              <p className="text-muted-foreground mb-5 leading-relaxed">Execution Zone fee structure display and USDC escrow provisioning for execution agents. Manage agent allowances on Base Mainnet.</p>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 shrink-0"></span>
                  <span><strong className="text-amber-300">Fee Structure</strong> - Read-only display of Execution Zone pricing (Micro $0.10, Founder $1.00, Treasury $10.00 USDC)</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 shrink-0"></span>
                  <span><strong className="text-amber-300">ProvisionAgentAllowance</strong> - Provision USDC escrow to execution agents with live balance reads</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 shrink-0"></span>
                  <span><strong className="text-amber-300">Network Detection</strong> - Automatic wrong-network and disconnected state handling</span>
                </li>
              </ul>
            </div>

            <div className="p-6 rounded-lg bg-gradient-to-br from-red-500/[0.08] to-transparent border border-red-500/20 hover:border-red-500/30 transition-all">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-lg bg-red-600/20 flex items-center justify-center">
                  <Zap className="w-6 h-6 text-red-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground">Adversarial Oracle</h3>
                  <p className="text-xs text-red-400/80">Adversarial AI reasoning attacks</p>
                </div>
              </div>
              <p className="text-muted-foreground mb-5 leading-relaxed">Your adversarial AI sparring partner. It debates your ideas, exposes tensions, flags narrative dependency, and forces you to confront what you'd rather ignore.</p>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-2 shrink-0"></span>
                  <span><strong className="text-red-300">Reasoning Attacks</strong> - AI actively pushes back on weak logic and FOMO-driven reasoning</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-2 shrink-0"></span>
                  <span><strong className="text-red-300">Contradiction Exposure</strong> - Surfaces tensions between what you say and what you do</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-2 shrink-0"></span>
                  <span><strong className="text-red-300">Deploy to Zone</strong> - Send reasoning directly to an Execution Zone for paid audit</span>
                </li>
              </ul>
            </div>
          </div>
        </motion.section>

        <motion.section variants={fadeUp} className="mb-20">
          <h2 className="text-2xl font-bold text-foreground mb-2">Execution Zones</h2>
          <p className="text-muted-foreground mb-8">Paid adversarial audits via x402 USDC on Base. Deploy your work when the stakes are high.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-lg bg-gradient-to-br from-teal-500/[0.08] to-transparent border border-teal-500/20 hover:border-teal-500/30 transition-all">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-foreground">Micro-Zone</h3>
                <span className="text-sm font-bold text-teal-400 bg-teal-500/10 px-3 py-1 rounded">$0.10</span>
              </div>
              <p className="text-muted-foreground mb-4 leading-relaxed">Fast binary risk scoring for operational decisions. Quick "check my work" — submit a strategy memo, get a risk score and bias detection back in seconds.</p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-2 shrink-0"></span>
                  <span>1,000 character limit</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-2 shrink-0"></span>
                  <span>Risk score (0-100) + primary bias detected</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-2 shrink-0"></span>
                  <span>Logic flaws + structural recommendations</span>
                </li>
              </ul>
            </div>
            <div className="p-6 rounded-lg bg-gradient-to-br from-orange-500/[0.08] to-transparent border border-orange-500/20 hover:border-orange-500/30 transition-all">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-foreground">Founder Zone</h3>
                <span className="text-sm font-bold text-orange-400 bg-orange-500/10 px-3 py-1 rounded">$1.00</span>
              </div>
              <p className="text-muted-foreground mb-4 leading-relaxed">Deep roadmap diligence for strategic decisions. Detects mission drift, narrative dependency, and founder blind spots.</p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-2 shrink-0"></span>
                  <span>5,000 character limit</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-2 shrink-0"></span>
                  <span>Deep bias detection + strategic integrity check</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-2 shrink-0"></span>
                  <span>Comprehensive logic flaw analysis</span>
                </li>
              </ul>
            </div>
            <div className="p-6 rounded-lg bg-gradient-to-br from-purple-500/[0.08] to-transparent border border-purple-500/20 hover:border-purple-500/30 transition-all">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-foreground">Treasury Zone</h3>
                <span className="text-sm font-bold text-purple-400 bg-purple-500/10 px-3 py-1 rounded">$10.00</span>
              </div>
              <p className="text-muted-foreground mb-4 leading-relaxed">Exhaustive adversarial governance audit. Full breakdown for DAO treasury proposals, multi-sig decisions, and high-stakes governance votes.</p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-2 shrink-0"></span>
                  <span>Unlimited character input</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-2 shrink-0"></span>
                  <span>Exhaustive adversarial breakdown</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-2 shrink-0"></span>
                  <span>Cryptographic hash + immutable ledger record</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-6 p-4 rounded-lg bg-orange-500/[0.06] border border-orange-500/15">
            <p className="text-sm text-muted-foreground leading-relaxed">
              All Execution Zone audits are saved locally in your <strong className="text-foreground">Audit Ledger</strong> with SHA-256 hashes, verdict badges, and DJZS-LF failure codes. Review past results, compare risk scores across zones, and re-deploy memos at any time.
            </p>
          </div>
        </motion.section>

        <motion.section variants={fadeUp} className="mb-20" data-testid="section-proof-of-logic">
          <h2 className="text-2xl font-bold text-foreground mb-2">Proof of Logic Certificate</h2>
          <p className="text-muted-foreground mb-8">Deterministic verification primitive for autonomous agents</p>
          <div className="p-8 rounded-3xl bg-gradient-to-br from-red-500/10 to-transparent border border-red-500/20 mb-8">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-lg bg-red-600/20 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground">Why Deterministic Verdicts Matter</h3>
                <p className="text-xs text-red-400/80">Probabilistic AI cannot be trusted with deterministic infrastructure</p>
              </div>
            </div>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              LLMs are probabilistic text generators designed to sound convincing, not to be logically strict. Left unchecked, an AI will identify a critical flaw in a treasury strategy and still output "PASS" to avoid confrontation. In a chat interface, that's a bad answer. In the A2A economy, <strong className="text-foreground">that is a catastrophic loss of capital.</strong>
            </p>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              The Proof of Logic Certificate solves this by separating <strong className="text-foreground">detection</strong> (the AI) from <strong className="text-foreground">verdict</strong> (the server). The AI acts as a sensor that detects reasoning ruptures. The server acts as a ruthless compiler that enforces the binary verdict deterministically — no negotiation.
            </p>

            <h4 className="text-sm font-bold text-foreground mb-4">Binary Verdict Rules</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="p-4 rounded-lg bg-green-500/[0.06] border border-green-500/20">
                <p className="text-sm font-bold text-green-400 mb-2">PASS</p>
                <p className="text-xs text-muted-foreground leading-relaxed">Issued when risk_score ≤ 60 AND no CRITICAL or HIGH severity flags are detected. The AI found no structural failures worth blocking execution.</p>
              </div>
              <div className="p-4 rounded-lg bg-red-500/[0.06] border border-red-500/20">
                <p className="text-sm font-bold text-red-400 mb-2">FAIL</p>
                <p className="text-xs text-muted-foreground leading-relaxed">Forced when risk_score {'>'} 60 OR any CRITICAL/HIGH flag is detected. The server overrides the LLM verdict — the AI cannot "smooth things over."</p>
              </div>
            </div>

            <h4 className="text-sm font-bold text-foreground mb-4" data-testid="text-risk-score-scale-title">Risk Score Scale</h4>
            <p className="text-xs text-muted-foreground mb-4">Every audit returns a numeric risk score from 0 to 100. The score determines the visual severity classification and influences the binary verdict.</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              <div className="p-3 rounded-lg bg-gradient-to-br from-green-500/[0.08] to-transparent border border-green-500/20 text-center" data-testid="card-risk-low">
                <span className="text-lg font-black font-mono text-green-400 block">LOW</span>
                <span className="text-[10px] font-mono text-muted-foreground block mb-1.5">0–24</span>
                <p className="text-[11px] text-muted-foreground leading-relaxed">No structural failures. Logic is sound for execution.</p>
              </div>
              <div className="p-3 rounded-lg bg-gradient-to-br from-teal-500/[0.08] to-transparent border border-teal-500/20 text-center" data-testid="card-risk-moderate">
                <span className="text-lg font-black font-mono text-teal-400 block">MODERATE</span>
                <span className="text-[10px] font-mono text-muted-foreground block mb-1.5">25–49</span>
                <p className="text-[11px] text-muted-foreground leading-relaxed">Minor concerns identified. Review flagged items before proceeding.</p>
              </div>
              <div className="p-3 rounded-lg bg-gradient-to-br from-amber-500/[0.08] to-transparent border border-amber-500/20 text-center" data-testid="card-risk-elevated">
                <span className="text-lg font-black font-mono text-amber-400 block">ELEVATED</span>
                <span className="text-[10px] font-mono text-muted-foreground block mb-1.5">50–74</span>
                <p className="text-[11px] text-muted-foreground leading-relaxed">Significant logic flaws detected. Execution carries material risk.</p>
              </div>
              <div className="p-3 rounded-lg bg-gradient-to-br from-red-500/[0.08] to-transparent border border-red-500/20 text-center" data-testid="card-risk-critical">
                <span className="text-lg font-black font-mono text-red-400 block">CRITICAL</span>
                <span className="text-[10px] font-mono text-muted-foreground block mb-1.5">75–100</span>
                <p className="text-[11px] text-muted-foreground leading-relaxed">Severe reasoning failures. Automatic FAIL verdict enforced.</p>
              </div>
            </div>

            <h4 className="text-sm font-bold text-foreground mb-4" data-testid="text-audit-contents-title">Audit Report Contents</h4>
            <p className="text-xs text-muted-foreground mb-3">Every ProofOfLogic certificate includes a structured breakdown of the adversarial analysis:</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-8">
              <div className="p-2.5 rounded-lg bg-muted border border-border" data-testid="card-audit-risk-score">
                <p className="text-[11px] font-bold text-foreground">Risk Score</p>
                <p className="text-[10px] text-muted-foreground">0–100 numeric severity</p>
              </div>
              <div className="p-2.5 rounded-lg bg-muted border border-border" data-testid="card-audit-verdict">
                <p className="text-[11px] font-bold text-foreground">PASS / FAIL Verdict</p>
                <p className="text-[10px] text-muted-foreground">Deterministic binary output</p>
              </div>
              <div className="p-2.5 rounded-lg bg-muted border border-border" data-testid="card-audit-primary-bias">
                <p className="text-[11px] font-bold text-foreground">Primary Bias</p>
                <p className="text-[10px] text-muted-foreground">Dominant cognitive bias detected</p>
              </div>
              <div className="p-2.5 rounded-lg bg-muted border border-border" data-testid="card-audit-logic-flaws">
                <p className="text-[11px] font-bold text-foreground">Logic Flaws</p>
                <p className="text-[10px] text-muted-foreground">Individual flaws with severity</p>
              </div>
              <div className="p-2.5 rounded-lg bg-muted border border-border" data-testid="card-audit-failure-codes">
                <p className="text-[11px] font-bold text-foreground">DJZS-LF Codes</p>
                <p className="text-[10px] text-muted-foreground">Failure taxonomy flags</p>
              </div>
              <div className="p-2.5 rounded-lg bg-muted border border-border" data-testid="card-audit-recommendations">
                <p className="text-[11px] font-bold text-foreground">Recommendations</p>
                <p className="text-[10px] text-muted-foreground">Structural action items</p>
              </div>
            </div>

            <h4 className="text-sm font-bold text-foreground mb-4">DJZS-LF Taxonomy — 7 Logic Failure Codes</h4>
            <p className="text-xs text-muted-foreground mb-4">Each code maps to a specific class of reasoning failure. Four severity levels: CRITICAL, HIGH, MEDIUM, LOW.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
              <div className="p-3 rounded-lg bg-muted border border-border">
                <div className="flex items-center gap-2 mb-1">
                  <code className="text-xs font-mono text-orange-300 bg-orange-500/10 px-1.5 py-0.5 rounded">DJZS-S01</code>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase">Structural</span>
                </div>
                <p className="text-xs text-muted-foreground">CIRCULAR_LOGIC — conclusion assumes its own premise</p>
              </div>
              <div className="p-3 rounded-lg bg-muted border border-border">
                <div className="flex items-center gap-2 mb-1">
                  <code className="text-xs font-mono text-orange-300 bg-orange-500/10 px-1.5 py-0.5 rounded">DJZS-S02</code>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase">Structural</span>
                </div>
                <p className="text-xs text-muted-foreground">MISSING_FALSIFIABILITY — no scenario disproves the thesis</p>
              </div>
              <div className="p-3 rounded-lg bg-muted border border-border">
                <div className="flex items-center gap-2 mb-1">
                  <code className="text-xs font-mono text-teal-300 bg-teal-500/10 px-1.5 py-0.5 rounded">DJZS-E01</code>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase">Epistemic</span>
                </div>
                <p className="text-xs text-muted-foreground">CONFIRMATION_TUNNEL — only supporting evidence considered</p>
              </div>
              <div className="p-3 rounded-lg bg-muted border border-border">
                <div className="flex items-center gap-2 mb-1">
                  <code className="text-xs font-mono text-teal-300 bg-teal-500/10 px-1.5 py-0.5 rounded">DJZS-E02</code>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase">Epistemic</span>
                </div>
                <p className="text-xs text-muted-foreground">AUTHORITY_SUBSTITUTION — appeal to authority replaces evidence</p>
              </div>
              <div className="p-3 rounded-lg bg-muted border border-border">
                <div className="flex items-center gap-2 mb-1">
                  <code className="text-xs font-mono text-purple-300 bg-purple-500/10 px-1.5 py-0.5 rounded">DJZS-I01</code>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase">Incentive</span>
                </div>
                <p className="text-xs text-muted-foreground">MISALIGNED_INCENTIVE — proposer benefits regardless of outcome</p>
              </div>
              <div className="p-3 rounded-lg bg-muted border border-border">
                <div className="flex items-center gap-2 mb-1">
                  <code className="text-xs font-mono text-purple-300 bg-purple-500/10 px-1.5 py-0.5 rounded">DJZS-I02</code>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase">Incentive</span>
                </div>
                <p className="text-xs text-muted-foreground">NARRATIVE_DEPENDENCY — thesis relies on a single story being true</p>
              </div>
              <div className="p-3 rounded-lg bg-muted border border-border md:col-span-2">
                <div className="flex items-center gap-2 mb-1">
                  <code className="text-xs font-mono text-red-300 bg-red-500/10 px-1.5 py-0.5 rounded">DJZS-X01</code>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase">Execution</span>
                </div>
                <p className="text-xs text-muted-foreground">UNHEDGED_EXECUTION — no contingency plan if assumptions fail</p>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-red-500/[0.04] border border-red-500/15">
              <p className="text-xs text-muted-foreground leading-relaxed">
                <strong className="text-red-300">Server-side enforcement:</strong> The verdict is computed deterministically on the server after the LLM returns its analysis. If any CRITICAL or HIGH flag is present, the verdict is forced to FAIL regardless of what the AI suggested. The LLM detects — the server decides. This is the bridge between probabilistic AI and deterministic infrastructure.
              </p>
            </div>
          </div>
        </motion.section>

        <motion.section variants={fadeUp} className="mb-20">
          <h2 className="text-2xl font-bold text-foreground mb-8">OpenClaw Agent Runner</h2>
          <div className="p-8 rounded-3xl bg-gradient-to-br from-purple-500/10 to-transparent border border-purple-500/20 mb-8">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-lg bg-purple-600/20 flex items-center justify-center">
                <Brain className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground">Unified AI Agent System</h3>
                <p className="text-xs text-purple-400/80">Two structured agents, one dispatcher</p>
              </div>
            </div>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              OpenClaw is DJZS's agent runner — a clean dispatcher that routes requests to two specialized AI agents. Each agent wraps Venice AI calls and returns strictly typed, structured JSON. No thinking happens in the dispatcher; all intelligence lives in the agent classes.
            </p>

            <div className="p-5 rounded-lg bg-purple-500/[0.06] border border-purple-500/15 mb-6">
              <p className="text-sm font-bold text-purple-300 mb-3">How It Connects to What You See</p>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-2 shrink-0"></span>
                  <span>The <strong className="text-orange-300">Audit Ledger</strong> displays all ProofOfLogic certificates from your deployed audits — binary PASS/FAIL verdicts, risk scores, DJZS-LF failure codes, and cryptographic hashes. Each record links back to the original payload for re-deployment.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-2 shrink-0"></span>
                  <span>The <strong className="text-purple-300">AdversarialOracle</strong> agent powers the Adversarial Oracle — challenging your ideas, exposing tensions in your reasoning, and flagging narrative dependency. It acts as an adversarial pressure-tester, not a chatbot.</span>
                </li>
              </ul>
            </div>

            <p className="text-xs text-muted-foreground mb-6 font-mono" data-testid="text-openclaw-api">
              API: POST /api/openclaw/run {'{'} agent: "JournalInsight" | "AdversarialOracle", payload: {'{'} ... {'}'} {'}'}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-lg bg-gradient-to-br from-orange-500/[0.08] to-transparent border border-orange-500/20" data-testid="card-agent-journal">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-orange-400" />
                </div>
                <h3 className="text-lg font-bold text-foreground">JournalInsight</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">Interrogates reasoning traces for contradictions, weak claims, blind spots, and emotional biases.</p>
              <ul className="space-y-2 text-xs text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="w-1 h-1 rounded-full bg-orange-400 mt-1.5 shrink-0"></span>
                  <span>Exposes contradictions and blind spots</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1 h-1 rounded-full bg-orange-400 mt-1.5 shrink-0"></span>
                  <span>Asks the questions you're avoiding</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1 h-1 rounded-full bg-orange-400 mt-1.5 shrink-0"></span>
                  <span>Flags emotional bias and FOMO patterns</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1 h-1 rounded-full bg-orange-400 mt-1.5 shrink-0"></span>
                  <span>Generates adversarial questions that pressure-test your logic</span>
                </li>
              </ul>
            </div>
            <div className="p-6 rounded-lg bg-gradient-to-br from-purple-500/[0.08] to-transparent border border-purple-500/20" data-testid="card-agent-thinking">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-purple-600/20 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-purple-400" />
                </div>
                <h3 className="text-lg font-bold text-foreground">AdversarialOracle</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">Your adversarial AI — debates your ideas, exposes weak reasoning, and calls out what you're not seeing.</p>
              <ul className="space-y-2 text-xs text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="w-1 h-1 rounded-full bg-purple-400 mt-1.5 shrink-0"></span>
                  <span>Asks adversarial questions that challenge your assumptions</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1 h-1 rounded-full bg-purple-400 mt-1.5 shrink-0"></span>
                  <span>Exposes core tensions and contradictions</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1 h-1 rounded-full bg-purple-400 mt-1.5 shrink-0"></span>
                  <span>Flags narrative dependency and FOMO-driven logic</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1 h-1 rounded-full bg-purple-400 mt-1.5 shrink-0"></span>
                  <span>Forces you to confront what you'd rather ignore</span>
                </li>
              </ul>
            </div>
          </div>

        </motion.section>

        <motion.section variants={fadeUp} className="mb-20">
          <h2 className="text-2xl font-bold text-foreground mb-8">Vault Encryption</h2>
          <div className="p-8 rounded-3xl bg-gradient-to-br from-green-500/10 to-transparent border border-green-500/20">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-lg bg-green-600/20 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground">Encrypt Your Local Vault</h3>
                <p className="text-xs text-green-400/80">AES-256-GCM encryption with PBKDF2 key derivation</p>
              </div>
            </div>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Add an extra layer of protection to your locally stored data. When you set a passphrase, all sensitive fields in your vault are encrypted using military-grade AES-256-GCM encryption. Even if someone gains access to your device, your thoughts remain locked without your passphrase.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-green-300">How It Works</h4>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 mt-2 shrink-0"></span>
                    <span><strong className="text-green-300">Set Passphrase</strong> — Open Settings in the sidebar and create a passphrase to enable encryption</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 mt-2 shrink-0"></span>
                    <span><strong className="text-green-300">Automatic Encryption</strong> — Once set, all new entries and insights are encrypted on save and decrypted on read</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 mt-2 shrink-0"></span>
                    <span><strong className="text-green-300">Lock Vault</strong> — Lock your vault when stepping away. The encryption key is cleared from memory</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 mt-2 shrink-0"></span>
                    <span><strong className="text-green-300">Unlock</strong> — Re-enter your passphrase to unlock and resume working</span>
                  </li>
                </ul>
              </div>
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-green-300">What Gets Encrypted</h4>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 mt-2 shrink-0"></span>
                    <span><strong className="text-green-300">Audit records</strong> — Your reasoning text is encrypted before storage</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 mt-2 shrink-0"></span>
                    <span><strong className="text-green-300">AI insights</strong> — The "what you said," "why it matters," "next move," and reflective question fields</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 mt-2 shrink-0"></span>
                    <span><strong className="text-green-300">Logic logs</strong> — Local logic state is encrypted at rest</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 mt-2 shrink-0"></span>
                    <span><strong className="text-green-300">Exports</strong> — When you export your vault, data is decrypted for portability</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-green-500/[0.06] border border-green-500/15">
              <p className="text-sm text-muted-foreground leading-relaxed">
                Encryption uses <strong className="text-foreground">PBKDF2 with 600,000 iterations</strong> for key derivation and <strong className="text-foreground">AES-GCM-256</strong> for encryption — all running locally in your browser via the WebCrypto API. Your passphrase never leaves your device.
              </p>
            </div>
          </div>
        </motion.section>

        <motion.section variants={fadeUp} className="mb-20">
          <h2 className="text-2xl font-bold text-foreground mb-8">Bring Your Own Key (BYOK)</h2>
          <div className="p-8 rounded-3xl bg-gradient-to-br from-yellow-500/10 to-transparent border border-yellow-500/20" style={{ background: 'linear-gradient(135deg, rgba(255,184,77,0.08), transparent)' }}>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ background: 'rgba(255,184,77,0.2)' }}>
                <KeyRound className="w-6 h-6" style={{ color: '#FFB84D' }} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground">Use Your Own Venice API Key</h3>
                <p className="text-xs" style={{ color: 'rgba(255,184,77,0.8)' }}>Full control over your AI inference</p>
              </div>
            </div>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              By default, DJZS uses a shared Venice AI key for convenience. But if you want full control over your AI usage, billing, and rate limits, you can bring your own Venice API key. Your key is stored locally in your browser and sent directly with each AI request.
            </p>
            <ul className="space-y-3 text-sm text-muted-foreground mb-6">
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full mt-2 shrink-0" style={{ background: '#FFB84D' }}></span>
                <span><strong style={{ color: '#FFB84D' }}>Settings Panel</strong> — Open Settings in the chat sidebar to enter your Venice API key</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full mt-2 shrink-0" style={{ background: '#FFB84D' }}></span>
                <span><strong style={{ color: '#FFB84D' }}>Local Storage</strong> — Your key is stored only in your browser's localStorage, never on our servers</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full mt-2 shrink-0" style={{ background: '#FFB84D' }}></span>
                <span><strong style={{ color: '#FFB84D' }}>Automatic Injection</strong> — Once set, your key is used for all AI calls: audit insights, research, stress tests, and adversarial oracle</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full mt-2 shrink-0" style={{ background: '#FFB84D' }}></span>
                <span><strong style={{ color: '#FFB84D' }}>Easy Removal</strong> — Clear your key anytime to switch back to the shared key</span>
              </li>
            </ul>
            <div className="p-4 rounded-lg border border-yellow-500/15" style={{ background: 'rgba(255,184,77,0.04)' }}>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Get a Venice API key at <a href="https://venice.ai" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-foreground transition-colors" style={{ color: '#FFB84D' }} data-testid="link-venice-ai">venice.ai</a>. Venice is a privacy-first AI provider that claims no data retention on inference requests.
              </p>
            </div>
          </div>
        </motion.section>

        <motion.section variants={fadeUp} className="mb-20">
          <h2 className="text-2xl font-bold text-foreground mb-2">Technical Stack</h2>
          <p className="text-muted-foreground mb-8">The protocols, frameworks, and infrastructure behind the Oracle.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <TechStackItem 
              icon={Code2}
              color="orange"
              category="Frontend"
              items={["React 18", "TypeScript", "Vite", "Tailwind CSS", "Radix UI", "Framer Motion"]}
            />
            <TechStackItem 
              icon={Layers}
              color="purple"
              category="State & Data"
              items={["TanStack Query", "Dexie (IndexedDB)", "Zod Validation"]}
            />
            <TechStackItem 
              icon={Link2}
              color="blue"
              category="Web3"
              items={["wagmi", "viem", "RainbowKit", "ENS Resolution"]}
            />
            <TechStackItem 
              icon={HardDrive}
              color="teal"
              category="Backend"
              items={["Express.js", "TypeScript", "Drizzle ORM"]}
            />
            <TechStackItem 
              icon={Brain}
              color="red"
              category="AI & Agents"
              items={["Venice AI", "OpenClaw Runner", "XMTP Agent SDK", "Evasion Defense Pipeline"]}
            />
            <TechStackItem 
              icon={Lock}
              color="amber"
              category="Storage & Security"
              items={["IndexedDB (local)", "AES-GCM-256", "PBKDF2 (600k)", "WebCrypto API", "BYOK (Venice)"]}
            />
            <TechStackItem 
              icon={DollarSign}
              color="green"
              category="A2A Payments"
              items={["x402 Protocol", "@x402/express", "USDC on Base", "SHA-256 Hashing", "Three-tier pricing"]}
            />
            <TechStackItem 
              icon={MessageSquare}
              color="blue"
              category="A2A Messaging"
              items={["XMTP (MLS Protocol)", "E2E Encrypted DMs", "Quantum-Resistant KEM", "Agent-to-Agent Routing"]}
            />
            <TechStackItem 
              icon={Database}
              color="teal"
              category="Provenance"
              items={["Irys Datachain", "Permanent Certificates", "Gateway Verification", "GraphQL Discovery"]}
            />
            <TechStackItem 
              icon={Cpu}
              color="purple"
              category="Secure Execution"
              items={["Phala Cloud TEE", "Hardware Enclave", "Dual-Process Boot", "concurrently"]}
            />
          </div>
        </motion.section>

        <motion.section variants={fadeUp} className="mb-20" data-testid="section-deployed-contracts">
          <h2 className="text-2xl font-bold text-foreground mb-2">Deployed Contracts</h2>
          <p className="text-muted-foreground mb-8">All DJZS Protocol contracts are live on Base Mainnet. Click any address to verify on BaseScan.</p>
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left px-6 py-4 font-bold text-foreground">Contract</th>
                  <th className="text-left px-6 py-4 font-bold text-foreground">Address</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { name: "DJZSAgentRegistry", address: "0xe40d5669Ce8e06A91188B82Ce7292175E2013E41" },
                  { name: "DJZSLogicTrustScore", address: "0xB3324D07A8713b354435FF0e2A982A504e81b137" },
                  { name: "DJZSStaking", address: "0xA362947D23D52C05a431E378F30C8A962De91e8A" },
                  { name: "DJZSEscrowLock", address: "0xB041760147a60F63Ca701da9e431412bCc25Cfb7" },
                ].map((c) => (
                  <tr key={c.name} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 font-mono text-foreground font-medium" data-testid={`text-contract-name-${c.name}`}>{c.name}</td>
                    <td className="px-6 py-4">
                      <a
                        href={`https://basescan.org/address/${c.address}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono text-teal-500 hover:text-teal-400 transition-colors flex items-center gap-2 break-all"
                        data-testid={`link-contract-${c.name}`}
                      >
                        {c.address}
                        <ExternalLink className="w-3 h-3 shrink-0" />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-6 p-4 rounded-lg bg-muted/50 border border-border">
            <p className="text-xs font-bold text-orange-400 uppercase tracking-wider mb-2">ERC-8004 Registration</p>
            <a
              href="https://basescan.org/tx/0x99b9fcfc64af207771afde1851fa7e569e5161d5bb166dbd000b44743bd1ce23"
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-xs text-teal-500 hover:text-teal-400 transition-colors flex items-center gap-2 break-all"
              data-testid="link-erc8004-registration"
            >
              0x99b9fcfc64af207771afde1851fa7e569e5161d5bb166dbd000b44743bd1ce23
              <ExternalLink className="w-3 h-3 shrink-0" />
            </a>
            <p className="text-xs text-muted-foreground mt-2">On-chain agent identity minted on Base Mainnet via the Synthesis hackathon registration contract.</p>
          </div>
        </motion.section>

        <motion.section variants={fadeUp} className="mb-20">
          <h2 className="text-2xl font-bold text-foreground mb-2">Quick Links</h2>
          <p className="text-muted-foreground mb-8">Jump to the tools, docs, and endpoints you need.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <QuickLink 
              href="/chat"
              title="Architect Console"
              description="Governance interface for the Sovereign Principal — audit ledger, Oracle, terminal, and x402 controls"
              testId="link-architect-console"
            />
            <QuickLink 
              href="/chat?zone=audit"
              title="Deploy Audit"
              description="Route a reasoning trace through the x402 Execution Zones for paid adversarial analysis"
              testId="link-deploy-audit"
            />
            <QuickLink 
              href="/privacy"
              title="Privacy & Security"
              description="Data transparency, encryption boundaries, and local-first architecture"
              testId="link-privacy"
            />
            <QuickLink 
              href="/terms"
              title="Terms of Service"
              description="Legal terms, risk disclosures, and protocol limitations"
              testId="link-terms"
            />
            <QuickLink 
              href="https://github.com/UsernameDAOEth/djzs-AI"
              title="GitHub Repository"
              description="Open-source protocol code, Docker image, and deployment scripts"
              external
              testId="link-github-repo"
            />
            <QuickLink 
              href="/api/audit/schema"
              title="Audit API Schema"
              description="Machine-readable schema discovery for autonomous agent integration"
              external
              testId="link-audit-api"
            />
            <QuickLink 
              href="/guide"
              title="MCP User Guide"
              description="How to connect djzs-trust MCP tool to Claude Desktop and query ProofOfLogic certificates"
              testId="link-guide"
            />
            <QuickLink 
              href="/test-suite"
              title="Test Audit Suite"
              description="Seven strategy memos exercising the full DJZS-LF failure taxonomy across all three tiers"
              testId="link-test-suite"
            />
          </div>
        </motion.section>

        <motion.section variants={fadeUp} className="mb-20">
          <div className="p-8 rounded-3xl bg-gradient-to-br from-orange-500/10 to-transparent border border-orange-500/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-lg bg-orange-500/20 flex items-center justify-center">
                <Users className="w-6 h-6 text-orange-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground">Built by Username:Dj-Z-S</h3>
                <p className="text-xs text-orange-400/80">Solo Founder</p>
              </div>
            </div>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>After years of watching autonomous agents hemorrhage capital based on unverified logic, hallucinated data, and FOMO, I engineered the Adversarial Logic Layer the A2A economy was missing.</p>
              <p>DJZS is a single-purpose deterministic verification primitive. We enforce a ruthless "Audit-Before-Act" loop: every agent must commit its reasoning to an immutable ledger and pass a strict DJZS-LF audit before execution.</p>
              <p>If the logic fractures, the transaction dies. No exceptions. The Logic Oracle for the decentralized web. Honest, not helpful.</p>
            </div>
          </div>
        </motion.section>

        <motion.footer variants={fadeUp} className="text-center py-12 border-t border-border">
          <p className="text-sm text-muted-foreground/80">
            Honest, not helpful. The Logic Oracle for the decentralized web.
          </p>
        </motion.footer>
      </motion.main>
    </div>
  );
}
