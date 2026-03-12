const hre = require("hardhat");
async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying remaining contracts with:", deployer.address);
  const usdcAddress = process.env.BASE_USDC_ADDRESS || "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";

  const minimumStake = hre.ethers.parseUnits("100", 6);
  const lockDuration = 30 * 24 * 60 * 60;
  const Staking = await hre.ethers.getContractFactory("DJZSStaking");
  const staking = await Staking.deploy(usdcAddress, minimumStake, lockDuration);
  await staking.waitForDeployment();
  const stakingAddr = await staking.getAddress();
  console.log("DJZSStaking deployed to:", stakingAddr);

  const EscrowLock = await hre.ethers.getContractFactory("DJZSEscrowLock");
  const escrowLock = await EscrowLock.deploy(usdcAddress);
  await escrowLock.waitForDeployment();
  const escrowLockAddr = await escrowLock.getAddress();
  console.log("DJZSEscrowLock deployed to:", escrowLockAddr);

  console.log("\n--- Full Deployment Summary ---");
  console.log("DJZSAgentRegistry:    0xe40d5669Ce8e06A91188B82Ce7292175E2013E41");
  console.log("DJZSLogicTrustScore:  0xB3324D07A8713b354435FF0e2A982A504e81b137");
  console.log("DJZSStaking:          " + stakingAddr);
  console.log("DJZSEscrowLock:       " + escrowLockAddr);
}
main()
  .then(() => process.exit(0))
  .catch((error) => { console.error(error); process.exit(1); });
