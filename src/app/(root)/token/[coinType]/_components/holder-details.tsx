"use client"

import { ChartLine } from "lucide-react"
import { useState } from "react"
import { PnlDialog } from "@/components/dialogs/pnl-share.dialog"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useApp } from "@/context/app.context"
import { useUserHoldings } from "@/hooks/use-user-holdings"
import type { Token } from "@/types/token"
import { formatNumberWithSuffix } from "@/utils/format"

interface HolderDetailsProps {
	pool: Token
}

export function HolderDetails({ pool }: HolderDetailsProps) {
	const { address } = useApp()
	const [isOpen, setIsOpen] = useState(false)
	const { data: holdings } = useUserHoldings(pool, address)

	const content = (
		<div
			className="group relative flex w-full cursor-pointer items-center justify-between border-border border-b transition-all duration-200 hover:bg-accent/10"
			onClick={() => address && setIsOpen(true)}
		>
			<div className="flex w-full flex-col items-center justify-center border-border border-r py-2">
				<p className="text-[10px] text-muted-foreground">Bought</p>
				<p className="text-green-400 text-xs">${formatNumberWithSuffix(holdings?.bought || 0)}</p>
			</div>
			<div className="flex w-full flex-col items-center justify-center border-border border-r py-2">
				<p className="text-[10px] text-muted-foreground">Sold</p>
				<p className="text-red-400 text-xs">${formatNumberWithSuffix(holdings?.sold || 0)}</p>
			</div>
			<div className="flex w-full flex-col items-center justify-center border-border border-r py-2">
				<p className="text-[10px] text-muted-foreground">Holding</p>
				<p className="text-xs">${formatNumberWithSuffix(holdings?.holding || 0)}</p>
			</div>
			<div className="flex w-full flex-col items-center justify-center py-2">
				<div className="flex items-center gap-1">
					<p className="text-[10px] text-muted-foreground">PnL</p>
					{address && <ChartLine className="h-2.5 w-2.5 text-muted-foreground" />}
				</div>
				<p
					className={`font-medium text-xs ${
						!holdings || holdings.pnl === 0
							? "text-muted-foreground"
							: holdings.pnl > 0
								? "text-green-400"
								: "text-red-400"
					}`}
				>
					{holdings && holdings.pnl < 0 ? "-" : holdings && holdings.pnl > 0 ? "+" : ""}$
					{formatNumberWithSuffix(Math.abs(holdings?.pnl || 0))}
				</p>
			</div>
		</div>
	)

	return (
		<>
			{address ? (
				<Tooltip delayDuration={300}>
					<TooltipTrigger asChild>{content}</TooltipTrigger>
					<TooltipContent side="top">Click to view your PnL card</TooltipContent>
				</Tooltip>
			) : (
				content
			)}

			{address && <PnlDialog isOpen={isOpen} onOpenChange={setIsOpen} pool={pool} address={address} />}
		</>
	)
}
