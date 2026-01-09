import { useState, useMemo, useEffect } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { useWalletClient, useAccount, useChainId } from "wagmi";
import { TrendingUp, Wallet, ArrowRight, Loader2, CheckCircle, XCircle, BarChart3, Target, LineChart, DollarSign, Clock, HelpCircle, RotateCcw, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  parseTradeIntent,
  formatUSD,
  getTokenAddress,
  createX402Client,
  getPortfolio,
  getBalances,
  getTokenPrice,
  getSwapQuote,
  analyzeWallet,
  getPnLReport,
  searchToken,
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

const COMMAND_HELP = [
  { cmd: "portfolio", desc: "View your token holdings with USD values", example: "portfolio" },
  { cmd: "balance", desc: "See all token balances across chains", example: "balance" },
  { cmd: "price [TOKEN]", desc: "Get current token price", example: "price ETH" },
  { cmd: "swap [AMT] [FROM] to [TO]", desc: "Get a swap quote", example: "swap 100 USDC to ETH" },
  { cmd: "analyze", desc: "Analyze your trading patterns", example: "analyze" },
  { cmd: "pnl [TIMEFRAME]", desc: "View profit/loss report", example: "pnl 30d" },
];

export function TradeZone({ address, toast }: { address: string; toast: any }) {
  const [command, setCommand] = useState("");
  const [state, setState] = useState<TradeState>({ type: "idle" });
  const [lastCommand, setLastCommand] = useState<string | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  const { data: walletClient } = useWalletClient();
  const { address: connectedAddress } = useAccount();
  const chainId = useChainId();

  const x402Client = useMemo(() => {
    if (!walletClient) return null;
    return createX402Client(walletClient);
  }, [walletClient, connectedAddress, chainId]);

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

    if (!x402Client) {
      toast({
        title: "Wallet not ready",
        description: "Please wait for wallet connection to complete.",
        variant: "destructive",
      });
      return;
    }

    setLastCommand(cmd);
    const intent = parseTradeIntent(cmd);

    try {
      switch (intent.action) {
        case "swap": {
          if (!intent.fromToken || !intent.toToken || !intent.amount) {
            setState({ type: "error", message: "Could not parse swap details. Try: 'swap 100 USDC to ETH'" });
            return;
          }
          setState({ type: "loading", message: "Getting quote... (your wallet will sign a micropayment)" });

          let fromAddress = getTokenAddress(intent.fromToken);
          let toAddress = getTokenAddress(intent.toToken);

          if (!fromAddress) {
            try {
              const results = await searchToken(x402Client, intent.fromToken, 1);
              if (results?.length > 0) {
                fromAddress = results[0].address;
              }
            } catch (e) {
              console.error("Token search failed:", e);
            }
          }

          if (!toAddress) {
            try {
              const results = await searchToken(x402Client, intent.toToken, 1);
              if (results?.length > 0) {
                toAddress = results[0].address;
              }
            } catch (e) {
              console.error("Token search failed:", e);
            }
          }

          if (!fromAddress || !toAddress) {
            setState({ type: "error", message: `Unknown token: ${!fromAddress ? intent.fromToken : intent.toToken}. Try common tokens like ETH, USDC, USDT, DAI.` });
            return;
          }

          const quote = await getSwapQuote(x402Client, {
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
            quote,
            intent: { fromToken: intent.fromToken, toToken: intent.toToken, amount: intent.amount },
          });
          break;
        }

        case "portfolio": {
          setState({ type: "loading", message: "Fetching portfolio... (your wallet will sign a micropayment)" });
          const data = await getPortfolio(x402Client, address);
          setState({ type: "portfolio", data });
          await saveTradeRecord({
            action: "portfolio",
            inputCommand: cmd,
            status: "confirmed",
          });
          break;
        }

        case "balance": {
          setState({ type: "loading", message: "Fetching balances... (your wallet will sign a micropayment)" });
          const data = await getBalances(x402Client, address);
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
          setState({ type: "loading", message: `Fetching ${tokenSymbol} price... (your wallet will sign a micropayment)` });
          
          let tokenAddress = getTokenAddress(tokenSymbol);
          if (!tokenAddress) {
            try {
              const results = await searchToken(x402Client, tokenSymbol, 1);
              if (results?.length > 0) {
                tokenAddress = results[0].address;
              }
            } catch (e) {
              console.error("Token search failed:", e);
            }
          }

          if (!tokenAddress) {
            setState({ type: "error", message: `Unknown token: ${tokenSymbol}. Try common tokens like ETH, USDC, USDT, DAI.` });
            return;
          }
          const data = await getTokenPrice(x402Client, tokenAddress, "base");
          setState({ type: "price", token: tokenSymbol, priceUSD: data.priceUSD });
          break;
        }

        case "analyze": {
          setState({ type: "loading", message: "Analyzing wallet... (your wallet will sign a micropayment)" });
          const data = await analyzeWallet(x402Client, address);
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
          setState({ type: "loading", message: `Fetching PnL report (${timeframe})... (your wallet will sign a micropayment)` });
          const data = await getPnLReport(x402Client, address, timeframe);
          setState({ type: "pnl", data });
          await saveTradeRecord({
            action: "pnl",
            inputCommand: cmd,
            status: "confirmed",
          });
          break;
        }

        case "orders": {
          setState({ type: "error", message: "Limit orders feature coming soon." });
          break;
        }

        case "limit": {
          setState({ type: "error", message: "Limit orders feature coming soon." });
          break;
        }

        default:
          setState({ type: "error", message: "Unknown command. Try: 'swap 100 USDC to ETH', 'portfolio', 'balance', or 'price ETH'" });
      }
    } catch (err) {
      console.error("Trade error:", err);
      const message = err instanceof Error ? err.message : "Unknown error";
      if (message.includes("rejected") || message.includes("denied")) {
        setState({ type: "error", message: "Payment rejected. You cancelled the micropayment signature." });
      } else if (message.includes("insufficient") || message.includes("balance")) {
        setState({ type: "error", message: "Insufficient balance for micropayment. Add funds to your wallet." });
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

  const handleRetry = () => {
    if (lastCommand) {
      setCommand(lastCommand);
      executeCommand(lastCommand);
    }
  };

  const handleHistoryClick = (cmd: string) => {
    setCommand(cmd);
    executeCommand(cmd);
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
    { label: "ETH Price", command: "price ETH", icon: TrendingUp },
  ];

  const handleQuickCommand = (cmd: string) => {
    setCommand(cmd);
    executeCommand(cmd);
  };

  return (
    <div className="flex flex-col gap-4 p-4 max-w-2xl mx-auto">
      {/* Micropayments info banner */}
      <div className="flex items-center gap-2 px-3 py-2 bg-purple-500/10 border border-purple-500/20 rounded-lg text-xs text-purple-300">
        <DollarSign className="w-4 h-4 flex-shrink-0" />
        <span>Your wallet signs micropayments for API calls. You pay for your own data — no shared server costs.</span>
      </div>

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
        <Popover open={showHelp} onOpenChange={setShowHelp}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="border-white/10 text-gray-400 hover:text-purple-300 hover:border-purple-500/30"
              data-testid="button-help"
            >
              <HelpCircle className="w-4 h-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 bg-[#0a0a0a] border-white/10 p-0" align="start">
            <div className="p-3 border-b border-white/10">
              <h4 className="font-medium text-white text-sm">Available Commands</h4>
            </div>
            <div className="p-2 space-y-1 max-h-64 overflow-y-auto">
              {COMMAND_HELP.map((help, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setCommand(help.example);
                    setShowHelp(false);
                  }}
                  className="w-full text-left p-2 rounded hover:bg-white/5 transition-colors"
                  data-testid={`button-help-cmd-${i}`}
                >
                  <div className="text-xs font-mono text-purple-300">{help.cmd}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{help.desc}</div>
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
        <Input
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="portfolio, balance, price ETH, swap 100 USDC to ETH..."
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
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-3 text-red-400">
              <XCircle className="w-5 h-5 flex-shrink-0" />
              <span className="flex-1">{state.message}</span>
            </div>
            <div className="flex gap-2 justify-end">
              {lastCommand && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRetry}
                  className="border-purple-500/30 text-purple-300 hover:bg-purple-500/10"
                  data-testid="button-retry"
                >
                  <RotateCcw className="w-3 h-3 mr-1" />
                  Retry
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancel}
                className="text-gray-400 hover:text-white"
                data-testid="button-dismiss-error"
              >
                Dismiss
              </Button>
            </div>
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
              <History className="w-4 h-4" />
              Command History
              <span className="text-xs text-gray-600 ml-auto">Click to re-run</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {recentTrades.map((trade) => (
              <button
                key={trade.id}
                onClick={() => trade.inputCommand && handleHistoryClick(trade.inputCommand)}
                className="w-full flex items-center justify-between text-sm py-2 px-2 rounded border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors text-left"
                disabled={state.type === "loading" || state.type === "executing"}
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
              </button>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
