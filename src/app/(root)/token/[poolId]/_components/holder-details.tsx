"use client"

import { useState } from "react"
import { useApp } from "@/context/app.context"
import type { PoolWithMetadata } from "@/types/pool"
import { useUserHoldings } from "@/hooks/use-user-holdings"
import { PnlDialog } from "@/components/dialogs/pnl-share.dialog"
import { formatNumberWithSuffix } from "@/utils/format"

interface HolderDetailsProps {
	pool: PoolWithMetadata
}

export function HolderDetails({ pool }: HolderDetailsProps) {
	const { address } = useApp()
	const [isOpen, setIsOpen] = useState(false)
	const { data: holdings } = useUserHoldings(pool, address)

	return (
		<>
			<div
				className="w-full flex border-b border-border justify-between items-center cursor-pointer hover:bg-accent/5 transition-colors"
				onClick={() => address && setIsOpen(true)}
			>
				<div className="w-full flex flex-col items-center justify-center py-2 border-r border-border">
					<p className="text-[10px] text-muted-foreground">Bought</p>
					<p className="text-xs text-green-400">
						${formatNumberWithSuffix(holdings?.bought || 0)}
					</p>
				</div>
				<div className="w-full flex flex-col items-center justify-center py-2 border-r border-border">
					<p className="text-[10px] text-muted-foreground">Sold</p>
					<p className="text-xs text-red-400">
						${formatNumberWithSuffix(holdings?.sold || 0)}
					</p>
				</div>
				<div className="w-full flex flex-col items-center justify-center py-2 border-r border-border">
					<p className="text-[10px] text-muted-foreground">Holding</p>
					<p className="text-xs">
						${formatNumberWithSuffix(holdings?.holding || 0)}
					</p>
				</div>
				<div className="w-full flex flex-col items-center justify-center py-2">
					<p className="text-[10px] text-muted-foreground">PnL</p>
					<p
						className={`text-xs font-medium ${!holdings || holdings.pnl === 0
							? 'text-muted-foreground'
							: holdings.pnl > 0
								? 'text-green-400'
								: 'text-red-400'
							}`}
					>
						{holdings && holdings.pnl < 0 ? '-' : holdings && holdings.pnl > 0 ? '+' : ''}$
						{formatNumberWithSuffix(Math.abs(holdings?.pnl || 0))}
					</p>
				</div>
			</div>

			{address && (
				<PnlDialog
					isOpen={isOpen}
					onOpenChange={setIsOpen}
					pool={pool}
					address={address}
				/>
			)}
		</>
	)
}