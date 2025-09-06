// @dev: In-memory cache for data URIs to avoid URL length issues
const imageCache = new Map<string, string>()

export function cacheDataUri(dataUri: string): string {
	if (!dataUri.startsWith("data:image/")) {
		return dataUri // Return original if not a data URI
	}

	// Create a simple hash from the data URI
	const hash = Buffer.from(dataUri.slice(0, 100)).toString("base64").slice(0, 8)
	imageCache.set(hash, dataUri)
	return hash
}

export function getDataUri(hash: string): string | undefined {
	return imageCache.get(hash)
}

export function isDataUriHash(str: string): boolean {
	return str.length === 8 && /^[A-Za-z0-9+/]+=?=?$/.test(str)
}
