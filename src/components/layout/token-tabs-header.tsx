"use client"

import { X, XCircle, ChevronLeft, ChevronRight } from "lucide-react"
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
import { useRef, useState, useEffect } from "react"

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
				"group relative h-auto rounded-xl py-1.5 px-2 min-w-[160px] max-w-[240px] font-normal flex-shrink-0",
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
	const scrollContainerRef = useRef<HTMLDivElement>(null)
	const [canScrollLeft, setCanScrollLeft] = useState(false)
	const [canScrollRight, setCanScrollRight] = useState(false)

	const checkScrollButtons = () => {
		if (scrollContainerRef.current) {
			const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current
			setCanScrollLeft(scrollLeft > 0)
			setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1)
		}
	}

	useEffect(() => {
		checkScrollButtons()
		const container = scrollContainerRef.current
		if (container) {
			container.addEventListener('scroll', checkScrollButtons)
			window.addEventListener('resize', checkScrollButtons)

			return () => {
				container.removeEventListener('scroll', checkScrollButtons)
				window.removeEventListener('resize', checkScrollButtons)
			}
		}
	}, [tabs])

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

	const scrollLeft = () => {
		if (scrollContainerRef.current) {
			const container = scrollContainerRef.current
			const tabWidth = 180 // Approximate width of a tab
			const visibleWidth = container.clientWidth
			const currentScroll = container.scrollLeft

			// calculate how many tabs fit in view
			const tabsInView = Math.floor(visibleWidth / tabWidth)
			const scrollAmount = Math.max(tabWidth, (tabsInView - 2) * tabWidth)

			// if we're close to the start, scroll all the way
			if (currentScroll <= scrollAmount) {
				container.scrollTo({
					left: 0,
					behavior: 'smooth'
				})
			} else {
				container.scrollBy({
					left: -scrollAmount,
					behavior: 'smooth'
				})
			}
		}
	}

	const scrollRight = () => {
		if (scrollContainerRef.current) {
			const container = scrollContainerRef.current
			const tabWidth = 180 // Approximate width of a tab
			const visibleWidth = container.clientWidth
			const currentScroll = container.scrollLeft
			const maxScroll = container.scrollWidth - visibleWidth

			// calculate how many tabs fit in view
			const tabsInView = Math.floor(visibleWidth / tabWidth)
			const scrollAmount = Math.max(tabWidth, (tabsInView - 2) * tabWidth)

			// if we're close to the end, scroll all the way
			if (currentScroll >= maxScroll - scrollAmount) {
				container.scrollTo({
					left: maxScroll,
					behavior: 'smooth'
				})
			} else {
				container.scrollBy({
					left: scrollAmount,
					behavior: 'smooth'
				})
			}
		}
	}

	return (
		<div className="border-b border-border bg-background/50 backdrop-blur-sm">
			<div className="flex items-center py-2 px-4 gap-1">
				{/* Left scroll button */}
				{canScrollLeft && (
					<Button
						variant="ghost"
						size="icon"
						onClick={scrollLeft}
						className="h-7 w-7 flex-shrink-0 rounded-lg"
					>
						<ChevronLeft className="h-4 w-4" />
					</Button>
				)}

				{/* Scrollable tabs container with gradient edges */}
				<div className="relative flex-1 min-w-0">
					<div
						ref={scrollContainerRef}
						className="flex items-center gap-1 overflow-x-auto no-scrollbar scroll-smooth"
						style={{
							scrollbarWidth: 'none',
							msOverflowStyle: 'none',
							WebkitOverflowScrolling: 'touch'
						}}
					>
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

					{/* Gradient edges for smooth transition */}
					{canScrollLeft && (
						<div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-background via-background/70 to-transparent pointer-events-none z-10" />
					)}
					{canScrollRight && (
						<div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-background via-background/70 to-transparent pointer-events-none z-10" />
					)}
				</div>

				{/* Right scroll button */}
				{canScrollRight && (
					<Button
						variant="ghost"
						size="icon"
						onClick={scrollRight}
						className="h-7 w-7 mr-2 flex-shrink-0 rounded-lg text-muted-foreground"
					>
						<ChevronRight className="h-4 w-4" />
					</Button>
				)}

				{/* Fixed close all button */}
				{tabs.length > 1 && (
					<Button
						variant="ghost"
						size="icon"
						onClick={handleCloseAll}
						className="h-7 w-7 flex-shrink-0 rounded-lg text-muted-foreground hover:text-destructive"
					>
						<XCircle className="w-4 h-4" />
					</Button>
				)}
			</div>
		</div>
	)
}