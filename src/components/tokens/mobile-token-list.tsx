"use client"

import { memo, useState, useCallback, useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { TokenCard } from "./token-card"
import { TokenCardSkeleton } from "./token-card.skeleton"
import { Logo } from "@/components/ui/logo"
import { Button } from "@/components/ui/button"
import { TokenListSettingsDialog, type TokenListSettings, type SortOption } from "./token-list.settings"
import type { PoolWithMetadata } from "@/types/pool"
import { cn } from "@/utils"

type TabType = "new" | "graduating" | "graduated"

interface TabData {
	key: TabType
	label: string
	sortField: string
	sortDirection: "ASC" | "DESC"
	pageSize: number
	pollInterval: number
}

const TABS: TabData[] = [
	{
		key: "new",
		label: "NEW",
		sortField: "createdAt",
		sortDirection: "DESC",
		pageSize: 50,
		pollInterval: 10000
	},
	{
		key: "graduating",
		label: "SOON™",
		sortField: "bondingCurve",
		sortDirection: "DESC",
		pageSize: 30,
		pollInterval: 10000
	},
	{
		key: "graduated",
		label: "GRAD",
		sortField: "lastTradeAt",
		sortDirection: "DESC",
		pageSize: 50,
		pollInterval: 30000
	}
]

async function fetchTokensByCategory(
	category: TabType,
	sortField: string,
	sortDirection: string,
	pageSize: number,
	socialFilters?: TokenListSettings['socialFilters']
) {
	const params = new URLSearchParams({
		category,
		sortField,
		sortDirection,
		pageSize: pageSize.toString()
	})

	if (socialFilters) {
		if (socialFilters.requireWebsite) params.append('requireWebsite', 'true')
		if (socialFilters.requireTwitter) params.append('requireTwitter', 'true')
		if (socialFilters.requireTelegram) params.append('requireTelegram', 'true')
	}

	const response = await fetch(`/api/tokens?${params}`)
	if (!response.ok) throw new Error("Failed to fetch tokens")
	return response.json()
}

const TabContent = memo(function TabContent({
	tab,
	isActive,
	settings
}: {
	tab: TabData
	isActive: boolean
	settings: TokenListSettings
}) {
	const { data, isLoading, error } = useQuery({
		queryKey: ["tokens-mobile", tab.key, settings],
		queryFn: () => fetchTokensByCategory(
			tab.key,
			tab.sortField,
			tab.sortDirection,
			tab.pageSize,
			settings.socialFilters
		),
		refetchInterval: isActive ? tab.pollInterval : false,
		staleTime: 5000,
		enabled: isActive
	})

	const sortedPools = useMemo(() => {
		if (!data?.pools || data.pools.length === 0) return []

		const pools = [...data.pools]

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
			case "bondingCurve":
				return pools.sort((a: PoolWithMetadata, b: PoolWithMetadata) => {
					const aCurve = Number(a.bondingCurve) || 0
					const bCurve = Number(b.bondingCurve) || 0
					return bCurve - aCurve
				})
			default:
				return pools
		}
	}, [data?.pools, settings.sortBy])

	if (!isActive) return null

	if (error) {
		return (
			<div className="flex items-center justify-center h-[400px]">
				<div className="text-center space-y-3">
					<Logo className="w-10 h-10 mx-auto text-destructive" />
					<p className="text-sm text-muted-foreground">
						Failed to load tokens
					</p>
				</div>
			</div>
		)
	}

	if (isLoading) {
		return (
			<div className="h-full overflow-y-auto">
				<div className="space-y-1 p-2 pb-20">
					{[...Array(8)].map((_, i) => (
						<TokenCardSkeleton key={i} />
					))}
				</div>
			</div>
		)
	}

	if (sortedPools.length === 0) {
		return (
			<div className="flex items-center justify-center h-[400px]">
				<div className="text-center space-y-3">
					<Logo className="w-10 h-10 mx-auto text-muted-foreground" />
					<p className="text-sm text-muted-foreground">
						No tokens found
					</p>
				</div>
			</div>
		)
	}

	return (
		<div className="h-full overflow-y-auto">
			<div className="space-y-1 p-2 pb-20">
				{sortedPools.map((pool: PoolWithMetadata) => (
					<TokenCard key={pool.poolId} pool={pool} />
				))}
			</div>
		</div>
	)
})

export const MobileTokenList = memo(function MobileTokenList() {
	const [activeTab, setActiveTab] = useState<TabType>("new")
	
	// Store separate sort preferences for each tab (in memory only, no persistence)
	const [tabSortPreferences, setTabSortPreferences] = useState<Record<TabType, SortOption>>({
		new: "date",
		graduating: "bondingCurve",
		graduated: "marketCap" // Default to market cap for graduated
	})
	
	const [settings, setSettings] = useState<TokenListSettings>({
		sortBy: tabSortPreferences[activeTab], // Use the tab's default sort
		socialFilters: {
			requireWebsite: false,
			requireTwitter: false,
			requireTelegram: false,
		}
	})

	const handleSettingsChange = useCallback((newSettings: TokenListSettings) => {
		setSettings(newSettings)
		// Update the sort preference for the current tab
		setTabSortPreferences(prev => ({
			...prev,
			[activeTab]: newSettings.sortBy
		}))
	}, [activeTab])
	
	// Update settings when tab changes
	const handleTabChange = useCallback((tab: TabType) => {
		setActiveTab(tab)
		// Apply the saved sort preference for this tab
		setSettings(prev => ({
			...prev,
			sortBy: tabSortPreferences[tab]
		}))
	}, [tabSortPreferences])

	const availableSortOptions = useMemo(() => {
		const baseOptions: { value: SortOption; label: string }[] = [
			{ value: "marketCap", label: "Market Cap" },
			{ value: "date", label: "Recent" },
			{ value: "volume", label: "24h Volume" },
			{ value: "holders", label: "Holders" },
		]

		// Add bonding curve option only for graduating tab
		if (activeTab === "graduating") {
			baseOptions.push({ value: "bondingCurve", label: "Progress" })
		}

		return baseOptions
	}, [activeTab])

	return (
		<div className="h-full flex flex-col overflow-hidden">
			{/* Tab Header */}
			<div className="flex-shrink-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
				<div className="flex items-center p-1">
					<div className="flex flex-1">
						{TABS.map((tab) => {
							const isActive = activeTab === tab.key
							const baseColor =
								tab.key === "new" ? "blue" :
									tab.key === "graduating" ? "pink" :
										"yellow"

							return (
								<Button
									key={tab.key}
									variant="ghost"
									onClick={() => handleTabChange(tab.key)}
									className={cn(
										"flex-1 rounded-none font-mono text-xs tracking-wider uppercase h-10",
										"hover:bg-transparent",
										isActive && baseColor === "blue" && "text-blue-500",
										isActive && baseColor === "pink" && "text-pink-500",
										isActive && baseColor === "yellow" && "text-yellow-500",
										!isActive && "text-muted-foreground"
									)}
									style={{
										textShadow: isActive ?
											baseColor === "blue" ? "0 0 20px rgba(59, 130, 246, 0.5)" :
												baseColor === "pink" ? "0 0 20px rgba(236, 72, 153, 0.5)" :
													"0 0 20px rgba(234, 179, 8, 0.5)"
											: undefined
									}}
								>
									{tab.label}
								</Button>
							)
						})}
					</div>
					{/* Settings button for active tab */}
					<div className="px-1">
						<TokenListSettingsDialog
							columnId="mobile-tokens"
							onSettingsChange={handleSettingsChange}
							defaultSort={settings.sortBy}
							availableSortOptions={availableSortOptions}
						/>
					</div>
				</div>
			</div>

			{/* Tab Content */}
			{TABS.map((tab) => (
				<div key={tab.key} className={cn("flex-1 min-h-0 overflow-hidden", activeTab !== tab.key && "hidden")}>
					<TabContent
						tab={tab}
						isActive={activeTab === tab.key}
						settings={settings}
					/>
				</div>
			))}
		</div>
	)
})