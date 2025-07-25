"use client"

import { useState, useEffect } from "react"
import { Copy, Twitter, Zap, Check, Loader2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useReferrals } from "@/hooks/use-referrals"
import { useApp } from "@/context/app.context"
import type { PoolWithMetadata } from "@/types/pool"
import { cn } from "@/utils"
import toast from "react-hot-toast"

interface ReferralShareProps {
    pool: PoolWithMetadata
}

export function ReferralShare({ pool }: ReferralShareProps) {
    const { address, isConnected } = useApp()
    const { createReferralLink, getReferralCode, isLoading, error } = useReferrals()

    const [refCode, setRefCode] = useState<string | null>(null)
    const [inputCode, setInputCode] = useState("")
    const [isInitializing, setIsInitializing] = useState(false)

    const shareUrl = refCode
        ? `${window.location.origin}/api/twitter/embed/${pool.poolId}?ref=${refCode}`
        : `${window.location.origin}/api/twitter/embed/${pool.poolId}`

    useEffect(() => {
        if (isConnected && address) {
            loadReferralCode()
        }
    }, [isConnected, address])

    const loadReferralCode = async () => {
        const code = await getReferralCode()
        setRefCode(code)
    }

    const handleInitializeReferral = async () => {
        if (!inputCode.trim()) return

        setIsInitializing(true)
        const code = await createReferralLink(inputCode.trim())
        if (code) {
            setRefCode(code)
            setInputCode("")
        }
        setIsInitializing(false)
    }

    const handleCopy = async () => {
        await navigator.clipboard.writeText(shareUrl)
        toast.success('Trading terminal link copied.')
    }

    const handleTweet = () => {
        const shareText = `Come check out ${pool.coinMetadata?.name || "[???]"} on @xpumpfun! You can even trade directly from twitter.`
        const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`
        window.open(twitterUrl, "_blank", "noopener,noreferrer")
    }

    if (!isConnected) {
        return (
            <div className="relative">
                <div className="absolute inset-0 bg-red-500/20 blur-xl rounded-xl" />
                <div className="relative border-2 border-red-500/50 rounded-xl p-4 bg-background/95 backdrop-blur-sm shadow-lg">
                    <p className="font-mono text-xs uppercase text-muted-foreground text-center">
                        WALLET::NOT_CONNECTED
                    </p>
                </div>
            </div>
        )
    }

    if (!refCode) {
        return (
            <div className="relative">
                <div className="absolute inset-0 bg-red-500/20 blur-xl rounded-xl" />
                <div className="relative border-2 border-red-500/50 rounded-xl p-6 bg-background/95 backdrop-blur-sm shadow-lg">
                    <div className="space-y-4">
                        <div className="text-center space-y-2">
                            <div className="flex items-center justify-center gap-2">
                                <Twitter className="w-5 h-5 text-red-500" />
                                <p className="font-mono text-sm uppercase text-foreground">
                                    EARN 5% ON X/TWITTER TRADES
                                </p>
                            </div>
                            <p className="font-mono text-[10px] uppercase text-muted-foreground">
                                CREATE EMBEDDABLE TRADING TERMINALS FOR X/TWITTER
                            </p>
                        </div>

                        <div className="space-y-3">
                            <Input
                                value={inputCode}
                                onChange={(e) => setInputCode(e.target.value)}
                                placeholder="choose-your-code"
                                className="font-mono text-sm border-red-500/30 focus:border-red-500/50"
                                maxLength={20}
                                pattern="[a-zA-Z0-9_-]+"
                            />
                            {error && (
                                <p className="font-mono text-[10px] uppercase text-red-500">{error}</p>
                            )}

                            <Button
                                onClick={handleInitializeReferral}
                                disabled={isInitializing || isLoading || inputCode.length < 3}
                                className="w-full font-mono uppercase bg-red-500 hover:bg-red-600 text-white"
                            >
                                {isInitializing || isLoading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        CREATING...
                                    </>
                                ) : (
                                    <>
                                        <Zap className="h-4 w-4 mr-2" />
                                        CREATE REFERRAL LINK
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="relative">
            <div className="absolute inset-0 bg-blue-500/10 blur-xl rounded-xl" />
            <div className="relative border-2 border-blue-500/50 rounded-xl p-4 bg-background/95 backdrop-blur-sm shadow-lg">
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="relative">
                                <div className="absolute inset-0 bg-blue-500/40 blur-md rounded-full" />
                                <div className="relative w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                            </div>
                            <p className="font-mono text-xs uppercase text-blue-500">
                                REFERRAL::ACTIVE
                            </p>
                        </div>
                        <span className="font-mono text-xs uppercase text-muted-foreground">
                            {refCode}
                        </span>
                    </div>

                    <div className="flex gap-2">
                        <Button
                            onClick={handleCopy}
                            variant="outline"
                            className="flex-1 font-mono uppercase text-xs border-blue-500/30 hover:border-blue-500/50"
                            disabled={!refCode}
                        >
                            COPY LINK
                        </Button>
                        <Button
                            onClick={handleTweet}
                            className="flex-1 font-mono uppercase text-xs bg-blue-500 hover:bg-blue-600 text-white"
                            disabled={!refCode}
                        >
                            SHARE ON X
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}