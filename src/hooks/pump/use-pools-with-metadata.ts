"use client"

import { useQuery } from "@tanstack/react-query"
import { fetchPoolsWithMetadata } from "@/lib/pump/fetch-pools"

interface UsePoolsWithMetadataOptions {
	page?: number
	pageSize?: number
}

export function usePoolsWithMetadata(options: UsePoolsWithMetadataOptions = {}) {
	const { page = 1, pageSize = 12 } = options

	return useQuery({
		queryKey: ["pools-with-metadata", page, pageSize],
		queryFn: () => fetchPoolsWithMetadata(page, pageSize),
		staleTime: 5 * 60 * 1000, // 5 minutes
		refetchInterval: 60000, // 1 minute
	})
}
