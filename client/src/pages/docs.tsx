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
  Database,
  Cpu,
  Globe,
  Key,
  FileText,
  Layers,
  ExternalLink,
  TrendingUp
} from "lucide-react";
import { motion } from "framer-motion";

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
    <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:border-purple-500/20 transition-all group">
      <div className="w-10 h-10 rounded-xl bg-purple-600/10 flex items-center justify-center mb-4 group-hover:bg-purple-600/20 transition-colors">
        <Icon className="w-5 h-5 text-purple-400" />
      </div>
      <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
      <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
    </div>
  );
}

interface QuickLinkProps {
  href: string;
  title: string;
  description: string;
  external?: boolean;
}

function QuickLink({ href, title, description, external }: QuickLinkProps) {
  const content = (
    <div className="p-5 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:border-purple-500/30 hover:bg-purple-500/[0.03] transition-all group cursor-pointer">
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-bold text-white group-hover:text-purple-300 transition-colors">{title}</h4>
        {external ? (
          <ExternalLink className="w-4 h-4 text-gray-600 group-hover:text-purple-400 transition-colors" />
        ) : (
          <ArrowRight className="w-4 h-4 text-gray-600 group-hover:text-purple-400 group-hover:translate-x-1 transition-all" />
        )}
      </div>
      <p className="text-xs text-gray-500">{description}</p>
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
    <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.03]">
      <h4 className="text-[10px] font-black text-purple-400 uppercase tracking-widest mb-3">{category}</h4>
      <div className="flex flex-wrap gap-2">
        {items.map((item, i) => (
          <span key={i} className="px-2.5 py-1 rounded-lg bg-white/[0.03] text-xs text-gray-400 font-medium">
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function Docs() {
  return (
    <div className="min-h-screen bg-[#050505] text-gray-300 selection:bg-purple-500/30">
      <header className="sticky top-0 z-50 bg-[#050505]/80 backdrop-blur-xl border-b border-white/[0.02]">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/">
            <button className="flex items-center gap-2 text-sm font-black text-white tracking-[0.15em] uppercase opacity-60 hover:opacity-100 hover:text-purple-400 transition-all group">
              <Home className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              <span>DJZS</span>
            </button>
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/chat">
              <button className="text-sm font-bold text-gray-500 hover:text-white transition-colors">
                Open App
              </button>
            </Link>
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
          <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight mb-6">
            DJZS Documentation
          </h1>
          <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
            A private, local-first AI journaling partner that helps you think more clearly.
          </p>
          <div className="flex justify-center gap-4 mt-8">
            <Link href="/chat">
              <button className="px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold transition-colors" data-testid="button-start-writing">
                Start Writing
              </button>
            </Link>
          </div>
        </motion.div>

        <motion.section variants={fadeUp} className="mb-20">
          <div className="p-8 rounded-3xl bg-gradient-to-br from-purple-500/10 to-transparent border border-purple-500/20">
            <h2 className="text-2xl font-black text-white mb-4">What is DJZS?</h2>
            <div className="space-y-4 text-gray-400 leading-relaxed">
              <p className="text-lg">
                DJZS is an <strong className="text-white">AI journaling partner for thinking and research</strong>. It creates a private space where you can process ideas, track patterns in your thinking, and develop clarity—without the AI taking over.
              </p>
              <p>
                Unlike traditional journaling apps that store your data on remote servers, or AI assistants that generate content for you, DJZS is built on a different philosophy: <strong className="text-purple-300">your thinking should stay yours</strong>.
              </p>
              <p>
                The AI doesn't generate content or save memory automatically. It helps you reflect on your own thinking and build insight through daily habit.
              </p>
            </div>
          </div>
        </motion.section>

        <motion.section variants={fadeUp} className="mb-20">
          <h2 className="text-2xl font-black text-white mb-8">Core Principles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard 
              icon={HardDrive}
              title="Local-First"
              description="Your entries and memories are stored on your device using IndexedDB. No server-side storage of your private thoughts."
            />
            <FeatureCard 
              icon={Shield}
              title="E2E Private"
              description="Cryptographic identity via wallet connection. Your data is encrypted and only accessible to you."
            />
            <FeatureCard 
              icon={Bot}
              title="Thinking Partner"
              description="The AI helps you think, not think for you. It surfaces patterns and asks questions rather than generating answers."
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
          <h2 className="text-2xl font-black text-white mb-8">Zones</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-purple-600/20 flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-purple-400" />
                </div>
                <h3 className="text-xl font-bold text-white">Journal</h3>
              </div>
              <p className="text-gray-400 mb-4">Your private space to think, reflect, and extract insight.</p>
              <ul className="space-y-2 text-sm text-gray-500">
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 mt-1">•</span>
                  Daily reflection prompts that rotate
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 mt-1">•</span>
                  AI analysis with Summary / Insight / Reflection format
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 mt-1">•</span>
                  Pattern pinning for recurring themes
                </li>
              </ul>
            </div>
            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-cyan-600/20 flex items-center justify-center">
                  <Search className="w-5 h-5 text-cyan-400" />
                </div>
                <h3 className="text-xl font-bold text-white">Research</h3>
              </div>
              <p className="text-gray-400 mb-4">Collective context and verified intelligence.</p>
              <ul className="space-y-2 text-sm text-gray-500">
                <li className="flex items-start gap-2">
                  <span className="text-cyan-400 mt-1">•</span>
                  Key Claims / Evidence / Unknowns format
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-400 mt-1">•</span>
                  Track what you know vs. what you assume
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-400 mt-1">•</span>
                  Surface questions worth investigating
                </li>
              </ul>
            </div>
            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-green-600/20 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-green-400" />
                </div>
                <h3 className="text-xl font-bold text-white">Trade</h3>
              </div>
              <p className="text-gray-400 mb-4">Execute with clarity. Think through trades before you act.</p>
              <ul className="space-y-2 text-sm text-gray-500">
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">•</span>
                  Natural language commands (swap, portfolio, price, analyze, pnl)
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">•</span>
                  Wallet analysis with win rate and risk scoring
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">•</span>
                  PnL reports with best/worst trade tracking
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">•</span>
                  Limit orders with order management
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">•</span>
                  x402 micropayments for API access
                </li>
              </ul>
            </div>
          </div>
        </motion.section>

        <motion.section variants={fadeUp} className="mb-20">
          <h2 className="text-2xl font-black text-white mb-8">Technical Stack</h2>
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
              items={["wagmi", "viem", "RainbowKit", "ENS Resolution", "x402 (micropayments)"]}
            />
            <TechStackItem 
              category="Backend"
              items={["Express.js", "TypeScript", "Drizzle ORM"]}
            />
            <TechStackItem 
              category="AI"
              items={["Venice AI", "Structured JSON Responses"]}
            />
            <TechStackItem 
              category="Storage"
              items={["IndexedDB (local)", "PostgreSQL (optional)", "In-memory"]}
            />
          </div>
        </motion.section>

        <motion.section variants={fadeUp} className="mb-20">
          <h2 className="text-2xl font-black text-white mb-8">Trade Zone Setup</h2>
          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
            <p className="text-gray-400 mb-6">
              The Trade Zone uses the x402 micropayments protocol to access blockchain data APIs. 
              Each API call costs a small amount (fractions of a cent). To enable these features:
            </p>
            <div className="space-y-4">
              <div className="bg-white/[0.03] rounded-lg p-4 border border-white/[0.05]">
                <h4 className="text-sm font-black text-green-400 uppercase tracking-widest mb-2">Step 1: Create a Wallet</h4>
                <p className="text-gray-500 text-sm">
                  Create a new Ethereum wallet (or use an existing one) that will pay for API requests. 
                  This should be a separate wallet from your main funds.
                </p>
              </div>
              <div className="bg-white/[0.03] rounded-lg p-4 border border-white/[0.05]">
                <h4 className="text-sm font-black text-green-400 uppercase tracking-widest mb-2">Step 2: Fund the Wallet</h4>
                <p className="text-gray-500 text-sm">
                  Send a small amount of ETH or USDC to this wallet on <strong className="text-white">Base network</strong>. 
                  Even $5-10 will cover thousands of API calls.
                </p>
              </div>
              <div className="bg-white/[0.03] rounded-lg p-4 border border-white/[0.05]">
                <h4 className="text-sm font-black text-green-400 uppercase tracking-widest mb-2">Step 3: Add Private Key</h4>
                <p className="text-gray-500 text-sm">
                  Add the wallet's private key to your Replit Secrets as <code className="text-white bg-white/[0.1] px-1.5 py-0.5 rounded">PRIVATE_KEY</code>. 
                  This allows the server to sign payment transactions automatically.
                </p>
              </div>
            </div>
            <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <p className="text-yellow-400 text-sm">
                <strong>Security Note:</strong> Use a dedicated wallet with limited funds. Never use your main wallet's private key.
              </p>
            </div>
          </div>
        </motion.section>

        <motion.section variants={fadeUp} className="mb-20">
          <h2 className="text-2xl font-black text-white mb-8">XMTP Agent Commands</h2>
          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
            <p className="text-gray-400 mb-6">
              The DJZS Agent runs on XMTP and responds to commands in encrypted messages. 
              It integrates with the Trade Zone for autonomous trading signals.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-black text-purple-400 uppercase tracking-widest mb-3">General</h4>
                <ul className="space-y-2 text-sm font-mono">
                  <li className="flex items-start gap-3">
                    <code className="text-white bg-white/[0.05] px-2 py-0.5 rounded">/help</code>
                    <span className="text-gray-500">List all commands</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <code className="text-white bg-white/[0.05] px-2 py-0.5 rounded">/zones</code>
                    <span className="text-gray-500">Display all zones</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <code className="text-white bg-white/[0.05] px-2 py-0.5 rounded">/format signal</code>
                    <span className="text-gray-500">Signal card format</span>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-black text-green-400 uppercase tracking-widest mb-3">Trade Zone</h4>
                <ul className="space-y-2 text-sm font-mono">
                  <li className="flex items-start gap-3">
                    <code className="text-white bg-white/[0.05] px-2 py-0.5 rounded">/price ETH</code>
                    <span className="text-gray-500">Get token price</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <code className="text-white bg-white/[0.05] px-2 py-0.5 rounded">/portfolio 0x...</code>
                    <span className="text-gray-500">View holdings</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <code className="text-white bg-white/[0.05] px-2 py-0.5 rounded">/balance 0x...</code>
                    <span className="text-gray-500">Token balances</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <code className="text-white bg-white/[0.05] px-2 py-0.5 rounded">/analyze 0x...</code>
                    <span className="text-gray-500">Trading analysis</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <code className="text-white bg-white/[0.05] px-2 py-0.5 rounded">/pnl 0x... 30d</code>
                    <span className="text-gray-500">Profit/loss report</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <code className="text-white bg-white/[0.05] px-2 py-0.5 rounded">/quote 100 USDC to ETH</code>
                    <span className="text-gray-500">Get swap quote</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </motion.section>

        <motion.section variants={fadeUp} className="mb-20">
          <h2 className="text-2xl font-black text-white mb-8">Quick Links</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <QuickLink 
              href="/chat"
              title="Start Journaling"
              description="Open the app and begin writing"
            />
            <QuickLink 
              href="/chat?zone=research"
              title="Research Mode"
              description="Gather claims and track evidence"
            />
            <QuickLink 
              href="/chat?zone=trade"
              title="Trade Zone"
              description="Execute trades with natural language"
            />
            <QuickLink 
              href="/terms"
              title="Terms of Service"
              description="Legal terms and risk disclosures"
            />
            <QuickLink 
              href="/"
              title="Home"
              description="Back to landing page"
            />
          </div>
        </motion.section>

        <motion.section variants={fadeUp} className="mb-20">
          <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/[0.03]">
            <h2 className="text-2xl font-black text-white mb-6">Philosophy</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-sm font-black text-purple-400 uppercase tracking-widest mb-3">What DJZS Is</h3>
                <ul className="space-y-2 text-gray-400">
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">✓</span>
                    An AI journaling partner
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">✓</span>
                    A thinking partner
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">✓</span>
                    A tool for clarity
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">✓</span>
                    Local-first and private
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-black text-gray-600 uppercase tracking-widest mb-3">What DJZS Is Not</h3>
                <ul className="space-y-2 text-gray-500">
                  <li className="flex items-start gap-2">
                    <span className="text-red-500/50 mt-1">✗</span>
                    AI therapist
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500/50 mt-1">✗</span>
                    AI coach
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500/50 mt-1">✗</span>
                    Memory system or "second brain"
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500/50 mt-1">✗</span>
                    Content generator
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </motion.section>

        <motion.footer variants={fadeUp} className="text-center py-12 border-t border-white/[0.03]">
          <p className="text-sm text-gray-600">
            Built with privacy in mind. Your thinking stays yours.
          </p>
        </motion.footer>
      </motion.main>
    </div>
  );
}
