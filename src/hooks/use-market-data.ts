import { useQuery } from "@tanstack/react-query"

export function useMarketData(coinType: string, refetchInterval = 30000) {
	return useQuery({
		queryKey: ["market-data", coinType],
		queryFn: async () => {
			const res = await fetch(
				`/api/coin/${encodeURIComponent(coinType)}/market-data`,
				{ headers: { Accept: "application/json" } }
			)
			if (!res.ok) return null
			return res.json()
		},
		enabled: !!coinType,
		refetchInterval,
	})
}