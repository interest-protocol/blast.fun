"use client"

import { useState } from "react"
import { Zap, Loader2 } from "lucide-react"
import Image from "next/image"
import { useApp } from "@/context/app.context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover"
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip"
import { useTrading } from "@/hooks/pump/use-trading"
import { useTokenBalance } from "@/hooks/sui/use-token-balance"
import { usePortfolio } from "@/hooks/nexa/use-portfolio"
import { useMarketData } from "@/hooks/use-market-data"
import useBalance from "@/hooks/sui/use-balance"
import type { PoolWithMetadata } from "@/types/pool"
import { cn } from "@/utils"

interface TradingPanelProps {
	pool: PoolWithMetadata
	referrerWallet?: string | null
	refCode?: string | null
}

export function TradingPanel({ pool, referrerWallet, refCode }: TradingPanelProps) {
	const [tradeType, setTradeType] = useState<"buy" | "sell">("buy")
	const [amount, setAmount] = useState("")
	const [slippage, setSlippage] = useState("15")

	const { data: marketData } = useMarketData(pool.coinType)
	const { balance: tokenBalance } = useTokenBalance(pool.coinType)
	const { balance: actualBalance, refetch: refetchPortfolio } = usePortfolio(pool.coinType)
	const { balance: suiBalance } = useBalance()
	const metadata = marketData?.coinMetadata || pool.coinMetadata
	const decimals = metadata?.decimals || 9

	// use balance from nexa if available, otherwise fall back to token balance
	const effectiveBalance = actualBalance !== "0" ? actualBalance : tokenBalance
	const balanceInDisplayUnit = effectiveBalance ? Number(effectiveBalance) / Math.pow(10, decimals) : 0
	const hasBalance = balanceInDisplayUnit > 0
	const suiBalanceNum = parseFloat(suiBalance || "0")

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
			{/* Header */}
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-2">
					<div className="font-mono text-xs font-bold uppercase">
						Trade {metadata?.symbol}
					</div>
					{refCode && (
						<Tooltip>
							<TooltipTrigger asChild>
								<div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded border border-blue-400/50 bg-blue-400/10 cursor-help">
									<div className="w-1 h-1 bg-blue-400 rounded-full" />
									<span className="font-mono text-[10px] uppercase text-blue-400">
										{refCode}
									</span>
								</div>
							</TooltipTrigger>
							<TooltipContent>
								The owner of this referral link will earn a commission.
							</TooltipContent>
						</Tooltip>
					)}
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
						disabled={isProcessing}
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
								className={cn(
									"font-mono text-[10px] h-6 p-0.5",
									suiAmount > suiBalanceNum
										? "!border-muted !bg-muted/50 text-muted-foreground cursor-not-allowed opacity-50"
										: "!border-blue-400/50 !bg-blue-400/10 text-blue-400 hover:text-blue-400/80"
								)}
								onClick={() => handleQuickAmount(suiAmount)}
								disabled={isProcessing || suiAmount > suiBalanceNum}
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
								disabled={isProcessing || !hasBalance}
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
					(!amount || isProcessing) && "opacity-50"
				)}
				onClick={handleTrade}
				disabled={!amount || isProcessing || (tradeType === "sell" && !hasBalance)}
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
	)
}