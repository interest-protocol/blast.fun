export interface CoinMetadata {
	_id: string
	coinType: string
	decimals: number
	icon_url?: string
	iconUrl?: string
	id: string
	name: string
	supply: number
	symbol: string
}

export interface MarketStats {
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

export interface PortfolioBalanceItem {
	coinMetadata?: CoinMetadata
	coinType: string
	balance: string
	price: number
	value: number
	marketStats?: MarketStats
	averageEntryPrice: number
	unrealizedPnl: number
}

export interface PortfolioResponse {
	balances: PortfolioBalanceItem[]
}