import { useQuery } from "@tanstack/react-query"

export interface QuickBuyData {
	poolId: string
	decimals: number
	symbol: string
	migrated: boolean
}

export function useQuickBuyData(coinType: string, enabled: boolean = false) {
	return useQuery<QuickBuyData>({
		queryKey: ["quick-buy-data", coinType],
		queryFn: async () => {
			const response = await fetch(`/api/tokens/${encodeURIComponent(coinType)}/quick-buy`)

			if (!response.ok) {
				throw new Error("Failed to fetch quick buy data")
			}

			return response.json()
		},
		enabled,
		staleTime: 30000,
		gcTime: 5 * 60 * 1000,
		retry: 2,
		retryDelay: 1000,
	})
}
