import React from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

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
		<div className="space-y-4">
			<div>
				<Label className="font-mono text-xs uppercase tracking-wider text-foreground/60">
					MARKET::CAP <span className="text-muted-foreground/40">($)</span>
				</Label>
				<div className="flex gap-2 mt-2">
					<Input
						type="number"
						value={marketCapMin || ''}
						placeholder="[MIN]"
						onChange={(e) => setMarketCapMin(e.target.value ? Number(e.target.value) : undefined)}
						className="font-mono focus:border-primary/50"
					/>
					<Input
						type="number"
						value={marketCapMax || ''}
						placeholder="[MAX]"
						onChange={(e) => setMarketCapMax(e.target.value ? Number(e.target.value) : undefined)}
						className="font-mono focus:border-primary/50"
					/>
				</div>
			</div>

			<div>
				<Label className="font-mono text-xs uppercase tracking-wider text-foreground/60">
					VOLUME::24H <span className="text-muted-foreground/40">($)</span>
				</Label>
				<div className="flex gap-2 mt-2">
					<Input
						type="number"
						value={volumeMin || ''}
						placeholder="[MIN]"
						onChange={(e) => setVolumeMin(e.target.value ? Number(e.target.value) : undefined)}
						className="font-mono focus:border-primary/50"
					/>
					<Input
						type="number"
						value={volumeMax || ''}
						placeholder="[MAX]"
						onChange={(e) => setVolumeMax(e.target.value ? Number(e.target.value) : undefined)}
						className="font-mono focus:border-primary/50"
					/>
				</div>
			</div>

			<div>
				<Label className="font-mono text-xs uppercase tracking-wider text-foreground/60">
					LIQUIDITY <span className="text-muted-foreground/40">($)</span>
				</Label>
				<div className="flex gap-2 mt-2">
					<Input
						type="number"
						value={liquidityMin || ''}
						placeholder="[MIN]"
						onChange={(e) => setLiquidityMin(e.target.value ? Number(e.target.value) : undefined)}
						className="font-mono focus:border-primary/50"
					/>
					<Input
						type="number"
						value={liquidityMax || ''}
						placeholder="[MAX]"
						onChange={(e) => setLiquidityMax(e.target.value ? Number(e.target.value) : undefined)}
						className="font-mono focus:border-primary/50"
					/>
				</div>
			</div>

			<div>
				<Label className="font-mono text-xs uppercase tracking-wider text-foreground/60">
					TRADE::COUNT
				</Label>
				<div className="flex gap-2 mt-2">
					<Input
						type="number"
						value={tradeCountMin || ''}
						placeholder="[MIN]"
						onChange={(e) => setTradeCountMin(e.target.value ? Number(e.target.value) : undefined)}
						className="font-mono focus:border-primary/50"
					/>
					<Input
						type="number"
						value={tradeCountMax || ''}
						placeholder="[MAX]"
						onChange={(e) => setTradeCountMax(e.target.value ? Number(e.target.value) : undefined)}
						className="font-mono focus:border-primary/50"
					/>
				</div>
			</div>
		</div>
	)
}