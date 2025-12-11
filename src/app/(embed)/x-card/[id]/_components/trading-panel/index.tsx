"use client"

import { FC, useState } from "react"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { useTrading } from "@/hooks/pump/use-trading"
import { useTokenBalance } from "@/hooks/sui/use-token-balance"
import { usePortfolio } from "@/hooks/nexa/use-portfolio"
import { TradingPanelProps } from "./trading-panel.types"
import TradingHeader from "./_components/trading-header"
import TradeTabs from "./_components/trade-tabs"
import AmountInput from "./_components/amount-input"
import QuickActions from "./_components/quick-actions"
import TradeButton from "./_components/trade-button"

const TradingPanel: FC<TradingPanelProps> = ({ pool, referrerWallet, refCode }) => {
    const [tradeType, setTradeType] = useState<"buy" | "sell">("buy")
    const [amount, setAmount] = useState("")
    const [slippage, setSlippage] = useState("15")

    const { balance: tokenBalance } = useTokenBalance(pool.coinType)
    const { balance: actualBalance, refetch: refetchPortfolio } = usePortfolio(pool.coinType)
    const metadata = pool.metadata
    const decimals = metadata?.decimals || 9

    // use balance from nexa if available, otherwise fall back to token balance
    const effectiveBalance = actualBalance !== "0" ? actualBalance : tokenBalance
    const balanceInDisplayUnit = effectiveBalance ? Number(effectiveBalance) / Math.pow(10, decimals) : 0
    const hasBalance = balanceInDisplayUnit > 0

    const { isProcessing, error, buy, sell } = useTrading({
        pool,
        decimals,
        actualBalance: effectiveBalance,
        referrerWallet,
    })

    const handleQuickAmount = async (value: number | string) => {
        if (tradeType === "buy") {
            setAmount(value.toString())
            await buy(value.toString(), parseFloat(slippage))
        } else {
            const percentage = typeof value === 'string' ? parseInt(value) : value

            let tokenAmountToSell: number
            if (percentage === 100) {
                tokenAmountToSell = balanceInDisplayUnit
            } else {
                tokenAmountToSell = Math.floor(balanceInDisplayUnit * (percentage / 100) * 1e9) / 1e9
            }

            setAmount(tokenAmountToSell.toString())
            await sell(tokenAmountToSell.toString(), parseFloat(slippage))
        }

        await refetchPortfolio()
        setAmount("")
    }

    const handleTrade = async () => {
        if (!amount || parseFloat(amount) <= 0) return

        if (tradeType === "buy") {
            await buy(amount, parseFloat(slippage))
        } else {
            await sell(amount, parseFloat(slippage))
        }

        await refetchPortfolio()
        setAmount("")
    }

    return (
        <div className="p-3 space-y-3">
            <TradingHeader
                symbol={metadata?.symbol || ""}
                refCode={refCode!}
                hasBalance={hasBalance}
                balance={balanceInDisplayUnit}
            />

            <TradeTabs
                tradeType={tradeType}
                setTradeType={setTradeType}
                hasBalance={hasBalance}
            />

            <AmountInput
                amount={amount}
                setAmount={setAmount}
                isProcessing={isProcessing}
                tradeType={tradeType}
                symbol={metadata?.symbol}
                slippage={slippage}
                setSlippage={setSlippage}
            />

            <QuickActions
                tradeType={tradeType}
                isProcessing={isProcessing}
                hasBalance={hasBalance}
                handleQuickAmount={handleQuickAmount}
            />

            {error && (
                <Alert className="py-1.5 border-destructive/50 bg-destructive/10">
                    <AlertDescription className="font-mono text-[10px] uppercase text-destructive">
                        {error}
                    </AlertDescription>
                </Alert>
            )}

            <TradeButton
                tradeType={tradeType}
                amount={amount}
                isProcessing={isProcessing}
                symbol={metadata?.symbol}
                hasBalance={hasBalance}
                handleTrade={handleTrade}
            />
        </div>
    )
}
export default TradingPanel