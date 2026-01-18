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
import { base } from "wagmi/chains";

// Ensure window.ethereum exists to prevent property redefinition errors
if (typeof window !== "undefined" && !("ethereum" in window)) {
  (window as any).ethereum = undefined;
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
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <OnchainKitProvider
          apiKey={import.meta.env.VITE_CDP_API_KEY}
          chain={base as any}
          config={{
            appearance: {
              mode: "dark",
              theme: "default",
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
