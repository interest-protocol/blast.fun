"use client"

import { memo, useState, useEffect } from "react"
import { Settings2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/utils"
import type { TokenFilters, TokenSortOption, TokenListSettings } from "@/types/token"
import { AuditFilters } from "./filter-components/audit-filters"
import { MetricsFilters } from "./filter-components/metrics-filters"

interface TokenListFiltersProps {
	columnId: string
	onSettingsChange: (settings: TokenListSettings) => void
	defaultSort?: TokenSortOption
	defaultTab?: 'newly-created' | 'about-to-bond' | 'bonded'
}

const STORAGE_KEY_PREFIX = 'token-filters-v2-'

export const TokenListFilters = memo(function TokenListFilters({
	columnId,
	onSettingsChange,
	defaultSort = 'date',
	defaultTab = 'newly-created'
}: TokenListFiltersProps) {
	const [open, setOpen] = useState(false)
	const [selectedSubMenu, setSelectedSubMenu] = useState<'audit' | 'metrics'>('audit')
	const [sortBy, setSortBy] = useState<TokenSortOption>(defaultSort)
	const [tabType, setTabType] = useState<'newly-created' | 'about-to-bond' | 'bonded'>(defaultTab)

	const [filters, setFilters] = useState<TokenFilters>({
		tabType: defaultTab,
	})

	// @dev: Load saved settings on mount
	useEffect(() => {
		const storageKey = `${STORAGE_KEY_PREFIX}${columnId}`
		const savedSettings = localStorage.getItem(storageKey)

		if (savedSettings) {
			try {
				const parsed = JSON.parse(savedSettings) as TokenListSettings
				setSortBy(parsed.sortBy)
				setFilters(parsed.filters)
				setTabType(parsed.filters.tabType || defaultTab)
				onSettingsChange(parsed)
			} catch (error) {
				console.error('Failed to parse saved settings:', error)
			}
		}
	}, [columnId])

	const handleSetBondingProgressMin = (value: number | undefined) => {
		setFilters(prev => ({ ...prev, bondingProgressMin: value }))
	}

	const handleSetBondingProgressMax = (value: number | undefined) => {
		setFilters(prev => ({ ...prev, bondingProgressMax: value }))
	}

	// @dev: Audit filter handlers
	const handleSetCreatedAtMin = (value: number | undefined) => {
		setFilters(prev => ({ ...prev, ageMin: value }))
	}

	const handleSetCreatedAtMax = (value: number | undefined) => {
		setFilters(prev => ({ ...prev, ageMax: value }))
	}

	const handleSetTop10HoldingsMin = (value: number | undefined) => {
		setFilters(prev => ({ ...prev, top10HoldingsMin: value }))
	}

	const handleSetTop10HoldingsMax = (value: number | undefined) => {
		setFilters(prev => ({ ...prev, top10HoldingsMax: value }))
	}

	const handleSetDevHoldingsMin = (value: number | undefined) => {
		setFilters(prev => ({ ...prev, devHoldingsMin: value }))
	}

	const handleSetDevHoldingsMax = (value: number | undefined) => {
		setFilters(prev => ({ ...prev, devHoldingsMax: value }))
	}

	const handleSetHoldersCountMin = (value: number | undefined) => {
		setFilters(prev => ({ ...prev, holdersCountMin: value }))
	}

	const handleSetHoldersCountMax = (value: number | undefined) => {
		setFilters(prev => ({ ...prev, holdersCountMax: value }))
	}

	// @dev: Metrics filter handlers
	const handleSetMarketCapMin = (value: number | undefined) => {
		setFilters(prev => ({ ...prev, marketCapMin: value }))
	}

	const handleSetMarketCapMax = (value: number | undefined) => {
		setFilters(prev => ({ ...prev, marketCapMax: value }))
	}

	const handleSetVolumeMin = (value: number | undefined) => {
		setFilters(prev => ({ ...prev, volumeMin: value }))
	}

	const handleSetVolumeMax = (value: number | undefined) => {
		setFilters(prev => ({ ...prev, volumeMax: value }))
	}

	const handleSetLiquidityMin = (value: number | undefined) => {
		setFilters(prev => ({ ...prev, liquidityMin: value }))
	}

	const handleSetLiquidityMax = (value: number | undefined) => {
		setFilters(prev => ({ ...prev, liquidityMax: value }))
	}

	const handleSetTradeCountMin = (value: number | undefined) => {
		setFilters(prev => ({ ...prev, tradeCountMin: value }))
	}

	const handleSetTradeCountMax = (value: number | undefined) => {
		setFilters(prev => ({ ...prev, tradeCountMax: value }))
	}

	const handleApply = () => {
		const settings: TokenListSettings = {
			sortBy,
			filters: {
				...filters,
				tabType,
			}
		}

		const storageKey = `${STORAGE_KEY_PREFIX}${columnId}`
		localStorage.setItem(storageKey, JSON.stringify(settings))

		onSettingsChange(settings)
		setOpen(false)
	}

	const handleReset = () => {
		const defaultSettings: TokenListSettings = {
			sortBy: defaultSort,
			filters: {
				tabType: defaultTab,
			}
		}

		setSortBy(defaultSort)
		setFilters(defaultSettings.filters)
		setTabType(defaultTab)
		setSelectedSubMenu('audit')

		const storageKey = `${STORAGE_KEY_PREFIX}${columnId}`
		localStorage.removeItem(storageKey)

		onSettingsChange(defaultSettings)
	}

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button
					variant="ghost"
					size="sm"
					className="h-7 w-7 p-0 hover:bg-accent transition-colors"
					aria-label="Token list filters"
				>
					<Settings2 className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[450px] p-6 rounded-xl border-2 bg-background shadow-2xl">
				<DialogHeader className="pb-4">
					<DialogTitle className="font-mono text-base uppercase tracking-wider text-foreground/80">
						Token Filters
					</DialogTitle>
				</DialogHeader>

				<div className="space-y-5">
					{/* Tab Selection */}
					<div>
						<Label className="font-mono text-xs uppercase tracking-wider text-foreground/60">
							Token Status
						</Label>
						<div className="flex bg-muted rounded-lg border p-1 mt-2">
							<button
								className={cn(
									"flex-1 py-2 px-3 rounded-md font-mono text-xs uppercase tracking-wider transition-all",
									tabType === 'newly-created'
										? "bg-background shadow-sm text-foreground"
										: "hover:text-foreground text-muted-foreground"
								)}
								onClick={() => setTabType('newly-created')}
							>
								NEW
							</button>
							<button
								className={cn(
									"flex-1 py-2 px-3 rounded-md font-mono text-xs uppercase tracking-wider transition-all",
									tabType === 'about-to-bond'
										? "bg-background shadow-sm text-foreground"
										: "hover:text-foreground text-muted-foreground"
								)}
								onClick={() => setTabType('about-to-bond')}
							>
								BONDING
							</button>
							<button
								className={cn(
									"flex-1 py-2 px-3 rounded-md font-mono text-xs uppercase tracking-wider transition-all",
									tabType === 'bonded'
										? "bg-background shadow-sm text-foreground"
										: "hover:text-foreground text-muted-foreground"
								)}
								onClick={() => setTabType('bonded')}
							>
								BONDED
							</button>
						</div>
					</div>

					{/* Sort Selection */}
					<div>
						<Label className="font-mono text-xs uppercase tracking-wider text-foreground/60">
							Sort By
						</Label>
						<div className="grid grid-cols-2 gap-1 bg-muted rounded-lg border p-1 mt-2">
							<button
								className={cn(
									"py-2 px-3 rounded-md font-mono text-xs uppercase tracking-wider transition-all",
									sortBy === 'marketCap'
										? "bg-background shadow-sm text-foreground"
										: "hover:text-foreground text-muted-foreground"
								)}
								onClick={() => setSortBy('marketCap')}
							>
								MARKET CAP
							</button>
							<button
								className={cn(
									"py-2 px-3 rounded-md font-mono text-xs uppercase tracking-wider transition-all",
									sortBy === 'volume'
										? "bg-background shadow-sm text-foreground"
										: "hover:text-foreground text-muted-foreground"
								)}
								onClick={() => setSortBy('volume')}
							>
								VOLUME
							</button>
							<button
								className={cn(
									"py-2 px-3 rounded-md font-mono text-xs uppercase tracking-wider transition-all",
									sortBy === 'holders'
										? "bg-background shadow-sm text-foreground"
										: "hover:text-foreground text-muted-foreground"
								)}
								onClick={() => setSortBy('holders')}
							>
								HOLDERS
							</button>
							<button
								className={cn(
									"py-2 px-3 rounded-md font-mono text-xs uppercase tracking-wider transition-all",
									sortBy === 'date'
										? "bg-background shadow-sm text-foreground"
										: "hover:text-foreground text-muted-foreground"
								)}
								onClick={() => setSortBy('date')}
							>
								DATE
							</button>
							<button
								className={cn(
									"py-2 px-3 rounded-md font-mono text-xs uppercase tracking-wider transition-all",
									sortBy === 'age'
										? "bg-background shadow-sm text-foreground"
										: "hover:text-foreground text-muted-foreground"
								)}
								onClick={() => setSortBy('age')}
							>
								AGE
							</button>
							<button
								className={cn(
									"py-2 px-3 rounded-md font-mono text-xs uppercase tracking-wider transition-all",
									sortBy === 'liquidity'
										? "bg-background shadow-sm text-foreground"
										: "hover:text-foreground text-muted-foreground"
								)}
								onClick={() => setSortBy('liquidity')}
							>
								LIQUIDITY
							</button>
						</div>
					</div>

					{/* Bonding Progress */}
					{tabType !== 'bonded' && (
						<div>
							<Label className="font-mono text-xs uppercase tracking-wider text-foreground/60">
								BONDING PROGRESS <span className="text-muted-foreground/40">(%)</span>
							</Label>
							<div className="flex gap-2 mt-2">
								<Input
									type="number"
									placeholder="[MIN]"
									value={filters.bondingProgressMin || ''}
									onChange={(e) => handleSetBondingProgressMin(e.target.value ? Number(e.target.value) : undefined)}
									className="font-mono focus:border-primary/50"
								/>
								<Input
									type="number"
									placeholder="[MAX]"
									value={filters.bondingProgressMax || ''}
									onChange={(e) => handleSetBondingProgressMax(e.target.value ? Number(e.target.value) : undefined)}
									className="font-mono focus:border-primary/50"
								/>
							</div>
						</div>
					)}

					{/* Filter Mode Toggle */}
					<div>
						<div className="flex bg-muted rounded-lg border p-1 mb-4">
							<button
								onClick={() => setSelectedSubMenu('audit')}
								className={cn(
									"flex-1 py-2 px-3 rounded-md font-mono text-xs uppercase tracking-wider transition-all",
									selectedSubMenu === 'audit'
										? "bg-background shadow-sm text-foreground"
										: "hover:text-foreground text-muted-foreground"
								)}
							>
								AUDIT
							</button>
							<button
								onClick={() => setSelectedSubMenu('metrics')}
								className={cn(
									"flex-1 py-2 px-3 rounded-md font-mono text-xs uppercase tracking-wider transition-all",
									selectedSubMenu === 'metrics'
										? "bg-background shadow-sm text-foreground"
										: "hover:text-foreground text-muted-foreground"
								)}
							>
								METRICS
							</button>
						</div>

						{/* Filter Views */}
						<div className="rounded-lg p-4 border-2 border-dashed">
							{selectedSubMenu === 'audit' ? (
								<AuditFilters
									createdAtMin={filters.ageMin}
									createdAtMax={filters.ageMax}
									setCreatedAtMin={handleSetCreatedAtMin}
									setCreatedAtMax={handleSetCreatedAtMax}
									top10HoldingsMin={filters.top10HoldingsMin}
									top10HoldingsMax={filters.top10HoldingsMax}
									setTop10HoldingsMin={handleSetTop10HoldingsMin}
									setTop10HoldingsMax={handleSetTop10HoldingsMax}
									devHoldingsMin={filters.devHoldingsMin}
									devHoldingsMax={filters.devHoldingsMax}
									setDevHoldingsMin={handleSetDevHoldingsMin}
									setDevHoldingsMax={handleSetDevHoldingsMax}
									holdersCountMin={filters.holdersCountMin}
									holdersCountMax={filters.holdersCountMax}
									setHoldersCountMin={handleSetHoldersCountMin}
									setHoldersCountMax={handleSetHoldersCountMax}
								/>
							) : (
								<MetricsFilters
									marketCapMin={filters.marketCapMin}
									marketCapMax={filters.marketCapMax}
									setMarketCapMin={handleSetMarketCapMin}
									setMarketCapMax={handleSetMarketCapMax}
									volumeMin={filters.volumeMin}
									volumeMax={filters.volumeMax}
									setVolumeMin={handleSetVolumeMin}
									setVolumeMax={handleSetVolumeMax}
									liquidityMin={filters.liquidityMin}
									liquidityMax={filters.liquidityMax}
									setLiquidityMin={handleSetLiquidityMin}
									setLiquidityMax={handleSetLiquidityMax}
									tradeCountMin={filters.tradeCountMin}
									tradeCountMax={filters.tradeCountMax}
									setTradeCountMin={handleSetTradeCountMin}
									setTradeCountMax={handleSetTradeCountMax}
								/>
							)}
						</div>
					</div>

					{/* Action Buttons */}
					<div className="flex gap-2 pt-2">
						<Button
							variant="outline"
							onClick={handleReset}
							className="flex-1 font-mono text-xs uppercase tracking-wider"
						>
							RESET
						</Button>
						<Button
							onClick={handleApply}
							className="flex-1 font-mono text-xs uppercase tracking-wider"
						>
							APPLY
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	)
})