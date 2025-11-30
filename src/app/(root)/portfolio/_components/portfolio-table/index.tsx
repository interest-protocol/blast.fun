"use client"

import { FC, useState } from "react"
import PortfolioTableHead from "./table-head"
import PortfolioTableBody from "./table-body"
import PortfolioTableControl from "./table-control"
import { PortfolioTableProps, SortField, SortOrder } from "../portfolio.types"

const PortfolioTable:FC<PortfolioTableProps> = ({ portfolio, hideSmallBalance, onHideSmallBalanceChange }) => {
	const [sortField, setSortField] = useState<SortField>("value")
	const [sortOrder, setSortOrder] = useState<SortOrder>("desc")

	const handleSort = (field: SortField) => {
		if (sortField === field) {
			setSortOrder(sortOrder === "asc" ? "desc" : "asc")
		} else {
			setSortField(field)
			setSortOrder("desc")
		}
	}

	const filteredBalances = hideSmallBalance
		? portfolio.balances.filter(balance => balance.value >= 1)
		: portfolio.balances

	const sortedBalances = [...filteredBalances].sort((a, b) => {
		let compareValue = 0

		switch (sortField) {
			case "name":
				compareValue = (a.coinMetadata?.symbol || "").localeCompare(b.coinMetadata?.symbol || "")
				break
			case "value":
				compareValue = a.value - b.value
				break
			case "pnl":
				compareValue = a.unrealizedPnl - b.unrealizedPnl
				break
			case "pnlPercentage":
				const aPnlPerc = a.value > 0 ? (a.unrealizedPnl / a.value) * 100 : 0
				const bPnlPerc = b.value > 0 ? (b.unrealizedPnl / b.value) * 100 : 0
				compareValue = aPnlPerc - bPnlPerc
				break
		}

		return sortOrder === "asc" ? compareValue : -compareValue
	})

	return (
		<div className="overflow-hidden border rounded-xl bg-card/50 backdrop-blur-sm">
			<div className="overflow-x-auto">
				<table className="w-full">
					<PortfolioTableHead 
						sortOrder={sortOrder} 
						sortField={sortField}
						handleSort={handleSort} 
					/>
					<PortfolioTableBody sortedBalances={sortedBalances} />
				</table>
			</div>
			<PortfolioTableControl 
				hideSmallBalance={hideSmallBalance}
				sortedBalanceSize={sortedBalances.length} 
				portfolioSize={portfolio.balances.length}
				onHideSmallBalanceChange={onHideSmallBalanceChange} 
			/>
		</div>
	)
}

export default PortfolioTable
