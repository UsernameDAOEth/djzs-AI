import { useState, useCallback, useEffect } from "react";
import { useWalletClient } from "wagmi";
import { createXmtpClient, disconnectXmtpClient, getXmtpClient, type XmtpClient } from "@/lib/xmtp";

export function useXmtp() {
  const { data: walletClient } = useWalletClient();
  const [client, setClient] = useState<XmtpClient | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const existingClient = getXmtpClient();
    if (existingClient) {
      setClient(existingClient);
    }
  }, []);

  const connect = useCallback(async () => {
    if (!walletClient) {
      setError("No wallet connected");
      return null;
    }

    const existingClient = getXmtpClient();
    if (existingClient) {
      setClient(existingClient);
      return existingClient;
    }

    setIsConnecting(true);
    setError(null);

    try {
      const signer = {
        getAddress: () => walletClient.account.address,
        signMessage: async (message: string) => {
          const signature = await walletClient.signMessage({
            message,
            account: walletClient.account,
          });
          return signature;
        },
      };

      const xmtpClient = await createXmtpClient(signer as any);
      setClient(xmtpClient);
      return xmtpClient;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to connect to XMTP";
      setError(message);
      console.error("XMTP connection error:", err);
      return null;
    } finally {
      setIsConnecting(false);
    }
  }, [walletClient]);

  const disconnect = useCallback(async () => {
    await disconnectXmtpClient();
    setClient(null);
    setError(null);
  }, []);

  return {
    client,
    isConnecting,
    isConnected: !!client,
    error,
    connect,
    disconnect,
  };
}
