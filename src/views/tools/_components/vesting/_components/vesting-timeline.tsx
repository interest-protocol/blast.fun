"use client"

import { Card } from "@/components/ui/card"
import { Lock, Unlock, TrendingUp } from "lucide-react"
import { formatDuration } from "../vesting.utils"
import { format } from "date-fns"

interface VestingTimelineProps {
	lockStartDate: Date
	vestingStartDate: Date
	vestingEndDate: Date
	amount: string
	symbol?: string
	usdValue?: string | null
}

export function VestingTimeline({
	lockStartDate,
	vestingStartDate,
	vestingEndDate,
	amount,
	symbol,
	usdValue,
}: VestingTimelineProps) {
	const lockDuration = vestingStartDate.getTime() - lockStartDate.getTime()
	const vestingDuration = vestingEndDate.getTime() - vestingStartDate.getTime()
	const totalDuration = vestingEndDate.getTime() - lockStartDate.getTime()

	return (
		<Card className="p-6">
			<div className="space-y-4">
				<h3 className="text-sm font-semibold text-muted-foreground">Vesting Schedule Preview</h3>


				{/* Timeline Details */}
				<div className="grid gap-3 text-sm">
					{/* Lock Phase */}
					<div className="flex items-start gap-3">
						<Lock className="w-4 h-4 text-orange-500 mt-0.5" />
						<div className="flex-1">
							<div className="font-medium">Lock Phase</div>
							<div className="text-xs text-muted-foreground">
								{format(lockStartDate, "MMM dd, yyyy 'at' HH:mm")}
							</div>
							<div className="text-xs text-muted-foreground">
								Tokens locked: {amount} {symbol}
								{usdValue && <span> (${usdValue})</span>}
							</div>
							{lockDuration > 0 && (
								<div className="text-xs text-muted-foreground">
									Lock duration: {formatDuration(lockDuration)}
								</div>
							)}
						</div>
					</div>

					{/* Vesting Start */}
					<div className="flex items-start gap-3">
						<TrendingUp className="w-4 h-4 text-green-500 mt-0.5" />
						<div className="flex-1">
							<div className="font-medium">Linear Unlock Begins</div>
							<div className="text-xs text-muted-foreground">
								{format(vestingStartDate, "MMM dd, yyyy 'at' HH:mm")}
							</div>
							<div className="text-xs text-muted-foreground">
								Unlock duration: {formatDuration(vestingDuration)}
							</div>
							<div className="text-xs text-muted-foreground">
								Tokens unlock linearly over time
							</div>
						</div>
					</div>

					{/* Unlock End */}
					<div className="flex items-start gap-3">
						<Unlock className="w-4 h-4 text-green-600 mt-0.5" />
						<div className="flex-1">
							<div className="font-medium">Fully Unlock</div>
							<div className="text-xs text-muted-foreground">
								{format(vestingEndDate, "MMM dd, yyyy 'at' HH:mm")}
							</div>
							<div className="text-xs text-muted-foreground">
								All {amount} {symbol} available to claim
								{usdValue && <span> (${usdValue})</span>}
							</div>
						</div>
					</div>
				</div>

				{/* Summary */}
				<div className="pt-3 border-t">
					<div className="flex justify-between text-xs">
						<span className="text-muted-foreground">Total Timeline:</span>
						<span className="font-medium">
							{formatDuration(totalDuration)}
						</span>
					</div>
				</div>
			</div>
		</Card>
	)
}