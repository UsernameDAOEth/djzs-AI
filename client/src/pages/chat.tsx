import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useQuery } from "@tanstack/react-query";
import { 
  MessageSquare, 
  TrendingUp, 
  BarChart3, 
  Calendar, 
  DollarSign,
  Users,
  Settings,
  Send,
  Plus,
  Loader2,
  Shield
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import type { Room, Member } from "@shared/schema";

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
  const [selectedRoom, setSelectedRoom] = useState("lounge");
  const [messageInput, setMessageInput] = useState("");
  const [composerTab, setComposerTab] = useState("text");

  const { data: member, isLoading: memberLoading } = useQuery<Member | null>({
    queryKey: ["/api/members", address],
    enabled: !!address,
  });

  const { data: rooms } = useQuery<Room[]>({
    queryKey: ["/api/rooms"],
    enabled: !!address,
  });

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
            Connected: {address?.slice(0, 6)}...{address?.slice(-4)}
          </p>
        </div>
      </div>
    );
  }

  const currentRoom = DEFAULT_ROOMS.find(r => r.id === selectedRoom);

  return (
    <div className="h-screen bg-gray-950 flex">
      <aside className="w-64 border-r border-gray-800 flex flex-col">
        <div className="p-4 border-b border-gray-800">
          <h1 className="text-xl font-bold text-white">DJZS Chat</h1>
          <p className="text-xs text-gray-500 mt-1">
            {member?.ensName || `${address?.slice(0, 6)}...${address?.slice(-4)}`}
          </p>
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

        <div className="p-4 border-t border-gray-800">
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
          {member?.isAdmin && (
            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
              <Settings className="w-4 h-4" />
            </Button>
          )}
        </header>

        <ScrollArea className="flex-1 p-4">
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>XMTP messaging coming soon...</p>
              <p className="text-sm mt-2">Messages will be end-to-end encrypted</p>
            </div>
          </div>
        </ScrollArea>

        <div className="border-t border-gray-800 p-4">
          <Tabs value={composerTab} onValueChange={setComposerTab}>
            <TabsList className="bg-gray-900 mb-3">
              <TabsTrigger value="text" className="text-xs" data-testid="tab-text">
                <MessageSquare className="w-3 h-3 mr-1" />
                Text
              </TabsTrigger>
              <TabsTrigger value="trade" className="text-xs" data-testid="tab-trade">
                <TrendingUp className="w-3 h-3 mr-1" />
                Trade
              </TabsTrigger>
              <TabsTrigger value="prediction" className="text-xs" data-testid="tab-prediction">
                <BarChart3 className="w-3 h-3 mr-1" />
                Prediction
              </TabsTrigger>
              <TabsTrigger value="event" className="text-xs" data-testid="tab-event">
                <Calendar className="w-3 h-3 mr-1" />
                Event
              </TabsTrigger>
              <TabsTrigger value="pay" className="text-xs" data-testid="tab-pay">
                <DollarSign className="w-3 h-3 mr-1" />
                Pay
              </TabsTrigger>
            </TabsList>

            <TabsContent value="text" className="mt-0">
              <div className="flex gap-2">
                <Input
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder="Type a message..."
                  className="bg-gray-900 border-gray-700 text-white placeholder:text-gray-500"
                  data-testid="input-message"
                />
                <Button className="bg-purple-600 hover:bg-purple-700" data-testid="button-send">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="trade" className="mt-0">
              <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
                <p className="text-gray-400 text-sm">Trade signal composer coming soon...</p>
              </div>
            </TabsContent>

            <TabsContent value="prediction" className="mt-0">
              <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
                <p className="text-gray-400 text-sm">Prediction market composer coming soon...</p>
              </div>
            </TabsContent>

            <TabsContent value="event" className="mt-0">
              <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
                <p className="text-gray-400 text-sm">Event composer coming soon...</p>
              </div>
            </TabsContent>

            <TabsContent value="pay" className="mt-0">
              <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
                <p className="text-gray-400 text-sm">Payment modal coming soon...</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
