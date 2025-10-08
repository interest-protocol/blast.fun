"use client"

import { X, XCircle, ChevronLeft, ChevronRight } from "lucide-react"
import { useRouter, usePathname } from "next/navigation"
import { useTokenTabs, type TokenTab } from "@/stores/token-tabs"
import { cn } from "@/utils"
import { TokenAvatar } from "../tokens/token-avatar"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { useBreakpoint } from "@/hooks/use-breakpoint"
import { useBondingProgress } from "@/hooks/use-bonding-progress"
import { SearchToken } from "../shared/search-token"
import { useRef, useState, useEffect, useCallback, memo } from "react"

const TokenTabItem = memo(function TokenTabItem({
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
	const { updateTab } = useTokenTabs()
	
	// @dev: pass undefined to the hook to prevent fetching if we bonded.
	const isAlreadyComplete = tab.bondingCurve >= 100
	const { data: bondingData } = useBondingProgress(
		isAlreadyComplete ? undefined : tab.coinType
	)
	
	// @dev: prio bonding progress from API or just fallback to stale tab data
	const progress = bondingData?.progress ?? tab.bondingCurve ?? 0
	const isComplete = progress >= 100
	
	// @dev: update tab data when bonding occurs
	useEffect(() => {
		if (bondingData?.progress && bondingData.progress !== tab.bondingCurve) {
			updateTab(tab.poolId, { bondingCurve: bondingData.progress })
		}
	}, [bondingData?.progress, tab.poolId, tab.bondingCurve, updateTab])

	const handleClick = useCallback(() => {
		onTabClick(tab.poolId)
	}, [onTabClick, tab.poolId])

	const handleClose = useCallback((e: React.MouseEvent) => {
		e.stopPropagation()
		onCloseTab(e, tab.poolId)
	}, [onCloseTab, tab.poolId])

	return (
		<div className="relative group flex-shrink-0">
			<Button
				variant={isActive ? "outline" : "ghost"}
				size="sm"
				onClick={handleClick}
				className={cn(
					"relative h-8 rounded-md py-1 pr-8 pl-2 min-w-[120px] max-w-[180px] font-normal flex-shrink-0 justify-start",
					isActive && "!border-destructive/50 !bg-destructive/10 hover:!bg-destructive/15"
				)}
			>
				<div className="flex items-center gap-2 min-w-0 w-full justify-start">
					<TokenAvatar
						iconUrl={tab.iconUrl || undefined}
						symbol={tab.symbol}
						name={tab.name}
						className="relative w-5 h-5 rounded border border-border/20 group-hover:border-primary/30 transition-all duration-300 flex-shrink-0"
					/>

					<div className="flex flex-col items-start min-w-0 flex-1 gap-0.5">
						<span className="text-xs font-medium truncate w-full leading-tight text-left">
							{tab.symbol}
						</span>

						<div className="relative w-full">
							<Progress
								value={Math.min(progress, 100)}
								className={cn(
									"h-1 w-full bg-muted/50 rounded-full",
									"[&>div]:transition-all [&>div]:duration-500 [&>div]:rounded-full",
									isComplete
										? "[&>div]:bg-gradient-to-r [&>div]:from-yellow-400 [&>div]:to-amber-400"
										: progress >= 85
											? "[&>div]:bg-gradient-to-r [&>div]:from-green-500 [&>div]:to-emerald-500 [&>div]:animate-pulse"
											: "[&>div]:bg-gradient-to-r [&>div]:from-primary/60 [&>div]:to-primary"
								)}
							/>
						</div>
					</div>
				</div>
			</Button>
			
			<button
				onClick={handleClose}
				className={cn(
					"absolute right-1 top-1/2 -translate-y-1/2 z-10",
					"opacity-0 group-hover:opacity-100 transition-opacity duration-200",
					"hover:text-destructive p-0.5 rounded flex-shrink-0",
					"hover:bg-destructive/10"
				)}
			>
				<X className="w-3 h-3" />
			</button>
		</div>
	)
})

export const TokenTabsHeader = memo(function TokenTabsHeader() {
	const router = useRouter()
	const pathname = usePathname()
	const { isMobile } = useBreakpoint()
	const { tabs, removeTab, removeAllTabs } = useTokenTabs()
	const scrollContainerRef = useRef<HTMLDivElement>(null)
	const [canScrollLeft, setCanScrollLeft] = useState(false)
	const [canScrollRight, setCanScrollRight] = useState(false)

	const checkScrollButtons = useCallback(() => {
		if (scrollContainerRef.current) {
			const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current
			setCanScrollLeft(scrollLeft > 0)
			setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1)
		}
	}, [])

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
	}, [tabs.length, checkScrollButtons])

	const handleTabClick = useCallback((poolId: string) => {
		router.push(`/token/${poolId}`)
	}, [router])

	const handleCloseTab = useCallback((e: React.MouseEvent, poolId: string) => {
		e.stopPropagation()
		removeTab(poolId)

		if (pathname === `/token/${poolId}`) {
			const remainingTabs = tabs.filter(t => t.poolId !== poolId)
			if (remainingTabs.length > 0) {
				const currentIndex = tabs.findIndex(t => t.poolId === poolId)
				const nextIndex = Math.min(currentIndex, remainingTabs.length - 1)
				router.push(`/token/${remainingTabs[nextIndex].poolId}`)
			} else {
				router.push("/")
			}
		}
	}, [pathname, tabs, removeTab, router])

	const handleCloseAll = useCallback(() => {
		removeAllTabs()
		router.push("/")
	}, [removeAllTabs, router])

	const scrollLeft = useCallback(() => {
		if (scrollContainerRef.current) {
			const container = scrollContainerRef.current
			const tabWidth = 180
			const visibleWidth = container.clientWidth
			const currentScroll = container.scrollLeft

			const tabsInView = Math.floor(visibleWidth / tabWidth)
			const scrollAmount = Math.max(tabWidth, (tabsInView - 2) * tabWidth)

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
	}, [])

	const scrollRight = useCallback(() => {
		if (scrollContainerRef.current) {
			const container = scrollContainerRef.current
			const tabWidth = 180
			const visibleWidth = container.clientWidth
			const currentScroll = container.scrollLeft
			const maxScroll = container.scrollWidth - visibleWidth

			const tabsInView = Math.floor(visibleWidth / tabWidth)
			const scrollAmount = Math.max(tabWidth, (tabsInView - 2) * tabWidth)

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
	}, [])

	const isTabActive = useCallback((poolId: string) => {
		return pathname === `/token/${poolId}`
	}, [pathname])

	if (tabs.length === 0 || isMobile) {
		return null
	}

	return (
		<div className="border-b border-border bg-background/50 backdrop-blur-sm">
			<div className="flex items-center py-1.5 px-4 gap-2">
				<SearchToken mode="header" />

				{canScrollLeft && (
					<Button
						variant="ghost"
						size="icon"
						onClick={scrollLeft}
						className="h-6 w-6 flex-shrink-0 rounded hover:bg-muted"
					>
						<ChevronLeft className="h-3 w-3" />
					</Button>
				)}

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
								isActive={isTabActive(tab.poolId)}
								onTabClick={handleTabClick}
								onCloseTab={handleCloseTab}
							/>
						))}
					</div>

					{canScrollLeft && (
						<div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-background via-background/70 to-transparent pointer-events-none z-10" />
					)}
					{canScrollRight && (
						<div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-background via-background/70 to-transparent pointer-events-none z-10" />
					)}
				</div>

				{canScrollRight && (
					<Button
						variant="ghost"
						size="icon"
						onClick={scrollRight}
						className="h-6 w-6 flex-shrink-0 rounded text-muted-foreground hover:bg-muted"
					>
						<ChevronRight className="h-3 w-3" />
					</Button>
				)}

				{tabs.length > 1 && (
					<Button
						variant="ghost"
						size="icon"
						onClick={handleCloseAll}
						className="h-6 w-6 flex-shrink-0 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10"
					>
						<XCircle className="h-3.5 w-3.5" />
					</Button>
				)}
			</div>
		</div>
	)
})