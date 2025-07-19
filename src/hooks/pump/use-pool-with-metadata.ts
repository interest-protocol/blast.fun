'use client'

import { useQuery } from '@tanstack/react-query'
import { fetchPoolWithMetadata } from '@/lib/pump/fetch-pools'

export function usePoolWithMetadata(poolId: string) {
	return useQuery({
		queryKey: ['pool-with-metadata', poolId],
		queryFn: () => fetchPoolWithMetadata(poolId),
		enabled: !!poolId && poolId.trim().length > 0,
		staleTime: 5 * 60 * 1000, // 5 minutes
		refetchInterval: 30000 // 30 seconds
	})
}