import { FC } from "react"

import { cn } from "@/utils"
import { ActionTabsProps } from "./action-tabs.types"

const ActionTabs: FC<ActionTabsProps> = ({ actionType, setActionType, stakedInDisplayUnit }) => {
    return (
        <div className="grid grid-cols-2 gap-1 p-1 bg-muted/30 rounded-lg">
            <button
                onClick={() => setActionType("deposit")}
                className={cn(
                    "py-2.5 rounded-md font-mono text-xs uppercase transition-all",
                    actionType === "deposit"
                        ? "bg-green-500/20 text-green-500 border border-green-500/50"
                        : "hover:bg-muted/50 text-muted-foreground"
                )}
            >
                Deposit
            </button>
            <button
                onClick={() => setActionType("withdraw")}
                disabled={stakedInDisplayUnit === 0}
                className={cn(
                    "py-2.5 rounded-md font-mono text-xs uppercase transition-all",
                    actionType === "withdraw"
                        ? "bg-red-500/20 text-red-500 border border-red-500/50"
                        : "hover:bg-muted/50 text-muted-foreground",
                    stakedInDisplayUnit === 0 && "opacity-50 cursor-not-allowed"
                )}
            >
                Withdraw
            </button>
        </div>
    )
}

export default ActionTabs
