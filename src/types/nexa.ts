export interface CoinMetadata {
	coinType: string
	createdAt: number
	decimals: number
	description: string
	dev: string
	icon_url?: string
	iconUrl?: string
	id: string
	name: string
	symbol: string
	lastTradeAt?: string
	bondingProgress?: number
	circulating: number | string
}

export interface VolumeStats {
	volume: number | string
	volumeUsd: number
	tradeCount: number
	uniqueUsers: number
}

export interface PriceLineSeries {
	time: string
	value: number
}

export interface Pool {
	_id: string
	pool: string
	amountAAdded: number
	amountAClaimed: number
	amountARemoved: number
	amountBAdded: number
	amountBClaimed: number
	amountBRemoved: number
	platform: string
	swapCount: number
	coinA: string
	coinB: string
	liqA: number | string
	liqB: number | string
	liqUsd: number
	price: number
	coinAMetadata?: CoinMetadata
	coinBMetadata?: CoinMetadata
	coinAPrice?: number
	coinBPrice?: number
}

export interface NexaMarketData {
	coinMetadata: CoinMetadata
	coinPrice: number
	coinSupply: number | string
	marketCap: number
	coin24hTradeCount: number
	coin24hTradeVolumeUsd: number
	coin24hTradeVolume: number | string
	suiPrice: number
	price5MinsAgo: number | null
	price1HrAgo: number | null
	price4HrAgo: number | null
	price1DayAgo: number | null
	totalCoinLiquidityUsd: number
	totalSuiLiquidityUsd: number
	totalCoinLiquidity: number | string
	totalSuiLiquidity: number | string
	holdersCount: number
	coin24hUniqueBuyers: number
	coin24hUniqueSellers: number
	sellVolumeStats5m: VolumeStats
	buyVolumeStats5m: VolumeStats
	sellVolumeStats1h: VolumeStats
	buyVolumeStats1h: VolumeStats
	sellVolumeStats4h: VolumeStats
	buyVolumeStats4h: VolumeStats
	sellVolumeStats1d: VolumeStats
	buyVolumeStats1d: VolumeStats
	holderScore: number
	coin24hBuyStats: VolumeStats
	coin24hSellStats: VolumeStats
	coinPastDayBuyStats: VolumeStats
	coinPastDaySellStats: VolumeStats
	priceLineSeries: PriceLineSeries[]
	pools: Pool[]
	totalUsdcLiquidity: number
	totalUsdcLiquidityUsd: number
}

export interface Holder {
	user: string
	balance: string | number
	balanceUsd?: number
	percentage?: number
	// Additional fields for holders with portfolio
	marketStats?: any
	averageEntryPrice?: number
	unrealizedPnl?: number
	realizedPnl?: number
}

export interface Trade {
	id: string
	timestamp: string | number
	txHash: string
	type: 'buy' | 'sell'
	amount: string | number
	price: number
	priceUsd: number
	trader: string
	coinType: string
}

export interface Portfolio {
	address: string
	totalValueUsd: number
	balances: Array<{
		coinType: string
		balance: string | number
		balanceUsd: number
		price: number
		metadata?: CoinMetadata
	}>
}

// Response type for getCoinMetadata endpoint
export interface CoinMetadataResponse {
	coinMetadata: CoinMetadata
}

// Response type for batch operations
export interface BatchCoinMetadataResponse {
	[coinType: string]: CoinMetadata
}

export interface BatchMarketDataResponse {
	[coinType: string]: NexaMarketData
}