import { apolloClient } from "@/lib/apollo-client"
import { GET_POOL } from "@/graphql/pools"
import { CONFIG_KEYS } from "@interest-protocol/memez-fun-sdk"
import { nexaClient } from "@/lib/nexa"
import type { PoolWithMetadata } from "@/types/pool"

export async function fetchTokenWithMetadata(poolId: string): Promise<PoolWithMetadata> {
	try {
		const { data } = await apolloClient.query({
			query: GET_POOL,
			variables: { poolId },
			context: {
				headers: {
					"config-key": CONFIG_KEYS.mainnet.XPUMP
				}
			},
			fetchPolicy: "network-only"
		})

		if (!data?.pool) {
			throw new Error("Pool not found")
		}

		const pool = data.pool

		let coinMetadata = null
		try {
			const marketData = await nexaClient.getMarketData(pool.coinType)
			coinMetadata = marketData?.coinMetadata || pool.metadata
		} catch (error) {
			console.error("Failed to fetch metadata:", error)
			coinMetadata = pool.metadata
		}

		return {
			...pool,
			coinMetadata,
			isProtected: !!pool.publicKey
		}
	} catch (error) {
		console.error("Error fetching token with metadata:", error)
		throw error
	}
}