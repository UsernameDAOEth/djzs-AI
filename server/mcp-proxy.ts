import { EventEmitter } from "events";
import { DJZSEngine } from "./engine";
import type { ToolCall, DetectionResult } from "./engine";
import { type PaymentGate, type PaymentTier, DeferredGate, shouldUploadToIrys, TIER_PRICING } from "./payment-gate";
import { computeUniversalScore, computeUniversalVerdict, computeUniversalHash, UNIVERSAL_LF_CODES, type UniversalLFCode } from "@shared/universal-lf-codes";

export type ProxyMode = "passthrough" | "audit" | "enforce";

export interface MCPRequest {
  jsonrpc: "2.0";
  id: string | number;
  method: string;
  params?: Record<string, unknown>;
}

export interface MCPResponse {
  jsonrpc: "2.0";
  id: string | number;
  result?: unknown;
  error?: { code: number; message: string; data?: unknown };
}

export interface ProxyAuditResult {
  requestId: string | number;
  toolName: string;
  verdict: "PASS" | "FAIL";
  riskScore: number;
  firedCodes: string[];
  verdictHash: string;
  blocked: boolean;
  irysTxId?: string;
}

export interface MCPProxyConfig {
  mode: ProxyMode;
  tier: PaymentTier;
  gate: PaymentGate;
  failThreshold?: number;
  upstreamUrl?: string;
}

const DEFAULT_PROXY_CONFIG: MCPProxyConfig = {
  mode: "passthrough",
  tier: "proxy",
  gate: new DeferredGate(),
  failThreshold: 30,
};

export class MCPProxy extends EventEmitter {
  private config: MCPProxyConfig;
  private engine: DJZSEngine;

  constructor(config: Partial<MCPProxyConfig> = {}) {
    super();
    this.config = { ...DEFAULT_PROXY_CONFIG, ...config };
    this.engine = new DJZSEngine({
      codeSets: ["universal"],
      failThreshold: this.config.failThreshold ?? 30,
      warnThreshold: 15,
    });
  }

  async handleRequest(request: MCPRequest): Promise<MCPResponse> {
    if (this.config.mode === "passthrough") {
      return this.forward(request);
    }

    if (request.method !== "tools/call") {
      return this.forward(request);
    }

    const toolCall = this.extractToolCall(request);
    if (!toolCall) {
      return this.forward(request);
    }

    const auditResult = this.auditToolCall(toolCall, request.id);
    this.emit("audit", auditResult);

    if (this.config.mode === "enforce" && auditResult.blocked) {
      this.emit("blocked", auditResult);

      return {
        jsonrpc: "2.0",
        id: request.id,
        error: {
          code: -32001,
          message: `DJZS audit FAIL: ${auditResult.firedCodes.join(", ")}`,
          data: {
            verdict: auditResult.verdict,
            riskScore: auditResult.riskScore,
            firedCodes: auditResult.firedCodes,
            verdictHash: auditResult.verdictHash,
            tier: this.config.tier,
            price: TIER_PRICING[this.config.tier].price,
          },
        },
      };
    }

    return this.forward(request);
  }

  private extractToolCall(request: MCPRequest): ToolCall | null {
    const params = request.params || {};
    const toolName = params.name as string;
    const toolArgs = (params.arguments as Record<string, unknown>) || {};

    if (!toolName) return null;

    return {
      name: toolName,
      params: toolArgs,
      reasoning: typeof params._reasoning === "string" ? params._reasoning : undefined,
      domain: "general",
    };
  }

  private auditToolCall(toolCall: ToolCall, requestId: string | number): ProxyAuditResult {
    const engineResult = this.engine.audit(toolCall);

    const universalFired = engineResult.firedCodes.filter(
      (code): code is UniversalLFCode =>
        UNIVERSAL_LF_CODES.includes(code as UniversalLFCode)
    );

    const score = computeUniversalScore(universalFired);
    const verdict = computeUniversalVerdict(universalFired, this.config.failThreshold);
    const hash = computeUniversalHash(engineResult.detections);

    return {
      requestId,
      toolName: toolCall.name,
      verdict,
      riskScore: score,
      firedCodes: universalFired,
      verdictHash: hash,
      blocked: verdict === "FAIL",
    };
  }

  private async forward(request: MCPRequest): Promise<MCPResponse> {
    if (!this.config.upstreamUrl) {
      return {
        jsonrpc: "2.0",
        id: request.id,
        error: {
          code: -32002,
          message: "No upstream MCP server configured. Proxy is in skeleton mode.",
        },
      };
    }

    try {
      const response = await fetch(this.config.upstreamUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request),
      });

      return await response.json() as MCPResponse;
    } catch (error) {
      return {
        jsonrpc: "2.0",
        id: request.id,
        error: {
          code: -32003,
          message: `Upstream error: ${error instanceof Error ? error.message : "Unknown"}`,
        },
      };
    }
  }

  getMode(): ProxyMode {
    return this.config.mode;
  }

  setMode(mode: ProxyMode): void {
    this.config.mode = mode;
    this.emit("modeChange", mode);
  }

  shouldUploadToIrys(): boolean {
    return shouldUploadToIrys(this.config.tier);
  }
}

export function createProxy(config?: Partial<MCPProxyConfig>): MCPProxy {
  return new MCPProxy(config);
}
