"use client"

import { useQuery } from "@tanstack/react-query"
import { fetchTokenByCoinType } from "@/lib/fetch-token-by-cointype"

export function useToken(coinType: string) {
	return useQuery({
		queryKey: ["token-with-metadata", coinType],
		queryFn: () => fetchTokenByCoinType(coinType),
		enabled: !!coinType && coinType.trim().length > 0,
		staleTime: 5 * 60 * 1000, // 5 minutes
		refetchInterval: 30000, // 30 seconds
	})
}
