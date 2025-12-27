import { useState, useEffect } from "react";
import { useAccount, useSignMessage } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useQuery, useMutation } from "@tanstack/react-query";
import { nanoid } from "nanoid";
import { Link } from "wouter";
import { 
  MessageSquare, 
  TrendingUp, 
  BarChart3, 
  Calendar, 
  DollarSign,
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
  User,
  ChevronRight,
  X,
  Info
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
import { TradeComposer } from "@/components/chat/trade-composer";
import { PredictionComposer } from "@/components/chat/prediction-composer";
import { EventComposer } from "@/components/chat/event-composer";
import { PaymentComposer } from "@/components/chat/payment-composer";
import { NewsletterComposer } from "@/components/chat/newsletter-composer";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Room, Member, ChatMessage, StoredMessage } from "@shared/schema";

const DEFAULT_ZONES = [
  { id: "lounge", name: "User Zone", icon: Users, description: "General discussion", purpose: "Share notes and updates with the community" },
  { id: "trades", name: "Trades", icon: TrendingUp, description: "Trade signals and setups", purpose: "Post and track trading signals" },
  { id: "predictions", name: "Predictions", icon: BarChart3, description: "Market predictions", purpose: "Make and vote on market predictions" },
  { id: "events", name: "Events", icon: Calendar, description: "Community events", purpose: "Coordinate meetings and events" },
  { id: "payments", name: "Payments", icon: DollarSign, description: "Payment receipts", purpose: "Track on-chain payments" },
];

const SYSTEM_ITEMS = [
  { id: "members", name: "Members", icon: Users },
  { id: "notifications", name: "Notifications", icon: Bell },
  { id: "settings", name: "Settings", icon: Settings },
  { id: "security", name: "Security", icon: Shield },
];

export default function Chat() {
  const { address, isConnected } = useAccount();
  const { toast } = useToast();
  const { displayName, ensName } = useDisplayName(address);
  const { client: xmtpClient, isConnecting: xmtpConnecting, connect: connectXmtp, error: xmtpError } = useXmtp();
  const { signMessageAsync } = useSignMessage();
  
  const [selectedZone, setSelectedZone] = useState("lounge");
  const [messageInput, setMessageInput] = useState("");
  const [composerTab, setComposerTab] = useState("note");
  const [adminPanelOpen, setAdminPanelOpen] = useState(false);
  const [memoryDrawerOpen, setMemoryDrawerOpen] = useState(false);

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

  const { data: allMembers = [] } = useQuery<Member[]>({
    queryKey: ["/api/members"],
    enabled: !!member?.isAdmin,
  });

  const muteMember = useMutation({
    mutationFn: async (targetAddress: string) => {
      const timestamp = Date.now().toString();
      const message = `DJZS Admin: Mute ${targetAddress} at ${timestamp}`;
      const signature = await signMessageAsync({ message });
      const res = await apiRequest("POST", `/api/admin/mute/${targetAddress}`, { 
        adminAddress: address, 
        signature, 
        timestamp 
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/members"] });
      toast({ title: "Member muted", description: "The member can no longer send messages" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to mute member", variant: "destructive" });
    },
  });

  const unmuteMember = useMutation({
    mutationFn: async (targetAddress: string) => {
      const timestamp = Date.now().toString();
      const message = `DJZS Admin: Unmute ${targetAddress} at ${timestamp}`;
      const signature = await signMessageAsync({ message });
      const res = await apiRequest("POST", `/api/admin/unmute/${targetAddress}`, { 
        adminAddress: address, 
        signature, 
        timestamp 
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/members"] });
      toast({ title: "Member unmuted", description: "The member can now send messages again" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to unmute member", variant: "destructive" });
    },
  });

  const removeMember = useMutation({
    mutationFn: async (targetAddress: string) => {
      const timestamp = Date.now().toString();
      const message = `DJZS Admin: Remove ${targetAddress} at ${timestamp}`;
      const signature = await signMessageAsync({ message });
      await apiRequest("POST", `/api/admin/remove/${targetAddress}`, { 
        adminAddress: address, 
        signature, 
        timestamp 
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/members"] });
      toast({ title: "Member removed", description: "The member has been removed from the zone" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to remove member", variant: "destructive" });
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
        title: "Committed to Zone",
        description: "Your entry has been added to the Zone Feed",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to commit to zone",
        variant: "destructive",
      });
    },
  });

  const authorAddresses = messages.map((m) => {
    const msg = m.message;
    if ('authorAddress' in msg) return msg.authorAddress;
    if ('voterAddress' in msg) return msg.voterAddress;
    return '';
  }).filter(Boolean);
  if (address) authorAddresses.push(address);
  const { data: ensNames = {} } = useMultipleEnsNames(authorAddresses);

  useEffect(() => {
    if (member && (member.isAllowlisted || member.isAdmin) && !xmtpClient && !xmtpConnecting && address) {
      connectXmtp().catch(console.error);
    }
  }, [member, xmtpClient, xmtpConnecting, connectXmtp, address]);

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 text-purple-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Connect to DJZS</h2>
          <p className="text-gray-400 mb-6">Connect your wallet to access your Zones</p>
          <ConnectButton />
        </div>
      </div>
    );
  }

  if (memberLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-purple-400 mx-auto mb-4 animate-spin" />
          <p className="text-gray-400">Checking membership...</p>
        </div>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center max-w-md">
          <Shield className="w-16 h-16 text-purple-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Welcome to DJZS</h2>
          <p className="text-gray-400 mb-4">
            {displayName}
          </p>
          <p className="text-gray-500 text-sm mb-6">
            Click below to register as a member and access your Zones.
          </p>
          <Button
            onClick={() => registerMember.mutate()}
            disabled={registerMember.isPending}
            className="bg-purple-600 hover:bg-purple-700"
            data-testid="button-register"
          >
            {registerMember.isPending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : null}
            Enter DJZS
          </Button>
        </div>
      </div>
    );
  }

  if (!member?.isAllowlisted && !member?.isAdmin) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center max-w-md">
          <Shield className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Members Only</h2>
          <p className="text-gray-400 mb-4">
            This Zone is restricted to members. You need to be on the allowlist or hold a membership NFT.
          </p>
          <p className="text-sm text-gray-500">
            Connected: {displayName}
          </p>
        </div>
      </div>
    );
  }

  const currentZone = DEFAULT_ZONES.find(z => z.id === selectedZone);
  const onlineCount = allMembers.filter(m => m.isAllowlisted || m.isAdmin).length || 1;

  const handleSendText = () => {
    if (!messageInput.trim() || !address || sendMessage.isPending) return;
    if (member?.isMuted) {
      toast({ title: "Muted", description: "You are muted and cannot send messages", variant: "destructive" });
      return;
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

  const handleTradeSubmit = (data: { asset: string; direction: "long" | "short"; entry: string; invalidation: string; tp: string[]; timeframe?: string; leverage?: string; notes?: string }) => {
    if (!address || sendMessage.isPending || member?.isMuted) return;
    const message: ChatMessage = {
      type: "trade_signal",
      id: nanoid(),
      asset: data.asset,
      direction: data.direction,
      entry: data.entry,
      invalidation: data.invalidation,
      tp: data.tp,
      timeframe: data.timeframe,
      leverage: data.leverage,
      notes: data.notes,
      createdAt: new Date().toISOString(),
      authorAddress: address,
    };
    sendMessage.mutate(message);
  };

  const handlePredictionSubmit = (data: { question: string; endsAt: string; notes?: string }) => {
    if (!address || sendMessage.isPending || member?.isMuted) return;
    const message: ChatMessage = {
      type: "prediction",
      id: nanoid(),
      question: data.question,
      endsAt: new Date(data.endsAt).toISOString(),
      outcomes: ["YES", "NO"],
      notes: data.notes,
      createdAt: new Date().toISOString(),
      authorAddress: address,
    };
    sendMessage.mutate(message);
  };

  const handleEventSubmit = (data: { title: string; startsAt: string; locationOrLink?: string; description?: string }) => {
    if (!address || sendMessage.isPending || member?.isMuted) return;
    const message: ChatMessage = {
      type: "event",
      id: nanoid(),
      title: data.title,
      startsAt: new Date(data.startsAt).toISOString(),
      locationOrLink: data.locationOrLink,
      description: data.description,
      createdAt: new Date().toISOString(),
      authorAddress: address,
    };
    sendMessage.mutate(message);
  };

  const handlePaymentSuccess = (txHash: string, data: { to: string; amount: string; token: string; note?: string }) => {
    if (!address || sendMessage.isPending || member?.isMuted) return;
    const message: ChatMessage = {
      type: "payment_receipt",
      chainId: 8453,
      tokenSymbol: data.token,
      amount: data.amount,
      to: data.to,
      txHash,
      note: data.note,
      createdAt: new Date().toISOString(),
      authorAddress: address,
    };
    sendMessage.mutate(message);
  };

  const handleNewsletterSubmit = (data: { postId: string; title: string; subtitle?: string; imageUrl?: string; publishedAt?: string; slug: string; publicationSlug: string; excerpt?: string }) => {
    if (!address || sendMessage.isPending || member?.isMuted) return;
    const message: ChatMessage = {
      type: "newsletter",
      id: nanoid(),
      postId: data.postId,
      title: data.title,
      subtitle: data.subtitle,
      imageUrl: data.imageUrl,
      publishedAt: data.publishedAt,
      slug: data.slug,
      publicationSlug: data.publicationSlug,
      excerpt: data.excerpt,
      createdAt: new Date().toISOString(),
      authorAddress: address,
    };
    sendMessage.mutate(message);
  };

  const getEmptyStateAction = () => {
    switch (selectedZone) {
      case "lounge": return { action: "Post a Note", desc: "Share your first update with the community" };
      case "trades": return { action: "Create a Signal", desc: "Post your first trade setup" };
      case "predictions": return { action: "Make a Prediction", desc: "Start a new prediction market" };
      case "events": return { action: "Schedule an Event", desc: "Create your first community event" };
      case "payments": return { action: "Send a Payment", desc: "Make your first on-chain payment" };
      default: return { action: "Post a Note", desc: "Be the first to contribute" };
    }
  };

  const signalsCount = messages.filter(m => m.message.type === "trade_signal").length;
  const predictionsCount = messages.filter(m => m.message.type === "prediction").length;

  return (
    <TooltipProvider>
      <div className="h-screen bg-gray-950 flex">
        {/* Left Sidebar - Zones + System */}
        <aside className="w-64 border-r border-gray-800 flex flex-col">
          <Link href="/">
            <div className="p-4 border-b border-gray-800 cursor-pointer hover:bg-gray-900/50 transition-colors">
              <p className="text-[10px] text-gray-500 tracking-widest uppercase mb-1">DJZS - BETA</p>
              <h1 className="text-sm font-bold text-white hover:text-purple-400 transition-colors leading-tight">Decentralized Journaling Zone System</h1>
            </div>
          </Link>

          {/* Access Status */}
          <div className="px-4 py-2 border-b border-gray-800 bg-gray-900/30">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-green-400">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                <span>{onlineCount} Online</span>
              </div>
              <div className="flex items-center gap-1 text-purple-400">
                <Lock className="w-3 h-3" />
                <span>NFT-Gated</span>
              </div>
            </div>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-3">
              <p className="text-[10px] text-gray-500 px-2 py-3 uppercase tracking-widest font-semibold">Zones</p>
              {DEFAULT_ZONES.map((zone) => {
                const Icon = zone.icon;
                const isActive = selectedZone === zone.id;
                return (
                  <Tooltip key={zone.id}>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => setSelectedZone(zone.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all ${
                          isActive
                            ? "bg-purple-600/20 text-purple-400 shadow-[0_0_12px_rgba(168,85,247,0.15)]"
                            : "text-gray-400 hover:bg-gray-800/50 hover:text-white"
                        }`}
                        data-testid={`zone-${zone.id}`}
                      >
                        <div className={`w-7 h-7 rounded-md flex items-center justify-center ${isActive ? 'bg-purple-600/30' : 'bg-gray-800'}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-medium">{zone.name}</span>
                        {isActive && (
                          <div className="ml-auto w-1.5 h-1.5 rounded-full bg-purple-400"></div>
                        )}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="bg-gray-800 text-white border-gray-700">
                      <p className="font-medium">{zone.name}</p>
                      <p className="text-xs text-gray-400">{zone.purpose}</p>
                    </TooltipContent>
                  </Tooltip>
                );
              })}

              <div className="my-4 border-t border-gray-800"></div>

              <p className="text-[10px] text-gray-500 px-2 py-3 uppercase tracking-widest font-semibold">System</p>
              {member?.isAdmin && (
                <Dialog open={adminPanelOpen} onOpenChange={setAdminPanelOpen}>
                  <DialogTrigger asChild>
                    <button
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-gray-400 hover:bg-gray-800/50 hover:text-white transition-colors"
                      data-testid="button-admin-panel"
                    >
                      <div className="w-7 h-7 rounded-md bg-gray-800 flex items-center justify-center">
                        <Crown className="w-4 h-4 text-purple-400" />
                      </div>
                      <span className="text-sm font-medium">Admin Panel</span>
                    </button>
                  </DialogTrigger>
                  <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-lg max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <Crown className="w-5 h-5 text-purple-400" />
                        Admin Panel
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 mt-4">
                      <h3 className="text-sm font-medium text-gray-400">Members ({allMembers.length})</h3>
                      <div className="space-y-2">
                        {allMembers.map((m) => (
                          <div 
                            key={m.id} 
                            className="flex items-center justify-between p-3 bg-gray-800 rounded-lg"
                            data-testid={`member-row-${m.id}`}
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-purple-600/30 flex items-center justify-center text-sm text-purple-400">
                                {(m.ensName || m.address).charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="text-sm font-medium text-white">
                                  {m.ensName || formatAddress(m.address)}
                                </p>
                                <div className="flex items-center gap-1 mt-0.5">
                                  {m.isAdmin && (
                                    <Badge variant="outline" className="text-[10px] border-purple-400 text-purple-400 px-1">
                                      Admin
                                    </Badge>
                                  )}
                                  {m.isMuted && (
                                    <Badge variant="outline" className="text-[10px] border-red-400 text-red-400 px-1">
                                      Muted
                                    </Badge>
                                  )}
                                  {m.hasNft && (
                                    <Badge variant="outline" className="text-[10px] border-green-400 text-green-400 px-1">
                                      NFT
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                            {!m.isAdmin && m.address.toLowerCase() !== address?.toLowerCase() && (
                              <div className="flex items-center gap-1">
                                {m.isMuted ? (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-green-400 hover:text-green-300 hover:bg-green-400/10"
                                    onClick={() => unmuteMember.mutate(m.address)}
                                    disabled={unmuteMember.isPending}
                                    data-testid={`button-unmute-${m.id}`}
                                  >
                                    <Volume2 className="w-4 h-4" />
                                  </Button>
                                ) : (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-yellow-400 hover:text-yellow-300 hover:bg-yellow-400/10"
                                    onClick={() => muteMember.mutate(m.address)}
                                    disabled={muteMember.isPending}
                                    data-testid={`button-mute-${m.id}`}
                                  >
                                    <VolumeX className="w-4 h-4" />
                                  </Button>
                                )}
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-400/10"
                                  onClick={() => removeMember.mutate(m.address)}
                                  disabled={removeMember.isPending}
                                  data-testid={`button-remove-${m.id}`}
                                >
                                  <UserX className="w-4 h-4" />
                                </Button>
                              </div>
                            )}
                          </div>
                        ))}
                        {allMembers.length === 0 && (
                          <p className="text-sm text-gray-500 text-center py-4">No members yet</p>
                        )}
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
              
              {SYSTEM_ITEMS.filter(item => item.id !== "settings" || !member?.isAdmin).slice(0, 2).map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-gray-500 hover:bg-gray-800/50 hover:text-gray-400 transition-colors cursor-not-allowed opacity-50"
                    disabled
                    data-testid={`system-${item.id}`}
                  >
                    <div className="w-7 h-7 rounded-md bg-gray-800 flex items-center justify-center">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-sm">{item.name}</span>
                  </button>
                );
              })}
            </div>
          </ScrollArea>

          {/* Bottom: User + Connect */}
          <div className="p-4 border-t border-gray-800 space-y-3">
            <div className="flex items-center gap-3 px-1">
              <div className="w-8 h-8 rounded-full bg-purple-600/30 flex items-center justify-center text-sm text-purple-400">
                {displayName.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{ensName || formatAddress(address || "")}</p>
                {member?.isAdmin && (
                  <span className="text-[10px] text-purple-400">ADMIN</span>
                )}
              </div>
            </div>
            {!xmtpClient && (
              <Button
                variant="outline"
                size="sm"
                onClick={connectXmtp}
                disabled={xmtpConnecting}
                className="w-full text-xs border-gray-700 text-gray-400 hover:text-white"
                data-testid="button-connect-xmtp"
              >
                {xmtpConnecting ? (
                  <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                ) : (
                  <Key className="w-3 h-3 mr-2" />
                )}
                {xmtpConnecting ? "Connecting..." : "Enable E2E Encryption"}
              </Button>
            )}
            <ConnectButton accountStatus="avatar" chainStatus="icon" showBalance={false} />
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col">
          {/* Zone Header Bar */}
          <header className="h-12 border-b border-gray-800 flex items-center justify-between px-4 bg-gray-900/50 sticky top-0 z-10">
            <div className="flex items-center gap-3">
              <Link href="/">
                <button className="p-1.5 hover:bg-gray-800 rounded-lg transition-colors text-gray-400 hover:text-white" data-testid="button-home" title="Back to home">
                  <Home className="w-4 h-4" />
                </button>
              </Link>
              {currentZone && (
                <div className="w-7 h-7 rounded-md bg-purple-600/30 flex items-center justify-center">
                  <currentZone.icon className="w-4 h-4 text-purple-400" />
                </div>
              )}
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-white font-semibold text-sm">{currentZone?.name}</h2>
                  <span className="text-[10px] text-gray-500">•</span>
                  <span className="text-xs text-gray-500">{currentZone?.purpose}</span>
                </div>
              </div>
            </div>
            
            {/* Status indicators */}
            <div className="flex items-center gap-3">
              {xmtpClient && (
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-green-500/10 border border-green-500/20">
                  <Lock className="w-3 h-3 text-green-400" />
                  <span className="text-[10px] text-green-400 font-medium">Encrypted</span>
                </div>
              )}
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-purple-500/10 border border-purple-500/20">
                <Shield className="w-3 h-3 text-purple-400" />
                <span className="text-[10px] text-purple-400 font-medium">Gated</span>
              </div>
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-blue-500/10 border border-blue-500/20">
                <Bot className="w-3 h-3 text-blue-400" />
                <span className="text-[10px] text-blue-400 font-medium">Agent Active</span>
              </div>
              
              {/* Quick Actions */}
              <div className="flex items-center gap-1 ml-2 border-l border-gray-700 pl-3">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button className="p-1.5 hover:bg-gray-800 rounded-md text-gray-500 hover:text-white transition-colors">
                      <Pin className="w-4 h-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>Pin item</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button className="p-1.5 hover:bg-gray-800 rounded-md text-gray-500 hover:text-white transition-colors">
                      <Download className="w-4 h-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>Export Zone</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button 
                      className="p-1.5 hover:bg-gray-800 rounded-md text-gray-500 hover:text-white transition-colors"
                      onClick={() => setMemoryDrawerOpen(!memoryDrawerOpen)}
                    >
                      <Search className="w-4 h-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>Zone Memory</TooltipContent>
                </Tooltip>
              </div>
            </div>
          </header>

          {/* Zone Feed Label */}
          <div className="px-4 py-2 border-b border-gray-800/50 bg-gray-900/20">
            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold">Zone Feed</p>
          </div>

          {/* Messages Area */}
          <ScrollArea className="flex-1 px-4 py-3">
            {messagesLoading ? (
              <div className="flex items-center justify-center h-full text-gray-500">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>
            ) : messages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center max-w-sm">
                  <div className="w-16 h-16 rounded-2xl bg-purple-600/20 flex items-center justify-center mx-auto mb-4">
                    {currentZone && <currentZone.icon className="w-8 h-8 text-purple-400" />}
                  </div>
                  <h3 className="text-white font-semibold mb-2">No entries yet</h3>
                  <p className="text-gray-500 text-sm mb-4">{getEmptyStateAction().desc}</p>
                  <Button 
                    className="bg-purple-600 hover:bg-purple-700"
                    onClick={() => setComposerTab("note")}
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    {getEmptyStateAction().action}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {messages.map((stored) => (
                  <MessageCard key={stored.id} message={stored.message} ensNames={ensNames} />
                ))}
              </div>
            )}
          </ScrollArea>

          {/* Action Dock */}
          <div className="border-t border-gray-700 p-4 bg-gray-900/80 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold">Zone Actions</p>
              <div className="flex items-center gap-4 text-[10px] text-gray-600">
                <span>Create: Note · Signal · Prediction</span>
                <span>|</span>
                <span>Coordinate: Event · Receipt</span>
              </div>
            </div>
            <Tabs value={composerTab} onValueChange={setComposerTab}>
              <TabsList className="bg-gray-800/80 border border-gray-700/50 p-1 mb-3 w-full justify-start gap-0.5 h-auto flex-wrap">
                <TabsTrigger 
                  value="note" 
                  className="text-xs text-gray-400 data-[state=active]:bg-purple-600 data-[state=active]:text-white px-3 py-1.5 rounded-md" 
                  data-testid="tab-note"
                >
                  <FileText className="w-3.5 h-3.5 mr-1.5" />
                  Note
                </TabsTrigger>
                <TabsTrigger 
                  value="signal" 
                  className="text-xs text-gray-400 data-[state=active]:bg-green-600 data-[state=active]:text-white px-3 py-1.5 rounded-md" 
                  data-testid="tab-signal"
                >
                  <TrendingUp className="w-3.5 h-3.5 mr-1.5" />
                  Signal
                </TabsTrigger>
                <TabsTrigger 
                  value="prediction" 
                  className="text-xs text-gray-400 data-[state=active]:bg-blue-600 data-[state=active]:text-white px-3 py-1.5 rounded-md" 
                  data-testid="tab-prediction"
                >
                  <BarChart3 className="w-3.5 h-3.5 mr-1.5" />
                  Prediction
                </TabsTrigger>
                <TabsTrigger 
                  value="event" 
                  className="text-xs text-gray-400 data-[state=active]:bg-orange-600 data-[state=active]:text-white px-3 py-1.5 rounded-md" 
                  data-testid="tab-event"
                >
                  <Calendar className="w-3.5 h-3.5 mr-1.5" />
                  Event
                </TabsTrigger>
                <TabsTrigger 
                  value="receipt" 
                  className="text-xs text-gray-400 data-[state=active]:bg-emerald-600 data-[state=active]:text-white px-3 py-1.5 rounded-md" 
                  data-testid="tab-receipt"
                >
                  <Receipt className="w-3.5 h-3.5 mr-1.5" />
                  Receipt
                </TabsTrigger>
                <TabsTrigger 
                  value="article" 
                  className="text-xs text-gray-400 data-[state=active]:bg-indigo-600 data-[state=active]:text-white px-3 py-1.5 rounded-md" 
                  data-testid="tab-article"
                >
                  <Newspaper className="w-3.5 h-3.5 mr-1.5" />
                  Article
                </TabsTrigger>
              </TabsList>

              <TabsContent value="note" className="mt-0">
                <div className="space-y-2">
                  <p className="text-[10px] text-gray-500">Share a note with the Zone. It will appear as a Note Card in the feed.</p>
                  <div className="flex gap-2">
                    <Input
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSendText()}
                      placeholder="Write a note..."
                      className="bg-gray-800/80 border-gray-700 text-white placeholder:text-gray-500"
                      data-testid="input-message"
                    />
                    <Button onClick={handleSendText} className="bg-purple-600 hover:bg-purple-700 px-4" data-testid="button-commit">
                      <Send className="w-4 h-4 mr-2" />
                      Commit
                    </Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="signal" className="mt-0">
                <p className="text-[10px] text-gray-500 mb-2">Post a trade signal. It will appear as a Signal Card with entry, targets, and invalidation.</p>
                <TradeComposer onSubmit={handleTradeSubmit} />
              </TabsContent>

              <TabsContent value="prediction" className="mt-0">
                <p className="text-[10px] text-gray-500 mb-2">Create a prediction market. Members can vote YES or NO until the deadline.</p>
                <PredictionComposer onSubmit={handlePredictionSubmit} />
              </TabsContent>

              <TabsContent value="event" className="mt-0">
                <p className="text-[10px] text-gray-500 mb-2">Schedule a community event. Members can RSVP.</p>
                <EventComposer onSubmit={handleEventSubmit} />
              </TabsContent>

              <TabsContent value="receipt" className="mt-0">
                <p className="text-[10px] text-gray-500 mb-2">Send an on-chain payment and log the receipt.</p>
                <PaymentComposer onSuccess={handlePaymentSuccess} />
              </TabsContent>

              <TabsContent value="article" className="mt-0">
                <p className="text-[10px] text-gray-500 mb-2">Share a newsletter article from Paragraph.</p>
                <NewsletterComposer onSubmit={handleNewsletterSubmit} isSubmitting={sendMessage.isPending} />
              </TabsContent>
            </Tabs>
          </div>
        </main>

        {/* Right Sidebar - Zone Memory Drawer */}
        {memoryDrawerOpen && (
          <aside className="w-72 border-l border-gray-800 flex flex-col bg-gray-900/50">
            <div className="p-4 border-b border-gray-800 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">Zone Memory</h3>
              <button 
                onClick={() => setMemoryDrawerOpen(false)}
                className="p-1 hover:bg-gray-800 rounded-md text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <ScrollArea className="flex-1">
              <div className="p-4 space-y-6">
                {/* Search */}
                <div>
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <Input 
                      placeholder="Search in Zone..."
                      className="bg-gray-800/80 border-gray-700 text-white pl-9 text-sm"
                    />
                  </div>
                </div>

                {/* Pinned Items */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Pin className="w-4 h-4 text-purple-400" />
                    <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Pinned</h4>
                  </div>
                  <div className="text-sm text-gray-500 text-center py-4 bg-gray-800/30 rounded-lg border border-dashed border-gray-700">
                    No pinned items yet
                  </div>
                </div>

                {/* Active Signals/Predictions */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp className="w-4 h-4 text-green-400" />
                    <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Active Signals</h4>
                  </div>
                  <div className="bg-gray-800/30 rounded-lg p-3 border border-gray-700/50">
                    <p className="text-2xl font-bold text-white">{signalsCount}</p>
                    <p className="text-xs text-gray-500">Trade signals in this Zone</p>
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <BarChart3 className="w-4 h-4 text-blue-400" />
                    <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Active Predictions</h4>
                  </div>
                  <div className="bg-gray-800/30 rounded-lg p-3 border border-gray-700/50">
                    <p className="text-2xl font-bold text-white">{predictionsCount}</p>
                    <p className="text-xs text-gray-500">Open predictions</p>
                  </div>
                </div>

                {/* Weekly Summary */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <FileText className="w-4 h-4 text-gray-400" />
                    <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Weekly Summary</h4>
                  </div>
                  <div className="text-sm text-gray-500 text-center py-4 bg-gray-800/30 rounded-lg border border-dashed border-gray-700">
                    Coming soon
                  </div>
                </div>

                {/* Export */}
                <div className="pt-4 border-t border-gray-800">
                  <Button variant="outline" className="w-full border-gray-700 text-gray-400 hover:text-white text-sm">
                    <Download className="w-4 h-4 mr-2" />
                    Export Zone (MD/JSON)
                  </Button>
                </div>
              </div>
            </ScrollArea>
          </aside>
        )}
      </div>
    </TooltipProvider>
  );
}
