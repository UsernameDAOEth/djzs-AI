import "dotenv/config";
import { Agent } from "@xmtp/agent-sdk";

function djzsReply(text: string): string | null {
  const t = (text || "").trim();

  if (t.startsWith("/help")) {
    return [
      "DJZS Agent commands:",
      "",
      "📋 Zones:",
      "• /zones — List all zones",
      "",
      "Type /zones to see what's available.",
    ].join("\n");
  }

  if (t.startsWith("/zones")) {
    return [
      "DJZS Zones (v1):",
      "01 Journal • Daily reflections with AI thinking partner",
      "02 Research • Gather claims, track evidence, surface unknowns",
    ].join("\n");
  }

  return null;
}

async function main() {
  const agent = await Agent.createFromEnv({
    env: (process.env.XMTP_ENV as "dev" | "production") || "dev",
  });

  console.log("DJZS XMTP Agent online");

  agent.on("text", async (ctx: any) => {
    try {
      const incoming = ctx?.message?.content || "";

      const reply = djzsReply(incoming);
      if (reply) {
        await ctx.sendText(reply);
        return;
      }

      await ctx.sendText(
        "I'm DJZS Agent. Type /help for commands."
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
