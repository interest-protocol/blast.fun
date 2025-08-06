"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ChartCandlestick, DollarSign, Activity, Home } from "lucide-react"
import { cn } from "@/utils"
import { MobileTradeTerminal } from "./mobile-trade-terminal"
import { NexaChart } from "@/components/shared/nexa-chart"
import { TradesTab } from "./tabs/trades-tab"
import type { PoolWithMetadata } from "@/types/pool"

interface MobileTab {
	id: string
	label: string
	icon: React.ComponentType<{ className?: string }>
	action?: () => void
}

export default function MobileTokenView({ pool }: { pool: PoolWithMetadata }) {
	const [activeTab, setActiveTab] = useState("chart")
	const [isActivityLoading, setIsActivityLoading] = useState(true)
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

			if (tab.id === "activity") {
				setIsActivityLoading(true)
			}
		}
	}

	return (
		<div className="fixed inset-0 top-[calc(theme(spacing.16)+theme(spacing.12))] bottom-0 lg:hidden flex flex-col">
			<div className="flex-1 overflow-hidden">
				{activeTab === "chart" && (
					<div className="h-full relative">
						<NexaChart pool={pool} className="w-full h-full" />
					</div>
				)}

				{activeTab === "trade" && (
					<MobileTradeTerminal pool={pool} className="h-full" />
				)}

				{activeTab === "activity" && (
					<div className="h-full relative">
						{isActivityLoading && (
							<div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm z-10">
								<div className="text-center">
									<div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
									<p className="font-mono text-xs uppercase text-muted-foreground">LOADING::ACTIVITY</p>
								</div>
							</div>
						)}

						<TradesTab
							pool={pool}
							className="h-full"
							onLoad={() => setIsActivityLoading(false)}
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