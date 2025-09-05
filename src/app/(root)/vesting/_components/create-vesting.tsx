"use client"

import { useState, useEffect } from "react"
import { useApp } from "@/context/app.context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Lock, Calendar, AlertCircle, Clock, CalendarDays } from "lucide-react"
import { TokenAvatar } from "@/components/tokens/token-avatar"
import { useTransaction } from "@/hooks/sui/use-transaction"
import { coinWithBalance, Transaction } from "@mysten/sui/transactions"
import { useVestingSDK } from "../_hooks/use-vesting-sdk"
import { parseVestingDuration } from "../vesting.utils"
import type { WalletCoin } from "@/types/blockvision"
import toast from "react-hot-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { formatAmount, formatAmountWithSuffix, formatNumberWithSuffix } from "@/utils/format"
import { VestingTimeline } from "./vesting-timeline"
import { format } from "date-fns"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/utils"

interface CreateVestingProps {
	onVestingCreated?: () => void
}

export function CreateVesting({ onVestingCreated }: CreateVestingProps) {
	const { address, setIsConnectDialogOpen } = useApp()
	const [coins, setCoins] = useState<WalletCoin[]>([])
	const [selectedCoin, setSelectedCoin] = useState<string>("")
	const [amount, setAmount] = useState<string>("")
	const [recipientAddress, setRecipientAddress] = useState<string>("")
	
	// @dev: Input mode - duration or date
	const [inputMode, setInputMode] = useState<"duration" | "date">("duration")
	
	// @dev: Duration mode states
	const [lockDurationValue, setLockDurationValue] = useState<string>("0")
	const [lockDurationUnit, setLockDurationUnit] = useState<string>("days")
	const [vestingDurationValue, setVestingDurationValue] = useState<string>("")
	const [vestingDurationUnit, setVestingDurationUnit] = useState<string>("days")
	
	// @dev: Date mode states
	const [vestingStartDate, setVestingStartDate] = useState<Date | undefined>()
	const [vestingEndDate, setVestingEndDate] = useState<Date | undefined>()
	
	// @dev: Sync between duration and date modes
	useEffect(() => {
		if (inputMode === "date") {
			// @dev: When switching to date mode, calculate dates from duration values
			const now = new Date()
			const lockMs = parseVestingDuration(lockDurationValue || "0", lockDurationUnit)
			const vestingMs = parseVestingDuration(vestingDurationValue || "0", vestingDurationUnit)
			
			if (lockMs > 0 || vestingMs > 0) {
				const startDate = new Date(now.getTime() + lockMs)
				const endDate = new Date(startDate.getTime() + vestingMs)
				setVestingStartDate(startDate)
				setVestingEndDate(vestingMs > 0 ? endDate : undefined)
			}
		} else if (inputMode === "duration") {
			// @dev: When switching to duration mode, calculate durations from dates
			if (vestingStartDate && vestingEndDate) {
				const now = new Date()
				const lockMs = vestingStartDate.getTime() - now.getTime()
				const vestingMs = vestingEndDate.getTime() - vestingStartDate.getTime()
				
				// @dev: Convert to appropriate units
				if (lockMs > 0) {
					if (lockMs >= 24 * 60 * 60 * 1000) {
						setLockDurationValue(Math.floor(lockMs / (24 * 60 * 60 * 1000)).toString())
						setLockDurationUnit("days")
					} else if (lockMs >= 60 * 60 * 1000) {
						setLockDurationValue(Math.floor(lockMs / (60 * 60 * 1000)).toString())
						setLockDurationUnit("hours")
					} else {
						setLockDurationValue(Math.floor(lockMs / (60 * 1000)).toString())
						setLockDurationUnit("minutes")
					}
				}
				
				if (vestingMs > 0) {
					if (vestingMs >= 24 * 60 * 60 * 1000) {
						setVestingDurationValue(Math.floor(vestingMs / (24 * 60 * 60 * 1000)).toString())
						setVestingDurationUnit("days")
					} else if (vestingMs >= 60 * 60 * 1000) {
						setVestingDurationValue(Math.floor(vestingMs / (60 * 60 * 1000)).toString())
						setVestingDurationUnit("hours")
					} else {
						setVestingDurationValue(Math.floor(vestingMs / (60 * 1000)).toString())
						setVestingDurationUnit("minutes")
					}
				}
			}
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [inputMode])
	
	const [isLoadingCoins, setIsLoadingCoins] = useState(false)
	const [isCreating, setIsCreating] = useState(false)
	const { executeTransaction } = useTransaction()
	const vestingSdk = useVestingSDK()

	// @dev: Fetch user's coins
	useEffect(() => {
		if (!address) return

		const fetchCoins = async () => {
			setIsLoadingCoins(true)
			try {
				const response = await fetch("/api/wallet/coins", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ address }),
				})

				if (!response.ok) throw new Error("Failed to fetch coins")

				const data = await response.json()
				if (data.success && data.coins) {
					// @dev: Sort coins by USD value (highest first)
					const sortedCoins = [...data.coins].sort((a, b) => {
						const aValue = a.value || 0
						const bValue = b.value || 0
						return bValue - aValue
					})
					setCoins(sortedCoins)
					if (sortedCoins.length > 0 && !selectedCoin) {
						setSelectedCoin(sortedCoins[0].coinType)
					}
				}
			} catch (error) {
				console.error("Error fetching coins:", error)
				toast.error("Failed to load wallet coins")
			} finally {
				setIsLoadingCoins(false)
			}
		}

		fetchCoins()
	}, [address, selectedCoin])

	const selectedCoinData = coins.find(c => c.coinType === selectedCoin)

	// @dev: Calculate dates based on input mode
	const calculateDates = () => {
		const now = new Date()
		
		if (inputMode === "duration") {
			const lockDuration = parseVestingDuration(lockDurationValue || "0", lockDurationUnit)
			const vestingDuration = parseVestingDuration(vestingDurationValue, vestingDurationUnit)
			
			const lockStart = now
			const vestingStart = new Date(now.getTime() + lockDuration)
			const vestingEnd = new Date(vestingStart.getTime() + vestingDuration)
			
			return {
				lockStartDate: lockStart,
				vestingStartDate: vestingStart,
				vestingEndDate: vestingEnd,
				lockDuration,
				vestingDuration,
			}
		} else {
			// @dev: Date mode
			const lockStart = now
			const vestingStart = vestingStartDate || now
			const vestingEnd = vestingEndDate || now
			
			return {
				lockStartDate: lockStart,
				vestingStartDate: vestingStart,
				vestingEndDate: vestingEnd,
				lockDuration: vestingStart.getTime() - lockStart.getTime(),
				vestingDuration: vestingEnd.getTime() - vestingStart.getTime(),
			}
		}
	}

	const dates = calculateDates()
	const showTimeline = amount && (
		(inputMode === "duration" && vestingDurationValue) ||
		(inputMode === "date" && vestingStartDate && vestingEndDate)
	)

	const handleCreateVesting = async () => {
		if (!address) {
			setIsConnectDialogOpen(true)
			return
		}

		if (!selectedCoin || !amount) {
			toast.error("Please fill in all required fields")
			return
		}

		const parsedAmount = parseFloat(amount)
		if (isNaN(parsedAmount) || parsedAmount <= 0) {
			toast.error("Please enter a valid amount")
			return
		}

		if (dates.vestingDuration <= 0) {
			toast.error("Please set a valid vesting period")
			return
		}

		setIsCreating(true)
		try {
			// @dev: Convert amount to smallest unit
			const decimals = selectedCoinData?.decimals || 9
			const amountInSmallestUnit = BigInt(Math.floor(parsedAmount * Math.pow(10, decimals)))

			// @dev: Create coin object with balance
			const coin = coinWithBalance({
				type: selectedCoin,
				balance: amountInSmallestUnit,
			})

			// @dev: Create vesting position using SDK
			const { tx } = await vestingSdk.new({
				owner: recipientAddress || address,
				coin: coin,
				start: Math.floor(dates.vestingStartDate.getTime()),
				duration: dates.vestingDuration,
				coinType: selectedCoin,
			})
			
			await executeTransaction(tx)

			toast.success("Vesting position created successfully!")
			
			// Reset form
			setAmount("")
			setRecipientAddress("")
			setLockDurationValue("0")
			setVestingDurationValue("")
			setVestingStartDate(undefined)
			setVestingEndDate(undefined)

			// Switch to positions tab
			onVestingCreated?.()
		} catch (error) {
			console.error("Error creating vesting:", error)
			toast.error("Failed to create vesting position")
		} finally {
			setIsCreating(false)
		}
	}

	const maxAmount = selectedCoinData
		? formatAmount(selectedCoinData.balance)
		: "0"

	// @dev: Calculate USD value for selected amount
	const calculateUsdValue = () => {
		if (!selectedCoinData?.price || !amount) return null
		const parsedAmount = parseFloat(amount)
		if (isNaN(parsedAmount)) return null
		return (parsedAmount * selectedCoinData.price).toFixed(2)
	}

	const usdValue = calculateUsdValue()

	return (
		<Card>
			<CardHeader>
				<CardTitle>Create Token Vesting</CardTitle>
				<CardDescription>
					Set up a vesting schedule with optional lock period and linear unlocking
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-6">
				{!address ? (
					<Alert>
						<AlertCircle className="h-4 w-4" />
						<AlertDescription>
							Please connect your wallet to create a vesting position
						</AlertDescription>
					</Alert>
				) : (
					<>
						{/* Token Selection */}
						<div className="space-y-2">
							<Label htmlFor="token">Select Token</Label>
							<Select
								value={selectedCoin}
								onValueChange={setSelectedCoin}
								disabled={isLoadingCoins || coins.length === 0}
							>
								<SelectTrigger id="token">
									<SelectValue placeholder={isLoadingCoins ? "Loading..." : "Select a token"}>
										{selectedCoinData && (
											<div className="flex items-center gap-2">
												<TokenAvatar
													iconUrl={selectedCoinData.iconUrl}
													symbol={selectedCoinData.symbol}
													className="w-5 h-5"
												/>
												<span>{selectedCoinData.symbol || "Unknown"}</span>
												<span className="text-muted-foreground ml-auto">
													Balance: {maxAmount}
													{selectedCoinData.value && selectedCoinData.value > 0 && (
														<span className="text-xs"> (${selectedCoinData.value.toFixed(2)})</span>
													)}
												</span>
											</div>
										)}
									</SelectValue>
								</SelectTrigger>
								<SelectContent>
									{coins.map((coin) => (
										<SelectItem key={coin.coinType} value={coin.coinType}>
											<div className="flex items-center gap-2 w-full">
												<TokenAvatar
													iconUrl={coin.iconUrl}
													symbol={coin.symbol}
													className="w-5 h-5 flex-shrink-0"
												/>
												<span className="font-medium min-w-[60px]">{coin.symbol || "Unknown"}</span>
												<span className="flex-1 text-right">{formatAmountWithSuffix(coin.balance, coin.decimals)}</span>
												{coin.value && coin.value > 0.01 && (
													<span className="text-muted-foreground text-sm min-w-[80px] text-right">
														${formatNumberWithSuffix(coin.value)}
													</span>
												)}
											</div>
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						{/* Amount */}
						<div className="space-y-2">
							<Label htmlFor="amount">Amount to Vest</Label>
							<div className="relative">
								<Input
									id="amount"
									type="number"
									placeholder="0.0"
									value={amount}
									onChange={(e) => setAmount(e.target.value)}
									step="0.000000001"
									min="0"
								/>
								<Button
									type="button"
									variant="ghost"
									size="sm"
									className="absolute right-2 top-1/2 -translate-y-1/2 h-7 px-2"
									onClick={() => setAmount(maxAmount || "0")}
								>
									MAX
								</Button>
							</div>
							<div className="space-y-1">
								<p className="text-sm text-muted-foreground">
									Available: {maxAmount} {selectedCoinData?.symbol}
									{selectedCoinData?.value && selectedCoinData.value > 0 && (
										<span className="text-xs"> (${selectedCoinData.value.toFixed(2)})</span>
									)}
								</p>
								{usdValue && (
									<p className="text-sm font-medium">
										Value to vest: ${usdValue} USD
									</p>
								)}
							</div>
						</div>

						{/* Recipient Address */}
						<div className="space-y-2">
							<Label htmlFor="recipient">Recipient Address (Optional)</Label>
							<Input
								id="recipient"
								placeholder={address || "Enter recipient address"}
								value={recipientAddress}
								onChange={(e) => setRecipientAddress(e.target.value)}
							/>
							<p className="text-sm text-muted-foreground">
								Leave empty to vest for yourself
							</p>
						</div>

						{/* Vesting Schedule Input */}
						<div className="space-y-4">
							<Label>Vesting Schedule</Label>
							
							<Tabs value={inputMode} onValueChange={(v) => setInputMode(v as "duration" | "date")}>
								<TabsList className="grid w-full grid-cols-2">
									<TabsTrigger value="duration">
										<Clock className="w-4 h-4 mr-2" />
										Duration
									</TabsTrigger>
									<TabsTrigger value="date">
										<CalendarDays className="w-4 h-4 mr-2" />
										Date
									</TabsTrigger>
								</TabsList>

								<TabsContent value="duration" className="space-y-4 mt-4">
									{/* Lock Period (Optional) */}
									<div className="space-y-2">
										<Label>Lock Period (Optional)</Label>
										<p className="text-xs text-muted-foreground">
											Tokens are completely locked during this period
										</p>
										<div className="flex gap-2">
											<Input
												type="number"
												placeholder="0"
												value={lockDurationValue}
												onChange={(e) => setLockDurationValue(e.target.value)}
												min="0"
												className="flex-1"
											/>
											<Select value={lockDurationUnit} onValueChange={setLockDurationUnit}>
												<SelectTrigger className="w-32">
													<SelectValue />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="minutes">Minutes</SelectItem>
													<SelectItem value="hours">Hours</SelectItem>
													<SelectItem value="days">Days</SelectItem>
													<SelectItem value="weeks">Weeks</SelectItem>
													<SelectItem value="months">Months</SelectItem>
												</SelectContent>
											</Select>
										</div>
									</div>

									{/* Linear Vesting Period */}
									<div className="space-y-2">
										<Label>Linear Vesting Period *</Label>
										<p className="text-xs text-muted-foreground">
											Tokens unlock linearly over this period
										</p>
										<div className="flex gap-2">
											<Input
												type="number"
												placeholder="0"
												value={vestingDurationValue}
												onChange={(e) => setVestingDurationValue(e.target.value)}
												min="1"
												className="flex-1"
											/>
											<Select value={vestingDurationUnit} onValueChange={setVestingDurationUnit}>
												<SelectTrigger className="w-32">
													<SelectValue />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="minutes">Minutes</SelectItem>
													<SelectItem value="hours">Hours</SelectItem>
													<SelectItem value="days">Days</SelectItem>
													<SelectItem value="weeks">Weeks</SelectItem>
													<SelectItem value="months">Months</SelectItem>
												</SelectContent>
											</Select>
										</div>
									</div>
								</TabsContent>

								<TabsContent value="date" className="space-y-4 mt-4">
									{/* Vesting Start Date */}
									<div className="space-y-2">
										<Label>Vesting Start Date</Label>
										<p className="text-xs text-muted-foreground">
											When linear release begins (leave empty for immediate)
										</p>
										<Popover>
											<PopoverTrigger asChild>
												<Button
													variant="outline"
													className={cn(
														"w-full justify-start text-left font-normal",
														!vestingStartDate && "text-muted-foreground"
													)}
												>
													<Calendar className="mr-2 h-4 w-4" />
													{vestingStartDate ? (
														format(vestingStartDate, "PPP 'at' HH:mm")
													) : (
														<span>Pick a date</span>
													)}
												</Button>
											</PopoverTrigger>
											<PopoverContent className="w-auto p-0" align="start">
												<CalendarComponent
													mode="single"
													selected={vestingStartDate}
													onSelect={setVestingStartDate}
													disabled={(date: Date) => date < new Date()}
													initialFocus
												/>
												<div className="p-3 border-t">
													<Input
														type="time"
														value={vestingStartDate ? format(vestingStartDate, "HH:mm") : ""}
														onChange={(e) => {
															if (vestingStartDate && e.target.value) {
																const [hours, minutes] = e.target.value.split(":")
																const newDate = new Date(vestingStartDate)
																newDate.setHours(parseInt(hours), parseInt(minutes))
																setVestingStartDate(newDate)
															}
														}}
													/>
												</div>
											</PopoverContent>
										</Popover>
									</div>

									{/* Vesting End Date */}
									<div className="space-y-2">
										<Label>Vesting End Date</Label>
										<p className="text-xs text-muted-foreground">
											When all tokens are fully unlocked
										</p>
										<Popover>
											<PopoverTrigger asChild>
												<Button
													variant="outline"
													className={cn(
														"w-full justify-start text-left font-normal",
														!vestingEndDate && "text-muted-foreground"
													)}
												>
													<Calendar className="mr-2 h-4 w-4" />
													{vestingEndDate ? (
														format(vestingEndDate, "PPP 'at' HH:mm")
													) : (
														<span>Pick a date</span>
													)}
												</Button>
											</PopoverTrigger>
											<PopoverContent className="w-auto p-0" align="start">
												<CalendarComponent
													mode="single"
													selected={vestingEndDate}
													onSelect={setVestingEndDate}
													disabled={(date: Date) => 
														date < (vestingStartDate || new Date())
													}
													initialFocus
												/>
												<div className="p-3 border-t">
													<Input
														type="time"
														value={vestingEndDate ? format(vestingEndDate, "HH:mm") : ""}
														onChange={(e) => {
															if (vestingEndDate && e.target.value) {
																const [hours, minutes] = e.target.value.split(":")
																const newDate = new Date(vestingEndDate)
																newDate.setHours(parseInt(hours), parseInt(minutes))
																setVestingEndDate(newDate)
															}
														}}
													/>
												</div>
											</PopoverContent>
										</Popover>
									</div>
								</TabsContent>
							</Tabs>
						</div>

						{/* Visual Timeline */}
						{showTimeline && (
							<VestingTimeline
								lockStartDate={dates.lockStartDate}
								vestingStartDate={dates.vestingStartDate}
								vestingEndDate={dates.vestingEndDate}
								amount={amount}
								symbol={selectedCoinData?.symbol}
								usdValue={usdValue}
							/>
						)}

						{/* Create Button */}
						<Button
							onClick={handleCreateVesting}
							disabled={isCreating || !selectedCoin || !amount || !showTimeline}
							className="w-full"
							size="lg"
						>
							{isCreating ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Creating Vesting Position...
								</>
							) : (
								<>
									<Lock className="mr-2 h-4 w-4" />
									Create Vesting Position
								</>
							)}
						</Button>
					</>
				)}
			</CardContent>
		</Card>
	)
}