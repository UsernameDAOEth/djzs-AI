require("dotenv").config();
require("@nomicfoundation/hardhat-toolbox");

module.exports = {
  solidity: {
    version: "0.8.28",
    settings: { optimizer: { enabled: true, runs: 200 }, evmVersion: "cancun", viaIR: true },
  },
  networks: {
    base: {
      url: process.env.BASE_RPC_URL || "https://mainnet.base.org",
      accounts: { mnemonic: process.env.DEPLOYER_MNEMONIC || "" },
      chainId: 8453,
    },
    "base-sepolia": {
      url: process.env.BASE_SEPOLIA_RPC_URL || "https://sepolia.base.org",
      accounts: { mnemonic: process.env.DEPLOYER_MNEMONIC || "" },
      chainId: 84532,
    },
  },
  etherscan: {
    apiKey: process.env.BASESCAN_API_KEY || "",
  },
  sourcify: {
    enabled: true,
  },
  paths: { sources: "./contracts", artifacts: "./artifacts", cache: "./cache" },
};
