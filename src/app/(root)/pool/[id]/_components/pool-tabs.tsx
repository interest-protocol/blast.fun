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
		<div className="border-2 bg-background/50 backdrop-blur-sm shadow-2xl rounded-xl overflow-hidden">
			<div className="p-3 sm:p-4 border-b flex items-center justify-between">
				<h3 className="text-base sm:text-lg font-mono uppercase tracking-wider flex items-center gap-2">
					<BarChart3 className="w-4 h-4 text-primary/60" />
					MARKET::DATA
				</h3>
				<Link
					href="https://nexa.xyz"
					target="_blank"
					rel="noopener noreferrer"
					className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-muted/30 hover:bg-muted/50 transition-colors"
				>
					<span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground/70 hidden sm:inline">
						Data by
					</span>
					<Image
						src={
							resolvedTheme === "dark"
								? "/logo/nexa_white.svg"
								: "/logo/nexa_black.svg"
						}
						alt="Nexa"
						width={40}
						height={10}
						className="h-2.5 w-auto opacity-60 hover:opacity-80 transition-opacity"
						priority
					/>
				</Link>
			</div>
			<Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
				<div className="p-3 sm:p-4 pb-0">
					<TabsList className="grid w-full grid-cols-4 bg-background/50">
						<TabsTrigger
							value="trades"
							className="font-mono uppercase text-[10px] sm:text-xs tracking-wider data-[state=active]:bg-primary/20 data-[state=active]:text-primary"
						>
							TRADES
						</TabsTrigger>
						<TabsTrigger
							value="positions"
							className="font-mono uppercase text-[10px] sm:text-xs tracking-wider data-[state=active]:bg-primary/20 data-[state=active]:text-primary"
						>
							POSITIONS
						</TabsTrigger>
						<TabsTrigger
							value="holders"
							className="font-mono uppercase text-[10px] sm:text-xs tracking-wider data-[state=active]:bg-primary/20 data-[state=active]:text-primary"
						>
							HOLDERS
						</TabsTrigger>
						<TabsTrigger
							value="top-traders"
							className="font-mono uppercase text-[10px] sm:text-xs tracking-wider data-[state=active]:bg-primary/20 data-[state=active]:text-primary px-2"
						>
							TOP TRADERS
						</TabsTrigger>
					</TabsList>
				</div>
				<TabsContent value="trades" className="mt-0">
					<TradesTab pool={pool} />
				</TabsContent>
				<TabsContent value="positions" className="mt-0">
					<PositionsTab pool={pool} />
				</TabsContent>
				<TabsContent value="holders" className="mt-0">
					<HoldersTab pool={pool} />
				</TabsContent>
				<TabsContent value="top-traders" className="mt-0">
					<TopTradersTab pool={pool} />
				</TabsContent>
			</Tabs>
		</div>
	)
}