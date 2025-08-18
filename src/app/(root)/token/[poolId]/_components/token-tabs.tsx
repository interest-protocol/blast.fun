"use client"

import { useState } from "react"
import { useTheme } from "next-themes"
import Image from "next/image"
import Link from "next/link"
import { Activity, Crown } from "lucide-react"
import { cn } from "@/utils"
import { PoolWithMetadata } from "@/types/pool"
import { TradesAndHoldersTab } from "./tabs/trades-and-holders-tab"
import { TradesTab } from "./tabs/trades-tab"
import { TopHoldersTab } from "./tabs/top-holders-tab"

interface TokenTabsProps {
	pool: PoolWithMetadata
	className?: string
}

interface Tab {
	id: string
	label: string
	icon: React.ComponentType<{ className?: string }>
	component: React.ComponentType<{ pool: PoolWithMetadata; className?: string }>
}

// Tabs for XL screens and above (with split view)
const tabsXl: Tab[] = [
	{
		id: "trades-split",
		label: "Trades & Holders",
		icon: Activity,
		component: TradesAndHoldersTab
	},
]

// Tabs for LG screens and below (separate tabs)
const tabsLg: Tab[] = [
	{
		id: "trades",
		label: "Trades",
		icon: Activity,
		component: TradesTab
	},
	{
		id: "top-holders",
		label: "Top 10 Holders",
		icon: Crown,
		component: TopHoldersTab
	},
]

export function TokenTabs({ pool, className }: TokenTabsProps) {
	const [activeTabXl, setActiveTabXl] = useState("trades-split")
	const [activeTabLg, setActiveTabLg] = useState("trades")
	const { resolvedTheme } = useTheme()
	
	// Find the active component based on screen size
	const activeXlTab = tabsXl.find(tab => tab.id === activeTabXl)
	const activeLgTab = tabsLg.find(tab => tab.id === activeTabLg)

	return (
		<div className={cn("flex flex-col h-full", className)}>
			{/* Tabs Selector */}
			<div className="border-b">
				<div className="flex items-center justify-between p-2">
					<div className="flex items-center gap-1">
						{/* Show different tabs based on screen size */}
						{/* For XL and above */}
						<div className="hidden xl:flex items-center gap-1">
							{tabsXl.map((tab) => {
								const Icon = tab.icon
								const isActive = activeTabXl === tab.id

								return (
									<button
										key={`xl-${tab.id}`}
										onClick={() => setActiveTabXl(tab.id)}
										className={cn(
											"flex items-center gap-1.5 px-3 py-1.5 rounded-md font-mono text-xs uppercase tracking-wider transition-all",
											isActive
												? "bg-primary/10 text-primary border border-primary/20"
												: "text-muted-foreground hover:text-foreground hover:bg-accent/50"
										)}
									>
										<Icon className="h-3.5 w-3.5" />
										<span className="hidden sm:inline">
											{tab.label}
										</span>
									</button>
								)
							})}
						</div>
						
						{/* For LG and below */}
						<div className="flex xl:hidden items-center gap-1">
							{tabsLg.map((tab) => {
								const Icon = tab.icon
								const isActive = activeTabLg === tab.id

								return (
									<button
										key={`lg-${tab.id}`}
										onClick={() => setActiveTabLg(tab.id)}
										className={cn(
											"flex items-center gap-1.5 px-3 py-1.5 rounded-md font-mono text-xs uppercase tracking-wider transition-all",
											isActive
												? "bg-primary/10 text-primary border border-primary/20"
												: "text-muted-foreground hover:text-foreground hover:bg-accent/50"
										)}
									>
										<Icon className="h-3.5 w-3.5" />
										<span className="hidden sm:inline">
											{tab.label}
										</span>
									</button>
								)
							})}
						</div>
					</div>

					<Link
						href="https://nexa.xyz"
						target="_blank"
						rel="noopener noreferrer"
						className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors group pr-2"
					>
						<span className="font-mono text-[10px] font-semibold uppercase tracking-wider">
							DATA BY
						</span>
						<Image
							src="/logo/nexa.svg"
							alt="Nexa"
							width={40}
							height={10}
							className={cn(
								"h-2.5 w-auto opacity-70 group-hover:opacity-100 transition-opacity",
								resolvedTheme === "light" && "invert"
							)}
							priority
						/>
					</Link>
				</div>
			</div>

			{/* Tab Content */}
			<div className="flex-1 overflow-hidden">
				{/* XL screens and above */}
				<div className="hidden xl:block h-full">
					{activeXlTab && (
						<activeXlTab.component 
							pool={pool} 
							className="h-full" 
						/>
					)}
				</div>
				
				{/* LG screens and below */}
				<div className="xl:hidden h-full">
					{activeLgTab && (
						<activeLgTab.component 
							pool={pool} 
							className="h-full" 
						/>
					)}
				</div>
			</div>
		</div>
	)
}