"use client"

import { useState, useEffect } from "react"
import { useTheme } from "next-themes"
import Image from "next/image"
import Link from "next/link"
import { Activity, Users } from "lucide-react"
import { cn } from "@/utils"
import { PoolWithMetadata } from "@/types/pool"
import { TradesTab } from "./tabs/trades-tab"
import { HoldersTab, useHoldersData } from "./tabs/holders-tab"

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

const tabs: Tab[] = [
	{
		id: "trades",
		label: "Trades",
		icon: Activity,
		component: TradesTab
	},
	{
		id: "holders",
		label: "Holders",
		icon: Users,
		component: HoldersTab
	},
]

export function TokenTabs({ pool, className }: TokenTabsProps) {
	const [activeTab, setActiveTab] = useState("trades")
	const [holdersActiveTab, setHoldersActiveTab] = useState<"holders" | "projects">("holders")
	const { resolvedTheme } = useTheme()
	const [isSplitView, setIsSplitView] = useState(false)
	const { hasProjects } = useHoldersData(pool.coinType)

	// @dev: Check screen size for split view
	useEffect(() => {
		const checkScreenSize = () => {
			// @dev: Enable split view for 2xl (1536px) and above
			setIsSplitView(window.innerWidth >= 1536)
		}

		checkScreenSize()
		window.addEventListener("resize", checkScreenSize)
		return () => window.removeEventListener("resize", checkScreenSize)
	}, [])

	const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component || TradesTab

	// @dev: Split view for xl and 2xl screens
	if (isSplitView) {
		return (
			<div className={cn("flex h-full", className)}>
				{/* Left side - Always Trades (70% width) */}
				<div className="flex w-[70%] flex-col border-r">
					<div className="border-b">
						<div className="flex items-center justify-between p-2">
							<div className="flex items-center gap-1">
								<div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md font-mono text-xs uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
									<Activity className="h-3.5 w-3.5" />
									<span>Trades</span>
								</div>
							</div>
						</div>
					</div>
					<div className="flex-1 overflow-hidden">
						<TradesTab pool={pool} className="h-full" />
					</div>
				</div>

				{/* Right side - Holders (30% width) */}
				<div className="flex w-[30%] flex-col">
					<div className="border-b">
						<div className="flex items-center justify-between p-2">
							<div className="flex items-center gap-1">
								<button
									onClick={() => setHoldersActiveTab("holders")}
									className={cn(
										"flex items-center gap-1.5 px-3 py-1.5 rounded-md font-mono text-xs uppercase tracking-wider transition-all",
										holdersActiveTab === "holders"
											? "bg-primary/10 text-primary border border-primary/20"
											: "text-muted-foreground hover:text-foreground hover:bg-accent/50"
									)}
								>
									<Users className="h-3.5 w-3.5" />
									<span>Holders</span>
								</button>
								{hasProjects && (
									<button
										onClick={() => setHoldersActiveTab("projects")}
										className={cn(
											"flex items-center gap-1.5 px-3 py-1.5 rounded-md font-mono text-xs uppercase tracking-wider transition-all",
											holdersActiveTab === "projects"
												? "bg-primary/10 text-primary border border-primary/20"
												: "text-muted-foreground hover:text-foreground hover:bg-accent/50"
										)}
									>
										<Users className="h-3.5 w-3.5" />
										<span>Projects</span>
									</button>
								)}
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
									unoptimized={true}
								/>
							</Link>
						</div>
					</div>
					<div className="flex-1 overflow-hidden">
						<HoldersTab 
							pool={pool} 
							className="h-full" 
							activeTab={holdersActiveTab}
							onTabChange={setHoldersActiveTab}
						/>
					</div>
				</div>
			</div>
		)
	}

	// @dev: Standard tab view for smaller screens
	return (
		<div className={cn("flex flex-col h-full", className)}>
			{/* Tabs Selector */}
			<div className="border-b">
				<div className="flex items-center justify-between p-2">
					<div className="flex items-center gap-1">
						{tabs.map((tab) => {
							const Icon = tab.icon
							const isActive = activeTab === tab.id

							if (tab.id === "holders") {
								return (
									<div key={tab.id} className="flex items-center gap-1">
										<button
											onClick={() => {
												setActiveTab(tab.id)
												setHoldersActiveTab("holders")
											}}
											className={cn(
												"flex items-center gap-1.5 px-3 py-1.5 rounded-md font-mono text-xs uppercase tracking-wider transition-all",
												isActive && holdersActiveTab === "holders"
													? "bg-primary/10 text-primary border border-primary/20"
													: "text-muted-foreground hover:text-foreground hover:bg-accent/50"
											)}
										>
											<Icon className="h-3.5 w-3.5" />
											<span className="hidden sm:inline">
												{tab.label}
											</span>
										</button>
										{hasProjects && (
											<button
												onClick={() => {
													setActiveTab(tab.id)
													setHoldersActiveTab("projects")
												}}
												className={cn(
													"flex items-center gap-1.5 px-3 py-1.5 rounded-md font-mono text-xs uppercase tracking-wider transition-all",
													isActive && holdersActiveTab === "projects"
														? "bg-primary/10 text-primary border border-primary/20"
														: "text-muted-foreground hover:text-foreground hover:bg-accent/50"
												)}
											>
												<Users className="h-3.5 w-3.5" />
												<span className="hidden sm:inline">
													Projects
												</span>
											</button>
										)}
									</div>
								)
							}

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
							unoptimized={true}
						/>
					</Link>
				</div>
			</div>

			{/* Tab Content */}
			<div className="flex-1 overflow-hidden">
				{activeTab === "holders" ? (
					<HoldersTab 
						pool={pool} 
						className="h-full" 
						activeTab={holdersActiveTab}
						onTabChange={setHoldersActiveTab}
					/>
				) : (
					<ActiveComponent pool={pool} className="h-full" />
				)}
			</div>
		</div>
	)
}