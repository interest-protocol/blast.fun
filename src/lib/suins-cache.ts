import { suiClient } from "@/lib/sui-client"

const CACHE_KEY_PREFIX = "suins:"

export class SuiNSCache {
	/**
	 * Get SuiNS name from cache or fetch if not cached
	 */
	static async getName(address: string): Promise<string | null> {
		// @dev: Check session storage first
		const cached = this.getFromCache(address)
		if (cached !== undefined) {
			return cached
		}

		// @dev: Fetch from network
		try {
			const result = await suiClient.resolveNameServiceNames({
				address: address,
				format: "dot",
			})
			const name = result.data?.[0] || null
			this.saveToCache(address, name)
			return name
		} catch (error) {
			console.warn(`Failed to fetch SuiNS name for ${address}:`, error)
			this.saveToCache(address, null)
			return null
		}
	}

	/**
	 * Get multiple SuiNS names with caching
	 */
	static async getNames(addresses: string[]): Promise<Record<string, string | null>> {
		const results: Record<string, string | null> = {}
		const uncachedAddresses: string[] = []

		// @dev: Check cache for each address
		for (const address of addresses) {
			const cached = this.getFromCache(address)
			if (cached !== undefined) {
				results[address] = cached
			} else {
				uncachedAddresses.push(address)
			}
		}

		// @dev: Fetch uncached addresses in parallel
		if (uncachedAddresses.length > 0) {
			await Promise.all(
				uncachedAddresses.map(async (address) => {
					const name = await this.getName(address)
					results[address] = name
				})
			)
		}

		return results
	}

	/**
	 * Get from session storage cache
	 */
	private static getFromCache(address: string): string | null | undefined {
		try {
			const key = `${CACHE_KEY_PREFIX}${address}`
			const cached = sessionStorage.getItem(key)
			if (!cached) return undefined

			// @dev: SuiNS names never expire, return cached value directly
			return cached === "null" ? null : cached
		} catch {
			return undefined
		}
	}

	/**
	 * Save to session storage cache
	 */
	private static saveToCache(address: string, name: string | null): void {
		try {
			const key = `${CACHE_KEY_PREFIX}${address}`
			// @dev: Store name directly as string (or "null" for null values)
			sessionStorage.setItem(key, name === null ? "null" : name)
		} catch (error) {
			// @dev: Silently fail if storage is full or unavailable
			console.warn("Failed to cache SuiNS name:", error)
		}
	}

	/**
	 * Clear all SuiNS cache entries
	 */
	static clearCache(): void {
		try {
			const keys = Object.keys(sessionStorage)
			for (const key of keys) {
				if (key.startsWith(CACHE_KEY_PREFIX)) {
					sessionStorage.removeItem(key)
				}
			}
		} catch {
			// @dev: Silently fail
		}
	}

	/**
	 * Preload SuiNS names for addresses
	 */
	static async preload(addresses: string[]): Promise<void> {
		await this.getNames(addresses)
	}
}
