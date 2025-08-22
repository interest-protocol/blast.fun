"use client"

import React, { useState, useEffect, useMemo } from "react"
import { Loader2, Settings2, Wallet, Activity, Pencil, Check, X, Rocket, Flame, Edit2, AlertTriangle } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { TokenAvatar } from "@/components/tokens/token-avatar"
import { useApp } from "@/context/app.context"
import { useTwitter } from "@/context/twitter.context"
import { useTrading } from "@/hooks/pump/use-trading"
import { useTokenBalance } from "@/hooks/sui/use-token-balance"
import { usePortfolio } from "@/hooks/nexa/use-portfolio"
import { useTokenProtection } from "@/hooks/use-token-protection"
import { usePresetStore } from "@/stores/preset-store"
import type { PoolWithMetadata } from "@/types/pool"
import { cn } from "@/utils"
import { formatNumberWithSuffix } from "@/utils/format"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { TradeSettings } from "./trade-settings"
import { MIST_PER_SUI } from "@mysten/sui/utils"
import { pumpSdk } from "@/lib/pump"
import { getBuyQuote, getSellQuote } from "@/lib/aftermath"
import BigNumber from "bignumber.js"
import { BsTwitterX } from "react-icons/bs"
import { BurnDialog } from "./burn-dialog"
import { UpdateMetadataDialog } from "./update-metadata-dialog"
import { Separator } from "@/components/ui/separator"

interface TradeTerminalProps {
	pool: PoolWithMetadata
	referral?: string
}

export function TradeTerminal({ pool, referral }: TradeTerminalProps) {
	const { isConnected, address } = useApp()
	const { isLoggedIn: isTwitterLoggedIn, login: twitterLogin } = useTwitter()
	const { settings: protectionSettings } = useTokenProtection(pool.poolId, pool.isProtected)
	const [tradeType, setTradeType] = useState<"buy" | "sell">("buy")
	const [amount, setAmount] = useState("")
	const [settingsOpen, setSettingsOpen] = useState(false)
	const [burnDialogOpen, setBurnDialogOpen] = useState(false)
	const [updateMetadataDialogOpen, setUpdateMetadataDialogOpen] = useState(false)
	const [referrerWallet, setReferrerWallet] = useState<string | null>(null)
	const [editingQuickBuy, setEditingQuickBuy] = useState(false)
	const [editingQuickSell, setEditingQuickSell] = useState(false)
	const [tempQuickBuyAmounts, setTempQuickBuyAmounts] = useState<number[]>([])
	const [tempQuickSellPercentages, setTempQuickSellPercentages] = useState<number[]>([])

	const {
		slippage,
		quickBuyAmounts,
		quickSellPercentages,
		setQuickBuyAmounts,
		setQuickSellPercentages,
	} = usePresetStore()

	const { balance: tokenBalance } = useTokenBalance(pool.coinType)
	const { balance: actualBalance, refetch: refetchPortfolio } = usePortfolio(pool.coinType)
	const { balance: suiBalance } = useTokenBalance("0x2::sui::SUI")

	// derived states
	const metadata = pool.coinMetadata
	const marketData = pool.marketData
	const decimals = metadata?.decimals || 9
	const effectiveBalance = actualBalance !== "0" ? actualBalance : tokenBalance
	const balanceInDisplayUnit = effectiveBalance ? Number(effectiveBalance) / Math.pow(10, decimals) : 0
	const hasBalance = balanceInDisplayUnit > 0
	const suiBalanceInDisplayUnit = suiBalance ? Number(suiBalance) / Number(MIST_PER_SUI) : 0
	
	// Check if user is the token creator
	const isCreator = address && pool.creatorAddress && address === pool.creatorAddress

	// Precise balance calculation for MAX button using BigNumber
	const balanceInDisplayUnitPrecise = useMemo(() => {
		// Guard against undefined or null effectiveBalance
		if (!effectiveBalance || effectiveBalance === undefined || effectiveBalance === null) {
			return "0"
		}
		
		// Additional safety check to ensure effectiveBalance is a valid value
		try {
			const balanceBN = new BigNumber(effectiveBalance)
			// Check if BigNumber is valid
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

	// prices for USD calculations from server data
	const suiPrice = marketData?.suiPrice || 4
	const tokenPrice = marketData?.coinPrice || 0

	// initialize temp amounts with store values
	useEffect(() => {
		setTempQuickBuyAmounts(quickBuyAmounts)
		setTempQuickSellPercentages(quickSellPercentages)
	}, [quickBuyAmounts, quickSellPercentages])

	// state for quote from bonding curve
	const [quote, setQuote] = useState<{ memeAmountOut?: bigint; suiAmountOut?: bigint; coinAmountOut?: bigint } | null>(null)
	const [isLoadingQuote, setIsLoadingQuote] = useState(false)
	const [isRefreshingQuote, setIsRefreshingQuote] = useState(false)

	const fetchQuote = async (isRefresh = false) => {
		if (!amount || parseFloat(amount) === 0 || !pool.poolId) {
			setQuote(null)
			return
		}

		if (isRefresh) {
			setIsRefreshingQuote(true)
		} else {
			setIsLoadingQuote(true)
		}

		try {
			const isMigrated = pool.migrated === true

			if (tradeType === "buy") {
				// convert SUI amount to MIST for the quote
				const amountBN = new BigNumber(amount)
				const mistPerSuiBN = new BigNumber(MIST_PER_SUI.toString())
				const amountInMist = BigInt(amountBN.multipliedBy(mistPerSuiBN).integerValue(BigNumber.ROUND_DOWN).toString())

				if (isMigrated) {
					const quoteResult = await getBuyQuote(pool.coinType, amountInMist, slippage)
					setQuote({
						memeAmountOut: quoteResult.amountOut,
						suiAmountOut: amountInMist, // Amount being spent
						coinAmountOut: quoteResult.amountOut // Tokens received
					})
				} else {
					const quoteResult = await pumpSdk.quotePump({
						pool: pool.poolId,
						amount: amountInMist,
					})
					setQuote(quoteResult)
				}
			} else {
				// for sell, convert token amount to smallest unit
				const amountBN = new BigNumber(amount)
				const tokenInSmallestUnit = BigInt(amountBN.multipliedBy(Math.pow(10, decimals)).integerValue(BigNumber.ROUND_DOWN).toString())

				if (isMigrated) {
					const quoteResult = await getSellQuote(pool.coinType, tokenInSmallestUnit, slippage)
					setQuote({
						memeAmountOut: tokenInSmallestUnit,
						suiAmountOut: quoteResult.amountOut,
						coinAmountOut: quoteResult.amountOut
					})
				} else {
					// use pump SDK for bonding curve tokens
					const quoteResult = await pumpSdk.quoteDump({
						pool: pool.poolId,
						amount: tokenInSmallestUnit,
					})
					setQuote({
						memeAmountOut: tokenInSmallestUnit,
						suiAmountOut: quoteResult.quoteAmountOut,
						coinAmountOut: quoteResult.quoteAmountOut
					})
				}
			}
		} catch (error) {
			console.error("Failed to fetch quote:", error)
			setQuote(null)
		} finally {
			setIsLoadingQuote(false)
			setIsRefreshingQuote(false)
		}
	}

	// initial quote fetch when amount changes
	useEffect(() => {
		const timer = setTimeout(() => fetchQuote(false), 300)
		return () => clearTimeout(timer)
	}, [amount, tradeType, pool.poolId, pool.coinType, pool.migrated, decimals, slippage])

	// refresh quote every 15 seconds
	useEffect(() => {
		if (!amount || parseFloat(amount) === 0) return

		const interval = setInterval(() => {
			fetchQuote(true)
		}, 15000)

		return () => clearInterval(interval)
	}, [amount, tradeType, pool.poolId, pool.coinType, pool.migrated, decimals, slippage])

	// calculate output amount based on bonding curve quote
	const calculateOutputAmount = useMemo(() => {
		if (!quote) return 0

		if (tradeType === "buy" && quote.memeAmountOut) {
			// convert from smallest unit to display unit
			const tokenAmount = Number(quote.memeAmountOut) / Math.pow(10, decimals)
			return tokenAmount
		} else if (tradeType === "sell" && quote.suiAmountOut) {
			// convert MIST to SUI for display
			const suiAmount = Number(quote.suiAmountOut) / Number(MIST_PER_SUI)
			return suiAmount
		}
		return 0
	}, [quote, tradeType, decimals])

	// calculate USD value
	const usdValue = useMemo(() => {
		if (!amount || parseFloat(amount) === 0) return "0.00"

		if (tradeType === "buy") {
			return (parseFloat(amount) * suiPrice).toFixed(2)
		} else {
			return (calculateOutputAmount * suiPrice).toFixed(2)
		}
	}, [amount, tradeType, suiPrice, calculateOutputAmount])

	// fetch referrer wallet if referral code exists
	useEffect(() => {
		if (referral) {
			fetch(`/api/referrals?refCode=${referral}`)
				.then(res => res.json())
				.then(data => {
					if (data.wallet) {
						setReferrerWallet(data.wallet)
					}
				})
				.catch(console.error)
		}
	}, [referral])

	const { isProcessing, error, buy, sell } = useTrading({
		pool,
		decimals,
		actualBalance: effectiveBalance,
		referrerWallet,
	})

	const handleQuickAmount = (value: number) => {
		if (tradeType === "buy") {
			setAmount(value.toString())
		} else {
			// for sell, calculate percentage
			const percentage = value

			// Safety check: ensure we have a valid balance before calculating
			if (!balanceInDisplayUnitPrecise || balanceInDisplayUnitPrecise === "0") {
				setAmount("0")
				return
			}

			if (percentage === 100) {
				// Use precise balance for 100%
				setAmount(balanceInDisplayUnitPrecise)
			} else {
				// For other percentages, use BigNumber for precise calculation
				try {
					const balanceBN = new BigNumber(balanceInDisplayUnitPrecise)
					const percentageBN = new BigNumber(percentage).dividedBy(100)
					const tokenAmountToSell = balanceBN.multipliedBy(percentageBN).toFixed(9, BigNumber.ROUND_DOWN)
					setAmount(tokenAmountToSell)
				} catch (error) {
					console.error("Error calculating quick sell amount:", error)
					setAmount("0")
				}
			}
		}
	}

	const handleSaveQuickBuyAmounts = () => {
		setQuickBuyAmounts(tempQuickBuyAmounts)
		setEditingQuickBuy(false)
	}

	const handleSaveQuickSellPercentages = () => {
		setQuickSellPercentages(tempQuickSellPercentages)
		setEditingQuickSell(false)
	}

	const handleTrade = async () => {
		if (!amount || parseFloat(amount) <= 0) return

		if (tradeType === "buy") {
			const requiredSui = parseFloat(amount)
			if (requiredSui > suiBalanceInDisplayUnit) {
				return
			}

			await buy(amount, slippage)
		} else {
			const requiredTokens = parseFloat(amount)
			if (requiredTokens > balanceInDisplayUnit) {
				return
			}

			await sell(amount, slippage)
		}

		await refetchPortfolio()
		setAmount("")
	}

	const isMigrating = pool.canMigrate === true && !pool.migrated

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
						<div className="relative mx-auto w-20 h-20">
							<div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full blur-2xl animate-pulse opacity-50" />
							<div className="absolute inset-0 flex items-center justify-center">
								<Rocket className="w-16 h-16 text-yellow-400/80 animate-pulse" />
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
				{/* Buy/Sell Tabs */}
				<div className="grid grid-cols-2 gap-1 p-1 bg-muted/30 rounded-lg">
					<button
						onClick={() => setTradeType("buy")}
						className={cn(
							"py-2 rounded-md font-mono text-xs uppercase transition-all",
							tradeType === "buy"
								? "bg-green-500/20 text-green-500 border border-green-500/50"
								: "hover:bg-muted/50 text-muted-foreground"
						)}
					>
						Buy
					</button>
					<button
						onClick={() => setTradeType("sell")}
						disabled={!hasBalance}
						className={cn(
							"py-2 rounded-md font-mono text-xs uppercase transition-all",
							tradeType === "sell"
								? "bg-red-500/20 text-red-500 border border-red-500/50"
								: "hover:bg-muted/50 text-muted-foreground",
							!hasBalance && "opacity-50 cursor-not-allowed"
						)}
					>
						Sell
					</button>
				</div>

				{/* Input Section with Balance */}
				<div className="border border-border/50 rounded-lg p-3 space-y-2 bg-muted/5">
					{/* Balance Header */}
					<div className="flex justify-between items-center text-xs">
						<div className="flex items-center gap-1.5 text-muted-foreground">
							<Wallet className="h-3.5 w-3.5" />
							<span>Balance</span>
						</div>
						<div className="flex items-center gap-2">
							<span className="text-foreground font-mono">
								{tradeType === "buy"
									? formatNumberWithSuffix(suiBalanceInDisplayUnit)
									: formatNumberWithSuffix(balanceInDisplayUnit)
								}
							</span>
							<span className="text-muted-foreground">
								{tradeType === "buy" ? "SUI" : metadata?.symbol}
							</span>
							<button
								onClick={() => {
									if (tradeType === "buy") {
										// leave some SUI for gas
										const maxSui = Math.max(0, suiBalanceInDisplayUnit - 0.02)
										setAmount(maxSui.toString())
									} else {
										// Safety check for sell - ensure we have a valid balance
										if (!balanceInDisplayUnitPrecise || balanceInDisplayUnitPrecise === "0") {
											setAmount("0")
										} else {
											setAmount(balanceInDisplayUnitPrecise)
										}
									}
								}}
								className="text-blue-400 hover:text-blue-300 font-medium text-xs transition-colors"
								disabled={isProcessing || (tradeType === "sell" && !hasBalance)}
							>
								MAX
							</button>
						</div>
					</div>

					{/* Amount Input */}
					<div className="space-y-1.5">
						<div className="flex items-center gap-2">
							<input
								type="text"
								placeholder="0.00"
								value={amount}
								onChange={(e) => setAmount(e.target.value)}
								className="flex-1 bg-transparent text-2xl font-medium outline-none placeholder:text-muted-foreground/50 text-foreground min-w-0"
								disabled={isProcessing}
								inputMode="decimal"
							/>
							<div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-muted/20 rounded-md border border-border/50 shrink-0">
								{tradeType === "buy" ? (
									<Image
										src="/logo/sui-logo.svg"
										alt="SUI"
										width={18}
										height={18}
										className="rounded-full shrink-0"
									/>
								) : (
									<TokenAvatar
										iconUrl={metadata?.iconUrl}
										symbol={metadata?.symbol}
										name={metadata?.name}
										className="w-[18px] h-[18px] rounded-full shrink-0"
										fallbackClassName="text-xs"
										enableNSFWCheck={false}
									/>
								)}
								<span className="text-sm font-medium whitespace-nowrap">
									{tradeType === "buy" ? "SUI" : metadata?.symbol}
								</span>
							</div>
						</div>

						{/* Price Display */}
						<span className="text-xs text-muted-foreground">
							≈ ${usdValue} USD
						</span>
					</div>
				</div>

				{/* Quick Actions with Inline Edit */}
				<div className="space-y-2">
					<div className="flex gap-1.5">
						{tradeType === "buy" ? (
							<>
								{editingQuickBuy ? (
									tempQuickBuyAmounts.map((suiAmount, index) => (
										<input
											key={index}
											type="number"
											value={suiAmount}
											onChange={(e) => {
												const newAmounts = [...tempQuickBuyAmounts]
												newAmounts[index] = parseFloat(e.target.value) || 0
												setTempQuickBuyAmounts(newAmounts)
											}}
											onKeyDown={(e) => {
												if (e.key === 'Enter') {
													handleSaveQuickBuyAmounts()
												}
												if (e.key === 'Escape') {
													setTempQuickBuyAmounts(quickBuyAmounts)
													setEditingQuickBuy(false)
												}
											}}
											className="flex-1 h-9 text-xs text-center rounded-md border border-border bg-background focus:border-primary focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
											step="0.01"
											min="0"
											style={{ minWidth: 0 }}
										/>
									))
								) : (
									quickBuyAmounts.map((suiAmount: number, index: number) => (
										<button
											key={index}
											className={cn(
												"flex-1 py-2 px-3 rounded-lg flex justify-center items-center",
												"border border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20",
												"transition-all duration-200",
												"group",
												(isProcessing || isMigrating) && "opacity-50 cursor-not-allowed"
											)}
											onClick={() => handleQuickAmount(suiAmount)}
											disabled={isProcessing || isMigrating}
											style={{ minWidth: 0 }}
										>
											<span className="text-xs font-semibold text-blue-400 group-hover:text-blue-300 whitespace-nowrap">
												{suiAmount} SUI
											</span>
										</button>
									))
								)}

								{editingQuickBuy ? (
									<div className="flex gap-1">
										<button
											className="h-9 w-9 flex items-center justify-center rounded-lg border border-green-500/50 bg-green-500/10 hover:bg-green-500/20 transition-colors"
											title="Save changes"
											onClick={handleSaveQuickBuyAmounts}
										>
											<Check className="h-3.5 w-3.5 text-green-500" />
										</button>
										<button
											className="h-9 w-9 flex items-center justify-center rounded-lg border border-destructive/50 bg-destructive/10 hover:bg-destructive/20 transition-colors"
											title="Cancel"
											onClick={() => {
												setTempQuickBuyAmounts(quickBuyAmounts)
												setEditingQuickBuy(false)
											}}
										>
											<X className="h-3.5 w-3.5 text-destructive" />
										</button>
									</div>
								) : (
									<button
										className="h-9 w-9 flex items-center justify-center rounded-lg border border-border bg-background hover:bg-muted/50 transition-colors"
										title="Edit quick buy amounts"
										onClick={() => setEditingQuickBuy(true)}
									>
										<Pencil className="h-3 w-3 text-muted-foreground" />
									</button>
								)}
							</>
						) : (
							<>
								{editingQuickSell ? (
									tempQuickSellPercentages.map((percentage: number, index: number) => (
										<div key={index} className="relative flex-1" style={{ minWidth: 0 }}>
											<input
												type="number"
												value={percentage}
												onChange={(e) => {
													const newPercentages = [...tempQuickSellPercentages]
													newPercentages[index] = parseFloat(e.target.value) || 0
													setTempQuickSellPercentages(newPercentages)
												}}
												onKeyDown={(e) => {
													if (e.key === 'Enter') {
														handleSaveQuickSellPercentages()
													}
													if (e.key === 'Escape') {
														setTempQuickSellPercentages(quickSellPercentages)
														setEditingQuickSell(false)
													}
												}}
												className="w-full h-9 text-xs text-center rounded-md border border-border bg-background focus:border-primary focus:outline-none pr-4 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
												step="1"
												min="1"
												max="100"
											/>
											<span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">%</span>
										</div>
									))
								) : (
									quickSellPercentages.map((percentage: number, index: number) => (
										<button
											key={index}
											className={cn(
												"flex-1 py-2 px-3 rounded-lg flex justify-center items-center",
												"border border-orange-500/30 bg-orange-500/10 hover:bg-orange-500/20",
												"transition-all duration-200",
												"group",
												(!hasBalance || isProcessing || isMigrating) && "opacity-50 cursor-not-allowed"
											)}
											onClick={() => handleQuickAmount(percentage)}
											disabled={isProcessing || !hasBalance || isMigrating}
											style={{ minWidth: 0 }}
										>
											<span className="text-xs font-semibold text-orange-400 group-hover:text-orange-300 whitespace-nowrap">
												{percentage}%
											</span>
										</button>
									))
								)}

								{editingQuickSell ? (
									<div className="flex gap-1">
										<button
											className="h-9 w-9 flex items-center justify-center rounded-lg border border-green-500/50 bg-green-500/10 hover:bg-green-500/20 transition-colors"
											title="Save changes"
											onClick={handleSaveQuickSellPercentages}
										>
											<Check className="h-3.5 w-3.5 text-green-500" />
										</button>
										<button
											className="h-9 w-9 flex items-center justify-center rounded-lg border border-destructive/50 bg-destructive/10 hover:bg-destructive/20 transition-colors"
											title="Cancel"
											onClick={() => {
												setTempQuickSellPercentages(quickSellPercentages)
												setEditingQuickSell(false)
											}}
										>
											<X className="h-3.5 w-3.5 text-destructive" />
										</button>
									</div>
								) : (
									<button
										className="h-9 w-9 flex items-center justify-center rounded-lg border border-border bg-background hover:bg-muted/50 transition-colors"
										title="Edit quick sell percentages"
										onClick={() => setEditingQuickSell(true)}
									>
										<Pencil className="h-3 w-3 text-muted-foreground" />
									</button>
								)}
							</>
						)}
					</div>
				</div>

				{/* Settings Status Bar */}
				<div className="flex items-center justify-between p-2 rounded-lg bg-muted/10 border border-border/50">
					<div className="flex items-center gap-3 text-[10px] font-mono uppercase">
						<div className="flex items-center gap-1">
							<Activity className="h-3 w-3 text-yellow-500" />
							<span>Slippage: {slippage}%</span>
						</div>
					</div>

					<button
						className="p-1 rounded border border-border hover:border-primary/50 transition-colors"
						onClick={() => setSettingsOpen(true)}
					>
						<Settings2 className="h-3 w-3" />
					</button>
				</div>

				{/* X Identity Reveal Warning - Only for bonding curve tokens */}
				{tradeType === "buy" && protectionSettings?.revealTraderIdentity && !pool.migrated && (
					<div className="flex items-center gap-2 p-3 rounded-lg border border-yellow-500/30 bg-yellow-500/5">
						<AlertTriangle className="h-4 w-4 text-yellow-500 shrink-0" />
						<span className="text-xs text-yellow-500 font-medium">
							This buy will reveal your X (Twitter) username in trade history table.
						</span>
					</div>
				)}

				{/* Error - Only show if not related to Twitter auth */}
				{error && !error.includes("AUTHENTICATED WITH X") && (
					<Alert className="py-1.5 border-destructive/50 bg-destructive/10">
						<AlertDescription className="font-mono text-[10px] uppercase text-destructive">
							{error}
						</AlertDescription>
					</Alert>
				)}

				{/* Trade Button or X Connect Button */}
				{protectionSettings?.requireTwitter && !isTwitterLoggedIn ? (
					<Button
						variant="outline"
						className="w-full h-10 font-mono text-xs uppercase"
						onClick={twitterLogin}
					>
						<BsTwitterX className="h-4 w-4 mr-2" />
						Connect X to Trade
					</Button>
				) : (
					<Button
						className={cn(
							"w-full h-10 font-mono text-xs uppercase",
							tradeType === "buy"
								? "bg-green-400/50 hover:bg-green-500/90 text-foreground"
								: "bg-destructive/80 hover:bg-destructive text-foreground",
							(isMigrating || !amount || isProcessing) && "opacity-50"
						)}
						onClick={handleTrade}
						disabled={
							!amount ||
							isProcessing ||
							isMigrating ||
							(tradeType === "sell" && !hasBalance) ||
							(tradeType === "buy" && parseFloat(amount) > suiBalanceInDisplayUnit) ||
							(tradeType === "sell" && parseFloat(amount) > balanceInDisplayUnit)
						}
					>
						{isProcessing ? (
							<>
								<Loader2 className="h-3.5 w-3.5 animate-spin mr-2" />
								Processing...
							</>
						) : isRefreshingQuote ? (
							<>
								<Loader2 className="h-3.5 w-3.5 animate-spin mr-2" />
								Getting quotes...
							</>
						) : (
							<>
								{tradeType === "buy"
									? isLoadingQuote ? `Calculating...` : `Buy ${formatNumberWithSuffix(calculateOutputAmount)} ${metadata?.symbol}`
									: isLoadingQuote ? `Calculating...` : `Sell ${formatNumberWithSuffix(parseFloat(amount) || 0)} ${metadata?.symbol} for ${formatNumberWithSuffix(calculateOutputAmount)} SUI`
								}
							</>
						)}
					</Button>
				)}
				
				{/* Update Metadata Button - Only on mobile for creator */}
				{isConnected && isCreator && (
					<>
						<div className="lg:hidden">
							<Separator className="bg-border/30" />
						</div>
						
						<Button
							variant="outline"
							className="w-full h-10 font-mono text-xs uppercase lg:hidden border-primary/50 hover:bg-primary/10 hover:border-primary"
							onClick={() => setUpdateMetadataDialogOpen(true)}
						>
							<Edit2 className="h-4 w-4 text-primary mr-2" />
							Update Metadata
						</Button>
					</>
				)}
				
				{/* Burn Button - Only on mobile */}
				{isConnected && hasBalance && (
					<>
						{!isCreator && (
							<div className="lg:hidden">
								<Separator className="bg-border/30" />
							</div>
						)}
						
						<Button
							variant="outline"
							className="w-full h-10 font-mono text-xs uppercase lg:hidden border-orange-500/50 hover:bg-orange-500/10 hover:border-orange-500"
							onClick={() => setBurnDialogOpen(true)}
						>
							<Flame className="h-4 w-4 text-orange-500 mr-2" />
							Burn {metadata?.symbol}
						</Button>
					</>
				)}
			</div>

			{/* Trade Settings Dialog */}
			<TradeSettings
				open={settingsOpen}
				onOpenChange={setSettingsOpen}
			/>
			
			{/* Update Metadata Dialog */}
			<UpdateMetadataDialog
				open={updateMetadataDialogOpen}
				onOpenChange={setUpdateMetadataDialogOpen}
				pool={pool}
			/>
			
			{/* Burn Dialog */}
			<BurnDialog
				open={burnDialogOpen}
				onOpenChange={setBurnDialogOpen}
				pool={pool}
			/>
		</div>
	)
}