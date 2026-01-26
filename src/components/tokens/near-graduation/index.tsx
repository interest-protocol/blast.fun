"use client"

import { memo, useCallback, useState, useMemo } from "react"

import { useAboutToBondTokens } from "@/hooks/use-tokens"
import { useTradeBump } from "@/hooks/use-trade-bump"
import type { TokenListSettings, TokenFilters } from "@/types/token"
import { sortTokens } from "@/utils/token-sorting"
import FlashBuyInput from "../flash-buy-input"
import TokenListLayout from "../token-list-layout"
import TokenListFilters from "../token-list-filters"
import { ErrorState } from "../_components/error-state"
import { LoadingState } from "../_components/loading-state"
import { EmptyState } from "../_components/empty-state"
import TokenCard from "../token-card"

import { NearGraduationProps } from "./near-graduation.types"

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
                if (settings.filters.hasWebsite && (!token.website || token.website === '')) return false
                if (settings.filters.hasTwitter && (!token.twitter || token.twitter === '')) return false
                if (settings.filters.hasTelegram && (!token.telegram || token.telegram === '')) return false

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

        if (error) return <ErrorState message="ERROR::LOADING::GRADUATING" />;

        if (isLoading) return <LoadingState />;

        if (filteredAndSortedTokens.length === 0 && !isLoading)
            return <EmptyState message="NO::TOKENS::GRADUATING" />;

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