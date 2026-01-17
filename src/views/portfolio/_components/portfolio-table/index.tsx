"use client"

import { FC, useMemo, useState } from "react"

import { Switch } from "@/components/ui/switch"
import { PortfolioTableProps, SortField, SortOrder } from "./portfolio-table.types"
import { PortfolioTableRow } from "./_components/portfolio-table-row"
import PortfolioTableHeader from "./_components/portfolio-table-header"
import { getFilteredBalances, getSortedBalances } from "./portfolio-table.utils"

const PortfolioTable: FC<PortfolioTableProps> = ({
    portfolio,
    hideSmallBalance,
    onHideSmallBalanceChange
}) => {
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

    const filteredBalances = useMemo(() => getFilteredBalances(portfolio.balances, hideSmallBalance), [portfolio, hideSmallBalance])
    const sortedBalances = useMemo(() => getSortedBalances(filteredBalances, sortField, sortOrder), [filteredBalances, sortField, sortOrder])

    return (
        <div className="overflow-hidden border rounded-xl bg-card/50 backdrop-blur-sm">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="border-b border-border bg-muted/30">
                        <tr>
                            <PortfolioTableHeader
                                title="Token"
                                field="name"
                                onSort={handleSort}
                                sortField={sortField}
                                sortOrder={sortOrder}
                                className="text-left"
                            />
                            <PortfolioTableHeader
                                field="value"
                                title="Balance"
                                onSort={handleSort}
                                sortField={sortField}
                                sortOrder={sortOrder}
                            />
                            <th className="hidden md:table-cell px-6 py-4 text-right">Avg Entry</th>
                            <th className="hidden md:table-cell px-6 py-4 text-right">Current Price</th>
                            <PortfolioTableHeader
                                title="PNL"
                                field="pnl"
                                onSort={handleSort}
                                sortField={sortField}
                                sortOrder={sortOrder}
                            />
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {sortedBalances.map((item) => <PortfolioTableRow key={item.coinType} item={item} />)}
                    </tbody>
                </table>
            </div>

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
                    SHOWING {sortedBalances.length} OF {portfolio.balances.length} TOKENS
                </div>
            </div>
        </div>
    )
}

export default PortfolioTable
