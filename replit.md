# DJZS Chat - E2E Encrypted Web3 Community Platform

## Overview

DJZS Chat is a members-only, end-to-end encrypted chat application where ENS domains serve as user identities. Built on Base blockchain, it uses XMTP protocol for encrypted messaging and supports structured message cards for trade signals, prediction markets, event coordination, and payment receipts. Access is controlled via NFT ownership or allowlist membership.

## User Preferences

Preferred communication style: Simple, everyday language.

## YC Messaging Copy

**One-liner:**
> DJZS is a private, local-first AI journaling partner that helps you think more clearly.

**If asked to expand:**
> It's an AI journaling partner, but the key difference is that it doesn't generate content or save memory automatically. It helps users reflect on their own thinking and build insight through daily habit.

**Product description:**
> DJZS is an AI journaling partner for thinking and research. It creates a private space where users can process ideas, track patterns in their thinking, and develop clarity—without the AI taking over.

**Public language:** AI journaling partner (always pair with thinking/clarity/local-first language)

**Internal language:** Thinking partner, Intelligence companion, The Zone Agent

**Avoid:** AI therapist, AI coach, AI analyst, AI memory system, second brain

## System Architecture

### Frontend Architecture

**Technology Stack**: React 18 with TypeScript, built using Vite for fast development.

**UI Framework**: Radix UI components with Tailwind CSS. Dark theme with purple accent colors.

**Routing**: Wouter provides client-side routing:
- `/` - Landing page with feature overview and wallet connection
- `/chat` - Main chat interface (members-only)
- `/docs` - Documentation page (purpose, philosophy, technical stack)
- `*` - 404 fallback

**State Management**: React hooks for local state, TanStack Query for server state.

**Component Structure**:
- **Pages**: Home (landing), Chat (main interface), NotFound
- **Chat Components**: MessageCards (renders all card types), TradeComposer, PredictionComposer, EventComposer, PaymentComposer, NewsletterComposer
- **UI Components**: shadcn/Radix UI components in `client/src/components/ui/`

### Backend Architecture

**Server Framework**: Express.js with TypeScript.

**API Design**: RESTful endpoints prefixed with `/api`:
- `GET/POST /api/members` - Member management
- `GET/POST /api/rooms` - Room CRUD
- `POST /api/payments` - Payment receipt storage

**Storage Interface**: In-memory storage with CRUD for members, rooms, and payment receipts. Default rooms seeded on startup: Members Lounge, Trades, Predictions, Events, Payments.

### Messaging Layer (XMTP)

**Protocol**: XMTP browser-sdk for E2E encrypted messaging.

**Identity**: Wallet address serves as XMTP identity. ENS names displayed as usernames.

**Message Types**: Structured JSON messages with Zod validation:
- `text` - Plain text messages
- `trade_signal` - Trade setups with entry, TP, invalidation
- `prediction` - YES/NO voting questions with end dates
- `event` - Calendar events with RSVP
- `payment_receipt` - On-chain payment confirmations
- `announcement` - Admin announcements with priority
- `newsletter` - Paragraph newsletter article shares

### Web3 Integration

**Wallet Connection**: RainbowKit for wallet UI. Configured for Base mainnet and Base Sepolia.

**ENS Resolution**: Custom hook (`useDisplayName`) fetches ENS names from Ethereum mainnet via public RPC.

**Payment Integration**: Direct ETH transfers via wagmi's `useSendTransaction`. USDC support planned.

**Membership Gating**: Checks `isAllowlisted` or `isAdmin` flags on member records. Optional NFT ownership verification available.

### Database Schema

**Members Table**:
- `id`, `address` (unique), `ensName`, `xHandle`, `xLinkSignature`
- `isAdmin`, `isAllowlisted`, `createdAt`

**Rooms Table**:
- `id`, `name`, `description`, `xmtpGroupId`, `isDefault`, `createdAt`

**Payment Receipts Table**:
- `id`, `chainId`, `tokenSymbol`, `amount`, `fromAddress`, `toAddress`
- `txHash` (unique), `roomId`, `note`, `verified`, `createdAt`

### Message Card Schemas (Zod)

All message types validated with discriminated union schema:

```typescript
tradeSignalCardSchema // asset, direction, entry, tp[], invalidation
predictionCardSchema  // question, endsAt, outcomes
eventCardSchema       // title, startsAt, locationOrLink, description
paymentReceiptCardSchema // chainId, tokenSymbol, amount, to, txHash
announcementCardSchema // title, body, priority
newsletterArticleSchema // postId, title, slug, publicationSlug, excerpt
textMessageSchema     // content
```

### XMTP Agent Integration

**SDK**: `@xmtp/agent-sdk` for building autonomous zone agents.

**Agent File**: `server/agent.ts` - Listens to XMTP messages and responds with commands.

**x402 API Helper**: `server/x402-api.ts` - Server-side module for Trade Zone API calls.

**Available Commands**:
- `/help` — List available commands
- `/zones` — Display all DJZS zones
- `/format signal` — Show signal format template
- `/summarize` — Trigger zone activity summary (in progress)

**Trade Zone Commands** (integrated with x402 API):
- `/price ETH` — Get current token price
- `/portfolio 0x...` — View wallet holdings and total value
- `/balance 0x...` — Get token balances
- `/analyze 0x...` — Trading pattern analysis (win rate, risk score)
- `/pnl 0x... [30d]` — Profit/loss report with timeframe
- `/quote 100 USDC to ETH` — Get swap quote without execution

**Running the Agent**:
```bash
npm run agent
```

**Features**:
- Responds to text messages with helpful info
- Validates and formats user inputs
- Extensible for custom automation
- Runs separately from main app

### Paragraph Newsletter Integration

**SDK**: `@paragraph-com/sdk` for fetching publication data.

**API Endpoints**:
- `GET /api/paragraph/publications/:slug` - Get publication info
- `GET /api/paragraph/publications/:slug/posts` - List posts with content
- `GET /api/paragraph/publications/:pubSlug/posts/:postSlug` - Get single post

**Features**:
- Search publications by slug (e.g., @djzs)
- Browse and select articles to share
- Rich article cards with image, title, excerpt, and direct link

## Key Features

### Trade Signals
- Post long/short setups with entry, stop-loss, and multiple TP targets
- Optional timeframe and leverage indicators
- Status updates (hit_tp, invalidated, closed)

### Predictions
- YES/NO voting with deadline
- Member voting tracked per prediction

### Events
- Date/time, location/link, description
- RSVP functionality (going, maybe, can't)

### Payments
- ETH transfers directly from chat
- Automatic receipt generation with tx hash
- Basescan link for verification

### Membership
- Wallet-based identity with ENS display
- Admin and allowlist membership tiers
- Self-registration flow

## Environment Configuration

Required environment variables:
- `DATABASE_URL`: PostgreSQL connection string
- `VITE_WALLETCONNECT_PROJECT_ID`: WalletConnect cloud project ID
- `VITE_MEMBERSHIP_NFT_ADDRESS`: Optional NFT contract for gating
- `VITE_CHAIN_ID`: Target chain ID (8453 for Base mainnet)
- `VITE_RPC_URL`: Custom RPC URL (optional)
- `PARAGRAPH_API_KEY`: Optional Paragraph API key for accessing draft/private posts

## Development

**Start Server**: `npm run dev` - Runs Express + Vite on port 5000

**File Structure**:
```
client/src/
  pages/           # Home, Chat, NotFound
  components/
    chat/          # Message cards, composers
    ui/            # shadcn components
  hooks/           # useEns, useXmtp
  lib/             # wagmi-config, xmtp, queryClient, vault (Dexie IndexedDB)
server/
  routes.ts        # API endpoints
  agent.api.ts     # Venice AI agent endpoint
  storage.ts       # In-memory storage
shared/
  schema.ts        # Types, Zod schemas, Drizzle tables
```

## Recent Changes

- **Jan 08, 2026**: Wired Trade Zone to user-pays micropayment model
  - Trade Zone now uses connected wallet directly for x402 micropayments (no server-side wallet needed)
  - User's wallet signs micropayments for API calls - aligns with DJZS philosophy "your data, your costs"
  - x402Client created with walletClient from useWalletClient(), recreated on account/chain changes
  - Added analyzeWallet() and getPnLReport() functions to x402-client.ts
  - Token lookup uses searchToken() as fallback for non-hardcoded tokens
  - Micropayments info banner explains the user-pays model
  - Quick commands: Portfolio, Balances, Analyze, PnL, ETH Price
  - Limit orders marked as "coming soon"
- **Jan 01, 2026**: Built Trade Zone with x402 integration
  - New Trade Zone component (`client/src/components/chat/trade-zone.tsx`)
  - x402 client wrapper (`client/src/lib/x402-client.ts`) for swap, portfolio, balance, price
  - Natural language command parsing (swap X to Y, portfolio, balance, price ETH)
  - Quote confirmation flow before swap execution
  - TradeRecord schema in vault.ts for local trade history storage
  - Integrated Trade Zone into chat page with zone tab switching
  - Updated docs page to include Trade Zone information
- **Dec 28, 2024**: Refined thinking partner to be calm, precise, minimal
  - Updated agent prompt to match "calm, precise thinking partner" philosophy
  - Expanded forbidden phrases (no "I think you should", "as an AI", etc.)
  - Conservative memory suggestions (almost never suggest unless repeated pattern)
  - Changed header from "Username DJZS" to "Thinking Partner"
  - No first-person references, no advice unless asked
- **Dec 28, 2024**: Implemented local-first "Think with me" flow
  - New Dexie IndexedDB vault module (`client/src/lib/vault.ts`) with entries, insights, and memoryPins stores
  - `/api/agent/analyze` endpoint with Venice AI structured JSON responses
  - Agent response card with said/matters/nextMove/question format
  - Memory suggestion UI with Pin/Skip buttons
  - "You don't need to resolve this now" closing line (uncertainty philosophy)
  - Sidebar shows local memories with kind badges and Forget option
  - Past Entries list uses local IndexedDB data
  - Main button changed from "Generate Insight" to "Think with me"
- **Dec 28, 2024**: Added PWA support for mobile installation
  - Web app manifest with icons and theme colors
  - Service worker for offline caching
  - Install prompt component for Android and iOS
  - App can be installed to home screen on mobile devices
- **Dec 28, 2024**: Implemented zone-aware Venice AI analysis
  - Research mode uses Key Claims/Evidence/Unknowns/Next Question format
  - Journal mode uses Summary/Insight/Reflection Question format
  - Zone parameter passed to /api/journal/analyze endpoint
- **Dec 24, 2024**: Added XMTP Agent SDK
  - New autonomous agent in `server/agent.ts`
  - Agent responds to commands: /help, /zones, /format, /summarize
  - Extensible for future zone automation
  - Run with `npm run agent`
- **Dec 24, 2024**: Updated UI terminology and styling
  - Changed "Rooms" → "Zones", "Messages" → "Zone Feed", "Composer" → "Zone Actions"
  - Added "Your Zones" section to landing page after wallet connection
  - Improved visual consistency between landing page and chat interface
  - Added vertical zone flow diagram on landing page
- **Dec 21, 2024**: Added Paragraph newsletter integration
  - New `newsletter` message type for sharing articles in chat
  - Backend API endpoints to fetch publications and posts
  - NewsletterComposer component for searching and selecting articles
  - Rich article cards with images, excerpts, and direct links
- **Dec 2024**: Complete rebuild from newsletter to chat platform
- Implemented XMTP browser-sdk integration
- Created structured message card system
- Built trade, prediction, event, and payment composers
- Added ENS resolution for user display names
- Implemented member registration and gating
