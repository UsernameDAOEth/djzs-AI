const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with:", deployer.address);

  const usdcAddress =
    process.env.BASE_USDC_ADDRESS || "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";

  const AgentRegistry = await hre.ethers.getContractFactory("DJZSAgentRegistry");
  const agentRegistry = await AgentRegistry.deploy();
  await agentRegistry.waitForDeployment();
  const agentRegistryAddr = await agentRegistry.getAddress();
  console.log("DJZSAgentRegistry deployed to:", agentRegistryAddr);

  const TrustScore = await hre.ethers.getContractFactory("DJZSLogicTrustScore");
  const trustScore = await TrustScore.deploy();
  await trustScore.waitForDeployment();
  const trustScoreAddr = await trustScore.getAddress();
  console.log("DJZSLogicTrustScore deployed to:", trustScoreAddr);

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

  console.log("\n--- Deployment Summary ---");
  console.log(`DJZSAgentRegistry:    ${agentRegistryAddr}`);
  console.log(`DJZSLogicTrustScore:  ${trustScoreAddr}`);
  console.log(`DJZSStaking:          ${stakingAddr}`);
  console.log(`DJZSEscrowLock:       ${escrowLockAddr}`);
  console.log("\nSet these environment variables:");
  console.log(`TRUST_SCORE_CONTRACT_ADDRESS=${trustScoreAddr}`);
  console.log(`ESCROW_CONTRACT_ADDRESS=${escrowLockAddr}`);
  console.log(`STAKING_CONTRACT_ADDRESS=${stakingAddr}`);
  console.log(`AGENT_REGISTRY_ADDRESS=${agentRegistryAddr}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
