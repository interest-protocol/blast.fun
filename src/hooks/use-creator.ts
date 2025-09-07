"use client"

import { useQuery } from "@tanstack/react-query"

export interface CreatorData {
	launchCount: number
	followers: string
	trustedFollowers: string
	twitterHandle: string | null
	twitterId: string | null
}

async function fetchCreatorData(coinType: string): Promise<CreatorData | null> {
	if (!coinType) return null

	try {
		const response = await fetch(`/api/coin/${coinType}/creator`, {
			headers: {
				"Accept": "application/json",
				'cloudflare-cache': '3600',
				'cache-control': 'no-store'
			}
		})

		if (!response.ok) {
			if (response.status === 404 || response.status === 204) {
				// @dev: Creator not found is expected for some tokens
				return null
			}
			throw new Error(`Failed to fetch creator data: ${response.status}`)
		}

		return response.json()
	} catch (error) {
		console.error("Error fetching creator data:", error)
		return null
	}
}

export function useCreator(
	coinType: string | undefined,
	options?: {
		enabled?: boolean
		staleTime?: number
	}
) {
	return useQuery({
		queryKey: ["creator", coinType],
		queryFn: () => {
			if (!coinType) return Promise.resolve(null)
			return fetchCreatorData(coinType)
		},
		enabled: (options?.enabled ?? true) && !!coinType,
		staleTime: options?.staleTime ?? 300000, // @dev: 5 minutes stale time since it's cached server-side
		gcTime: 600000, // @dev: 10 minutes garbage collection time
		retry: 1 // @dev: Only retry once for creator data
	})
}