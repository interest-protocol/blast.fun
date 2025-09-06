"use client"

import { memo, useCallback, useState, useMemo } from "react"
import { TokenCard } from "./token-card"
import { TokenListLayout } from "./token-list.layout"
import { TokenCardSkeleton } from "./token-card.skeleton"
import { Logo } from "@/components/ui/logo"
import { TokenListFilters } from "./token-list.filters"
import { useAboutToBondTokens } from "@/hooks/use-tokens"
import type { TokenListSettings, TokenFilters } from "@/types/token"

interface NearGraduationProps {
	pollInterval?: number
}

export const NearGraduation = memo(function NearGraduation({
	pollInterval = 10000
}: NearGraduationProps) {
	const [settings, setSettings] = useState<TokenListSettings>({
		sortBy: "bondingProgress",
		filters: {
			tabType: 'about-to-bond'
		}
	})

	// @dev: Build filter params - about to bond should have high bonding progress
	const filterParams = useMemo<TokenFilters>(() => {
		return {
			...settings.filters,
			tabType: 'about-to-bond'
		}
	}, [settings.filters])

	const { data, isLoading, error } = useAboutToBondTokens(filterParams, {
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

		// @dev: Apply client-side sorting with robust data structure handling
		switch (settings.sortBy) {
			case "bondingProgress":
				return tokens.sort((a, b) => {
					const aBonding = (a.market?.bondingProgress || (a as any).bondingProgress || 0)
					const bBonding = (b.market?.bondingProgress || (b as any).bondingProgress || 0)
					return bBonding - aBonding
				})
			case "marketCap":
				return tokens.sort((a, b) => {
					const aMarketCap = (a.market?.marketCap || (a as any).marketCap || 0)
					const bMarketCap = (b.market?.marketCap || (b as any).marketCap || 0)
					return bMarketCap - aMarketCap
				})
			case "date":
				return tokens.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
			case "volume":
				return tokens.sort((a, b) => {
					const aVolume = (a.market?.volume24h || (a as any).volume24h || 0)
					const bVolume = (b.market?.volume24h || (b as any).volume24h || 0)
					return bVolume - aVolume
				})
			case "holders":
				return tokens.sort((a, b) => {
					const aHolders = (a.market?.holdersCount || (a as any).holdersCount || 0)
					const bHolders = (b.market?.holdersCount || (b as any).holdersCount || 0)
					return bHolders - aHolders
				})
			case "lastTrade":
				return tokens.sort((a, b) => {
					const aTimestamp = a.lastTradeAt 
						? (typeof a.lastTradeAt === 'string' ? new Date(a.lastTradeAt).getTime() : a.lastTradeAt)
						: 0
					const bTimestamp = b.lastTradeAt 
						? (typeof b.lastTradeAt === 'string' ? new Date(b.lastTradeAt).getTime() : b.lastTradeAt)
						: 0
					return bTimestamp - aTimestamp
				})
			case "liquidity":
				return tokens.sort((a, b) => {
					const aLiquidity = (a.market?.liquidity || (a as any).liquidity || 0)
					const bLiquidity = (b.market?.liquidity || (b as any).liquidity || 0)
					return bLiquidity - aLiquidity
				})
			case "devHoldings":
				return tokens.sort((a, b) => {
					const aDevHoldings = (a.market?.devHoldings || (a as any).devHoldings || 0)
					const bDevHoldings = (b.market?.devHoldings || (b as any).devHoldings || 0)
					return aDevHoldings - bDevHoldings // Lower is better for dev holdings
				})
			case "top10Holdings":
				return tokens.sort((a, b) => {
					const aTop10Holdings = (a.market?.top10Holdings || (a as any).top10Holdings || 0)
					const bTop10Holdings = (b.market?.top10Holdings || (b as any).top10Holdings || 0)
					return aTop10Holdings - bTop10Holdings // Lower is better for top10 holdings
				})
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
						ERROR::LOADING::GRADUATING
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
						NO::TOKENS::GRADUATING
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