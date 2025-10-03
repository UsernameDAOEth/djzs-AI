import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { base, baseSepolia } from "wagmi/chains";
import { http } from "wagmi";

export const CONTRACT_ADDRESS = (import.meta.env.VITE_SUBSCRIBE_NFT_ADDRESS || "0x0000000000000000000000000000000000000000") as `0x${string}`;
export const SUBSCRIBE_PRICE_ETH = import.meta.env.VITE_SUBSCRIBE_PRICE || "0";

export const SUBSCRIBE_ABI = [
  { type: "function", name: "mint", stateMutability: "payable", inputs: [], outputs: [] },
  { type: "function", name: "balanceOf", stateMutability: "view", inputs: [{ name: "owner", type: "address" }], outputs: [{ type: "uint256" }] },
  { type: "function", name: "totalSupply", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  { type: "function", name: "maxSupply", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  { type: "function", name: "price", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  { type: "function", name: "totalMinted", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
] as const;

export const wagmiConfig = getDefaultConfig({
  appName: "DJZS Newsletter",
  projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || "djzs-newsletter-on-base",
  chains: [base, baseSepolia],
  transports: {
    [base.id]: http(),
    [baseSepolia.id]: http(),
  },
});
