"use client"

import { useQuery } from "@tanstack/react-query"
import { fetchMarketTrades } from "@/lib/pump/fetch-market-trades"

interface UseTradesOptions {
	coinType: string
	page?: number
	pageSize?: number
}

export function useTrades({ coinType, page = 1, pageSize = 50 }: UseTradesOptions) {
	return useQuery({
		queryKey: ["trades", coinType, page, pageSize],
		queryFn: () => fetchMarketTrades({ coinType, page, pageSize }),
		staleTime: 1000 * 10, // 10 seconds
		refetchInterval: 1000 * 25, // Refetch every 25 seconds
	})
}
