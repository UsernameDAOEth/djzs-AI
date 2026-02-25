import { Agent } from "@xmtp/agent-sdk";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";

const ORACLE_ADDRESS = process.env.ORACLE_ADDRESS;
const TEST_MESSAGE =
  "Thinking: Analyze this thesis: We should short ETH because the gas fees are temporarily low, signaling low network utility.";

const RESPONSE_TIMEOUT_MS = 120_000;

async function main() {
  if (!ORACLE_ADDRESS) {
    console.error(
      "Missing ORACLE_ADDRESS env var. Run with:\n  ORACLE_ADDRESS=0x... npx tsx scripts/test-a2a-xmtp.ts",
    );
    process.exit(1);
  }

  console.log("=== DJZS A2A XMTP Pipeline Test ===\n");

  const senderKey = generatePrivateKey();
  const senderAccount = privateKeyToAccount(senderKey);
  console.log(`[1/5] Generated test sender wallet: ${senderAccount.address}`);

  console.log(`[2/5] Connecting to XMTP devnet...`);
  const { createUser, createSigner } = await import("@xmtp/agent-sdk/user");
  const senderUser = createUser(senderKey);
  const senderSigner = createSigner(senderUser);
  const senderAgent = await Agent.create(senderSigner, { env: "dev" });
  console.log(`[2/5] Connected. Sender inboxId: ${(senderAgent as any).client.inboxId}`);

  console.log(`[3/5] Opening DM to Oracle at ${ORACLE_ADDRESS}...`);
  const dm = await senderAgent.client.conversations.newDm(ORACLE_ADDRESS);
  console.log(`[3/5] DM conversation created (id: ${dm.id})`);

  console.log(`[4/5] Sending encrypted message:\n  "${TEST_MESSAGE}"\n`);
  await dm.send(TEST_MESSAGE);
  console.log(`[4/5] Message sent. Waiting for Oracle response (timeout: ${RESPONSE_TIMEOUT_MS / 1000}s)...\n`);

  const response = await waitForReply(senderAgent, dm.id);

  if (response) {
    console.log("=== Oracle Response ===");
    console.log(response);
    console.log("=======================\n");
    console.log("[5/5] A2A encrypted pipeline test PASSED");
  } else {
    console.error("[5/5] TIMEOUT — No response received from Oracle within the timeout period.");
    console.error("Make sure the Oracle listener is running: npx tsx server/agent.ts");
  }

  process.exit(0);
}

async function waitForReply(
  agent: any,
  conversationId: string,
): Promise<string | null> {
  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      resolve(null);
    }, RESPONSE_TIMEOUT_MS);

    const stream = agent.client.conversations.streamAllMessages();

    (async () => {
      try {
        for await (const message of stream) {
          if (
            message.conversationId === conversationId &&
            message.senderInboxId !== agent.client.inboxId
          ) {
            clearTimeout(timeout);
            resolve(typeof message.content === "string" ? message.content : JSON.stringify(message.content));
            return;
          }
        }
      } catch (err) {
        console.error("Stream error:", err);
        clearTimeout(timeout);
        resolve(null);
      }
    })();
  });
}

main().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
