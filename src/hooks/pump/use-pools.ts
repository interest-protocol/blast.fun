'use client'

import { useQuery, ApolloError } from '@apollo/client'
import { GET_POOLS } from '@/graphql/pools'
import type { Pool } from '@/types/pool'
import type { GetPoolsResponse, GetPoolsVariables } from '@/types/graphql'

interface UsePoolsOptions extends Partial<GetPoolsVariables> {
	pollInterval?: number
	skip?: boolean
	onCompleted?: (data: GetPoolsResponse) => void
	onError?: (error: ApolloError) => void
}

interface UsePoolsReturn {
	pools: Pool[]
	loading: boolean
	error: ApolloError | undefined
	refetch: () => Promise<void>
	fetchMore: (page: number) => Promise<void>
	hasMore: boolean
	totalPages?: number
}

/**
 * Hook to fetch paginated pools from GraphQL API
 * 
 * @param options - Query options including pagination, polling, and callbacks
 * @returns Object containing pools data, loading state, error, and utility functions
 * 
 * @example
 * ```tsx
 * const { pools, loading, error, fetchMore } = usePools({ 
 *   page: 1, 
 *   pageSize: 10,
 *   pollInterval: 30000 // Poll every 30 seconds
 * })
 * ```
 */
export function usePools(options: UsePoolsOptions = {}): UsePoolsReturn {
	const {
		page = 1,
		pageSize = 5,
		pollInterval,
		skip = false,
		onCompleted,
		onError,
	} = options

	const { data, loading, error, refetch, fetchMore: apolloFetchMore } = useQuery<
		GetPoolsResponse,
		GetPoolsVariables
	>(GET_POOLS, {
		variables: {
			page,
			pageSize,
		},
		skip,
		pollInterval,
		notifyOnNetworkStatusChange: true,
		errorPolicy: 'all',
		onCompleted,
		onError,
	})

	const pools = data?.pools?.pools ?? []
	const hasMore = pools.length === pageSize

	const handleRefetch = async (): Promise<void> => {
		try {
			await refetch()
		} catch (err) {
			console.error('Failed to refetch pools:', err)
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
		pools,
		loading,
		error,
		refetch: handleRefetch,
		fetchMore: handleFetchMore,
		hasMore,
	}
}