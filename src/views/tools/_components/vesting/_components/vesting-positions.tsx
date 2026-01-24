"use client"

import { useState, useEffect } from "react"
import { useApp } from "@/context/app.context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Loader2, AlertCircle, Clock, TrendingUp, Unlock } from "lucide-react"
import TokenAvatar from "@/components/tokens/token-avatar"
import { useVestingApi } from "../_hooks/use-vesting-api"
import { formatDuration, VestingPosition } from "../vesting.utils"
import { formatAmount } from "@/utils/format"
import { useTransaction } from "@/hooks/sui/use-transaction"
import toast from "react-hot-toast"
import { suiClient } from "@/lib/sui-client"
import { CoinMetadata } from "@mysten/sui/client"
import { vestingSdk } from "@/lib/memez/sdk"

interface VestingPositionsProps {
	shouldRefresh?: boolean
	onRefreshed?: () => void
}

export function VestingPositions({ shouldRefresh, onRefreshed }: VestingPositionsProps) {
	const { address, setIsConnectDialogOpen } = useApp()
	const { positions, isLoading, refetch, loadMore, hasMore, isLoadingMore } = useVestingApi()
	const [claimingId, setClaimingId] = useState<string | null>(null)
	const { executeTransaction } = useTransaction()
	const [tokenMetadata, setTokenMetadata] = useState<Record<string, CoinMetadata>>({})

	// @dev: Refetch data when shouldRefresh is true
	useEffect(() => {
		if (shouldRefresh) {
			refetch()
			onRefreshed?.()
		}
	}, [shouldRefresh, refetch, onRefreshed])


	// @dev: Fetch metadata for all unique coin types
	useEffect(() => {
		const fetchMetadata = async () => {
			const uniqueCoinTypes = [...new Set(positions.map(p => p.coinType))]
			const metadataPromises = uniqueCoinTypes.map(async (coinType) => {
				try {
					const metadata = await suiClient.getCoinMetadata({ coinType })
					return { coinType, metadata }
				} catch (error) {
					console.error(`Failed to fetch metadata for ${coinType}:`, error)
					return { coinType, metadata: null }
				}
			})

			const results = await Promise.all(metadataPromises)
			const metadataMap: Record<string, CoinMetadata> = {}
			results.forEach(({ coinType, metadata }) => {
				if (metadata) {
					metadataMap[coinType] = metadata
				}
			})
			setTokenMetadata(metadataMap)
		}

		if (positions.length > 0) {
			fetchMetadata()
		}
	}, [positions])

	const handleClaimOrDestroy = async (position: VestingPosition) => {
		if (!address) {
			setIsConnectDialogOpen(true)
			return
		}

		const currentTime = Date.now()
		const isFullyVested = currentTime >= position.endTime

		setClaimingId(position.id)
		try {
			if (isFullyVested) {
				// @dev: Vesting is complete - claim and destroy in one transaction
				const { tx, coin } = await vestingSdk.claim({
					vesting: position.id,
				})
				tx.transferObjects([coin], address)
				
				// @dev: Destroy vesting position after claiming
				await vestingSdk.uncheckedDestroyZeroBalance({
					tx,
					vestingObjectId: position.id,
					coinType: position.coinType,
				})
				
				await executeTransaction(tx)
				toast.success("All tokens claimed and vesting completed!")
				refetch()
			} else {
				// @dev: Normal claim for active vesting
				const { tx, coin } = await vestingSdk.claim({
					vesting: position.id,
				})
				tx.transferObjects([coin], address)
				
				await executeTransaction(tx)
				toast.success("Successfully claimed vested tokens!")
				refetch()
			}
		} catch (error) {
			console.error("Error processing vesting action:", error)
			const errorMessage = isFullyVested ? "Failed to complete vesting" : "Failed to claim vested tokens"
			toast.error(errorMessage)
		} finally {
			setClaimingId(null)
		}
	}

	if (!address) {
		return (
			<Card>
				<CardContent className="pt-6">
					<Alert>
						<AlertCircle className="h-4 w-4" />
						<AlertDescription>
							Please connect your wallet to view your vesting positions
						</AlertDescription>
					</Alert>
				</CardContent>
			</Card>
		)
	}

	if (isLoading) {
		return (
			<Card>
				<CardContent className="pt-6">
					<div className="flex items-center justify-center py-8">
						<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
					</div>
				</CardContent>
			</Card>
		)
	}

	if (positions.length === 0) {
		return (
			<Card>
				<CardContent className="pt-6">
					<div className="text-center py-8">
						<Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
						<h3 className="text-lg font-semibold mb-2">No Vesting Positions</h3>
						<p className="text-muted-foreground">
							You don&apos;t have any active vesting positions yet.
						</p>
					</div>
				</CardContent>
			</Card>
		)
	}

	const currentTime = Date.now()
	console.log({positions});

	return (
		<div className="space-y-4">
			{positions.map((position) => {
				const progress = position.isDestroyed 
					? 100 
					: Math.max(0, Math.min(100, ((currentTime - position.startTime) / position.duration) * 100))
				const claimableAmount = position.claimableAmount
				
				const isFullyUnlocked = currentTime >= position.endTime
				const hasStarted = currentTime >= position.startTime
				const isDestroyed = position.isDestroyed
				const metadata = tokenMetadata[position.coinType]

				return (
					<Card key={position.id}>
						<CardHeader>
							<div className="flex items-start justify-between">
								<div className="flex items-center gap-3">
									<TokenAvatar
										iconUrl={metadata?.iconUrl || undefined}
										symbol={metadata?.symbol || "TOKEN"}
										className="w-10 h-10"
									/>
									<div>
										<CardTitle className="text-lg">
											{metadata?.name || "Vesting Position"}
										</CardTitle>
										<CardDescription className="text-sm">
											{metadata?.symbol || position.coinType.split("::").pop()}
										</CardDescription>
									</div>
								</div>
								<Badge variant={isDestroyed ? "default" : isFullyUnlocked ? "default" : hasStarted ? "secondary" : "outline"}>
									{isDestroyed ? "Finished" : isFullyUnlocked ? "Fully Unlocked" : hasStarted ? "Active" : "Pending"}
								</Badge>
							</div>
						</CardHeader>
						<CardContent className="space-y-4">
							{/* Progress Bar */}
							<div className="space-y-2">
								<div className="flex justify-between text-sm">
									<span className="text-muted-foreground">Unlock Progress</span>
									<span className="font-medium">{progress.toFixed(1)}%</span>
								</div>
								<Progress value={progress} className="h-2" />
							</div>

							{/* Details */}
							<div className="grid grid-cols-2 gap-4 text-sm">
								<div>
									<p className="text-muted-foreground mb-1">Total Locked</p>
									<p className="font-medium">
										{formatAmount(position.lockedAmount, 0)}
										{metadata?.symbol && ` ${metadata.symbol}`}
									</p>
								</div>
								<div>
									<p className="text-muted-foreground mb-1">Already Claimed</p>
									<p className="font-medium">
										{formatAmount(isDestroyed ? position.lockedAmount : position.claimedAmount, 0)}
										{metadata?.symbol && ` ${metadata.symbol}`}
									</p>
								</div>
								{!isDestroyed && (
									<>
										<div>
											<p className="text-muted-foreground mb-1">Claimable Now</p>
											<p className="font-medium text-green-600">
												{formatAmount(parseFloat(claimableAmount) - parseFloat(position.claimedAmount), 0)}
												{metadata?.symbol && ` ${metadata.symbol}`}
											</p>
										</div>
										<div>
											<p className="text-muted-foreground mb-1">Time Remaining</p>
											<p className="font-medium">
												{isFullyUnlocked
													? "Complete"
													: hasStarted
													? formatDuration(position.endTime - currentTime)
													: `Starts in ${formatDuration(position.startTime - currentTime)}`}
											</p>
										</div>
									</>
								)}
							</div>

							{/* Actions */}
							{!isDestroyed && (
								<div className="flex justify-center">
									<Button
										onClick={() => handleClaimOrDestroy(position)}
										disabled={
											claimingId === position.id ||
											!claimableAmount ||
											claimableAmount === "0" ||
											!hasStarted
										}
										variant={isFullyUnlocked ? "destructive" : "default"}
										className="flex-1"
									>
										{claimingId === position.id ? (
											<>
												<Loader2 className="mr-2 h-4 w-4 animate-spin" />
												{isFullyUnlocked ? "Completing..." : "Claiming..."}
											</>
										) : (
											<>
												{isFullyUnlocked ? (
													<>
														<Unlock className="mr-2 h-4 w-4" />
														Complete & Finish
													</>
												) : (
													<>
														<TrendingUp className="mr-2 h-4 w-4" />
														Claim {formatAmount(parseFloat(claimableAmount) - parseFloat(position.claimedAmount), 0)}
														{metadata?.symbol && ` ${metadata.symbol}`}
													</>
												)}
											</>
										)}
									</Button>
								</div>
							)}
						</CardContent>
					</Card>
				)
			})}
			
			{/* Load More Button */}
			{hasMore && (
				<div className="flex justify-center pt-6">
					<Button
						onClick={loadMore}
						disabled={isLoadingMore}
						variant="outline"
						size="lg"
					>
						{isLoadingMore ? (
							<>
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								Loading more...
							</>
						) : (
							"Load More"
						)}
					</Button>
				</div>
			)}
		</div>
	)
}