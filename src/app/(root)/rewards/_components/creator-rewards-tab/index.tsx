"use client"

import { FC, useState } from "react"
import { useApp } from "@/context/app.context"
import { useCreatorRewards } from "../../_hooks/use-creator-rewards"
import NotConnectedState from "./_components/not-connected-state"
import LoadingState from "./_components/loading-state"
import EmptyState from "./_components/empty-state"
import ClaimAllCard from "./_components/claim-all-card"
import RewardCard from "./_components/reward-card"
import { TransferPositionDialog } from "../transfer-position-dialog"


const CreatorRewardsTab: FC = () => {
    const { isConnected, setIsConnectDialogOpen } = useApp()
    const {
        rewards,
        isLoading,
        claimReward,
        claimAllRewards,
        transferPosition,
        isClaiming,
        isTransferring
    } = useCreatorRewards()

    const [transferDialog, setTransferDialog] = useState({
        open: false,
        positionId: "",
        tokenSymbol: undefined as string | undefined
    })

    const [isClaimingAll, setIsClaimingAll] = useState(false)

    const totalClaimable = rewards.reduce(
        (sum, r) => sum + Number(r.estimatedRewards || 0),
        0
    )

    if (!isConnected)
        return <NotConnectedState onConnect={() => setIsConnectDialogOpen(true)} />

    if (isLoading) return <LoadingState />

    if (rewards.length === 0) return <EmptyState />

    const handleClaimAll = async () => {
        setIsClaimingAll(true)
        await claimAllRewards()
        setIsClaimingAll(false)
    }

    return (
        <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                <ClaimAllCard
                    totalClaimable={totalClaimable}
                    positions={rewards.length}
                    isClaimingAll={isClaimingAll}
                    isAnyClaiming={isClaiming !== null}
                    onClaimAll={handleClaimAll}
                />

                {rewards.map((reward) => (
                    <RewardCard
                        key={reward.id}
                        reward={reward}
                        isClaiming={isClaiming === reward.id}
                        isTransferring={isTransferring === reward.id}
                        onTransfer={() =>
                            setTransferDialog({
                                open: true,
                                positionId: reward.id,
                                tokenSymbol: reward.memeCoinSymbol
                            })
                        }
                        onClaim={() => claimReward(reward.id)}
                    />
                ))}
            </div>

            <TransferPositionDialog
                open={transferDialog.open}
                tokenSymbol={transferDialog.tokenSymbol}
                onOpenChange={(open) =>
                    setTransferDialog((prev) => ({ ...prev, open }))
                }
                onConfirm={async (address) => {
                    const success = await transferPosition(
                        transferDialog.positionId,
                        address
                    )

                    if (success) {
                        setTransferDialog({
                            open: false,
                            positionId: "",
                            tokenSymbol: undefined
                        })
                    }

                    return success
                }}
            />
        </>
    )
}

export default CreatorRewardsTab
