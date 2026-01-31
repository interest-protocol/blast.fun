"use client";

import { useState, useMemo } from "react";
import BigNumber from "bignumber.js";

import { pumpSdk } from "@/lib/memez/sdk"
import { useApp } from "@/context/app.context"
import { coinWithBalance } from "@mysten/sui/transactions"
import { formatNumberWithSuffix } from "@/utils/format"
import { usePortfolio } from "@/hooks/nexa/use-portfolio"
import { useTransaction } from "@/hooks/sui/use-transaction"
import { useTokenBalance } from "@/hooks/sui/use-token-balance"

import { BurnDialogProps } from "../burn-dialog.types"

export const useBurnLogic = ({ pool, onOpenChange }: BurnDialogProps) => {
    const [amount, setAmount] = useState("")
    const [isProcessing, setIsProcessing] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)

    const { address } = useApp()
    const { executeTransaction } = useTransaction()

    const metadata = pool.metadata
    const decimals = metadata?.decimals || 9
    const symbol = metadata?.symbol || "Tokens"

    const { balance: tokenBalance } = useTokenBalance(pool.coinType)
    const { balance: actualBalance } = usePortfolio(pool.coinType)
    const effectiveBalance = actualBalance !== "0" ? actualBalance : tokenBalance

    const balanceInDisplayUnit = effectiveBalance
        ? Number(effectiveBalance) / Math.pow(10, decimals)
        : 0

    const balanceInDisplayUnitPrecise = useMemo(() => {
        if (!effectiveBalance || effectiveBalance === undefined || effectiveBalance === null) {
            return "0"
        }
        try {
            const balanceBN = new BigNumber(effectiveBalance)
            if (balanceBN.isNaN()) {
                return "0"
            }
            const divisor = new BigNumber(10).pow(decimals)
            return balanceBN.dividedBy(divisor).toFixed()
        } catch (error) {
            console.error("Error calculating precise balance:", error)
            return "0"
        }
    }, [effectiveBalance, decimals])

    const handleQuickAmount = (percentage: number) => {
        if (!balanceInDisplayUnitPrecise || balanceInDisplayUnitPrecise === "0") {
            setAmount("0")
            return
        }
        if (percentage === 100) {
            setAmount(balanceInDisplayUnitPrecise)
            return
        }
        try {
            const balanceBN = new BigNumber(balanceInDisplayUnitPrecise)
            const percentageBN = new BigNumber(percentage).dividedBy(100)
            const tokenAmountToBurn = balanceBN.multipliedBy(percentageBN).toFixed(9, BigNumber.ROUND_DOWN)
            setAmount(tokenAmountToBurn)
        } catch (error) {
            console.error("Error calculating quick burn amount:", error)
            setAmount("0")
        }
    }

    const handleBurn = async () => {
        if (!amount || parseFloat(amount) <= 0) {
            setError("Please enter a valid amount")
            return
        }
        if (parseFloat(amount) > balanceInDisplayUnit) {
            setError(`Insufficient balance. You only have ${formatNumberWithSuffix(balanceInDisplayUnit)} ${symbol}`)
            return
        }
        if (!address) {
            setError("Please connect your wallet")
            return
        }

        setIsProcessing(true)
        setError(null)

        try {
            const amountBN = new BigNumber(amount)
            const amountInSmallestUnit = amountBN.multipliedBy(Math.pow(10, decimals)).toFixed(0)
            const burnAmount = BigInt(amountInSmallestUnit)

            const memeCoin = coinWithBalance({
                type: pool.coinType,
                balance: burnAmount,
            })

            const { tx } = await pumpSdk.burnMeme({
                ipxTreasury: pool.pool?.coinIpxTreasuryCap || "",
                memeCoin,
                coinType: pool.coinType,
            })

            const result = await executeTransaction(tx)

            setSuccess(`Successfully burned ${amount} ${symbol}! Transaction: ${result.digest.slice(0, 8)}...`)
            setAmount("")

            setTimeout(() => {
                onOpenChange(false)
                setSuccess(null)
            }, 3000)
        } catch (err) {
            console.error("Burn error:", err)
            const errorMessage = err instanceof Error ? err.message : "Failed to burn tokens"
            setError(errorMessage)
        } finally {
            setIsProcessing(false)
        }
    }

    const handleOpenChange = (open: boolean) => {
        if (!open) {
            setAmount("")
            setError(null)
            setSuccess(null)
        }
        onOpenChange(open)
    }

    return {
        amount,
        setAmount,
        isProcessing,
        error,
        success,
        symbol,
        balanceInDisplayUnit,
        balanceInDisplayUnitPrecise,
        handleQuickAmount,
        handleBurn,
        handleOpenChange,
        metadata,
    }
}