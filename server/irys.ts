import { Uploader } from "@irys/upload";
import { BaseEth } from "@irys/upload-ethereum";

export interface IrysUploadResult {
  irys_tx_id: string | null;
  irys_url: string | null;
  irys_error?: string;
}

export async function uploadAuditToIrys(auditData: Record<string, any>): Promise<IrysUploadResult> {
  try {
    const privateKey = process.env.IRYS_PRIVATE_KEY;
    if (!privateKey) {
      return {
        irys_tx_id: null,
        irys_url: null,
        irys_error: "IRYS_PRIVATE_KEY not configured",
      };
    }

    const irys = await Uploader(BaseEth)
      .withWallet(privateKey)
      .withRpc("https://mainnet.base.org");

    const data = JSON.stringify(auditData);

    const flagCodes = Array.isArray(auditData.flags)
      ? auditData.flags.map((f: any) => f.code).filter(Boolean).join(",")
      : "";

    const tags = [
      { name: "application-id", value: "DJZS-Oracle" },
      { name: "Content-Type", value: "application/json" },
      { name: "audit-id", value: auditData.audit_id || "unknown" },
      { name: "tier", value: auditData.tier || "unknown" },
      { name: "verdict", value: auditData.verdict || "unknown" },
      { name: "Protocol", value: "ProofOfLogic" },
      { name: "version", value: "2.0" },
      { name: "Risk-Score", value: String(auditData.risk_score ?? "unknown") },
      { name: "Audit-Type", value: auditData.audit_type || "general" },
      { name: "Timestamp", value: auditData.timestamp || new Date().toISOString() },
      ...(auditData.agent_id ? [{ name: "Agent-Id", value: auditData.agent_id }] : []),
      ...(auditData.trade_params?.pair ? [{ name: "Trading-Pair", value: auditData.trade_params.pair }] : []),
      ...(flagCodes ? [{ name: "Flag-Codes", value: flagCodes }] : []),
    ];

    const receipt = await irys.upload(data, { tags });

    return {
      irys_tx_id: receipt.id,
      irys_url: `https://gateway.irys.xyz/${receipt.id}`,
    };
  } catch (error) {
    console.error("[Irys] Upload failed:", error);
    return {
      irys_tx_id: null,
      irys_url: null,
      irys_error: error instanceof Error ? error.message : "Unknown Irys upload error",
    };
  }
}
