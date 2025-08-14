"use client"

import { useQuery } from "@tanstack/react-query"
import { fetchTokenWithMetadata } from "@/lib/pump/fetch-token"

export function useTokenWithMetadata(poolId: string) {
	return useQuery({
		queryKey: ["token-with-metadata", poolId],
		queryFn: () => fetchTokenWithMetadata(poolId),
		enabled: !!poolId && poolId.trim().length > 0,
		staleTime: 5 * 60 * 1000, // 5 minutes
		refetchInterval: 30000, // 30 seconds
	})
}