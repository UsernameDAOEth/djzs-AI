# DJZS AI Oracle: The Immutable Mind

**A trustless AI auditing protocol for the Agent-to-Agent economy.**

The DJZS Oracle runs inside a [Phala Network](https://phala.network) Trusted Execution Environment (Intel SGX hardware enclave), uses [Venice AI](https://venice.ai) for uncensored adversarial reasoning, settles payments in USDC on [Base](https://base.org), and engraves every Proof-of-Logic certificate permanently on the [Irys Datachain](https://irys.xyz).

No agent acts without audit. Every reasoning trace is stress-tested against the DJZS-LF failure taxonomy before execution. Every verdict is permanently verifiable.

Repository: [`github.com/UsernameDAOEth/djzs-box`](https://github.com/UsernameDAOEth/djzs-box)

---

## The Architecture Stack

| Layer | Technology | Role |
|---|---|---|
| **Compute** | Phala Network (Intel SGX) | Hardware-isolated execution — private keys never touch disk |
| **Intelligence** | Venice AI (Uncensored LLM) | Adversarial logic analysis with zero data retention |
| **Settlement** | Base Network (USDC) | x402 micropayments — pay-per-audit, no subscriptions |
| **Memory** | Irys Datachain | Permanent, immutable ProofOfLogic certificate storage |

```
┌─────────────────────────────────────────────────────────────┐
│                      Calling Agent                          │
│         Sends strategy_memo + USDC payment (x402)           │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│              Phala Network TEE (Intel SGX Enclave)           │
│                                                             │
│  ┌──────────────┐   ┌───────────────┐   ┌───────────────┐  │
│  │ x402 Payment │──▶│ Venice AI     │──▶│ Irys Datachain│  │
│  │ Verification │   │ Adversarial   │   │ Permanent     │  │
│  │ (Base USDC)  │   │ Analysis      │   │ Upload        │  │
│  └──────────────┘   └───────────────┘   └───────┬───────┘  │
│                                                  │          │
│  Private keys isolated in hardware enclave       │          │
│  (Venice API, Irys wallet, x402 keys)            │          │
└──────────────────────────────────────────────────┼──────────┘
                                                   │
                          ┌────────────────────────┘
                          ▼
┌─────────────────────────────────────────────────────────────┐
│              ProofOfLogic Certificate                       │
│                                                             │
│  verdict: PASS/FAIL    irys_tx_id: "71oNMzL4hg..."         │
│  risk_score: 0-100     irys_url: gateway.irys.xyz/...       │
│  flags: [DJZS-LF]     provenance_provider: IRYS_DATACHAIN  │
└─────────────────────────────────────────────────────────────┘
```

---

## API Integration Guide

### Tiered Zone Pricing

| Tier | Endpoint | Price (USDC) | Memo Limit | Use Case |
|---|---|---|---|---|
| Micro-Zone | `POST /api/audit/micro` | $2.50 | 1,000 chars | Operational sanity checks, binary risk scoring |
| Founder Zone | `POST /api/audit/founder` | $5.00 | 5,000 chars | Strategic roadmap diligence, narrative drift detection |
| Treasury Zone | `POST /api/audit/treasury` | $50.00 | Unlimited | Exhaustive adversarial stress-test for capital deployment |

`POST /api/audit` is a backward-compatible alias for Micro-Zone.

### Request Format

```bash
curl -X POST https://YOUR_ORACLE_URL/api/audit/micro \
  -H "Content-Type: application/json" \
  -H "x-payment-proof: 0xYOUR_BASE_MAINNET_TX_HASH" \
  -d '{
    "strategy_memo": "Proposal to allocate 20% of DAO treasury to ETH staking for yield generation. Current treasury: $2.4M USDC. Expected APY: 4.2%.",
    "audit_type": "treasury",
    "target_system": "MyDAOProject"
  }'
```

#### Request Fields

| Field | Type | Required | Description |
|---|---|---|---|
| `strategy_memo` | string | Yes | The reasoning trace to audit (min 20 chars) |
| `audit_type` | string | No | `treasury`, `founder_drift`, `strategy`, or `general` (default: `general`) |
| `target_system` | string | No | Project name or wallet address — tags the Irys upload for GraphQL discoverability |

#### Headers

| Header | Required | Description |
|---|---|---|
| `Content-Type` | Yes | `application/json` |
| `x-payment-proof` | Yes | Base Mainnet transaction hash for USDC payment to treasury wallet |

### Payment Flow

1. Agent sends USDC to the treasury wallet on Base Mainnet
2. Agent includes the TX hash in the `x-payment-proof` header
3. Oracle verifies the transaction on-chain via viem:
   - Confirms TX succeeded on Base Mainnet
   - Decodes ERC-20 Transfer event logs from the USDC contract
   - Validates recipient matches treasury wallet and amount meets tier minimum
   - Checks for replay attacks (each TX hash can only be used once)
4. On verification, the adversarial audit runs and the ProofOfLogic certificate is minted on Irys

---

## The Proof-of-Logic Certificate

Every successful audit returns a deterministic JSON certificate. The verdict is binary — PASS or FAIL. No probabilistic hedging.

```json
{
  "audit_id": "fe1f14d0-73ac-4467-ac33-d76bf3fdce21",
  "timestamp": "2026-02-25T00:58:33.760Z",
  "tier": "micro",
  "risk_score": 0,
  "verdict": "PASS",
  "primary_bias_detected": "None",
  "flags": [],
  "logic_flaws": [],
  "structural_recommendations": [
    "Continue to utilize fundamental arithmetic operations as a baseline for logical verification"
  ],
  "cryptographic_hash": "0e4576dd63709edd70573146b5e7255e79295cfe3eb18e517f03ab2e27d2850d",
  "provenance_provider": "IRYS_DATACHAIN",
  "irys_tx_id": "71oNMzL4hgLoXo7SNEsgPSJ8oCETs15jKwioke3V2rSH",
  "irys_url": "https://gateway.irys.xyz/71oNMzL4hgLoXo7SNEsgPSJ8oCETs15jKwioke3V2rSH"
}
```

### Key Response Fields

| Field | Description |
|---|---|
| `verdict` | `PASS` or `FAIL` — deterministic, binary |
| `risk_score` | 0–100 (0 = flawless logic, 100 = critically compromised) |
| `flags` | Array of DJZS-LF failure codes with severity and description |
| `cryptographic_hash` | SHA-256 hash of the input strategy memo for tamper detection |
| `provenance_provider` | Always `"IRYS_DATACHAIN"` — confirms permanent storage |
| `irys_tx_id` | Irys Datachain transaction ID — the permanent receipt |
| `irys_url` | Direct gateway link to the immutable certificate on the public ledger |

The `irys_url` is a permanent, publicly accessible link. Anyone can verify the AI's reasoning by visiting the gateway URL — no API key, no authentication, no expiration.

---

## Verification Endpoint

Verify any ProofOfLogic certificate by its Irys transaction ID:

```bash
GET /api/audit/verify/:txId
```

This endpoint is **free and public** — no x402 payment required.

```bash
curl https://YOUR_ORACLE_URL/api/audit/verify/71oNMzL4hgLoXo7SNEsgPSJ8oCETs15jKwioke3V2rSH
```

Returns:

```json
{
  "verified": true,
  "provenance_provider": "IRYS_DATACHAIN",
  "irys_tx_id": "71oNMzL4hgLoXo7SNEsgPSJ8oCETs15jKwioke3V2rSH",
  "irys_url": "https://gateway.irys.xyz/71oNMzL4hgLoXo7SNEsgPSJ8oCETs15jKwioke3V2rSH",
  "certificate": {
    "audit_id": "fe1f14d0-73ac-4467-ac33-d76bf3fdce21",
    "timestamp": "2026-02-25T00:58:33.760Z",
    "tier": "micro",
    "verdict": "PASS",
    "risk_score": 0
  }
}
```

---

## DJZS-LF Failure Code Taxonomy

The Oracle maps all detected reasoning flaws to strict, machine-parseable failure codes. Autonomous agents should halt execution on CRITICAL or HIGH severity flags.

| Code | Category | Name | Severity | Auto-Abort |
|---|---|---|---|---|
| `DJZS-S01` | Structural | CIRCULAR_LOGIC | Critical | Yes |
| `DJZS-S02` | Structural | MISSING_FALSIFIABILITY | Critical | Yes |
| `DJZS-E01` | Epistemic | CONFIRMATION_TUNNEL | High | Yes |
| `DJZS-E02` | Epistemic | AUTHORITY_SUBSTITUTION | High | Yes |
| `DJZS-I01` | Incentive | MISALIGNED_INCENTIVE | Medium | No (Review) |
| `DJZS-I02` | Incentive | NARRATIVE_DEPENDENCY | Medium | No (Review) |
| `DJZS-X01` | Execution | UNHEDGED_EXECUTION | Critical | Yes |

---

## Discovery Endpoints

| Endpoint | Description |
|---|---|
| `GET /.well-known/agent.json` | A2A agent discovery manifest — machine-readable service description |
| `GET /api/audit/schema` | Full API schema with pricing, field definitions, and integration details |
| `GET /api/audit/logs` | Paginated audit history |
| `GET /api/audit/verify/:txId` | Public certificate verification via Irys Datachain |

---

## Irys Datachain Tags

Every upload to Irys includes metadata tags for GraphQL discoverability. Founders and agents can query the [Irys GraphQL endpoint](https://uploader.irys.xyz/graphql) to find all audits for a specific project.

| Tag | Value | Purpose |
|---|---|---|
| `Protocol` | `ProofOfLogic` | Identifies DJZS protocol certificates |
| `application-id` | `DJZS-Oracle` | Application identifier |
| `Content-Type` | `application/json` | Data format |
| `Target-System` | Project name or `Unknown` | Enables per-project search |
| `audit-id` | UUID | Unique audit identifier |
| `tier` | `micro` / `founder` / `treasury` | Audit tier |
| `verdict` | `PASS` / `FAIL` | Audit result |

### Example GraphQL Query

```graphql
query {
  transactions(
    tags: [
      { name: "Protocol", values: ["ProofOfLogic"] },
      { name: "Target-System", values: ["MyDAOProject"] }
    ]
  ) {
    edges {
      node {
        id
        tags { name value }
      }
    }
  }
}
```

---

## Architect Console (Sovereign Principal Interface)

Four governance zones for autonomous agent oversight:

| Zone | Purpose |
|---|---|
| Audit Ledger | Immutable forensic log of ProofOfLogic certificates with Irys Datachain provenance |
| Adversarial Oracle | Adversarial AI reasoning attack — expose contradictions, challenge assumptions, pressure-test logic |
| Terminal Console | Protocol monitoring and configuration dashboard |
| x402 Governance | Execution Zone fee structure display and USDC escrow provisioning via ProvisionAgentAllowance |

### Local Node State

- **Storage:** Dexie (IndexedDB) for local telemetry and audit record caching
- **Export:** "Export Logic Logs (.zip)" downloads local IndexedDB state for offline analysis
- **Core Provenance:** All ProofOfLogic certificates are permanently stored on Irys Datachain — local state is supplementary
- **Encryption:** WebCrypto PBKDF2 + AES-GCM-256 with user-managed passphrase
- **BYOK:** Bring Your Own Venice API Key for full control over AI usage and billing

---

## Key Components

| Component | File | Purpose |
|---|---|---|
| Audit Engine | `server/audit-agent.ts` | Venice AI adversarial logic analysis with DJZS-LF taxonomy |
| Irys Service | `server/irys.ts` | Permanent certificate upload to Irys Datachain with metadata tags |
| Payment Verifier | `server/payment-verifier.ts` | On-chain USDC payment verification via viem on Base Mainnet |
| OpenClaw Runner | `server/openclaw.ts` | Unified AI agent dispatcher (JournalInsight, ResearchSynth, ThinkingPartner) |
| Venice AI Client | `server/venice.ts` | Privacy-first AI processing via Venice API |
| Storage Layer | `server/storage.ts` | PostgreSQL persistence via Drizzle ORM |
| Audit Schema | `shared/audit-schema.ts` | Tier config, DJZS-LF failure codes, Zod validation |
| Agent Discovery | `server/routes.ts` | `/.well-known/agent.json` manifest for A2A discovery |

---

## Security Design

- **TEE Isolation** — Oracle runs inside a Phala Cloud CVM (Intel SGX). Private keys for Venice AI, Irys wallet, and x402 payment verification are managed in hardware — they never touch disk
- **Zero Data Retention** — Venice AI claims no data retention or training on inputs. Strategy memos are processed in real-time
- **Replay Protection** — Each payment TX hash can only be used for one audit
- **On-Chain Verification** — USDC payments verified directly against Base Mainnet via viem
- **Immutable Provenance** — Audit certificates are permanently stored on Irys Datachain. Once uploaded, they cannot be altered or deleted
- **Local-First Vault** — User workspace data stored on-device with AES-GCM-256 encryption
- **No Hardcoded Secrets** — All sensitive values loaded from environment variables inside the TEE

---

## Environment Variables

All secrets are server-side only and managed inside the TEE enclave.

### Required

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `TREASURY_WALLET_ADDRESS` | Base Mainnet wallet for receiving USDC payments |
| `VENICE_API_KEY` | Venice AI API key for adversarial audit analysis |
| `BASE_RPC_URL` | Base Mainnet RPC endpoint for on-chain payment verification |
| `IRYS_PRIVATE_KEY` | Ethereum wallet private key for Irys Datachain uploads (needs ETH on Base for fees) |

### Optional

| Variable | Description |
|---|---|
| `CDP_API_KEY_ID` | Coinbase Developer Platform API key ID (enables x402 protocol) |
| `CDP_API_KEY_SECRET` | Coinbase Developer Platform API secret |
| `BRAVE_API_KEY` | Brave Search API key for privacy-first web search |
| `X402_NETWORK` | Network identifier for x402 (default: `eip155:8453`) |
| `VENICE_MODEL` | Venice AI model (default: `llama-3.3-70b`) |
| `VENICE_BASE_URL` | Venice API base URL (default: `https://api.venice.ai/api/v1`) |
| `XMTP_ENV` | XMTP messaging environment: `dev` or `production` |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Compute | Phala Network TEE (Intel SGX hardware enclave) |
| Intelligence | Venice AI (llama-3.3-70b, uncensored) |
| Provenance | Irys Datachain (permanent, immutable storage) |
| Settlement | USDC on Base Mainnet, x402 protocol |
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, Radix UI |
| Backend | Express.js, TypeScript |
| Database | PostgreSQL, Drizzle ORM |
| Wallet | RainbowKit, wagmi, viem |
| Local Storage | Dexie (IndexedDB), AES-GCM-256 encryption |
| Routing | Wouter (client), Express (server) |
| State | TanStack Query (server state), React hooks (local) |
| Search | Brave Search API |
| Validation | Zod |
| Messaging | XMTP (MLS protocol, quantum-resistant) |

---

## Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Base Mainnet wallet with USDC (for testing payments)
- Ethereum wallet with ETH on Base (for Irys upload fees)

### Install & Run

```bash
git clone https://github.com/UsernameDAOEth/djzs-box.git
cd djzs-box
npm install
```

Set environment variables (see tables above), then:

```bash
npm run db:push        # Push schema to database
npm run dev            # Start development server
```

---

## Deployment

### Docker

```bash
docker build -t djzs-ai .
docker run -p 5000:5000 --env-file .env djzs-ai
```

### Phala Cloud TEE (Recommended for Production)

Deploy to Phala Cloud's Trusted Execution Environment for hardware-level isolation:

1. Build Docker image and push to DockerHub: `djzs/djzs-ai:latest`
2. Provision a CVM on Phala Cloud with environment variables injected at runtime
3. All private keys (Venice API, Irys wallet, x402 keys) are managed inside the SGX enclave — they never touch disk and are inaccessible to the host operator

Current deployment: `dstack-pha-prod5.phala.network`

### GitHub Actions CI/CD

The repository includes a GitHub Actions workflow (`.github/workflows/docker-publish.yml`) for automated Docker builds on push to `main`. Add these secrets to your GitHub repository:

- `DOCKERHUB_USERNAME` — your DockerHub username
- `DOCKERHUB_TOKEN` — a DockerHub access token

---

## License

See LICENSE file for details.

---

<p align="center">
  <strong>No agent acts without audit.</strong><br>
  <em>DJZS Protocol — The Immutable Mind</em>
</p>
