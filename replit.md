# DJZS Box - Private, Local-First AI Journaling & Research Vault

## Overview
DJZS Box is a private, local-first AI journaling partner and research vault. Your writing is stored locally on your device by default (IndexedDB via Dexie), and you control what gets sent to AI. The AI supports reflection through prompts, pattern spotting, and synthesis — and you decide what to keep. The 2026 scope focuses exclusively on journal + research functionality (not chat/messaging/trading).

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend
- **Technology Stack**: React 18 with TypeScript, Vite.
- **UI**: Radix UI components with Tailwind CSS (dark theme, purple accents).
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

### XMTP Agent
- **SDK**: `@xmtp/agent-sdk` for autonomous agents.
- **Agent File**: `server/agent.ts` listens to XMTP messages.
- **Commands**: `/help`, `/zones`.

### Key Features
- **Journal Zone**: Daily reflections with AI thinking partner, memory pinning, context-aware insights.
- **Research Zone**: Brave Mode (privacy-first search), Web Mode (Venice AI web search), Explain Mode (AI knowledge synthesis). Dossiers, claim tracking with trust levels, cross-zone linking to journal entries.
- **Local-First Storage**: All data stored in browser IndexedDB. Works offline for writing/browsing.
- **Offline Support**: Service worker caches static assets.

## Privacy Claims (What's True)

### Implemented
- Local-first storage via IndexedDB (Dexie)
- User control over AI (only sent when you click "Think with me")
- Offline-capable journaling (AI/research requires internet)
- Venice AI claims no data retention
- Brave Search claims no tracking/profiling

### NOT Implemented (Do Not Claim)
- Encryption-at-rest for IndexedDB vault (planned)
- End-to-end encryption for AI requests (not E2EE)
- "Quantum-resistant encryption" (not implemented)
- "Your data never leaves your device" (it does when you send text for AI)

## Data Flow
1. User writes entry → saved locally in IndexedDB (instant)
2. User clicks "Think with me" → selected entry + pins sent to server → forwarded to Venice AI
3. AI response → returned to client → saved locally
4. Nothing syncs by default unless user exports

## Research Zone Modes
1. **Brave Mode**: Privacy-first web search via Brave API, synthesized by Venice AI. Requires `BRAVE_API_KEY` secret.
2. **Web Mode**: Venice AI's built-in web search with source citations.
3. **Explain Mode**: AI knowledge synthesis without live web search.

## External Dependencies
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
