import { suiClient } from "@/lib/sui-client"
import { redisGet, redisSetEx } from "@/lib/redis/client"

/**
 * Sleep helper for retry delays
 */
async function sleep(ms: number): Promise<void> {
	return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Fetch SuiNS with retry logic for rate limiting
 */
async function fetchSuiNSWithRetry(address: string, maxRetries = 3): Promise<string | null> {
	let lastError: any = null
	
	for (let attempt = 0; attempt < maxRetries; attempt++) {
		try {
			const result = await suiClient.resolveNameServiceNames({
				address: address,
				format: "dot",
			})
			return result.data?.[0] || null
		} catch (error: any) {
			lastError = error
			
			// @dev: Check if it's a 429 rate limit error
			const is429Error = error?.status === 429 || 
				error?.response?.status === 429 ||
				error?.message?.includes('429') ||
				error?.message?.includes('rate limit')
			
			if (is429Error && attempt < maxRetries - 1) {
				// @dev: Wait 10 seconds for 429 errors, then exponential backoff
				const delay = attempt === 0 ? 10000 : Math.pow(2, attempt) * 1000
				console.warn(`Rate limited fetching SuiNS for ${address}, retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries})`)
				await sleep(delay)
				continue
			}
			
			// @dev: For other errors or max retries reached, break
			break
		}
	}
	
	throw lastError
}

/**
 * Get SuiNS name for a single address
 */
export async function getSuiNSName(address: string): Promise<string | null> {
	try {
		// @dev: Check cache first
		const cacheKey = `suins:${address}`
		const cached = await redisGet(cacheKey)
		if (cached) {
			return cached === "null" ? null : cached
		}

		// @dev: Use the built-in SuiClient method with retry logic
		const name = await fetchSuiNSWithRetry(address)

		// @dev: Cache the result for 1 hour
		await redisSetEx(cacheKey, 3600, name || "null")
		return name

	} catch (error) {
		console.warn(`Failed to fetch SuiNS name for ${address}:`, error)
		return null
	}
}

/**
 * Get SuiNS names for multiple addresses in batch
 */
export async function getSuiNSNameBatch(addresses: string[]): Promise<(string | null)[]> {
	// @dev: Process addresses in parallel with error handling
	const promises = addresses.map(async (address) => {
		try {
			return await getSuiNSName(address)
		} catch (error) {
			console.warn(`Failed to fetch SuiNS for ${address}:`, error)
			return null
		}
	})

	return Promise.all(promises)
}