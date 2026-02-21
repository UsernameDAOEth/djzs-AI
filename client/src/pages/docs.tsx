import { Link } from "wouter";
import { 
  Home, 
  Shield, 
  HardDrive, 
  Bot, 
  Lock, 
  Zap, 
  BookOpen, 
  Search, 
  ArrowRight,
  Key,
  ExternalLink,
  Building2,
  Users,
  Database,
  Fingerprint,
  Globe,
  Brain,
  Sparkles,
  FileSearch,
  TrendingUp,
  KeyRound,
  ShieldCheck,
  Palette,
  BarChart3,
  Eye,
  Layers,
  ArrowRightLeft,
  DollarSign,
  FileCode,
  CheckCircle,
  Code2,
  AlertTriangle,
  Activity,
  Scan,
  Sun,
  Moon
} from "lucide-react";
import { motion } from "framer-motion";
import { useTheme } from "@/lib/theme";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

const stagger = {
  show: { transition: { staggerChildren: 0.1 } }
};

interface FeatureCardProps {
  icon: typeof Shield;
  title: string;
  description: string;
}

function FeatureCard({ icon: Icon, title, description }: FeatureCardProps) {
  return (
    <div className="p-6 rounded-lg bg-muted border border-border hover:border-orange-500/20 transition-all group">
      <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center mb-4 group-hover:bg-orange-500/20 transition-colors">
        <Icon className="w-5 h-5 text-orange-400" />
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
    <div className="p-5 rounded-lg bg-muted border border-border hover:border-orange-500/30 hover:bg-orange-500/[0.03] transition-all group cursor-pointer" data-testid={testId}>
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
  category: string;
  items: string[];
}

function TechStackItem({ category, items }: TechStackItemProps) {
  return (
    <div className="p-4 rounded-lg bg-muted border border-border">
      <h4 className="text-[10px] font-bold text-orange-400 uppercase tracking-wide mb-3">{category}</h4>
      <div className="flex flex-wrap gap-2">
        {items.map((item, i) => (
          <span key={i} className="px-2.5 py-1 rounded-lg bg-muted/50 text-xs text-muted-foreground font-medium">
            {item}
          </span>
        ))}
      </div>
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
              <img src="/logo.png" alt="DJZS" className="w-6 h-6 rounded transition-transform group-hover:-translate-x-1" style={{ filter: 'drop-shadow(0 0 2px rgba(0,0,0,0.3))' }} data-testid="img-logo-docs" />
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
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Six free Workspace Zones for thinking and building. Three paid Execution Zones for adversarial audits. Write locally, deploy to the System when you're ready to pressure-test.
          </p>
          <div className="flex justify-center gap-4 mt-8">
            <Link href="/chat">
              <button className="px-6 py-3 rounded-lg text-white font-bold transition-colors" style={{ background: '#F37E20' }} data-testid="button-start-writing">
                Open Workspace
              </button>
            </Link>
          </div>
        </motion.div>

        <motion.section variants={fadeUp} className="mb-20">
          <div className="p-8 rounded-3xl bg-gradient-to-br from-orange-500/10 to-transparent border border-orange-500/20">
            <h2 className="text-2xl font-bold text-foreground mb-4">What is DJZS?</h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p className="text-lg">
                DJZS is <strong className="text-foreground">cognitive infrastructure for the Agent-to-Agent (A2A) economy</strong>. It serves two clients: human founders via the web UI, and autonomous AI agents via a machine-readable programmatic API. Local-first data ownership, decentralized AI inference via Venice, and x402 micropayments on Base. No centralized model training on your thoughts. No cloud surveillance layer.
              </p>
              <p>
                The system is split into two layers. <strong className="text-foreground">Workspace Zones</strong> are free — Journal, Research, Trade, Decisions, Content, and Thinking Partner — where you capture thinking, build theses, and track decisions locally on your device. <strong className="text-foreground">Execution Zones</strong> are paid — Micro ($2.50), Founder ($5.00), and Treasury ($50.00) — where you deploy your work for adversarial audits via x402 USDC on Base.
              </p>
              <p>
                The AI is adversarial — not a chatbot, not a validator. It pushes back on weak reasoning, FOMO-driven logic, and narrative dependency. Each Workspace Zone has a "Deploy to Zone" button to send your work directly into an Execution Zone for pressure-testing. Write first, audit when the stakes are high. DJZS is designed to be honest, not helpful.
              </p>
            </div>
          </div>
        </motion.section>

        <motion.section variants={fadeUp} className="mb-20" data-testid="section-a2a-audit-api">
          <div className="p-8 rounded-3xl bg-gradient-to-br from-teal-500/10 to-transparent border border-teal-500/20">
            <h2 className="text-2xl font-bold text-foreground mb-2">A2A Audit API</h2>
            <p className="text-muted-foreground mb-8">Machine-readable logic audits for autonomous agents</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <div className="p-5 rounded-lg bg-muted border border-border hover:border-teal-500/20 transition-all" data-testid="card-api-endpoint">
                <div className="w-10 h-10 rounded-lg bg-teal-500/10 flex items-center justify-center mb-3">
                  <Code2 className="w-5 h-5 text-teal-400" />
                </div>
                <h4 className="text-sm font-bold text-foreground mb-2">Tiered API Endpoints</h4>
                <div className="space-y-1.5 mb-2">
                  <code className="block text-xs text-teal-300 bg-teal-500/10 px-3 py-2 rounded font-mono">POST /api/audit/micro</code>
                  <code className="block text-xs text-orange-300 bg-orange-500/10 px-3 py-2 rounded font-mono">POST /api/audit/founder</code>
                  <code className="block text-xs text-purple-300 bg-purple-500/10 px-3 py-2 rounded font-mono">POST /api/audit/treasury</code>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">Request schema: <code className="text-muted-foreground">strategy_memo</code> (string) + <code className="text-muted-foreground">audit_type</code> (treasury | founder_drift | strategy | general)</p>
              </div>

              <div className="p-5 rounded-lg bg-muted border border-border hover:border-teal-500/20 transition-all" data-testid="card-schema-discovery">
                <div className="w-10 h-10 rounded-lg bg-teal-500/10 flex items-center justify-center mb-3">
                  <FileCode className="w-5 h-5 text-teal-400" />
                </div>
                <h4 className="text-sm font-bold text-foreground mb-2">Schema Discovery</h4>
                <code className="block text-xs text-teal-300 bg-teal-500/10 px-3 py-2 rounded mb-2 font-mono">GET /api/audit/schema</code>
                <p className="text-xs text-muted-foreground leading-relaxed">Returns pricing, schema, and integration details for autonomous agent discovery</p>
              </div>

              <div className="p-5 rounded-lg bg-muted border border-border hover:border-purple-500/20 transition-all" data-testid="card-response-schema">
                <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center mb-3">
                  <CheckCircle className="w-5 h-5 text-purple-400" />
                </div>
                <h4 className="text-sm font-bold text-foreground mb-2">Proof of Logic Certificate</h4>
                <div className="space-y-1 text-xs text-muted-foreground">
                  <p><code className="text-red-300">verdict</code> — binary PASS / FAIL determination</p>
                  <p><code className="text-red-300">flags[]</code> — DJZS-LF failure codes with severity</p>
                  <p><code className="text-purple-300">tier</code> — micro | founder | treasury</p>
                  <p><code className="text-purple-300">risk_score</code> — 0-100 severity rating</p>
                  <p><code className="text-purple-300">primary_bias_detected</code> — top bias identified</p>
                  <p><code className="text-purple-300">logic_flaws[]</code> — array of reasoning errors</p>
                  <p><code className="text-purple-300">structural_recommendations[]</code> — actionable fixes</p>
                  <p><code className="text-purple-300">cryptographic_hash</code> — SHA-256 audit proof</p>
                </div>
              </div>

              <div className="p-5 rounded-lg bg-muted border border-border hover:border-orange-500/20 transition-all" data-testid="card-payment">
                <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center mb-3">
                  <DollarSign className="w-5 h-5 text-orange-400" />
                </div>
                <h4 className="text-sm font-bold text-foreground mb-2">Payment (x402)</h4>
                <div className="space-y-1 text-xs text-muted-foreground mb-2">
                  <p><strong className="text-teal-300">Micro-Zone</strong> — $2.50 USDC</p>
                  <p><strong className="text-orange-300">Founder Zone</strong> — $5.00 USDC</p>
                  <p><strong className="text-purple-300">Treasury Zone</strong> — $50.00 USDC</p>
                </div>
                <p className="text-xs text-muted-foreground">Pay-per-use on Base Mainnet. Agents pay at the HTTP layer via x402 micropayments.</p>
              </div>
            </div>

            <h3 className="text-lg font-bold text-foreground mb-4">Use Cases</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-5 rounded-lg bg-muted border border-orange-500/10 hover:border-orange-500/30 transition-all" data-testid="card-usecase-dao">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-bold text-foreground">DAO Treasury</h4>
                  <span className="text-xs font-bold text-orange-400 bg-orange-500/10 px-2 py-1 rounded">$50</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">Stress-test treasury allocation strategies before multi-sig execution</p>
              </div>

              <div className="p-5 rounded-lg bg-muted border border-teal-500/10 hover:border-teal-500/30 transition-all" data-testid="card-usecase-founder">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-bold text-foreground">Founder Drift</h4>
                  <span className="text-xs font-bold text-teal-400 bg-teal-500/10 px-2 py-1 rounded">$5</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">Strategic integrity check — detect mission drift and narrative dependency</p>
              </div>

              <div className="p-5 rounded-lg bg-muted border border-purple-500/10 hover:border-purple-500/30 transition-all" data-testid="card-usecase-micro">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-bold text-foreground">Micro-Audit</h4>
                  <span className="text-xs font-bold text-purple-400 bg-purple-500/10 px-2 py-1 rounded">$2.50</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">Quick "check my work" — fast logic audit for any reasoning memo</p>
              </div>
            </div>
          </div>
        </motion.section>

        <motion.section variants={fadeUp} className="mb-20">
          <h2 className="text-2xl font-bold text-foreground mb-8">Your Thinking is a Data Mine</h2>
          <div className="p-8 rounded-3xl bg-gradient-to-br from-orange-500/10 to-transparent border border-orange-500/20 mb-8" data-testid="card-why-privacy-docs">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-lg bg-orange-500/20 flex items-center justify-center">
                <Shield className="w-6 h-6 text-orange-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground">Every day, you capture your most valuable thoughts in digital notebooks. But where does that data really go?</h3>
              </div>
            </div>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                Your product roadmap. Your trade thesis. Your unpublished research. Your unreleased content strategy. This is your most sensitive data — and it shouldn't feed centralized AI models. Most apps say "we value your privacy" while building business models that depend on accessing your data.
              </p>
              <p>
                DJZS is designed differently from the ground up:
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 mb-6">
              <div className="p-4 rounded-lg bg-muted border border-border">
                <HardDrive className="w-5 h-5 text-orange-400 mb-2" />
                <h4 className="text-sm font-bold text-foreground mb-1">Local-First Storage</h4>
                <p className="text-xs text-muted-foreground">All entries, insights, memory pins, research trackers, and claims live in your browser's IndexedDB. We don't have a database of your thoughts. There's nothing to hack, subpoena, or sell.</p>
              </div>
              <div className="p-4 rounded-lg bg-muted border border-border">
                <ShieldCheck className="w-5 h-5 text-green-400 mb-2" />
                <h4 className="text-sm font-bold text-foreground mb-1">Vault Encryption</h4>
                <p className="text-xs text-muted-foreground">Set a passphrase to encrypt your vault with AES-256-GCM. Journal entries, AI insights, and memory pins are encrypted at rest. Even with device access, your thoughts stay locked.</p>
              </div>
              <div className="p-4 rounded-lg bg-muted border border-border">
                <Bot className="w-5 h-5 text-orange-400 mb-2" />
                <h4 className="text-sm font-bold text-foreground mb-1">User-Controlled AI</h4>
                <p className="text-xs text-muted-foreground">Your text is only sent to AI when you explicitly click "Think with me." The AI then pressure-tests your reasoning via Venice AI, which processes it without storing or training on your data. Nothing happens in the background.</p>
              </div>
              <div className="p-4 rounded-lg bg-muted border border-border">
                <KeyRound className="w-5 h-5 text-orange-400 mb-2" style={{ color: '#FFB84D' }} />
                <h4 className="text-sm font-bold text-foreground mb-1">Bring Your Own Key</h4>
                <p className="text-xs text-muted-foreground">Use your own Venice API key for full control over AI usage and billing. Your key stays in your browser's local storage, never on our servers.</p>
              </div>
              <div className="p-4 rounded-lg bg-muted border border-border">
                <Search className="w-5 h-5 text-orange-400 mb-2" />
                <h4 className="text-sm font-bold text-foreground mb-1">Privacy-First Search</h4>
                <p className="text-xs text-muted-foreground">Brave Search doesn't track or profile you. Venice AI's web search doesn't log queries. Your research stays your research.</p>
              </div>
              <div className="p-4 rounded-lg bg-muted border border-border">
                <Lock className="w-5 h-5 text-orange-400 mb-2" />
                <h4 className="text-sm font-bold text-foreground mb-1">Wallet-Based Identity</h4>
                <p className="text-xs text-muted-foreground">No email, no password, no account to breach. Your wallet is your identity. No personal information is required or stored.</p>
              </div>
            </div>
            <div className="p-4 rounded-lg bg-amber-500/[0.04] border border-amber-500/15">
              <p className="text-xs text-amber-300 font-semibold mb-1">What we're honest about</p>
              <p className="text-xs text-muted-foreground leading-relaxed">When you click "Think with me," your entry text is sent to Venice AI over the internet for processing. This is not end-to-end encrypted. Venice AI claims no data retention, but we can't independently verify that claim. We're transparent about this because we believe you deserve to know exactly when your data leaves your device.</p>
            </div>
            <div className="p-4 rounded-lg bg-green-500/[0.04] border border-green-500/15 mt-4">
              <p className="text-xs text-green-300 font-semibold mb-1">What IS encrypted at rest</p>
              <p className="text-xs text-muted-foreground leading-relaxed">When you set a vault passphrase, your journal entries, AI insights, and memory pins are encrypted locally using AES-256-GCM with PBKDF2 key derivation (600k iterations). Your passphrase never leaves your device. Even if someone copies your browser data, they cannot read your thoughts without your passphrase.</p>
            </div>
            <div className="p-4 rounded-lg bg-green-500/[0.04] border border-green-500/15 mt-4">
              <p className="text-xs text-green-300 font-semibold mb-1">What IS end-to-end encrypted</p>
              <p className="text-xs text-muted-foreground leading-relaxed">XMTP messaging is fully end-to-end encrypted using the MLS protocol with quantum-resistant key encapsulation (XWING KEM). When you interact with DJZS agents via XMTP, your messages are protected with forward secrecy, post-compromise security, and quantum resistance — the same level of protection as Signal and WhatsApp, using a newer standard. See the <a href="https://docs.xmtp.org/protocol/security" target="_blank" rel="noopener noreferrer" className="text-green-400 hover:text-green-300 underline underline-offset-2">XMTP Security Documentation</a> for full details.</p>
            </div>
          </div>
        </motion.section>

        <motion.section variants={fadeUp} className="mb-20">
          <h2 className="text-2xl font-bold text-foreground mb-8">Core Principles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard 
              icon={HardDrive}
              title="Local-First"
              description="Your entries and memories are stored on your device using IndexedDB. No server-side storage of your private thoughts."
            />
            <FeatureCard 
              icon={Shield}
              title="Privacy-First"
              description="Wallet-based identity. Your data is stored locally and only accessible on your device."
            />
            <FeatureCard 
              icon={Bot}
              title="Adversarial Thinking Partner"
              description="The AI challenges your thinking, not validates it. It exposes contradictions, flags weak logic, and asks the questions you're avoiding."
            />
            <FeatureCard 
              icon={Lock}
              title="No Surveillance"
              description="No feeds, no tracking, no centralized memory. A tool for thinking, not a network for sharing."
            />
            <FeatureCard 
              icon={Zap}
              title="Memory Control"
              description="You decide what to remember. Pin patterns worth keeping, forget what doesn't serve you."
            />
            <FeatureCard 
              icon={Key}
              title="Wallet Identity"
              description="Your wallet address is your identity. ENS names displayed for readability. No email, no password."
            />
          </div>
        </motion.section>

        <motion.section variants={fadeUp} className="mb-20">
          <h2 className="text-2xl font-bold text-foreground mb-2">Workspace Zones</h2>
          <p className="text-muted-foreground mb-8">Free. Local-first. Your space to think and build before deploying to the System.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-lg bg-gradient-to-br from-orange-500/[0.08] to-transparent border border-orange-500/20 hover:border-orange-500/30 transition-all">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-lg bg-orange-500/20 flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-orange-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground">Journal</h3>
                  <p className="text-xs text-orange-400/80">Private reflection and daily thinking</p>
                </div>
              </div>
              <p className="text-muted-foreground mb-5 leading-relaxed">Your private space to think — and have your thinking challenged. AI interrogates your entries for contradictions, blind spots, and weak assumptions.</p>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-2 shrink-0"></span>
                  <span><strong className="text-orange-300">Deep Reasoning</strong> - AI interrogates your entry for contradictions and weak assumptions</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-2 shrink-0"></span>
                  <span><strong className="text-orange-300">Memory Pinning</strong> - Save insights worth remembering long-term</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-2 shrink-0"></span>
                  <span><strong className="text-orange-300">Deploy to Zone</strong> - Send entries directly to an Execution Zone for paid adversarial audit</span>
                </li>
              </ul>
            </div>
            <div className="p-6 rounded-lg bg-gradient-to-br from-teal-500/[0.08] to-transparent border border-teal-500/20 hover:border-teal-500/30 transition-all">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-lg bg-teal-600/20 flex items-center justify-center">
                  <Search className="w-6 h-6 text-teal-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground">Research</h3>
                  <p className="text-xs text-teal-400/80">Search, synthesize, and track claims</p>
                </div>
              </div>
              <p className="text-muted-foreground mb-5 leading-relaxed">Search the web, interrogate information, expose contradictions, and track claims with evidence scoring.</p>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-2 shrink-0"></span>
                  <span><strong className="text-teal-300">Brave / Web / Explain Modes</strong> - Privacy-first web search, Venice AI search, or AI knowledge synthesis</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-2 shrink-0"></span>
                  <span><strong className="text-teal-300">Research Trackers & Claims</strong> - Organize findings into named folders with trust levels and status</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-2 shrink-0"></span>
                  <span><strong className="text-teal-300">Evidence Scoring</strong> - 4-axis strength scoring (Sources, Consensus, Recency, Method)</span>
                </li>
              </ul>
            </div>

            <div className="p-6 rounded-lg bg-gradient-to-br from-blue-500/[0.08] to-transparent border border-blue-500/20 hover:border-blue-500/30 transition-all">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-lg bg-blue-600/20 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground">Trade</h3>
                  <p className="text-xs text-blue-400/80">Build and stress-test trade theses</p>
                </div>
              </div>
              <p className="text-muted-foreground mb-5 leading-relaxed">Build trade theses, stress test with AI, compute risk, and wallet-sign artifacts. Deploy to Execution Zone for full adversarial audit.</p>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 shrink-0"></span>
                  <span><strong className="text-blue-300">Compose Thesis</strong> - Asset, side, timeframe, conviction, entry/exit strategy</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 shrink-0"></span>
                  <span><strong className="text-blue-300">AI Stress Test</strong> - Adversarial AI pressure-tests your thesis, calls out FOMO and weak logic</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 shrink-0"></span>
                  <span><strong className="text-blue-300">Deploy to Zone</strong> - Send thesis directly to an Execution Zone for paid adversarial audit</span>
                </li>
              </ul>
            </div>

            <div className="p-6 rounded-lg bg-gradient-to-br from-amber-500/[0.08] to-transparent border border-amber-500/20 hover:border-amber-500/30 transition-all">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-lg bg-amber-600/20 flex items-center justify-center">
                  <Brain className="w-6 h-6 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground">Decisions</h3>
                  <p className="text-xs text-amber-400/80">Track high-stakes decisions</p>
                </div>
              </div>
              <p className="text-muted-foreground mb-5 leading-relaxed">Track high-stakes decisions with structured context, options, and reasoning. Deploy to Execution Zone for adversarial pressure-testing.</p>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 shrink-0"></span>
                  <span><strong className="text-amber-300">Structured Compose</strong> - Title, context, options, reasoning, and stakes level</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 shrink-0"></span>
                  <span><strong className="text-amber-300">AI Review</strong> - AI pressure-tests reasoning and exposes blind spots</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 shrink-0"></span>
                  <span><strong className="text-amber-300">Deploy to Zone</strong> - Send decisions directly to an Execution Zone for paid audit</span>
                </li>
              </ul>
            </div>

            <div className="p-6 rounded-lg bg-gradient-to-br from-purple-500/[0.08] to-transparent border border-purple-500/20 hover:border-purple-500/30 transition-all">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-lg bg-purple-600/20 flex items-center justify-center">
                  <Palette className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground">Content</h3>
                  <p className="text-xs text-purple-400/80">Compose and refine content ideas</p>
                </div>
              </div>
              <p className="text-muted-foreground mb-5 leading-relaxed">Manage content ideas from spark to published. AI challenges your hook and angle before you ship.</p>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-2 shrink-0"></span>
                  <span><strong className="text-purple-300">Pipeline Tracking</strong> - Move ideas through stages: idea, drafting, review, ready, published</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-2 shrink-0"></span>
                  <span><strong className="text-purple-300">AI Refine</strong> - AI challenges your hook, pressure-tests your angle, and flags weaknesses</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-2 shrink-0"></span>
                  <span><strong className="text-purple-300">Deploy to Zone</strong> - Send content directly to an Execution Zone for paid audit</span>
                </li>
              </ul>
            </div>

            <div className="p-6 rounded-lg bg-gradient-to-br from-red-500/[0.08] to-transparent border border-red-500/20 hover:border-red-500/30 transition-all">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-lg bg-red-600/20 flex items-center justify-center">
                  <Zap className="w-6 h-6 text-red-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground">Thinking Partner</h3>
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
                <span className="text-sm font-bold text-teal-400 bg-teal-500/10 px-3 py-1 rounded">$2.50</span>
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
                <span className="text-sm font-bold text-orange-400 bg-orange-500/10 px-3 py-1 rounded">$5.00</span>
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
                <span className="text-sm font-bold text-purple-400 bg-purple-500/10 px-3 py-1 rounded">$50.00</span>
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
              All Execution Zone audits are saved locally in your <strong className="text-foreground">Cryptographic Ledger</strong> with SHA-256 hashes, verdict badges, and DJZS-LF failure codes. Review past results, compare risk scores across zones, and re-deploy memos at any time.
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

        <motion.section variants={fadeUp} className="mb-20" data-testid="section-founder-intelligence">
          <h2 className="text-2xl font-bold text-foreground mb-2">Founder Intelligence Engine</h2>
          <p className="text-muted-foreground mb-8">Pre-flight vault analysis before every audit deployment</p>
          <div className="p-8 rounded-3xl bg-gradient-to-br from-amber-500/10 to-transparent border border-amber-500/20 mb-8">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-lg bg-amber-600/20 flex items-center justify-center">
                <Scan className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground">5 Pattern Analyzers</h3>
                <p className="text-xs text-amber-400/80">Your vault history becomes pre-flight intelligence for every audit</p>
              </div>
            </div>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Before every audit deployment, the Founder Intelligence engine scans your local vault history — past audits, journal entries, and memory pins — to surface patterns that make your current submission stronger. This context is injected into the AI agent prompt as an <strong className="text-foreground">Intelligence Brief</strong>, giving the adversarial AI historical ammunition to challenge you more precisely.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="p-4 rounded-lg bg-muted border border-border">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="w-4 h-4 text-amber-400" />
                  <h4 className="text-sm font-bold text-foreground">Bias Pattern Memory</h4>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">Scans past audit results for recurring bias types. If you keep triggering FOMO or confirmation bias, the AI knows before you submit.</p>
              </div>
              <div className="p-4 rounded-lg bg-muted border border-border">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-amber-400" />
                  <h4 className="text-sm font-bold text-foreground">Narrative Drift Detection</h4>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">Compares your current submission against past entries to detect when your story has shifted without acknowledgment.</p>
              </div>
              <div className="p-4 rounded-lg bg-muted border border-border">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <h4 className="text-sm font-bold text-foreground">Assumption Kill Switch</h4>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">Identifies assumptions in your submission that were previously flagged as weak or refuted in past audits.</p>
              </div>
              <div className="p-4 rounded-lg bg-muted border border-border">
                <div className="flex items-center gap-2 mb-2">
                  <BarChart3 className="w-4 h-4 text-amber-400" />
                  <h4 className="text-sm font-bold text-foreground">Volatility Simulation</h4>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">Checks if your risk tolerance has changed between submissions — flags when you're suddenly more aggressive without justification.</p>
              </div>
              <div className="p-4 rounded-lg bg-muted border border-border md:col-span-2">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <h4 className="text-sm font-bold text-foreground">Emotional Spike Flag</h4>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">Detects urgency language, FOMO markers, and emotional escalation patterns in your submission text that correlate with poor decision-making.</p>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-amber-500/[0.04] border border-amber-500/15">
              <p className="text-xs text-muted-foreground leading-relaxed">
                The Intelligence Brief is displayed as a collapsible panel alongside your audit results. All analysis runs locally against your vault — no data leaves your device for intelligence gathering. The brief is also injected into the AI prompt so the adversarial agent can reference your history when challenging your submission.
              </p>
            </div>
          </div>
        </motion.section>

        <motion.section variants={fadeUp} className="mb-20">
          <h2 className="text-2xl font-bold text-foreground mb-8">Research Trackers & Claims</h2>
          <div className="p-8 rounded-3xl bg-gradient-to-br from-teal-500/10 to-transparent border border-teal-500/20 mb-8">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-lg bg-teal-600/20 flex items-center justify-center">
                <FileSearch className="w-6 h-6 text-teal-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground">Organize Research into Trackers</h3>
                <p className="text-xs text-teal-400/80">Named folders for structured knowledge building</p>
              </div>
            </div>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Research trackers are folders that let you organize findings by topic. Each tracker holds claims — key takeaways from your research — with trust levels and status tracking. Think of them as structured evidence files for any topic you're investigating.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-teal-300">How Trackers Work</h4>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-2 shrink-0"></span>
                    <span><strong className="text-teal-300">Quick Search</strong> — Use Quick search for standalone research queries that don't need to be organized</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-2 shrink-0"></span>
                    <span><strong className="text-teal-300">Create a Tracker</strong> — Click the folder icon, then "New tracker" to create a named research folder (e.g., "AI Agents", "DeFi Yields")</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-2 shrink-0"></span>
                    <span><strong className="text-teal-300">Select a Tracker</strong> — Pick an existing tracker from the dropdown before searching. All claims you save will go into that folder</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-2 shrink-0"></span>
                    <span><strong className="text-teal-300">Delete a Tracker</strong> — Hover over a tracker name in the dropdown and click the trash icon to remove it</span>
                  </li>
                </ul>
              </div>
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-teal-300">Claims & Trust Levels</h4>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-2 shrink-0"></span>
                    <span><strong className="text-teal-300">Save Claims</strong> — After a research result, click the + button next to any key takeaway to save it as a claim in your active tracker</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-2 shrink-0"></span>
                    <span><strong className="text-teal-300">Trust Levels</strong> — Rate each claim's reliability: verified, likely, speculative, or contested</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-2 shrink-0"></span>
                    <span><strong className="text-teal-300">Status Tracking</strong> — Mark claims as active, archived, or refuted as your research evolves</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-2 shrink-0"></span>
                    <span><strong className="text-teal-300">Journal Linking</strong> — Connect claims to journal entries so your research and daily thinking reference each other</span>
                  </li>
                </ul>
              </div>
            </div>
            <div className="p-4 rounded-lg bg-teal-500/[0.06] border border-teal-500/15">
              <p className="text-sm text-muted-foreground leading-relaxed">
                All trackers and claims are stored locally in your browser's IndexedDB. Nothing is sent to a server. Your research stays private and portable.
              </p>
            </div>
          </div>
        </motion.section>

        <motion.section variants={fadeUp} className="mb-20">
          <h2 className="text-2xl font-bold text-foreground mb-8">AI-Forward Research Intelligence</h2>
          <div className="p-8 rounded-3xl bg-gradient-to-br from-teal-500/10 to-transparent border border-teal-500/20 mb-8">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-lg bg-teal-600/20 flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-teal-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground">Algorithmic Analysis, Not Guesswork</h3>
                <p className="text-xs text-teal-400/80">Evidence scoring, structured contradictions, and adaptive depth</p>
              </div>
            </div>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Every research result in DJZS is more than a summary. The AI breaks down its analysis into structured, scorable dimensions so you can see exactly how strong the evidence is — and where the gaps are. No hand-waving, no "it depends." Algorithmic transparency for sovereign thinkers.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="p-5 rounded-lg bg-muted border border-border" data-testid="card-evidence-scoring">
                <div className="flex items-center gap-2 mb-3">
                  <BarChart3 className="w-5 h-5 text-teal-400" />
                  <h4 className="text-sm font-bold text-foreground">Evidence Strength Scoring</h4>
                </div>
                <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
                  Each research result gets a 4-axis score from 0 to 100, visualized as progress bars with color-coded thresholds:
                </p>
                <ul className="space-y-2 text-xs text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ background: '#2E8B8B' }}></span>
                    <span><strong className="text-teal-300">Sources</strong> — Number and diversity of references backing the synthesis</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ background: '#2E8B8B' }}></span>
                    <span><strong className="text-teal-300">Consensus</strong> — Degree of agreement across sources</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ background: '#2E8B8B' }}></span>
                    <span><strong className="text-teal-300">Recency</strong> — How current the information is</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ background: '#2E8B8B' }}></span>
                    <span><strong className="text-teal-300">Method</strong> — Rigor of the underlying methodology</span>
                  </li>
                </ul>
                <p className="text-xs text-muted-foreground/80 mt-3">Scores above 70 show green, 40-70 amber, below 40 red — instant signal quality at a glance.</p>
              </div>

              <div className="p-5 rounded-lg bg-muted border border-border" data-testid="card-ai-observing">
                <div className="flex items-center gap-2 mb-3">
                  <Eye className="w-5 h-5 text-teal-400" />
                  <h4 className="text-sm font-bold text-foreground">AI Observing Panel</h4>
                </div>
                <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
                  A dedicated panel where the AI shares what it noticed while analyzing your query — meta-observations about patterns, information gaps, or surprising connections that don't fit neatly into the main synthesis.
                </p>
                <p className="text-xs text-muted-foreground/80 leading-relaxed">
                  Think of it as the AI's margin notes: "I noticed the strongest sources agree on X but diverge sharply on Y" or "There's a gap in recent data that older sources filled differently." These observations help you calibrate how much to trust the synthesis.
                </p>
              </div>

              <div className="p-5 rounded-lg bg-muted border border-border" data-testid="card-structured-analysis">
                <div className="flex items-center gap-2 mb-3">
                  <Layers className="w-5 h-5 text-teal-400" />
                  <h4 className="text-sm font-bold text-foreground">Structured Analysis</h4>
                </div>
                <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
                  Research results are broken into three clearly labeled sections:
                </p>
                <ul className="space-y-2 text-xs text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 mt-1.5 shrink-0"></span>
                    <span><strong className="text-green-300">Consensus Points</strong> — Where multiple sources agree. The foundation you can likely trust.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0"></span>
                    <span><strong className="text-amber-300">Contradictions</strong> — Where sources disagree. The fault lines worth investigating.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 shrink-0"></span>
                    <span><strong className="text-red-300">Weak Assumptions</strong> — Claims that lack strong evidence. The risks in your research.</span>
                  </li>
                </ul>
              </div>

              <div className="p-5 rounded-lg bg-muted border border-border" data-testid="card-nuanced-mode">
                <div className="flex items-center gap-2 mb-3">
                  <ArrowRightLeft className="w-5 h-5 text-teal-400" />
                  <h4 className="text-sm font-bold text-foreground">Adaptive Depth: "More Nuanced" Mode</h4>
                </div>
                <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
                  After getting an initial synthesis, click "More nuanced" to re-run the query with a depth modifier. The AI shifts its approach:
                </p>
                <ul className="space-y-2 text-xs text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-1.5 shrink-0"></span>
                    <span>Prioritizes edge-case evidence and minority viewpoints</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-1.5 shrink-0"></span>
                    <span>Surfaces contradictions more aggressively</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-1.5 shrink-0"></span>
                    <span>Highlights counter-arguments the initial pass may have glossed over</span>
                  </li>
                </ul>
                <p className="text-xs text-muted-foreground/80 mt-3">This isn't just "search again." The AI modifies its internal prompt to actively seek dissenting evidence.</p>
              </div>
            </div>

            <div className="p-5 rounded-lg bg-teal-500/[0.06] border border-teal-500/15 mb-4" data-testid="card-thinking-partner-transition">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <p className="text-sm font-bold text-purple-300">Seamless Thinking Partner Transition</p>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Found something worth pressure-testing? Click the "Think deeper with Thinking Partner" button on any research result. It auto-loads your research context into the Journal Zone so the adversarial AI can challenge your conclusions — no copy-pasting, no context loss. Research flows into interrogation in one click.
              </p>
            </div>

            <div className="p-4 rounded-lg bg-teal-500/[0.04] border border-teal-500/10">
              <p className="text-xs text-muted-foreground leading-relaxed">
                All AI analysis features are powered by Venice AI with no data retention. Evidence scores are algorithmically determined by the AI based on the quality of available information — they are not editable by users. Results with staggered fade-in animations reveal each section sequentially for focused reading.
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
                <p className="text-xs text-purple-400/80">Three structured agents, one dispatcher</p>
              </div>
            </div>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              OpenClaw is DJZS's agent runner — a clean dispatcher that routes requests to three specialized AI agents. Each agent wraps Venice AI calls and returns strictly typed, structured JSON. No thinking happens in the dispatcher; all intelligence lives in the agent classes.
            </p>

            <div className="p-5 rounded-lg bg-purple-500/[0.06] border border-purple-500/15 mb-6">
              <p className="text-sm font-bold text-purple-300 mb-3">How It Connects to What You See</p>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-2 shrink-0"></span>
                  <span>When you write in the <strong className="text-orange-300">Journal Zone</strong> and click <strong className="text-foreground">"Think with me"</strong>, the JournalInsight agent interrogates your entry, pulls in your recent entries and memory pins as context, and returns a structured breakdown of contradictions, blind spots, emotional biases, and adversarial questions.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-2 shrink-0"></span>
                  <span>When you search in the <strong className="text-teal-300">Research Zone</strong> and click <strong className="text-foreground">"Research"</strong>, the ResearchSynth agent interrogates information from web results or AI knowledge, exposes contradictions across sources, flags weak assumptions, and calls out what you haven't investigated yet.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-2 shrink-0"></span>
                  <span>The <strong className="text-purple-300">ThinkingPartner</strong> agent works behind the scenes to challenge your ideas, expose tensions in your reasoning, and flag narrative dependency — acting as an adversarial pressure-tester, not a chatbot.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 shrink-0"></span>
                  <span>In the <strong className="text-amber-300">Decisions Zone</strong>, AI interrogates your decision reasoning, pressure-tests your options, and calls out blind spots before you commit to high-stakes choices.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-2 shrink-0"></span>
                  <span>In the <strong className="text-cyan-300">Content Zone</strong>, AI challenges your content hook, pressure-tests your angle, and flags weaknesses before your ideas reach your audience.</span>
                </li>
              </ul>
            </div>

            <p className="text-xs text-muted-foreground mb-6 font-mono" data-testid="text-openclaw-api">
              API: POST /api/openclaw/run {'{'} agent: "JournalInsight" | "ResearchSynth" | "ThinkingPartner", payload: {'{'} ... {'}'} {'}'}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-lg bg-gradient-to-br from-orange-500/[0.08] to-transparent border border-orange-500/20" data-testid="card-agent-journal">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-orange-400" />
                </div>
                <h3 className="text-lg font-bold text-foreground">JournalInsight</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">Interrogates journal entries for contradictions, weak claims, blind spots, and emotional biases.</p>
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
            <div className="p-6 rounded-lg bg-gradient-to-br from-teal-500/[0.08] to-transparent border border-teal-500/20" data-testid="card-agent-research">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-teal-600/20 flex items-center justify-center">
                  <Search className="w-5 h-5 text-teal-400" />
                </div>
                <h3 className="text-lg font-bold text-foreground">ResearchSynth</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">Interrogates batches of research entries, exposes contradictions across sources, and flags weak assumptions.</p>
              <ul className="space-y-2 text-xs text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="w-1 h-1 rounded-full bg-teal-400 mt-1.5 shrink-0"></span>
                  <span>Pressure-tests claims across sources</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1 h-1 rounded-full bg-teal-400 mt-1.5 shrink-0"></span>
                  <span>Exposes where sources contradict each other</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1 h-1 rounded-full bg-teal-400 mt-1.5 shrink-0"></span>
                  <span>Flags weak assumptions and narrative dependency</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1 h-1 rounded-full bg-teal-400 mt-1.5 shrink-0"></span>
                  <span>Calls out what you haven't investigated yet</span>
                </li>
              </ul>
            </div>
            <div className="p-6 rounded-lg bg-gradient-to-br from-purple-500/[0.08] to-transparent border border-purple-500/20" data-testid="card-agent-thinking">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-purple-600/20 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-purple-400" />
                </div>
                <h3 className="text-lg font-bold text-foreground">ThinkingPartner</h3>
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
                    <span><strong className="text-green-300">Journal entries</strong> — Your entry text is encrypted before storage</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 mt-2 shrink-0"></span>
                    <span><strong className="text-green-300">AI insights</strong> — The "what you said," "why it matters," "next move," and reflective question fields</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 mt-2 shrink-0"></span>
                    <span><strong className="text-green-300">Memory pins</strong> — Pinned memory content is encrypted at rest</span>
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
                <span><strong style={{ color: '#FFB84D' }}>Automatic Injection</strong> — Once set, your key is used for all AI calls: journal insights, research, stress tests, and thinking partner</span>
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
          <h2 className="text-2xl font-bold text-foreground mb-8">Technical Stack</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <TechStackItem 
              category="Frontend"
              items={["React 18", "TypeScript", "Vite", "Tailwind CSS", "Radix UI", "Framer Motion"]}
            />
            <TechStackItem 
              category="State & Data"
              items={["TanStack Query", "Dexie (IndexedDB)", "Zod Validation"]}
            />
            <TechStackItem 
              category="Web3"
              items={["wagmi", "viem", "RainbowKit", "ENS Resolution"]}
            />
            <TechStackItem 
              category="Backend"
              items={["Express.js", "TypeScript", "Drizzle ORM"]}
            />
            <TechStackItem 
              category="AI & Agents"
              items={["Venice AI", "OpenClaw Runner", "Brave Search API", "Reasoning Models", "Structured JSON"]}
            />
            <TechStackItem 
              category="Storage & Security"
              items={["IndexedDB (local)", "AES-GCM-256", "PBKDF2 (600k)", "WebCrypto API", "BYOK (Venice)"]}
            />
            <TechStackItem 
              category="A2A Payments"
              items={["x402 Protocol", "@x402/express", "USDC on Base", "SHA-256 Hashing", "Three-tier pricing"]}
            />
          </div>
        </motion.section>

        <motion.section variants={fadeUp} className="mb-20">
          <h2 className="text-2xl font-bold text-foreground mb-8">Quick Links</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <QuickLink 
              href="/chat"
              title="Open Workspace"
              description="Start thinking in the Workspace Zones"
              testId="link-start-journaling"
            />
            <QuickLink 
              href="/chat?zone=audit"
              title="Deploy Audit"
              description="Deploy a payload to the Execution Zones"
              testId="link-deploy-audit"
            />
            <QuickLink 
              href="/privacy"
              title="Privacy & Security"
              description="How your data stays private"
              testId="link-privacy"
            />
            <QuickLink 
              href="/terms"
              title="Terms of Service"
              description="Legal terms and risk disclosures"
              testId="link-terms"
            />
            <QuickLink 
              href="https://github.com/UsernameDAOEth/djzs-box"
              title="GitHub Repository"
              description="View source code on GitHub"
              external
              testId="link-github-repo"
            />
            <QuickLink 
              href="/api/audit/schema"
              title="Audit API Schema"
              description="Machine-readable API docs for agent integration"
              external
              testId="link-audit-api"
            />
          </div>
        </motion.section>

        <motion.section variants={fadeUp} className="mb-20">
          <div className="p-8 rounded-3xl bg-muted border border-border">
            <h2 className="text-2xl font-bold text-foreground mb-6">Our Philosophy</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-5 rounded-lg border border-orange-500/20" style={{ background: 'rgba(243,126,32,0.04)' }}>
                <div className="flex items-center gap-3 mb-3">
                  <HardDrive className="w-5 h-5 text-orange-400" />
                  <h3 className="text-sm font-bold text-foreground">Local-First</h3>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">Your journal and memory vault are stored locally in your browser. They are never on our servers. This isn't a feature; it's the foundation of our privacy model.</p>
              </div>
              <div className="p-5 rounded-lg border border-teal-500/20" style={{ background: 'rgba(46,139,139,0.04)' }}>
                <div className="flex items-center gap-3 mb-3">
                  <Shield className="w-5 h-5 text-teal-400" />
                  <h3 className="text-sm font-bold text-foreground">Sovereign</h3>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">We believe you should have a digital space that is truly yours. DJ-Z-S is your sovereign workspace, free from the prying eyes of ad-tech and AI companies.</p>
              </div>
              <div className="p-5 rounded-lg border border-purple-500/20" style={{ background: 'rgba(123,107,141,0.04)' }}>
                <div className="flex items-center gap-3 mb-3">
                  <Brain className="w-5 h-5 text-purple-400" />
                  <h3 className="text-sm font-bold text-foreground">Uncensored</h3>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">Our AI is designed to be your thinking partner, not your censor. It won't refuse to explore controversial ideas or sensitive strategies. Your thoughts are your own.</p>
              </div>
            </div>
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
              <p>After years of building in Web3 and watching founders, traders, and researchers have their most valuable ideas scraped and profited from by centralized platforms, I decided to build the tool I desperately needed.</p>
              <p>DJZS.AI isn't a faceless startup; it's a project with a singular mission: to give you a private space to do your best work. Your trust is the only thing that matters here.</p>
            </div>
          </div>
        </motion.section>

        <motion.footer variants={fadeUp} className="text-center py-12 border-t border-border">
          <p className="text-sm text-muted-foreground/80">
            Built with privacy in mind. Your thinking stays yours.
          </p>
        </motion.footer>
      </motion.main>
    </div>
  );
}
