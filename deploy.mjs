import { ethers } from 'ethers';

// --- Read env ---
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

// --- Paste ABI + Bytecode from Remix here ---
// To get these:
// 1. Go to https://remix.ethereum.org
// 2. Create SubscribeNFT.sol (copy from contracts/SubscribeNFT.sol)
// 3. Compile with Solidity 0.8.24
// 4. In "Compilation Details", copy the ABI and Bytecode
const ABI = [
  // ⬇️ Paste ABI array here from Remix "Compilation Details"
];

const BYTECODE = "0x..."; // ⬅️ Paste bytecode hex here (starts with 0x)

// --- Basic checks ---
if (!PRIVATE_KEY) {
  console.error('❌ Missing PRIVATE_KEY in Replit Secrets');
  process.exit(1);
}

if (!TREASURY || !ethers.isAddress(TREASURY)) {
  console.error('❌ TREASURY missing or not a valid Ethereum address');
  console.log('Current TREASURY value:', TREASURY || '(not set)');
  process.exit(1);
}

if (BYTECODE === "0x..." || !ABI.length) {
  console.log('\n⚠️  Bytecode and ABI not configured yet!\n');
  console.log('📋 Steps to deploy:');
  console.log('1. Go to https://remix.ethereum.org');
  console.log('2. Create SubscribeNFT.sol and paste contract code from contracts/SubscribeNFT.sol');
  console.log('3. Compile with Solidity 0.8.24');
  console.log('4. Click "Compilation Details" button');
  console.log('5. Copy the ABI (JSON array) and paste it into this file (line 21)');
  console.log('6. Copy the Bytecode (hex string starting with 0x) and paste it into this file (line 24)');
  console.log('7. Run: node deploy.mjs\n');
  console.log('Alternative: Deploy directly in Remix and copy the contract address.');
  process.exit(0);
}

async function main() {
  console.log('🚀 DJZS SubscribeNFT Deployment\n');

  // Provider + wallet
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

  console.log('Deployer:', await wallet.getAddress());
  const network = await provider.getNetwork();
  console.log('Network:', network.name || `Chain ID ${network.chainId.toString()}`);
  console.log('');

  // Constructor args
  const args = [
    NAME,
    SYMBOL,
    BigInt(PRICE_WEI),
    TREASURY,
    BASE_TOKEN_URI,
    BigInt(MAX_SUPPLY)
  ];

  console.log('Constructor params:');
  console.log('  NAME:', NAME);
  console.log('  SYMBOL:', SYMBOL);
  console.log('  PRICE:', PRICE_WEI, 'wei (', Number(PRICE_WEI) / 1e18, 'ETH)');
  console.log('  TREASURY:', TREASURY);
  console.log('  BASE_TOKEN_URI:', BASE_TOKEN_URI);
  console.log('  MAX_SUPPLY:', MAX_SUPPLY, MAX_SUPPLY === '0' ? '(unlimited)' : '');
  console.log('');

  const factory = new ethers.ContractFactory(ABI, BYTECODE, wallet);
  console.log('Deploying contract...');
  const contract = await factory.deploy(...args);

  console.log('Transaction hash:', contract.deploymentTransaction().hash);
  console.log('Waiting for confirmation...');
  const deployed = await contract.waitForDeployment();
  const address = await deployed.getAddress();

  console.log('\n✅ Contract deployed successfully!');
  console.log('Contract address:', address);
  console.log('\n📋 Next steps:');
  console.log('1) Add to Replit Secrets:');
  console.log('   VITE_SUBSCRIBE_NFT_ADDRESS =', address);
  console.log('   VITE_SUBSCRIBE_PRICE =', (Number(PRICE_WEI) / 1e18).toString());
  console.log('2) Restart the app');
  console.log('3) Test minting!');
}

main().catch((e) => {
  console.error('\n❌ Deployment failed:');
  console.error(e.message || e);
  process.exit(1);
});
