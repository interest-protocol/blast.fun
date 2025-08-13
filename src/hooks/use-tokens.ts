"use client"

import { useState, useEffect, useCallback } from "react"
import { useQuery } from "@tanstack/react-query"
import type { PoolWithMetadata } from "@/types/pool"
import { fetchTokens } from "@/lib/pump/fetch-tokens"
import { pumpSdk } from "@/lib/pump"

interface UseTokensOptions {
	sortBy?: "createdAt" | "bondingProgress"
	page?: number
	pageSize?: number
	pollInterval?: number
	enabled?: boolean
}

export function useTokens({
	sortBy = "createdAt",
	page = 1,
	pageSize = 10,
	pollInterval = 3000,
	enabled = true
}: UseTokensOptions = {}) {
	const [isPolling, setIsPolling] = useState(true)
	const [lastUpdated, setLastUpdated] = useState(Date.now())

	const fetchTokensWithMarketData = async (): Promise<PoolWithMetadata[]> => {
		const pools = await fetchTokens(page, pageSize)

		const enrichedPools = await Promise.all(
			pools.map(async (pool) => {
				const enhancedPool: PoolWithMetadata = {
					...pool,
					isProtected: !!pool.publicKey
				}

				try {
					const pumpPoolData = await pumpSdk.getPumpPool(pool.poolId)
					if (pumpPoolData) {
						enhancedPool.pumpPoolData = pumpPoolData
					}
				} catch (error) {
					console.warn(`Failed to fetch market data for pool ${pool.poolId}:`, error)
				}

				return enhancedPool
			})
		)

		const sortedPools = [...enrichedPools].sort((a, b) => {
			if (sortBy === "createdAt") {
				return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
			} else {
				const progressA = typeof a.bondingCurve === "number" ? a.bondingCurve : parseFloat(a.bondingCurve) || 0
				const progressB = typeof b.bondingCurve === "number" ? b.bondingCurve : parseFloat(b.bondingCurve) || 0
				return progressB - progressA
			}
		})

		setLastUpdated(Date.now())
		return sortedPools
	}

	const { data, isLoading, error, refetch } = useQuery({
		queryKey: ["tokens", sortBy, page, pageSize],
		queryFn: fetchTokensWithMarketData,
		enabled,
		staleTime: pollInterval - 100,
		gcTime: 10 * 60 * 1000,
		refetchInterval: false,
	})

	useEffect(() => {
		if (!isPolling || !enabled) return

		const interval = setInterval(async () => {
			try {
				await refetch()
			} catch (error) {
				console.error("Polling error:", error)
			}
		}, pollInterval)

		return () => clearInterval(interval)
	}, [isPolling, enabled, pollInterval, refetch])

	const forceRefresh = useCallback(async () => {
		await refetch()
	}, [refetch])

	return {
		tokens: data || [],
		isLoading,
		error: error as Error | null,
		refetch,
		forceRefresh,
		setPolling: setIsPolling,
		isPolling,
		lastUpdated,
		fromCache: false
	}
}