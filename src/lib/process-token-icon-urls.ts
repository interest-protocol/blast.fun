import { redisGet, redisSetEx, CACHE_TTL } from "@/lib/redis/client"

// @dev: Cache individual token icon URL and return our backend URL
async function cacheTokenIconUrl(coinType: string, iconUrl: string): Promise<string> {
	if (!iconUrl) return `/api/coin/${coinType}/image`
	
	const cacheKey = `/icon_url/${coinType}`
	
	try {
		// @dev: Check if key exists first, only cache if not present
		const existing = await redisGet(cacheKey)
		if (!existing) {
			// @dev: Store with 1 hour TTL
			await redisSetEx(cacheKey, CACHE_TTL.ICON_URL, iconUrl)
		}
	} catch (error) {
		console.error("Error caching icon URL:", error)
	}
	
	// @dev: Always return our backend URL
	return `/api/coin/${coinType}/image`
}

// @dev: Process tokens to cache icon URLs and replace with backend URLs
export async function processTokenIconUrls(tokens: any[]): Promise<any[]> {
	const processedTokens = await Promise.all(
		tokens.map(async (token: any) => {
			const originalIconUrl = token.metadata?.icon_url || token.iconUrl || token.icon_url
			const backendIconUrl = await cacheTokenIconUrl(token.coinType, originalIconUrl)
			
			return {
				...token,
				iconUrl: backendIconUrl,
				icon_url: undefined,
				treasuryCapOwner: token.treasuryCapOwner ? {
					...token.treasuryCapOwner,
					iconUrl: undefined,
				} : undefined
			}
		})
	)
	
	return processedTokens
}