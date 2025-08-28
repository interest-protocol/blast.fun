import { useQuery } from "@tanstack/react-query"
import { SuiNSCache } from "@/lib/suins-cache"

/**
 * Hook to fetch SuiNS name for an address
 */
export function useSuiNSName(address: string | undefined) {
	return useQuery({
		queryKey: ["suins", address],
		queryFn: async () => {
			if (!address) return null
			// @dev: Use session storage cache
			return await SuiNSCache.getName(address)
		},
		enabled: !!address,
		staleTime: 3600000, // @dev: Cache for 1 hour
		gcTime: 7200000, // @dev: Keep in cache for 2 hours
	})
}

/**
 * Hook to fetch SuiNS names for multiple addresses
 */
export function useSuiNSNames(addresses: string[]) {
	return useQuery({
		queryKey: ["suins-batch", addresses],
		queryFn: async () => {
			// @dev: Use session storage cache for batch operations
			return await SuiNSCache.getNames(addresses)
		},
		enabled: addresses.length > 0,
		staleTime: 3600000, // @dev: Cache for 1 hour
		gcTime: 7200000, // @dev: Keep in cache for 2 hours
	})
}