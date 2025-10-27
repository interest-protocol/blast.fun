"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/utils"
import { CreatorRewardsTab } from "./creator-rewards-tab"

const rewardsTabs = [
	{
		name: "Rewards",
		value: "rewards",
		component: null,
		enabled: false,
	},
	{
		name: "Leaderboard",
		value: "leaderboard",
		component: null,
		enabled: false,
	},
	{
		name: "Creator Rewards",
		value: "creator-rewards",
		component: CreatorRewardsTab,
		enabled: true,
	},
]

export function RewardsContent() {
	return (
		<Tabs defaultValue="creator-rewards" className="w-full gap-4">
			<TabsList className="bg-transparent h-auto p-0 gap-2">
				{rewardsTabs.map((tab) => (
					<TabsTrigger
						key={tab.value}
						value={tab.value}
						disabled={!tab.enabled}
						className={cn(
							"relative px-2 text-sm font-mono font-semibold uppercase rounded-lg transition-all",
							"text-muted-foreground hover:text-foreground hover:bg-accent/50 border border-transparent",
							"data-[state=active]:text-foreground data-[state=active]:bg-destructive/10 data-[state=active]:border-destructive/30 data-[state=active]:shadow-none",
							"dark:text-muted-foreground dark:hover:text-foreground dark:hover:bg-accent/50",
							"dark:data-[state=active]:text-foreground dark:data-[state=active]:bg-destructive/10 dark:data-[state=active]:border-destructive/30"
						)}
					>
						{tab.name}
					</TabsTrigger>
				))}
			</TabsList>

			{rewardsTabs.map((tab) => {
				const Component = tab.component
				if (!Component) return null

				return (
					<TabsContent key={tab.value} value={tab.value}>
						<Component />
					</TabsContent>
				)
			})}
		</Tabs>
	)
}
