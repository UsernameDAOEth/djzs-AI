# DJZS Box

A private, local-first AI journaling partner and members-only encrypted chat platform on Base blockchain. Your data stays on your device with end-to-end, quantum-resistant encryption via XMTP.

## Overview

DJZS Box combines two core experiences:

**1. Private Journaling & Research**
- Write journal entries with AI-powered insights via Venice AI
- Privacy-first web research with Brave Search integration
- Local-first storage in IndexedDB - works fully offline

**2. Members-Only Encrypted Chat**
- E2E encrypted messaging via XMTP protocol
- Wallet-based identity with ENS name resolution
- NFT/allowlist gated access on Base blockchain
- Structured message cards for trade signals, predictions, events, and payments

## Features

### Journaling Zone
- **Local-First Storage** - All entries stored in IndexedDB on your device
- **Venice AI Integration** - Privacy-first AI thinking partner with no data retention
- **Memory Pins** - Pin important insights for context in future conversations
- **Offline Support** - Works without internet connection

### Research Zone
- **Brave Search** - Privacy-preserving web search (no tracking)
- **Web Mode** - Venice AI's built-in web search with source citations
- **Explain Mode** - AI knowledge synthesis without web search

### Chat Zone
- **Trade Signals** - Post long/short setups with entry, stop-loss, TP targets, leverage
- **Predictions** - YES/NO voting with deadlines and member tracking
- **Events** - Calendar events with RSVP functionality
- **Payments** - In-chat ETH transfers with automatic receipt generation
- **Announcements** - Broadcast messages to all members

### XMTP Agent Commands
- `/help` - Show available commands
- `/zones` - List available zones
- `/price ETH` - Get current token price
- `/portfolio 0x...` - View wallet portfolio
- `/balance 0x...` - Check wallet balance
- `/analyze 0x...` - Analyze wallet activity

### Membership & Access
- **Wallet Authentication** - Sign in via RainbowKit (Base mainnet & Sepolia)
- **NFT Gating** - Optional NFT ownership verification for access
- **Allowlist** - Admin-managed member allowlist
- **Admin Controls** - Mute/unmute and remove members

## Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- MetaMask or another Web3 wallet

### Installation

1. Clone the repository:
```bash
git clone https://github.com/UsernameDAOEth/djzs-box.git
cd djzs-box
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables (copy `.env.example` to `.env`)

4. Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5000`

## Environment Variables

```env
# Required - Venice AI for journaling insights
VENICE_API_KEY=your_venice_api_key

# Optional - Privacy-first web search
BRAVE_API_KEY=your_brave_api_key

# Optional - Advanced AI models
REDPILL_API_KEY=your_redpill_api_key

# Optional - Newsletter integration
PARAGRAPH_API_KEY=your_paragraph_api_key

# Web3 Configuration
BASE_RPC_URL=https://mainnet.base.org

# X402 Micropayments (optional - for paid insights)
DJZS_PAY_TO_WALLET=your_wallet_address
X402_NETWORK=eip155:84532
```

## API Endpoints

### Core APIs
| Endpoint | Description |
|----------|-------------|
| `GET /api/health` | Service health and capabilities check |
| `GET /api/members` | List all members |
| `GET /api/members/:address` | Get member by wallet address |
| `POST /api/members` | Register new member |
| `GET /api/rooms` | List chat rooms |
| `POST /api/rooms` | Create new room |
| `GET /api/messages/:roomId` | Get messages for a room |
| `POST /api/messages` | Send a message |
| `POST /api/payments` | Create payment receipt |
| `GET /api/payments/:txHash` | Get payment by transaction hash |

### Admin APIs
| Endpoint | Description |
|----------|-------------|
| `POST /api/admin/mute/:address` | Mute a member (requires signature) |
| `POST /api/admin/unmute/:address` | Unmute a member (requires signature) |
| `POST /api/admin/remove/:address` | Remove a member (requires signature) |
| `POST /api/verify-nft` | Verify NFT ownership for gating |

### Research & AI
| Endpoint | Description |
|----------|-------------|
| `GET /api/research/search` | Research synthesis with web search |
| `POST /api/journal/analyze` | Analyze journal entry with AI |
| `POST /djzs/insight` | Generate AI insight (x402 micropayment) |

### Integrations
| Endpoint | Description |
|----------|-------------|
| `GET /api/github/status` | GitHub connection status |
| `GET /api/github/repos` | List connected GitHub repos |
| `GET /api/paragraph/publications/:slug` | Get Paragraph newsletter |

## Tech Stack

### Frontend
- React 18 + TypeScript + Vite
- Radix UI + Tailwind CSS (dark theme, purple accents)
- Wouter for routing
- TanStack Query for server state

### Backend
- Express.js + TypeScript
- In-memory storage (local-first design)
- Zod for validation

### Web3 & Messaging
- RainbowKit + wagmi for wallet connection
- XMTP browser-sdk for E2E encrypted messaging
- Base blockchain (mainnet & Sepolia)
- x402 protocol for micropayments

### Privacy Stack
- **Venice AI** - No data retention, uncensored responses
- **Brave Search** - No tracking, independent index
- **XMTP** - Quantum-resistant E2E encryption
- **IndexedDB** - Local-first storage on device

## Security & Privacy

DJZS Box is built on three pillars of privacy:

1. **Local-First** - Journal entries and research stored on your device, not servers
2. **E2E Encryption** - XMTP's quantum-resistant encryption for all messages
3. **Privacy-First AI** - Venice AI processes prompts without storing them

Your data only leaves your device when you explicitly choose to share it.

## License

MIT

---

Built with privacy in mind.
