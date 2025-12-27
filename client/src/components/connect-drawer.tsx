import { ConnectButton } from "@rainbow-me/rainbowkit";
import { X } from "lucide-react";

interface ConnectDrawerProps {
  onClose: () => void;
}

export default function ConnectDrawer({ onClose }: ConnectDrawerProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-xl p-8 max-w-md w-full mx-4 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          data-testid="button-close-drawer"
        >
          <X className="w-5 h-5" />
        </button>
        
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Connect Your Wallet</h3>
        <p className="text-gray-600 mb-6">
          Your wallet and ENS establish your identity across the DJZS system.
        </p>
        
        <div className="flex justify-center">
          <ConnectButton showBalance={false} />
        </div>
        
        <p className="text-xs text-gray-500 text-center mt-6">
          By connecting, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}
