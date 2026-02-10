import { useQuery } from "@tanstack/react-query"
import type { Token } from "@/types/token"

export interface UserHoldings {
	bought: number
	sold: number
	holding: number
	pnl: number
	pnlPercentage: number
	entryPrice: number
	currentPrice: number
	balance: number
	hasPosition: boolean
}

export function useUserHoldings(pool: Token, address?: string | null) {
	const coinType = pool.coinType

	return useQuery({
		queryKey: ["userHoldings", address, coinType],
		queryFn: async (): Promise<UserHoldings> => {
			if (!address || !coinType) {
				return {
					bought: 0,
					sold: 0,
					holding: 0,
					pnl: 0,
					pnlPercentage: 0,
					entryPrice: 0,
					currentPrice: 0,
					balance: 0,
					hasPosition: false
				}
			}

			try {
				const res = await fetch(
					`/api/market-stats/${encodeURIComponent(address)}/${encodeURIComponent(coinType)}`,
					{ headers: { Accept: "application/json" } }
				)
				const stats = res.ok ? await res.json() : null

				if (!stats || (stats.buyTrades === 0 && stats.sellTrades === 0)) {
					return {
						bought: 0,
						sold: 0,
						holding: 0,
						pnl: 0,
						pnlPercentage: 0,
						entryPrice: 0,
						currentPrice: 0,
						balance: 0,
						hasPosition: false
					}
				}

				const decimals = pool.metadata?.decimals || 9
				const currentPrice = pool.market?.price || 0

				// calculate holdings
				const tokensBought = stats.amountBought / Math.pow(10, decimals)
				const tokensHeld = Math.abs(stats.currentHolding) / Math.pow(10, decimals)
				const holdingValue = tokensHeld * currentPrice

				// calculate pnl
				const totalPnl = stats.usdSold + holdingValue - stats.usdBought
				const pnlPercentage = stats.usdBought > 0 ? (totalPnl / stats.usdBought) * 100 : 0
				const entryPrice = tokensBought > 0 ? stats.usdBought / tokensBought : 0

				return {
					bought: stats.usdBought || 0,
					sold: stats.usdSold || 0,
					holding: holdingValue || 0,
					pnl: totalPnl || 0,
					pnlPercentage: pnlPercentage || 0,
					entryPrice: entryPrice || 0,
					currentPrice: currentPrice || 0,
					balance: stats.currentHolding || 0,
					hasPosition: true
				}
			} catch (err) {
				console.error("Error fetching user holdings:", err)
				return {
					bought: 0,
					sold: 0,
					holding: 0,
					pnl: 0,
					pnlPercentage: 0,
					entryPrice: 0,
					currentPrice: 0,
					balance: 0,
					hasPosition: false
				}
			}
		},
		refetchInterval: 15000,
		enabled: !!coinType && !!address
	})
}