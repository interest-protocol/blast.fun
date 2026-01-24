import { FC } from "react"
import { Loader2 } from "lucide-react"

import { cn } from "@/utils"
import { useApp } from "@/context/app.context"
import { useTrading } from "@/hooks/pump/use-trading"
import { usePresetStore } from "@/stores/preset-store"

import { QuickBuyProps } from "./quick-buy.types"

const QuickBuy: FC<QuickBuyProps> = ({ pool, className, column }) => {
    const { isConnected } = useApp()
    const { flashBuyAmounts, slippage } = usePresetStore()
    const { buy, isProcessing } = useTrading({ pool })

    // use column-specific flash buy amount, fallback to newlyCreated if no column specified
    const flashBuyAmount = column ? flashBuyAmounts[column] : flashBuyAmounts.newlyCreated

    const handleQuickBuy = async (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()

        try {
            await buy(flashBuyAmount.toString(), slippage)
        } catch (error) {
            // error handling is done in trading hook
        }
    }

    if (!isConnected) return null;

    return (
        <div
            className={cn("flex items-center gap-1.5", className)}
            onClick={(e) => e.stopPropagation()}
        >
            <button
                onClick={handleQuickBuy}
                disabled={isProcessing}
                className={cn(
                    "flex items-center gap-1 rounded-lg border px-2 py-1.5 font-mono text-[10px] transition-all",
                    "border-blue-500/30 bg-blue-500/10 text-blue-400",
                    "hover:border-blue-500/60 hover:bg-blue-500/20",
                    "disabled:cursor-not-allowed disabled:opacity-50",
                    isProcessing && "bg-blue-500/30"
                )}
            >
                {isProcessing ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                    <>
                        <img
                            alt="SUI"
                            width={12}
                            height={12}
                            className="shrink-0"
                            src="/assets/currency/sui-fill.svg"
                        />
                        <span className="font-semibold">{flashBuyAmount}</span>
                    </>
                )}
            </button>
        </div>
    );
}

export default QuickBuy;
