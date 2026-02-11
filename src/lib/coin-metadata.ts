/**
 * Shared metadata shape used by farms and rewards.
 * API returns TokenMetadata (icon_url); map to iconUrl for consumers.
 */
export interface CoinMetadata {
	id: string
	decimals: number
	name: string
	symbol: string
	description: string
	iconUrl: string
	type: string
}

function mapApiToCoinMetadata(data: {
	icon_url: string
	name: string
	symbol: string
	decimals: number
	description?: string
}): CoinMetadata {
	return {
		id: "",
		decimals: data.decimals ?? 9,
		name: data.name ?? "",
		symbol: data.symbol ?? "",
		description: data.description ?? "",
		iconUrl: data.icon_url ?? "",
		type: "",
	}
}

export async function fetchCoinMetadata(
	coinType: string
): Promise<CoinMetadata | null> {
	const res = await fetch(
		`/api/coin/${encodeURIComponent(coinType)}/metadata`,
		{ headers: { Accept: "application/json" } }
	)
	if (!res.ok) return null
	const data = (await res.json()) as {
		icon_url: string
		name: string
		symbol: string
		decimals: number
		description?: string
	}
	return mapApiToCoinMetadata(data)
}

export async function fetchBatchCoinMetadata(
	coinTypes: string[]
): Promise<(CoinMetadata | null)[]> {
	if (coinTypes.length === 0) return []

	const res = await fetch("/api/coins/metadata", {
		method: "POST",
		headers: { "Content-Type": "application/json", Accept: "application/json" },
		body: JSON.stringify({ coinTypes }),
	})
	if (!res.ok) return coinTypes.map(() => null)
	const arr = (await res.json()) as (CoinMetadata | null)[]
	return arr
}
