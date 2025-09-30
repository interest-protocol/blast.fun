import { useState, useEffect, useMemo, useCallback } from "react"
import { LeaderboardEntry } from "@/types/leaderboard"

export type TimeRange = '24h' | '7d' | '14d' | 'all'
export type SortBy = 'volume' | 'trades'
export type SortOrder = 'asc' | 'desc'

interface UseLeaderboardOptions {
	timeRange?: TimeRange
	initialSort?: SortBy
	pageSize?: number
	cycleNumber?: number
}

export function useLeaderboard({ timeRange = '24h', initialSort = 'volume', pageSize = 50, cycleNumber }: UseLeaderboardOptions = {}) {
	const [rawData, setRawData] = useState<LeaderboardEntry[]>([])
	const [loading, setLoading] = useState(true)
	const [loadingMore, setLoadingMore] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [sortBy, setSortBy] = useState<SortBy>(initialSort)
	const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
	const [hasMore, setHasMore] = useState(true)
	const [skip, setSkip] = useState(0)

	// @dev: Reset data when timeRange or cycleNumber changes
	useEffect(() => {
		setRawData([])
		setSkip(0)
		setHasMore(true)
		setError(null)
	}, [timeRange, cycleNumber])

	// @dev: Fetch initial data
	useEffect(() => {
		const fetchLeaderboard = async () => {
			setLoading(true)
			setError(null)

			try {
				const params = new URLSearchParams({
					sortOn: 'totalVolume', // @dev: Always fetch by volume from API, we'll sort client-side
					timeRange,
					limit: pageSize.toString(),
					skip: '0'
				})

				if (cycleNumber !== undefined && timeRange === '14d') {
					params.set('cycle', cycleNumber.toString())
				}

				const response = await fetch(`/api/leaderboard?${params}`)
				const result = await response.json()

				if (result.error) {
					setError(result.error)
					setRawData([])
				} else {
					const entries: LeaderboardEntry[] = Array.isArray(result) ? result : result.leaderboard || []
					setRawData(entries)
					setSkip(entries.length)
					setHasMore(entries.length === pageSize)
				}
			} catch (err) {
				console.error('Failed to fetch leaderboard:', err)
				setError('Failed to load leaderboard')
				setRawData([])
			} finally {
				setLoading(false)
			}
		}

		fetchLeaderboard()
	}, [timeRange, pageSize, cycleNumber])

	// @dev: Load more data
	const loadMore = useCallback(async () => {
		if (loadingMore || !hasMore || loading) return

		setLoadingMore(true)
		try {
			const params = new URLSearchParams({
				sortOn: 'totalVolume',
				timeRange,
				limit: pageSize.toString(),
				skip: skip.toString()
			})

			if (cycleNumber !== undefined && timeRange === '14d') {
				params.set('cycle', cycleNumber.toString())
			}

			const response = await fetch(`/api/leaderboard?${params}`)
			const result = await response.json()

			if (!result.error) {
				const entries: LeaderboardEntry[] = Array.isArray(result) ? result : result.leaderboard || []
				if (entries.length > 0) {
					setRawData(prev => [...prev, ...entries])
					setSkip(prev => prev + entries.length)
					setHasMore(entries.length === pageSize)
				} else {
					setHasMore(false)
				}
			}
		} catch (err) {
			console.error('Failed to load more:', err)
		} finally {
			setLoadingMore(false)
		}
	}, [loadingMore, hasMore, loading, skip, timeRange, pageSize, cycleNumber])

	// @dev: Sort data based on current sort settings
	const data = useMemo(() => {
		const sorted = [...rawData].sort((a: LeaderboardEntry, b: LeaderboardEntry) => {
			const aValue = sortBy === 'volume' ? (a.totalVolume || 0) : (a.tradeCount || 0)
			const bValue = sortBy === 'volume' ? (b.totalVolume || 0) : (b.tradeCount || 0)
			
			if (sortOrder === 'desc') {
				return bValue - aValue
			}
			return aValue - bValue
		})

		return sorted.map((entry: LeaderboardEntry, index: number) => ({
			...entry,
			rank: index + 1
		}))
	}, [rawData, sortBy, sortOrder])

	const handleSort = (field: SortBy) => {
		// @dev: Only allow sorting by different fields, always keep descending order
		if (field !== sortBy) {
			setSortBy(field)
		}
	}

	return {
		data,
		loading,
		loadingMore,
		error,
		sortBy,
		sortOrder,
		handleSort,
		hasMore,
		loadMore,
		refetch: () => {
			setRawData([])
			setSkip(0)
			setHasMore(true)
			setLoading(true)
			setError(null)
		}
	}
}