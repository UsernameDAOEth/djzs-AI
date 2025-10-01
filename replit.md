# DJZS On-Chain Newsletter

## Overview

DJZS is a Web3-native newsletter platform built on the Base blockchain that uses NFT-gated access control. Users mint a Subscribe NFT (ERC-721) to unlock premium newsletter content, trade setups, and AI-powered market insights. The platform features a React-based frontend with RainbowKit wallet integration, an Express backend, and Hardhat for smart contract deployment.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Technology Stack**: React 18 with TypeScript, built using Vite for fast development and optimized production builds.

**UI Framework**: Radix UI components with Tailwind CSS for styling. The design implements a dark theme with custom CSS variables, neon effects, and glassmorphism aesthetics consistent with the DJZS brand.

**Routing**: Wouter library provides lightweight client-side routing. Currently implements a single-page application with a home route and 404 fallback.

**State Management**: React hooks for local state, with TanStack Query (React Query) managing server state and caching.

**Component Structure**:
- **Sections**: Hero, SubscriptionGate, Features, About, FAQ, Footer, and MemberContent components organize page content
- **Web3 Components**: ConnectButton and MintButton handle wallet interactions
- **UI Components**: Comprehensive Radix UI-based component library located in `client/src/components/ui/`

**Styling Approach**: Utility-first CSS with Tailwind, custom CSS animations for visual effects (starfield backgrounds, portal rings, neon glows), and CSS custom properties for theming.

### Backend Architecture

**Server Framework**: Express.js with TypeScript running on Node.js.

**Build Process**: 
- Development: tsx for direct TypeScript execution with hot reload
- Production: esbuild bundles the server into ESM format

**API Design**: RESTful endpoints prefixed with `/api`. Includes newsletter CRUD operations and IPFS metadata upload endpoints.

**Storage Interface**: Abstract storage layer (`IStorage`) with in-memory implementation (`MemStorage`). Stores newsletter issues with CRUD operations. Newsletter issues track title, description, issue number, publication status, PDF URLs, IPFS metadata URIs, and NFT contract addresses.

**IPFS Integration**: Server-side service (`server/ipfs.ts`) handles NFT metadata uploads to IPFS via Pinata API. Supports both JWT and API key/secret authentication. Implements 30-second timeout, robust error handling, and automatic URI generation. Two endpoints available:
- `POST /api/ipfs/upload-issue-metadata/:issueId` - Generates and uploads ERC-721 metadata for newsletter issues
- `POST /api/ipfs/upload-subscribe-metadata` - Generates and uploads ERC-721 metadata for Subscribe NFTs

Note: IPFS endpoints require authentication in production (to be added in admin dashboard).

**Static File Serving**: Vite middleware in development, static file serving from `dist/public` in production.

### Web3 Integration

**Wallet Connection**: RainbowKit provides wallet connection UI with support for multiple wallet providers. Configured for Base mainnet (chainId: 8453) and Base Sepolia testnet (chainId: 84532).

**Smart Contract Interaction**: 
- Wagmi library handles contract reads/writes with TypeScript type safety
- Contract ABI defines interface for Subscribe NFT (ERC-721 standard with custom `mintSubscribe` function)
- Custom `useIsSubscribed` hook checks NFT ownership and supply data

**NFT Gating**: Subscription status verified by checking ERC-721 `balanceOf` for connected wallet. Users with balance > 0 gain access to premium content.

**Contract Deployment**: Hardhat configured for deployment to Base networks with scripts in `scripts/deploy.ts`.

### Database Strategy

**ORM**: Drizzle ORM configured for PostgreSQL with schema definition in `shared/schema.ts`.

**Migration Management**: Drizzle Kit handles schema migrations with output to `migrations/` directory.

**Current Schema**: Minimal user table with id, username, and password fields. Designed as foundation for authentication system.

**Database Provider**: Configured for Neon serverless Postgres (via `@neondatabase/serverless` package), though any PostgreSQL-compatible database can be used.

**Rationale**: Drizzle chosen for type-safe SQL queries, lightweight footprint, and seamless TypeScript integration. PostgreSQL provides robust relational data storage with JSON support for flexible content structures.

### Smart Contract Architecture

**Contract Standard**: OpenZeppelin ERC-721 implementation provides battle-tested NFT functionality.

**Custom Functions**:
- `mintSubscribe()`: Payable function for subscription NFT minting
- Supply tracking with `totalSupply()` and `maxSupply()` view functions

**Deployment Strategy**: Hardhat deployment scripts with environment-based configuration for price and base URI. Supports both mainnet and testnet deployments.

**Metadata**: IPFS-based token metadata referenced via configurable base URI.

## External Dependencies

### Blockchain Infrastructure

**RPC Providers**: 
- Base mainnet: `https://mainnet.base.org`
- Base Sepolia testnet: `https://sepolia.base.org`
- Configurable via environment variables for custom RPC endpoints

**Chain Support**: Base (EIP-1559 compatible L2) chosen for low transaction costs and fast finality. Base Sepolia for testing.

### Web3 Libraries

**RainbowKit**: Wallet connection UI with built-in support for MetaMask, WalletConnect, Coinbase Wallet, and other providers. Provides customizable theming.

**Wagmi/Viem**: Type-safe Ethereum interaction library. Wagmi provides React hooks, Viem handles low-level blockchain operations.

**WalletConnect**: Cloud relay for mobile wallet connections (requires project ID).

### Database

**Neon Serverless Postgres**: Serverless PostgreSQL platform with connection pooling and automatic scaling. Connection string via `DATABASE_URL` environment variable.

### UI/Design Libraries

**Radix UI**: Accessible, unstyled component primitives for building the design system. Includes dialogs, dropdowns, tooltips, and form components.

**Tailwind CSS**: Utility-first CSS framework with JIT compilation. Extended with custom plugins for animations and typography.

**Lucide React**: Icon library providing consistent SVG icons.

### Development Tools

**Vite**: Build tool providing fast HMR in development and optimized production builds. Configured with React plugin and Replit-specific plugins.

**Hardhat**: Ethereum development environment for compiling, testing, and deploying smart contracts.

**TypeScript**: Strict type checking across frontend, backend, and shared code. Path aliases configured for clean imports.

**Drizzle Kit**: CLI for managing database migrations and schema introspection.

### IPFS & Pinata Integration

**Pinata**: IPFS pinning service used for storing NFT metadata permanently on IPFS. The platform uses Pinata's REST API (no SDK) to avoid dependency conflicts.

**Authentication Methods**: Supports two authentication methods:
1. JWT token (`PINATA_JWT`) - Recommended
2. API Key + Secret (`PINATA_API_KEY` and `PINATA_API_SECRET`) - Both required

**Features**:
- 30-second request timeout with AbortController
- Robust error handling with detailed Pinata error messages
- Zod validation for all inputs (URLs, Ethereum addresses, token IDs)
- Automatic fallback for invalid dates
- ERC-721 compliant metadata format

**Gateway**: Configurable IPFS gateway via `PINATA_GATEWAY` (defaults to `gateway.pinata.cloud`)

### Environment Configuration

Required environment variables:
- `DATABASE_URL`: PostgreSQL connection string
- `VITE_SUBSCRIBE_NFT_ADDRESS`: Deployed contract address
- `VITE_SUBSCRIBE_PRICE`: NFT mint price in ETH
- `VITE_WALLETCONNECT_PROJECT_ID`: WalletConnect cloud project ID (optional)
- `PRIVATE_KEY`: Wallet private key for contract deployment
- `RPC_BASE`: Custom Base RPC URL (optional)
- `RPC_BASE_SEPOLIA`: Custom Base Sepolia RPC URL (optional)
- `BASE_URI`: IPFS base URI for NFT metadata

IPFS/Pinata variables (choose one authentication method):
- `PINATA_JWT`: Pinata JWT token (recommended)
- `PINATA_API_KEY` + `PINATA_API_SECRET`: Pinata API credentials (both required if not using JWT)
- `PINATA_GATEWAY`: Custom IPFS gateway (optional, defaults to gateway.pinata.cloud)