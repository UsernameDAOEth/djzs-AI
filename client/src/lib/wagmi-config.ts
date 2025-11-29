import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { base, baseSepolia } from "wagmi/chains";
import { http } from "wagmi";
import { defineChain } from "viem";

// Aztec Testnet configuration
export const aztecTestnet = defineChain({
  id: 31337,
  name: "Aztec Testnet",
  network: "aztec-testnet",
  nativeCurrency: {
    decimals: 18,
    name: "Ethereum",
    symbol: "ETH",
  },
  rpcUrls: {
    default: {
      http: ["https://testnet.aztec.network"],
    },
  },
  blockExplorers: {
    default: { name: "Aztec Explorer", url: "https://explorer.testnet.aztec.network" },
  },
});

export const CONTRACT_ADDRESS = (import.meta.env.VITE_SUBSCRIBE_NFT_ADDRESS || "0x0000000000000000000000000000000000000000") as `0x${string}`;
export const SUBSCRIBE_PRICE_ETH = import.meta.env.VITE_SUBSCRIBE_PRICE || "0";
export const PRIVACY_NFT_CONTRACT = (import.meta.env.VITE_PRIVACY_NFT_ADDRESS || "0x0000000000000000000000000000000000000000") as `0x${string}`;

export const SUBSCRIBE_ABI = [
  { type: "function", name: "purchase", stateMutability: "payable", inputs: [{ name: "_values", type: "uint256[]" }, { name: "_recipients", type: "address[]" }, { name: "_referrers", type: "address[]" }, { name: "_keyManagers", type: "address[]" }, { name: "_data", type: "bytes[]" }], outputs: [{ type: "uint256[]" }] },
  { type: "function", name: "balanceOf", stateMutability: "view", inputs: [{ name: "_owner", type: "address" }], outputs: [{ type: "uint256" }] },
  { type: "function", name: "totalSupply", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  { type: "function", name: "maxNumberOfKeys", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  { type: "function", name: "keyPrice", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  { type: "function", name: "getHasValidKey", stateMutability: "view", inputs: [{ name: "_user", type: "address" }], outputs: [{ type: "bool" }] },
] as const;

export const PRIVACY_NFT_ABI = [
  { type: "function", name: "mintPrivate", stateMutability: "nonpayable", inputs: [{ name: "contentHash", type: "bytes32" }, { name: "metadata", type: "string" }], outputs: [{ name: "tokenId", type: "uint256" }] },
  { type: "function", name: "balanceOf", stateMutability: "view", inputs: [{ name: "_owner", type: "address" }], outputs: [{ type: "uint256" }] },
] as const;

export const wagmiConfig = getDefaultConfig({
  appName: "DJZS Newsletter - Privacy Edition",
  projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || "djzs-newsletter-aztec",
  chains: [aztecTestnet, base, baseSepolia],
  transports: {
    [aztecTestnet.id]: http(),
    [base.id]: http(),
    [baseSepolia.id]: http(),
  },
});
