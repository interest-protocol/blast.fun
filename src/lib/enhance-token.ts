import { prisma } from "@/lib/prisma"
import { fetchCreatorsBatch } from "@/lib/fetch-creators-batch"
import { redisGet, redisSetEx, CACHE_TTL, CACHE_PREFIX } from "@/lib/redis/client"

export interface TokenListItemInput {
	coinType: string
	dev?: string
	poolId?: string
	isProtected?: boolean
	[key: string]: unknown
}

export async function enhanceTokens<T extends TokenListItemInput>(tokens: T[]): Promise<T[]> {
	if (tokens.length === 0) {
		return tokens
	}

	try {
		const [creatorDataMap, protectionSettingsMap] = await Promise.all([
			(async () => {
				return await fetchCreatorsBatch(tokens)
			})(),

			(async () => {
				const protectedPoolIds = tokens
					.filter((t): t is T & { isProtected: true; poolId: string } => !!t.isProtected && !!t.poolId)
					.map((t) => t.poolId)
					.filter(Boolean)

				if (protectedPoolIds.length === 0) {
					return new Map()
				}

				const settingsMap = new Map<string, unknown>()

				// get cached protection settings first
				const cacheKeys = protectedPoolIds.map(id => `${CACHE_PREFIX.PROTECTION_SETTINGS}${id}`)
				const cachedResults = await Promise.all(
					cacheKeys.map(key => redisGet(key).catch(() => null))
				)

				const poolIdsToFetch: string[] = []
				protectedPoolIds.forEach((poolId, index) => {
					const cached = cachedResults[index]
					if (cached) {
						try {
							settingsMap.set(poolId, JSON.parse(cached))
						} catch {
							poolIdsToFetch.push(poolId)
						}
					} else {
						poolIdsToFetch.push(poolId)
					}
				})

				// get missing protection settings from database
				if (poolIdsToFetch.length > 0) {
					try {
						const protectionSettings = await prisma.tokenProtectionSettings.findMany({
							where: { poolId: { in: poolIdsToFetch } },
							select: { poolId: true, settings: true }
						})

						await Promise.all(
							protectionSettings.map(async (setting) => {
								settingsMap.set(setting.poolId, setting.settings)
								const cacheKey = `${CACHE_PREFIX.PROTECTION_SETTINGS}${setting.poolId}`
								try {
									await redisSetEx(cacheKey, CACHE_TTL.PROTECTION_SETTINGS, JSON.stringify(setting.settings))
								} catch (error) {
									console.error(`Failed to cache protection settings for ${setting.poolId}:`, error)
								}
							})
						)
					} catch (error) {
						console.error("Error fetching protection settings:", error)
					}
				}

				return settingsMap
			})()
		])

		const enhancedTokens = tokens.map((token) => {
			const creatorData = creatorDataMap.get(token.dev ?? "")
			const protectionSettings = token.isProtected && token.poolId
				? protectionSettingsMap.get(token.poolId)
				: undefined

			return {
				...token,
				creatorData,
				protectionSettings
			}
		}) as T[]

		return enhancedTokens
	} catch (error) {
		console.error("Error enhancing tokens:", error)
		return tokens
	}
}
