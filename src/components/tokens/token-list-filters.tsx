"use client"

import { memo, useState, useEffect } from "react"
import { Settings2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
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

const PLATFORMS = [
  { id: 'xpump', name: 'xPump', color: '#C55A63', logo: '/assets/images/platforms/xpump.webp' },
  { id: 'moonbags', name: 'Moonbags', color: '#5BA5BF', logo: '/assets/images/platforms/moonbags.webp' },
  { id: 'movepump', name: 'MovePump', color: '#6C8CD3', logo: '/assets/images/platforms/movepump.webp' },
]

const SORT_OPTIONS = [
  { value: 'marketCap' as TokenSortOption, label: 'Market Cap' },
  { value: 'date' as TokenSortOption, label: 'Recent' },
  { value: 'volume' as TokenSortOption, label: '24h Volume' },
  { value: 'holders' as TokenSortOption, label: 'Holders' },
  { value: 'bondingProgress' as TokenSortOption, label: 'Bonding %' },
  { value: 'age' as TokenSortOption, label: 'Age' },
  { value: 'liquidity' as TokenSortOption, label: 'Liquidity' },
  { value: 'devHoldings' as TokenSortOption, label: 'Dev Holdings' },
  { value: 'top10Holdings' as TokenSortOption, label: 'Top 10 Holdings' },
]

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
    platforms: [],
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

  const handleSelectLaunchpad = (launchpad: string) => {
    setFilters(prev => ({
      ...prev,
      platforms: prev.platforms?.includes(launchpad)
        ? prev.platforms.filter(p => p !== launchpad)
        : [...(prev.platforms || []), launchpad]
    }))
  }

  const handleSelectAllLaunchpads = () => {
    setFilters(prev => ({
      ...prev,
      platforms: prev.platforms?.length === PLATFORMS.length ? [] : PLATFORMS.map(p => p.id)
    }))
  }

  const handleSetBondingProgressMin = (value: number | undefined) => {
    setFilters(prev => ({ ...prev, bondingProgressMin: value }))
  }

  const handleSetBondingProgressMax = (value: number | undefined) => {
    setFilters(prev => ({ ...prev, bondingProgressMax: value }))
  }

  const handleSetDexPaid = (checked: boolean) => {
    setFilters(prev => ({ ...prev, dexPaid: checked ? true : undefined }))
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
        platforms: [],
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
          className="h-7 w-7 p-0 hover:bg-primary/10 transition-colors"
          aria-label="Token list filters"
        >
          <Settings2 className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] p-0 gap-0 bg-background-dark border-2">
        <DialogHeader className="p-4 pb-6 border-b border-border-muted">
          <div className="flex justify-between items-center">
            <DialogTitle className="text-md font-medium">Memezone Filters</DialogTitle>
            <button
              onClick={() => setOpen(false)}
              className="h-4 w-4 p-0 hover:opacity-70 transition-opacity cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </DialogHeader>

        <div className="p-4 space-y-6">
          {/* Tab Selection */}
          <div className="w-full">
            <div className="w-full flex justify-center items-center border border-border-muted rounded-xl p-1 relative">
              <div
                className={cn(
                  "absolute w-[calc(33.33%-4px)] h-7 z-0 bg-accent rounded-lg transition-all duration-100",
                  tabType === 'newly-created' && "left-1",
                  tabType === 'about-to-bond' && "left-[calc(33.33%+4px)]",
                  tabType === 'bonded' && "left-[calc(66.66%)]"
                )}
              />
              <button
                className="flex justify-center items-center w-full h-7 cursor-pointer z-10"
                onClick={() => setTabType('newly-created')}
              >
                <span className={cn(
                  "text-sm font-medium transition-all duration-100",
                  tabType === 'newly-created' ? "text-foreground" : "text-muted-foreground"
                )}>
                  Newly Created
                </span>
              </button>
              <button
                className="flex justify-center items-center w-full h-7 cursor-pointer z-10"
                onClick={() => setTabType('about-to-bond')}
              >
                <span className={cn(
                  "text-sm font-medium transition-all duration-100",
                  tabType === 'about-to-bond' ? "text-foreground" : "text-muted-foreground"
                )}>
                  About to Bond
                </span>
              </button>
              <button
                className="flex justify-center items-center w-full h-7 cursor-pointer z-10"
                onClick={() => setTabType('bonded')}
              >
                <span className={cn(
                  "text-sm font-medium transition-all duration-100",
                  tabType === 'bonded' ? "text-foreground" : "text-muted-foreground"
                )}>
                  Bonded
                </span>
              </button>
            </div>
          </div>

          {/* Launchpads */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <p className="text-xs text-muted-foreground">Launchpads</p>
              <button
                onClick={handleSelectAllLaunchpads}
                className="text-xs text-primary font-medium cursor-pointer hover:text-primary/80"
              >
                {filters.platforms?.length === PLATFORMS.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>
            <div className="flex gap-3">
              {PLATFORMS.map(platform => (
                <button
                  key={platform.id}
                  onClick={() => handleSelectLaunchpad(platform.id)}
                  className={cn(
                    "flex-1 py-1 px-3 rounded-full flex justify-center items-center gap-1.5 border cursor-pointer hover:bg-accent transition-all duration-100",
                    filters.platforms?.includes(platform.id) 
                      ? "opacity-100" 
                      : "opacity-55"
                  )}
                  style={{ 
                    borderColor: platform.color,
                    color: filters.platforms?.includes(platform.id) ? platform.color : undefined
                  }}
                >
                  <img 
                    src={platform.logo} 
                    alt={platform.name}
                    className="w-[18px] h-[18px]"
                  />
                  <span className="text-xs font-medium">{platform.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Bonding Progress */}
          {tabType !== 'bonded' && (
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground">Bonding Progress (%)</p>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Min"
                  value={filters.bondingProgressMin || ''}
                  onChange={(e) => handleSetBondingProgressMin(e.target.value ? Number(e.target.value) : undefined)}
                  className="bg-accent focus:bg-accent-hover"
                />
                <Input
                  type="number"
                  placeholder="Max"
                  value={filters.bondingProgressMax || ''}
                  onChange={(e) => handleSetBondingProgressMax(e.target.value ? Number(e.target.value) : undefined)}
                  className="bg-accent focus:bg-accent-hover"
                />
              </div>
            </div>
          )}

          {/* Dex Paid */}
          <div className="flex items-center gap-2">
            <Checkbox
              id="dexPaid"
              checked={filters.dexPaid || false}
              onCheckedChange={handleSetDexPaid}
              className="border-border"
            />
            <label htmlFor="dexPaid" className="text-xs text-foreground cursor-pointer">
              Dex Paid
            </label>
          </div>

          {/* View Toggle */}
          <div className="flex gap-4">
            <button
              onClick={() => setSelectedSubMenu('audit')}
              className={cn(
                "text-xs font-medium cursor-pointer",
                selectedSubMenu === 'audit' ? "text-foreground" : "text-muted-foreground"
              )}
            >
              Audit
            </button>
            <button
              onClick={() => setSelectedSubMenu('metrics')}
              className={cn(
                "text-xs font-medium cursor-pointer",
                selectedSubMenu === 'metrics' ? "text-foreground" : "text-muted-foreground"
              )}
            >
              Metrics
            </button>
          </div>

          {/* Filter Views */}
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

          {/* Sort Options */}
          <div className="space-y-3 border-t pt-4">
            <p className="text-xs text-muted-foreground">Sort By</p>
            <RadioGroup value={sortBy} onValueChange={(value) => setSortBy(value as TokenSortOption)}>
              <div className="grid grid-cols-2 gap-2">
                {SORT_OPTIONS.map((option) => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <RadioGroupItem
                      value={option.value}
                      id={option.value}
                      className="border-muted-foreground/50"
                    />
                    <Label
                      htmlFor={option.value}
                      className="text-xs cursor-pointer"
                    >
                      {option.label}
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              onClick={handleReset}
              className="flex-1 bg-dialog rounded-md h-9"
            >
              <span className="text-sm text-muted-foreground">Reset</span>
            </Button>
            <Button
              onClick={handleApply}
              className="flex-1 rounded-md h-9 bg-blue-primary-muted"
            >
              <span className="text-sm text-foreground">Apply</span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
})