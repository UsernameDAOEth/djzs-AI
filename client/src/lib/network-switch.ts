import { base, baseSepolia } from "viem/chains";

export const BASE_MAINNET = {
  chainId: `0x${base.id.toString(16)}`,
  chainName: "Base",
  nativeCurrency: {
    name: "Ethereum",
    symbol: "ETH",
    decimals: 18,
  },
  rpcUrls: ["https://mainnet.base.org"],
  blockExplorerUrls: ["https://basescan.org"],
};

export const BASE_SEPOLIA = {
  chainId: `0x${baseSepolia.id.toString(16)}`,
  chainName: "Base Sepolia",
  nativeCurrency: {
    name: "Ethereum",
    symbol: "ETH",
    decimals: 18,
  },
  rpcUrls: ["https://sepolia.base.org"],
  blockExplorerUrls: ["https://sepolia.basescan.org"],
};

/**
 * Programmatically switch to Base network (mainnet or sepolia)
 * @param chain - "mainnet" or "sepolia"
 */
export async function ensureBase(chain: "mainnet" | "sepolia" = "sepolia") {
  if (typeof window === "undefined" || !window.ethereum) {
    throw new Error("MetaMask or compatible wallet not found");
  }

  const target = chain === "mainnet" ? BASE_MAINNET : BASE_SEPOLIA;
  const ethereum = window.ethereum;

  try {
    const currentChainId = await ethereum.request({ method: "eth_chainId" });

    if (currentChainId !== target.chainId) {
      try {
        await ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: target.chainId }],
        });
      } catch (switchError: any) {
        // Chain not added to wallet, add it
        if (switchError.code === 4902) {
          await ethereum.request({
            method: "wallet_addEthereumChain",
            params: [target],
          });
        } else {
          throw switchError;
        }
      }
    }
  } catch (error) {
    console.error("Error switching network:", error);
    throw error;
  }
}

declare global {
  interface Window {
    ethereum?: any;
  }
}
