"use client"

import { useState, useEffect, useMemo } from "react"
import { useApp } from "@/context/app.context"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Loader2, Send, AlertCircle } from "lucide-react"
import { Logo } from "@/components/ui/logo"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { WalletCoin } from "@/types/blockvision"
import { suiClient } from "@/lib/sui-client"
import { TokenSelectionDialog } from "@/components/shared/token-selection-dialog"
import { useAirdrop } from "../_hooks/use-airdrop"
import toast from "react-hot-toast"
import { isValidSuiNSName } from "@mysten/sui/utils"

export interface AirdropRecipient {
	address: string
	amount: string
	originalInput?: string
	isResolving?: boolean
	resolutionError?: string
}

export function AirdropTools() {
	const { address, setIsConnectDialogOpen } = useApp()
	const [coins, setCoins] = useState<WalletCoin[]>([])
	const [selectedCoin, setSelectedCoin] = useState<string>("")
	const [csvInput, setCsvInput] = useState<string>("example.sui,0.001\n0x0000000000000000000000000000000000000000000000000000000000000000,0.001")
	const [debouncedCsvInput, setDebouncedCsvInput] = useState<string>(csvInput)
	const [recipients, setRecipients] = useState<AirdropRecipient[]>([])
	const [isLoadingCoins, setIsLoadingCoins] = useState(false)
	const [isResolvingAddresses, setIsResolvingAddresses] = useState(false)

	const {
		handleAirdrop,
		isRecoveringGas,
		isAirdropComplete,
		lastCsvInput,
		delegatorAddress,
		airdropProgress,
		isProcessing
	} = useAirdrop({ address, selectedCoin, recipients, csvInput })

	// debounce input to avoid parsing on every tick
	useEffect(() => {
		const timer = setTimeout(() => {
			setDebouncedCsvInput(csvInput)
		}, 500)

		return () => clearTimeout(timer)
	}, [csvInput])

	// fetch user's coins from blockvision
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
					setCoins(data.coins)
					if (data.coins.length > 0 && !selectedCoin) {
						setSelectedCoin(data.coins[0].coinType)
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

	// @dev: Check if input is a SuiNS name
	const isSuiNSName = (input: string): boolean => {
		return input.startsWith("@") || input.endsWith(".sui") || (!input.startsWith("0x") && !input.includes(","))
	}

	// @dev: Resolve SuiNS name to address
	const resolveSuiNSName = async (name: string): Promise<string | null> => {
		try {
			// @dev: Format the name properly for resolution
			let formattedName = name
			
			// @dev: Remove @ if present
			if (formattedName.startsWith("@")) {
				formattedName = formattedName.slice(1)
			}
			
			// @dev: Add .sui if not present
			if (!formattedName.endsWith(".sui")) {
				formattedName = `${formattedName}.sui`
			}
			
			// @dev: Resolve the name to address
			const resolved = await suiClient.resolveNameServiceAddress({
				name: formattedName,
			})
			
			return resolved || null
		} catch (error) {
			console.error(`Failed to resolve SuiNS name ${name}:`, error)
			return null
		}
	}

	// parse csv inputs
	useEffect(() => {
		if (!debouncedCsvInput.trim()) {
			setRecipients([])
			return
		}

		const parseAndResolve = async () => {
			setIsResolvingAddresses(true)
			const lines = debouncedCsvInput.trim().split("\n")
			const parsedRecipients: AirdropRecipient[] = []

			for (const line of lines) {
				const trimmedLine = line.trim()
				if (!trimmedLine) continue

				const separator = trimmedLine.includes("\t") ? "\t" : ","
				const parts = trimmedLine.split(separator).map(p => p.trim())

				if (parts.length >= 2) {
					const [addressInput, amount] = parts
					
					if (isValidSuiNSName(addressInput)) {
						parsedRecipients.push({
							address: "",
							amount,
							originalInput: addressInput,
							isResolving: true,
						})

						const resolvedAddress = await resolveSuiNSName(addressInput)
						if (resolvedAddress) {
							parsedRecipients[parsedRecipients.length - 1] = {
								address: resolvedAddress,
								amount,
								originalInput: addressInput,
								isResolving: false,
							}
						} else {
							parsedRecipients[parsedRecipients.length - 1] = {
								address: "",
								amount,
								originalInput: addressInput,
								isResolving: false,
								resolutionError: `Failed to resolve ${addressInput}`,
							}
						}
					} else if (addressInput.startsWith("0x") && addressInput.length >= 42) {
						parsedRecipients.push({ 
							address: addressInput, 
							amount,
							originalInput: addressInput,
						})
					}
				}
			}

			setRecipients(parsedRecipients)
			setIsResolvingAddresses(false)
		}

		parseAndResolve()
	}, [debouncedCsvInput])

	const selectedCoinInfo = useMemo(() => {
		return coins.find(c => c.coinType === selectedCoin)
	}, [coins, selectedCoin])

	const totalAmount = useMemo(() => {
		return recipients.reduce((sum, r) => sum + parseFloat(r.amount || "0"), 0)
	}, [recipients])

	if (!address) {
		return (
			<div className="flex flex-col items-center justify-center min-h-[60vh]">
				<Logo className="w-12 h-12 mx-auto mb-4 text-foreground/20" />
				<p className="font-mono text-sm uppercase tracking-wider text-muted-foreground">
					WALLET NOT CONNECTED
				</p>
				<p className="font-mono text-xs uppercase text-muted-foreground/60 mt-2">
					CONNECT YOUR WALLET TO ACCESS AIRDROP TOOLS
				</p>
				<Button
					onClick={() => setIsConnectDialogOpen(true)}
					className="font-mono uppercase tracking-wider mt-6"
					variant="outline"
				>
					CONNECT WALLET
				</Button>
			</div>
		)
	}

	return (
		<div className="grid lg:grid-cols-3 gap-4 lg:h-full lg:min-h-0">
			<div className="lg:col-span-2 lg:flex lg:flex-col lg:min-h-0 lg:overflow-hidden">
				<div className="border-2 shadow-lg rounded-xl">
					<div className="p-4 border-b">
						<h3 className="font-mono text-lg uppercase tracking-wider text-foreground/80">AIRDROP CONFIGURATION</h3>
					</div>

					<div className="p-4 space-y-6">
							{/* Coin Selection */}
							<div className="space-y-2">
								<Label className="font-mono text-xs uppercase tracking-wider text-muted-foreground">SELECT TOKEN</Label>
								<TokenSelectionDialog
									coins={coins}
									selectedCoin={selectedCoin}
									onSelectCoin={setSelectedCoin}
									isLoading={isLoadingCoins}
								/>
							</div>

							{/* CSV Input */}
							<div className="space-y-2">
								<Label htmlFor="csv-input" className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
									RECIPIENTS DATA
								</Label>
								<div className="relative">
									<Textarea
										id="csv-input"
										placeholder={`0x123...abc,100\nalice.sui,200\n@bob,300`}
										className="min-h-[200px] max-h-[600px] font-mono text-sm bg-background/50 border-2 placeholder:text-muted-foreground/40 resize-none overflow-y-auto"
										value={csvInput}
										onChange={(e) => setCsvInput(e.target.value)}
									/>
									{csvInput && (
										<div className="absolute top-2 right-6 select-none">
											<span className="px-2 py-1 bg-background/80 rounded text-xs font-mono uppercase text-muted-foreground">
												{csvInput.split('\n').filter(l => l.trim()).length} LINES
											</span>
										</div>
									)}
								</div>
								<div className="grid grid-cols-2 md:grid-cols-3 gap-2 pt-2">
									<div className="space-y-1">
										<p className="font-mono text-xs uppercase text-foreground/80">FORMAT</p>
										<p className="font-mono text-xs text-muted-foreground/60">ADDRESS,AMOUNT</p>
									</div>
									<div className="space-y-1">
										<p className="font-mono text-xs uppercase text-foreground/80">SUPPORTS</p>
										<p className="font-mono text-xs text-muted-foreground/60">SUINS & @HANDLES</p>
									</div>
									<div className="space-y-1">
										<p className="font-mono text-xs uppercase text-foreground/80">STATUS</p>
										{recipients.length > 0 ? (
											<>
												<p className="font-mono text-xs text-green-500">{recipients.filter(r => !r.resolutionError).length} VALID</p>
												{recipients.some(r => r.resolutionError) && (
													<p className="font-mono text-xs text-destructive">{recipients.filter(r => r.resolutionError).length} ERRORS</p>
												)}
											</>
										) : (
											<p className="font-mono text-xs text-muted-foreground/60">AWAITING INPUT</p>
										)}
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>

		<div className="lg:col-span-1 lg:flex lg:flex-col gap-4 lg:min-h-0 lg:overflow-hidden">
			<div className="border-2 shadow-lg rounded-xl lg:flex-shrink-0">
				<div className="p-4 border-b">
					<h3 className="text-lg font-mono uppercase tracking-wider text-foreground/80">
						AIRDROP PREVIEW
					</h3>
				</div>

				<div className="p-4 space-y-4">
					{selectedCoinInfo && recipients.length > 0 ? (
						<div className="space-y-6">
							{/* Stats Grid */}
							<div className="grid grid-cols-2 gap-4">
								{/* Recipients Count */}
								<div className="space-y-1">
									<p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">RECIPIENTS</p>
									<p className="font-mono text-2xl font-bold text-foreground/80">{recipients.length}</p>
								</div>

								{/* Total Amount */}
								<div className="space-y-1">
									<p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">TOTAL AMOUNT</p>
									<p className="font-mono text-2xl font-bold text-foreground/80">
										{totalAmount.toFixed(2)}
									</p>
									<p className="font-mono text-xs uppercase text-muted-foreground/60">
										{selectedCoinInfo.symbol}
									</p>
								</div>

								{/* Service Fee */}
								<div className="space-y-1">
									<p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">SERVICE FEE</p>
									<p className="font-mono text-2xl font-bold text-foreground/80">
										{(recipients.length * 0.01).toFixed(2)}
									</p>
									<p className="font-mono text-xs uppercase text-muted-foreground/60">
										SUI
									</p>
								</div>

								{/* Status */}
								<div className="space-y-1">
									<p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">STATUS</p>
									{recipients.some(r => r.resolutionError) ? (
										<>
											<p className="font-mono text-2xl font-bold text-destructive">
												{recipients.filter(r => r.resolutionError).length} ERRORS
											</p>
											<p className="font-mono text-xs uppercase text-destructive/60">
												CHECK ADDRESSES
											</p>
										</>
									) : (
										<>
											<p className="font-mono text-2xl font-bold text-green-500">
												READY
											</p>
											<p className="font-mono text-xs uppercase text-green-500/60">
												ALL VALID
											</p>
										</>
									)}
								</div>
							</div>

							{/* Completion Status */}
							{isAirdropComplete && delegatorAddress && csvInput === lastCsvInput && (
								<div className="text-center pt-4 border-t">
									<a
										href={`https://suivision.xyz/account/${delegatorAddress}?tab=Activity`}
										target="_blank"
										rel="noopener noreferrer"
										className="font-mono text-xs text-primary hover:underline uppercase"
									>
										VIEW TRANSACTIONS
									</a>
								</div>
							)}

							{/* Action Button */}
							<Button
								onClick={handleAirdrop}
								disabled={!selectedCoin || recipients.length === 0 || recipients.some(r => r.resolutionError) || isProcessing}
								className="w-full font-mono uppercase tracking-wider py-6 text-sm"
								size="lg"
							>
								{isProcessing ? (
									<>
										<Loader2 className="h-4 w-4 mr-2 animate-spin" />
										{airdropProgress || "Processing..."}
									</>
								) : (
									<>
										<Send className="h-4 w-4 mr-2" />
										{isRecoveringGas
											? "RESUME GAS RECOVERY"
											: (isAirdropComplete && csvInput === lastCsvInput
												? "EXECUTE AIRDROP AGAIN"
												: "EXECUTE AIRDROP"
											)
										}
									</>
								)}
							</Button>

							{recipients.some(r => r.resolutionError) && (
								<p className="font-mono text-xs uppercase text-destructive text-center">
									FIX ADDRESS ERRORS BEFORE PROCEEDING
								</p>
							)}
						</div>
					) : (
						<div className="text-center py-8">
							<Logo className="w-12 h-12 mx-auto mb-4 animate-bounce" />
							<p className="font-mono text-sm uppercase text-muted-foreground">AWAITING::INPUT</p>
							<p className="font-mono text-xs uppercase text-muted-foreground/60 mt-2">
								SELECT_COIN_AND_ADD_RECIPIENTS
							</p>
						</div>
					)}
				</div>
			</div>

			{/* Recipients Preview */}
			{recipients.length > 0 && (
				<div className="border-2 shadow-lg rounded-xl lg:flex lg:flex-col lg:min-h-0 lg:overflow-hidden">
					<div className="p-4 border-b flex items-center justify-between lg:flex-shrink-0">
						<h3 className="font-mono text-lg uppercase tracking-wider text-foreground/80">RECIPIENTS PREVIEW</h3>
						{isResolvingAddresses && (
							<div className="flex items-center gap-2">
								<Loader2 className="h-4 w-4 animate-spin" />
								<span className="text-xs font-mono uppercase">Resolving...</span>
							</div>
						)}
					</div>
					<ScrollArea className="lg:flex-1 lg:overflow-hidden">
						<table className="w-full">
							<thead className="bg-background/30 border-b-2 border-border sticky top-0 z-20">
								<tr>
									<th className="px-4 py-3 text-left font-mono text-xs uppercase tracking-wider text-muted-foreground">INPUT</th>
									<th className="px-4 py-3 text-left font-mono text-xs uppercase tracking-wider text-muted-foreground">ADDRESS</th>
									<th className="px-4 py-3 text-right font-mono text-xs uppercase tracking-wider text-muted-foreground">AMOUNT</th>
								</tr>
							</thead>
							<tbody>
								{recipients.map((recipient, index) => (
									<tr key={index} className="border-t hover:bg-muted/20 transition-colors">
										<td className="px-4 py-3 text-sm font-mono">
											{recipient.originalInput && recipient.originalInput !== recipient.address ? (
												<span className="text-muted-foreground">
													{recipient.originalInput.length > 20
														? `${recipient.originalInput.slice(0, 20)}...`
														: recipient.originalInput}
												</span>
											) : (
												<span className="text-muted-foreground/40">-</span>
											)}
										</td>
										<td className="px-4 py-3 text-sm font-mono">
											{recipient.isResolving ? (
												<span className="flex items-center gap-2 text-muted-foreground">
													<Loader2 className="h-3 w-3 animate-spin" />
													Resolving...
												</span>
											) : recipient.resolutionError ? (
												<span className="flex items-center gap-2 text-destructive">
													<AlertCircle className="h-3 w-3" />
													{recipient.resolutionError}
												</span>
											) : recipient.address ? (
												<a
													href={`https://suivision.xyz/account/${recipient.address}`}
													target="_blank"
													rel="noopener noreferrer"
													className="text-primary hover:underline"
												>
													{`${recipient.address.slice(0, 6)}...${recipient.address.slice(-4)}`}
												</a>
											) : (
												<span className="text-muted-foreground/40">-</span>
											)}
										</td>
										<td className="px-4 py-3 text-sm text-right font-mono font-semibold">{recipient.amount}</td>
									</tr>
								))}
							</tbody>
							<tfoot className="bg-background/30 border-t-2 border-border sticky bottom-0 z-20">
								<tr>
									<td colSpan={2} className="px-4 py-3 font-mono text-xs uppercase tracking-wider text-muted-foreground">
										TOTAL
									</td>
									<td className="px-4 py-3 font-mono text-sm uppercase text-right font-bold text-foreground/80">
										{totalAmount.toFixed(2)}
									</td>
								</tr>
							</tfoot>
						</table>
					</ScrollArea>
				</div>
			)}
		</div>
	</div>
	)
}