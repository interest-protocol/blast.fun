"use client"

import { Zap, Wallet, AlertCircle, ChevronDown } from "lucide-react"
import React, { useState } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useApp } from "@/context/app.context"
import { usePump } from "@/hooks/pump/use-pump"
import { useTokenBalance } from "@/hooks/sui/use-token-balance"
import type { PoolWithMetadata } from "@/types/pool"
import { usePortfolio } from "@/hooks/nexa/use-portfolio"
import { cn } from "@/utils"

interface TradingTerminalProps {
	pool: PoolWithMetadata
}

export function TradingTerminal({ pool }: TradingTerminalProps) {
	const { isConnected } = useApp()
	const [tradeType, setTradeType] = useState<"buy" | "sell">("buy")
	const [amount, setAmount] = useState("")
	const [slippage, setSlippage] = useState("15")
	const [showSlippage, setShowSlippage] = useState(false)
	const [isInputFocused, setIsInputFocused] = useState(false)

	const { balance: tokenBalance } = useTokenBalance(pool.coinType)
	const { balance: actualBalance } = usePortfolio(pool.coinType)
	const metadata = pool.coinMetadata
	const decimals = metadata?.decimals || 9

	// use balance from nexa if available, otherwise fall back to token balance
	const effectiveBalance = actualBalance !== "0" ? actualBalance : tokenBalance
	const formattedBalance = effectiveBalance ? (Number(effectiveBalance) / Math.pow(10, decimals)).toLocaleString(undefined, { maximumFractionDigits: 4 }) : "0"

	const { isLoading, error, success, pump, dump } = usePump({
		pool,
		decimals,
		actualBalance: effectiveBalance,
	})

	// quick buy/sell amounts in SUI/%'s
	const quickBuyAmounts = [0.5, 1, 5, 10]
	const quickSellPercentages = [10, 25, 50, 75, 100]

	const handleQuickBuy = async (suiAmount: number) => {
		setAmount(suiAmount.toString())
		const slippageNum = parseFloat(slippage)

		await pump(suiAmount.toString(), slippageNum)
		setAmount("")
	}

	const handleQuickSellPercentage = async (percentage: number) => {
		const tokenAmount = (Number(effectiveBalance || 0) / Math.pow(10, decimals)) * (percentage / 100)
		setAmount(tokenAmount.toString())
		const slippageNum = parseFloat(slippage)

		await dump(tokenAmount.toString(), slippageNum)
		setAmount("")
	}

	const handleTrade = async () => {
		if (!amount || parseFloat(amount) <= 0) {
			return
		}

		const slippageNum = parseFloat(slippage)

		if (tradeType === "buy") {
			await pump(amount, slippageNum)
		} else {
			await dump(amount, slippageNum)
		}

		setAmount("")
	}

	return (
		<div className="border-2 shadow-lg rounded-xl overflow-hidden">
			<div className="p-4 border-b">
				<h3 className="text-lg font-mono uppercase tracking-wider text-foreground/80">
					TRADE::TERMINAL
				</h3>
			</div>

			<div className="p-4 space-y-4">
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

					<TabsContent value={tradeType} className="space-y-4 mt-4">
						{/* Balance */}
						{tradeType === "sell" && effectiveBalance && (
							<div className="border-2 border-dashed rounded-lg bg-background/30 p-4 space-y-3">
								<div className="flex items-center justify-between">
									<span className="font-mono text-xs uppercase text-muted-foreground">BALANCE::TOKEN</span>
									<span className="font-mono text-sm uppercase tracking-wider">
										{formattedBalance} {metadata?.symbol || "[UNKNOWN]"}
									</span>
								</div>
							</div>
						)}

						{/* Quick Buy */}
						{tradeType === "buy" && (
							<div className="space-y-3">
								<p className="font-mono text-xs uppercase text-muted-foreground">QUICK::BUY</p>
								<div className="grid grid-cols-4 gap-2">
									{quickBuyAmounts.map((quickAmount) => (
										<Button
											key={quickAmount}
											variant="outline"
											size="sm"
											className="font-mono text-xs uppercase border-2 hover:border-green-500/50 hover:bg-green-500/20 hover:text-green-500 transition-colors"
											onClick={() => handleQuickBuy(quickAmount)}
											disabled={isLoading || !isConnected}
										>
											{quickAmount} SUI
										</Button>
									))}
								</div>
							</div>
						)}

						{/* Quick Sell */}
						{tradeType === "sell" && effectiveBalance && (
							<div className="space-y-3">
								<p className="font-mono text-xs uppercase text-muted-foreground">QUICK::SELL</p>
								<div className="grid grid-cols-5 gap-2">
									{quickSellPercentages.map((percentage) => (
										<Button
											key={percentage}
											variant="outline"
											size="sm"
											className={cn(
												"font-mono text-xs uppercase border-2 transition-colors",
												percentage === 100
													? "hover:border-red-600/50 hover:bg-red-600/20 hover:text-red-600"
													: "hover:border-red-500/50 hover:bg-red-500/20 hover:text-red-500"
											)}
											onClick={() => handleQuickSellPercentage(percentage)}
											disabled={isLoading || !isConnected || !effectiveBalance}
										>
											{percentage}%
										</Button>
									))}
								</div>
							</div>
						)}

						{/* Amount Input */}
						<div className="space-y-3">
							<p className="font-mono text-xs uppercase text-muted-foreground">
								{tradeType === "buy" ? "INPUT::BUY_AMOUNT" : "INPUT::SELL_AMOUNT"}
							</p>
							<div className={cn(
								"relative border-2 transition-colors",
								isInputFocused ? "border-primary/50" : "border-border/50"
							)}>
								<Input
									type="number"
									placeholder="0.00"
									value={amount}
									onChange={(e) => setAmount(e.target.value)}
									onFocus={() => setIsInputFocused(true)}
									onBlur={() => setIsInputFocused(false)}
									className="font-mono text-lg uppercase tracking-wider border-0 focus-visible:ring-0 pr-20 bg-background/50"
									disabled={isLoading}
								/>
								<span className="absolute right-4 top-1/2 -translate-y-1/2 font-mono text-sm uppercase text-muted-foreground">
									{tradeType === "buy" ? "SUI" : metadata?.symbol || "[TOKEN]"}
								</span>
							</div>
						</div>

						{/* Slippage */}
						<div className="space-y-3">
							<button
								onClick={() => setShowSlippage(!showSlippage)}
								className="font-mono text-xs uppercase text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
							>
								SLIPPAGE::TOLERANCE [{slippage}%]
								<ChevronDown className={cn("w-3 h-3 transition-transform", showSlippage && "rotate-180")} />
							</button>
							{showSlippage && (
								<div className="grid grid-cols-4 gap-2">
									{["5", "10", "15", "20"].map((value) => (
										<Button
											key={value}
											variant={slippage === value ? "secondary" : "outline"}
											size="sm"
											className="font-mono text-xs uppercase border-2"
											onClick={() => setSlippage(value)}
										>
											{value}%
										</Button>
									))}
								</div>
							)}
						</div>

						{/* Success Display */}
						{success && (
							<Alert className="border-2 border-green-500/50 bg-green-500/10">
								<AlertDescription className="font-mono text-xs uppercase text-green-500/80">
									{success}
								</AlertDescription>
							</Alert>
						)}

						{/* Error Display */}
						{error && (
							<Alert variant="destructive" className="border-2">
								<AlertCircle className="h-4 w-4" />
								<AlertDescription className="font-mono text-xs uppercase">
									ERROR::{error}
								</AlertDescription>
							</Alert>
						)}

						{/* Trade Button */}
						<Button
							className={cn(
								"w-full font-mono uppercase tracking-wider transition-colors border-2",
								tradeType === "buy"
									? "bg-green-500/20 border-green-500/50 text-green-500 hover:bg-green-500/30 hover:border-green-500"
									: "bg-red-500/20 border-red-500/50 text-red-500 hover:bg-red-500/30 hover:border-red-500",
								(!isConnected || !amount) && "opacity-50"
							)}
							size="lg"
							onClick={handleTrade}
							disabled={!isConnected || isLoading || !amount}
						>
							{isLoading ? (
								<span className="flex items-center gap-2">
									<div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
									PROCESSING::TRANSACTION
								</span>
							) : !isConnected ? (
								<span className="flex items-center gap-2">
									<Wallet className="w-4 h-4" />
									CONNECT::WALLET
								</span>
							) : (
								<span className="flex items-center gap-2">
									<Zap className="w-4 h-4" />
									{tradeType === "buy" ? "EXECUTE::BUY" : "EXECUTE::SELL"} [{metadata?.symbol || "TOKEN"}]
								</span>
							)}
						</Button>
					</TabsContent>
				</Tabs>
			</div>
		</div>
	)
}
