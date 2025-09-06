"use client"

import { Activity, ChartCandlestick, DollarSign, Home, Users } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { NexaChart } from "@/components/shared/nexa-chart"
import type { Token } from "@/types/token"
import { cn } from "@/utils"
import { useHoldersData } from "../_hooks/use-holders-data"
import { HolderDetails } from "./holder-details"
import { HoldersTab } from "./tabs/holders-tab"
import { TradesTab } from "./tabs/trades-tab"
import { TokenInfo } from "./token-info"
import { TradeTerminal } from "./trade-terminal"

interface MobileTab {
	id: string
	label: string
	icon: React.ComponentType<{ className?: string }>
	action?: () => void
}

export default function MobileTokenView({
	pool,
	referral,
	realtimePrice,
	realtimeMarketCap,
}: {
	pool: Token
	referral?: string
	realtimePrice?: number | null
	realtimeMarketCap?: number | null
}) {
	const [activeTab, setActiveTab] = useState("chart")
	const [activitySubTab, setActivitySubTab] = useState<"trades" | "holders" | "projects">("trades")
	const router = useRouter()
	const { hasProjects } = useHoldersData(pool.coinType)

	const mobileTabs: MobileTab[] = [
		{ id: "home", label: "Home", icon: Home, action: () => router.push("/") },
		{ id: "chart", label: "Chart", icon: ChartCandlestick },
		{ id: "trade", label: "Trade", icon: DollarSign },
		{ id: "activity", label: "Activity", icon: Activity },
	]

	const handleTabClick = (tab: MobileTab) => {
		if (tab.action) {
			tab.action()
		} else {
			setActiveTab(tab.id)
		}
	}

	return (
		<div className="flex h-full flex-col lg:hidden">
			{/* Show HolderDetails for non-trade tabs */}
			{activeTab !== "trade" && <HolderDetails pool={pool} />}

			<div className="flex-1 overflow-hidden">
				{activeTab === "chart" && <NexaChart pool={pool} className="h-full w-full" />}

				{activeTab === "trade" && (
					<div className="h-full overflow-y-auto">
						<div className="border-border border-b">
							<TokenInfo
								pool={pool}
								realtimePrice={realtimePrice || null}
								realtimeMarketCap={realtimeMarketCap || null}
							/>
						</div>
						<TradeTerminal pool={pool} referral={referral} />
					</div>
				)}

				{activeTab === "activity" && (
					<div className="relative flex h-full flex-col">
						{/* @dev: Sub-tabs for Trades, Holders, and Projects (if available) */}
						<div className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur-sm">
							<div className="flex items-center gap-1 p-2">
								<button
									onClick={() => setActivitySubTab("trades")}
									className={cn(
										"flex flex-1 items-center gap-1 rounded-md px-2 py-1.5 font-mono text-[10px] uppercase tracking-wider transition-all",
										activitySubTab === "trades"
											? "border border-primary/20 bg-primary/10 text-primary"
											: "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
									)}
								>
									<Activity className="h-3 w-3" />
									<span>Trades</span>
								</button>
								<button
									onClick={() => setActivitySubTab("holders")}
									className={cn(
										"flex flex-1 items-center gap-1 rounded-md px-2 py-1.5 font-mono text-[10px] uppercase tracking-wider transition-all",
										activitySubTab === "holders"
											? "border border-primary/20 bg-primary/10 text-primary"
											: "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
									)}
								>
									<Users className="h-3 w-3" />
									<span>Holders</span>
								</button>
								{hasProjects && (
									<button
										onClick={() => setActivitySubTab("projects")}
										className={cn(
											"flex flex-1 items-center gap-1 rounded-md px-2 py-1.5 font-mono text-[10px] uppercase tracking-wider transition-all",
											activitySubTab === "projects"
												? "border border-primary/20 bg-primary/10 text-primary"
												: "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
										)}
									>
										<Users className="h-3 w-3" />
										<span>Projects</span>
									</button>
								)}
							</div>
						</div>

						{/* @dev: Content based on selected sub-tab */}
						<div className="flex-1 overflow-hidden">
							{activitySubTab === "trades" ? (
								<TradesTab pool={pool} className="h-full" />
							) : (
								<HoldersTab
									pool={pool}
									className="h-full"
									activeTab={activitySubTab === "projects" ? "projects" : "holders"}
								/>
							)}
						</div>
					</div>
				)}
			</div>

			{/* Bottom Navigation */}
			<div className="border-border/50 border-t bg-background/95 backdrop-blur-xl">
				<div className="flex h-16 items-center justify-around">
					{mobileTabs.map((tab) => {
						const Icon = tab.icon
						const isActive = activeTab === tab.id
						const isHome = tab.id === "home"

						return (
							<button
								key={tab.id}
								onClick={() => handleTabClick(tab)}
								className={cn(
									"flex min-w-0 flex-1 flex-col items-center justify-center gap-1 px-4 py-2",
									"transition-all duration-200"
								)}
							>
								<Icon
									className={cn(
										"h-5 w-5 transition-all",
										!isHome && isActive ? "scale-110 text-destructive" : "text-muted-foreground"
									)}
								/>
								<span
									className={cn(
										"font-mono text-[10px] uppercase tracking-wider",
										!isHome && isActive ? "font-semibold text-destructive" : "text-muted-foreground"
									)}
								>
									{tab.label}
								</span>
							</button>
						)
					})}
				</div>
			</div>
		</div>
	)
}
