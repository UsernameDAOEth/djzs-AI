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
  Newspaper,
  Home,
  Lock,
  Bot,
  Pin,
  Download,
  Search,
  FileText,
  Sparkles,
  Receipt,
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
  RefreshCw,
  Compass,
  ArrowUpRight,
  FolderOpen,
  FolderPlus,
  Trash2,
  Check,
  AlertCircle,
  HelpCircle,
  Plus,
  Video,
  Mic,
  MicOff,
  Headphones,
  Brain,
  Palette
} from "lucide-react";
import { SiX, SiGithub } from "react-icons/si";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import type { Member, ChatMessage, StoredMessage, JournalAnalysis, ResearchAnalysis, JournalEntry, PinnedMemory } from "@shared/schema";
import { format } from "date-fns";
import { useLiveQuery } from "dexie-react-hooks";
import { VideoUpload, VideoPlayer } from "@/components/video-diary";
import { MusicPanel } from "@/components/music-panel";
import { QuickSearch } from "@/components/quick-search";
import { TradeArtifactZone } from "@/components/trade-artifact-composer";
import { DecisionLogZone } from "@/components/decision-log-zone";
import { ContentPipelineZone } from "@/components/content-pipeline-zone";
import {
  exportVaultAsZip,
  importVaultFromZip,
  importVaultFromJson,
  requestPersistentStorage,
  checkPersistentStorage,
  getLastBackupDate,
} from "@/lib/vault-backup";
import { 
  vault, 
  saveEntry, 
  saveInsight, 
  updateEntryVideo,
  getActiveMemories, 
  getMemoriesForAgent, 
  pinMemory as pinLocalMemory, 
  forgetMemory,
  getEntryStats,
  getRecentEntriesForContext,
  createDossier,
  updateDossier,
  deleteDossier,
  getActiveDossiers,
  getDossier,
  addResearchQuery,
  getQueriesForDossier,
  addClaim,
  updateClaim,
  deleteClaim,
  getClaimsForDossier,
  searchJournalEntriesForTopic,
  exportVault,
  type MemoryPin,
  type MusicTrack,
  type EntryType,
  type EntryStats,
  type ResearchDossier,
  type ResearchQuery,
  type ResearchClaim,
  type ClaimStatus,
  type TrustLevel
} from "@/lib/vault";

interface JournalAnalysisResult {
  entry: JournalEntry;
  analysis: JournalAnalysis;
  zone: "journal";
}

interface ResearchAnalysisResult {
  entry: JournalEntry;
  analysis: ResearchAnalysis;
  zone: "research";
}

type AnalysisResult = JournalAnalysisResult | ResearchAnalysisResult;

const V1_ZONES = [
  { id: "journal", name: "Journal", icon: PenLine, description: "Personal reflection", purpose: "Your private space to think, reflect, and extract insight." },
  { id: "research", name: "Research", icon: Search, description: "Quick research", purpose: "Search and synthesize information related to your thinking." },
  { id: "trade", name: "Trade", icon: Receipt, description: "Trade artifacts", purpose: "Build thesis, stress test, sign & track trade artifacts." },
  { id: "decisions", name: "Decisions", icon: Brain, description: "Decision log", purpose: "Track high-stakes decisions, stress test reasoning with AI." },
  { id: "content", name: "Content", icon: Palette, description: "Content pipeline", purpose: "Compose, refine, and track content ideas with AI." },
];

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

const RESEARCH_PROMPTS = [
  "What are you trying to figure out?",
  "What evidence would change your mind?",
  "What's the gap in your understanding?",
  "What assumption haven't you tested?",
  "What would disprove your current view?",
  "What's the question behind the question?",
  "What would an expert challenge here?",
  "What's missing from the picture?",
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

interface ResearchResult {
  query: string;
  mode: "web" | "explain" | "brave";
  keyTakeaways: string[];
  whatToCheckNext: string[];
  sources?: { title: string; url: string; snippet: string }[];
  confidence: string;
  synthesisMarkdown: string;
  cached?: boolean;
}

export default function Chat() {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { toast } = useToast();
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
      if (zoneParam === "research") return "research";
      return "journal";
    }
    return "journal";
  });
  const [messageInput, setMessageInput] = useState("");
  const [adminPanelOpen, setAdminPanelOpen] = useState(false);
  const [memoryDrawerOpen, setMemoryDrawerOpen] = useState(false);
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
  const [researchResult, setResearchResult] = useState<ResearchResult | null>(null);
  const [webModeEnabled, setWebModeEnabled] = useState(true);
  const [braveSearchEnabled, setBraveSearchEnabled] = useState(false);
  const [braveSearchAvailable, setBraveSearchAvailable] = useState(false);
  const [storagePersisted, setStoragePersisted] = useState<boolean | null>(null);
  const [lastBackupDate, setLastBackupDateState] = useState<string | null>(getLastBackupDate());
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const importFileRef = useRef<HTMLInputElement>(null);
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

  useEffect(() => {
    checkPersistentStorage().then(setStoragePersisted);
  }, []);

  useEffect(() => {
    fetch('/api/health')
      .then(res => res.json())
      .then(data => {
        if (data.capabilities?.braveSearch) {
          setBraveSearchAvailable(true);
        }
      })
      .catch(() => {});
  }, []);
  
  // Dossier state for Research zone
  const [activeDossierId, setActiveDossierId] = useState<number | null>(null);
  const [dossierName, setDossierName] = useState("");
  const [showNewDossierInput, setShowNewDossierInput] = useState(false);
  const [dossierDropdownOpen, setDossierDropdownOpen] = useState(false);
  const [editingClaimId, setEditingClaimId] = useState<number | null>(null);
  const [claimSourceNote, setClaimSourceNote] = useState("");
  const [claimTrustLevel, setClaimTrustLevel] = useState<TrustLevel>("unknown");
  const [relatedJournalEntries, setRelatedJournalEntries] = useState<Array<{ id?: number; text: string; createdAt: Date }>>([]);
  const [showVideoUpload, setShowVideoUpload] = useState(false);
  const [showMusicPanel, setShowMusicPanel] = useState(false);
  const [pendingVideoAssetId, setPendingVideoAssetId] = useState<string | null>(null);
  const [pendingVideoPlaybackId, setPendingVideoPlaybackId] = useState<string | null>(null);

  // Local-first: Query memories from IndexedDB
  const localMemories = useLiveQuery(() => getActiveMemories(10), []);
  
  // Local-first: Query dossiers from IndexedDB
  const dossiers = useLiveQuery(() => getActiveDossiers(), []);
  
  // Local-first: Query claims for active dossier
  const dossierClaims = useLiveQuery(
    () => activeDossierId ? getClaimsForDossier(activeDossierId) : Promise.resolve([]),
    [activeDossierId]
  );
  
  // Local-first: Query queries for active dossier
  const dossierQueries = useLiveQuery(
    () => activeDossierId ? getQueriesForDossier(activeDossierId) : Promise.resolve([]),
    [activeDossierId]
  );
  
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
    if (selectedZone === "journal" || selectedZone === "research") {
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

  const currentPrompts = selectedZone === "research" 
    ? RESEARCH_PROMPTS 
    : JOURNAL_PROMPTS;

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPromptIndex((prev) => (prev + 1) % currentPrompts.length);
    }, 10000);
    return () => clearInterval(interval);
  }, [currentPrompts.length]);

  useEffect(() => {
    setCurrentPromptIndex(0);
    setAgentResponse(null);
    setResearchResult(null);
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

  // Lock body scroll when memory drawer is open on mobile
  useEffect(() => {
    if (memoryDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [memoryDrawerOpen]);

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

  // Fetch pinned memories
  const { data: pinnedMemories = [] } = useQuery<PinnedMemory[]>({
    queryKey: ["/api/memories", address],
    queryFn: async () => {
      const res = await fetch(`/api/memories/${address}`);
      if (!res.ok) throw new Error("Failed to fetch memories");
      return res.json();
    },
    enabled: !!address,
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
      
      // 3. Save entry locally (with optional video)
      const entryId = await saveEntry(mode, content, [], pendingVideoAssetId || undefined, pendingVideoPlaybackId || undefined);
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

  // Research Zone search mutation
  const searchResearch = useMutation({
    mutationFn: async (query: string) => {
      const params = new URLSearchParams({
        q: query,
        web: String(webModeEnabled),
        brave: String(braveSearchEnabled),
      });
      const fetchHeaders: Record<string, string> = {};
      const veniceKey = getVeniceApiKey();
      if (veniceKey) fetchHeaders["x-venice-api-key"] = veniceKey;
      const res = await fetch(`/api/research/search?${params}`, { headers: fetchHeaders });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Research failed");
      }
      return res.json() as Promise<ResearchResult>;
    },
    onSuccess: async (data) => {
      setResearchResult(data);
      setIsAnalyzing(false);
      
      // Persist query to active dossier if one is selected
      if (activeDossierId) {
        try {
          await addResearchQuery(
            activeDossierId,
            data.query,
            data.synthesisMarkdown,
            data.keyTakeaways,
            data.whatToCheckNext,
            data.mode === 'web'
          );
        } catch (err) {
          console.error("Failed to save research query to dossier:", err);
        }
      }
      
      // Search for related journal entries based on key words from the query
      const queryWords = data.query.toLowerCase().split(/\s+/).filter(w => w.length > 3);
      if (queryWords.length > 0) {
        const related = await searchJournalEntriesForTopic(queryWords, 3);
        setRelatedJournalEntries(related);
      } else {
        setRelatedJournalEntries([]);
      }
    },
    onError: (error) => {
      setIsAnalyzing(false);
      toast({
        title: "Research failed",
        description: error instanceof Error ? error.message : "Could not complete search",
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

  const handleForgetMemory = async (id: number) => {
    try {
      await forgetMemory(id);
      toast({
        title: "Memory forgotten",
        description: "This will no longer be used for context.",
      });
    } catch (err) {
      toast({
        title: "Could not forget memory",
        description: "Something went wrong. Try again.",
        variant: "destructive",
      });
    }
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
    
    if (selectedZone === 'journal' || selectedZone === 'research') {
      await saveEntry(selectedZone as EntryType, messageInput, [], pendingVideoAssetId || undefined, pendingVideoPlaybackId || undefined);
    }
    
    const message: ChatMessage = {
      type: "text",
      content: messageInput,
      createdAt: new Date().toISOString(),
      authorAddress: address,
    };
    sendMessage.mutate(message);
    setMessageInput("");
    setPendingVideoAssetId(null);
    setPendingVideoPlaybackId(null);
    setShowVideoUpload(false);
  };

  const handleAnalyze = () => {
    if (!messageInput.trim()) return;
    
    if (selectedZone === 'research') {
      // Research zone: use search API (separate from journal mutation state)
      if (searchResearch.isPending) return;
      setIsAnalyzing(true);
      setAgentResponse(null);
      setResearchResult(null);
      searchResearch.mutate(messageInput);
    } else {
      // Journal zone: use thinking partner
      if (thinkWithMe.isPending) return;
      setIsAnalyzing(true);
      setAgentResponse(null);
      setResearchResult(null);
      if (textareaRef.current) {
        setFrozenHeight(textareaRef.current.scrollHeight);
      }
      thinkWithMe.mutate({ content: messageInput, mode: selectedZone as EntryType });
    }
  };

  const clearAndReset = () => {
    setMessageInput("");
    setAgentResponse(null);
    setResearchResult(null);
    setLatestAnalysis(null);
    setFrozenHeight(null);
    setRelatedJournalEntries([]);
    setShowVideoUpload(false);
    setPendingVideoAssetId(null);
    setPendingVideoPlaybackId(null);
    textareaRef.current?.focus();
  };
  
  // Dossier management handlers
  const handleCreateDossier = async () => {
    if (!dossierName.trim()) return;
    try {
      const id = await createDossier(dossierName.trim());
      setActiveDossierId(id);
      setDossierName("");
      setShowNewDossierInput(false);
      toast({ title: "Dossier created", description: `"${dossierName.trim()}" is now active` });
    } catch (err) {
      toast({ title: "Error", description: "Failed to create dossier", variant: "destructive" });
    }
  };
  
  const handleDeleteDossier = async (id: number) => {
    try {
      await deleteDossier(id);
      if (activeDossierId === id) {
        setActiveDossierId(null);
      }
      toast({ title: "Dossier deleted" });
    } catch (err) {
      toast({ title: "Error", description: "Failed to delete dossier", variant: "destructive" });
    }
  };
  
  const handleSelectDossier = (id: number | null) => {
    setActiveDossierId(id);
    setDossierDropdownOpen(false);
  };
  
  const handleSaveClaimToDossier = async (claim: string, queryId?: number, openForEditing: boolean = false) => {
    if (!activeDossierId) {
      toast({ title: "Select a dossier first", description: "Create or select a dossier to save claims", variant: "destructive" });
      return;
    }
    try {
      const newClaimId = await addClaim(activeDossierId, claim, 'to_check', 'unknown', queryId);
      toast({ title: "Claim saved", description: "Added to your dossier for tracking" });
      
      // Optionally open the claim for editing to allow linking
      if (openForEditing) {
        setEditingClaimId(newClaimId);
        setClaimSourceNote("");
        setClaimTrustLevel("unknown");
      }
    } catch (err) {
      toast({ title: "Error", description: "Failed to save claim", variant: "destructive" });
    }
  };
  
  const handleUpdateClaimStatus = async (claimId: number, status: ClaimStatus) => {
    try {
      await updateClaim(claimId, { status });
    } catch (err) {
      toast({ title: "Error", description: "Failed to update claim", variant: "destructive" });
    }
  };
  
  const handleDeleteClaim = async (claimId: number) => {
    try {
      await deleteClaim(claimId);
    } catch (err) {
      toast({ title: "Error", description: "Failed to delete claim", variant: "destructive" });
    }
  };
  
  const handleStartEditClaim = (claim: ResearchClaim) => {
    setEditingClaimId(claim.id!);
    setClaimSourceNote(claim.sourceNote || "");
    setClaimTrustLevel(claim.trustLevel || "unknown");
  };
  
  const handleSaveClaimEdit = async () => {
    if (!editingClaimId) return;
    try {
      await updateClaim(editingClaimId, { 
        sourceNote: claimSourceNote || undefined,
        trustLevel: claimTrustLevel
      });
      setEditingClaimId(null);
      setClaimSourceNote("");
      setClaimTrustLevel("unknown");
      toast({ title: "Claim updated" });
    } catch (err) {
      toast({ title: "Error", description: "Failed to update claim", variant: "destructive" });
    }
  };
  
  const handleLinkClaimToJournalEntry = async (claimId: number, journalEntryId: number) => {
    try {
      await updateClaim(claimId, { linkedJournalEntryId: journalEntryId });
      toast({ title: "Linked!", description: "Claim connected to your journal entry" });
    } catch (err) {
      toast({ title: "Error", description: "Failed to link", variant: "destructive" });
    }
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
      <div className="min-h-screen flex items-center justify-center p-6" style={{ background: '#2A2E3F' }}>
        <div className="text-center max-w-sm">
          <div className="w-20 h-20 rounded-3xl bg-orange-600/10 flex items-center justify-center mx-auto mb-8 border border-orange-500/20">
            <Shield className="w-10 h-10 text-orange-400" />
          </div>
          <h2 className="text-3xl font-black text-white mb-3 tracking-tight">Access Locked</h2>
          <p className="text-gray-400 mb-8 leading-relaxed">DJZS requires a cryptographic identity to ensure absolute privacy for your Journal.</p>
          <div className="flex justify-center">
            <ConnectButton />
          </div>
        </div>
      </div>
    );
  }

  if (memberLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ background: '#2A2E3F' }}>
        <img src="/logo.png" alt="DJZS" className="w-16 h-16 rounded-2xl logo-pulse" style={{ filter: 'drop-shadow(0 0 8px rgba(243,126,32,0.3))' }} data-testid="img-logo-loading" />
        <p className="text-sm font-medium" style={{ color: '#7a7b90' }}>Loading your vault...</p>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ background: '#2A2E3F' }}>
        <div className="text-center max-w-md">
          <h2 className="text-3xl font-black text-white mb-4 tracking-tight">Initialize Your Zone</h2>
          <p className="mb-8" style={{ color: '#9a9bb0' }}>Ready to start extracting insight from your daily thinking?</p>
          <Button
            onClick={() => registerMember.mutate()}
            disabled={registerMember.isPending}
            className="h-14 px-10 rounded-2xl font-bold text-lg text-white border-0 hover:opacity-90"
            style={{ background: '#F37E20', boxShadow: '0 8px 30px rgba(243,126,32,0.25)' }}
          >
            {registerMember.isPending && <Loader2 className="w-5 h-5 mr-3 animate-spin" />}
            Start My First Entry
          </Button>
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
      <div className="h-screen text-gray-300 flex overflow-hidden font-sans selection:bg-teal-500/30" style={{ background: '#0F1115' }}>
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
          transition-all duration-300
          ${isFocused && !mobileSidebarOpen ? 'md:opacity-40' : 'opacity-100'}
        `} style={{ background: '#0D0F13', borderColor: 'rgba(255,255,255,0.04)' }}>
          <div className="p-8 pb-4 flex items-center justify-between">
            <Link href="/">
              <button className="flex items-center gap-2 text-sm font-black text-white tracking-[0.2em] uppercase opacity-40 hover:opacity-100 hover:text-orange-400 transition-all group">
                <img src="/logo.png" alt="DJZS" className="w-6 h-6 rounded transition-transform group-hover:-translate-x-1" style={{ filter: 'drop-shadow(0 0 2px rgba(0,0,0,0.3))' }} data-testid="img-logo-sidebar" />
                <span>DJZS v1</span>
              </button>
            </Link>
            {/* Close button on mobile */}
            <button 
              onClick={() => setMobileSidebarOpen(false)}
              className="md:hidden p-2 text-gray-500 hover:text-white"
              data-testid="button-close-sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="flex-1 px-4 space-y-1">
            {V1_ZONES.map((zone) => {
              const Icon = zone.icon;
              const isActive = selectedZone === zone.id;
              return (
                <button
                  key={zone.id}
                  onClick={() => {
                    setSelectedZone(zone.id);
                    setMobileSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all group ${
                    isActive 
                      ? "bg-white/[0.03] text-white" 
                      : "text-gray-500 hover:text-gray-300 hover:bg-white/[0.01]"
                  }`}
                >
                  <Icon className={`w-5 h-5 transition-colors ${isActive ? "text-orange-400" : "text-gray-600 group-hover:text-gray-400"}`} />
                  <span className="text-sm font-bold tracking-tight">{zone.name}</span>
                  {isActive && <div className="ml-auto w-1 h-1 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(243,126,32,0.5)]"></div>}
                </button>
              );
            })}

            <button
              onClick={() => setQuickSearchModalOpen(true)}
              className="w-full flex items-center gap-4 px-4 py-3 mt-3 rounded-xl text-gray-500 hover:text-gray-300 hover:bg-white/[0.03] transition-all group"
              data-testid="button-sidebar-quick-search"
            >
              <Search className="w-5 h-5 text-gray-600 group-hover:text-gray-400 transition-colors" />
              <span className="text-sm font-bold tracking-tight">Search</span>
              <kbd className="ml-auto px-1.5 py-0.5 rounded text-[10px] font-mono text-gray-600 border border-white/[0.08] bg-white/[0.03] group-hover:border-white/[0.12]">⌘K</kbd>
            </button>
          </nav>

          <div className="p-4 mt-auto">
            <div className="p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
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
                  <p className="text-xs font-bold text-white truncate">{primaryProfile?.displayName || ensName || formatAddress(address || "")}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <div className="w-1 h-1 rounded-full bg-green-500 shadow-[0_0_4px_rgba(34,197,94,0.5)]"></div>
                    <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest">Connected</span>
                  </div>
                </div>
              </div>

              {primaryProfile?.description && (
                <p className="text-[10px] text-gray-500 leading-relaxed mb-3 line-clamp-2">{primaryProfile.description}</p>
              )}

              {totalFollowers > 0 && (
                <div className="flex items-center gap-1 mb-3">
                  <Users className="w-3 h-3 text-gray-600" />
                  <span className="text-[9px] font-bold text-gray-500">{totalFollowers.toLocaleString()} followers</span>
                </div>
              )}

              {Object.keys(profileLinks).length > 0 && (
                <div className="flex items-center gap-2 pt-2 border-t border-white/[0.03]">
                  {profileLinks.twitter && (
                    <a 
                      href={profileLinks.twitter.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg bg-white/[0.02] hover:bg-white/[0.05] text-gray-500 hover:text-white transition-colors"
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
                      className="p-1.5 rounded-lg bg-white/[0.02] hover:bg-white/[0.05] text-gray-500 hover:text-white transition-colors"
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
                      className="p-1.5 rounded-lg bg-white/[0.02] hover:bg-white/[0.05] text-gray-500 hover:text-orange-400 transition-colors"
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
                      className="p-1.5 rounded-lg bg-white/[0.02] hover:bg-white/[0.05] text-gray-500 hover:text-white transition-colors"
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
                className="mt-3 w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-white/[0.02] hover:bg-white/[0.05] text-gray-500 hover:text-white transition-colors border border-white/[0.03]"
                data-testid="button-settings"
              >
                <Settings className="w-3 h-3" />
                <span className="text-[9px] font-black uppercase tracking-widest">Settings</span>
              </button>

              {settingsOpen && (
                <div className="mt-2 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-3" data-testid="panel-settings">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block mb-1">Venice API Key (BYOK)</label>
                    <p className="text-[9px] text-gray-600 mb-2">Use your own Venice key instead of the shared one. Stored locally in your browser.</p>
                    <input
                      data-testid="input-venice-api-key"
                      type="password"
                      className="w-full px-2.5 py-1.5 bg-white/[0.04] border border-white/[0.08] rounded-lg text-[11px] text-white placeholder:text-gray-600 outline-none focus:border-teal-500/50"
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

                  <div className="border-t border-white/[0.05] pt-3">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block mb-1">Vault Encryption</label>
                    <p className="text-[9px] text-gray-600 mb-2">
                      {vaultEncrypted
                        ? "Your vault is passphrase-protected. Lock it when you step away."
                        : "Set a passphrase to encrypt your local vault data."}
                    </p>
                    {!vaultEncrypted ? (
                      <>
                        <input
                          data-testid="input-vault-passphrase"
                          type="password"
                          className="w-full px-2.5 py-1.5 bg-white/[0.04] border border-white/[0.08] rounded-lg text-[11px] text-white placeholder:text-gray-600 outline-none focus:border-purple-500/50"
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
                          className="w-full px-2.5 py-1.5 bg-white/[0.04] border border-white/[0.08] rounded-lg text-[11px] text-white placeholder:text-gray-600 outline-none focus:border-green-500/50"
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
                className="mt-2 w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-white/[0.02] hover:bg-red-500/10 text-gray-500 hover:text-red-400 transition-colors border border-white/[0.03] hover:border-red-500/20"
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
          <header className="h-14 sm:h-16 md:h-20 flex items-center justify-between px-3 sm:px-4 md:px-10 backdrop-blur-xl border-b sticky top-0 z-30" style={{ background: 'rgba(15,17,21,0.85)', borderColor: 'rgba(255,255,255,0.04)' }}>
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Hamburger menu for mobile */}
              <button 
                onClick={() => setMobileSidebarOpen(true)}
                className="md:hidden p-2.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/5 transition-colors touch-target"
                data-testid="button-open-sidebar"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div className="flex flex-col">
                <h2 className="text-base sm:text-lg md:text-xl font-bold text-white">{currentZone.name}</h2>
                <p className="text-xs text-gray-500 mt-0.5 hidden sm:block">{currentZone.purpose}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              {/* Status badges - hidden on mobile, E2E badge is clickable */}
              <Dialog open={securityDialogOpen} onOpenChange={setSecurityDialogOpen}>
                <DialogTrigger asChild>
                  <button className="hidden lg:flex items-center gap-4 px-4 py-2 rounded-lg transition-all cursor-pointer" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }} onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }} onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.04)'; }} data-testid="button-security-info">
                    <div className="flex items-center gap-2">
                      <Lock className="w-3 h-3 text-green-500/50" />
                      <span className="text-[10px] font-medium" style={{ color: 'var(--rz-text-muted)' }}>Local-First</span>
                    </div>
                    <div className="w-px h-3" style={{ background: 'rgba(255,255,255,0.06)' }}></div>
                    <div className="flex items-center gap-2">
                      <Bot className="w-3 h-3" style={{ color: 'rgba(243,126,32,0.5)' }} />
                      <span className="text-[10px] font-medium" style={{ color: 'var(--rz-text-muted)' }}>Thinking Partner</span>
                    </div>
                  </button>
                </DialogTrigger>
                <DialogContent className="border-white/10 max-w-lg p-8 rounded-[2rem] shadow-2xl" style={{ background: '#1a1d26' }}>
                  <DialogHeader>
                    <DialogTitle className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                        <Lock className="w-5 h-5 text-green-400" />
                      </div>
                      Privacy Architecture
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-6 py-4">
                    <p className="text-sm text-gray-300 leading-relaxed">
                      Your journal and research data is stored locally on your device using IndexedDB. AI only sees what you explicitly share by clicking "Think with me" or running a research query.
                    </p>
                    
                    <div className="p-4 rounded-xl bg-orange-500/[0.05] border border-orange-500/20">
                      <p className="text-xs font-bold text-orange-400 uppercase tracking-wider mb-2">Local-First Storage</p>
                      <p className="text-sm text-gray-400 leading-relaxed">
                        All entries, insights, and memories are stored in your browser's IndexedDB. This data stays on your device and works offline for writing and browsing.
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-orange-500/[0.05] border border-orange-500/20">
                      <p className="text-xs font-bold text-orange-400 uppercase tracking-wider mb-2">Privacy-Focused AI</p>
                      <p className="text-sm text-gray-400 leading-relaxed">
                        Your Thinking Partner is powered by Venice AI — privacy-first AI infrastructure with no data retention. Your prompts are never stored or used to train models.
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Privacy Stack</p>
                      <ul className="space-y-2 text-sm text-gray-400">
                        <li className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-2 shrink-0"></span>
                          Local-first storage (IndexedDB on your device)
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-2 shrink-0"></span>
                          User-controlled AI (only sends when you ask)
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-2 shrink-0"></span>
                          Venice AI — no data retention
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-2 shrink-0"></span>
                          Brave Search — no tracking or profiling
                        </li>
                      </ul>
                    </div>

                    <p className="text-[10px] text-gray-600 text-center uppercase tracking-wider">
                      Built on XMTP + Venice AI for complete privacy
                    </p>
                  </div>
                </DialogContent>
              </Dialog>
              
              {/* Memory/Insights toggle button - more visible on mobile */}
              <button 
                onClick={() => setMemoryDrawerOpen(!memoryDrawerOpen)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all touch-target ${memoryDrawerOpen ? 'bg-orange-600/15 text-orange-400' : 'text-gray-400 hover:text-white hover:bg-white/5 bg-white/[0.03]'}`}
                data-testid="button-toggle-memory"
              >
                <Zap className="w-4 h-4" />
                <span className="text-xs font-medium sm:hidden">Memory</span>
              </button>
            </div>
          </header>

          {/* Main Content Area - scrollable */}
          <div className={`flex-1 overflow-y-auto scroll-smooth ${selectedZone === 'journal' ? 'zone-journal' : selectedZone === 'trade' ? 'zone-trade' : selectedZone === 'decisions' ? 'zone-decisions' : selectedZone === 'content' ? 'zone-content' : 'zone-research'}`}>
            {selectedZone === 'trade' && (
              <div className="max-w-3xl w-full mx-auto px-4 sm:px-8 py-4 sm:py-8">
                <TradeArtifactZone walletAddress={address} />
              </div>
            )}
            {selectedZone === 'decisions' && (
              <div className="max-w-3xl w-full mx-auto px-4 sm:px-8 py-4 sm:py-8">
                <DecisionLogZone />
              </div>
            )}
            {selectedZone === 'content' && (
              <div className="max-w-3xl w-full mx-auto px-4 sm:px-8 py-4 sm:py-8">
                <ContentPipelineZone />
              </div>
            )}
            {selectedZone !== 'trade' && selectedZone !== 'decisions' && selectedZone !== 'content' && (
            <div className="flex flex-col max-w-2xl w-full mx-auto px-4 sm:px-8">
              {/* Writing Area - vertically centered */}
              <div className={`flex-1 flex flex-col justify-center py-4 sm:py-12 ${
                selectedZone === 'research' 
                  ? 'min-h-[40vh] sm:min-h-[60vh]' 
                  : 'min-h-[60vh] sm:min-h-[70vh]'
              }`}>
                {/* Stats bar - streak, last entry, total (Journal only) */}
                {selectedZone === 'journal' && entryStats && entryStats.totalEntries > 0 && (
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-8 p-3 sm:p-4 rounded-xl animate-in fade-in duration-500" style={{ background: '#14171D', border: '1px solid rgba(255,255,255,0.06)' }}>
                    {entryStats.streak > 0 && (
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-md" style={{ background: 'rgba(243,126,32,0.08)' }} data-testid="streak-badge">
                        <span className="text-sm">🔥</span>
                        <span className="text-xs font-bold tabular-nums" style={{ color: '#F37E20' }}>
                          {entryStats.streak} day{entryStats.streak !== 1 ? 's' : ''}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-md" style={{ background: 'rgba(255,255,255,0.02)' }}>
                      <Clock className="w-3.5 h-3.5 text-gray-500" />
                      <span className="text-xs font-medium text-gray-400">
                        {entryStats.daysSinceLastEntry === 0 
                          ? "Today" 
                          : entryStats.daysSinceLastEntry === 1 
                            ? "Yesterday" 
                            : `${entryStats.daysSinceLastEntry} days ago`}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-md" style={{ background: 'rgba(255,255,255,0.02)' }}>
                      <BookOpen className="w-3.5 h-3.5 text-gray-500" />
                      <span className="text-xs font-medium text-gray-400">
                        {entryStats.totalEntries} {entryStats.totalEntries === 1 ? 'entry' : 'entries'}
                      </span>
                    </div>
                  </div>
                )}
                
                {/* First time welcome (Journal only) */}
                {selectedZone === 'journal' && entryStats && entryStats.totalEntries === 0 && (
                  <div className="mb-6 sm:mb-8 p-4 sm:p-6 rounded-2xl bg-orange-500/[0.03] border border-orange-500/10 animate-in fade-in duration-700 flex flex-col items-center text-center" data-testid="first-time-welcome">
                    <img src="/logo.png" alt="DJZS" className="w-12 h-12 rounded-xl mb-4 logo-pulse" style={{ filter: 'drop-shadow(0 0 6px rgba(243,126,32,0.2))' }} data-testid="img-logo-first-entry" />
                    <p className="text-[10px] sm:text-[11px] font-black text-orange-400/70 uppercase tracking-widest mb-2">First entry</p>
                    <p className="text-xs sm:text-sm text-gray-400 leading-relaxed break-words">
                      Write whatever's on your mind. The more you return, the more this becomes yours.
                    </p>
                  </div>
                )}
                
                {/* Zone-specific input areas */}
                {selectedZone === 'journal' ? (
                  <>
                    {/* Journal: Prompt hint */}
                    <p className={`text-sm sm:text-base font-medium mb-4 transition-all duration-500 break-words ${isFocused ? 'opacity-100 text-orange-300/70' : 'opacity-60 text-gray-400'}`}>
                      {currentPrompts[currentPromptIndex]}
                    </p>
                    
                    {/* Journal: Tall writing pad */}
                    <div className={`relative transition-all duration-500 rounded-2xl sm:rounded-3xl ${isFocused ? 'zone-glow writing-area-focused' : ''}`}>
                      <textarea
                        ref={textareaRef}
                        autoFocus
                        value={messageInput}
                        onChange={(e) => {
                          setMessageInput(e.target.value);
                          if (frozenHeight) setFrozenHeight(null);
                        }}
                        onKeyDown={handleKeyDown}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        placeholder="Write what you're thinking. No formatting. No pressure."
                        className={`w-full bg-transparent border-none outline-none focus:ring-0 text-lg sm:text-xl font-normal text-white/95 placeholder:text-gray-600 resize-none leading-[1.9] tracking-normal p-4 sm:p-6 overflow-hidden ${isFocused ? 'placeholder:text-gray-500' : ''}`}
                        style={{ 
                          minHeight: frozenHeight ? undefined : 'max(180px, calc(50vh - 100px))',
                          height: frozenHeight ? `${frozenHeight}px` : 'auto'
                        }}
                        data-testid="textarea-journal"
                      />
                    </div>

                    {showVideoUpload && (
                      <div className="mt-4">
                        <VideoUpload
                          onVideoReady={(assetId, playbackId) => {
                            setPendingVideoAssetId(assetId);
                            setPendingVideoPlaybackId(playbackId);
                            setShowVideoUpload(false);
                          }}
                          onCancel={() => setShowVideoUpload(false)}
                        />
                      </div>
                    )}

                    {pendingVideoAssetId && !showVideoUpload && (
                      <div className="mt-3 flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-500/10 border border-orange-500/20">
                        <Video className="w-4 h-4 text-orange-400" />
                        <span className="text-xs text-orange-300 font-medium">Video attached</span>
                        <button
                          onClick={() => { setPendingVideoAssetId(null); setPendingVideoPlaybackId(null); }}
                          className="ml-auto p-1 rounded-lg text-gray-500 hover:text-red-400 transition-colors"
                          data-testid="button-remove-video"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    {/* Research: Futuristic AI-forward claim interface */}
                    <div className="space-y-6 sm:space-y-10 text-center">
                      <div className="space-y-3">
                        <p className="rz-heading text-[10px] sm:text-xs font-bold tracking-[0.25em]" style={{ color: 'var(--rz-text-muted)' }}>
                          DJZS Research Engine
                        </p>
                        <p className="text-sm sm:text-base font-medium transition-all duration-500" style={{ color: isFocused ? 'var(--rz-teal)' : 'var(--rz-text-secondary)' }}>
                          {currentPrompts[currentPromptIndex]}
                        </p>
                      </div>

                      <div className={`relative transition-all duration-500 ${isFocused ? 'rz-input-glow' : ''}`} style={{ borderRadius: '1rem' }}>
                        <div className="relative">
                          <input
                            type="text"
                            value={messageInput}
                            onChange={(e) => setMessageInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                handleAnalyze();
                              }
                            }}
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setIsFocused(false)}
                            placeholder="State the claim you want to test."
                            className="w-full bg-transparent border-none outline-none focus:ring-0 text-xl sm:text-2xl font-light text-center tracking-wide placeholder:tracking-wide py-6 sm:py-8"
                            style={{ color: 'var(--rz-text-primary)', fontFamily: 'var(--font-body)' }}
                            data-testid="input-research"
                          />
                          <div className="mx-auto" style={{ width: messageInput.length > 0 ? '60%' : '30%', maxWidth: '300px', transition: 'width 0.5s ease' }}>
                            <div className={`h-[2px] mx-auto rounded-full ${messageInput.length > 0 ? '' : 'rz-underline-pulse'}`} style={{ background: messageInput.length > 0 ? 'var(--rz-teal)' : 'var(--rz-text-muted)', transition: 'background 0.4s ease' }} />
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
                        <div className="relative">
                          <button
                            onClick={() => setDossierDropdownOpen(!dossierDropdownOpen)}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-[11px] font-medium transition-all ${
                              activeDossierId 
                                ? 'text-teal-400 border' 
                                : 'text-gray-500 hover:text-gray-300 border'
                            }`}
                            style={{ borderColor: activeDossierId ? 'rgba(45,212,191,0.25)' : 'var(--rz-border)', background: activeDossierId ? 'rgba(45,212,191,0.06)' : 'transparent' }}
                            data-testid="button-dossier-selector"
                          >
                            <FolderOpen className="w-3.5 h-3.5" />
                            <span className="max-w-[100px] sm:max-w-[120px] truncate">
                              {activeDossierId && dossiers?.find(d => d.id === activeDossierId)?.name || "Research tracker"}
                            </span>
                            <ChevronDown className={`w-3 h-3 transition-transform ${dossierDropdownOpen ? 'rotate-180' : ''}`} />
                          </button>
                          
                          {dossierDropdownOpen && (
                            <div className="absolute top-full left-0 mt-1 w-64 rounded-lg shadow-2xl z-50 overflow-hidden" style={{ background: 'var(--rz-surface)', border: '1px solid var(--rz-border)' }} data-testid="dossier-dropdown">
                              <div className="p-2" style={{ borderBottom: '1px solid var(--rz-border)' }}>
                                <button
                                  onClick={() => handleSelectDossier(null)}
                                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-xs font-medium transition-all ${
                                    !activeDossierId ? 'text-teal-400' : 'text-gray-500 hover:text-gray-300'
                                  }`}
                                  style={{ background: !activeDossierId ? 'rgba(45,212,191,0.08)' : 'transparent' }}
                                  data-testid="button-no-dossier"
                                >
                                  <Search className="w-3.5 h-3.5" />
                                  Quick search (no dossier)
                                </button>
                              </div>
                              
                              {dossiers && dossiers.length > 0 && (
                                <div className="p-2 max-h-48 overflow-y-auto">
                                  {dossiers.map(dossier => (
                                    <div key={dossier.id} className="flex items-center gap-1 group">
                                      <button
                                        onClick={() => handleSelectDossier(dossier.id!)}
                                        className={`flex-1 flex items-center gap-2 px-3 py-2 rounded-md text-xs font-medium transition-all ${
                                          activeDossierId === dossier.id ? 'text-teal-400' : 'text-gray-500 hover:text-gray-300'
                                        }`}
                                        style={{ background: activeDossierId === dossier.id ? 'rgba(45,212,191,0.08)' : 'transparent' }}
                                        data-testid={`button-dossier-${dossier.id}`}
                                      >
                                        <FolderOpen className="w-3.5 h-3.5" />
                                        <span className="truncate">{dossier.name}</span>
                                      </button>
                                      <button
                                        onClick={(e) => { e.stopPropagation(); handleDeleteDossier(dossier.id!); }}
                                        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-md text-gray-600 hover:text-red-400 transition-all"
                                        data-testid={`button-delete-dossier-${dossier.id}`}
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              )}
                              
                              <div className="p-2" style={{ borderTop: '1px solid var(--rz-border)' }}>
                                {showNewDossierInput ? (
                                  <div className="flex items-center gap-2">
                                    <input
                                      type="text"
                                      value={dossierName}
                                      onChange={(e) => setDossierName(e.target.value)}
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleCreateDossier();
                                        if (e.key === 'Escape') { setShowNewDossierInput(false); setDossierName(''); }
                                      }}
                                      placeholder="Dossier name..."
                                      className="flex-1 px-3 py-2 rounded-md text-xs text-white placeholder:text-gray-600 outline-none"
                                      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--rz-border)' }}
                                      autoFocus
                                      data-testid="input-new-dossier"
                                    />
                                    <button
                                      onClick={handleCreateDossier}
                                      disabled={!dossierName.trim()}
                                      className="p-2 rounded-md text-white hover:opacity-90 disabled:opacity-40 transition-all"
                                      style={{ background: 'var(--rz-teal)' }}
                                      data-testid="button-create-dossier"
                                    >
                                      <Check className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => setShowNewDossierInput(true)}
                                    className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-xs font-medium text-gray-500 hover:text-gray-300 transition-all"
                                    data-testid="button-new-dossier"
                                  >
                                    <FolderPlus className="w-3.5 h-3.5" />
                                    New dossier
                                  </button>
                                )}
                              </div>
                            </div>
                          )}
                        </div>

                        {activeDossierId && dossierClaims && dossierClaims.length > 0 && (
                          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px]" style={{ color: 'var(--rz-text-muted)', border: '1px solid var(--rz-border)' }}>
                            <span>{dossierClaims.length} claim{dossierClaims.length !== 1 ? 's' : ''}</span>
                          </div>
                        )}
                        
                        <button
                          onClick={() => setWebModeEnabled(!webModeEnabled)}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg text-[11px] font-medium transition-all border"
                          style={{ 
                            borderColor: webModeEnabled ? 'rgba(45,212,191,0.25)' : 'var(--rz-border)', 
                            color: webModeEnabled ? 'var(--rz-teal)' : 'var(--rz-text-muted)',
                            background: webModeEnabled ? 'rgba(45,212,191,0.06)' : 'transparent'
                          }}
                          title={webModeEnabled ? "Web search enabled (uses live data)" : "Explain mode (AI knowledge only)"}
                          data-testid="button-web-toggle"
                        >
                          <Globe className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">{webModeEnabled ? 'Web' : 'Explain'}</span>
                        </button>
                        
                        {webModeEnabled && braveSearchAvailable && (
                          <button
                            onClick={() => setBraveSearchEnabled(!braveSearchEnabled)}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg text-[11px] font-medium transition-all border"
                            style={{ 
                              borderColor: braveSearchEnabled ? 'rgba(45,212,191,0.25)' : 'var(--rz-border)', 
                              color: braveSearchEnabled ? 'var(--rz-teal)' : 'var(--rz-text-muted)',
                              background: braveSearchEnabled ? 'rgba(45,212,191,0.06)' : 'transparent'
                            }}
                            title={braveSearchEnabled ? "Brave Search (privacy-first, no tracking)" : "Use default web search"}
                            data-testid="button-brave-toggle"
                          >
                            <Shield className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">{braveSearchEnabled ? 'Brave' : 'Default'}</span>
                          </button>
                        )}
                      </div>

                      <Button
                        onClick={handleAnalyze}
                        disabled={!messageInput.trim() || searchResearch.isPending}
                        className="h-12 px-10 rounded-lg font-medium text-sm tracking-wide transition-all active:scale-[0.98] touch-target disabled:opacity-30"
                        style={{ background: messageInput.trim() ? 'var(--rz-teal)' : 'rgba(45,212,191,0.15)', color: messageInput.trim() ? '#0F1115' : 'var(--rz-text-muted)', boxShadow: messageInput.trim() ? '0 4px 24px rgba(45,212,191,0.2)' : 'none' }}
                        data-testid="button-search"
                      >
                        {searchResearch.isPending ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <ArrowUpRight className="w-4 h-4 mr-2" />
                            Start Analysis
                          </>
                        )}
                      </Button>

                      <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0 scrollbar-hide">
                        <div className="flex sm:flex-wrap gap-2 min-w-max sm:min-w-0 justify-center">
                          {["Latest trends", "How does X work?", "Compare A vs B", "Deep dive on topic"].map((suggestion, idx) => (
                            <button
                              key={idx}
                              onClick={() => setMessageInput(suggestion)}
                              className="px-3 py-2 sm:py-1.5 rounded-md text-[11px] font-medium transition-all whitespace-nowrap touch-target hover:text-teal-300"
                              style={{ color: 'var(--rz-text-muted)', border: '1px solid var(--rz-border)', background: 'transparent' }}
                              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(45,212,191,0.3)'; e.currentTarget.style.background = 'rgba(45,212,191,0.04)'; }}
                              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--rz-border)'; e.currentTarget.style.background = 'transparent'; }}
                              data-testid={`button-suggestion-${idx}`}
                            >
                              {suggestion}
                            </button>
                          ))}
                        </div>
                      </div>

                      <p className="hidden sm:block text-[10px] tracking-wider" style={{ color: 'var(--rz-text-muted)' }}>
                        Enter to analyze
                      </p>
                    </div>
                  </>
                )}

                {/* Action bar - Journal zone only */}
                {selectedZone === 'journal' && (
                <div className="mt-4 sm:mt-6 py-3 sm:py-4 px-1 space-y-3">
                  {/* Top row: tools + character count */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <Dialog open={pinDialogOpen} onOpenChange={setPinDialogOpen}>
                        <DialogTrigger asChild>
                          <button
                            disabled={!messageInput.trim()}
                            className="group relative h-9 sm:h-10 w-9 sm:w-auto sm:px-4 rounded-lg sm:rounded-xl flex items-center justify-center gap-2 bg-white/[0.04] border border-white/[0.08] text-gray-400 hover:text-orange-400 hover:bg-orange-500/10 hover:border-orange-500/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95"
                            title="Pin to vault"
                            data-testid="button-pin"
                          >
                            <Pin className="w-4 h-4" />
                            <span className="hidden sm:inline text-xs font-medium">Pin</span>
                          </button>
                        </DialogTrigger>
                        <DialogContent className="border-white/10 max-w-md p-8 rounded-[2rem] shadow-2xl" style={{ background: '#1a1d26' }}>
                          <DialogHeader>
                            <DialogTitle className="text-xl font-black text-white uppercase tracking-tight">Pin Memory</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-8 py-4">
                            <p className="text-sm text-gray-500 leading-relaxed font-medium">This thought will be stored in your local vault and used as context for future thinking partners.</p>
                            
                            <div className="relative group">
                              <div className="absolute -inset-2 bg-gradient-to-r from-orange-500/20 to-blue-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                              <div className="relative p-5 rounded-2xl bg-white/[0.02] border border-white/[0.05] shadow-inner">
                                <p className="text-sm text-gray-300 leading-relaxed line-clamp-4 font-medium italic">"{messageInput}"</p>
                              </div>
                            </div>

                            <div className="space-y-4">
                              <label className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em] ml-1">Context Category</label>
                              <div className="flex flex-wrap gap-2">
                                {["pattern", "goal", "preference", "principle", "project", "question", "person"].map((kind) => (
                                  <button
                                    key={kind}
                                    onClick={() => setSelectedPinKind(kind)}
                                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 ${
                                      selectedPinKind === kind 
                                        ? "text-white shadow-lg shadow-orange-900/40 border-transparent [background:#F37E20]" 
                                        : "bg-white/[0.02] text-gray-500 hover:text-white hover:bg-white/5 border border-white/[0.05]"
                                    }`}
                                    data-testid={`button-kind-${kind}`}
                                  >
                                    {kind}
                                  </button>
                                ))}
                              </div>
                            </div>
                            <Button
                              onClick={handleManualPin}
                              className="w-full hover:opacity-90 h-14 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-orange-900/20 transition-all active:scale-[0.98]"
                              style={{ background: '#F37E20' }}
                              data-testid="button-confirm-pin"
                            >
                              <Pin className="w-4 h-4 mr-2" />
                              Secure to Vault
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>

                      {speechSupported && (
                        <button
                          onClick={toggleVoiceInput}
                          className={`relative h-9 sm:h-10 w-9 sm:w-auto sm:px-4 rounded-lg sm:rounded-xl flex items-center justify-center gap-2 border transition-all active:scale-95 ${
                            isListening
                              ? 'text-red-400 bg-red-500/15 border-red-500/30 animate-pulse'
                              : 'text-gray-400 bg-white/[0.04] border-white/[0.08] hover:text-gray-200 hover:bg-white/[0.07] hover:border-white/[0.15]'
                          }`}
                          title={isListening ? 'Stop listening' : 'Voice input'}
                          data-testid="button-voice-input"
                        >
                          {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                          <span className="hidden sm:inline text-xs font-medium">{isListening ? 'Stop' : 'Voice'}</span>
                          {isListening && (
                            <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-red-500 border-2 border-[#1a1d26] shadow-[0_0_6px_rgba(239,68,68,0.6)]" />
                          )}
                        </button>
                      )}

                      <button
                        onClick={() => setShowVideoUpload(!showVideoUpload)}
                        className={`relative h-9 sm:h-10 w-9 sm:w-auto sm:px-4 rounded-lg sm:rounded-xl flex items-center justify-center gap-2 border transition-all active:scale-95 ${
                          showVideoUpload
                            ? 'text-orange-400 bg-orange-500/15 border-orange-500/30'
                            : pendingVideoAssetId
                              ? 'text-orange-400 bg-orange-500/10 border-orange-500/20 hover:bg-orange-500/15'
                              : 'text-gray-400 bg-white/[0.04] border-white/[0.08] hover:text-gray-200 hover:bg-white/[0.07] hover:border-white/[0.15]'
                        }`}
                        title={pendingVideoAssetId ? 'Video attached' : 'Add video'}
                        data-testid="button-video-journal"
                      >
                        <Video className="w-4 h-4" />
                        <span className="hidden sm:inline text-xs font-medium">Video</span>
                        {pendingVideoAssetId && (
                          <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-orange-500 border-2 border-[#1a1d26] shadow-[0_0_6px_rgba(243,126,32,0.6)]" />
                        )}
                      </button>

                      <button
                        onClick={() => setShowMusicPanel(!showMusicPanel)}
                        className={`relative h-9 sm:h-10 w-9 sm:w-auto sm:px-4 rounded-lg sm:rounded-xl flex items-center justify-center gap-2 border transition-all active:scale-95 ${
                          showMusicPanel
                            ? 'text-orange-400 bg-orange-500/15 border-orange-500/30'
                            : 'text-gray-400 bg-white/[0.04] border-white/[0.08] hover:text-gray-200 hover:bg-white/[0.07] hover:border-white/[0.15]'
                        }`}
                        title="Music library"
                        data-testid="button-music-panel"
                      >
                        <Headphones className="w-4 h-4" />
                        <span className="hidden sm:inline text-xs font-medium">Music</span>
                      </button>
                    </div>

                    {messageInput.length > 0 && (
                      <span className={`text-[11px] font-medium tabular-nums transition-colors ${
                        messageInput.length > 5000 ? 'text-red-400' : messageInput.length > 3000 ? 'text-amber-400' : 'text-gray-600'
                      }`} data-testid="text-char-count">
                        {messageInput.length.toLocaleString()} chars
                      </span>
                    )}
                  </div>

                  {/* Bottom row: primary actions */}
                  <div className="flex items-center gap-2.5">
                    <Button
                      onClick={handleSendText}
                      disabled={!messageInput.trim() || sendMessage.isPending}
                      variant="ghost"
                      className="flex-1 sm:flex-none h-11 sm:h-12 px-4 sm:px-6 rounded-xl font-semibold text-sm text-gray-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.1] hover:border-white/[0.2] disabled:opacity-30 disabled:border-transparent transition-all active:scale-95"
                      data-testid="button-save"
                    >
                      {sendMessage.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <FileText className="w-4 h-4 mr-2" />
                          Save
                        </>
                      )}
                    </Button>

                    <Button
                      onClick={handleAnalyze}
                      disabled={!messageInput.trim() || thinkWithMe.isPending || isAnalyzing}
                      className="flex-[2] sm:flex-none h-11 sm:h-12 px-5 sm:px-8 rounded-xl font-bold text-sm shadow-lg shadow-orange-900/40 transition-all active:scale-95 hover:opacity-90 disabled:opacity-30 disabled:shadow-none"
                      style={{ background: '#F37E20' }}
                      data-testid="button-analyze"
                    >
                      {isAnalyzing ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          <span className="hidden sm:inline">Thinking...</span>
                          <span className="sm:hidden">...</span>
                        </>
                      ) : (
                        <>
                          <Bot className="w-4 h-4 mr-2" />
                          <span className="hidden sm:inline">Think with me</span>
                          <span className="sm:hidden">Think</span>
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Keyboard shortcut hint */}
                  <p className="hidden sm:block text-[10px] text-gray-600 text-center">
                    Enter to save · Cmd+Enter to think
                  </p>
                </div>
                )}
              </div>
              
              {/* Insight appears below text when analyzing is complete */}
              {(isAnalyzing || agentResponse || researchResult || latestAnalysis) && (
                <div className="pb-12 sm:pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
                  {isAnalyzing && !agentResponse && !researchResult && !latestAnalysis && (
                    selectedZone === 'research' ? (
                      <>
                        <div className="rz-analyzing-overlay" />
                        <div className="relative z-30 flex flex-col items-center gap-6 py-12 sm:py-20" data-testid="analyzing-loader">
                          <p className="rz-heading text-[10px] sm:text-xs font-bold tracking-[0.3em]" style={{ color: 'var(--rz-text-muted)' }}>
                            Analyzing Evidence
                          </p>
                          <div className="w-48 sm:w-64 overflow-hidden rounded-full">
                            <div className="rz-progress-line" />
                          </div>
                          <p className="text-xs font-medium" style={{ color: 'var(--rz-text-secondary)' }}>
                            Synthesizing information from sources
                          </p>
                        </div>
                      </>
                    ) : (
                      <div className="p-6 sm:p-8 rounded-2xl sm:rounded-3xl thinking-card" data-testid="analyzing-loader">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center bg-orange-600/20">
                            <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin text-orange-400" />
                          </div>
                          <div>
                            <p className="text-xs font-semibold mb-1 text-orange-400">Thinking...</p>
                            <p className="text-sm text-gray-500">Processing your entry</p>
                          </div>
                        </div>
                      </div>
                    )
                  )}

                  {/* Research Result Card */}
                  {researchResult && (
                    <div className="rounded-xl rz-result-card" data-testid="research-result-card">
                      <div className="flex items-center justify-between p-5 sm:p-7" style={{ borderBottom: '1px solid var(--rz-border)' }}>
                        <div className="flex items-center gap-4">
                          <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'rgba(45,212,191,0.1)' }}>
                            <Search className="w-4 h-4" style={{ color: 'var(--rz-teal)' }} />
                          </div>
                          <div>
                            <p className="text-sm font-semibold" style={{ color: 'var(--rz-text-primary)' }}>Analysis Complete</p>
                            <p className="text-[11px] mt-0.5" style={{ color: 'var(--rz-text-muted)' }}>
                              {researchResult.mode === 'explain' ? 'Explain mode' : researchResult.mode === 'brave' ? 'Brave Search' : 'Web search'} 
                              {researchResult.cached && ' · cached'}
                            </p>
                          </div>
                        </div>
                        <button 
                          onClick={clearAndReset}
                          className="p-2 rounded-lg transition-colors touch-target"
                          style={{ color: 'var(--rz-text-muted)' }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = 'var(--rz-text-primary)'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--rz-text-muted)'; }}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <div className="p-5 sm:p-7 space-y-6">
                        {researchResult.keyTakeaways && researchResult.keyTakeaways.length > 0 && (
                          <div className="rz-fade-up rz-fade-up-delay-1 space-y-4">
                            <div className="flex items-center justify-between">
                              <p className="text-[10px] font-bold tracking-[0.2em] uppercase" style={{ color: 'var(--rz-text-muted)' }}>Key Takeaways</p>
                              {activeDossierId && (
                                <p className="text-[10px]" style={{ color: 'rgba(45,212,191,0.5)' }}>Click + to save as claim</p>
                              )}
                            </div>
                            <ul className="space-y-3">
                              {researchResult.keyTakeaways.map((takeaway, idx) => (
                                <li key={idx} className="flex items-start gap-3 group">
                                  <span className="w-1 h-1 rounded-full mt-2.5 shrink-0" style={{ background: 'var(--rz-teal)' }} />
                                  <p className="leading-relaxed flex-1 text-[15px]" style={{ color: 'var(--rz-text-primary)' }}>{takeaway}</p>
                                  {activeDossierId && (
                                    <button
                                      onClick={() => handleSaveClaimToDossier(takeaway, undefined, true)}
                                      className="opacity-0 group-hover:opacity-100 p-1.5 rounded-md transition-all shrink-0"
                                      style={{ color: 'var(--rz-text-muted)' }}
                                      onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--rz-teal)'; e.currentTarget.style.background = 'rgba(45,212,191,0.08)'; }}
                                      onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--rz-text-muted)'; e.currentTarget.style.background = 'transparent'; }}
                                      title="Save as claim"
                                      data-testid={`button-save-claim-${idx}`}
                                    >
                                      <Plus className="w-4 h-4" />
                                    </button>
                                  )}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {researchResult.synthesisMarkdown && (
                          <div className="rz-fade-up rz-fade-up-delay-2 rz-section">
                            <p className="text-[10px] font-bold tracking-[0.2em] uppercase mb-4" style={{ color: 'var(--rz-teal)' }}>Synthesis</p>
                            <p className="leading-[1.8] whitespace-pre-wrap text-[15px]" style={{ color: 'var(--rz-text-primary)' }}>{researchResult.synthesisMarkdown}</p>
                          </div>
                        )}
                        
                        {researchResult.whatToCheckNext && researchResult.whatToCheckNext.length > 0 && (
                          <div className="rz-fade-up rz-fade-up-delay-3 space-y-4">
                            <p className="text-[10px] font-bold tracking-[0.2em] uppercase" style={{ color: 'var(--rz-text-muted)' }}>Evidence Gaps</p>
                            <div className="overflow-x-auto -mx-5 sm:mx-0 px-5 sm:px-0 scrollbar-hide">
                              <div className="flex sm:flex-wrap gap-2 min-w-max sm:min-w-0">
                                {researchResult.whatToCheckNext.map((item, idx) => (
                                  <button
                                    key={idx}
                                    onClick={() => {
                                      setResearchResult(null);
                                      setAgentResponse(null);
                                      setMessageInput(item);
                                    }}
                                    className="px-3.5 py-2.5 sm:py-2 rounded-lg text-sm text-left transition-all active:scale-[0.98] whitespace-nowrap sm:whitespace-normal touch-target"
                                    style={{ background: 'rgba(91,141,239,0.06)', border: '1px solid rgba(91,141,239,0.15)', color: 'rgba(91,141,239,0.8)' }}
                                    onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(91,141,239,0.1)'; e.currentTarget.style.borderColor = 'rgba(91,141,239,0.3)'; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(91,141,239,0.06)'; e.currentTarget.style.borderColor = 'rgba(91,141,239,0.15)'; }}
                                    data-testid={`button-next-check-${idx}`}
                                  >
                                    {item}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {researchResult.confidence && (
                          <div className="rz-fade-up rz-fade-up-delay-4 p-4 rounded-lg" style={{ background: 'var(--rz-amber-glow)', border: '1px solid rgba(245,158,11,0.12)' }}>
                            <p className="text-xs flex items-center gap-2.5" style={{ color: 'var(--rz-amber)' }}>
                              <Info className="w-3.5 h-3.5 shrink-0" />
                              {researchResult.confidence}
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="rz-fade-up rz-fade-up-delay-5 px-5 sm:px-7 py-5" style={{ borderTop: '1px solid var(--rz-border)' }}>
                        <button
                          onClick={() => {
                            const topic = researchResult.query || messageInput;
                            const synthesis = researchResult.synthesisMarkdown ? `\n\nResearch notes:\n${researchResult.synthesisMarkdown.slice(0, 300)}` : '';
                            clearAndReset();
                            setSelectedZone('journal');
                            setTimeout(() => setMessageInput(`Thinking about: ${topic}${synthesis}`), 100);
                          }}
                          className="w-full flex items-center justify-center gap-3 py-3.5 rounded-lg transition-all group touch-target"
                          style={{ background: 'rgba(91,141,239,0.04)', border: '1px solid rgba(91,141,239,0.1)' }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(91,141,239,0.08)'; e.currentTarget.style.borderColor = 'rgba(91,141,239,0.2)'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(91,141,239,0.04)'; e.currentTarget.style.borderColor = 'rgba(91,141,239,0.1)'; }}
                          data-testid="button-journal-about-this"
                        >
                          <span className="text-sm font-medium" style={{ color: 'var(--rz-accent)' }}>Continue reasoning with your Thinking Partner</span>
                          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" style={{ color: 'var(--rz-accent)' }} />
                        </button>
                        <div className="flex justify-center mt-3">
                          <button
                            onClick={clearAndReset}
                            className="text-[11px] font-medium transition-colors"
                            style={{ color: 'var(--rz-text-muted)' }}
                            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--rz-text-primary)'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--rz-text-muted)'; }}
                          >
                            New Search
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Claims Panel - Show when dossier is active */}
                  {activeDossierId && (
                    <div className="mt-5 rounded-xl overflow-hidden" style={{ background: 'var(--rz-surface)', border: '1px solid var(--rz-border)' }} data-testid="claims-panel">
                      <div className="p-5" style={{ borderBottom: '1px solid var(--rz-border)' }}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <FolderOpen className="w-4 h-4" style={{ color: 'var(--rz-teal)' }} />
                            <p className="text-sm font-semibold" style={{ color: 'var(--rz-text-primary)' }}>
                              {dossiers?.find(d => d.id === activeDossierId)?.name} Claims
                            </p>
                            {dossierClaims && dossierClaims.length > 0 && (
                              <span className="text-[11px]" style={{ color: 'var(--rz-text-muted)' }}>({dossierClaims.length})</span>
                            )}
                          </div>
                        </div>
                        <div className="mt-3 flex gap-2">
                          <input
                            type="text"
                            placeholder="Add a claim manually..."
                            className="flex-1 px-3 py-2 rounded-md text-sm text-white placeholder:text-gray-600 outline-none"
                            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--rz-border)' }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                                handleSaveClaimToDossier(e.currentTarget.value.trim(), undefined, true);
                                e.currentTarget.value = '';
                              }
                            }}
                            data-testid="input-manual-claim"
                          />
                          <button
                            onClick={(e) => {
                              const input = (e.currentTarget.previousElementSibling as HTMLInputElement);
                              if (input?.value.trim()) {
                                handleSaveClaimToDossier(input.value.trim(), undefined, true);
                                input.value = '';
                              }
                            }}
                            className="px-3 py-2 rounded-md transition-colors"
                            style={{ background: 'rgba(45,212,191,0.12)', color: 'var(--rz-teal)' }}
                            title="Add claim"
                            data-testid="button-add-manual-claim"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      {dossierClaims && dossierClaims.length > 0 && (
                      <div className="p-4 space-y-3 max-h-[400px] overflow-y-auto">
                        {dossierClaims.map((claim) => (
                          <div 
                            key={claim.id} 
                            className={`group p-3 rounded-xl border transition-all ${
                              editingClaimId === claim.id 
                                ? 'bg-teal-500/[0.05] border-teal-500/30' 
                                : 'bg-white/[0.02] border-white/[0.05] hover:border-white/[0.1]'
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div className="flex-1">
                                <div className="flex items-start gap-2">
                                  {claim.trustLevel && claim.trustLevel !== 'unknown' && (
                                    <span className={`shrink-0 px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase ${
                                      claim.trustLevel === 'high' ? 'bg-green-500/20 text-green-400' :
                                      claim.trustLevel === 'medium' ? 'bg-amber-500/20 text-amber-400' :
                                      'bg-red-500/20 text-red-400'
                                    }`}>
                                      {claim.trustLevel}
                                    </span>
                                  )}
                                  <p className="text-sm text-white/90 leading-relaxed">{claim.claim}</p>
                                </div>
                                {claim.sourceNote && !editingClaimId && (
                                  <p className="text-xs text-gray-500 mt-1.5 pl-0">📎 {claim.sourceNote}</p>
                                )}
                                {claim.linkedJournalEntryId && (
                                  <p className="text-xs text-teal-400/70 mt-1.5 flex items-center gap-1">
                                    <PenLine className="w-3 h-3" />
                                    Linked to journal entry
                                  </p>
                                )}
                              </div>
                              <div className="flex items-center gap-1 shrink-0">
                                <button
                                  onClick={() => handleUpdateClaimStatus(claim.id!, 'verified')}
                                  className={`p-1.5 rounded-lg transition-all ${
                                    claim.status === 'verified' 
                                      ? 'bg-green-500/20 text-green-400' 
                                      : 'text-gray-500 hover:text-green-400 hover:bg-green-500/10'
                                  }`}
                                  title="Mark as verified"
                                  data-testid={`button-verify-claim-${claim.id}`}
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleUpdateClaimStatus(claim.id!, 'uncertain')}
                                  className={`p-1.5 rounded-lg transition-all ${
                                    claim.status === 'uncertain' 
                                      ? 'bg-amber-500/20 text-amber-400' 
                                      : 'text-gray-500 hover:text-amber-400 hover:bg-amber-500/10'
                                  }`}
                                  title="Mark as uncertain"
                                  data-testid={`button-uncertain-claim-${claim.id}`}
                                >
                                  <AlertCircle className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleUpdateClaimStatus(claim.id!, 'to_check')}
                                  className={`p-1.5 rounded-lg transition-all ${
                                    claim.status === 'to_check' 
                                      ? 'bg-teal-500/20 text-teal-400' 
                                      : 'text-gray-500 hover:text-teal-400 hover:bg-teal-500/10'
                                  }`}
                                  title="Mark as to check"
                                  data-testid={`button-tocheck-claim-${claim.id}`}
                                >
                                  <HelpCircle className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => editingClaimId === claim.id ? setEditingClaimId(null) : handleStartEditClaim(claim)}
                                  className={`p-1.5 rounded-lg transition-all ${
                                    editingClaimId === claim.id 
                                      ? 'bg-teal-500/20 text-teal-400' 
                                      : 'text-gray-500 hover:text-teal-400 hover:bg-teal-500/10 opacity-0 group-hover:opacity-100'
                                  }`}
                                  title="Add source note"
                                  data-testid={`button-edit-claim-${claim.id}`}
                                >
                                  <FileText className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteClaim(claim.id!)}
                                  className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all"
                                  title="Delete claim"
                                  data-testid={`button-delete-claim-${claim.id}`}
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                            
                            {/* Inline edit panel for source notes and trust */}
                            {editingClaimId === claim.id && (
                              <div className="mt-3 pt-3 border-t border-white/[0.05] space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                                <div className="space-y-1.5">
                                  <label className="text-[10px] font-medium text-gray-500 uppercase tracking-wide">Source Note</label>
                                  <input
                                    type="text"
                                    value={claimSourceNote}
                                    onChange={(e) => setClaimSourceNote(e.target.value)}
                                    placeholder="Where did you find this? How reliable is it?"
                                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-gray-500 outline-none focus:border-teal-500/50"
                                    data-testid="input-source-note"
                                  />
                                </div>
                                <div className="space-y-1.5">
                                  <label className="text-[10px] font-medium text-gray-500 uppercase tracking-wide">Trust Level</label>
                                  <div className="flex gap-2">
                                    {(['high', 'medium', 'low', 'unknown'] as TrustLevel[]).map((level) => (
                                      <button
                                        key={level}
                                        onClick={() => setClaimTrustLevel(level)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                          claimTrustLevel === level
                                            ? level === 'high' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                                              level === 'medium' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                                              level === 'low' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                                              'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                                            : 'bg-white/5 text-gray-500 border border-white/10 hover:border-white/20'
                                        }`}
                                        data-testid={`button-trust-${level}`}
                                      >
                                        {level.charAt(0).toUpperCase() + level.slice(1)}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                                <div className="flex justify-end">
                                  <Button
                                    onClick={handleSaveClaimEdit}
                                    className="hover:opacity-90 h-8 px-4 text-xs"
                                    style={{ background: '#F37E20' }}
                                    data-testid="button-save-claim-edit"
                                  >
                                    Save
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                      )}
                    </div>
                  )}
                  
                  {/* Related Journal Entries - Show when research finds related thinking */}
                  {relatedJournalEntries && relatedJournalEntries.length > 0 && (
                    <div className="mt-5 rounded-xl overflow-hidden" style={{ background: 'var(--rz-surface)', border: '1px solid var(--rz-border)' }} data-testid="related-entries-panel">
                      <div className="p-5" style={{ borderBottom: '1px solid var(--rz-border)' }}>
                        <div className="flex items-center gap-2.5">
                          <PenLine className="w-4 h-4" style={{ color: 'var(--rz-accent)' }} />
                          <p className="text-sm font-semibold" style={{ color: 'var(--rz-text-primary)' }}>Related from your Journal</p>
                          <span className="text-[11px]" style={{ color: 'var(--rz-text-muted)' }}>({relatedJournalEntries.length})</span>
                        </div>
                        {editingClaimId && (
                          <p className="text-[10px] mt-1.5" style={{ color: 'rgba(91,141,239,0.6)' }}>Click an entry to link it to the claim you're editing</p>
                        )}
                      </div>
                      <div className="p-5 space-y-3 max-h-[200px] overflow-y-auto">
                        {relatedJournalEntries.map((entry, idx) => (
                          <div 
                            key={entry.id || idx} 
                            className="p-3.5 rounded-lg transition-all"
                            style={{ 
                              background: 'rgba(255,255,255,0.015)', 
                              border: editingClaimId ? '1px solid rgba(91,141,239,0.15)' : '1px solid var(--rz-border)',
                              cursor: editingClaimId ? 'pointer' : 'default'
                            }}
                            onClick={() => {
                              if (editingClaimId && entry.id) {
                                handleLinkClaimToJournalEntry(editingClaimId, entry.id);
                              }
                            }}
                          >
                            <p className="text-sm leading-relaxed line-clamp-3" style={{ color: 'var(--rz-text-primary)' }}>{entry.text}</p>
                            <p className="text-[10px] mt-2" style={{ color: 'var(--rz-text-muted)' }}>
                              {new Date(entry.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Agent Response Card - Improved Design */}
                  {agentResponse && (
                    <div className="rounded-2xl sm:rounded-3xl thinking-card overflow-hidden" data-testid="agent-response-card">
                      {/* Header */}
                      <div className="flex items-center justify-between p-4 sm:p-6 border-b border-white/[0.05]">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-orange-600/20">
                            <Bot className="w-5 h-5 text-orange-400" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-orange-400">Thinking Partner</p>
                            <p className="text-xs text-gray-600">Just now</p>
                          </div>
                        </div>
                        <button 
                          onClick={clearAndReset}
                          className="p-2 rounded-full hover:bg-white/5 transition-colors touch-target"
                        >
                          <X className="w-5 h-5 text-gray-500" />
                        </button>
                      </div>
                      
                      {/* Content */}
                      <div className="p-4 sm:p-6 space-y-4">
                        {/* What you said */}
                        <div className="thinking-card-section">
                          <p className="text-xs font-medium text-gray-500 mb-2">What you said</p>
                          <p className="text-white/90 leading-relaxed">{agentResponse.said}</p>
                        </div>
                        
                        {/* Why it matters */}
                        <div className="thinking-card-section">
                          <p className="text-xs font-medium text-gray-500 mb-2">Why it matters</p>
                          <p className="text-gray-300 leading-relaxed">{agentResponse.matters}</p>
                        </div>
                        
                        {/* Connection to prior thinking */}
                        {agentResponse.connectionToPrior && (
                          <div className="p-4 rounded-xl bg-orange-500/[0.08] border border-orange-500/20">
                            <p className="text-xs font-medium text-orange-400/80 mb-2">Connected to your earlier thinking</p>
                            <p className="text-orange-200/80 leading-relaxed text-sm">{agentResponse.connectionToPrior}</p>
                          </div>
                        )}
                        
                        {/* Next move */}
                        {agentResponse.nextMove && (
                          <div className="thinking-card-section">
                            <p className="text-xs font-medium text-gray-500 mb-2">Possible next step</p>
                            <p className="text-gray-400 leading-relaxed">{agentResponse.nextMove}</p>
                          </div>
                        )}
                        
                        {/* Question to sit with - highlighted */}
                        <div className="p-4 rounded-xl border bg-orange-500/[0.06] border-orange-500/20">
                          <p className="text-xs font-medium mb-2 text-orange-400/80">Question to sit with</p>
                          <p className="font-medium italic leading-relaxed text-orange-200">{agentResponse.question}</p>
                        </div>

                        {/* Reflective questions for Journal mode - horizontal scroll on mobile */}
                        {selectedZone === 'journal' && agentResponse.reflectiveQuestions && agentResponse.reflectiveQuestions.length > 0 && (
                          <div className="space-y-3">
                            <p className="text-xs font-medium text-gray-500">Go deeper</p>
                            <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0 scrollbar-hide">
                              <div className="flex sm:flex-wrap gap-2 min-w-max sm:min-w-0">
                                {agentResponse.reflectiveQuestions.slice(0, 5).map((q, idx) => (
                                  <button
                                    key={idx}
                                    onClick={() => {
                                      setAgentResponse(null);
                                      setResearchResult(null);
                                      setLatestAnalysis(null);
                                      setFrozenHeight(null);
                                      setMessageInput(q);
                                      setTimeout(() => textareaRef.current?.focus(), 100);
                                    }}
                                    className="px-3 py-2.5 sm:py-2 rounded-xl text-sm text-left bg-teal-500/[0.08] border border-teal-500/20 text-teal-200/80 hover:bg-teal-500/15 hover:border-teal-500/30 hover:text-teal-100 transition-all active:scale-[0.98] whitespace-nowrap sm:whitespace-normal touch-target"
                                    data-testid={`button-reflective-${idx}`}
                                  >
                                    {q}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Memory suggestion */}
                        {agentResponse.memorySuggestion.shouldSuggest && (
                          <div className="p-4 rounded-xl bg-amber-500/[0.08] border border-amber-500/20">
                            <p className="text-xs font-medium text-amber-400/80 mb-2">Worth remembering?</p>
                            <p className="text-sm text-gray-300 mb-4">{agentResponse.memorySuggestion.content}</p>
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                onClick={handlePinSuggestion}
                                className="hover:opacity-90 h-9 px-4 text-sm touch-target"
                                style={{ background: '#F37E20' }}
                                data-testid="button-pin-suggestion"
                              >
                                <Pin className="w-4 h-4 mr-2" />
                                Pin this
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={handleSkipSuggestion}
                                className="text-gray-500 hover:text-white h-9 touch-target"
                                data-testid="button-skip-suggestion"
                              >
                                Skip
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Footer */}
                      <div className="px-4 sm:px-6 py-4 border-t border-white/[0.05] flex items-center justify-between">
                        <Button
                          onClick={() => {
                            const topic = agentResponse.said || messageInput;
                            clearAndReset();
                            setSelectedZone('research');
                            setTimeout(() => setMessageInput(topic), 100);
                          }}
                          variant="ghost"
                          className="text-teal-400/70 hover:text-teal-300 hover:bg-teal-500/10 h-9 touch-target"
                          data-testid="button-research-this"
                        >
                          <Search className="w-4 h-4 mr-2" />
                          Research this
                        </Button>
                        <Button
                          onClick={clearAndReset}
                          variant="ghost"
                          className="text-gray-500 hover:text-white hover:bg-white/5 h-9 touch-target"
                        >
                          New Entry
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </div>
                    </div>
                  )}

                  {latestAnalysis && (
                    <div className="rounded-2xl sm:rounded-3xl thinking-card overflow-hidden" data-testid="insight-card">
                      {/* Header */}
                      <div className="flex items-center justify-between p-4 sm:p-6 border-b border-white/[0.05]">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-orange-600/20">
                            <Sparkles className="w-5 h-5 text-orange-400" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-orange-400">
                              {latestAnalysis.zone === "research" ? "Research Analysis" : "Insight"}
                            </p>
                            <p className="text-xs text-gray-600">Just now</p>
                          </div>
                        </div>
                        <button 
                          onClick={clearAndReset}
                          className="p-2 rounded-full hover:bg-white/5 transition-colors touch-target"
                        >
                          <X className="w-5 h-5 text-gray-500" />
                        </button>
                      </div>
                      
                      {/* Content */}
                      <div className="p-4 sm:p-6 space-y-4">
                        {latestAnalysis.zone === "journal" ? (
                          <>
                            <div className="thinking-card-section">
                              <p className="text-xs font-medium text-gray-500 mb-2">Summary</p>
                              <p className="text-white/90 leading-relaxed">{latestAnalysis.analysis.summary}</p>
                            </div>
                            
                            <div className="thinking-card-section">
                              <p className="text-xs font-medium text-gray-500 mb-2">Insight</p>
                              <p className="text-gray-300 italic leading-relaxed">"{latestAnalysis.analysis.insight}"</p>
                            </div>
                            
                            <div className="p-4 rounded-xl bg-orange-500/[0.06] border border-orange-500/20">
                              <p className="text-xs font-medium text-orange-400/80 mb-2">Reflection Question</p>
                              <p className="text-orange-200 font-medium leading-relaxed">{latestAnalysis.analysis.question}</p>
                            </div>
                            
                            {latestAnalysis.analysis.memoryCandidates.length > 0 && (
                              <div className="p-4 rounded-xl bg-amber-500/[0.06] border border-amber-500/20">
                                <p className="text-xs font-medium text-amber-400/80 mb-3">Worth Remembering</p>
                                <div className="space-y-2">
                                  {latestAnalysis.analysis.memoryCandidates.map((memory, idx) => (
                                    <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-white/[0.03] border border-white/[0.05]">
                                      <p className="flex-1 text-sm text-gray-300">{memory}</p>
                                      <Button
                                        size="sm"
                                        onClick={() => pinMemory.mutate(memory)}
                                        disabled={pinMemory.isPending}
                                        className="shrink-0 hover:opacity-90 h-8 px-3 text-xs touch-target"
                                        style={{ background: 'rgba(243,126,32,0.8)' }}
                                        data-testid={`button-pin-memory-${idx}`}
                                      >
                                        <Pin className="w-3.5 h-3.5 mr-1" />
                                        Pin
                                      </Button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </>
                        ) : (
                          <>
                            <div className="thinking-card-section">
                              <p className="text-xs font-medium text-gray-500 mb-3">Key Claims</p>
                              <ul className="space-y-2">
                                {latestAnalysis.analysis.keyClaims.map((claim, idx) => (
                                  <li key={idx} className="flex items-start gap-3">
                                    <span className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-2 shrink-0"></span>
                                    <p className="text-white/90 leading-relaxed">{claim}</p>
                                  </li>
                                ))}
                              </ul>
                            </div>
                              
                            {latestAnalysis.analysis.evidence.length > 0 && (
                              <div className="thinking-card-section">
                                <p className="text-xs font-medium text-gray-500 mb-3">Evidence</p>
                                <ul className="space-y-2">
                                  {latestAnalysis.analysis.evidence.map((item, idx) => (
                                    <li key={idx} className="flex items-start gap-3">
                                      <span className="w-1.5 h-1.5 rounded-full bg-green-400 mt-2 shrink-0"></span>
                                      <p className="text-gray-300 leading-relaxed">{item}</p>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                              
                            {latestAnalysis.analysis.unknowns.length > 0 && (
                              <div className="thinking-card-section">
                                <p className="text-xs font-medium text-gray-500 mb-3">Unknowns</p>
                                <ul className="space-y-2">
                                  {latestAnalysis.analysis.unknowns.map((item, idx) => (
                                    <li key={idx} className="flex items-start gap-3">
                                      <span className="text-amber-400 mt-1.5 shrink-0">?</span>
                                      <p className="text-gray-400 italic leading-relaxed">{item}</p>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                              
                            <div className="p-4 rounded-xl bg-orange-500/[0.06] border border-orange-500/20">
                              <p className="text-xs font-medium text-orange-400/80 mb-2">Next Question</p>
                              <p className="text-orange-200 font-medium leading-relaxed">{latestAnalysis.analysis.nextQuestion}</p>
                            </div>
                          </>
                        )}
                      </div>

                      {/* Footer */}
                      <div className="px-4 sm:px-6 py-4 border-t border-white/[0.05] flex items-center justify-between">
                        <p className="text-xs text-gray-600 italic">You don't need to resolve this now.</p>
                        <Button
                          onClick={clearAnalysis}
                          variant="ghost"
                          className="text-gray-500 hover:text-white hover:bg-white/5 h-9 touch-target"
                        >
                          New Entry
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Quick Search + Past Entries */}
              {localEntries && localEntries.length > 0 && (
                <div className="pb-12 mt-8 pt-8 border-t border-white/[0.03]">
                  <div className="flex items-center gap-3 mb-4">
                    <button
                      onClick={() => setShowHistory(!showHistory)}
                      className="flex items-center gap-2 text-xs font-medium text-gray-500 hover:text-gray-300 transition-colors touch-target"
                      data-testid="button-toggle-history"
                    >
                      <ChevronDown className={`w-4 h-4 transition-transform ${showHistory ? 'rotate-180' : ''}`} />
                      Past Entries ({localEntries.length})
                    </button>
                    <button
                      onClick={() => setQuickSearchModalOpen(true)}
                      className="flex items-center gap-1.5 text-xs font-medium transition-colors touch-target px-2.5 py-1 rounded-lg text-gray-500 hover:text-gray-300 hover:bg-white/5"
                      data-testid="button-toggle-quick-search"
                    >
                      <Search className="w-3.5 h-3.5" />
                      <span>Search</span>
                      <kbd className="hidden sm:inline-flex ml-1 px-1 py-0.5 rounded text-[9px] font-mono text-gray-600 border border-white/[0.08] bg-white/[0.03]">⌘K</kbd>
                    </button>
                  </div>

                  {showHistory && (
                        <div className="space-y-1 animate-in fade-in slide-in-from-top-2 duration-300">
                          {(() => {
                            const grouped: Record<string, typeof localEntries> = {};
                            (localEntries ?? []).forEach((entry) => {
                              const d = new Date(entry.createdAt);
                              const now = new Date();
                              const isToday = d.toDateString() === now.toDateString();
                              const isYesterday = d.toDateString() === new Date(now.getTime() - 86400000).toDateString();
                              const label = isToday ? 'Today' : isYesterday ? 'Yesterday' : format(d, "EEEE, MMM d");
                              if (!grouped[label]) grouped[label] = [];
                              grouped[label]!.push(entry);
                            });
                            return Object.entries(grouped).map(([dateLabel, entries]) => (
                              <div key={dateLabel} className="mb-3">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-600 mb-2 ml-1">{dateLabel}</p>
                                <div className="space-y-2">
                                  {entries!.map((entry) => {
                                    const isExpanded = expandedEntryId === entry.id;
                                    return (
                                      <button
                                        key={entry.id}
                                        onClick={() => setExpandedEntryId(isExpanded ? null : entry.id!)}
                                        className={`w-full text-left p-3 sm:p-4 rounded-xl border transition-all ${
                                          isExpanded
                                            ? 'bg-white/[0.04] border-orange-500/20'
                                            : 'bg-white/[0.02] border-white/[0.04] hover:border-white/[0.08]'
                                        }`}
                                        data-testid={`entry-card-${entry.id}`}
                                      >
                                        <div className="flex items-start justify-between gap-3">
                                          <div className="flex-1 min-w-0">
                                            <p className={`text-sm text-gray-400 leading-relaxed ${isExpanded ? '' : 'line-clamp-2'}`}>
                                              {entry.text}
                                            </p>
                                            {isExpanded && entry.videoPlaybackId && entry.videoAssetId && (
                                              <div className="mt-3">
                                                <VideoPlayer playbackId={entry.videoPlaybackId} assetId={entry.videoAssetId} compact />
                                              </div>
                                            )}
                                            {isExpanded && (
                                              <div className="flex items-center gap-2 mt-3">
                                                <button
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    setMessageInput(entry.text);
                                                    setExpandedEntryId(null);
                                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                                  }}
                                                  className="text-[10px] font-semibold px-2.5 py-1.5 rounded-lg bg-orange-500/10 text-orange-400 hover:bg-orange-500/20 transition-colors"
                                                  data-testid={`button-reuse-entry-${entry.id}`}
                                                >
                                                  Continue this thought
                                                </button>
                                                <button
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    const topic = entry.text.slice(0, 100);
                                                    setExpandedEntryId(null);
                                                    setSelectedZone('research');
                                                    setTimeout(() => setMessageInput(topic), 100);
                                                  }}
                                                  className="text-[10px] font-semibold px-2.5 py-1.5 rounded-lg bg-teal-500/10 text-teal-400 hover:bg-teal-500/20 transition-colors"
                                                  data-testid={`button-research-entry-${entry.id}`}
                                                >
                                                  Research this
                                                </button>
                                              </div>
                                            )}
                                          </div>
                                          <div className="flex items-center gap-2 shrink-0">
                                            {entry.videoAssetId && (
                                              <Video className="w-3.5 h-3.5 text-orange-400" />
                                            )}
                                            <span className="text-[10px] font-medium text-gray-600">
                                              {format(new Date(entry.createdAt), "h:mm a")}
                                            </span>
                                            <ChevronDown className={`w-3.5 h-3.5 text-gray-600 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                                          </div>
                                        </div>
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            ));
                          })()}
                        </div>
                      )}
                </div>
              )}
            </div>
            )}
          </div>
        </main>

        {/* Right Sidebar - Insight & Memory Drawer */}
        {memoryDrawerOpen && (
          <>
            {/* Mobile overlay backdrop */}
            <div 
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 md:hidden" 
              onClick={() => setMemoryDrawerOpen(false)}
            />
            <aside className="fixed md:relative right-0 top-0 bottom-0 md:inset-auto z-50 md:z-auto w-[85%] max-w-sm md:w-80 border-l border-white/[0.05] flex flex-col md:bg-[#1a1d26]/80 backdrop-blur-xl animate-in slide-in-from-right duration-300" style={{ background: '#1a1d26' }}>
              <Tabs defaultValue="memories" className="flex-1 flex flex-col">
                <div className="px-5 pt-5 pb-4 border-b border-white/[0.04]">
                  <div className="flex items-center justify-between mb-4 md:hidden">
                    <h3 className="text-lg font-bold text-white">Memory & Insights</h3>
                    <button 
                      onClick={() => setMemoryDrawerOpen(false)}
                      className="p-2.5 rounded-full bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-colors touch-target"
                      data-testid="button-close-memory"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <TabsList className="w-full bg-white/[0.03] p-1 rounded-xl h-11">
                    <TabsTrigger value="memories" className="flex-1 h-9 text-xs font-medium rounded-lg data-[state=active]:bg-orange-600/20 data-[state=active]:text-orange-300">
                      <Pin className="w-3.5 h-3.5 mr-2" />
                      Memories
                    </TabsTrigger>
                    <TabsTrigger value="insights" className="flex-1 h-9 text-xs font-medium rounded-lg data-[state=active]:bg-orange-600/20 data-[state=active]:text-orange-300">
                      <Sparkles className="w-3.5 h-3.5 mr-2" />
                      Insights
                    </TabsTrigger>
                  </TabsList>
                </div>

              <TabsContent value="memories" className="flex-1 flex flex-col mt-0 data-[state=inactive]:hidden">
                <div className="px-5 py-3 border-b border-white/[0.03]">
                  <p className="text-xs text-gray-500 font-medium">{localMemories?.length || 0} patterns saved</p>
                </div>
                <ScrollArea className="flex-1">
                  <div className="p-4 space-y-3">
                    {!localMemories || localMemories.length === 0 ? (
                      <div className="text-center py-12 px-4">
                        <div className="w-12 h-12 rounded-2xl bg-white/[0.03] flex items-center justify-center mx-auto mb-4">
                          <Pin className="w-6 h-6 text-gray-600" />
                        </div>
                        <p className="text-sm text-gray-500 font-medium">No patterns pinned yet</p>
                        <p className="text-xs text-gray-600 mt-2 leading-relaxed">Pin patterns worth remembering from your entries</p>
                      </div>
                    ) : (
                      localMemories.map((memory) => (
                        <div key={memory.id} className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] entry-card">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="text-[9px] font-medium border-orange-500/30 text-orange-400/70 px-2 py-0.5">
                              {memory.kind}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-300 leading-relaxed mb-3">
                            {memory.content}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-600">
                              {format(new Date(memory.createdAt), "MMM d, yyyy")}
                            </span>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => memory.id && handleForgetMemory(memory.id)}
                              className="text-gray-500 hover:text-red-400 hover:bg-red-500/10 h-8 px-3 text-xs touch-target"
                              data-testid={`button-forget-memory-${memory.id}`}
                            >
                              Forget
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
                <div className="p-4 border-t border-white/[0.04] space-y-3">
                  <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${storagePersisted ? 'bg-green-400' : 'bg-yellow-400'}`} />
                      <span className="text-[10px] text-gray-500" data-testid="text-storage-status">
                        {storagePersisted === null ? 'Checking...' : storagePersisted ? 'Persistent storage: On' : 'Persistent storage: Off'}
                      </span>
                    </div>
                    {storagePersisted === false && (
                      <button
                        className="text-[10px] text-orange-400 hover:text-orange-300 font-medium"
                        onClick={async () => {
                          const granted = await requestPersistentStorage();
                          setStoragePersisted(granted);
                          toast({ title: granted ? "Persistent storage enabled" : "Browser denied persistent storage", description: granted ? "Your data is now protected from automatic cleanup" : "Your browser may clear data under storage pressure. Back up regularly." });
                        }}
                        data-testid="button-enable-persist"
                      >
                        Enable
                      </button>
                    )}
                  </div>
                  <p className="text-[10px] text-gray-600 px-1" data-testid="text-last-backup">
                    Last backup: {lastBackupDate ? format(new Date(lastBackupDate), "MMM d, yyyy 'at' h:mm a") : 'never'}
                  </p>
                  <Button 
                    variant="outline" 
                    className="w-full border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] text-gray-500 hover:text-white h-11 rounded-xl font-medium text-xs transition-all touch-target"
                    disabled={isExporting}
                    onClick={async () => {
                      setIsExporting(true);
                      try {
                        const blob = await exportVaultAsZip();
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `djzs-vault-${new Date().toISOString().split('T')[0]}.zip`;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        URL.revokeObjectURL(url);
                        setLastBackupDateState(getLastBackupDate());
                        toast({ title: "Vault exported", description: "ZIP archive downloaded (JSON + Markdown)" });
                      } catch (err) {
                        toast({ title: "Export failed", description: "Could not export vault data", variant: "destructive" });
                      } finally {
                        setIsExporting(false);
                      }
                    }}
                    data-testid="button-export-vault"
                  >
                    {isExporting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
                    {isExporting ? 'Exporting...' : 'Export Vault (.zip)'}
                  </Button>
                  <input
                    ref={importFileRef}
                    type="file"
                    accept=".zip,.json"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      setIsImporting(true);
                      try {
                        const result = file.name.endsWith('.zip')
                          ? await importVaultFromZip(file)
                          : await importVaultFromJson(file);
                        const totalAdded = result.entriesAdded + result.insightsAdded + result.pinsAdded + result.dossiersAdded + result.queriesAdded + result.claimsAdded + result.musicTracksAdded;
                        const totalSkipped = result.entriesSkipped + result.insightsSkipped + result.pinsSkipped + result.dossiersSkipped + result.queriesSkipped + result.claimsSkipped + result.musicTracksSkipped;
                        toast({
                          title: "Import complete",
                          description: `Added ${totalAdded} items, skipped ${totalSkipped} duplicates`,
                        });
                      } catch (err: any) {
                        toast({ title: "Import failed", description: err.message || "Could not import vault data", variant: "destructive" });
                      } finally {
                        setIsImporting(false);
                        if (importFileRef.current) importFileRef.current.value = '';
                      }
                    }}
                    data-testid="input-import-file"
                  />
                  <Button
                    variant="outline"
                    className="w-full border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] text-gray-500 hover:text-white h-11 rounded-xl font-medium text-xs transition-all touch-target"
                    disabled={isImporting}
                    onClick={() => importFileRef.current?.click()}
                    data-testid="button-import-vault"
                  >
                    {isImporting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
                    {isImporting ? 'Importing...' : 'Import Backup (.zip / .json)'}
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="insights" className="flex-1 flex flex-col mt-0 data-[state=inactive]:hidden">
                <div className="px-5 py-3 border-b border-white/[0.03]">
                  <p className="text-xs text-gray-500 font-medium">Latest thinking</p>
                </div>
                <ScrollArea className="flex-1">
                  <div className="p-4 space-y-3">
                    {agentResponse ? (
                      <div className="p-4 rounded-xl bg-orange-500/[0.05] border border-orange-500/20">
                        <div className="flex items-center gap-2 mb-3">
                          <Bot className="w-4 h-4 text-orange-400" />
                          <span className="text-xs font-medium text-orange-400">
                            Thinking Partner
                          </span>
                        </div>
                        <div className="space-y-3">
                          <p className="text-sm text-white/90 leading-relaxed">{agentResponse.said}</p>
                          <p className="text-xs text-gray-500 leading-relaxed">{agentResponse.matters}</p>
                          <p className="text-sm text-orange-300 italic leading-relaxed">{agentResponse.question}</p>
                        </div>
                        <p className="text-xs text-gray-600 mt-4">Just now</p>
                      </div>
                    ) : (
                      <div className="text-center py-12 px-4">
                        <div className="w-12 h-12 rounded-2xl bg-white/[0.03] flex items-center justify-center mx-auto mb-4">
                          <Bot className="w-6 h-6 text-gray-600" />
                        </div>
                        <p className="text-sm text-gray-500 font-medium">No thinking yet</p>
                        <p className="text-xs text-gray-600 mt-2 leading-relaxed">Write an entry and click "Think with me"</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>
              </Tabs>
            </aside>
          </>
        )}
      </div>
    </TooltipProvider>

    <MusicPanel isOpen={showMusicPanel} onClose={() => setShowMusicPanel(false)} />
    <QuickSearch
      open={quickSearchModalOpen}
      onClose={() => setQuickSearchModalOpen(false)}
      onSelectEntry={(entry) => {
        setMessageInput(entry.text);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }}
    />
    </>
  );
}
