# DJZS Protocol — 2-Minute Demo Script

**Total Runtime:** 2:00
**Format:** Screen recording with narration

---

## [0:00–0:15] Problem Statement (15 seconds)

> "Autonomous AI agents are making financial decisions with real capital — but nobody audits their reasoning before execution. A trading agent can have circular logic, missing risk bounds, or confirmation bias, and still deploy millions. There's no kill switch between bad reasoning and bad outcomes. DJZS fixes this."

**On Screen:** Title card with DJZS logo and tagline: "No agent acts without audit."

---

## [0:15–0:45] Architecture Overview (30 seconds)

> "DJZS is an adversarial reasoning auditor for AI agents. Here's how it works.

> An agent submits its strategy memo to the DJZS Oracle, which runs inside a Phala TEE — a hardware-isolated enclave where private keys never touch disk.

> Venice AI runs an adversarial analysis using our 11-code failure taxonomy — DJZS-LF — looking for circular logic, missing risk bounds, confirmation bias, and more.

> The result is a binary PASS or FAIL verdict. Every audit is permanently stored on Irys Datachain with a public gateway URL. The trust score is written on-chain to Base Mainnet. And if an escrow is involved, capital is released or locked based on the verdict."

**On Screen:** Architecture diagram showing: Agent → Phala TEE → Venice AI → Irys Datachain → Base Mainnet. Highlight each component as it's mentioned.

---

## [0:45–1:45] Live Demo (60 seconds)

> "Let me show you this working live."

### Part A — Failed Audit (25 seconds)

> "Here's a bad strategy memo: an agent wants to go 50x leveraged long on ETH because 'it went up for 3 days' — no stop loss, no risk bounds. I submit this to the DJZS Oracle..."

> "Verdict: FAIL. Risk score 95 out of 100. The Oracle caught circular logic — DJZS-S01 — and unhedged execution — DJZS-X01. The escrow gate LOCKS the funds. The agent cannot execute."

**On Screen:** Submit memo via Architect Console or cURL. Show the ProofOfLogic certificate with FAIL verdict, risk score, and DJZS-LF flags. Show Irys certificate link.

### Part B — The Adversarial Difference (20 seconds)

> "Now here's a strategy that sounds good: a DCA into ETH over 12 weeks, 5% of portfolio, with a 15% stop loss. Most systems would rubber-stamp this. But the DJZS Oracle is adversarial..."

> "Verdict: FAIL. Risk score 65. The Oracle caught data dependency — DJZS-X02 — and temporal assumptions — DJZS-T01. Even 'reasonable' strategies get stress-tested. That's the point — the Oracle is hostile by design. When a strategy truly passes, you know it earned it."

**On Screen:** Submit the DCA memo. Show FAIL verdict with moderate risk score. Highlight the DJZS-LF flags that a non-adversarial system would miss.

### Part C — Verification (15 seconds)

> "And here's the key part — anyone can verify this. Every certificate lives permanently on Irys. No API key, no auth, no expiration. Just click the gateway URL and see the full audit result. The trust score is on-chain on Base — queryable by any other agent or protocol."

**On Screen:** Click Irys gateway URL showing the full certificate JSON. Show BaseScan transaction for trust score write.

---

## [1:45–2:00] On-Chain Proof + Closing (15 seconds)

> "Everything is on-chain. The registration TX on Base. The trust scores on the DJZSLogicTrustScore contract. The certificates on Irys Datachain. The escrow settlements on DJZSEscrowLock. Every audit is permanent, verifiable, and machine-readable.

> DJZS — no agent acts without audit."

**On Screen:** BaseScan showing registration TX. Irys explorer showing DJZS certificates. Final title card with project links.

---

## Key Links to Show During Demo

| Asset | URL |
|---|---|
| Live App | https://djzs.ai |
| GitHub Repo | https://github.com/UsernameDAOEth/djzs-AI |
| Registration TX | https://basescan.org/tx/0x99b9fcfc64af207771afde1851fa7e569e5161d5bb166dbd000b44743bd1ce23 |
| Sample Irys Certificate | https://gateway.irys.xyz/G8TNstxkpWVX6zMj9Qizz5Mzj6rajHSSp2csvm3gEKDR |
| Phala TEE Deployment | https://d7255cce710465c7e67fd27a4688e9d9f5296179-5000.dstack-pha-prod5.phala.network |
