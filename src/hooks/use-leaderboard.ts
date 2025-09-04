import { useState, useEffect, useMemo } from "react"
import { LeaderboardEntry } from "@/types/leaderboard"

export type TimeRange = '1d' | '1w' | '1m'
export type SortBy = 'volume' | 'trades'
export type SortOrder = 'asc' | 'desc'

interface UseLeaderboardOptions {
	timeRange?: TimeRange
}

export function useLeaderboard({ timeRange = '1d' }: UseLeaderboardOptions = {}) {
	const [rawData, setRawData] = useState<LeaderboardEntry[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [sortBy, setSortBy] = useState<SortBy>('volume')
	const [sortOrder, setSortOrder] = useState<SortOrder>('desc')

	useEffect(() => {
		const fetchLeaderboard = async () => {
			setLoading(true)
			setError(null)
			
			try {
				const params = new URLSearchParams({
					timeRange,
					sortOn: 'volume' // @dev: Always fetch by volume from API, we'll sort client-side
				})
				
				const response = await fetch(`/api/leaderboard?${params}`)
				const result = await response.json()
				
				if (result.error) {
					setError(result.error)
					setRawData([])
				} else {
					const entries: LeaderboardEntry[] = Array.isArray(result) ? result : result.leaderboard || []
					setRawData(entries)
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
	}, [timeRange])

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
		error,
		sortBy,
		sortOrder,
		handleSort,
		refetch: () => {
			setLoading(true)
			setError(null)
		}
	}
}