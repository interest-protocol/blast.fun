"use client"

import { useState } from "react"
import { useApp } from "@/context/app.context"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { TokenAvatar } from "@/components/tokens/token-avatar"
import { useCreatorRewards } from "../_hooks/use-creator-rewards"
import { formatNumberWithSuffix } from "@/utils/format"
import { Loader2, Coins } from "lucide-react"
import TransferPositionDialog from "./transfer-position-dialog"

export function CreatorRewardsTab() {
	const { isConnected, setIsConnectDialogOpen } = useApp()
	const { rewards, isLoading, claimReward, claimAllRewards, transferPosition, isClaiming, isTransferring } = useCreatorRewards()
	const [transferDialog, setTransferDialog] = useState<{ open: boolean; positionId: string; tokenSymbol?: string }>({
		open: false,
		positionId: "",
		tokenSymbol: undefined
	})
	const [isClaimingAll, setIsClaimingAll] = useState(false)

	const totalClaimable = rewards.reduce((sum, r) => sum + Number(r.estimatedRewards || 0), 0)
	const hasClaimableRewards = totalClaimable > 0

	const handleClaimAll = async () => {
		setIsClaimingAll(true)
		await claimAllRewards()
		setIsClaimingAll(false)
	}

	if (!isConnected) {
		return (
			<div className="flex flex-col items-center justify-center gap-4 py-32">
				<Coins className="h-12 w-12 text-muted-foreground/50" />
				<h2 className="text-xl font-bold">Creator Rewards</h2>
				<p className="text-muted-foreground text-center max-w-md">
					Connect your wallet to view and claim your creator rewards from liquidity positions
				</p>
				<Button onClick={() => setIsConnectDialogOpen(true)}>
					Connect Wallet
				</Button>
			</div>
		)
	}

	if (isLoading) {
		return (
			<div className="flex items-center justify-center py-32">
				<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
			</div>
		)
	}

	if (rewards.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center gap-4 py-32">
				<Coins className="h-12 w-12 text-muted-foreground/50" />
				<h2 className="text-xl font-bold">No Creator Rewards</h2>
				<p className="text-muted-foreground text-center max-w-md">
					You don&apos;t have any creator rewards to claim at the moment.
				</p>
			</div>
		)
	}

	return (
		<>
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
				{/* Claim All Card */}
				<Card className="p-4 flex flex-col items-center text-center hover:border-foreground/20 transition-colors">
					<div className="size-16 rounded-lg bg-primary/10 flex items-center justify-center">
						<Coins className="size-8 text-primary" />
					</div>

					{/* Info */}
					<div className="flex-1 w-full">
						<h3 className="font-bold text-base font-mono uppercase truncate mb-0.5">
							All Positions
						</h3>
						<p className="text-xs text-muted-foreground font-mono mb-2">
							{rewards.length} {rewards.length === 1 ? 'position' : 'positions'}
						</p>

						{/* Total Amount */}
						<div className="py-2 px-3 rounded-md bg-muted/50 border">
							<p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">
								Total Rewards
							</p>
							<div className="flex items-center justify-center gap-1.5">
								<span className="text-xl font-bold font-mono">
									{formatNumberWithSuffix(totalClaimable)}
								</span>
								<span className="text-xs font-semibold text-muted-foreground">SUI</span>
							</div>
						</div>
					</div>

					{/* Claim All Button */}
					<div className="flex gap-2 w-full mt-3">
						<Button
							onClick={handleClaimAll}
							disabled={!hasClaimableRewards || isClaimingAll || isClaiming !== null}
							size="sm"
							className="flex-1"
						>
							{isClaimingAll ? (
								<>
									<Loader2 className="h-4 w-4 animate-spin" />
								</>
							) : (
								"Claim All"
							)}
						</Button>
					</div>
				</Card>

				{/* Individual Reward Cards */}
				{rewards.map((reward) => (
				<Card key={reward.id} className="p-4 flex flex-col items-center text-center hover:border-foreground/20 transition-colors">
					{/* Token Avatar */}
					<TokenAvatar
						iconUrl={reward.memeCoinIconUrl}
						symbol={reward.memeCoinSymbol}
						name={reward.memeCoinName}
						className="size-16 rounded-lg"
						enableHover={false}
					/>

					{/* Token Info */}
					<div className="flex-1 w-full">
						<h3 className="font-bold text-base font-mono uppercase truncate mb-0.5">
							{reward.memeCoinName || "Unknown Token"}
						</h3>
						<p className="text-xs text-muted-foreground font-mono mb-2">
							{reward.memeCoinSymbol || "---"}
						</p>

						{/* Reward Amount */}
						<div className="py-2 px-3 rounded-md bg-muted/50 border">
							<p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">
								Rewards
							</p>
							<div className="flex items-center justify-center gap-1.5">
								<span className="text-xl font-bold font-mono">
									{formatNumberWithSuffix(Number(reward.estimatedRewards || 0))}
								</span>
								<span className="text-xs font-semibold text-muted-foreground">SUI</span>
							</div>
						</div>
					</div>

					{/* Action Buttons */}
					<div className="flex gap-2 w-full">
						<Button
							onClick={() => setTransferDialog({
								open: true,
								positionId: reward.id,
								tokenSymbol: reward.memeCoinSymbol
							})}
							disabled={isTransferring === reward.id}
							variant="outline"
							size="sm"
							className="flex-1 sm:flex-initial"
						>
							{isTransferring === reward.id ? (
								<Loader2 className="h-4 w-4 animate-spin" />
							) : (
								"Transfer"
							)}
						</Button>
						<Button
							onClick={() => claimReward(reward.id)}
							disabled={isClaiming === reward.id || !reward.estimatedRewards || Number(reward.estimatedRewards) === 0}
							size="sm"
							className="flex-1"
						>
							{isClaiming === reward.id ? (
								<Loader2 className="h-4 w-4 animate-spin" />
							) : (
								"Claim"
							)}
						</Button>
					</div>
				</Card>
				))}
			</div>

			{/* Transfer Dialog */}
			<TransferPositionDialog
				open={transferDialog.open}
				onOpenChange={(open) => setTransferDialog(prev => ({ ...prev, open }))}
				tokenSymbol={transferDialog.tokenSymbol}
				onConfirm={async (address) => {
					const success = await transferPosition(transferDialog.positionId, address)
					if (success) {
						setTransferDialog({ open: false, positionId: "", tokenSymbol: undefined })
					}
					return success
				}}
			/>
		</>
	)
}
