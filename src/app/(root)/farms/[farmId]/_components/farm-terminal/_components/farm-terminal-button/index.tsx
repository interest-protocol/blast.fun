import { Button } from "@/components/ui/button"
import { cn } from "@/utils"
import { FC } from "react"
import { FarmTerminalButtonProps } from "./farm-terminal-button.types"
import { Loader2 } from "lucide-react"
import { formatNumberWithSuffix } from "@/utils/format"
import { useApp } from "@/context/app.context"
import ConnectWallet from "@/components/layout/connect-wallet"

const FarmTerminalButton: FC<FarmTerminalButtonProps> = ({
    actionType,
    amount,
    isProcessing,
    tokenBalanceInDisplayUnit,
    stakedInDisplayUnit,
    tokenSymbol,
    handleDeposit,
    handleWithdraw,
}) => {
    const { isConnected, setIsConnectDialogOpen } = useApp()

    const normalizedAmount = amount.replace(",", ".")
    const numericAmount = parseFloat(normalizedAmount)

    if (!isConnected) {
        return (
            <Button
                variant="outline"
                onClick={() => setIsConnectDialogOpen(true)}
                className="font-mono uppercase tracking-wider w-full h-10 cursor-pointer"
            >
                CONNECT WALLET
            </Button>
        )
    }

    const isDisabled =
        !amount ||
        isProcessing ||
        isNaN(numericAmount) ||
        (actionType === "deposit" && numericAmount > tokenBalanceInDisplayUnit) ||
        (actionType === "withdraw" &&
            (stakedInDisplayUnit === 0 || numericAmount > stakedInDisplayUnit))

    return (
        <Button
            className={cn(
                "w-full h-10 font-mono text-xs uppercase",
                actionType === "deposit"
                    ? "bg-green-400/50 hover:bg-green-500/90 text-foreground"
                    : "bg-destructive/80 hover:bg-destructive text-foreground",
                isDisabled && "opacity-50 cursor-not-allowed"
            )}
            onClick={actionType === "deposit" ? handleDeposit : handleWithdraw}
            disabled={isDisabled}
        >
            {isProcessing ? (
                <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin mr-2" />
                    {actionType === "deposit" ? "Depositing..." : "Withdrawing..."}
                </>
            ) : (
                <>
                    {actionType === "deposit"
                        ? `Deposit ${formatNumberWithSuffix(numericAmount || 0)} ${tokenSymbol}`
                        : `Withdraw ${formatNumberWithSuffix(numericAmount || 0)} ${tokenSymbol}`}
                </>
            )}
        </Button>
    )
}

export default FarmTerminalButton
