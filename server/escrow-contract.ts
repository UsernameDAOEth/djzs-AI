import { createPublicClient, createWalletClient, http, decodeEventLog, type Hex, type Address } from "viem";
import { base } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";

export const escrowContractAbi = [
  {
    type: "event" as const,
    name: "AuditPending" as const,
    inputs: [
      { name: "escrowId", type: "uint256" as const, indexed: true },
      { name: "creator", type: "address" as const, indexed: false },
      { name: "recipient", type: "address" as const, indexed: false },
      { name: "executionTraceHash", type: "bytes32" as const, indexed: false },
      { name: "amount", type: "uint256" as const, indexed: false },
    ],
  },
  {
    type: "function" as const,
    name: "settleEscrow" as const,
    inputs: [
      { name: "escrowId", type: "uint256" as const },
      { name: "passed", type: "bool" as const },
      { name: "irisTxId", type: "string" as const },
    ],
    outputs: [],
    stateMutability: "nonpayable" as const,
  },
  {
    type: "function" as const,
    name: "getEscrow" as const,
    inputs: [
      { name: "escrowId", type: "uint256" as const },
    ],
    outputs: [
      { name: "creator", type: "address" as const },
      { name: "recipient", type: "address" as const },
      { name: "amount", type: "uint256" as const },
      { name: "executionTraceHash", type: "bytes32" as const },
      { name: "settled", type: "bool" as const },
    ],
    stateMutability: "view" as const,
  },
] as const;

function getContractAddress(): Address {
  const addr = process.env.ESCROW_CONTRACT_ADDRESS;
  if (!addr) {
    throw new Error("ESCROW_CONTRACT_ADDRESS environment variable is required for escrow operations");
  }
  return addr as Address;
}

export function getEscrowPublicClient() {
  const rpcUrl = process.env.BASE_RPC_URL;
  if (!rpcUrl) {
    throw new Error("BASE_RPC_URL environment variable is required for on-chain escrow reads");
  }
  return createPublicClient({
    chain: base,
    transport: http(rpcUrl),
  });
}

export function getEscrowWalletClient() {
  const privateKey = process.env.SETTLEMENT_PRIVATE_KEY;
  if (!privateKey) {
    throw new Error("SETTLEMENT_PRIVATE_KEY environment variable is required for escrow settlement transactions");
  }
  const rpcUrl = process.env.BASE_RPC_URL;
  if (!rpcUrl) {
    throw new Error("BASE_RPC_URL environment variable is required for on-chain escrow transactions");
  }
  const account = privateKeyToAccount(privateKey as Hex);
  return createWalletClient({
    account,
    chain: base,
    transport: http(rpcUrl),
  });
}

export interface AuditPendingEventData {
  escrowId: bigint;
  creator: string;
  recipient: string;
  executionTraceHash: Hex;
  amount: bigint;
}

export async function readAuditPendingEvent(txHash: string): Promise<AuditPendingEventData> {
  const client = getEscrowPublicClient();
  const contractAddress = getContractAddress();

  const receipt = await client.getTransactionReceipt({
    hash: txHash as Hex,
  });

  if (!receipt) {
    throw new Error(`Transaction ${txHash} not found on Base Mainnet`);
  }

  if (receipt.status !== "success") {
    throw new Error(`Transaction ${txHash} failed on-chain`);
  }

  const contractLogs = receipt.logs.filter(
    (log) => log.address.toLowerCase() === contractAddress.toLowerCase()
  );

  for (const log of contractLogs) {
    try {
      const decoded = decodeEventLog({
        abi: escrowContractAbi,
        data: log.data,
        topics: log.topics,
      });

      if (decoded.eventName === "AuditPending") {
        return {
          escrowId: decoded.args.escrowId,
          creator: decoded.args.creator,
          recipient: decoded.args.recipient,
          executionTraceHash: decoded.args.executionTraceHash as Hex,
          amount: decoded.args.amount,
        };
      }
    } catch {
      continue;
    }
  }

  throw new Error(`No AuditPending event found in transaction ${txHash} from contract ${contractAddress}`);
}

export async function callSettleEscrow(
  escrowId: bigint,
  passed: boolean,
  irisTxId: string
): Promise<Hex> {
  const walletClient = getEscrowWalletClient();
  const contractAddress = getContractAddress();

  const txHash = await walletClient.writeContract({
    address: contractAddress,
    abi: escrowContractAbi,
    functionName: "settleEscrow",
    args: [escrowId, passed, irisTxId],
  });

  return txHash;
}

export interface EscrowState {
  creator: string;
  recipient: string;
  amount: bigint;
  executionTraceHash: Hex;
  settled: boolean;
}

export async function readEscrowState(escrowId: bigint): Promise<EscrowState> {
  const client = getEscrowPublicClient();
  const contractAddress = getContractAddress();

  const result = await client.readContract({
    address: contractAddress,
    abi: escrowContractAbi,
    functionName: "getEscrow",
    args: [escrowId],
  });

  const [creator, recipient, amount, executionTraceHash, settled] = result;

  return {
    creator,
    recipient,
    amount,
    executionTraceHash: executionTraceHash as Hex,
    settled,
  };
}

if (!process.env.ESCROW_CONTRACT_ADDRESS) {
  console.warn("[escrow-contract] ESCROW_CONTRACT_ADDRESS not set — escrow features will fail at call time");
}
if (!process.env.SETTLEMENT_PRIVATE_KEY) {
  console.warn("[escrow-contract] SETTLEMENT_PRIVATE_KEY not set — escrow settlement will fail at call time");
}
