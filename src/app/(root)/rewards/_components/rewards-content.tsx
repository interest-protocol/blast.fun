"use client"

import { useEffect, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Loader2, Wallet } from "lucide-react"
import toast from "react-hot-toast"
import { formatNumberWithSuffix } from "@/utils/format"
import { useApp } from "@/context/app.context"
import { MemezWalletSDK } from "@interest-protocol/memez-fun-sdk"
import { getFullnodeUrl, SuiClient } from "@mysten/sui/client"
import { Transaction } from "@mysten/sui/transactions"
import { useCurrentAccount, useSignAndExecuteTransaction } from "@mysten/dapp-kit"
import type { CoinStruct } from "@mysten/sui/client"
import type { WalletCoin } from "@/types/blockvision"

export function RewardsContent() {
	const { address, isConnected, setIsConnectDialogOpen } = useApp()
	const currentAccount = useCurrentAccount()
	const { mutateAsync: signAndExecuteTransaction } = useSignAndExecuteTransaction()
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

	// Handle claim button click - merge all coins first, then create receive tx for user
	const handleClaim = useCallback(async (coin: WalletCoin) => {
		console.log("╔════════════════════════════════════════════════════════╗")
		console.log("║                   CLAIM PROCESS START                    ║")
		console.log("╠════════════════════════════════════════════════════════╣")
		console.log("║ Coin Symbol:", coin.symbol)
		console.log("║ Coin Type:", coin.coinType)
		console.log("║ Balance:", coin.balance)
		console.log("║ Value:", coin.value)
		console.log("║ Memez Wallet:", memezWalletAddress)
		console.log("║ User Wallet:", address)
		console.log("╚════════════════════════════════════════════════════════╝")
		
		setClaimingCoinType(coin.coinType)
		
		// Show loading toast
		const loadingToastId = toast.loading("Preparing your rewards...")
		
		try {
			// Initialize SUI client
			const suiClient = new SuiClient({ url: getFullnodeUrl("mainnet") })
			
			// STEP 1: Get all coins of this type
			console.log("\n📊 Step 1: Fetching all coins of type", coin.symbol)
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
				
				console.log(`  → Fetched batch: ${response.data.length} coins, Total: ${allCoins.length}`)
			}
			
			console.log(`✅ Total coins found: ${allCoins.length}`)
			
			
			// STEP 2: Merge coins if needed
			let finalCoinId: string = ""
			
			if (allCoins.length > 1) {
				console.log(`\n🔄 Step 2: Merging ${allCoins.length} coins...`)
				
				// Batch coins in groups of 500 to avoid transaction size limits
				const BATCH_SIZE = 500
				let remainingCoins = [...allCoins]
				
				while (remainingCoins.length > 1) {
					const batchSize = Math.min(BATCH_SIZE, remainingCoins.length)
					const batch = remainingCoins.slice(0, batchSize)
					
					console.log(`\n  📦 Processing batch: ${batch.length} coins (${remainingCoins.length} total remaining)`)
					
					// Call backend to merge coins
					const mergeResponse = await fetch("/api/wallet/merge-coins", {
						method: "POST",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify({
							coins: batch.map((c) => ({
								objectId: c.coinObjectId,
								version: c.version,
								digest: c.digest,
							})),
							coinType: coin.coinType,
							walletAddress: memezWalletAddress,
						}),
					})
					
					if (!mergeResponse.ok) {
						const errorData = await mergeResponse.json()
						throw new Error(errorData.error || "Failed to merge coins")
					}
					
					const mergeData = await mergeResponse.json()
					
					if (!mergeData.success) {
						throw new Error(mergeData.error || "Merge failed")
					}
					
					console.log(`  ✅ Batch merge successful! TX: ${mergeData.transactionDigest}`)
					console.log(`  → Gas rebate amount: ${mergeData.gasInfo?.rebateAmount}`)
					
					// Wait a bit for the chain to update
					await new Promise(resolve => setTimeout(resolve, 2000))
					
					// Get the updated coins after this merge
					const updatedCoins = await suiClient.getCoins({
						owner: memezWalletAddress!,
						coinType: coin.coinType,
					})
					
					remainingCoins = updatedCoins.data
					console.log(`  → Coins after merge: ${remainingCoins.length}`)
					
					// If we're down to 1 coin, we're done
					if (remainingCoins.length === 1) {
						finalCoinId = remainingCoins[0].coinObjectId
						console.log(`\n✅ All merges complete! Final coin ID: ${finalCoinId}`)
						break
					}
				}
				
				// Double-check we have the final coin
				if (!finalCoinId) {
					const finalCoins = await suiClient.getCoins({
						owner: memezWalletAddress!,
						coinType: coin.coinType,
					})
					
					if (finalCoins.data.length === 0) {
						throw new Error("No coins found after merge")
					}
					
					finalCoinId = finalCoins.data[0].coinObjectId
					console.log(`  → Final merged coin ID: ${finalCoinId}`)
				}
				
			} else if (allCoins.length === 1) {
				console.log("\n✅ Step 2: Only one coin found, no merge needed")
				finalCoinId = allCoins[0].coinObjectId
			} else {
				throw new Error("No coins found to claim")
			}
			
			// STEP 3: Create receive transaction for user to sign
			console.log("\n💰 Step 3: Creating claim transaction for user to sign...")
			console.log(`  → Coin to claim: ${finalCoinId}`)
			console.log(`  → From: ${memezWalletAddress}`)
			console.log(`  → To: ${address}`)

			
			
			// Create receive transaction
			const { tx, object } = await walletSdk.receive({
				type: `0x2::coin::Coin<${coin.coinType}>`,
				objectId: finalCoinId,
				wallet: memezWalletAddress!,
			})
			
			// Transfer to user's wallet
			tx.transferObjects([object], address!)
			
			// Set gas budget
			tx.setGasBudget(10000000)
			
			console.log("  → Transaction created, requesting user signature...")
			
			// Have the user sign and execute the transaction
			const result = await signAndExecuteTransaction({
				transaction: tx,
			})


			// Dismiss loading toast
			toast.dismiss(loadingToastId)
			
			console.log("\n✅ CLAIM SUCCESSFUL!")
			console.log(`  → Transaction: ${result.digest}`)
			console.log(`  → ${coin.symbol} transferred to your wallet`)
			
			toast.success(`${coin.symbol} claimed successfully!`)
			
			// Refresh wallet coins after claim
			setTimeout(() => {
				fetchWalletCoins()
			}, 2000)
			
		} catch (error) {
			console.error("\n❌ CLAIM FAILED:", error)
			toast.dismiss(loadingToastId)
			toast.error(`Failed to claim ${coin.symbol}: ${error instanceof Error ? error.message : "Unknown error"}`)
		} finally {
			setClaimingCoinType(null)
			console.log("\n════════════════════════════════════════════════════════")
		}
	}, [memezWalletAddress, address, walletSdk, signAndExecuteTransaction, fetchWalletCoins])

	// Handle claim all button - merge all coins at once
	const handleClaimAll = useCallback(async () => {
		if (walletCoins.length === 0) return

		console.log("╔════════════════════════════════════════════════════════╗")
		console.log("║                CLAIM ALL PROCESS START                   ║")
		console.log("╠════════════════════════════════════════════════════════╣")
		console.log("║ Total Coin Types:", walletCoins.length)
		console.log("║ Memez Wallet:", memezWalletAddress)
		console.log("║ User Wallet:", address)
		console.log("╚════════════════════════════════════════════════════════╝")
		
		setClaimingCoinType("all")
		
		// Show loading toast
		const loadingToastId = toast.loading("Preparing all rewards...")
		
		try {
			// Initialize SUI client
			const suiClient = new SuiClient({ url: getFullnodeUrl("mainnet") })
			
			// STEP 1: Fetch all coins for each type in parallel
			console.log("\n📊 Step 1: Fetching all coins for each type...")
			
			const fetchPromises = walletCoins.map(async (coin) => {
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
				
				return {
					coinType: coin.coinType,
					symbol: coin.symbol,
					coins: allCoins
				}
			})
			
			const coinsByType = await Promise.all(fetchPromises)
			console.log(`✅ Fetched coins for ${coinsByType.length} types`)
			
			// STEP 2: Merge coins for each type (in parallel where possible)
			console.log("\n🔄 Step 2: Merging coins for each type...")
			
			const mergePromises = coinsByType.map(async ({ coinType, symbol, coins }) => {
				if (coins.length <= 1) {
					console.log(`  → ${symbol}: Only ${coins.length} coin(s), no merge needed`)
					return {
						coinType,
						symbol,
						finalCoinId: coins.length === 1 ? coins[0].coinObjectId : null,
						success: true,
						needsMerge: false
					}
				}
				
				console.log(`  → ${symbol}: Merging ${coins.length} coins...`)
				
				// Batch coins in groups of 500
				const BATCH_SIZE = 500
				let remainingCoins = [...coins]
				
				try {
					while (remainingCoins.length > 1) {
						const batchSize = Math.min(BATCH_SIZE, remainingCoins.length)
						const batch = remainingCoins.slice(0, batchSize)
						
						console.log(`    Processing batch: ${batch.length} coins for ${symbol}`)
						
						// Call backend to merge coins
						const mergeResponse = await fetch("/api/wallet/merge-coins", {
							method: "POST",
							headers: {
								"Content-Type": "application/json",
							},
							body: JSON.stringify({
								coins: batch.map((c) => ({
									objectId: c.coinObjectId,
									version: c.version,
									digest: c.digest,
								})),
								coinType: coinType,
								walletAddress: memezWalletAddress,
							}),
						})
						
						if (!mergeResponse.ok) {
							const errorData = await mergeResponse.json()
							throw new Error(errorData.error || "Failed to merge coins")
						}
						
						const mergeData = await mergeResponse.json()
						
						if (!mergeData.success) {
							throw new Error(mergeData.error || "Merge failed")
						}
						
						console.log(`    ✅ Batch merged! TX: ${mergeData.transactionDigest}`)
						
						// Wait for chain update
						await new Promise(resolve => setTimeout(resolve, 2000))
						
						// Get updated coins
						const updatedCoins = await suiClient.getCoins({
							owner: memezWalletAddress!,
							coinType: coinType,
						})
						
						remainingCoins = updatedCoins.data
						
						if (remainingCoins.length === 1) {
							return {
								coinType,
								symbol,
								finalCoinId: remainingCoins[0].coinObjectId,
								success: true,
								needsMerge: true
							}
						}
					}
				} catch (error) {
					console.error(`  ❌ Failed to merge ${symbol}:`, error)
					return {
						coinType,
						symbol,
						finalCoinId: null,
						success: false,
						error: error instanceof Error ? error.message : "Unknown error"
					}
				}
			})
			
			const mergeResults = await Promise.all(mergePromises)
			
			// Filter successful merges with final coins
			const successfulMerges = mergeResults.filter(r => r && r.success && r.finalCoinId)
			
			if (successfulMerges.length === 0) {
				toast.error("No coins available to claim")
				return
			}
			
			console.log(`\n✅ Successfully prepared ${successfulMerges.length} coin(s) for claiming`)
			
			// STEP 3: Create a single transaction with all receive operations
			console.log("\n💰 Step 3: Creating claim transaction for user to sign...")
			
			const tx = new Transaction()
			const receiveObjects = []
			
			for (const merge of successfulMerges) {
				if (!merge) continue
				console.log(`  → Adding ${merge.symbol} to transaction`)
				
				// Create receive for this coin
				const { object } = await walletSdk.receive({
					tx,
					type: `0x2::coin::Coin<${merge.coinType}>`,
					objectId: merge.finalCoinId!,
					wallet: memezWalletAddress!,
				})
				
				// Merge the receive transaction into our main transaction
				// Note: We need to extract the commands from receiveTx and add them to tx
				// This is a simplified approach - you may need to adjust based on SDK capabilities
				receiveObjects.push(object)
			}
			
			// Transfer all received objects to user's wallet
			tx.transferObjects(receiveObjects, address!)
			
			// Set gas budget
			tx.setGasBudget(10000000)
			
			console.log("  → Transaction created with", successfulMerges.length, "coins")
			console.log("  → Requesting user signature...")
			
			// Have the user sign and execute the transaction
			const result = await signAndExecuteTransaction({
				transaction: tx,
			})

			// Dismiss loading toast after fetching
			toast.dismiss(loadingToastId)
			
			
			console.log("\n✅ CLAIM ALL SUCCESSFUL!")
			console.log(`  → Transaction: ${result.digest}`)
			console.log(`  → ${successfulMerges.length} coin(s) transferred to your wallet`)
			
			toast.success(`Successfully claimed ${successfulMerges.length} reward(s)!`)
			
			// Refresh wallet coins after claim
			setTimeout(() => {
				fetchWalletCoins()
			}, 2000)
			
		} catch (error) {
			console.error("\n❌ CLAIM ALL FAILED:", error)
			toast.dismiss(loadingToastId)
			toast.error(`Failed to claim rewards: ${error instanceof Error ? error.message : "Unknown error"}`)
		} finally {
			setClaimingCoinType(null)
			console.log("\n════════════════════════════════════════════════════════")
		}
	}, [memezWalletAddress, address, walletCoins, walletSdk, signAndExecuteTransaction, fetchWalletCoins])

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
							Referral Rewards
						</h1>
						<p className="font-mono text-sm text-muted-foreground mt-1">
							Claim your referral rewards
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