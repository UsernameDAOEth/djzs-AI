import { Switch, Route, useLocation } from "wouter";
import { useEffect } from "react";
import { WagmiProvider } from "wagmi";
import { QueryClientProvider } from "@tanstack/react-query";
import { RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";
import { queryClient } from "./lib/queryClient";
import { wagmiConfig } from "./lib/wagmi-config";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/lib/theme";
import Home from "@/pages/home";
import Chat from "@/pages/chat";
import Docs from "@/pages/docs";
import Terms from "@/pages/terms";
import Privacy from "@/pages/privacy";
import Roadmap from "@/pages/roadmap";
import About from "@/pages/about";
import Security from "@/pages/security";
import NotFound from "@/pages/not-found";

import { ErrorBoundary } from "@/components/error-boundary";

function ScrollToTop() {
  const [location] = useLocation();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);
  
  return null;
}

// Ensure window.ethereum exists to prevent property redefinition errors
if (typeof window !== "undefined" && !("ethereum" in window)) {
  (window as any).ethereum = undefined;
}

function Router() {
  return (
    <>
      <ScrollToTop />
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/chat" component={Chat} />
        <Route path="/docs" component={Docs} />
        <Route path="/terms" component={Terms} />
        <Route path="/privacy" component={Privacy} />
        <Route path="/roadmap" component={Roadmap} />
        <Route path="/about" component={About} />
        <Route path="/security" component={Security} />
        <Route component={NotFound} />
      </Switch>
    </>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <WagmiProvider config={wagmiConfig}>
          <QueryClientProvider client={queryClient}>
            <RainbowKitProvider
              coolMode
              theme={darkTheme({
                accentColor: "#F37E20",
                accentColorForeground: "white",
                borderRadius: "medium",
              })}
            >
              <TooltipProvider>
                <Toaster />
                <Router />

              </TooltipProvider>
            </RainbowKitProvider>
          </QueryClientProvider>
        </WagmiProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
