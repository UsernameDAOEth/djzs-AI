import "dotenv/config";
import { Agent } from "@xmtp/agent-sdk";
import {
  getTokenPrice,
  getPortfolio,
  getBalances,
  analyzeWallet,
  getPnLReport,
  getSwapQuote,
  getTokenAddress,
  formatUSD,
  formatTokenAmount,
} from "./x402-api";

function djzsReply(text: string): string | null {
  const t = (text || "").trim();

  if (t.startsWith("/help")) {
    return [
      "DJZS Agent commands:",
      "",
      "📊 Trading:",
      "• /price ETH — Get token price",
      "• /portfolio 0x... — View wallet holdings",
      "• /balance 0x... — Token balances",
      "• /analyze 0x... — Wallet trading analysis",
      "• /pnl 0x... [30d] — Profit/loss report",
      "• /quote 100 USDC to ETH — Get swap quote",
      "",
      "📋 Zones:",
      "• /zones — List all zones",
      "• /format signal — Signal card format",
      "",
      "Tip: Commands require wallet address for portfolio data.",
    ].join("\n");
  }

  if (t.startsWith("/zones")) {
    return [
      "DJZS Zones (v1):",
      "01 Journal • Daily reflections with AI",
      "02 Research • Evidence-based analysis",
      "03 Trade • Crypto trading zone",
      "04 Predictions • Voting markets",
      "05 Events • Calendar coordination",
    ].join("\n");
  }

  if (t.startsWith("/format")) {
    return [
      "Signal format (copy/paste):",
      "Asset: ",
      "Direction: Long/Short",
      "Entry: ",
      "Targets: ",
      "Stop: ",
      "Invalidation: ",
      "Thesis: ",
      "Timeframe: ",
    ].join("\n");
  }

  if (t.startsWith("/summarize")) {
    return "Summarize is coming next: I'll fetch recent messages and compress into a Zone Memory card.";
  }

  return null;
}

async function handleTradeCommand(text: string): Promise<string | null> {
  const t = (text || "").trim().toLowerCase();

  // /price ETH or /price 0x...
  if (t.startsWith("/price")) {
    const parts = t.split(/\s+/);
    const tokenInput = parts[1];
    if (!tokenInput) {
      return "Usage: /price <TOKEN>\nExample: /price ETH";
    }

    try {
      const tokenAddress = getTokenAddress(tokenInput.toUpperCase()) || tokenInput;
      const result = await getTokenPrice(tokenAddress);
      return `💰 ${tokenInput.toUpperCase()} Price: ${formatUSD(result.priceUSD)}`;
    } catch (error) {
      return `Error fetching price: ${error instanceof Error ? error.message : "Unknown error"}`;
    }
  }

  // /portfolio 0x...
  if (t.startsWith("/portfolio")) {
    const parts = t.split(/\s+/);
    const wallet = parts[1];
    if (!wallet || !wallet.startsWith("0x")) {
      return "Usage: /portfolio <wallet_address>\nExample: /portfolio 0x1234...";
    }

    try {
      const result = await getPortfolio(wallet);
      const lines = [
        `📊 Portfolio for ${wallet.slice(0, 6)}...${wallet.slice(-4)}`,
        `Total Value: ${formatUSD(result.total_value_usd)}`,
        "",
        "Holdings:",
      ];

      const topBalances = result.balances
        .filter((b) => parseFloat(b.balance_usd) > 0.01)
        .slice(0, 5);

      for (const b of topBalances) {
        lines.push(`• ${b.asset}: ${formatTokenAmount(b.balance)} (${formatUSD(b.balance_usd)})`);
      }

      if (result.balances.length > 5) {
        lines.push(`... and ${result.balances.length - 5} more tokens`);
      }

      return lines.join("\n");
    } catch (error) {
      return `Error fetching portfolio: ${error instanceof Error ? error.message : "Unknown error"}`;
    }
  }

  // /balance 0x...
  if (t.startsWith("/balance")) {
    const parts = t.split(/\s+/);
    const wallet = parts[1];
    if (!wallet || !wallet.startsWith("0x")) {
      return "Usage: /balance <wallet_address>\nExample: /balance 0x1234...";
    }

    try {
      const result = await getBalances(wallet);
      const lines = [
        `💰 Balances for ${wallet.slice(0, 6)}...${wallet.slice(-4)}`,
        "",
      ];

      const balances = result.balances
        .filter((b) => parseFloat(b.balance) > 0)
        .slice(0, 10);

      for (const b of balances) {
        lines.push(`• ${b.asset} (${b.chain}): ${formatTokenAmount(b.balance)}`);
      }

      return lines.join("\n");
    } catch (error) {
      return `Error fetching balances: ${error instanceof Error ? error.message : "Unknown error"}`;
    }
  }

  // /analyze 0x...
  if (t.startsWith("/analyze")) {
    const parts = t.split(/\s+/);
    const wallet = parts[1];
    if (!wallet || !wallet.startsWith("0x")) {
      return "Usage: /analyze <wallet_address>\nExample: /analyze 0x1234...";
    }

    try {
      const result = await analyzeWallet(wallet);
      return [
        `📈 Wallet Analysis: ${wallet.slice(0, 6)}...${wallet.slice(-4)}`,
        "",
        `Total Trades: ${result.total_trades}`,
        `Win Rate: ${result.win_rate}`,
        `Avg Trade Size: ${result.avg_trade_size}`,
        `Trading Style: ${result.trading_style}`,
        `Risk Score: ${result.risk_score}`,
        "",
        `Most Traded: ${result.most_traded_tokens.join(", ")}`,
      ].join("\n");
    } catch (error) {
      return `Error analyzing wallet: ${error instanceof Error ? error.message : "Unknown error"}`;
    }
  }

  // /pnl 0x... 30d
  if (t.startsWith("/pnl")) {
    const parts = t.split(/\s+/);
    const wallet = parts[1];
    const timeframe = parts[2] || "30d";

    if (!wallet || !wallet.startsWith("0x")) {
      return "Usage: /pnl <wallet_address> [timeframe]\nExample: /pnl 0x1234... 30d";
    }

    try {
      const result = await getPnLReport(wallet, timeframe);
      const pnlColor = parseFloat(result.total_pnl) >= 0 ? "📈" : "📉";

      return [
        `${pnlColor} PnL Report (${result.timeframe}): ${wallet.slice(0, 6)}...${wallet.slice(-4)}`,
        "",
        `Total PnL: ${result.total_pnl}`,
        `Realized: ${result.realized_pnl}`,
        `Unrealized: ${result.unrealized_pnl}`,
        `Trade Count: ${result.trade_count}`,
        "",
        `Best Trade: ${result.best_trade.token} (${result.best_trade.pnl})`,
        `Worst Trade: ${result.worst_trade.token} (${result.worst_trade.pnl})`,
      ].join("\n");
    } catch (error) {
      return `Error fetching PnL: ${error instanceof Error ? error.message : "Unknown error"}`;
    }
  }

  // /quote 100 USDC to ETH
  if (t.startsWith("/quote")) {
    const originalText = (text || "").trim();
    const match = originalText.match(/\/quote\s+(\d+(?:\.\d+)?)\s*(\S+)\s+(?:to|for)\s+(\S+)/i);
    if (!match) {
      return "Usage: /quote <amount> <fromToken> to <toToken>\nExample: /quote 100 USDC to ETH";
    }

    const [, amount, fromToken, toToken] = match;
    const fromTokenResolved = fromToken.startsWith("0x") ? fromToken : fromToken.toUpperCase();
    const toTokenResolved = toToken.startsWith("0x") ? toToken : toToken.toUpperCase();

    try {
      const quote = await getSwapQuote(
        fromTokenResolved,
        toTokenResolved,
        amount,
        "0x0000000000000000000000000000000000000000" // placeholder for quote
      );

      return [
        `💱 Swap Quote`,
        "",
        `${formatTokenAmount(amount)} ${fromTokenResolved} → ${formatTokenAmount(quote.estimatedOutput)} ${toTokenResolved}`,
        `Price Impact: ${quote.price_impact}`,
        `Gas Estimate: ${quote.gas_estimate}`,
        `Route: ${quote.route.join(" → ")}`,
        "",
        "Use the Trade Zone in DJZS to execute swaps.",
      ].join("\n");
    } catch (error) {
      return `Error getting quote: ${error instanceof Error ? error.message : "Unknown error"}`;
    }
  }

  return null;
}

async function main() {
  const agent = await Agent.createFromEnv({
    env: (process.env.XMTP_ENV as "dev" | "production") || "dev",
  });

  console.log("✅ DJZS XMTP Agent online (with Trade Zone integration)");

  agent.on("text", async (ctx: any) => {
    try {
      const incoming = ctx?.message?.content || "";

      // Try standard commands first
      const standardReply = djzsReply(incoming);
      if (standardReply) {
        await ctx.sendText(standardReply);
        return;
      }

      // Try trade commands
      const tradeReply = await handleTradeCommand(incoming);
      if (tradeReply) {
        await ctx.sendText(tradeReply);
        return;
      }

      // Default response
      await ctx.sendText(
        "I'm DJZS Agent. Type /help for commands.\n\nTrade Zone commands: /price, /portfolio, /analyze, /pnl, /quote"
      );
    } catch (err) {
      console.error("Agent error:", err);
    }
  });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
