import { useQuery } from "@tanstack/react-query"
import { nexaClient } from "@/lib/nexa"

export function useMarketData(coinType: string, refetchInterval = 30000) {
	return useQuery({
		queryKey: ["market-data", coinType],
		queryFn: async () => {
			return await nexaClient.getMarketData(coinType)
		},
		enabled: !!coinType,
		refetchInterval,
	})
}