"use client"

import { useState, useEffect } from "react"
import { useApp } from "@/context/app.context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Loader2, AlertCircle, Clock, TrendingUp, Unlock } from "lucide-react"
import { TokenAvatar } from "@/components/tokens/token-avatar"
import { useVestingApi } from "../_hooks/use-vesting-api"
import { formatDuration, calculateClaimableAmount } from "../vesting.utils"
import { formatAmount } from "@/utils/format"
import { useTransaction } from "@/hooks/sui/use-transaction"
import { Transaction } from "@mysten/sui/transactions"
import toast from "react-hot-toast"
import { useVestingSDK } from "../_hooks/use-vesting-sdk"
import { suiClient } from "@/lib/sui-client"
import { CoinMetadata } from "@mysten/sui/client"

interface VestingPositionsProps {
	shouldRefresh?: boolean
	onRefreshed?: () => void
}

export function VestingPositions({ shouldRefresh, onRefreshed }: VestingPositionsProps) {
	const { address, setIsConnectDialogOpen } = useApp()
	const { positions, isLoading, refetch } = useVestingApi()
	const [claimingId, setClaimingId] = useState<string | null>(null)
	const { executeTransaction } = useTransaction()
	const vestingSdk = useVestingSDK()
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

	const handleClaim = async (positionId: string) => {
		if (!address) {
			setIsConnectDialogOpen(true)
			return
		}

		setClaimingId(positionId)
		try {
			// @dev: Claim vested tokens using SDK
			const { tx, coin } = await vestingSdk.claim({
				vesting: positionId,
			})
			tx.transferObjects([coin], address)
			
			await executeTransaction(tx)

			toast.success("Successfully claimed vested tokens!")
			await refetch()
		} catch (error) {
			console.error("Error claiming vested tokens:", error)
			toast.error("Failed to claim vested tokens")
		} finally {
			setClaimingId(null)
		}
	}

	const handleDestroy = async (positionId: string) => {
		if (!address) {
			setIsConnectDialogOpen(true)
			return
		}

		// @dev: Confirm action
		if (!confirm("Are you sure you want to destroy this vesting position? This will return all remaining tokens.")) {
			return
		}

		setClaimingId(positionId)
		try {
			// @dev: Destroy vesting position when balance is zero
			const { tx } = await vestingSdk.destroyZeroBalance({
				vesting: positionId,
			})
			
			await executeTransaction(tx)

			toast.success("Vesting position destroyed successfully!")
			await refetch()
		} catch (error) {
			console.error("Error destroying vesting position:", error)
			toast.error("Failed to destroy vesting position")
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
							You don't have any active vesting positions yet.
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
				const progress = Math.min(
					100,
					((currentTime - position.startTime) / position.duration) * 100
				)
				const claimableAmount = calculateClaimableAmount(position, currentTime)
				const isFullyUnlocked = currentTime >= position.endTime
				const hasStarted = currentTime >= position.startTime
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
								<Badge variant={isFullyUnlocked ? "default" : hasStarted ? "secondary" : "outline"}>
									{isFullyUnlocked ? "Fully Unlocked" : hasStarted ? "Active" : "Pending"}
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
										{formatAmount(position.claimedAmount, 0)}
										{metadata?.symbol && ` ${metadata.symbol}`}
									</p>
								</div>
								<div>
									<p className="text-muted-foreground mb-1">Claimable Now</p>
									<p className="font-medium text-green-600">
										{formatAmount(claimableAmount, 0)}
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
							</div>

							{/* Actions */}
							<div className="flex gap-2">
								<Button
									onClick={() => handleClaim(position.id)}
									disabled={
										claimingId === position.id ||
										claimableAmount === "0" ||
										!hasStarted
									}
									className="flex-1"
								>
									{claimingId === position.id ? (
										<>
											<Loader2 className="mr-2 h-4 w-4 animate-spin" />
											Claiming...
										</>
									) : (
										<>
											<TrendingUp className="mr-2 h-4 w-4" />
											Claim {formatAmount(claimableAmount, 0)}
											{metadata?.symbol && ` ${metadata.symbol}`}
										</>
									)}
								</Button>
								{position.owner === address && (
									<Button
										onClick={() => handleDestroy(position.id)}
										variant="destructive"
										disabled={claimingId === position.id}
									>
										<Unlock className="h-4 w-4" />
									</Button>
								)}
							</div>
						</CardContent>
					</Card>
				)
			})}
		</div>
	)
}