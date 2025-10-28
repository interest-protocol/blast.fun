"use client"

import { useEffect, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Loader2 } from "lucide-react"
import toast from "react-hot-toast"
import { formatNumberWithSuffix } from "@/utils/format"
import { useApp } from "@/context/app.context"
import { SuiClient } from "@mysten/sui/client"
import { Transaction } from "@mysten/sui/transactions"
import { useCurrentAccount, useSignAndExecuteTransaction } from "@mysten/dapp-kit"
import type { CoinStruct } from "@mysten/sui/client"
import type { WalletCoin } from "@/types/blockvision"
import { useTransaction } from "@/hooks/sui/use-transaction"
import { walletSdk } from "@/lib/memez/sdk"
import { suiClient } from "@/lib/sui-client"

interface RewardsDialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
}

export function RewardsDialog({ open, onOpenChange }: RewardsDialogProps) {
	const { address, isConnected } = useApp()
	const currentAccount = useCurrentAccount()
	const { mutateAsync: signAndExecuteTransaction } = useSignAndExecuteTransaction()
	const [walletCoins, setWalletCoins] = useState<WalletCoin[]>([])
	const [isLoading, setIsLoading] = useState(false)
	const [claimingCoinType, setClaimingCoinType] = useState<string | null>(null)
	const [memezWalletAddress, setMemezWalletAddress] = useState<string | null>(null)
	const { executeTransaction } = useTransaction()

	// Shared function to merge coins and prepare receive operation
	const mergeAndPrepareReceive = async (
		coin: WalletCoin,
		tx: Transaction,
		suiClient: SuiClient
	): Promise<{ success: boolean; error?: string }> => {
		try {
			
			// Get all coins of this type with retry logic for rate limiting
			const allCoins: CoinStruct[] = []
			let cursor: string | null | undefined = undefined
			let hasNextPage = true
			
			while (hasNextPage) {
				let retries = 0
				const maxRetries = 3
				let response = null
				
				while (retries < maxRetries) {
					try {
						response = await suiClient.getCoins({
							owner: memezWalletAddress!,
							coinType: coin.coinType,
							cursor,
						})
						break // Success, exit retry loop
					} catch (error: any) {
						if (error?.status === 429 || error?.message?.includes('429')) {
							retries++
							if (retries >= maxRetries) {
								throw new Error(`Rate limited after ${maxRetries} retries`)
							}
							// Exponential backoff: 1s, 2s, 4s
							const waitTime = Math.pow(2, retries - 1) * 1000
							await new Promise(resolve => setTimeout(resolve, waitTime))
						} else {
							throw error // Re-throw non-rate-limit errors
						}
					}
				}
				
				if (!response) {
					throw new Error("Failed to fetch coins after retries")
				}
				
				allCoins.push(...response.data)
				hasNextPage = response.hasNextPage
				cursor = response.nextCursor
			}
			
			if (allCoins.length === 0) {
				return { success: false, error: "No coins found" }
			}
			
			let finalCoinId = ""
			
			// Merge if needed
			if (allCoins.length > 1) {
				const BATCH_SIZE = 500
				let remainingCoins = [...allCoins]
				
				// Keep merging until we have 1 coin
				while (remainingCoins.length > 1) {
					// Split into batches of 500
					const batches: typeof allCoins[] = []
					for (let i = 0; i < remainingCoins.length; i += BATCH_SIZE) {
						batches.push(remainingCoins.slice(i, Math.min(i + BATCH_SIZE, remainingCoins.length)))
					}
					
					// Merge all batches in parallel
					const mergePromises = batches.map(async (batch, index) => {
				
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
							throw new Error(errorData.error || `Failed to merge batch ${index + 1}`)
						}
						
						const mergeData = await mergeResponse.json()
						
						if (!mergeData.success) {
							throw new Error(mergeData.error || `Merge failed for batch ${index + 1}`)
						}
						
						return mergeData
					})
					
					// Wait for all parallel merges to complete
					await Promise.all(mergePromises)
					
					// Wait for chain to update
					await new Promise(resolve => setTimeout(resolve, 3000))
					
					// Fetch all updated coins (with pagination to get all)
					const updatedCoins: CoinStruct[] = []
					let cursor: string | null | undefined = undefined
					let hasNextPage = true
					
					while (hasNextPage) {
						let retries = 0
						const maxRetries = 3
						let response = null
						
						while (retries < maxRetries) {
							try {
								response = await suiClient.getCoins({
									owner: memezWalletAddress!,
									coinType: coin.coinType,
									cursor,
								})
								break
							} catch (error: any) {
								if (error?.status === 429 || error?.message?.includes('429')) {
									retries++
									if (retries >= maxRetries) {
										throw new Error(`Rate limited after ${maxRetries} retries while fetching updated coins`)
									}
									const waitTime = Math.pow(2, retries - 1) * 1000
									await new Promise(resolve => setTimeout(resolve, waitTime))
								} else {
									throw error
								}
							}
						}
						
						if (!response) {
							throw new Error("Failed to fetch updated coins after retries")
						}
						
						updatedCoins.push(...response.data)
						hasNextPage = response.hasNextPage
						cursor = response.nextCursor
					}
					
					remainingCoins = updatedCoins
					
					if (remainingCoins.length === 1) {
						finalCoinId = remainingCoins[0].coinObjectId
						break
					}
				}
			} else {
				finalCoinId = allCoins[0].coinObjectId
			}
			
			if (!finalCoinId) {
				throw new Error("No final coin ID after merge")
			}
			
			
			// Add receive operation to the transaction
			const { object } = walletSdk.receive({
				tx,
				type: `0x2::coin::Coin<${coin.coinType}>`,
				objectId: finalCoinId,
				wallet: memezWalletAddress!,
			})
			
			// Transfer to user's wallet
			tx.transferObjects([object], address!)
			
			
			return { success: true }
			
		} catch (error) {
			console.error(`  ❌ Failed to process ${coin.symbol}:`, error)
			return { 
				success: false, 
				error: error instanceof Error ? error.message : "Unknown error" 
			}
		}
	}

	// Fetch wallet coins from BlockVision via proxy
	const fetchWalletCoins = useCallback(async () => {
		if (!memezWalletAddress) return

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
			
			setWalletCoins(coins)
		} catch (error) {
			console.error("Error fetching wallet coins:", error)
			toast.error("Failed to load wallet funds")
			setWalletCoins([])
		} finally {
			setIsLoading(false)
		}
	}, [memezWalletAddress])

	// Handle claim button click - simplified using shared function
	const handleClaim = useCallback(async (coin: WalletCoin) => {		
		setClaimingCoinType(coin.coinType)
		const loadingToastId = toast.loading("Preparing your reward...")
		
		try {
			const tx = new Transaction()
			
			// Merge and prepare receive for this coin
			const result = await mergeAndPrepareReceive(coin, tx, suiClient)
			
			if (!result.success) {
				throw new Error(result.error || "Failed to prepare coin")
			}
			
			// Dismiss loading toast
			toast.dismiss(loadingToastId)
			
			// Set gas budget
			tx.setGasBudget(10000000)
			
			await executeTransaction(tx)
			
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
		}
	}, [address, mergeAndPrepareReceive, signAndExecuteTransaction, fetchWalletCoins])

	// Handle claim all button - sequential processing with progress updates
	const handleClaimAll = useCallback(async () => {
		if (walletCoins.length === 0) return

		// Limit to 200 coins maximum
		const MAX_COINS = 10
		const coinsToProcess = walletCoins.slice(0, MAX_COINS)
		
		setClaimingCoinType("all")
		let progressToastId: string | undefined
		
		try {
			const tx = new Transaction()
			
			// Process each coin sequentially with progress updates
			let successCount = 0
			const failedCoins: string[] = []
			
			for (let i = 0; i < coinsToProcess.length; i++) {
				const coin = coinsToProcess[i]
				
				// Update progress toast
				if (progressToastId) {
					toast.dismiss(progressToastId)
				}
				progressToastId = toast.loading(`Preparing ${coin.symbol} (${i + 1}/${coinsToProcess.length})...`)
				
				const result = await mergeAndPrepareReceive(coin, tx, suiClient)
				
				if (result.success) {
					successCount++
				} else {
					failedCoins.push(coin.symbol)
				}
			}
			
			// Dismiss progress toast
			if (progressToastId) {
				toast.dismiss(progressToastId)
			}
			
			if (successCount === 0) {
				throw new Error("No coins could be prepared for claiming")
			}
			
			// Show warning if some coins failed
			if (failedCoins.length > 0) {
				toast.error(`Could not claim: ${failedCoins.join(", ")}`)
			}
			
			// Show warning if we hit the limit
			if (walletCoins.length > MAX_COINS) {
				toast(`Processing first ${MAX_COINS} coins. Run claim all again for remaining coins.`)
			}
			
			// Set gas budget
			tx.setGasBudget(10000000)
			
			await executeTransaction(tx)
			
			toast.success(`Successfully claimed ${successCount} reward(s)!`)
			
			// Refresh wallet coins after claim
			setTimeout(() => {
				fetchWalletCoins()
			}, 2000)
			
		} catch (error) {
			console.error("\n❌ CLAIM ALL FAILED:", error)
			if (progressToastId) {
				toast.dismiss(progressToastId)
			}
			toast.error(`Failed to claim rewards: ${error instanceof Error ? error.message : "Unknown error"}`)
		} finally {
			setClaimingCoinType(null)
		}
	}, [address, walletCoins, mergeAndPrepareReceive, signAndExecuteTransaction, fetchWalletCoins])

	// Get Memez wallet address when user connects
	useEffect(() => {
		if (isConnected && address && open) {
			// Get the Memez wallet address using the SDK
			const getMemezWallet = async () => {
				try {
					const memezAddr = await walletSdk.getWalletAddress(address)
					console.log("Rewards wallet address:", memezAddr)
					setMemezWalletAddress(memezAddr)
				} catch (error) {
					console.error("Failed to get reward wallet address:", error)
					toast.error("Failed to get reward wallet address")
				}
			}
			getMemezWallet()
		}
	}, [isConnected, address, walletSdk, open])

	// Fetch coins when memez wallet address is available
	useEffect(() => {
		if (memezWalletAddress && open) {
			fetchWalletCoins()
		}
	}, [memezWalletAddress, fetchWalletCoins, open])

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
				<DialogHeader>
					<DialogTitle className="font-mono text-xl font-bold uppercase tracking-wider">
						Referral Rewards
					</DialogTitle>
				</DialogHeader>

				<div className="mt-4">
					{walletCoins.length > 0 && (
						<div className="flex justify-end mb-4">
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
									"Claim Many (max 10 at a time)"
								)}
							</Button>
						</div>
					)}

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
			</DialogContent>
		</Dialog>
	)
}