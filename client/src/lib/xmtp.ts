import { Client, type Conversation, type Signer } from "@xmtp/browser-sdk";

export type XmtpClientState = {
  client: Client | null;
  isConnecting: boolean;
  error: string | null;
};

let cachedClient: Client | null = null;

function hexToBytes(hex: string): Uint8Array {
  const cleanHex = hex.startsWith("0x") ? hex.slice(2) : hex;
  const bytes = new Uint8Array(cleanHex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(cleanHex.substr(i * 2, 2), 16);
  }
  return bytes;
}

export async function createXmtpClient(walletSigner: {
  getAddress: () => string;
  signMessage: (message: string) => Promise<string>;
}): Promise<Client> {
  if (cachedClient) {
    return cachedClient;
  }

  const address = walletSigner.getAddress();
  
  const signer: Signer = {
    type: "EOA",
    getIdentifier: () => ({
      identifier: address,
      identifierKind: "Ethereum" as const,
    }),
    signMessage: async (message: string): Promise<Uint8Array> => {
      const signature = await walletSigner.signMessage(message);
      return hexToBytes(signature);
    },
  };

  const client = await Client.create(signer, {
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
