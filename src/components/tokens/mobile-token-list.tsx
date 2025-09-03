"use client"

import { memo, useState, useCallback, useMemo } from "react"
import { TokenCard } from "./token-card"
import { TokenCardSkeleton } from "./token-card.skeleton"
import { Logo } from "@/components/ui/logo"
import { Button } from "@/components/ui/button"
import { TokenListSettingsDialog, type TokenListSettings } from "./token-list.settings"
import { 
	useLatestTokens, 
	useAboutToBondTokens, 
	useBondedTokens
} from "@/hooks/use-tokens"
import type { TokenFilters } from "@/types/token"
import { cn } from "@/utils"

type TabType = "new" | "graduating" | "graduated"

interface TabData {
	key: TabType
	label: string
	pollInterval: number
}

const TABS: TabData[] = [
	{
		key: "new",
		label: "NEW",
		pollInterval: 10000
	},
	{
		key: "graduating",
		label: "SOON™",
		pollInterval: 10000
	},
	{
		key: "graduated",
		label: "GRAD",
		pollInterval: 30000
	}
]

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
		const params: TokenFilters = {}
		
		// @dev: Add specific filters for graduated tokens
		if (tab.key === "graduated") {
			params.dexPaid = true
		}
		
		return Object.keys(params).length > 0 ? params : undefined
	}, [tab.key])

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

		switch (settings.sortBy) {
			case "bondingCurve":
				return [...data].sort((a, b) => {
					const aBonding = a.market?.bondingProgress || 0
					const bBonding = b.market?.bondingProgress || 0
					return bBonding - aBonding
				})
			case "marketCap":
				return [...data].sort((a, b) => {
					const aMarketCap = a.market?.marketCap || 0
					const bMarketCap = b.market?.marketCap || 0
					return bMarketCap - aMarketCap
				})
			case "date":
				return [...data].sort((a, b) => {
					const aDate = new Date(a.lastTradeAt || a.createdAt || 0).getTime()
					const bDate = new Date(b.lastTradeAt || b.createdAt || 0).getTime()
					return bDate - aDate
				})
			case "volume":
				return [...data].sort((a, b) => {
					const aVolume = a.market?.volume24h || 0
					const bVolume = b.market?.volume24h || 0
					return bVolume - aVolume
				})
			case "holders":
				return [...data].sort((a, b) => {
					const aHolders = a.market?.holdersCount || 0
					const bHolders = b.market?.holdersCount || 0
					return bHolders - aHolders
				})
			default:
				if (tab.key === "new") {
					return [...data].sort((a, b) => {
						const aDate = new Date(a.createdAt || 0).getTime()
						const bDate = new Date(b.createdAt || 0).getTime()
						return bDate - aDate
					})
				} else if (tab.key === "graduating") {
					return [...data].sort((a, b) => {
						const aBonding = a.market?.bondingProgress || 0
						const bBonding = b.market?.bondingProgress || 0
						return bBonding - aBonding
					})
				} else {
					return [...data].sort((a, b) => {
						const aMarketCap = a.market?.marketCap || 0
						const bMarketCap = b.market?.marketCap || 0
						return bMarketCap - aMarketCap
					})
				}
		}
	}, [data, settings.sortBy, tab.key])

	if (!isActive) return null

	if (error) {
		return (
			<div className="p-8 text-center">
				<Logo className="w-8 h-8 mx-auto text-destructive mb-2" />
				<p className="font-mono text-xs uppercase text-destructive">
					ERROR::LOADING::TOKENS
				</p>
			</div>
		)
	}

	if (isLoading) {
		return (
			<div className="space-y-2 p-4">
				{[...Array(6)].map((_, i) => (
					<TokenCardSkeleton key={i} />
				))}
			</div>
		)
	}

	if (sortedTokens.length === 0) {
		return (
			<div className="p-8 text-center">
				<Logo className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
				<p className="font-mono text-xs uppercase text-muted-foreground">
					NO::TOKENS::FOUND
				</p>
			</div>
		)
	}

	return (
		<div className="space-y-2 p-4">
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
		socialFilters: {
			requireWebsite: false,
			requireTwitter: false,
			requireTelegram: false,
		}
	})

	const handleTabChange = useCallback((tab: TabType) => {
		setActiveTab(tab)
		const defaultSort = tab === "graduating" ? "bondingCurve" : tab === "graduated" ? "marketCap" : "date"
		setSettings(prev => ({ ...prev, sortBy: defaultSort }))
	}, [])

	const getSortOptions = useCallback((tab: TabType) => {
		const baseOptions: Array<{ value: TokenListSettings["sortBy"], label: string }> = [
			{ value: "marketCap", label: "MARKET::CAP" },
			{ value: "volume", label: "VOLUME::24H" },
			{ value: "holders", label: "HOLDER::COUNT" },
		]

		if (tab === "new") {
			return [
				{ value: "date" as const, label: "CREATION::TIME" },
				...baseOptions
			]
		} else if (tab === "graduating") {
			return [
				{ value: "bondingCurve" as const, label: "BONDING::PROGRESS" },
				{ value: "date" as const, label: "RECENT::TRADES" },
				...baseOptions
			]
		} else {
			return [
				{ value: "date" as const, label: "RECENT::TRADES" },
				...baseOptions
			]
		}
	}, [])

	return (
		<div className="h-full flex flex-col">
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
				
				<TokenListSettingsDialog
					columnId={`mobile-${activeTab}`}
					onSettingsChange={setSettings}
					defaultSort={settings.sortBy}
					availableSortOptions={getSortOptions(activeTab)}
				/>
			</div>

			{/* @dev: Content */}
			<div className="flex-1 overflow-y-auto">
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