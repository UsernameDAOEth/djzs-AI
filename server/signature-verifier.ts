import { verifyMessage } from 'viem';
import { type Request, type Response, type NextFunction } from 'express';
import { readEscrowState } from './escrow-contract';
import { computeTraceHash } from './adversarial-audit';

export function buildSignatureMessage(escrowId: number, strategyMemoHash: string): string {
  return `DJZS-AUDIT:${escrowId}:${strategyMemoHash}`;
}

export async function verifyCallerIsRecipient(
  signature: `0x${string}`,
  escrowId: number,
  strategyMemoHash: string,
  expectedAddress: string
): Promise<boolean> {
  const message = buildSignatureMessage(escrowId, strategyMemoHash);

  const valid = await verifyMessage({
    address: expectedAddress as `0x${string}`,
    message,
    signature,
  });

  return valid;
}

export function requireEscrowSignature() {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const signature = req.headers['x-escrow-signature'] as string | undefined;
      if (!signature) {
        return res.status(401).json({ error: 'Missing x-escrow-signature header' });
      }

      if (!signature.startsWith('0x')) {
        return res.status(401).json({ error: 'Invalid signature format: must be a hex string starting with 0x' });
      }

      const { escrow_id, strategy_memo } = req.body;

      if (escrow_id === undefined || escrow_id === null) {
        return res.status(401).json({ error: 'Missing escrow_id in request body' });
      }

      if (!strategy_memo || typeof strategy_memo !== 'string') {
        return res.status(401).json({ error: 'Missing or invalid strategy_memo in request body' });
      }

      const escrowData = await readEscrowState(BigInt(escrow_id));

      if (!escrowData) {
        return res.status(401).json({ error: `Escrow ${escrow_id} not found on-chain` });
      }

      if (escrowData.settled) {
        return res.status(401).json({ error: `Escrow ${escrow_id} is already settled` });
      }

      const memoHash = computeTraceHash(strategy_memo);

      const isValid = await verifyCallerIsRecipient(
        signature as `0x${string}`,
        Number(escrow_id),
        memoHash,
        escrowData.recipient
      );

      if (!isValid) {
        return res.status(401).json({
          error: 'Signature verification failed: signer is not the escrow recipient',
        });
      }

      (req as any).escrowData = {
        escrowId: Number(escrow_id),
        creator: escrowData.creator,
        recipient: escrowData.recipient,
        amount: escrowData.amount,
        executionTraceHash: escrowData.executionTraceHash,
        settled: escrowData.settled,
      };

      next();
    } catch (err: any) {
      const msg = err.message || "Unknown error";
      console.error('[signature-verifier] Error:', msg);

      if (msg.includes("ESCROW_CONTRACT_ADDRESS") || msg.includes("BASE_RPC_URL") || msg.includes("SETTLEMENT_PRIVATE_KEY")) {
        return res.status(503).json({
          error: "Escrow service not configured",
          code: "DJZS-ESCROW-CONFIG",
        });
      }

      return res.status(401).json({
        error: `Signature verification error: ${msg}`,
      });
    }
  };
}
