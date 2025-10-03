// Pure ethers.js deployment script for SubscribeNFT
import { ethers } from 'ethers';

// Updated contract ABI for new SubscribeNFT
const CONTRACT_ABI = [
  {
    "inputs": [
      {"internalType": "string", "name": "_name", "type": "string"},
      {"internalType": "string", "name": "_symbol", "type": "string"},
      {"internalType": "uint256", "name": "_priceWei", "type": "uint256"},
      {"internalType": "address payable", "name": "_treasury", "type": "address"},
      {"internalType": "string", "name": "_baseTokenURI", "type": "string"},
      {"internalType": "uint256", "name": "_maxSupply", "type": "uint256"}
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [],
    "name": "mint",
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
  },
  {
    "inputs": [],
    "name": "price",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  }
];

// Placeholder - needs compilation
const CONTRACT_BYTECODE = "COMPILE_FIRST";

async function main() {
  console.log("🚀 DJZS SubscribeNFT Deployment Script\n");
  
  // Configuration
  const PRICE_ETH = process.env.SUBSCRIBE_PRICE_ETH || "0.001";
  const BASE_URI = process.env.BASE_URI || "ipfs://temp/";
  const MAX_SUPPLY = BigInt(process.env.MAX_SUPPLY || "7777"); // 0 = unlimited
  const RPC_URL = process.env.RPC_BASE_SEPOLIA || "https://sepolia.base.org";
  const PRIVATE_KEY = process.env.PRIVATE_KEY;

  if (!PRIVATE_KEY) {
    console.error("❌ PRIVATE_KEY environment variable is required!");
    process.exit(1);
  }

  // Setup provider and get deployer address for treasury
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
  const TREASURY = wallet.address; // Use deployer as treasury

  if (CONTRACT_BYTECODE === "COMPILE_FIRST") {
    console.log("⚠️  Contract needs to be compiled first!\n");
    console.log("📋 Deployment Instructions:\n");
    console.log("1️⃣  Compile using Remix IDE:");
    console.log("   - Go to https://remix.ethereum.org");
    console.log("   - Create SubscribeNFT.sol and paste the contract code");
    console.log("   - Compile with Solidity 0.8.24\n");
    console.log("2️⃣  Deploy in Remix (RECOMMENDED):");
    console.log("   --------------------------------");
    console.log("   1. Go to 'Deploy & Run Transactions' tab");
    console.log("   2. Environment: 'Injected Provider - MetaMask'");
    console.log("   3. Network: Base Sepolia (Chain ID 84532)");
    console.log("   4. Constructor parameters:");
    console.log(`      - _name: "DJZS Subscribe"`);
    console.log(`      - _symbol: "DJZSUB"`);
    console.log(`      - _priceWei: ${ethers.parseEther(PRICE_ETH).toString()} (${PRICE_ETH} ETH)`);
    console.log(`      - _treasury: ${TREASURY} (your wallet address)`);
    console.log(`      - _baseTokenURI: "${BASE_URI}"`);
    console.log(`      - _maxSupply: ${MAX_SUPPLY} (0 for unlimited)`);
    console.log("   5. Click 'Deploy' and confirm in MetaMask");
    console.log("   6. Copy the deployed contract address\n");
    console.log("3️⃣  After deployment:");
    console.log("   - Add to Replit Secrets:");
    console.log("     VITE_SUBSCRIBE_NFT_ADDRESS=<your_contract_address>");
    console.log("     VITE_SUBSCRIBE_PRICE=" + PRICE_ETH);
    console.log("\n✨ Your app will be fully functional!");
    return;
  }

  // Deployment logic (if bytecode provided)
  console.log("Configuration:");
  console.log("  💰 Price:", PRICE_ETH, "ETH");
  console.log("  👛 Treasury:", TREASURY);
  console.log("  📦 Base URI:", BASE_URI);
  console.log("  🎯 Max Supply:", MAX_SUPPLY === 0n ? "Unlimited" : MAX_SUPPLY.toString());
  console.log("  🔗 RPC:", RPC_URL);
  console.log("");

  console.log("👛 Deployer:", wallet.address);
  
  const balance = await provider.getBalance(wallet.address);
  console.log("💵 Balance:", ethers.formatEther(balance), "ETH");
  
  if (balance === 0n) {
    console.error("\n❌ No ETH for gas fees!");
    console.error("   Get testnet ETH: https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet");
    process.exit(1);
  }

  const factory = new ethers.ContractFactory(CONTRACT_ABI, CONTRACT_BYTECODE, wallet);
  const priceWei = ethers.parseEther(PRICE_ETH);
  
  console.log("\n⏳ Deploying...");
  const contract = await factory.deploy(
    "DJZS Subscribe",
    "DJZSUB",
    priceWei,
    TREASURY,
    BASE_URI,
    MAX_SUPPLY
  );
  
  console.log("📝 TX:", contract.deploymentTransaction().hash);
  await contract.waitForDeployment();
  
  const address = await contract.getAddress();
  console.log("\n✅ Deployed to:", address);
  console.log("\n📝 Add to Replit Secrets:");
  console.log("   VITE_SUBSCRIBE_NFT_ADDRESS=" + address);
  console.log("   VITE_SUBSCRIBE_PRICE=" + PRICE_ETH);
}

main().catch(console.error);
