"use client"

import { use, useEffect, useState } from "react"
import { usePoolWithMetadata } from "@/hooks/pump/use-pool-with-metadata"
import { XCardTrading } from "./_components/x-card-trading"
import { SplashLoader } from "@/components/shared/splash-loader"
import { EmbedHeader } from "./_components/embed-header"
import { useSearchParams } from "next/navigation"
import { useReferrals } from "@/hooks/use-referrals"
import { Logo } from "@/components/ui/logo"

export default function XCardPage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = use(params)
	const { data: pool, isLoading, error } = usePoolWithMetadata(id)
	const searchParams = useSearchParams()
	const refCode = searchParams.get("ref")
	const { checkReferralCode } = useReferrals()
	const [referrerWallet, setReferrerWallet] = useState<string | null>(null)

	useEffect(() => {
		if (refCode) {
			checkReferralCode(refCode).then(wallet => {
				if (wallet) {
					setReferrerWallet(wallet)
				}
			})
		}
	}, [refCode, checkReferralCode])

	if (isLoading) {
		return <SplashLoader />
	}

	if (error || !pool) {
		return (
			<div className="bg-background flex flex-col">
				<EmbedHeader />
				<div className="flex-1 flex items-center justify-center p-4">
					<div className="text-center max-w-sm">
						<Logo className="w-12 h-12 mx-auto mb-4 text-foreground/20" />
						<h1 className="font-mono text-lg uppercase tracking-wider text-foreground/80 mb-2">
							TOKEN::NOT_FOUND
						</h1>
						<p className="font-mono text-xs uppercase text-muted-foreground mb-4">
							The token you&apos;re looking for doesn&apos;t exist or has disappeared!
						</p>
						<button
							onClick={() => window.open(`${window.location.origin}`, "_blank")}
							className="mt-6 px-4 py-2 font-mono text-xs uppercase tracking-wider border border-foreground/20 rounded hover:bg-foreground/10 transition-colors"
						>
							BROWSE::TOKENS
						</button>
					</div>
				</div>
			</div>
		)
	}

	return (
		<div className="flex flex-col overflow-hidden">
			<EmbedHeader pool={pool} refCode={refCode} />
			<XCardTrading pool={pool} referrerWallet={referrerWallet} refCode={refCode} />
		</div>
	)
}