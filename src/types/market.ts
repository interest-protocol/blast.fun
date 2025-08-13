export type MarketData = {
	coinMetadata?: any

	coinPrice: number
	price5MinsAgo: number | null
	price1DayAgo: number | null
	marketCap: number

	totalCoinLiquidity: number
	totalCoinLiquidityUsd: number

	totalSuiLiquidity: number
	totalSuiLiquidityUsd: number

	coin24hTradeCount: number
	coin24hTradeVolume: number
	coin24hTradeVolumeUsd: number
	coin24hUniqueBuyers: number
	coin24hUniqueSellers: number

	holdersCount: number
}