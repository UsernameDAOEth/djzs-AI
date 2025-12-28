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
  ChevronDown
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
import type { Member, ChatMessage, StoredMessage, JournalAnalysis, JournalEntry, PinnedMemory } from "@shared/schema";
import { format } from "date-fns";

interface AnalysisResult {
  entry: JournalEntry;
  analysis: JournalAnalysis;
}

const V1_ZONES = [
  { id: "journal", name: "Journal", icon: BookOpen, description: "Personal reflection", purpose: "Your private space to think, reflect, and extract insight." },
  { id: "research", name: "Research", icon: Search, description: "Information gathering", purpose: "Collective context and verified intelligence." },
];

const PROMPTS = [
  "What's on your mind right now?",
  "What happened today?",
  "What are you trying to figure out?",
  "What feels unclear right now?",
];

export default function Chat() {
  const { address, isConnected } = useAccount();
  const { toast } = useToast();
  const { displayName, ensName } = useDisplayName(address);
  const { client: xmtpClient, isConnecting: xmtpConnecting, connect: connectXmtp } = useXmtp();
  const { signMessageAsync } = useSignMessage();
  
  const [selectedZone, setSelectedZone] = useState("journal");
  const [messageInput, setMessageInput] = useState("");
  const [adminPanelOpen, setAdminPanelOpen] = useState(false);
  const [memoryDrawerOpen, setMemoryDrawerOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);
  const [latestAnalysis, setLatestAnalysis] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [frozenHeight, setFrozenHeight] = useState<number | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPromptIndex((prev) => (prev + 1) % PROMPTS.length);
    }, 10000);
    return () => clearInterval(interval);
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
      const res = await apiRequest("POST", "/api/members", {
        address,
        ensName,
        isAllowlisted: true,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/members", address] });
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

  // Analyze journal entry with Venice AI
  const analyzeEntry = useMutation({
    mutationFn: async (content: string) => {
      const res = await apiRequest("POST", "/api/journal/analyze", {
        content,
        walletAddress: address,
      });
      return res.json() as Promise<AnalysisResult>;
    },
    onSuccess: (data) => {
      setLatestAnalysis(data);
      queryClient.invalidateQueries({ queryKey: ["/api/journal/entries", address] });
      toast({
        title: "Insight generated",
        description: "Your entry has been analyzed.",
      });
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

  // Pin a memory
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
    if (!messageInput.trim() || !address || analyzeEntry.isPending) return;
    if (textareaRef.current) {
      setFrozenHeight(textareaRef.current.scrollHeight);
    }
    setIsAnalyzing(true);
    analyzeEntry.mutate(messageInput);
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
        {/* Minimal Left Sidebar - dims when focused */}
        <aside className={`w-64 border-r border-white/[0.03] flex flex-col bg-black/20 transition-opacity duration-500 ${isFocused ? 'opacity-40' : 'opacity-100'}`}>
          <div className="p-8 pb-4">
            <Link href="/">
              <button className="flex items-center gap-2 text-sm font-black text-white tracking-[0.2em] uppercase opacity-40 hover:opacity-100 hover:text-purple-400 transition-all group">
                <Home className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                <span>DJZS v1</span>
              </button>
            </Link>
          </div>

          <nav className="flex-1 px-4 space-y-1">
            {V1_ZONES.map((zone) => {
              const Icon = zone.icon;
              const isActive = selectedZone === zone.id;
              return (
                <button
                  key={zone.id}
                  onClick={() => setSelectedZone(zone.id)}
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
          <header className="h-20 flex items-center justify-between px-10 bg-[#050505]/80 backdrop-blur-xl border-b border-white/[0.02] sticky top-0 z-50">
            <div className="flex flex-col">
              <h2 className="text-xl font-black text-white tracking-tight">{currentZone.name}</h2>
              <p className="text-xs text-gray-500 font-medium mt-0.5">{currentZone.purpose}</p>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-4 px-4 py-2 rounded-full bg-white/[0.02] border border-white/[0.03]">
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
              
              <button 
                onClick={() => setMemoryDrawerOpen(!memoryDrawerOpen)}
                className={`p-3 rounded-full transition-all ${memoryDrawerOpen ? 'bg-purple-600/10 text-purple-400' : 'text-gray-600 hover:text-white hover:bg-white/5'}`}
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
                  {PROMPTS[currentPromptIndex]}
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

                {/* Action bar - dims when not focused */}
                <div className={`flex items-center justify-between mt-8 transition-opacity duration-500 ${isFocused ? 'opacity-100' : 'opacity-40'}`}>
                  <div className="flex items-center gap-6 text-[10px] font-black text-gray-600 uppercase tracking-widest">
                    <div className="flex items-center gap-2">
                      <kbd className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10">Enter</kbd>
                      <span>Save</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <kbd className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10">⌘ + Enter</kbd>
                      <span>Analyze</span>
                    </div>
                  </div>

                  <div className={`flex items-center gap-3 transition-opacity duration-500 ${isFocused || messageInput.trim() ? 'opacity-100' : 'opacity-40'}`}>
                    <Button
                      onClick={handleSendText}
                      disabled={!messageInput.trim() || sendMessage.isPending}
                      variant="ghost"
                      className="h-12 px-6 rounded-xl font-bold text-sm text-gray-500 hover:text-white hover:bg-white/5"
                      data-testid="button-save"
                    >
                      {sendMessage.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Only"}
                    </Button>
                    <Button
                      onClick={handleAnalyze}
                      disabled={!messageInput.trim() || analyzeEntry.isPending || isAnalyzing}
                      className="bg-purple-600 hover:bg-purple-700 h-12 px-8 rounded-xl font-bold text-sm shadow-lg shadow-purple-900/30"
                      data-testid="button-analyze"
                    >
                      {isAnalyzing ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          Thinking...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 mr-2" />
                          Analyze
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Insight appears below text when analyzing is complete */}
              {(isAnalyzing || latestAnalysis) && (
                <div className="pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
                  {isAnalyzing && !latestAnalysis && (
                    <div className="p-8 rounded-3xl bg-purple-500/[0.02] border border-purple-500/10" data-testid="analyzing-loader">
                      <div className="flex items-center gap-4">
                        <Loader2 className="w-6 h-6 text-purple-400 animate-spin" />
                        <div>
                          <p className="text-[10px] font-black text-purple-400 uppercase tracking-widest mb-1">Analyzing Entry</p>
                          <p className="text-sm text-gray-500">The Zone Agent is processing your reflection...</p>
                        </div>
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
                          <p className="text-[10px] font-black text-purple-400 uppercase tracking-widest mb-4">Zone Agent Insight</p>
                          
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

              {/* Past Entries - Collapsible */}
              {journalEntries.length > 0 && (
                <div className="pb-12">
                  <button
                    onClick={() => setShowHistory(!showHistory)}
                    className="flex items-center gap-2 text-[10px] font-black text-gray-600 uppercase tracking-widest hover:text-gray-400 transition-colors mb-4"
                    data-testid="button-toggle-history"
                  >
                    <ChevronDown className={`w-4 h-4 transition-transform ${showHistory ? 'rotate-180' : ''}`} />
                    Past Entries ({journalEntries.length})
                  </button>
                  
                  {showHistory && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                      {journalEntries.slice(0, 10).map((entry) => (
                        <div 
                          key={entry.id} 
                          className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.03] hover:border-purple-500/10 transition-all group"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-gray-400 leading-relaxed line-clamp-3">
                                {entry.content}
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

        {/* Right Sidebar - Memory Drawer */}
        {memoryDrawerOpen && (
          <aside className="w-80 border-l border-white/[0.03] flex flex-col bg-black/20 backdrop-blur-xl animate-in slide-in-from-right duration-500">
            <div className="p-8 border-b border-white/[0.02]">
              <h3 className="text-sm font-black text-white tracking-widest uppercase mb-1">Pinned Memories</h3>
              <p className="text-[10px] text-gray-600 font-bold uppercase">{pinnedMemories.length} items saved</p>
            </div>

            <ScrollArea className="flex-1">
              <div className="p-8 space-y-6">
                {pinnedMemories.length === 0 ? (
                  <div className="text-center py-10">
                    <Pin className="w-8 h-8 text-gray-700 mx-auto mb-4" />
                    <p className="text-sm text-gray-600 font-medium">No memories pinned yet</p>
                    <p className="text-xs text-gray-700 mt-2">Write an entry and pin insights worth remembering</p>
                  </div>
                ) : (
                  pinnedMemories.map((memory) => (
                    <div key={memory.id} className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05] group">
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
                          onClick={async () => {
                            await fetch(`/api/memories/${memory.id}`, { method: "DELETE" });
                            queryClient.invalidateQueries({ queryKey: ["/api/memories", address] });
                          }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-500 hover:text-red-400 hover:bg-red-500/10 h-7 px-2"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>

            <div className="p-6 border-t border-white/[0.03]">
              <Button variant="outline" className="w-full border-white/[0.05] bg-white/[0.01] hover:bg-white/[0.03] text-gray-500 hover:text-white h-14 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all">
                Export Memories
              </Button>
            </div>
          </aside>
        )}
      </div>
    </TooltipProvider>
  );
}
