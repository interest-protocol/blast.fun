import { useState, useEffect } from "react"
import { LeaderboardEntry } from "@/types/leaderboard"

export type TimeRange = '1d' | '1w' | '1m'
export type SortBy = 'volume' | 'trades'

interface UseLeaderboardOptions {
	timeRange?: TimeRange
	sortBy?: SortBy
}

export function useLeaderboard({ timeRange = '1d', sortBy = 'volume' }: UseLeaderboardOptions = {}) {
	const [data, setData] = useState<LeaderboardEntry[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		const fetchLeaderboard = async () => {
			setLoading(true)
			setError(null)
			
			try {
				const params = new URLSearchParams({
					timeRange,
					sortOn: sortBy
				})
				
				const response = await fetch(`/api/leaderboard?${params}`)
				const result = await response.json()
				
				if (result.error) {
					setError(result.error)
					setData([])
				} else {
					let entries: LeaderboardEntry[] = Array.isArray(result) ? result : result.leaderboard || []
					
					entries = entries.sort((a: LeaderboardEntry, b: LeaderboardEntry) => {
						if (sortBy === 'volume') {
							return (b.totalVolume || 0) - (a.totalVolume || 0)
						} else {
							return (b.tradeCount || 0) - (a.tradeCount || 0)
						}
					})

					entries = entries.map((entry: LeaderboardEntry, index: number) => ({
						...entry,
						rank: index + 1
					}))
					
					setData(entries)
				}
			} catch (err) {
				console.error('Failed to fetch leaderboard:', err)
				setError('Failed to load leaderboard')
				setData([])
			} finally {
				setLoading(false)
			}
		}

		fetchLeaderboard()
	}, [timeRange, sortBy])

	return {
		data,
		loading,
		error,
		refetch: () => {
			setLoading(true)
			setError(null)
		}
	}
}