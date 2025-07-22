"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PoolWithMetadata } from "@/types/pool"
import { TradesTab } from "./tabs/trades-tab"
import { PositionsTab } from "./tabs/positions-tab"
import { TopTradersTab } from "./tabs/top-traders-tab"

interface PoolTabsProps {
	pool: PoolWithMetadata
}

export function PoolTabs({ pool }: PoolTabsProps) {
	const [activeTab, setActiveTab] = useState("trades")

	return (
		<div className="border-2 bg-background/50 backdrop-blur-sm shadow-2xl rounded-xl overflow-hidden">
			<div className="p-3 sm:p-4 border-b">
				<h3 className="text-base sm:text-lg font-mono uppercase tracking-wider">MARKET::DATA</h3>
			</div>
			<Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
				<TabsList className="grid w-full grid-cols-3 bg-background/50 m-3 sm:m-4 mb-0">
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
						value="top-traders"
						className="font-mono uppercase text-[10px] sm:text-xs tracking-wider data-[state=active]:bg-primary/20 data-[state=active]:text-primary"
					>
						TOP::TRADERS
					</TabsTrigger>
				</TabsList>
				<TabsContent value="trades" className="mt-0">
					<TradesTab pool={pool} />
				</TabsContent>
				<TabsContent value="positions" className="mt-0">
					<PositionsTab pool={pool} />
				</TabsContent>
				<TabsContent value="top-traders" className="mt-0">
					<TopTradersTab pool={pool} />
				</TabsContent>
			</Tabs>
		</div>
	)
}