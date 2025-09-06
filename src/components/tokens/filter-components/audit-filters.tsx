import React from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

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
		// @dev: Min age X means "minimum age in minutes"
		// Show tokens that are at least X minutes old: createdAt <= (now - X mins)
		// This becomes the upper bound (ageMax) in the filter
		const timestamp = Date.now() - value * 60 * 1000
		setCreatedAtMax(timestamp)
	}

	const handleSetCreatedAtMax = (value: number | undefined) => {
		if (!value) {
			setCreatedAtMax(undefined)
			return
		}
		// @dev: Max age X means "maximum age in minutes" 
		// Show tokens that are at most X minutes old: createdAt >= (now - X mins)
		// This becomes the lower bound (ageMin) in the filter
		const timestamp = Date.now() - value * 60 * 1000
		setCreatedAtMin(timestamp)
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
		<div className="space-y-4">
			<div>
				<Label className="font-mono text-xs uppercase tracking-wider text-foreground/60">
					TOKEN AGE <span className="text-muted-foreground/40">(MINS)</span>
				</Label>
				<div className="flex gap-2 mt-2">
					<Input
						type="number"
						value={
							createdAtMin
								? Math.round((Date.now() - createdAtMin) / (1000 * 60))
								: ''
						}
						placeholder="[MIN]"
						onChange={(e) => handleSetCreatedAtMin(e.target.value ? Number(e.target.value) : undefined)}
						className="font-mono focus:border-primary/50"
					/>
					<Input
						type="number"
						value={
							createdAtMax
								? Math.round((Date.now() - createdAtMax) / (1000 * 60))
								: ''
						}
						placeholder="[MAX]"
						onChange={(e) => handleSetCreatedAtMax(e.target.value ? Number(e.target.value) : undefined)}
						className="font-mono focus:border-primary/50"
					/>
				</div>
			</div>

			<div>
				<Label className="font-mono text-xs uppercase tracking-wider text-foreground/60">
					TOP10 HOLDINGS <span className="text-muted-foreground/40">(%)</span>
				</Label>
				<div className="flex gap-2 mt-2">
					<Input
						type="number"
						value={top10HoldingsMin ? top10HoldingsMin * 100 : ''}
						placeholder="[MIN]"
						onChange={(e) => handleSetTop10HoldingsMin(e.target.value ? Number(e.target.value) : undefined)}
						className="font-mono focus:border-primary/50"
					/>
					<Input
						type="number"
						value={top10HoldingsMax ? top10HoldingsMax * 100 : ''}
						placeholder="[MAX]"
						onChange={(e) => handleSetTop10HoldingsMax(e.target.value ? Number(e.target.value) : undefined)}
						className="font-mono focus:border-primary/50"
					/>
				</div>
			</div>

			<div>
				<Label className="font-mono text-xs uppercase tracking-wider text-foreground/60">
					DEV HOLDINGS <span className="text-muted-foreground/40">(%)</span>
				</Label>
				<div className="flex gap-2 mt-2">
					<Input
						type="number"
						value={devHoldingsMin ? devHoldingsMin * 100 : ''}
						placeholder="[MIN]"
						onChange={(e) => handleSetDevHoldingsMin(e.target.value ? Number(e.target.value) : undefined)}
						className="font-mono focus:border-primary/50"
					/>
					<Input
						type="number"
						value={devHoldingsMax ? devHoldingsMax * 100 : ''}
						placeholder="[MAX]"
						onChange={(e) => handleSetDevHoldingsMax(e.target.value ? Number(e.target.value) : undefined)}
						className="font-mono focus:border-primary/50"
					/>
				</div>
			</div>

			<div>
				<Label className="font-mono text-xs uppercase tracking-wider text-foreground/60">
					HOLDERS COUNT
				</Label>
				<div className="flex gap-2 mt-2">
					<Input
						type="number"
						value={holdersCountMin || ''}
						placeholder="[MIN]"
						onChange={(e) => setHoldersCountMin(e.target.value ? Number(e.target.value) : undefined)}
						className="font-mono focus:border-primary/50"
					/>
					<Input
						type="number"
						value={holdersCountMax || ''}
						placeholder="[MAX]"
						onChange={(e) => setHoldersCountMax(e.target.value ? Number(e.target.value) : undefined)}
						className="font-mono focus:border-primary/50"
					/>
				</div>
			</div>
		</div>
	)
}