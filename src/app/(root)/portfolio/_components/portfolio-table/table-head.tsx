"use client"

import { FC } from "react"
import { PortfolioTableHeadProps } from "../portfolio.types"

const PortfolioTableHead:FC<PortfolioTableHeadProps> = ({ handleSort, sortField, sortOrder }) => (
	<thead className="border-b border-border bg-muted/30">
		<tr>
			<th
				className="px-3 md:px-6 py-4 text-left cursor-pointer hover:bg-muted/50 transition-colors"
				onClick={() => handleSort("name")}
			>
				<span className="font-mono text-xs uppercase text-muted-foreground inline-flex items-center gap-1">
					<span>Token</span>
					{sortField === "name" && <span>{sortOrder === "asc" ? "↑" : "↓"}</span>}
				</span>
			</th>
			<th
				className="px-3 md:px-6 py-4 text-right cursor-pointer hover:bg-muted/50 transition-colors"
				onClick={() => handleSort("value")}
			>
				<span className="font-mono text-xs uppercase text-muted-foreground inline-flex items-center justify-end gap-1">
					<span>Balance</span>
					{sortField === "value" && <span>{sortOrder === "asc" ? "↑" : "↓"}</span>}
				</span>
			</th>
			<th className="hidden md:table-cell px-6 py-4 text-right">
				<span className="font-mono text-xs uppercase text-muted-foreground">
					Avg Entry
				</span>
			</th>
			<th className="hidden md:table-cell px-6 py-4 text-right">
				<span className="font-mono text-xs uppercase text-muted-foreground">
					Current Price
				</span>
			</th>
			<th
				className="px-3 md:px-6 py-4 text-right cursor-pointer hover:bg-muted/50 transition-colors"
				onClick={() => handleSort("pnl")}
			>
				<span className="font-mono text-xs uppercase text-muted-foreground inline-flex items-center justify-end gap-1">
					<span>PNL</span>
					{sortField === "pnl" && <span>{sortOrder === "asc" ? "↑" : "↓"}</span>}
				</span>
			</th>
		</tr>
	</thead>
)

export default PortfolioTableHead
