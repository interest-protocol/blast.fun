"use client"

import { Copy, Loader2, Zap } from "lucide-react"
import { useCallback, useEffect, useState } from "react"
import toast from "react-hot-toast"
import { BsTwitterX } from "react-icons/bs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useApp } from "@/context/app.context"
import { useReferrals } from "@/hooks/use-referrals"
import type { Token } from "@/types/token"

interface ReferralShareProps {
	pool: Token
}

export function ReferralShare({ pool }: ReferralShareProps) {
	const { address, isConnected } = useApp()
	const { createReferralLink, getReferralCode, isLoading, error } = useReferrals()

	const [refCode, setRefCode] = useState<string | null>(null)
	const [inputCode, setInputCode] = useState("")
	const [isInitializing, setIsInitializing] = useState(false)

	const tokenPageUrl = refCode
		? `${typeof window !== "undefined" ? window.location.origin : ""}/token/${pool.coinType}?ref=${refCode}`
		: `${typeof window !== "undefined" ? window.location.origin : ""}/token/${pool.coinType}`

	const terminalUrl = refCode
		? `${typeof window !== "undefined" ? window.location.origin : ""}/api/twitter/embed/${pool.coinType}?ref=${refCode}`
		: `${typeof window !== "undefined" ? window.location.origin : ""}/api/twitter/embed/${pool.coinType}`

	const loadReferralCode = useCallback(async () => {
		const code = await getReferralCode()
		setRefCode(code)
	}, [getReferralCode])

	useEffect(() => {
		if (isConnected && address) {
			loadReferralCode()
		}
	}, [isConnected, address, loadReferralCode])

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

	const handleCopyLink = async () => {
		if (typeof navigator !== "undefined" && navigator.clipboard) {
			await navigator.clipboard.writeText(tokenPageUrl)
			toast.success("Referral link copied to clipboard!")
		}
	}

	const handleShareTerminal = () => {
		const metadata = pool.metadata
		const shareText = `Come check out $${metadata?.symbol || "???"} on @blastdotfun! You can even trade directly from X.`
		const twitterUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(terminalUrl)}`
		if (typeof window !== "undefined") {
			window.open(twitterUrl, "_blank", "noopener,noreferrer")
		}
	}

	if (!isConnected) {
		return (
			<div className="border-border border-b">
				<div className="p-3">
					<div className="flex items-center gap-2">
						<div className="h-2 w-2 rounded-full bg-muted-foreground" />
						<div className="flex flex-col">
							<p className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
								Referral Program
							</p>
							<span className="font-mono text-muted-foreground text-sm">
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
			<div className="relative border-border border-b">
				<div className="space-y-3 p-3">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2">
							{/* Indicator */}
							<div className="relative flex items-center justify-center">
								<div className="absolute h-2 w-2 animate-pulse rounded-full bg-orange-400" />
								<div className="h-2 w-2 rounded-full bg-orange-400" />
							</div>

							<div className="flex flex-col">
								<p className="font-medium font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
									Referral Program
								</p>
								<span className="font-bold font-mono text-foreground text-sm">
									Earn 10% commission on all trades
								</span>
							</div>
						</div>
					</div>

					<div className="flex gap-2">
						<Input
							value={inputCode}
							onChange={(e) => setInputCode(e.target.value)}
							placeholder="Create a referral code"
							className="flex-1 border-border bg-background font-mono text-xs placeholder:text-muted-foreground/60"
							maxLength={20}
							pattern="[a-zA-Z0-9_-]+"
						/>
						<Button
							variant="outline"
							onClick={handleInitializeReferral}
							disabled={isInitializing || isLoading || inputCode.length < 3}
							className="!border-orange-400/50 !bg-orange-400/10 font-mono text-orange-400 text-xs uppercase hover:text-orange-400/80"
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

					{error && <p className="font-medium font-mono text-destructive text-xs uppercase">{error}</p>}
				</div>
			</div>
		)
	}

	return (
		<div className="relative border-border border-b">
			<div className="space-y-3 p-3">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						{/* Indicator */}
						<div className="relative flex items-center justify-center">
							<div className="absolute h-2 w-2 animate-ping rounded-full bg-green-400" />
							<div className="h-2 w-2 rounded-full bg-green-400" />
						</div>

						<div className="flex flex-col">
							<p className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
								Referral Program
							</p>
							<div className="flex items-center gap-2">
								<span className="font-bold font-mono text-foreground text-sm">
									Share this token and earn 10%
								</span>
							</div>
						</div>
					</div>
				</div>

				<div className="flex gap-2">
					<Button
						onClick={handleCopyLink}
						variant="outline"
						size="sm"
						className="flex-1 font-mono text-xs uppercase"
					>
						<Copy className="mr-1.5 h-3.5 w-3.5" />
						COPY LINK
					</Button>
					<Button
						variant="outline"
						onClick={handleShareTerminal}
						size="sm"
						className="!border-green-400/50 !bg-green-400/10 flex-1 font-mono text-green-400 text-xs uppercase hover:text-green-400/80"
					>
						<BsTwitterX className="mr-1.5 h-3.5 w-3.5" />
						SHARE TERMINAL
					</Button>
				</div>
			</div>
		</div>
	)
}
