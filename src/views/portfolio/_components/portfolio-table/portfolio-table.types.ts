import { PortfolioResponse } from "@/types/portfolio"

export type PortfolioBalance = PortfolioResponse["balances"][number]
export type SortField = "name" | "value" | "pnl" | "pnlPercentage"
export type SortOrder = "asc" | "desc"

export interface PortfolioTableProps {
    portfolio: PortfolioResponse
    hideSmallBalance: boolean
    onHideSmallBalanceChange: (value: boolean) => void
}