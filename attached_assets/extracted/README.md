# DJZS Subscribe NFT — One-Click Deploy (Base / Base Sepolia)

This starter compiles and deploys an ERC-721 **SubscribeNFT** contract using `ethers + solc` without Remix.

## Quick Start
```bash
# 1) Install deps
npm i

# 2) Create .env from example and fill values
cp .env.example .env

# 3) Deploy
npm run deploy
```

The console will print:
```
✅ Deployed at: 0x....
Set Replit secrets:
VITE_SUBSCRIBE_NFT_ADDRESS = 0x....
VITE_SUBSCRIBE_PRICE = 0.001
```

## Notes
- `PRICE_WEI=1000000000000000` equals **0.001 ETH**.
- `BASE_TOKEN_URI` should be an IPFS folder CID ending with `/` that contains `1.json`, `2.json`, ...
- Funds sent to `mint()` are forwarded to `TREASURY` on each mint.
- `MAX_SUPPLY=0` means unlimited.
