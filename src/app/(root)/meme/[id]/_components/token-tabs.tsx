"use client"

import { useState } from "react"
import { useTheme } from "next-themes"
import Image from "next/image"
import Link from "next/link"
import { Activity, Users, TrendingUp, BarChart3 } from "lucide-react"
import { cn } from "@/utils"
import { PoolWithMetadata } from "@/types/pool"
import { TradesAndHoldersTab } from "./tabs/trades-and-holders-tab"
import { HoldersTab } from "./tabs/holders-tab"
import { PositionsTab } from "./tabs/positions-tab"
import { TopTradersTab } from "./tabs/top-traders-tab"

interface TokenTabsProps {
	pool: PoolWithMetadata
	marketData?: any
	className?: string
}

interface Tab {
	id: string
	label: string
	icon: React.ComponentType<{ className?: string }>
	component: React.ComponentType<{ pool: PoolWithMetadata; className?: string }>
}

const tabs: Tab[] = [
	{
		id: "trades",
		label: "Trades & Holders",
		icon: Activity,
		component: TradesAndHoldersTab
	},
	{
		id: "holders",
		label: "Holders",
		icon: Users,
		component: HoldersTab
	},
	{
		id: "positions",
		label: "Positions",
		icon: BarChart3,
		component: PositionsTab
	},
	{
		id: "top-traders",
		label: "Top Traders",
		icon: TrendingUp,
		component: TopTradersTab
	}
]

export function TokenTabs({ pool, marketData, className }: TokenTabsProps) {
	const [activeTab, setActiveTab] = useState("trades")
	const { resolvedTheme } = useTheme()
	const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component || TradesAndHoldersTab
	const holdersCount = marketData?.holdersCount

	return (
		<div className={cn("flex flex-col h-full", className)}>
			{/* Tabs Selector */}
			<div className="border-b">
				<div className="flex items-center justify-between p-2">
					<div className="flex items-center gap-1">
						{tabs.map((tab) => {
							const Icon = tab.icon
							const isActive = activeTab === tab.id

							return (
								<button
									key={tab.id}
									onClick={() => setActiveTab(tab.id)}
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
										{tab.id === "holders" && holdersCount ? ` (${holdersCount})` : ""}
									</span>
								</button>
							)
						})}
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
				{activeTab === "trades" ? (
					<TradesAndHoldersTab pool={pool} className="h-full" isVisible={true} />
				) : (
					<ActiveComponent pool={pool} className="h-full" />
				)}
			</div>
		</div>
	)
}