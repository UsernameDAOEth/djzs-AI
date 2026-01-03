import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { TrendingUp, Wallet, ArrowRight, Loader2, CheckCircle, XCircle, Clock, BarChart3, Target, LineChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  parseTradeIntent,
  formatUSD,
  getTokenAddress,
  type SwapQuote,
  type PortfolioResult,
  type TokenBalance,
  type WalletAnalysis,
  type PnLReport,
  type LimitOrder,
} from "@/lib/x402-client";
import { saveTradeRecord, getRecentTrades } from "@/lib/vault";

type TradeState = 
  | { type: "idle" }
  | { type: "loading"; message: string }
  | { type: "quote"; quote: SwapQuote; intent: { fromToken: string; toToken: string; amount: string } }
  | { type: "portfolio"; data: PortfolioResult }
  | { type: "balances"; data: TokenBalance[] }
  | { type: "price"; token: string; priceUSD: string }
  | { type: "analysis"; data: WalletAnalysis }
  | { type: "pnl"; data: PnLReport }
  | { type: "orders"; data: LimitOrder[] }
  | { type: "limit_created"; order: LimitOrder }
  | { type: "executing"; recordId: number }
  | { type: "success"; txHash?: string }
  | { type: "error"; message: string };

async function apiCall(endpoint: string, body: object) {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  
  if (!response.ok) {
    const data = await response.json().catch(() => ({ error: "Request failed" }));
    throw new Error(data.error || `API error: ${response.status}`);
  }
  
  return response.json();
}

export function TradeZone({ address, toast }: { address: string; toast: any }) {
  const [command, setCommand] = useState("");
  const [state, setState] = useState<TradeState>({ type: "idle" });

  const recentTrades = useLiveQuery(() => getRecentTrades(5), []);

  const executeCommand = async (cmd: string) => {
    if (!cmd.trim()) {
      toast({
        title: "Empty command",
        description: "Please enter a command.",
        variant: "destructive",
      });
      return;
    }

    if (!address) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet first.",
        variant: "destructive",
      });
      return;
    }

    const intent = parseTradeIntent(cmd);

    try {
      switch (intent.action) {
        case "swap": {
          if (!intent.fromToken || !intent.toToken || !intent.amount) {
            setState({ type: "error", message: "Could not parse swap details. Try: 'swap 100 USDC to ETH'" });
            return;
          }
          setState({ type: "loading", message: "Getting quote..." });

          const fromAddress = getTokenAddress(intent.fromToken);
          const toAddress = getTokenAddress(intent.toToken);

          if (!fromAddress || !toAddress) {
            setState({ type: "error", message: `Unknown token: ${!fromAddress ? intent.fromToken : intent.toToken}` });
            return;
          }

          const data = await apiCall("/api/x402/quote", {
            from_chain: "base",
            from_token: fromAddress,
            from_amount: intent.amount,
            to_chain: "base",
            to_token: toAddress,
            wallet_address: address,
            slippage: 2.0,
          });

          setState({
            type: "quote",
            quote: data.quote,
            intent: { fromToken: intent.fromToken, toToken: intent.toToken, amount: intent.amount },
          });
          break;
        }

        case "portfolio": {
          setState({ type: "loading", message: "Fetching portfolio..." });
          const data = await apiCall("/api/x402/portfolio", { wallet_address: address });
          setState({ type: "portfolio", data });
          await saveTradeRecord({
            action: "portfolio",
            inputCommand: cmd,
            status: "confirmed",
          });
          break;
        }

        case "balance": {
          setState({ type: "loading", message: "Fetching balances..." });
          const data = await apiCall("/api/x402/balances", { wallet_address: address });
          setState({ type: "balances", data: data.balances || [] });
          await saveTradeRecord({
            action: "balance",
            inputCommand: cmd,
            status: "confirmed",
          });
          break;
        }

        case "price": {
          const tokenSymbol = intent.tokenForPrice || "ETH";
          setState({ type: "loading", message: `Fetching ${tokenSymbol} price...` });
          const tokenAddress = getTokenAddress(tokenSymbol);
          if (!tokenAddress) {
            setState({ type: "error", message: `Unknown token: ${tokenSymbol}` });
            return;
          }
          const data = await apiCall("/api/x402/price", { token_address: tokenAddress, chain: "base" });
          setState({ type: "price", token: tokenSymbol, priceUSD: data.priceUSD });
          break;
        }

        case "analyze": {
          setState({ type: "loading", message: "Analyzing wallet..." });
          const data = await apiCall("/api/x402/analyze", { wallet_address: address });
          setState({ type: "analysis", data });
          await saveTradeRecord({
            action: "analyze",
            inputCommand: cmd,
            status: "confirmed",
          });
          break;
        }

        case "pnl": {
          const timeframe = intent.timeframe || "30d";
          setState({ type: "loading", message: `Fetching PnL report (${timeframe})...` });
          const data = await apiCall("/api/x402/pnl", { wallet_address: address, timeframe });
          setState({ type: "pnl", data });
          await saveTradeRecord({
            action: "pnl",
            inputCommand: cmd,
            status: "confirmed",
          });
          break;
        }

        case "orders": {
          setState({ type: "loading", message: "Fetching limit orders..." });
          const data = await apiCall("/api/x402/limit-orders", { wallet_address: address });
          setState({ type: "orders", data: data.orders || [] });
          break;
        }

        case "limit": {
          if (!intent.fromToken || !intent.targetPrice || !intent.amount) {
            setState({ type: "error", message: "Could not parse limit order. Try: 'limit buy 0.5 ETH at 3500' or 'limit sell 100 USDC at 3600'" });
            return;
          }
          setState({ type: "loading", message: "Creating limit order..." });

          const fromAddress = getTokenAddress(intent.fromToken);
          // For limit orders, if no toToken specified or it's USD, default to USDC as the quote token
          const toTokenSymbol = intent.toToken && intent.toToken !== "USD" ? intent.toToken : "USDC";
          const toAddress = getTokenAddress(toTokenSymbol);

          if (!fromAddress) {
            setState({ type: "error", message: `Unknown token: ${intent.fromToken}. Supported: ETH, USDC, USDT, DAI, WETH` });
            return;
          }

          if (!toAddress) {
            setState({ type: "error", message: `Unknown token: ${toTokenSymbol}. Supported: ETH, USDC, USDT, DAI, WETH` });
            return;
          }

          const data = await apiCall("/api/x402/limit-order", {
            wallet_address: address,
            from_token: fromAddress,
            to_token: toAddress,
            amount: intent.amount,
            target_price: intent.targetPrice,
            direction: intent.direction || "buy",
          });

          setState({ type: "limit_created", order: data.order });
          await saveTradeRecord({
            action: "limit",
            inputCommand: cmd,
            status: "confirmed",
          });
          break;
        }

        default:
          setState({ type: "error", message: "Unknown command. Try: 'swap 100 USDC to ETH', 'portfolio', 'analyze', 'pnl', or 'orders'" });
      }
    } catch (err) {
      console.error("Trade error:", err);
      const message = err instanceof Error ? err.message : "Unknown error";
      if (message.includes("402") || message.includes("payment")) {
        setState({ type: "error", message: "Payment required. The x402 API requires micropayments." });
      } else if (message.includes("network") || message.includes("fetch")) {
        setState({ type: "error", message: "Network error. Check your connection and try again." });
      } else {
        setState({ type: "error", message });
      }
    }
  };

  const handleSubmit = () => {
    executeCommand(command);
  };

  const handleConfirmSwap = async () => {
    if (state.type !== "quote") return;
    setState({ type: "error", message: "Swap execution requires wallet signing. This feature is coming soon." });
  };

  const handleCancel = () => {
    setState({ type: "idle" });
    setCommand("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const quickCommands = [
    { label: "Portfolio", command: "portfolio", icon: Wallet },
    { label: "Balances", command: "balance", icon: Wallet },
    { label: "Analyze", command: "analyze", icon: BarChart3 },
    { label: "PnL", command: "pnl 30d", icon: LineChart },
    { label: "Orders", command: "orders", icon: Target },
    { label: "ETH Price", command: "price ETH", icon: TrendingUp },
  ];

  const handleQuickCommand = (cmd: string) => {
    setCommand(cmd);
    executeCommand(cmd);
  };

  return (
    <div className="flex flex-col gap-4 p-4 max-w-2xl mx-auto">
      {/* Quick action buttons */}
      <div className="flex flex-wrap gap-2">
        {quickCommands.map((qc) => (
          <Button
            key={qc.command}
            variant="outline"
            size="sm"
            onClick={() => handleQuickCommand(qc.command)}
            disabled={state.type === "loading" || state.type === "executing"}
            className="border-white/10 text-gray-300 hover:bg-purple-500/10 hover:text-purple-300 hover:border-purple-500/30 text-xs font-medium"
            data-testid={`button-quick-${qc.label.toLowerCase().replace(" ", "-")}`}
          >
            <qc.icon className="w-3 h-3 mr-1" />
            {qc.label}
          </Button>
        ))}
      </div>

      <div className="flex gap-2">
        <Input
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="swap 100 USDC to ETH, analyze, pnl 30d, limit buy 100 USDC at 3500..."
          className="flex-1 bg-[#0a0a0a] border-white/10 text-white placeholder:text-gray-500 focus:border-purple-500/50"
          disabled={state.type === "loading" || state.type === "executing"}
          data-testid="input-trade-command"
        />
        <Button
          onClick={handleSubmit}
          disabled={!command.trim() || state.type === "loading" || state.type === "executing"}
          className="bg-purple-600 hover:bg-purple-700 text-white"
          data-testid="button-submit-trade"
        >
          {state.type === "loading" || state.type === "executing" ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <ArrowRight className="w-4 h-4" />
          )}
        </Button>
      </div>

      {state.type === "loading" && (
        <Card className="bg-[#0a0a0a] border-white/5">
          <CardContent className="p-4 flex items-center gap-3 text-gray-400">
            <Loader2 className="w-5 h-5 animate-spin text-purple-400" />
            <span>{state.message}</span>
          </CardContent>
        </Card>
      )}

      {state.type === "error" && (
        <Card className="bg-[#0a0a0a] border-red-500/20">
          <CardContent className="p-4 flex items-center gap-3 text-red-400">
            <XCircle className="w-5 h-5" />
            <span>{state.message}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancel}
              className="ml-auto text-gray-400 hover:text-white"
              data-testid="button-dismiss-error"
            >
              Dismiss
            </Button>
          </CardContent>
        </Card>
      )}

      {state.type === "quote" && (
        <Card className="bg-[#0a0a0a] border-purple-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-400" />
              Swap Quote
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">From</span>
              <span className="text-white font-medium" data-testid="text-quote-from">
                {state.intent.amount} {state.intent.fromToken}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">To (estimated)</span>
              <span className="text-green-400 font-medium" data-testid="text-quote-to">
                {state.quote.estimatedOutput} {state.intent.toToken}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Price Impact</span>
              <span className="text-yellow-400" data-testid="text-price-impact">
                {state.quote.price_impact}%
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Gas Estimate</span>
              <span className="text-gray-300" data-testid="text-gas-estimate">
                {state.quote.gas_estimate}
              </span>
            </div>
            <div className="flex gap-2 pt-2">
              <Button
                onClick={handleConfirmSwap}
                className="flex-1 bg-purple-600 hover:bg-purple-700"
                data-testid="button-confirm-swap"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Confirm Swap
              </Button>
              <Button
                onClick={handleCancel}
                variant="outline"
                className="flex-1 border-white/10 text-gray-300 hover:bg-white/5"
                data-testid="button-cancel-swap"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {state.type === "executing" && (
        <Card className="bg-[#0a0a0a] border-purple-500/20">
          <CardContent className="p-4 flex items-center gap-3 text-purple-400">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Executing swap... Please sign the transaction in your wallet.</span>
          </CardContent>
        </Card>
      )}

      {state.type === "success" && (
        <Card className="bg-[#0a0a0a] border-green-500/20">
          <CardContent className="p-4 flex items-center gap-3 text-green-400">
            <CheckCircle className="w-5 h-5" />
            <span>Swap completed successfully!</span>
            {state.txHash && (
              <a
                href={`https://basescan.org/tx/${state.txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-auto text-purple-400 hover:text-purple-300 text-sm underline"
                data-testid="link-tx-hash"
              >
                View TX
              </a>
            )}
          </CardContent>
        </Card>
      )}

      {state.type === "portfolio" && (
        <Card className="bg-[#0a0a0a] border-white/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-white flex items-center gap-2">
              <Wallet className="w-5 h-5 text-purple-400" />
              Portfolio
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-2xl font-bold text-white" data-testid="text-portfolio-total">
              {formatUSD(state.data.total_value_usd)}
            </div>
            <div className="space-y-1">
              {state.data.balances?.map((bal, i) => (
                <div key={i} className="flex justify-between text-sm" data-testid={`row-balance-${i}`}>
                  <span className="text-gray-400">{bal.asset}</span>
                  <span className="text-white">
                    {bal.balance} <span className="text-gray-500">({formatUSD(bal.balance_usd)})</span>
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {state.type === "balances" && (
        <Card className="bg-[#0a0a0a] border-white/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-white flex items-center gap-2">
              <Wallet className="w-5 h-5 text-purple-400" />
              Balances
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {state.data.length > 0 ? (
              state.data.map((bal, i) => (
                <div key={i} className="flex justify-between text-sm" data-testid={`row-balance-${i}`}>
                  <span className="text-gray-400">{bal.asset} ({bal.chain})</span>
                  <span className="text-white">
                    {bal.balance} <span className="text-gray-500">({formatUSD(bal.balance_usd)})</span>
                  </span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm">No balances found</p>
            )}
          </CardContent>
        </Card>
      )}

      {state.type === "price" && (
        <Card className="bg-[#0a0a0a] border-white/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-400" />
              Token Price
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-xl font-bold text-white">{state.token}</span>
              <span className="text-2xl font-black text-green-400">{formatUSD(state.priceUSD)}</span>
            </div>
            <p className="text-xs text-gray-500 mt-2">Price on Base network</p>
          </CardContent>
        </Card>
      )}

      {state.type === "analysis" && (
        <Card className="bg-[#0a0a0a] border-white/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-purple-400" />
              Wallet Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/5 rounded-lg p-3">
                <p className="text-xs text-gray-500">Total Trades</p>
                <p className="text-xl font-bold text-white">{state.data.total_trades}</p>
              </div>
              <div className="bg-white/5 rounded-lg p-3">
                <p className="text-xs text-gray-500">Win Rate</p>
                <p className="text-xl font-bold text-green-400">{state.data.win_rate}</p>
              </div>
              <div className="bg-white/5 rounded-lg p-3">
                <p className="text-xs text-gray-500">Avg Trade Size</p>
                <p className="text-xl font-bold text-white">{formatUSD(state.data.avg_trade_size)}</p>
              </div>
              <div className="bg-white/5 rounded-lg p-3">
                <p className="text-xs text-gray-500">Risk Score</p>
                <p className="text-xl font-bold text-yellow-400">{state.data.risk_score}</p>
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Trading Style</p>
              <p className="text-sm text-white">{state.data.trading_style}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Most Traded Tokens</p>
              <div className="flex flex-wrap gap-1">
                {state.data.most_traded_tokens?.map((token, i) => (
                  <span key={i} className="px-2 py-0.5 bg-purple-500/20 text-purple-300 rounded text-xs">
                    {token}
                  </span>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {state.type === "pnl" && (
        <Card className="bg-[#0a0a0a] border-white/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-white flex items-center gap-2">
              <LineChart className="w-5 h-5 text-purple-400" />
              PnL Report ({state.data.timeframe})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-center py-2">
              <p className="text-xs text-gray-500">Total PnL</p>
              <p className={`text-3xl font-bold ${parseFloat(state.data.total_pnl) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {parseFloat(state.data.total_pnl) >= 0 ? '+' : ''}{formatUSD(state.data.total_pnl)}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/5 rounded-lg p-3">
                <p className="text-xs text-gray-500">Realized</p>
                <p className={`text-lg font-bold ${parseFloat(state.data.realized_pnl) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {formatUSD(state.data.realized_pnl)}
                </p>
              </div>
              <div className="bg-white/5 rounded-lg p-3">
                <p className="text-xs text-gray-500">Unrealized</p>
                <p className={`text-lg font-bold ${parseFloat(state.data.unrealized_pnl) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {formatUSD(state.data.unrealized_pnl)}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-green-500/10 rounded-lg p-3 border border-green-500/20">
                <p className="text-xs text-gray-500">Best Trade</p>
                <p className="text-sm text-white">{state.data.best_trade?.token}</p>
                <p className="text-lg font-bold text-green-400">+{formatUSD(state.data.best_trade?.pnl || "0")}</p>
              </div>
              <div className="bg-red-500/10 rounded-lg p-3 border border-red-500/20">
                <p className="text-xs text-gray-500">Worst Trade</p>
                <p className="text-sm text-white">{state.data.worst_trade?.token}</p>
                <p className="text-lg font-bold text-red-400">{formatUSD(state.data.worst_trade?.pnl || "0")}</p>
              </div>
            </div>
            <p className="text-xs text-gray-500 text-center">{state.data.trade_count} trades in this period</p>
          </CardContent>
        </Card>
      )}

      {state.type === "orders" && (
        <Card className="bg-[#0a0a0a] border-white/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-white flex items-center gap-2">
              <Target className="w-5 h-5 text-purple-400" />
              Limit Orders
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {state.data.length > 0 ? (
              state.data.map((order, i) => (
                <div key={order.order_id} className="bg-white/5 rounded-lg p-3" data-testid={`row-order-${i}`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded ${order.direction === 'buy' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                      {order.direction.toUpperCase()}
                    </span>
                    <span className={`text-xs ${order.status === 'pending' ? 'text-yellow-400' : order.status === 'filled' ? 'text-green-400' : 'text-gray-400'}`}>
                      {order.status}
                    </span>
                  </div>
                  <p className="text-sm text-white">
                    {order.amount} {order.from_token} → {order.to_token}
                  </p>
                  <p className="text-xs text-gray-500">Target: {formatUSD(order.target_price)}</p>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm text-center py-4">No active limit orders</p>
            )}
          </CardContent>
        </Card>
      )}

      {state.type === "limit_created" && (
        <Card className="bg-[#0a0a0a] border-green-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-white flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              Limit Order Created
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Direction</span>
              <span className={`font-medium ${state.order.direction === 'buy' ? 'text-green-400' : 'text-red-400'}`}>
                {state.order.direction.toUpperCase()}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Amount</span>
              <span className="text-white">{state.order.amount} {state.order.from_token}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Target Price</span>
              <span className="text-white">{formatUSD(state.order.target_price)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Status</span>
              <span className="text-yellow-400">{state.order.status}</span>
            </div>
            <Button
              onClick={handleCancel}
              variant="outline"
              className="w-full mt-2 border-white/10 text-gray-300 hover:bg-white/5"
              data-testid="button-dismiss-order"
            >
              Done
            </Button>
          </CardContent>
        </Card>
      )}

      {recentTrades && recentTrades.length > 0 && (
        <Card className="bg-[#0a0a0a] border-white/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-400 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {recentTrades.map((trade) => (
              <div
                key={trade.id}
                className="flex items-center justify-between text-sm py-1 border-b border-white/5 last:border-0"
                data-testid={`row-trade-${trade.id}`}
              >
                <div className="flex items-center gap-2">
                  {trade.status === "confirmed" && <CheckCircle className="w-3 h-3 text-green-400" />}
                  {trade.status === "pending" && <Loader2 className="w-3 h-3 text-yellow-400 animate-spin" />}
                  {trade.status === "failed" && <XCircle className="w-3 h-3 text-red-400" />}
                  {trade.status === "cancelled" && <XCircle className="w-3 h-3 text-gray-400" />}
                  <span className="text-gray-300 truncate max-w-[200px]">{trade.inputCommand}</span>
                </div>
                <span className="text-gray-500 text-xs">
                  {new Date(trade.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
