"use client"

import { useEffect, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Loader2, Wallet } from "lucide-react"
import toast from "react-hot-toast"
import { formatNumberWithSuffix } from "@/utils/format"
import { useApp } from "@/context/app.context"
import { MemezWalletSDK } from "@interest-protocol/memez-fun-sdk"
import { getFullnodeUrl, SuiClient } from "@mysten/sui/client"
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519"
import type { CoinStruct } from "@mysten/sui/client"
import type { WalletCoin } from "@/types/blockvision"

export function RewardsContent() {
	const { address, isConnected, setIsConnectDialogOpen } = useApp()
	const [walletCoins, setWalletCoins] = useState<WalletCoin[]>([])
	const [isLoading, setIsLoading] = useState(false)
	const [claimingCoinType, setClaimingCoinType] = useState<string | null>(null)
	const [memezWalletAddress, setMemezWalletAddress] = useState<string | null>(null)
	
	// Initialize MemezWalletSDK
	const walletSdk = new MemezWalletSDK()

	// Fetch wallet coins from BlockVision via proxy
	const fetchWalletCoins = useCallback(async () => {
		if (!memezWalletAddress) return

		console.log("Fetching wallet coins for Memez wallet address:", memezWalletAddress)
		setIsLoading(true)
		try {
			const response = await fetch("/api/wallet/coins", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ address: memezWalletAddress }),
			})

			if (!response.ok) {
				throw new Error("Failed to fetch wallet coins")
			}

			const data = await response.json()
			const coins = data.coins || []
			
			// Show all coins with balance (already filtered by BlockVision service)
			console.log(`Found ${coins.length} tokens in memez wallet:`, coins)
			setWalletCoins(coins)
		} catch (error) {
			console.error("Error fetching wallet coins:", error)
			toast.error("Failed to load wallet funds")
			setWalletCoins([])
		} finally {
			setIsLoading(false)
		}
	}, [memezWalletAddress])

	// Handle claim button click - merge specific coin
	const handleClaim = useCallback(async (coin: WalletCoin) => {
		console.log("=====================================")
		console.log("Claiming coin:", coin.symbol)
		console.log("Coin Type:", coin.coinType)
		console.log("Balance:", coin.balance)
		console.log("Value:", coin.value)
		console.log("Memez Wallet Address:", memezWalletAddress)
		console.log("=====================================")
		
		setClaimingCoinType(coin.coinType)
		
		try {
			// Create a temporary keypair for this transaction
			const tempKeypair = new Ed25519Keypair()
			const tempAddress = tempKeypair.toSuiAddress()
			
			console.log("Created temporary address for merge:", tempAddress)
			
			// Initialize SUI client
			const suiClient = new SuiClient({ url: getFullnodeUrl("mainnet") })
			
			// Get all coins of this type with pagination
			const allCoins: CoinStruct[] = []
			let cursor: string | null | undefined = undefined
			let hasNextPage = true
			
			while (hasNextPage) {
				const response = await suiClient.getCoins({
					owner: memezWalletAddress!,
					coinType: coin.coinType,
					cursor,
				})
				
				allCoins.push(...response.data)
				hasNextPage = response.hasNextPage
				cursor = response.nextCursor
				
				console.log(`Fetched ${response.data.length} coins, total: ${allCoins.length}, hasNext: ${hasNextPage}`)
			}
			
			// Skip if only one coin or no coins
			if (allCoins.length <= 1) {
				console.log(`Skipping ${coin.coinType}: only ${allCoins.length} coin(s)`)
				toast(`${coin.symbol} already consolidated`)
				setClaimingCoinType(null)
				return
			}
			
			console.log(`Merging ${allCoins.length} coins of type ${coin.coinType}`)
			
			// Create merge transaction using SDK
			const mergeResult = await walletSdk.mergeCoins({
				coinType: coin.coinType,
				coins: allCoins.map((coin) => ({
					objectId: coin.coinObjectId,
					version: coin.version,
					digest: coin.digest,
				})),
				wallet: memezWalletAddress!,
			})
			
			// Set the sender to our temporary address
			mergeResult.tx.setSender(tempAddress)
			
			// Build the transaction
			const txBytes = await mergeResult.tx.build({ client: suiClient })
			const txBytesHex = Buffer.from(txBytes).toString('hex')
			
			console.log("Requesting gas station sponsorship...")
			
			// Get sponsorship from backend
			const sponsorResponse = await fetch("/api/wallet/sponsor-tx", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					txBytesHex,
					sender: tempAddress,
				}),
			})
			
			if (!sponsorResponse.ok) {
				const errorData = await sponsorResponse.json()
				throw new Error(errorData.error || "Failed to get sponsorship")
			}
			
			const sponsorData = await sponsorResponse.json()
			
			if (!sponsorData.success || !sponsorData.txBytesHex || !sponsorData.sponsorSignature) {
				throw new Error("Invalid sponsorship response")
			}
			
			console.log("Gas station sponsorship received, executing transaction...")
			console.log("Gas rebate amount:", sponsorData.gasInfo?.rebateAmount)
			
			// Sign the sponsored transaction with the temporary keypair
			const sponsoredTxBytes = Uint8Array.from(Buffer.from(sponsorData.txBytesHex, 'hex'))
			const signature = await tempKeypair.signTransaction(sponsoredTxBytes)
			
			// Execute the sponsored transaction
			const result = await suiClient.executeTransactionBlock({
				transactionBlock: sponsoredTxBytes,
				signature: [signature.signature, sponsorData.sponsorSignature],
				options: {
					showEffects: true,
					showObjectChanges: true,
				},
			})
			
			console.log(`Transaction executed: ${result.digest}`)
			
			if (result.effects?.status?.status === "success") {
				toast.success(`${coin.symbol} claimed successfully!`)
				
				// Store temp keypair in localStorage for debugging
				localStorage.setItem('lastMergeTempKeypair', JSON.stringify({
					address: tempAddress,
					privateKey: tempKeypair.getSecretKey(),
				}))
				
				// Refresh wallet coins after claim
				setTimeout(() => {
					fetchWalletCoins()
				}, 2000)
			} else {
				throw new Error(`Transaction failed: ${result.effects?.status?.error}`)
			}
		} catch (error) {
			console.error("Error claiming coin:", error)
			toast.error(`Failed to claim ${coin.symbol}: ${error instanceof Error ? error.message : "Unknown error"}`)
		} finally {
			setClaimingCoinType(null)
		}
	}, [memezWalletAddress, walletSdk, fetchWalletCoins])

	// Handle claim all button - merge all coins at once
	const handleClaimAll = useCallback(async () => {
		if (walletCoins.length === 0) return

		console.log("=====================================")
		console.log("Claiming all coins:", walletCoins.length)
		console.log("Memez Wallet Address:", memezWalletAddress)
		console.log("=====================================")
		
		setClaimingCoinType("all")
		
		try {
			// Initialize SUI client
			const suiClient = new SuiClient({ url: getFullnodeUrl("mainnet") })
			
			// Process each coin type
			const mergeResults = []
			let successCount = 0
			
			for (const coin of walletCoins) {
				try {
					console.log(`Processing merge for coin type: ${coin.coinType}`)
					
					// Create a temporary keypair for this transaction
					const tempKeypair = new Ed25519Keypair()
					const tempAddress = tempKeypair.toSuiAddress()
					
					// Get all coins of this type with pagination
					const allCoins: CoinStruct[] = []
					let cursor: string | null | undefined = undefined
					let hasNextPage = true
					
					while (hasNextPage) {
						const response = await suiClient.getCoins({
							owner: memezWalletAddress!,
							coinType: coin.coinType,
							cursor,
						})
						
						allCoins.push(...response.data)
						hasNextPage = response.hasNextPage
						cursor = response.nextCursor
					}
					
					// Skip if only one coin or no coins
					if (allCoins.length <= 1) {
						console.log(`Skipping ${coin.coinType}: only ${allCoins.length} coin(s)`)
						continue
					}
					
					console.log(`Merging ${allCoins.length} coins of type ${coin.coinType}`)
					
					// Create merge transaction using SDK
					const mergeResult = await walletSdk.mergeCoins({
						coinType: coin.coinType,
						coins: allCoins.map((c) => ({
							objectId: c.coinObjectId,
							version: c.version,
							digest: c.digest,
						})),
						wallet: memezWalletAddress!,
					})
					
					// Set the sender to our temporary address
					mergeResult.tx.setSender(tempAddress)
					
					// Build the transaction
					const txBytes = await mergeResult.tx.build({ client: suiClient })
					const txBytesHex = Buffer.from(txBytes).toString('hex')
					
					// Get sponsorship from backend
					const sponsorResponse = await fetch("/api/wallet/sponsor-tx", {
						method: "POST",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify({
							txBytesHex,
							sender: tempAddress,
						}),
					})
					
					if (!sponsorResponse.ok) {
						const errorData = await sponsorResponse.json()
						throw new Error(errorData.error || "Failed to get sponsorship")
					}
					
					const sponsorData = await sponsorResponse.json()
					
					if (!sponsorData.success || !sponsorData.txBytesHex || !sponsorData.sponsorSignature) {
						throw new Error("Invalid sponsorship response")
					}
					
					// Sign the sponsored transaction with the temporary keypair
					const sponsoredTxBytes = Uint8Array.from(Buffer.from(sponsorData.txBytesHex, 'hex'))
					const signature = await tempKeypair.signTransaction(sponsoredTxBytes)
					
					// Execute the sponsored transaction
					const result = await suiClient.executeTransactionBlock({
						transactionBlock: sponsoredTxBytes,
						signature: [signature.signature, sponsorData.sponsorSignature],
						options: {
							showEffects: true,
							showObjectChanges: true,
						},
					})
					
					console.log(`Transaction executed for ${coin.symbol}: ${result.digest}`)
					
					if (result.effects?.status?.status === "success") {
						successCount++
						mergeResults.push({
							coinType: coin.coinType,
							symbol: coin.symbol,
							success: true,
							transactionDigest: result.digest,
						})
					} else {
						throw new Error(`Transaction failed: ${result.effects?.status?.error}`)
					}
					
				} catch (error) {
					console.error(`Failed to merge ${coin.symbol}:`, error)
					mergeResults.push({
						coinType: coin.coinType,
						symbol: coin.symbol,
						success: false,
						error: error instanceof Error ? error.message : "Unknown error",
					})
				}
			}
			
			if (successCount > 0) {
				toast.success(`Successfully claimed ${successCount} reward(s)!`)
				
				// Refresh wallet coins after claim
				setTimeout(() => {
					fetchWalletCoins()
				}, 2000)
			} else {
				toast.error("No rewards were claimed")
			}
			
		} catch (error) {
			console.error("Error claiming all coins:", error)
			toast.error("Failed to claim all rewards")
		} finally {
			setClaimingCoinType(null)
		}
	}, [memezWalletAddress, walletCoins, walletSdk, fetchWalletCoins])

	// Get Memez wallet address when user connects
	useEffect(() => {
		if (isConnected && address) {
			// Get the Memez wallet address using the SDK
			const getMemezWallet = async () => {
				try {
					const memezAddr = await walletSdk.getWalletAddress(address)
					console.log("=====================================")
					console.log("Connected Wallet Address:", address)
					console.log("Memez Wallet Address:", memezAddr)
					console.log("=====================================")
					setMemezWalletAddress(memezAddr)
				} catch (error) {
					console.error("Failed to get Memez wallet address:", error)
					toast.error("Failed to get Memez wallet address")
				}
			}
			getMemezWallet()
		}
	}, [isConnected, address, walletSdk])

	// Fetch coins when memez wallet address is available
	useEffect(() => {
		if (memezWalletAddress) {
			fetchWalletCoins()
		}
	}, [memezWalletAddress, fetchWalletCoins])

	if (!isConnected) {
		return (
			<div className="container max-w-6xl mx-auto px-4 py-8">
				<div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
					<Wallet className="h-16 w-16 text-muted-foreground/50" />
					<h1 className="font-mono text-2xl font-bold uppercase tracking-wider text-foreground/80">
						Connect Wallet to View Rewards
					</h1>
					<Button
						onClick={() => setIsConnectDialogOpen(true)}
						className="font-mono uppercase"
					>
						Connect Wallet
					</Button>
				</div>
			</div>
		)
	}

	return (
		<div className="container max-w-6xl mx-auto px-4 py-8">
			<div className="space-y-6">
				{/* Header */}
				<div className="flex items-center justify-between">
					<div>
						<h1 className="font-mono text-2xl font-bold uppercase tracking-wider text-foreground">
							Rewards
						</h1>
						<p className="font-mono text-sm text-muted-foreground mt-1">
							Claim your rewards
						</p>
					</div>
					{walletCoins.length > 0 && (
						<Button
							onClick={handleClaimAll}
							disabled={claimingCoinType === "all"}
							className="font-mono uppercase"
						>
							{claimingCoinType === "all" ? (
								<>
									<Loader2 className="h-4 w-4 animate-spin mr-2" />
									Claiming...
								</>
							) : (
								"Claim All"
							)}
						</Button>
					)}
				</div>

				{/* Coins Table */}
				<div className="rounded-lg border border-border bg-card overflow-hidden">
					{isLoading ? (
						<div className="flex flex-col items-center justify-center py-16">
							<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
							<p className="mt-3 text-sm font-mono text-muted-foreground">
								Loading wallet rewards...
							</p>
						</div>
					) : walletCoins.length > 0 ? (
						<div className="overflow-x-auto">
							<table className="w-full">
								<thead>
									<tr className="border-b border-border bg-muted/50">
										<th className="text-left p-4 font-mono text-sm font-medium uppercase text-muted-foreground">
											Token
										</th>
										<th className="text-right p-4 font-mono text-sm font-medium uppercase text-muted-foreground">
											Balance
										</th>
										<th className="text-right p-4 font-mono text-sm font-medium uppercase text-muted-foreground">
											Value
										</th>
										<th className="text-center p-4 font-mono text-sm font-medium uppercase text-muted-foreground">
											Action
										</th>
									</tr>
								</thead>
								<tbody>
									{walletCoins.map((coin) => (
										<tr
											key={coin.coinType}
											className="border-b border-border hover:bg-muted/30 transition-colors"
										>
											<td className="p-4">
												<div className="flex items-center gap-3">
													{coin.iconUrl ? (
														<img
															src={coin.iconUrl}
															alt={coin.symbol}
															className="h-8 w-8 rounded-full"
															onError={(e) => {
																const target = e.target as HTMLImageElement
																target.style.display = "none"
															}}
														/>
													) : (
														<div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
															<span className="text-xs font-mono uppercase">
																{coin.symbol?.slice(0, 2)}
															</span>
														</div>
													)}
													<div>
														<div className="font-mono text-sm font-medium">
															{coin.symbol}
														</div>
														<div className="text-xs text-muted-foreground">
															{coin.name}
														</div>
													</div>
												</div>
											</td>
											<td className="p-4 text-right">
												<span className="font-mono text-sm">
													{formatNumberWithSuffix(
														parseFloat(coin.balance) / Math.pow(10, coin.decimals)
													)}
												</span>
											</td>
											<td className="p-4 text-right">
												<span className="font-mono text-sm">
													{coin.value && coin.value > 0 ? `$${formatNumberWithSuffix(coin.value)}` : '-'}
												</span>
											</td>
											<td className="p-4 text-center">
												<Button
													size="sm"
													onClick={() => handleClaim(coin)}
													disabled={claimingCoinType === coin.coinType}
													className="font-mono uppercase"
												>
													{claimingCoinType === coin.coinType ? (
														<Loader2 className="h-4 w-4 animate-spin" />
													) : (
														"Claim"
													)}
												</Button>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					) : (
						<div className="flex flex-col items-center justify-center py-16">
							<p className="text-sm font-mono text-muted-foreground uppercase">
								No rewards available
							</p>
						</div>
					)}
				</div>
			</div>
		</div>
	)
}