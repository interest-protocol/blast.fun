"use client"

import { memo, useCallback, useState, useMemo } from "react"
import { TokenCard } from "./token-card"
import { TokenListLayout } from "./token-list.layout"
import { TokenCardSkeleton } from "./token-card.skeleton"
import { Logo } from "@/components/ui/logo"
import { TokenListFilters } from "./token-list.filters"
import { FlashBuyInput } from "./flash-buy-input"
import { useAboutToBondTokens } from "@/hooks/use-tokens"
import { useTradeBump } from "@/hooks/use-trade-bump"
import type { TokenListSettings, TokenFilters } from "@/types/token"
import { sortTokens } from "@/utils/token-sorting"

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
	const { bumpOrder, isAnimating } = useTradeBump()

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

		// sort based on bump order, then apply normal sorting
		const sorted = [...tokens].sort((a, b) => {
			const aIndex = bumpOrder.indexOf(a.coinType)
			const bIndex = bumpOrder.indexOf(b.coinType)

			if (aIndex !== -1 && bIndex !== -1) {
				return aIndex - bIndex
			}

			if (aIndex !== -1) return -1
			if (bIndex !== -1) return 1

			return 0
		})

		// apply normal sorting to non-bumped tokens
		const bumped = sorted.filter(t => bumpOrder.includes(t.coinType))
		const nonBumped = sorted.filter(t => !bumpOrder.includes(t.coinType))
		const sortedNonBumped = sortTokens(nonBumped, settings.sortBy)

		return [...bumped, ...sortedNonBumped]
	}, [data, settings, bumpOrder])

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
				hasRecentTrade={isAnimating(pool.coinType)}
				column="nearGraduation"
			/>
		))
	}, [filteredAndSortedTokens, isLoading, error, isAnimating])

	return (
		<TokenListLayout
			title="NEAR GRADUATION"
			glowColor="pink"
			headerAction={
				<div className="flex items-center gap-2">
					<FlashBuyInput column="nearGraduation" />
					<TokenListFilters
						columnId="graduating"
						onSettingsChange={setSettings}
						defaultSort="bondingProgress"
						defaultTab="about-to-bond"
					/>
				</div>
			}
		>
			{renderContent()}
		</TokenListLayout>
	)
})