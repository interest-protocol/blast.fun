export const NOODLES_API_BASE = "https://api.noodles.fi" as const

export interface NoodlesPagination {
	limit: number
	offset: number
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
