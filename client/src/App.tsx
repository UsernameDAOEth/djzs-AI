import { Switch, Route } from "wouter";
import { WagmiProvider } from "wagmi";
import { QueryClientProvider } from "@tanstack/react-query";
import { RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";
import { queryClient } from "./lib/queryClient";
import { wagmiConfig } from "./lib/wagmi-config";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/home";
import Chat from "@/pages/chat";
import Docs from "@/pages/docs";
import NotFound from "@/pages/not-found";
import { InstallPrompt } from "@/components/pwa/InstallPrompt";

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
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          coolMode
          theme={darkTheme({
            accentColor: "hsl(270, 80%, 60%)",
            accentColorForeground: "white",
            borderRadius: "medium",
          })}
        >
          <TooltipProvider>
            <Toaster />
            <Router />
            <InstallPrompt />
          </TooltipProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default App;
