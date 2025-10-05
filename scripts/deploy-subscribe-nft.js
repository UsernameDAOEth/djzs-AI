import { ethers } from 'ethers';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function main() {
  // Configuration for Base Mainnet
  const NAME = "DJZS Subscribe";
  const SYMBOL = "DJZSUB";
  const PRICE_ETH = "0.001";
  const TREASURY = "0x15b2aF4ACc464EA44fcfACcB6A50bD2388441876";
  const BASE_TOKEN_URI = "";
  const MAX_SUPPLY = 0;
  const RPC_URL = "https://mainnet.base.org";
  const PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY;

  if (!PRIVATE_KEY) {
    throw new Error("DEPLOYER_PRIVATE_KEY environment variable is required");
  }

  console.log("🚀 Deploying SubscribeNFT to Base Mainnet...");
  console.log("📝 Name:", NAME);
  console.log("🎫 Symbol:", SYMBOL);
  console.log("💰 Price:", PRICE_ETH, "ETH");
  console.log("🏦 Treasury:", TREASURY);
  console.log("📊 Max Supply:", MAX_SUPPLY === 0 ? "Unlimited" : MAX_SUPPLY);
  
  // Read contract ABI (already compiled by Hardhat)
  const artifactPath = join(__dirname, '../artifacts/contracts/SubscribeNFT.sol/SubscribeNFT.json');
  const artifact = JSON.parse(readFileSync(artifactPath, 'utf8'));
  
  // Setup provider and wallet
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
  
  console.log("👛 Deployer address:", wallet.address);
  
  // Check balance
  const balance = await provider.getBalance(wallet.address);
  console.log("💵 Balance:", ethers.formatEther(balance), "ETH");
  
  if (balance === 0n) {
    console.error("❌ Deployer has no ETH on Base Mainnet!");
    process.exit(1);
  }
  
  // Deploy contract
  const factory = new ethers.ContractFactory(artifact.abi, artifact.bytecode, wallet);
  const priceWei = ethers.parseEther(PRICE_ETH);
  
  console.log("\n⏳ Deploying contract...");
  const deployedContract = await factory.deploy(
    NAME,
    SYMBOL,
    priceWei,
    TREASURY,
    BASE_TOKEN_URI,
    MAX_SUPPLY
  );
  
  console.log("📝 Transaction hash:", deployedContract.deploymentTransaction().hash);
  console.log("⏳ Waiting for confirmations...");
  
  await deployedContract.waitForDeployment();
  const address = await deployedContract.getAddress();
  
  console.log("\n✅ SubscribeNFT deployed successfully!");
  console.log("📍 Contract address:", address);
  console.log("\n📝 Replit Secrets to set:");
  console.log("VITE_SUBSCRIBE_NFT_ADDRESS=" + address);
  console.log("VITE_SUBSCRIBE_PRICE=" + PRICE_ETH);
  console.log("\n🔍 Verify on BaseScan:");
  console.log("https://basescan.org/address/" + address);
  
  return address;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Deployment failed:");
    console.error(error.message || error);
    if (error.stack) console.error(error.stack);
    process.exit(1);
  });
