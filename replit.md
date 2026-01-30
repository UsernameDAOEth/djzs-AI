# DJZS Chat - E2E Encrypted Web3 Community Platform

## Overview
DJZS Chat is a members-only, end-to-end encrypted chat application leveraging ENS domains for user identities on the Base blockchain. It utilizes the XMTP protocol for secure messaging and supports structured message cards for various functionalities like trade signals, prediction markets, event coordination, and payment receipts. Access is governed by NFT ownership or allowlist membership. The project aims to be a private, local-first AI journaling partner that helps users achieve clarity in their thinking, acting as a "thinking partner" or "intelligence companion."

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend
- **Technology Stack**: React 18 with TypeScript, Vite.
- **UI**: Radix UI components with Tailwind CSS (dark theme, purple accents).
- **Routing**: Wouter for client-side navigation (`/`, `/chat`, `/docs`, `*`).
- **State Management**: React hooks for local state, TanStack Query for server state.
- **Component Structure**: Organized by pages (Home, Chat, NotFound) and specific chat/UI components.

### Backend
- **Framework**: Express.js with TypeScript.
- **API**: RESTful endpoints (`/api/members`, `/api/rooms`, `/api/payments`).
- **Storage**: In-memory storage for members, rooms, and payment receipts, pre-seeded with default rooms.

### Messaging Layer (XMTP)
- **Protocol**: XMTP browser-sdk for E2E encrypted messaging.
- **Identity**: Wallet address as XMTP identity; ENS names displayed.
- **Message Types**: Structured JSON messages with Zod validation, including `text`, `trade_signal`, `prediction`, `event`, `payment_receipt`, `announcement`, and `newsletter`.

### Web3 Integration
- **Wallet Connection**: RainbowKit (Base mainnet and Base Sepolia).
- **ENS Resolution**: Custom hook (`useDisplayName`) resolves ENS names via public RPC.
- **Payment Integration**: Direct ETH transfers via wagmi's `useSendTransaction`.
- **Membership Gating**: Checks `isAllowlisted` or `isAdmin` flags, with optional NFT ownership verification.

### Database Schema (Conceptual)
- **Members**: `id`, `address`, `ensName`, `isAdmin`, `isAllowlisted`, `createdAt`.
- **Rooms**: `id`, `name`, `description`, `xmtpGroupId`, `isDefault`, `createdAt`.
- **Payment Receipts**: `id`, `chainId`, `tokenSymbol`, `amount`, `fromAddress`, `toAddress`, `txHash`, `roomId`, `note`, `verified`, `createdAt`.

### XMTP Agent Integration
- **SDK**: `@xmtp/agent-sdk` for autonomous agents.
- **Agent File**: `server/agent.ts` listens to XMTP messages and responds to commands.
- **Commands**: `/help`, `/zones`, `/format signal`, `/summarize`.
- **Trade Zone Commands**: `/price ETH`, `/portfolio 0x...`, `/balance 0x...`, `/analyze 0x...`, `/pnl 0x... [30d]`, `/quote 100 USDC to ETH`.

### Key Features
- **Trade Signals**: Post long/short setups with entry, stop-loss, TP targets, timeframe, leverage, and status updates.
- **Predictions**: YES/NO voting with deadlines and member tracking.
- **Events**: Calendar events with RSVP functionality.
- **Payments**: In-chat ETH transfers with automatic receipt generation and Basescan links.
- **Membership**: Wallet-based identity, admin/allowlist tiers, self-registration.

## Project Roadmap & PMF Strategy

### Core Product Promise
"Private, local-first journal + research vault that only calls AI when you ask."

### Immediate Priorities (PMF Growth)
1.  **Proof of Value**: Add a 60-90 second demo video or GIF showing the "Write → Ask → Insight → Save" loop. Highlight the "Saved instantly / Offline" moment as key differentiation.
2.  **Frictionless Onboarding**: Implement a "Try it in 2 minutes" flow that bypasses lore/setup for immediate utility.
3.  **Retention Metric**: Track "3 entries in 7 days" as the primary early signal for Product-Market Fit.

### Future Tasks
- [ ] Create GitHub repository (Remind user later)
- [ ] Implement demo video/GIF on landing page
- [ ] Build "Try it in 2 minutes" entry point

## Security & Privacy

### Privacy Stack
DJZS is built on three pillars of privacy:

1. **Local-first Storage**: All journal entries and research are stored in IndexedDB on the user's device. Works fully offline. No centralized database.

2. **Quantum-Resistant End-to-End Encryption (XMTP)**:
   - Hybrid encryption combining post-quantum algorithms with proven conventional cryptography
   - Protection against "harvest now, decrypt later" (HNDL) attacks from future quantum computers
   - Messages are E2E encrypted by default — only participants can read them

3. **Decentralized AI (Venice AI)**:
   - Privacy-first AI infrastructure with no data retention
   - User prompts are never stored or used to train models
   - No content filtering, uncensored responses
   - OpenAI-compatible API

### Data Flow
- User writes entry → stored locally in IndexedDB
- "Think with me" → current entry + memory pins sent to Venice AI
- AI response → stored locally as insight
- Nothing syncs unless user explicitly chooses

## External Dependencies
- **XMTP Protocol**: For quantum-resistant end-to-end encrypted messaging.
- **Venice AI**: For privacy-first, decentralized AI processing with no data retention.
- **RainbowKit**: For wallet connection UI.
- **wagmi**: For blockchain interactions and sending transactions.
- **Zod**: For schema validation of structured messages.
- **Radix UI**: Frontend component library.
- **Tailwind CSS**: For styling.
- **Vite**: Frontend build tool.
- **Express.js**: Backend web application framework.
- **TanStack Query**: For server state management.
- **Wouter**: Client-side routing library.
- **@xmtp/agent-sdk**: For building autonomous agents.
- **@paragraph-com/sdk**: For integrating Paragraph newsletter data.
- **x402 protocol**: For user-pays micropayment model in the Trade Zone.