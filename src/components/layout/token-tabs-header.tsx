"use client"

import { X, XCircle } from "lucide-react"
import { useRouter, usePathname } from "next/navigation"
import { useTokenTabs, type TokenTab } from "@/stores/token-tabs"
import { cn } from "@/utils"
import { TokenAvatar } from "../tokens/token-avatar"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { useBreakpoint } from "@/hooks/use-breakpoint"
import { useMarketData } from "@/hooks/use-market-data"
import { formatNumberWithSuffix } from "@/utils/format"
import { useQuery } from "@tanstack/react-query"
import { apolloClient } from "@/lib/apollo-client"
import { GET_POOL } from "@/graphql/pools"
import type { GetPoolResponse, GetPoolVariables } from "@/types/graphql"
import { CONFIG_KEYS } from "@interest-protocol/memez-fun-sdk"

function TokenTabItem({
	tab,
	isActive,
	onTabClick,
	onCloseTab
}: {
	tab: TokenTab
	isActive: boolean
	onTabClick: (poolId: string) => void
	onCloseTab: (e: React.MouseEvent, poolId: string) => void
}) {
	const { data: poolData } = useQuery({
		queryKey: ["pool", tab.poolId],
		queryFn: async () => {
			const { data } = await apolloClient.query<GetPoolResponse, GetPoolVariables>({
				query: GET_POOL,
				context: {
					headers: {
						"config-key": CONFIG_KEYS.mainnet.XPUMP
					}
				},
				variables: { poolId: tab.poolId },
				fetchPolicy: "network-only",
			})
			return data?.pool
		},
		refetchInterval: 10000,
		enabled: !!tab.poolId
	})

	const coinType = poolData?.coinType || tab.coinType || ""
	const { data: marketData } = useMarketData(coinType, 10000)

	const progress = poolData?.bondingCurve ? parseFloat(poolData.bondingCurve) : tab.bondingCurve || 0
	const isComplete = progress >= 100
	const marketCap = marketData?.marketCap || 0

	const metadata = marketData?.coinMetadata

	return (
		<Button
			key={tab.poolId}
			variant={isActive ? "outline" : "ghost"}
			size="sm"
			onClick={() => onTabClick(tab.poolId)}
			className={cn(
				"group relative h-auto rounded-xl py-1.5 px-2 min-w-0 max-w-[240px] font-normal",
				isActive && "!border-destructive/50 !bg-destructive/10 hover:!bg-destructive/15"
			)}
		>
			<div className="flex items-center gap-2 min-w-0">
				<TokenAvatar
					iconUrl={metadata?.iconUrl || tab.iconUrl || undefined}
					symbol={metadata?.symbol || tab.symbol}
					name={metadata?.name || tab.name}
					className="relative w-7 h-7 rounded-lg border-2 border-border/20 group-hover:border-primary/30 transition-all duration-300 shadow-sm"
				/>

				<div className="flex flex-col items-start min-w-0">
					<div className="flex items-center gap-1 min-w-0">
						<span className="text-xs font-medium truncate">
							{metadata?.symbol || tab.symbol}
						</span>
						{marketCap > 0 && (
							<span className="text-[10px] text-green-500/90 font-semibold">
								${formatNumberWithSuffix(marketCap)}
							</span>
						)}
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
				onClick={(e) => onCloseTab(e, tab.poolId)}
				className={cn(
					"opacity-0 group-hover:opacity-100 transition-opacity duration-200",
					"hover:text-destructive p-0.5 rounded"
				)}
			>
				<X className="w-3 h-3" />
			</button>
		</Button>
	)
}

export function TokenTabsHeader() {
	const router = useRouter()
	const pathname = usePathname()
	const { isMobile } = useBreakpoint();
	const { tabs, removeTab, removeAllTabs } = useTokenTabs()

	if (tabs.length === 0 || isMobile) {
		return null
	}

	const handleTabClick = (poolId: string) => {
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
					{tabs.map((tab) => (
						<TokenTabItem
							key={tab.poolId}
							tab={tab}
							isActive={pathname === `/meme/${tab.poolId}`}
							onTabClick={handleTabClick}
							onCloseTab={handleCloseTab}
						/>
					))}
				</div>

				{tabs.length > 1 && (
					<Button
						variant="ghost"
						size="icon"
						onClick={handleCloseAll}
						className="rounded-xl text-muted-foreground"
					>
						<XCircle className="w-3.5 h-3.5" />
					</Button>
				)}
			</div>
		</div>
	)
}