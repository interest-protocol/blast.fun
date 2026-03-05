"use client"

import { memo, useCallback, useState, useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { TokenCard } from "./token-card"
import { TokenListLayout } from "./token-list.layout"
import { TokenCardSkeleton } from "./token-card.skeleton"
import { Logo } from "@/components/ui/logo"
import { TokenListFilters } from "./token-list.filters"
import { FlashBuyInput } from "./flash-buy-input"
import { MaintenanceSection } from "@/components/shared/maintenance-section"
import { useTradeBump } from "@/hooks/use-trade-bump"
import type { TokenListSettings } from "@/types/token"
import type { NoodlesCoinList } from "@/lib/noodles/client"
import { sortTokens } from "@/utils/token-sorting"

interface NearGraduationProps {
    pollInterval?: number
}

const NEAR_GRADUATION_THRESHOLD = 30

async function fetchNearGraduationCoins(filters?: TokenListSettings["filters"]): Promise<NoodlesCoinList[]> {
    const params = new URLSearchParams({
        isGraduated: "false",
        orderDirection: "desc",
        orderBy: "bonding_curve_progress",
        protocol:"blast-fun-bonding-curve",
        bondingCurveProgressMin: String(NEAR_GRADUATION_THRESHOLD),
    })

    if (filters?.hasTwitter) params.set("hasX", "true")
    if (filters?.hasWebsite) params.set("hasWebsite", "true")
    if (filters?.hasTelegram) params.set("hasTelegram", "true")

    const res = await fetch(`/api/coin/list?${params.toString()}`)
    if (!res.ok) throw new Error("Failed to fetch near graduation coins")

    const json = await res.json()
    return json.coins ?? []
}

export const NearGraduation = memo(function NearGraduation({
    pollInterval = 10000
}: NearGraduationProps) {
    const [settings, setSettings] = useState<TokenListSettings>({
        sortBy: "bondingProgress",
        filters: {
            tabType: "about-to-bond",
        },
    })
    const { bumpOrder, isAnimating } = useTradeBump()

    const { data, isLoading, error } = useQuery({
        queryKey: ["coins", "near-graduation", settings.filters],
        queryFn: () => fetchNearGraduationCoins(settings.filters),
        refetchInterval: pollInterval,
        staleTime: 1000,
        gcTime: 5000,
    })

    const filteredAndSortedTokens = useMemo(() => {
        if (!data || data.length === 0) return []

        const sorted = [...data].sort((a, b) => {
            const aIndex = bumpOrder.indexOf(a.coinType)
            const bIndex = bumpOrder.indexOf(b.coinType)

            if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex
            if (aIndex !== -1) return -1
            if (bIndex !== -1) return 1
            return 0
        })

        const bumped = sorted.filter(t => bumpOrder.includes(t.coinType))
        const nonBumped = sorted.filter(t => !bumpOrder.includes(t.coinType))
        const sortedNonBumped = sortTokens(nonBumped, settings.sortBy)

        return [...bumped, ...sortedNonBumped]
    }, [data, settings.sortBy, bumpOrder])

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
            return [...Array(8)].map((_, i) => <TokenCardSkeleton key={i} />)
        }

        if (filteredAndSortedTokens.length === 0) {
            return <MaintenanceSection message="Near-graduation token list is temporarily unavailable." />
        }

        return filteredAndSortedTokens.map((coin) => (
            <TokenCard
                key={coin.coinType}
                pool={coin}
                hasRecentTrade={isAnimating(coin.coinType)}
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