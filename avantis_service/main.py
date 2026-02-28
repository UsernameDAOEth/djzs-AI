import os
import asyncio
from typing import Optional, List
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# Avantis SDK
from avantis_trader_sdk import TraderClient, FeedClient
from avantis_trader_sdk.types import TradeInput, TradeInputOrderType

load_dotenv()
PROVIDER_URL = os.getenv("BASE_RPC_URL")
PRIVATE_KEY = os.getenv("PRIVATE_KEY")

if not PROVIDER_URL:
    raise RuntimeError("BASE_RPC_URL missing in .env")

# --- Init SDK clients ---
trader_client = TraderClient(PROVIDER_URL)

if PRIVATE_KEY:
    trader_client.set_local_signer(PRIVATE_KEY)

app = FastAPI(title="DJZS Avantis Bridge", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------- Schemas ----------
class PlanRequest(BaseModel):
    symbol: str = "ETH/USD"
    leverage: int = 10
    is_long: bool = True
    collateral_usdc: float = 10.0
    take_profit: Optional[float] = None
    stop_loss: Optional[float] = None

class OpenTradeRequest(PlanRequest):
    slippage_pct: int = 1
    order_type: str = "MARKET"  # MARKET | LIMIT | MARKET_ZERO_FEE
    limit_price: Optional[float] = None

class CloseTradeRequest(BaseModel):
    pair_index: int
    trade_index: int
    slippage_pct: int = 1

# ---------- Utility ----------
async def get_pair_index(symbol: str) -> int:
    return await trader_client.pairs_cache.get_pair_index(symbol)

# ---------- Read-only endpoints ----------
@app.get("/health")
async def health():
    return {"ok": True}

@app.get("/markets")
async def markets():
    """
    Returns available pairs and their parameters.
    """
    try:
        pairs_info = await trader_client.pairs_cache.get_pairs_info()
        return {
            "pairs": [
                {
                    "pair": f"{p.from_}/{p.to}",
                    "pair_index": getattr(p, 'pair_index', None),
                    "from": p.from_,
                    "to": p.to,
                }
                for p in pairs_info
            ]
        }
    except Exception as e:
        raise HTTPException(500, f"markets_error: {e}")

@app.get("/trader/{address}")
async def get_trader_state(address: str):
    """
    Open trades for a trader address.
    """
    try:
        trades = await trader_client.get_trades(address)
        return {
            "trades": [t.model_dump() for t in trades] if trades else [],
        }
    except Exception as e:
        raise HTTPException(500, f"trader_error: {e}")

@app.post("/plan")
async def plan(req: PlanRequest):
    """
    Returns fees + loss protection for a hypothetical trade.
    """
    try:
        pair_idx = await get_pair_index(req.symbol)
        
        # Create hypothetical TradeInput
        trade_input = TradeInput(
            trader="0x0000000000000000000000000000000000000000",
            pair_index=pair_idx,
            index=0,
            initial_pos_token=0,
            collateral_usdc=req.collateral_usdc,
            open_price=0.0,
            long=req.is_long,
            leverage=req.leverage,
            tp=req.take_profit or 0,
            sl=req.stop_loss or 0,
            timestamp=0,
        )

        opening_fee = await trader_client.fee_parameters.get_opening_fee(trade_input)
        loss_protection = await trader_client.trading_parameters.get_loss_protection_for_trade_input(
            trade_input, opening_fee
        )

        return {
            "pair_index": pair_idx,
            "opening_fee_usdc": opening_fee,
            "loss_protection": loss_protection.model_dump(),
        }
    except Exception as e:
        raise HTTPException(500, f"plan_error: {e}")

# ---------- Trade endpoints (require PRIVATE_KEY) ----------
@app.post("/open")
async def open_trade(req: OpenTradeRequest):
    """
    Opens a trade (MARKET by default).
    """
    if not trader_client.get_signer():
        raise HTTPException(400, "No signer set. Add PRIVATE_KEY or implement KMS signer.")

    try:
        pair_idx = await get_pair_index(req.symbol)
        trader = trader_client.get_signer().get_ethereum_address()

        # Check USDC allowance
        allowance = await trader_client.get_usdc_allowance(trader)
        collateral_amount = int(req.collateral_usdc * 1_000_000)  # Convert to 6 decimals
        
        if allowance < collateral_amount:
            tx_hash = await trader_client.approve_usdc(collateral_amount)
            print(f"Approved USDC: {tx_hash}")

        # Create TradeInput
        trade_input = TradeInput(
            trader=trader,
            pair_index=pair_idx,
            index=0,
            initial_pos_token=0,
            collateral_usdc=req.collateral_usdc,
            open_price=req.limit_price or 0.0,
            long=req.is_long,
            leverage=req.leverage,
            tp=req.take_profit or 0,
            sl=req.stop_loss or 0,
            timestamp=0,
        )

        order_type_map = {
            "MARKET": TradeInputOrderType.MARKET,
            "LIMIT": TradeInputOrderType.LIMIT,
            "MARKET_ZERO_FEE": TradeInputOrderType.MARKET_ZERO_FEE,
        }
        order_type = order_type_map.get(req.order_type.upper(), TradeInputOrderType.MARKET)

        tx = await trader_client.build_trade_open_tx(
            trade_input=trade_input,
            slippage_percentage=req.slippage_pct,
            trade_input_order_type=order_type
        )
        
        tx_hash = await trader_client.send_transaction(tx)
        return {"tx_hash": tx_hash, "status": "submitted"}
    except Exception as e:
        raise HTTPException(500, f"open_trade_error: {e}")

@app.post("/close")
async def close_trade(req: CloseTradeRequest):
    """
    Close a position.
    """
    if not trader_client.get_signer():
        raise HTTPException(400, "No signer set. Add PRIVATE_KEY or implement KMS signer.")

    try:
        tx = await trader_client.build_trade_close_tx(
            pair_index=req.pair_index,
            trade_index=req.trade_index,
            slippage_percentage=req.slippage_pct
        )
        
        tx_hash = await trader_client.send_transaction(tx)
        return {"tx_hash": tx_hash, "status": "submitted"}
    except Exception as e:
        raise HTTPException(500, f"close_trade_error: {e}")
