import { env } from "@/env"

// @dev: no working yet, waiting for marco/jose
export async function fetchCoinMetadata(coinType: string) {
	const network = env.NEXT_PUBLIC_DEFAULT_NETWORK || "mainnet"
	const url = `https://api.interestlabs.io/v1/coins/${network}/metadatas/fetch-coins/${encodeURIComponent(coinType)}`

	const response = await fetch(url, {
		headers: {
			chain: "sui",
		},
	})

	if (!response.ok) {
		throw new Error(`Failed to fetch coin metadata: ${response.statusText}`)
	}

	return response.json()
}
