# DJZS Box

Private, local-first journal + research vault that only calls AI when you ask.

## What It Is

DJZS is a thinking tool, not a platform. Your notes live on your device. AI assists only when you choose. Nothing syncs unless you want it to.

**Core loop:** Write → Ask → Insight → Save

## Features

### Journal Zone
- **Instant save** - Your entry is safe before AI even runs
- **Thinking partner** - Venice AI reflects back, asks questions, spots patterns
- **Memory pins** - Save key insights as context for future sessions
- **Offline-first** - Works without internet, even on airplane mode

### Research Zone
- **Brave Search** - Privacy-preserving web search (no tracking)
- **Web synthesis** - AI summarizes findings with source citations
- **Explain mode** - AI knowledge without web search

### Privacy Stack
- **Local-first** - All data stored in IndexedDB on your device
- **E2E encryption** - XMTP's quantum-resistant encryption
- **Venice AI** - No data retention, no training on your content
- **Wallet login** - No email, no password, no account harvesting

## Quick Start

```bash
git clone https://github.com/UsernameDAOEth/djzs-box.git
cd djzs-box
npm install
npm run dev
```

Open `http://localhost:5000`

## Environment Variables

```env
# Required
VENICE_API_KEY=your_venice_api_key

# Optional - enables Brave Search in Research zone
BRAVE_API_KEY=your_brave_api_key
```

## Tech Stack

- **Frontend:** React + TypeScript + Vite + Tailwind CSS
- **Storage:** IndexedDB (local-first)
- **AI:** Venice AI (privacy-first, no retention)
- **Search:** Brave Search API (no tracking)
- **Auth:** Wallet-based via RainbowKit

## Data Flow

```
You write → Saved locally (instant)
You click "Think with me" → Entry + pins sent to Venice AI
AI responds → Saved locally
Nothing syncs unless you export
```

## Philosophy

- Your thinking is yours. Not ours. Not a platform's.
- AI is a tool, not a listener. It only sees what you show it.
- Local-first means if DJZS disappears, your data remains.
- No feeds. No followers. No engagement metrics. Just clarity.

## License

MIT

---

A tool for thinking, not a place for content.
