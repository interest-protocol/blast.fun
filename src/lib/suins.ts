import { suiClient } from "@/lib/sui-client"
import { redisGet, redisSetEx } from "@/lib/redis/client"

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

		// @dev: Use the built-in SuiClient method
		const result = await suiClient.resolveNameServiceNames({
			address: address,
			format: "dot",
		})

		const name = result.data?.[0] || null

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