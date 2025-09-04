export interface TokenMetadata {
	name: string
	symbol: string
	description: string
	icon_url: string
	decimals: number
	supply: number
	Website?: string
	X?: string
	Telegram?: string
	Discord?: string
}

export interface TokenCreator {
	address: string
	launchCount: number
	trustedFollowers: string
	followers: string
	twitterHandle?: string | null
	twitterId?: string | null
	hideIdentity?: boolean
}

export interface TokenMarketData {
	marketCap: number
	holdersCount: number
	volume24h: number
	liquidity: number
	price: number
	bondingProgress: number
	circulating?: number
	circulatingUpdatedAt?: number
	dexPaid?: boolean

	top10Holdings?: number
	devHoldings?: number

	tradeCount?: number
	buyTradeCount?: number
	sellTradeCount?: number

	price5MinsAgo?: number
	price1HrAgo?: number
	price4HrAgo?: number
	price1DayAgo?: number
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
	id: string
	_id?: string
	coinType: string
	treasuryCap: string
	treasuryCapOwner?: any

	metadata: TokenMetadata
	creator: TokenCreator
	market: TokenMarketData
	pool?: TokenPoolData

	// @dev: flags
	createdAt: number
	lastTradeAt: string
	updatedAt?: string
	isHoneypot: boolean
	nsfw?: boolean
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

	dexPaid?: boolean
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
	| 'age'
	| 'liquidity'
	| 'devHoldings'
	| 'top10Holdings'

export interface TokenListSettings {
	sortBy: TokenSortOption
	filters: TokenFilters
}

export interface TokensResponse {
	tokens: Token[]
	totalCount: number
	hasMore: boolean
	nextCursor?: string
}