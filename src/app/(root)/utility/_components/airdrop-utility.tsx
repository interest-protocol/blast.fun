"use client"

import { useState, useEffect, useMemo, useRef } from "react"
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
// Removed Card import - using div with proper styling instead
import { Label } from "@/components/ui/label"
import { Loader2, Send, AlertCircle, Upload, Download } from "lucide-react"
import { Logo } from "@/components/ui/logo"
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
	const { address, setIsConnectDialogOpen } = useApp()
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
	const [coinSearchQuery, setCoinSearchQuery] = useState<string>("")
	const searchInputRef = useRef<HTMLInputElement>(null)

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
			try {
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
			} catch (error) {
				toast.dismiss(previousToastId)
				return
			}
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

			// @dev: Set the CSV input and switch to preview tab
			setCsvInput(csvRows.join("\n"))
			setViewMode("table") // Switch to preview tab to see imported data
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
			<div className="flex flex-col items-center justify-center min-h-[60vh]">
				<Logo className="w-12 h-12 mx-auto mb-4 text-foreground/20" />
				<p className="font-mono text-sm uppercase tracking-wider text-muted-foreground">
					WALLET NOT CONNECTED
				</p>
				<p className="font-mono text-xs uppercase text-muted-foreground/60 mt-2">
					CONNECT YOUR WALLET TO ACCESS AIRDROP UTILITY
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
		<div className="w-full max-w-4xl px-4 space-y-2">
			<div className="border-2 shadow-lg rounded-xl">
				<div className="p-4 border-b">
					<h3 className="font-mono text-lg uppercase tracking-wider text-foreground/80">AIRDROP UTILITY</h3>
				</div>
				<div className="p-4 space-y-4">
					{/* Coin Selection */}
					<div className="space-y-2">
						<Label htmlFor="coin-select">Select Coin</Label>
						<Select
							value={selectedCoin}
							onValueChange={(value) => {
								setSelectedCoin(value)
								setCoinSearchQuery("") // Clear search when selecting
							}}
							onOpenChange={(open) => {
								if (!open) setCoinSearchQuery("") // Clear search when closing
							}}
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
											Balance: {(parseFloat(selectedCoinInfo.balance) / Math.pow(10, selectedCoinInfo.decimals)).toFixed(2)}
										</span>
									</div>
								) : (
									<SelectValue placeholder="SELECT TOKEN TO AIRDROP" />
								)}
							</SelectTrigger>
							<SelectContent onCloseAutoFocus={(e) => e.preventDefault()}>
								<div className="p-2" onPointerDown={(e) => e.preventDefault()}>
									<Input
										ref={searchInputRef}
										placeholder="SEARCH TOKEN"
										value={coinSearchQuery}
										onChange={(e) => {
											setCoinSearchQuery(e.target.value)
											// Keep focus on input after change
											setTimeout(() => searchInputRef.current?.focus(), 0)
										}}
										className="font-mono text-xs uppercase placeholder:text-muted-foreground/60"
										onClick={(e) => e.stopPropagation()}
										onPointerDown={(e) => e.stopPropagation()}
										onKeyDown={(e) => {
											e.stopPropagation()
											// Prevent select from closing on Enter
											if (e.key === "Enter") {
												e.preventDefault()
											}
											// Prevent default arrow key behavior
											if (["ArrowUp", "ArrowDown"].includes(e.key)) {
												e.preventDefault()
											}
										}}
										autoFocus
									/>
								</div>
								{(() => {
									const filteredCoins = coins.filter((coin) => {
										const query = coinSearchQuery.toLowerCase()
										return (
											coin.symbol.toLowerCase().includes(query) ||
											coin.name.toLowerCase().includes(query)
										)
									})
									
									if (filteredCoins.length === 0) {
										return (
											<div className="py-4 text-center">
												<p className="font-mono text-xs uppercase text-muted-foreground">
													NO TOKENS FOUND
												</p>
												<p className="font-mono text-xs uppercase text-muted-foreground/60 mt-1">
													TRY A DIFFERENT SEARCH
												</p>
											</div>
										)
									}
									
									return filteredCoins.map((coin) => (
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
												Balance: {(parseFloat(coin.balance) / Math.pow(10, coin.decimals)).toFixed(2)}
											</span>
										</div>
									</SelectItem>
									))
								})()}
							</SelectContent>
						</Select>
					</div>

					{/* Recipients Input */}
					<div className="space-y-2">
						<Label className="font-mono text-xs uppercase tracking-wider text-muted-foreground">RECIPIENTS</Label>
						<Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "csv" | "import" | "table")}>
							<TabsList className="grid w-full grid-cols-3 bg-background/30 border">
								<TabsTrigger value="import" className="font-mono text-xs uppercase tracking-wider data-[state=active]:bg-background/80">IMPORT CSV</TabsTrigger>
								<TabsTrigger value="csv" className="font-mono text-xs uppercase tracking-wider data-[state=active]:bg-background/80">MANUAL INPUT</TabsTrigger>
								<TabsTrigger value="table" className="font-mono text-xs uppercase tracking-wider data-[state=active]:bg-background/80">PREVIEW [{recipients.length}]</TabsTrigger>
							</TabsList>
							
							<TabsContent value="csv" className="space-y-4 mt-4">
								<div className="border-2 border-dashed border-border/50 rounded-lg bg-background/30 p-4 space-y-4">
									<div className="space-y-2">
										<Label htmlFor="csv-input" className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
											ENTER RECIPIENTS DATA
										</Label>
										<div className="relative">
											<Textarea
												id="csv-input"
												placeholder={`0x123...abc,100\nalice.sui,200\n@bob,300`}
												className="min-h-[300px] font-mono text-sm bg-background/50 border-2 placeholder:text-muted-foreground/40 resize-none"
												value={csvInput}
												onChange={(e) => setCsvInput(e.target.value)}
											/>
											{csvInput && (
												<div className="absolute top-2 right-2">
													<span className="px-2 py-1 bg-background/80 rounded text-xs font-mono uppercase text-muted-foreground">
														{csvInput.split('\n').filter(l => l.trim()).length} LINES
													</span>
											</div>
										)}
									</div>
									</div>
									
									<div className="grid grid-cols-1 md:grid-cols-3 gap-2 pt-2">
										<div className="space-y-1">
											<p className="font-mono text-xs uppercase text-foreground/80">SUPPORTED FORMATS</p>
											<p className="font-mono text-xs text-muted-foreground/60">ADDRESS,AMOUNT</p>
											<p className="font-mono text-xs text-muted-foreground/60">SUINS.SUI,AMOUNT</p>
											<p className="font-mono text-xs text-muted-foreground/60">@USERNAME,AMOUNT</p>
										</div>
										<div className="space-y-1">
											<p className="font-mono text-xs uppercase text-foreground/80">SEPARATORS</p>
											<p className="font-mono text-xs text-muted-foreground/60">COMMA (,)</p>
											<p className="font-mono text-xs text-muted-foreground/60">TAB</p>
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
							</TabsContent>

							<TabsContent value="import" className="space-y-4 mt-4">
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

							<TabsContent value="table" className="space-y-4 mt-4">
								{isResolvingAddresses && (
									<div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
										<Loader2 className="h-4 w-4 animate-spin" />
										<span className="text-sm">Resolving SuiNS names...</span>
									</div>
								)}
								<div className="border rounded-lg overflow-hidden max-h-[33vh]">
									<div className="overflow-auto max-h-[33vh]">
										<table className="w-full">
											<thead className="bg-background/30 border-b-2 border-border sticky top-0 z-10">
												<tr>
													<th className="px-4 py-2 text-left font-mono text-xs uppercase tracking-wider text-muted-foreground">#</th>
													<th className="px-4 py-2 text-left font-mono text-xs uppercase tracking-wider text-muted-foreground">INPUT</th>
													<th className="px-4 py-2 text-left font-mono text-xs uppercase tracking-wider text-muted-foreground">ADDRESS</th>
													<th className="px-4 py-2 text-right font-mono text-xs uppercase tracking-wider text-muted-foreground">AMOUNT</th>
												</tr>
											</thead>
											<tbody>
												{recipients.length === 0 ? (
													<tr>
														<td colSpan={4} className="px-4 py-8 text-center">
															<Logo className="w-8 h-8 mx-auto mb-2 text-foreground/20" />
															<p className="font-mono text-xs uppercase text-muted-foreground">NO RECIPIENTS ADDED</p>
															<p className="font-mono text-xs uppercase text-muted-foreground/60 mt-1">USE CSV INPUT OR IMPORT</p>
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
												<tfoot className="bg-background/30 border-t-2 border-border sticky bottom-0">
													<tr>
														<td colSpan={3} className="px-4 py-2 font-mono text-xs uppercase tracking-wider text-muted-foreground">
															TOTAL
														</td>
														<td className="px-4 py-2 font-mono text-xs uppercase text-right font-bold text-foreground/80">
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
					{recipients.length > 0 && selectedCoinInfo && (
						<div className="border-2 border-border rounded-lg bg-background/30 backdrop-blur-sm p-6">
							<div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
								{/* Recipients Count */}
								<div className="space-y-1">
									<p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">RECIPIENTS</p>
									<p className="font-mono text-xl font-bold text-foreground/80">{recipients.length}</p>
								</div>
								
								{/* Total Amount */}
								<div className="space-y-1">
									<p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">TOTAL AMOUNT</p>
									<p className="font-mono text-xl font-bold text-foreground/80">
										{totalAmount.toFixed(2)}
									</p>
									<p className="font-mono text-xs uppercase text-muted-foreground/60">
										{selectedCoinInfo.symbol}
									</p>
								</div>
								
								{/* Service Fee */}
								<div className="space-y-1">
									<p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">SERVICE FEE</p>
									<p className="font-mono text-xl font-bold text-foreground/80">
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
											<p className="font-mono text-xl font-bold text-destructive">
												{recipients.filter(r => r.resolutionError).length} ERRORS
											</p>
											<p className="font-mono text-xs uppercase text-destructive/60">
												CHECK ADDRESSES
											</p>
										</>
									) : (
										<>
											<p className="font-mono text-xl font-bold text-green-500">
												READY
											</p>
											<p className="font-mono text-xs uppercase text-green-500/60">
												ALL VALID
											</p>
										</>
									)}
								</div>
							</div>
							
							{/* Action Button */}
							<Button 
								onClick={handleAirdrop}
								disabled={!selectedCoin || recipients.length === 0 || recipients.some(r => r.resolutionError)}
								className="w-full font-mono uppercase tracking-wider py-6 text-sm"
								size="lg"
							>
								<Send className="h-4 w-4 mr-2" />
								{isRecoveringGas ? "RESUME GAS RECOVERY" : "EXECUTE AIRDROP"}
							</Button>
							
							{recipients.some(r => r.resolutionError) && (
								<p className="font-mono text-xs uppercase text-destructive text-center mt-3">
									FIX ADDRESS ERRORS BEFORE PROCEEDING
								</p>
							)}
						</div>
					)}
				</div>
			</div>
		</div>
	)
}