import { useState } from "react";
import { useAccount } from "wagmi";
import { writeContract } from "@wagmi/core";
import { keccak256, stringToBytes } from "viem";
import { PRIVACY_NFT_CONTRACT, PRIVACY_NFT_ABI, wagmiConfig } from "@/lib/wagmi-config";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Lock, Sparkles } from "lucide-react";

export interface UploadedFile {
  name: string;
  ipfsHash?: string;
  metadataIpfsHash?: string;
  ipfsUrl?: string;
}

interface PrivacyMintButtonProps {
  journalContent: string;
  uploadedFile?: UploadedFile | null;
  disabled?: boolean;
}

export function PrivacyMintButton({ journalContent, uploadedFile, disabled = false }: PrivacyMintButtonProps) {
  const { address, chainId } = useAccount();
  const [minting, setMinting] = useState(false);
  const [txHash, setTxHash] = useState<`0x${string}` | null>(null);
  const { toast } = useToast();

  const isContractConfigured = PRIVACY_NFT_CONTRACT !== "0x0000000000000000000000000000000000000000";
  const isAztecChain = chainId === 31337;
  const canMint = address && isContractConfigured && isAztecChain && journalContent.length > 0 && !disabled;

  async function handleMintPrivacy() {
    if (!canMint) return;

    try {
      setMinting(true);
      setTxHash(null);

      let metadataIpfsHash = uploadedFile?.metadataIpfsHash;

      // If file is uploaded but metadata not pinned yet, pin the metadata
      if (uploadedFile?.ipfsHash && !metadataIpfsHash) {
        const metadataPayload = {
          name: uploadedFile.name,
          description: "Private journal entry on Aztec",
          image: `ipfs://${uploadedFile.ipfsHash}`,
          content: journalContent.substring(0, 100),
          attributes: [
            { trait_type: "Type", value: "Journal" },
            { trait_type: "Visibility", value: "Private" },
            { trait_type: "Timestamp", value: new Date().toISOString() },
          ],
        };

        const metaRes = await fetch("/api/journal/metadata", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(metadataPayload),
        });

        if (!metaRes.ok) {
          throw new Error("Failed to pin metadata");
        }

        const metaData = await metaRes.json();
        metadataIpfsHash = metaData.metadataIpfsHash;
      }

      // Create content hash for privacy NFT
      const contentHash = keccak256(stringToBytes(journalContent));
      const metadata = JSON.stringify({
        title: journalContent.substring(0, 50) + (journalContent.length > 50 ? "..." : ""),
        contentHash,
        timestamp: new Date().toISOString(),
        author: address,
        fileHash: uploadedFile?.ipfsHash,
        metadataHash: metadataIpfsHash,
      });

      const hash = await writeContract(wagmiConfig, {
        address: PRIVACY_NFT_CONTRACT,
        abi: PRIVACY_NFT_ABI,
        functionName: "mintPrivate",
        args: [contentHash, metadata],
        chainId: 31337,
      });

      setTxHash(hash);
      toast({
        title: "Privacy NFT Minted! 🔐",
        description: `Your journal entry is now a privacy NFT on Aztec. Hash: ${hash.slice(0, 10)}...`,
      });
    } catch (error) {
      console.error("Privacy mint error:", error);
      toast({
        title: "Minting Failed",
        description: error instanceof Error ? error.message : "Failed to mint privacy NFT",
        variant: "destructive",
      });
    } finally {
      setMinting(false);
    }
  }

  return (
    <div className="mt-6 space-y-3">
      <Button
        onClick={handleMintPrivacy}
        disabled={!canMint || minting}
        className="w-full gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50"
        data-testid="button-mint-privacy-nft"
      >
        <Lock className="h-4 w-4" />
        <Sparkles className="h-4 w-4" />
        {minting ? "Minting Privacy NFT..." : uploadedFile ? "Mint Journal + File 🔐" : "Mint as Privacy NFT 🔐"}
      </Button>

      {!isAztecChain && (
        <div className="rounded-lg border border-amber-400/30 bg-amber-400/10 p-3 text-sm text-amber-300">
          ⚠️ Switch to Aztec Testnet to mint privacy NFTs
        </div>
      )}

      {journalContent.length === 0 && (
        <div className="rounded-lg border border-slate-400/30 bg-slate-400/10 p-3 text-sm text-slate-300">
          ✍️ Write content in your journal first to mint as privacy NFT
        </div>
      )}

      {txHash && (
        <div className="rounded-xl border border-purple-400/30 bg-purple-400/10 p-3">
          <p className="text-sm text-purple-300">
            ✓ Privacy NFT minted on Aztec!{" "}
            <code className="font-mono text-xs">{txHash.slice(0, 10)}...{txHash.slice(-8)}</code>
          </p>
        </div>
      )}
    </div>
  );
}
