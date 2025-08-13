import { GET_POOL, GET_POOLS } from "@/graphql/pools"
import { apolloClient } from "@/lib/apollo-client"
import type { GetPoolResponse, GetPoolsResponse, GetPoolsVariables, GetPoolVariables } from "@/types/graphql"
import type { Pool, PoolWithMetadata } from "@/types/pool"
import { CONFIG_KEYS } from "@interest-protocol/memez-fun-sdk"

export async function fetchTokens(page = 1, pageSize = 10): Promise<Pool[]> {
	const { data } = await apolloClient.query<GetPoolsResponse, GetPoolsVariables>({
		query: GET_POOLS,
		context: {
			headers: {
				"config-key": CONFIG_KEYS.mainnet.XPUMP
			}
		},
		variables: { page, pageSize },
		errorPolicy: "all",
		fetchPolicy: "network-only",
	})

	return data?.pools?.pools ?? []
}

export async function fetchToken(poolId: string): Promise<Pool> {
	const { data } = await apolloClient.query<GetPoolResponse, GetPoolVariables>({
		query: GET_POOL,
		context: {
			headers: {
				"config-key": CONFIG_KEYS.mainnet.XPUMP
			}
		},
		variables: { poolId },
		errorPolicy: "all",
		fetchPolicy: "network-only",
	})

	if (!data?.pool) {
		throw new Error(`Pool ${poolId} not found`)
	}

	return data.pool
}

export async function fetchTokenWithMetadata(poolId: string): Promise<PoolWithMetadata> {
	const pool = await fetchToken(poolId)

	return {
		...pool,
		isProtected: !!pool.publicKey
	}
}