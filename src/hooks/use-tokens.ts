"use client"

import { useState, useEffect, useCallback } from "react"
import { useQuery } from "@tanstack/react-query"
import type { PoolWithMetadata } from "@/types/pool"
import { fetchTokens } from "@/lib/pump/fetch-tokens"

interface UseTokensOptions {
	sortBy?: "createdAt" | "bondingProgress"
	page?: number
	pageSize?: number
	pollInterval?: number
	enabled?: boolean
}

// @dev: i love hard code shit!! lets gooooo!!!!!
const HIDDEN_POOL_IDS = [
	"0x35d9c8fdb1c90fb16d8b7f2f1ca129db36b6ad519f78a1a5bd52880e3ba841ea",
	"0xf973a5e4df120288e617f6607bee130732d7690677184413a44f91f560578a25"
]

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

		// @dev filter out hidden pools! remove this shit later
		const filteredPools = pools.filter(pool => !HIDDEN_POOL_IDS.includes(pool.poolId))

		const enrichedPools = filteredPools.map((pool) => ({
			...pool,
			isProtected: !!pool.publicKey
		}))

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