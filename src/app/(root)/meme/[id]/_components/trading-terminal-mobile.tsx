"use client"

import { Zap, Wallet, AlertCircle, ChevronUp, ArrowDownToLine, ArrowUpFromLine, Info } from "lucide-react"
import React, { useState, useEffect } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useApp } from "@/context/app.context"
import { usePump } from "@/hooks/pump/use-pump"
import { useTokenBalance } from "@/hooks/sui/use-token-balance"
import type { PoolWithMetadata } from "@/types/pool"
import { usePortfolio } from "@/hooks/nexa/use-portfolio"
import { cn } from "@/utils"

interface TradingTerminalMobileProps {
	pool: PoolWithMetadata
	className?: string
}

export function TradingTerminalMobile({ pool, className }: TradingTerminalMobileProps) {
	const { isConnected } = useApp()
	const [tradeType, setTradeType] = useState<"buy" | "sell">("buy")
	const [amount, setAmount] = useState("")
	const [slippage, setSlippage] = useState("15")
	const [showSlippageSheet, setShowSlippageSheet] = useState(false)
	const [activeInput, setActiveInput] = useState<"amount" | "quick" | null>(null)

	const { balance: tokenBalance } = useTokenBalance(pool.coinType)
	const { balance: actualBalance, refetch: refetchPortfolio, isLoading: isPortfolioLoading } = usePortfolio(pool.coinType)
	const metadata = pool.coinMetadata
	const decimals = metadata?.decimals || 9

	const effectiveBalance = actualBalance !== "0" ? actualBalance : tokenBalance
	const balanceInDisplayUnit = effectiveBalance ? Number(effectiveBalance) / Math.pow(10, decimals) : 0
	const formattedBalance = balanceInDisplayUnit.toLocaleString(undefined, { maximumFractionDigits: 4 })
	const hasBalance = balanceInDisplayUnit > 0

	const { isProcessing, error, success, pump, dump } = usePump({
		pool,
		decimals,
		actualBalance: effectiveBalance,
	})

	useEffect(() => {
		if (success || error) {
			const timer = setTimeout(() => {
				setAmount("")
			}, 3000)

			return () => clearTimeout(timer)
		}
	}, [success, error])

	const quickBuyAmounts = [0.5, 1, 5, 10]
	const quickSellPercentages = [25, 50, 75, 100]

	const handleQuickBuy = async (suiAmount: number) => {
		setAmount(suiAmount.toString())
		setActiveInput("quick")
		const slippageNum = parseFloat(slippage)

		await pump(suiAmount.toString(), slippageNum)
		await refetchPortfolio()
		setAmount("")
		setActiveInput(null)
	}

	const handleQuickSellPercentage = async (percentage: number) => {
		if (!hasBalance) return

		const tokenAmountToSell = balanceInDisplayUnit * (percentage / 100)
		setAmount(tokenAmountToSell.toString())
		setActiveInput("quick")
		const slippageNum = parseFloat(slippage)

		await dump(tokenAmountToSell.toString(), slippageNum)
		await refetchPortfolio()
		setAmount("")
		setActiveInput(null)
	}

	const handleTrade = async () => {
		if (!amount || parseFloat(amount) <= 0) return

		const slippageNum = parseFloat(slippage)
		setActiveInput("amount")

		if (tradeType === "buy") {
			await pump(amount, slippageNum)
		} else {
			await dump(amount, slippageNum)
		}

		await refetchPortfolio()
		setAmount("")
		setActiveInput(null)
	}

	return (
		<div className={cn("flex flex-col h-full bg-background", className)}>
			{/* Header */}
			<div className="flex items-center p-4 border-b bg-background/95 backdrop-blur-sm sticky top-0 z-10">
				<div className="flex flex-1 bg-muted/30 rounded-lg p-1">
					<button
						onClick={() => setTradeType("buy")}
						className={cn(
							"flex-1 py-3 px-4 rounded-md font-mono text-sm uppercase tracking-wider transition-all",
							tradeType === "buy"
								? "bg-green-500/20 text-green-500 shadow-lg"
								: "text-muted-foreground"
						)}
					>
						<ArrowDownToLine className="w-4 h-4 inline mr-2" />
						Buy
					</button>
					<button
						onClick={() => setTradeType("sell")}
						className={cn(
							"flex-1 py-3 px-4 rounded-md font-mono text-sm uppercase tracking-wider transition-all",
							tradeType === "sell"
								? "bg-red-500/20 text-red-500 shadow-lg"
								: "text-muted-foreground"
						)}
					>
						<ArrowUpFromLine className="w-4 h-4 inline mr-2" />
						Sell
					</button>
				</div>
			</div>

			{/* Main Content */}
			<div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
				{/* Balance Display for Sell */}
				{tradeType === "sell" && (
					<div className={cn(
						"rounded-xl p-4 border-2",
						hasBalance
							? "bg-muted/10 border-border/50"
							: "bg-red-500/5 border-red-500/30"
					)}>
						<div className="flex items-center justify-between mb-1">
							<span className="font-mono text-xs uppercase text-muted-foreground">Your Balance</span>
							{isPortfolioLoading && (
								<div className="w-3 h-3 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
							)}
						</div>
						<div className="font-mono text-lg font-semibold">
							{formattedBalance} {metadata?.symbol || "TOKEN"}
						</div>
						{!hasBalance && (
							<p className="font-mono text-xs uppercase text-red-500/70 mt-2">
								No tokens to sell. Buy first!
							</p>
						)}
					</div>
				)}

				{/* Quick Actions */}
				<div className="space-y-3">
					<h3 className="font-mono text-xs uppercase text-muted-foreground flex items-center gap-2">
						<Zap className="w-3 h-3" />
						Quick {tradeType === "buy" ? "Buy" : "Sell"}
					</h3>
					<div className="grid grid-cols-2 gap-3">
						{tradeType === "buy"
							? quickBuyAmounts.map((quickAmount) => (
								<Button
									key={quickAmount}
									variant="outline"
									className={cn(
										"h-14 font-mono text-sm uppercase border-2 transition-all",
										"hover:border-green-500/50 hover:bg-green-500/10 hover:text-green-500",
										"active:scale-95"
									)}
									onClick={() => handleQuickBuy(quickAmount)}
									disabled={isProcessing || !isConnected}
								>
									<div className="flex flex-col">
										<span className="text-base font-semibold">{quickAmount}</span>
										<span className="text-xs opacity-70">SUI</span>
									</div>
								</Button>
							))
							: quickSellPercentages.map((percentage) => (
								<Button
									key={percentage}
									variant="outline"
									className={cn(
										"h-14 font-mono text-sm uppercase border-2 transition-all",
										percentage === 100
											? "hover:border-red-600/50 hover:bg-red-600/10 hover:text-red-600"
											: "hover:border-red-500/50 hover:bg-red-500/10 hover:text-red-500",
										"active:scale-95"
									)}
									onClick={() => handleQuickSellPercentage(percentage)}
									disabled={isProcessing || !isConnected || !hasBalance}
								>
									<div className="flex flex-col">
										<span className="text-base font-semibold">{percentage}%</span>
										<span className="text-xs opacity-70">
											{percentage === 100 ? "MAX" : "SELL"}
										</span>
									</div>
								</Button>
							))}
					</div>
				</div>

				{/* Custom Amount Input */}
				<div className="space-y-3">
					<h3 className="font-mono text-xs uppercase text-muted-foreground">
						Custom Amount
					</h3>
					<div className="relative">
						<Input
							type="number"
							placeholder={tradeType === "buy" ? "Enter SUI amount" : "Enter token amount"}
							value={amount}
							onChange={(e) => setAmount(e.target.value)}
							onFocus={() => setActiveInput("amount")}
							onBlur={() => setActiveInput(null)}
							className={cn(
								"h-14 pl-4 pr-20 font-mono text-lg border-2 transition-all bg-background/50",
								activeInput === "amount" && "border-primary/50 ring-2 ring-primary/20"
							)}
							disabled={isProcessing}
						/>
						<span className="absolute right-4 top-1/2 -translate-y-1/2 font-mono text-sm uppercase text-muted-foreground">
							{tradeType === "buy" ? "SUI" : metadata?.symbol || "TOKEN"}
						</span>
					</div>
				</div>

				{/* Slippage Settings */}
				<button
					onClick={() => setShowSlippageSheet(!showSlippageSheet)}
					className="w-full flex items-center justify-between p-4 rounded-xl border-2 border-border/50 hover:border-primary/30 transition-all"
				>
					<div className="flex items-center gap-2">
						<Info className="w-4 h-4 text-muted-foreground" />
						<span className="font-mono text-sm uppercase">Slippage</span>
					</div>
					<div className="flex items-center gap-2">
						<span className="font-mono text-sm font-semibold">{slippage}%</span>
						<ChevronUp className={cn("w-4 h-4 transition-transform", !showSlippageSheet && "rotate-180")} />
					</div>
				</button>

				{/* Slippage Options */}
				{showSlippageSheet && (
					<div className="grid grid-cols-4 gap-2 p-4 bg-muted/20 rounded-xl">
						{["5", "10", "15", "20"].map((value) => (
							<Button
								key={value}
								variant={slippage === value ? "secondary" : "outline"}
								size="sm"
								className="font-mono text-xs uppercase"
								onClick={() => {
									setSlippage(value)
									setShowSlippageSheet(false)
								}}
							>
								{value}%
							</Button>
						))}
					</div>
				)}

				{/* Status Messages */}
				{success && (
					<Alert className="border-2 border-green-500/50 bg-green-500/10">
						<AlertDescription className="font-mono text-xs uppercase text-green-500">
							{success}
						</AlertDescription>
					</Alert>
				)}

				{error && (
					<Alert variant="destructive" className="border-2">
						<AlertCircle className="h-4 w-4" />
						<AlertDescription className="font-mono text-xs uppercase">
							{error}
						</AlertDescription>
					</Alert>
				)}
			</div>

			{/* Fixed Bottom Trade Button */}
			<div className="p-4 border-t bg-background/95 backdrop-blur-sm">
				<Button
					className={cn(
						"w-full h-14 font-mono uppercase tracking-wider transition-all border-2",
						tradeType === "buy"
							? "bg-green-500/20 border-green-500/50 text-green-500 hover:bg-green-500/30 hover:border-green-500 active:scale-[0.98]"
							: "bg-red-500/20 border-red-500/50 text-red-500 hover:bg-red-500/30 hover:border-red-500 active:scale-[0.98]",
						(!isConnected || !amount) && "opacity-50"
					)}
					onClick={handleTrade}
					disabled={!isConnected || isProcessing || !amount || (tradeType === "sell" && !hasBalance)}
				>
					{isProcessing ? (
						<span className="flex items-center gap-2">
							<div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
							Processing...
						</span>
					) : !isConnected ? (
						<span className="flex items-center gap-2">
							<Wallet className="w-5 h-5" />
							Connect Wallet
						</span>
					) : (
						<span className="flex items-center gap-2 text-base">
							{tradeType === "buy" ? (
								<>
									<ArrowDownToLine className="w-5 h-5" />
									Buy {metadata?.symbol || "TOKEN"}
								</>
							) : (
								<>
									<ArrowUpFromLine className="w-5 h-5" />
									Sell {metadata?.symbol || "TOKEN"}
								</>
							)}
						</span>
					)}
				</Button>
			</div>
		</div>
	)
}