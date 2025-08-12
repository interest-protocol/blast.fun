"use client"

import { Zap, Wallet, Loader2 } from "lucide-react"
import React, { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover"
import { useApp } from "@/context/app.context"
import { useTrading } from "@/hooks/pump/use-trading"
import { useTokenBalance } from "@/hooks/sui/use-token-balance"
import type { PoolWithMetadata } from "@/types/pool"
import { usePortfolio } from "@/hooks/nexa/use-portfolio"
import { useMarketData } from "@/hooks/use-market-data"
import { cn } from "@/utils"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Logo } from "@/components/ui/logo"

interface TradeTerminalProps {
	pool: PoolWithMetadata
}

export function TradeTerminal({ pool }: TradeTerminalProps) {
	const { isConnected } = useApp()
	const [tradeType, setTradeType] = useState<"buy" | "sell">("buy")
	const [amount, setAmount] = useState("")
	const [slippage, setSlippage] = useState("15")

	const { data: marketData } = useMarketData(pool.coinType)
	const { balance: tokenBalance } = useTokenBalance(pool.coinType)
	const { balance: actualBalance, refetch: refetchPortfolio } = usePortfolio(pool.coinType)
	const metadata = marketData?.coinMetadata || pool.coinMetadata
	const decimals = metadata?.decimals || 9

	// use balance from nexa if available, otherwise fall back to token balance
	const effectiveBalance = actualBalance !== "0" ? actualBalance : tokenBalance
	const balanceInDisplayUnit = effectiveBalance ? Number(effectiveBalance) / Math.pow(10, decimals) : 0
	const hasBalance = balanceInDisplayUnit > 0

	const { isProcessing, error, buy, sell } = useTrading({
		pool,
		decimals,
		actualBalance: effectiveBalance,
	})

	const handleQuickAmount = async (value: number | string) => {
		if (tradeType === "buy") {
			setAmount(value.toString())
			await buy(value.toString(), parseFloat(slippage))
		} else {
			const percentage = typeof value === 'string' ? parseInt(value) : value
			const tokenAmountToSell = balanceInDisplayUnit * (percentage / 100)

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

	const isMigrating = pool.canMigrate === true

	if (!isConnected) {
		return (
			<div className="p-4 border-b border-border">
				<div className="text-center space-y-2">
					<Wallet className="w-8 h-8 text-muted-foreground mx-auto" />
					<p className="font-mono text-xs text-muted-foreground">
						Connect wallet to trade
					</p>
				</div>
			</div>
		)
	}

	return (
		<div className="relative border-b border-border">
			{isMigrating && (
				<div className="absolute inset-0 bg-background/95 backdrop-blur-sm z-10 flex items-center justify-center p-4 select-none">
					{/* background glow */}
					<div className="absolute inset-0">
						<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-yellow-400/10 rounded-full blur-3xl animate-pulse" />
					</div>

					<div className="relative text-center space-y-4">
						<div className="relative mx-auto w-20 h-20 animate-float">
							<div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full blur-2xl animate-pulse opacity-50" />
							<div className="absolute inset-0 flex items-center justify-center">
								<Logo className="w-16 h-16 text-yellow-400/80 animate-pulse" />
							</div>
						</div>

						<div className="space-y-2">
							<p className="font-mono text-sm font-bold uppercase tracking-wider text-yellow-400/80">
								MIGRATION::IN_PROGRESS
							</p>

							<p className="font-mono text-xs text-muted-foreground/70 max-w-xs mx-auto">
								TOKEN_IS_MIGRATING::PLEASE_WAIT
							</p>
						</div>
					</div>
				</div>
			)}

			<div className="p-3 space-y-3">
				{/* Header */}
				<div className="flex items-center justify-between">
					<div className="font-mono text-xs font-bold uppercase">
						Trade {metadata?.symbol}
					</div>

					{hasBalance && (
						<div className="font-mono text-xs text-muted-foreground">
							Balance: <span className="text-foreground font-semibold">
								{balanceInDisplayUnit.toFixed(2)}
							</span>
						</div>
					)}
				</div>

				{/* Buy/Sell Tab */}
				<div className="flex gap-1 p-0.5 bg-muted rounded-md">
					<Button
						variant={tradeType === "buy" ? "default" : "ghost"}
						size="sm"
						onClick={() => setTradeType("buy")}
						className={cn(
							"flex-1 font-mono text-xs uppercase h-7",
							tradeType === "buy"
								? "bg-green-500/80 hover:bg-green-500 text-white shadow-none"
								: "hover:bg-transparent hover:text-foreground text-muted-foreground"
						)}
					>
						Buy
					</Button>
					<Button
						variant={tradeType === "sell" ? "destructive" : "ghost"}
						size="sm"
						onClick={() => setTradeType("sell")}
						disabled={!hasBalance}
						className={cn(
							"flex-1 font-mono text-xs uppercase h-7",
							tradeType === "sell"
								? "bg-destructive/80 hover:bg-destructive text-white shadow-none"
								: "hover:bg-transparent hover:text-foreground text-muted-foreground"
						)}
					>
						Sell
					</Button>
				</div>

				{/* Amount Input */}
				<div className="flex gap-1">
					<div className="relative flex-1">
						<Input
							type="number"
							placeholder="0.00"
							value={amount}
							onChange={(e) => setAmount(e.target.value)}
							className="pr-12 h-10 font-mono"
							disabled={isProcessing || isMigrating}
						/>
						<span className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-xs text-muted-foreground">
							{tradeType === "buy" ? "SUI" : metadata?.symbol}
						</span>
					</div>
					<Popover>
						<PopoverTrigger asChild>
							<Button
								variant="outline"
								className="w-14 h-10 font-mono text-xs px-2"
							>
								{slippage}%
							</Button>
						</PopoverTrigger>
						<PopoverContent className="w-32 p-2" align="end">
							<div className="space-y-1">
								{["5", "10", "15", "20"].map((value) => (
									<button
										key={value}
										onClick={() => setSlippage(value)}
										className={cn(
											"w-full px-2 py-1.5 rounded font-mono text-xs transition-colors text-left",
											slippage === value
												? "bg-primary/20 text-primary"
												: "hover:bg-accent"
										)}
									>
										{value}% slippage
									</button>
								))}
							</div>
						</PopoverContent>
					</Popover>
				</div>

				{/* Quick Actions */}
				<div className="space-y-1">
					{tradeType === "buy" ? (
						<div className="grid grid-cols-4 gap-1">
							{[1, 5, 10, 50].map((suiAmount) => (
								<Button
									key={suiAmount}
									variant="outline"
									size="sm"
									className="font-mono text-[10px] h-6 !border-blue-400/50 !bg-blue-400/10 text-blue-400 hover:text-blue-400/80 p-0.5"
									onClick={() => handleQuickAmount(suiAmount)}
									disabled={isProcessing || isMigrating}
								>
									<Image
										src="/logo/sui-logo.svg"
										alt="SUI"
										width={10}
										height={10}
										className="mr-0.5"
									/>
									{suiAmount}
								</Button>
							))}
						</div>
					) : (
						<div className="grid grid-cols-4 gap-1">
							{[25, 50, 75, 100].map((percentage) => (
								<Button
									key={percentage}
									variant="outline"
									size="sm"
									className="font-mono text-xs h-7"
									onClick={() => handleQuickAmount(percentage)}
									disabled={isProcessing || !hasBalance || isMigrating}
								>
									{percentage}%
								</Button>
							))}
						</div>
					)}
				</div>

				{/* Error */}
				{error && (
					<Alert className="py-1.5 border-destructive/50 bg-destructive/10">
						<AlertDescription className="font-mono text-[10px] uppercase text-destructive">
							{error}
						</AlertDescription>
					</Alert>
				)}

				{/* Trade Actions */}
				<Button
					className={cn(
						"w-full font-mono uppercase text-xs h-9",
						tradeType === "buy"
							? "bg-green-400/50 hover:bg-green-500/90 text-foreground"
							: "bg-destructive/80 hover:bg-destructive text-foreground",
						(!amount || isProcessing || isMigrating) && "opacity-50"
					)}
					onClick={handleTrade}
					disabled={!amount || isProcessing || (tradeType === "sell" && !hasBalance) || isMigrating}
				>
					{isProcessing ? (
						<span className="flex items-center gap-1.5">
							<Loader2 className="h-3.5 w-3.5 animate-spin" />
							Processing
						</span>
					) : (
						<span className="flex items-center gap-1.5">
							<Zap className="w-3 h-3" />
							{tradeType === "buy" ? "Buy" : "Sell"} {metadata?.symbol}
						</span>
					)}
				</Button>
			</div>
		</div>
	)
}