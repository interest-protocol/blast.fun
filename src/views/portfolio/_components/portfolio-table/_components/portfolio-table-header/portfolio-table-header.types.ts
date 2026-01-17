import { SortField, SortOrder } from "../../portfolio-table.types"

export interface PortfolioTableHeaderProps {
    title: string
    field?: SortField
    sortField: SortField
    sortOrder: SortOrder
    onSort?: (field: SortField) => void
    className?: string
}