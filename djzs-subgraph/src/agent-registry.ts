import { BigInt } from "@graphprotocol/graph-ts";
import {
  AgentRegistered,
  AgentDeactivated,
  AgentReactivated,
  AgentMetadataUpdated,
} from "../generated/DJZSAgentRegistry/DJZSAgentRegistry";
import { RegisteredAgent, AgentEvent } from "../generated/schema";

export function handleAgentRegistered(event: AgentRegistered): void {
  let address = event.params.agent.toHexString();
  let agent = new RegisteredAgent(address);
  agent.name = event.params.name;
  agent.metadataUri = "";
  agent.agentOwner = event.params.agentOwner;
  agent.active = true;
  agent.registeredAt = event.block.timestamp;
  agent.save();

  let eventId =
    event.transaction.hash.toHexString() +
    "-" +
    event.logIndex.toString();
  let agentEvent = new AgentEvent(eventId);
  agentEvent.registeredAgent = address;
  agentEvent.eventType = "REGISTERED";
  agentEvent.timestamp = event.block.timestamp;
  agentEvent.blockNumber = event.block.number;
  agentEvent.transactionHash = event.transaction.hash;
  agentEvent.save();
}

export function handleAgentDeactivated(event: AgentDeactivated): void {
  let address = event.params.agent.toHexString();
  let agent = RegisteredAgent.load(address);
  if (agent != null) {
    agent.active = false;
    agent.save();
  }

  let eventId =
    event.transaction.hash.toHexString() +
    "-" +
    event.logIndex.toString();
  let agentEvent = new AgentEvent(eventId);
  agentEvent.registeredAgent = address;
  agentEvent.eventType = "DEACTIVATED";
  agentEvent.timestamp = event.block.timestamp;
  agentEvent.blockNumber = event.block.number;
  agentEvent.transactionHash = event.transaction.hash;
  agentEvent.save();
}

export function handleAgentReactivated(event: AgentReactivated): void {
  let address = event.params.agent.toHexString();
  let agent = RegisteredAgent.load(address);
  if (agent != null) {
    agent.active = true;
    agent.save();
  }

  let eventId =
    event.transaction.hash.toHexString() +
    "-" +
    event.logIndex.toString();
  let agentEvent = new AgentEvent(eventId);
  agentEvent.registeredAgent = address;
  agentEvent.eventType = "REACTIVATED";
  agentEvent.timestamp = event.block.timestamp;
  agentEvent.blockNumber = event.block.number;
  agentEvent.transactionHash = event.transaction.hash;
  agentEvent.save();
}

export function handleAgentMetadataUpdated(
  event: AgentMetadataUpdated,
): void {
  let address = event.params.agent.toHexString();
  let agent = RegisteredAgent.load(address);
  if (agent != null) {
    agent.metadataUri = event.params.metadataUri;
    agent.save();
  }

  let eventId =
    event.transaction.hash.toHexString() +
    "-" +
    event.logIndex.toString();
  let agentEvent = new AgentEvent(eventId);
  agentEvent.registeredAgent = address;
  agentEvent.eventType = "METADATA_UPDATED";
  agentEvent.timestamp = event.block.timestamp;
  agentEvent.blockNumber = event.block.number;
  agentEvent.transactionHash = event.transaction.hash;
  agentEvent.save();
}
