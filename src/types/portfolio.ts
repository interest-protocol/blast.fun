import { CoinMetadata } from "./pool"

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