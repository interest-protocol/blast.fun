import { GET_POOL, GET_POOLS } from "@/graphql/pools"
import { apolloClient } from "@/lib/apollo-client"
import { pumpSdk } from "@/lib/pump"
import type { GetPoolResponse, GetPoolsResponse, GetPoolsVariables, GetPoolVariables } from "@/types/graphql"
import type { Pool, PoolWithMetadata } from "@/types/pool"
import { fetchCoinMetadata } from "../fetch-coin-metadata"
import { suiClient } from "../sui-client"

/**
 * Fetches metadata for a single pool
 */
async function enrichPoolWithMetadata(pool: Pool): Promise<PoolWithMetadata> {
	const enhancedPool: PoolWithMetadata = { ...pool }

	try {
		const [pumpPoolData, coinMetadata] = await Promise.allSettled([
			pumpSdk.getPumpPool(pool.poolId),
			// fetchCoinMetadata(pool.coinType),
			suiClient.getCoinMetadata({ coinType: pool.coinType }),
		])

		if (pumpPoolData.status === "fulfilled" && pumpPoolData.value) {
			enhancedPool.pumpPoolData = pumpPoolData.value
		}

		if (coinMetadata.status === "fulfilled" && coinMetadata.value) {
			const metadata = coinMetadata.value
			enhancedPool.coinMetadata = {
				name: metadata.name,
				symbol: metadata.symbol,
				description: metadata.description ?? null,
				iconUrl: metadata.iconUrl ?? null,
				decimals: metadata.decimals,
				id: metadata.id ?? null,
			}
		}
	} catch (error) {
		console.error(`Failed to fetch metadata for pool ${pool.poolId}:`, error)
	}

	return enhancedPool
}

/**
 * Fetch multiple pools from GraphQL
 */
export async function fetchPools(page = 1, pageSize = 12): Promise<Pool[]> {
	const { data } = await apolloClient.query<GetPoolsResponse, GetPoolsVariables>({
		query: GET_POOLS,
		variables: { page, pageSize },
		errorPolicy: "all",
		fetchPolicy: "network-only",
	})

	return data?.pools?.pools ?? []
}

/**
 * Fetch multiple pools with metadata
 */
export async function fetchPoolsWithMetadata(page = 1, pageSize = 12): Promise<PoolWithMetadata[]> {
	const pools = await fetchPools(page, pageSize)

	if (pools.length === 0) return []

	return Promise.all(pools.map((pool) => enrichPoolWithMetadata(pool)))
}

/**
 * Fetch a single pool by ID
 */
export async function fetchPool(poolId: string): Promise<Pool> {
	const { data } = await apolloClient.query<GetPoolResponse, GetPoolVariables>({
		query: GET_POOL,
		variables: { poolId },
		errorPolicy: "all",
		fetchPolicy: "network-only",
	})

	if (!data?.pool) {
		throw new Error(`Pool ${poolId} not found`)
	}

	return data.pool
}

/**
 * Fetch a single pool with metadata
 */
export async function fetchPoolWithMetadata(poolId: string): Promise<PoolWithMetadata> {
	const pool = await fetchPool(poolId)
	return enrichPoolWithMetadata(pool)
}
