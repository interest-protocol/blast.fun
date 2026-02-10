import { useQuery } from "@tanstack/react-query"
import type { Holder, UseHoldersParams } from "@/types/holder"

export function useHolders({ coinType, limit = 100, skip = 0 }: UseHoldersParams) {
	return useQuery({
		queryKey: ["holders", coinType, limit],
		queryFn: async () => {
			const res = await fetch(
				`/api/coin/holders/${encodeURIComponent(coinType)}?limit=${limit}`,
				{ headers: { Accept: "application/json" } }
			)
			if (!res.ok) return []
			const data = await res.json()
			const holders = Array.isArray(data?.holders) ? data.holders : []
			return holders.map(
				(h: { account: string; balance: string; percentage: string }, i: number): Holder => ({
					rank: skip + i + 1,
					user: h.account,
					balance: Number(h.balance) || 0,
					percentage: Number(h.percentage) || 0,
					balanceUsd: 0,
					balanceScaled: Number(h.balance) || 0,
				})
			)
		},
		enabled: !!coinType,
	})
}