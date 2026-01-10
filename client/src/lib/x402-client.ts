import { wrapAxiosWithPaymentFromConfig, type PaymentPolicy, type PaymentRequirements } from '@x402/axios';
import { ExactEvmScheme } from '@x402/evm';
import axios, { AxiosInstance } from 'axios';
import { type WalletClient } from 'viem';

// Use local proxy to avoid CORS issues - proxy forwards to x402-api.heyelsa.ai
const X402_API_BASE = '/api/x402-proxy';

const NETWORK_ALIASES: Record<string, string> = {
  'base': 'eip155:8453',
  'base-mainnet': 'eip155:8453',
  'base-sepolia': 'eip155:84532',
  'ethereum': 'eip155:1',
  'mainnet': 'eip155:1',
};

const networkNormalizationPolicy: PaymentPolicy = (
  _x402Version: number,
  paymentRequirements: PaymentRequirements[]
): PaymentRequirements[] => {
  return paymentRequirements.map(req => {
    const normalizedNetwork = NETWORK_ALIASES[req.network] || req.network;
    return {
      ...req,
      network: normalizedNetwork as PaymentRequirements['network'],
    };
  });
};

function createWalletClientSigner(walletClient: WalletClient) {
  if (!walletClient.account) {
    throw new Error('Wallet not connected');
  }
  
  const account = walletClient.account;
  
  return {
    address: account.address,
    
    signTypedData: async (params: {
      domain: Record<string, unknown>;
      types: Record<string, unknown>;
      primaryType: string;
      message: Record<string, unknown>;
    }) => {
      return walletClient.signTypedData({
        account,
        domain: params.domain as any,
        types: params.types as any,
        primaryType: params.primaryType,
        message: params.message as any,
      });
    },
  };
}

export interface SwapQuote {
  from_amount: string;
  estimatedOutput: string;
  price_impact: string;
  gas_estimate: string;
  route: string[];
}

export interface SwapParams {
  from_chain: string;
  from_token: string;
  from_amount: string;
  to_chain: string;
  to_token: string;
  wallet_address: string;
  slippage: number;
  dry_run: boolean;
}

export interface PipelineStatus {
  pipeline_id: string;
  status: string;
  tasks: Array<{
    type: string;
    status: string;
    tx_hash?: string;
    tx_data?: {
      to: string;
      data: string;
      value: string;
    };
  }>;
}

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

export interface TokenSearchResult {
  symbol: string;
  name: string;
  address: string;
  chain: string;
  priceUSD: string;
}

const TOKEN_ADDRESSES: Record<string, string> = {
  USDC: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
  WETH: '0x4200000000000000000000000000000000000006',
  ETH: '0x4200000000000000000000000000000000000006',
  USDT: '0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2',
  DAI: '0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb',
};

export function getTokenAddress(symbol: string): string | undefined {
  return TOKEN_ADDRESSES[symbol.toUpperCase()];
}

export function createX402Client(walletClient: WalletClient): AxiosInstance {
  const baseClient = axios.create({ 
    baseURL: X402_API_BASE,
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  const signer = createWalletClientSigner(walletClient);
  
  return wrapAxiosWithPaymentFromConfig(baseClient, {
    schemes: [
      {
        network: 'eip155:8453',
        client: new ExactEvmScheme(signer as any),
        x402Version: 1,
      },
      {
        network: 'eip155:*',
        client: new ExactEvmScheme(signer as any),
        x402Version: 2,
      },
    ],
    policies: [networkNormalizationPolicy],
  });
}

export async function getSwapQuote(
  client: AxiosInstance,
  params: Omit<SwapParams, 'dry_run'>
): Promise<SwapQuote> {
  const response = await client.post('/api/get_swap_quote', {
    ...params,
    slippage: params.slippage || 2.0,
  });
  return response.data.quote;
}

export async function executeSwap(
  client: AxiosInstance,
  params: SwapParams
): Promise<{ pipeline_id: string; tasks: PipelineStatus['tasks'] }> {
  const response = await client.post('/api/execute_swap', params);
  return response.data;
}

export async function getTransactionStatus(
  client: AxiosInstance,
  pipeline_id: string
): Promise<PipelineStatus> {
  const response = await client.post('/api/get_transaction_status', { pipeline_id });
  return response.data;
}

export async function getPortfolio(
  client: AxiosInstance,
  wallet_address: string
): Promise<PortfolioResult> {
  try {
    console.log('[x402] Calling get_portfolio for', wallet_address);
    const response = await client.post('/api/get_portfolio', { wallet_address });
    console.log('[x402] get_portfolio success:', response.status);
    return response.data;
  } catch (err: any) {
    console.error('[x402] get_portfolio error:', err?.message, err?.response?.status, err?.response?.data);
    throw err;
  }
}

export async function getBalances(
  client: AxiosInstance,
  wallet_address: string
): Promise<{ balances: TokenBalance[] }> {
  const response = await client.post('/api/get_balances', { wallet_address });
  return response.data;
}

export async function searchToken(
  client: AxiosInstance,
  symbol_or_address: string,
  limit: number = 5
): Promise<TokenSearchResult[]> {
  const response = await client.post('/api/search_token', { symbol_or_address, limit });
  return response.data.result || response.data.results || [];
}

export async function getTokenPrice(
  client: AxiosInstance,
  token_address: string,
  chain: string = 'base'
): Promise<{ priceUSD: string }> {
  try {
    console.log('[x402] Calling get_token_price for', token_address);
    const response = await client.post('/api/get_token_price', { token_address, chain });
    console.log('[x402] get_token_price success:', response.status);
    return response.data;
  } catch (err: any) {
    console.error('[x402] get_token_price error:', err?.message, err?.response?.status, err?.response?.data);
    throw err;
  }
}

export async function analyzeWallet(
  client: AxiosInstance,
  wallet_address: string
): Promise<WalletAnalysis> {
  const response = await client.post('/api/analyze_wallet', { wallet_address });
  return response.data;
}

export async function getPnLReport(
  client: AxiosInstance,
  wallet_address: string,
  timeframe: string = '30d'
): Promise<PnLReport> {
  const response = await client.post('/api/get_pnl_report', { wallet_address, timeframe });
  return response.data;
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

export interface LimitOrder {
  order_id: string;
  from_token: string;
  to_token: string;
  amount: string;
  target_price: string;
  direction: 'buy' | 'sell';
  status: 'pending' | 'filled' | 'cancelled';
  created_at: string;
}

export interface ParsedTradeIntent {
  action: 'swap' | 'portfolio' | 'balance' | 'price' | 'analyze' | 'pnl' | 'limit' | 'orders' | 'unknown';
  fromToken?: string;
  toToken?: string;
  amount?: string;
  tokenForPrice?: string;
  targetPrice?: string;
  direction?: 'buy' | 'sell';
  timeframe?: string;
  rawInput: string;
}

export function parseTradeIntent(input: string): ParsedTradeIntent {
  const normalized = input.toLowerCase().trim();
  
  // Swap: "swap 100 USDC to ETH"
  const swapMatch = normalized.match(
    /swap\s+(\d+(?:\.\d+)?)\s*(\w+)\s+(?:to|for)\s+(\w+)/i
  );
  if (swapMatch) {
    return {
      action: 'swap',
      amount: swapMatch[1],
      fromToken: swapMatch[2].toUpperCase(),
      toToken: swapMatch[3].toUpperCase(),
      rawInput: input,
    };
  }
  
  // Limit order: "limit buy 100 USDC at 3500 ETH" or "limit sell 0.5 ETH at 3600 USDC"
  const limitMatch = normalized.match(
    /limit\s+(buy|sell)\s+(\d+(?:\.\d+)?)\s*(\w+)\s+(?:at|@)\s+(\d+(?:\.\d+)?)\s*(\w+)?/i
  );
  if (limitMatch) {
    return {
      action: 'limit',
      direction: limitMatch[1] as 'buy' | 'sell',
      amount: limitMatch[2],
      fromToken: limitMatch[3].toUpperCase(),
      targetPrice: limitMatch[4],
      toToken: limitMatch[5]?.toUpperCase() || 'USD',
      rawInput: input,
    };
  }
  
  // View limit orders
  if (normalized.includes('orders') || normalized.includes('my orders') || normalized.includes('limit orders')) {
    return { action: 'orders', rawInput: input };
  }
  
  // Analyze wallet
  if (normalized.includes('analyze') || normalized.includes('analysis') || normalized.includes('insights')) {
    return { action: 'analyze', rawInput: input };
  }
  
  // PnL report with optional timeframe
  if (normalized.includes('pnl') || normalized.includes('profit') || normalized.includes('loss')) {
    const timeframeMatch = normalized.match(/(\d+[dDwWmM])/);
    return { 
      action: 'pnl', 
      timeframe: timeframeMatch ? timeframeMatch[1] : '30d',
      rawInput: input 
    };
  }
  
  if (normalized.includes('portfolio') || normalized.includes('holdings')) {
    return { action: 'portfolio', rawInput: input };
  }
  
  if (normalized.includes('balance') || normalized.includes('balances')) {
    return { action: 'balance', rawInput: input };
  }
  
  const priceMatch = normalized.match(/(?:price|cost)\s+(?:of\s+)?(\w+)/i);
  if (priceMatch) {
    return { 
      action: 'price', 
      tokenForPrice: priceMatch[1].toUpperCase(),
      rawInput: input 
    };
  }
  
  if (normalized.includes('price')) {
    return { action: 'price', rawInput: input };
  }
  
  return { action: 'unknown', rawInput: input };
}

export function formatUSD(value: string | number): string {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(num);
}

export function formatTokenAmount(value: string | number, decimals: number = 6): string {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return num.toLocaleString('en-US', { maximumFractionDigits: decimals });
}
