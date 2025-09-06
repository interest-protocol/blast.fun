"use client"

import { memo, useCallback, useMemo, useState } from "react"
import { Logo } from "@/components/ui/logo"
import { useLatestTokens } from "@/hooks/use-tokens"
import type { TokenFilters, TokenListSettings } from "@/types/token"
import { TokenCard } from "./token-card"
import { TokenCardSkeleton } from "./token-card.skeleton"
import { TokenListLayout } from "./token-list.layout"
import { TokenListFilters } from "./token-list-filters"

interface NewlyCreatedProps {
	pollInterval?: number
}

export const NewlyCreated = memo(function NewlyCreated({ pollInterval = 10000 }: NewlyCreatedProps) {
	const [settings, setSettings] = useState<TokenListSettings>({
		sortBy: "date",
		filters: {
			tabType: "newly-created",
		},
	})

	// @dev: Build filter params based on settings
	const filterParams = useMemo<TokenFilters>(() => {
		return {
			...settings.filters,
			tabType: "newly-created",
		}
	}, [settings.filters])

	const { data, isLoading, error } = useLatestTokens(filterParams, {
		refetchInterval: pollInterval,
	})

	const filteredAndSortedTokens = useMemo(() => {
		if (!data || data.length === 0) return []

		let tokens = [...data]

		// @dev: Apply additional client-side social filters if needed
		if (settings.filters.hasWebsite || settings.filters.hasTwitter || settings.filters.hasTelegram) {
			tokens = tokens.filter((token) => {
				const metadata = token.metadata || token
				if (!metadata) return false

				if (settings.filters.hasWebsite && (!metadata.Website || metadata.Website === "")) return false
				if (settings.filters.hasTwitter && (!metadata.X || metadata.X === "")) return false
				if (settings.filters.hasTelegram && (!metadata.Telegram || metadata.Telegram === "")) return false

				return true
			})
		}

		// @dev: Apply sorting
		switch (settings.sortBy) {
			case "marketCap":
				return tokens.sort((a, b) => (b.market?.marketCap || 0) - (a.market?.marketCap || 0))
			case "date":
				return tokens.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
			case "volume":
				return tokens.sort((a, b) => (b.market?.volume24h || 0) - (a.market?.volume24h || 0))
			case "holders":
				return tokens.sort((a, b) => (b.market?.holdersCount || 0) - (a.market?.holdersCount || 0))
			case "bondingProgress":
				return tokens.sort((a, b) => (b.market?.bondingProgress || 0) - (a.market?.bondingProgress || 0))
			case "age":
				return tokens.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0))
			case "liquidity":
				return tokens.sort((a, b) => (b.market?.liquidity || 0) - (a.market?.liquidity || 0))
			default:
				return tokens
		}
	}, [data, settings])

	const renderContent = useCallback(() => {
		if (error) {
			return (
				<div className="p-8 text-center">
					<Logo className="mx-auto mb-2 h-8 w-8 text-destructive" />
					<p className="font-mono text-destructive text-xs uppercase">ERROR::LOADING::FEED</p>
				</div>
			)
		}

		if (isLoading) {
			return [...Array(8)].map((_, i) => <TokenCardSkeleton key={i} />)
		}

		if (filteredAndSortedTokens.length === 0 && !isLoading) {
			return (
				<div className="p-8 text-center">
					<Logo className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
					<p className="font-mono text-muted-foreground text-xs uppercase">NO::NEW::TOKENS</p>
				</div>
			)
		}

		return filteredAndSortedTokens.map((pool) => <TokenCard key={pool.coinType} pool={pool} />)
	}, [filteredAndSortedTokens, isLoading, error])

	return (
		<TokenListLayout
			title="NEWLY CREATED"
			glowColor="blue"
			headerAction={
				<TokenListFilters
					columnId="new"
					onSettingsChange={setSettings}
					defaultSort="date"
					defaultTab="newly-created"
				/>
			}
		>
			{renderContent()}
		</TokenListLayout>
	)
})
