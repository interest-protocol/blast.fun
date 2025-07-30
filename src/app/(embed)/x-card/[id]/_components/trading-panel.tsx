"use client"

import { useState } from "react"
import { Zap, TrendingUp, TrendingDown } from "lucide-react"
import { useApp } from "@/context/app.context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { usePump } from "@/hooks/pump/use-pump"
import { useTokenBalance } from "@/hooks/sui/use-token-balance"
import { usePortfolio } from "@/hooks/nexa/use-portfolio"
import type { PoolWithMetadata } from "@/types/pool"
import { cn } from "@/utils"

interface TradingPanelProps {
	pool: PoolWithMetadata
	referrerWallet?: string | null
}

export function TradingPanel({ pool, referrerWallet }: TradingPanelProps) {
	const { isConnected } = useApp()
	const [tradeType, setTradeType] = useState<"buy" | "sell">("buy")
	const [amount, setAmount] = useState("")
	const [slippage, setSlippage] = useState("15")

	const { balance: tokenBalance } = useTokenBalance(pool.coinType)
	const { balance: actualBalance } = usePortfolio(pool.coinType)
	const metadata = pool.coinMetadata
	const decimals = metadata?.decimals || 9

	// use balance from nexa if available, otherwise fall back to token balance
	const effectiveBalance = actualBalance !== "0" ? actualBalance : tokenBalance
	const balanceInDisplayUnit = effectiveBalance ? Number(effectiveBalance) / Math.pow(10, decimals) : 0
	const formattedBalance = balanceInDisplayUnit.toLocaleString(undefined, { maximumFractionDigits: 4 })
	const hasBalance = balanceInDisplayUnit > 0

	const { isLoading, error, success, pump, dump } = usePump({
		pool,
		decimals,
		actualBalance: effectiveBalance,
		referrerWallet,
	})

	const quickBuyAmounts = [0.5, 1, 5, 10]
	const quickSellPercentages = [25, 50, 75, 100]

	const handleQuickBuy = async (suiAmount: number) => {
		setAmount(suiAmount.toString())
		const slippageNum = parseFloat(slippage)
		await pump(suiAmount.toString(), slippageNum)
		setAmount("")
	}

	const handleQuickSellPercentage = async (percentage: number) => {
		if (!hasBalance) return

		const tokenAmountToSell = balanceInDisplayUnit * (percentage / 100)
		setAmount(tokenAmountToSell.toString())
		const slippageNum = parseFloat(slippage)
		await dump(tokenAmountToSell.toString(), slippageNum)
		setAmount("")
	}

	const handleTrade = async () => {
		if (!amount || parseFloat(amount) <= 0) return

		const slippageNum = parseFloat(slippage)
		if (tradeType === "buy") {
			await pump(amount, slippageNum)
		} else {
			await dump(amount, slippageNum)
		}
		setAmount("")
	}

	return (
		<div className="p-3">
			<Tabs value={tradeType} onValueChange={(v) => setTradeType(v as "buy" | "sell")}>
				<TabsList className="grid w-full grid-cols-2 bg-background/50 h-12">
					<TabsTrigger
						value="buy"
						className="font-mono uppercase tracking-wider transition-colors h-full data-[state=active]:bg-green-500/20 data-[state=active]:text-green-500 data-[state=active]:shadow-none"
					>
						BUY
					</TabsTrigger>
					<TabsTrigger
						value="sell"
						className="font-mono uppercase tracking-wider transition-colors h-full data-[state=active]:bg-red-500/20 data-[state=active]:text-red-500 data-[state=active]:shadow-none"
					>
						SELL
					</TabsTrigger>
				</TabsList>

				<TabsContent value={tradeType} className="space-y-2 mt-4">
					{/* Balance Display */}
					{tradeType === "sell" && (
						<div className={cn(
							"border rounded p-2",
							hasBalance
								? "bg-foreground/5 border-foreground/20"
								: "bg-destructive/5 border-destructive/20"
						)}>
							<div className="flex items-center justify-between">
								<span className="font-mono text-[10px] uppercase text-muted-foreground select-none">
									TOKEN::BALANCE
								</span>

								<span className={cn(
									"font-mono text-xs font-bold select-none",
									hasBalance ? "text-foreground/80" : "text-destructive"
								)}>
									{formattedBalance} {metadata?.symbol || "[TOKEN]"}
								</span>
							</div>
						</div>
					)}

					{/* Quick Actions */}
					<div className="space-y-2">
						<p className="font-mono text-[10px] uppercase text-muted-foreground select-none">
							QUICK::{tradeType.toUpperCase()}
						</p>
						<div className="grid grid-cols-4 gap-1.5">
							{tradeType === "buy" ? (
								quickBuyAmounts.map((quickAmount) => (
									<Button
										key={quickAmount}
										variant="outline"
										size="sm"
										className="h-8 font-mono text-[10px] uppercase tracking-wider border-foreground/20 text-foreground/60 hover:bg-foreground/10 hover:border-foreground/40 hover:text-foreground/80 transition-all"
										onClick={() => handleQuickBuy(quickAmount)}
										disabled={isLoading || !isConnected}
									>
										{quickAmount} SUI
									</Button>
								))
							) : (
								quickSellPercentages.map((percentage) => (
									<Button
										key={percentage}
										variant="outline"
										size="sm"
										className={cn(
											"h-8 font-mono text-[10px] uppercase tracking-wider transition-all",
											percentage === 100
												? "border-destructive/20 text-destructive/60 hover:bg-destructive/10 hover:border-destructive/40 hover:text-destructive/80"
												: "border-foreground/20 text-foreground/60 hover:bg-foreground/10 hover:border-foreground/40 hover:text-foreground/80"
										)}
										onClick={() => handleQuickSellPercentage(percentage)}
										disabled={isLoading || !isConnected || !hasBalance}
									>
										{percentage}%
									</Button>
								))
							)}
						</div>
					</div>

					{/* Amount Input */}
					<div className="space-y-2">
						<p className="font-mono text-[10px] uppercase text-muted-foreground select-none">
							AMOUNT::{tradeType === "buy" ? "SUI" : metadata?.symbol || "TOKEN"}
						</p>
						<div className="relative">
							<Input
								type="number"
								placeholder="0.00"
								value={amount}
								onChange={(e) => setAmount(e.target.value)}
								className="bg-background border-foreground/20 text-foreground font-mono text-sm h-10 focus:border-foreground/40 focus:ring-1 focus:ring-foreground/20 placeholder-foreground/30"
								disabled={isLoading}
							/>
						</div>
					</div>

					{/* Slippage */}
					<div className="space-y-2">
						<p className="font-mono text-[10px] uppercase text-muted-foreground select-none">
							SLIPPAGE::TOLERANCE [{slippage}%]
						</p>
						<div className="grid grid-cols-4 gap-1.5">
							{["5", "10", "15", "20"].map((value) => (
								<Button
									key={value}
									variant={slippage === value ? "secondary" : "outline"}
									size="sm"
									className={cn(
										"h-6 font-mono text-[10px] uppercase tracking-wider transition-all",
										slippage === value
											? "bg-foreground/20 text-foreground border-foreground/40"
											: "border-foreground/20 text-foreground/60 hover:text-foreground/80 hover:border-foreground/40"
									)}
									onClick={() => setSlippage(value)}
								>
									{value}%
								</Button>
							))}
						</div>
					</div>

					{/* Alerts */}
					{success && (
						<Alert className="py-1.5 border-foreground/20 bg-foreground/5">
							<AlertDescription className="font-mono text-[10px] uppercase text-foreground/80">
								TX::SUCCESS [{success}]
							</AlertDescription>
						</Alert>
					)}

					{error && (
						<Alert className="py-1.5 border-destructive/20 bg-destructive/5">
							<AlertDescription className="font-mono text-[10px] uppercase text-destructive">
								ERROR::{error}
							</AlertDescription>
						</Alert>
					)}

					{/* Trade Button */}
					<Button
						className={cn(
							"w-full h-10 font-mono text-xs uppercase tracking-wider font-bold transition-all border",
							tradeType === "buy"
								? "bg-foreground/10 border-foreground/40 text-foreground hover:bg-foreground/20"
								: "bg-destructive/10 border-destructive/40 text-destructive hover:bg-destructive/20",
							(!isConnected || !amount || (tradeType === "sell" && !hasBalance)) && "opacity-50"
						)}
						onClick={handleTrade}
						disabled={!isConnected || isLoading || !amount || parseFloat(amount) <= 0 || (tradeType === "sell" && !hasBalance)}
					>
						{isLoading ? (
							<span className="flex items-center gap-2">
								<div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
								PROCESSING::TX
							</span>
						) : !isConnected ? (
							<span>CONNECT::WALLET</span>
						) : (
							<span className="flex items-center gap-1">
								<Zap className="w-3 h-3" />
								EXECUTE::{tradeType.toUpperCase()}
							</span>
						)}
					</Button>
				</TabsContent>
			</Tabs>
		</div>
	)
}