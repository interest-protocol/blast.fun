import { FC } from "react"
import { cn } from "@/utils"

import { FilterModeToggleProps } from "./filter-mode-toggle.types"

const FilterModeToggle: FC<FilterModeToggleProps> = ({ value, onChange }) => (
    <div className="flex bg-muted rounded-lg border p-1 mb-4">
        <button
            onClick={() => onChange('audit')}
            className={cn(
                "flex-1 py-2 px-3 rounded-md font-mono text-xs uppercase tracking-wider transition-all",
                value === 'audit'
                    ? "bg-background shadow-sm text-foreground"
                    : "hover:text-foreground text-muted-foreground"
            )}
        >
            AUDIT
        </button>
        <button
            onClick={() => onChange('metrics')}
            className={cn(
                "flex-1 py-2 px-3 rounded-md font-mono text-xs uppercase tracking-wider transition-all",
                value === 'metrics'
                    ? "bg-background shadow-sm text-foreground"
                    : "hover:text-foreground text-muted-foreground"
            )}
        >
            METRICS
        </button>
    </div>
);

export default FilterModeToggle;