// Simple deployment script compatible with Node.js 20
import { ethers } from 'ethers';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function main() {
  // Configuration
  const PRICE_ETH = process.env.SUBSCRIBE_PRICE_ETH || "0.001";
  const BASE_URI = process.env.BASE_URI || "ipfs://temp/";
  const RPC_URL = process.env.RPC_BASE_SEPOLIA || "https://sepolia.base.org";
  const PRIVATE_KEY = process.env.PRIVATE_KEY;

  if (!PRIVATE_KEY) {
    throw new Error("PRIVATE_KEY environment variable is required");
  }

  console.log("🚀 Deploying DJZSSubscribeNFT to Base Sepolia...");
  console.log("💰 Price:", PRICE_ETH, "ETH");
  console.log("📦 Base URI:", BASE_URI);
  console.log("🔗 RPC:", RPC_URL);

  // Setup provider and wallet
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
  
  console.log("👛 Deployer address:", wallet.address);
  
  // Check balance
  const balance = await provider.getBalance(wallet.address);
  console.log("💵 Balance:", ethers.formatEther(balance), "ETH");
  
  if (balance === 0n) {
    console.error("❌ Deployer has no ETH! Get testnet ETH from: https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet");
    process.exit(1);
  }

  // Read compiled contract
  const contractPath = join(__dirname, '../artifacts/contracts/DJZSSubscribeNFT.sol/DJZSSubscribeNFT.json');
  const contractJson = JSON.parse(readFileSync(contractPath, 'utf8'));
  
  // Deploy contract
  const factory = new ethers.ContractFactory(
    contractJson.abi,
    contractJson.bytecode,
    wallet
  );
  
  const priceWei = ethers.parseEther(PRICE_ETH);
  console.log("\n⏳ Deploying contract...");
  
  const contract = await factory.deploy(
    "DJZS Subscribe",
    "DJZSUB",
    priceWei,
    BASE_URI
  );
  
  console.log("📝 Transaction hash:", contract.deploymentTransaction().hash);
  console.log("⏳ Waiting for confirmations...");
  
  await contract.waitForDeployment();
  const address = await contract.getAddress();
  
  console.log("\n✅ DJZSSubscribeNFT deployed successfully!");
  console.log("📍 Contract address:", address);
  console.log("\n📝 Next steps:");
  console.log("1. Add this to your Replit Secrets:");
  console.log("   VITE_SUBSCRIBE_NFT_ADDRESS=" + address);
  console.log("2. Verify on BaseScan:");
  console.log("   https://sepolia.basescan.org/address/" + address);
  console.log("3. Test minting at your app URL");
  
  return address;
}

main()
  .then((address) => {
    console.log("\n✨ Deployment complete!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Deployment failed:");
    console.error(error);
    process.exit(1);
  });
