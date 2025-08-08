"use client"

import { X, XCircle } from "lucide-react"
import { useRouter, usePathname } from "next/navigation"
import { useTokenTabs } from "@/stores/token-tabs"
import { cn } from "@/utils"
import { TokenAvatar } from "../tokens/token-avatar"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"

export function TokenTabsHeader() {
	const router = useRouter()
	const pathname = usePathname()
	const { tabs, activeTabId, removeTab, removeAllTabs, setActiveTab } = useTokenTabs()

	if (tabs.length === 0) {
		return null
	}

	const handleTabClick = (poolId: string) => {
		setActiveTab(poolId)
		router.push(`/meme/${poolId}`)
	}

	const handleCloseTab = (e: React.MouseEvent, poolId: string) => {
		e.stopPropagation()
		removeTab(poolId)

		if (pathname === `/meme/${poolId}`) {
			const remainingTabs = tabs.filter(t => t.poolId !== poolId)
			if (remainingTabs.length > 0) {
				const currentIndex = tabs.findIndex(t => t.poolId === poolId)
				const nextIndex = Math.min(currentIndex, remainingTabs.length - 1)
				router.push(`/meme/${remainingTabs[nextIndex].poolId}`)
			} else {
				router.push("/")
			}
		}
	}

	const handleCloseAll = () => {
		removeAllTabs()
		router.push("/")
	}

	return (
		<div className="border-b border-border bg-background/50 backdrop-blur-sm">
			<div className="flex items-center gap-2 p-2 overflow-x-auto no-scrollbar">
				<div className="flex items-center gap-1 flex-shrink-0">
					{tabs.map((tab) => {
						const isActive = tab.poolId === activeTabId || pathname === `/meme/${tab.poolId}`
						const progress = tab.bondingCurve || 0
						const isComplete = progress >= 100

						return (
							<Button
								key={tab.poolId}
								variant={isActive ? "outline" : "ghost"}
								size="sm"
								onClick={() => handleTabClick(tab.poolId)}
								className={cn(
									"group relative h-auto rounded-xl py-1.5 px-2 min-w-0 max-w-[200px] font-normal",
									isActive && "!border-destructive/50 !bg-destructive/10 hover:!bg-destructive/15"
								)}
							>
								<div className="flex items-center gap-2 min-w-0">
									<TokenAvatar
										iconUrl={tab.iconUrl || undefined}
										symbol={tab.symbol}
										name={tab.name}
										className="relative w-7 h-7 rounded-lg border-2 border-border/20 group-hover:border-primary/30 transition-all duration-300 shadow-sm"
									/>

									<div className="flex flex-col items-start min-w-0">
										<div className="flex items-center gap-1 min-w-0">
											<span className="text-xs font-medium truncate">
												{tab.symbol}
											</span>
										</div>

										<div className="relative">
											<Progress
												value={Math.min(progress, 100)}
												className={cn(
													"h-1 w-16 bg-muted/50 rounded-xl",
													"[&>div]:transition-all [&>div]:duration-500",
													isComplete
														? "[&>div]:bg-gradient-to-r [&>div]:from-yellow-400 [&>div]:to-amber-400"
														: progress >= 85
															? "[&>div]:bg-gradient-to-r [&>div]:from-green-500 [&>div]:to-emerald-500 [&>div]:animate-pulse"
															: "[&>div]:bg-gradient-to-r [&>div]:from-primary/60 [&>div]:to-primary"
												)}
											/>
											{isComplete && (
												<div className="absolute inset-0 h-1 w-16 bg-gradient-to-r from-yellow-400/40 to-amber-400/40 blur-sm animate-pulse" />
											)}
											{progress >= 85 && !isComplete && (
												<>
													<div className="absolute inset-0 h-1 w-16 bg-gradient-to-r from-green-500/30 to-emerald-500/30 blur-sm animate-pulse" />
													<div className="absolute -top-0.5 right-0 w-1 h-2 bg-green-500 rounded-full animate-ping" />
												</>
											)}
										</div>
									</div>
								</div>

								<button
									onClick={(e) => handleCloseTab(e, tab.poolId)}
									className={cn(
										"opacity-0 group-hover:opacity-100 transition-opacity duration-200",
										"hover:text-destructive p-0.5 rounded"
									)}
								>
									<X className="w-3 h-3" />
								</button>
							</Button>
						)
					})}
				</div>

				{tabs.length > 1 && (
					<Button
						variant="ghost"
						size="icon"
						onClick={handleCloseAll}
						className="text-xs text-muted-foreground"
					>
						<XCircle className="w-3.5 h-3.5" />
					</Button>
				)}
			</div>
		</div>
	)
}