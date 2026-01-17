"use client"

import { useState } from "react"
import { isValidSuiAddress } from "@mysten/sui/utils"

export const useTransferPosition = (
    onConfirm: (address: string) => Promise<boolean>,
    onOpenChange: (value: boolean) => void
) => {

    const [recipientAddress, setRecipientAddress] = useState("")
    const [isTransferring, setIsTransferring] = useState(false)
    const [error, setError] = useState("")

    const handleTransfer = async () => {
        if (!recipientAddress.trim()) {
            setError("Please enter a recipient address")
            return
        }

        if (!isValidSuiAddress(recipientAddress.trim())) {
            setError("Invalid Sui address")
            return
        }

        setIsTransferring(true)
        setError("")

        try {
            const success = await onConfirm(recipientAddress.trim())
            if (success) {
                onOpenChange(false)
                setRecipientAddress("")
            }
        } catch (err) {
            console.error("Transfer failed:", err)
            setError("Transfer failed. Please try again.")
        } finally {
            setIsTransferring(false)
        }
    }

    const handleClose = () => {
        if (!isTransferring) {
            onOpenChange(false)
            setRecipientAddress("")
            setError("")
        }
    }

    return {
        recipientAddress,
        setRecipientAddress,
        isTransferring,
        error,
        setError,
        handleTransfer,
        handleClose,
    }
}
