"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ChartCandlestick, DollarSign, Activity, Home, Users, Lock } from "lucide-react"
import { cn } from "@/utils"
import { TradeTerminal } from "./trade-terminal"
import { NexaChart } from "@/components/shared/nexa-chart"
import { TradesTab } from "./tabs/trades-tab"
import { VestingTab } from "./tabs/vesting-tab"
import { HoldersTab } from "./tabs/holders-tab"
import { useHoldersData } from "../_hooks/use-holders-data"
import { HolderDetails } from "./holder-details"
import { TokenInfo } from "./token-info"
import type { Token } from "@/types/token"

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
	realtimeMarketCap 
}: { 
	pool: Token; 
	referral?: string;
	realtimePrice?: number | null;
	realtimeMarketCap?: number | null;
}) {
	const [activeTab, setActiveTab] = useState("chart")
	const [activitySubTab, setActivitySubTab] = useState<"trades" | "holders" | "projects" | "vesting">("trades")
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
		<div className="flex flex-col h-full lg:hidden">
			{activeTab !== "trade" && (
				<TokenInfo 
					pool={pool} 
					realtimePrice={realtimePrice || null} 
					realtimeMarketCap={realtimeMarketCap || null}
				/>
			)}

			<div className="flex-1 overflow-hidden">
				{activeTab === "chart" && (
					<NexaChart pool={pool} className="w-full h-full" />
				)}

				{activeTab === "trade" && (
					<div className="h-full overflow-y-auto">
						<TokenInfo 
							pool={pool} 
							realtimePrice={realtimePrice || null} 
							realtimeMarketCap={realtimeMarketCap || null}
						/>
						<TradeTerminal pool={pool} referral={referral} />
						<HolderDetails pool={pool} />
					</div>
				)}

				{activeTab === "activity" && (
					<div className="h-full relative flex flex-col">
						{/* @dev: Sub-tabs for Trades, Holders, Projects, and Vesting (scrollable) */}
						<div className="border-b bg-background/95 backdrop-blur-sm sticky top-0 z-10">
							<div className="flex items-center gap-1 p-2 overflow-x-auto">
								<button
									onClick={() => setActivitySubTab("trades")}
									className={cn(
										"flex items-center gap-1 px-2 py-1.5 rounded-md font-mono text-[10px] uppercase tracking-wider transition-all flex-none min-w-fit",
										activitySubTab === "trades"
											? "bg-primary/10 text-primary border border-primary/20"
											: "text-muted-foreground hover:text-foreground hover:bg-accent/50"
									)}
								>
									<Activity className="h-3 w-3" />
									<span>Trades</span>
								</button>
								<button
									onClick={() => setActivitySubTab("holders")}
									className={cn(
										"flex items-center gap-1 px-2 py-1.5 rounded-md font-mono text-[10px] uppercase tracking-wider transition-all flex-none min-w-fit",
										activitySubTab === "holders"
											? "bg-primary/10 text-primary border border-primary/20"
											: "text-muted-foreground hover:text-foreground hover:bg-accent/50"
									)}
								>
									<Users className="h-3 w-3" />
									<span>Holders</span>
								</button>
								{hasProjects && (
									<button
										onClick={() => setActivitySubTab("projects")}
										className={cn(
											"flex items-center gap-1 px-2 py-1.5 rounded-md font-mono text-[10px] uppercase tracking-wider transition-all flex-none min-w-fit",
											activitySubTab === "projects"
												? "bg-primary/10 text-primary border border-primary/20"
												: "text-muted-foreground hover:text-foreground hover:bg-accent/50"
										)}
									>
										<Users className="h-3 w-3" />
										<span>Projects</span>
									</button>
								)}
								<button
									onClick={() => setActivitySubTab("vesting")}
									className={cn(
										"flex items-center gap-1 px-2 py-1.5 rounded-md font-mono text-[10px] uppercase tracking-wider transition-all flex-none min-w-fit",
										activitySubTab === "vesting"
											? "bg-primary/10 text-primary border border-primary/20"
											: "text-muted-foreground hover:text-foreground hover:bg-accent/50"
									)}
								>
									<Lock className="h-3 w-3" />
									<span>Vesting</span>
								</button>
							</div>
						</div>

						{/* @dev: Content based on selected sub-tab */}
						<div className="flex-1 overflow-hidden">
							{activitySubTab === "trades" && (
								<TradesTab pool={pool} className="h-full" />
							)}
							{activitySubTab === "vesting" && (
								<VestingTab pool={pool} className="h-full" />
							)}
							{(activitySubTab === "holders" || activitySubTab === "projects") && (
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
			<div className="bg-background/95 backdrop-blur-xl border-t border-border/50">
				<div className="flex items-center justify-around h-16">
					{mobileTabs.map((tab) => {
						const Icon = tab.icon
						const isActive = activeTab === tab.id
						const isHome = tab.id === "home"

						return (
							<button
								key={tab.id}
								onClick={() => handleTabClick(tab)}
								className={cn(
									"flex flex-col items-center justify-center gap-1 py-2 px-4 min-w-0 flex-1",
									"transition-all duration-200"
								)}
							>
								<Icon
									className={cn(
										"h-5 w-5 transition-all",
										!isHome && isActive ? "text-destructive scale-110" : "text-muted-foreground"
									)}
								/>
								<span
									className={cn(
										"text-[10px] font-mono uppercase tracking-wider",
										!isHome && isActive ? "text-destructive font-semibold" : "text-muted-foreground"
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