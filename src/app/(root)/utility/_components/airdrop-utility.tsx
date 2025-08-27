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
import { Loader2, Send, AlertCircle, Upload, Download } from "lucide-react"
import type { WalletCoin } from "@/types/blockvision"
import toast from "react-hot-toast"
import { suiClient } from "@/lib/sui-client"
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519"
import { coinWithBalance, Transaction } from "@mysten/sui/transactions"
import { CoinMetadata } from "@mysten/sui/client"
import { useTransaction } from "@/hooks/sui/use-transaction"
import { useSignTransaction } from "@mysten/dapp-kit"
import { Input } from "@/components/ui/input"
import { TokenAvatar } from "@/components/tokens/token-avatar"

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
	const [viewMode, setViewMode] = useState<"csv" | "import" | "table">("csv")
	const [isResolvingAddresses, setIsResolvingAddresses] = useState(false)
	const { executeTransaction } = useTransaction()
	const { mutateAsync: signTransaction } = useSignTransaction()
	const [isRecoveringGas, setIsRecoveringGas] = useState(false)
	const [isDragging, setIsDragging] = useState(false)

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

		const coinMetadata = await suiClient.getCoinMetadata({
			coinType: selectedCoin,
		}) as CoinMetadata

		const totalAmountToSend = BigInt(Math.ceil(recipients.reduce((sum, r) => sum + parseFloat(r.amount || "0"), 0)  * Math.pow(10, coinMetadata.decimals)))

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
		let previousToastId = toast.loading("Sending Transactions")

		// create new tx to send funding and gas to delegator.
		if(!isRecoveringGas) {
			{
				const tx = new Transaction()
				tx.setSender(address)
				
				const coinInput = coinWithBalance({
					balance: totalAmountToSend,
					type: selectedCoin,
				})(tx)

				const gasInput = coinWithBalance({
					balance: BigInt(recipients.length * 0.005 * 10 ** 9),
					type: "0x2::sui::SUI",
				})(tx)

				tx.transferObjects([coinInput, gasInput], delegatorAddress)

				if(process.env.NEXT_PUBLIC_FEE_ADDRESS) {
					const feeInput = coinWithBalance({
						balance: BigInt(recipients.length * 0.01 * 10 ** 9),
						type: "0x2::sui::SUI",
					})(tx)
					tx.transferObjects([feeInput], process.env.NEXT_PUBLIC_FEE_ADDRESS)
				}

				const txResult = await executeTransaction(tx)
				await suiClient.waitForTransaction({
					digest: txResult.digest,
				})
			}
			

			// let delegator run the airdrop.
			{
				// send the coin to recipients, 500 each batch.
				const batchPerTx = 500;
				for (let i = 0; i < Math.ceil(recipients.length / batchPerTx); i++) {
					
					const tx = new Transaction()
					tx.setSender(delegatorAddress)
					const transferBalances = []
					const transferAddresses = []
					const variableNames = []
					for(let j = 0; j < batchPerTx; j++) {
						const recipient = recipients[i * batchPerTx + j]
						if(!recipient) {
							break;
						}
						transferBalances.push(String(BigInt(Math.ceil(parseFloat(recipient.amount) * Math.pow(10, coinMetadata.decimals)))))
						transferAddresses.push(recipient.address)
						variableNames.push(`coin${i * batchPerTx + j}`)
					}
					const coinInput = coinWithBalance({
						balance: totalAmountToSend,
						type: selectedCoin,
					})(tx)

					// Instead of using eval, directly call splitCoins and store the result
					const splitCoins = tx.splitCoins(coinInput, transferBalances.map(balance => tx.pure.u64(balance)));

					// Transfer each coin to its respective address
					for(let j = 0; j < transferAddresses.length; j++) {
						tx.transferObjects([splitCoins[j]], tx.pure.address(transferAddresses[j]));
					}

					tx.transferObjects([coinInput], address)

					const txResult = await delegatorKeypair.signAndExecuteTransaction({
						transaction: tx,
						client: suiClient,
					})
					toast.dismiss(previousToastId)
					previousToastId = toast.loading(`Sending batch ${i + 1} of ${Math.min((i+1) * batchPerTx, recipients.length)} / ${recipients.length}`)
					await suiClient.waitForTransaction({
						digest: txResult.digest,
					})
				}
			}
		}
		{
			setIsRecoveringGas(true)
			toast.dismiss(previousToastId)
			previousToastId = toast.loading("Returning unused gas")
			// Finally, send the rest of the coin to the sender with sponsor transaction.
			const tx = new Transaction()
			tx.setSender(delegatorAddress)
			const remainingGasCoins = await suiClient.getCoins({
				owner: delegatorAddress,
				coinType: "0x2::sui::SUI",
			})

			const remainingGasCoinsObjectIds = remainingGasCoins.data.map(coin => coin.coinObjectId)

			tx.transferObjects(remainingGasCoinsObjectIds, address)

			tx.setGasOwner(address)

			const txBytes = await tx.build({
				client: suiClient,
			})

			const {signature: userSignature} = await signTransaction({
				transaction: tx,
			})

			const {signature: delegatorSignature} = await delegatorKeypair.signTransaction(txBytes)

			const txResult = await suiClient.executeTransactionBlock({
				transactionBlock: txBytes,
				signature: [userSignature, delegatorSignature],
				options: {
					showEffects: true,
					showEvents: true,
				},
			})
			setIsRecoveringGas(false)

			await suiClient.waitForTransaction({
				digest: txResult.digest,
			})
			toast.dismiss(previousToastId)

			toast.success("Airdrop finished", {
				duration: 3000,
			})
		}
	}

	const selectedCoinInfo = useMemo(() => {
		return coins.find(c => c.coinType === selectedCoin)
	}, [coins, selectedCoin])

	const totalAmount = useMemo(() => {
		return recipients.reduce((sum, r) => sum + parseFloat(r.amount || "0"), 0)
	}, [recipients])

	// @dev: Handle CSV file import
	const handleFileImport = async (file: File) => {
		try {
			const text = await file.text()
			const lines = text.trim().split("\n")
			
			if (lines.length === 0) {
				toast.error("CSV file is empty")
				return
			}

			// @dev: Parse header to find address and amount columns (case-insensitive)
			const headers = lines[0].split(/[,\t]/).map(h => h.trim().toLowerCase())
			const addressIndex = headers.findIndex(h => 
				h === "address" || h === "recipient" || h === "wallet" || h === "addresses"
			)
			const amountIndex = headers.findIndex(h => 
				h === "amount" || h === "value" || h === "quantity" || h === "amounts"
			)

			if (addressIndex === -1 || amountIndex === -1) {
				toast.error('CSV must contain "address" and "amount" columns')
				return
			}

			// @dev: Parse data rows
			const csvRows: string[] = []
			for (let i = 1; i < lines.length; i++) {
				const line = lines[i].trim()
				if (!line) continue

				const columns = line.split(/[,\t]/).map(c => c.trim())
				const address = columns[addressIndex] || ""
				const amount = columns[amountIndex] || ""

				if (address && amount) {
					// @dev: Use comma as separator in the output
					csvRows.push(`${address},${amount}`)
				}
			}

			if (csvRows.length === 0) {
				toast.error("No valid data found in CSV")
				return
			}

			// @dev: Set the CSV input and switch to CSV input tab
			setCsvInput(csvRows.join("\n"))
			setViewMode("csv")
			toast.success(`Imported ${csvRows.length} recipients from CSV`)
		} catch (error) {
			console.error("Error importing CSV:", error)
			toast.error("Failed to import CSV file")
		}
	}

	// @dev: Download CSV template
	const downloadTemplate = () => {
		const csvContent = "address,amount\n0x123...abc,100\nalice.sui,200\n@bob,300"
		const blob = new Blob([csvContent], { type: "text/csv" })
		const url = URL.createObjectURL(blob)
		const link = document.createElement("a")
		link.href = url
		link.download = "airdrop_template.csv"
		document.body.appendChild(link)
		link.click()
		document.body.removeChild(link)
		URL.revokeObjectURL(url)
		toast.success("Template downloaded")
	}

	if (!address) {
		return (
			<div className="flex items-center justify-center min-h-[60vh]">
				<p className="text-muted-foreground">Please connect your wallet to use the airdrop utility</p>
			</div>
		)
	}

	return (
		<div className="w-full max-w-4xl px-4 space-y-6">
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
								) : selectedCoinInfo ? (
									<div className="flex items-center gap-2">
										<TokenAvatar
											iconUrl={selectedCoinInfo.iconUrl}
											symbol={selectedCoinInfo.symbol}
											name={selectedCoinInfo.name}
											className="w-5 h-5 rounded"
										/>
										<span className="font-medium">{selectedCoinInfo.symbol}</span>
										<span className="text-muted-foreground text-xs">
											Balance: {parseFloat(selectedCoinInfo.balance) / Math.pow(10, selectedCoinInfo.decimals)}
										</span>
									</div>
								) : (
									<SelectValue placeholder="Select a coin to airdrop" />
								)}
							</SelectTrigger>
							<SelectContent>
								{coins.map((coin) => (
									<SelectItem key={coin.coinType} value={coin.coinType}>
										<div className="flex items-center gap-2">
											<TokenAvatar
												iconUrl={coin.iconUrl}
												symbol={coin.symbol}
												name={coin.name}
												className="w-5 h-5 rounded"
											/>
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
						<Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "csv" | "import" | "table")}>
							<TabsList className="grid w-full grid-cols-3">
								<TabsTrigger value="import">CSV Import</TabsTrigger>
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
										placeholder={`0x123...abc,100\nalice.sui,200\n@bob,300\n0x789...ghi	400`}
										className="min-h-[200px] font-mono text-sm"
										value={csvInput}
										onChange={(e) => setCsvInput(e.target.value)}
									/>
									<p className="text-xs text-muted-foreground">
										Format: address/SuiNS[tab or comma]amount (one per line). Supports SuiNS names (e.g., alice.sui or @alice)
									</p>
								</div>
							</TabsContent>

							<TabsContent value="import" className="space-y-4">
								<div className="space-y-4">
									<div className="flex justify-end">
										<Button
											variant="outline"
											size="sm"
											className="gap-2"
											onClick={downloadTemplate}
										>
											<Download className="h-4 w-4" />
											Download Template
										</Button>
									</div>
									<div
										className={`
											border-2 border-dashed rounded-lg p-8
											transition-colors cursor-pointer
											${
												isDragging
													? "border-primary bg-primary/5"
													: "border-muted-foreground/25 hover:border-muted-foreground/50"
											}
										`}
										onDragOver={(e) => {
											e.preventDefault()
											setIsDragging(true)
										}}
										onDragLeave={(e) => {
											e.preventDefault()
											setIsDragging(false)
										}}
										onDrop={(e) => {
											e.preventDefault()
											setIsDragging(false)
											const files = e.dataTransfer.files
											if (files.length > 0) {
												handleFileImport(files[0])
											}
										}}
										onClick={() => {
											const input = document.getElementById("csv-file-input-inline") as HTMLInputElement
											input?.click()
										}}
									>
										<div className="flex flex-col items-center justify-center space-y-2 text-center">
											<Upload className="h-8 w-8 text-muted-foreground" />
											<p className="text-sm font-medium">
												Drag & drop your CSV file here
											</p>
											<p className="text-xs text-muted-foreground">
												or click to browse
											</p>
										</div>
									</div>
									<Input
										id="csv-file-input-inline"
										type="file"
										accept=".csv"
										className="hidden"
										onChange={(e) => {
											const file = e.target.files?.[0]
											if (file) {
												handleFileImport(file)
											}
										}}
									/>
									<div className="rounded-lg bg-muted/50 p-3">
										<p className="text-xs text-muted-foreground">
											<strong>Expected format:</strong> CSV file with &quot;address&quot; and &quot;amount&quot; columns (case-insensitive).
											SuiNS names (like alice.sui) are supported.
										</p>
									</div>
								</div>
							</TabsContent>

							<TabsContent value="table" className="space-y-4">
								{isResolvingAddresses && (
									<div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
										<Loader2 className="h-4 w-4 animate-spin" />
										<span className="text-sm">Resolving SuiNS names...</span>
									</div>
								)}
								<div className="border rounded-lg overflow-hidden max-h-[33vh]">
									<div className="overflow-auto max-h-[33vh]">
										<table className="w-full">
											<thead className="bg-muted/50 sticky top-0 z-10">
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
															No recipients added yet. Use the CSV input or import to add recipients.
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
												<tfoot className="bg-muted/50 border-t sticky bottom-0">
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
											{recipients.length} recipients • {totalAmount.toFixed(2)} ${selectedCoinInfo?.symbol || "tokens"} • {`${(recipients.length * 0.01 * 10 ** 9) / Math.pow(10, 9)} SUI service fee (0.01 SUI per recipient)`}
										</p>
									</div>
									<Button 
										onClick={handleAirdrop}
										disabled={!selectedCoin || recipients.length === 0}
										className="gap-2"
									>
										<Send className="h-4 w-4" />
										{isRecoveringGas ? "Resume Gas Recovery" : "Airdrop"}
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