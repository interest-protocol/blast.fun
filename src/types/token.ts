export type MinimalPool = {
	pool?: string;
	liqUsd?: number | string;
} & Partial<Record<string, number>> & { [k: string]: unknown };

export interface TokenMetadata {
	createdAt: number

	name: string
	symbol: string
	description: string

	decimals: number
	supply: number
	icon_url: string

	telegram?: string
	twitter?: string
	website?: string
}

export interface TokenCreator {
	address: string
	launchCount: number

	twitterHandle?: string | null
	twitterId?: string | null
	trustedFollowers: string
	followers: string

	hideIdentity?: boolean
}

export interface TokenMarketData {
	coinMetadata: TokenMetadata

	marketCap: number
	holdersCount: number
	volume24h: number
	liquidity: number
	price: number
	coinPrice: number
	bondingProgress: number

	top10Holdings?: number

	coinDev?: string
	devHoldings?: number

	tradeCount?: number
	buyTradeCount?: number
	sellTradeCount?: number

	price5MinsAgo?: number
	price1HrAgo?: number
	price4HrAgo?: number
	price1DayAgo?: number

	pools?: MinimalPool[]
}

export interface TokenPoolData {
	poolId: string
	coinType: string
	bondingCurve: number
	coinBalance: string
	virtualLiquidity: string
	targetQuoteLiquidity: string
	quoteBalance: string
	migrated: boolean
	curve: string
	coinIpxTreasuryCap: string
	canMigrate: boolean
	canonical: boolean
	migrationWitness: string | null
	mostLiquidPoolId?: string
	burnTax?: number
	isProtected?: boolean
	publicKey?: string
	innerState?: string
}

export interface Token {
	coinType: string
	createdAt: number

	metadata: TokenMetadata
	creator: TokenCreator
	market: TokenMarketData
	pool?: TokenPoolData
}

export interface TokenFilters {
	platforms?: string[]

	bondingProgressMin?: number
	bondingProgressMax?: number

	ageMin?: number
	ageMax?: number

	holdersCountMin?: number
	holdersCountMax?: number
	top10HoldingsMin?: number
	top10HoldingsMax?: number
	devHoldingsMin?: number
	devHoldingsMax?: number

	marketCapMin?: number
	marketCapMax?: number
	liquidityMin?: number
	liquidityMax?: number
	volumeMin?: number
	volumeMax?: number

	tradeCountMin?: number
	tradeCountMax?: number
	buyTradeCountMin?: number
	buyTradeCountMax?: number
	sellTradeCountMin?: number
	sellTradeCountMax?: number

	hasWebsite?: boolean
	hasTwitter?: boolean
	hasTelegram?: boolean
	hasDiscord?: boolean

	tabType?: 'newly-created' | 'about-to-bond' | 'bonded'
}

export type TokenSortOption =
	| 'marketCap'
	| 'date'
	| 'volume'
	| 'holders'
	| 'bondingProgress'
	| 'lastTrade'
	| 'liquidity'
	| 'devHoldings'
	| 'top10Holdings'

export interface TokenListSettings {
	sortBy: TokenSortOption
	filters: TokenFilters
}