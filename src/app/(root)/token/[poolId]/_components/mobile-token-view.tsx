"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ChartCandlestick, DollarSign, Activity, Home } from "lucide-react"
import { cn } from "@/utils"
import { TradeTerminal } from "./trade-terminal"
import { NexaChart } from "@/components/shared/nexa-chart"
import { TradesTab } from "./tabs/trades-tab"
import type { PoolWithMetadata } from "@/types/pool"

interface MobileTab {
	id: string
	label: string
	icon: React.ComponentType<{ className?: string }>
	action?: () => void
}

export default function MobileTokenView({ pool, referral }: { pool: PoolWithMetadata; referral?: string }) {
	const [activeTab, setActiveTab] = useState("chart")
	const router = useRouter()

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
			<div className="flex-1 overflow-hidden">
				{activeTab === "chart" && (
					<NexaChart pool={pool} className="w-full h-full" />
				)}

				{activeTab === "trade" && (
					<div className="h-full overflow-y-auto">
						<TradeTerminal pool={pool} referral={referral} />
					</div>
				)}

				{activeTab === "activity" && (
					<div className="h-full relative">
						<TradesTab
							pool={pool}
							className="h-full"
						/>
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