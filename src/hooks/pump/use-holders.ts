"use client"

import { useQuery } from "@tanstack/react-query"

interface Holder {
	rank: number
	user: string
	balance: number
	percentage: number
	balanceUsd: number
	balanceScaled: number
}

interface UseHoldersOptions {
	coinType: string
	limit?: number
	skip?: number
}

export function useHolders({ coinType, limit = 100, skip = 0 }: UseHoldersOptions) {
	return useQuery<Holder[]>({
		queryKey: ["holders", coinType, limit, skip],
		queryFn: async () => {
			const response = await fetch(
				`/api/holders?coinType=${encodeURIComponent(coinType)}&limit=${limit}&skip=${skip}`
			)

			if (!response.ok) {
				throw new Error("Failed to fetch holders")
			}

			return response.json()
		},
		staleTime: 1000 * 60, // 1 minute
		refetchInterval: 1000 * 30, // Refetch every 30 seconds
	})
}