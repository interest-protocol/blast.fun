"use client"

import { Loader2, Zap } from "lucide-react"
import Image from "next/image"
import { useState } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { usePortfolio } from "@/hooks/nexa/use-portfolio"
import { useTrading } from "@/hooks/pump/use-trading"
import { useTokenBalance } from "@/hooks/sui/use-token-balance"
import { useMarketData } from "@/hooks/use-market-data"
import type { Token } from "@/types/token"
import { cn } from "@/utils"

interface TradingPanelProps {
	pool: Token
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
			const percentage = typeof value === "string" ? parseInt(value) : value

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
		<div className="space-y-3 p-3">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-2">
					<div className="font-bold font-mono text-xs uppercase">Trade {metadata?.symbol}</div>
					{refCode && (
						<Tooltip>
							<TooltipTrigger asChild>
								<div className="inline-flex cursor-help items-center gap-1 rounded border border-blue-400/50 bg-blue-400/10 px-1.5 py-0.5">
									<div className="h-1 w-1 rounded-full bg-blue-400" />
									<span className="font-mono text-[10px] text-blue-400 uppercase">{refCode}</span>
								</div>
							</TooltipTrigger>
							<TooltipContent>The owner of this referral link will earn a commission.</TooltipContent>
						</Tooltip>
					)}
				</div>

				{hasBalance && (
					<div className="font-mono text-muted-foreground text-xs">
						Balance: <span className="font-semibold text-foreground">{balanceInDisplayUnit.toFixed(2)}</span>
					</div>
				)}
			</div>

			{/* Buy/Sell Tab */}
			<div className="flex gap-1 rounded-md bg-muted p-0.5">
				<Button
					variant={tradeType === "buy" ? "default" : "ghost"}
					size="sm"
					onClick={() => setTradeType("buy")}
					className={cn(
						"h-7 flex-1 font-mono text-xs uppercase",
						tradeType === "buy"
							? "bg-green-500/80 text-white shadow-none hover:bg-green-500"
							: "text-muted-foreground hover:bg-transparent hover:text-foreground"
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
						"h-7 flex-1 font-mono text-xs uppercase",
						tradeType === "sell"
							? "bg-destructive/80 text-white shadow-none hover:bg-destructive"
							: "text-muted-foreground hover:bg-transparent hover:text-foreground"
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
						className="h-10 pr-12 font-mono"
						disabled={isProcessing}
					/>
					<span className="-translate-y-1/2 absolute top-1/2 right-3 font-mono text-muted-foreground text-xs">
						{tradeType === "buy" ? "SUI" : metadata?.symbol}
					</span>
				</div>
				<Popover>
					<PopoverTrigger asChild>
						<Button variant="outline" className="h-10 w-14 px-2 font-mono text-xs">
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
										"w-full rounded px-2 py-1.5 text-left font-mono text-xs transition-colors",
										slippage === value ? "bg-primary/20 text-primary" : "hover:bg-accent"
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
									"h-6 p-0.5 font-mono text-[10px]",
									"!border-blue-400/50 !bg-blue-400/10 text-blue-400 hover:text-blue-400/80"
								)}
								onClick={() => handleQuickAmount(suiAmount)}
								disabled={isProcessing}
							>
								<Image src="/logo/sui-logo.svg" alt="SUI" width={10} height={10} className="mr-0.5" />
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
								className="h-7 font-mono text-xs"
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
				<Alert className="border-destructive/50 bg-destructive/10 py-1.5">
					<AlertDescription className="font-mono text-[10px] text-destructive uppercase">{error}</AlertDescription>
				</Alert>
			)}

			{/* Trade Actions */}
			<Button
				className={cn(
					"h-9 w-full font-mono text-xs uppercase",
					tradeType === "buy"
						? "bg-green-400/50 text-foreground hover:bg-green-500/90"
						: "bg-destructive/80 text-foreground hover:bg-destructive",
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
						<Zap className="h-3 w-3" />
						{tradeType === "buy" ? "Buy" : "Sell"} {metadata?.symbol}
					</span>
				)}
			</Button>
		</div>
	)
}
