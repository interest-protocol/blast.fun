"use client"

import { memo, useCallback, useState, useMemo } from "react"
import { TokenCard } from "./token-card"
import { TokenListLayout } from "./token-list.layout"
import { TokenCardSkeleton } from "./token-card.skeleton"
import { Logo } from "@/components/ui/logo"
import { TokenListFilters } from "./token-list.filters"
import { useBondedTokens } from "@/hooks/use-tokens"
import type { TokenListSettings, TokenFilters } from "@/types/token"

interface GraduatedCompleteProps {
	pollInterval?: number
}

export const GraduatedComplete = memo(function GraduatedComplete({
	pollInterval = 30000
}: GraduatedCompleteProps) {
	const [settings, setSettings] = useState<TokenListSettings>({
		sortBy: "marketCap",
		filters: {
			tabType: 'bonded'
		}
	})

	// @dev: Build filter params for bonded tokens
	const filterParams = useMemo<TokenFilters>(() => {
		return {
			...settings.filters,
			tabType: 'bonded'
		}
	}, [settings.filters])

	const { data, isLoading, error } = useBondedTokens(filterParams, {
		refetchInterval: pollInterval
	})

	const filteredAndSortedTokens = useMemo(() => {
		if (!data || data.length === 0) return []

		let tokens = [...data]

		// @dev: Apply additional client-side social filters if needed
		if (settings.filters.hasWebsite || settings.filters.hasTwitter || settings.filters.hasTelegram) {
			tokens = tokens.filter((token) => {
				const metadata = token.metadata || token
				if (!metadata) return false
				
				if (settings.filters.hasWebsite && (!metadata.Website || metadata.Website === '')) return false
				if (settings.filters.hasTwitter && (!metadata.X || metadata.X === '')) return false
				if (settings.filters.hasTelegram && (!metadata.Telegram || metadata.Telegram === '')) return false
				
				return true
			})
		}

		// @dev: Apply sorting
		switch (settings.sortBy) {
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

		if (filteredAndSortedTokens.length === 0 && !isLoading) {
			return (
				<div className="p-8 text-center">
					<Logo className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
					<p className="font-mono text-xs uppercase text-muted-foreground">
						NO::GRADUATED::TOKENS
					</p>
				</div>
			)
		}

		return filteredAndSortedTokens.map((pool) => (
			<TokenCard 
				key={pool.coinType} 
				pool={pool} 
			/>
		))
	}, [filteredAndSortedTokens, isLoading, error])

	return (
		<TokenListLayout
			title="GRADUATED"
			glowColor="gold"
			headerAction={
				<TokenListFilters
					columnId="graduated"
					onSettingsChange={setSettings}
					defaultSort="marketCap"
					defaultTab="bonded"
				/>
			}
		>
			{renderContent()}
		</TokenListLayout>
	)
})