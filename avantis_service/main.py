import os
import asyncio
from typing import Optional, List
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

# Avantis SDK
from avantis_trader_sdk import TraderClient, FeedClient
from avantis_trader_sdk.types import TradeInput, TradeInputOrderType

load_dotenv()
PROVIDER_URL = os.getenv("BASE_RPC_URL")
PRIVATE_KEY = os.getenv("PRIVATE_KEY")

if not PROVIDER_URL:
    raise RuntimeError("BASE_RPC_URL missing in .env")

# --- Init SDK clients (trading; feed optional) ---
trader_client = TraderClient(PROVIDER_URL)

if PRIVATE_KEY:
    # local signer for trade ops
    trader_client.set_local_signer(PRIVATE_KEY)

app = FastAPI(title="DJZS Avantis Bridge", version="1.0.0")

# ---------- Schemas ----------
class PlanRequest(BaseModel):
    symbol: str = "ETH/USD"   # Avantis pair naming
    leverage: int = 10
    is_long: bool = True
    collateral_usdc: float = 10.0
    take_profit: Optional[float] = None
    stop_loss: Optional[float] = None

class OpenTradeRequest(PlanRequest):
    trader: Optional[str] = None
    slippage_pct: float = 1.0
    order_type: str = "MARKET"  # MARKET | LIMIT | STOP_LIMIT | MARKET_ZERO_FEE
    limit_price: Optional[float] = None  # for LIMIT/STOP_LIMIT

class CloseTradeRequest(BaseModel):
    trader: str
    pair_index: int
    trade_index: int
    collateral_to_close: Optional[float] = None  # full if None

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
    Returns available pairs and some cached params.
    """
    try:
        pairs = await trader_client.pairs_cache.get_pairs()
        return {"pairs": pairs}
    except Exception as e:
        raise HTTPException(500, f"markets_error: {e}")

@app.get("/trader/{address}")
async def get_trader_state(address: str):
    """
    Open trades + pending limit orders for a trader.
    """
    try:
        trades, pending = await trader_client.trade.get_trades(trader=address)
        return {
            "trades": [t.model_dump() for t in trades],
            "pending": [p.model_dump() for p in pending],
        }
    except Exception as e:
        raise HTTPException(500, f"trader_error: {e}")

@app.post("/plan")
async def plan(req: PlanRequest):
    """
    Returns fees + loss protection for a hypothetical trade (no tx built).
    """
    try:
        pair_idx = await get_pair_index(req.symbol)
        # prepare a hypothetical TradeInput
        trade_input = TradeInput(
            trader="0x0000000000000000000000000000000000000000",
            open_price=None,            # current price
            pair_index=pair_idx,
            collateral_in_trade=req.collateral_usdc,
            is_long=req.is_long,
            leverage=req.leverage,
            index=0,
            tp=req.take_profit or 0,
            sl=req.stop_loss or 0,
            timestamp=0,
        )

        opening_fee = await trader_client.fee_parameters.get_opening_fee(
            trade_input=trade_input
        )
        loss_protection = await trader_client.trading_parameters.get_loss_protection_for_trade_input(
            trade_input, opening_fee_usdc=opening_fee
        )
        # you can add more parameters (funding, oi, etc.) via other SDK helpers

        return {
            "pair_index": pair_idx,
            "opening_fee_usdc": opening_fee,
            "loss_protection": loss_protection.model_dump(),
        }
    except Exception as e:
        raise HTTPException(500, f"plan_error: {e}")

# ---------- Trade endpoints (require PRIVATE_KEY or custom signer) ----------
@app.post("/open")
async def open_trade(req: OpenTradeRequest):
    """
    Builds + sends a trade open tx (MARKET by default).
    """
    if not trader_client.get_signer():
        raise HTTPException(400, "No signer set on server. Add PRIVATE_KEY or implement KMS signer.")

    try:
        pair_idx = await get_pair_index(req.symbol)
        trader = trader_client.get_signer().get_ethereum_address()

        # Approve USDC if needed
        allowance = await trader_client.get_usdc_allowance_for_trading(trader)
        if allowance < req.collateral_usdc:
            await trader_client.approve_usdc_for_trading(req.collateral_usdc)

        trade_input = TradeInput(
            trader=trader,
            open_price=req.limit_price,     # for LIMIT/STOP_LIMIT; for MARKET None = current
            pair_index=pair_idx,
            collateral_in_trade=req.collateral_usdc,
            is_long=req.is_long,
            leverage=req.leverage,
            index=0,
            tp=req.take_profit or 0,
            sl=req.stop_loss or 0,
            timestamp=0,
        )

        order_type_map = {
            "MARKET": TradeInputOrderType.MARKET,
            "LIMIT": TradeInputOrderType.LIMIT,
            "STOP_LIMIT": TradeInputOrderType.STOP_LIMIT,
            "MARKET_ZERO_FEE": TradeInputOrderType.MARKET_ZERO_FEE,
        }
        order_type = order_type_map.get(req.order_type.upper(), TradeInputOrderType.MARKET)

        tx = await trader_client.trade.build_trade_open_tx(
            trade_input, order_type, req.slippage_pct
        )
        receipt = await trader_client.sign_and_get_receipt(tx)

        return {"tx_hash": receipt.transactionHash.hex() if hasattr(receipt, "transactionHash") else str(receipt), "status": "submitted"}
    except Exception as e:
        raise HTTPException(500, f"open_trade_error: {e}")

@app.post("/close")
async def close_trade(req: CloseTradeRequest):
    """
    Close (fully or partially) a position.
    """
    if not trader_client.get_signer():
        raise HTTPException(400, "No signer set on server. Add PRIVATE_KEY or implement KMS signer.")

    try:
        trader = req.trader
        tx = await trader_client.trade.build_trade_close_tx(
            pair_index=req.pair_index,
            trade_index=req.trade_index,
            collateral_to_close=req.collateral_to_close,  # None -> full close
            trader=trader,
        )
        receipt = await trader_client.sign_and_get_receipt(tx)
        return {"tx_hash": receipt.transactionHash.hex() if hasattr(receipt, "transactionHash") else str(receipt), "status": "submitted"}
    except Exception as e:
        raise HTTPException(500, f"close_trade_error: {e}")
