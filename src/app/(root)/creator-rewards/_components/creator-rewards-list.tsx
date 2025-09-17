"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useCreatorRewards } from "../_hooks/use-creator-rewards"
import { formatAddress } from "@mysten/sui/utils"
import { Loader2, ExternalLink, Coins, Send } from "lucide-react"
import Link from "next/link"
import { TransferPositionDialog } from "./transfer-position-dialog"

export function CreatorRewardsList() {
	const { rewards, claimReward, isClaiming, transferPosition, isTransferring } = useCreatorRewards()
	const [transferDialog, setTransferDialog] = useState<{ open: boolean; positionId: string; tokenSymbol?: string }>({
		open: false,
		positionId: "",
		tokenSymbol: undefined
	})
	console.log({rewards});

	return (
		<div className="space-y-4">
			{rewards.map((reward) => (
				<Card key={reward.id} className="p-4">
					<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
						<div className="flex-1 space-y-3">
							{/* @dev: Token info */}
							<div>
								<h3 className="font-semibold text-base">
									{reward.memeCoinSymbol || formatAddress(reward.memeCoinType)}
								</h3>
								{reward.memeCoinName && (
									<p className="text-sm text-muted-foreground">{reward.memeCoinName}</p>
								)}
							</div>

							{/* @dev: Pool and Position links - responsive */}
							<div className="flex flex-col gap-2 text-sm sm:flex-row sm:gap-4">
								<div className="flex flex-col sm:flex-row sm:items-center">
									<span className="text-muted-foreground">Pool: </span>
									<Link
										href={`https://suivision.xyz/object/${reward.blueFinPoolId}`}
										target="_blank"
										rel="noopener noreferrer"
										className="inline-flex items-center gap-1 text-primary hover:underline"
									>
										{formatAddress(reward.blueFinPoolId)}
										<ExternalLink className="h-3 w-3" />
									</Link>
								</div>
								<div className="flex flex-col sm:flex-row sm:items-center">
									<span className="text-muted-foreground">Position: </span>
									<Link
										href={`https://suivision.xyz/object/${reward.blueFinPositionId}`}
										target="_blank"
										rel="noopener noreferrer"
										className="inline-flex items-center gap-1 text-primary hover:underline"
									>
										{formatAddress(reward.blueFinPositionId)}
										<ExternalLink className="h-3 w-3" />
									</Link>
								</div>
							</div>

							{/* @dev: Estimated rewards */}
							<div className="flex items-center gap-2">
								<Coins className="h-4 w-4 text-primary" />
								<span className="font-medium text-sm sm:text-base">
									Rewards: {Number(reward.estimatedRewards || 0).toFixed(6)} SUI
								</span>
							</div>
						</div>

						{/* @dev: Action buttons - full width on mobile */}
						<div className="flex w-full gap-2 sm:w-auto">
							<Button
								onClick={() => claimReward(reward.id)}
								disabled={isClaiming === reward.id || reward.claimed}
								variant={reward.claimed ? "outline" : "default"}
								className="flex-1 sm:flex-initial"
								size="sm"
							>
								{isClaiming === reward.id ? (
									<>
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										Claiming...
									</>
								) : reward.claimed ? (
									"Claimed"
								) : (
									"Claim"
								)}
							</Button>
							<Button
								onClick={() => setTransferDialog({
									open: true,
									positionId: reward.id,
									tokenSymbol: reward.memeCoinSymbol
								})}
								disabled={isTransferring === reward.id}
								variant="outline"
								className="flex-1 sm:flex-initial"
								size="sm"
							>
								{isTransferring === reward.id ? (
									<>
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										Transferring...
									</>
								) : (
									<>
										<Send className="mr-2 h-4 w-4" />
										Transfer
									</>
								)}
							</Button>
						</div>
					</div>
				</Card>
			))}

			{/* @dev: Transfer dialog */}
			<TransferPositionDialog
				open={transferDialog.open}
				onOpenChange={(open) => setTransferDialog(prev => ({ ...prev, open }))}
				positionId={transferDialog.positionId}
				tokenSymbol={transferDialog.tokenSymbol}
				onConfirm={async (address) => {
					const success = await transferPosition(transferDialog.positionId, address)
					if (success) {
						setTransferDialog({ open: false, positionId: "", tokenSymbol: undefined })
					}
					return success
				}}
			/>
		</div>
	)
}