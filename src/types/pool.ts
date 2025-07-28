export interface Pool {
	poolId: string
	bondingCurve: string
	coinBalance: string
	coinType: string
	createdAt: string
	creatorAddress: string
	metadata: any
	virtualLiquidity: string
	targetQuoteLiquidity: string
	quoteBalance: string
	migrated: boolean
	curve: string
	coinIpxTreasuryCap: string
	canMigrate: boolean
	canonical: boolean
	migrationWitness: string | null
	nsfw: boolean
	lastTradeAt: string
	config: any
	updatedAt: string
	isProtected?: boolean
}

export interface CoinMetadata {
	name: string
	symbol: string
	description?: string | null
	iconUrl?: string | null
	decimals?: number
	id?: string | null
}

export interface PoolWithMetadata extends Pool {
	coinMetadata?: CoinMetadata
	pumpPoolData?: any
}
