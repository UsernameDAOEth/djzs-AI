import { createConfig, http } from "wagmi";
import { base, baseSepolia } from "wagmi/chains";
import { baseAccount, coinbaseWallet, metaMask, injected } from "wagmi/connectors";

export const MEMBERSHIP_NFT_ADDRESS = (import.meta.env.VITE_MEMBERSHIP_NFT_ADDRESS || "") as `0x${string}`;
export const CHAIN_ID = parseInt(import.meta.env.VITE_CHAIN_ID || "8453");

export const ERC721_ABI = [
  { type: "function", name: "balanceOf", stateMutability: "view", inputs: [{ name: "owner", type: "address" }], outputs: [{ type: "uint256" }] },
  { type: "function", name: "ownerOf", stateMutability: "view", inputs: [{ name: "tokenId", type: "uint256" }], outputs: [{ type: "address" }] },
] as const;

export const ERC20_ABI = [
  { type: "function", name: "transfer", stateMutability: "nonpayable", inputs: [{ name: "to", type: "address" }, { name: "amount", type: "uint256" }], outputs: [{ type: "bool" }] },
  { type: "function", name: "balanceOf", stateMutability: "view", inputs: [{ name: "account", type: "address" }], outputs: [{ type: "uint256" }] },
  { type: "function", name: "decimals", stateMutability: "view", inputs: [], outputs: [{ type: "uint8" }] },
  { type: "function", name: "symbol", stateMutability: "view", inputs: [], outputs: [{ type: "string" }] },
] as const;

export const USDC_ADDRESS: Record<number, `0x${string}`> = {
  8453: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
  84532: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
};

// Wallet configuration for OnchainKit WalletModal
// - baseAccount: Enables email/social login (passkeys, Google, etc.)
// - coinbaseWallet: Coinbase Wallet app and extension
// - metaMask: MetaMask browser extension
// - injected: Other injected wallets (Phantom, Rabby, etc.)
export const wagmiConfig = createConfig({
  chains: [base, baseSepolia],
  connectors: [
    baseAccount({
      appName: "DJZS",
    }),
    coinbaseWallet({
      appName: "DJZS",
      preference: "all",
    }),
    metaMask({
      dappMetadata: {
        name: "DJZS",
      },
    }),
    injected(),
  ],
  transports: {
    [base.id]: http(import.meta.env.VITE_RPC_URL || undefined),
    [baseSepolia.id]: http(),
  },
});
