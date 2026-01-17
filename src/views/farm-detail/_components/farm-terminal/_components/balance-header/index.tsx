import { FC } from "react"
import { Wallet } from "lucide-react"

import { formatNumberWithSuffix } from "@/utils/format"
import { BalanceHeaderProps } from "./balance-header.types"

const BalanceHeader: FC<BalanceHeaderProps> = ({
    actionType,
    tokenBalanceInDisplayUnit,
    stakedInDisplayUnit,
    tokenSymbol,
    onMaxClick,
    disabled
}
) => (
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
            <Wallet className="h-4 w-4" />
            <span className="font-mono">Balance</span>
        </div>
        <div className="flex items-center gap-2">
            <span className="text-foreground font-mono font-semibold">
                {actionType === "deposit" ? formatNumberWithSuffix(tokenBalanceInDisplayUnit) : formatNumberWithSuffix(stakedInDisplayUnit)}
            </span>
            <span className="text-muted-foreground font-mono">{tokenSymbol}</span>
            <button
                onClick={onMaxClick}
                className="text-blue-400 hover:text-blue-300 font-medium text-xs transition-colors font-mono"
                disabled={disabled}
            >
                MAX
            </button>
        </div>
    </div>
)

export default BalanceHeader