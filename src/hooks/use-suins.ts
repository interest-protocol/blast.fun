import { useQuery } from "@tanstack/react-query"
import { suiClient } from "@/lib/sui-client"

/**
 * Hook to fetch SuiNS name for an address
 */
export function useSuiNSName(address: string | undefined) {
	return useQuery({
		queryKey: ["suins", address],
		queryFn: async () => {
			if (!address) return null

			try {
				// @dev: Use the built-in SuiClient method
				const result = await suiClient.resolveNameServiceNames({
					address: address,
					format: "dot",
				})

				return result.data?.[0] || null

			} catch (error) {
				console.warn(`Failed to fetch SuiNS name for ${address}:`, error)
				return null
			}
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
			const results: Record<string, string | null> = {}
			
			// @dev: Process addresses in parallel
			await Promise.all(
				addresses.map(async (address) => {
					try {
						const result = await suiClient.resolveNameServiceNames({
							address: address,
							format: "dot",
						})

						results[address] = result.data?.[0] || null
					} catch (error) {
						console.warn(`Failed to fetch SuiNS for ${address}:`, error)
						results[address] = null
					}
				})
			)
			
			return results
		},
		enabled: addresses.length > 0,
		staleTime: 3600000, // @dev: Cache for 1 hour
		gcTime: 7200000, // @dev: Keep in cache for 2 hours
	})
}