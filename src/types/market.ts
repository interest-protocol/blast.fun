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

	// pools data for migrated tokens
	pools?: Array<{
		pool: string
		liqUsd: number
		platform?: string
	}>

	// backwards compat fields
	liqUsd?: number
	coinSupply?: number
	suiPrice?: number
	mostLiquidPoolId?: string
}