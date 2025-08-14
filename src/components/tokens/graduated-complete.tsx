"use client"

import { memo, useCallback } from "react"
import { useQuery } from "@tanstack/react-query"
import { TokenCard } from "./token-card"
import { TokenListLayout } from "./token-list-layout"
import { TokenCardSkeleton } from "./token-card.skeleton"
import { Logo } from "@/components/ui/logo"
import type { PoolWithMetadata } from "@/types/pool"

interface GraduatedCompleteProps {
	pollInterval?: number
}

async function fetchGraduatedTokens() {
	const response = await fetch("/api/tokens?category=graduated&sortField=lastTradeAt&sortDirection=DESC&pageSize=30")
	if (!response.ok) throw new Error("Failed to fetch tokens")
	return response.json()
}

export const GraduatedComplete = memo(function GraduatedComplete({
	pollInterval = 30000
}: GraduatedCompleteProps) {
	const { data, isLoading, error } = useQuery({
		queryKey: ["tokens", "graduated"],
		queryFn: fetchGraduatedTokens,
		refetchInterval: pollInterval,
		staleTime: 15000
	})

	const renderContent = useCallback(() => {
		if (error) {
			return (
				<div className="p-8 text-center">
					<Logo className="w-8 h-8 mx-auto text-destructive mb-2" />
					<p className="font-mono text-xs uppercase text-destructive">
						ERROR::LOADING::GRADUATED
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
						NO::GRADUATED::TOKENS
					</p>
				</div>
			)
		}

		return data.pools.map((pool: PoolWithMetadata) => (
			<TokenCard key={pool.poolId} pool={pool} />
		))
	}, [data, isLoading, error])

	return (
		<TokenListLayout title="GRADUATED" glowColor="gold">
			{renderContent()}
		</TokenListLayout>
	)
})