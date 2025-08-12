import type { PumpPool } from "@interest-protocol/memez-fun-sdk"

export type Pool = {
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
	publicKey?: string
}

export type CoinMetadata = {
	coinType: string
	decimals: number
	icon_url?: string
	iconUrl?: string
	id: string
	name: string
	supply: number
	symbol: string
}

export type PoolWithMetadata = Pool & {
	coinMetadata?: CoinMetadata
	pumpPoolData?: PumpPool
}