import type { ToolCall, Detection, EngineConfig } from "../types";
import { paramOverflowRatio, matchesAny, flattenParams } from "../utils/analysis";

export function detectUnauthorizedScope(
  call: ToolCall,
  config: EngineConfig
): Detection {
  const code = "UNAUTHORIZED_SCOPE" as const;
  const label = "UNAUTHORIZED_SCOPE";

  const privileged = config.privilegedScopes || [];
  const toolName = call.name.toLowerCase();
  const paramText = JSON.stringify(call.params).toLowerCase();
  const combined = `${toolName} ${paramText}`;

  const hits = matchesAny(combined, privileged);

  if (hits.length > 0) {
    const userAuthorized = (call.context || [])
      .filter((c) => c.role === "user")
      .some((c) => {
        const lower = c.content.toLowerCase();
        return hits.some((h) => lower.includes(h));
      });

    if (!userAuthorized) {
      return {
        code, label, fired: true, confidence: 1,
        evidence: `Privileged operation(s) [${hits.join(", ")}] not explicitly authorized by user`,
      };
    }
  }

  if (call.schema?.parameters?.properties) {
    const schemaKeys = new Set(
      Object.keys(call.schema.parameters.properties).map((k) => k.toLowerCase())
    );
    const paramKeys = Object.keys(call.params).map((k) => k.toLowerCase());
    const undeclared = paramKeys.filter((k) => !schemaKeys.has(k));

    if (undeclared.length > 0) {
      return {
        code, label, fired: true, confidence: 1,
        evidence: `Parameters [${undeclared.join(", ")}] not declared in tool schema`,
      };
    }
  }

  return { code, label, fired: false, confidence: 1, evidence: "Scope within bounds" };
}

export function detectParameterOverflow(call: ToolCall): Detection {
  const code = "PARAMETER_OVERFLOW" as const;
  const label = "PARAMETER_OVERFLOW";

  if (!call.schema?.parameters) {
    return { code, label, fired: false, confidence: 1, evidence: "No schema to validate against" };
  }

  const { actual, expected, overflow } = paramOverflowRatio(
    call.params,
    call.schema.parameters
  );

  if (overflow) {
    return {
      code, label, fired: true, confidence: 1,
      evidence: `${actual} parameters provided, schema declares ${expected}`,
    };
  }

  const props = call.schema.parameters.properties || {};
  const flat = flattenParams(call.params);

  for (const [key, value] of Object.entries(flat)) {
    const schemaProp = props[key];
    if (!schemaProp) continue;

    const sp = schemaProp as {
      minimum?: number;
      maximum?: number;
      maxLength?: number;
      enum?: unknown[];
    };

    if (typeof value === "number") {
      if (sp.minimum !== undefined && value < sp.minimum) {
        return {
          code, label, fired: true, confidence: 1,
          evidence: `${key}=${value} below minimum ${sp.minimum}`,
        };
      }
      if (sp.maximum !== undefined && value > sp.maximum) {
        return {
          code, label, fired: true, confidence: 1,
          evidence: `${key}=${value} exceeds maximum ${sp.maximum}`,
        };
      }
    }

    if (typeof value === "string" && sp.maxLength !== undefined) {
      if (value.length > sp.maxLength) {
        return {
          code, label, fired: true, confidence: 1,
          evidence: `${key} length ${value.length} exceeds maxLength ${sp.maxLength}`,
        };
      }
    }

    if (sp.enum && !sp.enum.includes(value)) {
      return {
        code, label, fired: true, confidence: 1,
        evidence: `${key}="${value}" not in allowed enum [${sp.enum.join(", ")}]`,
      };
    }
  }

  return { code, label, fired: false, confidence: 1, evidence: "Parameters within schema bounds" };
}

export function detectDestructiveUnguarded(
  call: ToolCall,
  config: EngineConfig
): Detection {
  const code = "DESTRUCTIVE_UNGUARDED" as const;
  const label = "DESTRUCTIVE_UNGUARDED";

  const destructive = config.destructiveOps || [];
  const toolName = call.name.toLowerCase();
  const paramText = JSON.stringify(call.params).toLowerCase();

  const hits = matchesAny(`${toolName} ${paramText}`, destructive);

  if (hits.length === 0) {
    return { code, label, fired: false, confidence: 1, evidence: "No destructive operations detected" };
  }

  const guardKeys = ["confirm", "confirmation", "dry_run", "dryrun", "dry-run",
    "simulate", "preview", "force", "acknowledged"];
  const hasGuard = Object.keys(call.params).some((k) =>
    guardKeys.includes(k.toLowerCase())
  );

  if (hasGuard) {
    return { code, label, fired: false, confidence: 1, evidence: `Destructive op [${hits.join(", ")}] has safety guard parameter` };
  }

  const userExplicit = (call.context || [])
    .filter((c) => c.role === "user")
    .some((c) => {
      const lower = c.content.toLowerCase();
      return hits.some((h) => lower.includes(h));
    });

  if (userExplicit) {
    return { code, label, fired: false, confidence: 1, evidence: "User explicitly requested destructive operation" };
  }

  return {
    code, label, fired: true, confidence: 1,
    evidence: `Destructive operation(s) [${hits.join(", ")}] with no confirmation guard and no explicit user authorization`,
  };
}

export function detectNoRollbackPath(call: ToolCall): Detection {
  const code = "NO_ROLLBACK_PATH" as const;
  const label = "NO_ROLLBACK_PATH";

  const irreversible = [
    "send", "transfer", "swap", "burn", "deploy", "execute",
    "submit", "broadcast", "sign", "approve", "mint",
    "delete_permanent", "drop_table", "format",
  ];

  const toolName = call.name.toLowerCase();
  const isIrreversible = irreversible.some((op) => toolName.includes(op));

  if (!isIrreversible) {
    return { code, label, fired: false, confidence: 1, evidence: "Operation appears reversible" };
  }

  const rollbackSignals = [
    "rollback", "undo", "revert", "snapshot", "backup", "checkpoint",
    "savepoint", "restore_point", "recovery",
  ];

  const reasoning = (call.reasoning || "").toLowerCase();
  const paramText = JSON.stringify(call.params).toLowerCase();
  const combined = `${reasoning} ${paramText}`;

  const hasRollback = rollbackSignals.some((s) => combined.includes(s));
  if (hasRollback) {
    return { code, label, fired: false, confidence: 1, evidence: "Rollback/recovery path referenced" };
  }

  return {
    code, label, fired: true, confidence: 1,
    evidence: `Irreversible operation "${call.name}" with no rollback/snapshot/undo mechanism referenced`,
  };
}

export function detectChainUnverified(call: ToolCall): Detection {
  const code = "CHAIN_UNVERIFIED" as const;
  const label = "CHAIN_UNVERIFIED";

  if (!call.context || call.context.length < 2) {
    return { code, label, fired: false, confidence: 1, evidence: "No chain to evaluate" };
  }

  const toolResults = call.context.filter((c) => c.role === "tool_result");

  if (toolResults.length === 0) {
    return { code, label, fired: false, confidence: 1, evidence: "No prior tool calls in chain" };
  }

  const paramText = JSON.stringify(call.params);

  const lastResult = toolResults[toolResults.length - 1];
  const resultContent = lastResult.content;

  const passThrough = [
    /0x[a-f0-9]{40,64}/gi,
    /[a-f0-9]{64}/gi,
    /\b[A-Za-z0-9_-]{20,}\b/g,
  ];

  for (const pattern of passThrough) {
    const resultMatches = resultContent.match(pattern) || [];
    for (const val of resultMatches) {
      if (paramText.includes(val)) {
        const intermediateSteps = call.context.filter(
          (c) => c.role === "assistant" && c.content.toLowerCase().includes("verif")
        );

        if (intermediateSteps.length === 0) {
          return {
            code, label, fired: true, confidence: 1,
            evidence: `Value "${val.substring(0, 20)}..." piped from prior tool result without intermediate verification`,
          };
        }
      }
    }
  }

  if (toolResults.length >= 3) {
    const validationSteps = call.context.filter(
      (c) =>
        c.role === "assistant" &&
        /\b(?:verif|check|confirm|validat|assert)\b/i.test(c.content)
    );

    if (validationSteps.length === 0) {
      return {
        code, label, fired: true, confidence: 1,
        evidence: `${toolResults.length}-step chain with no intermediate validation detected`,
      };
    }
  }

  return { code, label, fired: false, confidence: 1, evidence: "Chain verification acceptable" };
}
