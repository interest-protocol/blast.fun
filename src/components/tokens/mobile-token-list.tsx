"use client"

import { memo, useState, useCallback } from "react"
import { useQuery } from "@tanstack/react-query"
import { TokenCard } from "./token-card"
import { TokenCardSkeleton } from "./token-card.skeleton"
import { Logo } from "@/components/ui/logo"
import { Button } from "@/components/ui/button"
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
		pageSize: 30,
		pollInterval: 30000
	}
]

async function fetchTokensByCategory(category: TabType, sortField: string, sortDirection: string, pageSize: number) {
	const response = await fetch(
		`/api/tokens?category=${category}&sortField=${sortField}&sortDirection=${sortDirection}&pageSize=${pageSize}`
	)
	if (!response.ok) throw new Error("Failed to fetch tokens")
	return response.json()
}

const TabContent = memo(function TabContent({
	tab,
	isActive
}: {
	tab: TabData
	isActive: boolean
}) {
	const { data, isLoading, error } = useQuery({
		queryKey: ["tokens-mobile", tab.key],
		queryFn: () => fetchTokensByCategory(tab.key, tab.sortField, tab.sortDirection, tab.pageSize),
		refetchInterval: isActive ? tab.pollInterval : false,
		staleTime: 5000,
		enabled: isActive
	})

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
			<div className="flex-1 overflow-y-auto">
				<div className="space-y-1 p-2">
					{[...Array(8)].map((_, i) => (
						<TokenCardSkeleton key={i} />
					))}
				</div>
			</div>
		)
	}

	if (!data?.pools || data.pools.length === 0) {
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
		<div className="flex-1 overflow-y-auto">
			<div className="space-y-1 p-2">
				{data.pools.map((pool: PoolWithMetadata) => (
					<TokenCard key={pool.poolId} pool={pool} />
				))}
			</div>
		</div>
	)
})

export const MobileTokenList = memo(function MobileTokenList() {
	const [activeTab, setActiveTab] = useState<TabType>("new")

	return (
		<div className="h-full flex flex-col">
			{/* Tab Header */}
			<div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
				<div className="flex p-1">
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
								onClick={() => setActiveTab(tab.key)}
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
			</div>

			{/* Tab Content */}
			{TABS.map((tab) => (
				<div key={tab.key} className={cn("flex-1", activeTab !== tab.key && "hidden")}>
					<TabContent
						tab={tab}
						isActive={activeTab === tab.key}
					/>
				</div>
			))}
		</div>
	)
})