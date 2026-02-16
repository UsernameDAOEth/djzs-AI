# DJZS - Decentralized AI for Sovereign Thinking

## Overview
DJZS is a decentralized, quantum-resilient AI thinking system designed for sovereign users. It combines local-first data ownership, end-to-end encrypted messaging (XMTP + MLS), and decentralized AI inference via Venice. Four zones (Journal, Research, Trade, Thinking Partner) form one loop: capture locally → reflect with decentralized AI → compound insights securely. No centralized model training on your thoughts. No cloud surveillance layer. No silent data extraction.

## Strategic Positioning
- **Category**: Decentralized cognitive infrastructure for sovereign users (NOT journaling, NOT note-taking)
- **Value prop**: "Decentralized AI for sovereign thinking" — not "Remember your life beautifully"
- **Target users**: Crypto-native builders, privacy maximalists, founders, traders (crypto analysts, DeFi researchers), content creators, researchers, strategists, long-term thinkers
- **NOT for**: Casual diary-keeping, photo memories, lifestyle journaling, emotional reflection
- **Competition**: Centralized AI tools (ChatGPT, Notion AI), scattered notes, browser bookmarks (NOT other journal apps)
- **Moat**: Decentralized AI + E2E encryption + local-first = no centralized platform can replicate the sovereignty guarantee
- **Positioning statement**: Cognitive infrastructure for a decentralized, post-surveillance world

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend
- **Technology Stack**: React 18 with TypeScript, Vite.
- **UI**: Radix UI components with Tailwind CSS (Ghibli-inspired warm theme).
- **Design System**: Ghibli palette — orange #F37E20 (primary), teal #2E8B8B (research zone), navy #2A2E3F (backgrounds), gold #FFB84D (accents), surface #1a1d26. Fonts: Merriweather (headings), Nunito (body).
- **Routing**: Wouter for client-side navigation (`/`, `/chat`, `/docs`, `/privacy`, `/security`, `/about`, `/terms`, `/roadmap`, `*`).
- **State Management**: React hooks for local state, TanStack Query for server state, Dexie (IndexedDB) for local-first vault.
- **Component Structure**: Organized by pages (Home, Chat, Docs, Privacy, Security, About, Terms, Roadmap, NotFound) and specific UI components.

### Backend
- **Framework**: Express.js with TypeScript.
- **API**: RESTful endpoints (`/api/members`, `/api/rooms`, `/api/messages`, `/api/journal/*`, `/api/memories/*`, `/api/research/*`, `/api/agent/analyze`, `/api/github/*`, `/api/paragraph/*`).
- **Storage**: In-memory storage for members, rooms, and messages, pre-seeded with "Journal" and "Research" rooms.

### Local-First Vault (IndexedDB/Dexie)
- **entries**: Journal and research entries stored on-device.
- **insights**: AI-generated insights linked to entries.
- **memoryPins**: User-pinned memories (goals, patterns, preferences, etc.).
- **researchDossiers**: Named research folders.
- **researchQueries**: Search queries within dossiers.
- **researchClaims**: Claims with trust levels, status, and optional journal links.

### Web3 Integration
- **Wallet Connection**: RainbowKit (Base mainnet and Base Sepolia).
- **ENS Resolution**: Custom hook (`useDisplayName`) resolves ENS names via public RPC.
- **Wallet Identity**: Optional wallet-based authentication (no email/password).

### OpenClaw Agent Runner
- **File**: `server/openclaw.ts` — unified `runAgent(agentName, payload)` dispatcher.
- **Agents**: JournalInsight (journal analysis), ResearchSynth (research synthesis), ThinkingPartner (thinking coach).
- **API**: `POST /api/openclaw/run` with `{ agent: "JournalInsight", payload: {...} }`.
- **Design**: Strictly non-thinking dispatcher; all intelligence lives in the agent classes. Each returns typed JSON.
- **Integration**: Wraps existing Venice AI calls (`venice.ts`, `agent.api.ts`) into clean OpenClaw interface.

### XMTP Agent
- **SDK**: `@xmtp/agent-sdk` for autonomous agents.
- **Agent File**: `server/agent.ts` listens to XMTP messages, routes to OpenClaw agents.
- **Commands**: `/help`, `/zones`, `Journal: <entry>`, `Research: <notes>`, `Thinking: <question>`.

### Video Journal (Livepeer)
- **Recording**: In-browser video recording via MediaRecorder API.
- **Upload**: TUS resumable uploads to Livepeer for reliability with large files.
- **Storage**: Video asset IDs and playback IDs stored locally in IndexedDB with journal entries.
- **Playback**: Livepeer-hosted video playback within past entries.
- **Backend**: `/api/video/upload` (request upload URL), `/api/video/status/:assetId`, `/api/video/playback/:playbackId`.
- **Component**: `client/src/components/video-diary.tsx` (VideoUpload + VideoPlayer).

### Music Library
- **Upload**: Drag-and-drop or click-to-upload audio files (mp3, wav, etc.).
- **Storage**: Audio blobs stored locally in IndexedDB (`musicTracks` table, vault version 5).
- **Playback**: Full controls — play/pause, next/prev, progress seek, volume slider, mute toggle.
- **Zones**: Organize tracks into Focus, Reflection, and Creative zones with filter tabs.
- **Component**: `client/src/components/music-panel.tsx` (slide-in panel from right side).
- **Integration**: "Music" button in journal action bar toggles the panel.

### Trade Artifacts
- **Types**: `client/src/lib/trade-artifacts.ts` — TradeThesis, ZoneRef, StressTestReport, RiskSummary, TradeArtifactV1, TradeArtifactRow.
- **XMTP Bridge**: `client/src/lib/trade-artifacts-xmtp.ts` — send artifacts to trader agents, stream ExecutionReports.
- **Storage**: `tradeArtifacts` table in Dexie vault (version 6), `++id` PK with `&hash` unique index, denormalized fields for indexing.
- **Component**: `client/src/components/trade-artifact-composer.tsx` — TradeArtifactZone with 4 tabs (Compose, Stress Test, Risk & Sign, History).
- **Integration**: Accessible as "Trade" zone in chat sidebar. Uses viem WalletClient for EIP-191 signing, SHA-256 content hashing.
- **Market Data**: Live price via CoinGecko API (no key), sentiment via Fear & Greed Index. Backend routes: `/api/market/price/:asset`, `/api/market/sentiment`. Auto-fills Market Conditions on asset blur + manual refresh button. Shows 24h price change.
- **Flow**: Build thesis → AI stress test via Thinking Partner → Risk computation → Sign & store → Optional XMTP send to agent.

### Key Features (Four Zones, One Loop)
- **Journal Zone**: Write daily thinking → AI auto-summarizes and extracts structured insights (key claims, patterns, open questions). Memory pinning carries context forward. Video entries via Livepeer.
- **Research Zone**: Save articles/links → AI synthesizes research with journal entries. Brave Mode (privacy-first search), Web Mode (Venice AI web search), Explain Mode (AI knowledge synthesis). Dossiers, claim tracking with trust levels, cross-zone linking.
- **Trade Zone**: Build trade thesis → AI stress tests → Risk computation → Wallet-sign artifact → Store locally with content hash → Send to trader agent via XMTP.
- **Thinking Partner**: One AI agent that connects ideas across journal and research, debates points, finds patterns, and surfaces contradictions. Not a chatbot — a structured thinking partner.
- **Compounding Intelligence**: Memory pins, past-entry connections, and cross-zone synthesis ensure knowledge grows smarter over time, not just larger.
- **Music Library**: Upload and play your own music while thinking. Tracks stored locally. Organize by Focus/Reflection/Creative zones.
- **Local-First Storage**: All data stored in browser IndexedDB. Works offline for writing/browsing.
- **Offline Support**: Service worker caches static assets.

## Privacy Claims (What's True)

### Implemented
- Local-first storage via IndexedDB (Dexie)
- User control over AI (only sent when you click "Think with me")
- Offline-capable journaling (AI/research requires internet)
- Venice AI claims no data retention
- Brave Search claims no tracking/profiling

### Implemented (XMTP Layer Only)
- XMTP messaging is E2E encrypted via MLS protocol with forward secrecy & post-compromise security
- Quantum-resistant key encapsulation (XWING KEM) protects XMTP Welcome messages against "Harvest Now, Decrypt Later" attacks
- Note: Quantum resistance applies to XMTP messaging only, NOT to Venice AI calls

### NOT Implemented (Do Not Claim)
- Encryption-at-rest for IndexedDB vault (planned)
- End-to-end encryption for Venice AI requests (not E2EE — text sent over HTTPS but not E2E encrypted)
- "Your data never leaves your device" (it does when you send text for AI via Venice)

## Data Flow (The Thinking Loop)
1. User writes daily thinking → saved locally in IndexedDB (instant)
2. User clicks "Think with me" → current entry + memory pins + recent context sent to server → forwarded to Venice AI
3. AI analyzes, connects to past entries, surfaces patterns → structured insight returned
4. Insight saved locally → knowledge base compounds over time
5. Nothing syncs by default unless user exports

## Research Zone Modes
1. **Brave Mode**: Privacy-first web search via Brave API, synthesized by Venice AI. Requires `BRAVE_API_KEY` secret.
2. **Web Mode**: Venice AI's built-in web search with source citations.
3. **Explain Mode**: AI knowledge synthesis without live web search.

## External Dependencies
- **Livepeer**: Decentralized video storage and playback (requires `LIVEPEER_API_KEY`).
- **Venice AI**: Privacy-first AI processing with no data retention.
- **Brave Search API**: Privacy-first web search (requires `BRAVE_API_KEY`).
- **RainbowKit**: Wallet connection UI.
- **wagmi/viem**: Blockchain interactions.
- **Dexie**: IndexedDB wrapper for local-first storage.
- **Zod**: Schema validation.
- **Radix UI**: Frontend component library.
- **Tailwind CSS**: Styling.
- **Vite**: Frontend build tool.
- **Express.js**: Backend web framework.
- **TanStack Query**: Server state management.
- **Wouter**: Client-side routing.
- **@xmtp/agent-sdk**: XMTP agent.
- **@paragraph-com/sdk**: Paragraph newsletter integration.
- **Framer Motion**: Animations.

## GitHub Repository
`github.com/UsernameDAOEth/djzs-box`
