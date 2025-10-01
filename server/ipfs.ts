import { env } from "process";

const PINATA_API_KEY = env.PINATA_API_KEY;
const PINATA_API_SECRET = env.PINATA_API_SECRET;
const PINATA_JWT = env.PINATA_JWT;
const PINATA_API_URL = "https://api.pinata.cloud";
const PINATA_GATEWAY = env.PINATA_GATEWAY || "gateway.pinata.cloud";

interface PinataResponse {
  IpfsHash: string;
  PinSize: number;
  Timestamp: string;
}

interface NFTMetadata {
  name: string;
  description: string;
  image?: string;
  external_url?: string;
  attributes?: Array<{
    trait_type: string;
    value: string | number;
  }>;
}

async function pinJSONToIPFS(metadata: NFTMetadata): Promise<string> {
  if (!PINATA_JWT && (!PINATA_API_KEY || !PINATA_API_SECRET)) {
    throw new Error("Pinata credentials not configured. Set PINATA_JWT or both PINATA_API_KEY and PINATA_API_SECRET");
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (PINATA_JWT) {
    headers["Authorization"] = `Bearer ${PINATA_JWT}`;
  } else if (PINATA_API_KEY && PINATA_API_SECRET) {
    headers["pinata_api_key"] = PINATA_API_KEY;
    headers["pinata_secret_api_key"] = PINATA_API_SECRET;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);

  try {
    const response = await fetch(`${PINATA_API_URL}/pinning/pinJSONToIPFS`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        pinataContent: metadata,
        pinataMetadata: {
          name: metadata.name,
        },
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Pinata API error: ${response.status} - ${error}`);
    }

    const result: PinataResponse = await response.json();
    return result.IpfsHash;
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("Pinata request timeout (30s)");
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

function getIPFSUrl(ipfsHash: string): string {
  return `https://${PINATA_GATEWAY}/ipfs/${ipfsHash}`;
}

function getIPFSUri(ipfsHash: string): string {
  return `ipfs://${ipfsHash}`;
}

export const ipfsService = {
  pinJSONToIPFS,
  getIPFSUrl,
  getIPFSUri,
};

export type { NFTMetadata };
