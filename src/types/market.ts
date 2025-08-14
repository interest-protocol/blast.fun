export type MarketData = {
	coinMetadata?: any

	coinPrice: number
	isCoinHoneyPot: boolean
	totalLiquidityUsd: number
	marketCap: number
	coin24hTradeCount: number
	coin24hTradeVolumeUsd: number
	price1DayAgo: number
	holdersCount: number

	// backwards compat fields
	liqUsd?: number
	coinSupply?: number
	suiPrice?: number
}