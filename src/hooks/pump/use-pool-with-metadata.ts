'use client'

import { useQuery as useApolloQuery, ApolloError } from '@apollo/client'
import { useQuery } from '@tanstack/react-query'
import { GET_POOL } from '@/graphql/pools'
import { pumpSdk } from '@/lib/pump'
import type { Pool, PoolWithMetadata } from '@/types/pool'
import type { GetPoolResponse, GetPoolVariables } from '@/types/graphql'

interface UsePoolWithMetadataOptions {
	skip?: boolean
	pollInterval?: number
	onCompleted?: (data: PoolWithMetadata) => void
	onError?: (error: Error) => void
	retryCount?: number
	retryDelay?: number
}

interface UsePoolWithMetadataReturn {
	pool: PoolWithMetadata | null
	loading: boolean
	error: ApolloError | Error | null
	refetch: () => Promise<void>
	isRefetching: boolean
}

/**
 * Fetches metadata for a single pool with error handling
 */
async function fetchPoolMetadata(pool: Pool): Promise<PoolWithMetadata> {
	const enhancedPool: PoolWithMetadata = { ...pool }

	try {
		const [pumpPoolData, coinMetadata] = await Promise.allSettled([
			pumpSdk.getPumpPool(pool.poolId),
			pumpSdk.client.getCoinMetadata({ coinType: pool.coinType })
		])

		if (pumpPoolData.status === 'fulfilled' && pumpPoolData.value) {
			enhancedPool.pumpPoolData = pumpPoolData.value
		}

		if (coinMetadata.status === 'fulfilled' && coinMetadata.value) {
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
 * Hook to fetch a single pool with additional metadata from SDK
 * Combines GraphQL pool data with on-chain metadata
 * 
 * @param poolId - The ID of the pool to fetch
 * @param options - Query options including polling and error handling
 * @returns Object containing enriched pool data, loading states, and utility functions
 * 
 * @example
 * ```tsx
 * const { pool, loading, error } = usePoolWithMetadata('pool123', {
 *   pollInterval: 30000, // Poll every 30 seconds
 *   retryCount: 3,
 *   onCompleted: (pool) => console.log('Pool loaded:', pool)
 * })
 * ```
 */
export function usePoolWithMetadata(
	poolId: string,
	options: UsePoolWithMetadataOptions = {}
): UsePoolWithMetadataReturn {
	const {
		skip = false,
		pollInterval,
		onCompleted,
		onError,
		retryCount = 3,
		retryDelay = 1000,
	} = options

	const isValidPoolId = poolId && poolId.trim().length > 0

	const {
		data: apolloData,
		loading: apolloLoading,
		error: apolloError,
		refetch: apolloRefetch,
	} = useApolloQuery<GetPoolResponse, GetPoolVariables>(GET_POOL, {
		variables: { poolId },
		skip: !isValidPoolId || skip,
		pollInterval,
		notifyOnNetworkStatusChange: true,
		errorPolicy: 'all',
		onError: (error) => {
			console.error(`Failed to fetch pool ${poolId}:`, error)
		},
	})

	const pool = apolloData?.pool

	const {
		data: poolWithMetadata,
		isLoading: metadataLoading,
		error: metadataError,
		refetch: metadataRefetch,
		isRefetching
	} = useQuery({
		queryKey: ['poolWithMetadata', poolId],
		queryFn: async () => {
			if (!pool) {
				throw new Error(`Pool ${poolId} not found`)
			}

			const result = await fetchPoolMetadata(pool)

			if (onCompleted) {
				onCompleted(result)
			}

			return result
		},
		enabled: !!pool && !skip,
		staleTime: 5 * 60 * 1000, // 5 minutes
		gcTime: 10 * 60 * 1000, // 10 minutes
		retry: retryCount,
		retryDelay: (attemptIndex) => Math.min(retryDelay * 2 ** attemptIndex, 30000),
		onError: (error) => {
			console.error(`Failed to fetch metadata for pool ${poolId}:`, error)
			if (onError) {
				onError(error as Error)
			}
		},
	})

	const handleRefetch = async (): Promise<void> => {
		try {
			const [apolloResult] = await Promise.all([
				apolloRefetch(),
				metadataRefetch()
			])

			// apollo refetch returned new data, trigger metadata refetch
			if (apolloResult.data?.pool) {
				await metadataRefetch()
			}
		} catch (err) {
			console.error(`Failed to refetch pool ${poolId}:`, err)
			throw err
		}
	}

	const error = apolloError || metadataError

	return {
		pool: poolWithMetadata ?? null,
		loading: apolloLoading || metadataLoading,
		error,
		refetch: handleRefetch,
		isRefetching,
	}
}