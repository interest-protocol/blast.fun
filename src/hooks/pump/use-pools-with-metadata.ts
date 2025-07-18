'use client'

import { useQuery as useApolloQuery, ApolloError } from '@apollo/client'
import { useQuery } from '@tanstack/react-query'
import { GET_POOLS } from '@/graphql/pools'
import { pumpSdk } from '@/lib/pump'
import type { Pool, PoolWithMetadata } from '@/types/pool'
import type { GetPoolsResponse, GetPoolsVariables } from '@/types/graphql'

interface UsePoolsWithMetadataOptions extends Partial<GetPoolsVariables> {
	pollInterval?: number
	skip?: boolean
	onCompleted?: (data: PoolWithMetadata[]) => void
	onError?: (error: Error) => void
	retryCount?: number
	retryDelay?: number
}

interface UsePoolsWithMetadataReturn {
	pools: PoolWithMetadata[]
	loading: boolean
	error: ApolloError | Error | null
	refetch: () => Promise<void>
	fetchMore: (page: number) => Promise<void>
	hasMore: boolean
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
 * Hook to fetch pools with additional metadata from SDK
 * Combines GraphQL pool data with on-chain metadata
 * 
 * @param options - Query options including pagination and error handling
 * @returns Object containing enriched pools data, loading states, and utility functions
 * 
 * @example
 * ```tsx
 * const { pools, loading, error } = usePoolsWithMetadata({ 
 *   page: 1, 
 *   pageSize: 12,
 *   pollInterval: 60000, // Poll every minute
 *   retryCount: 3
 * })
 * ```
 */
export function usePoolsWithMetadata(
	options: UsePoolsWithMetadataOptions = {}
): UsePoolsWithMetadataReturn {
	const {
		page = 1,
		pageSize = 12,
		pollInterval,
		skip = false,
		onCompleted,
		onError,
		retryCount = 3,
		retryDelay = 1000,
	} = options

	const {
		data: apolloData,
		loading: apolloLoading,
		error: apolloError,
		refetch: apolloRefetch,
		fetchMore: apolloFetchMore
	} = useApolloQuery<GetPoolsResponse, GetPoolsVariables>(GET_POOLS, {
		variables: {
			page,
			pageSize,
		},
		skip,
		pollInterval,
		notifyOnNetworkStatusChange: true,
		errorPolicy: 'all',
	})

	const pools = apolloData?.pools?.pools ?? []
	const poolIds = pools.map(p => p.poolId).join(',')

	const {
		data: poolsWithMetadata,
		isLoading: metadataLoading,
		error: metadataError,
		refetch: metadataRefetch,
		isRefetching
	} = useQuery({
		queryKey: ['poolsWithMetadata', poolIds, page, pageSize],
		queryFn: async () => {
			if (pools.length === 0) return []

			const results = await Promise.all(
				pools.map(pool => fetchPoolMetadata(pool))
			)

			if (onCompleted) {
				onCompleted(results)
			}

			return results
		},
		enabled: pools.length > 0 && !skip,
		staleTime: 5 * 60 * 1000, // 5 minutes
		gcTime: 10 * 60 * 1000, // 10 minutes
		retry: retryCount,
		retryDelay: (attemptIndex) => Math.min(retryDelay * 2 ** attemptIndex, 30000),
		onError: (error) => {
			console.error('Failed to fetch pool metadata:', error)
			if (onError) {
				onError(error as Error)
			}
		},
	})

	const hasMore = pools.length === pageSize

	const handleRefetch = async (): Promise<void> => {
		try {
			await Promise.all([
				apolloRefetch(),
				metadataRefetch()
			])
		} catch (err) {
			console.error('Failed to refetch pools with metadata:', err)
			throw err
		}
	}

	const handleFetchMore = async (nextPage: number): Promise<void> => {
		try {
			await apolloFetchMore({
				variables: {
					page: nextPage,
					pageSize,
				},
				updateQuery: (prev, { fetchMoreResult }) => {
					if (!fetchMoreResult) return prev
					return fetchMoreResult
				},
			})
		} catch (err) {
			console.error('Failed to fetch more pools:', err)
			throw err
		}
	}

	return {
		pools: poolsWithMetadata ?? [],
		loading: apolloLoading || metadataLoading,
		error: apolloError || metadataError,
		refetch: handleRefetch,
		fetchMore: handleFetchMore,
		hasMore,
		isRefetching,
	}
}