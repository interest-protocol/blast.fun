'use client'

import { useQuery } from '@tanstack/react-query'
import { fetchPools } from '@/lib/pump/fetch-pools'

interface UsePoolsOptions {
	page?: number
	pageSize?: number
}

export function usePools(options: UsePoolsOptions = {}) {
	const { page = 1, pageSize = 5 } = options

	return useQuery({
		queryKey: ['pools', page, pageSize],
		queryFn: () => fetchPools(page, pageSize),
		staleTime: 5 * 60 * 1000, // 5 minutes
		refetchInterval: 30000 // 30 seconds
	})
}