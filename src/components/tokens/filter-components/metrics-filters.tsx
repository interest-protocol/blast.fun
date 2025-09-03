import React from 'react'
import { Input } from '@/components/ui/input'

interface MetricsFiltersProps {
  liquidityMin?: number
  liquidityMax?: number
  setLiquidityMin: (min: number | undefined) => void
  setLiquidityMax: (max: number | undefined) => void
  volumeMin?: number
  volumeMax?: number
  setVolumeMin: (min: number | undefined) => void
  setVolumeMax: (max: number | undefined) => void
  marketCapMin?: number
  marketCapMax?: number
  setMarketCapMin: (min: number | undefined) => void
  setMarketCapMax: (max: number | undefined) => void
  tradeCountMin?: number
  tradeCountMax?: number
  setTradeCountMin: (min: number | undefined) => void
  setTradeCountMax: (max: number | undefined) => void
}

export function MetricsFilters(props: MetricsFiltersProps) {
  const {
    liquidityMin,
    liquidityMax,
    setLiquidityMin,
    setLiquidityMax,
    volumeMin,
    volumeMax,
    setVolumeMin,
    setVolumeMax,
    marketCapMin,
    marketCapMax,
    setMarketCapMin,
    setMarketCapMax,
    tradeCountMin,
    tradeCountMax,
    setTradeCountMin,
    setTradeCountMax
  } = props

  return (
    <div className="w-full flex flex-col items-start justify-start gap-4 -mt-3">
      <div className="w-full flex flex-col items-start justify-start gap-1.5">
        <p className="text-xs text-muted-foreground">Market Cap</p>
        <div className="w-full flex justify-center items-center gap-2">
          <Input
            type="number"
            value={marketCapMin || ''}
            placeholder="Min"
            onChange={(e) => setMarketCapMin(e.target.value ? Number(e.target.value) : undefined)}
            className="bg-accent focus:bg-accent-hover"
          />
          <Input
            type="number"
            value={marketCapMax || ''}
            placeholder="Max"
            onChange={(e) => setMarketCapMax(e.target.value ? Number(e.target.value) : undefined)}
            className="bg-accent focus:bg-accent-hover"
          />
        </div>
      </div>

      <div className="w-full flex flex-col items-start justify-start gap-1.5">
        <p className="text-xs text-muted-foreground">24h Volume</p>
        <div className="w-full flex justify-center items-center gap-2">
          <Input
            type="number"
            value={volumeMin || ''}
            placeholder="Min"
            onChange={(e) => setVolumeMin(e.target.value ? Number(e.target.value) : undefined)}
            className="bg-accent focus:bg-accent-hover"
          />
          <Input
            type="number"
            value={volumeMax || ''}
            placeholder="Max"
            onChange={(e) => setVolumeMax(e.target.value ? Number(e.target.value) : undefined)}
            className="bg-accent focus:bg-accent-hover"
          />
        </div>
      </div>

      <div className="w-full flex flex-col items-start justify-start gap-1.5">
        <p className="text-xs text-muted-foreground">Liquidity</p>
        <div className="w-full flex justify-center items-center gap-2">
          <Input
            type="number"
            value={liquidityMin || ''}
            placeholder="Min"
            onChange={(e) => setLiquidityMin(e.target.value ? Number(e.target.value) : undefined)}
            className="bg-accent focus:bg-accent-hover"
          />
          <Input
            type="number"
            value={liquidityMax || ''}
            placeholder="Max"
            onChange={(e) => setLiquidityMax(e.target.value ? Number(e.target.value) : undefined)}
            className="bg-accent focus:bg-accent-hover"
          />
        </div>
      </div>

      <div className="w-full flex flex-col items-start justify-start gap-1.5">
        <p className="text-xs text-muted-foreground">Trade Count</p>
        <div className="w-full flex justify-center items-center gap-2">
          <Input
            type="number"
            value={tradeCountMin || ''}
            placeholder="Min"
            onChange={(e) => setTradeCountMin(e.target.value ? Number(e.target.value) : undefined)}
            className="bg-accent focus:bg-accent-hover"
          />
          <Input
            type="number"
            value={tradeCountMax || ''}
            placeholder="Max"
            onChange={(e) => setTradeCountMax(e.target.value ? Number(e.target.value) : undefined)}
            className="bg-accent focus:bg-accent-hover"
          />
        </div>
      </div>
    </div>
  )
}