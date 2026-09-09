"use client"

import { useState, useCallback } from "react"
import toast from "react-hot-toast"
import { migratorSdk } from "@/lib/memez/sdk"
import { CreatorRewardProps } from "./use-creator-rewards.types"
import { coinMetadataApi } from "@/lib/coin-metadata-api"


export const useFetchRewards = (address?: string | null) => {
    const [rewards, setRewards] = useState<CreatorRewardProps[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const fetchRewards = useCallback(async () => {
        if (!address) return

        setIsLoading(true)
        setError(null)

        try {
            const positions = []
            let cursor: string | null = null

            do {
                const page = await migratorSdk.getPositions({
                    owner: address,
                    cursor,
                    limit: 50,
                })

                positions.push(...page.positions)
                cursor = page.hasNextPage ? (page.nextCursor ?? null) : null
            } while (cursor)

            if (positions.length === 0) {
                setRewards([])
                return
            }

            const rewardsList: CreatorRewardProps[] = await Promise.all(
                positions.map(async (p) => {
                    let estimatedRewards = "0"
                    let meta

                    try {
                        const pendingFee = await migratorSdk.pendingFee({
                            bluefinPool: p.blueFinPoolId,
                            memeCoinType: p.memeCoinType,
                            positionOwner: p.objectId,
                            owner: address,
                        })

                        estimatedRewards = pendingFee
                            ? (Number(pendingFee) / 10 ** 9).toString()
                            : "0"
                    } catch (error) {
                        console.error(`Error fetching pending fees for ${p.objectId}`, error)
                    }

                    try {
                        meta = await coinMetadataApi.getCoinMetadata(p.memeCoinType)
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
