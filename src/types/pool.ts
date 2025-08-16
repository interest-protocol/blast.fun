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
	innerState?: string
	mostLiquidPoolId?: string
}

export type CoinMetadata = {
	coinType?: string
	decimals: number
	icon_url?: string
	iconUrl?: string
	id: string
	name: string
	supply?: number
	symbol: string
	description?: string
	dev?: string
	createdAt?: number
	isHoneypot?: boolean
	lastTradeAt?: string
	bondingProgress?: number
	circulating?: number
	circulatingUpdatedAt?: number
	dexPaid?: boolean
	treasuryCap?: string
	treasuryCapOwner?: any
	_id?: string
}

import type { MarketData } from "./market"

export type CreatorData = {
	launchCount: number
	trustedFollowers: string
	followers: string
	twitterHandle?: string | null
}

export type PoolWithMetadata = Pool & {
	coinMetadata?: CoinMetadata
	marketData?: MarketData
	creatorData?: CreatorData
}