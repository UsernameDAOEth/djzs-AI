# DJZS Chat - E2E Encrypted Web3 Community Platform

## Overview

DJZS Chat is a members-only, end-to-end encrypted chat application where ENS domains serve as user identities. Built on Base blockchain, it uses XMTP protocol for encrypted messaging and supports structured message cards for trade signals, prediction markets, event coordination, and payment receipts. Access is controlled via NFT ownership or allowlist membership.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Technology Stack**: React 18 with TypeScript, built using Vite for fast development.

**UI Framework**: Radix UI components with Tailwind CSS. Dark theme with purple accent colors.

**Routing**: Wouter provides client-side routing:
- `/` - Landing page with feature overview and wallet connection
- `/chat` - Main chat interface (members-only)
- `*` - 404 fallback

**State Management**: React hooks for local state, TanStack Query for server state.

**Component Structure**:
- **Pages**: Home (landing), Chat (main interface), NotFound
- **Chat Components**: MessageCards (renders all card types), TradeComposer, PredictionComposer, EventComposer, PaymentComposer
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
textMessageSchema     // content
```

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
  lib/             # wagmi-config, xmtp, queryClient
server/
  routes.ts        # API endpoints
  storage.ts       # In-memory storage
shared/
  schema.ts        # Types, Zod schemas, Drizzle tables
```

## Recent Changes

- **Dec 2024**: Complete rebuild from newsletter to chat platform
- Implemented XMTP browser-sdk integration
- Created structured message card system
- Built trade, prediction, event, and payment composers
- Added ENS resolution for user display names
- Implemented member registration and gating
