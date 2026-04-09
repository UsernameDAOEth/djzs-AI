# DJZS - Adversarial Logic Layer for the A2A Economy

## Overview
DJZS is a Forensic Terminal and Logic-as-a-Service (LaaS) protocol designed for the Agent-to-Agent (A2A) economy. It acts as a "Logic Oracle for the decentralized web," enforcing an "Audit-Before-Act" loop for autonomous agents through deterministic verification. The system modernizes Journal Entry Testing (JET) for AI reasoning traces, requiring agents to commit their reasoning to an immutable log before executing transactions.

The protocol provides machine-readable adversarial audits via a tiered x402-gated API (Micro, Founder, Treasury tiers based on USDC payments on Base). The x402 Audit Console (`/chat`) is a wallet-gated interface that routes audit requests to the real x402 payment endpoints, while the Live Demo (`/demo`) provides a free rate-limited preview. Each audit generates a Proof of Logic Certificate, including deterministic DJZS-LF failure codes for autonomous agent error handling. The project aims to provide a robust, auditable framework for autonomous agent interactions within the A2A economy.

### Integration Channels (Dark/Light)
- **Dark Channel (XMTP)**: E2E encrypted via MLS protocol. Alpha protection for proprietary trading agents. Agent DMs the Oracle at `0xC5Ab9496233c1e51eD21c712e8abc86a3F434fc5`, gets verdict privately. Zero public trace. Message prefixes: `Thinking:` → AdversarialOracle, `Journal:` → JournalInsight.
- **Light Channel (Base REST API)**: x402-gated public provenance. DAO treasury bots get audits with Irys Datachain certificates permanently on-chain. Full accountability by design. Endpoints: `/api/audit/micro`, `/founder`, `/treasury`.
- **Kill Switch**: Both channels enforce the same Audit-Before-Act loop — DJZS acts as a deterministic circuit breaker between an agent's reasoning and its execution. If the logic fractures, the transaction dies.
- **agent.json**: `/.well-known/agent.json` includes `integration_channels` metadata for machine-readable Dark/Light Channel discovery.
- **Homepage**: Hero copy positions DJZS as "The Kill Switch for Autonomous Trading Agents" with Dark/Light Channel framing.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend
- **Technology Stack**: React 18 with TypeScript and Vite.
- **UI/UX**: Landing page (`/`), x402 Console (`/chat`), docs (`/docs`), and dashboard pages all use "Terminal Brutalism" design — JetBrains Mono, inline styles via `client/src/lib/terminal-theme.tsx` (C palette + MONO font), green-on-black (#0a0a0a) with amber/red accents. Demo (`/demo`) still uses Radix UI + Tailwind CSS with dark/light modes.
- **Routing**: Wouter for client-side navigation.
- **State Management**: React hooks for local state, TanStack Query for server state.

### Backend
- **Framework**: Express.js with TypeScript.
- **API**: RESTful endpoints for A2A audit, journaling, and agent interactions.
- **OpenClaw Agent Runner**: A unified dispatcher (`runAgent(agentName, payload)`) that manages two AI agents (JournalInsight, AdversarialOracle), centralizing intelligence within agent classes.

### A2A Audit API (Tiered Zone Architecture)
- **Agent Discovery**: `/.well-known/agent.json` manifest for machine-readable service discovery.
- **Tiered Endpoints**: Micro-Zone ($0.10 USDC, 1000 char limit), Founder Zone ($1.00 USDC, 5000 char limit), and Treasury Zone ($10.00 USDC, unlimited). `POST /api/audit` serves as a backward-compatible alias for the Micro-Zone.
- **Schema Discovery**: `GET /api/audit/schema` for API details, pricing, and integration.
- **Payment**: x402 protocol for USDC micropayments on Base.
- **Audit Types**: Supports `treasury`, `founder_drift`, `strategy`, and `general` logic audits.
- **Structured Trade Params**: Optional `trade_params` object (protocol, pair, direction, leverage, notional_usd, stop_loss_pct, take_profit_pct, entry_price, timeframe) enables deterministic trade auditing. Oracle cross-references trade parameters against strategy_memo narrative to detect parameter/narrative mismatches.
- **Agent Identity**: Optional `agent_id` field (wallet address or XMTP identity) tagged on Irys certificates for reputation tracking and fleet analytics.
- **Output Schema**: Structured JSON output validated by Zod, including tier, risk score, bias detection, logic flaws, recommendations, and Irys Datachain provenance fields.
- **Irys Datachain Integration**: Every audit uploads its ProofOfLogic certificate to permanent storage via `@irys/upload` + `@irys/upload-ethereum` (Base Mainnet RPC). Responses include `provenance_provider: "IRYS_DATACHAIN"`, `irys_tx_id`, and `irys_url`. Verification endpoint: `GET /api/audit/verify/:txId`.
- **Irys Tags (GraphQL-Queryable)**: Uploads include enriched tags: `application-id`, `Content-Type`, `audit-id`, `tier`, `verdict`, `protocol`, `version`, `Risk-Score`, `Audit-Type`, `Timestamp`, `Agent-Id` (conditional), `Trading-Pair` (conditional), `Flag-Codes` (conditional). Queryable via Irys GraphQL endpoint for analytics dashboards and fleet-wide audit reports.
- **Irys Service**: `server/irys.ts` — `uploadAuditToIrys(auditData)` function. Requires `IRYS_PRIVATE_KEY` env secret (Ethereum wallet private key with ETH on Base for upload fees).
- **Health Endpoint**: `GET /api/health` returns component-level status (api, xmtp_agent, detection_engine, irys_datachain, x402_payments), uptime, version, and capability flags. Referenced in `agent.json` for A2A fleet orchestrators.
- **Adversarial Agent**: `server/audit-agent.ts` orchestrates audits via `executeAudit()` producing `ProofOfLogicCertificate`. Uses the deterministic `DJZSEngine` rule engine (`server/engine/`) for LF code detection — zero external API calls. Tier→persona mapping: micro→`general`, founder→`logic_auditor`, treasury→`risk_hunter`. XMTP message routing via `parseAndRoute()` supports `Risk:`, `Backtest:`, `Regime:`, `Logic:`, `Thinking:`, `Audit:` prefixes. `shouldAutoAbort()` helper for kill-switch logic. All agents implement the Evasion Defense Execution Pipeline (STRIP/INVERT/TRACE/CLASSIFY) from `server/ai-identity.ts`.
- **Evasion Defense Pipeline**: Four-stage adversarial analysis baked into every audit:
  - **STRIP**: Extract raw premises, ignore rhetoric and persuasion techniques.
  - **INVERT**: Model catastrophic failure scenario; if thesis doesn't hedge against it, flag as fatal flaw.
  - **TRACE**: Identify who benefits financially/strategically from the proposed action.
  - **CLASSIFY**: Evaluate against 11 DJZS-LF v1.0 codes; output risk_score (0-200, sum of flag weights) + flags array; diagnosis only, no fix advice.
- **DJZS-LF v1.0 Failure Taxonomy** (defined in `shared/audit-schema.ts`, weights sum to 200):
  - `DJZS-S01` CIRCULAR_LOGIC (30pts, CRITICAL) — Reasoning chain references its own conclusion as premise.
  - `DJZS-S02` LAYER_INVERSION (25pts, HIGH) — Verification layer depends on unverified upstream data.
  - `DJZS-S03` DEPENDENCY_GHOST (18pts, MEDIUM) — References external dependency that cannot be resolved.
  - `DJZS-E01` ORACLE_UNVERIFIED (25pts, HIGH) — External data source cited without provenance verification.
  - `DJZS-E02` CONFIDENCE_INFLATION (18pts, MEDIUM) — Stated certainty exceeds evidential basis.
  - `DJZS-I01` FOMO_LOOP (16pts, MEDIUM) — Decision driven by social signal rather than verified data.
  - `DJZS-I02` MISALIGNED_REWARD (16pts, MEDIUM) — Optimization target diverges from stated objective.
  - `DJZS-I03` DATA_UNVERIFIED (16pts, MEDIUM) — Numerical claims lack verifiable source attribution.
  - `DJZS-X01` EXECUTION_UNBOUND (15pts, CRITICAL) — No halt condition or resource ceiling defined.
  - `DJZS-X02` RACE_CONDITION (9pts, HIGH) — Temporal dependency creates non-deterministic outcome.
  - `DJZS-T01` STALE_REFERENCE (12pts, LOW) — Data reference exceeds freshness threshold.
- **Deterministic Rule Engine** (`server/engine/`):
  - `DJZSEngine` class — pure TypeScript pattern-matching rule engine replacing Venice AI for LF code detection. Zero external API calls, fully reproducible inside TEE (Phala CVM).
  - 11 DJZS detectors (`server/engine/detectors/`) + 5 universal detectors for general MCP tool call safety
  - `utils/analysis.ts` — text analysis utilities (matchesRegex, matchesAny, extractNumbers, detectSelfReference, paramOverflowRatio, flattenParams)
  - Engine weights aligned to canonical taxonomy in `shared/audit-schema.ts` (DJZS sum=200, Universal sum=100)
  - Code prefix mapping: engine uses short codes (S01, E01), integration layer in `audit-agent.ts` maps to prefixed codes (DJZS-S01, DJZS-E01)
  - `detection_model` field in certificates: `"djzs-trust/rule-engine@v1.0"`
  - Test suite: `server/engine/__tests__/engine.test.ts` (32 tests covering all 16 detectors + verdict + hash determinism)
- **Payment Gate Abstraction** (`server/payment-gate.ts`):
  - `PaymentGate` interface with `verify()` method
  - `X402Gate` — wraps existing `payment-verifier.ts` for on-chain USDC verification
  - `NoOpGate` — always passes (used for demo/testing)
  - `CredentialedGate` — API key validation
  - `DeferredGate` — post-audit billing for MCP proxy tier
  - 4-tier pricing: Proxy $0.01, Micro $0.10, Founder $1.00, Treasury $10.00
  - `DJZS_PRICING_MODE` env var: "production" (default) or "demo"
  - `shouldUploadToIrys()` helper — returns false for proxy tier
- **Universal LF Codes** (`shared/universal-lf-codes.ts`):
  - Re-exports 5 universal codes from engine (UNAUTHORIZED_SCOPE=25, PARAMETER_OVERFLOW=20, DESTRUCTIVE_UNGUARDED=25, NO_ROLLBACK_PATH=15, CHAIN_UNVERIFIED=15, sum=100)
  - `computeUniversalScore()`, `computeUniversalVerdict()`, `computeUniversalHash()`
  - `DOMAIN_REGISTRY` — module registry for domain (DJZS) and universal code sets
  - `UNIVERSAL_CODE_DEFINITIONS` — full definitions with severity and description
- **MCP Proxy Skeleton** (`server/mcp-proxy.ts`):
  - `MCPProxy` class — EventEmitter-based proxy for MCP `tools/call` interception
  - Three modes: `passthrough` (default), `audit` (score but don't block), `enforce` (block on FAIL)
  - Uses `DJZSEngine` with `codeSets: ["universal"]` for tool-call auditing
  - Emits `audit`, `blocked`, `modeChange` events
  - Not wired to any route — skeleton only for future MCP proxy deployment
- **Prediction Market Vertical** (`shared/prediction-schema.ts`, `server/prediction-audit.ts`, `server/engine/claude-detector.ts`):
  - Domain: `"PREDICTION"` discriminator on `/api/audit/micro` and `/api/audit/demo` endpoints
  - NOT a new tier — extends Micro Zone with prediction-specific context (`PredictionContext`: market_question, thesis, position, entry_price, size_usdc, source_signal, category, market_id, evidence_urls)
  - Detection engine: Claude Sonnet 4 via Anthropic API (primary), Venice LLM as privacy fallback (`engine: "CLAUDE" | "VENICE"`)
  - Claude/Venice return boolean LF flags per code; scoring remains fully deterministic in TypeScript
  - Source signal modifiers: `UNDISCLOSED`/`PAID_SIGNAL_GROUP` auto-flag I01, `WHALE_TRACKING` auto-flags S01, extreme entry prices (>0.90/<0.10) trigger I03 check with tail-risk term detection
  - Hard-fail rules (prediction-specific, fire after scoring, override verdict): `E02_REQUIRED` (thesis must state falsification criteria — E02 detected → forced FAIL), `I01_UNDISCLOSED` (UNDISCLOSED source + I01 detected → forced FAIL). Certificate includes `hard_fail_rules: string[]` and `verdict_source: "HARD_FAIL" | "SCORE"`
  - E02 guardrail: deterministically flags any thesis missing falsification terms (falsif, prove me wrong, invalidat, disprove, would fail if, thesis breaks if, wrong if) regardless of evidence URLs or thesis length
  - INDETERMINATE handling: if detection engine fails/returns invalid JSON, verdict defaults to INDETERMINATE (never false PASS) with `DJZS-INDETERMINATE` flag
  - `PredictionAuditRequestSchema` validates incoming requests; rejects malformed payloads with detailed Zod errors
  - Output: `PredictionCertificate` (extends `ProofOfLogicCertificate` with INDETERMINATE verdict + hard-fail fields) with `domain: "PREDICTION"` tag, uploaded to Irys with prediction_context metadata
  - 12-case deterministic test suite (`server/engine/__tests__/prediction-tests.ts`): 6 MUST_FAIL, 2 MUST_PASS, 4 EDGE cases. Validates hard-fail rules, guardrails, and scoring. Run via `npx tsx server/engine/__tests__/prediction-tests.ts` (requires VENICE_API_KEY or ANTHROPIC_API_KEY)
  - Polymarket CLOB proxy interceptor interface defined but not wired (future task)
  - Requires `ANTHROPIC_API_KEY` env var for Claude engine; Venice fallback uses existing `VENICE_API_KEY`
- **Claude Audit Client** (`server/claude-client.ts`): `shouldUseClaude()` checks for `ANTHROPIC_API_KEY`, `getClaudeAuditClient()` returns a client that calls Claude Sonnet for adversarial LF detection. Intended for Treasury-tier upgrades.
- **Scoring**: Deterministic — rule engine detects boolean flags via pattern matching, scoring is pure function of weights. Max score 200. FAIL threshold: risk_score ≥ 60 OR any CRITICAL flag. Pure-JS SHA-256 for browser compatibility.
- **Adversarial Audit Module** (`server/adversarial-audit.ts`):
  - Full `ADVERSARIAL_AUDIT_PROMPT` with expanded DJZS-LF taxonomy, deterministic verdict rules, and risk score calculation (retained for reference/prompt engineering)
  - `buildAuditMessages()` / `buildQuickAuditMessages()` for structured prompt construction with escrow context support
  - `parseAuditResponse()` for strict JSON validation of AI responses (used by journal/agent analysis)
  - `computeTraceHash()` / `verifyTraceHash()` for on-chain keccak256 hash verification via viem
  - `mapToLegacyFormat()` for backward compatibility with legacy audit log shape
  - `shouldAbort()` / `getAbortTriggers()` for deterministic kill-switch logic
  - New `AuditResult` shape: `primary_flaw` + `summary` + flags with `evidence`/`recommendation` (legacy fields preserved as optional)
- **On-Chain Trust Score Writer** (`server/chainWriter.ts`):
  - `writeTrustScore({ agentAddress, verdict, riskScore, flags, irysTxId })` — calls `DJZSLogicTrustScore.updateScore()` on Base Mainnet
  - `readLatestTrustScore(agentAddress)` — reads latest trust score from on-chain contract
  - Wired into both tiered audit endpoints and escrow audit endpoint; fires after Irys upload succeeds
  - Requires `TRUST_SCORE_CONTRACT_ADDRESS`, `SETTLEMENT_PRIVATE_KEY`, and `BASE_RPC_URL` env vars; gracefully skipped if not configured
  - Audit responses include `trust_score_tx_hash` when chain write succeeds
- **Solidity Contracts** (`contracts/`):
  - `DJZSLogicTrustScore.sol` — on-chain trust score registry with authorized writer access control
  - `DJZSEscrowLock.sol` — USDC escrow with AuditPending/Settled lifecycle
  - `DJZSStaking.sol` — agent staking with time lock and slashing
  - `DJZSAgentRegistry.sol` — on-chain agent registry with metadata
  - `DJZSProofOfLogicNFT.sol` — ERC-721 NFT with on-chain SVG in Terminal Brutalism style, stores full ProofOfLogic certificate + Irys link
  - Deployment: `hardhat.config.cjs` + `scripts/deploy.cjs` for Base Mainnet; `scripts/deploy-proof-of-logic.cjs` for NFT contract
  - Documentation: `CONTRACTS.md` with full interface reference
- **ProofOfLogic NFT Minting** (`server/nftMinter.ts`):
  - `mintProofOfLogicNft(input)` — mints ERC-721 NFT on Base Mainnet with full certificate stored on-chain
  - `buildNftMintInput(audit, irys, tier, recipient)` — constructs mint input from audit result
  - `getTokenByIrys(irysTxId)` — checks if NFT already minted for a given Irys TX
  - `getRawCertificate(tokenId)` / `getTotalMinted()` — read helpers
  - Founder/Treasury tiers: auto-mint on PASS verdict (treasury pays gas)
  - Micro tier: returns `nft_mint_available: true` in response; user triggers via `POST /api/audit/mint-nft`
  - FAIL verdicts never mint
  - Requires `NFT_CONTRACT_ADDRESS`, `SETTLEMENT_PRIVATE_KEY`, `BASE_RPC_URL` env vars
- **TorusLogo Component** (`client/src/components/TorusLogo.tsx`):
  - Canvas 2D animated torus with brand colors (orange #F37E20, teal #2E8B8B)
  - Used by chat.tsx and demo.tsx for header branding
- **Escrow Contract Integration** (`server/escrow-contract.ts`):
  - ABI for DJZS Escrow Contract: `AuditPending` event, `settleEscrow` function, `getEscrow` view function
  - `readAuditPendingEvent(txHash)` — reads tx receipt, decodes `AuditPending` event, returns escrow metadata + on-chain `executionTraceHash`
  - `callSettleEscrow(escrowId, passed, irisTxId)` — sends settlement transaction on Base Mainnet via `SETTLEMENT_PRIVATE_KEY`
  - `readEscrowState(escrowId)` — reads on-chain escrow state (creator, recipient, amount, hash, settled)
  - Requires `ESCROW_CONTRACT_ADDRESS` and `SETTLEMENT_PRIVATE_KEY` env vars; warns gracefully on startup if missing
- **Escrow Gate Module** (`server/escrowGate.ts`):
  - `evaluateEscrowGate(input)` — Takes audit result + Irys upload result + escrow context, applies gate logic, calls settlement
  - Gate decision: verdict PASS + trust_score >= threshold → RELEASE; otherwise → LOCK
  - Trust score = 100 - risk_score (inverse of audit risk score)
  - Threshold configurable via `ESCROW_TRUST_THRESHOLD` env var (default: 40)
  - Emits structured `escrow_gate_decision` JSON events with: escrow_id, verdict, trust_score, threshold, action_taken, tx_hash, irys_tx_id, certificate_hash, timestamp
  - `computeTrustScore()`, `computeCertificateHash()`, `determineAction()` exported for testing
  - Integration test results documented in `server/escrow-integration-test-results.md`
- **Signature Verification** (`server/signature-verifier.ts`):
  - `buildSignatureMessage(escrowId, memoHash)` — deterministic EIP-191 message format: `DJZS-AUDIT:${escrowId}:${memoHash}`
  - `verifyCallerIsRecipient(signature, escrowId, memoHash, expectedAddress)` — recovers signer via `viem.verifyMessage`, compares to expected recipient
  - `requireEscrowSignature()` — Express middleware that validates `x-escrow-signature` header, reads on-chain escrow state, verifies caller is recipient, attaches `req.escrowData` for downstream use
- **Escrow Audit Endpoint**: `POST /api/audit/escrow` — escrow-funded audit flow (no x402 payment):
  1. Signature verification middleware proves caller is escrow recipient
  2. Reads `AuditPending` event from `escrow_tx_hash`, verifies strategy_memo hash on-chain
  3. Runs adversarial audit via Venice AI
  4. Uploads ProofOfLogic certificate to Irys Datachain
  5. Calls `settleEscrow(escrowId, passed, irisTxId)` on Base Mainnet
  6. Returns certificate + `settlement_tx_hash` + Irys provenance

### Web3 Integration
- **Wallet Connection**: RainbowKit for Base mainnet and Base Sepolia.
- **Wallet Identity**: Wallet-based authentication for x402 Audit Console.

### x402 Audit Console (`/chat`)
- Wallet-gated audit interface using the same clean two-column layout as the demo page.
- Routes to real x402 payment endpoints (`/api/audit/micro`, `/api/audit/founder`, `/api/audit/treasury`) based on tier selection.
- Requires wallet connection via RainbowKit; Run button disabled when disconnected.
- Passes wallet address and optional BYOK Venice API key in request headers.
- Full pipeline visualization: signature → hash check → auditing → Irys upload → settlement → complete.
- Displays ProofOfLogic certificate with risk score gauge, DJZS-LF failure codes, Irys certificate link, and BaseScan TX link.

### Live Demo (`/demo`)
- Free, rate-limited demo of the audit pipeline via `/api/audit/demo`.
- Same UI layout as the x402 Audit Console but no wallet required.
- Preloaded scenarios for quick testing.

### Privacy Design
- XMTP messaging is end-to-end encrypted via MLS protocol with quantum-resistant key encapsulation.
- **XMTP Agent** (`server/agent.ts`): Standalone listener using `@xmtp/agent-sdk`. Persona-routed via `handleXMTPMessage` from `audit-agent.ts`. Prefixes: `Thinking:`/`Audit:` → general, `Logic:` → logic_auditor, `Risk:` → risk_hunter, `Backtest:` → backtest_skeptic, `Regime:` → regime_detector, `Journal:` → JournalInsight (OpenClaw), `Help:` → usage guide. Requires `XMTP_WALLET_KEY` (0x hex) and `XMTP_ENV` (dev/production) env vars. Run separately with `npx tsx server/agent.ts`.
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
- **Security Hardening**: node:22-slim base (Go CVEs), minimatch 10.2.3 override (ReDoS CVE), cross-spawn 7.0.6 (patched), undici 6.24.0 override (decompression DoS), hono 4.12.4 override, serialize-javascript 7.0.3 override, @xmtp/proto 3.88.0 override, 10 build-only packages moved to devDependencies

## Developer CLI (`cli/`)
- **Package**: `@djzs/cli` v0.1.0 — Developer CLI for the DJZS protocol
- **Entry Point**: `cli/bin/djzs.ts` → compiled to `cli/dist/bin/djzs.js`
- **Build**: `cd cli && npx tsc` (outputs to `cli/dist/`)
- **Link**: Symlinked to `node_modules/.bin/djzs` for local testing via `npx djzs`
- **Dependencies**: commander, chalk, ora, ethers (installed in root node_modules)
- **Commands**:
  - `djzs health [-u URL]` — Pings `/api/health`, prints formatted component status
  - `djzs init [-u URL] [-f]` — Generates Ethereum wallet, saves `.djzs.json` config (address, api_url, tier, channel)
  - `djzs audit <memo> [-t tier] [-u URL] [--json]` — POSTs strategy memo to `/api/audit`, prints PASS/FAIL verdict with risk score and flags
- **Config File**: `.djzs.json` (created by `djzs init`) stores agent_id, api_url, default_tier, default_channel

## External Dependencies
- **Venice AI**: Privacy-first AI processing via `VeniceClient` class (`server/venice.ts`). Supports 5 adversarial personas (`logic_auditor`, `regime_detector`, `backtest_skeptic`, `risk_hunter`, `general`) with per-persona model routing: `regime_detector` → `qwen3-235b`, `backtest_skeptic` → `deepseek-r1`, others → `llama-3.3-70b`. Singleton via `getVeniceClient()`, per-request API key override supported. Journal analysis (`analyzeJournalEntry`) preserved for backward compat. Base URL configurable via VENICE_BASE_URL. Also serves as privacy fallback for prediction market audits.
- **Anthropic SDK** (`@anthropic-ai/sdk`): Used by prediction market vertical for Claude Sonnet LF detection. Requires `ANTHROPIC_API_KEY` env var.
- **RainbowKit**: Wallet connection UI.
- **wagmi/viem**: Blockchain interactions.
- **Zod**: Schema validation.
- **Radix UI**: Frontend component library.
- **Tailwind CSS**: Styling framework.
- **Vite**: Frontend build tool.
- **Express.js**: Backend web framework.
- **TanStack Query**: Server state management.
- **Wouter**: Client-side routing.
- **@xmtp/agent-sdk**: XMTP agent SDK.
- **concurrently**: Runs multiple npm scripts in parallel (used for dual-process production boot).