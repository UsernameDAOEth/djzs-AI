import { Livepeer } from "livepeer";

let livepeerClient: Livepeer | null = null;

function getLivepeerClient(): Livepeer {
  if (!livepeerClient) {
    const apiKey = process.env.LIVEPEER_API_KEY;
    if (!apiKey) {
      throw new Error("LIVEPEER_API_KEY is not configured");
    }
    livepeerClient = new Livepeer({ apiKey });
  }
  return livepeerClient;
}

export async function createUploadUrl(name: string) {
  const livepeer = getLivepeerClient();
  const response = await livepeer.asset.create({ name });
  
  if (!response.data) {
    throw new Error("Failed to create upload URL");
  }

  return {
    tusEndpoint: response.data.tusEndpoint,
    assetId: response.data.asset?.id,
    playbackId: response.data.asset?.playbackId,
  };
}

export async function getAssetStatus(assetId: string) {
  const livepeer = getLivepeerClient();
  const response = await livepeer.asset.get(assetId);
  
  if (!response.asset) {
    throw new Error("Asset not found");
  }

  return {
    id: response.asset.id,
    name: response.asset.name,
    status: response.asset.status,
    playbackId: response.asset.playbackId,
    playbackUrl: response.asset.playbackUrl,
    downloadUrl: response.asset.downloadUrl,
  };
}

export async function getPlaybackInfo(playbackId: string) {
  const livepeer = getLivepeerClient();
  const response = await livepeer.playback.get(playbackId);
  
  if (!response.playbackInfo) {
    throw new Error("Playback info not found");
  }

  return response.playbackInfo;
}

export async function deleteAsset(assetId: string) {
  const livepeer = getLivepeerClient();
  await livepeer.asset.delete(assetId);
}
