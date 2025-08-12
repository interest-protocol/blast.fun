import { useQuery } from "@tanstack/react-query"
import type { Holder, UseHoldersParams } from "@/types/holder"
import { nexaClient } from "@/lib/nexa"

export function useHolders({ coinType, limit = 100, skip = 0, includePortfolio = false }: UseHoldersParams) {
	return useQuery({
		queryKey: ["holders", coinType, limit, skip, includePortfolio],
		queryFn: async () => {
			const data = includePortfolio 
				? await nexaClient.getHoldersWithPortfolio(coinType, limit, skip)
				: await nexaClient.getHolders(coinType, limit, skip)
			
			return data as Holder[]
		},
		enabled: !!coinType,
	})
}