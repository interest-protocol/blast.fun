"use client"

import { useQuery } from "@tanstack/react-query"
import type { TokenCreator } from "@/types/token"
import type { NoodlesCoinList } from "@/lib/noodles/client"

const MAX_CREATORS_TO_FETCH = 50

export function useCreatorsForList(
	coins: NoodlesCoinList[]
): Record<string, TokenCreator> {
	const coinTypes = coins
		.slice(0, MAX_CREATORS_TO_FETCH)
		.map((c) => c.coinType)

	const { data } = useQuery({
		queryKey: ["creators-for-list", coinTypes.join(",")],
		queryFn: async () => {
			const res = await fetch("/api/coin/creators-batch", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ coinTypes }),
			})
			if (!res.ok) return {}
			const json = (await res.json()) as { creators: Record<string, TokenCreator> }
			return json.creators ?? {}
		},
		enabled: coinTypes.length > 0,
		staleTime: 2 * 60 * 1000,
	})

	return data ?? {}
}
