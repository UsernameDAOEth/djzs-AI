# DJZS - Adversarial Logic Layer for the A2A Economy

## Overview
DJZS is a Forensic Terminal and Logic-as-a-Service (LaaS) protocol for the Agent-to-Agent (A2A) economy. It serves as the "Logic Oracle for the decentralized web" — a deterministic verification primitive that mandates an "Audit-Before-Act" loop for autonomous agents. The system applies Journal Entry Testing (JET), a 100-year-old financial security primitive modernized for AI reasoning traces. "Journaling" in DJZS is not a diary — it is the mandatory act of an autonomous agent committing its reasoning trace to an immutable log before executing a transaction.

The protocol offers machine-readable adversarial audits via a tiered x402-gated API (Micro $2.50, Founder $5.00, Treasury $50.00 USDC on Base) and provides a human-facing Architect Console with six workspace zones (Audit Ledger, Research, Trade, Decisions, Content, Thinking Partner). Every audit generates a Proof of Logic Certificate with deterministic DJZS-LF failure codes for autonomous agent error handling.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend
- **Technology Stack**: React 18 with TypeScript, Vite.
- **UI/UX**: Radix UI components with Tailwind CSS, with dark/light mode toggle (dark default). The design system features a futuristic dark palette (charcoal, orange, teal, purple, gold) and a warm light palette, sharp corners, and subtle borders. Fonts include Merriweather (headings) and Nunito (body). Theme managed via `client/src/lib/theme.tsx` ThemeProvider with localStorage persistence.
- **Routing**: Wouter for client-side navigation.
- **State Management**: React hooks for local state, TanStack Query for server state, Dexie (IndexedDB) for local-first vault.

### Backend
- **Framework**: Express.js with TypeScript.
- **API**: RESTful endpoints for various functionalities, including A2A audit, journal, research, and agent interactions.
- **OpenClaw Agent Runner**: A unified dispatcher (`runAgent(agentName, payload)`) for various AI agents (JournalInsight, ResearchSynth, ThinkingPartner), ensuring intelligence resides within agent classes.

### A2A Audit API (Tiered Zone Architecture)
- **Agent Discovery**: `/.well-known/agent.json` manifest for machine-readable service discovery.
- **Tiered Endpoints**:
  - `POST /api/audit/micro` — Micro-Zone ($2.50 USDC) — fast constrained operational audits (1000 char limit)
  - `POST /api/audit/founder` — Founder Zone ($5.00 USDC) — deep roadmap diligence (5000 char limit)
  - `POST /api/audit/treasury` — Treasury Zone ($50.00 USDC) — exhaustive adversarial governance audits (unlimited)
  - `POST /api/audit` — backward-compatible alias for Micro-Zone
- **Schema Discovery**: `GET /api/audit/schema` for API details, pricing, and integration.
- **Payment**: x402 protocol for USDC micropayments on Base. Treasury wallet: `0xEc551A9e5598a030B46278fEbaDF798Ea8bA05FF`.
- **Audit Types**: Includes `treasury`, `founder_drift`, `strategy`, and `general` logic audits.
- **Output Schema**: Structured JSON output validated by Zod, including tier, risk score, bias detection, logic flaws, and recommendations.
- **Agent**: An adversarial AI agent using Venice AI, with tier-specific prompt engineering for depth/rigor scaling.

### Local-First Vault
- **Storage**: Dexie (IndexedDB) for on-device storage of journal entries, AI-generated insights, memory pins, research dossiers, claims, decision logs, and content pipeline items.
- **Encryption**: WebCrypto PBKDF2 + AES-GCM-256 for transparent encryption/decryption of sensitive fields within the vault, with a user-managed passphrase.

### Web3 Integration
- **Wallet Connection**: RainbowKit for Base mainnet and Base Sepolia.
- **ENS Resolution**: Custom hook for resolving ENS names.
- **Wallet Identity**: Optional wallet-based authentication.

### Audit Deployment Terminal
- **Terminal-Style UI**: Monospace payload input with zone-specific pricing cards and adversarial copy for deploying audits across the three tiers (Micro, Founder, Treasury).
- **Cryptographic Ledger**: Expandable audit record cards with risk scoring visualization, tier badges, and re-deploy functionality for reviewing past audit results.
- **Interactive Onboarding Tutorial**: 6-step guided spotlight walkthrough (welcome, zone tiers, payload writing, deployment, results, ledger) with keyboard navigation (Arrow keys, Enter, Escape). Auto-shown to first-time users via localStorage persistence. Re-accessible via "How It Works" sidebar button. Visual spotlight highlights target UI elements with glowing halos.

### Key Features
- **Six Zones**:
    - **Audit Ledger**: Immutable forensic log of all ProofOfLogic certificates — verdicts, risk scores, DJZS-LF failure codes, logic hashes. The primary workspace view for Agent Architects.
    - **Research**: Article/link saving, AI interrogation of research, evidence scoring, research trackers, claim tracking (Brave, Web, Explain modes).
    - **Trade**: Trade thesis building, AI stress-testing, risk computation, wallet-signed artifacts, paper/live trading, autonomous market alerts.
    - **Decision**: Structured tracking of high-stakes decisions, AI pressure-testing.
    - **Content**: Content pipeline management, AI challenging angles and hooks.
    - **Thinking Partner**: Adversarial AI for reasoning attack and contradiction exposure.
- **Compounding Intelligence**: Memory pins, cross-zone connections, and synthesis to grow knowledge over time.
- **Music Library**: Local upload and playback of audio files, categorized by Focus, Reflection, and Creative zones.
- **Offline Support**: Works offline for writing and browsing due to local-first storage and service worker caching.

### Privacy Design
- Local-first storage, user control over AI execution, offline capability for journaling.
- XMTP messaging is End-to-End Encrypted via MLS protocol with quantum-resistant key encapsulation.

## Recent Changes
- **2026-02-22**: Wired live database to Architect Console. Added `audit_logs` PostgreSQL table via Drizzle schema. POST /api/audit handlers now persist every audit result to the database. Added `GET /api/audit/logs` endpoint for the dashboard. Dashboard overview now uses TanStack Query with 10-second polling interval — telemetry stats (Total Audits, Threats Prevented, Avg Risk Score) computed dynamically from live data. Loading skeleton and empty state included. Fixed dashboard sidebar 404s by converting from route-based `<Link>` navigation to state-based view switching via React context (`useDashboardView`). Built three new dashboard view panels: Audit Ledger (full certificate view with flags), Risk Parameters (DJZS-LF code frequency charts, bias detection stats), API Settings (endpoint docs, auth headers, curl example, agent.json/openapi.json links). Server database connection set up in `server/db.ts`.
- **2026-02-22**: Upgraded landing page to infrastructure-grade command center aesthetic. New two-column hero with "Adversarial Logic Layer" gradient headline, animated ProofOfLogic JSON terminal (FAIL verdict with scanning line effect), "Read the Docs" + "View Live Terminal" CTAs. Added Protocol Flow section (3-step pipeline: Agent Logic → Tollbooth → Oracle). Added DJZS-LF v1 Taxonomy Matrix (7 failure codes with severity badges and auto-abort flags). Added Terminal CTA section with curl command block. Upgraded docs.tsx API Reference with x402 Tollbooth authentication, curl example, response schema JSON, full taxonomy table, and Auto-Abort Circuit Breaker TypeScript snippet.
- **2026-02-22**: Replaced Journal zone with Audit Ledger — forensic terminal-styled ProofOfLogic certificate display with PASS/FAIL conditional borders (emerald/red), logic hash display, DJZS-LF failure code blocks, and risk scores. Updated all references across home, docs, roadmap, tutorial, and quick-search. Wallet connect screen updated to "Architect Console" identity. replit.md updated with JET protocol positioning.
- **2026-02-21**: Completed A2A handshake — Created `client/public/.well-known/ai-plugin.json` (OpenAI plugin discovery manifest pointing to openapi.json), replaced `client/public/openapi.json` with streamlined ProofOfLogic schema covering all 3 tiers (Micro/Founder/Treasury) with `x-payment-proof` header parameters, and added x402 payment gate fallback to Express audit routes (returns 402 with descriptive JSON when CDP middleware is inactive). All discovery endpoints live: `/.well-known/ai-plugin.json`, `/.well-known/agent.json`, `/openapi.json`, `/api/audit/schema`.
- **2026-02-21**: Comprehensive dark/light mode theme fix — replaced ALL hardcoded dark-mode colors across every page (docs, about, home, chat, roadmap, terms, privacy, security, not-found) and every component (audit-tutorial, quick-search, video-diary, error-boundary, decision-log-zone, content-pipeline-zone, trade-artifact-composer, music-panel, message-cards, trade/prediction/newsletter/event/payment composers, InstallPrompt). Systematic replacements: `text-white` → `text-foreground`, `text-gray-*` → `text-muted-foreground`, `bg-[#14171D]`/`bg-[#0F1115]` → `bg-muted`, `bg-gray-800/900` → `bg-muted`/`bg-card`, `border-white/[0.06]` → `border-border`, inline dark backgrounds → CSS variables. Zone gradient classes in index.css now use `hsl(var(--card))`.
- **2026-02-21**: Added dark/light mode toggle across all pages. Created ThemeProvider (`client/src/lib/theme.tsx`) with localStorage sync and Tailwind class-based dark mode. Updated CSS variables in `index.css` with light `:root` and dark `.dark` themes. Sun/Moon toggle in headers on all 8 pages.
- **2026-02-21**: Updated docs.tsx and about.tsx — added Proof of Logic Certificate section (DJZS-LF taxonomy, 7 failure codes, binary verdict rules), Founder Intelligence engine section (5 pattern analyzers), updated API endpoint card to show three tiered endpoints, updated response schema card with verdict/flags/tier fields. Fixed server-side verdict enforcement to deterministically FAIL when risk_score > 60. Renamed "Content Creators" to "Researchers" (verified clean).
- **2026-02-20**: Implemented Proof of Logic Certificate with DJZS-LF taxonomy — deterministic Logic Failure Codes (S01/S02 Structural, E01/E02 Epistemic, I01/I02 Incentive, X01 Execution) and binary PASS/FAIL verdict. Updated Zod schemas, AI agent prompt, openapi.json, agent.json, frontend results display, Cryptographic Ledger, and Dexie vault schema (v10). CRITICAL/HIGH flags auto-trigger FAIL verdict.
- **2026-02-20**: Built Founder Intelligence engine — 5 pattern analyzers (Bias Pattern Memory, Narrative Drift Detection, Assumption Kill Switch, Volatility Simulation, Emotional Spike Flag) that run pre-flight vault scans before each audit deployment. Intelligence context is injected into the AI agent prompt and displayed as a collapsible Intelligence Brief panel alongside audit results.
- **2026-02-20**: Removed Privacy Architecture section from landing page (content lives in docs).
- **2026-02-20**: Created OpenAPI 3.1.0 specification (`client/public/openapi.json`) documenting all three audit tiers with x402 payment headers and full request/response schemas.
- **2026-02-20**: Created AI-friendly `robots.txt` whitelisting GPTBot, Anthropic-ai, PerplexityBot, and others; pointing to agent.json and openapi.json.
- **2026-02-20**: Added JSON-LD structured data (`application/ld+json`) to `index.html` describing DJZS as SoftwareApplication with three tiered Offers and feature list.
- **2026-02-20**: Updated `index.html` meta tags (title, description, OG, Twitter) from "Private AI Journal" to "Autonomous Auditing System" aligned with A2A economy positioning.
- **2026-02-19**: Restored six Workspace Zones (Journal, Research, Trade, Decisions, Content, Thinking Partner) to sidebar alongside Execution Zones with "Deploy to Zone" shortcuts.
- **2026-02-19**: Updated tutorial to 7 steps covering both Workspace and Execution Zone workflows.
- **2026-02-19**: Added interactive onboarding tutorial with spotlight highlights, keyboard navigation, and localStorage persistence. Re-accessible via "How It Works" sidebar button.
- **2026-02-19**: Cleaned up landing page CTA buttons (removed redundant pricing labels).
- **2026-02-19**: Built Cryptographic Ledger view with expandable audit records, risk scoring visualization, and re-deploy functionality.
- **2026-02-19**: Implemented three-tier Audit Deployment Terminal with zone-specific pricing cards and terminal-style monospace payload input.

## External Dependencies
- **Livepeer**: Decentralized video storage and playback.
- **Venice AI**: Privacy-first AI processing.
- **Brave Search API**: Privacy-first web search.
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
- **@paragraph-com/sdk**: Paragraph newsletter integration.