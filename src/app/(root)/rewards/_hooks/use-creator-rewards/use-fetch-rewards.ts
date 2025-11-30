"use client"

import { useState, useCallback } from "react"
import toast from "react-hot-toast"
import { migratorSdk } from "@/lib/memez/sdk"
import { CreatorRewardProps } from "./use-creator-rewards.types"
import { interestProtocolApi } from "@/lib/interest-protocol-api"


export const useFetchRewards = (address?: string | null) => {
    const [rewards, setRewards] = useState<CreatorRewardProps[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const fetchRewards = useCallback(async () => {
        if (!address) return

        setIsLoading(true)
        setError(null)

        try {
            const res = await migratorSdk.getPositions({ owner: address })

            if (!res?.positions?.length) {
                setRewards([])
                return
            }

            const rewardsList: CreatorRewardProps[] = await Promise.all(
                res.positions.map(async (p) => {
                    let estimatedRewards = "0"
                    let meta

                    try {
                        const pendingFee = await migratorSdk.pendingFee({
                            bluefinPool: p.blueFinPoolId,
                            memeCoinType: p.memeCoinType,
                            positionOwner: p.objectId,
                        })

                        estimatedRewards = pendingFee
                            ? (Number(pendingFee) / 10 ** 9).toString()
                            : "0"

                        meta = await interestProtocolApi.getCoinMetadata(p.memeCoinType)
                    } catch (error) {
                        console.error(`Error fetching metadata for ${p.objectId}`, error)
                    }

                    return {
                        id: p.objectId,
                        memeCoinType: p.memeCoinType,
                        blueFinPoolId: p.blueFinPoolId,
                        blueFinPositionId: p.blueFinPositionId,
                        objectId: p.objectId,
                        estimatedRewards,
                        memeCoinName: meta?.name,
                        memeCoinSymbol: meta?.symbol,
                        memeCoinIconUrl: meta?.iconUrl,
                        claimed: false,
                    }
                })
            )

            setRewards(rewardsList)
        } catch (err) {
            setError("Failed to fetch creator rewards")
            toast.error("Failed to fetch creator rewards")
            console.error(err)
        } finally {
            setIsLoading(false)
        }
    }, [address])

    return { rewards, isLoading, error, fetchRewards, setRewards }
}
