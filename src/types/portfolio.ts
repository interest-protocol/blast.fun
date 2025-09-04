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

export type CoinMetadata = {
	_id?: string
	coinType?: string
	decimals: number
	name: string
	symbol: string
	description?: string
	iconUrl?: string
	icon_url?: string
	id: string
	supply?: number
	createdAt?: number
	dev?: string
	lastTradeAt?: string
	treasuryCap?: string
	treasuryCapOwner?: any
	bondingProgress?: number
	circulating?: number
	circulatingUpdatedAt?: number
	platform?: string
	threshold?: number
	virtualSui?: number
	poolId?: string
}

export type PortfolioBalanceItem = {
	coinMetadata?: CoinMetadata
	coinType: string
	balance: string
	price: number
	value: number
	marketStats?: MarketStats
	averageEntryPrice: number
	unrealizedPnl: number
}

export type PortfolioResponse = {
	balances: PortfolioBalanceItem[]
}