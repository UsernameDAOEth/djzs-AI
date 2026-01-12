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
  LogOut
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
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Member, ChatMessage, StoredMessage, JournalAnalysis, ResearchAnalysis, JournalEntry, PinnedMemory } from "@shared/schema";
import { format } from "date-fns";
import { useLiveQuery } from "dexie-react-hooks";
import { 
  vault, 
  saveEntry, 
  saveInsight, 
  getActiveMemories, 
  getMemoriesForAgent, 
  pinMemory as pinLocalMemory, 
  forgetMemory,
  getEntryStats,
  getRecentEntriesForContext,
  type MemoryPin,
  type EntryType,
  type EntryStats
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
  { id: "journal", name: "Journal", icon: BookOpen, description: "Personal reflection", purpose: "Your private space to think, reflect, and extract insight." },
  { id: "research", name: "Research", icon: Search, description: "Information gathering", purpose: "Collective context and verified intelligence." },
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
  const [lastEntryId, setLastEntryId] = useState<number | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Local-first: Query memories from IndexedDB
  const localMemories = useLiveQuery(() => getActiveMemories(10), []);
  
  // Local-first: Query recent entries from IndexedDB (newest first)
  const localEntries = useLiveQuery(
    () => vault.entries
      .where('type')
      .equals(selectedZone)
      .toArray()
      .then(entries => entries.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, 10)),
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
  }, [selectedZone]);

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
      toast({
        title: "Welcome to DJZS",
        description: "Your journal is ready.",
      });
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
      
      // 3. Save entry locally
      const entryId = await saveEntry(mode, content);
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
    await forgetMemory(id);
    toast({
      title: "Memory forgotten",
      description: "This will no longer be used for context.",
    });
  };

  const [pinDialogOpen, setPinDialogOpen] = useState(false);
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

  const handleSendText = () => {
    if (!messageInput.trim() || !address || sendMessage.isPending) return;
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
    if (!messageInput.trim() || thinkWithMe.isPending) return;
    if (textareaRef.current) {
      setFrozenHeight(textareaRef.current.scrollHeight);
    }
    setIsAnalyzing(true);
    setAgentResponse(null);
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
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-6">
        <div className="text-center max-w-sm">
          <div className="w-20 h-20 rounded-3xl bg-purple-600/10 flex items-center justify-center mx-auto mb-8 border border-purple-500/20">
            <Shield className="w-10 h-10 text-purple-400" />
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
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
      </div>
    );
  }

  if (!member) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <h2 className="text-3xl font-black text-white mb-4 tracking-tight">Initialize Your Zone</h2>
          <p className="text-gray-400 mb-8">Ready to start extracting insight from your daily thinking?</p>
          <Button
            onClick={() => registerMember.mutate()}
            disabled={registerMember.isPending}
            className="bg-purple-600 hover:bg-purple-700 h-14 px-10 rounded-2xl font-bold text-lg shadow-xl shadow-purple-900/20"
          >
            {registerMember.isPending && <Loader2 className="w-5 h-5 mr-3 animate-spin" />}
            Open Journal
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
    <TooltipProvider>
      <div className="h-screen bg-[#050505] text-gray-300 flex overflow-hidden font-sans selection:bg-purple-500/30">
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
          w-64 h-full border-r border-white/[0.03] flex flex-col bg-[#050505] md:bg-black/20 
          transition-all duration-300 
          ${isFocused && !mobileSidebarOpen ? 'md:opacity-40' : 'opacity-100'}
        `}>
          <div className="p-8 pb-4 flex items-center justify-between">
            <Link href="/">
              <button className="flex items-center gap-2 text-sm font-black text-white tracking-[0.2em] uppercase opacity-40 hover:opacity-100 hover:text-purple-400 transition-all group">
                <Home className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
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
                  <Icon className={`w-5 h-5 transition-colors ${isActive ? "text-purple-400" : "text-gray-600 group-hover:text-gray-400"}`} />
                  <span className="text-sm font-bold tracking-tight">{zone.name}</span>
                  {isActive && <div className="ml-auto w-1 h-1 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.5)]"></div>}
                </button>
              );
            })}
          </nav>

          <div className="p-4 mt-auto">
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.03]">
              <div className="flex items-center gap-3 mb-3">
                {primaryProfile?.avatar ? (
                  <img 
                    src={primaryProfile.avatar} 
                    alt={primaryProfile.displayName} 
                    className="w-10 h-10 rounded-full border border-purple-500/20 object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-purple-600/20 flex items-center justify-center text-sm font-black text-purple-400 border border-purple-500/20">
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
                      className="p-1.5 rounded-lg bg-white/[0.02] hover:bg-white/[0.05] text-gray-500 hover:text-purple-400 transition-colors"
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
                onClick={() => disconnect()}
                className="mt-3 w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-white/[0.02] hover:bg-red-500/10 text-gray-500 hover:text-red-400 transition-colors border border-white/[0.03] hover:border-red-500/20"
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
          <header className="h-14 sm:h-16 md:h-20 flex items-center justify-between px-3 sm:px-4 md:px-10 bg-[#050505]/80 backdrop-blur-xl border-b border-white/[0.03] sticky top-0 z-30">
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
              {/* Status badges - hidden on mobile */}
              <div className="hidden lg:flex items-center gap-4 px-4 py-2 rounded-full bg-white/[0.02] border border-white/[0.04]">
                <div className="flex items-center gap-2">
                  <Lock className="w-3 h-3 text-green-500/50" />
                  <span className="text-[10px] font-medium text-gray-500">E2E Private</span>
                </div>
                <div className="w-px h-3 bg-white/10"></div>
                <div className="flex items-center gap-2">
                  <Bot className="w-3 h-3 text-purple-500/50" />
                  <span className="text-[10px] font-medium text-gray-500">Thinking Partner</span>
                </div>
              </div>
              
              {/* Memory/Insights toggle button */}
              <button 
                onClick={() => setMemoryDrawerOpen(!memoryDrawerOpen)}
                className={`p-2.5 rounded-xl transition-all touch-target ${memoryDrawerOpen ? 'bg-purple-600/15 text-purple-400' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
                data-testid="button-toggle-memory"
              >
                <Zap className="w-5 h-5" />
              </button>
            </div>
          </header>

          {/* Main Content Area - scrollable */}
          <div className={`flex-1 overflow-y-auto scroll-smooth ${selectedZone === 'journal' ? 'zone-journal' : 'zone-research'}`}>
            <div className="flex flex-col max-w-2xl w-full mx-auto px-4 sm:px-8">
              {/* Writing Area - vertically centered, min 70vh */}
              <div className="flex-1 flex flex-col justify-center min-h-[60vh] sm:min-h-[70vh] py-8 sm:py-12">
                {/* Stats bar - streak, last entry, total */}
                {entryStats && entryStats.totalEntries > 0 && (
                  <div className="flex flex-wrap items-center gap-2 sm:gap-4 mb-8 p-3 sm:p-4 rounded-2xl bg-white/[0.02] border border-white/[0.04] animate-in fade-in duration-500">
                    {entryStats.streak > 0 && (
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-500/10" data-testid="streak-badge">
                        <span className="text-sm">🔥</span>
                        <span className="text-xs font-bold text-orange-400 tabular-nums">
                          {entryStats.streak} day{entryStats.streak !== 1 ? 's' : ''}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.03]">
                      <Clock className="w-3.5 h-3.5 text-gray-500" />
                      <span className="text-xs font-medium text-gray-400">
                        {entryStats.daysSinceLastEntry === 0 
                          ? "Today" 
                          : entryStats.daysSinceLastEntry === 1 
                            ? "Yesterday" 
                            : `${entryStats.daysSinceLastEntry} days ago`}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.03]">
                      <BookOpen className="w-3.5 h-3.5 text-gray-500" />
                      <span className="text-xs font-medium text-gray-400">
                        {entryStats.totalEntries} {entryStats.totalEntries === 1 ? 'entry' : 'entries'}
                      </span>
                    </div>
                  </div>
                )}
                
                {/* First time welcome */}
                {entryStats && entryStats.totalEntries === 0 && (
                  <div className="mb-6 sm:mb-8 p-3 sm:p-4 rounded-2xl bg-purple-500/[0.03] border border-purple-500/10 animate-in fade-in duration-700" data-testid="first-time-welcome">
                    <p className="text-[10px] sm:text-[11px] font-black text-purple-400/70 uppercase tracking-widest mb-2">First entry</p>
                    <p className="text-xs sm:text-sm text-gray-400 leading-relaxed break-words">
                      Write whatever's on your mind. The more you return, the more this becomes yours.
                    </p>
                  </div>
                )}
                
                {/* Prompt hint */}
                <p className={`text-sm sm:text-base font-medium mb-4 transition-all duration-500 break-words ${isFocused ? 'opacity-100 text-purple-300/70' : 'opacity-60 text-gray-400'} ${selectedZone === 'research' ? 'text-blue-300/70' : ''}`}>
                  {currentPrompts[currentPromptIndex]}
                </p>
                
                {/* Textarea - refined focus state */}
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
                    placeholder={selectedZone === 'journal' 
                      ? "Write what you're thinking. No formatting. No pressure." 
                      : "What are you researching? Capture your findings here."
                    }
                    className={`w-full bg-transparent border-none outline-none focus:ring-0 text-lg sm:text-xl font-normal text-white/95 placeholder:text-gray-600 resize-none leading-[1.9] tracking-normal p-4 sm:p-6 overflow-hidden ${isFocused ? 'placeholder:text-gray-500' : ''}`}
                    style={{ 
                      minHeight: frozenHeight ? undefined : 'max(180px, calc(50vh - 100px))',
                      height: frozenHeight ? `${frozenHeight}px` : 'auto'
                    }}
                    data-testid="textarea-journal"
                  />
                </div>

                {/* Action bar - mobile optimized */}
                <div className={`flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mt-6 sm:mt-8 py-4 transition-all duration-500 ${isFocused ? 'opacity-100' : 'opacity-60'}`}>
                  {/* Character count and shortcuts - hidden on mobile */}
                  <div className="hidden sm:flex items-center gap-6">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 group cursor-default">
                        <kbd className="px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-[9px] font-semibold text-gray-500 group-hover:border-purple-500/30 group-hover:text-purple-400 transition-colors">Enter</kbd>
                        <span className="text-[10px] font-medium text-gray-600 group-hover:text-gray-400 transition-colors">Save</span>
                      </div>
                      <div className="flex items-center gap-2 group cursor-default">
                        <kbd className="px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-[9px] font-semibold text-gray-500 group-hover:border-purple-500/30 group-hover:text-purple-400 transition-colors">⌘ Enter</kbd>
                        <span className="text-[10px] font-medium text-gray-600 group-hover:text-gray-400 transition-colors">Think</span>
                      </div>
                    </div>
                    
                    <div className="h-4 w-px bg-white/10" />
                    
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full transition-colors duration-500 ${messageInput.length > 0 ? 'bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.5)]' : 'bg-gray-800'}`} />
                      <span className={`text-xs font-medium tabular-nums transition-colors ${messageInput.length > 0 ? 'text-gray-400' : 'text-gray-600'}`}>
                        {messageInput.length.toLocaleString()} chars
                      </span>
                    </div>
                  </div>

                  {/* Action buttons - stacked on mobile */}
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
                    {/* Secondary actions row on mobile */}
                    <div className="flex gap-2 sm:contents">
                      <Dialog open={pinDialogOpen} onOpenChange={setPinDialogOpen}>
                        <DialogTrigger asChild>
                          <Button
                            disabled={!messageInput.trim()}
                            variant="ghost"
                            className="flex-1 sm:flex-none h-11 sm:h-10 px-4 rounded-xl font-medium text-sm text-gray-500 hover:text-purple-400 hover:bg-purple-500/10 transition-all active:scale-95 touch-target"
                            data-testid="button-pin"
                          >
                            <Pin className="w-4 h-4 mr-2" />
                            Pin
                          </Button>
                        </DialogTrigger>
                      <DialogContent className="bg-[#0a0a0a] border-white/10 max-w-md p-8 rounded-[2rem] shadow-2xl">
                        <DialogHeader>
                          <DialogTitle className="text-xl font-black text-white uppercase tracking-tight">Pin Memory</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-8 py-4">
                          <p className="text-sm text-gray-500 leading-relaxed font-medium">This thought will be stored in your local vault and used as context for future thinking partners.</p>
                          
                          <div className="relative group">
                            <div className="absolute -inset-2 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
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
                                      ? "bg-purple-600 text-white shadow-lg shadow-purple-900/40 border-transparent" 
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
                            className="w-full bg-purple-600 hover:bg-purple-500 h-14 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-purple-900/20 transition-all active:scale-[0.98]"
                            data-testid="button-confirm-pin"
                          >
                            <Pin className="w-4 h-4 mr-2" />
                            Secure to Vault
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>

                      <Button
                        onClick={handleSendText}
                        disabled={!messageInput.trim() || sendMessage.isPending}
                        variant="ghost"
                        className="flex-1 sm:flex-none h-11 sm:h-10 px-4 rounded-xl font-medium text-sm text-gray-500 hover:text-white hover:bg-white/5 transition-all active:scale-95 touch-target"
                        data-testid="button-save"
                      >
                        {sendMessage.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                          <>
                            <FileText className="w-4 h-4 mr-2 opacity-50" />
                            Save
                          </>
                        )}
                      </Button>
                    </div>

                    {/* Primary action - full width on mobile */}
                    <Button
                      onClick={handleAnalyze}
                      disabled={!messageInput.trim() || thinkWithMe.isPending || isAnalyzing}
                      className={`w-full sm:w-auto h-12 sm:h-11 px-6 sm:px-8 rounded-xl sm:rounded-2xl font-semibold text-sm shadow-lg transition-all active:scale-95 action-btn-glow touch-target ${
                        selectedZone === 'research' 
                          ? 'bg-blue-600 hover:bg-blue-500 shadow-blue-900/40' 
                          : 'bg-purple-600 hover:bg-purple-500 shadow-purple-900/40'
                      }`}
                      data-testid="button-analyze"
                    >
                      {isAnalyzing ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          Thinking...
                        </>
                      ) : (
                        <>
                          <Bot className="w-4 h-4 mr-2" />
                          Think with me
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Insight appears below text when analyzing is complete */}
              {(isAnalyzing || agentResponse || latestAnalysis) && (
                <div className="pb-12 sm:pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
                  {isAnalyzing && !agentResponse && !latestAnalysis && (
                    <div className="p-6 sm:p-8 rounded-2xl sm:rounded-3xl thinking-card" data-testid="analyzing-loader">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-purple-600/20 flex items-center justify-center">
                          <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400 animate-spin" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-purple-400 mb-1">Thinking...</p>
                          <p className="text-sm text-gray-500">Processing your entry</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Agent Response Card - Improved Design */}
                  {agentResponse && (
                    <div className="rounded-2xl sm:rounded-3xl thinking-card overflow-hidden" data-testid="agent-response-card">
                      {/* Header */}
                      <div className="flex items-center justify-between p-4 sm:p-6 border-b border-white/[0.05]">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${selectedZone === 'research' ? 'bg-blue-600/20' : 'bg-purple-600/20'}`}>
                            <Bot className={`w-5 h-5 ${selectedZone === 'research' ? 'text-blue-400' : 'text-purple-400'}`} />
                          </div>
                          <div>
                            <p className={`text-sm font-semibold ${selectedZone === 'research' ? 'text-blue-400' : 'text-purple-400'}`}>Thinking Partner</p>
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
                          <div className="p-4 rounded-xl bg-blue-500/[0.08] border border-blue-500/20">
                            <p className="text-xs font-medium text-blue-400/80 mb-2">Connected to your earlier thinking</p>
                            <p className="text-blue-200/80 leading-relaxed text-sm">{agentResponse.connectionToPrior}</p>
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
                        <div className={`p-4 rounded-xl border ${selectedZone === 'research' ? 'bg-blue-500/[0.06] border-blue-500/20' : 'bg-purple-500/[0.06] border-purple-500/20'}`}>
                          <p className={`text-xs font-medium mb-2 ${selectedZone === 'research' ? 'text-blue-400/80' : 'text-purple-400/80'}`}>Question to sit with</p>
                          <p className={`font-medium italic leading-relaxed ${selectedZone === 'research' ? 'text-blue-200' : 'text-purple-200'}`}>{agentResponse.question}</p>
                        </div>

                        {/* Memory suggestion */}
                        {agentResponse.memorySuggestion.shouldSuggest && (
                          <div className="p-4 rounded-xl bg-amber-500/[0.08] border border-amber-500/20">
                            <p className="text-xs font-medium text-amber-400/80 mb-2">Worth remembering?</p>
                            <p className="text-sm text-gray-300 mb-4">{agentResponse.memorySuggestion.content}</p>
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                onClick={handlePinSuggestion}
                                className="bg-purple-600 hover:bg-purple-500 h-9 px-4 text-sm touch-target"
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
                        <p className="text-xs text-gray-600 italic">You don't need to resolve this now.</p>
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
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${latestAnalysis.zone === 'research' ? 'bg-blue-600/20' : 'bg-purple-600/20'}`}>
                            <Sparkles className={`w-5 h-5 ${latestAnalysis.zone === 'research' ? 'text-blue-400' : 'text-purple-400'}`} />
                          </div>
                          <div>
                            <p className={`text-sm font-semibold ${latestAnalysis.zone === 'research' ? 'text-blue-400' : 'text-purple-400'}`}>
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
                            
                            <div className="p-4 rounded-xl bg-purple-500/[0.06] border border-purple-500/20">
                              <p className="text-xs font-medium text-purple-400/80 mb-2">Reflection Question</p>
                              <p className="text-purple-200 font-medium leading-relaxed">{latestAnalysis.analysis.question}</p>
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
                                        className="shrink-0 bg-purple-600/80 hover:bg-purple-500 h-8 px-3 text-xs touch-target"
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
                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 shrink-0"></span>
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
                              
                            <div className="p-4 rounded-xl bg-blue-500/[0.06] border border-blue-500/20">
                              <p className="text-xs font-medium text-blue-400/80 mb-2">Next Question</p>
                              <p className="text-blue-200 font-medium leading-relaxed">{latestAnalysis.analysis.nextQuestion}</p>
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

              {/* Past Entries - Collapsible (Local-first) */}
              {localEntries && localEntries.length > 0 && (
                <div className="pb-12 mt-8 pt-8 border-t border-white/[0.03]">
                  <button
                    onClick={() => setShowHistory(!showHistory)}
                    className="flex items-center gap-2 text-xs font-medium text-gray-500 hover:text-gray-300 transition-colors mb-4 touch-target"
                    data-testid="button-toggle-history"
                  >
                    <ChevronDown className={`w-4 h-4 transition-transform ${showHistory ? 'rotate-180' : ''}`} />
                    Past Entries ({localEntries.length})
                  </button>
                  
                  {showHistory && (
                    <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                      {localEntries.slice(0, 10).map((entry) => (
                        <div 
                          key={entry.id} 
                          className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] entry-card"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-gray-400 leading-relaxed line-clamp-3">
                                {entry.text}
                              </p>
                            </div>
                            <span className="text-xs font-medium text-gray-600 shrink-0">
                              {format(new Date(entry.createdAt), "MMM d")}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
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
            <aside className="fixed md:relative right-0 top-0 bottom-0 md:inset-auto z-50 md:z-auto w-[85%] max-w-sm md:w-80 border-l border-white/[0.05] flex flex-col bg-[#080808] md:bg-black/20 backdrop-blur-xl animate-in slide-in-from-right duration-300">
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
                    <TabsTrigger value="memories" className="flex-1 h-9 text-xs font-medium rounded-lg data-[state=active]:bg-purple-600/20 data-[state=active]:text-purple-300">
                      <Pin className="w-3.5 h-3.5 mr-2" />
                      Memories
                    </TabsTrigger>
                    <TabsTrigger value="insights" className="flex-1 h-9 text-xs font-medium rounded-lg data-[state=active]:bg-purple-600/20 data-[state=active]:text-purple-300">
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
                            <Badge variant="outline" className="text-[9px] font-medium border-purple-500/30 text-purple-400/70 px-2 py-0.5">
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
                <div className="p-4 border-t border-white/[0.04]">
                  <Button variant="outline" className="w-full border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] text-gray-500 hover:text-white h-11 rounded-xl font-medium text-xs transition-all touch-target">
                    <Download className="w-4 h-4 mr-2" />
                    Export Vault
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
                      <div className="p-4 rounded-xl bg-purple-500/[0.05] border border-purple-500/20">
                        <div className="flex items-center gap-2 mb-3">
                          <Bot className="w-4 h-4 text-purple-400" />
                          <span className="text-xs font-medium text-purple-400">
                            Thinking Partner
                          </span>
                        </div>
                        <div className="space-y-3">
                          <p className="text-sm text-white/90 leading-relaxed">{agentResponse.said}</p>
                          <p className="text-xs text-gray-500 leading-relaxed">{agentResponse.matters}</p>
                          <p className="text-sm text-purple-300 italic leading-relaxed">{agentResponse.question}</p>
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
  );
}
