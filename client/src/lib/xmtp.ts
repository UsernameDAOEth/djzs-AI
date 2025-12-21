export interface XmtpClient {
  inboxId: string;
  conversations: {
    list: () => Promise<XmtpConversation[]>;
    newDm: (peerAddress: string) => Promise<XmtpConversation>;
  };
}

export interface XmtpConversation {
  send: (content: string) => Promise<void>;
}

export type XmtpClientState = {
  client: XmtpClient | null;
  isConnecting: boolean;
  error: string | null;
};

let cachedClient: XmtpClient | null = null;

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
}): Promise<XmtpClient> {
  if (cachedClient) {
    return cachedClient;
  }

  const address = walletSigner.getAddress();
  
  // Dynamically import XMTP to avoid Vite optimization issues with web workers
  const { Client } = await import("@xmtp/browser-sdk");
  
  const signer = {
    type: "EOA" as const,
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
  
  cachedClient = client as unknown as XmtpClient;
  return cachedClient;
}

export async function disconnectXmtpClient(): Promise<void> {
  cachedClient = null;
}

export function getXmtpClient(): XmtpClient | null {
  return cachedClient;
}

export async function listConversations(client: XmtpClient): Promise<XmtpConversation[]> {
  return client.conversations.list();
}

export async function getOrCreateConversation(
  client: XmtpClient,
  peerAddress: string
): Promise<XmtpConversation | null> {
  try {
    const conversation = await client.conversations.newDm(peerAddress);
    return conversation;
  } catch (error) {
    console.error("Failed to create conversation:", error);
    return null;
  }
}

export async function sendMessage(
  conversation: XmtpConversation,
  content: string
): Promise<void> {
  await conversation.send(content);
}

export function isXmtpMessage(content: unknown): content is string {
  return typeof content === "string";
}
