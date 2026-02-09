"use client"

import { useQuery, useInfiniteQuery } from "@tanstack/react-query"
import { nexaClient } from "@/lib/nexa"
import type { Holder } from "@/types/holder"
import type { PortfolioBalanceItem } from "@/types/portfolio"

interface UseHoldersWithPortfolioOptions {
	coinType: string
	limit?: number
	skip?: number
	enabled?: boolean
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
			const holdersData = await nexaClient.getHolders(coinType, limit, skip)
			if (!holdersData || holdersData.length === 0) {
				return []
			}

			const holdersWithPortfolio = await Promise.all(
				holdersData.map(async (holder: any, index: number) => {
					try {
						const portfolio = await nexaClient.getPortfolio(holder.user, 0)
						const balances = (portfolio?.balances ?? []) as PortfolioBalanceItem[]
						const coinBalance = balances.find((b) => b.coinType === coinType)

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
							user: holder.user,
							balance: holder.balance || 0,
							percentage: holder.percentage || 0,
							balanceUsd: holder.balanceUsd || coinBalance?.value || 0,
							balanceScaled: holder.balance || 0,
							marketStats,
							averageEntryPrice: coinBalance?.averageEntryPrice || 0,
							unrealizedPnl: coinBalance?.unrealizedPnl || 0,
							realizedPnl: marketStats.pnl || 0
						} as Holder
					} catch (error) {
						console.warn(`Failed to fetch portfolio for ${holder.user}:`, error)
						return {
							rank: skip + index + 1,
							user: holder.user,
							balance: holder.balance || 0,
							percentage: holder.percentage || 0,
							balanceUsd: holder.balanceUsd || 0,
							balanceScaled: holder.balance || 0,
							marketStats: undefined,
							averageEntryPrice: 0,
							unrealizedPnl: 0,
							realizedPnl: 0
						}
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
			const holdersData = await nexaClient.getHolders(coinType, limit, pageParam)
			if (!holdersData || holdersData.length === 0) {
				return []
			}

			const holdersWithPortfolio = await Promise.all(
				holdersData.map(async (holder: any, index: number) => {
					try {
						const portfolio = await nexaClient.getPortfolio(holder.user, 0)
						const balances = (portfolio?.balances ?? []) as PortfolioBalanceItem[]
						const coinBalance = balances.find((b) => b.coinType === coinType)

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
							rank: pageParam + index + 1,
							user: holder.user,
							balance: holder.balance || 0,
							percentage: holder.percentage || 0,
							balanceUsd: holder.balanceUsd || coinBalance?.value || 0,
							balanceScaled: holder.balance || 0,
							marketStats,
							averageEntryPrice: coinBalance?.averageEntryPrice || 0,
							unrealizedPnl: coinBalance?.unrealizedPnl || 0,
							realizedPnl: marketStats.pnl || 0
						} as Holder
					} catch (error) {
						console.warn(`Failed to fetch portfolio for ${holder.user}:`, error)
						return {
							rank: pageParam + index + 1,
							user: holder.user,
							balance: holder.balance || 0,
							percentage: holder.percentage || 0,
							balanceUsd: holder.balanceUsd || 0,
							balanceScaled: holder.balance || 0,
							marketStats: undefined,
							averageEntryPrice: 0,
							unrealizedPnl: 0,
							realizedPnl: 0
						}
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