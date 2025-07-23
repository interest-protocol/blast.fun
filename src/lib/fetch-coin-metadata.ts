import { env } from "@/env"

interface CoinMetadataResponse {
	data: {
		fetchCoin: {
			iconUrl: string | null
			name: string
			symbol: string
			decimals: number
			description: string | null
		}
	}
}

interface BatchCoinMetadataResponse {
	data: {
		fetchCoins: {
			coins: Array<{
				iconUrl: string | null
				name: string
				symbol: string
				decimals: number
				description: string | null
				type: string
			}>
		}
	}
}

export async function fetchCoinMetadata(coinType: string) {
	const network = env.NEXT_PUBLIC_DEFAULT_NETWORK || "mainnet"
	const url = `https://api.interestlabs.io/v1/coins/${network}`

	const query = `
		query FetchCoin($input: LoadCoinInput!) {
			fetchCoin(input: $input) {
				name
				symbol
				decimals
				description
				iconUrl
			}
		}
	`

	const response = await fetch(url, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			query,
			variables: {
				input: {
					type: coinType,
				},
			},
		}),
	})

	if (!response.ok) {
		throw new Error(`Failed to fetch coin metadata: ${response.statusText}`)
	}

	const result: CoinMetadataResponse = await response.json()
	if (!result.data?.fetchCoin) {
		throw new Error(`No metadata found for coin type: ${coinType}`)
	}

	// format compatible with getCoinMetadata response
	return {
		id: coinType,
		decimals: result.data.fetchCoin.decimals,
		name: result.data.fetchCoin.name,
		symbol: result.data.fetchCoin.symbol,
		description: result.data.fetchCoin.description || "",
		iconUrl: result.data.fetchCoin.iconUrl,
	}
}

export async function fetchCoinsMetadata(coinTypes: string[], limit = 10, page = 1) {
	const network = env.NEXT_PUBLIC_DEFAULT_NETWORK || "mainnet"
	const url = `https://api.interestlabs.io/v1/coins/${network}`

	const query = `
		query FetchCoins($input: ListCoinsInput!) {
			fetchCoins(input: $input) {
				coins {
					name
					symbol
					decimals
					description
					iconUrl
					type
				}
			}
		}
	`

	const response = await fetch(url, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			query,
			variables: {
				input: {
					types: coinTypes,
					limit,
					page,
				},
			},
		}),
	})

	if (!response.ok) {
		throw new Error(`Failed to fetch coins metadata: ${response.statusText}`)
	}

	const result: BatchCoinMetadataResponse = await response.json()

	if (!result.data?.fetchCoins?.coins) {
		throw new Error(`No metadata found for coin types`)
	}

	// lookup map of coinType to metadata
	const metadataMap = new Map<string, any>()

	for (const coin of result.data.fetchCoins.coins) {
		metadataMap.set(coin.type, {
			id: coin.type,
			decimals: coin.decimals,
			name: coin.name,
			symbol: coin.symbol,
			description: coin.description || "",
			iconUrl: coin.iconUrl,
		})
	}

	return metadataMap
}
