# DJZS - Decentralized Journaling Zone System

## Overview
DJZS is a Decentralized Journaling Zone System operating in the Agent-to-Agent (A2A) economy, designed to be a "Logic Oracle for the decentralized web." It offers machine-readable adversarial audits for other AI agents via a tiered programmatic API and provides a human-facing web UI with six distinct zones (Journal, Research, Trade, Decisions, Content, Thinking Partner) for structured thinking and decision-making. The project emphasizes local-first data ownership, end-to-end encrypted messaging, decentralized AI inference, and x402 micropayments on Base. Its core purpose is to provide adversarial AI pressure-testing to challenge assumptions and ensure robust decision-making in a decentralized, post-surveillance environment, positioning itself as cognitive infrastructure rather than a validation tool.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend
- **Technology Stack**: React 18 with TypeScript, Vite.
- **UI/UX**: Radix UI components with Tailwind CSS, utilizing a "calm intelligence" dark theme. The design system features a futuristic dark palette (charcoal, orange, teal, purple, gold), sharp corners, and subtle borders. Fonts include Merriweather (headings) and Nunito (body).
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
    - **Journal**: Daily thinking, video entries (Livepeer), AI interrogation.
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