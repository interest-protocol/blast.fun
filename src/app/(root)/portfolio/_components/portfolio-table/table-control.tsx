"use client"

import { FC } from "react"
import { Switch } from "@/components/ui/switch"
import { PortfolioTableControlProps } from "../portfolio.types"

const PortfolioTableControl:FC<PortfolioTableControlProps> = ({ sortedBalanceSize, portfolioSize, hideSmallBalance, onHideSmallBalanceChange }) => (
	<div className="flex items-center justify-between p-4 border-t-2 border-border bg-background/30">
		<div className="flex items-center gap-2">
			<Switch
				id="hide-small-balance"
				checked={hideSmallBalance}
				onCheckedChange={onHideSmallBalanceChange}
			/>
			<label
				htmlFor="hide-small-balance"
				className="font-mono text-xs uppercase tracking-wider text-muted-foreground cursor-pointer"
			>
				HIDE SMALL BALANCES [&lt; $1]
			</label>
		</div>
		<div className="font-mono text-xs uppercase tracking-wider text-muted-foreground/60">
			SHOWING {sortedBalanceSize} OF {portfolioSize} TOKENS
		</div>
	</div>
)

export default PortfolioTableControl
