const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("DJZSProofOfLogicNFT", function () {
  let nft;
  let owner, minter, user, other;

  const SAMPLE_MINT = {
    auditId: "audit-uuid-001",
    timestamp: "2026-04-09T12:00:00Z",
    tier: "micro",
    riskScore: 12,
    verdict: "PASS",
    flagsJson: "[]",
    cryptographicHash: "sha256:abc123def456",
    irysTxId: "irys-tx-abc123",
    irysUrl: "https://gateway.irys.xyz/irys-tx-abc123",
    certificateJson: JSON.stringify({
      audit_id: "audit-uuid-001",
      verdict: "PASS",
      risk_score: 12,
      tier: "micro",
    }),
  };

  beforeEach(async function () {
    [owner, minter, user, other] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory("DJZSProofOfLogicNFT");
    nft = await Factory.deploy();
    await nft.waitForDeployment();
  });

  describe("Deployment", function () {
    it("sets correct name and symbol", async function () {
      expect(await nft.name()).to.equal("DJZS ProofOfLogic");
      expect(await nft.symbol()).to.equal("DJZS-POL");
    });

    it("sets deployer as owner", async function () {
      expect(await nft.owner()).to.equal(owner.address);
    });

    it("authorizes deployer as minter", async function () {
      expect(await nft.authorizedMinters(owner.address)).to.be.true;
    });

    it("starts with zero minted", async function () {
      expect(await nft.totalMinted()).to.equal(0);
    });
  });

  describe("Access Control", function () {
    it("owner can authorize a new minter", async function () {
      await expect(nft.authorizeMinter(minter.address))
        .to.emit(nft, "MinterAuthorized")
        .withArgs(minter.address);
      expect(await nft.authorizedMinters(minter.address)).to.be.true;
    });

    it("owner can revoke a minter", async function () {
      await nft.authorizeMinter(minter.address);
      await expect(nft.revokeMinter(minter.address))
        .to.emit(nft, "MinterRevoked")
        .withArgs(minter.address);
      expect(await nft.authorizedMinters(minter.address)).to.be.false;
    });

    it("non-owner cannot authorize a minter", async function () {
      await expect(
        nft.connect(other).authorizeMinter(minter.address)
      ).to.be.revertedWithCustomError(nft, "OwnableUnauthorizedAccount");
    });

    it("non-owner cannot revoke a minter", async function () {
      await expect(
        nft.connect(other).revokeMinter(minter.address)
      ).to.be.revertedWithCustomError(nft, "OwnableUnauthorizedAccount");
    });

    it("unauthorized address cannot mint", async function () {
      await expect(
        nft.connect(other).mint(
          user.address,
          SAMPLE_MINT.auditId,
          SAMPLE_MINT.timestamp,
          SAMPLE_MINT.tier,
          SAMPLE_MINT.riskScore,
          SAMPLE_MINT.verdict,
          SAMPLE_MINT.flagsJson,
          SAMPLE_MINT.cryptographicHash,
          SAMPLE_MINT.irysTxId,
          SAMPLE_MINT.irysUrl,
          SAMPLE_MINT.certificateJson
        )
      ).to.be.revertedWithCustomError(nft, "NotAuthorizedMinter");
    });

    it("authorized minter (non-owner) can mint", async function () {
      await nft.authorizeMinter(minter.address);
      await expect(
        nft.connect(minter).mint(
          user.address,
          SAMPLE_MINT.auditId,
          SAMPLE_MINT.timestamp,
          SAMPLE_MINT.tier,
          SAMPLE_MINT.riskScore,
          SAMPLE_MINT.verdict,
          SAMPLE_MINT.flagsJson,
          SAMPLE_MINT.cryptographicHash,
          SAMPLE_MINT.irysTxId,
          SAMPLE_MINT.irysUrl,
          SAMPLE_MINT.certificateJson
        )
      ).to.emit(nft, "ProofMinted");
    });

    it("revoked minter cannot mint", async function () {
      await nft.authorizeMinter(minter.address);
      await nft.revokeMinter(minter.address);
      await expect(
        nft.connect(minter).mint(
          user.address,
          SAMPLE_MINT.auditId,
          SAMPLE_MINT.timestamp,
          SAMPLE_MINT.tier,
          SAMPLE_MINT.riskScore,
          SAMPLE_MINT.verdict,
          SAMPLE_MINT.flagsJson,
          SAMPLE_MINT.cryptographicHash,
          SAMPLE_MINT.irysTxId,
          SAMPLE_MINT.irysUrl,
          SAMPLE_MINT.certificateJson
        )
      ).to.be.revertedWithCustomError(nft, "NotAuthorizedMinter");
    });
  });

  describe("Minting", function () {
    it("mints successfully with PASS verdict", async function () {
      const tx = await nft.mint(
        user.address,
        SAMPLE_MINT.auditId,
        SAMPLE_MINT.timestamp,
        SAMPLE_MINT.tier,
        SAMPLE_MINT.riskScore,
        SAMPLE_MINT.verdict,
        SAMPLE_MINT.flagsJson,
        SAMPLE_MINT.cryptographicHash,
        SAMPLE_MINT.irysTxId,
        SAMPLE_MINT.irysUrl,
        SAMPLE_MINT.certificateJson
      );

      await expect(tx)
        .to.emit(nft, "ProofMinted")
        .withArgs(1, user.address, SAMPLE_MINT.auditId, SAMPLE_MINT.irysTxId, SAMPLE_MINT.tier, SAMPLE_MINT.riskScore);

      expect(await nft.totalMinted()).to.equal(1);
      expect(await nft.ownerOf(1)).to.equal(user.address);
    });

    it("rejects non-PASS verdict", async function () {
      await expect(
        nft.mint(
          user.address,
          SAMPLE_MINT.auditId,
          SAMPLE_MINT.timestamp,
          SAMPLE_MINT.tier,
          SAMPLE_MINT.riskScore,
          "FAIL",
          SAMPLE_MINT.flagsJson,
          SAMPLE_MINT.cryptographicHash,
          SAMPLE_MINT.irysTxId,
          SAMPLE_MINT.irysUrl,
          SAMPLE_MINT.certificateJson
        )
      ).to.be.revertedWithCustomError(nft, "VerdictNotPass");
    });

    it("rejects empty auditId", async function () {
      await expect(
        nft.mint(
          user.address,
          "",
          SAMPLE_MINT.timestamp,
          SAMPLE_MINT.tier,
          SAMPLE_MINT.riskScore,
          SAMPLE_MINT.verdict,
          SAMPLE_MINT.flagsJson,
          SAMPLE_MINT.cryptographicHash,
          SAMPLE_MINT.irysTxId,
          SAMPLE_MINT.irysUrl,
          SAMPLE_MINT.certificateJson
        )
      ).to.be.revertedWithCustomError(nft, "EmptyField");
    });

    it("rejects empty irysTxId", async function () {
      await expect(
        nft.mint(
          user.address,
          SAMPLE_MINT.auditId,
          SAMPLE_MINT.timestamp,
          SAMPLE_MINT.tier,
          SAMPLE_MINT.riskScore,
          SAMPLE_MINT.verdict,
          SAMPLE_MINT.flagsJson,
          SAMPLE_MINT.cryptographicHash,
          "",
          SAMPLE_MINT.irysUrl,
          SAMPLE_MINT.certificateJson
        )
      ).to.be.revertedWithCustomError(nft, "EmptyField");
    });

    it("rejects empty certificateJson", async function () {
      await expect(
        nft.mint(
          user.address,
          SAMPLE_MINT.auditId,
          SAMPLE_MINT.timestamp,
          SAMPLE_MINT.tier,
          SAMPLE_MINT.riskScore,
          SAMPLE_MINT.verdict,
          SAMPLE_MINT.flagsJson,
          SAMPLE_MINT.cryptographicHash,
          SAMPLE_MINT.irysTxId,
          SAMPLE_MINT.irysUrl,
          ""
        )
      ).to.be.revertedWithCustomError(nft, "EmptyField");
    });

    it("prevents double-mint with same irysTxId", async function () {
      await nft.mint(
        user.address,
        SAMPLE_MINT.auditId,
        SAMPLE_MINT.timestamp,
        SAMPLE_MINT.tier,
        SAMPLE_MINT.riskScore,
        SAMPLE_MINT.verdict,
        SAMPLE_MINT.flagsJson,
        SAMPLE_MINT.cryptographicHash,
        SAMPLE_MINT.irysTxId,
        SAMPLE_MINT.irysUrl,
        SAMPLE_MINT.certificateJson
      );

      await expect(
        nft.mint(
          user.address,
          "audit-uuid-002",
          SAMPLE_MINT.timestamp,
          SAMPLE_MINT.tier,
          SAMPLE_MINT.riskScore,
          SAMPLE_MINT.verdict,
          SAMPLE_MINT.flagsJson,
          SAMPLE_MINT.cryptographicHash,
          SAMPLE_MINT.irysTxId,
          SAMPLE_MINT.irysUrl,
          SAMPLE_MINT.certificateJson
        )
      ).to.be.revertedWithCustomError(nft, "AlreadyMinted");
    });

    it("increments tokenId sequentially", async function () {
      await nft.mint(
        user.address,
        "audit-1",
        SAMPLE_MINT.timestamp,
        SAMPLE_MINT.tier,
        SAMPLE_MINT.riskScore,
        SAMPLE_MINT.verdict,
        SAMPLE_MINT.flagsJson,
        SAMPLE_MINT.cryptographicHash,
        "irys-tx-1",
        SAMPLE_MINT.irysUrl,
        SAMPLE_MINT.certificateJson
      );

      await nft.mint(
        user.address,
        "audit-2",
        SAMPLE_MINT.timestamp,
        "founder",
        25,
        SAMPLE_MINT.verdict,
        SAMPLE_MINT.flagsJson,
        SAMPLE_MINT.cryptographicHash,
        "irys-tx-2",
        SAMPLE_MINT.irysUrl,
        SAMPLE_MINT.certificateJson
      );

      expect(await nft.totalMinted()).to.equal(2);
      expect(await nft.ownerOf(1)).to.equal(user.address);
      expect(await nft.ownerOf(2)).to.equal(user.address);
    });
  });

  describe("Read Functions", function () {
    beforeEach(async function () {
      await nft.mint(
        user.address,
        SAMPLE_MINT.auditId,
        SAMPLE_MINT.timestamp,
        SAMPLE_MINT.tier,
        SAMPLE_MINT.riskScore,
        SAMPLE_MINT.verdict,
        SAMPLE_MINT.flagsJson,
        SAMPLE_MINT.cryptographicHash,
        SAMPLE_MINT.irysTxId,
        SAMPLE_MINT.irysUrl,
        SAMPLE_MINT.certificateJson
      );
    });

    it("getTokenByIrys returns correct tokenId", async function () {
      expect(await nft.getTokenByIrys(SAMPLE_MINT.irysTxId)).to.equal(1);
    });

    it("getTokenByIrys returns 0 for unknown irysTxId", async function () {
      expect(await nft.getTokenByIrys("unknown-tx")).to.equal(0);
    });

    it("getRawCertificate returns stored certificate JSON", async function () {
      const cert = await nft.getRawCertificate(1);
      expect(cert).to.equal(SAMPLE_MINT.certificateJson);
      const parsed = JSON.parse(cert);
      expect(parsed.audit_id).to.equal("audit-uuid-001");
      expect(parsed.verdict).to.equal("PASS");
      expect(parsed.risk_score).to.equal(12);
    });

    it("getRawCertificate reverts for non-existent token", async function () {
      await expect(nft.getRawCertificate(999)).to.be.revertedWithCustomError(
        nft,
        "ERC721NonexistentToken"
      );
    });

    it("certificates mapping returns stored data", async function () {
      const cert = await nft.certificates(1);
      expect(cert.auditId).to.equal(SAMPLE_MINT.auditId);
      expect(cert.timestamp).to.equal(SAMPLE_MINT.timestamp);
      expect(cert.tier).to.equal(SAMPLE_MINT.tier);
      expect(cert.riskScore).to.equal(SAMPLE_MINT.riskScore);
      expect(cert.verdict).to.equal("PASS");
      expect(cert.flagsJson).to.equal("[]");
      expect(cert.cryptographicHash).to.equal(SAMPLE_MINT.cryptographicHash);
      expect(cert.irysTxId).to.equal(SAMPLE_MINT.irysTxId);
      expect(cert.irysUrl).to.equal(SAMPLE_MINT.irysUrl);
      expect(cert.certificateJson).to.equal(SAMPLE_MINT.certificateJson);
      expect(cert.mintedAt).to.be.greaterThan(0);
    });
  });

  describe("tokenURI (On-Chain Metadata)", function () {
    beforeEach(async function () {
      await nft.mint(
        user.address,
        SAMPLE_MINT.auditId,
        SAMPLE_MINT.timestamp,
        SAMPLE_MINT.tier,
        SAMPLE_MINT.riskScore,
        SAMPLE_MINT.verdict,
        SAMPLE_MINT.flagsJson,
        SAMPLE_MINT.cryptographicHash,
        SAMPLE_MINT.irysTxId,
        SAMPLE_MINT.irysUrl,
        SAMPLE_MINT.certificateJson
      );
    });

    it("returns a valid data-URI", async function () {
      const uri = await nft.tokenURI(1);
      expect(uri).to.match(/^data:application\/json;base64,/);
    });

    it("decodes to valid JSON with correct fields", async function () {
      const uri = await nft.tokenURI(1);
      const base64Part = uri.replace("data:application/json;base64,", "");
      const jsonStr = Buffer.from(base64Part, "base64").toString("utf-8");
      const metadata = JSON.parse(jsonStr);

      expect(metadata.name).to.equal("DJZS ProofOfLogic #1");
      expect(metadata.description).to.include("PASS");
      expect(metadata.description).to.include("12/100");
      expect(metadata.description).to.include("micro");
      expect(metadata.external_url).to.equal(SAMPLE_MINT.irysUrl);
      expect(metadata.image).to.match(/^data:image\/svg\+xml;base64,/);
    });

    it("contains correct attributes", async function () {
      const uri = await nft.tokenURI(1);
      const base64Part = uri.replace("data:application/json;base64,", "");
      const metadata = JSON.parse(Buffer.from(base64Part, "base64").toString("utf-8"));

      const attrs = metadata.attributes;
      const findAttr = (name) => attrs.find((a) => a.trait_type === name);

      expect(findAttr("Verdict").value).to.equal("PASS");
      expect(findAttr("Risk Score").value).to.equal(12);
      expect(findAttr("Tier").value).to.equal("micro");
      expect(findAttr("Audit ID").value).to.equal(SAMPLE_MINT.auditId);
      expect(findAttr("Irys TX").value).to.equal(SAMPLE_MINT.irysTxId);
      expect(findAttr("Cryptographic Hash").value).to.equal(SAMPLE_MINT.cryptographicHash);
      expect(findAttr("Timestamp").value).to.equal(SAMPLE_MINT.timestamp);
    });

    it("embeds the certificate in metadata", async function () {
      const uri = await nft.tokenURI(1);
      const base64Part = uri.replace("data:application/json;base64,", "");
      const metadata = JSON.parse(Buffer.from(base64Part, "base64").toString("utf-8"));

      expect(metadata.certificate).to.deep.equal(JSON.parse(SAMPLE_MINT.certificateJson));
    });

    it("SVG image contains terminal-style elements", async function () {
      const uri = await nft.tokenURI(1);
      const base64Part = uri.replace("data:application/json;base64,", "");
      const metadata = JSON.parse(Buffer.from(base64Part, "base64").toString("utf-8"));

      const svgBase64 = metadata.image.replace("data:image/svg+xml;base64,", "");
      const svg = Buffer.from(svgBase64, "base64").toString("utf-8");

      expect(svg).to.include("<svg");
      expect(svg).to.include("PROOF-OF-LOGIC CERTIFICATE");
      expect(svg).to.include("PASS");
      expect(svg).to.include("#4ade80");
      expect(svg).to.include("MICRO");
    });

    it("reverts for non-existent token", async function () {
      await expect(nft.tokenURI(999)).to.be.revertedWithCustomError(
        nft,
        "ERC721NonexistentToken"
      );
    });
  });

  describe("Multi-Tier Minting", function () {
    it("handles all three tiers correctly", async function () {
      const tiers = ["micro", "founder", "treasury"];
      for (let i = 0; i < tiers.length; i++) {
        await nft.mint(
          user.address,
          `audit-${tiers[i]}`,
          SAMPLE_MINT.timestamp,
          tiers[i],
          i * 30,
          "PASS",
          "[]",
          `hash-${tiers[i]}`,
          `irys-${tiers[i]}`,
          SAMPLE_MINT.irysUrl,
          SAMPLE_MINT.certificateJson
        );
      }

      expect(await nft.totalMinted()).to.equal(3);

      const cert1 = await nft.certificates(1);
      expect(cert1.tier).to.equal("micro");

      const cert2 = await nft.certificates(2);
      expect(cert2.tier).to.equal("founder");

      const cert3 = await nft.certificates(3);
      expect(cert3.tier).to.equal("treasury");
    });

    it("handles risk score boundary values (0 and 100)", async function () {
      await nft.mint(
        user.address,
        "audit-low-risk",
        SAMPLE_MINT.timestamp,
        "micro",
        0,
        "PASS",
        "[]",
        "hash-low",
        "irys-low",
        SAMPLE_MINT.irysUrl,
        SAMPLE_MINT.certificateJson
      );

      await nft.mint(
        user.address,
        "audit-high-risk",
        SAMPLE_MINT.timestamp,
        "treasury",
        100,
        "PASS",
        "[]",
        "hash-high",
        "irys-high",
        SAMPLE_MINT.irysUrl,
        SAMPLE_MINT.certificateJson
      );

      const cert1 = await nft.certificates(1);
      expect(cert1.riskScore).to.equal(0);

      const cert2 = await nft.certificates(2);
      expect(cert2.riskScore).to.equal(100);
    });
  });
});
