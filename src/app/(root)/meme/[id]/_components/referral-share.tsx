"use client"

import { useState, useEffect, useCallback } from "react"
import { Copy, Twitter, Zap, Loader2, Shield } from "lucide-react"
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
            <div className="border-2 border-yellow-500/30 rounded-lg bg-yellow-500/5 backdrop-blur-sm p-4">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <div className="absolute inset-0 bg-yellow-500/20 blur-sm" />
                        <Shield className="relative w-5 h-5 text-yellow-500" />
                    </div>
                    <div className="flex-1 space-y-1">
                        <p className="font-mono text-xs uppercase text-yellow-500">
                            PROTECTED::POOL
                        </p>
                        <p className="font-mono text-[10px] uppercase text-yellow-500/80">
                            REFERRAL LINKS NOT AVAILABLE FOR PROTECTED POOLS
                        </p>
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
        const shareText = `Come check out ${pool.coinMetadata?.name || "[???]"} on @blastdotfun! You can even trade directly from twitter.`
        const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`
        window.open(twitterUrl, "_blank", "noopener,noreferrer")
    }

    if (!isConnected) {
        return (
            <div className="border-2 border-dashed border-muted-foreground/30 rounded-lg bg-background/50 backdrop-blur-sm p-4">
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <div className="absolute inset-0 bg-green-500/20 blur-md" />
                        <div className="relative bg-green-500/10 border border-green-500/50 rounded p-2">
                            <Twitter className="w-5 h-5 text-green-500" />
                        </div>
                    </div>
                    <div className="flex-1 space-y-1">
                        <p className="font-mono text-xs uppercase text-foreground/80">
                            REFERRAL::EARN [10%] COMMISSION
                        </p>
                        <p className="font-mono text-[10px] uppercase text-muted-foreground">
                            CONNECT::WALLET TO SHARE & EARN
                        </p>
                    </div>
                </div>
            </div>
        )
    }

    if (!refCode) {
        return (
            <div className="border-2 border-primary/30 rounded-lg bg-background/50 backdrop-blur-sm">
                <div className="p-4 border-b border-primary/20">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <div className="absolute inset-0 bg-primary/20 blur-sm" />
                            <Twitter className="relative w-4 h-4 text-primary/80" />
                        </div>
                        <div>
                            <p className="font-mono text-xs uppercase text-foreground/80">
                                REFERRAL::SETUP
                            </p>
                            <p className="font-mono text-[10px] uppercase text-muted-foreground">
                                EARN [10%] ON TWITTER TRADES
                            </p>
                        </div>
                    </div>
                </div>

                <div className="p-4 space-y-3">
                    <Input
                        value={inputCode}
                        onChange={(e) => setInputCode(e.target.value)}
                        placeholder="ENTER::REFERRAL_CODE"
                        className="font-mono text-xs placeholder:text-muted-foreground/40 bg-background/50 border-muted-foreground/30"
                        maxLength={20}
                        pattern="[a-zA-Z0-9_-]+"
                    />

                    {error && (
                        <p className="font-mono text-[10px] uppercase text-destructive/80">
                            ERROR::{error}
                        </p>
                    )}

                    <Button
                        onClick={handleInitializeReferral}
                        disabled={isInitializing || isLoading || inputCode.length < 3}
                        className="w-full font-mono text-xs uppercase bg-primary/20 hover:bg-primary/30 border border-primary/50"
                        variant="outline"
                    >
                        {isInitializing || isLoading ? (
                            <>
                                <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                                INITIALIZING...
                            </>
                        ) : (
                            <>
                                <Zap className="h-3 w-3 mr-2" />
                                ACTIVATE::REFERRAL
                            </>
                        )}
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="border-2 p-3 space-y-2 border-dashed shadow-lg rounded-xl overflow-hidden border-green-500/50 dark:border-green-500/30">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-semibold">
                    <div className="relative">
                        <div className="absolute inset-0 bg-green-500/40 blur-sm animate-pulse" />
                        <div className="relative w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    </div>
                    <p className="font-mono text-[10px] uppercase text-green-500 dark:text-green-500/80">
                        REFERRAL::ACTIVE
                    </p>
                </div>

                <span className="font-mono font-semibold text-[10px] uppercase text-muted-foreground">
                    CODE::[{refCode}]
                </span>
            </div>

            <div className="flex gap-2">
                <Button
                    onClick={handleCopy}
                    variant="outline"
                    size="sm"
                    className="flex-1 font-mono uppercase text-[10px]"
                >
                    <Copy className="h-3 w-3 mr-1" />
                    COPY
                </Button>
                <Button
                    onClick={handleTweet}
                    size="sm"
                    className="flex-1 font-mono uppercase text-[10px]"
                >
                    <Twitter className="h-3 w-3 mr-1" />
                    SHARE
                </Button>
            </div>
        </div>
    )
}