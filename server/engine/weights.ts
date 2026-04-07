import type { DJZSLFCode, UniversalLFCode } from "./types";

export const DJZS_WEIGHTS: Record<DJZSLFCode, number> = {
  S01: 26,
  S02: 20,
  S03: 16,
  E01: 22,
  E02: 16,
  I01: 16,
  I02: 14,
  I03: 14,
  X01: 30,
  X02: 20,
  T01:  6,
} as const;

export const UNIVERSAL_WEIGHTS: Record<UniversalLFCode, number> = {
  UNAUTHORIZED_SCOPE: 25,
  PARAMETER_OVERFLOW: 20,
  DESTRUCTIVE_UNGUARDED: 25,
  NO_ROLLBACK_PATH: 15,
  CHAIN_UNVERIFIED: 15,
} as const;

export const LF_LABELS: Record<DJZSLFCode | UniversalLFCode, string> = {
  S01: "CIRCULAR_LOGIC",
  S02: "FALSE_DICHOTOMY",
  S03: "HIDDEN_ASSUMPTION",
  E01: "HALLUCINATED_AUTHORITY",
  E02: "PRECISION_MIRAGE",
  I01: "FOMO_LOOP",
  I02: "ANCHORING_TRAP",
  I03: "SUNK_COST_EXPLOITATION",
  X01: "CONTEXT_COLLAPSE",
  X02: "SURVIVORSHIP_FILTER",
  T01: "TEMPORAL_MISMATCH",
  UNAUTHORIZED_SCOPE: "UNAUTHORIZED_SCOPE",
  PARAMETER_OVERFLOW: "PARAMETER_OVERFLOW",
  DESTRUCTIVE_UNGUARDED: "DESTRUCTIVE_UNGUARDED",
  NO_ROLLBACK_PATH: "NO_ROLLBACK_PATH",
  CHAIN_UNVERIFIED: "CHAIN_UNVERIFIED",
};

const _djzsSum = Object.values(DJZS_WEIGHTS).reduce((a, b) => a + b, 0);
const _uniSum = Object.values(UNIVERSAL_WEIGHTS).reduce((a, b) => a + b, 0);
if (_djzsSum !== 200) throw new Error(`DJZS weights sum ${_djzsSum} !== 200`);
if (_uniSum !== 100) throw new Error(`Universal weights sum ${_uniSum} !== 100`);
