# Deploy Subscribe NFT Contract

This guide explains how to deploy the Subscribe NFT contract and configure your app.

## Prerequisites

1. A wallet with some ETH on Base Sepolia (testnet) or Base (mainnet)
2. Your wallet's private key
3. A treasury address (where minting fees will be sent)

## Deployment Steps

### 1. Create Environment File

Copy the example file:
```bash
cp .env.deploy.example .env.deploy
```

### 2. Configure Environment Variables

Edit `.env.deploy` with your details:

```bash
# Network (choose one)
RPC_URL=https://sepolia.base.org        # For testnet
# RPC_URL=https://mainnet.base.org      # For mainnet

# Your wallet private key (keep this secret!)
PRIVATE_KEY=your_private_key_here

# NFT Details
NAME=DJZS Subscribe
SYMBOL=DJZSUB
PRICE_WEI=1000000000000000              # 0.001 ETH
TREASURY=0xYourPayoutAddress             # Where mint fees go
BASE_TOKEN_URI=ipfs://YourCID/           # Optional: IPFS metadata folder
MAX_SUPPLY=0                             # 0 = unlimited, or set a number
```

### 3. Deploy the Contract

Run the deployment script:
```bash
npm run deploy
```

The output will show:
```
✅ Deployed at: 0x1234567890abcdef...
Set Replit secrets:
VITE_SUBSCRIBE_NFT_ADDRESS = 0x1234567890abcdef...
VITE_SUBSCRIBE_PRICE = 0.001
```

### 4. Set Replit Secrets

Add the contract address and price as Replit secrets:
- `VITE_SUBSCRIBE_NFT_ADDRESS` = your deployed contract address
- `VITE_SUBSCRIBE_PRICE` = the price in ETH (e.g., "0.001")

### 5. Restart Your App

The app will automatically pick up the new contract address and enable minting!

## Notes

- **Price**: `PRICE_WEI=1000000000000000` equals 0.001 ETH
- **Treasury**: Must be a valid Ethereum address where mint payments go
- **Metadata**: `BASE_TOKEN_URI` should point to a folder with `1.json`, `2.json`, etc.
- **Supply**: Set `MAX_SUPPLY=0` for unlimited, or a specific number to cap supply

## Contract Functions

The deployed contract has these functions:

- `mint()` - Mint a Subscribe NFT (requires exact payment)
- `balanceOf(address)` - Check how many NFTs an address owns
- `totalMinted()` - Total number of NFTs minted
- `maxSupply()` - Maximum supply (0 = unlimited)
- `price()` - Current minting price in wei

## Security

⚠️ **Never commit `.env.deploy` to git** - it contains your private key!

The deployment files are already in `.gitignore`.
