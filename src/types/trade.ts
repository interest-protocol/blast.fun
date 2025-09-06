export type CoinMetadataInTrade = {
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

export type CoinTrade = {
	_id: string
	user: string
	digest: string
	timestampMs: number
	platform: string
	coinIn: string
	coinOut: string
	amountIn: string
	amountOut: string
	priceIn: number
	priceOut: number
	coinInMetadata?: CoinMetadataInTrade
	coinOutMetadata?: CoinMetadataInTrade
}

export type UnifiedTrade = {
	id: string
	timestamp: number
	type: "BUY" | "SELL"
	amountIn: number
	amountOut: number
	coinIn: string
	coinOut: string
	coinInSymbol?: string
	coinOutSymbol?: string
	coinInIconUrl?: string
	coinOutIconUrl?: string
	price: number
	value: number
	trader: string
	digest: string
	isRealtime: boolean
}

export type TradeData = {
	_id: any
	user: string
	digest: string
	timestampMs: number
	coinIn: string
	coinOut: string
	amountIn: number
	amountOut: number
	priceIn: number
	priceOut: number
	platform: string
	volume: number
	operationType: string
	coinInMetadata?: {
		decimals: number
		symbol: string
		iconUrl?: string
		icon_url?: string
		iconURL?: string
	}
	coinOutMetadata?: {
		decimals: number
		symbol: string
		iconUrl?: string
		icon_url?: string
		iconURL?: string
	}
}
