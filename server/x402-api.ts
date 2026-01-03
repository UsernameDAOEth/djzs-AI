/**
 * Server-side x402 API helper for XMTP agent integration
 * 
 * NOTE: x402 API requires micropayments via HTTP 402 Payment Required protocol.
 * Without a funded server wallet or CDP facilitator configured, API calls will
 * return 402 errors. For full functionality:
 * 1. Configure XMTP_WALLET_KEY with funded wallet for agent payments
 * 2. Or set up CDP facilitator for payment handling
 * 
 * The agent will gracefully surface payment requirement errors to users.
 */

const X402_API_BASE = "https://x402-api.heyelsa.ai";

export interface TokenBalance {
  asset: string;
  balance: string;
  balance_usd: string;
  chain: string;
}

export interface PortfolioResult {
  wallet_address: string;
  total_value_usd: string;
  chains: string[];
  balances: TokenBalance[];
}

export interface WalletAnalysis {
  wallet_address: string;
  total_trades: number;
  win_rate: string;
  avg_trade_size: string;
  most_traded_tokens: string[];
  trading_style: string;
  risk_score: string;
}

export interface PnLReport {
  wallet_address: string;
  timeframe: string;
  total_pnl: string;
  realized_pnl: string;
  unrealized_pnl: string;
  best_trade: { token: string; pnl: string };
  worst_trade: { token: string; pnl: string };
  trade_count: number;
}

export interface SwapQuote {
  from_amount: string;
  estimatedOutput: string;
  price_impact: string;
  gas_estimate: string;
  route: string[];
}

const TOKEN_ADDRESSES: Record<string, string> = {
  USDC: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
  WETH: "0x4200000000000000000000000000000000000006",
  ETH: "0x4200000000000000000000000000000000000006",
  USDT: "0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2",
  DAI: "0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb",
};

export function getTokenAddress(symbol: string): string | undefined {
  return TOKEN_ADDRESSES[symbol.toUpperCase()];
}

async function x402Fetch(endpoint: string, body: object): Promise<any> {
  const response = await fetch(`${X402_API_BASE}${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (response.status === 402) {
    throw new Error("Payment required - x402 API needs a funded PRIVATE_KEY in secrets to pay for micropayments");
  }

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`x402 API error: ${response.status} - ${text}`);
  }

  return response.json();
}

export async function getTokenPrice(tokenAddress: string, chain: string = "base"): Promise<{ priceUSD: string }> {
  const data = await x402Fetch("/api/get_token_price", { token_address: tokenAddress, chain });
  return data;
}

export async function getPortfolio(walletAddress: string): Promise<PortfolioResult> {
  const data = await x402Fetch("/api/get_portfolio", { wallet_address: walletAddress });
  return data;
}

export async function getBalances(walletAddress: string): Promise<{ balances: TokenBalance[] }> {
  const data = await x402Fetch("/api/get_balances", { wallet_address: walletAddress });
  return data;
}

export async function analyzeWallet(walletAddress: string): Promise<WalletAnalysis> {
  const data = await x402Fetch("/api/analyze_wallet", { wallet_address: walletAddress });
  return data;
}

export async function getPnLReport(walletAddress: string, timeframe: string = "30d"): Promise<PnLReport> {
  const data = await x402Fetch("/api/get_pnl_report", { wallet_address: walletAddress, timeframe });
  return data;
}

export async function getSwapQuote(
  fromToken: string,
  toToken: string,
  amount: string,
  walletAddress: string,
  slippage: number = 2.0
): Promise<SwapQuote> {
  const fromAddress = getTokenAddress(fromToken) || fromToken;
  const toAddress = getTokenAddress(toToken) || toToken;

  const data = await x402Fetch("/api/get_swap_quote", {
    from_chain: "base",
    from_token: fromAddress,
    from_amount: amount,
    to_chain: "base",
    to_token: toAddress,
    wallet_address: walletAddress,
    slippage,
  });

  return data.quote;
}

export function formatUSD(value: string | number): string {
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return "$0.00";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(num);
}

export function formatTokenAmount(value: string | number, decimals: number = 6): string {
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return "0";
  return num.toLocaleString("en-US", { maximumFractionDigits: decimals });
}
