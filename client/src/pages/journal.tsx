import { useState } from "react";
import { useAccount } from "wagmi";
import { useIsSubscribed } from "@/hooks/use-subscription";
import { WalletConnectButton } from "@/components/web3/connect-button";
import { PrivacyMintButton } from "@/components/web3/privacy-mint-button";
import { MintButton } from "@/components/web3/mint-button";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Sparkles, Lock, Globe, Upload, File } from "lucide-react";
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
  const [uploadedFile, setUploadedFile] = useState<{ name: string; ipfsHash: string } | null>(null);
  const [isUploading, setIsUploading] = useState(false);
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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const reader = new FileReader();
    
    reader.onload = async (event) => {
      try {
        const base64 = (event.target?.result as string).split(',')[1];
        
        const response = await fetch("/api/journal/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            filename: file.name,
            fileData: base64,
            mimeType: file.type,
          }),
        });

        if (!response.ok) {
          throw new Error("Upload failed");
        }

        const data = await response.json();
        setUploadedFile({ name: file.name, ipfsHash: data.ipfsHash });
        toast({
          title: "File Uploaded! 📄",
          description: `${file.name} uploaded to IPFS`,
        });
      } catch (error) {
        toast({
          title: "Upload Failed",
          description: error instanceof Error ? error.message : "Failed to upload file",
          variant: "destructive",
        });
      } finally {
        setIsUploading(false);
      }
    };
    
    reader.onerror = () => {
      toast({
        title: "Upload Failed",
        description: "Failed to read file",
        variant: "destructive",
      });
      setIsUploading(false);
    };
    
    reader.readAsDataURL(file);
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

        <div className="grid grid-cols-1 gap-6">
          {/* Journal Editor */}
          <div className="lg:col-span-2">
            <Card className="bg-black/40 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Write Your Journal</CardTitle>
                <CardDescription className="text-white/70">
                  Create content and mint as NFTs on your choice of networks
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  value={journalContent}
                  onChange={(e) => setJournalContent(e.target.value)}
                  placeholder="Write your research, article, music lyrics, or trading analysis..."
                  className="min-h-[300px] bg-black/30 border-white/10 text-white placeholder:text-white/40 resize-none"
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

                {/* File Upload Section */}
                <div className="mt-6 rounded-xl border border-white/20 bg-white/5 p-4">
                  <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                    <Upload className="h-4 w-4" />
                    Upload Journal File (Optional)
                  </h4>
                  <div className="flex gap-3 items-center">
                    <label className="flex-1 cursor-pointer">
                      <input
                        type="file"
                        onChange={handleFileUpload}
                        disabled={isUploading}
                        className="hidden"
                        accept=".pdf,.doc,.docx,.txt,.md"
                      />
                      <div className="rounded-lg border border-dashed border-white/30 p-4 text-center hover:border-white/50 hover:bg-white/5 transition">
                        {isUploading ? (
                          <div className="flex items-center justify-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span className="text-sm text-white/70">Uploading...</span>
                          </div>
                        ) : uploadedFile ? (
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-left flex-1">
                              <File className="h-4 w-4 text-green-400" />
                              <div>
                                <p className="text-sm font-semibold text-white">{uploadedFile.name}</p>
                                <p className="text-xs text-white/50">Uploaded to IPFS</p>
                              </div>
                            </div>
                            <button
                              onClick={() => setUploadedFile(null)}
                              className="text-xs text-white/50 hover:text-white"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <div>
                            <p className="text-sm text-white/70">Click to upload PDF, Doc, or Text file</p>
                            <p className="text-xs text-white/50 mt-1">Max 10MB</p>
                          </div>
                        )}
                      </div>
                    </label>
                  </div>
                </div>

                {/* Minting Options */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Aztec Privacy NFT */}
                  <div className="rounded-xl border border-purple-400/30 bg-purple-400/10 p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Lock className="h-4 w-4 text-purple-400" />
                      <h3 className="font-semibold text-white">Aztec Privacy NFT</h3>
                    </div>
                    <p className="text-sm text-white/70 mb-4">
                      Mint as a private NFT on Aztec testnet (content hash only on-chain)
                    </p>
                    {uploadedFile && (
                      <p className="text-xs text-green-300 mb-3 flex items-center gap-1">
                        <File className="h-3 w-3" /> File will be included
                      </p>
                    )}
                    <PrivacyMintButton journalContent={journalContent} uploadedFile={uploadedFile} />
                  </div>

                  {/* Base Regular NFT */}
                  <div className="rounded-xl border border-blue-400/30 bg-blue-400/10 p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Globe className="h-4 w-4 text-blue-400" />
                      <h3 className="font-semibold text-white">Base Public NFT</h3>
                    </div>
                    <p className="text-sm text-white/70 mb-4">
                      Mint as a public NFT on Base mainnet (full visibility, transferable)
                    </p>
                    {uploadedFile && (
                      <p className="text-xs text-green-300 mb-3 flex items-center gap-1">
                        <File className="h-3 w-3" /> File will be included
                      </p>
                    )}
                    <MintButton uploadedFile={uploadedFile} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Grid for AI and future content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
    </div>
  );
}
