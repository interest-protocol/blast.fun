import { FC } from "react"

import { PortfolioTableHeaderProps } from "./portfolio-table-header.types"

const PortfolioTableHeader: FC<PortfolioTableHeaderProps> = ({ title, field, sortField, sortOrder, onSort, className }) => (
    <th
        className={`px-3 md:px-6 py-4 text-right cursor-pointer hover:bg-muted/50 transition-colors ${className || ""}`}
        onClick={() => field && onSort?.(field)}
    >
        <span className="font-mono text-xs uppercase text-muted-foreground inline-flex items-center gap-1">
            {title} {field === sortField && (sortOrder === "asc" ? "↑" : "↓")}
        </span>
    </th>
)
export default PortfolioTableHeader