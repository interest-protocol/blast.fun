"use client"

import { memo, useCallback, useState, useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { TokenCard } from "./token-card"
import { TokenListLayout } from "./token-list.layout"
import { TokenCardSkeleton } from "./token-card.skeleton"
import { Logo } from "@/components/ui/logo"
import { TokenListSettingsDialog, type TokenListSettings, type SortOption } from "./token-list.settings"
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
	const [settings, setSettings] = useState<TokenListSettings>({
		sortBy: "marketCap",
		socialFilters: {
			requireWebsite: false,
			requireTwitter: false,
			requireTelegram: false,
		}
	})

	const { data, isLoading, error } = useQuery({
		queryKey: ["tokens", "graduated"],
		queryFn: fetchGraduatedTokens,
		refetchInterval: pollInterval,
		staleTime: 15000
	})

	const filteredAndSortedPools = useMemo(() => {
		if (!data?.pools || data.pools.length === 0) return []

		let pools = [...data.pools]

		// Apply social filters
		if (settings.socialFilters.requireWebsite ||
			settings.socialFilters.requireTwitter ||
			settings.socialFilters.requireTelegram) {

			pools = pools.filter((pool: PoolWithMetadata) => {
				const metadata = pool.metadata
				if (!metadata) return false

				// Check for social links with proper field names (capital letters)
				if (settings.socialFilters.requireWebsite && (!metadata.Website || metadata.Website === '')) return false
				if (settings.socialFilters.requireTwitter && (!metadata.X || metadata.X === '')) return false
				if (settings.socialFilters.requireTelegram && (!metadata.Telegram || metadata.Telegram === '')) return false

				return true
			})
		}

		// Apply sorting
		switch (settings.sortBy) {
			case "marketCap":
				return pools.sort((a: PoolWithMetadata, b: PoolWithMetadata) => {
					const aMarketCap = a.marketData?.marketCap || 0
					const bMarketCap = b.marketData?.marketCap || 0
					return bMarketCap - aMarketCap
				})
			case "date":
				return pools.sort((a: PoolWithMetadata, b: PoolWithMetadata) => {
					const aDate = new Date(a.lastTradeAt || a.createdAt || 0).getTime()
					const bDate = new Date(b.lastTradeAt || b.createdAt || 0).getTime()
					return bDate - aDate
				})
			case "volume":
				return pools.sort((a: PoolWithMetadata, b: PoolWithMetadata) => {
					const aVolume = a.marketData?.coin24hTradeVolumeUsd || 0
					const bVolume = b.marketData?.coin24hTradeVolumeUsd || 0
					return bVolume - aVolume
				})
			case "holders":
				return pools.sort((a: PoolWithMetadata, b: PoolWithMetadata) => {
					const aHolders = a.marketData?.holdersCount || 0
					const bHolders = b.marketData?.holdersCount || 0
					return bHolders - aHolders
				})
			default:
				return pools
		}
	}, [data?.pools, settings])

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

		if (filteredAndSortedPools.length === 0 && !isLoading) {
			return (
				<div className="p-8 text-center">
					<Logo className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
					<p className="font-mono text-xs uppercase text-muted-foreground">
						NO::GRADUATED::TOKENS
					</p>
				</div>
			)
		}

		return filteredAndSortedPools.map((pool: PoolWithMetadata) => (
			<TokenCard key={pool.poolId} pool={pool} />
		))
	}, [filteredAndSortedPools, isLoading, error])

	return (
		<TokenListLayout
			title="GRADUATED"
			glowColor="gold"
			headerAction={
				<TokenListSettingsDialog
					columnId="graduated"
					onSettingsChange={setSettings}
					defaultSort="marketCap"
					availableSortOptions={[
						{ value: "marketCap", label: "MARKET::CAP" },
						{ value: "date", label: "RECENT::TRADES" },
						{ value: "volume", label: "VOLUME::24H" },
						{ value: "holders", label: "HOLDER::COUNT" },
					]}
				/>
			}
		>
			{renderContent()}
		</TokenListLayout>
	)
})