import { BigInt } from "@graphprotocol/graph-ts";
import {
  ScoreUpdated,
  WriterAuthorized,
  WriterRevoked,
} from "../generated/DJZSLogicTrustScore/DJZSLogicTrustScore";
import {
  Agent,
  AuditRecord,
  LFFlag,
  LFCodeCoOccurrence,
  TrustScoreStats,
} from "../generated/schema";

const STATS_ID = "global";
const IRYS_GATEWAY = "https://gateway.irys.xyz/";

function getOrCreateStats(): TrustScoreStats {
  let stats = TrustScoreStats.load(STATS_ID);
  if (stats == null) {
    stats = new TrustScoreStats(STATS_ID);
    stats.totalAudits = BigInt.zero();
    stats.totalPasses = BigInt.zero();
    stats.totalFails = BigInt.zero();
    stats.uniqueAgents = BigInt.zero();
  }
  return stats;
}

function getOrCreateAgent(address: string): Agent {
  let agent = Agent.load(address);
  if (agent == null) {
    agent = new Agent(address);
    agent.totalAudits = BigInt.zero();
    agent.latestRiskScore = BigInt.zero();
    agent.latestVerdict = "";
    agent.passCount = BigInt.zero();
    agent.failCount = BigInt.zero();
  }
  return agent;
}

function updateCoOccurrence(codeA: string, codeB: string): void {
  let a = codeA;
  let b = codeB;
  if (a > b) {
    let tmp = a;
    a = b;
    b = tmp;
  }
  let id = a + "-" + b;
  let coOcc = LFCodeCoOccurrence.load(id);
  if (coOcc == null) {
    coOcc = new LFCodeCoOccurrence(id);
    coOcc.codeA = a;
    coOcc.codeB = b;
    coOcc.count = BigInt.zero();
  }
  coOcc.count = coOcc.count.plus(BigInt.fromI32(1));
  coOcc.save();
}

export function handleScoreUpdated(event: ScoreUpdated): void {
  let agentAddress = event.params.agent.toHexString();
  let agent = getOrCreateAgent(agentAddress);
  let isNewAgent = agent.totalAudits.equals(BigInt.zero());

  agent.totalAudits = agent.totalAudits.plus(BigInt.fromI32(1));
  agent.latestRiskScore = event.params.riskScore;
  agent.latestVerdict = event.params.verdict;

  let isPassing = event.params.verdict == "PASS";
  if (isPassing) {
    agent.passCount = agent.passCount.plus(BigInt.fromI32(1));
  } else {
    agent.failCount = agent.failCount.plus(BigInt.fromI32(1));
  }
  agent.save();

  let auditId =
    event.transaction.hash.toHexString() +
    "-" +
    event.logIndex.toString();
  let audit = new AuditRecord(auditId);
  audit.agent = agentAddress;
  audit.riskScore = event.params.riskScore;
  audit.verdict = event.params.verdict;
  audit.flags = event.params.flags;
  audit.irysReceiptId = event.params.irysTxId;
  audit.irysUrl = IRYS_GATEWAY + event.params.irysTxId;
  audit.timestamp = event.params.timestamp;
  audit.blockNumber = event.block.number;
  audit.transactionHash = event.transaction.hash;
  audit.save();

  let flags = event.params.flags;
  for (let i = 0; i < flags.length; i++) {
    let flagId = auditId + "-" + i.toString();
    let flag = new LFFlag(flagId);
    flag.agent = agentAddress;
    flag.code = flags[i];
    flag.auditRecord = auditId;
    flag.timestamp = event.params.timestamp;
    flag.save();

    for (let j = i + 1; j < flags.length; j++) {
      updateCoOccurrence(flags[i], flags[j]);
    }
  }

  let stats = getOrCreateStats();
  stats.totalAudits = stats.totalAudits.plus(BigInt.fromI32(1));
  if (isPassing) {
    stats.totalPasses = stats.totalPasses.plus(BigInt.fromI32(1));
  } else {
    stats.totalFails = stats.totalFails.plus(BigInt.fromI32(1));
  }
  if (isNewAgent) {
    stats.uniqueAgents = stats.uniqueAgents.plus(BigInt.fromI32(1));
  }
  stats.save();
}

export function handleWriterAuthorized(event: WriterAuthorized): void {}

export function handleWriterRevoked(event: WriterRevoked): void {}
