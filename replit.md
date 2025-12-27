# DJZS - Decentralized Journaling Zone System

## Overview

DJZS is a Zone-based operating system for private knowledge management, coordination, and agents. Built on Base blockchain with XMTP protocol for end-to-end encryption, it organizes activity into Zones — private, encrypted spaces that accumulate knowledge, decisions, and history over time. Each Zone supports structured entries (Notes, Signals, Predictions, Events, Receipts, Articles) and optional AI assistance. Access is controlled via NFT ownership or allowlist membership.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Technology Stack**: React 18 with TypeScript, built using Vite for fast development.

**UI Framework**: Radix UI components with Tailwind CSS. Dark theme with purple accent colors.

**Routing**: Wouter provides client-side routing:
- `/` - Landing page with feature overview and wallet connection
- `/chat` - Main Zone interface (members-only)
- `*` - 404 fallback

**State Management**: React hooks for local state, TanStack Query for server state.

**Component Structure**:
- **Pages**: Home (landing), Chat (Zone interface), NotFound
- **Zone Components**: MessageCards (Zone Cards for all entry types), TradeComposer, PredictionComposer, EventComposer, PaymentComposer, NewsletterComposer
- **UI Components**: shadcn/Radix UI components in `client/src/components/ui/`

### Backend Architecture

**Server Framework**: Express.js with TypeScript.

**API Design**: RESTful endpoints prefixed with `/api`:
- `GET/POST /api/members` - Member management
- `GET/POST /api/rooms` - Zone CRUD (internal: still uses "rooms" for backwards compatibility)
- `POST /api/messages` - Zone entry creation

**Storage Interface**: In-memory storage with CRUD for members, zones, and entries. Default zones seeded on startup: User Zone, Signals, Predictions, Events, Receipts.

### Messaging Layer (XMTP)

**Protocol**: XMTP browser-sdk for E2E encrypted entries.

**Identity**: Wallet address serves as XMTP identity. ENS names displayed prominently as usernames.

**Entry Types**: Structured JSON entries with Zod validation:
- `text` (Note) - Private notes, research, and reflections
- `trade_signal` (Signal) - Trade setups with entry, TP, invalidation
- `prediction` - YES/NO voting questions with end dates
- `event` - Calendar events with RSVP
- `payment_receipt` (Receipt) - On-chain payment confirmations
- `announcement` - Admin announcements with priority
- `newsletter` (Article) - Paragraph newsletter article shares

### Web3 Integration

**Wallet Connection**: RainbowKit for wallet UI. Configured for Base mainnet and Base Sepolia.

**ENS Resolution**: Custom hook (`useDisplayName`) fetches ENS names from Ethereum mainnet via public RPC. ENS names displayed as primary identity (bold), wallet addresses as secondary.

**Payment Integration**: Direct ETH transfers via wagmi's `useSendTransaction`. USDC support planned.

**Membership Gating**: Checks `isAllowlisted` or `isAdmin` flags on member records. Optional NFT ownership verification available.

### Database Schema

**Members Table**:
- `id`, `address` (unique), `ensName`, `xHandle`, `xLinkSignature`
- `isAdmin`, `isAllowlisted`, `createdAt`

**Rooms Table** (Zones):
- `id`, `name`, `description`, `xmtpGroupId`, `isDefault`, `createdAt`

**Payment Receipts Table**:
- `id`, `chainId`, `tokenSymbol`, `amount`, `fromAddress`, `toAddress`
- `txHash` (unique), `roomId`, `note`, `verified`, `createdAt`

### Entry Card Schemas (Zod)

All entry types validated with discriminated union schema:

```typescript
tradeSignalCardSchema // asset, direction, entry, tp[], invalidation
predictionCardSchema  // question, endsAt, outcomes
eventCardSchema       // title, startsAt, locationOrLink, description
paymentReceiptCardSchema // chainId, tokenSymbol, amount, to, txHash
announcementCardSchema // title, body, priority
newsletterArticleSchema // postId, title, slug, publicationSlug, excerpt
textMessageSchema     // content (Note)
```

### XMTP Agent Integration

**SDK**: `@xmtp/agent-sdk` for building autonomous Zone agents.

**Agent File**: `server/agent.ts` - Listens to XMTP messages and responds with commands.

**Available Commands**:
- `/help` — List available commands
- `/zones` — Display all DJZS zones
- `/format signal` — Show signal format template
- `/summarize` — Trigger zone activity summary (in progress)

**Running the Agent**:
```bash
npm run agent
```

**Features**:
- Responds to entries with helpful info
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

### Notes
- Private notes, research, and reflections
- Encrypted end-to-end with XMTP
- Displayed as Note Cards in Zone Feed

### Signals
- Post long/short setups with entry, stop-loss, and multiple TP targets
- Optional timeframe and leverage indicators
- Status updates (hit_tp, invalidated, closed)

### Predictions
- YES/NO voting with deadline
- Member voting tracked per prediction
- Resolved outcomes visible in Zone

### Events
- Date/time, location/link, description
- RSVP functionality (going, maybe, can't)

### Receipts
- ETH transfers directly from Zone
- Automatic receipt generation with tx hash
- Basescan link for verification

### Membership
- Wallet-based identity with ENS as primary display
- Admin and allowlist membership tiers
- Self-registration flow

## UI Terminology

| Old Term | New Term |
|----------|----------|
| Chat | Zone |
| Room | Zone |
| Message | Entry / Zone Entry |
| Text | Note |
| Trade | Signal |
| Payment | Receipt |
| Messages | Zone Feed |
| Composer | Action Dock / Zone Actions |

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
  pages/           # Home, Chat (Zone interface), NotFound
  components/
    chat/          # Zone Cards, composers (Action Dock)
    ui/            # shadcn components
  hooks/           # useEns, useXmtp
  lib/             # wagmi-config, xmtp, queryClient
server/
  routes.ts        # API endpoints
  storage.ts       # In-memory storage
shared/
  schema.ts        # Types, Zod schemas, Drizzle tables
```

## Recent Changes

- **Dec 27, 2024**: UX Polish and Productivity Features
  - Added skeleton loading states for Zone Feed (replaces spinner)
  - Added staggered fade-in animations for Zone entries
  - Implemented contextual toast messages with type-specific emojis (📝📊🎯📅✅📰)
  - Added keyboard shortcuts: 1-5 for zones, m for memory drawer, n/s/p for entry types
  - Added keyboard shortcut hints to sidebar (visible on hover)
  - Zone cards now have consistent hover effects with type-specific border colors
  - Renamed zones for consistency: "Trades"→"Signals", "Payments"→"Receipts"
- **Dec 27, 2024**: Comprehensive Zone-centric UI overhaul
  - Updated landing page with Zone-first terminology: "Private. Structured. Yours."
  - Renamed all UI elements: Rooms→Zones, Messages→Zone Feed, Composer→Zone Actions
  - Added Zone Header bar with security indicators (Encrypted, Gated, Agent Active)
  - Transformed message bubbles into Zone Cards with type badges and ENS-first author display
  - Upgraded bottom composer into Action Dock with categorized tabs (Note, Signal, Prediction, Event, Receipt, Article)
  - Added Zone Memory drawer with search, pinned items placeholder, and activity counts
  - Applied premium styling: tooltips on Zones, contextual empty states, left sidebar System section
- **Dec 24, 2024**: Added XMTP Agent SDK
  - New autonomous agent in `server/agent.ts`
  - Agent responds to commands: /help, /zones, /format, /summarize
  - Extensible for future zone automation
  - Run with `npm run agent`
- **Dec 21, 2024**: Added Paragraph newsletter integration
  - New `newsletter` entry type for sharing articles in Zones
  - Backend API endpoints to fetch publications and posts
  - NewsletterComposer component for searching and selecting articles
  - Rich article cards with images, excerpts, and direct links
- **Dec 2024**: Complete rebuild as Zone-based operating system
- Implemented XMTP browser-sdk integration
- Created structured Zone Card system
- Built Signal, Prediction, Event, and Receipt composers
- Added ENS resolution for user display names
- Implemented member registration and gating
