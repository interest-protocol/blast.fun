"use client"

import { memo, useCallback, useMemo, useState } from "react"
import { Logo } from "@/components/ui/logo"
import { useAboutToBondTokens } from "@/hooks/use-tokens"
import type { TokenFilters, TokenListSettings } from "@/types/token"
import { TokenCard } from "./token-card"
import { TokenCardSkeleton } from "./token-card.skeleton"
import { TokenListLayout } from "./token-list.layout"
import { TokenListFilters } from "./token-list-filters"

interface NearGraduationProps {
	pollInterval?: number
}

export const NearGraduation = memo(function NearGraduation({ pollInterval = 10000 }: NearGraduationProps) {
	const [settings, setSettings] = useState<TokenListSettings>({
		sortBy: "bondingProgress",
		filters: {
			tabType: "about-to-bond",
		},
	})

	// @dev: Build filter params - about to bond should have high bonding progress
	const filterParams = useMemo<TokenFilters>(() => {
		return {
			...settings.filters,
			tabType: "about-to-bond",
		}
	}, [settings.filters])

	const { data, isLoading, error } = useAboutToBondTokens(filterParams, {
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
			case "bondingProgress":
				return tokens.sort((a, b) => (b.market?.bondingProgress || 0) - (a.market?.bondingProgress || 0))
			case "marketCap":
				return tokens.sort((a, b) => (b.market?.marketCap || 0) - (a.market?.marketCap || 0))
			case "date":
				return tokens.sort((a, b) => {
					const aDate = new Date(a.lastTradeAt || a.createdAt).getTime()
					const bDate = new Date(b.lastTradeAt || b.createdAt).getTime()
					return bDate - aDate
				})
			case "volume":
				return tokens.sort((a, b) => (b.market?.volume24h || 0) - (a.market?.volume24h || 0))
			case "holders":
				return tokens.sort((a, b) => (b.market?.holdersCount || 0) - (a.market?.holdersCount || 0))
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
					<p className="font-mono text-destructive text-xs uppercase">ERROR::LOADING::GRADUATING</p>
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
					<p className="font-mono text-muted-foreground text-xs uppercase">NO::TOKENS::GRADUATING</p>
				</div>
			)
		}

		return filteredAndSortedTokens.map((pool) => <TokenCard key={pool.coinType} pool={pool} />)
	}, [filteredAndSortedTokens, isLoading, error])

	return (
		<TokenListLayout
			title="NEAR GRADUATION"
			glowColor="pink"
			headerAction={
				<TokenListFilters
					columnId="graduating"
					onSettingsChange={setSettings}
					defaultSort="bondingProgress"
					defaultTab="about-to-bond"
				/>
			}
		>
			{renderContent()}
		</TokenListLayout>
	)
})
