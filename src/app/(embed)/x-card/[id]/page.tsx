"use client"

import { useSearchParams } from "next/navigation"
import { use, useEffect, useState } from "react"
import { Logo } from "@/components/ui/logo"
import { useToken } from "@/hooks/pump/use-token"
import { useReferrals } from "@/hooks/use-referrals"
import { EmbedHeader } from "./_components/embed-header"
import { XCardTrading } from "./_components/x-card-trading"

export default function XCardPage({ params }: { params: Promise<{ id: string }> }) {
	const { id: coinType } = use(params)
	const { data: pool, isLoading, error } = useToken(coinType)
	const searchParams = useSearchParams()
	const refCode = searchParams.get("ref")
	const { checkReferralCode } = useReferrals()
	const [referrerWallet, setReferrerWallet] = useState<string | null>(null)
	const [isRedirecting, setIsRedirecting] = useState(false)

	useEffect(() => {
		if (refCode) {
			checkReferralCode(refCode).then((wallet) => {
				if (wallet) {
					setReferrerWallet(wallet)
				}
			})
		}
	}, [refCode, checkReferralCode])

	useEffect(() => {
		// Check if we're not in an iframe after a small delay
		const checkIframe = setTimeout(() => {
			if (typeof window !== "undefined" && window.self === window.top) {
				setIsRedirecting(true)
				// Redirect to main token page
				const tokenUrl = refCode ? `/token/${coinType}?ref=${refCode}` : `/token/${coinType}`
				window.location.replace(tokenUrl)
			}
		}, 100)

		return () => clearTimeout(checkIframe)
	}, [coinType, refCode])

	if (isLoading || isRedirecting) {
		return (
			<div className="flex h-screen items-center justify-center bg-background">
				<div className="text-center">
					<Logo className="mx-auto mb-4 h-16 w-16 animate-pulse" />
					<p className="font-mono text-foreground/60 text-sm uppercase tracking-wider">
						{isRedirecting ? "REDIRECTING..." : "LOADING..."}
					</p>
				</div>
			</div>
		)
	}

	if (error || !pool) {
		return (
			<div className="flex flex-col bg-background">
				<EmbedHeader />
				<div className="flex flex-1 items-center justify-center p-4">
					<div className="max-w-sm text-center">
						<Logo className="mx-auto mb-4 h-12 w-12 text-foreground/20" />
						<h1 className="mb-2 font-mono text-foreground/80 text-lg uppercase tracking-wider">
							TOKEN::NOT_FOUND
						</h1>
						<p className="mb-4 font-mono text-muted-foreground text-xs uppercase">
							The token you&apos;re looking for doesn&apos;t exist or has disappeared!
						</p>
						<button
							onClick={() => window.open(`${window.location.origin}`, "_blank")}
							className="mt-6 rounded border border-foreground/20 px-4 py-2 font-mono text-xs uppercase tracking-wider transition-colors hover:bg-foreground/10"
						>
							BROWSE::TOKENS
						</button>
					</div>
				</div>
			</div>
		)
	}

	return (
		<div className="flex h-screen flex-col overflow-hidden">
			<EmbedHeader />
			<div className="flex-1 overflow-hidden">
				<XCardTrading pool={pool} referrerWallet={referrerWallet} refCode={refCode} />
			</div>
		</div>
	)
}
