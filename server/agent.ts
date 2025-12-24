import "dotenv/config";
import { Agent } from "@xmtp/agent-sdk";

// DJZS system prompt (keep short; expand later)
function djzsReply(text: string): string {
  const t = (text || "").trim();

  if (t.startsWith("/help")) {
    return [
      "DJZS Agent commands:",
      "• /zones — list zones",
      "• /summarize — summarize last messages (stub)",
      "• /format signal — how to post a Signal card",
      "",
      "Tip: Start messages with / for commands.",
    ].join("\n");
  }

  if (t.startsWith("/zones")) {
    return [
      "DJZS Zones (v1):",
      "01 User Zone • 02 Trades • 03 Predictions • 04 Events • 05 Payments",
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

  // default behavior
  return "I'm DJZS Agent. Type /help for commands. If you post a Signal/Prediction/Event, I can format it into a Zone Card.";
}

async function main() {
  // Official XMTP pattern: create agent from env + respond to text events
  const agent = await Agent.createFromEnv({
    env: (process.env.XMTP_ENV as "dev" | "production") || "dev",
  });

  console.log("✅ DJZS XMTP Agent online");

  agent.on("text", async (ctx: any) => {
    try {
      const incoming = ctx?.message?.content || "";
      const reply = djzsReply(incoming);
      await ctx.sendText(reply);
    } catch (err) {
      console.error("Agent error:", err);
    }
  });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
