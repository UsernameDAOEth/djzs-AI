import { AuthButton, SignOutButton } from "@coinbase/cdp-react";
import { useIsSignedIn, useEvmAddress } from "@coinbase/cdp-hooks";
import { ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";

function shortenAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function WalletConnectButton() {
  const { isSignedIn } = useIsSignedIn();
  const { evmAddress } = useEvmAddress();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (isSignedIn && evmAddress) {
    return (
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-purple-600 to-purple-500 px-6 py-3 font-bold text-white shadow-lg shadow-purple-500/30 transition-all hover:from-purple-500 hover:to-purple-400 hover:shadow-purple-500/50 hover:scale-105"
          data-testid="button-wallet-connected"
        >
          <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-xs">
            {evmAddress.slice(2, 4).toUpperCase()}
          </div>
          <span>{shortenAddress(evmAddress)}</span>
          <ChevronDown className="w-4 h-4" />
        </button>
        
        {dropdownOpen && (
          <div className="absolute top-full right-0 mt-2 w-48 rounded-xl bg-gray-900 border border-white/10 shadow-xl overflow-hidden z-50">
            <div className="px-4 py-3 border-b border-white/10">
              <p className="text-xs text-gray-500 uppercase tracking-wide">Connected</p>
              <p className="text-sm text-white font-mono mt-1">{shortenAddress(evmAddress)}</p>
            </div>
            <div className="px-4 py-3" onClick={() => setDropdownOpen(false)}>
              <SignOutButton onSuccess={() => setDropdownOpen(false)} />
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div 
      className="cdp-auth-button-wrapper"
      data-testid="button-connect-wallet"
    >
      <AuthButton />
    </div>
  );
}
