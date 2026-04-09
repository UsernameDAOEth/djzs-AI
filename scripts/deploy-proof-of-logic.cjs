const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying DJZSProofOfLogicNFT with:", deployer.address);

  const ProofOfLogicNFT = await hre.ethers.getContractFactory("DJZSProofOfLogicNFT");
  const nft = await ProofOfLogicNFT.deploy();
  await nft.waitForDeployment();
  const nftAddr = await nft.getAddress();
  console.log("DJZSProofOfLogicNFT deployed to:", nftAddr);

  let settlementWallet = process.env.SETTLEMENT_WALLET_ADDRESS;

  if (!settlementWallet && process.env.SETTLEMENT_PRIVATE_KEY) {
    const ethers = hre.ethers;
    const rawKey = process.env.SETTLEMENT_PRIVATE_KEY;
    const privateKey = rawKey.startsWith("0x") ? rawKey : `0x${rawKey}`;
    const wallet = new ethers.Wallet(privateKey);
    settlementWallet = wallet.address;
    console.log("Derived settlement wallet from SETTLEMENT_PRIVATE_KEY:", settlementWallet);
  }

  if (settlementWallet && settlementWallet.toLowerCase() !== deployer.address.toLowerCase()) {
    console.log("Authorizing settlement wallet as minter:", settlementWallet);
    const tx = await nft.authorizeMinter(settlementWallet);
    await tx.wait();
    console.log("Settlement wallet authorized. TX:", tx.hash);
  } else if (settlementWallet) {
    console.log("Settlement wallet is deployer — already an authorized minter.");
  } else {
    console.log("WARNING: No SETTLEMENT_WALLET_ADDRESS or SETTLEMENT_PRIVATE_KEY set.");
    console.log("Deployer is the only authorized minter. Set one of these env vars for production.");
  }

  console.log("\n--- ProofOfLogic NFT Deployment Summary ---");
  console.log(`DJZSProofOfLogicNFT:  ${nftAddr}`);
  console.log(`Token Name:           DJZS ProofOfLogic`);
  console.log(`Token Symbol:         DJZS-POL`);
  console.log(`Owner:                ${deployer.address}`);
  if (settlementWallet) {
    console.log(`Minter:               ${settlementWallet}`);
  }
  console.log(`\nSet this environment variable:`);
  console.log(`NFT_CONTRACT_ADDRESS=${nftAddr}`);

  console.log("\n--- Full Contract Suite ---");
  console.log("DJZSAgentRegistry:    0xe40d5669Ce8e06A91188B82Ce7292175E2013E41");
  console.log("DJZSLogicTrustScore:  0xB3324D07A8713b354435FF0e2A982A504e81b137");
  console.log(`DJZSProofOfLogicNFT:  ${nftAddr}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
