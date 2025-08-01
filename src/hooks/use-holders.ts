import { useQuery } from "@tanstack/react-query"
import type { Holder, UseHoldersParams } from "@/types/holder"

export function useHolders({ coinType, limit = 100, skip = 0 }: UseHoldersParams) {
	return useQuery({
		queryKey: ["holders", coinType, limit, skip],
		queryFn: async () => {
			const response = await fetch(
				`/api/${coinType}/holders?limit=${limit}&skip=${skip}`
			)

			if (!response.ok) {
				throw new Error("Failed to fetch holders")
			}

			const data = await response.json()
			return data as Holder[]
		},
		enabled: !!coinType,
	})
}