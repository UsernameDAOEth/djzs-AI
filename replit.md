# DJZS - Your Daily Thinking System

## Overview
DJZS is a cognitive operating system that turns daily thinking into structured insight through an AI thinking partner. It is not a journal — it's a thinking system designed to compound intelligence over time. Three zones (Journal, Research, Thinking Partner) form one loop: write → AI analyzes and connects → insights compound. Local-first storage (IndexedDB via Dexie), user-controlled AI, and privacy by default. Built for founders, traders, content creators, researchers, and systems thinkers who want cognitive leverage.

## Strategic Positioning
- **Category**: Daily thinking system / cognitive infrastructure (NOT journaling)
- **Value prop**: "Sharpen your thinking daily" — not "Remember your life beautifully"
- **Target users**: Founders, traders (crypto analysts, DeFi researchers), content creators, builders, researchers, systems thinkers
- **NOT for**: Casual diary-keeping, photo memories, lifestyle journaling, emotional reflection
- **Competition**: Scattered notes, browser bookmarks, unstructured thinking (NOT other journal apps)
- **Moat**: Making users measurably more intelligent through daily use

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

### Key Features (Three Zones, One Loop)
- **Journal Zone**: Write daily thinking → AI auto-summarizes and extracts structured insights (key claims, patterns, open questions). Memory pinning carries context forward. Video entries via Livepeer.
- **Research Zone**: Save articles/links → AI synthesizes research with journal entries. Brave Mode (privacy-first search), Web Mode (Venice AI web search), Explain Mode (AI knowledge synthesis). Dossiers, claim tracking with trust levels, cross-zone linking.
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
