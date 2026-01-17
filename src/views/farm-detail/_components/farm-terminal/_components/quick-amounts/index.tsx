import { FC } from "react"

import { cn } from "@/utils"
import { QuickAmountsProps } from "./quick-amounts.types"

const QuickAmounts: FC<QuickAmountsProps> = ({ onSelect, isProcessing, actionType, stakedInDisplayUnit }) => (
    <div className="flex justify-end gap-1.5 sm:gap-2">
        {[25, 50, 75, 100].map((percentage) => (
            <button
                key={percentage}
                className={cn(
                    "py-1.5 sm:py-2 px-2 sm:px-3 rounded-md flex justify-center items-center",
                    "border border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20",
                    "transition-all duration-200",
                    "group",
                    (isProcessing || (actionType === "withdraw" && stakedInDisplayUnit === 0)) && "opacity-50 cursor-not-allowed"
                )}
                onClick={() => onSelect(percentage)}
                disabled={isProcessing || (actionType === "withdraw" && stakedInDisplayUnit === 0)}
            >
                <span className="text-xs font-semibold text-blue-400 group-hover:text-blue-300 whitespace-nowrap">
                    {percentage}%
                </span>
            </button>
        ))}
    </div>
)

export default QuickAmounts