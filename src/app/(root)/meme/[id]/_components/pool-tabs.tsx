"use client"

import { useState } from "react"
import { useTheme } from "next-themes"
import Image from "next/image"
import Link from "next/link"
import { BarChart3 } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PoolWithMetadata } from "@/types/pool"
import { TradesTab } from "./tabs/trades-tab"
import { HoldersTab } from "./tabs/holders-tab"
import { PositionsTab } from "./tabs/positions-tab"
import { TopTradersTab } from "./tabs/top-traders-tab"

interface PoolTabsProps {
	pool: PoolWithMetadata
}

export function PoolTabs({ pool }: PoolTabsProps) {
	const [activeTab, setActiveTab] = useState("trades")
	const { resolvedTheme } = useTheme()

	return (
		<div className="border-2 shadow-lg rounded-xl overflow-hidden">
			<div className="p-2 sm:p-3 border-b flex items-center justify-between">
				<h3 className="text-base sm:text-lg font-mono font-bold uppercase tracking-wider flex items-center gap-2">
					<BarChart3 className="w-4 h-4 text-primary/60" />
					MARKET::DATA
				</h3>
				<Link
					href="https://nexa.xyz"
					target="_blank"
					rel="noopener noreferrer"
					className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors group"
				>
					<span className="font-mono text-[10px] sm:text-xs font-semibold uppercase tracking-wider">
						DATA BY
					</span>
					<Image
						src={
							resolvedTheme === "dark"
								? "/logo/nexa_white.svg"
								: "/logo/nexa_black.svg"
						}
						alt="Nexa"
						width={48}
						height={12}
						className="h-[10px] sm:h-3 w-auto opacity-70 group-hover:opacity-100 transition-opacity"
						priority
					/>
				</Link>
			</div>
			<Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
				<div className="p-3 sm:p-4 pb-0">
					<TabsList className="grid w-full grid-cols-2 bg-background/50">
						<TabsTrigger
							value="trades"
							className="font-mono uppercase text-[10px] sm:text-xs tracking-wider data-[state=active]:bg-primary/20 data-[state=active]:text-primary"
						>
							TRADES
						</TabsTrigger>
						<TabsTrigger
							value="holders"
							className="font-mono uppercase text-[10px] sm:text-xs tracking-wider data-[state=active]:bg-primary/20 data-[state=active]:text-primary"
						>
							HOLDERS
						</TabsTrigger>
					</TabsList>
				</div>
				<TabsContent value="trades" className="mt-0">
					<TradesTab pool={pool} />
				</TabsContent>
				<TabsContent value="holders" className="mt-0">
					<HoldersTab pool={pool} />
				</TabsContent>
			</Tabs>
		</div>
	)
}