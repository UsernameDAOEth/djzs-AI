import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Download, X } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches;
    
    setIsIOS(isIOSDevice);

    if (isStandalone) return;

    if (isIOSDevice) {
      const dismissed = localStorage.getItem("pwa-install-dismissed");
      if (!dismissed) {
        setTimeout(() => setShowPrompt(true), 3000);
      }
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      const dismissed = localStorage.getItem("pwa-install-dismissed");
      if (!dismissed) {
        setTimeout(() => setShowPrompt(true), 3000);
      }
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setShowPrompt(false);
      }
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem("pwa-install-dismissed", "true");
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 p-4 rounded-2xl bg-gray-900/95 border border-purple-500/30 backdrop-blur-xl shadow-2xl z-50" data-testid="install-prompt">
      <button
        onClick={handleDismiss}
        className="absolute top-2 right-2 p-1 rounded-full hover:bg-white/10 transition-colors"
        data-testid="button-dismiss-install"
      >
        <X className="w-4 h-4 text-gray-500" />
      </button>
      
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-purple-600/20 flex items-center justify-center shrink-0">
          <Download className="w-5 h-5 text-purple-400" />
        </div>
        <div className="flex-1">
          <p className="font-semibold text-white text-sm">Install DJZS</p>
          {isIOS ? (
            <p className="text-xs text-gray-400 mt-1">
              Tap <span className="text-white">Share</span> then <span className="text-white">Add to Home Screen</span>
            </p>
          ) : (
            <>
              <p className="text-xs text-gray-400 mt-1">Get quick access from your home screen</p>
              <Button
                onClick={handleInstall}
                size="sm"
                className="mt-3 bg-purple-600 hover:bg-purple-500 text-white text-xs"
                data-testid="button-install-app"
              >
                Install App
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
