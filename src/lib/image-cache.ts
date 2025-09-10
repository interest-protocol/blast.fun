// @dev: Simple in-memory cache for data URIs to avoid URL length issues
const dataUriCache = new Map<string, string>()

export function cacheDataUri(dataUri: string): string {
	// @dev: Generate a hash as a key
	const hash = generateHash(dataUri)
	dataUriCache.set(hash, dataUri)
	return hash
}

export function getDataUri(hash: string): string | undefined {
	return dataUriCache.get(hash)
}

export function isDataUriHash(value: string): boolean {
	// @dev: Check if it's a hash (32 char hex string)
	return /^[a-f0-9]{32}$/.test(value)
}

function generateHash(str: string): string {
	// @dev: Simple hash function for caching purposes
	let hash = 0
	for (let i = 0; i < str.length; i++) {
		const char = str.charCodeAt(i)
		hash = ((hash << 5) - hash) + char
		hash = hash & hash // Convert to 32bit integer
	}
	return Math.abs(hash).toString(16).padStart(32, '0').slice(0, 32)
}