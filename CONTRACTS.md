# DJZS Protocol — Solidity Contracts

## Overview

The DJZS protocol uses 4 Solidity contracts deployed on Base Mainnet. Together they provide on-chain trust scoring, escrow-gated audit settlement, agent staking, and a global agent registry.

---

## 1. DJZSLogicTrustScore

**Purpose**: Stores on-chain trust scores for autonomous agents after each audit. The chain writer calls `updateScore()` to record the verdict, risk score, and flag codes permanently on Base.

**Deployed Address**: `<TRUST_SCORE_CONTRACT_ADDRESS>`

### Key Functions

| Function | Access | Description |
|---|---|---|
| `updateScore(agent, riskScore, verdict, flags, irysTxId)` | Writer / Owner | Records a new audit result for the given agent address |
| `getLatestScore(agent)` | View | Returns the most recent risk score, verdict, timestamp, and total audit count |
| `getAuditRecord(agent, index)` | View | Returns a specific historical audit record by index |
| `getAuditHistory(agent)` | View | Returns the total number of audits for an agent |
| `authorizeWriter(writer)` | Owner | Grants an address permission to call `updateScore` |
| `revokeWriter(writer)` | Owner | Revokes writer permission |

### Events

- `ScoreUpdated(agent, riskScore, verdict, flags, irysTxId, timestamp)` — emitted on every trust score write
- `WriterAuthorized(writer)` — emitted when a new writer is authorized
- `WriterRevoked(writer)` — emitted when a writer is revoked

### Constructor

No parameters. Deployer becomes owner and first authorized writer.

### Environment Variables

- `TRUST_SCORE_CONTRACT_ADDRESS` — deployed contract address
- `SETTLEMENT_PRIVATE_KEY` — private key of the authorized writer wallet
- `BASE_RPC_URL` — Base Mainnet RPC endpoint

---

## 2. DJZSEscrowLock

**Purpose**: Holds USDC in escrow during an audit. When the audit completes, the settlement agent calls `settleEscrow()` to release funds to the recipient (PASS) or refund to the creator (FAIL).

**Deployed Address**: `<ESCROW_CONTRACT_ADDRESS>`

### Key Functions

| Function | Access | Description |
|---|---|---|
| `createEscrow(recipient, amount, executionTraceHash)` | Any | Locks USDC and emits `AuditPending` |
| `settleEscrow(escrowId, passed, irisTxId)` | Settlement Agent / Owner | Settles the escrow based on audit verdict |
| `refundEscrow(escrowId)` | Owner | Emergency refund for unsettled escrows |
| `getEscrow(escrowId)` | View | Returns escrow details |
| `setSettlementAgent(agent)` | Owner | Updates the settlement agent address |

### Events

- `EscrowCreated(escrowId, creator, recipient, amount, executionTraceHash)`
- `AuditPending(escrowId, creator, recipient, executionTraceHash, amount)`
- `EscrowSettled(escrowId, passed, irisTxId)`
- `EscrowRefunded(escrowId)`

### Constructor Parameters

| Parameter | Type | Description |
|---|---|---|
| `_paymentToken` | `address` | USDC token contract address on Base |

### Environment Variables

- `ESCROW_CONTRACT_ADDRESS` — deployed contract address
- `SETTLEMENT_PRIVATE_KEY` — private key of the settlement agent wallet
- `BASE_RPC_URL` — Base Mainnet RPC endpoint

---

## 3. DJZSStaking

**Purpose**: Allows agents or agent operators to stake tokens as a credibility bond. Staked agents can be slashed by the protocol owner if an audit reveals malicious behavior.

**Deployed Address**: `<STAKING_CONTRACT_ADDRESS>`

### Key Functions

| Function | Access | Description |
|---|---|---|
| `stake(amount)` | Any | Stakes tokens with a time lock |
| `unstake()` | Staker | Withdraws stake after lock period |
| `slash(staker, amount, reason)` | Owner | Slashes a staker's bond |
| `getStake(staker)` | View | Returns stake details |
| `setMinimumStake(amount)` | Owner | Updates minimum stake requirement |
| `setLockDuration(duration)` | Owner | Updates lock duration in seconds |

### Events

- `Staked(staker, amount, lockUntil)`
- `Unstaked(staker, amount)`
- `Slashed(staker, amount, reason)`
- `MinimumStakeUpdated(newMinimum)`
- `LockDurationUpdated(newDuration)`

### Constructor Parameters

| Parameter | Type | Description |
|---|---|---|
| `_stakingToken` | `address` | ERC-20 token to stake |
| `_minimumStake` | `uint256` | Minimum stake amount |
| `_lockDuration` | `uint256` | Lock duration in seconds |

---

## 4. DJZSAgentRegistry

**Purpose**: On-chain registry of autonomous agents. Agents self-register (or are registered by the protocol owner) with a name and metadata URI. Used for fleet discovery and reputation tracking.

**Deployed Address**: `<AGENT_REGISTRY_ADDRESS>`

### Key Functions

| Function | Access | Description |
|---|---|---|
| `registerAgent(agent, name, metadataUri)` | Agent / Owner | Registers a new agent |
| `deactivateAgent(agent)` | Agent Owner / Owner | Marks agent as inactive |
| `reactivateAgent(agent)` | Agent Owner / Owner | Re-activates an agent |
| `updateMetadata(agent, metadataUri)` | Agent Owner / Owner | Updates the agent's metadata URI |
| `getAgent(agent)` | View | Returns agent info |
| `getAgentCount()` | View | Total registered agents |
| `getAgentAtIndex(index)` | View | Agent address at index (for enumeration) |

### Events

- `AgentRegistered(agent, name, agentOwner)`
- `AgentDeactivated(agent)`
- `AgentReactivated(agent)`
- `AgentMetadataUpdated(agent, metadataUri)`

### Constructor

No parameters. Deployer becomes owner.

---

## Deployment

Contracts are deployed externally using Hardhat. See `hardhat.config.cjs` and `scripts/deploy.cjs` for the deployment configuration.

### Required Environment Variables for Deployment

```bash
DEPLOYER_PRIVATE_KEY=0x...   # Deployer wallet private key (funded with ETH on Base)
BASE_RPC_URL=https://mainnet.base.org
BASE_USDC_ADDRESS=0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913  # USDC on Base
```

### Deployment Order

1. `DJZSAgentRegistry` (no dependencies)
2. `DJZSLogicTrustScore` (no dependencies)
3. `DJZSStaking` (requires USDC address)
4. `DJZSEscrowLock` (requires USDC address)

After deployment, authorize the settlement wallet as a writer on `DJZSLogicTrustScore` and as the settlement agent on `DJZSEscrowLock`.
