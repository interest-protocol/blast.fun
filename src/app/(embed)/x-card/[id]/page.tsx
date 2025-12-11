"use client"

import { FC, use, useEffect, useState } from "react"
import { useToken } from "@/hooks/pump/use-token"
import { XCardTrading } from "./_components/x-card-trading"
import { EmbedHeader } from "./_components/embed-header"
import { useSearchParams } from "next/navigation"
import { useReferrals } from "@/hooks/use-referrals"
import { Logo } from "@/components/ui/logo"
import { XCardProps } from "./x-card.types"
import TokenNotFound from "./_components/token-not-found"

const XCardPage: FC<XCardProps> = ({ params }) => {
	const { id: coinType } = use(params)
	const { data: pool, isLoading, error } = useToken(coinType)
	const searchParams = useSearchParams()
	const refCode = searchParams.get("ref")
	const { checkReferralCode } = useReferrals()
	const [referrerWallet, setReferrerWallet] = useState<string | null>(null)
	const [isRedirecting, setIsRedirecting] = useState(false)

	useEffect(() => {
		if (refCode) {
			checkReferralCode(refCode).then(wallet => {
				if (wallet) {
					setReferrerWallet(wallet)
				}
			})
		}
	}, [refCode, checkReferralCode])

	useEffect(() => {
		// Check if we're not in an iframe after a small delay
		const checkIframe = setTimeout(() => {
			if (typeof window !== 'undefined' && window.self === window.top) {
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
			<div className="bg-background h-screen flex items-center justify-center">
				<div className="text-center">
					<Logo className="w-16 h-16 mx-auto mb-4 animate-pulse" />
					<p className="font-mono text-sm uppercase tracking-wider text-foreground/60">
						{isRedirecting ? "REDIRECTING..." : "LOADING..."}
					</p>
				</div>
			</div>
		)
	}

	if (error || !pool) {
		return <TokenNotFound />
	}

	return (
		<div className="flex flex-col h-screen overflow-hidden">
			<EmbedHeader />
			<div className="flex-1 overflow-hidden">
				<XCardTrading pool={pool} referrerWallet={referrerWallet} refCode={refCode} />
			</div>
		</div>
	)
}

export default XCardPage