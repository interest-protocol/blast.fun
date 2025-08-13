interface CacheEntry {
	isSafe: boolean
	timestamp: number
}

const CACHE_DURATION = 24 * 60 * 60 * 1000
const MAX_RETRIES = 2
const RETRY_DELAY = 1000

class NSFWCheckerClient {
	private memoryCache: Map<string, CacheEntry> = new Map()

	private isValidCacheEntry(entry: CacheEntry): boolean {
		return Date.now() - entry.timestamp < CACHE_DURATION
	}

	private getCached(url: string): boolean | null {
		const entry = this.memoryCache.get(url)
		if (entry && this.isValidCacheEntry(entry)) {
			return entry.isSafe
		}
		if (entry) {
			this.memoryCache.delete(url)
		}
		return null
	}

	private setCache(url: string, isSafe: boolean): void {
		this.memoryCache.set(url, {
			isSafe,
			timestamp: Date.now(),
		})
	}

	async checkImage(imageUrl: string, retryCount = 0): Promise<boolean> {
		if (!imageUrl) {
			return true
		}

		const cached = this.getCached(imageUrl)
		if (cached !== null) {
			return cached
		}

		try {
			const response = await fetch("/api/nsfw-check", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ url: imageUrl }),
			})

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`)
			}

			const data = await response.json()
			const isSafe = data.isSafe ?? true

			this.setCache(imageUrl, isSafe)

			return isSafe
		} catch (error) {
			if (retryCount < MAX_RETRIES) {
				await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY))
				return this.checkImage(imageUrl, retryCount + 1)
			}

			console.error("Failed to check image NSFW status:", error)
			return true
		}
	}

	async checkImages(imageUrls: string[]): Promise<Map<string, boolean>> {
		const results = new Map<string, boolean>()

		const uncachedUrls: string[] = []
		for (const url of imageUrls) {
			const cached = this.getCached(url)
			if (cached !== null) {
				results.set(url, cached)
			} else {
				uncachedUrls.push(url)
			}
		}

		const BATCH_SIZE = 5
		for (let i = 0; i < uncachedUrls.length; i += BATCH_SIZE) {
			const batch = uncachedUrls.slice(i, i + BATCH_SIZE)
			const batchResults = await Promise.all(
				batch.map(async (url) => {
					const isSafe = await this.checkImage(url)
					return { url, isSafe }
				})
			)

			for (const { url, isSafe } of batchResults) {
				results.set(url, isSafe)
			}
		}

		return results
	}

	clearCache(): void {
		this.memoryCache.clear()
	}
}

export const nsfwChecker = new NSFWCheckerClient()