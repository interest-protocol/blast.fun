import { useQuery } from "@tanstack/react-query"
import type { MarketData } from "@/types/market"

export function useMarketData(coinType: string) {
	return useQuery({
		queryKey: ["market-data", coinType],
		queryFn: async () => {
			const response = await fetch(`/api/${coinType}/market-data`)

			if (!response.ok) {
				throw new Error("Failed to fetch market data")
			}

			const data = await response.json()
			return data as MarketData
		},
		enabled: !!coinType,
		refetchInterval: 30000,
	})
}