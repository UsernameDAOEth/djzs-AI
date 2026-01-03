import { useQuery } from "@tanstack/react-query";

export interface Web3ProfileLink {
  link: string;
  handle: string;
  sources: string[];
}

export interface Web3Profile {
  address: string;
  identity: string;
  platform: "ens" | "farcaster" | "lens" | "basenames" | "linea" | string;
  displayName: string;
  avatar: string | null;
  description: string | null;
  email: string | null;
  location: string | null;
  header: string | null;
  links: {
    website?: Web3ProfileLink;
    github?: Web3ProfileLink;
    twitter?: Web3ProfileLink;
    farcaster?: Web3ProfileLink;
    lens?: Web3ProfileLink;
  };
  social: {
    uid?: number | null;
    follower?: number;
    following?: number;
  };
}

async function fetchWeb3Profile(address: string): Promise<Web3Profile[]> {
  if (!address) return [];
  
  const response = await fetch(`https://api.web3.bio/profile/${address}`);
  
  if (!response.ok) {
    if (response.status === 404) {
      return [];
    }
    throw new Error(`Failed to fetch profile: ${response.status}`);
  }
  
  return response.json();
}

export function useWeb3Profile(address: string | undefined) {
  return useQuery({
    queryKey: ["web3profile", address],
    queryFn: () => fetchWeb3Profile(address!),
    enabled: !!address,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}

export function getPrimaryProfile(profiles: Web3Profile[]): Web3Profile | null {
  if (!profiles || profiles.length === 0) return null;
  
  const priority = ["ens", "basenames", "farcaster", "lens"];
  for (const platform of priority) {
    const profile = profiles.find((p) => p.platform === platform);
    if (profile) return profile;
  }
  return profiles[0];
}

export function getAllLinks(profiles: Web3Profile[]) {
  const links: Record<string, Web3ProfileLink> = {};
  
  for (const profile of profiles) {
    if (profile.links) {
      Object.entries(profile.links).forEach(([key, value]) => {
        if (value && !links[key]) {
          links[key] = value;
        }
      });
    }
  }
  
  return links;
}

export function getTotalFollowers(profiles: Web3Profile[]): number {
  return profiles.reduce((total, p) => total + (p.social?.follower || 0), 0);
}
