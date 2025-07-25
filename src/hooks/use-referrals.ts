import { useState, useCallback } from "react"
import { useApp } from "@/context/app.context"

interface UseReferralsReturn {
    isLoading: boolean
    error: string | null
    createReferralLink: (refCode: string) => Promise<string | null>
    checkReferralCode: (refCode: string) => Promise<string | null>
    getReferralCode: () => Promise<string | null>
}

export function useReferrals(): UseReferralsReturn {
    const { address } = useApp()
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const createReferralLink = useCallback(async (refCode: string): Promise<string | null> => {
        if (!address) {
            setError("WALLET::NOT_CONNECTED")
            return null
        }

        if (!refCode || refCode.length < 3) {
            setError("CODE::TOO_SHORT")
            return null
        }

        setIsLoading(true)
        setError(null)

        try {
            const response = await fetch("/api/referrals", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ wallet: address, refCode })
            })

            const data = await response.json()

            if (!response.ok) {
                setError(data.error || "FAILED::CREATE_REFERRAL")
                return null
            }

            return data.refCode
        } catch (err) {
            setError("NETWORK::ERROR")
            return null
        } finally {
            setIsLoading(false)
        }
    }, [address])

    const checkReferralCode = useCallback(async (refCode: string): Promise<string | null> => {
        try {
            const response = await fetch(`/api/referrals?refCode=${refCode}`)
            const data = await response.json()

            if (response.ok && data.wallet) {
                return data.wallet
            }
            return null
        } catch {
            return null
        }
    }, [])

    const getReferralCode = useCallback(async (): Promise<string | null> => {
        if (!address) return null

        try {
            const response = await fetch(`/api/referrals?wallet=${address}`)
            const data = await response.json()

            if (response.ok && data.refCode) {
                return data.refCode
            }
            return null
        } catch {
            return null
        }
    }, [address])

    return {
        isLoading,
        error,
        createReferralLink,
        checkReferralCode,
        getReferralCode
    }
}