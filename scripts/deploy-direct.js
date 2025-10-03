// Direct deployment using ethers and solc
import { ethers } from 'ethers';
import solc from 'solc';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function findImports(importPath) {
  try {
    if (importPath.startsWith('@openzeppelin/')) {
      const modulePath = join(__dirname, '../node_modules', importPath);
      return { contents: readFileSync(modulePath, 'utf8') };
    }
  } catch (e) {
    return { error: 'File not found' };
  }
}

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
  
  // Read contract source
  const contractPath = join(__dirname, '../contracts/DJZSSubscribeNFT.sol');
  const source = readFileSync(contractPath, 'utf8');
  
  // Compile contract
  console.log("⏳ Compiling contract...");
  const input = {
    language: 'Solidity',
    sources: {
      'DJZSSubscribeNFT.sol': { content: source }
    },
    settings: {
      optimizer: { enabled: true, runs: 200 },
      outputSelection: {
        '*': {
          '*': ['abi', 'evm.bytecode']
        }
      }
    }
  };
  
  const output = JSON.parse(solc.compile(JSON.stringify(input), { import: findImports }));
  
  if (output.errors) {
    const errors = output.errors.filter(e => e.severity === 'error');
    if (errors.length > 0) {
      console.error("❌ Compilation errors:");
      errors.forEach(err => console.error(err.formattedMessage));
      process.exit(1);
    }
  }
  
  const contract = output.contracts['DJZSSubscribeNFT.sol']['DJZSSubscribeNFT'];
  const abi = contract.abi;
  const bytecode = contract.evm.bytecode.object;
  
  console.log("✅ Contract compiled successfully");
  
  // Setup provider and wallet
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
  
  console.log("👛 Deployer address:", wallet.address);
  
  // Check balance
  const balance = await provider.getBalance(wallet.address);
  console.log("💵 Balance:", ethers.formatEther(balance), "ETH");
  
  if (balance === 0n) {
    console.error("❌ Deployer has no ETH! Get testnet ETH from:");
    console.error("   https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet");
    process.exit(1);
  }
  
  // Deploy contract
  const factory = new ethers.ContractFactory(abi, bytecode, wallet);
  const priceWei = ethers.parseEther(PRICE_ETH);
  
  console.log("\n⏳ Deploying contract...");
  const deployedContract = await factory.deploy(
    "DJZS Subscribe",
    "DJZSUB",
    priceWei,
    BASE_URI
  );
  
  console.log("📝 Transaction hash:", deployedContract.deploymentTransaction().hash);
  console.log("⏳ Waiting for confirmations...");
  
  await deployedContract.waitForDeployment();
  const address = await deployedContract.getAddress();
  
  console.log("\n✅ DJZSSubscribeNFT deployed successfully!");
  console.log("📍 Contract address:", address);
  console.log("\n📝 Next steps:");
  console.log("1. Add this to your Replit Secrets:");
  console.log("   VITE_SUBSCRIBE_NFT_ADDRESS=" + address);
  console.log("2. Set VITE_SUBSCRIBE_PRICE=" + PRICE_ETH);
  console.log("3. Verify on BaseScan:");
  console.log("   https://sepolia.basescan.org/address/" + address);
  
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
