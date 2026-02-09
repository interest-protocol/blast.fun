/**
 * Noodles Finance API response types (https://docs.noodles.fi).
 * Used for coin-new, coin-list, coin-top, coin-detail endpoints.
 */

export const NOODLES_API_BASE = "https://api.noodles.fi" as const

export interface NoodlesPagination {
	limit: number
	offset: number
}

export interface NoodlesCoinListItem {
	coin_type: string
	name: string
	symbol: string
	logo: string
	price: number
	price_change_1h?: number
	price_change_6h?: number
	price_change_1d?: number
	vol_change_1d?: number
	liq_change_1d?: number
	tx_change_1d?: number
	tx_24h?: number
	volume_24h?: number
	volume_6h?: number
	volume_4h?: number
	volume_1h?: number
	volume_30m?: number
	maker_24h?: number
	market_cap: string
	liquidity_usd: string
	circulating_supply?: string
	total_supply?: string
	published_at: string
	verified: boolean
	decimals?: number
}

export interface NoodlesCoinNewResponse {
	data: NoodlesCoinListItem[]
	pagination?: NoodlesPagination
}

export interface NoodlesCoinDetailCoin {
	coin_type: string
	symbol: string
	name: string
	logo: string | null
	description: string | null
	liquidity: string | null
	market_cap: string | null
	fdv: string | null
	circulating_supply: string | null
	total_supply: string | null
	holders: number | null
	creator: string | null
	published_at: string | null
	verified: boolean
	decimals: number | null
}

export interface NoodlesCoinDetailPriceChange {
	price?: string
	price_change_1h?: number
	price_change_6h?: number
	price_change_1d?: number
	price_change_7d?: number
}

export interface NoodlesCoinDetailResponseData {
	coin: NoodlesCoinDetailCoin
	price_change?: NoodlesCoinDetailPriceChange
	social_media?: {
		x?: string
		website?: string
		discord?: string
	}
}

export interface NoodlesCoinDetailResponse {
	code?: number
	message?: string
	data?: NoodlesCoinDetailResponseData
}
