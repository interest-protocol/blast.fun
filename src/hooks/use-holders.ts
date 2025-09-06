import { useQuery } from "@tanstack/react-query"
import { nexaClient } from "@/lib/nexa"
import type { Holder, UseHoldersParams } from "@/types/holder"

export function useHolders({ coinType, limit = 100, skip = 0 }: UseHoldersParams) {
	return useQuery({
		queryKey: ["holders", coinType, limit, skip],
		queryFn: async () => {
			const data = await nexaClient.getHolders(coinType, limit, skip)
			return data as Holder[]
		},
		enabled: !!coinType,
	})
}
