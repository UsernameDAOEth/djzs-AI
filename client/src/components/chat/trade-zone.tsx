import { useState, useEffect, useMemo } from "react";
import { useWalletClient } from "wagmi";
import { useLiveQuery } from "dexie-react-hooks";
import { TrendingUp, Wallet, ArrowRight, Loader2, CheckCircle, XCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  createX402Client,
  parseTradeIntent,
  getSwapQuote,
  executeSwap,
  getPortfolio,
  getBalances,
  getTokenPrice,
  formatUSD,
  getTokenAddress,
  type SwapQuote,
  type PortfolioResult,
  type TokenBalance,
} from "@/lib/x402-client";
import { saveTradeRecord, updateTradeRecord, getRecentTrades, type TradeRecord } from "@/lib/vault";

type TradeState = 
  | { type: "idle" }
  | { type: "loading"; message: string }
  | { type: "quote"; quote: SwapQuote; intent: { fromToken: string; toToken: string; amount: string } }
  | { type: "portfolio"; data: PortfolioResult }
  | { type: "balances"; data: TokenBalance[] }
  | { type: "price"; token: string; priceUSD: string }
  | { type: "executing"; recordId: number }
  | { type: "success"; txHash?: string }
  | { type: "error"; message: string };

export function TradeZone({ address, toast }: { address: string; toast: any }) {
  const [command, setCommand] = useState("");
  const [state, setState] = useState<TradeState>({ type: "idle" });
  const { data: walletClient } = useWalletClient();

  const recentTrades = useLiveQuery(() => getRecentTrades(5), []);

  const x402Client = useMemo(() => {
    if (!walletClient) return null;
    return createX402Client(walletClient);
  }, [walletClient]);

  const executeCommand = async (cmd: string) => {
    if (!cmd.trim() || !x402Client || !walletClient) {
      toast({
        title: "Wallet not ready",
        description: "Please ensure your wallet is connected.",
        variant: "destructive",
      });
      return;
    }

    const intent = parseTradeIntent(cmd);

    try {
      switch (intent.action) {
        case "swap": {
          if (!intent.fromToken || !intent.toToken || !intent.amount) {
            setState({ type: "error", message: "Could not parse swap details" });
            return;
          }
          setState({ type: "loading", message: "Getting quote..." });

          const fromAddress = getTokenAddress(intent.fromToken);
          const toAddress = getTokenAddress(intent.toToken);

          if (!fromAddress || !toAddress) {
            setState({ type: "error", message: `Unknown token: ${!fromAddress ? intent.fromToken : intent.toToken}` });
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
          setState({ type: "loading", message: "Fetching portfolio..." });
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
          setState({ type: "loading", message: "Fetching balances..." });
          const { balances } = await getBalances(x402Client, address);
          setState({ type: "balances", data: balances });
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
          const { priceUSD } = await getTokenPrice(x402Client, tokenAddress, "base");
          setState({ type: "price", token: tokenSymbol, priceUSD });
          break;
        }

        default:
          setState({ type: "error", message: "Unknown command. Try: 'swap 100 USDC to ETH', 'portfolio', or 'price ETH'" });
      }
    } catch (err) {
      console.error("Trade error:", err);
      const message = err instanceof Error ? err.message : "Unknown error";
      if (message.includes("402") || message.includes("payment")) {
        setState({ type: "error", message: "Payment required. Ensure your wallet has ETH for API calls." });
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
    if (state.type !== "quote" || !x402Client) return;

    const { quote, intent } = state;
    
    const recordId = await saveTradeRecord({
      action: "swap",
      inputCommand: command,
      fromToken: intent.fromToken,
      toToken: intent.toToken,
      amount: intent.amount,
      quoteData: JSON.stringify(quote),
      status: "pending",
    });

    setState({ type: "executing", recordId });

    try {
      const fromAddress = getTokenAddress(intent.fromToken)!;
      const toAddress = getTokenAddress(intent.toToken)!;

      const result = await executeSwap(x402Client, {
        from_chain: "base",
        from_token: fromAddress,
        from_amount: intent.amount,
        to_chain: "base",
        to_token: toAddress,
        wallet_address: address,
        slippage: 2.0,
        dry_run: false,
      });

      const txHash = result.tasks.find(t => t.tx_hash)?.tx_hash;
      
      await updateTradeRecord(recordId, {
        status: "confirmed",
        txHash,
        completedAt: new Date(),
      });

      setState({ type: "success", txHash });
      toast({
        title: "Swap executed!",
        description: txHash ? `TX: ${txHash.slice(0, 10)}...` : "Swap completed successfully",
      });
    } catch (err) {
      console.error("Swap execution failed:", err);
      await updateTradeRecord(recordId, { status: "failed" });
      setState({ type: "error", message: err instanceof Error ? err.message : "Swap failed" });
      toast({
        title: "Swap failed",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      });
    }
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
    { label: "Portfolio", command: "portfolio" },
    { label: "Balances", command: "balance" },
    { label: "ETH Price", command: "price ETH" },
    { label: "USDC Price", command: "price USDC" },
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
            {qc.label}
          </Button>
        ))}
      </div>

      <div className="flex gap-2">
        <Input
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="swap 100 USDC to ETH, portfolio, price ETH..."
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
              {state.data.balances.map((bal, i) => (
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
            {state.data.map((bal, i) => (
              <div key={i} className="flex justify-between text-sm" data-testid={`row-balance-${i}`}>
                <span className="text-gray-400">{bal.asset} ({bal.chain})</span>
                <span className="text-white">
                  {bal.balance} <span className="text-gray-500">({formatUSD(bal.balance_usd)})</span>
                </span>
              </div>
            ))}
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

      {recentTrades && recentTrades.length > 0 && (
        <Card className="bg-[#0a0a0a] border-white/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-400 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Recent Trades
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
