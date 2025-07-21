"use client"

import { use } from "react"
import { usePoolWithMetadata } from "@/hooks/pump/use-pool-with-metadata"
import { XCardTrading } from "./_components/x-card-trading"
import { SplashLoader } from "@/components/shared/splash-loader"
import { EmbedHeader } from "./_components/embed-header"

export default function XCardPage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = use(params)
	const { data: pool, isLoading, error } = usePoolWithMetadata(id)

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
			<XCardTrading pool={pool} />
		</div>
	)
}