// BlockVision API types for SUI blockchain

export interface BlockVisionResponse<T> {
	code: number
	message: string
	result: T
}

// Coin types
export interface CoinInfo {
	coinType: string
	name?: string
	symbol?: string
	decimals: number
	balance: string
	verified?: boolean
	logo?: string
	usdValue?: string
	price?: string
	priceChangePercentage24H?: string
	objects?: number
	scam?: boolean
}

export interface AccountCoinsResult {
	coins: CoinInfo[]
	usdValue: string
}

export type AccountCoinsResponse = BlockVisionResponse<AccountCoinsResult>

// Coin detail response
export interface CoinDetails {
	name: string
	symbol: string
	decimals: number
	logo?: string
	price?: string
	priceChangePercentage24H?: string
	totalSupply?: string
	holders?: number
	marketCap?: string
	packageID?: string
	coinType: string
	objectType?: string
	website?: string
	creator?: string
	createdTime?: number
	verified?: boolean
	circulating?: string
	scamFlag?: number
}

export type CoinDetailsResponse = BlockVisionResponse<CoinDetails>

// Service response wrapper
export interface ServiceResponse<T> {
	success: boolean
	data?: T
	error?: string
}

// Wallet coin type for frontend
export interface WalletCoin {
	coinType: string
	balance: string
	decimals: number
	symbol: string
	name: string
	iconUrl?: string
	price?: number
	value?: number
	verified?: boolean
	scam?: boolean
}

// DEX Pool types
export interface DexPool {
	dex: string
	link: string
	poolId: string
	balance: string
	price: string
	coinList: string[]
	tvl: string
	volume24H: string
	volume24HChange: string
	apr: string
}

export type DexPoolsResponse = BlockVisionResponse<DexPool[]>

// Coin Holder types
export interface CoinHolder {
	account: string
	balance: string
	percentage: string
	name: string
	image: string
	website: string
}

export interface HoldersResult {
	data: CoinHolder[]
	nextPageCursor?: string
	total: number
}

export type HoldersResponse = BlockVisionResponse<HoldersResult>