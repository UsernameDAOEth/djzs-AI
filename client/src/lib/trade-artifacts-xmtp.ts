import type { Address, Hex } from "viem";
import type { TradeArtifactV1 } from "@/lib/trade-artifacts";

export type DjzsEnvelope = { schema: "djzs.envelope.v1"; type: string; body: unknown };
export function envelope(type: string, body: unknown): DjzsEnvelope {
  return { schema: "djzs.envelope.v1", type, body };
}

export interface ExecutionReportV1 {
  schema: "djzs.execReport.v1";
  createdAt: number;
  artifactHash: Hex;
  status: "RECEIVED" | "REJECTED" | "PAPER_EXECUTED" | "LIVE_SUBMITTED" | "LIVE_CONFIRMED" | "FAILED";
  reason?: string;
  venue?: string;
  details?: Record<string, unknown>;
}

type ConversationLike = {
  send: (content: string) => Promise<unknown>;
  streamMessages?: () => AsyncIterable<{ content: unknown; senderAddress?: string }>;
};

type XmtpClientLike = {
  conversations: {
    newConversation: (peerAddress: string) => Promise<ConversationLike>;
    streamAllMessages?: () => AsyncIterable<{ content: unknown; senderAddress: string }>;
  };
};

async function getConversation(client: XmtpClientLike, peer: Address): Promise<ConversationLike> {
  return await client.conversations.newConversation(peer);
}

export async function sendTradeArtifactOverXmtp(args: {
  xmtpClient: XmtpClientLike;
  agentAddress: Address;
  artifact: TradeArtifactV1;
}): Promise<void> {
  const conv = await getConversation(args.xmtpClient, args.agentAddress);
  await conv.send(JSON.stringify(envelope("djzs.tradeArtifact.v1", args.artifact)));
}

export async function streamExecutionReports(args: {
  xmtpClient: XmtpClientLike;
  agentAddress: Address;
  onReport: (report: ExecutionReportV1) => void | Promise<void>;
}): Promise<() => void> {
  const conv = await getConversation(args.xmtpClient, args.agentAddress);

  let stopped = false;

  const run = async (iter: AsyncIterable<{ content: unknown; senderAddress?: string }>) => {
    for await (const m of iter) {
      if (stopped) break;
      const raw = m.content;
      if (typeof raw !== "string") continue;

      try {
        const parsed = JSON.parse(raw) as DjzsEnvelope;
        if (parsed?.schema !== "djzs.envelope.v1") continue;
        if (parsed.type !== "djzs.execReport.v1") continue;

        const report = parsed.body as ExecutionReportV1;
        if (report?.schema !== "djzs.execReport.v1") continue;

        await args.onReport(report);
      } catch {
        // ignore non-JSON
      }
    }
  };

  if (conv.streamMessages) {
    void run(conv.streamMessages());
  } else if (args.xmtpClient.conversations.streamAllMessages) {
    const all = args.xmtpClient.conversations.streamAllMessages();
    const filtered = (async function* () {
      for await (const m of all) {
        if (m.senderAddress?.toLowerCase() !== args.agentAddress.toLowerCase()) continue;
        yield m;
      }
    })();
    void run(filtered);
  } else {
    throw new Error("XMTP client does not support streaming messages (no streamMessages/streamAllMessages).");
  }

  return () => {
    stopped = true;
  };
}
