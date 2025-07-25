"use client"

import { use, useEffect, useState } from "react"
import { usePoolWithMetadata } from "@/hooks/pump/use-pool-with-metadata"
import { XCardTrading } from "./_components/x-card-trading"
import { SplashLoader } from "@/components/shared/splash-loader"
import { EmbedHeader } from "./_components/embed-header"
import { useSearchParams } from "next/navigation"
import { useReferrals } from "@/hooks/use-referrals"

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
		return (
			<div className="fixed inset-0 flex flex-col">
				<EmbedHeader />
				<div className="flex-1 flex items-center justify-center">
					<SplashLoader />
				</div>
			</div>
		)
	}

	if (error || !pool) {
		return (
			<div className="fixed inset-0 flex flex-col">
				<EmbedHeader />
				<div className="flex-1 flex items-center justify-center">
					<div className="text-center">
						<p className="font-mono text-sm uppercase">ERROR::POOL_NOT_FOUND</p>
						<p className="font-mono text-xs uppercase opacity-60 mt-2">
							POOL_ID::{id || "[UNKNOWN]"}
						</p>
					</div>
				</div>
			</div>
		)
	}

	return (
		<div className="fixed inset-0 flex flex-col">
			<EmbedHeader />
			<XCardTrading pool={pool} referrerWallet={referrerWallet} />
		</div>
	)
}