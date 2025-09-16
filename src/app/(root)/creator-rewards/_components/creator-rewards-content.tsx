"use client"

import { useApp } from "@/context/app.context"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { CreatorRewardsList } from "./creator-rewards-list"
import { useCreatorRewards } from "../_hooks/use-creator-rewards"
import { Loader2, RefreshCw, Coins } from "lucide-react"

export function CreatorRewardsContent() {
	const { isConnected, setIsConnectDialogOpen } = useApp()
	const { rewards, isLoading, error, claimAllRewards, refetch, isClaiming } = useCreatorRewards()

	const hasRewards = rewards.length > 0
	const totalEstimatedRewards = rewards.reduce((sum, r) => sum + Number(r.estimatedRewards || 0), 0)

	if (!isConnected) {
		return (
			<div className="flex flex-col items-center justify-center gap-4 py-32">
				<h2 className="text-2xl font-bold">Creator Rewards</h2>
				<p className="text-muted-foreground">Connect your wallet to view and claim your creator rewards</p>
				<Button onClick={() => setIsConnectDialogOpen(true)}>
					Connect Wallet
				</Button>
			</div>
		)
	}

	return (
		<div className="flex justify-center py-8 pb-20 sm:pb-8">
			<div className="w-full max-w-4xl px-4">
				<div className="mb-6 sm:mb-8">
					<h1 className="mb-2 text-2xl font-bold sm:text-3xl">Creator Rewards</h1>
					<p className="text-sm text-muted-foreground sm:text-base">
						View and claim your creator rewards from liquidity positions
					</p>
				</div>

				{/* @dev: Stats card */}
				<Card className="mb-6 p-4 sm:p-6">
					<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
						<div className="space-y-1">
							<p className="text-sm text-muted-foreground">Total Unclaimed Rewards</p>
							<div className="flex items-center gap-2">
								<Coins className="h-5 w-5 text-primary" />
								<span className="text-xl font-bold sm:text-2xl">
									{totalEstimatedRewards.toFixed(4)} SUI
								</span>
							</div>
							<p className="text-sm text-muted-foreground">
								{rewards.length} {rewards.length === 1 ? 'position' : 'positions'} with rewards
							</p>
						</div>
						<div className="flex gap-2">
							<Button
								variant="outline"
								size="sm"
								onClick={refetch}
								disabled={isLoading}
								className="flex-1 sm:flex-initial"
							>
								{isLoading ? (
									<Loader2 className="h-4 w-4 animate-spin" />
								) : (
									<RefreshCw className="h-4 w-4" />
								)}
								<span className="ml-1 sm:inline">Refresh</span>
							</Button>
							{hasRewards && (
								<Button
									onClick={claimAllRewards}
									disabled={isClaiming !== null}
									size="sm"
									className="flex-1 sm:flex-initial"
								>
									{isClaiming ? (
										<>
											<Loader2 className="mr-2 h-4 w-4 animate-spin" />
											Claiming...
										</>
									) : (
										"Claim All"
									)}
								</Button>
							)}
						</div>
					</div>
				</Card>

				{/* @dev: Rewards list */}
				{isLoading ? (
					<div className="flex items-center justify-center py-12 sm:py-16">
						<Loader2 className="h-6 w-6 animate-spin text-muted-foreground sm:h-8 sm:w-8" />
					</div>
				) : error ? (
					<Card className="p-6 sm:p-8">
						<div className="text-center">
							<p className="mb-4 text-sm text-red-500 sm:text-base">{error}</p>
							<Button onClick={refetch} variant="outline" size="sm">
								Try Again
							</Button>
						</div>
					</Card>
				) : hasRewards ? (
					<CreatorRewardsList />
				) : (
					<Card className="p-6 sm:p-8">
						<div className="text-center text-muted-foreground">
							<Coins className="mx-auto mb-4 h-10 w-10 opacity-50 sm:h-12 sm:w-12" />
							<p className="mb-2 text-base font-medium sm:text-lg">No Creator Rewards Found</p>
							<p className="text-sm">
								You don&apos;t have any creator rewards to claim at the moment.
							</p>
						</div>
					</Card>
				)}
			</div>
		</div>
	)
}