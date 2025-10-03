import { ethers } from 'ethers';
import fs from 'fs';
import path from 'path';

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

// --- Basic checks ---
if (!PRIVATE_KEY) {
  console.error('❌ Missing PRIVATE_KEY in Replit Secrets');
  process.exit(1);
}
if (!TREASURY || !ethers.isAddress(TREASURY)) {
  console.error('❌ TREASURY missing or not a valid address');
  console.log('Current TREASURY value:', TREASURY);
  process.exit(1);
}

// Try to load compiled artifacts from hardhat or manual input
let abi, bytecode;

try {
  // Try loading from hardhat artifacts (if compiled with hardhat)
  const artifactPath = './artifacts/contracts/SubscribeNFT.sol/SubscribeNFT.json';
  if (fs.existsSync(artifactPath)) {
    const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
    abi = artifact.abi;
    bytecode = artifact.bytecode;
    console.log('✓ Loaded compiled artifacts from hardhat\n');
  } else {
    throw new Error('Artifacts not found');
  }
} catch (e) {
  console.log('⚠️  No compiled artifacts found\n');
  console.log('Please compile first using Remix IDE:');
  console.log('1. Go to https://remix.ethereum.org');
  console.log('2. Create SubscribeNFT.sol and paste the contract code');
  console.log('3. Compile with Solidity 0.8.24');
  console.log('4. Copy the ABI and Bytecode from "Compilation Details"');
  console.log('5. Paste them below in this script or deploy directly in Remix\n');
  console.log('Alternatively, if hardhat is working, run: npx hardhat compile');
  process.exit(1);
}

async function main() {
  console.log('🚀 DJZS SubscribeNFT Deployment\n');

  // Provider + wallet
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

  console.log('Deployer:', await wallet.getAddress());
  const network = await provider.getNetwork();
  console.log('Network:', network.name || network.chainId.toString());
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

  const factory = new ethers.ContractFactory(abi, bytecode, wallet);
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
  console.error(e);
  process.exit(1);
});
