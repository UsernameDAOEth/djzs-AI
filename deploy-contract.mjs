// Pure ethers.js deployment script (no Hardhat dependency)
import { ethers } from 'ethers';

// Contract ABI and bytecode (you'll need to compile first)
const CONTRACT_ABI = [
  {
    "inputs": [
      {"internalType": "string", "name": "name_", "type": "string"},
      {"internalType": "string", "name": "symbol_", "type": "string"},
      {"internalType": "uint256", "name": "priceWei_", "type": "uint256"},
      {"internalType": "string", "name": "baseURI_", "type": "string"}
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [],
    "name": "mintSubscribe",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "owner", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalSupply",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "maxSupply",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  }
];

// You need to compile the contract first using Remix or solc
// This is a placeholder - replace with actual bytecode after compilation
const CONTRACT_BYTECODE = "COMPILE_FIRST";

async function main() {
  console.log("🚀 DJZS Subscribe NFT Deployment Script\n");
  
  // Configuration
  const PRICE_ETH = process.env.SUBSCRIBE_PRICE_ETH || "0.001";
  const BASE_URI = process.env.BASE_URI || "ipfs://temp/";
  const RPC_URL = process.env.RPC_BASE_SEPOLIA || "https://sepolia.base.org";
  const PRIVATE_KEY = process.env.PRIVATE_KEY;

  if (!PRIVATE_KEY) {
    console.error("❌ PRIVATE_KEY environment variable is required!");
    process.exit(1);
  }

  if (CONTRACT_BYTECODE === "COMPILE_FIRST") {
    console.log("⚠️  Contract needs to be compiled first!");
    console.log("\n📋 Deployment Instructions:");
    console.log("\n1️⃣  Compile the contract using Remix IDE:");
    console.log("   - Go to https://remix.ethereum.org");
    console.log("   - Paste contracts/DJZSSubscribeNFT.sol");
    console.log("   - Compile with Solidity 0.8.24");
    console.log("\n2️⃣  Deploy using ONE of these methods:\n");
    console.log("   METHOD A: Deploy directly in Remix (RECOMMENDED)");
    console.log("   ------------------------------------------------");
    console.log("   1. In Remix, go to 'Deploy & Run Transactions'");
    console.log("   2. Environment: 'Injected Provider - MetaMask'");
    console.log("   3. Network: Base Sepolia (Chain ID 84532)");
    console.log("   4. Constructor params:");
    console.log(`      - name_: "DJZS Subscribe"`);
    console.log(`      - symbol_: "DJZSUB"`);
    console.log(`      - priceWei_: ${ethers.parseEther(PRICE_ETH).toString()} (${PRICE_ETH} ETH)`);
    console.log(`      - baseURI_: "${BASE_URI}"`);
    console.log("   5. Click 'Deploy' and confirm in MetaMask");
    console.log("   6. Copy the deployed contract address\n");
    console.log("   METHOD B: Use this script (Advanced)");
    console.log("   -------------------------------------");
    console.log("   1. In Remix, after compilation, find the bytecode");
    console.log("   2. Update CONTRACT_BYTECODE in deploy-contract.mjs");
    console.log("   3. Run: node deploy-contract.mjs\n");
    console.log("3️⃣  After deployment:");
    console.log("   - Add to Replit Secrets: VITE_SUBSCRIBE_NFT_ADDRESS=<your_contract_address>");
    console.log("   - Add to Replit Secrets: VITE_SUBSCRIBE_PRICE=" + PRICE_ETH);
    console.log("\n✨ Your app will then be fully functional!");
    return;
  }

  // Deployment logic (runs if bytecode is available)
  console.log("Configuration:");
  console.log("  💰 Price:", PRICE_ETH, "ETH");
  console.log("  📦 Base URI:", BASE_URI);
  console.log("  🔗 RPC:", RPC_URL);
  console.log("");

  // Setup provider and wallet
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
  
  console.log("👛 Deployer:", wallet.address);
  
  // Check balance
  const balance = await provider.getBalance(wallet.address);
  console.log("💵 Balance:", ethers.formatEther(balance), "ETH");
  
  if (balance === 0n) {
    console.error("\n❌ No ETH for gas fees!");
    console.error("   Get testnet ETH: https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet");
    process.exit(1);
  }

  // Deploy
  const factory = new ethers.ContractFactory(CONTRACT_ABI, CONTRACT_BYTECODE, wallet);
  const priceWei = ethers.parseEther(PRICE_ETH);
  
  console.log("\n⏳ Deploying...");
  const contract = await factory.deploy("DJZS Subscribe", "DJZSUB", priceWei, BASE_URI);
  
  console.log("📝 TX:", contract.deploymentTransaction().hash);
  await contract.waitForDeployment();
  
  const address = await contract.getAddress();
  console.log("\n✅ Deployed to:", address);
  console.log("\n📝 Add to Replit Secrets:");
  console.log("   VITE_SUBSCRIBE_NFT_ADDRESS=" + address);
  console.log("   VITE_SUBSCRIBE_PRICE=" + PRICE_ETH);
}

main().catch(console.error);
