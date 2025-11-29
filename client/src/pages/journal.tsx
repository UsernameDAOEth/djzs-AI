import { useState } from "react";
import { useAccount } from "wagmi";
import { useIsSubscribed } from "@/hooks/use-subscription";
import { WalletConnectButton } from "@/components/web3/connect-button";
import { PrivacyMintButton } from "@/components/web3/privacy-mint-button";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Sparkles, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";

interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export default function Journal() {
  const { address } = useAccount();
  const { subscribed, loading } = useIsSubscribed(address as `0x${string}` | undefined);
  const { toast } = useToast();
  
  const [journalContent, setJournalContent] = useState("");
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState("");

  // Check if current user is admin
  const adminAddress = import.meta.env.VITE_ADMIN_ADDRESS?.toLowerCase();
  const isAdmin = address && adminAddress && address.toLowerCase() === adminAddress;
  const hasAccess = subscribed || isAdmin;

  const chatMutation = useMutation({
    mutationFn: async (messages: Message[]) => {
      const res = await apiRequest('POST', '/api/ai/chat', { messages });
      return await res.json();
    },
    onSuccess: (data: any) => {
      if (data.choices && data.choices[0]?.message) {
        const assistantMessage: Message = {
          role: 'assistant',
          content: data.choices[0].message.content,
        };
        setChatMessages(prev => [...prev, assistantMessage]);
      }
    },
    onError: (error: any) => {
      toast({
        title: "AI Error",
        description: error.message || "Failed to get AI response",
        variant: "destructive",
      });
    },
  });

  const handleSendMessage = () => {
    if (!userInput.trim()) return;

    const newUserMessage: Message = {
      role: 'user',
      content: userInput,
    };

    const systemPrompt: Message = {
      role: 'system',
      content: 'You are a helpful writing assistant for DJZS Newsletter. Help the author write engaging, insightful content about trading, blockchain, and market analysis. Be concise but thoughtful.',
    };

    const messagesToSend = [
      systemPrompt,
      ...chatMessages,
      newUserMessage,
    ];

    setChatMessages(prev => [...prev, newUserMessage]);
    setUserInput("");
    chatMutation.mutate(messagesToSend);
  };

  const handleInsertSuggestion = (text: string) => {
    setJournalContent(prev => prev + "\n\n" + text);
    toast({
      title: "Inserted!",
      description: "AI suggestion added to your journal",
    });
  };

  // Not subscribed state
  if (!address) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        <div className="fixed inset-0 bg-gradient-to-b from-[#0a0a14] via-[#0e0b1f] to-[#0a0a14] -z-20"></div>
        <div className="starfield -z-10"></div>
        
        <div className="container mx-auto px-4 py-20">
          <Card className="max-w-2xl mx-auto bg-black/40 border-white/10">
            <CardHeader>
              <CardTitle className="text-2xl text-white">Connect Wallet</CardTitle>
              <CardDescription className="text-white/70">
                Connect your wallet to access the journal
              </CardDescription>
            </CardHeader>
            <CardContent>
              <WalletConnectButton />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        <div className="fixed inset-0 bg-gradient-to-b from-[#0a0a14] via-[#0e0b1f] to-[#0a0a14] -z-20"></div>
        <div className="starfield -z-10"></div>
        
        <div className="container mx-auto px-4 py-20">
          <Card className="max-w-2xl mx-auto bg-black/40 border-white/10">
            <CardContent className="py-20">
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-white/70">Checking subscription...</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        <div className="fixed inset-0 bg-gradient-to-b from-[#0a0a14] via-[#0e0b1f] to-[#0a0a14] -z-20"></div>
        <div className="starfield -z-10"></div>
        
        <div className="container mx-auto px-4 py-20">
          <Card className="max-w-2xl mx-auto bg-black/40 border-white/10 border-red-400/30">
            <CardHeader>
              <CardTitle className="text-2xl text-white">Subscription Required</CardTitle>
              <CardDescription className="text-white/70">
                You need to mint a Subscribe NFT to access the journal and AI assistant
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-white/80 mb-4">
                Go back to the homepage and mint your Subscribe NFT for 0.001 ETH to unlock:
              </p>
              <ul className="space-y-2 text-white/70 mb-6">
                <li>• AI-powered writing assistant</li>
                <li>• Journal and content creation tools</li>
                <li>• Premium newsletter access</li>
              </ul>
              <Button 
                onClick={() => window.location.href = '/'}
                className="bg-primary hover:bg-primary/90"
                data-testid="button-go-home"
              >
                Go to Homepage
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Subscribed - show journal interface
  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="fixed inset-0 bg-gradient-to-b from-[#0a0a14] via-[#0e0b1f] to-[#0a0a14] -z-20"></div>
      <div className="starfield -z-10"></div>
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold text-white">DJZS Journal</h1>
            {isAdmin && (
              <span className="px-3 py-1 bg-primary/20 border border-primary/50 rounded-full text-xs text-primary font-semibold">
                ADMIN
              </span>
            )}
          </div>
          <WalletConnectButton />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Journal Editor */}
          <Card className="bg-black/40 border-white/10">
            <CardHeader>
              <div className="flex items-center gap-2">
                <CardTitle className="text-white">Write Your Journal</CardTitle>
                <Lock className="h-4 w-4 text-purple-400" />
              </div>
              <CardDescription className="text-white/70">
                Create content and mint as privacy NFTs on Aztec
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={journalContent}
                onChange={(e) => setJournalContent(e.target.value)}
                placeholder="Write your research, article, music lyrics, or trading analysis..."
                className="min-h-[400px] bg-black/30 border-white/10 text-white placeholder:text-white/40 resize-none"
                data-testid="textarea-journal"
              />
              <div className="flex justify-between items-center">
                <span className="text-sm text-white/50">
                  {journalContent.length} characters
                </span>
                <Button
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10"
                  data-testid="button-save"
                >
                  Save Draft
                </Button>
              </div>
              <PrivacyMintButton journalContent={journalContent} />
            </CardContent>
          </Card>

          {/* AI Assistant */}
          <Card className="bg-black/40 border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                AI Writing Assistant
              </CardTitle>
              <CardDescription className="text-white/70">
                Powered by Nous Research Hermes-4
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col h-[500px]">
                {/* Chat Messages */}
                <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
                  {chatMessages.length === 0 ? (
                    <div className="text-center py-12 text-white/50">
                      <Sparkles className="h-12 w-12 mx-auto mb-4 text-primary/50" />
                      <p>Ask me anything to help with your writing!</p>
                      <p className="text-sm mt-2">Examples:</p>
                      <ul className="text-xs mt-2 space-y-1">
                        <li>"Help me write about Bitcoin's recent price action"</li>
                        <li>"Suggest a compelling opening for this topic"</li>
                        <li>"Review my draft and suggest improvements"</li>
                      </ul>
                    </div>
                  ) : (
                    chatMessages.map((msg, idx) => (
                      <div
                        key={idx}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-lg p-3 ${
                            msg.role === 'user'
                              ? 'bg-primary/20 text-white'
                              : 'bg-white/10 text-white/90'
                          }`}
                          data-testid={`message-${msg.role}-${idx}`}
                        >
                          <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                          {msg.role === 'assistant' && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleInsertSuggestion(msg.content)}
                              className="mt-2 h-6 text-xs text-white/70 hover:text-white"
                              data-testid={`button-insert-${idx}`}
                            >
                              Insert into journal
                            </Button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                  {chatMutation.isPending && (
                    <div className="flex justify-start">
                      <div className="bg-white/10 rounded-lg p-3">
                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Input */}
                <div className="flex gap-2">
                  <Textarea
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    placeholder="Ask the AI assistant..."
                    className="bg-black/30 border-white/10 text-white placeholder:text-white/40 resize-none"
                    rows={2}
                    data-testid="textarea-chat"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!userInput.trim() || chatMutation.isPending}
                    className="bg-primary hover:bg-primary/90 self-end"
                    data-testid="button-send"
                  >
                    Send
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
