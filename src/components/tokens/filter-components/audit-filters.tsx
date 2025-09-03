import React from 'react'
import { Input } from '@/components/ui/input'

interface AuditFiltersProps {
  createdAtMin?: number
  createdAtMax?: number
  setCreatedAtMin: (min: number | undefined) => void
  setCreatedAtMax: (max: number | undefined) => void
  top10HoldingsMin?: number
  top10HoldingsMax?: number
  setTop10HoldingsMin: (min: number | undefined) => void
  setTop10HoldingsMax: (max: number | undefined) => void
  devHoldingsMin?: number
  devHoldingsMax?: number
  setDevHoldingsMin: (min: number | undefined) => void
  setDevHoldingsMax: (max: number | undefined) => void
  holdersCountMin?: number
  holdersCountMax?: number
  setHoldersCountMin: (min: number | undefined) => void
  setHoldersCountMax: (max: number | undefined) => void
}

export function AuditFilters(props: AuditFiltersProps) {
  const {
    createdAtMin,
    createdAtMax,
    setCreatedAtMin,
    setCreatedAtMax,
    top10HoldingsMin,
    top10HoldingsMax,
    setTop10HoldingsMin,
    setTop10HoldingsMax,
    devHoldingsMin,
    devHoldingsMax,
    setDevHoldingsMin,
    setDevHoldingsMax,
    holdersCountMin,
    holdersCountMax,
    setHoldersCountMin,
    setHoldersCountMax
  } = props

  const handleSetCreatedAtMin = (value: number | undefined) => {
    if (!value) {
      setCreatedAtMin(undefined)
      return
    }
    // @dev: value is in mins ago. Convert it to unix timestamp in ms
    const timestamp = Date.now() - value * 60 * 1000
    setCreatedAtMin(timestamp)
  }

  const handleSetCreatedAtMax = (value: number | undefined) => {
    if (!value) {
      setCreatedAtMax(undefined)
      return
    }
    // @dev: value is in mins ago. Convert it to unix timestamp in ms
    const timestamp = Date.now() - value * 60 * 1000
    setCreatedAtMax(timestamp)
  }

  const handleSetTop10HoldingsMin = (value: number | undefined) => {
    if (!value) {
      setTop10HoldingsMin(undefined)
      return
    }
    setTop10HoldingsMin(value / 100)
  }

  const handleSetTop10HoldingsMax = (value: number | undefined) => {
    if (!value) {
      setTop10HoldingsMax(undefined)
      return
    }
    setTop10HoldingsMax(value / 100)
  }

  const handleSetDevHoldingsMin = (value: number | undefined) => {
    if (!value) {
      setDevHoldingsMin(undefined)
      return
    }
    setDevHoldingsMin(value / 100)
  }

  const handleSetDevHoldingsMax = (value: number | undefined) => {
    if (!value) {
      setDevHoldingsMax(undefined)
      return
    }
    setDevHoldingsMax(value / 100)
  }

  return (
    <div className="w-full flex flex-col items-start justify-start gap-4 -mt-3">
      <div className="w-full flex flex-col items-start justify-start gap-1.5">
        <p className="text-xs text-muted-foreground">Age (mins)</p>
        <div className="w-full flex justify-center items-center gap-2">
          <Input
            type="number"
            value={
              createdAtMin
                ? Math.round((Date.now() - createdAtMin) / (1000 * 60))
                : ''
            }
            placeholder="Min"
            onChange={(e) => handleSetCreatedAtMin(e.target.value ? Number(e.target.value) : undefined)}
            className="bg-accent focus:bg-accent-hover"
          />
          <Input
            type="number"
            value={
              createdAtMax
                ? Math.round((Date.now() - createdAtMax) / (1000 * 60))
                : ''
            }
            placeholder="Max"
            onChange={(e) => handleSetCreatedAtMax(e.target.value ? Number(e.target.value) : undefined)}
            className="bg-accent focus:bg-accent-hover"
          />
        </div>
      </div>

      <div className="w-full flex flex-col items-start justify-start gap-1.5">
        <p className="text-xs text-muted-foreground">Top 10 Holders %</p>
        <div className="w-full flex justify-center items-center gap-2">
          <Input
            type="number"
            value={top10HoldingsMin ? top10HoldingsMin * 100 : ''}
            placeholder="Min"
            onChange={(e) => handleSetTop10HoldingsMin(e.target.value ? Number(e.target.value) : undefined)}
            className="bg-accent focus:bg-accent-hover"
          />
          <Input
            type="number"
            value={top10HoldingsMax ? top10HoldingsMax * 100 : ''}
            placeholder="Max"
            onChange={(e) => handleSetTop10HoldingsMax(e.target.value ? Number(e.target.value) : undefined)}
            className="bg-accent focus:bg-accent-hover"
          />
        </div>
      </div>

      <div className="w-full flex flex-col items-start justify-start gap-1.5">
        <p className="text-xs text-muted-foreground">Dev Holding %</p>
        <div className="w-full flex justify-center items-center gap-2">
          <Input
            type="number"
            value={devHoldingsMin ? devHoldingsMin * 100 : ''}
            placeholder="Min"
            onChange={(e) => handleSetDevHoldingsMin(e.target.value ? Number(e.target.value) : undefined)}
            className="bg-accent focus:bg-accent-hover"
          />
          <Input
            type="number"
            value={devHoldingsMax ? devHoldingsMax * 100 : ''}
            placeholder="Max"
            onChange={(e) => handleSetDevHoldingsMax(e.target.value ? Number(e.target.value) : undefined)}
            className="bg-accent focus:bg-accent-hover"
          />
        </div>
      </div>

      <div className="w-full flex flex-col items-start justify-start gap-1.5">
        <p className="text-xs text-muted-foreground">Holders Count</p>
        <div className="w-full flex justify-center items-center gap-2">
          <Input
            type="number"
            value={holdersCountMin || ''}
            placeholder="Min"
            onChange={(e) => setHoldersCountMin(e.target.value ? Number(e.target.value) : undefined)}
            className="bg-accent focus:bg-accent-hover"
          />
          <Input
            type="number"
            value={holdersCountMax || ''}
            placeholder="Max"
            onChange={(e) => setHoldersCountMax(e.target.value ? Number(e.target.value) : undefined)}
            className="bg-accent focus:bg-accent-hover"
          />
        </div>
      </div>
    </div>
  )
}