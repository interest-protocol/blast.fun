"use client"

import { memo, useState, useCallback, useMemo } from "react"
import { Button } from "@/components/ui/button"
import {
    useLatestTokens,
    useAboutToBondTokens,
    useBondedTokens
} from "@/hooks/use-tokens"
import type { TokenFilters, TokenListSettings, TokenSortOption } from "@/types/token"
import { cn } from "@/utils"
import TokenListFilters from "../token-list-filters"
import { sortTokens, applyDefaultSort } from "@/utils/token-sorting"
import { TabData, TabType } from "./mobile-token-list.types"
import { TABS } from "./mobile-token-list.data"
import { ErrorState } from "../_components/error-state"
import { LoadingState } from "../_components/loading-state"
import { EmptyState } from "../_components/empty-state"
import TokenCard from "../token-card"

const TabContent = memo(function TabContent({
    tab,
    isActive,
    settings
}: {
    tab: TabData
    isActive: boolean
    settings: TokenListSettings
}) {
    // @dev: Build filter params based on settings
    const filterParams = useMemo<TokenFilters | undefined>(() => {
        if (!settings.filters) return undefined

        const params: TokenFilters = {
            ...settings.filters
        }

        return Object.keys(params).length > 0 ? params : undefined
    }, [settings.filters])

    // @dev: aall all hooks unconditionally to satisfy React rules
    const latestTokensQuery = useLatestTokens(filterParams, {
        enabled: isActive && tab.key === "new",
        refetchInterval: isActive && tab.key === "new" ? tab.pollInterval : undefined
    })

    const aboutToBondQuery = useAboutToBondTokens(filterParams, {
        enabled: isActive && tab.key === "graduating",
        refetchInterval: isActive && tab.key === "graduating" ? tab.pollInterval : undefined
    })

    const bondedTokensQuery = useBondedTokens(filterParams, {
        enabled: isActive && tab.key === "graduated",
        refetchInterval: isActive && tab.key === "graduated" ? tab.pollInterval : undefined
    })

    // @dev: select the active query result based on current tab
    const { data, isLoading, error } = tab.key === "new"
        ? latestTokensQuery
        : tab.key === "graduating"
            ? aboutToBondQuery
            : bondedTokensQuery

    const sortedTokens = useMemo(() => {
        if (!data || data.length === 0) return []

        // @dev: Use unified sorting utility
        if (settings.sortBy) {
            return sortTokens(data, settings.sortBy)
        } else {
            // @dev: Apply default sorting based on tab type
            return applyDefaultSort(data, tab.key)
        }
    }, [data, settings.sortBy, tab.key])

    if (!isActive) return null


    if (error) return <ErrorState message="ERROR::LOADING::TOKENS" />;


    if (isLoading) return <LoadingState />;


    if (sortedTokens.length === 0) return <EmptyState message="NO::TOKENS::FOUND" />;


    return (
        <div className="space-y-2">
            {sortedTokens.map((pool) => (
                <TokenCard
                    key={pool.coinType}
                    pool={pool}
                />
            ))}
        </div>
    )
})

export const MobileTokenList = memo(function MobileTokenList() {
    const [activeTab, setActiveTab] = useState<TabType>("new")
    const [settings, setSettings] = useState<TokenListSettings>({
        sortBy: "date",
        filters: {
            tabType: 'newly-created'
        }
    })

    const handleTabChange = useCallback((tab: TabType) => {
        setActiveTab(tab)
        const tabType = tab === "graduating" ? "about-to-bond" : tab === "graduated" ? "bonded" : "newly-created"
        setSettings(prev => ({
            ...prev,
            filters: {
                ...prev.filters,
                tabType
            }
        }))
    }, [])

    const getDefaultSort = useCallback((tab: TabType): TokenSortOption => {
        if (tab === "graduating") return "bondingProgress"
        if (tab === "graduated") return "marketCap"
        return "date"
    }, [])

    return (
        <div className="h-screen flex flex-col">
            {/* @dev: Tab Header */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-white/10">
                <div className="flex gap-1">
                    {TABS.map((tab) => (
                        <Button
                            key={tab.key}
                            variant="ghost"
                            size="sm"
                            onClick={() => handleTabChange(tab.key)}
                            className={cn(
                                "font-mono text-xs uppercase transition-all",
                                activeTab === tab.key
                                    ? "text-primary"
                                    : "text-muted-foreground hover:text-white"
                            )}
                        >
                            {tab.label}
                        </Button>
                    ))}
                </div>

                <TokenListFilters
                    columnId="mobile"
                    onSettingsChange={setSettings}
                    defaultSort={getDefaultSort(activeTab)}
                    defaultTab={activeTab === "graduating" ? "about-to-bond" : activeTab === "graduated" ? "bonded" : "newly-created"}
                />
            </div>

            {/* @dev: Content */}
            <div className="flex-1 overflow-y-auto pb-[12rem]">
                {TABS.map((tab) => (
                    <TabContent
                        key={tab.key}
                        tab={tab}
                        isActive={activeTab === tab.key}
                        settings={settings}
                    />
                ))}
            </div>
        </div>
    )
})