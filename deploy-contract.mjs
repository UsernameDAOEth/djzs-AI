import { ethers } from 'ethers';

// --- Load env ---
const {
  RPC_URL = 'https://sepolia.base.org',
  PRIVATE_KEY,
  NAME = 'DJZS Subscribe',
  SYMBOL = 'DJZSUB',
  PRICE_WEI = '1000000000000000',
  TREASURY,
  BASE_TOKEN_URI = 'ipfs://temp/',
  MAX_SUPPLY = '0'
} = process.env;

// --- Paste your Remix ABI + Bytecode here ---
const ABI = [
  // ⬇️ Copy ABI JSON array from Remix → Compilation Details
];
const BYTECODE = "0x..."; // ⬅️ Copy full hex from Remix → Compilation Details (starts with 0x)

async function main() {
  if (!PRIVATE_KEY) {
    console.error("❌ Missing PRIVATE_KEY in Replit Secrets");
    console.log("\n📋 Required Replit Secrets:");
    console.log("  - PRIVATE_KEY (your wallet private key)");
    console.log("  - TREASURY (your payout address)");
    console.log("\n📋 Optional Replit Secrets (have defaults):");
    console.log("  - RPC_URL (default: https://sepolia.base.org)");
    console.log("  - NAME (default: DJZS Subscribe)");
    console.log("  - SYMBOL (default: DJZSUB)");
    console.log("  - PRICE_WEI (default: 1000000000000000 = 0.001 ETH)");
    console.log("  - BASE_TOKEN_URI (default: ipfs://temp/)");
    console.log("  - MAX_SUPPLY (default: 0 = unlimited)");
    return;
  }

  if (!TREASURY) {
    console.error("❌ Missing TREASURY in Replit Secrets");
    console.log("Add your payout address as TREASURY in Replit Secrets");
    return;
  }

  if (BYTECODE === "0x..." || !ABI.length) {
    console.log("⚠️  Bytecode not configured!\n");
    console.log("📋 Steps to deploy:");
    console.log("1. Compile SubscribeNFT.sol in Remix IDE");
    console.log("2. Copy the ABI and Bytecode from Compilation Details");
    console.log("3. Paste them into deploy-contract.mjs (ABI and BYTECODE variables)");
    console.log("4. Run: node deploy-contract.mjs");
    console.log("\nAlternatively, deploy directly in Remix and copy the contract address.");
    return;
  }

  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

  console.log("🚀 Deploying SubscribeNFT...\n");
  console.log("Deployer:", await wallet.getAddress());
  console.log("Network:", (await provider.getNetwork()).name || RPC_URL);
  console.log("\nConstructor params:");
  console.log("  NAME:", NAME);
  console.log("  SYMBOL:", SYMBOL);
  console.log("  PRICE:", PRICE_WEI, "wei (", Number(PRICE_WEI) / 1e18, "ETH)");
  console.log("  TREASURY:", TREASURY);
  console.log("  BASE_TOKEN_URI:", BASE_TOKEN_URI);
  console.log("  MAX_SUPPLY:", MAX_SUPPLY, MAX_SUPPLY === '0' ? '(unlimited)' : '');
  console.log("");

  // Constructor args
  const args = [
    NAME,
    SYMBOL,
    BigInt(PRICE_WEI),
    TREASURY,
    BASE_TOKEN_URI,
    BigInt(MAX_SUPPLY)
  ];

  const factory = new ethers.ContractFactory(ABI, BYTECODE, wallet);

  console.log("Deploying...");
  const contract = await factory.deploy(...args);

  console.log("Tx hash:", contract.deploymentTransaction().hash);
  const deployed = await contract.waitForDeployment();
  const address = await deployed.getAddress();

  console.log("\n✅ Contract deployed at:", address);
  console.log("\n📋 Next steps:");
  console.log("1) Add to Replit Secrets:");
  console.log("   VITE_SUBSCRIBE_NFT_ADDRESS =", address);
  console.log("   VITE_SUBSCRIBE_PRICE =", (Number(PRICE_WEI) / 1e18).toString());
  console.log("2) Restart the app");
  console.log("3) Test minting!");
}

main().catch(console.error);
