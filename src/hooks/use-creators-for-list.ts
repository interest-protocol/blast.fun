"use client";

import { useQuery } from "@tanstack/react-query";
import type { TokenCreator } from "@/types/token";
import type { NoodlesCoinList } from "@/lib/noodles/client";

const MAX_CREATORS_TO_FETCH = 50;

export function useCreatorsForList(coins: NoodlesCoinList[]): Record<string, TokenCreator> {
	const coinTypes = coins.slice(0, MAX_CREATORS_TO_FETCH).map((c) => c.coinType);

	const { data } = useQuery({
		queryKey: ["creators-for-list", coinTypes.join(",")],
		queryFn: async () => {
			const entries = await Promise.all(
				coinTypes.map(async (coinType) => {
					try {
						const res = await fetch(`/api/coin/${encodeURIComponent(coinType)}/creator`);
						if (!res.ok) return [coinType, null] as const;
						const json = await res.json();
						const creator = json.creator as TokenCreator | null;
						return [coinType, creator] as const;
					} catch {
						return [coinType, null] as const;
					}
				})
			);
			return Object.fromEntries(entries.filter(([, c]) => c != null)) as Record<string, TokenCreator>;
		},
		enabled: coinTypes.length > 0,
		staleTime: 2 * 60 * 1000,
	});

	return data ?? {};
}
