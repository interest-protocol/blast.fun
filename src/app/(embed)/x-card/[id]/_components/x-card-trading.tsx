"use client"

import { useState, useEffect } from "react"
import { ExternalLink, Twitter, Globe, Send, Skull, Zap, TrendingUp, TrendingDown } from "lucide-react"
import { useCurrentAccount } from "@mysten/dapp-kit"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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

	// check if we're in Twitter's iframe
	const [isTwitterEmbed, setIsTwitterEmbed] = useState(false)
	useEffect(() => {
		const isEmbed = window.self !== window.top
		setIsTwitterEmbed(isEmbed)
	}, [])

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
			{/* Header */}
			<div className="sticky top-0 z-10 bg-background/90 backdrop-blur-sm border-b border-border">
				<div className="p-2">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-3">
							{/* Avatar */}
							<div className="relative">
								<div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse" />
								<Avatar className="relative w-14 h-14 rounded-lg border-2 border-border/50">
									<AvatarImage src={metadata?.iconUrl || ""} alt={metadata?.symbol} />
									<AvatarFallback className="font-mono text-xs uppercase bg-background text-foreground/80">
										{metadata?.symbol?.slice(0, 2) || "[??]"}
									</AvatarFallback>
								</Avatar>
							</div>
							<div>
								<div className="flex items-center gap-2">
									<h1 className="font-mono font-bold text-lg uppercase tracking-wider text-foreground/90">
										{metadata?.name || "[UNNAMED]"}
									</h1>
									<CopyableToken symbol={metadata?.symbol || "[???]"} coinType={pool.coinType} />
								</div>
								<div className="flex items-center gap-2 text-xs">
									<span className="font-mono uppercase text-muted-foreground">Created by</span>
									{showTwitterCreator ? (
										<a
											href={`https://twitter.com/${creatorTwitterName}`}
											target="_blank"
											rel="noopener noreferrer"
											className="font-mono uppercase text-primary hover:underline"
										>
											@{creatorTwitterName}
										</a>
									) : (
										<CopyableAddress address={creatorWallet} className="font-mono uppercase text-foreground/80 hover:text-foreground" />
									)}
								</div>
							</div>
						</div>

						<div className="flex items-center gap-2">
							{/* Social Links */}
							{pool.metadata?.X && (
								<Button variant="ghost" size="icon" className="h-8 w-8" asChild>
									<a href={pool.metadata.X} target="_blank" rel="noopener noreferrer">
										<Twitter className="h-4 w-4" />
									</a>
								</Button>
							)}
							{pool.metadata?.Telegram && (
								<Button variant="ghost" size="icon" className="h-8 w-8" asChild>
									<a href={pool.metadata.Telegram} target="_blank" rel="noopener noreferrer">
										<Send className="h-4 w-4" />
									</a>
								</Button>
							)}
							{pool.metadata?.Website && (
								<Button variant="ghost" size="icon" className="h-8 w-8" asChild>
									<a href={pool.metadata.Website} target="_blank" rel="noopener noreferrer">
										<Globe className="h-4 w-4" />
									</a>
								</Button>
							)}
							{isTwitterEmbed && (
								<Button
									variant="outline"
									size="sm"
									onClick={openInNewTab}
									className="font-mono text-xs uppercase"
								>
									<ExternalLink className="w-4 h-4" />
								</Button>
							)}
						</div>
					</div>
				</div>
			</div>

			{/* Main Content */}
			<div className="max-w-md mx-auto p-4 space-y-4">
				<Card className="border-2 bg-background/50 backdrop-blur-sm shadow-2xl">
					<CardContent className="p-4 !pt-0 !pb-0 space-y-4">
						<div className="font-mono text-xs uppercase text-muted-foreground tracking-wider">
							MARKET::STATISTICS
						</div>
						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-1">
								<p className="text-xs font-mono uppercase text-muted-foreground">MARKET::CAP</p>
								<p className="font-mono font-bold text-lg text-foreground/90">
									${formatAmountWithSuffix(marketCap)}
								</p>
							</div>
							<div className="space-y-1">
								<p className="text-xs font-mono uppercase text-muted-foreground">LIQUIDITY::POOL</p>
								<p className="font-mono font-bold text-lg text-foreground/90">
									{formatAmountWithSuffix(pool.quoteBalance)} SUI
								</p>
							</div>
							<div className="space-y-1">
								<p className="text-xs font-mono uppercase text-muted-foreground">TOKEN::SUPPLY</p>
								<p className="font-mono font-bold text-lg text-foreground/90">
									{formatAmountWithSuffix(pool.coinBalance)}
								</p>
							</div>
							<div className="space-y-1">
								<p className="text-xs font-mono uppercase text-muted-foreground">BONDING::PROGRESS</p>
								<p className="font-mono font-bold text-lg text-foreground/90">
									{bondingProgress.toFixed(2)}%
								</p>
							</div>
						</div>

						<div className="space-y-2">
							<div className="flex justify-between text-xs font-mono uppercase">
								<span className="text-muted-foreground">BONDING::CURVE</span>
								<span className="text-foreground/80">{bondingProgress.toFixed(2)}% COMPLETE</span>
							</div>
							<div className="relative">
								<div className="absolute inset-0 bg-primary/20 blur-md rounded-full" />
								<Progress value={bondingProgress} className="relative h-3 bg-secondary/20" />
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Trading Terminal */}
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
										<AlertDescription className="font-mono text-xs uppercase text-green-500">
											TRANSACTION::SUCCESS - {success}
										</AlertDescription>
									</Alert>
								)}

								{error && (
									<Alert variant="destructive" className="flex items-center py-2">
										<Skull className="h-4 w-4" />
										<AlertDescription className="font-mono text-xs uppercase">
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
					{isTwitterEmbed && (
						<a
							href={`https://twitter.com/intent/tweet?text=PUMPING::${metadata?.symbol}::ON::@xpump!&url=${window.location.origin}/pool/${pool.poolId}`}
							target="_blank"
							rel="noopener noreferrer"
							className="inline-flex items-center gap-1 font-mono text-xs uppercase text-primary hover:text-primary/80"
						>
							<Twitter className="w-3 h-3" />
							SHARE::TOKEN
						</a>
					)}
				</div>
			</div>
		</div>
	)
}