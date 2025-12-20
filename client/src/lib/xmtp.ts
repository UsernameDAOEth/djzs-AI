import { Client, type Conversation } from "@xmtp/browser-sdk";

export type XmtpClientState = {
  client: Client | null;
  isConnecting: boolean;
  error: string | null;
};

let cachedClient: Client | null = null;

export async function createXmtpClient(signer: {
  getAddress: () => string;
  signMessage: (message: string) => Promise<string>;
}): Promise<Client> {
  if (cachedClient) {
    return cachedClient;
  }

  const client = await Client.create(signer as any, {
    env: "production",
  });
  
  cachedClient = client;
  return client;
}

export async function disconnectXmtpClient(): Promise<void> {
  cachedClient = null;
}

export function getXmtpClient(): Client | null {
  return cachedClient;
}

export async function listConversations(client: Client): Promise<Conversation[]> {
  return client.conversations.list();
}

export async function getOrCreateConversation(
  client: Client,
  peerAddress: string
): Promise<Conversation | null> {
  try {
    const conversation = await client.conversations.newDm(peerAddress);
    return conversation;
  } catch (error) {
    console.error("Failed to create conversation:", error);
    return null;
  }
}

export async function sendMessage(
  conversation: Conversation,
  content: string
): Promise<void> {
  await conversation.send(content);
}

export function isXmtpMessage(content: unknown): content is string {
  return typeof content === "string";
}
