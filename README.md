# DJZS Box

A private, local-first AI journaling partner and research vault. Your data stays on your device with end-to-end, quantum-resistant encryption.

## Overview

DJZS Box is an **AI journaling partner for thinking and research**. It creates a private space where you can process ideas, track patterns in your thinking, and develop clarity — without the AI taking over.

Unlike traditional journaling apps that store your data on remote servers, or AI assistants that generate content for you, DJZS is built on a different philosophy: **your thinking should stay yours**.

The AI doesn't generate content or save memory automatically. It helps you reflect on your own thinking and build insight through daily habit.

## Features

### Journal Zone

Your private space to think, reflect, and achieve clarity with an AI thinking partner.

- **Deep Reasoning** — AI analyzes patterns, connections, and blind spots
- **Reflective Questions** — Powerful questions to deepen your thinking
- **Memory Pinning** — Save insights worth remembering long-term
- **Context Awareness** — AI considers your recent entries and pinned memories
- **Local-First Storage** — All entries stored in IndexedDB on your device
- **Venice AI Integration** — Privacy-first AI thinking partner with no data retention
- **Offline Support** — Works without internet connection

### Research Zone

Search the web for real-time data or use AI knowledge to synthesize information and track claims.

- **Brave Mode** — Privacy-first web search with no tracking or profiling, synthesized by Venice AI
- **Web Mode** — Real-time web search via Venice AI with source citations
- **Explain Mode** — AI knowledge synthesis without live data
- **Dossiers** — Organize research into named folders
- **Claim Tracking** — Save key takeaways with trust levels and status
- **Cross-Zone Linking** — Connect research claims to journal entries

## Core Principles

| Principle | Description |
|-----------|-------------|
| **Local-First** | Your entries and memories are stored on your device using IndexedDB. No server-side storage of your private thoughts. |
| **E2E Private** | Cryptographic identity via wallet connection. Your data is encrypted and only accessible to you. |
| **Thinking Partner** | The AI helps you think, not think for you. It surfaces patterns and asks questions rather than generating answers. |
| **No Surveillance** | No feeds, no tracking, no centralized memory. A tool for thinking, not a network for sharing. |
| **Memory Control** | You decide what to remember. Pin patterns worth keeping, forget what doesn't serve you. |
| **Wallet Identity** | Your wallet address is your identity. ENS names displayed for readability. No email, no password. |

## Security & Privacy

Built on three pillars of privacy:

1. **Local-First Storage** — Data stored on your device, not servers. Works fully offline.
2. **E2E Encryption** — Quantum-resistant encryption protects your data against future threats.
3. **Privacy-First AI** — Venice AI with zero data retention. Your prompts are never stored or used for training.

### Data Flow

```
You write → Saved locally (instant)
You click "Think with me" → Entry + pins sent to Venice AI
AI responds → Saved locally
Nothing syncs unless you export
```

## Web2 vs Web3: Why It Matters

Your private thoughts deserve better than Web2. DJZS combines Web3's decentralized identity (wallet login) with local-first storage (your device). Your journal entries, research, and memories are never stored on our servers. You authenticate with your wallet — no email, no password, no account to hack. Your thinking stays yours.

| | Web2 (Centralized) | Web3 (Decentralized) |
|---|---|---|
| **Identity** | Username + password for each site | 1 wallet = universal identity |
| **Data** | Stored on company servers | Stored locally or on-chain (you own it) |
| **Control** | Platform decides rules & access | You control your keys, you control access |
| **Portability** | Data trapped in walled gardens | Take your data anywhere |
| **Privacy** | Tracked, analyzed, sold to advertisers | Private by default, pseudonymous |

## Philosophy

**What DJZS Is:**
- An AI journaling partner
- A thinking partner
- A tool for clarity
- Local-first and private

**What DJZS Is Not:**
- AI therapist
- AI coach
- Memory system or "second brain"
- Content generator

## Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- MetaMask or another Web3 wallet

### Installation

```bash
git clone https://github.com/UsernameDAOEth/djzs-box.git
cd djzs-box
npm install
npm run dev
```

The app will be available at `http://localhost:5000`

## Environment Variables

```env
# Required — Venice AI for journaling insights
VENICE_API_KEY=your_venice_api_key

# Optional — Privacy-first web search
BRAVE_API_KEY=your_brave_api_key

# Web3 Configuration
BASE_RPC_URL=https://mainnet.base.org
```

## Tech Stack

| Category | Technologies |
|----------|-------------|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, Radix UI, Framer Motion |
| **State & Data** | TanStack Query, Dexie (IndexedDB), Zod Validation |
| **Web3** | wagmi, viem, RainbowKit, ENS Resolution |
| **Backend** | Express.js, TypeScript, Drizzle ORM |
| **AI** | Venice AI, Brave Search API, Web Search, Reasoning Models |
| **Storage** | IndexedDB (local), PostgreSQL (optional), In-memory |

## License

MIT

---

Built with privacy in mind. Your thinking stays yours.
