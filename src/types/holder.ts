export type MarketStats = {
	_id: string
	coin: string
	user: string
	amountBought: number
	amountSold: number
	buyTrades: number
	currentHolding: number
	pnl: number
	sellTrades: number
	usdBought: number
	usdSold: number
}

export type Holder = {
	rank: number
	user: string
	balance: number
	percentage: number
	balanceUsd: number
	balanceScaled: number
	marketStats?: MarketStats
	averageEntryPrice?: number
	unrealizedPnl?: number
	realizedPnl?: number
}

export type UseHoldersParams = {
	coinType: string
	limit?: number
	skip?: number
	includePortfolio?: boolean
}
