# DJZS - Adversarial Logic Layer for the A2A Economy

## Overview
DJZS is a Forensic Terminal and Logic-as-a-Service (LaaS) protocol designed for the Agent-to-Agent (A2A) economy. It acts as a "Logic Oracle for the decentralized web," enforcing an "Audit-Before-Act" loop for autonomous agents through deterministic verification. The system modernizes Journal Entry Testing (JET) for AI reasoning traces, requiring agents to commit their reasoning to an immutable log before executing transactions.

The protocol provides machine-readable adversarial audits via a tiered x402-gated API (Micro, Founder, Treasury tiers based on USDC payments on Base). The Architect Console is a governance-focused interface for the Sovereign Principal, featuring the Audit Ledger (immutable ProofOfLogic certificate review), Adversarial Oracle (manual reasoning stress-testing), Terminal Console, and x402 Governance layer (ProvisionAgentAllowance for escrow provisioning). Each audit generates a Proof of Logic Certificate, including deterministic DJZS-LF failure codes for autonomous agent error handling. The project aims to provide a robust, auditable framework for autonomous agent interactions within the A2A economy.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend
- **Technology Stack**: React 18 with TypeScript and Vite.
- **UI/UX**: Radix UI components with Tailwind CSS, supporting dark/light modes (dark by default). The design features a futuristic dark palette (charcoal, orange, teal, purple, gold) and a warm light palette, characterized by sharp corners and subtle borders. Fonts used are Merriweather (headings) and Nunito (body).
- **Routing**: Wouter for client-side navigation.
- **State Management**: React hooks for local state, TanStack Query for server state, and Dexie (IndexedDB) for a local-first vault.

### Backend
- **Framework**: Express.js with TypeScript.
- **API**: RESTful endpoints for A2A audit, journaling, and agent interactions.
- **OpenClaw Agent Runner**: A unified dispatcher (`runAgent(agentName, payload)`) that manages two AI agents (JournalInsight, AdversarialOracle), centralizing intelligence within agent classes.

### A2A Audit API (Tiered Zone Architecture)
- **Agent Discovery**: `/.well-known/agent.json` manifest for machine-readable service discovery.
- **Tiered Endpoints**: Micro-Zone ($2.50 USDC, 1000 char limit), Founder Zone ($5.00 USDC, 5000 char limit), and Treasury Zone ($50.00 USDC, unlimited). `POST /api/audit` serves as a backward-compatible alias for the Micro-Zone.
- **Schema Discovery**: `GET /api/audit/schema` for API details, pricing, and integration.
- **Payment**: x402 protocol for USDC micropayments on Base.
- **Audit Types**: Supports `treasury`, `founder_drift`, `strategy`, and `general` logic audits.
- **Output Schema**: Structured JSON output validated by Zod, including tier, risk score, bias detection, logic flaws, recommendations, and Irys Datachain provenance fields.
- **Irys Datachain Integration**: Every audit uploads its ProofOfLogic certificate to permanent storage via `@irys/upload` + `@irys/upload-ethereum` (Base Mainnet RPC). Responses include `provenance_provider: "IRYS_DATACHAIN"`, `irys_tx_id`, and `irys_url`. Verification endpoint: `GET /api/audit/verify/:txId`.
- **Irys Service**: `server/irys.ts` — `uploadAuditToIrys(auditData)` function. Requires `IRYS_PRIVATE_KEY` env secret (Ethereum wallet private key with ETH on Base for upload fees).
- **Adversarial Agent**: Utilizes Venice AI with tier-specific prompt engineering for scalable depth and rigor. All agents implement the Evasion Defense Execution Pipeline (STRIP/INVERT/TRACE/CLASSIFY) from `server/ai-identity.ts`.
- **Evasion Defense Pipeline**: Four-stage adversarial analysis baked into every audit:
  - **STRIP**: Extract raw premises, ignore rhetoric and persuasion techniques.
  - **INVERT**: Model catastrophic failure scenario; if thesis doesn't hedge against it, flag as fatal flaw.
  - **TRACE**: Identify who benefits financially/strategically from the proposed action.
  - **CLASSIFY**: Evaluate against 7 DJZS-LF failure codes; output risk_score (0-100) + flags array; diagnosis only, no fix advice.
- **DJZS-LF Failure Codes** (defined in `shared/audit-schema.ts`):
  - `DJZS-S01` CIRCULAR_LOGIC — Conclusion used as premise; self-referencing reasoning without external validation.
  - `DJZS-S02` MISSING_FALSIFIABILITY — No failure condition defined; thesis cannot be disproven.
  - `DJZS-E01` CONFIRMATION_TUNNEL — Asymmetric evidence selection; only confirming data cited.
  - `DJZS-E02` AUTHORITY_SUBSTITUTION — Argument depends on reputation/authority rather than structural evidence.
  - `DJZS-I01` MISALIGNED_INCENTIVE — Proposed action benefits proposer disproportionately vs stated stakeholders.
  - `DJZS-I02` NARRATIVE_DEPENDENCY — Strategy survival depends on a specific narrative remaining true; no hedge.
  - `DJZS-X01` UNHEDGED_EXECUTION — No fallback plan; single point of failure with no abort conditions.

### Local-First Vault
- **Storage**: Dexie (IndexedDB) for on-device storage of journal entries, AI insights, memory pins, trade artifacts, market alerts, and audit records.
- **Encryption**: WebCrypto PBKDF2 + AES-GCM-256 provides transparent encryption/decryption of sensitive fields using a user-managed passphrase.

### Web3 Integration
- **Wallet Connection**: RainbowKit for Base mainnet and Base Sepolia.
- **ENS Resolution**: Custom hook for resolving ENS names.
- **Wallet Identity**: Optional wallet-based authentication.

### Architect Console (M2M Governance)
- **Audit Ledger**: Immutable forensic log of ProofOfLogic certificates with expandable audit record cards, risk scoring visualization, and tier badges.
- **Adversarial Oracle**: Manual adversarial reasoning — expose contradictions, attack assumptions, pressure-test logic.
- **Terminal Console**: Dashboard for protocol monitoring and configuration.
- **x402 Fee Structure**: Read-only display of Execution Zone pricing (Micro $2.50, Founder $5.00, Treasury $50.00 USDC).
- **ProvisionAgentAllowance**: Governance component for provisioning USDC escrow to execution agents. Reads live USDC balance via wagmi `useReadContract` (balanceOf on Base Mainnet USDC contract). Displays Available Velocity and Pending Logic Traces metrics. Detects wrong network (shows SWITCH_NETWORK), disconnected state, and defaults to 50.00 USDC input.
- **Local Node State**: Export-only telemetry section at the bottom of the Audit Ledger view. "Export Logic Logs (.zip)" downloads local IndexedDB state. No import functionality (core state is on Irys Datachain).
- **Onboarding**: An interactive tutorial ("Protocol Specs") with spotlight highlights, keyboard navigation, and localStorage persistence.
- **Offline Support**: Enables offline writing and browsing via local-first storage and service worker caching.

### Privacy Design
- Emphasizes local-first storage, user control over AI execution, and offline journaling capabilities.
- XMTP messaging is end-to-end encrypted via MLS protocol with quantum-resistant key encapsulation.
- **XMTP Agent** (`server/agent.ts`): Standalone listener using `@xmtp/agent-sdk`. Routes `Thinking:` prefix to AdversarialOracle, `Journal:` prefix to JournalInsight. Requires `XMTP_WALLET_KEY` (0x hex) and `XMTP_ENV` (dev/production) env vars. Run separately with `npx tsx server/agent.ts`.
- **A2A Test Script** (`scripts/test-a2a-xmtp.ts`): Generates a burner wallet, connects to XMTP devnet, sends a DM to the Oracle, and logs the response. Run with `ORACLE_ADDRESS=0x... npx tsx scripts/test-a2a-xmtp.ts`.

## Phala TEE Deployment
- **CVM ID**: cvm_A6e0M7ZX (ID: 25877, prod5, dstack-0.5.3)
- **App ID**: `d7255cce710465c7e67fd27a4688e9d9f5296179`
- **Live URL**: `https://d7255cce710465c7e67fd27a4688e9d9f5296179-5000.dstack-pha-prod5.phala.network`
- **Dual-Process Entry Point**: `npm start` uses `concurrently` to boot both `start:api` (Express REST API) and `start:xmtp` (XMTP Agent listener) simultaneously from a single command — required for Phala CVM single-entrypoint constraint
- **Docker Image**: `djzs/djzs-ai:latest` (node:22-slim base, built via GitHub Actions on push to main)
- **GitHub Repo**: `UsernameDAOEth/djzs-box`
- **Deploy Script**: `/tmp/create-cvm2.mjs` (provision + create pattern)
- **Key Fix**: `allowed_envs` must be set in compose_file during provision AND `env_keys` (list of "KEY=value" strings) in create CVM call
- **DB Resilience**: App starts gracefully without database (server/db.ts exports nullable db, server/index.ts wraps seedDefaultRooms in try/catch)
- **Neon DB**: Endpoint `ep-cool-fog-a6aibsm0.us-west-2.aws.neon.tech` is currently disabled; app runs without it
- **Security Hardening**: node:22-slim base (Go CVEs), minimatch 10.2.1 override (ReDoS CVE), cross-spawn 7.0.6 (patched), undici 6.23.0 override (decompression DoS), @xmtp/proto 3.88.0 override, 10 build-only packages moved to devDependencies
- **Audit Status**: `npm audit --omit=dev` reports 0 vulnerabilities; 2 remaining moderate (vite→esbuild dev-server) are non-exploitable in production

## External Dependencies
- **Venice AI**: Privacy-first AI processing.
- **RainbowKit**: Wallet connection UI.
- **wagmi/viem**: Blockchain interactions.
- **Dexie**: IndexedDB wrapper.
- **Zod**: Schema validation.
- **Radix UI**: Frontend component library.
- **Tailwind CSS**: Styling framework.
- **Vite**: Frontend build tool.
- **Express.js**: Backend web framework.
- **TanStack Query**: Server state management.
- **Wouter**: Client-side routing.
- **@xmtp/agent-sdk**: XMTP agent SDK.
- **concurrently**: Runs multiple npm scripts in parallel (used for dual-process production boot).