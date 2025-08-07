"use client"

import { useState, useEffect, useCallback } from "react"
import { Copy, Zap, Loader2, Shield } from "lucide-react"
import { BsTwitterX } from "react-icons/bs";
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useReferrals } from "@/hooks/use-referrals"
import { useApp } from "@/context/app.context"
import type { PoolWithMetadata } from "@/types/pool"
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

    const loadReferralCode = useCallback(async () => {
        const code = await getReferralCode()
        setRefCode(code)
    }, [getReferralCode])

    useEffect(() => {
        if (isConnected && address && !pool.isProtected) {
            loadReferralCode()
        }
    }, [isConnected, address, pool.isProtected, loadReferralCode])

    if (pool.isProtected) {
        return (
            <div className="border-b border-border">
                <div className="p-3">
                    <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-orange-500" />
                        <div className="flex flex-col gap-0.5">
                            <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                                Protected Pool
                            </p>
                            <span className="font-mono text-sm font-bold text-orange-500">
                                Referrals not available
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        )
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
        const shareText = `Come check out ${pool.coinMetadata?.name || "[???]"} on @blastdotfun! You can even trade directly from X.`
        const twitterUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`
        window.open(twitterUrl, "_blank", "noopener,noreferrer")
    }

    if (!isConnected) {
        return (
            <div className="border-b border-border">
                <div className="p-3">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-muted-foreground rounded-full" />
                        <div className="flex flex-col">
                            <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                                Referral Program
                            </p>
                            <span className="font-mono text-sm text-muted-foreground">
                                Earn 10% commission sharing tokens
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    if (!refCode) {
        return (
            <div className="relative border-b border-border">
                <div className="p-3 space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            {/* Indicator */}
                            <div className="relative flex items-center justify-center">
                                <div className="absolute w-2 h-2 bg-orange-400 rounded-full animate-pulse" />
                                <div className="w-2 h-2 bg-orange-400 rounded-full" />
                            </div>

                            <div className="flex flex-col">
                                <p className="font-mono font-medium text-[10px] uppercase tracking-wider text-muted-foreground">
                                    Referral Program
                                </p>
                                <span className="font-mono text-sm font-bold text-foreground">
                                    Earn 10% commission on all trades
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <Input
                            value={inputCode}
                            onChange={(e) => setInputCode(e.target.value)}
                            placeholder="Enter referral code"
                            className="flex-1 font-mono text-xs placeholder:text-muted-foreground/60 bg-background border-border"
                            maxLength={20}
                            pattern="[a-zA-Z0-9_-]+"
                        />
                        <Button
                            variant="outline"
                            onClick={handleInitializeReferral}
                            disabled={isInitializing || isLoading || inputCode.length < 3}
                            className="font-mono text-xs uppercase !border-orange-400/50 !bg-orange-400/10 text-orange-400 hover:text-orange-400/80"
                        >
                            {isInitializing || isLoading ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                                <>
                                    <Zap className="h-3.5 w-3.5" />
                                    ACTIVATE
                                </>
                            )}
                        </Button>
                    </div>

                    {error && (
                        <p className="font-mono font-medium text-xs uppercase text-destructive">
                            {error}
                        </p>
                    )}
                </div>
            </div>
        )
    }

    return (
        <div className="relative border-b border-border">
            <div className="p-3 space-y-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        {/* Indicator */}
                        <div className="relative flex items-center justify-center">
                            <div className="absolute w-2 h-2 bg-green-400 rounded-full animate-ping" />
                            <div className="w-2 h-2 bg-green-400 rounded-full" />
                        </div>

                        <div className="flex flex-col">
                            <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                                Referral Program
                            </p>
                            <div className="flex items-center gap-2">
                                <span className="font-mono text-sm font-bold text-foreground">
                                    Share this token and earn 10%
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex gap-2">
                    <Button
                        onClick={handleCopy}
                        variant="outline"
                        size="sm"
                        className="flex-1 font-mono uppercase text-xs"
                    >
                        <Copy className="h-3.5 w-3.5 mr-1.5" />
                        COPY TERMINAL
                    </Button>
                    <Button
                        variant="outline"
                        onClick={handleTweet}
                        size="sm"
                        className="flex-1 font-mono uppercase text-xs !border-green-400/50 !bg-green-400/10 text-green-400 hover:text-green-400/80"
                    >
                        <BsTwitterX className="h-3.5 w-3.5 mr-1.5" />
                        SHARE
                    </Button>
                </div>
            </div>
        </div>
    )
}