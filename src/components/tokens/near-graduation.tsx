"use client"
import { memo, useCallback, useState, useMemo, useRef } from "react"
import { useVirtualizer } from '@tanstack/react-virtual'
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
    const parentRef = useRef<HTMLDivElement>(null)

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

    const rowVirtualizer = useVirtualizer({
        count: filteredAndSortedTokens.length,
        getScrollElement: () => parentRef.current,
        estimateSize: () => 76,
        overscan: 5,
    })

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

      
        return (
            <div
                ref={parentRef}
                className="overflow-auto"
                style={{ height: '100%', width: '100%' }}
            >
                <div
                    style={{
                        height: `${rowVirtualizer.getTotalSize()}px`,
                        width: '100%',
                        position: 'relative',
                    }}
                >
                    {rowVirtualizer.getVirtualItems().map((virtualItem) => {
                        const pool = filteredAndSortedTokens[virtualItem.index]
                        return (
                            <div
                                key={virtualItem.key}
                                data-index={virtualItem.index}
                                ref={rowVirtualizer.measureElement}
                                style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    width: '100%',
                                    transform: `translateY(${virtualItem.start}px)`,
                                }}
                            >
                                <TokenCard
                                    key={pool.coinType}
                                    pool={pool}
                                    hasRecentTrade={isAnimating(pool.coinType)}
                                    column="nearGraduation"
                                />
                            </div>
                        )
                    })}
                </div>
            </div>
        )
    }, [filteredAndSortedTokens, isLoading, error, isAnimating, rowVirtualizer])

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