# DJZS — Adversarial Logic Layer for the A2A Economy

**Forensic Terminal & Logic-as-a-Service (LaaS) protocol for autonomous agents.**
Enforces an "Audit-Before-Act" loop — agents commit reasoning to an immutable log before executing transactions.

Repository: `github.com/UsernameDAOEth/djzs-AI`

---

## What DJZS Does

DJZS is a **Logic Oracle for the decentralized web**. It provides machine-readable adversarial audits for autonomous agents via a tiered, payment-gated API on Base Mainnet.

Every audit request produces a **Proof of Logic Certificate** with:
- Deterministic DJZS-LF failure codes for agent error handling
- Risk scoring (0–100)
- Bias detection and logic flaw analysis
- Tier-specific depth and adversarial rigor

It also includes a human-facing **Architect Console** with six workspace zones for journaling, research, trading, decision-making, content, and adversarial thinking.

---

## Architecture

```
┌──────────────────────────────────────────────────┐
│                   Frontend (React + Vite)         │
│  Radix UI · Tailwind CSS · Wouter · TanStack Query│
│  Dexie (IndexedDB) local vault · RainbowKit       │
└───────────────────────┬──────────────────────────┘
                        │
┌───────────────────────▼──────────────────────────┐
│               Backend (Express + TypeScript)      │
│                                                   │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────┐ │
│  │ A2A Audit   │  │ OpenClaw     │  │ Payment  │ │
│  │ Engine      │  │ Agent Runner │  │ Verifier │ │
│  │ (Venice AI) │  │ (AI Agents)  │  │ (viem)   │ │
│  └─────────────┘  └──────────────┘  └──────────┘ │
│                                                   │
│  PostgreSQL (Drizzle ORM) · x402 Payment Protocol │
└───────────────────────────────────────────────────┘
                        │
              Base Mainnet (USDC)
```

### Key Components

| Component | File | Purpose |
|---|---|---|
| Audit Engine | `server/audit-agent.ts` | Venice AI adversarial logic analysis with DJZS-LF taxonomy |
| Payment Verifier | `server/payment-verifier.ts` | On-chain USDC payment verification via viem on Base Mainnet |
| OpenClaw Runner | `server/openclaw.ts` | Unified AI agent dispatcher (JournalInsight, ResearchSynth, ThinkingPartner) |
| Venice AI Client | `server/venice.ts` | Privacy-first AI processing via Venice API |
| Storage Layer | `server/storage.ts` | PostgreSQL persistence via Drizzle ORM |
| Audit Schema | `shared/audit-schema.ts` | Tier config, DJZS-LF failure codes, Zod validation |
| Agent Discovery | `server/routes.ts` | `/.well-known/agent.json` manifest for A2A discovery |

---

## A2A Audit API

### Tiered Zone Architecture

| Tier | Endpoint | Price (USDC) | Memo Limit | Use Case |
|---|---|---|---|---|
| Micro-Zone | `POST /api/audit/micro` | $2.50 | 1,000 chars | Operational sanity checks, binary risk scoring |
| Founder Zone | `POST /api/audit/founder` | $5.00 | 5,000 chars | Strategic roadmap diligence, narrative drift detection |
| Treasury Zone | `POST /api/audit/treasury` | $50.00 | Unlimited | Exhaustive adversarial stress-test for capital deployment |

`POST /api/audit` is a backward-compatible alias for Micro-Zone.

### Payment Flow

1. Agent sends USDC to the treasury wallet on Base Mainnet
2. Agent includes the TX hash in the `x-payment-proof` header
3. Server verifies the transaction on-chain using viem:
   - Confirms TX succeeded on Base Mainnet
   - Decodes ERC-20 Transfer event logs from the USDC contract
   - Validates recipient matches treasury wallet and amount meets tier minimum
   - Checks for replay attacks (each TX hash can only be used once)
4. On verification, the audit runs and returns a Proof of Logic Certificate

### DJZS-LF Failure Code Taxonomy

| Code | Category | Name |
|---|---|---|
| DJZS-S01 | Structural | CIRCULAR_LOGIC |
| DJZS-S02 | Structural | MISSING_FALSIFIABILITY |
| DJZS-E01 | Epistemic | CONFIRMATION_TUNNEL |
| DJZS-E02 | Epistemic | AUTHORITY_SUBSTITUTION |
| DJZS-I01 | Incentive | MISALIGNED_INCENTIVE |
| DJZS-I02 | Incentive | NARRATIVE_DEPENDENCY |
| DJZS-X01 | Execution | UNHEDGED_EXECUTION |

### Discovery & Schema

- **Agent Discovery:** `GET /.well-known/agent.json`
- **Schema Discovery:** `GET /api/audit/schema` — returns API details, pricing, and integration info
- **Audit Logs:** `GET /api/audit/logs` — paginated audit history

---

## Architect Console (Human Interface)

Six workspace zones for structured thinking:

| Zone | Purpose |
|---|---|
| Audit Ledger | Immutable forensic log of Proof of Logic certificates |
| Research | Article/link saving, AI interrogation, evidence scoring, claim tracking |
| Trade | Trade thesis building, AI stress-testing, risk computation |
| Decisions | Structured tracking and AI pressure-testing of high-stakes decisions |
| Content | Content pipeline management, AI-powered angle and hook analysis |
| Thinking Partner | Adversarial AI for reasoning attack and contradiction exposure |

### Local-First Vault

- **Storage:** Dexie (IndexedDB) for on-device storage
- **Encryption (planned):** WebCrypto PBKDF2 + AES-GCM-256 with user-managed passphrase
- **Offline Support:** Write and browse without internet (AI features require connection)

---

## Environment Variables

All secrets are server-side only. Never expose to frontend code.

### Required

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `TREASURY_WALLET_ADDRESS` | Base Mainnet wallet for receiving USDC payments |
| `VENICE_API_KEY` | Venice AI API key for audit and intelligence agents |
| `BASE_RPC_URL` | Base Mainnet RPC endpoint for on-chain payment verification |

### Optional

| Variable | Description |
|---|---|
| `CDP_API_KEY_ID` | Coinbase Developer Platform API key ID (enables x402 protocol) |
| `CDP_API_KEY_SECRET` | Coinbase Developer Platform API secret |
| `BRAVE_API_KEY` | Brave Search API key for privacy-first web search |
| `LIVEPEER_API_KEY` | Livepeer API key for decentralized video storage |
| `PARAGRAPH_API_KEY` | Paragraph API key for newsletter integration |
| `X402_NETWORK` | Network identifier for x402 (default: `eip155:8453`) |
| `VENICE_MODEL` | Venice AI model (default: `llama-3.3-70b`) |
| `VENICE_BASE_URL` | Venice API base URL (default: `https://api.venice.ai/api/v1`) |
| `XMTP_ENV` | XMTP messaging environment: `dev` or `production` |

---

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL database
- Base Mainnet wallet with USDC (for testing payments)

### Install & Run

```bash
git clone https://github.com/UsernameDAOEth/djzs-AI.git
cd djzs-AI
npm install
```

Set environment variables (see table above), then:

```bash
npm run db:push        # Push schema to database
npm run dev            # Start development server
```

### Test an Audit (curl)

```bash
curl -X POST http://localhost:5000/api/audit/micro \
  -H "Content-Type: application/json" \
  -H "x-payment-proof: 0xYOUR_BASE_TX_HASH" \
  -d '{"strategy_memo": "Proposal to allocate 20% of treasury to ETH staking for yield generation.", "audit_type": "general"}'
```

---

## Database

PostgreSQL via Drizzle ORM. Schema defined in `shared/schema.ts`.

### Push Schema Changes

```bash
npm run db:push
```

Never write manual SQL migrations. Drizzle handles schema sync.

---

## Deployment

### Docker

```bash
docker build -t djzs-box .
docker run -p 5000:5000 --env-file .env djzs-box
```

### Phala Cloud TEE (Recommended for Production)

Deploy to Phala Cloud's Trusted Execution Environment for hardware-level isolation of private keys and secrets:

1. Build Docker image and push to DockerHub
2. Deploy to Phala Cloud TEE with environment variables injected at runtime
3. Private keys never touch disk — managed entirely within the TEE enclave

### GitHub Actions CI/CD

The repository includes a GitHub Actions workflow (`.github/workflows/docker-publish.yml`) for automated Docker builds on push to `main`. To enable it, add these secrets to your GitHub repository:

- `DOCKERHUB_USERNAME` — your DockerHub username
- `DOCKERHUB_TOKEN` — a DockerHub access token

---

## Security Design

- **No hardcoded secrets** — all sensitive values loaded from environment variables
- **Server-side only** — private keys, API keys, and wallet addresses never reach the frontend
- **Replay protection** — each payment TX hash can only be used for one audit
- **On-chain verification** — USDC payments verified directly against Base Mainnet via viem
- **Local-first vault** — user journal data stored on-device with optional AES-GCM-256 encryption
- **TEE deployment** — Phala Cloud enclave for hardware-isolated secret management in production

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, Radix UI |
| Backend | Express.js, TypeScript |
| Database | PostgreSQL, Drizzle ORM |
| AI | Venice AI (llama-3.3-70b) |
| Payments | USDC on Base Mainnet, x402 protocol, viem |
| Wallet | RainbowKit, wagmi, viem |
| Local Storage | Dexie (IndexedDB) |
| Routing | Wouter (client), Express (server) |
| State | TanStack Query (server state), React hooks (local) |
| Search | Brave Search API |
| Video | Livepeer (decentralized) |
| Validation | Zod |

---

## License

See LICENSE file for details.
