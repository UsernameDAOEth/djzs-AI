import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useAccount, useSignMessage } from "wagmi";
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
  Menu
} from "lucide-react";
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
  type MemoryPin,
  type EntryType
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

interface AgentResponse {
  said: string;
  matters: string;
  nextMove: string;
  question: string;
  memorySuggestion: {
    shouldSuggest: boolean;
    content: string;
    kind: string;
  };
}

export default function Chat() {
  const { address, isConnected } = useAccount();
  const { toast } = useToast();
  const { displayName, ensName } = useDisplayName(address);
  const { client: xmtpClient, isConnecting: xmtpConnecting, connect: connectXmtp } = useXmtp();
  const { signMessageAsync } = useSignMessage();
  
  const [selectedZone, setSelectedZone] = useState(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      return params.get("zone") === "research" ? "research" : "journal";
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

  const currentPrompts = selectedZone === "research" ? RESEARCH_PROMPTS : JOURNAL_PROMPTS;

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPromptIndex((prev) => (prev + 1) % currentPrompts.length);
    }, 10000);
    return () => clearInterval(interval);
  }, [currentPrompts.length]);

  useEffect(() => {
    setCurrentPromptIndex(0);
  }, [selectedZone]);

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
      // 1. Save entry locally first
      const entryId = await saveEntry(mode, content);
      setLastEntryId(entryId);
      
      // 2. Get pinned memories for context
      const memories = await getMemoriesForAgent();
      
      // 3. Call agent API
      const res = await apiRequest("POST", "/api/agent/analyze", {
        mode,
        intent: "clarity",
        entry: content,
        pinnedMemory: memories,
      });
      const response = await res.json() as AgentResponse;
      
      // 4. Save insight locally
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

          <div className="p-6 mt-auto">
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.03] flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-purple-600/20 flex items-center justify-center text-[10px] font-black text-purple-400 border border-purple-500/20">
                {displayName.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-white truncate uppercase tracking-wider">{ensName || formatAddress(address || "")}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <div className="w-1 h-1 rounded-full bg-green-500 shadow-[0_0_4px_rgba(34,197,94,0.5)]"></div>
                  <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest">Connected</span>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Interface */}
        <main className="flex-1 flex flex-col relative">
          {/* Transparent Glassy Header */}
          <header className="h-16 md:h-20 flex items-center justify-between px-4 md:px-10 bg-[#050505]/80 backdrop-blur-xl border-b border-white/[0.02] sticky top-0 z-30">
            <div className="flex items-center gap-3">
              {/* Hamburger menu for mobile */}
              <button 
                onClick={() => setMobileSidebarOpen(true)}
                className="md:hidden p-2 text-gray-500 hover:text-white"
                data-testid="button-open-sidebar"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div className="flex flex-col">
                <h2 className="text-lg md:text-xl font-black text-white tracking-tight">{currentZone.name}</h2>
                <p className="text-[10px] md:text-xs text-gray-500 font-medium mt-0.5 hidden sm:block">{currentZone.purpose}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 md:gap-3">
              {/* Status badges - hidden on mobile */}
              <div className="hidden md:flex items-center gap-4 px-4 py-2 rounded-full bg-white/[0.02] border border-white/[0.03]">
                <div className="flex items-center gap-2">
                  <Lock className="w-3 h-3 text-green-500/50" />
                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">E2E Private</span>
                </div>
                <div className="w-px h-3 bg-white/10"></div>
                <div className="flex items-center gap-2">
                  <Bot className="w-3 h-3 text-purple-500/50" />
                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Thinking Partner</span>
                </div>
              </div>
              
              {/* Memory/Insights toggle button */}
              <button 
                onClick={() => setMemoryDrawerOpen(!memoryDrawerOpen)}
                className={`p-2.5 md:p-3 rounded-full transition-all ${memoryDrawerOpen ? 'bg-purple-600/10 text-purple-400' : 'text-gray-600 hover:text-white hover:bg-white/5'}`}
                data-testid="button-toggle-memory"
              >
                <Zap className="w-5 h-5" />
              </button>
            </div>
          </header>

          {/* Inline Writing Experience - scrollable */}
          <div className="flex-1 overflow-y-auto">
            <div className="flex flex-col max-w-3xl w-full mx-auto px-6">
              {/* Writing Area - vertically centered, min 70vh */}
              <div className="flex-1 flex flex-col justify-center min-h-[70vh] py-12">
                {/* Prompt hint */}
                <p className={`text-purple-400/40 text-sm font-medium mb-6 transition-opacity duration-500 ${isFocused ? 'opacity-100' : 'opacity-60'}`}>
                  {currentPrompts[currentPromptIndex]}
                </p>
                
                {/* Textarea - no visible box, glow on focus only */}
                <div className={`relative transition-all duration-300 ${isFocused ? 'ring-1 ring-purple-500/20 shadow-[0_0_60px_-15px_rgba(168,85,247,0.15)] rounded-3xl bg-purple-500/[0.01]' : ''}`}>
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
                    className="w-full bg-transparent border-none outline-none focus:ring-0 text-xl font-medium text-white placeholder:text-gray-700 resize-none leading-[1.8] tracking-tight p-6 overflow-hidden"
                    style={{ 
                      minHeight: frozenHeight ? undefined : 'max(200px, calc(60vh - 100px))',
                      height: frozenHeight ? `${frozenHeight}px` : 'auto'
                    }}
                    data-testid="textarea-journal"
                  />
                </div>

                {/* Action bar - persistent footer */}
                <div className={`flex items-center justify-between mt-8 py-4 border-t border-white/[0.05] transition-all duration-500 ${isFocused ? 'opacity-100 translate-y-0' : 'opacity-40 translate-y-2'}`}>
                  <div className="flex items-center gap-8">
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-2 group cursor-default">
                        <kbd className="px-2 py-1 rounded bg-white/5 border border-white/10 text-[9px] font-black text-gray-400 group-hover:border-purple-500/30 group-hover:text-purple-400 transition-colors">Enter</kbd>
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest group-hover:text-gray-300 transition-colors">Commit</span>
                      </div>
                      <div className="flex items-center gap-2 group cursor-default">
                        <kbd className="px-2 py-1 rounded bg-white/5 border border-white/10 text-[9px] font-black text-gray-400 group-hover:border-purple-500/30 group-hover:text-purple-400 transition-colors">⌘ Enter</kbd>
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest group-hover:text-gray-300 transition-colors">Analyze</span>
                      </div>
                    </div>
                    
                    <div className="h-4 w-px bg-white/10" />
                    
                    <div className="flex items-center gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full transition-colors duration-500 ${messageInput.length > 0 ? 'bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.5)]' : 'bg-gray-800'}`} />
                      <span className={`text-[10px] font-black tabular-nums tracking-widest transition-colors ${messageInput.length > 0 ? 'text-gray-400' : 'text-gray-700'}`}>
                        {messageInput.length.toLocaleString()} <span className="text-[8px] opacity-50">CHARS</span>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <Dialog open={pinDialogOpen} onOpenChange={setPinDialogOpen}>
                      <DialogTrigger asChild>
                        <Button
                          disabled={!messageInput.trim()}
                          variant="ghost"
                          className="h-10 px-4 rounded-xl font-bold text-[11px] uppercase tracking-widest text-gray-500 hover:text-purple-400 hover:bg-purple-500/10 transition-all active:scale-95"
                          data-testid="button-pin"
                        >
                          <Pin className="w-3.5 h-3.5 mr-2" />
                          Pin Pattern
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
                      className="h-10 px-4 rounded-xl font-bold text-[11px] uppercase tracking-widest text-gray-500 hover:text-white hover:bg-white/5 transition-all active:scale-95"
                      data-testid="button-save"
                    >
                      {sendMessage.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : (
                        <>
                          <FileText className="w-3.5 h-3.5 mr-2 opacity-50" />
                          Commit
                        </>
                      )}
                    </Button>

                    <Button
                      onClick={handleAnalyze}
                      disabled={!messageInput.trim() || thinkWithMe.isPending || isAnalyzing}
                      className="bg-purple-600 hover:bg-purple-500 h-12 px-8 rounded-2xl font-black text-[11px] uppercase tracking-[0.15em] shadow-xl shadow-purple-900/40 transition-all active:scale-95 group"
                      data-testid="button-analyze"
                    >
                      {isAnalyzing ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          Thinking
                        </>
                      ) : (
                        <>
                          <Bot className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                          Think with me
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Insight appears below text when analyzing is complete */}
              {(isAnalyzing || agentResponse || latestAnalysis) && (
                <div className="pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
                  {isAnalyzing && !agentResponse && !latestAnalysis && (
                    <div className="p-8 rounded-3xl bg-purple-500/[0.02] border border-purple-500/10" data-testid="analyzing-loader">
                      <div className="flex items-center gap-4">
                        <Loader2 className="w-6 h-6 text-purple-400 animate-spin" />
                        <div>
                          <p className="text-[10px] font-black text-purple-400 uppercase tracking-widest mb-1">Thinking</p>
                          <p className="text-sm text-gray-500">Processing your entry...</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* NEW: Agent Response Card (v1 Thinking Partner) */}
                  {agentResponse && (
                    <div className="p-8 rounded-3xl bg-gradient-to-br from-purple-500/[0.05] to-blue-500/[0.03] border border-purple-500/20" data-testid="agent-response-card">
                      <div className="flex items-start gap-6">
                        <div className="w-12 h-12 rounded-2xl bg-purple-600/20 flex items-center justify-center shrink-0">
                          <Bot className="w-6 h-6 text-purple-400" />
                        </div>
                        <div className="flex-1">
                          <p className="text-[10px] font-black text-purple-400 uppercase tracking-widest mb-6">Thinking Partner</p>
                          
                          <div className="space-y-6">
                            <div>
                              <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest mb-2">What you said</p>
                              <p className="text-white font-medium leading-relaxed">{agentResponse.said}</p>
                            </div>
                            
                            <div>
                              <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest mb-2">Why it matters</p>
                              <p className="text-gray-300 leading-relaxed">{agentResponse.matters}</p>
                            </div>
                            
                            {agentResponse.nextMove && (
                              <div>
                                <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest mb-2">Next move</p>
                                <p className="text-gray-400 leading-relaxed">{agentResponse.nextMove}</p>
                              </div>
                            )}
                            
                            <div>
                              <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest mb-2">Question to sit with</p>
                              <p className="text-purple-300 font-medium italic">{agentResponse.question}</p>
                            </div>

                            {/* Memory suggestion */}
                            {agentResponse.memorySuggestion.shouldSuggest && (
                              <div className="mt-6 p-4 rounded-xl bg-yellow-500/[0.05] border border-yellow-500/20">
                                <p className="text-[9px] font-black text-yellow-500/70 uppercase tracking-widest mb-2">Worth remembering?</p>
                                <p className="text-sm text-gray-300 mb-4">{agentResponse.memorySuggestion.content}</p>
                                <div className="flex items-center gap-3">
                                  <Button
                                    size="sm"
                                    onClick={handlePinSuggestion}
                                    className="bg-purple-600 hover:bg-purple-500 text-sm"
                                    data-testid="button-pin-suggestion"
                                  >
                                    <Pin className="w-4 h-4 mr-1" />
                                    Pin
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={handleSkipSuggestion}
                                    className="text-gray-500 hover:text-white"
                                    data-testid="button-skip-suggestion"
                                  >
                                    Skip
                                  </Button>
                                </div>
                              </div>
                            )}

                            {/* Closing line */}
                            <p className="text-[11px] text-gray-600 italic mt-8 pt-6 border-t border-white/[0.03]">
                              You don't need to resolve this now.
                            </p>
                          </div>

                          <div className="mt-8 pt-6 border-t border-white/[0.05] flex items-center gap-3">
                            <Button
                              onClick={clearAndReset}
                              variant="ghost"
                              className="text-gray-500 hover:text-white hover:bg-white/5"
                            >
                              New Entry
                              <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                          </div>
                        </div>
                        
                        <button 
                          onClick={clearAndReset}
                          className="p-2 rounded-full hover:bg-white/5 transition-colors"
                        >
                          <X className="w-4 h-4 text-gray-600" />
                        </button>
                      </div>
                    </div>
                  )}

                  {latestAnalysis && (
                    <div className="p-8 rounded-3xl bg-gradient-to-br from-purple-500/[0.05] to-blue-500/[0.03] border border-purple-500/20" data-testid="insight-card">
                      <div className="flex items-start gap-6">
                        <div className="w-12 h-12 rounded-2xl bg-purple-600/20 flex items-center justify-center shrink-0">
                          <Sparkles className="w-6 h-6 text-purple-400" />
                        </div>
                        <div className="flex-1">
                          <p className="text-[10px] font-black text-purple-400 uppercase tracking-widest mb-4">
                            {latestAnalysis.zone === "research" ? "Research Analysis" : "Zone Agent Insight"}
                          </p>
                          
                          {latestAnalysis.zone === "journal" ? (
                            <div className="space-y-6">
                              <div>
                                <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest mb-2">Summary</p>
                                <p className="text-white font-medium leading-relaxed">{latestAnalysis.analysis.summary}</p>
                              </div>
                              
                              <div>
                                <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest mb-2">Insight</p>
                                <p className="text-gray-300 italic leading-relaxed">"{latestAnalysis.analysis.insight}"</p>
                              </div>
                              
                              <div>
                                <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest mb-2">Reflection Question</p>
                                <p className="text-purple-300 font-medium">{latestAnalysis.analysis.question}</p>
                              </div>
                              
                              {latestAnalysis.analysis.memoryCandidates.length > 0 && (
                                <div>
                                  <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest mb-3">Worth Remembering</p>
                                  <div className="space-y-2">
                                    {latestAnalysis.analysis.memoryCandidates.map((memory, idx) => (
                                      <div key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] group">
                                        <p className="flex-1 text-sm text-gray-400">{memory}</p>
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          onClick={() => pinMemory.mutate(memory)}
                                          disabled={pinMemory.isPending}
                                          className="opacity-0 group-hover:opacity-100 transition-opacity text-purple-400 hover:text-purple-300 hover:bg-purple-500/10"
                                          data-testid={`button-pin-memory-${idx}`}
                                        >
                                          <Pin className="w-4 h-4 mr-1" />
                                          Pin
                                        </Button>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="space-y-6">
                              <div>
                                <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest mb-2">Key Claims</p>
                                <ul className="space-y-2">
                                  {latestAnalysis.analysis.keyClaims.map((claim, idx) => (
                                    <li key={idx} className="flex items-start gap-2">
                                      <span className="text-purple-400 mt-1">•</span>
                                      <p className="text-white font-medium leading-relaxed">{claim}</p>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                              
                              {latestAnalysis.analysis.evidence.length > 0 && (
                                <div>
                                  <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest mb-2">Evidence</p>
                                  <ul className="space-y-2">
                                    {latestAnalysis.analysis.evidence.map((item, idx) => (
                                      <li key={idx} className="flex items-start gap-2">
                                        <span className="text-green-400 mt-1">•</span>
                                        <p className="text-gray-300 leading-relaxed">{item}</p>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              
                              {latestAnalysis.analysis.unknowns.length > 0 && (
                                <div>
                                  <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest mb-2">Unknowns</p>
                                  <ul className="space-y-2">
                                    {latestAnalysis.analysis.unknowns.map((item, idx) => (
                                      <li key={idx} className="flex items-start gap-2">
                                        <span className="text-yellow-400 mt-1">?</span>
                                        <p className="text-gray-400 italic leading-relaxed">{item}</p>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              
                              <div>
                                <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest mb-2">Next Question</p>
                                <p className="text-purple-300 font-medium">{latestAnalysis.analysis.nextQuestion}</p>
                              </div>
                            </div>
                          )}

                          <div className="mt-8 pt-6 border-t border-white/[0.05] flex items-center gap-3">
                            <Button
                              onClick={clearAnalysis}
                              variant="ghost"
                              className="text-gray-500 hover:text-white hover:bg-white/5"
                            >
                              New Entry
                              <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                          </div>
                        </div>
                        
                        <button 
                          onClick={clearAnalysis}
                          className="p-2 rounded-full hover:bg-white/5 transition-colors"
                        >
                          <X className="w-4 h-4 text-gray-600" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Past Entries - Collapsible (Local-first) */}
              {localEntries && localEntries.length > 0 && (
                <div className="pb-12">
                  <button
                    onClick={() => setShowHistory(!showHistory)}
                    className="flex items-center gap-2 text-[10px] font-black text-gray-600 uppercase tracking-widest hover:text-gray-400 transition-colors mb-4"
                    data-testid="button-toggle-history"
                  >
                    <ChevronDown className={`w-4 h-4 transition-transform ${showHistory ? 'rotate-180' : ''}`} />
                    Past Entries ({localEntries.length})
                  </button>
                  
                  {showHistory && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                      {localEntries.slice(0, 10).map((entry) => (
                        <div 
                          key={entry.id} 
                          className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.03] hover:border-purple-500/10 transition-all group"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-gray-400 leading-relaxed line-clamp-3">
                                {entry.text}
                              </p>
                            </div>
                            <span className="text-[9px] font-black text-gray-700 uppercase tracking-widest shrink-0">
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
              className="fixed inset-0 bg-black/60 z-40 md:hidden" 
              onClick={() => setMemoryDrawerOpen(false)}
            />
            <aside className="fixed md:relative inset-0 md:inset-auto z-50 md:z-auto w-full md:w-80 border-l border-white/[0.03] flex flex-col bg-[#050505] md:bg-black/20 backdrop-blur-xl animate-in slide-in-from-right duration-300">
              <Tabs defaultValue="memories" className="flex-1 flex flex-col">
                <div className="px-6 pt-6 pb-4 border-b border-white/[0.02]">
                  <div className="flex items-center justify-between mb-4 md:hidden">
                    <h3 className="text-lg font-black text-white">Memory & Insights</h3>
                    <button 
                      onClick={() => setMemoryDrawerOpen(false)}
                      className="p-2 text-gray-500 hover:text-white"
                      data-testid="button-close-memory"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <TabsList className="w-full bg-white/[0.02] p-1 rounded-xl">
                    <TabsTrigger value="memories" className="flex-1 text-[10px] font-black uppercase tracking-widest rounded-lg data-[state=active]:bg-purple-600/20 data-[state=active]:text-purple-300">
                      <Pin className="w-3 h-3 mr-1.5" />
                      Memories
                    </TabsTrigger>
                    <TabsTrigger value="insights" className="flex-1 text-[10px] font-black uppercase tracking-widest rounded-lg data-[state=active]:bg-purple-600/20 data-[state=active]:text-purple-300">
                      <Sparkles className="w-3 h-3 mr-1.5" />
                      Insights
                    </TabsTrigger>
                  </TabsList>
                </div>

              <TabsContent value="memories" className="flex-1 flex flex-col mt-0 data-[state=inactive]:hidden">
                <div className="px-6 py-3 border-b border-white/[0.02]">
                  <p className="text-[10px] text-gray-600 font-bold uppercase">{localMemories?.length || 0} patterns saved</p>
                </div>
                <ScrollArea className="flex-1">
                  <div className="p-6 space-y-4">
                    {!localMemories || localMemories.length === 0 ? (
                      <div className="text-center py-10">
                        <Pin className="w-8 h-8 text-gray-700 mx-auto mb-4" />
                        <p className="text-sm text-gray-600 font-medium">No patterns pinned yet</p>
                        <p className="text-xs text-gray-700 mt-2">Pin patterns worth remembering from your entries</p>
                      </div>
                    ) : (
                      localMemories.map((memory) => (
                        <div key={memory.id} className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05] group">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="text-[8px] uppercase tracking-widest border-purple-500/30 text-purple-400/70">
                              {memory.kind}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-300 leading-relaxed font-medium mb-3">
                            {memory.content}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] font-black text-gray-700 uppercase tracking-widest">
                              {format(new Date(memory.createdAt), "MMM d, yyyy")}
                            </span>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => memory.id && handleForgetMemory(memory.id)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-500 hover:text-red-400 hover:bg-red-500/10 h-7 px-2"
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
                <div className="p-4 border-t border-white/[0.03]">
                  <Button variant="outline" className="w-full border-white/[0.05] bg-white/[0.01] hover:bg-white/[0.03] text-gray-500 hover:text-white h-12 rounded-xl font-black text-[9px] uppercase tracking-[0.15em] transition-all">
                    <Download className="w-3 h-3 mr-2" />
                    Export Vault
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="insights" className="flex-1 flex flex-col mt-0 data-[state=inactive]:hidden">
                <div className="px-6 py-3 border-b border-white/[0.02]">
                  <p className="text-[10px] text-gray-600 font-bold uppercase">Latest thinking</p>
                </div>
                <ScrollArea className="flex-1">
                  <div className="p-6 space-y-4">
                    {agentResponse ? (
                      <div className="p-4 rounded-2xl bg-purple-500/[0.05] border border-purple-500/20">
                        <div className="flex items-center gap-2 mb-3">
                          <Bot className="w-4 h-4 text-purple-400" />
                          <span className="text-[9px] font-black text-purple-400 uppercase tracking-widest">
                            Thinking Partner
                          </span>
                        </div>
                        <div className="space-y-3">
                          <p className="text-sm text-white font-medium leading-relaxed">{agentResponse.said}</p>
                          <p className="text-xs text-gray-500">{agentResponse.matters}</p>
                          <p className="text-xs text-purple-300 italic">{agentResponse.question}</p>
                        </div>
                        <p className="text-[9px] text-gray-600 mt-3 uppercase tracking-widest">Just now</p>
                      </div>
                    ) : (
                      <div className="text-center py-10">
                        <Bot className="w-8 h-8 text-gray-700 mx-auto mb-4" />
                        <p className="text-sm text-gray-600 font-medium">No thinking yet</p>
                        <p className="text-xs text-gray-700 mt-2">Write an entry and click "Think with me"</p>
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
