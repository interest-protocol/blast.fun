"use client"

import { useInfiniteQuery } from "@tanstack/react-query"
import { useApp } from "@/context/app.context"
import { vestingSdk } from "@/lib/memez/sdk"
import { toVestingPosition } from "../vesting.utils"

export function useVesting() {
	const { address } = useApp()

	const query = useInfiniteQuery({
		queryKey: ["vesting-positions", address],
		queryFn: async ({ pageParam }) => {
			if (!address) {
				return { data: [], hasNextPage: false, nextCursor: null }
			}

			return vestingSdk.getOwnedVestings({
				owner: address,
				cursor: pageParam,
				limit: 20,
			})
		},
		initialPageParam: null as string | null,
		getNextPageParam: (page) => (page.hasNextPage && page.nextCursor ? page.nextCursor : undefined),
		enabled: !!address,
		staleTime: 10_000,
		refetchInterval: 30_000,
	})

	const positions = query.data?.pages.flatMap((page) => page.data.map(toVestingPosition)) ?? []

	return {
		positions,
		isLoading: query.isLoading,
		error: query.error,
		refetch: query.refetch,
		loadMore: () => query.fetchNextPage(),
		hasMore: query.hasNextPage,
		isLoadingMore: query.isFetchingNextPage,
	}
}
