import { ethers } from "hardhat";

async function main() {
  const PRICE_WEI = ethers.parseEther(process.env.SUBSCRIBE_PRICE_ETH || "0");
  const BASE_URI = process.env.BASE_URI || "ipfs://QmYourMetadataFolder/";

  console.log("Deploying DJZSSubscribeNFT...");
  console.log("Price:", ethers.formatEther(PRICE_WEI), "ETH");
  console.log("Base URI:", BASE_URI);

  const DJZSSubscribeNFT = await ethers.getContractFactory("DJZSSubscribeNFT");
  const contract = await DJZSSubscribeNFT.deploy(
    "DJZS Subscribe",
    "DJZSUB",
    PRICE_WEI,
    BASE_URI
  );

  await contract.waitForDeployment();
  const address = await contract.getAddress();

  console.log("✅ DJZSSubscribeNFT deployed to:", address);
  console.log("\n📝 Next steps:");
  console.log("1. Add to .env: VITE_SUBSCRIBE_NFT_ADDRESS=" + address);
  console.log("2. Verify contract on Basescan (if on mainnet)");
  console.log("3. Update baseURI if needed using setBaseURI()");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
