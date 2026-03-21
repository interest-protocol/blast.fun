"use client"

import { useQuery, useInfiniteQuery } from "@tanstack/react-query"
import { fetchPortfolio } from "@/lib/fetch-portfolio"
import type { Holder } from "@/types/holder"

interface UseHoldersWithPortfolioOptions {
	coinType: string
	limit?: number
	skip?: number
	enabled?: boolean
}

async function fetchHolders(coinType: string): Promise<{ account: string; balance: string; percentage: string }[]> {
	const res = await fetch(`/api/coin/${encodeURIComponent(coinType)}/holders`)
	if (!res.ok) return []
	const json = await res.json()
	return json.holders ?? []
}

export function useHoldersWithPortfolio({
	coinType,
	limit = 10,
	skip = 0,
	enabled = true
}: UseHoldersWithPortfolioOptions) {
	return useQuery({
		queryKey: ["holders-with-portfolio", coinType, limit, skip],
		queryFn: async () => {
			const holdersData = await fetchHolders(coinType)
			const sliced = holdersData.slice(skip, skip + limit)
			if (sliced.length === 0) return []

			const holdersWithPortfolio = await Promise.all(
				sliced.map(async (holder: { account: string; balance: string; percentage: string }, index: number) => {
					try {
						const portfolio = await fetchPortfolio(holder.account)
						const coinBalance = portfolio?.balances?.find(
							(b: any) => b.coinType === coinType
						)

						const marketStats = coinBalance?.marketStats || {
							amountBought: 0,
							amountSold: 0,
							buyTrades: 0,
							sellTrades: 0,
							usdBought: 0,
							usdSold: 0,
							currentHolding: holder.balance,
							pnl: 0
						}

						return {
							rank: skip + index + 1,
							user: holder.account,
							balance: holder.balance || 0,
							percentage: parseFloat(holder.percentage || "0") * 100,
							balanceUsd: coinBalance?.value || 0,
							balanceScaled: holder.balance || 0,
							marketStats,
							averageEntryPrice: coinBalance?.averageEntryPrice || 0,
							unrealizedPnl: coinBalance?.unrealizedPnl || 0,
							realizedPnl: marketStats.pnl || 0
						} as Holder
					} catch (error) {
						console.warn(`Failed to fetch portfolio for ${holder.account}:`, error)
						return {
							rank: skip + index + 1,
							user: holder.account,
							balance: holder.balance || 0,
							percentage: parseFloat(holder.percentage || "0") * 100,
							balanceUsd: 0,
							balanceScaled: holder.balance || 0,
							marketStats: undefined,
							averageEntryPrice: 0,
							unrealizedPnl: 0,
							realizedPnl: 0
						} as Holder
					}
				})
			)

			return holdersWithPortfolio
		},
		enabled: !!coinType && enabled,
		staleTime: 30000,
		gcTime: 5 * 60 * 1000,
		refetchOnWindowFocus: false,
	})
}

export function useInfiniteHoldersWithPortfolio({
	coinType,
	limit = 10,
	enabled = true
}: Omit<UseHoldersWithPortfolioOptions, 'skip'>) {
	return useInfiniteQuery({
		queryKey: ["infinite-holders-with-portfolio", coinType, limit],
		queryFn: async ({ pageParam = 0 }) => {
			const holdersData = await fetchHolders(coinType)
			const sliced = holdersData.slice(Number(pageParam), Number(pageParam) + limit)
			if (sliced.length === 0) return []

			const holdersWithPortfolio = await Promise.all(
				sliced.map(async (holder: { account: string; balance: string; percentage: string }, index: number) => {
					try {
						const portfolio = await fetchPortfolio(holder.account)
						const coinBalance = portfolio?.balances?.find(
							(b: any) => b.coinType === coinType
						)

						const marketStats = coinBalance?.marketStats || {
							amountBought: 0,
							amountSold: 0,
							buyTrades: 0,
							sellTrades: 0,
							usdBought: 0,
							usdSold: 0,
							currentHolding: holder.balance,
							pnl: 0
						}

						return {
							rank: Number(pageParam) + index + 1,
							user: holder.account,
							balance: holder.balance || 0,
							percentage: parseFloat(holder.percentage || "0") * 100,
							balanceUsd: coinBalance?.value || 0,
							balanceScaled: holder.balance || 0,
							marketStats,
							averageEntryPrice: coinBalance?.averageEntryPrice || 0,
							unrealizedPnl: coinBalance?.unrealizedPnl || 0,
							realizedPnl: marketStats.pnl || 0
						} as Holder
					} catch (error) {
						console.warn(`Failed to fetch portfolio for ${holder.account}:`, error)
						return {
							rank: Number(pageParam) + index + 1,
							user: holder.account,
							balance: holder.balance || 0,
							percentage: parseFloat(holder.percentage || "0") * 100,
							balanceUsd: 0,
							balanceScaled: holder.balance || 0,
							marketStats: undefined,
							averageEntryPrice: 0,
							unrealizedPnl: 0,
							realizedPnl: 0
						} as Holder
					}
				})
			)

			return holdersWithPortfolio
		},
		getNextPageParam: (lastPage, allPages) => {
			if (lastPage.length < limit) return undefined
			return allPages.length * limit
		},
		enabled: !!coinType && enabled,
		staleTime: 30000,
		refetchOnWindowFocus: false,
		initialPageParam: 0
	})
}