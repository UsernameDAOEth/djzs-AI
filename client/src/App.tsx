import { Switch, Route } from "wouter";
import { WagmiProvider } from "wagmi";
import { QueryClientProvider } from "@tanstack/react-query";
import { OnchainKitProvider } from "@coinbase/onchainkit";
import "@coinbase/onchainkit/styles.css";
import { queryClient } from "./lib/queryClient";
import { wagmiConfig } from "./lib/wagmi-config";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/home";
import Chat from "@/pages/chat";
import Docs from "@/pages/docs";
import Terms from "@/pages/terms";
import NotFound from "@/pages/not-found";
import { InstallPrompt } from "@/components/pwa/InstallPrompt";
import { base, baseSepolia } from "wagmi/chains";

// Ensure window.ethereum exists to prevent property redefinition errors
if (typeof window !== "undefined" && !("ethereum" in window)) {
  (window as any).ethereum = undefined;
}

function getChainConfig() {
  const chainName = import.meta.env.VITE_CDP_CHAIN || "base-sepolia";
  return chainName === "base" ? base : baseSepolia;
}

function getPaymasterUrl() {
  const paymasterKey = import.meta.env.VITE_CDP_PAYMASTER_KEY;
  const chainName = import.meta.env.VITE_CDP_CHAIN || "base-sepolia";
  if (!paymasterKey) return undefined;
  return `https://api.developer.coinbase.com/rpc/v1/${chainName}/${paymasterKey}`;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/chat" component={Chat} />
      <Route path="/docs" component={Docs} />
      <Route path="/terms" component={Terms} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const chain = getChainConfig();
  const paymasterUrl = getPaymasterUrl();
  
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <OnchainKitProvider
          apiKey={import.meta.env.VITE_CDP_API_KEY}
          chain={chain as any}
          config={{
            appearance: {
              name: "DJZS",
              mode: "dark",
              theme: "default",
            },
            wallet: {
              display: "modal",
              termsUrl: "/terms",
              privacyUrl: "/terms",
            },
          }}
        >
          <TooltipProvider>
            <Toaster />
            <Router />
            <InstallPrompt />
          </TooltipProvider>
        </OnchainKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default App;
