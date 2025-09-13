import { useState, useEffect } from "react"
import { TokenProtectionSettings } from "./use-token-protection"

interface CachedProtectionData {
	settings: TokenProtectionSettings | null
	timestamp: number
}

// @dev: 30 minutes TTL in milliseconds
const CACHE_TTL = 30 * 60 * 1000

// @dev: In-memory cache for protection settings
const protectionCache = new Map<string, CachedProtectionData>()

export function useTokenProtectionBatch(pools: Array<{ poolId: string }>) {
	const [protectionSettings, setProtectionSettings] = useState<Map<string, TokenProtectionSettings | null>>(new Map())
	const [isLoading, setIsLoading] = useState(false)

	useEffect(() => {
		if (!pools || pools.length === 0) {
			setProtectionSettings(new Map())
			return
		}

		const fetchSettings = async () => {
			setIsLoading(true)
			const now = Date.now()
			const results = new Map<string, TokenProtectionSettings | null>()
			const poolsToFetch: string[] = []

			// @dev: Check cache first for all pools
			for (const pool of pools) {
				const cached = protectionCache.get(pool.poolId)
				if (cached && (now - cached.timestamp) < CACHE_TTL) {
					results.set(pool.poolId, cached.settings)
				} else {
					poolsToFetch.push(pool.poolId)
				}
			}

			// @dev: Fetch uncached protection settings
			if (poolsToFetch.length > 0) {
				try {
					// Fetch in parallel with limited concurrency
					const batchSize = 5
					for (let i = 0; i < poolsToFetch.length; i += batchSize) {
						const batch = poolsToFetch.slice(i, i + batchSize)
						const promises = batch.map(async (poolId) => {
							try {
								const response = await fetch(`/api/token-protection/settings/${poolId}`,
									{
										headers: {
											'cloudflare-cache': '3600',
											'cache-control': 'no-store'
										}
									}
								)
								if (response.ok) {
									const data = await response.json()
									const settings = data.settings || null
									// @dev: Update cache
									protectionCache.set(poolId, {
										settings,
										timestamp: now
									})
									return { poolId, settings }
								}
								return { poolId, settings: null }
							} catch (err) {
								console.error(`Failed to fetch protection settings for ${poolId}:`, err)
								return { poolId, settings: null }
							}
						})

						const batchResults = await Promise.all(promises)
						for (const result of batchResults) {
							results.set(result.poolId, result.settings)
						}
					}
				} catch (err) {
					console.error("Failed to fetch token protection settings:", err)
				}
			}

			setProtectionSettings(results)
			setIsLoading(false)
		}

		fetchSettings()
	}, [pools])

	return { protectionSettings, isLoading }
}

// @dev: Utility function to clear expired cache entries
export function clearExpiredProtectionCache() {
	const now = Date.now()
	for (const [key, value] of protectionCache.entries()) {
		if (now - value.timestamp > CACHE_TTL) {
			protectionCache.delete(key)
		}
	}
}