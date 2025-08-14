"use client"

import { memo, useCallback } from "react"
import { useQuery } from "@tanstack/react-query"
import { TokenCard } from "./token-card"
import { TokenListLayout } from "./token-list-layout"
import { TokenCardSkeleton } from "./token-card.skeleton"
import { Logo } from "@/components/ui/logo"
import type { PoolWithMetadata } from "@/types/pool"

interface NewlyCreatedProps {
	pollInterval?: number
}

async function fetchNewTokens() {
	const response = await fetch("/api/tokens?category=new&sortField=createdAt&sortDirection=DESC&pageSize=25")
	if (!response.ok) throw new Error("Failed to fetch tokens")
	return response.json()
}

export const NewlyCreated = memo(function NewlyCreated({
	pollInterval = 10000
}: NewlyCreatedProps) {
	const { data, isLoading, error } = useQuery({
		queryKey: ["tokens", "new"],
		queryFn: fetchNewTokens,
		refetchInterval: pollInterval,
		staleTime: 5000
	})

	const renderContent = useCallback(() => {
		if (error) {
			return (
				<div className="p-8 text-center">
					<Logo className="w-8 h-8 mx-auto text-destructive mb-2" />
					<p className="font-mono text-xs uppercase text-destructive">
						ERROR::LOADING::FEED
					</p>
				</div>
			)
		}

		if (isLoading) {
			return [...Array(8)].map((_, i) => (
				<TokenCardSkeleton key={i} />
			))
		}

		if (!data?.pools || data.pools.length === 0) {
			return (
				<div className="p-8 text-center">
					<Logo className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
					<p className="font-mono text-xs uppercase text-muted-foreground">
						NO::NEW::TOKENS
					</p>
				</div>
			)
		}

		return data.pools.map((pool: PoolWithMetadata) => (
			<TokenCard key={pool.poolId} pool={pool} />
		))
	}, [data, isLoading, error])

	return (
		<TokenListLayout title="NEWLY CREATED" glowColor="blue">
			{renderContent()}
		</TokenListLayout>
	)
})