"use client"

import { memo, useState, useEffect, FC } from "react";
import { Settings2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
} from "@/components/ui/dialog";
import TokenListFiltersDialog from "./_components/token-list-filters-dialog";
import type { TokenFilters, TokenSortOption, TokenListSettings } from "@/types/token";

import { TokenListFiltersProps } from "./token-list-filters.types";

const STORAGE_KEY_PREFIX = 'token-filters-v2-'

const TokenListFilters: FC<TokenListFiltersProps> = memo(function TokenListFilters({
  columnId,
  onSettingsChange,
  defaultSort = 'date',
  defaultTab = 'newly-created'
}) {
  const [open, setOpen] = useState(false)
  const [selectedSubMenu, setSelectedSubMenu] = useState<'audit' | 'metrics'>('audit')
  const [sortBy, setSortBy] = useState<TokenSortOption>(defaultSort)
  const [tabType, setTabType] = useState<'newly-created' | 'about-to-bond' | 'bonded'>(defaultTab)
  const [filters, setFilters] = useState<TokenFilters>({ tabType: defaultTab })

  // Load / apply saved settings
  useEffect(() => {
    const storageKey = `${STORAGE_KEY_PREFIX}${columnId}`
    const saved = localStorage.getItem(storageKey)

    if (saved) {
      try {
        const parsed = JSON.parse(saved) as TokenListSettings
        setSortBy(parsed.sortBy)
        setFilters(parsed.filters)
        setTabType(parsed.filters.tabType || defaultTab)
        onSettingsChange(parsed)
      } catch (err) {
        console.error('Failed to parse saved settings:', err)
      }
    } else {
      const defaults: TokenListSettings = {
        sortBy: defaultSort,
        filters: { tabType: defaultTab },
      }
      onSettingsChange(defaults)
    }
  }, [columnId, defaultSort, defaultTab, onSettingsChange])

  const handleApply = () => {
    const settings: TokenListSettings = {
      sortBy,
      filters: { ...filters, tabType },
    }
    localStorage.setItem(`${STORAGE_KEY_PREFIX}${columnId}`, JSON.stringify(settings))
    onSettingsChange(settings)
    setOpen(false)
  }

  const handleReset = () => {
    const defaults: TokenListSettings = {
      sortBy: defaultSort,
      filters: { tabType: defaultTab },
    }
    setSortBy(defaultSort)
    setFilters(defaults.filters)
    setTabType(defaultTab)
    setSelectedSubMenu('audit')
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}${columnId}`)
    onSettingsChange(defaults)
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

      <TokenListFiltersDialog
        tabType={tabType}
        setTabType={setTabType}
        sortBy={sortBy}
        setSortBy={setSortBy}
        filters={filters}
        setFilters={setFilters}
        selectedSubMenu={selectedSubMenu}
        setSelectedSubMenu={setSelectedSubMenu}
        onApply={handleApply}
        onReset={handleReset}
        defaultTab={defaultTab}
      />
    </Dialog>
  );
})

export default TokenListFilters