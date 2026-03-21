import { useQuery } from "@tanstack/react-query"
import type { Holder, UseHoldersParams } from "@/types/holder"

export function useHolders({ coinType, limit = 100, skip = 0 }: UseHoldersParams) {
	return useQuery({
		queryKey: ["holders", coinType, limit, skip],
		queryFn: async () => {
			const res = await fetch(
				`/api/coin/${encodeURIComponent(coinType)}/holders?limit=${limit}&skip=${skip}`
			)
			if (!res.ok) return []
			const json = await res.json()
			const list = json.holders ?? []
			return list.map((h: { account: string; balance: string; percentage: string }) => ({
				user: h.account,
				balance: h.balance,
				percentage: parseFloat(h.percentage) * 100,
			})) as Holder[]
		},
		enabled: !!coinType,
	})
}