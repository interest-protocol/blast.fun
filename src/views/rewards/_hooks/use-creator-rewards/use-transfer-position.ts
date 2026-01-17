"use client"

import toast from "react-hot-toast"
import { useState, useCallback } from "react"
import { useTransaction } from "@/hooks/sui/use-transaction"
import { formatAddress } from "@mysten/sui/utils"
import { CreatorRewardProps } from "./use-creator-rewards.types"

interface TransferPositionProps {
    address?: string | null
    rewards: CreatorRewardProps[]
    refetch: () => Promise<void>
}

export const useTransferPosition = ({ address, rewards, refetch }: TransferPositionProps) => {
    const [isTransferring, setIsTransferring] = useState<string | null>(null)
    const { executeTransaction } = useTransaction()

    const transferPosition = useCallback(
        async (id: string, recipient: string) => {
            if (!address) {
                toast.error("Please connect your wallet")
                return false
            }

            const pos = rewards.find(r => r.id === id)
            if (!pos) {
                toast.error("Position not found")
                return false
            }

            setIsTransferring(id)

            try {
                const { Transaction } = await import("@mysten/sui/transactions")
                const tx = new Transaction()

                tx.transferObjects([tx.object(pos.objectId)], tx.pure.address(recipient))

                const result = await executeTransaction(tx)

                if (result) {
                    toast.success(`Successfully transferred to ${formatAddress(recipient)}`)
                    await refetch()
                    return true
                }

                toast.error("Failed to transfer")
                return false
            } catch (err) {
                toast.error("Failed to transfer")
                console.error(err)
                return false
            } finally {
                setIsTransferring(null)
            }
        },
        [address, rewards, executeTransaction, refetch]
    )

    return { transferPosition, isTransferring }
}
