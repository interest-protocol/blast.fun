export type MarketData = {
	coinMetadata?: any

	coinPrice: number
	suiPrice: number
	isCoinHoneyPot: boolean
	totalLiquidityUsd: number
	marketCap: number
	coin24hTradeCount: number
	coin24hTradeVolumeUsd: number
	price1DayAgo: number
	price5MinsAgo: number | null
	price1HrAgo: number | null
	price4HrAgo: number | null
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
	mostLiquidPoolId?: string
}