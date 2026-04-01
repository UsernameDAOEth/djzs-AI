import { BigDecimal, BigInt } from "@graphprotocol/graph-ts";
import {
  Staked,
  Unstaked,
  Slashed,
} from "../generated/DJZSStaking/DJZSStaking";
import {
  Staker,
  StakeEvent,
  SlashEvent,
  TrustScoreSnapshot,
} from "../generated/schema";

function toBigDecimal(value: BigInt): BigDecimal {
  return value.toBigDecimal();
}

function getOrCreateStaker(address: string): Staker {
  let staker = Staker.load(address);
  if (staker == null) {
    staker = new Staker(address);
    staker.amount = BigDecimal.fromString("0");
    staker.stakedAt = BigInt.zero();
    staker.lockUntil = BigInt.zero();
    staker.active = false;
    staker.totalSlashed = BigDecimal.fromString("0");
  }
  return staker;
}

function createSnapshot(
  stakerId: string,
  currentAmount: BigDecimal,
  delta: BigDecimal,
  blockNumber: BigInt,
  blockTimestamp: BigInt,
): void {
  let id = stakerId + "-" + blockNumber.toString();
  let snapshot = new TrustScoreSnapshot(id);
  snapshot.staker = stakerId;
  snapshot.amount = currentAmount;
  snapshot.delta = delta;
  snapshot.timestamp = blockTimestamp;
  snapshot.blockNumber = blockNumber;
  snapshot.save();
}

export function handleStaked(event: Staked): void {
  let address = event.params.staker.toHexString();
  let staker = getOrCreateStaker(address);
  let amount = toBigDecimal(event.params.amount);

  staker.amount = staker.amount.plus(amount);
  staker.stakedAt = event.block.timestamp;
  staker.lockUntil = event.params.lockUntil;
  staker.active = true;
  staker.save();

  let eventId =
    event.transaction.hash.toHexString() +
    "-" +
    event.logIndex.toString();
  let stakeEvent = new StakeEvent(eventId);
  stakeEvent.staker = address;
  stakeEvent.eventType = "STAKE";
  stakeEvent.amount = amount;
  stakeEvent.lockUntil = event.params.lockUntil;
  stakeEvent.timestamp = event.block.timestamp;
  stakeEvent.blockNumber = event.block.number;
  stakeEvent.transactionHash = event.transaction.hash;
  stakeEvent.save();

  createSnapshot(address, staker.amount, amount, event.block.number, event.block.timestamp);
}

export function handleUnstaked(event: Unstaked): void {
  let address = event.params.staker.toHexString();
  let staker = getOrCreateStaker(address);
  let amount = toBigDecimal(event.params.amount);

  let negativeDelta = BigDecimal.fromString("0").minus(amount);
  staker.amount = staker.amount.plus(negativeDelta);
  staker.active = false;
  staker.save();

  let eventId =
    event.transaction.hash.toHexString() +
    "-" +
    event.logIndex.toString();
  let stakeEvent = new StakeEvent(eventId);
  stakeEvent.staker = address;
  stakeEvent.eventType = "UNSTAKE";
  stakeEvent.amount = amount;
  stakeEvent.timestamp = event.block.timestamp;
  stakeEvent.blockNumber = event.block.number;
  stakeEvent.transactionHash = event.transaction.hash;
  stakeEvent.save();

  createSnapshot(address, staker.amount, negativeDelta, event.block.number, event.block.timestamp);
}

export function handleSlashed(event: Slashed): void {
  let address = event.params.staker.toHexString();
  let staker = getOrCreateStaker(address);
  let amount = toBigDecimal(event.params.amount);

  let negativeDelta = BigDecimal.fromString("0").minus(amount);
  staker.amount = staker.amount.plus(negativeDelta);
  staker.totalSlashed = staker.totalSlashed.plus(amount);

  if (staker.amount.equals(BigDecimal.fromString("0"))) {
    staker.active = false;
  }
  staker.save();

  let eventId =
    event.transaction.hash.toHexString() +
    "-" +
    event.logIndex.toString();
  let slashEvent = new SlashEvent(eventId);
  slashEvent.staker = address;
  slashEvent.amount = amount;
  slashEvent.reason = event.params.reason;
  slashEvent.timestamp = event.block.timestamp;
  slashEvent.blockNumber = event.block.number;
  slashEvent.transactionHash = event.transaction.hash;
  slashEvent.save();

  createSnapshot(address, staker.amount, negativeDelta, event.block.number, event.block.timestamp);
}
