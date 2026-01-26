import { FC } from "react"

import { Button } from "@/components/ui/button"

import { FilterActionsProps } from "./filter-actions.types"

const FilterActions: FC<FilterActionsProps> = ({ onReset, onApply }) => (
    <div className="flex gap-2 p-6 pt-4 border-t flex-shrink-0">
        <Button
            variant="outline"
            onClick={onReset}
            className="flex-1 font-mono text-xs uppercase tracking-wider"
        >
            RESET
        </Button>
        <Button
            onClick={onApply}
            className="flex-1 font-mono text-xs uppercase tracking-wider"
        >
            APPLY
        </Button>
    </div>
);

export default FilterActions;