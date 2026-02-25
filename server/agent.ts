import "dotenv/config";
import { Agent } from "@xmtp/agent-sdk";
import {
  runAgent,
  detectIntent,
  extractContent,
  formatJournalReply,
  formatAdversarialReply,
  type JournalInsightPayload,
  type AdversarialOraclePayload,
  type JournalInsightOutput,
  type AdversarialOracleOutput,
} from "./openclaw";

function djzsReply(text: string): string | null {
  const t = (text || "").trim();

  if (t.startsWith("/help")) {
    return [
      "DJZS Agent commands:",
      "",
      "Zones:",
      "  /zones - List all zones",
      "",
      "OpenClaw Agents:",
      "  Journal: <entry> - Analyze a reasoning trace",
      "  Thinking: <question> - Adversarial Oracle attack",
      "",
      "Type a command prefix to route to the right agent.",
    ].join("\n");
  }

  if (t.startsWith("/zones")) {
    return [
      "DJZS Zones (v1):",
      "01 Journal - Daily reflections with AI adversarial oracle",
      "02 Adversarial Oracle - Debate ideas, find patterns, deepen analysis",
    ].join("\n");
  }

  return null;
}

async function handleAgentMessage(sender: string, text: string): Promise<string> {
  const intent = detectIntent(text);

  if (!intent) {
    return "I'm DJZS Oracle Agent. Type /help for commands.\n\nTo use an agent, start your message with:\n- Journal: <your reasoning trace>\n- Thinking: <your thesis to attack>";
  }

  const content = extractContent(text, intent);

  if (!content || content.length < 3) {
    return `Please provide some content after the "${intent === "JournalInsight" ? "Journal:" : "Thinking:"}" prefix.`;
  }

  try {
    if (intent === "JournalInsight") {
      const payload: JournalInsightPayload = {
        type: "journal_entry",
        user_id: sender,
        content,
        timestamp: new Date().toISOString(),
      };
      const result = await runAgent("JournalInsight", payload) as JournalInsightOutput;
      return formatJournalReply(result);
    }

    if (intent === "AdversarialOracle") {
      const payload: AdversarialOraclePayload = {
        type: "adversarial_oracle",
        user_id: sender,
        question: content,
        relevant_memory: [],
      };
      const result = await runAgent("AdversarialOracle", payload) as AdversarialOracleOutput;
      return formatAdversarialReply(result);
    }

    return "Unknown agent intent.";
  } catch (err) {
    console.error(`OpenClaw agent error (${intent}):`, err);
    const errorMsg = err instanceof Error ? err.message : "Unknown error";
    if (errorMsg.includes("VENICE_API_KEY")) {
      return "AI processing is not configured. Please set up your Venice API key.";
    }
    return `Agent processing failed: ${errorMsg}`;
  }
}

async function main() {
  const agent = await Agent.createFromEnv({
    env: (process.env.XMTP_ENV as "dev" | "production") || "dev",
  });

  console.log("DJZS XMTP Agent online (OpenClaw-powered)");

  agent.on("text", async (ctx: any) => {
    try {
      const incoming = ctx?.message?.content || "";
      const sender = ctx?.message?.senderAddress || "unknown";

      const staticReply = djzsReply(incoming);
      if (staticReply) {
        await ctx.sendText(staticReply);
        return;
      }

      const reply = await handleAgentMessage(sender, incoming);
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
