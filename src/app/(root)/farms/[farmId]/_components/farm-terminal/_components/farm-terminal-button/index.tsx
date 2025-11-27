import { Button } from "@/components/ui/button"
import { cn } from "@/utils"
import { FC } from "react"
import { FarmTerminalButtonProps } from "./farm-termina-button.types"
import { Loader2 } from "lucide-react"
import { formatNumberWithSuffix } from "@/utils/format"

const FarmTerminalButton: FC<FarmTerminalButtonProps> = ({
    actionType,
    amount,
    isProcessing,
    tokenBalanceInDisplayUnit,
    stakedInDisplayUnit,
    tokenSymbol,
    handleDeposit,
    handleWithdraw
}) => (
    <Button
        className={cn(
            "w-full h-10 font-mono text-xs uppercase",
            actionType === "deposit"
                ? "bg-green-400/50 hover:bg-green-500/90 text-foreground"
                : "bg-destructive/80 hover:bg-destructive text-foreground",
            (!amount || isProcessing || (actionType === "withdraw" && stakedInDisplayUnit === 0)) && "opacity-50"
        )}
        onClick={actionType === "deposit" ? handleDeposit : handleWithdraw}
        disabled={
            !amount ||
            isProcessing ||
            (actionType === "deposit" && parseFloat(amount) > tokenBalanceInDisplayUnit) ||
            (actionType === "withdraw" && (stakedInDisplayUnit === 0 || parseFloat(amount) > stakedInDisplayUnit))
        }
    >
        {isProcessing ? (
            <>
                <Loader2 className="h-3.5 w-3.5 animate-spin mr-2" />
                {actionType === "deposit" ? "Depositing..." : "Withdrawing..."}
            </>
        ) : (
            <>
                {actionType === "deposit"
                    ? `Deposit ${formatNumberWithSuffix(parseFloat(amount) || 0)} ${tokenSymbol}`
                    : `Withdraw ${formatNumberWithSuffix(parseFloat(amount) || 0)} ${tokenSymbol}`}
            </>
        )}
    </Button>
)

export default FarmTerminalButton