import { useState, useEffect, useMemo } from "react";
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
import type { Member, ChatMessage, StoredMessage } from "@shared/schema";
import { format } from "date-fns";

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
  const [isWriting, setIsWriting] = useState(false);
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);

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
      setIsWriting(false);
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
          <ConnectButton />
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

  return (
    <TooltipProvider>
      <div className="h-screen bg-[#050505] text-gray-300 flex overflow-hidden font-sans selection:bg-purple-500/30">
        {/* Minimal Left Sidebar */}
        <aside className="w-64 border-r border-white/[0.03] flex flex-col bg-black/20">
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

          <ScrollArea className="flex-1">
            <div className="max-w-3xl mx-auto px-6 py-20">
              {messages.length === 0 && !isWriting ? (
                <div className="text-center py-20 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                  <h3 className="text-5xl font-black text-white mb-6 tracking-tighter">Start with one thought.</h3>
                  <p className="text-xl text-gray-500 mb-12 font-medium">DJZS will help you make sense of it.</p>
                  <Button 
                    onClick={() => setIsWriting(true)}
                    className="bg-purple-600 hover:bg-purple-700 h-16 px-12 rounded-2xl font-black text-xl shadow-2xl shadow-purple-900/40 group transition-all"
                  >
                    Start Writing
                    <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              ) : (
                <div className="space-y-12">
                  {messages.slice().reverse().map((stored, idx) => {
                    const msg = stored.message as any;
                    const date = new Date(msg.createdAt);
                    return (
                      <div key={stored.id} className="group animate-in fade-in slide-in-from-bottom-4 duration-700" style={{ animationDelay: `${idx * 100}ms` }}>
                        <div className="flex items-center gap-3 mb-4 opacity-40 group-hover:opacity-100 transition-opacity">
                          <Clock className="w-3.5 h-3.5" />
                          <span className="text-[10px] font-black uppercase tracking-[0.2em]">{format(date, "EEE, MMM d — h:mm a")}</span>
                        </div>
                        
                        <div className="p-8 rounded-[2rem] bg-white/[0.02] border border-white/[0.03] group-hover:border-purple-500/20 group-hover:bg-purple-500/[0.02] transition-all cursor-pointer">
                          <div className="flex items-start gap-6">
                            <div className="flex-1">
                              <p className="text-lg font-bold text-white mb-3 tracking-tight group-hover:text-purple-100 transition-colors">
                                {msg.content.split('\n')[0].substring(0, 80)}...
                              </p>
                              <div className="h-px w-8 bg-purple-500/30 mb-4"></div>
                              <p className="text-gray-500 leading-relaxed line-clamp-2 italic group-hover:text-gray-400 transition-colors">
                                {msg.content}
                              </p>
                            </div>
                            <div className="w-10 h-10 rounded-2xl bg-white/[0.03] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                              <ChevronRight className="w-5 h-5 text-purple-400" />
                            </div>
                          </div>
                        </div>

                        {/* Agent Insight Mockup (v1 Feel) */}
                        {idx === 0 && (
                          <div className="mt-4 ml-8 p-6 rounded-2xl bg-blue-500/[0.03] border border-blue-500/10 flex gap-4 animate-in fade-in zoom-in duration-1000 delay-500">
                            <Sparkles className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                            <div>
                              <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2">Thinking Partner</p>
                              <p className="text-sm text-gray-400 leading-relaxed font-medium italic">
                                "You're circling the same decision as yesterday. The blocker isn't information — it's confidence."
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Writing Overlay / Input Area */}
          <div className={`absolute inset-0 bg-[#050505]/95 backdrop-blur-2xl z-[100] transition-all duration-500 ${isWriting ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
            <div className="h-full flex flex-col max-w-4xl mx-auto px-10">
              <header className="h-24 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></div>
                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Direct Journaling Active</span>
                </div>
                <button 
                  onClick={() => setIsWriting(false)}
                  className="p-3 hover:bg-white/5 rounded-full transition-colors"
                >
                  <X className="w-6 h-6 text-gray-500" />
                </button>
              </header>

              <div className="flex-1 flex flex-col justify-center py-20">
                <p className="text-purple-400/50 text-sm font-medium mb-8 animate-pulse italic">
                  {PROMPTS[currentPromptIndex]}
                </p>
                <textarea
                  autoFocus
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder="Write what you're thinking. No formatting. No pressure."
                  className="w-full bg-transparent border-none focus:ring-0 text-3xl font-bold text-white placeholder:text-gray-800 resize-none min-h-[300px] leading-snug tracking-tight"
                />
              </div>

              <footer className="h-32 flex items-center justify-between border-t border-white/[0.03]">
                <div className="flex items-center gap-6 text-[10px] font-black text-gray-700 uppercase tracking-widest">
                  <div className="flex items-center gap-2">
                    <kbd className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10">Enter</kbd>
                    <span>Save Entry</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <kbd className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10">⌘ + Enter</kbd>
                    <span>Save + Insight</span>
                  </div>
                </div>

                <Button
                  onClick={handleSendText}
                  disabled={!messageInput.trim() || sendMessage.isPending}
                  className="bg-purple-600 hover:bg-purple-700 h-14 px-10 rounded-2xl font-black text-lg shadow-2xl shadow-purple-900/40"
                >
                  {sendMessage.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : "Save Entry"}
                </Button>
              </footer>
            </div>
          </div>
        </main>

        {/* Right Sidebar - Insight Drawer */}
        {memoryDrawerOpen && (
          <aside className="w-80 border-l border-white/[0.03] flex flex-col bg-black/20 backdrop-blur-xl animate-in slide-in-from-right duration-500">
            <div className="p-8 border-b border-white/[0.02]">
              <h3 className="text-sm font-black text-white tracking-widest uppercase mb-1">Zone Memory</h3>
              <p className="text-[10px] text-gray-600 font-bold uppercase">Compound Intelligence</p>
            </div>

            <ScrollArea className="flex-1 p-8 space-y-10">
              <div className="space-y-4">
                <p className="text-[10px] font-black text-gray-700 uppercase tracking-widest">Active Insight</p>
                <div className="p-6 rounded-[2rem] bg-purple-600/5 border border-purple-500/10">
                  <p className="text-sm text-gray-300 leading-relaxed italic font-medium">
                    "You've mentioned 'uncertainty' in 4 of your last 5 entries. The common thread is a fear of commitment to a specific path."
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <p className="text-[10px] font-black text-gray-700 uppercase tracking-widest">Extracted Topics</p>
                <div className="flex flex-wrap gap-2">
                  {["Confidence", "Decision Making", "Product Strategy", "Self-Reflection"].map(topic => (
                    <span key={topic} className="px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.05] text-[10px] font-black text-gray-500 uppercase tracking-wider">{topic}</span>
                  ))}
                </div>
              </div>

              <div className="pt-10 border-t border-white/[0.03]">
                <Button variant="outline" className="w-full border-white/[0.05] bg-white/[0.01] hover:bg-white/[0.03] text-gray-500 hover:text-white h-14 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all">
                  Export Knowledge
                </Button>
              </div>
            </ScrollArea>
          </aside>
        )}
      </div>
    </TooltipProvider>
  );
}
