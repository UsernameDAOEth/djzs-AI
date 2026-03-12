require("dotenv").config();
require("@nomicfoundation/hardhat-toolbox");

module.exports = {
  solidity: {
    version: "0.8.20",
    settings: { optimizer: { enabled: true, runs: 200 } },
  },
  networks: {
    base: {
      url: process.env.BASE_RPC_URL || "https://mainnet.base.org",
      accounts: { mnemonic: process.env.DEPLOYER_MNEMONIC || "" },
      chainId: 8453,
    },
    baseSepolia: {
      url: process.env.BASE_SEPOLIA_RPC_URL || "https://sepolia.base.org",
      accounts: { mnemonic: process.env.DEPLOYER_MNEMONIC || "" },
      chainId: 84532,
    },
  },
  paths: { sources: "./contracts", artifacts: "./artifacts", cache: "./cache" },
};
