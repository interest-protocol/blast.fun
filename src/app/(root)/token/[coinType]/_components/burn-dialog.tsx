"use client"

import { coinWithBalance } from "@mysten/sui/transactions"
import BigNumber from "bignumber.js"
import { CheckCircle, Flame, Loader2 } from "lucide-react"
import { useState } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { useApp } from "@/context/app.context"
import { usePortfolio } from "@/hooks/nexa/use-portfolio"
import { useTokenBalance } from "@/hooks/sui/use-token-balance"
import { useTransaction } from "@/hooks/sui/use-transaction"
import { pumpSdk } from "@/lib/pump"
import type { Token } from "@/types/token"
import { formatNumberWithSuffix } from "@/utils/format"

interface BurnDialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	pool: Token
}

export function BurnDialog({ open, onOpenChange, pool }: BurnDialogProps) {
	const [amount, setAmount] = useState("")
	const [isProcessing, setIsProcessing] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [success, setSuccess] = useState<string | null>(null)

	const { address } = useApp()
	const { executeTransaction } = useTransaction()

	const metadata = pool.metadata
	const decimals = metadata?.decimals || 9

	// Get token balance
	const { balance: tokenBalance } = useTokenBalance(pool.coinType)
	const { balance: actualBalance } = usePortfolio(pool.coinType)
	const effectiveBalance = actualBalance !== "0" ? actualBalance : tokenBalance
	const balanceInDisplayUnit = effectiveBalance ? Number(effectiveBalance) / Math.pow(10, decimals) : 0

	// Calculate precise balance for MAX button
	const balanceInDisplayUnitPrecise = (() => {
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
	})()

	const handleQuickAmount = (percentage: number) => {
		if (!balanceInDisplayUnitPrecise || balanceInDisplayUnitPrecise === "0") {
			setAmount("0")
			return
		}

		if (percentage === 100) {
			setAmount(balanceInDisplayUnitPrecise)
		} else {
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
	}

	const handleBurn = async () => {
		if (!amount || parseFloat(amount) <= 0) {
			setError("Please enter a valid amount")
			return
		}

		if (parseFloat(amount) > balanceInDisplayUnit) {
			setError(
				`Insufficient balance. You only have ${formatNumberWithSuffix(balanceInDisplayUnit)} ${metadata?.symbol}`
			)
			return
		}

		if (!address) {
			setError("Please connect your wallet")
			return
		}

		setIsProcessing(true)
		setError(null)

		try {
			// Calculate amount in smallest unit
			const amountBN = new BigNumber(amount)
			const amountInSmallestUnit = amountBN.multipliedBy(Math.pow(10, decimals)).toFixed(0)
			const burnAmount = BigInt(amountInSmallestUnit)

			// Create the coin object with the amount to burn
			const memeCoin = coinWithBalance({
				type: pool.coinType,
				balance: burnAmount,
			})

			// Create burn transaction
			const { tx } = await pumpSdk.burnMeme({
				ipxTreasury: pool.pool?.coinIpxTreasuryCap || "",
				memeCoin,
				coinType: pool.coinType,
			})

			// Execute the transaction
			const result = await executeTransaction(tx)

			// Show success message
			setSuccess(`Successfully burned ${amount} ${metadata?.symbol}! Transaction: ${result.digest.slice(0, 8)}...`)
			setAmount("")

			// Close dialog after a delay to show success
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

	// Reset states when dialog closes
	const handleOpenChange = (open: boolean) => {
		if (!open) {
			setAmount("")
			setError(null)
			setSuccess(null)
		}
		onOpenChange(open)
	}

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<Flame className="h-5 w-5 text-orange-500" />
						Burn {metadata?.symbol || "Tokens"}
					</DialogTitle>
					<DialogDescription>
						Permanently burn supply for this token, this action cannot be undone.
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-4">
					{/* Balance Display */}
					<div className="space-y-1 rounded-lg bg-muted/50 p-3">
						<div className="flex items-center justify-between text-sm">
							<span className="text-muted-foreground">Your Balance</span>
							<span className="font-mono">
								{formatNumberWithSuffix(balanceInDisplayUnit)} {metadata?.symbol}
							</span>
						</div>
					</div>

					{/* Amount Input */}
					<div className="space-y-2">
						<div className="flex items-center justify-between">
							<label className="font-medium text-sm">Amount to Burn</label>
							<button
								onClick={() => setAmount(balanceInDisplayUnitPrecise)}
								className="font-medium text-blue-400 text-xs transition-colors hover:text-blue-300"
								disabled={isProcessing}
							>
								MAX
							</button>
						</div>
						<Input
							type="text"
							placeholder="0.00"
							value={amount}
							onChange={(e) => setAmount(e.target.value)}
							disabled={isProcessing}
							className="font-mono"
						/>
					</div>

					{/* Quick Percentage Buttons */}
					<div className="grid grid-cols-4 gap-2">
						{[25, 50, 75, 100].map((percentage) => (
							<Button
								key={percentage}
								variant="outline"
								size="sm"
								onClick={() => handleQuickAmount(percentage)}
								disabled={isProcessing || balanceInDisplayUnit === 0}
								className="font-mono text-xs"
							>
								{percentage}%
							</Button>
						))}
					</div>

					{/* Success Message */}
					{success && (
						<Alert className="border-green-500/50 bg-green-500/10">
							<CheckCircle className="h-4 w-4 text-green-500" />
							<AlertDescription className="text-green-500 text-xs">{success}</AlertDescription>
						</Alert>
					)}

					{/* Warning Message */}
					{!success && (
						<Alert className="border-orange-500/50 bg-orange-500/10">
							<Flame className="h-4 w-4 text-orange-500" />
							<AlertDescription className="text-xs">
								Burning tokens permanently removes them from circulation. This will reduce the total supply
								and cannot be reversed.
							</AlertDescription>
						</Alert>
					)}

					{/* Error Message */}
					{error && (
						<Alert className="border-destructive/50 bg-destructive/10">
							<AlertDescription className="text-destructive text-xs">{error}</AlertDescription>
						</Alert>
					)}

					{/* Action Buttons */}
					<div className="flex gap-2">
						<Button
							variant="outline"
							onClick={() => onOpenChange(false)}
							disabled={isProcessing}
							className="flex-1"
						>
							Cancel
						</Button>
						<Button
							onClick={handleBurn}
							disabled={isProcessing || !amount || parseFloat(amount) <= 0}
							className="flex-1 bg-orange-500 text-white hover:bg-orange-600"
						>
							{isProcessing ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Burning...
								</>
							) : (
								<>
									<Flame className="mr-2 h-4 w-4" />
									Burn Tokens
								</>
							)}
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	)
}
