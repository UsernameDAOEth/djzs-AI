import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useQuery, useMutation } from "@tanstack/react-query";
import { nanoid } from "nanoid";
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
  Key
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useDisplayName, useMultipleEnsNames, formatAddress } from "@/hooks/use-ens";
import { useXmtp } from "@/hooks/use-xmtp";
import { MessageCard } from "@/components/chat/message-cards";
import { TradeComposer } from "@/components/chat/trade-composer";
import { PredictionComposer } from "@/components/chat/prediction-composer";
import { EventComposer } from "@/components/chat/event-composer";
import { PaymentComposer } from "@/components/chat/payment-composer";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Room, Member, ChatMessage, StoredMessage } from "@shared/schema";

const DEFAULT_ROOMS = [
  { id: "lounge", name: "Members Lounge", icon: Users, description: "General discussion" },
  { id: "trades", name: "Trades", icon: TrendingUp, description: "Trade signals and setups" },
  { id: "predictions", name: "Predictions", icon: BarChart3, description: "Market predictions" },
  { id: "events", name: "Events", icon: Calendar, description: "Community events" },
  { id: "payments", name: "Payments", icon: DollarSign, description: "Payment receipts" },
];

export default function Chat() {
  const { address, isConnected } = useAccount();
  const { toast } = useToast();
  const { displayName, ensName } = useDisplayName(address);
  const { client: xmtpClient, isConnecting: xmtpConnecting, connect: connectXmtp, error: xmtpError } = useXmtp();
  
  const [selectedRoom, setSelectedRoom] = useState("lounge");
  const [messageInput, setMessageInput] = useState("");
  const [composerTab, setComposerTab] = useState("text");

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
    queryKey: ["/api/messages", selectedRoom],
    queryFn: async () => {
      const res = await fetch(`/api/messages/${selectedRoom}`);
      if (!res.ok) throw new Error("Failed to fetch messages");
      return res.json();
    },
    enabled: !!member && (member.isAllowlisted || member.isAdmin),
    refetchInterval: 5000,
  });

  const sendMessage = useMutation({
    mutationFn: async (message: ChatMessage) => {
      const res = await apiRequest("POST", "/api/messages", {
        roomId: selectedRoom,
        message,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages", selectedRoom] });
      toast({
        title: "Message sent",
        description: "Your message has been posted to the room",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send message",
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
          <h2 className="text-2xl font-bold text-white mb-2">Connect to Chat</h2>
          <p className="text-gray-400 mb-6">Connect your wallet to access DJZS Chat</p>
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
          <h2 className="text-2xl font-bold text-white mb-2">Welcome to DJZS Chat</h2>
          <p className="text-gray-400 mb-4">
            {displayName}
          </p>
          <p className="text-gray-500 text-sm mb-6">
            Click below to register as a member and start chatting.
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
            Join DJZS Chat
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
            This chat is restricted to members. You need to be on the allowlist or hold a membership NFT.
          </p>
          <p className="text-sm text-gray-500">
            Connected: {displayName}
          </p>
        </div>
      </div>
    );
  }

  const currentRoom = DEFAULT_ROOMS.find(r => r.id === selectedRoom);

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

  const handleTradeSubmit = (data: { asset: string; direction: "long" | "short"; entry: string; invalidation: string; tp: string[]; timeframe?: string; leverage?: string; notes?: string }) => {
    if (!address || sendMessage.isPending) return;
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
    if (!address || sendMessage.isPending) return;
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
    if (!address || sendMessage.isPending) return;
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
    if (!address || sendMessage.isPending) return;
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

  return (
    <div className="h-screen bg-gray-950 flex">
      <aside className="w-64 border-r border-gray-800 flex flex-col">
        <div className="p-4 border-b border-gray-800">
          <h1 className="text-xl font-bold text-white">DJZS Chat</h1>
          <p className="text-xs text-gray-500 mt-1">{displayName}</p>
          {member?.isAdmin && (
            <span className="text-[10px] text-purple-400 bg-purple-400/20 px-2 py-0.5 rounded mt-1 inline-block">ADMIN</span>
          )}
        </div>

        <ScrollArea className="flex-1">
          <div className="p-2">
            <p className="text-xs text-gray-500 px-2 py-2 uppercase tracking-wider">Rooms</p>
            {DEFAULT_ROOMS.map((room) => {
              const Icon = room.icon;
              return (
                <button
                  key={room.id}
                  onClick={() => setSelectedRoom(room.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                    selectedRoom === room.id
                      ? "bg-purple-600/20 text-purple-400"
                      : "text-gray-400 hover:bg-gray-800/50 hover:text-white"
                  }`}
                  data-testid={`room-${room.id}`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm">{room.name}</span>
                </button>
              );
            })}
          </div>
        </ScrollArea>

        <div className="p-4 border-t border-gray-800 space-y-2">
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

      <main className="flex-1 flex flex-col">
        <header className="h-14 border-b border-gray-800 flex items-center justify-between px-4">
          <div className="flex items-center gap-3">
            {currentRoom && <currentRoom.icon className="w-5 h-5 text-purple-400" />}
            <div>
              <h2 className="text-white font-semibold">{currentRoom?.name}</h2>
              <p className="text-xs text-gray-500">{currentRoom?.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {xmtpClient && (
              <span className="text-xs text-green-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-400"></span>
                Encrypted
              </span>
            )}
            {member?.isAdmin && (
              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
                <Settings className="w-4 h-4" />
              </Button>
            )}
          </div>
        </header>

        <ScrollArea className="flex-1 p-4">
          {messagesLoading ? (
            <div className="flex items-center justify-center h-full text-gray-500">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-500">
              <div className="text-center">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No messages yet</p>
                <p className="text-sm mt-2">Be the first to post in #{currentRoom?.name}</p>
              </div>
            </div>
          ) : (
            <div className="space-y-1">
              {messages.map((stored) => (
                <MessageCard key={stored.id} message={stored.message} ensNames={ensNames} />
              ))}
            </div>
          )}
        </ScrollArea>

        <div className="border-t border-gray-700 p-4 bg-gray-900/50">
          <Tabs value={composerTab} onValueChange={setComposerTab}>
            <TabsList className="bg-gray-800 border border-gray-700 p-1 mb-3 w-full justify-start gap-1">
              <TabsTrigger 
                value="text" 
                className="text-sm text-gray-400 data-[state=active]:bg-purple-600 data-[state=active]:text-white px-3 py-2" 
                data-testid="tab-text"
              >
                <MessageSquare className="w-4 h-4 mr-1.5" />
                Text
              </TabsTrigger>
              <TabsTrigger 
                value="trade" 
                className="text-sm text-gray-400 data-[state=active]:bg-purple-600 data-[state=active]:text-white px-3 py-2" 
                data-testid="tab-trade"
              >
                <TrendingUp className="w-4 h-4 mr-1.5" />
                Trade
              </TabsTrigger>
              <TabsTrigger 
                value="prediction" 
                className="text-sm text-gray-400 data-[state=active]:bg-purple-600 data-[state=active]:text-white px-3 py-2" 
                data-testid="tab-prediction"
              >
                <BarChart3 className="w-4 h-4 mr-1.5" />
                Prediction
              </TabsTrigger>
              <TabsTrigger 
                value="event" 
                className="text-sm text-gray-400 data-[state=active]:bg-purple-600 data-[state=active]:text-white px-3 py-2" 
                data-testid="tab-event"
              >
                <Calendar className="w-4 h-4 mr-1.5" />
                Event
              </TabsTrigger>
              <TabsTrigger 
                value="pay" 
                className="text-sm text-gray-400 data-[state=active]:bg-purple-600 data-[state=active]:text-white px-3 py-2" 
                data-testid="tab-pay"
              >
                <DollarSign className="w-4 h-4 mr-1.5" />
                Pay
              </TabsTrigger>
            </TabsList>

            <TabsContent value="text" className="mt-0">
              <div className="flex gap-2">
                <Input
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendText()}
                  placeholder="Type a message..."
                  className="bg-gray-900 border-gray-700 text-white placeholder:text-gray-500"
                  data-testid="input-message"
                />
                <Button onClick={handleSendText} className="bg-purple-600 hover:bg-purple-700" data-testid="button-send">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="trade" className="mt-0">
              <TradeComposer onSubmit={handleTradeSubmit} />
            </TabsContent>

            <TabsContent value="prediction" className="mt-0">
              <PredictionComposer onSubmit={handlePredictionSubmit} />
            </TabsContent>

            <TabsContent value="event" className="mt-0">
              <EventComposer onSubmit={handleEventSubmit} />
            </TabsContent>

            <TabsContent value="pay" className="mt-0">
              <PaymentComposer onSuccess={handlePaymentSuccess} />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
