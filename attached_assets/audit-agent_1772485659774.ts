/**
 * DJZS Audit Agent - Adversarial Logic Auditor
 * 
 * Orchestrates the audit pipeline with persona-based routing.
 */

import crypto from "crypto";
import { 
  VeniceClient, 
  getVeniceClient,
  type AuditResult,
  type AdversarialPersona,
} from "./venice";

// ============================================================================
// TYPES
// ============================================================================

export type AuditTier = "micro" | "founder" | "treasury";

export interface AuditInput {
  strategy_memo: string;
  audit_type?: "treasury" | "founder_drift" | "strategy" | "general";
  target_system?: string;
  tier?: AuditTier;
  persona?: AdversarialPersona;  // Override default persona for tier
}

export interface ProofOfLogicCertificate extends AuditResult {
  audit_id: string;
  timestamp: string;
  tier: AuditTier;
  cryptographic_hash: string;
  
  // Filled after Irys upload
  provenance_provider?: "IRYS_DATACHAIN";
  irys_tx_id?: string;
  irys_url?: string;
}

// ============================================================================
// TIER → PERSONA MAPPING
// ============================================================================

const TIER_CONFIG: Record<AuditTier, {
  price_usd: number;
  memo_limit: number;
  default_persona: AdversarialPersona;
}> = {
  micro: {
    price_usd: 2.50,
    memo_limit: 1000,
    default_persona: "general",
  },
  founder: {
    price_usd: 5.00,
    memo_limit: 5000,
    default_persona: "logic_auditor",
  },
  treasury: {
    price_usd: 50.00,
    memo_limit: Infinity,
    default_persona: "risk_hunter",
  },
};

// ============================================================================
// MAIN AUDIT FUNCTION
// ============================================================================

export async function executeAudit(
  input: AuditInput,
  client?: VeniceClient
): Promise<ProofOfLogicCertificate> {
  const veniceClient = client || getVeniceClient();
  
  const {
    strategy_memo,
    audit_type = "general",
    target_system = "Unknown",
    tier = "micro",
    persona,
  } = input;

  // Validate memo length
  const tierConfig = TIER_CONFIG[tier];
  if (strategy_memo.length > tierConfig.memo_limit) {
    throw new Error(
      `Strategy memo exceeds ${tier} tier limit of ${tierConfig.memo_limit} characters`
    );
  }

  // Use provided persona or fall back to tier default
  const selectedPersona = persona || tierConfig.default_persona;

  // Generate metadata
  const audit_id = crypto.randomUUID();
  const timestamp = new Date().toISOString();
  const cryptographic_hash = crypto
    .createHash("sha256")
    .update(strategy_memo)
    .digest("hex");

  // Run the audit with selected persona
  const result = await veniceClient.audit(
    strategy_memo,
    selectedPersona,
    { tier, auditType: audit_type, targetSystem: target_system }
  );

  // Build certificate
  const certificate: ProofOfLogicCertificate = {
    audit_id,
    timestamp,
    tier,
    cryptographic_hash,
    ...result,
  };

  return certificate;
}

// ============================================================================
// XMTP MESSAGE ROUTING
// ============================================================================

export type MessagePrefix = "Thinking:" | "Journal:" | "Audit:" | "Risk:";

/**
 * Parse XMTP message and route to appropriate persona
 */
export function parseAndRoute(rawMessage: string): {
  content: string;
  persona: AdversarialPersona;
} {
  if (rawMessage.startsWith("Risk:")) {
    return {
      content: rawMessage.slice(5).trim(),
      persona: "risk_hunter",
    };
  }
  
  if (rawMessage.startsWith("Backtest:")) {
    return {
      content: rawMessage.slice(9).trim(),
      persona: "backtest_skeptic",
    };
  }
  
  if (rawMessage.startsWith("Regime:")) {
    return {
      content: rawMessage.slice(7).trim(),
      persona: "regime_detector",
    };
  }
  
  if (rawMessage.startsWith("Logic:")) {
    return {
      content: rawMessage.slice(6).trim(),
      persona: "logic_auditor",
    };
  }

  // Default prefixes → general audit
  for (const prefix of ["Thinking:", "Audit:"]) {
    if (rawMessage.startsWith(prefix)) {
      return {
        content: rawMessage.slice(prefix.length).trim(),
        persona: "general",
      };
    }
  }

  // No prefix → general
  return {
    content: rawMessage.trim(),
    persona: "general",
  };
}

/**
 * Handle XMTP message with persona routing
 */
export async function handleXMTPMessage(
  rawMessage: string,
  client?: VeniceClient
): Promise<string> {
  // Journal messages are logged, not audited
  if (rawMessage.startsWith("Journal:")) {
    return JSON.stringify({
      status: "logged",
      timestamp: new Date().toISOString(),
      message: "Journal entry recorded",
    });
  }

  const { content, persona } = parseAndRoute(rawMessage);
  
  const certificate = await executeAudit({
    strategy_memo: content,
    tier: "micro",
    persona,
  }, client);

  return JSON.stringify(certificate, null, 2);
}

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Check if auto-abort is recommended
 */
export function shouldAutoAbort(cert: ProofOfLogicCertificate): boolean {
  const criticalCodes = ["DJZS-S01", "DJZS-S02", "DJZS-E01", "DJZS-E02", "DJZS-X01"];
  return cert.flags.some(
    f => criticalCodes.includes(f.code) || f.severity === "CRITICAL"
  );
}

export { TIER_CONFIG };
