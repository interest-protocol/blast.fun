import { PortfolioBalanceItem } from "@/types/portfolio"
import { SortField, SortOrder } from "./portfolio-table.types"

export const getFilteredBalances = (balances: PortfolioBalanceItem[], hideSmall: boolean) =>
    hideSmall ? balances.filter((b) => b.value >= 1) : balances

export const getSortedBalances = (
    balances: PortfolioBalanceItem[],
    sortField: SortField,
    sortOrder: SortOrder
) => {
    return [...balances].sort((a, b) => {
        let compare = 0
        switch (sortField) {
            case "name":
                compare = (a.coinMetadata?.symbol || "").localeCompare(b.coinMetadata?.symbol || "")
                break
            case "value":
                compare = a.value - b.value
                break
            case "pnl":
                compare = a.unrealizedPnl - b.unrealizedPnl
                break
            case "pnlPercentage":
                const aPerc = a.value > 0 ? (a.unrealizedPnl / a.value) * 100 : 0
                const bPerc = b.value > 0 ? (b.unrealizedPnl / b.value) * 100 : 0
                compare = aPerc - bPerc
                break
        }
        return sortOrder === "asc" ? compare : -compare
    })
}
