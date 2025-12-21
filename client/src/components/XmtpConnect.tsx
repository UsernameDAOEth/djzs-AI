import { useMemo, useState, type CSSProperties } from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import type { Connector } from "wagmi";
import { Client, type Signer } from "@xmtp/browser-sdk";

type XmtpState =
  | { status: "idle" }
  | { status: "wallet_connected" }
  | { status: "xmtp_connecting" }
  | { status: "xmtp_connected"; inboxId: string }
  | { status: "error"; message: string };

function hexToBytes(hex: string): Uint8Array {
  const cleanHex = hex.startsWith("0x") ? hex.slice(2) : hex;
  const bytes = new Uint8Array(cleanHex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(cleanHex.substr(i * 2, 2), 16);
  }
  return bytes;
}

export default function XmtpConnect() {
  const { address, isConnected } = useAccount();
  const { connectors, connectAsync, isPending: walletPending } = useConnect();
  const { disconnect } = useDisconnect();

  const [xmtpClient, setXmtpClient] = useState<Client | null>(null);
  const [state, setState] = useState<XmtpState>({ status: "idle" });

  const xmtpEnv = (import.meta.env.VITE_XMTP_ENV || "dev") as "dev" | "production";

  const injected = useMemo<Connector | undefined>(() => {
    return connectors.find((c) => c.id === "injected") ?? connectors[0];
  }, [connectors]);

  async function handleConnectWallet() {
    try {
      if (!injected) throw new Error("No wallet connector available.");
      const res = await connectAsync({ connector: injected });
      if (!res?.accounts?.length) throw new Error("No accounts returned.");
      setState({ status: "wallet_connected" });
    } catch (e: unknown) {
      const error = e as Error;
      setState({ status: "error", message: error?.message || "Wallet connect failed" });
    }
  }

  async function handleConnectXMTP() {
    try {
      if (!address) throw new Error("Connect wallet first.");

      setState({ status: "xmtp_connecting" });

      const eth = (window as any).ethereum;
      if (!eth) throw new Error("No injected provider found (window.ethereum). Open in a browser with a wallet extension.");

      const accounts: string[] = await eth.request({ method: "eth_requestAccounts" });
      const account = accounts?.[0];
      if (!account) throw new Error("No wallet account available for XMTP.");

      const signer: Signer = {
        type: "EOA",
        getIdentifier: () => ({
          identifier: account,
          identifierKind: "Ethereum" as const,
        }),
        signMessage: async (message: string): Promise<Uint8Array> => {
          const signature = await eth.request({
            method: "personal_sign",
            params: [message, account],
          });
          return hexToBytes(signature);
        },
      };

      const client = await Client.create(signer, {
        env: xmtpEnv,
      });

      setXmtpClient(client);
      setState({ status: "xmtp_connected", inboxId: client.inboxId ?? "unknown" });
    } catch (e: unknown) {
      const error = e as Error;
      setXmtpClient(null);
      setState({ status: "error", message: error?.message || "XMTP connect failed" });
    }
  }

  function handleDisconnectAll() {
    setXmtpClient(null);
    setState({ status: "idle" });
    disconnect();
  }

  const walletLabel = address ? `${address.slice(0, 6)}…${address.slice(-4)}` : "Not connected";

  return (
    <div style={{ padding: 10, border: "1px solid rgba(255,255,255,0.12)", borderRadius: 12 }} data-testid="xmtp-connect-container">
      <div style={{ display: "flex", gap: 10, alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ minWidth: 140 }}>
          <div style={{ fontSize: 12, opacity: 0.75 }}>Wallet</div>
          <div style={{ fontSize: 13, fontWeight: 800 }} data-testid="text-wallet-address">{walletLabel}</div>
          <div style={{ fontSize: 11, opacity: 0.6 }}>XMTP: {xmtpEnv}</div>
        </div>

        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", flexWrap: "wrap" }}>
          {!isConnected ? (
            <button onClick={handleConnectWallet} disabled={walletPending} style={btnStyle} data-testid="button-connect-wallet">
              {walletPending ? "Connecting…" : "Connect"}
            </button>
          ) : (
            <>
              {!xmtpClient ? (
                <button
                  onClick={handleConnectXMTP}
                  disabled={state.status === "xmtp_connecting"}
                  style={btnStyle}
                  data-testid="button-enable-xmtp"
                >
                  {state.status === "xmtp_connecting" ? "Enabling…" : "Enable XMTP"}
                </button>
              ) : (
                <span style={pillStyle} title={`Inbox ID: ${state.status === "xmtp_connected" ? state.inboxId : ""}`} data-testid="status-xmtp-connected">
                  XMTP ✅
                </span>
              )}
              <button onClick={handleDisconnectAll} style={btnStyleSecondary} data-testid="button-disconnect">
                Disconnect
              </button>
            </>
          )}
        </div>
      </div>

      {state.status === "xmtp_connected" && (
        <div style={{ marginTop: 8, fontSize: 11, opacity: 0.75 }} data-testid="text-inbox-id">
          Inbox ID: <span style={{ fontWeight: 800 }}>{state.inboxId}</span>
        </div>
      )}

      {state.status === "error" && (
        <div style={{ marginTop: 8, fontSize: 11, color: "#ffb4b4" }} data-testid="text-error">
          Error: {state.message}
        </div>
      )}
    </div>
  );
}

const btnStyle: CSSProperties = {
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid rgba(255,255,255,0.20)",
  background: "rgba(255,255,255,0.08)",
  color: "white",
  cursor: "pointer",
  fontWeight: 900,
};

const btnStyleSecondary: CSSProperties = {
  ...btnStyle,
  background: "transparent",
  opacity: 0.9,
};

const pillStyle: CSSProperties = {
  padding: "8px 10px",
  borderRadius: 999,
  border: "1px solid rgba(255,255,255,0.20)",
  background: "rgba(255,255,255,0.06)",
  fontWeight: 900,
  fontSize: 12,
};
