import { useQuery } from "@tanstack/react-query";
import { createPublicClient, http } from "viem";
import { mainnet } from "viem/chains";
import { normalize } from "viem/ens";

const mainnetClient = createPublicClient({
  chain: mainnet,
  transport: http("https://eth.llamarpc.com"),
});

export function useEnsName(address: string | undefined) {
  return useQuery({
    queryKey: ["ens", "name", address],
    queryFn: async () => {
      if (!address) return null;
      try {
        const name = await mainnetClient.getEnsName({
          address: address as `0x${string}`,
        });
        return name;
      } catch {
        return null;
      }
    },
    enabled: !!address,
    staleTime: 1000 * 60 * 60,
    gcTime: 1000 * 60 * 60 * 24,
  });
}

export function useEnsAddress(name: string | undefined) {
  return useQuery({
    queryKey: ["ens", "address", name],
    queryFn: async () => {
      if (!name) return null;
      try {
        const address = await mainnetClient.getEnsAddress({
          name: normalize(name),
        });
        return address;
      } catch {
        return null;
      }
    },
    enabled: !!name,
    staleTime: 1000 * 60 * 60,
    gcTime: 1000 * 60 * 60 * 24,
  });
}

export function useEnsAvatar(ensName: string | null | undefined) {
  return useQuery({
    queryKey: ["ens", "avatar", ensName],
    queryFn: async () => {
      if (!ensName) return null;
      try {
        const avatar = await mainnetClient.getEnsAvatar({
          name: normalize(ensName),
        });
        return avatar;
      } catch {
        return null;
      }
    },
    enabled: !!ensName,
    staleTime: 1000 * 60 * 60,
    gcTime: 1000 * 60 * 60 * 24,
  });
}

export function useEnsText(ensName: string | null | undefined, key: string) {
  return useQuery({
    queryKey: ["ens", "text", ensName, key],
    queryFn: async () => {
      if (!ensName) return null;
      try {
        const text = await mainnetClient.getEnsText({
          name: normalize(ensName),
          key,
        });
        return text;
      } catch {
        return null;
      }
    },
    enabled: !!ensName,
    staleTime: 1000 * 60 * 60,
    gcTime: 1000 * 60 * 60 * 24,
  });
}

export function formatAddress(address: string | undefined): string {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function useDisplayName(address: string | undefined) {
  const { data: ensName, isLoading } = useEnsName(address);
  
  return {
    displayName: ensName || formatAddress(address),
    ensName,
    isLoading,
  };
}

export function useMultipleEnsNames(addresses: string[]) {
  const uniqueAddresses = [...new Set(addresses.filter(Boolean))];
  
  return useQuery({
    queryKey: ["ens", "names", uniqueAddresses.sort().join(",")],
    queryFn: async () => {
      const results: Record<string, string> = {};
      
      await Promise.all(
        uniqueAddresses.map(async (address) => {
          try {
            const name = await mainnetClient.getEnsName({
              address: address as `0x${string}`,
            });
            results[address] = name || formatAddress(address);
          } catch {
            results[address] = formatAddress(address);
          }
        })
      );
      
      return results;
    },
    enabled: uniqueAddresses.length > 0,
    staleTime: 1000 * 60 * 60,
    gcTime: 1000 * 60 * 60 * 24,
  });
}
