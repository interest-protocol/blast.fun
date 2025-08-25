"use client"

import { useState, useEffect, useMemo } from "react"
import { useApp } from "@/context/app.context"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Loader2, Send, AlertCircle } from "lucide-react"
import type { WalletCoin } from "@/types/blockvision"
import toast from "react-hot-toast"
import { suiClient } from "@/lib/sui-client"
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519"
import { coinWithBalance, Transaction } from "@mysten/sui/transactions"
import { CoinMetadata } from "@mysten/sui/client"
import { useTransaction } from "@/hooks/sui/use-transaction"

interface AirdropRecipient {
	address: string
	amount: string
	originalInput?: string // @dev: Store original input for display (e.g., "alice.sui")
	isResolving?: boolean
	resolutionError?: string
}

export function AirdropUtility() {
	const { address } = useApp()
	const [coins, setCoins] = useState<WalletCoin[]>([])
	const [selectedCoin, setSelectedCoin] = useState<string>("")
	const [csvInput, setCsvInput] = useState<string>("")
	const [recipients, setRecipients] = useState<AirdropRecipient[]>([])
	const [isLoadingCoins, setIsLoadingCoins] = useState(false)
	const [viewMode, setViewMode] = useState<"csv" | "table">("csv")
	const [isResolvingAddresses, setIsResolvingAddresses] = useState(false)
	const { executeTransaction } = useTransaction()

	// @dev: Fetch user's coins from BlockVision API
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

	// @dev: Helper function to check if input is a SuiNS name
	const isSuiNSName = (input: string): boolean => {
		return input.endsWith(".sui") || input.startsWith("@")
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

	// @dev: Parse CSV input and auto-detect separator with SuiNS support
	useEffect(() => {
		if (!csvInput.trim()) {
			setRecipients([])
			return
		}

		const parseAndResolve = async () => {
			setIsResolvingAddresses(true)
			const lines = csvInput.trim().split("\n")
			const parsedRecipients: AirdropRecipient[] = []

			for (const line of lines) {
				const trimmedLine = line.trim()
				if (!trimmedLine) continue

				// @dev: Auto-detect separator (tab or comma)
				const separator = trimmedLine.includes("\t") ? "\t" : ","
				const parts = trimmedLine.split(separator).map(p => p.trim())

				if (parts.length >= 2) {
					const [addressInput, amount] = parts
					
					// @dev: Check if it's a SuiNS name
					if (isSuiNSName(addressInput)) {
						parsedRecipients.push({
							address: "", // @dev: Will be resolved
							amount,
							originalInput: addressInput,
							isResolving: true,
						})
						
						// @dev: Resolve the SuiNS name
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
					} 
					// @dev: Regular address validation
					else if (addressInput.startsWith("0x") && addressInput.length >= 42) {
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
	}, [csvInput])

	const handleAirdrop = async () => {
		if(!address){
			return;
		}
		if (!selectedCoin) {
			toast.error("Please select a coin")
			return
		}

		if (recipients.length === 0) {
			toast.error("Please add recipients")
			return
		}

		// @dev: Log airdrop data for future implementation
		console.log("Airdrop Data:", {
			coin: selectedCoin,
			recipients,
			totalRecipients: recipients.length,
			totalAmount: recipients.reduce((sum, r) => sum + parseFloat(r.amount || "0"), 0),
		})

		const coinMetadata = await suiClient.getCoinMetadata({
			coinType: selectedCoin,
		}) as CoinMetadata

		const totalAmountToSend = BigInt(recipients.reduce((sum, r) => sum + parseFloat(r.amount || "0"), 0)  * Math.pow(10, coinMetadata.decimals))

		const localSuiPrivateKey = localStorage.getItem("localSuiPrivateKey")
		let delegatorKeypair: Ed25519Keypair;
		if(!localSuiPrivateKey) {
			delegatorKeypair = Ed25519Keypair.generate()
			localStorage.setItem("localSuiPrivateKey", delegatorKeypair.getSecretKey())
			return
		} else {
			delegatorKeypair = Ed25519Keypair.fromSecretKey(localSuiPrivateKey)
		}
		
		const delegatorAddress = delegatorKeypair.getPublicKey().toSuiAddress()

		// create new tx to send funding and gas to delegator.

		{
			const tx = new Transaction()
			tx.setSender(address)
			
			const coinInput = coinWithBalance({
				balance: totalAmountToSend,
				type: selectedCoin,
			})(tx)


			const gasInput = coinWithBalance({
				balance: BigInt(recipients.length * 0.02 * 10 ** coinMetadata.decimals),
				type: "0x2::sui::SUI",
			})(tx)

			tx.transferObjects([coinInput, gasInput], delegatorAddress)

			const txResult = await executeTransaction(tx)
			await suiClient.waitForTransaction({
				digest: txResult.digest,
			})
		}

		// let delegator run the airdrop.
		const batchPerTx = 1;
		const gasCoinObjectIds: string[] = []
		const coinObjectsWithBalance: {
			objectId: string,
			balance: number,
			used: boolean | null,
		}[] = []

		{
			// first: split the gas coin to prepare gas for each batch
			const splitCoinTx = new Transaction()
			splitCoinTx.setSender(delegatorAddress)

			const totalBatchNeeded = Math.ceil(recipients.length / batchPerTx)
			const amountEachGasObject = BigInt(recipients.length * 0.02 * 10 ** coinMetadata.decimals / totalBatchNeeded)

			const variableNames = Array.from({ length: totalBatchNeeded }, (_, i) => `C${i + 1}`).join(", ");
			const code = `
				const [${variableNames}] = splitCoinTx.splitCoins(splitCoinTx.gas, [${Array(totalBatchNeeded).fill(amountEachGasObject).join(", ")}]);
				splitCoinTx.transferObjects([${variableNames}], delegatorAddress);
			`;
			eval(code);

			const coinInput = coinWithBalance({
				balance: totalAmountToSend,
				type: selectedCoin,
			})(splitCoinTx)

			const splitSelectCoinCode = `
				const [${variableNames}] = splitCoinTx.splitCoins(coinInput, [${Array(totalBatchNeeded).fill(amountEachGasObject).join(", ")}]);
				splitCoinTx.transferObjects([${variableNames}], delegatorAddress);
			`;
			eval(splitSelectCoinCode);

			const result = await suiClient.signAndExecuteTransaction({
				transaction: splitCoinTx,
				signer: delegatorKeypair,
				options: {
					showObjectChanges: true,
				}
			})

			await suiClient.waitForTransaction({
				digest: result.digest,
			})

			const coinObjectIds = []
			
			if (result.objectChanges) {
				for (let i = 0; i < result.objectChanges.length; i++) {
					const change = result.objectChanges[i];
					if (change.type === "created" && change.objectType === "0x2::sui::SUI") {
						gasCoinObjectIds.push(change.objectId);
					} else if (change.type === "created" && change.objectType === selectedCoin) {
						coinObjectIds.push(change.objectId);
					}
				}
			}

			const coinObjectsGetResult = await suiClient.multiGetObjects({
				ids: coinObjectIds,
				options: {
					showContent: true,
				}
			})

			for(let i = 0; i < coinObjectsGetResult.length; i++) {
				const coinObject = coinObjectsGetResult[i]
				if(!coinObject.data) {
					throw new Error("Coin object not found")
				}
				coinObjectsWithBalance.push({
					objectId: coinObject.data.objectId,
					balance: (coinObject.data as any).content.fields.balance,
					used: false,
				})
			}
		}

		{
			// second: send the coin to the recipients
			for(let i = 0; i < gasCoinObjectIds.length; i++) {
				const tx = new Transaction()
				const gasCoin = await suiClient.getObject({
					id: gasCoinObjectIds[i],
				})
				if(!gasCoin.data) {
					throw new Error("Gas coin not found")
				}
				tx.setSender(delegatorAddress)
				tx.setGasPayment([{
					version: gasCoin.data.version,
					digest: gasCoin.data.digest,
					objectId: gasCoin.data.objectId,
				}])
				for(let j = 0; j < batchPerTx; j++) {
					const coinObject = coinObjectsWithBalance.find(c => !c.used)
					if(!coinObject) {
						throw new Error("No coin object found")
					}
					tx.transferObjects([coinObject.objectId], recipients[i * batchPerTx + j].address)
					coinObject.used = true
				}
				const txResult = await executeTransaction(tx)
				await suiClient.waitForTransaction({
					digest: txResult.digest,
				})
			}
		}

		// let delegator return the funds to the sender.

		toast.success("Airdrop data logged to console")
	}

	const selectedCoinInfo = useMemo(() => {
		return coins.find(c => c.coinType === selectedCoin)
	}, [coins, selectedCoin])

	const totalAmount = useMemo(() => {
		return recipients.reduce((sum, r) => sum + parseFloat(r.amount || "0"), 0)
	}, [recipients])

	if (!address) {
		return (
			<div className="flex items-center justify-center min-h-[60vh]">
				<p className="text-muted-foreground">Please connect your wallet to use the airdrop utility</p>
			</div>
		)
	}

	return (
		<div className="max-w-6xl mx-auto space-y-6">
			<Card>
				<CardHeader>
					<CardTitle>Airdrop Utility</CardTitle>
				</CardHeader>
				<CardContent className="space-y-6">
					{/* Coin Selection */}
					<div className="space-y-2">
						<Label htmlFor="coin-select">Select Coin</Label>
						<Select
							value={selectedCoin}
							onValueChange={setSelectedCoin}
							disabled={isLoadingCoins}
						>
							<SelectTrigger id="coin-select" className="w-full">
								{isLoadingCoins ? (
									<div className="flex items-center gap-2">
										<Loader2 className="h-4 w-4 animate-spin" />
										<span>Loading coins...</span>
									</div>
								) : (
									<SelectValue placeholder="Select a coin to airdrop" />
								)}
							</SelectTrigger>
							<SelectContent>
								{coins.map((coin) => (
									<SelectItem key={coin.coinType} value={coin.coinType}>
										<div className="flex items-center gap-2">
											<span className="font-medium">{coin.symbol}</span>
											<span className="text-muted-foreground text-xs">
												Balance: {parseFloat(coin.balance) / Math.pow(10, coin.decimals)}
											</span>
										</div>
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						{selectedCoinInfo && (
							<p className="text-sm text-muted-foreground">
								Available balance: {parseFloat(selectedCoinInfo.balance) / Math.pow(10, selectedCoinInfo.decimals)} {selectedCoinInfo.symbol}
							</p>
						)}
					</div>

					{/* Recipients Input */}
					<div className="space-y-2">
						<Label>Recipients</Label>
						<Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "csv" | "table")}>
							<TabsList className="grid w-full grid-cols-2">
								<TabsTrigger value="csv">CSV Input</TabsTrigger>
								<TabsTrigger value="table">Preview ({recipients.length})</TabsTrigger>
							</TabsList>
							
							<TabsContent value="csv" className="space-y-4">
								<div className="space-y-2">
									<Label htmlFor="csv-input">
										Enter addresses and amounts (tab or comma separated)
									</Label>
									<Textarea
										id="csv-input"
										placeholder="0x123...abc,100
alice.sui,200
@bob,300
0x789...ghi	400"
										className="min-h-[200px] font-mono text-sm"
										value={csvInput}
										onChange={(e) => setCsvInput(e.target.value)}
									/>
									<p className="text-xs text-muted-foreground">
										Format: address/SuiNS[tab or comma]amount (one per line). Supports SuiNS names (e.g., alice.sui or @alice)
									</p>
								</div>
							</TabsContent>

							<TabsContent value="table" className="space-y-4">
								{isResolvingAddresses && (
									<div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
										<Loader2 className="h-4 w-4 animate-spin" />
										<span className="text-sm">Resolving SuiNS names...</span>
									</div>
								)}
								<div className="border rounded-lg overflow-hidden">
									<div className="overflow-x-auto">
										<table className="w-full">
											<thead className="bg-muted/50">
												<tr>
													<th className="px-4 py-2 text-left text-sm font-medium">#</th>
													<th className="px-4 py-2 text-left text-sm font-medium">Input</th>
													<th className="px-4 py-2 text-left text-sm font-medium">Address</th>
													<th className="px-4 py-2 text-right text-sm font-medium">Amount</th>
												</tr>
											</thead>
											<tbody>
												{recipients.length === 0 ? (
													<tr>
														<td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
															No recipients added yet. Use the CSV input to add recipients.
														</td>
													</tr>
												) : (
													recipients.map((recipient, index) => (
														<tr key={index} className="border-t">
															<td className="px-4 py-2 text-sm">{index + 1}</td>
															<td className="px-4 py-2 text-sm">
																{recipient.originalInput && recipient.originalInput !== recipient.address ? (
																	<span className="text-muted-foreground">
																		{recipient.originalInput}
																	</span>
																) : (
																	"-"
																)}
															</td>
															<td className="px-4 py-2 text-sm font-mono">
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
																	<span className="text-muted-foreground">-</span>
																)}
															</td>
															<td className="px-4 py-2 text-sm text-right">{recipient.amount}</td>
														</tr>
													))
												)}
											</tbody>
											{recipients.length > 0 && (
												<tfoot className="bg-muted/50 border-t">
													<tr>
														<td colSpan={3} className="px-4 py-2 text-sm font-medium">
															Total
														</td>
														<td className="px-4 py-2 text-sm font-medium text-right">
															{totalAmount.toFixed(2)}
														</td>
													</tr>
												</tfoot>
											)}
										</table>
									</div>
								</div>
							</TabsContent>
						</Tabs>
					</div>

					{/* Summary and Action */}
					{recipients.length > 0 && (
						<Card className="bg-muted/30">
							<CardContent className="pt-6">
								<div className="flex items-center justify-between">
									<div className="space-y-1">
										<p className="text-sm text-muted-foreground">Summary</p>
										<p className="text-lg font-medium">
											{recipients.length} recipients • {totalAmount.toFixed(2)} {selectedCoinInfo?.symbol || "tokens"}
										</p>
									</div>
									<Button 
										onClick={handleAirdrop}
										disabled={!selectedCoin || recipients.length === 0}
										className="gap-2"
									>
										<Send className="h-4 w-4" />
										Airdrop
									</Button>
								</div>
							</CardContent>
						</Card>
					)}
				</CardContent>
			</Card>
		</div>
	)
}