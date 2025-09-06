"use client"

import { MIST_PER_SUI } from "@mysten/sui/utils"
import BigNumber from "bignumber.js"
import { Activity, AlertTriangle, Check, Flame, Loader2, Pencil, Rocket, Settings2, Wallet, X } from "lucide-react"
import Image from "next/image"
import { useCallback, useEffect, useMemo, useState } from "react"
import { BsTwitterX } from "react-icons/bs"
import { TokenAvatar } from "@/components/tokens/token-avatar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { useApp } from "@/context/app.context"
import { useTwitter } from "@/context/twitter.context"
import { usePortfolio } from "@/hooks/nexa/use-portfolio"
import { useTrading } from "@/hooks/pump/use-trading"
import { useTokenBalance } from "@/hooks/sui/use-token-balance"
import { useTokenProtection } from "@/hooks/use-token-protection"
import { getBuyQuote, getSellQuote } from "@/lib/aftermath"
import { pumpSdk } from "@/lib/pump"
import { usePresetStore } from "@/stores/preset-store"
import type { Token } from "@/types/token"
import { cn } from "@/utils"
import { formatNumberWithSuffix } from "@/utils/format"
import { useBurn } from "../_hooks/use-burn"
import { TradeSettings } from "./trade-settings"

interface TradeTerminalProps {
	pool: Token
	referral?: string
}

export function TradeTerminal({ pool, referral }: TradeTerminalProps) {
	const { isConnected } = useApp()
	const { isLoggedIn: isTwitterLoggedIn, login: twitterLogin } = useTwitter()
	const { settings: protectionSettings } = useTokenProtection(pool.pool?.poolId || "", pool.pool?.isProtected)
	const [tradeType, setTradeType] = useState<"buy" | "sell" | "burn">("buy")
	const [amount, setAmount] = useState("")
	const [settingsOpen, setSettingsOpen] = useState(false)
	const [referrerWallet, setReferrerWallet] = useState<string | null>(null)
	const [editingQuickBuy, setEditingQuickBuy] = useState(false)
	const [editingQuickSell, setEditingQuickSell] = useState(false)
	const [tempQuickBuyAmounts, setTempQuickBuyAmounts] = useState<number[]>([])
	const [tempQuickSellPercentages, setTempQuickSellPercentages] = useState<number[]>([])

	const { slippage, quickBuyAmounts, quickSellPercentages, setQuickBuyAmounts, setQuickSellPercentages } = usePresetStore()

	const { balance: tokenBalance } = useTokenBalance(pool.coinType)
	const { balance: actualBalance, refetch: refetchPortfolio } = usePortfolio(pool.coinType)
	const { balance: suiBalance } = useTokenBalance("0x2::sui::SUI")

	// derived states
	const metadata = pool.metadata
	const marketData = pool.market
	const decimals = metadata?.decimals || 9
	const effectiveBalance = actualBalance !== "0" ? actualBalance : tokenBalance
	const balanceInDisplayUnit = effectiveBalance ? Number(effectiveBalance) / Math.pow(10, decimals) : 0
	const hasBalance = balanceInDisplayUnit > 0
	const suiBalanceInDisplayUnit = suiBalance ? Number(suiBalance) / Number(MIST_PER_SUI) : 0

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

	// @dev: prices for USD calculations from server data
	const suiPrice = 4

	// initialize temp amounts with store values
	useEffect(() => {
		setTempQuickBuyAmounts(quickBuyAmounts)
		setTempQuickSellPercentages(quickSellPercentages)
	}, [quickBuyAmounts, quickSellPercentages])

	// state for quote from bonding curve
	const [quote, setQuote] = useState<{
		memeAmountOut?: bigint
		memeAmountIn?: bigint
		suiAmountOut?: bigint
		coinAmountOut?: bigint
		burnFee?: bigint
	} | null>(null)
	const [isLoadingQuote, setIsLoadingQuote] = useState(false)
	const [isRefreshingQuote, setIsRefreshingQuote] = useState(false)

	const fetchQuote = useCallback(
		async (isRefresh = false) => {
			if (!amount || parseFloat(amount) === 0 || !pool.pool?.poolId || tradeType === "burn") {
				setQuote(null)
				return
			}

			if (isRefresh) {
				setIsRefreshingQuote(true)
			} else {
				setIsLoadingQuote(true)
			}

			try {
				const isMigrated = pool.pool?.migrated === true

				if (tradeType === "buy") {
					// convert SUI amount to MIST for the quote
					const amountBN = new BigNumber(amount)
					const mistPerSuiBN = new BigNumber(MIST_PER_SUI.toString())
					const amountInMist = BigInt(
						amountBN.multipliedBy(mistPerSuiBN).integerValue(BigNumber.ROUND_DOWN).toString()
					)

					if (isMigrated) {
						const quoteResult = await getBuyQuote(pool.coinType, amountInMist, slippage)
						setQuote({
							memeAmountOut: quoteResult.amountOut,
							suiAmountOut: amountInMist, // Amount being spent
							coinAmountOut: quoteResult.amountOut, // Tokens received
						})
					} else {
						const quoteResult = await pumpSdk.quotePump({
							pool: pool.pool?.poolId,
							amount: amountInMist,
						})
						setQuote(quoteResult)
					}
				} else {
					// for sell, convert token amount to smallest unit
					const amountBN = new BigNumber(amount)
					const tokenInSmallestUnit = BigInt(
						amountBN.multipliedBy(Math.pow(10, decimals)).integerValue(BigNumber.ROUND_DOWN).toString()
					)

					if (isMigrated) {
						const quoteResult = await getSellQuote(pool.coinType, tokenInSmallestUnit, slippage)
						setQuote({
							memeAmountIn: tokenInSmallestUnit,
							suiAmountOut: quoteResult.amountOut,
							coinAmountOut: quoteResult.amountOut,
						})
					} else {
						// use pump SDK for bonding curve tokens
						const quoteResult = await pumpSdk.quoteDump({
							pool: pool.pool?.poolId,
							amount: tokenInSmallestUnit,
						})
						setQuote({
							memeAmountIn: tokenInSmallestUnit,
							suiAmountOut: quoteResult.quoteAmountOut,
							coinAmountOut: quoteResult.quoteAmountOut,
							burnFee: quoteResult.burnFee,
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
		},
		[amount, tradeType, pool.pool?.poolId, pool.coinType, pool.pool?.migrated, decimals, slippage]
	)

	// initial quote fetch when amount changes
	useEffect(() => {
		const timer = setTimeout(() => fetchQuote(false), 300)
		return () => clearTimeout(timer)
	}, [fetchQuote])

	// refresh quote every 15 seconds (except for burn)
	useEffect(() => {
		if (!amount || parseFloat(amount) === 0 || tradeType === "burn") return

		const interval = setInterval(() => {
			fetchQuote(true)
		}, 15000)

		return () => clearInterval(interval)
	}, [amount, tradeType, fetchQuote])

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

	// @dev: Calculate burn percentage for display
	const burnPercentage = useMemo(() => {
		if (!quote || !quote.burnFee || !quote.memeAmountIn || tradeType !== "sell") return 0

		const burnAmount = Number(quote.burnFee)
		const totalAmount = Number(quote.memeAmountIn)

		if (totalAmount === 0) return 0
		return (burnAmount / totalAmount) * 100
	}, [quote, tradeType])

	// calculate USD value
	const usdValue = useMemo(() => {
		if (!amount || parseFloat(amount) === 0) return "0.00"

		if (tradeType === "buy") {
			return (parseFloat(amount) * suiPrice).toFixed(2)
		} else {
			return (calculateOutputAmount * suiPrice).toFixed(2)
		}
	}, [amount, tradeType, calculateOutputAmount])

	// fetch referrer wallet if referral code exists
	useEffect(() => {
		if (referral) {
			fetch(`/api/referrals?refCode=${referral}`)
				.then((res) => res.json())
				.then((data) => {
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

	const {
		burn,
		isProcessing: isBurning,
		error: burnError,
	} = useBurn({
		pool,
		decimals,
		actualBalance: effectiveBalance,
		onSuccess: async () => {
			await refetchPortfolio()
			setAmount("")
		},
	})

	const handleQuickAmount = (value: number) => {
		if (tradeType === "buy") {
			setAmount(value.toString())
		} else if (tradeType === "sell" || tradeType === "burn") {
			// @dev: For sell and burn, calculate percentage
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
					const tokenAmount = balanceBN.multipliedBy(percentageBN).toFixed(9, BigNumber.ROUND_DOWN)
					setAmount(tokenAmount)
				} catch (error) {
					console.error("Error calculating quick amount:", error)
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
			await refetchPortfolio()
			setAmount("")
		} else if (tradeType === "sell") {
			const requiredTokens = parseFloat(amount)
			if (requiredTokens > balanceInDisplayUnit) {
				return
			}

			await sell(amount, slippage)
			await refetchPortfolio()
			setAmount("")
		} else if (tradeType === "burn") {
			const requiredTokens = parseFloat(amount)
			if (requiredTokens > balanceInDisplayUnit) {
				return
			}

			await burn(amount)
		}
	}

	const isMigrating = pool.pool?.canMigrate === true && !pool.pool?.migrated

	if (!isConnected) {
		return (
			<div className="border-border border-b p-4">
				<div className="space-y-2 text-center">
					<Wallet className="mx-auto h-8 w-8 text-muted-foreground" />
					<p className="font-mono text-muted-foreground text-xs">Connect wallet to trade</p>
				</div>
			</div>
		)
	}

	return (
		<div className="relative border-border border-b">
			{isMigrating && (
				<div className="absolute inset-0 z-10 flex select-none items-center justify-center bg-background/95 p-4 backdrop-blur-sm">
					{/* background glow */}
					<div className="absolute inset-0">
						<div className="-translate-x-1/2 -translate-y-1/2 absolute top-1/2 left-1/2 h-64 w-64 animate-pulse rounded-full bg-yellow-400/10 blur-3xl" />
					</div>

					<div className="relative space-y-4 text-center">
						<div className="relative mx-auto h-20 w-20">
							<div className="absolute inset-0 animate-pulse rounded-full bg-gradient-to-r from-yellow-400 to-orange-400 opacity-50 blur-2xl" />
							<div className="absolute inset-0 flex items-center justify-center">
								<Rocket className="h-16 w-16 animate-pulse text-yellow-400/80" />
							</div>
						</div>

						<div className="space-y-2">
							<p className="font-bold font-mono text-sm text-yellow-400/80 uppercase tracking-wider">
								MIGRATION::IN_PROGRESS
							</p>

							<p className="mx-auto max-w-xs font-mono text-muted-foreground/70 text-xs">
								TOKEN_IS_MIGRATING::PLEASE_WAIT
							</p>
						</div>
					</div>
				</div>
			)}

			<div className="space-y-3 p-3">
				{/* Buy/Sell/Burn Tabs */}
				<div className={cn("grid gap-1 rounded-lg bg-muted/30 p-1", hasBalance ? "grid-cols-3" : "grid-cols-2")}>
					<button
						onClick={() => setTradeType("buy")}
						className={cn(
							"rounded-md py-2 font-mono text-xs uppercase transition-all",
							tradeType === "buy"
								? "border border-green-500/50 bg-green-500/20 text-green-500"
								: "text-muted-foreground hover:bg-muted/50"
						)}
					>
						Buy
					</button>
					<button
						onClick={() => setTradeType("sell")}
						disabled={!hasBalance}
						className={cn(
							"rounded-md py-2 font-mono text-xs uppercase transition-all",
							tradeType === "sell"
								? "border border-red-500/50 bg-red-500/20 text-red-500"
								: "text-muted-foreground hover:bg-muted/50",
							!hasBalance && "cursor-not-allowed opacity-50"
						)}
					>
						Sell
					</button>
					{hasBalance && (
						<button
							onClick={() => setTradeType("burn")}
							className={cn(
								"rounded-md py-2 font-mono text-xs uppercase transition-all",
								tradeType === "burn"
									? "border border-orange-500/50 bg-orange-500/20 text-orange-500"
									: "text-muted-foreground hover:bg-muted/50"
							)}
						>
							Burn
						</button>
					)}
				</div>

				{/* Input Section with Balance */}
				<div className="space-y-2 rounded-lg border border-border/50 bg-muted/5 p-3">
					{/* Balance Header */}
					<div className="flex items-center justify-between text-xs">
						<div className="flex items-center gap-1.5 text-muted-foreground">
							<Wallet className="h-3.5 w-3.5" />
							<span>Balance</span>
						</div>
						<div className="flex items-center gap-2">
							<span className="font-mono text-foreground">
								{tradeType === "buy"
									? formatNumberWithSuffix(suiBalanceInDisplayUnit)
									: formatNumberWithSuffix(balanceInDisplayUnit)}
							</span>
							<span className="text-muted-foreground">{tradeType === "buy" ? "SUI" : metadata?.symbol}</span>
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
								className="font-medium text-blue-400 text-xs transition-colors hover:text-blue-300"
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
								className="min-w-0 flex-1 bg-transparent font-medium text-2xl text-foreground outline-none placeholder:text-muted-foreground/50"
								disabled={isProcessing}
								inputMode="decimal"
							/>
							<div className="flex shrink-0 items-center gap-1.5 rounded-md border border-border/50 bg-muted/20 px-2.5 py-1.5">
								{tradeType === "buy" ? (
									<Image
										src="/logo/sui-logo.svg"
										alt="SUI"
										width={18}
										height={18}
										className="shrink-0 rounded-full"
										unoptimized={true}
									/>
								) : (
									<TokenAvatar
										iconUrl={metadata?.icon_url}
										symbol={metadata?.symbol}
										name={metadata?.name}
										className="h-[18px] w-[18px] shrink-0 rounded-full"
										fallbackClassName="text-xs"
										enableHover={false}
									/>
								)}
								<span className="whitespace-nowrap font-medium text-sm">
									{tradeType === "buy" ? "SUI" : metadata?.symbol}
								</span>
							</div>
						</div>

						{/* Price Display */}
						<span className="text-muted-foreground text-xs">≈ ${usdValue} USD</span>
					</div>
				</div>

				{/* Quick Actions with Inline Edit */}
				<div className="space-y-2">
					<div className="flex gap-1.5">
						{tradeType === "buy" ? (
							<>
								{editingQuickBuy
									? tempQuickBuyAmounts.map((suiAmount, index) => (
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
													if (e.key === "Enter") {
														handleSaveQuickBuyAmounts()
													}
													if (e.key === "Escape") {
														setTempQuickBuyAmounts(quickBuyAmounts)
														setEditingQuickBuy(false)
													}
												}}
												className="h-9 flex-1 rounded-md border border-border bg-background text-center text-xs [appearance:textfield] focus:border-primary focus:outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
												step="0.01"
												min="0"
												style={{ minWidth: 0 }}
											/>
										))
									: quickBuyAmounts.map((suiAmount: number, index: number) => (
											<button
												key={index}
												className={cn(
													"flex flex-1 items-center justify-center rounded-lg px-3 py-2",
													"border border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20",
													"transition-all duration-200",
													"group",
													(isProcessing || isMigrating) && "cursor-not-allowed opacity-50"
												)}
												onClick={() => handleQuickAmount(suiAmount)}
												disabled={isProcessing || isMigrating}
												style={{ minWidth: 0 }}
											>
												<span className="whitespace-nowrap font-semibold text-blue-400 text-xs group-hover:text-blue-300">
													{suiAmount} SUI
												</span>
											</button>
										))}

								{editingQuickBuy ? (
									<div className="flex gap-1">
										<button
											className="flex h-9 w-9 items-center justify-center rounded-lg border border-green-500/50 bg-green-500/10 transition-colors hover:bg-green-500/20"
											title="Save changes"
											onClick={handleSaveQuickBuyAmounts}
										>
											<Check className="h-3.5 w-3.5 text-green-500" />
										</button>
										<button
											className="flex h-9 w-9 items-center justify-center rounded-lg border border-destructive/50 bg-destructive/10 transition-colors hover:bg-destructive/20"
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
										className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-background transition-colors hover:bg-muted/50"
										title="Edit quick buy amounts"
										onClick={() => setEditingQuickBuy(true)}
									>
										<Pencil className="h-3 w-3 text-muted-foreground" />
									</button>
								)}
							</>
						) : (
							<>
								{editingQuickSell
									? tempQuickSellPercentages.map((percentage: number, index: number) => (
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
														if (e.key === "Enter") {
															handleSaveQuickSellPercentages()
														}
														if (e.key === "Escape") {
															setTempQuickSellPercentages(quickSellPercentages)
															setEditingQuickSell(false)
														}
													}}
													className="h-9 w-full rounded-md border border-border bg-background pr-4 text-center text-xs [appearance:textfield] focus:border-primary focus:outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
													step="1"
													min="1"
													max="100"
												/>
												<span className="-translate-y-1/2 pointer-events-none absolute top-1/2 right-1.5 text-muted-foreground text-xs">
													%
												</span>
											</div>
										))
									: quickSellPercentages.map((percentage: number, index: number) => (
											<button
												key={index}
												className={cn(
													"flex flex-1 items-center justify-center rounded-lg px-3 py-2",
													"border border-orange-500/30 bg-orange-500/10 hover:bg-orange-500/20",
													"transition-all duration-200",
													"group",
													(!hasBalance || isProcessing || isMigrating) &&
														"cursor-not-allowed opacity-50"
												)}
												onClick={() => handleQuickAmount(percentage)}
												disabled={isProcessing || !hasBalance || isMigrating}
												style={{ minWidth: 0 }}
											>
												<span className="whitespace-nowrap font-semibold text-orange-400 text-xs group-hover:text-orange-300">
													{percentage}%
												</span>
											</button>
										))}

								{editingQuickSell ? (
									<div className="flex gap-1">
										<button
											className="flex h-9 w-9 items-center justify-center rounded-lg border border-green-500/50 bg-green-500/10 transition-colors hover:bg-green-500/20"
											title="Save changes"
											onClick={handleSaveQuickSellPercentages}
										>
											<Check className="h-3.5 w-3.5 text-green-500" />
										</button>
										<button
											className="flex h-9 w-9 items-center justify-center rounded-lg border border-destructive/50 bg-destructive/10 transition-colors hover:bg-destructive/20"
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
										className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-background transition-colors hover:bg-muted/50"
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
				<div className="flex items-center justify-between rounded-lg border border-border/50 bg-muted/10 p-2">
					<div className="flex items-center gap-3 font-mono text-[10px] uppercase">
						<div className="flex items-center gap-1">
							<Activity className="h-3 w-3 text-yellow-500" />
							<span>Slippage: {slippage}%</span>
						</div>
					</div>

					<button
						className="rounded border border-border p-1 transition-colors hover:border-primary/50"
						onClick={() => setSettingsOpen(true)}
					>
						<Settings2 className="h-3 w-3" />
					</button>
				</div>

				{/* X Identity Reveal Warning - Only for bonding curve tokens */}
				{["buy", "sell"].includes(tradeType) && protectionSettings?.revealTraderIdentity && !pool.pool?.migrated && (
					<div className="flex items-center gap-2 rounded-lg border border-yellow-500/30 bg-yellow-500/5 p-3">
						<AlertTriangle className="h-4 w-4 shrink-0 text-yellow-500" />
						<span className="font-medium text-xs text-yellow-500">
							This {tradeType} will reveal your X (Twitter) username in trade history table.
						</span>
					</div>
				)}

				{/* Error */}
				{((tradeType !== "burn" && error && !error.includes("AUTHENTICATED WITH X")) ||
					(tradeType === "burn" && burnError)) && (
					<Alert className="border-destructive/50 bg-destructive/10 py-1.5">
						<AlertDescription className="font-mono text-[10px] text-destructive uppercase">
							{tradeType === "burn" ? burnError : error}
						</AlertDescription>
					</Alert>
				)}

				{/* Trade/Burn Button or X Connect Button */}
				{protectionSettings?.requireTwitter && !isTwitterLoggedIn && tradeType !== "burn" ? (
					<Button variant="outline" className="h-10 w-full font-mono text-xs uppercase" onClick={twitterLogin}>
						<BsTwitterX className="mr-2 h-4 w-4" />
						Connect X to Trade
					</Button>
				) : (
					<Button
						className={cn(
							"h-10 w-full font-mono text-xs uppercase",
							tradeType === "buy"
								? "bg-green-400/50 text-foreground hover:bg-green-500/90"
								: tradeType === "sell"
									? "bg-destructive/80 text-foreground hover:bg-destructive"
									: "bg-orange-500/80 text-foreground hover:bg-orange-600",
							(isMigrating || !amount || isProcessing || isBurning) && "opacity-50"
						)}
						onClick={handleTrade}
						disabled={
							!amount ||
							isProcessing ||
							isBurning ||
							isMigrating ||
							((tradeType === "sell" || tradeType === "burn") && !hasBalance) ||
							(tradeType === "buy" && parseFloat(amount) > suiBalanceInDisplayUnit) ||
							((tradeType === "sell" || tradeType === "burn") && parseFloat(amount) > balanceInDisplayUnit)
						}
					>
						{isProcessing || isBurning ? (
							<>
								<Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
								{tradeType === "burn" ? "Burning..." : "Processing..."}
							</>
						) : isRefreshingQuote && tradeType !== "burn" ? (
							<>
								<Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
								Getting quotes...
							</>
						) : (
							<>
								{tradeType === "buy" ? (
									isLoadingQuote ? (
										`Calculating...`
									) : (
										`Buy ${formatNumberWithSuffix(calculateOutputAmount)} ${metadata?.symbol}`
									)
								) : tradeType === "sell" ? (
									isLoadingQuote ? (
										`Calculating...`
									) : (
										<>
											Sell {formatNumberWithSuffix(parseFloat(amount) || 0)} {metadata?.symbol} for{" "}
											{formatNumberWithSuffix(calculateOutputAmount)} SUI
											{burnPercentage > 0 && !pool.pool?.migrated && (
												<span className="ml-1 text-xs opacity-80">
													({burnPercentage.toFixed(1)}% burn)
												</span>
											)}
										</>
									)
								) : (
									<>
										<Flame className="mr-1 inline h-3.5 w-3.5" />
										Burn {formatNumberWithSuffix(parseFloat(amount) || 0)} {metadata?.symbol}
									</>
								)}
							</>
						)}
					</Button>
				)}
			</div>

			{/* Trade Settings Dialog */}
			<TradeSettings open={settingsOpen} onOpenChange={setSettingsOpen} />
		</div>
	)
}
