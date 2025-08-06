import { useQuery } from "@tanstack/react-query"
import type { Holder, UseHoldersParams } from "@/types/holder"

export function useHolders({ coinType, limit = 100, skip = 0, includePortfolio = false }: UseHoldersParams) {
	return useQuery({
		queryKey: ["holders", coinType, limit, skip, includePortfolio],
		queryFn: async () => {
			const endpoint = includePortfolio 
				? `/api/${coinType}/holders-with-portfolio?limit=${limit}&skip=${skip}`
				: `/api/${coinType}/holders?limit=${limit}&skip=${skip}`
				
			const response = await fetch(endpoint)

			if (!response.ok) {
				throw new Error("Failed to fetch holders")
			}

			const data = await response.json()
			return data as Holder[]
		},
		enabled: !!coinType,
	})
}