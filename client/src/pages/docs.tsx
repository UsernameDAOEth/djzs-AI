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
  Network,
  Users,
  Database,
  Fingerprint,
  Globe,
  Video,
  Brain,
  Music,
  Sparkles,
  FileSearch
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
    <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:border-orange-500/20 transition-all group">
      <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center mb-4 group-hover:bg-orange-500/20 transition-colors">
        <Icon className="w-5 h-5 text-orange-400" />
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
  testId?: string;
}

function QuickLink({ href, title, description, external, testId }: QuickLinkProps) {
  const content = (
    <div className="p-5 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:border-orange-500/30 hover:bg-orange-500/[0.03] transition-all group cursor-pointer" data-testid={testId}>
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-bold text-white group-hover:text-orange-300 transition-colors">{title}</h4>
        {external ? (
          <ExternalLink className="w-4 h-4 text-gray-600 group-hover:text-orange-400 transition-colors" />
        ) : (
          <ArrowRight className="w-4 h-4 text-gray-600 group-hover:text-orange-400 group-hover:translate-x-1 transition-all" />
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
      <h4 className="text-[10px] font-bold text-orange-400 uppercase tracking-wide mb-3">{category}</h4>
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
    <div className="min-h-screen text-gray-300 selection:bg-orange-500/30" style={{ background: '#2A2E3F' }}>
      <header className="sticky top-0 z-50 backdrop-blur-xl border-b border-white/[0.02]" style={{ background: 'rgba(42,46,63,0.8)' }}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/">
            <button className="flex items-center gap-2 text-sm font-bold text-white tracking-wide uppercase opacity-60 hover:opacity-100 hover:text-orange-400 transition-all group">
              <img src="/logo.png" alt="DJZS" className="w-6 h-6 rounded transition-transform group-hover:-translate-x-1" style={{ filter: 'drop-shadow(0 0 2px rgba(0,0,0,0.3))' }} data-testid="img-logo-docs" />
              <span>DJZS</span>
            </button>
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/chat">
              <button className="text-sm font-bold text-gray-500 hover:text-white transition-colors" data-testid="button-open-app-docs">
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
            A decentralized, quantum-resilient AI thinking system. Local-first storage, E2E encrypted messaging, and decentralized inference.
          </p>
          <div className="flex justify-center gap-4 mt-8">
            <Link href="/chat">
              <button className="px-6 py-3 rounded-xl text-white font-bold transition-colors" style={{ background: '#F37E20' }} data-testid="button-start-writing">
                Start Thinking
              </button>
            </Link>
          </div>
        </motion.div>

        <motion.section variants={fadeUp} className="mb-20">
          <div className="p-8 rounded-3xl bg-gradient-to-br from-orange-500/10 to-transparent border border-orange-500/20">
            <h2 className="text-2xl font-bold text-white mb-4">What is DJZS?</h2>
            <div className="space-y-4 text-gray-400 leading-relaxed">
              <p className="text-lg">
                DJZS is a <strong className="text-white">decentralized, quantum-resilient AI thinking system designed for sovereign users</strong>. It combines local-first data ownership, end-to-end encrypted messaging (XMTP + MLS), and decentralized AI inference via Venice. No centralized model training on your thoughts. No cloud surveillance layer.
              </p>
              <p>
                Three zones — Journal, Research, and Thinking Partner — form one loop: capture your thinking locally, reflect with decentralized AI, and compound insights securely. Your entries are stored on your device. When you choose to use AI, requests route to decentralized inference nodes — no centralized provider stores or trains on your data.
              </p>
              <p>
                The AI is your thinking partner, not a chatbot. It only activates when you click "Think with me." Memory pins carry context forward. Each session builds on the last — so your intelligence compounds without becoming platform exhaust.
              </p>
            </div>
          </div>
        </motion.section>

        <motion.section variants={fadeUp} className="mb-20">
          <h2 className="text-2xl font-bold text-white mb-8">Web2 vs Web3: Why It Matters</h2>
          <p className="text-gray-400 mb-8 max-w-3xl">
            The internet has evolved through distinct eras. Understanding the difference between Web2 and Web3 helps explain why DJZS is built the way it is.
          </p>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
            {/* Web2 Card */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-red-500/[0.05] to-transparent border border-red-500/20">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-12 h-12 rounded-xl bg-red-600/20 flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-red-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Web2: Centralized</h3>
                  <p className="text-xs text-red-400/80">The current internet model</p>
                </div>
              </div>
              <p className="text-gray-400 mb-5 leading-relaxed">
                Web2 emerged in the 2000s with social media and mobile. Companies built platforms where users create content, but the platforms own and control everything.
              </p>
              <ul className="space-y-3 text-sm text-gray-500">
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-2 shrink-0"></span>
                  <span><strong className="text-red-300">Company-owned data</strong> — Your notes, messages, and history belong to the platform</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-2 shrink-0"></span>
                  <span><strong className="text-red-300">Separate accounts everywhere</strong> — Username/password for each website</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-2 shrink-0"></span>
                  <span><strong className="text-red-300">Single point of failure</strong> — If the company shuts down, your data disappears</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-2 shrink-0"></span>
                  <span><strong className="text-red-300">Targeted advertising</strong> — Your data is monetized to show you ads</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-2 shrink-0"></span>
                  <span><strong className="text-red-300">Walled gardens</strong> — Hard to move your data between platforms</span>
                </li>
              </ul>
            </div>
            
            {/* Web3 Card */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-green-500/[0.05] to-transparent border border-green-500/20">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-12 h-12 rounded-xl bg-green-600/20 flex items-center justify-center">
                  <Network className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Web3: Decentralized</h3>
                  <p className="text-xs text-green-400/80">The emerging model</p>
                </div>
              </div>
              <p className="text-gray-400 mb-5 leading-relaxed">
                Web3 uses blockchain technology to give users control over their data and identity. No single company controls the system.
              </p>
              <ul className="space-y-3 text-sm text-gray-500">
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 mt-2 shrink-0"></span>
                  <span><strong className="text-green-300">User-owned data</strong> — Your information stays with you, not corporations</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 mt-2 shrink-0"></span>
                  <span><strong className="text-green-300">One wallet, everywhere</strong> — Sign in to any app with your wallet</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 mt-2 shrink-0"></span>
                  <span><strong className="text-green-300">No single point of failure</strong> — Distributed systems can't be shut down</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 mt-2 shrink-0"></span>
                  <span><strong className="text-green-300">No surveillance</strong> — No tracking, no targeted ads, no data harvesting</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 mt-2 shrink-0"></span>
                  <span><strong className="text-green-300">Interoperable</strong> — Take your identity and assets anywhere</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Comparison Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="py-4 px-4 text-left text-gray-400 font-bold"></th>
                  <th className="py-4 px-4 text-left text-red-400 font-bold uppercase text-xs tracking-wide">Web2 (Centralized)</th>
                  <th className="py-4 px-4 text-left text-green-400 font-bold uppercase text-xs tracking-wide">Web3 (Decentralized)</th>
                </tr>
              </thead>
              <tbody className="text-gray-400">
                <tr className="border-b border-white/5">
                  <td className="py-4 px-4 font-medium text-white flex items-center gap-2">
                    <Fingerprint className="w-4 h-4 text-orange-400" /> Identity
                  </td>
                  <td className="py-4 px-4">Username + password for each site</td>
                  <td className="py-4 px-4 text-green-300">1 wallet = universal identity</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-4 px-4 font-medium text-white flex items-center gap-2">
                    <Database className="w-4 h-4 text-orange-400" /> Data
                  </td>
                  <td className="py-4 px-4">Stored on company servers</td>
                  <td className="py-4 px-4 text-green-300">Stored locally or on-chain (you own it)</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-4 px-4 font-medium text-white flex items-center gap-2">
                    <Users className="w-4 h-4 text-orange-400" /> Control
                  </td>
                  <td className="py-4 px-4">Platform decides rules & access</td>
                  <td className="py-4 px-4 text-green-300">You control your keys, you control access</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-4 px-4 font-medium text-white flex items-center gap-2">
                    <Globe className="w-4 h-4 text-orange-400" /> Portability
                  </td>
                  <td className="py-4 px-4">Data trapped in walled gardens</td>
                  <td className="py-4 px-4 text-green-300">Take your data anywhere</td>
                </tr>
                <tr>
                  <td className="py-4 px-4 font-medium text-white flex items-center gap-2">
                    <Shield className="w-4 h-4 text-orange-400" /> Privacy
                  </td>
                  <td className="py-4 px-4">Tracked, analyzed, sold to advertisers</td>
                  <td className="py-4 px-4 text-green-300">Private by default, pseudonymous</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Why DJZS uses Web3 */}
          <div className="mt-10 p-6 rounded-2xl bg-orange-500/[0.08] border border-orange-500/20">
            <h3 className="text-lg font-bold text-white mb-3">Why DJZS Uses Web3 Principles</h3>
            <p className="text-gray-400 leading-relaxed">
              Your private thoughts deserve better than Web2. DJZS combines Web3's decentralized identity (wallet login) with local-first storage (your device). This means your journal entries, research, and memories are never stored on our servers. You authenticate with your wallet—no email, no password, no account to hack. Your thinking stays yours.
            </p>
          </div>
        </motion.section>

        <motion.section variants={fadeUp} className="mb-20">
          <h2 className="text-2xl font-bold text-white mb-8">Why This Level of Privacy</h2>
          <div className="p-8 rounded-3xl bg-gradient-to-br from-orange-500/10 to-transparent border border-orange-500/20 mb-8" data-testid="card-why-privacy-docs">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center">
                <Shield className="w-6 h-6 text-orange-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Your raw thinking is more sensitive than anything else you share online.</h3>
              </div>
            </div>
            <div className="space-y-4 text-gray-400 leading-relaxed">
              <p>
                Social posts are curated. Emails are edited. But your daily thinking — the half-formed ideas, the doubts, the unfiltered analysis of what's working and what isn't — that's your most vulnerable data. A thinking system that captures this deserves the highest possible privacy standard.
              </p>
              <p>
                Most apps say "we value your privacy" while building business models that depend on accessing your data. DJZS is designed differently from the ground up:
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 mb-6">
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                <HardDrive className="w-5 h-5 text-orange-400 mb-2" />
                <h4 className="text-sm font-bold text-white mb-1">Local-First Storage</h4>
                <p className="text-xs text-gray-500">All entries, insights, memory pins, research dossiers, and claims live in your browser's IndexedDB. We don't have a database of your thoughts. There's nothing to hack, subpoena, or sell.</p>
              </div>
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                <Bot className="w-5 h-5 text-orange-400 mb-2" />
                <h4 className="text-sm font-bold text-white mb-1">User-Controlled AI</h4>
                <p className="text-xs text-gray-500">Your text is only sent to AI when you explicitly click "Think with me." Venice AI processes it without storing or training on your data. Nothing happens in the background.</p>
              </div>
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                <Search className="w-5 h-5 text-orange-400 mb-2" />
                <h4 className="text-sm font-bold text-white mb-1">Privacy-First Search</h4>
                <p className="text-xs text-gray-500">Brave Search doesn't track or profile you. Venice AI's web search doesn't log queries. Your research stays your research.</p>
              </div>
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                <Lock className="w-5 h-5 text-orange-400 mb-2" />
                <h4 className="text-sm font-bold text-white mb-1">Wallet-Based Identity</h4>
                <p className="text-xs text-gray-500">No email, no password, no account to breach. Your wallet is your identity. No personal information is required or stored.</p>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-amber-500/[0.04] border border-amber-500/15">
              <p className="text-xs text-amber-300 font-semibold mb-1">What we're honest about</p>
              <p className="text-xs text-gray-500 leading-relaxed">When you click "Think with me," your entry text is sent to Venice AI over the internet for processing. This is not end-to-end encrypted. Venice AI claims no data retention, but we can't independently verify that claim. We're transparent about this because we believe you deserve to know exactly when your data leaves your device.</p>
            </div>
            <div className="p-4 rounded-xl bg-green-500/[0.04] border border-green-500/15 mt-4">
              <p className="text-xs text-green-300 font-semibold mb-1">What IS end-to-end encrypted</p>
              <p className="text-xs text-gray-500 leading-relaxed">XMTP messaging is fully end-to-end encrypted using the MLS protocol with quantum-resistant key encapsulation (XWING KEM). When you interact with DJZS agents via XMTP, your messages are protected with forward secrecy, post-compromise security, and quantum resistance — the same level of protection as Signal and WhatsApp, using a newer standard. See the <a href="https://docs.xmtp.org/protocol/security" target="_blank" rel="noopener noreferrer" className="text-green-400 hover:text-green-300 underline underline-offset-2">XMTP Security Documentation</a> for full details.</p>
            </div>
          </div>
        </motion.section>

        <motion.section variants={fadeUp} className="mb-20">
          <h2 className="text-2xl font-bold text-white mb-8">Core Principles</h2>
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
          <h2 className="text-2xl font-bold text-white mb-8">Zones</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-gradient-to-br from-orange-500/[0.08] to-transparent border border-orange-500/20 hover:border-orange-500/30 transition-all">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-orange-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Journal</h3>
                  <p className="text-xs text-orange-400/80">AI thinking partner</p>
                </div>
              </div>
              <p className="text-gray-400 mb-5 leading-relaxed">Your private space to think, reflect, and achieve clarity with an AI thinking partner that helps you see patterns.</p>
              <ul className="space-y-3 text-sm text-gray-500">
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-2 shrink-0"></span>
                  <span><strong className="text-orange-300">Deep Reasoning</strong> - AI analyzes patterns, connections, and blind spots</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-2 shrink-0"></span>
                  <span><strong className="text-orange-300">Reflective Questions</strong> - Powerful questions to deepen your thinking</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-2 shrink-0"></span>
                  <span><strong className="text-orange-300">Memory Pinning</strong> - Save insights worth remembering long-term</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-2 shrink-0"></span>
                  <span><strong className="text-orange-300">Context Awareness</strong> - AI considers your recent entries and pinned memories</span>
                </li>
              </ul>
            </div>
            <div className="p-6 rounded-2xl bg-gradient-to-br from-teal-500/[0.08] to-transparent border border-teal-500/20 hover:border-teal-500/30 transition-all">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-teal-600/20 flex items-center justify-center">
                  <Search className="w-6 h-6 text-teal-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Research</h3>
                  <p className="text-xs text-teal-400/80">AI-powered knowledge synthesis</p>
                </div>
              </div>
              <p className="text-gray-400 mb-5 leading-relaxed">Search the web for real-time data or use AI knowledge to synthesize information and track claims.</p>
              <ul className="space-y-3 text-sm text-gray-500">
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-2 shrink-0"></span>
                  <span><strong className="text-orange-300">Brave Mode</strong> - Privacy-first web search with no tracking or profiling, synthesized by Venice AI</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-2 shrink-0"></span>
                  <span><strong className="text-teal-300">Web Mode</strong> - Real-time web search via Venice AI with source citations</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-2 shrink-0"></span>
                  <span><strong className="text-teal-300">Explain Mode</strong> - AI knowledge synthesis without live data</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-2 shrink-0"></span>
                  <span><strong className="text-teal-300">Dossiers</strong> - Organize research into named folders</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-2 shrink-0"></span>
                  <span><strong className="text-teal-300">Claim Tracking</strong> - Save key takeaways with trust levels and status</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-2 shrink-0"></span>
                  <span><strong className="text-teal-300">Cross-Zone Linking</strong> - Connect research claims to journal entries</span>
                </li>
              </ul>
            </div>

            <div className="p-6 rounded-2xl bg-gradient-to-br from-red-500/[0.08] to-transparent border border-red-500/20 hover:border-red-500/30 transition-all md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-red-600/20 flex items-center justify-center">
                  <Video className="w-6 h-6 text-red-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Video Journal</h3>
                  <p className="text-xs text-red-400/80">Decentralized video entries via Livepeer</p>
                </div>
              </div>
              <p className="text-gray-400 mb-5 leading-relaxed">Record or upload video directly within your journal entries. Videos are stored on Livepeer's decentralized network and playback IDs are saved locally.</p>
              <ul className="space-y-3 text-sm text-gray-500">
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-2 shrink-0"></span>
                  <span><strong className="text-red-300">In-Browser Recording</strong> - Record video journals using your device camera</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-2 shrink-0"></span>
                  <span><strong className="text-red-300">File Upload</strong> - Upload existing video files up to 500MB</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-2 shrink-0"></span>
                  <span><strong className="text-red-300">Resumable Uploads</strong> - TUS protocol ensures reliable uploads even on slow connections</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-2 shrink-0"></span>
                  <span><strong className="text-red-300">Decentralized Storage</strong> - Videos stored on Livepeer's network, not centralized servers</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-2 shrink-0"></span>
                  <span><strong className="text-red-300">Playback & Download</strong> - Watch past entries inline and download anytime</span>
                </li>
              </ul>
            </div>
          </div>
        </motion.section>

        <motion.section variants={fadeUp} className="mb-20">
          <h2 className="text-2xl font-bold text-white mb-8">Research Dossiers & Claims</h2>
          <div className="p-8 rounded-3xl bg-gradient-to-br from-teal-500/10 to-transparent border border-teal-500/20 mb-8">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-xl bg-teal-600/20 flex items-center justify-center">
                <FileSearch className="w-6 h-6 text-teal-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Organize Research into Dossiers</h3>
                <p className="text-xs text-teal-400/80">Named folders for structured knowledge building</p>
              </div>
            </div>
            <p className="text-gray-400 mb-6 leading-relaxed">
              Dossiers are research folders that let you organize findings by topic. Each dossier holds claims — key takeaways from your research — with trust levels and status tracking. Think of them as structured evidence files for any topic you're investigating.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-teal-300">How Dossiers Work</h4>
                <ul className="space-y-3 text-sm text-gray-500">
                  <li className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-2 shrink-0"></span>
                    <span><strong className="text-teal-300">Quick Search</strong> — Select "No dossier" for standalone research queries that don't need to be organized</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-2 shrink-0"></span>
                    <span><strong className="text-teal-300">Create a Dossier</strong> — Click the folder icon, then "New dossier" to create a named research folder (e.g., "AI Agents", "DeFi Yields")</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-2 shrink-0"></span>
                    <span><strong className="text-teal-300">Select a Dossier</strong> — Pick an existing dossier from the dropdown before searching. All claims you save will go into that folder</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-2 shrink-0"></span>
                    <span><strong className="text-teal-300">Delete a Dossier</strong> — Hover over a dossier name in the dropdown and click the trash icon to remove it</span>
                  </li>
                </ul>
              </div>
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-teal-300">Claims & Trust Levels</h4>
                <ul className="space-y-3 text-sm text-gray-500">
                  <li className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-2 shrink-0"></span>
                    <span><strong className="text-teal-300">Save Claims</strong> — After a research result, click the + button next to any key takeaway to save it as a claim in your active dossier</span>
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
            <div className="p-4 rounded-xl bg-teal-500/[0.06] border border-teal-500/15">
              <p className="text-sm text-gray-400 leading-relaxed">
                All dossiers and claims are stored locally in your browser's IndexedDB. Nothing is sent to a server. Your research stays private and portable.
              </p>
            </div>
          </div>
        </motion.section>

        <motion.section variants={fadeUp} className="mb-20">
          <h2 className="text-2xl font-bold text-white mb-8">OpenClaw Agent Runner</h2>
          <div className="p-8 rounded-3xl bg-gradient-to-br from-purple-500/10 to-transparent border border-purple-500/20 mb-8">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-xl bg-purple-600/20 flex items-center justify-center">
                <Brain className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Unified AI Agent System</h3>
                <p className="text-xs text-purple-400/80">Three structured agents, one dispatcher</p>
              </div>
            </div>
            <p className="text-gray-400 mb-6 leading-relaxed">
              OpenClaw is DJZS's agent runner — a clean dispatcher that routes requests to three specialized AI agents. Each agent wraps Venice AI calls and returns strictly typed, structured JSON. No thinking happens in the dispatcher; all intelligence lives in the agent classes.
            </p>

            <div className="p-5 rounded-xl bg-purple-500/[0.06] border border-purple-500/15 mb-6">
              <p className="text-sm font-bold text-purple-300 mb-3">How It Connects to What You See</p>
              <ul className="space-y-3 text-sm text-gray-400">
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-2 shrink-0"></span>
                  <span>When you write in the <strong className="text-orange-300">Journal Zone</strong> and click <strong className="text-white">"Think with me"</strong>, the JournalInsight agent analyzes your entry, pulls in your recent entries and memory pins as context, and returns a structured summary with patterns, emotions, and reflective questions.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-2 shrink-0"></span>
                  <span>When you search in the <strong className="text-teal-300">Research Zone</strong> and click <strong className="text-white">"Research"</strong>, the ResearchSynth agent synthesizes information from web results or AI knowledge, identifies agreements and contradictions across sources, and suggests what to investigate next.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-2 shrink-0"></span>
                  <span>The <strong className="text-purple-300">ThinkingPartner</strong> agent works behind the scenes to debate your ideas, identify tensions in your reasoning, and propose reframes — acting as a structured thinking coach, not a chatbot.</span>
                </li>
              </ul>
            </div>

            <p className="text-xs text-gray-500 mb-6 font-mono" data-testid="text-openclaw-api">
              API: POST /api/openclaw/run {'{'} agent: "JournalInsight" | "ResearchSynth" | "ThinkingPartner", payload: {'{'} ... {'}'} {'}'}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-gradient-to-br from-orange-500/[0.08] to-transparent border border-orange-500/20" data-testid="card-agent-journal">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-orange-400" />
                </div>
                <h3 className="text-lg font-bold text-white">JournalInsight</h3>
              </div>
              <p className="text-sm text-gray-400 mb-4">Analyzes journal entries for patterns, claims, open questions, and emotional trends.</p>
              <ul className="space-y-2 text-xs text-gray-500">
                <li className="flex items-start gap-2">
                  <span className="w-1 h-1 rounded-full bg-orange-400 mt-1.5 shrink-0"></span>
                  <span>Extracts key claims and patterns</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1 h-1 rounded-full bg-orange-400 mt-1.5 shrink-0"></span>
                  <span>Surfaces open questions</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1 h-1 rounded-full bg-orange-400 mt-1.5 shrink-0"></span>
                  <span>Infers emotion trends</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1 h-1 rounded-full bg-orange-400 mt-1.5 shrink-0"></span>
                  <span>Generates reflective questions</span>
                </li>
              </ul>
            </div>
            <div className="p-6 rounded-2xl bg-gradient-to-br from-teal-500/[0.08] to-transparent border border-teal-500/20" data-testid="card-agent-research">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-teal-600/20 flex items-center justify-center">
                  <Search className="w-5 h-5 text-teal-400" />
                </div>
                <h3 className="text-lg font-bold text-white">ResearchSynth</h3>
              </div>
              <p className="text-sm text-gray-400 mb-4">Synthesizes batches of research entries into a unified thesis with agreements and contradictions.</p>
              <ul className="space-y-2 text-xs text-gray-500">
                <li className="flex items-start gap-2">
                  <span className="w-1 h-1 rounded-full bg-teal-400 mt-1.5 shrink-0"></span>
                  <span>Builds unified thesis from sources</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1 h-1 rounded-full bg-teal-400 mt-1.5 shrink-0"></span>
                  <span>Identifies agreements across claims</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1 h-1 rounded-full bg-teal-400 mt-1.5 shrink-0"></span>
                  <span>Surfaces contradictions</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1 h-1 rounded-full bg-teal-400 mt-1.5 shrink-0"></span>
                  <span>Suggests follow-up research</span>
                </li>
              </ul>
            </div>
            <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-500/[0.08] to-transparent border border-purple-500/20" data-testid="card-agent-thinking">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-purple-600/20 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-purple-400" />
                </div>
                <h3 className="text-lg font-bold text-white">ThinkingPartner</h3>
              </div>
              <p className="text-sm text-gray-400 mb-4">Your AI thinking coach — debates ideas, finds patterns, and surfaces tensions in your reasoning.</p>
              <ul className="space-y-2 text-xs text-gray-500">
                <li className="flex items-start gap-2">
                  <span className="w-1 h-1 rounded-full bg-purple-400 mt-1.5 shrink-0"></span>
                  <span>Asks clarifying questions</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1 h-1 rounded-full bg-purple-400 mt-1.5 shrink-0"></span>
                  <span>Identifies core tensions</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1 h-1 rounded-full bg-purple-400 mt-1.5 shrink-0"></span>
                  <span>Suggests reframes</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1 h-1 rounded-full bg-purple-400 mt-1.5 shrink-0"></span>
                  <span>Provides actionable next steps</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-8 p-6 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-purple-600/20 flex items-center justify-center">
                <Network className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">XMTP Agent Commands</h3>
                <p className="text-xs text-gray-500">Access agents via messaging</p>
              </div>
            </div>
            <p className="text-sm text-gray-400 mb-4 leading-relaxed">
              You can also interact with OpenClaw agents through XMTP messaging. Send a message with one of these prefixes and the agent will process your request and respond directly:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="px-4 py-3 rounded-xl bg-orange-500/[0.06] border border-orange-500/15">
                <p className="text-xs font-bold text-orange-300 mb-1">Journal:</p>
                <p className="text-xs text-gray-500">e.g. "Journal: Today I realized..."</p>
              </div>
              <div className="px-4 py-3 rounded-xl bg-teal-500/[0.06] border border-teal-500/15">
                <p className="text-xs font-bold text-teal-300 mb-1">Research:</p>
                <p className="text-xs text-gray-500">e.g. "Research: DeFi yield trends"</p>
              </div>
              <div className="px-4 py-3 rounded-xl bg-purple-500/[0.06] border border-purple-500/15">
                <p className="text-xs font-bold text-purple-300 mb-1">Thinking:</p>
                <p className="text-xs text-gray-500">e.g. "Thinking: Should I pivot?"</p>
              </div>
            </div>
            <p className="text-xs text-gray-600 mt-3">
              Additional commands: <span className="font-mono text-gray-500">/help</span> (list commands) · <span className="font-mono text-gray-500">/zones</span> (show available zones)
            </p>
          </div>

          <div className="mt-8 p-6 rounded-2xl bg-gradient-to-br from-green-500/[0.06] to-transparent border border-green-500/20" data-testid="card-xmtp-security">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-green-600/20 flex items-center justify-center">
                <Shield className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">XMTP Messaging Security</h3>
                <p className="text-xs text-green-400/80">End-to-end encrypted with quantum resistance</p>
              </div>
            </div>
            <p className="text-sm text-gray-400 mb-5 leading-relaxed">
              All XMTP conversations — including messages to DJZS agents — are secured with the <strong className="text-white">Messaging Layer Security (MLS) protocol</strong>, providing the same level of encryption as Signal and WhatsApp but using a newer, more efficient standard.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                <h4 className="text-xs font-bold text-green-300 uppercase tracking-wide mb-3">Security Properties</h4>
                <ul className="space-y-2 text-xs text-gray-500">
                  <li className="flex items-start gap-2">
                    <span className="w-1 h-1 rounded-full bg-green-400 mt-1.5 shrink-0"></span>
                    <span><strong className="text-white">End-to-end encryption</strong> — Only you and the recipient can read messages. Not even XMTP nodes can see content.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1 h-1 rounded-full bg-green-400 mt-1.5 shrink-0"></span>
                    <span><strong className="text-white">Forward secrecy</strong> — If current keys are compromised, past messages remain secure. MLS uses a ratcheting mechanism that deletes old keys after use.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1 h-1 rounded-full bg-green-400 mt-1.5 shrink-0"></span>
                    <span><strong className="text-white">Post-compromise security</strong> — Regular key rotation through MLS commits means even if keys are compromised, future messages are protected.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1 h-1 rounded-full bg-green-400 mt-1.5 shrink-0"></span>
                    <span><strong className="text-white">Message authentication</strong> — Every message is cryptographically signed, preventing impersonation.</span>
                  </li>
                </ul>
              </div>
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                <h4 className="text-xs font-bold text-green-300 uppercase tracking-wide mb-3">Quantum Resistance</h4>
                <ul className="space-y-2 text-xs text-gray-500">
                  <li className="flex items-start gap-2">
                    <span className="w-1 h-1 rounded-full bg-green-400 mt-1.5 shrink-0"></span>
                    <span><strong className="text-white">XWING KEM</strong> — A hybrid post-quantum key encapsulation mechanism that combines conventional cryptography with ML-KEM (NIST-standardized post-quantum algorithm).</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1 h-1 rounded-full bg-green-400 mt-1.5 shrink-0"></span>
                    <span><strong className="text-white">HNDL protection</strong> — Defends against "Harvest Now, Decrypt Later" attacks, where adversaries store encrypted messages until quantum computers can break current encryption.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1 h-1 rounded-full bg-green-400 mt-1.5 shrink-0"></span>
                    <span><strong className="text-white">Welcome message protection</strong> — Quantum-resistant encryption secures Welcome messages (the entry point containing group secrets), protecting entire conversations.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1 h-1 rounded-full bg-green-400 mt-1.5 shrink-0"></span>
                    <span><strong className="text-white">Efficient by design</strong> — Quantum protection is applied at the conversation entry point (Welcome messages), so regular messages are unaffected in size and speed.</span>
                  </li>
                </ul>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-green-500/[0.04] border border-green-500/15">
              <p className="text-xs text-gray-400 leading-relaxed">
                According to XMTP's documentation, the protocol uses the ciphersuite <span className="font-mono text-green-300">MLS_128_HPKEX25519_CHACHA20POLY1305_SHA256_Ed25519</span> for conventional security, with XWING KEM layered on top for quantum resistance. For full details, see the{' '}
                <a href="https://docs.xmtp.org/protocol/security" target="_blank" rel="noopener noreferrer" className="text-green-400 hover:text-green-300 underline underline-offset-2" data-testid="link-xmtp-security-docs">XMTP Security Documentation</a>.
              </p>
            </div>
          </div>
        </motion.section>

        <motion.section variants={fadeUp} className="mb-20">
          <h2 className="text-2xl font-bold text-white mb-8">Quick Search</h2>
          <div className="p-8 rounded-3xl bg-gradient-to-br from-orange-500/10 to-transparent border border-orange-500/20">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center">
                <FileSearch className="w-6 h-6 text-orange-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Instant Entry Search</h3>
                <p className="text-xs text-orange-400/80">Find any past entry in milliseconds</p>
              </div>
            </div>
            <p className="text-gray-400 mb-5 leading-relaxed">
              Quick Search lets you find any past journal or research entry by typing a few characters. It searches across titles, content, and tags with smart scoring — exact matches rank highest, followed by word matches and tag hits.
            </p>
            <ul className="space-y-3 text-sm text-gray-500">
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-2 shrink-0"></span>
                <span><strong className="text-orange-300">Real-time filtering</strong> — Results update as you type with 150ms debounce for smooth performance</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-2 shrink-0"></span>
                <span><strong className="text-orange-300">Highlighted matches</strong> — Search terms are highlighted in results so you can scan quickly</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-2 shrink-0"></span>
                <span><strong className="text-orange-300">Click to load</strong> — Click any result to load it directly into the editor</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-2 shrink-0"></span>
                <span><strong className="text-orange-300">Zone-aware</strong> — Searches within your current zone (Journal or Research)</span>
              </li>
            </ul>
          </div>
        </motion.section>

        <motion.section variants={fadeUp} className="mb-20">
          <h2 className="text-2xl font-bold text-white mb-8">Music Library</h2>
          <div className="p-8 rounded-3xl bg-gradient-to-br from-gold-500/10 to-transparent border border-yellow-500/20" style={{ background: 'linear-gradient(135deg, rgba(255,184,77,0.08), transparent)' }}>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,184,77,0.2)' }}>
                <Music className="w-6 h-6" style={{ color: '#FFB84D' }} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Think with Music</h3>
                <p className="text-xs" style={{ color: 'rgba(255,184,77,0.8)' }}>Your personal soundtrack, stored locally</p>
              </div>
            </div>
            <p className="text-gray-400 mb-5 leading-relaxed">
              Upload your own music and play it while you think. Tracks are stored locally in your browser using IndexedDB — nothing leaves your device. Organize tracks into Focus, Reflection, and Creative zones to match your thinking mode.
            </p>
            <ul className="space-y-3 text-sm text-gray-500">
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full mt-2 shrink-0" style={{ background: '#FFB84D' }}></span>
                <span><strong style={{ color: '#FFB84D' }}>Drag & drop upload</strong> — Add mp3, wav, or other audio files instantly</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full mt-2 shrink-0" style={{ background: '#FFB84D' }}></span>
                <span><strong style={{ color: '#FFB84D' }}>Full playback controls</strong> — Play, pause, skip, seek, volume, and mute</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full mt-2 shrink-0" style={{ background: '#FFB84D' }}></span>
                <span><strong style={{ color: '#FFB84D' }}>Zone organization</strong> — Tag tracks as Focus, Reflection, or Creative and filter by mood</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full mt-2 shrink-0" style={{ background: '#FFB84D' }}></span>
                <span><strong style={{ color: '#FFB84D' }}>100% local</strong> — Audio blobs stored in IndexedDB, never uploaded anywhere</span>
              </li>
            </ul>
          </div>
        </motion.section>

        <motion.section variants={fadeUp} className="mb-20">
          <h2 className="text-2xl font-bold text-white mb-8">Technical Stack</h2>
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
              items={["Venice AI", "OpenClaw Runner", "Brave Search API", "Web Citations", "Reasoning Models", "Structured JSON"]}
            />
            <TechStackItem 
              category="Video & Audio"
              items={["Livepeer", "MediaRecorder API", "TUS Uploads", "Music Library (IndexedDB)"]}
            />
            <TechStackItem 
              category="Storage"
              items={["IndexedDB (local)", "PostgreSQL (optional)", "In-memory", "Quick Search"]}
            />
            <TechStackItem 
              category="Messaging"
              items={["XMTP Agent SDK", "OpenClaw Dispatch", "Paragraph SDK"]}
            />
          </div>
        </motion.section>

        <motion.section variants={fadeUp} className="mb-20">
          <h2 className="text-2xl font-bold text-white mb-8">Quick Links</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <QuickLink 
              href="/chat"
              title="Start Journaling"
              description="Open the app and begin writing"
              testId="link-start-journaling"
            />
            <QuickLink 
              href="/chat?zone=research"
              title="Research Mode"
              description="Gather claims and track evidence"
              testId="link-research-mode"
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
          </div>
        </motion.section>

        <motion.section variants={fadeUp} className="mb-20">
          <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/[0.03]">
            <h2 className="text-2xl font-bold text-white mb-6">Philosophy</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xs font-bold text-orange-400 uppercase tracking-wide mb-3">What DJZS Is</h3>
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
                <h3 className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-3">What DJZS Is Not</h3>
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
