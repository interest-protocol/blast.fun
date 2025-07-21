"use client"

import { useState, useEffect } from "react"
import { ExternalLink, Twitter, Globe, Send, Skull, Zap, TrendingUp, TrendingDown, BarChart3, Droplets, Coins, Activity } from "lucide-react"
import { useCurrentAccount } from "@mysten/dapp-kit"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent } from "@/components/ui/card"
import { usePump } from "@/hooks/pump/use-pump"
import { useTokenBalance } from "@/hooks/sui/use-token-balance"
import type { PoolWithMetadata } from "@/types/pool"
import { formatAmountWithSuffix } from "@/utils/format"
import { CopyableAddress } from "@/components/shared/copyable-address"
import { CopyableToken } from "@/components/shared/copyable-token"

interface XCardTradingProps {
	pool: PoolWithMetadata
}

export function XCardTrading({ pool }: XCardTradingProps) {
	const account = useCurrentAccount()
	const { balance: tokenBalance } = useTokenBalance(pool.coinType)
	const metadata = pool.coinMetadata
	const decimals = metadata?.decimals || 9

	const [activeTab, setActiveTab] = useState("buy")
	const [amount, setAmount] = useState("")
	const [slippage, setSlippage] = useState("15")

	const { isLoading, error, success, pump, dump } = usePump({
		pool,
		decimals,
	})

	// quick buy amounts in SUI
	const quickBuyAmounts = [0.5, 1, 5, 10]
	const quickSellPercentages = [25, 50, 100]

	const handleQuickBuy = async (suiAmount: number) => {
		setAmount(suiAmount.toString())
		const slippageNum = parseFloat(slippage)
		await pump(suiAmount.toString(), slippageNum)
		setAmount("")
	}

	const handleQuickSellPercentage = async (percentage: number) => {
		const tokenAmount = (Number(tokenBalance || 0) / Math.pow(10, decimals)) * (percentage / 100)
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

		if (activeTab === "buy") {
			await pump(amount, slippageNum)
		} else {
			await dump(amount, slippageNum)
		}

		setAmount("")
	}

	const openInNewTab = () => {
		window.open(`${window.location.origin}/pool/${pool.poolId}`, "_blank")
	}

	// @todo: fix the marketcap calculation..
	const bondingProgress = parseFloat(pool.bondingCurve)
	const marketCap = parseFloat(pool.quoteBalance) * 2

	const creatorTwitterId = pool.metadata?.CreatorTwitterId
	const creatorTwitterName = pool.metadata?.CreatorTwitterName
	const creatorWallet = pool.metadata?.CreatorWallet || pool.creatorAddress
	const showTwitterCreator = creatorTwitterId && creatorTwitterName

	return (
		<div className="flex-1 overflow-auto bg-background">
			{/* Token Header */}
			<div className="sticky top-0 z-10 bg-gradient-to-b from-background via-background/95 to-background/90 backdrop-blur-sm border-b border-border">
				<div className="px-4 py-3 space-y-3">
					{/* Token Info Row */}
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-3">
							{/* Avatar with glow effect */}
							<div className="relative group">
								<div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-purple-500/30 blur-2xl rounded-full opacity-60 group-hover:opacity-100 transition-opacity duration-500" />
								<Avatar className="relative w-16 h-16 rounded-xl border-2 border-primary/20 group-hover:border-primary/40 transition-all duration-300 shadow-lg">
									<AvatarImage src={metadata?.iconUrl || ""} alt={metadata?.symbol} className="object-cover" />
									<AvatarFallback className="font-mono text-sm uppercase bg-gradient-to-br from-primary/20 to-purple-500/20 text-foreground">
										{metadata?.symbol?.slice(0, 2) || "??"}
									</AvatarFallback>
								</Avatar>
							</div>
							<div className="space-y-1">
								<div className="flex items-center gap-2">
									<h1 className="font-mono font-bold text-xl uppercase tracking-wider text-foreground">
										{metadata?.name || "[UNNAMED]"}
									</h1>
									<CopyableToken symbol={metadata?.symbol || "[???]"} coinType={pool.coinType} className="px-2 py-0.5 bg-primary/10 rounded-md" />
								</div>
								<div className="flex items-center gap-2 text-xs">
									<span className="font-mono uppercase text-muted-foreground/80">Created by</span>
									{showTwitterCreator ? (
										<a
											href={`https://twitter.com/${creatorTwitterName}`}
											target="_blank"
											rel="noopener noreferrer"
											className="font-mono uppercase text-primary hover:text-primary/80 transition-colors"
										>
											@{creatorTwitterName}
										</a>
									) : (
										<CopyableAddress address={creatorWallet} className="font-mono uppercase text-foreground/60 hover:text-foreground/80" />
									)}
								</div>
							</div>
						</div>

						<div className="flex items-center gap-2">
							{/* Social Links */}
							{pool.metadata?.X && (
								<Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/10" asChild>
									<a href={pool.metadata.X} target="_blank" rel="noopener noreferrer">
										<Twitter className="h-4 w-4" />
									</a>
								</Button>
							)}
							{pool.metadata?.Telegram && (
								<Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/10" asChild>
									<a href={pool.metadata.Telegram} target="_blank" rel="noopener noreferrer">
										<Send className="h-4 w-4" />
									</a>
								</Button>
							)}
							{pool.metadata?.Website && (
								<Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/10" asChild>
									<a href={pool.metadata.Website} target="_blank" rel="noopener noreferrer">
										<Globe className="h-4 w-4" />
									</a>
								</Button>
							)}

							{/* redirect to real page */}
							<Button
								variant="outline"
								size="sm"
								onClick={openInNewTab}
								className="font-mono text-xs uppercase hover:bg-primary/10 hover:border-primary/40"
							>
								<ExternalLink className="w-4 h-4" />
							</Button>
						</div>
					</div>

					{/* Market Stats Grid */}
					<div className="grid grid-cols-3 gap-2">
						<div className="bg-gradient-to-br from-green-500/10 to-green-600/5 rounded-lg p-2 border border-green-500/20">
							<div className="flex items-center gap-1.5">
								<BarChart3 className="w-3 h-3 text-green-500/60" />
								<span className="text-[10px] font-mono uppercase text-green-500/80">Market Cap</span>
							</div>
							<p className="font-mono font-bold text-sm text-green-500 mt-0.5">
								${formatAmountWithSuffix(marketCap)}
							</p>
						</div>

						<div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 rounded-lg p-2 border border-blue-500/20">
							<div className="flex items-center gap-1.5">
								<Droplets className="w-3 h-3 text-blue-500/60" />
								<span className="text-[10px] font-mono uppercase text-blue-500/80">Liquidity</span>
							</div>
							<p className="font-mono font-bold text-sm text-blue-500 mt-0.5">
								{formatAmountWithSuffix(pool.quoteBalance)} SUI
							</p>
						</div>

						<div className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 rounded-lg p-2 border border-purple-500/20">
							<div className="flex items-center gap-1.5">
								<Coins className="w-3 h-3 text-purple-500/60" />
								<span className="text-[10px] font-mono uppercase text-purple-500/80">Supply</span>
							</div>
							<p className="font-mono font-bold text-sm text-purple-500 mt-0.5">
								{formatAmountWithSuffix(pool.coinBalance)}
							</p>
						</div>
					</div>
				</div>
			</div>

			{/* Main Content */}
			<div className="max-w-md mx-auto p-4 space-y-4">
				<Card className="border-2 bg-background/50 backdrop-blur-sm shadow-2xl">
					<CardContent className="p-4 !pt-0 !pb-0">
						<Tabs value={activeTab} onValueChange={setActiveTab}>
							<TabsList className="grid w-full grid-cols-2 bg-background/50">
								<TabsTrigger
									value="buy"
									className="font-mono uppercase data-[state=active]:bg-green-500/20 data-[state=active]:text-green-500"
								>
									<TrendingUp className="w-4 h-4 mr-2" />
									BUY
								</TabsTrigger>
								<TabsTrigger
									value="sell"
									className="font-mono uppercase data-[state=active]:bg-red-500/20 data-[state=active]:text-red-500"
								>
									<TrendingDown className="w-4 h-4 mr-2" />
									SELL
								</TabsTrigger>
							</TabsList>

							<TabsContent value={activeTab} className="space-y-4 mt-6">
								{activeTab === "buy" && (
									<div className="space-y-2">
										<p className="font-mono text-xs uppercase text-muted-foreground">QUICK::BUY</p>
										<div className="grid grid-cols-4 gap-2">
											{quickBuyAmounts.map((quickAmount) => (
												<Button
													key={quickAmount}
													variant="outline"
													size="sm"
													className="font-mono text-xs uppercase border-border/50 hover:border-green-500/50 hover:text-green-500 hover:bg-green-500/10"
													onClick={() => handleQuickBuy(quickAmount)}
													disabled={isLoading || !account}
												>
													{quickAmount} SUI
												</Button>
											))}
										</div>
									</div>
								)}

								{activeTab === "sell" && (
									<div className="space-y-2">
										<p className="font-mono text-xs uppercase text-muted-foreground">QUICK::SELL</p>
										<div className="grid grid-cols-3 gap-2">
											{quickSellPercentages.map((percentage) => (
												<Button
													key={percentage}
													variant="outline"
													size="sm"
													className="font-mono text-xs uppercase border-border/50 hover:border-red-500/50 hover:text-red-500 hover:bg-red-500/10"
													onClick={() => handleQuickSellPercentage(percentage)}
													disabled={isLoading || !account || !tokenBalance}
												>
													{percentage}%
												</Button>
											))}
										</div>
									</div>
								)}

								<div className="space-y-2">
									<Label className="font-mono text-xs uppercase text-muted-foreground">
										AMOUNT::{activeTab === "buy" ? "SUI" : metadata?.symbol || "TOKEN"}
									</Label>
									<div className="relative">
										<div className="absolute inset-0 bg-primary/10 blur-xl rounded-lg" />
										<Input
											type="number"
											placeholder="0.0"
											value={amount}
											onChange={(e) => setAmount(e.target.value)}
											className="relative bg-background/50 border-2 border-border/50 text-foreground text-lg h-12 font-mono focus:border-primary/50"
											disabled={isLoading}
										/>
									</div>
								</div>

								{/* Token Balance */}
								{account && activeTab === "sell" && (
									<div className="font-mono text-xs uppercase text-muted-foreground">
										BALANCE::{Number(tokenBalance || 0) / Math.pow(10, decimals)} {metadata?.symbol}
									</div>
								)}

								{/* Slippage */}
								<details className="group">
									<summary className="cursor-pointer font-mono text-xs uppercase text-muted-foreground hover:text-foreground">
										SLIPPAGE::{slippage}%
									</summary>
									<div className="mt-2 grid grid-cols-4 gap-2">
										{["5", "10", "15", "20"].map((value) => (
											<Button
												key={value}
												variant={slippage === value ? "secondary" : "outline"}
												size="sm"
												className="font-mono text-xs uppercase"
												onClick={() => setSlippage(value)}
											>
												{value}%
											</Button>
										))}
									</div>
								</details>

								{success && (
									<Alert className="py-2 border-green-500/50 bg-green-500/10">
										<AlertDescription className="flex items-center gap-2 font-mono text-xs uppercase text-green-500">
											<Zap className="h-4 w-4 flex-shrink-0" />
											TRANSACTION::SUCCESS - {success}
										</AlertDescription>
									</Alert>
								)}

								{error && (
									<Alert variant="destructive" className="py-2">
										<AlertDescription className="flex items-center gap-2 font-mono text-xs uppercase">
											<Skull className="h-4 w-4 flex-shrink-0" />
											ERROR::{error}
										</AlertDescription>
									</Alert>
								)}

								{account ? (
									<Button
										onClick={handleTrade}
										disabled={!amount || isLoading || parseFloat(amount) <= 0}
										className={`w-full h-12 font-mono uppercase tracking-wider font-bold transition-all duration-300 ${activeTab === "buy"
											? "bg-green-500 hover:bg-green-600 text-white shadow-[0_0_20px_rgba(34,197,94,0.5)]"
											: "bg-red-500 hover:bg-red-600 text-white shadow-[0_0_20px_rgba(239,68,68,0.5)]"
											}`}
									>
										{isLoading ? (
											<>PROCESSING...</>
										) : (
											<>
												<Zap className="mr-2 h-4 w-4" />
												{activeTab === "buy" ? "PUMP" : "DUMP"} {metadata?.symbol || "[TOKEN]"}
											</>
										)}
									</Button>
								) : (
									<div className="text-center space-y-2">
										<Skull className="w-8 h-8 mx-auto text-foreground/20" />
										<p className="font-mono text-xs uppercase text-muted-foreground">
											WALLET::NOT_CONNECTED
										</p>
										<p className="font-mono text-xs uppercase text-muted-foreground/60">
											CONNECT_WALLET_TO_TRADE
										</p>
									</div>
								)}
							</TabsContent>
						</Tabs>
					</CardContent>
				</Card>

				{/* Footer */}
				<div className="text-center space-y-2 pb-4">
					<p className="font-mono font-bold text-xs uppercase text-muted-foreground">
						xpump.fun • Powered by Sui
					</p>

					{/* {isTwitterEmbed && (
						<a
							href={`https://twitter.com/intent/tweet?text=PUMPING::${metadata?.symbol}::ON::@xpump!&url=${window.location.origin}/pool/${pool.poolId}`}
							target="_blank"
							rel="noopener noreferrer"
							className="inline-flex items-center gap-1 font-mono text-xs uppercase text-primary hover:text-primary/80"
						>
							<Twitter className="w-3 h-3" />
							SHARE::TOKEN
						</a>
					)} */}
				</div>
			</div>
		</div>
	)
}