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
			<div className="flex-1 flex items-center justify-center">
				<div className="text-center">
					<Logo className="w-8 h-8 mx-auto text-destructive mb-2" />
					<p className="font-mono text-xs uppercase text-destructive">
						ERROR::LOADING::TOKENS
					</p>
				</div>
			</div>
		)
	}

	if (isLoading) {
		return (
			<div className="flex-1 overflow-y-auto">
				<div className="pb-4">
					{[...Array(8)].map((_, i) => (
						<TokenCardSkeleton key={i} />
					))}
				</div>
			</div>
		)
	}

	if (!data?.pools || data.pools.length === 0) {
		return (
			<div className="flex-1 flex items-center justify-center">
				<div className="text-center">
					<Logo className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
					<p className="font-mono text-xs uppercase text-muted-foreground">
						NO::TOKENS::FOUND
					</p>
				</div>
			</div>
		)
	}

	return (
		<div className="flex-1 overflow-y-auto">
			<div className="pb-4">
				{data.pools.map((pool: PoolWithMetadata) => (
					<TokenCard key={pool.poolId} pool={pool} />
				))}
			</div>
		</div>
	)
})

export const MobileTokenList = memo(function MobileTokenList() {
	const [activeTab, setActiveTab] = useState<TabType>("new")

	const handleTabChange = useCallback((tab: TabType) => {
		setActiveTab(tab)
	}, [])

	return (
		<div className="h-full flex flex-col bg-background">
			{/* Tab Header */}
			<div className="bg-black/40 backdrop-blur-md sticky top-0 z-10 border-b border-border/30">
				<div className="relative">
					<div className="flex">
						{TABS.map((tab, index) => {
							const isActive = activeTab === tab.key
							const baseColor =
								tab.key === "new" ? "blue" :
									tab.key === "graduating" ? "pink" :
										"yellow"

							return (
								<button
									key={tab.key}
									onClick={() => handleTabChange(tab.key)}
									className={cn(
										"flex-1 relative py-3 px-4 font-mono text-xs tracking-[0.15em] uppercase transition-all duration-300",
										"hover:bg-white/5",
										isActive ? "font-bold" : "font-medium opacity-60 hover:opacity-100"
									)}
								>
									{/* Active indicator bar */}
									{isActive && (
										<div
											className={cn(
												"absolute bottom-0 left-0 right-0 h-0.5",
												baseColor === "blue" && "bg-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.8)]",
												baseColor === "pink" && "bg-pink-400 shadow-[0_0_10px_rgba(236,72,153,0.8)]",
												baseColor === "yellow" && "bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.8)]"
											)}
										/>
									)}

									{/* Label with conditional glow */}
									<span className={cn(
										"relative z-10 transition-all duration-300",
										isActive && baseColor === "blue" && "text-blue-400 drop-shadow-[0_0_8px_rgba(59,130,246,0.6)]",
										isActive && baseColor === "pink" && "text-pink-400 drop-shadow-[0_0_8px_rgba(236,72,153,0.6)]",
										isActive && baseColor === "yellow" && "text-yellow-500 drop-shadow-[0_0_8px_rgba(234,179,8,0.6)]",
										!isActive && "text-gray-400"
									)}>
										{tab.label}
									</span>

									{/* Subtle divider between tabs */}
									{index < TABS.length - 1 && (
										<div className="absolute right-0 top-1/4 bottom-1/4 w-px bg-border/20" />
									)}
								</button>
							)
						})}
					</div>

					{/* Animated background for active tab */}
					<div
						className={cn(
							"absolute top-0 bottom-0 transition-all duration-300 pointer-events-none",
							"bg-gradient-to-b from-white/[0.03] to-transparent"
						)}
						style={{
							left: `${(TABS.findIndex(t => t.key === activeTab) / TABS.length) * 100}%`,
							width: `${100 / TABS.length}%`
						}}
					/>
				</div>
			</div>

			{/* Tab Content */}
			{TABS.map((tab) => (
				<TabContent
					key={tab.key}
					tab={tab}
					isActive={activeTab === tab.key}
				/>
			))}
		</div>
	)
})