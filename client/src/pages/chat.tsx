import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useAccount, useSignMessage, useDisconnect } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useQuery, useMutation } from "@tanstack/react-query";
import { nanoid } from "nanoid";
import { Link } from "wouter";
import { 
  TrendingUp, 
  BarChart3, 
  Calendar, 
  Users,
  Settings,
  Send,
  Loader2,
  Shield,
  Key,
  VolumeX,
  Volume2,
  UserX,
  Crown,
  Home,
  Lock,
  Bot,
  Pin,
  Download,
  FileText,
  Bell,
  X,
  Info,
  CheckCircle,
  ArrowRight,
  BookOpen,
  Zap,
  Clock,
  ChevronRight,
  ChevronDown,
  Menu,
  Globe,
  LogOut,
  PenLine,
  Moon,
  Sun,
  RefreshCw,
  Compass,
  ArrowUpRight,
  Trash2,
  Check,
  AlertCircle,
  HelpCircle,
  Mic,
  MicOff,
  Brain,
  Terminal,
  ScrollText,
  Hash,
  Activity,
  Eye,
  EyeOff,
  MessageSquare
} from "lucide-react";
import { SiX, SiGithub } from "react-icons/si";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { useDisplayName, useMultipleEnsNames, formatAddress } from "@/hooks/use-ens";
import { useXmtp } from "@/hooks/use-xmtp";
import { useWeb3Profile, getPrimaryProfile, getAllLinks, getTotalFollowers } from "@/hooks/useWeb3Profile";
import { MessageCard } from "@/components/chat/message-cards";
import { apiRequest, queryClient, getVeniceApiKey, setVeniceApiKey } from "@/lib/queryClient";
import { isVaultEncryptionSetUp, isVaultLocked, lockVault, setupVaultPassphrase, unlockVault, removeVaultEncryption } from "@/lib/vault-crypto";
import type { Member, ChatMessage, StoredMessage, JournalAnalysis, JournalEntry } from "@shared/schema";
import { TIER_CONFIG, type AuditTier } from "@shared/audit-schema";
import type { DJZSLogicAudit } from "@shared/audit-schema";
import { format } from "date-fns";
import { useLiveQuery } from "dexie-react-hooks";
import { QuickSearch } from "@/components/quick-search";
import { ProvisionAgentAllowance } from "@/components/provision-agent-allowance";
import { AuditTutorial, useTutorial } from "@/components/audit-tutorial";
import {
  exportVaultAsZip,
  getLastBackupDate,
} from "@/lib/vault-backup";
import { generateIntelligenceBrief, buildIntelligenceContext, type IntelligenceBrief } from "@/lib/founder-intelligence";
import { useTheme } from "@/lib/theme";
import { 
  vault, 
  saveEntry, 
  saveInsight, 
  getActiveMemories, 
  getMemoriesForAgent, 
  pinMemory as pinLocalMemory, 
  getEntryStats,
  getRecentEntriesForContext,
  exportVault,
  saveAuditRecord,
  getAuditRecords,
  type MemoryPin,
  type EntryType,
  type EntryStats,
  type AuditRecord,
  type AuditZoneTier
} from "@/lib/vault";

interface JournalAnalysisResult {
  entry: JournalEntry;
  analysis: JournalAnalysis;
  zone: "journal";
}

type AnalysisResult = JournalAnalysisResult;

const V1_ZONES = [
  { id: "journal", name: "Audit Ledger", icon: ScrollText, description: "Forensic logic trail", purpose: "Immutable log of all ProofOfLogic certificates — verdicts, risk scores, and DJZS-LF failure codes.", color: "#F37E20" },
  { id: "thinking", name: "Adversarial Oracle", icon: MessageSquare, description: "Adversarial AI", purpose: "Adversarial reasoning — expose contradictions, attack assumptions.", color: "#f43f5e" },
];

const ZONE_CONFIGS = [
  { 
    id: "micro" as AuditTier, 
    name: "Micro-Zone", 
    icon: Zap, 
    price: "$2.50", 
    color: "#2dd4bf",
    borderColor: "rgba(45,212,191,0.25)",
    bgColor: "rgba(45,212,191,0.06)",
    description: "Fast constrained operational audit. Binary risk scoring.",
    placeholder: "Paste your operational memo, trade thesis, or quick decision here...",
    purpose: "High-frequency sanity check for operational decisions.",
    maxChars: 1000,
  },
  { 
    id: "founder" as AuditTier, 
    name: "Founder Zone", 
    icon: Activity, 
    price: "$5.00", 
    color: "#F37E20",
    borderColor: "rgba(243,126,32,0.25)",
    bgColor: "rgba(243,126,32,0.06)",
    description: "Deep roadmap diligence. Detects narrative drift and confirmation bias.",
    placeholder: "Describe your strategic roadmap, fundraising thesis, or business model...",
    purpose: "Strategic pressure-test for founder-level decisions.",
    maxChars: 5000,
  },
  { 
    id: "treasury" as AuditTier, 
    name: "Treasury Zone", 
    icon: Shield, 
    price: "$50.00", 
    color: "#a855f7",
    borderColor: "rgba(168,85,247,0.25)",
    bgColor: "rgba(168,85,247,0.06)",
    description: "Exhaustive adversarial stress-test for capital deployment proposals.",
    placeholder: "Full capital deployment proposal, governance vote rationale, or treasury allocation strategy...",
    purpose: "Exhaustive governance audit for high-stakes capital decisions.",
    maxChars: Infinity,
  },
] as const;

const JOURNAL_PROMPTS = [
  "What feels unresolved right now?",
  "What are you unsure about?",
  "What don't you fully understand yet?",
  "What decision keeps circling back?",
  "What would clarity look like here?",
  "What's the tension you're sitting with?",
  "What are you avoiding thinking about?",
  "What pattern do you keep noticing?",
];

const TRADE_PROMPTS = [
  "swap 100 USDC to ETH",
  "what's my portfolio?",
  "check my balances",
  "swap 0.1 ETH to USDC",
  "get price of ETH",
];

interface AgentResponse {
  said: string;
  matters: string;
  nextMove: string;
  question: string;
  reflectiveQuestions?: string[];
  connectionToPrior?: string;
  memorySuggestion: {
    shouldSuggest: boolean;
    content: string;
    kind: string;
  };
}

export default function Chat() {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { toast } = useToast();
  const { theme, toggleTheme } = useTheme();
  const { displayName, ensName } = useDisplayName(address);
  const { client: xmtpClient, isConnecting: xmtpConnecting, connect: connectXmtp } = useXmtp();
  const { signMessageAsync } = useSignMessage();
  const { data: web3Profiles, isLoading: profileLoading } = useWeb3Profile(address);
  
  const primaryProfile = useMemo(() => getPrimaryProfile(web3Profiles || []), [web3Profiles]);
  const profileLinks = useMemo(() => getAllLinks(web3Profiles || []), [web3Profiles]);
  const totalFollowers = useMemo(() => getTotalFollowers(web3Profiles || []), [web3Profiles]);
  
  const [selectedZone, setSelectedZone] = useState(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const zoneParam = params.get("zone");
      if (zoneParam === "thinking") return "thinking";
      return "journal";
    }
    return "journal";
  });
  const [activeView, setActiveView] = useState<"workspace" | "execution">("workspace");
  const [activeZoneTier, setActiveZoneTier] = useState<AuditTier>("micro");
  const [auditPayload, setAuditPayload] = useState("");
  const [auditResult, setAuditResult] = useState<DJZSLogicAudit | null>(null);
  const [intelligenceBrief, setIntelligenceBrief] = useState<IntelligenceBrief | null>(null);
  const [briefExpanded, setBriefExpanded] = useState(true);
  const [isDeploying, setIsDeploying] = useState(false);
  const [expandedAuditId, setExpandedAuditId] = useState<number | null>(null);

  const auditRecords = useLiveQuery(() => getAuditRecords(50), []);
  const currentZoneConfig = ZONE_CONFIGS.find(z => z.id === activeZoneTier) || ZONE_CONFIGS[0];
  const { showTutorial, openTutorial, closeTutorial } = useTutorial();
  const [messageInput, setMessageInput] = useState("");
  const [adminPanelOpen, setAdminPanelOpen] = useState(false);

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);
  const [latestAnalysis, setLatestAnalysis] = useState<AnalysisResult | null>(null);
  const [agentResponse, setAgentResponse] = useState<AgentResponse | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [frozenHeight, setFrozenHeight] = useState<number | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [expandedEntryId, setExpandedEntryId] = useState<number | null>(null);
  const [quickSearchModalOpen, setQuickSearchModalOpen] = useState(false);
  const [lastEntryId, setLastEntryId] = useState<number | null>(null);
  const [lastBackupDate, setLastBackupDateState] = useState<string | null>(getLastBackupDate());
  const [isExporting, setIsExporting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const messageInputRef = useRef(messageInput);
  messageInputRef.current = messageInput;
  const voiceBaseTextRef = useRef('');

  const speechSupported = typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  const toggleVoiceInput = useCallback(async () => {
    if (!speechSupported) {
      toast({ title: 'Voice Input', description: 'Your browser does not support voice input. Try Chrome or Edge.', variant: 'destructive' });
      return;
    }

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
    } catch (err: any) {
      const isEmbedded = window.self !== window.top;
      if (isEmbedded) {
        toast({ 
          title: 'Microphone Blocked', 
          description: 'The preview window cannot access your microphone. Open the app in a new browser tab to use voice input.', 
          variant: 'destructive' 
        });
      } else if (err.name === 'NotAllowedError') {
        toast({ 
          title: 'Microphone Denied', 
          description: 'Please allow microphone access in your browser settings, then try again.', 
          variant: 'destructive' 
        });
      } else {
        toast({ 
          title: 'Microphone Error', 
          description: 'Could not access your microphone. Make sure one is connected and try again.', 
          variant: 'destructive' 
        });
      }
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast({ title: 'Voice Input', description: 'Speech recognition is not supported in this browser.', variant: 'destructive' });
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    // Optimization: Add a service worker check or common failure handling
    // Many browsers fail with 'network' error if the site is not served over HTTPS 
    // or if permissions are weird in an iframe.
    const isSecure = window.location.protocol === 'https:';
    if (!isSecure && window.location.hostname !== 'localhost') {
      toast({ 
        title: 'Security Requirement', 
        description: 'Voice input requires an HTTPS connection. Please ensure you are on a secure URL.', 
        variant: 'destructive' 
      });
      return;
    }

    voiceBaseTextRef.current = messageInputRef.current;

    recognition.onresult = (event: any) => {
      let newFinal = '';
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          newFinal += transcript;
        } else {
          interim += transcript;
        }
      }
      if (newFinal) {
        const spacer = voiceBaseTextRef.current && !voiceBaseTextRef.current.endsWith(' ') ? ' ' : '';
        voiceBaseTextRef.current = voiceBaseTextRef.current + spacer + newFinal;
        setMessageInput(voiceBaseTextRef.current + (interim ? ' ' + interim : ''));
      } else if (interim) {
        const spacer = voiceBaseTextRef.current && !voiceBaseTextRef.current.endsWith(' ') ? ' ' : '';
        setMessageInput(voiceBaseTextRef.current + spacer + interim);
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      if (event.error === 'no-speech') {
        toast({ title: 'Voice Input', description: 'No speech detected. Try speaking closer to your microphone.', variant: 'destructive' });
      } else if (event.error === 'network') {
        // More descriptive error for Replit environment
        toast({ 
          title: 'Voice Input', 
          description: 'Network error. Voice recognition usually requires an internet connection and a secure HTTPS origin. If you are in a preview, try opening the app in a new tab.', 
          variant: 'destructive' 
        });
      } else if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        toast({ 
          title: 'Permission Denied', 
          description: 'Microphone access was denied or is not allowed by the system. Check your browser permissions.', 
          variant: 'destructive' 
        });
      } else if (event.error !== 'aborted') {
        toast({ title: 'Voice Input', description: `Voice input stopped: ${event.error}`, variant: 'destructive' });
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    try {
      recognition.start();
      setIsListening(true);
      toast({ title: 'Listening...', description: 'Start speaking. Your words will appear in the text area.' });
    } catch (err) {
      toast({ title: 'Voice Input', description: 'Could not start voice input. Try opening the app in a new browser tab.', variant: 'destructive' });
    }
  }, [isListening, speechSupported, toast]);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);


  // Local-first: Query recent entries from IndexedDB (newest first)
  const localEntries = useLiveQuery(
    () => vault.entries
      .where('type')
      .equals(selectedZone)
      .toArray()
      .then(entries => entries.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, 50)),
    [selectedZone]
  );
  
  // Local-first: Entry stats (streak, last entry, total count)
  const [entryStats, setEntryStats] = useState<EntryStats | null>(null);
  useEffect(() => {
    if (selectedZone === "journal") {
      getEntryStats(selectedZone as EntryType).then(setEntryStats);
    }
  }, [selectedZone, localEntries]);

  const autoResize = useCallback(() => {
    const textarea = textareaRef.current;
    if (textarea && !frozenHeight) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.max(textarea.scrollHeight, 200)}px`;
    }
  }, [frozenHeight]);

  useEffect(() => {
    autoResize();
  }, [messageInput, autoResize]);

  const currentPrompts = JOURNAL_PROMPTS;

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPromptIndex((prev) => (prev + 1) % currentPrompts.length);
    }, 10000);
    return () => clearInterval(interval);
  }, [currentPrompts.length]);

  useEffect(() => {
    setCurrentPromptIndex(0);
    setAgentResponse(null);
    setMessageInput("");
    setFrozenHeight(null);
  }, [selectedZone]);


  useEffect(() => {
    const handleCmdK = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setQuickSearchModalOpen(prev => !prev);
      }
    };
    window.addEventListener("keydown", handleCmdK);
    return () => window.removeEventListener("keydown", handleCmdK);
  }, []);

  const { data: member, isLoading: memberLoading } = useQuery<Member | null>({
    queryKey: ["/api/members", address],
    queryFn: async () => {
      if (!address) return null;
      const res = await fetch(`/api/members/${address}`);
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch member");
      return res.json();
    },
    enabled: !!address,
  });

  const registerMember = useMutation({
    mutationFn: async () => {
      console.log("[DJZS] Starting member registration for:", address);
      const res = await apiRequest("POST", "/api/members", {
        address,
        ensName,
        isAllowlisted: true,
      });
      const data = await res.json().catch(() => ({ error: "Unknown error" }));
      if (!res.ok) {
        console.error("[DJZS] Registration failed:", res.status, data);
        throw new Error(data.error || `Registration failed: ${res.status}`);
      }
      console.log("[DJZS] Registration successful");
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/members", address] });
    },
    onError: (error: Error) => {
      console.error("[DJZS] Registration error:", error);
      toast({
        title: "Failed to initialize",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    },
  });

  const { data: messages = [], isLoading: messagesLoading } = useQuery<StoredMessage[]>({
    queryKey: ["/api/messages", selectedZone],
    queryFn: async () => {
      const res = await fetch(`/api/messages/${selectedZone}`);
      if (!res.ok) throw new Error("Failed to fetch messages");
      return res.json();
    },
    enabled: !!member && (member.isAllowlisted || member.isAdmin),
    refetchInterval: 5000,
  });

  // Fetch journal entries
  const { data: journalEntries = [] } = useQuery<JournalEntry[]>({
    queryKey: ["/api/journal/entries", address],
    queryFn: async () => {
      const res = await fetch(`/api/journal/entries/${address}`);
      if (!res.ok) throw new Error("Failed to fetch entries");
      return res.json();
    },
    enabled: !!address && selectedZone === "journal",
  });

  const sendMessage = useMutation({
    mutationFn: async (message: ChatMessage) => {
      const res = await apiRequest("POST", "/api/messages", {
        roomId: selectedZone,
        message,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages", selectedZone] });
      toast({
        title: "Entry committed",
        description: "Your reflection has been saved to the Zone.",
      });
    },
  });

  // Analyze journal entry with Venice AI (legacy)
  const analyzeEntry = useMutation({
    mutationFn: async ({ content, zone }: { content: string; zone: string }) => {
      const res = await apiRequest("POST", "/api/journal/analyze", {
        content,
        walletAddress: address,
        zone,
      });
      return res.json() as Promise<AnalysisResult>;
    },
    onSuccess: (data) => {
      setLatestAnalysis(data);
      queryClient.invalidateQueries({ queryKey: ["/api/journal/entries", address] });
      setIsAnalyzing(false);
    },
    onError: (error) => {
      setIsAnalyzing(false);
      toast({
        title: "Analysis failed",
        description: error instanceof Error ? error.message : "Could not analyze entry",
        variant: "destructive",
      });
    },
  });

  // NEW: Think with me - local-first agent analysis
  const thinkWithMe = useMutation({
    mutationFn: async ({ content, mode }: { content: string; mode: EntryType }) => {
      // 1. Get prior entries BEFORE saving current (to get true history)
      const priorEntries = await getRecentEntriesForContext(mode, 5);
      
      // 2. Get pinned memories for context
      const memories = await getMemoriesForAgent();
      
      // 3. Save entry locally
      const entryId = await saveEntry(mode, content, []);
      setLastEntryId(entryId);
      
      // 4. Call agent API with prior entries (excludes current entry)
      const res = await apiRequest("POST", "/api/agent/analyze", {
        mode,
        intent: "clarity",
        entry: content,
        pinnedMemory: memories,
        priorEntries: priorEntries.map(e => ({
          text: e.text,
          createdAt: e.createdAt.toISOString(),
        })),
      });
      const response = await res.json() as AgentResponse;
      
      // 5. Save insight locally
      await saveInsight(entryId, mode, {
        said: response.said,
        matters: response.matters,
        nextMove: response.nextMove,
        question: response.question,
      });
      
      return response;
    },
    onSuccess: (data) => {
      setAgentResponse(data);
      setIsAnalyzing(false);
    },
    onError: (error) => {
      setIsAnalyzing(false);
      toast({
        title: "Thinking failed",
        description: error instanceof Error ? error.message : "Could not process entry",
        variant: "destructive",
      });
    },
  });

  // Pin a memory (server)
  const pinMemory = useMutation({
    mutationFn: async (content: string) => {
      const res = await apiRequest("POST", "/api/memories/pin", {
        walletAddress: address,
        content,
        source: "user_pinned",
        sourceEntryId: latestAnalysis?.entry.id,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/memories", address] });
      toast({
        title: "Memory pinned",
        description: "This insight will be remembered.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Pin failed",
        description: error.message || "Could not save memory. Try again.",
        variant: "destructive",
      });
    },
  });

  // Pin memory locally (for agent suggestions)
  const handlePinSuggestion = async () => {
    if (!agentResponse?.memorySuggestion.shouldSuggest) return;
    const { content, kind } = agentResponse.memorySuggestion;
    try {
      await pinLocalMemory(kind as any, content, lastEntryId || undefined);
      toast({
        title: "Memory pinned",
        description: "This pattern will be remembered.",
      });
      setAgentResponse(prev => prev ? { ...prev, memorySuggestion: { ...prev.memorySuggestion, shouldSuggest: false } } : null);
    } catch (err) {
      console.error("Failed to pin memory:", err);
      toast({
        title: "Pin failed",
        description: "Check console for details",
        variant: "destructive"
      });
    }
  };

  const handleSkipSuggestion = () => {
    setAgentResponse(prev => prev ? { ...prev, memorySuggestion: { ...prev.memorySuggestion, shouldSuggest: false } } : null);
  };

  const deployToZone = useMutation({
    mutationFn: async ({ tier, memo }: { tier: AuditTier; memo: string }) => {
      let brief: IntelligenceBrief | null = null;
      let intelligenceContext: string | undefined;
      try {
        brief = await generateIntelligenceBrief(memo);
        setIntelligenceBrief(brief);
        intelligenceContext = brief.activeSignals > 0 ? buildIntelligenceContext(brief) : undefined;
      } catch (err) {
        console.warn("Intelligence brief generation failed (non-blocking):", err);
      }
      const endpoint = TIER_CONFIG[tier].endpoint;
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ strategy_memo: memo, audit_type: 'general', intelligence_context: intelligenceContext }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Audit failed' }));
        throw new Error(err.error || `Audit failed: ${res.status}`);
      }
      return res.json() as Promise<DJZSLogicAudit>;
    },
    onSuccess: async (data) => {
      setAuditResult(data);
      setIsDeploying(false);
      await saveAuditRecord({
        audit_id: data.audit_id,
        zone_tier: data.tier as AuditZoneTier,
        timestamp: new Date(data.timestamp),
        original_payload: auditPayload,
        audit_type: 'general',
        risk_score: data.risk_score,
        verdict: (data as any).verdict || (data.risk_score > 60 ? 'FAIL' : 'PASS'),
        primary_bias_detected: data.primary_bias_detected as any,
        flags: (data as any).flags || [],
        logic_flaws: data.logic_flaws,
        structural_recommendations: data.structural_recommendations,
        cryptographic_hash: data.cryptographic_hash,
      });
      toast({ title: "Audit deployed", description: `${TIER_CONFIG[data.tier].name} audit complete. Risk score: ${data.risk_score}/100` });
    },
    onError: (error) => {
      setIsDeploying(false);
      toast({
        title: "Deployment failed",
        description: error instanceof Error ? error.message : "Could not complete audit",
        variant: "destructive",
      });
    },
  });

  const handleDeploy = () => {
    if (!auditPayload.trim() || auditPayload.trim().length < 20) {
      toast({ title: "Payload too short", description: "Strategy memo must be at least 20 characters.", variant: "destructive" });
      return;
    }
    if (isDeploying) return;
    setIsDeploying(true);
    setAuditResult(null);
    deployToZone.mutate({ tier: activeZoneTier, memo: auditPayload });
  };

  const clearAuditResult = () => {
    setAuditResult(null);
    setIntelligenceBrief(null);
    setAuditPayload("");
  };

  const getRiskColor = (score: number) => {
    if (score >= 75) return '#ef4444';
    if (score >= 50) return '#f59e0b';
    if (score >= 25) return '#2dd4bf';
    return '#34d399';
  };

  const getRiskLabel = (score: number) => {
    if (score >= 75) return 'CRITICAL';
    if (score >= 50) return 'ELEVATED';
    if (score >= 25) return 'MODERATE';
    return 'LOW';
  };

  const [pinDialogOpen, setPinDialogOpen] = useState(false);
  const [securityDialogOpen, setSecurityDialogOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [veniceKeyInput, setVeniceKeyInput] = useState(getVeniceApiKey() || "");
  const [vaultPassphrase, setVaultPassphrase] = useState("");
  const [vaultEncrypted, setVaultEncrypted] = useState(isVaultEncryptionSetUp());
  const [vaultLocked, setVaultLocked] = useState(isVaultLocked());
  const [selectedPinKind, setSelectedPinKind] = useState<string>("pattern");
  
  const handleManualPin = async () => {
    if (!messageInput.trim()) return;
    try {
      await pinLocalMemory(selectedPinKind as any, messageInput.trim(), lastEntryId || undefined);
      toast({
        title: "Memory pinned",
        description: "Text preserved — continue editing or commit.",
      });
      setPinDialogOpen(false);
    } catch (err) {
      console.error("Failed to pin memory:", err);
      toast({
        title: "Pin failed",
        description: "Check console for details",
        variant: "destructive"
      });
    }
  };

  const handleSendText = async () => {
    if (!messageInput.trim() || !address || sendMessage.isPending) return;
    
    if (selectedZone === 'journal') {
      await saveEntry(selectedZone as EntryType, messageInput, []);
    }
    
    const message: ChatMessage = {
      type: "text",
      content: messageInput,
      createdAt: new Date().toISOString(),
      authorAddress: address,
    };
    sendMessage.mutate(message);
    setMessageInput("");
  };

  const handleAnalyze = () => {
    if (!messageInput.trim()) return;
    
    if (thinkWithMe.isPending) return;
    setIsAnalyzing(true);
    setAgentResponse(null);
    if (textareaRef.current) {
      setFrozenHeight(textareaRef.current.scrollHeight);
    }
    thinkWithMe.mutate({ content: messageInput, mode: selectedZone as EntryType });
  };

  const clearAndReset = () => {
    setMessageInput("");
    setAgentResponse(null);
    setLatestAnalysis(null);
    setFrozenHeight(null);
    textareaRef.current?.focus();
  };
  
  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey && !e.metaKey && !e.ctrlKey) {
      e.preventDefault();
      handleSendText();
    } else if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleAnalyze();
    }
  };

  const currentZone = V1_ZONES.find(z => z.id === selectedZone) || V1_ZONES[0];

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-background">
        <div className="text-center max-w-sm">
          <div className="w-20 h-20 rounded-lg bg-orange-600/10 flex items-center justify-center mx-auto mb-8 border border-orange-500/20">
            <Shield className="w-10 h-10 text-orange-400" />
          </div>
          <h2 className="text-3xl font-black text-foreground mb-3 tracking-tight">Access Locked</h2>
          <p className="text-muted-foreground mb-8 leading-relaxed">DJZS requires a cryptographic identity to access the Architect Console.</p>
          <div className="flex justify-center">
            <ConnectButton />
          </div>
        </div>
      </div>
    );
  }

  if (memberLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background">
        <img src="/logo.png" alt="DJZS" className="w-16 h-16 rounded-lg logo-pulse" style={{ filter: 'drop-shadow(0 0 8px rgba(243,126,32,0.3))' }} data-testid="img-logo-loading" />
        <p className="text-sm font-medium text-muted-foreground">Loading your vault...</p>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-background relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.02]"
          style={{
            backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />
        <div className="absolute top-[-15%] left-[-10%] w-[500px] h-[500px] rounded-full pointer-events-none" style={{ background: 'rgba(243,126,32,0.06)', filter: 'blur(120px)' }} />
        <div className="absolute bottom-[-15%] right-[-10%] w-[500px] h-[500px] rounded-full pointer-events-none" style={{ background: 'rgba(46,139,139,0.06)', filter: 'blur(120px)' }} />

        <div className="text-center max-w-lg relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-mono mb-6" style={{ border: '1px solid rgba(243,126,32,0.3)', background: 'rgba(243,126,32,0.08)', color: '#F37E20' }}>
            <Shield className="w-3.5 h-3.5" />
            <span>DJZS ARCHITECT CONSOLE</span>
          </div>

          <h2
            className="text-3xl sm:text-4xl font-black tracking-tight mb-4 text-transparent bg-clip-text"
            style={{ backgroundImage: 'linear-gradient(135deg, #F37E20, #2E8B8B)' }}
          >
            Initialize Your Workspace
          </h2>
          <p className="mb-8 text-muted-foreground leading-relaxed max-w-md mx-auto">
            Deploy your first strategy memo into the adversarial logic layer. The Oracle will stress-test your reasoning before execution.
          </p>
          <Button
            onClick={() => registerMember.mutate()}
            disabled={registerMember.isPending}
            className="h-14 px-10 rounded-lg font-bold text-lg text-white border-0 transition-all hover:-translate-y-0.5"
            style={{ background: '#F37E20', boxShadow: '0 8px 30px rgba(243,126,32,0.25)' }}
            data-testid="button-begin-entry"
          >
            {registerMember.isPending && <Loader2 className="w-5 h-5 mr-3 animate-spin" />}
            Begin First Entry
          </Button>
          <p className="text-xs text-muted-foreground/60 mt-4 font-mono">Local-first storage · Zero data retention · Wallet-authenticated</p>
        </div>
      </div>
    );
  }

  const clearAnalysis = () => {
    setLatestAnalysis(null);
    setFrozenHeight(null);
    setMessageInput("");
  };

  return (
    <>
    <TooltipProvider>
      <div className="h-screen text-foreground flex overflow-hidden font-sans selection:bg-teal-500/30 bg-background">
        {/* Mobile sidebar overlay */}
        {mobileSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/60 z-40 md:hidden" 
            onClick={() => setMobileSidebarOpen(false)}
          />
        )}

        {/* Left Sidebar - hidden on mobile by default */}
        <aside className={`
          ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
          md:translate-x-0
          fixed md:relative z-50 md:z-auto
          w-64 h-full border-r flex flex-col 
          transition-all duration-300 bg-card
          ${isFocused && !mobileSidebarOpen ? 'md:opacity-40' : 'opacity-100'}
        `} style={{ borderColor: 'hsl(var(--border))' }}>
          <div className="p-8 pb-4 flex items-center justify-between">
            <Link href="/">
              <button className="flex items-center gap-2 text-sm font-black text-foreground tracking-[0.2em] uppercase opacity-40 hover:opacity-100 hover:text-orange-400 transition-all group">
                <img src="/logo.png" alt="DJZS" className="w-6 h-6 rounded transition-transform group-hover:-translate-x-1" style={{ filter: 'drop-shadow(0 0 2px rgba(0,0,0,0.3))' }} data-testid="img-logo-sidebar" />
                <span>DJZS AI</span>
              </button>
            </Link>
            {/* Close button on mobile */}
            <button 
              onClick={() => setMobileSidebarOpen(false)}
              className="md:hidden p-2 text-muted-foreground hover:text-foreground"
              aria-label="Close sidebar"
              data-testid="button-close-sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground/80 px-4 mb-2 mt-2">Governance</p>
            {V1_ZONES.map((zone) => {
              const Icon = zone.icon;
              const isActive = activeView === "workspace" && selectedZone === zone.id;
              return (
                <button
                  key={zone.id}
                  onClick={() => {
                    setSelectedZone(zone.id);
                    setActiveView("workspace");
                    setMobileSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-4 px-4 py-2.5 rounded-lg transition-all group ${
                    isActive 
                      ? "bg-muted/50 text-foreground" 
                      : "text-muted-foreground hover:text-muted-foreground hover:bg-muted/30"
                  }`}
                  aria-current={isActive ? "page" : undefined}
                  data-testid={`button-workspace-${zone.id}`}
                >
                  <Icon className="w-4 h-4 transition-colors" style={{ color: isActive ? zone.color : undefined }} />
                  <span className="text-sm font-bold tracking-tight">{zone.name}</span>
                  {isActive && <div className="w-1 h-1 rounded-full ml-auto" style={{ background: zone.color, boxShadow: `0 0 8px ${zone.color}` }}></div>}
                </button>
              );
            })}

            <div className="my-3 border-t border-border" />

            <Link href="/dashboard">
              <button
                className="w-full flex items-center gap-4 px-4 py-2.5 rounded-lg transition-all group text-muted-foreground hover:text-muted-foreground hover:bg-muted/30"
                data-testid="link-terminal-console"
              >
                <Terminal className="w-4 h-4 text-cyan-500/70 group-hover:text-cyan-400 transition-colors" />
                <span className="text-sm font-bold tracking-tight">Terminal Console</span>
              </button>
            </Link>

            <div className="my-3 border-t border-border" />

            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground/80 px-4 mb-2" data-testid="sidebar-zones">x402 Fee Structure</p>
            {ZONE_CONFIGS.map((zone) => {
              const Icon = zone.icon;
              return (
                <div
                  key={zone.id}
                  className="w-full flex items-center gap-4 px-4 py-2.5 rounded-lg text-muted-foreground/60"
                  data-testid={`display-zone-${zone.id}`}
                >
                  <Icon className="w-4 h-4" style={{ color: zone.color }} />
                  <div className="flex-1 text-left">
                    <span className="text-sm font-bold tracking-tight block">{zone.name}</span>
                    <span className="text-[10px] font-mono" style={{ color: 'rgba(156,163,175,0.5)' }}>{zone.price} USDC</span>
                  </div>
                </div>
              );
            })}

            <div className="my-3 border-t border-border" />

            <button
              onClick={openTutorial}
              className="w-full flex items-center gap-4 px-4 py-3 rounded-lg text-muted-foreground hover:text-muted-foreground hover:bg-muted/30 transition-all group"
              data-testid="button-tutorial"
            >
              <HelpCircle className="w-5 h-5 text-muted-foreground/80 group-hover:text-muted-foreground transition-colors" />
              <span className="text-sm font-bold tracking-tight">Protocol Specs</span>
            </button>
          </nav>

          <div className="p-4 mt-auto">
            <div className="p-4 rounded-lg" style={{ background: 'hsl(var(--muted) / 0.3)', border: '1px solid hsl(var(--border))' }}>
              <div className="flex items-center gap-3 mb-3">
                {primaryProfile?.avatar ? (
                  <img 
                    src={primaryProfile.avatar} 
                    alt={primaryProfile.displayName} 
                    className="w-10 h-10 rounded-full object-cover" style={{ border: '1px solid rgba(243,126,32,0.2)' }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-black" style={{ background: 'rgba(243,126,32,0.1)', color: '#F37E20', border: '1px solid rgba(243,126,32,0.2)' }}>
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-foreground truncate">{primaryProfile?.displayName || ensName || formatAddress(address || "")}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <div className="w-1 h-1 rounded-full bg-green-500 shadow-[0_0_4px_rgba(34,197,94,0.5)]"></div>
                    <span className="text-[9px] font-black text-muted-foreground/80 uppercase tracking-widest">Connected</span>
                  </div>
                </div>
              </div>

              {primaryProfile?.description && (
                <p className="text-[10px] text-muted-foreground leading-relaxed mb-3 line-clamp-2">{primaryProfile.description}</p>
              )}

              {totalFollowers > 0 && (
                <div className="flex items-center gap-1 mb-3">
                  <Users className="w-3 h-3 text-muted-foreground/80" />
                  <span className="text-[9px] font-bold text-muted-foreground">{totalFollowers.toLocaleString()} followers</span>
                </div>
              )}

              {Object.keys(profileLinks).length > 0 && (
                <div className="flex items-center gap-2 pt-2 border-t border-border">
                  {profileLinks.twitter && (
                    <a 
                      href={profileLinks.twitter.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg bg-muted hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                      title={`@${profileLinks.twitter.handle}`}
                      data-testid="link-twitter"
                    >
                      <SiX className="w-3 h-3" />
                    </a>
                  )}
                  {profileLinks.github && (
                    <a 
                      href={profileLinks.github.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg bg-muted hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                      title={profileLinks.github.handle}
                      data-testid="link-github"
                    >
                      <SiGithub className="w-3 h-3" />
                    </a>
                  )}
                  {profileLinks.farcaster && (
                    <a 
                      href={profileLinks.farcaster.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg bg-muted hover:bg-muted text-muted-foreground hover:text-orange-400 transition-colors"
                      title={profileLinks.farcaster.handle}
                      data-testid="link-farcaster"
                    >
                      <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor"><path d="M18.24.24H5.76A5.76 5.76 0 000 6v12a5.76 5.76 0 005.76 5.76h12.48A5.76 5.76 0 0024 18V6A5.76 5.76 0 0018.24.24zm.81 17.52h-.53v-5.4c0-.28-.23-.5-.5-.5h-4v5.9h-.54v-5.9h-3.96v5.9h-.54v-5.9h-4c-.28 0-.5.22-.5.5v5.4h-.54V9.25c0-.28.23-.5.5-.5h13.11c.28 0 .5.22.5.5v8.51z"/></svg>
                    </a>
                  )}
                  {profileLinks.website && (
                    <a 
                      href={profileLinks.website.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg bg-muted hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                      title={profileLinks.website.handle}
                      data-testid="link-website"
                    >
                      <Globe className="w-3 h-3" />
                    </a>
                  )}
                </div>
              )}
              
              <button
                onClick={() => setSettingsOpen(!settingsOpen)}
                className="mt-3 w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-muted hover:bg-muted text-muted-foreground hover:text-foreground transition-colors border border-border"
                aria-expanded={settingsOpen}
                data-testid="button-settings"
              >
                <Settings className="w-3 h-3" />
                <span className="text-[9px] font-black uppercase tracking-widest">Settings</span>
              </button>

              {settingsOpen && (
                <div className="mt-2 p-3 rounded-lg bg-muted/50 border border-border space-y-3" data-testid="panel-settings">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">Venice API Key (BYOK)</label>
                    <p className="text-[9px] text-muted-foreground/80 mb-2">Use your own Venice key instead of the shared one. Stored locally in your browser.</p>
                    <input
                      data-testid="input-venice-api-key"
                      type="password"
                      className="w-full px-2.5 py-1.5 bg-muted border border-border rounded-lg text-[11px] text-foreground placeholder:text-muted-foreground/80 outline-none focus:border-teal-500/50"
                      placeholder="venice-..."
                      value={veniceKeyInput}
                      onChange={(e) => setVeniceKeyInput(e.target.value)}
                    />
                    <div className="flex gap-2 mt-2">
                      <button
                        data-testid="button-save-venice-key"
                        onClick={() => {
                          setVeniceApiKey(veniceKeyInput.trim() || null);
                          toast({ title: veniceKeyInput.trim() ? "Venice key saved" : "Venice key removed", description: veniceKeyInput.trim() ? "Your own API key will be used for all AI requests." : "Using the shared Venice API key." });
                        }}
                        className="flex-1 py-1.5 rounded-lg text-[10px] font-bold bg-teal-500/15 text-teal-400 border border-teal-500/20 hover:bg-teal-500/25 transition-colors"
                      >
                        {veniceKeyInput.trim() ? "Save Key" : "Use Shared Key"}
                      </button>
                      {getVeniceApiKey() && (
                        <button
                          data-testid="button-clear-venice-key"
                          onClick={() => {
                            setVeniceKeyInput("");
                            setVeniceApiKey(null);
                            toast({ title: "Venice key cleared", description: "Now using the shared Venice API key." });
                          }}
                          className="py-1.5 px-3 rounded-lg text-[10px] font-bold bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="border-t border-border pt-3">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">Vault Encryption</label>
                    <p className="text-[9px] text-muted-foreground/80 mb-2">
                      {vaultEncrypted
                        ? "Your vault is passphrase-protected. Lock it when you step away."
                        : "Set a passphrase to encrypt your local vault data."}
                    </p>
                    {!vaultEncrypted ? (
                      <>
                        <input
                          data-testid="input-vault-passphrase"
                          type="password"
                          className="w-full px-2.5 py-1.5 bg-muted border border-border rounded-lg text-[11px] text-foreground placeholder:text-muted-foreground/80 outline-none focus:border-purple-500/50"
                          placeholder="Choose a passphrase..."
                          value={vaultPassphrase}
                          onChange={(e) => setVaultPassphrase(e.target.value)}
                        />
                        <button
                          data-testid="button-enable-encryption"
                          disabled={!vaultPassphrase.trim() || vaultPassphrase.length < 6}
                          onClick={async () => {
                            try {
                              await setupVaultPassphrase(vaultPassphrase);
                              setVaultEncrypted(true);
                              setVaultLocked(false);
                              setVaultPassphrase("");
                              toast({ title: "Vault encryption enabled", description: "Your vault is now passphrase-protected." });
                            } catch { toast({ title: "Encryption failed", variant: "destructive" }); }
                          }}
                          className="mt-2 w-full py-1.5 rounded-lg text-[10px] font-bold bg-purple-500/15 text-purple-400 border border-purple-500/20 hover:bg-purple-500/25 disabled:opacity-40 transition-colors"
                        >
                          Enable Encryption {vaultPassphrase.length > 0 && vaultPassphrase.length < 6 ? "(min 6 chars)" : ""}
                        </button>
                      </>
                    ) : vaultLocked ? (
                      <>
                        <input
                          data-testid="input-vault-unlock"
                          type="password"
                          className="w-full px-2.5 py-1.5 bg-muted border border-border rounded-lg text-[11px] text-foreground placeholder:text-muted-foreground/80 outline-none focus:border-green-500/50"
                          placeholder="Enter passphrase to unlock..."
                          value={vaultPassphrase}
                          onChange={(e) => setVaultPassphrase(e.target.value)}
                        />
                        <button
                          data-testid="button-unlock-vault"
                          disabled={!vaultPassphrase.trim()}
                          onClick={async () => {
                            const ok = await unlockVault(vaultPassphrase);
                            if (ok) {
                              setVaultLocked(false);
                              setVaultPassphrase("");
                              toast({ title: "Vault unlocked" });
                            } else {
                              toast({ title: "Wrong passphrase", variant: "destructive" });
                            }
                          }}
                          className="mt-2 w-full py-1.5 rounded-lg text-[10px] font-bold bg-green-500/15 text-green-400 border border-green-500/20 hover:bg-green-500/25 disabled:opacity-40 transition-colors"
                        >
                          Unlock Vault
                        </button>
                      </>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          data-testid="button-lock-vault"
                          onClick={() => {
                            lockVault();
                            setVaultLocked(true);
                            toast({ title: "Vault locked", description: "Your data is protected until you unlock." });
                          }}
                          className="flex-1 py-1.5 rounded-lg text-[10px] font-bold bg-yellow-500/15 text-yellow-400 border border-yellow-500/20 hover:bg-yellow-500/25 transition-colors"
                        >
                          Lock Vault
                        </button>
                        <button
                          data-testid="button-remove-encryption"
                          onClick={() => {
                            removeVaultEncryption();
                            setVaultEncrypted(false);
                            setVaultLocked(false);
                            toast({ title: "Encryption removed" });
                          }}
                          className="py-1.5 px-3 rounded-lg text-[10px] font-bold bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <button
                onClick={() => disconnect()}
                className="mt-2 w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-muted hover:bg-red-500/10 text-muted-foreground hover:text-red-400 transition-colors border border-border hover:border-red-500/20"
                data-testid="button-disconnect-wallet"
              >
                <LogOut className="w-3 h-3" />
                <span className="text-[9px] font-black uppercase tracking-widest">Disconnect</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Main Interface */}
        <main className="flex-1 flex flex-col relative">
          {/* Transparent Glassy Header */}
          <header className="h-14 sm:h-16 md:h-20 flex items-center justify-between px-3 sm:px-4 md:px-10 backdrop-blur-xl border-b border-border sticky top-0 z-30 bg-background/90">
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Hamburger menu for mobile */}
              <button 
                onClick={() => setMobileSidebarOpen(true)}
                className="md:hidden p-2.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors touch-target"
                data-testid="button-open-sidebar"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div className="flex flex-col">
                <h2 className="text-base sm:text-lg md:text-xl font-bold text-foreground">
                  {activeView === "workspace" ? (V1_ZONES.find(z => z.id === selectedZone)?.name || "Audit Ledger") : currentZoneConfig.name}
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5 hidden sm:block">
                  {activeView === "workspace" ? (V1_ZONES.find(z => z.id === selectedZone)?.purpose || "") : currentZoneConfig.purpose}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              {/* Status badges - hidden on mobile, E2E badge is clickable */}
              <Dialog open={securityDialogOpen} onOpenChange={setSecurityDialogOpen}>
                <DialogTrigger asChild>
                  <button className="hidden lg:flex items-center gap-4 px-4 py-2 rounded-lg transition-all cursor-pointer" style={{ background: 'hsl(var(--muted) / 0.3)', border: '1px solid hsl(var(--border))' }} onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'hsl(var(--border))'; }} onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'hsl(var(--border))'; }} data-testid="button-security-info">
                    <div className="flex items-center gap-2">
                      <Lock className="w-3 h-3 text-green-500/50" />
                      <span className="text-[10px] font-medium text-muted-foreground">Local-First</span>
                    </div>
                    <div className="w-px h-3" style={{ background: 'hsl(var(--border))' }}></div>
                    <div className="flex items-center gap-2">
                      <Bot className="w-3 h-3" style={{ color: 'rgba(243,126,32,0.5)' }} />
                      <span className="text-[10px] font-medium text-muted-foreground">Adversarial Oracle</span>
                    </div>
                  </button>
                </DialogTrigger>
                <DialogContent className="border-border max-w-lg p-6 rounded-lg shadow-2xl" style={{ background: 'hsl(var(--card))' }}>
                  <DialogHeader>
                    <DialogTitle className="text-lg font-black text-foreground uppercase tracking-tight flex items-center gap-3">
                      <div className="w-8 h-8 rounded-md bg-gradient-to-br from-green-500/[0.15] to-transparent border border-green-500/20 flex items-center justify-center">
                        <Lock className="w-4 h-4 text-green-400" />
                      </div>
                      Privacy Architecture
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-3 py-3">
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      All data stays on your device. The Oracle only processes what you explicitly deploy.
                    </p>
                    
                    <div className="p-3 rounded-lg bg-gradient-to-br from-orange-500/[0.08] to-transparent border border-orange-500/20 space-y-2">
                      <p className="text-[10px] font-bold text-orange-400 uppercase tracking-wider">Protocol Layers</p>
                      <ul className="space-y-1.5 text-xs text-muted-foreground">
                        <li className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-1.5 shrink-0"></span>
                          <span><strong className="text-foreground/80">Sovereign Storage</strong> — Reasoning traces and forensic logs in IndexedDB, offline-capable</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0"></span>
                          <span><strong className="text-foreground/80">Computation Horizon</strong> — Venice AI zero-retention compute, destroyed after Proof-of-Logic issuance</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-1.5 shrink-0"></span>
                          <span><strong className="text-foreground/80">Immutable Provenance</strong> — Only anonymized hash, verdict, and failure codes on Irys — never raw strategy</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-400 mt-1.5 shrink-0"></span>
                          <span><strong className="text-foreground/80">Cryptographic Sovereignty</strong> — No private key access; x402 via wallet, XMTP MLS E2E, AES-GCM-256 vault</span>
                        </li>
                      </ul>
                    </div>

                    <div className="p-3 rounded-lg bg-gradient-to-br from-purple-500/[0.08] to-transparent border border-purple-500/20">
                      <p className="text-[10px] font-bold text-purple-400 uppercase tracking-wider mb-2">Privacy Stack</p>
                      <ul className="space-y-1 text-xs text-muted-foreground">
                        <li className="flex items-center gap-2">
                          <span className="w-1 h-1 rounded-full bg-orange-400 shrink-0"></span>
                          Local-first sovereign storage (IndexedDB)
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="w-1 h-1 rounded-full bg-amber-400 shrink-0"></span>
                          Zero-retention AI compute (Venice AI)
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="w-1 h-1 rounded-full bg-teal-400 shrink-0"></span>
                          Immutable provenance (Irys Datachain)
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="w-1 h-1 rounded-full bg-green-400 shrink-0"></span>
                          E2E encrypted messaging (XMTP MLS)
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="w-1 h-1 rounded-full bg-purple-400 shrink-0"></span>
                          Evasion Defense Pipeline (STRIP/INVERT/TRACE/CLASSIFY)
                        </li>
                      </ul>
                    </div>

                    <p className="text-[10px] text-muted-foreground/80 text-center uppercase tracking-wider font-mono">
                      STRIP → INVERT → TRACE → CLASSIFY
                    </p>
                  </div>
                </DialogContent>
              </Dialog>
              
              <button
                onClick={toggleTheme}
                className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors text-muted-foreground hover:text-foreground hover:bg-muted dark:hover:bg-muted hover:bg-black/5"
                data-testid="button-theme-toggle-chat"
                aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            </div>
          </header>

          {/* Main Content Area - scrollable */}
          <div className="flex-1 overflow-y-auto scroll-smooth">
            {activeView === "workspace" ? (
            <div className="flex-1 flex flex-col max-w-3xl w-full mx-auto px-4 sm:px-8">
              {selectedZone === "journal" ? (
                <div className="flex-1 flex flex-col py-6 sm:py-10">
                  <div className="w-full font-mono text-sm">
                    <h2 className="text-xl text-foreground font-bold mb-6 tracking-tight uppercase flex items-center gap-2">
                      <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                      Audit Ledger
                    </h2>

                    {(!auditRecords || auditRecords.length === 0) ? (
                      <div className="py-10">
                        <ProvisionAgentAllowance />
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {auditRecords.map((record) => {
                          const tierConfig = ZONE_CONFIGS.find(z => z.id === record.zone_tier);
                          const isExpanded = expandedAuditId === record.id;
                          return (
                            <div
                              key={record.id}
                              className={`rounded-xl overflow-hidden transition-all ${
                                record.verdict === 'FAIL'
                                  ? 'border border-red-900/30 hover:border-red-700/50'
                                  : 'border border-emerald-900/30 hover:border-emerald-700/50'
                              }`}
                              style={{ background: record.verdict === 'FAIL' ? 'rgba(127,29,29,0.06)' : 'rgba(6,78,59,0.06)' }}
                              data-testid={`audit-record-${record.id}`}
                            >
                              <button
                                onClick={() => setExpandedAuditId(isExpanded ? null : (record.id ?? null))}
                                className="w-full text-left p-4 sm:p-5"
                              >
                                <div className="flex justify-between items-center border-b border-border/50 pb-3 mb-4">
                                  <span className="text-muted-foreground truncate mr-4 text-xs">
                                    TX: <span className="text-foreground/80">{record.cryptographic_hash?.slice(0, 24) || "pending"}...</span>
                                  </span>
                                  <span className="text-muted-foreground/60 whitespace-nowrap text-xs">
                                    {format(new Date(record.timestamp), "MMM d, yyyy HH:mm")}
                                  </span>
                                </div>

                                <div className="flex items-center gap-4">
                                  <span className={`px-2.5 py-1 rounded text-xs font-bold tracking-wider ${
                                    record.verdict === 'FAIL'
                                      ? 'bg-red-500/10 text-red-500 border border-red-500/20'
                                      : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                                  }`}>
                                    {record.verdict || "PENDING"}
                                  </span>
                                  <span className="text-muted-foreground text-xs">
                                    Risk Score: <strong className="text-foreground">{record.risk_score}</strong>/100
                                  </span>
                                  <span className="text-[10px] font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded" style={{ background: tierConfig?.bgColor, color: tierConfig?.color }}>
                                    {record.zone_tier}
                                  </span>
                                  <ChevronDown className={`w-4 h-4 text-muted-foreground/80 transition-transform ml-auto ${isExpanded ? 'rotate-180' : ''}`} />
                                </div>
                              </button>

                              {isExpanded && (
                                <div className="px-5 pb-5 space-y-4 border-t border-border pt-4">
                                  <div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/80 mb-2">Original Payload</p>
                                    <p className="text-xs text-muted-foreground leading-relaxed bg-muted/30 p-3 rounded-lg border border-border/50">{record.original_payload}</p>
                                  </div>
                                  <div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/80 mb-2">Primary Bias Detected</p>
                                    <span className="px-3 py-1.5 rounded-lg text-xs font-bold" style={{ background: record.primary_bias_detected !== 'None' ? 'rgba(239,68,68,0.1)' : 'rgba(52,211,153,0.1)', color: record.primary_bias_detected !== 'None' ? '#ef4444' : '#34d399' }}>
                                      {record.primary_bias_detected.replace(/_/g, ' ')}
                                    </span>
                                  </div>
                                  {record.flags && record.flags.length > 0 && (
                                    <div>
                                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/80 mb-2">DJZS-LF Failure Codes ({record.flags.length})</p>
                                      <div className="space-y-2 bg-muted/20 p-3 rounded-lg border border-border/50">
                                        {record.flags.map((flag, idx) => {
                                          const sevColor = flag.severity === 'CRITICAL' ? '#ef4444' : flag.severity === 'HIGH' ? '#f97316' : flag.severity === 'MEDIUM' ? '#f59e0b' : '#6b7280';
                                          return (
                                            <div key={idx} className="flex items-start gap-3">
                                              <span className="px-1.5 py-0.5 bg-muted text-foreground/80 rounded text-xs whitespace-nowrap font-mono font-black" style={{ borderLeft: `2px solid ${sevColor}` }}>
                                                {flag.code}
                                              </span>
                                              <span className="text-muted-foreground text-xs leading-relaxed">
                                                <strong style={{ color: sevColor }}>{flag.severity}</strong>: {flag.message}
                                              </span>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  )}
                                  {record.logic_flaws.length > 0 && (
                                    <div>
                                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/80 mb-2">Logic Flaws ({record.logic_flaws.length})</p>
                                      <div className="space-y-2">
                                        {record.logic_flaws.map((flaw, idx) => (
                                          <div key={idx} className="p-3 rounded-lg bg-muted/30 border border-border/50">
                                            <div className="flex items-center gap-2 mb-1">
                                              <span className="text-[10px] font-bold uppercase" style={{ color: flaw.severity === 'critical' ? '#ef4444' : flaw.severity === 'medium' ? '#f59e0b' : '#6b7280' }}>{flaw.severity}</span>
                                              <span className="text-xs font-bold text-foreground">{flaw.flaw_type}</span>
                                            </div>
                                            <p className="text-xs text-muted-foreground leading-relaxed">{flaw.explanation}</p>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                  {record.structural_recommendations.length > 0 && (
                                    <div>
                                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/80 mb-2">Recommendations</p>
                                      <ul className="space-y-1.5">
                                        {record.structural_recommendations.map((rec, idx) => (
                                          <li key={idx} className="flex items-start gap-2">
                                            <span className="w-1 h-1 rounded-full mt-2 shrink-0" style={{ background: tierConfig?.color }}></span>
                                            <p className="text-sm text-muted-foreground leading-relaxed">{rec}</p>
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}
                                  <div className="pt-3 border-t border-border">
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/80 mb-1">Cryptographic Hash</p>
                                    <p className="text-[11px] font-mono text-muted-foreground break-all">{record.cryptographic_hash}</p>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    <div className="mt-8 pt-6 border-t border-zinc-800/50">
                      <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-3 flex items-center gap-2">
                        <Terminal className="w-3.5 h-3.5" />
                        Local Node State
                      </h3>
                      <p className="text-[10px] text-zinc-600 mb-3 font-mono">
                        Last export: {lastBackupDate ? format(new Date(lastBackupDate), "MMM d, yyyy 'at' h:mm a") : 'never'}
                      </p>
                      <Button
                        variant="outline"
                        className="w-full border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800/50 text-zinc-400 hover:text-emerald-400 h-9 rounded-lg font-mono text-xs transition-all"
                        disabled={isExporting}
                        onClick={async () => {
                          setIsExporting(true);
                          try {
                            const blob = await exportVaultAsZip();
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `djzs-logic-state-export-${new Date().toISOString().split('T')[0]}.zip`;
                            document.body.appendChild(a);
                            a.click();
                            document.body.removeChild(a);
                            URL.revokeObjectURL(url);
                            setLastBackupDateState(getLastBackupDate());
                            toast({ title: "Logic logs exported", description: "ZIP archive downloaded" });
                          } catch (err) {
                            toast({ title: "Export failed", description: "Could not export logic logs", variant: "destructive" });
                          } finally {
                            setIsExporting(false);
                          }
                        }}
                        data-testid="button-export-logic-logs"
                      >
                        {isExporting ? <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" /> : <Download className="w-3.5 h-3.5 mr-2" />}
                        {isExporting ? 'Exporting...' : 'Export Logic Logs (.zip)'}
                      </Button>
                    </div>
                  </div>
                </div>
              ) : selectedZone === "thinking" ? (
                <div className="py-6 sm:py-10">
                  <div className="mb-6 p-4 sm:p-5 rounded-lg" style={{ background: 'rgba(244,63,94,0.06)', border: '1px solid rgba(244,63,94,0.15)' }}>
                    <div className="flex items-center gap-3 mb-2">
                      <MessageSquare className="w-5 h-5" style={{ color: '#f43f5e' }} />
                      <h3 className="text-base font-black text-foreground">Adversarial Oracle</h3>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">Adversarial AI for reasoning attack. Paste your thesis, argument, or decision — it will expose contradictions, challenge assumptions, and pressure-test your logic.</p>
                  </div>

                  {agentResponse ? (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                      <div className="p-5 rounded-lg" style={{ background: 'hsl(var(--muted))', border: '1px solid rgba(244,63,94,0.15)' }}>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/80 mb-3">Adversarial Analysis</p>
                        <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{agentResponse.said}{agentResponse.matters ? `\n\n${agentResponse.matters}` : ""}{agentResponse.nextMove ? `\n\n${agentResponse.nextMove}` : ""}</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <button onClick={clearAndReset} className="text-xs text-muted-foreground hover:text-foreground transition-colors px-3 py-2 rounded-lg hover:bg-muted/50" data-testid="button-clear-thinking">
                          New Session
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <textarea
                        ref={textareaRef}
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        placeholder="Paste your thesis, argument, or assumption here..."
                        className="w-full min-h-[200px] sm:min-h-[280px] p-4 sm:p-6 rounded-lg text-sm text-foreground leading-relaxed resize-none focus:outline-none transition-all placeholder:text-muted-foreground/60"
                        style={{ background: 'hsl(var(--muted))', border: `1px solid ${messageInput.length > 0 ? 'rgba(244,63,94,0.25)' : 'hsl(var(--border))'}` }}
                        data-testid="textarea-thinking-input"
                      />
                      <div className="flex items-center justify-between">
                        <button
                          onClick={() => {
                            if (!messageInput.trim() || thinkWithMe.isPending) return;
                            setIsAnalyzing(true);
                            setAgentResponse(null);
                            thinkWithMe.mutate({ content: messageInput, mode: "journal" as EntryType });
                          }}
                          disabled={!messageInput.trim() || isAnalyzing}
                          className="px-5 py-3 rounded-lg text-sm font-bold transition-all disabled:opacity-30"
                          style={{ background: 'rgba(244,63,94,0.1)', color: '#f43f5e', border: '1px solid rgba(244,63,94,0.2)' }}
                          data-testid="button-attack-reasoning"
                        >
                          {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : "Attack My Reasoning"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : null}
            </div>
            ) : (
            <div className="flex flex-col max-w-3xl w-full mx-auto px-4 sm:px-8">
              <div className="flex-1 flex flex-col justify-center py-6 sm:py-12 min-h-[60vh] sm:min-h-[70vh]">
                <div className="mb-6 p-4 sm:p-6 rounded-lg" style={{ background: currentZoneConfig.bgColor, border: `1px solid ${currentZoneConfig.borderColor}` }}>
                  <div className="flex items-center gap-3 mb-2">
                    {(() => { const Icon = currentZoneConfig.icon; return <Icon className="w-5 h-5" style={{ color: currentZoneConfig.color }} />; })()}
                    <div>
                      <h3 className="text-base font-black text-foreground">{currentZoneConfig.name}</h3>
                      <p className="text-[10px] font-mono" style={{ color: currentZoneConfig.color }}>{currentZoneConfig.price} USDC per deployment</p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{currentZoneConfig.description}</p>
                </div>

                {auditResult ? (
                  <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-14 rounded-lg flex items-center justify-center" style={{ background: `${getRiskColor(auditResult.risk_score)}15` }}>
                          <span className="text-2xl font-black font-mono" style={{ color: getRiskColor(auditResult.risk_score) }}>{auditResult.risk_score}</span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded" style={{ background: `${getRiskColor(auditResult.risk_score)}15`, color: getRiskColor(auditResult.risk_score) }}>
                              {getRiskLabel(auditResult.risk_score)} RISK
                            </span>
                            {(auditResult as any).verdict && (
                              <span
                                className="text-[10px] font-black uppercase tracking-[0.2em] px-2.5 py-0.5 rounded"
                                style={{
                                  background: (auditResult as any).verdict === 'PASS' ? 'rgba(52,211,153,0.15)' : 'rgba(239,68,68,0.15)',
                                  color: (auditResult as any).verdict === 'PASS' ? '#34d399' : '#ef4444',
                                  border: `1px solid ${(auditResult as any).verdict === 'PASS' ? 'rgba(52,211,153,0.3)' : 'rgba(239,68,68,0.3)'}`,
                                }}
                                data-testid="badge-verdict"
                              >
                                {(auditResult as any).verdict}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1 font-mono">{auditResult.audit_id}</p>
                        </div>
                      </div>
                      <button onClick={clearAuditResult} className="text-xs text-muted-foreground hover:text-foreground transition-colors px-3 py-2 rounded-lg hover:bg-muted/50" data-testid="button-new-audit">
                        New Audit
                      </button>
                    </div>

                    {intelligenceBrief && (
                      <div className="rounded-lg overflow-hidden" style={{ background: 'hsl(var(--muted))', border: '1px solid hsl(var(--border))' }} data-testid="panel-intelligence-brief">
                        <button
                          onClick={() => setBriefExpanded(!briefExpanded)}
                          className="w-full flex items-center justify-between p-4 text-left transition-colors hover:bg-muted/30"
                          data-testid="button-toggle-intelligence-brief"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-md flex items-center justify-center" style={{ background: 'rgba(243,126,32,0.1)' }}>
                              <Brain className="w-4 h-4" style={{ color: '#F37E20' }} />
                            </div>
                            <div>
                              <p className="text-xs font-black text-foreground tracking-tight">Founder Intelligence Brief</p>
                              <p className="text-[10px] text-muted-foreground">{intelligenceBrief.activeSignals} active signal{intelligenceBrief.activeSignals !== 1 ? 's' : ''} detected</p>
                            </div>
                          </div>
                          <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${briefExpanded ? 'rotate-180' : ''}`} />
                        </button>
                        {briefExpanded && (
                          <div className="px-4 pb-4 space-y-3">
                            <div className="p-3 rounded-lg" style={{ background: 'hsl(var(--muted) / 0.3)', border: '1px solid hsl(var(--border))' }} data-testid="signal-bias-pattern">
                              <div className="flex items-center gap-2 mb-1.5">
                                <Activity className="w-3.5 h-3.5" style={{ color: intelligenceBrief.biasPattern.dominantBias ? '#ef4444' : '#34d399' }} />
                                <span className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground">Bias Pattern Memory</span>
                              </div>
                              <p className="text-xs text-muted-foreground leading-relaxed">{intelligenceBrief.biasPattern.summary}</p>
                              {intelligenceBrief.biasPattern.dominantBias && (
                                <div className="mt-2 flex items-center gap-2">
                                  <span className="text-[10px] px-2 py-0.5 rounded font-bold" style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444' }}>
                                    {intelligenceBrief.biasPattern.dominantBias.replace(/_/g, ' ')}
                                  </span>
                                  <span className="text-[10px] text-muted-foreground/80">
                                    Risk trend: {intelligenceBrief.biasPattern.riskTrend === 'increasing' ? '↑ increasing' : intelligenceBrief.biasPattern.riskTrend === 'decreasing' ? '↓ decreasing' : intelligenceBrief.biasPattern.riskTrend === 'stable' ? '→ stable' : '—'}
                                  </span>
                                </div>
                              )}
                            </div>

                            <div className="p-3 rounded-lg" style={{ background: 'hsl(var(--muted) / 0.3)', border: '1px solid hsl(var(--border))' }} data-testid="signal-narrative-drift">
                              <div className="flex items-center gap-2 mb-1.5">
                                <Compass className="w-3.5 h-3.5" style={{ color: intelligenceBrief.narrativeDrift.driftDetected ? '#f59e0b' : '#34d399' }} />
                                <span className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground">Narrative Drift Detection</span>
                              </div>
                              <p className="text-xs text-muted-foreground leading-relaxed">{intelligenceBrief.narrativeDrift.summary}</p>
                              {intelligenceBrief.narrativeDrift.contradictions.length > 0 && (
                                <div className="mt-2 space-y-1">
                                  {intelligenceBrief.narrativeDrift.contradictions.map((c, i) => (
                                    <p key={i} className="text-[11px] leading-relaxed pl-3" style={{ color: '#f59e0b', borderLeft: '2px solid rgba(245,158,11,0.3)' }}>{c}</p>
                                  ))}
                                </div>
                              )}
                            </div>

                            <div className="p-3 rounded-lg" style={{ background: 'hsl(var(--muted) / 0.3)', border: '1px solid hsl(var(--border))' }} data-testid="signal-assumption-kill">
                              <div className="flex items-center gap-2 mb-1.5">
                                <AlertCircle className="w-3.5 h-3.5" style={{ color: intelligenceBrief.assumptionKill.criticalAssumptions.length > 0 ? '#ef4444' : '#6b7280' }} />
                                <span className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground">Assumption Kill Switch</span>
                              </div>
                              <p className="text-xs text-muted-foreground leading-relaxed">{intelligenceBrief.assumptionKill.summary}</p>
                              {intelligenceBrief.assumptionKill.criticalAssumptions.length > 0 && (
                                <div className="mt-2 space-y-1.5">
                                  {intelligenceBrief.assumptionKill.criticalAssumptions.map((a, i) => (
                                    <p key={i} className="text-[11px] text-muted-foreground leading-relaxed pl-3" style={{ borderLeft: '2px solid rgba(239,68,68,0.3)' }}>{a}</p>
                                  ))}
                                </div>
                              )}
                            </div>

                            <div className="p-3 rounded-lg" style={{ background: 'hsl(var(--muted) / 0.3)', border: '1px solid hsl(var(--border))' }} data-testid="signal-volatility-sim">
                              <div className="flex items-center gap-2 mb-1.5">
                                <Zap className="w-3.5 h-3.5" style={{ color: '#2dd4bf' }} />
                                <span className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground">Volatility Simulation</span>
                              </div>
                              <p className="text-xs text-muted-foreground leading-relaxed">{intelligenceBrief.volatilitySim.summary}</p>
                              {intelligenceBrief.volatilitySim.stressQuestions.length > 0 && (
                                <div className="mt-2 space-y-1.5">
                                  {intelligenceBrief.volatilitySim.stressQuestions.map((q, i) => (
                                    <p key={i} className="text-[11px] italic leading-relaxed pl-3" style={{ color: '#2dd4bf', borderLeft: '2px solid rgba(45,212,191,0.3)' }}>"{q}"</p>
                                  ))}
                                </div>
                              )}
                            </div>

                            <div className="p-3 rounded-lg" style={{ background: 'hsl(var(--muted) / 0.3)', border: '1px solid hsl(var(--border))' }} data-testid="signal-emotional-spike">
                              <div className="flex items-center gap-2 mb-1.5">
                                <Activity className="w-3.5 h-3.5" style={{ color: intelligenceBrief.emotionalSpike.spikeDetected ? '#f59e0b' : '#34d399' }} />
                                <span className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground">Emotional Spike Flag</span>
                              </div>
                              <p className="text-xs text-muted-foreground leading-relaxed">{intelligenceBrief.emotionalSpike.summary}</p>
                              {intelligenceBrief.emotionalSpike.flaggedPhrases.length > 0 && (
                                <div className="mt-2 flex flex-wrap gap-1.5">
                                  {intelligenceBrief.emotionalSpike.flaggedPhrases.map((p, i) => (
                                    <span key={i} className="text-[10px] px-2 py-0.5 rounded font-mono" style={{ background: 'rgba(245,158,11,0.1)', color: '#f59e0b' }}>"{p}"</span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {(auditResult as any).flags && (auditResult as any).flags.length > 0 && (
                      <div className="p-4 rounded-lg" style={{ background: 'hsl(var(--muted))', border: '1px solid hsl(var(--border))' }} data-testid="panel-logic-flags">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/80 mb-3">Logic Failure Codes ({(auditResult as any).flags.length})</p>
                        <div className="space-y-2">
                          {(auditResult as any).flags.map((flag: any, idx: number) => {
                            const severityColor = flag.severity === 'CRITICAL' ? '#ef4444' : flag.severity === 'HIGH' ? '#f97316' : flag.severity === 'MEDIUM' ? '#f59e0b' : '#6b7280';
                            return (
                              <div key={idx} className="p-3 rounded-lg" style={{ background: 'hsl(var(--muted) / 0.3)', border: `1px solid ${severityColor}20` }} data-testid={`flag-${flag.code}`}>
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-[10px] font-mono font-black px-1.5 py-0.5 rounded" style={{ background: `${severityColor}15`, color: severityColor }}>{flag.code}</span>
                                  <span className="text-[9px] font-black uppercase tracking-[0.15em] px-1.5 py-0.5 rounded" style={{ background: `${severityColor}10`, color: severityColor }}>{flag.severity}</span>
                                </div>
                                <p className="text-xs text-muted-foreground leading-relaxed mt-1">{flag.message}</p>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    <div className="p-4 rounded-lg" style={{ background: 'hsl(var(--muted))', border: '1px solid hsl(var(--border))' }}>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/80 mb-2">Primary Bias</p>
                      <span className="px-3 py-1.5 rounded-lg text-sm font-bold" style={{ background: auditResult.primary_bias_detected !== 'None' ? 'rgba(239,68,68,0.1)' : 'rgba(52,211,153,0.1)', color: auditResult.primary_bias_detected !== 'None' ? '#ef4444' : '#34d399' }}>
                        {auditResult.primary_bias_detected.replace(/_/g, ' ')}
                      </span>
                    </div>

                    {auditResult.logic_flaws.length > 0 && (
                      <div className="p-4 rounded-lg" style={{ background: 'hsl(var(--muted))', border: '1px solid hsl(var(--border))' }}>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/80 mb-3">Logic Flaws ({auditResult.logic_flaws.length})</p>
                        <div className="space-y-3">
                          {auditResult.logic_flaws.map((flaw, idx) => (
                            <div key={idx} className="p-3 rounded-lg" style={{ background: 'hsl(var(--muted) / 0.3)', border: '1px solid hsl(var(--border))' }}>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-[10px] font-black uppercase" style={{ color: flaw.severity === 'critical' ? '#ef4444' : flaw.severity === 'medium' ? '#f59e0b' : '#6b7280' }}>{flaw.severity}</span>
                                <span className="text-xs font-bold text-foreground">{flaw.flaw_type}</span>
                              </div>
                              <p className="text-xs text-muted-foreground leading-relaxed">{flaw.explanation}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {auditResult.structural_recommendations.length > 0 && (
                      <div className="p-4 rounded-lg" style={{ background: 'hsl(var(--muted))', border: '1px solid hsl(var(--border))' }}>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/80 mb-3">Recommendations</p>
                        <ul className="space-y-2">
                          {auditResult.structural_recommendations.map((rec, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ background: currentZoneConfig.color }}></span>
                              <p className="text-sm text-muted-foreground leading-relaxed">{rec}</p>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="p-4 rounded-lg" style={{ background: 'hsl(var(--muted))', border: '1px solid hsl(var(--border))' }}>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/80 mb-1">Cryptographic Hash</p>
                      <p className="text-[11px] font-mono text-muted-foreground break-all">{auditResult.cryptographic_hash}</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="relative">
                      <textarea
                        value={auditPayload}
                        onChange={(e) => setAuditPayload(e.target.value.slice(0, currentZoneConfig.maxChars))}
                        placeholder={currentZoneConfig.placeholder}
                        className="w-full min-h-[200px] sm:min-h-[280px] p-4 sm:p-6 rounded-lg text-sm text-foreground font-mono leading-relaxed resize-none focus:outline-none transition-all placeholder:text-muted-foreground/60"
                        style={{ background: 'hsl(var(--muted))', border: `1px solid ${auditPayload.length > 0 ? currentZoneConfig.borderColor : 'hsl(var(--border))'}` }}
                        disabled={isDeploying}
                        data-testid="textarea-audit-payload"
                      />
                      <div className="absolute bottom-3 right-4 flex items-center gap-3">
                        <span className="text-[10px] font-mono text-muted-foreground/80">{auditPayload.length}/{currentZoneConfig.maxChars}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] text-muted-foreground/80">{auditPayload.length >= 20 ? 'Ready to deploy' : 'Min 20 characters'}</p>
                      <button
                        onClick={handleDeploy}
                        disabled={isDeploying || auditPayload.trim().length < 20}
                        className="px-6 py-3 rounded-lg text-sm font-black tracking-tight transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                        style={{ background: currentZoneConfig.bgColor, color: currentZoneConfig.color, border: `1px solid ${currentZoneConfig.borderColor}` }}
                        data-testid="button-deploy"
                      >
                        {isDeploying ? (
                          <span className="flex items-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Deploying...
                          </span>
                        ) : (
                          `Deploy to ${currentZoneConfig.name} (${currentZoneConfig.price} USDC)`
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
            )}
          </div>
        </main>

      </div>
    </TooltipProvider>

    <QuickSearch
      open={quickSearchModalOpen}
      onClose={() => setQuickSearchModalOpen(false)}
      onSelectEntry={(entry) => {
        setMessageInput(entry.text);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }}
    />
    <AuditTutorial isOpen={showTutorial} onComplete={closeTutorial} />
    </>
  );
}
