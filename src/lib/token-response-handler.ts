import { apolloClient } from "@/lib/apollo-client"
import { prisma } from "@/lib/prisma"
import { fetchCreatorsBatch } from "@/lib/fetch-creators-batch"
import { GET_POOLS_BATCH } from "@/graphql/pools"

export async function enhanceTokensWithTimeout(
	tokens: any[],
	options: {
		enhancementTimeout?: number
		creatorTimeout?: number
		isBonded?: boolean
	} = {}
) {
	const startTotal = Date.now()
	console.log(`[Token Enhancement] Starting enhancement for ${tokens.length} tokens`)
	
	const {
		enhancementTimeout = 500,
		creatorTimeout = 10000,
		isBonded = false
	} = options

	const coinTypes = tokens.map((token: any) => token.coinType)
	
	// @dev: Prepare basic tokens first
	const startBasic = Date.now()
	const basicTokens = tokens.map((token: any) => ({
		...token,
		poolId: token.id,
		creatorAddress: token.dev,
		metadata: {
			name: token.name,
			symbol: token.symbol,
			description: token.description,
			icon_url: token.iconUrl || token.icon_url
		},
		marketCap: token.marketCap || 0,
		holdersCount: token.holdersCount || 0,
		volume24h: (token.buyVolume || 0) + (token.sellVolume || 0),
		buyVolume: token.buyVolume || 0,
		sellVolume: token.sellVolume || 0,
		liquidity: token.liquidity || 0,
		price: token.price || 0,
		bondingCurve: isBonded ? 100 : ((token.bondingProgress || 0) * 100),
		bondingProgress: isBonded ? 100 : ((token.bondingProgress || 0) * 100),
		migrated: isBonded || false,
		isProtected: false,
		burnTax: undefined,
		protectionSettings: undefined,
		creatorData: undefined,
		pool: {
			poolId: token.id,
			isProtected: false,
			burnTax: undefined,
			migrated: isBonded || false,
			bondingCurve: isBonded ? 100 : ((token.bondingProgress || 0) * 100),
			canMigrate: false,
		},
		isEnhanced: false
	}))
	console.log(`[Token Enhancement] Basic tokens prepared in ${Date.now() - startBasic}ms`)

	// @dev: Try to enhance with GraphQL data
	if (coinTypes.length === 0) {
		console.log(`[Token Enhancement] No coin types to enhance, returning basic tokens`)
		return { tokens: basicTokens, isEnhanced: false }
	}

	try {
		// @dev: Fetch pools and creator data in parallel
		const startParallel = Date.now()
		console.log('[Token Enhancement] Starting parallel fetch for pools and creators')
		
		// Track individual timings
		let poolsFetchTime = 0
		let creatorFetchTime = 0
		
		const [poolsResult, creatorDataMap] = await Promise.all([
			(async () => {
				const startPools = Date.now()
				const result = await apolloClient.query({
					query: GET_POOLS_BATCH,
					variables: { coinTypes },
					fetchPolicy: "no-cache",
					errorPolicy: "ignore"
				})
				poolsFetchTime = Date.now() - startPools
				console.log(`[Token Enhancement] ├─ Pools fetch completed in ${poolsFetchTime}ms`)
				return result
			})(),
			(async () => {
				const startCreators = Date.now()
				const result = await fetchCreatorsBatch(tokens, new Map())
				creatorFetchTime = Date.now() - startCreators
				console.log(`[Token Enhancement] ├─ Creators fetch completed in ${creatorFetchTime}ms`)
				return result
			})()
		]) as [any, Map<string, any>]
		
		const totalParallelTime = Date.now() - startParallel
		const longerOperation = poolsFetchTime > creatorFetchTime ? 'Pools' : 'Creators'
		const timeDiff = Math.abs(poolsFetchTime - creatorFetchTime)
		console.log(`[Token Enhancement] └─ Parallel fetch completed in ${totalParallelTime}ms (${longerOperation} took ${timeDiff}ms longer)`)

		// @dev: Build pool map
		const startPoolMap = Date.now()
		const poolMap = new Map()
		if (poolsResult?.data?.pools?.pools) {
			poolsResult.data.pools.pools.forEach((pool: any) => {
				if (pool) {
					poolMap.set(pool.coinType, pool)
				}
			})
		}
		console.log(`[Token Enhancement] Pool map built in ${Date.now() - startPoolMap}ms (${poolMap.size} pools)`)

		// @dev: Quick fetch for protection settings
		const startProtection = Date.now()
		const poolIds = Array.from(poolMap.values())
			.filter((p: any) => p?.publicKey)
			.map((p: any) => p.poolId)
		
		const protectionSettingsMap = new Map()
		if (poolIds.length > 0) {
			try {
				const protectionSettings = await prisma.tokenProtectionSettings.findMany({
					where: { poolId: { in: poolIds } },
					select: { poolId: true, settings: true }
				})
				protectionSettings.forEach(setting => {
					protectionSettingsMap.set(setting.poolId, setting.settings)
				})
				console.log(`[Token Enhancement] Protection settings fetched in ${Date.now() - startProtection}ms (${protectionSettings.length} settings)`)
			} catch (error) {
				console.error("Error fetching protection settings:", error)
			}
		} else {
			console.log(`[Token Enhancement] No protected pools found`)
		}

		// @dev: Build enhanced tokens
		const startBuild = Date.now()
		const enhancedTokens = tokens.map((token: any) => {
			const pool = poolMap.get(token.coinType) as any
			const creatorAddress = pool?.creatorAddress || token.dev
			const creatorData = creatorDataMap.get(creatorAddress)

			return {
				...token,
				poolId: pool?.poolId || token.id,
				creatorAddress,
				metadata: pool?.metadata || {
					name: token.name,
					symbol: token.symbol,
					description: token.description,
					icon_url: token.iconUrl || token.icon_url
				},
				marketCap: token.marketCap || 0,
				holdersCount: token.holdersCount || 0,
				volume24h: (token.buyVolume || 0) + (token.sellVolume || 0),
				buyVolume: token.buyVolume || 0,
				sellVolume: token.sellVolume || 0,
				liquidity: token.liquidity || 0,
				price: token.price || 0,
				bondingCurve: isBonded ? 100 : (pool?.bondingCurve || ((token.bondingProgress || 0) * 100)),
				bondingProgress: isBonded ? 100 : (pool?.migrated ? 100 : ((token.bondingProgress || 0) * 100)),
				migrated: isBonded ? true : (pool?.migrated || false),
				isProtected: !!pool?.publicKey,
				burnTax: pool?.burnTax,
				protectionSettings: pool?.publicKey ? protectionSettingsMap.get(pool.poolId) : undefined,
				creatorData,
				pool: {
					poolId: pool?.poolId || token.id,
					isProtected: !!pool?.publicKey,
					burnTax: pool?.burnTax,
					migrated: isBonded ? true : (pool?.migrated || false),
					bondingCurve: isBonded ? 100 : (pool?.bondingCurve || ((token.bondingProgress || 0) * 100)),
					canMigrate: pool?.canMigrate || false,
				},
				isEnhanced: true
			}
		})
		console.log(`[Token Enhancement] Enhanced tokens built in ${Date.now() - startBuild}ms`)
		console.log(`[Token Enhancement] Total enhancement completed in ${Date.now() - startTotal}ms`)

		return { tokens: enhancedTokens, isEnhanced: true }
	} catch (error) {
		console.log(`[Token Enhancement] Enhancement failed after ${Date.now() - startTotal}ms:`, error)
		return { tokens: basicTokens, isEnhanced: false }
	}
}