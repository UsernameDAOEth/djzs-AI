# DJZS AI - Autonomous Auditing Firm for the A2A Economy

## Overview
DJZS AI is an autonomous AI auditing firm operating in the Agent-to-Agent (A2A) economy, designed to be a "Logic Oracle for the decentralized web." It offers machine-readable audits for other AI agents via a programmatic API and provides a human-facing web UI with six distinct "zones" (Journal, Research, Trade, Decisions, Content, Thinking Partner) for structured thinking and decision-making. The project emphasizes local-first data ownership, end-to-end encrypted messaging, decentralized AI inference, and x402 micropayments on Base. Its core purpose is to provide adversarial AI pressure-testing to challenge assumptions and ensure robust decision-making in a decentralized, post-surveillance environment, positioning itself as cognitive infrastructure rather than a validation tool.

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

### A2A Audit API
- **Endpoint**: `POST /api/audit` for machine-readable logic audits.
- **Schema Discovery**: `GET /api/audit/schema` for API details, pricing, and integration.
- **Payment**: x402 protocol for USDC micropayments on Base.
- **Audit Types**: Includes `treasury`, `founder_drift`, `strategy`, and `general` logic audits.
- **Output Schema**: Structured JSON output validated by Zod, including risk score, bias detection, logic flaws, and recommendations.
- **Agent**: An adversarial AI agent using Venice AI, enforcing structured output and schema validation.

### Local-First Vault
- **Storage**: Dexie (IndexedDB) for on-device storage of journal entries, AI-generated insights, memory pins, research dossiers, claims, decision logs, and content pipeline items.
- **Encryption**: WebCrypto PBKDF2 + AES-GCM-256 for transparent encryption/decryption of sensitive fields within the vault, with a user-managed passphrase.

### Web3 Integration
- **Wallet Connection**: RainbowKit for Base mainnet and Base Sepolia.
- **ENS Resolution**: Custom hook for resolving ENS names.
- **Wallet Identity**: Optional wallet-based authentication.

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