import { Link } from "wouter";
import { useState } from "react";
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
  Wallet,
  Mail,
  Fingerprint,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  Pin,
  Database,
  Cloud,
  Download,
  HelpCircle,
  Sparkles,
  FolderOpen,
  FileText,
  Clock,
  RefreshCw,
  AlertTriangle,
  Globe,
  Smartphone
} from "lucide-react";
import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

const stagger = {
  show: { transition: { staggerChildren: 0.1 } }
};

interface NavItemProps {
  href: string;
  title: string;
  active?: boolean;
}

function NavItem({ href, title, active }: NavItemProps) {
  return (
    <a 
      href={href}
      className={`block py-2 px-3 rounded-lg text-sm transition-colors ${
        active 
          ? 'bg-purple-500/10 text-purple-400 font-medium' 
          : 'text-gray-500 hover:text-gray-300 hover:bg-white/[0.02]'
      }`}
    >
      {title}
    </a>
  );
}

interface StepCardProps {
  number: number;
  title: string;
  description: string;
  children?: React.ReactNode;
}

function StepCard({ number, title, description, children }: StepCardProps) {
  return (
    <div className="flex gap-4">
      <div className="shrink-0 w-8 h-8 rounded-full bg-purple-600/20 flex items-center justify-center text-purple-400 font-bold text-sm">
        {number}
      </div>
      <div className="flex-1">
        <h4 className="font-bold text-white mb-1">{title}</h4>
        <p className="text-sm text-gray-400 leading-relaxed mb-3">{description}</p>
        {children}
      </div>
    </div>
  );
}

interface FeatureCardProps {
  icon: typeof Shield;
  title: string;
  description: string;
}

function FeatureCard({ icon: Icon, title, description }: FeatureCardProps) {
  return (
    <div className="p-5 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:border-purple-500/20 transition-all group">
      <div className="w-10 h-10 rounded-xl bg-purple-600/10 flex items-center justify-center mb-4 group-hover:bg-purple-600/20 transition-colors">
        <Icon className="w-5 h-5 text-purple-400" />
      </div>
      <h3 className="text-base font-bold text-white mb-2">{title}</h3>
      <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
    </div>
  );
}

interface AccordionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function Accordion({ title, children, defaultOpen = false }: AccordionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  return (
    <div className="border border-white/[0.05] rounded-xl overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-white/[0.02] transition-colors"
      >
        <span className="font-medium text-white">{title}</span>
        {isOpen ? (
          <ChevronDown className="w-5 h-5 text-gray-500" />
        ) : (
          <ChevronRight className="w-5 h-5 text-gray-500" />
        )}
      </button>
      {isOpen && (
        <div className="px-4 pb-4 text-sm text-gray-400 leading-relaxed">
          {children}
        </div>
      )}
    </div>
  );
}

interface InfoBoxProps {
  type: 'tip' | 'warning' | 'note';
  children: React.ReactNode;
}

function InfoBox({ type, children }: InfoBoxProps) {
  const styles = {
    tip: 'bg-green-500/10 border-green-500/20 text-green-400',
    warning: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
    note: 'bg-blue-500/10 border-blue-500/20 text-blue-400'
  };
  
  const icons = {
    tip: CheckCircle,
    warning: AlertTriangle,
    note: HelpCircle
  };
  
  const Icon = icons[type];
  
  return (
    <div className={`p-4 rounded-xl border ${styles[type]} flex gap-3`}>
      <Icon className="w-5 h-5 shrink-0 mt-0.5" />
      <div className="text-sm leading-relaxed">{children}</div>
    </div>
  );
}

export default function Docs() {
  return (
    <div className="min-h-screen bg-[#050505] text-gray-300 selection:bg-purple-500/30">
      <header className="sticky top-0 z-50 bg-[#050505]/80 backdrop-blur-xl border-b border-white/[0.02]">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/">
            <button className="flex items-center gap-2 text-sm font-bold text-white tracking-wide uppercase opacity-60 hover:opacity-100 hover:text-purple-400 transition-all group">
              <Home className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              <span>DJZS</span>
            </button>
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/chat">
              <button className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-sm font-bold transition-colors" data-testid="button-open-app">
                Open App
              </button>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex gap-12">
          <nav className="hidden lg:block w-56 shrink-0 sticky top-24 h-fit">
            <div className="space-y-1">
              <p className="text-xs font-bold text-gray-600 uppercase tracking-wide px-3 mb-3">Getting Started</p>
              <NavItem href="#overview" title="Overview" />
              <NavItem href="#connecting" title="Connecting Your Wallet" />
              <NavItem href="#social-login" title="Social Login Options" />
              
              <p className="text-xs font-bold text-gray-600 uppercase tracking-wide px-3 mb-3 mt-6">Using DJZS</p>
              <NavItem href="#journal-zone" title="Journal Zone" />
              <NavItem href="#research-zone" title="Research Zone" />
              <NavItem href="#ai-partner" title="AI Thinking Partner" />
              
              <p className="text-xs font-bold text-gray-600 uppercase tracking-wide px-3 mb-3 mt-6">Features</p>
              <NavItem href="#memory-pinning" title="Memory Pinning" />
              <NavItem href="#onchain-attestations" title="Onchain Attestations" />
              <NavItem href="#dossiers" title="Research Dossiers" />
              
              <p className="text-xs font-bold text-gray-600 uppercase tracking-wide px-3 mb-3 mt-6">Privacy & Data</p>
              <NavItem href="#local-first" title="Local-First Storage" />
              <NavItem href="#data-export" title="Export Your Data" />
              <NavItem href="#privacy" title="Privacy Guarantees" />
              
              <p className="text-xs font-bold text-gray-600 uppercase tracking-wide px-3 mb-3 mt-6">Help</p>
              <NavItem href="#faq" title="FAQ" />
              <NavItem href="#troubleshooting" title="Troubleshooting" />
            </div>
          </nav>

          <motion.main 
            initial="hidden" 
            animate="show" 
            variants={stagger}
            className="flex-1 max-w-3xl"
          >
            <motion.section variants={fadeUp} id="overview" className="mb-16 scroll-mt-24">
              <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-6">
                DJZS Documentation
              </h1>
              <p className="text-xl text-gray-400 leading-relaxed mb-8">
                Welcome to DJZS, your private AI journaling partner for thinking clearly and researching deeply.
              </p>
              
              <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-500/10 to-transparent border border-purple-500/20 mb-8">
                <h2 className="text-xl font-bold text-white mb-4">What is DJZS?</h2>
                <div className="space-y-4 text-gray-400 leading-relaxed">
                  <p>
                    DJZS is a <strong className="text-white">private, local-first AI journaling partner</strong> that helps you think more clearly. Unlike traditional apps that store your data on remote servers, DJZS keeps your thoughts on your device.
                  </p>
                  <p>
                    The AI doesn't write for you—it helps you <strong className="text-purple-300">reflect on your own thinking</strong>, surface patterns, and ask better questions.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FeatureCard 
                  icon={HardDrive}
                  title="Local-First"
                  description="Your entries stay on your device. No cloud storage of private thoughts."
                />
                <FeatureCard 
                  icon={Bot}
                  title="Thinking Partner"
                  description="AI that helps you think, not think for you."
                />
                <FeatureCard 
                  icon={Shield}
                  title="Private by Design"
                  description="Wallet-based identity. No email, no password, no tracking."
                />
              </div>
            </motion.section>

            <motion.section variants={fadeUp} id="connecting" className="mb-16 scroll-mt-24">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <Wallet className="w-6 h-6 text-purple-400" />
                Connecting Your Wallet
              </h2>
              
              <p className="text-gray-400 mb-6 leading-relaxed">
                DJZS uses your crypto wallet as your identity. This means no passwords to remember and complete control over your data.
              </p>

              <div className="space-y-6 mb-8">
                <StepCard 
                  number={1}
                  title="Click Connect Wallet"
                  description="Find the Connect Wallet button on the home page or chat screen."
                />
                <StepCard 
                  number={2}
                  title="Choose Your Login Method"
                  description="You'll see a modal with options: Sign up (for new users) or connect with an existing wallet."
                />
                <StepCard 
                  number={3}
                  title="Approve the Connection"
                  description="Your wallet will ask you to approve the connection to DJZS. This is safe—we can only read your public address."
                />
                <StepCard 
                  number={4}
                  title="Start Writing"
                  description="Once connected, you'll be taken to your Journal where you can start your first entry."
                />
              </div>

              <InfoBox type="tip">
                <strong>First time?</strong> Click "Sign up" to create a new wallet-based account. You can use email, Google, or passkeys—no crypto experience needed.
              </InfoBox>
            </motion.section>

            <motion.section variants={fadeUp} id="social-login" className="mb-16 scroll-mt-24">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <Mail className="w-6 h-6 text-purple-400" />
                Social Login Options
              </h2>
              
              <p className="text-gray-400 mb-6 leading-relaxed">
                DJZS uses Coinbase's embedded wallet technology, so you can sign in with familiar methods—no crypto wallet extension required.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <div className="p-5 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                      <Mail className="w-5 h-5 text-blue-400" />
                    </div>
                    <h4 className="font-bold text-white">Email</h4>
                  </div>
                  <p className="text-sm text-gray-500">Sign up with your email address. You'll receive a one-time code to verify.</p>
                </div>
                
                <div className="p-5 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                      <Globe className="w-5 h-5 text-red-400" />
                    </div>
                    <h4 className="font-bold text-white">Google</h4>
                  </div>
                  <p className="text-sm text-gray-500">Use your Google account for quick sign-in. Your wallet is created automatically.</p>
                </div>
                
                <div className="p-5 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-gray-500/10 flex items-center justify-center">
                      <Smartphone className="w-5 h-5 text-gray-400" />
                    </div>
                    <h4 className="font-bold text-white">Apple</h4>
                  </div>
                  <p className="text-sm text-gray-500">Sign in with Apple ID for privacy-focused authentication.</p>
                </div>
                
                <div className="p-5 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                      <Fingerprint className="w-5 h-5 text-purple-400" />
                    </div>
                    <h4 className="font-bold text-white">Passkeys</h4>
                  </div>
                  <p className="text-sm text-gray-500">Use biometrics (Face ID, Touch ID, Windows Hello) for passwordless login.</p>
                </div>
              </div>

              <InfoBox type="note">
                <strong>How it works:</strong> When you sign up with email or social login, a secure "smart wallet" is created for you on the Base blockchain. This wallet is your identity in DJZS and enables gasless transactions.
              </InfoBox>
            </motion.section>

            <motion.section variants={fadeUp} id="journal-zone" className="mb-16 scroll-mt-24">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <BookOpen className="w-6 h-6 text-purple-400" />
                Journal Zone
              </h2>
              
              <p className="text-gray-400 mb-6 leading-relaxed">
                The Journal is your private space for daily reflection. Write what's on your mind, and let the AI help you find clarity.
              </p>

              <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-500/[0.08] to-transparent border border-purple-500/20 mb-8">
                <h3 className="text-lg font-bold text-white mb-4">How Journal Works</h3>
                <div className="space-y-4">
                  <StepCard 
                    number={1}
                    title="Write Your Entry"
                    description="Start typing in the main text area. You'll see rotating prompts like 'What feels unresolved right now?' to help get you started."
                  />
                  <StepCard 
                    number={2}
                    title="Submit for Reflection"
                    description="Press Enter or click the send button. The AI will analyze your entry and respond with insights."
                  />
                  <StepCard 
                    number={3}
                    title="Review AI Response"
                    description="The AI responds with: what you said, why it matters, a possible next step, and a question to sit with."
                  />
                  <StepCard 
                    number={4}
                    title="Pin Patterns (Optional)"
                    description="If the AI suggests a pattern worth remembering, you can pin it. These memories inform future reflections."
                  />
                </div>
              </div>

              <h3 className="text-lg font-bold text-white mb-4">AI Response Format</h3>
              <div className="space-y-3 mb-8">
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                  <p className="text-sm font-medium text-purple-400 mb-1">What you said</p>
                  <p className="text-sm text-gray-400">A summary of your entry in your own words—not interpretation.</p>
                </div>
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                  <p className="text-sm font-medium text-purple-400 mb-1">Why it matters</p>
                  <p className="text-sm text-gray-400">The emotional or practical significance of what you wrote.</p>
                </div>
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                  <p className="text-sm font-medium text-purple-400 mb-1">Possible next step</p>
                  <p className="text-sm text-gray-400">A gentle suggestion, not a directive. You decide what to do.</p>
                </div>
                <div className="p-4 rounded-xl bg-purple-500/[0.06] border border-purple-500/20">
                  <p className="text-sm font-medium text-purple-400 mb-1">Question to sit with</p>
                  <p className="text-sm text-gray-400">A reflective question to carry with you. No need to answer immediately.</p>
                </div>
              </div>

              <InfoBox type="tip">
                <strong>Pro tip:</strong> The AI remembers your pinned patterns. If you've noted that you "avoid conflict," the AI might connect future entries to this pattern.
              </InfoBox>
            </motion.section>

            <motion.section variants={fadeUp} id="research-zone" className="mb-16 scroll-mt-24">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <Search className="w-6 h-6 text-blue-400" />
                Research Zone
              </h2>
              
              <p className="text-gray-400 mb-6 leading-relaxed">
                Research mode helps you investigate topics, gather evidence, and separate what you know from what you assume.
              </p>

              <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-500/[0.08] to-transparent border border-blue-500/20 mb-8">
                <h3 className="text-lg font-bold text-white mb-4">How Research Works</h3>
                <div className="space-y-4">
                  <StepCard 
                    number={1}
                    title="Ask a Question"
                    description="Type your research question or topic. Toggle 'Web' mode for live search, or 'Explain' for AI knowledge."
                  />
                  <StepCard 
                    number={2}
                    title="Review Synthesis"
                    description="The AI provides key takeaways, what to check next, and sources (if web mode is enabled)."
                  />
                  <StepCard 
                    number={3}
                    title="Save Claims to Dossier"
                    description="Important claims can be saved to a research dossier for tracking verification status."
                  />
                  <StepCard 
                    number={4}
                    title="Track Verification"
                    description="Mark claims as verified, uncertain, or to-check. Add source notes and trust levels."
                  />
                </div>
              </div>

              <h3 className="text-lg font-bold text-white mb-4">Research Output</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                  <p className="text-sm font-medium text-blue-400 mb-2">Key Takeaways</p>
                  <p className="text-sm text-gray-400">The most important points from your research query.</p>
                </div>
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                  <p className="text-sm font-medium text-blue-400 mb-2">What to Check Next</p>
                  <p className="text-sm text-gray-400">Suggestions for deepening your investigation.</p>
                </div>
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                  <p className="text-sm font-medium text-blue-400 mb-2">Sources</p>
                  <p className="text-sm text-gray-400">Links and references when web search is enabled.</p>
                </div>
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                  <p className="text-sm font-medium text-blue-400 mb-2">Confidence Level</p>
                  <p className="text-sm text-gray-400">How confident the AI is in its synthesis.</p>
                </div>
              </div>
            </motion.section>

            <motion.section variants={fadeUp} id="ai-partner" className="mb-16 scroll-mt-24">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <Sparkles className="w-6 h-6 text-purple-400" />
                AI Thinking Partner
              </h2>
              
              <p className="text-gray-400 mb-6 leading-relaxed">
                The AI in DJZS is designed to be a thinking partner—not an oracle, not a therapist, not a content generator.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="p-5 rounded-xl bg-green-500/[0.05] border border-green-500/20">
                  <h4 className="text-sm font-bold text-green-400 uppercase tracking-wide mb-4">What the AI Does</h4>
                  <ul className="space-y-2 text-sm text-gray-400">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                      <span>Reflects back what you said</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                      <span>Surfaces emotional undertones</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                      <span>Connects to prior patterns</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                      <span>Asks clarifying questions</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                      <span>Suggests patterns worth remembering</span>
                    </li>
                  </ul>
                </div>
                
                <div className="p-5 rounded-xl bg-red-500/[0.05] border border-red-500/20">
                  <h4 className="text-sm font-bold text-red-400/70 uppercase tracking-wide mb-4">What the AI Doesn't Do</h4>
                  <ul className="space-y-2 text-sm text-gray-500">
                    <li className="flex items-start gap-2">
                      <span className="text-red-500/50 mt-0.5">✗</span>
                      <span>Write content for you</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-500/50 mt-0.5">✗</span>
                      <span>Give life advice or diagnoses</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-500/50 mt-0.5">✗</span>
                      <span>Save memories automatically</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-500/50 mt-0.5">✗</span>
                      <span>Track or analyze your behavior</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-500/50 mt-0.5">✗</span>
                      <span>Share data with third parties</span>
                    </li>
                  </ul>
                </div>
              </div>

              <InfoBox type="note">
                <strong>Trust boundaries:</strong> The AI uses Venice AI for privacy-preserving inference. Your entries are processed for response generation only and are not stored or used for training.
              </InfoBox>
            </motion.section>

            <motion.section variants={fadeUp} id="memory-pinning" className="mb-16 scroll-mt-24">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <Pin className="w-6 h-6 text-amber-400" />
                Memory Pinning
              </h2>
              
              <p className="text-gray-400 mb-6 leading-relaxed">
                Memories are patterns, insights, or preferences you want DJZS to remember across sessions. You control what gets pinned.
              </p>

              <h3 className="text-lg font-bold text-white mb-4">Memory Types</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
                {[
                  { type: 'goal', desc: 'What you\'re working toward' },
                  { type: 'pattern', desc: 'Recurring themes in your thinking' },
                  { type: 'preference', desc: 'How you like to work' },
                  { type: 'principle', desc: 'Values you live by' },
                  { type: 'project', desc: 'Active initiatives' },
                  { type: 'question', desc: 'Open inquiries' },
                  { type: 'person', desc: 'Key relationships' },
                ].map(({ type, desc }) => (
                  <div key={type} className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.05]">
                    <p className="text-xs font-bold text-amber-400/80 uppercase tracking-wide mb-1">{type}</p>
                    <p className="text-xs text-gray-500">{desc}</p>
                  </div>
                ))}
              </div>

              <h3 className="text-lg font-bold text-white mb-4">How to Pin</h3>
              <div className="space-y-4 mb-8">
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                  <p className="font-medium text-white mb-2">From AI Suggestions</p>
                  <p className="text-sm text-gray-400">When the AI detects a pattern worth remembering, it will suggest pinning. Click "Pin this" or "Skip" to dismiss.</p>
                </div>
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                  <p className="font-medium text-white mb-2">Manual Pinning</p>
                  <p className="text-sm text-gray-400">Select text in your entry and click the Pin icon. Choose the memory type and confirm.</p>
                </div>
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                  <p className="font-medium text-white mb-2">Memory Panel</p>
                  <p className="text-sm text-gray-400">View all pinned memories in the right sidebar. Forget memories that no longer serve you.</p>
                </div>
              </div>

              <InfoBox type="tip">
                <strong>Less is more:</strong> Pin sparingly. The AI works best with 5-10 active memories, not 50.
              </InfoBox>
            </motion.section>

            <motion.section variants={fadeUp} id="onchain-attestations" className="mb-16 scroll-mt-24">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <Zap className="w-6 h-6 text-purple-400" />
                Onchain Attestations
              </h2>
              
              <p className="text-gray-400 mb-6 leading-relaxed">
                Pin your insights permanently to the Base blockchain. This creates a timestamped, immutable record that only you control.
              </p>

              <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-500/[0.08] to-transparent border border-purple-500/20 mb-8">
                <h3 className="text-lg font-bold text-white mb-4">How Onchain Pinning Works</h3>
                <div className="space-y-4">
                  <StepCard 
                    number={1}
                    title="Generate Insight Hash"
                    description="Your insight text is hashed using keccak256. Only the hash goes onchain—your actual content stays private."
                  />
                  <StepCard 
                    number={2}
                    title="Sign Transaction"
                    description="Your wallet signs a transaction to the Base attestation registry. With gasless mode, you pay nothing."
                  />
                  <StepCard 
                    number={3}
                    title="Permanent Record"
                    description="The hash is stored onchain forever. You can prove you had this insight at this time."
                  />
                </div>
              </div>

              <h3 className="text-lg font-bold text-white mb-4">Gasless Transactions</h3>
              <p className="text-gray-400 mb-4 leading-relaxed">
                DJZS uses Coinbase's paymaster to sponsor transaction fees. This means you can pin insights onchain without holding any ETH.
              </p>

              <InfoBox type="note">
                <strong>Privacy note:</strong> Only a hash of your insight is stored onchain. The actual text never leaves your device. The hash proves you had the insight, but doesn't reveal what it was.
              </InfoBox>
            </motion.section>

            <motion.section variants={fadeUp} id="dossiers" className="mb-16 scroll-mt-24">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <FolderOpen className="w-6 h-6 text-blue-400" />
                Research Dossiers
              </h2>
              
              <p className="text-gray-400 mb-6 leading-relaxed">
                Dossiers help you organize research around specific topics. Track claims, evidence, and verification status.
              </p>

              <h3 className="text-lg font-bold text-white mb-4">Dossier Structure</h3>
              <div className="space-y-3 mb-8">
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-4 h-4 text-blue-400" />
                    <p className="font-medium text-white">Claims</p>
                  </div>
                  <p className="text-sm text-gray-400">Statements you're tracking. Each claim has a status: verified, uncertain, or to-check.</p>
                </div>
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                  <div className="flex items-center gap-2 mb-2">
                    <Search className="w-4 h-4 text-blue-400" />
                    <p className="font-medium text-white">Queries</p>
                  </div>
                  <p className="text-sm text-gray-400">Research questions you've asked. Includes AI synthesis and sources.</p>
                </div>
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4 text-blue-400" />
                    <p className="font-medium text-white">History</p>
                  </div>
                  <p className="text-sm text-gray-400">Timeline of your research activity within the dossier.</p>
                </div>
              </div>

              <h3 className="text-lg font-bold text-white mb-4">Claim Trust Levels</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
                <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                  <p className="text-xs font-bold text-green-400 mb-1">HIGH</p>
                  <p className="text-xs text-gray-500">Well-sourced, verified</p>
                </div>
                <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                  <p className="text-xs font-bold text-yellow-400 mb-1">MEDIUM</p>
                  <p className="text-xs text-gray-500">Some evidence</p>
                </div>
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                  <p className="text-xs font-bold text-red-400 mb-1">LOW</p>
                  <p className="text-xs text-gray-500">Unverified claims</p>
                </div>
                <div className="p-3 rounded-lg bg-gray-500/10 border border-gray-500/20">
                  <p className="text-xs font-bold text-gray-400 mb-1">UNKNOWN</p>
                  <p className="text-xs text-gray-500">Not yet assessed</p>
                </div>
              </div>
            </motion.section>

            <motion.section variants={fadeUp} id="local-first" className="mb-16 scroll-mt-24">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <Database className="w-6 h-6 text-purple-400" />
                Local-First Storage
              </h2>
              
              <p className="text-gray-400 mb-6 leading-relaxed">
                DJZS stores your data locally using IndexedDB, a browser database. This means your thoughts never leave your device unless you choose to pin them onchain.
              </p>

              <h3 className="text-lg font-bold text-white mb-4">What's Stored Locally</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <div className="p-4 rounded-xl bg-green-500/[0.05] border border-green-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <HardDrive className="w-4 h-4 text-green-400" />
                    <p className="font-medium text-green-400">Stored on Device</p>
                  </div>
                  <ul className="text-sm text-gray-400 space-y-1">
                    <li>• Journal entries</li>
                    <li>• Research queries</li>
                    <li>• AI insights</li>
                    <li>• Pinned memories</li>
                    <li>• Research dossiers & claims</li>
                  </ul>
                </div>
                <div className="p-4 rounded-xl bg-blue-500/[0.05] border border-blue-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Cloud className="w-4 h-4 text-blue-400" />
                    <p className="font-medium text-blue-400">Server (Minimal)</p>
                  </div>
                  <ul className="text-sm text-gray-400 space-y-1">
                    <li>• Wallet address (identity)</li>
                    <li>• Membership status</li>
                    <li>• Room/zone metadata</li>
                    <li>• Payment receipts (optional)</li>
                  </ul>
                </div>
              </div>

              <InfoBox type="warning">
                <strong>Important:</strong> Local storage means if you clear your browser data, your entries will be lost. Use the Export feature to back up your data regularly.
              </InfoBox>
            </motion.section>

            <motion.section variants={fadeUp} id="data-export" className="mb-16 scroll-mt-24">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <Download className="w-6 h-6 text-purple-400" />
                Export Your Data
              </h2>
              
              <p className="text-gray-400 mb-6 leading-relaxed">
                You own your data. Export everything as JSON at any time.
              </p>

              <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.05] mb-8">
                <h3 className="text-lg font-bold text-white mb-4">Export Contents</h3>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>All journal entries with timestamps</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>All research entries and dossiers</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>AI-generated insights</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Pinned memories</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Research claims and trust levels</span>
                  </li>
                </ul>
              </div>

              <p className="text-sm text-gray-500">
                Find the Export button in the Settings menu of the chat interface.
              </p>
            </motion.section>

            <motion.section variants={fadeUp} id="privacy" className="mb-16 scroll-mt-24">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <Lock className="w-6 h-6 text-purple-400" />
                Privacy Guarantees
              </h2>
              
              <div className="space-y-4 mb-8">
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                  <p className="font-medium text-white mb-2">No tracking</p>
                  <p className="text-sm text-gray-400">We don't track your behavior, analyze your patterns, or build profiles.</p>
                </div>
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                  <p className="font-medium text-white mb-2">No data selling</p>
                  <p className="text-sm text-gray-400">Your data is never sold, shared, or used for advertising.</p>
                </div>
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                  <p className="font-medium text-white mb-2">No training on your data</p>
                  <p className="text-sm text-gray-400">The AI processes your entries for responses only. Nothing is stored or used for model training.</p>
                </div>
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                  <p className="font-medium text-white mb-2">Minimal server data</p>
                  <p className="text-sm text-gray-400">The server only stores wallet address, membership status, and optional payment records.</p>
                </div>
              </div>
            </motion.section>

            <motion.section variants={fadeUp} id="faq" className="mb-16 scroll-mt-24">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <HelpCircle className="w-6 h-6 text-purple-400" />
                Frequently Asked Questions
              </h2>
              
              <div className="space-y-3">
                <Accordion title="Do I need to own cryptocurrency to use DJZS?" defaultOpen>
                  <p>No! DJZS uses gasless transactions, meaning we cover the blockchain fees for you. You can sign up with email, Google, or Apple and never handle crypto directly.</p>
                </Accordion>
                
                <Accordion title="Is my journal private?">
                  <p>Yes. Your entries are stored locally on your device using IndexedDB. They never touch our servers. Even the AI analysis is processed without storing your content.</p>
                </Accordion>
                
                <Accordion title="What happens if I clear my browser data?">
                  <p>Your local entries will be deleted. Use the Export feature regularly to back up your data. Onchain attestations are permanent and unaffected.</p>
                </Accordion>
                
                <Accordion title="Can I use DJZS on multiple devices?">
                  <p>Since data is stored locally, each device has its own journal. We're exploring sync options that preserve privacy for future releases.</p>
                </Accordion>
                
                <Accordion title="What blockchain does DJZS use?">
                  <p>DJZS uses Base, an Ethereum L2 built by Coinbase. It's fast, cheap, and compatible with all Ethereum wallets.</p>
                </Accordion>
                
                <Accordion title="Is the AI therapist or coach?">
                  <p>No. DJZS is a thinking partner. It helps you reflect on your own thoughts but doesn't give advice, diagnoses, or coaching. For mental health support, please consult a professional.</p>
                </Accordion>
                
                <Accordion title="How do gasless transactions work?">
                  <p>We use Coinbase's paymaster service to sponsor transaction fees. When you pin an insight onchain, the fee is covered by our infrastructure.</p>
                </Accordion>
              </div>
            </motion.section>

            <motion.section variants={fadeUp} id="troubleshooting" className="mb-16 scroll-mt-24">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <RefreshCw className="w-6 h-6 text-purple-400" />
                Troubleshooting
              </h2>
              
              <div className="space-y-6">
                <div className="p-5 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                  <h4 className="font-bold text-white mb-3">Wallet won't connect</h4>
                  <ul className="text-sm text-gray-400 space-y-2">
                    <li>• Refresh the page and try again</li>
                    <li>• Make sure pop-ups are allowed for this site</li>
                    <li>• Try a different browser (Chrome recommended)</li>
                    <li>• If using a wallet extension, make sure it's unlocked</li>
                  </ul>
                </div>
                
                <div className="p-5 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                  <h4 className="font-bold text-white mb-3">Social login not working</h4>
                  <ul className="text-sm text-gray-400 space-y-2">
                    <li>• Check that cookies are enabled</li>
                    <li>• Disable any ad blockers temporarily</li>
                    <li>• Try incognito/private mode</li>
                    <li>• Make sure you're using a supported browser</li>
                  </ul>
                </div>
                
                <div className="p-5 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                  <h4 className="font-bold text-white mb-3">AI response is slow or fails</h4>
                  <ul className="text-sm text-gray-400 space-y-2">
                    <li>• Check your internet connection</li>
                    <li>• Wait a moment and try again (Venice AI may have high load)</li>
                    <li>• Try a shorter entry first</li>
                  </ul>
                </div>
                
                <div className="p-5 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                  <h4 className="font-bold text-white mb-3">Onchain pin failed</h4>
                  <ul className="text-sm text-gray-400 space-y-2">
                    <li>• Make sure your wallet is connected</li>
                    <li>• The paymaster may be temporarily unavailable—try again later</li>
                    <li>• Check that you're on the correct network (Base)</li>
                  </ul>
                </div>
                
                <div className="p-5 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                  <h4 className="font-bold text-white mb-3">Entries disappeared</h4>
                  <ul className="text-sm text-gray-400 space-y-2">
                    <li>• Entries are stored locally—did you clear browser data?</li>
                    <li>• Are you using the same browser/device?</li>
                    <li>• Check if you're in incognito mode (data won't persist)</li>
                  </ul>
                </div>
              </div>
            </motion.section>

            <motion.section variants={fadeUp} className="mb-16">
              <div className="p-8 rounded-3xl bg-gradient-to-br from-purple-500/10 to-transparent border border-purple-500/20 text-center">
                <h2 className="text-2xl font-bold text-white mb-4">Ready to start?</h2>
                <p className="text-gray-400 mb-6">Begin your first journal entry and let DJZS help you think more clearly.</p>
                <Link href="/chat">
                  <button className="px-8 py-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold transition-colors inline-flex items-center gap-2" data-testid="button-start-journaling">
                    Start Journaling
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </Link>
              </div>
            </motion.section>

            <motion.footer variants={fadeUp} className="text-center py-12 border-t border-white/[0.03]">
              <div className="flex justify-center gap-6 mb-6">
                <Link href="/terms">
                  <span className="text-sm text-gray-500 hover:text-gray-300 transition-colors">Terms of Service</span>
                </Link>
                <Link href="/">
                  <span className="text-sm text-gray-500 hover:text-gray-300 transition-colors">Home</span>
                </Link>
              </div>
              <p className="text-sm text-gray-600">
                Built with privacy in mind. Your thinking stays yours.
              </p>
            </motion.footer>
          </motion.main>
        </div>
      </div>
    </div>
  );
}
