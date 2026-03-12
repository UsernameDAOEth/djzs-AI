const hre = require("hardhat");
async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying DJZSEscrowLock with:", deployer.address);
  const usdcAddress = process.env.BASE_USDC_ADDRESS || "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";
  const EscrowLock = await hre.ethers.getContractFactory("DJZSEscrowLock");
  const escrowLock = await EscrowLock.deploy(usdcAddress);
  await escrowLock.waitForDeployment();
  console.log("DJZSEscrowLock deployed to:", await escrowLock.getAddress());
}
main()
  .then(() => process.exit(0))
  .catch((error) => { console.error(error); process.exit(1); });
