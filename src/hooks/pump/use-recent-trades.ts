'use client'

import { useQuery } from '@tanstack/react-query'
import { fetchRecentTrades } from '@/lib/pump/fetch-trades'

interface UseRecentTradesOptions {
	page?: number
	pageSize?: number
}

export function useRecentTrades(options: UseRecentTradesOptions = {}) {
	const { page = 1, pageSize = 10 } = options

	return useQuery({
		queryKey: ['recent-trades', page, pageSize],
		queryFn: () => fetchRecentTrades(page, pageSize),
		staleTime: 30 * 1000, // 30 seconds
		refetchInterval: 2 * 60 * 1000 // 2 minutes
	})
}