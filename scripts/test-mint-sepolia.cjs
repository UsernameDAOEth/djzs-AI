const hre = require("hardhat");

async function main() {
  const contractAddress = process.env.NFT_CONTRACT_ADDRESS;
  if (!contractAddress) {
    console.error("ERROR: NFT_CONTRACT_ADDRESS not set. Deploy the contract first.");
    process.exit(1);
  }

  const [deployer] = await hre.ethers.getSigners();
  console.log("Test mint with:", deployer.address);
  console.log("Contract:", contractAddress);

  const nft = await hre.ethers.getContractAt("DJZSProofOfLogicNFT", contractAddress);

  const certJson = JSON.stringify({
    audit_id: "test-audit-001",
    verdict: "PASS",
    risk_score: 12,
    tier: "micro",
    timestamp: "2026-04-09T00:00:00Z",
    flags: [],
    cryptographic_hash: "sha256:testmint123abc",
    provenance_provider: "IRYS_DATACHAIN",
    irys_tx_id: "testIrysTxId001",
    irys_url: "https://gateway.irys.xyz/testIrysTxId001",
  });

  console.log("\n--- Minting test NFT ---");
  const tx = await nft.mint(
    deployer.address,
    "test-audit-001",
    "2026-04-09T00:00:00Z",
    "micro",
    12,
    "PASS",
    "[]",
    "sha256:testmint123abc",
    "testIrysTxId001",
    "https://gateway.irys.xyz/testIrysTxId001",
    certJson
  );
  console.log("TX hash:", tx.hash);
  const receipt = await tx.wait();
  console.log("TX confirmed in block:", receipt.blockNumber);

  console.log("\n--- Reading on-chain data ---");
  const totalMinted = await nft.totalMinted();
  console.log("totalMinted:", totalMinted.toString());

  const tokenId = totalMinted;
  const rawCert = await nft.getRawCertificate(tokenId);
  console.log("getRawCertificate:", rawCert);

  const tokenByIrys = await nft.getTokenByIrys("testIrysTxId001");
  console.log("getTokenByIrys('testIrysTxId001'):", tokenByIrys.toString());

  const tokenURI = await nft.tokenURI(tokenId);
  console.log("tokenURI (first 200 chars):", tokenURI.substring(0, 200) + "...");

  const base64Part = tokenURI.replace("data:application/json;base64,", "");
  const metadata = JSON.parse(Buffer.from(base64Part, "base64").toString("utf-8"));
  console.log("\n--- Decoded metadata ---");
  console.log("name:", metadata.name);
  console.log("description:", metadata.description.substring(0, 100) + "...");
  console.log("external_url:", metadata.external_url);
  console.log("attributes:", JSON.stringify(metadata.attributes, null, 2));
  console.log("certificate:", JSON.stringify(metadata.certificate, null, 2));

  console.log("\n--- Test mint SUCCESS ---");
  console.log(`View on Sepolia Basescan: https://sepolia.basescan.org/tx/${tx.hash}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Test mint failed:", error);
    process.exit(1);
  });
