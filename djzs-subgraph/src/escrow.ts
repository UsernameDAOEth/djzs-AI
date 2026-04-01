import { BigInt, Bytes } from "@graphprotocol/graph-ts";
import {
  EscrowCreated,
  AuditPending,
  EscrowSettled,
  EscrowRefunded,
} from "../generated/DJZSEscrowLock/DJZSEscrowLock";
import { Escrow, EscrowEvent } from "../generated/schema";

function getOrCreateEscrow(escrowId: BigInt): Escrow {
  let id = escrowId.toString();
  let escrow = Escrow.load(id);
  if (escrow == null) {
    escrow = new Escrow(id);
    escrow.escrowId = escrowId;
    escrow.creator = Bytes.empty();
    escrow.recipient = Bytes.empty();
    escrow.amount = BigInt.zero();
    escrow.executionTraceHash = Bytes.empty();
    escrow.settled = false;
    escrow.status = "PENDING";
  }
  return escrow;
}

export function handleEscrowCreated(event: EscrowCreated): void {
  let escrow = getOrCreateEscrow(event.params.escrowId);
  escrow.creator = event.params.creator;
  escrow.recipient = event.params.recipient;
  escrow.amount = event.params.amount;
  escrow.executionTraceHash = event.params.executionTraceHash;
  escrow.settled = false;
  escrow.status = "PENDING";
  escrow.save();

  let eventId =
    event.transaction.hash.toHexString() +
    "-" +
    event.logIndex.toString();
  let escrowEvent = new EscrowEvent(eventId);
  escrowEvent.escrow = escrow.id;
  escrowEvent.eventType = "CREATED";
  escrowEvent.timestamp = event.block.timestamp;
  escrowEvent.blockNumber = event.block.number;
  escrowEvent.transactionHash = event.transaction.hash;
  escrowEvent.save();
}

export function handleAuditPending(event: AuditPending): void {
  let escrow = getOrCreateEscrow(event.params.escrowId);
  escrow.status = "AUDIT_PENDING";
  escrow.save();

  let eventId =
    event.transaction.hash.toHexString() +
    "-" +
    event.logIndex.toString();
  let escrowEvent = new EscrowEvent(eventId);
  escrowEvent.escrow = escrow.id;
  escrowEvent.eventType = "AUDIT_PENDING";
  escrowEvent.timestamp = event.block.timestamp;
  escrowEvent.blockNumber = event.block.number;
  escrowEvent.transactionHash = event.transaction.hash;
  escrowEvent.save();
}

export function handleEscrowSettled(event: EscrowSettled): void {
  let escrow = getOrCreateEscrow(event.params.escrowId);
  escrow.settled = true;
  escrow.passed = event.params.passed;
  escrow.irisTxId = event.params.irisTxId;
  escrow.status = "SETTLED";
  escrow.save();

  let eventId =
    event.transaction.hash.toHexString() +
    "-" +
    event.logIndex.toString();
  let escrowEvent = new EscrowEvent(eventId);
  escrowEvent.escrow = escrow.id;
  escrowEvent.eventType = "SETTLED";
  escrowEvent.timestamp = event.block.timestamp;
  escrowEvent.blockNumber = event.block.number;
  escrowEvent.transactionHash = event.transaction.hash;
  escrowEvent.save();
}

export function handleEscrowRefunded(event: EscrowRefunded): void {
  let escrow = getOrCreateEscrow(event.params.escrowId);
  escrow.settled = true;
  escrow.status = "REFUNDED";
  escrow.save();

  let eventId =
    event.transaction.hash.toHexString() +
    "-" +
    event.logIndex.toString();
  let escrowEvent = new EscrowEvent(eventId);
  escrowEvent.escrow = escrow.id;
  escrowEvent.eventType = "REFUNDED";
  escrowEvent.timestamp = event.block.timestamp;
  escrowEvent.blockNumber = event.block.number;
  escrowEvent.transactionHash = event.transaction.hash;
  escrowEvent.save();
}
