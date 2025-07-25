"use client"

import Link from "next/link"
import { TokenAvatar } from "./token-avatar"

export function TokenLink({ iconUrl, symbol, poolId }: { iconUrl?: string; symbol: string; poolId?: string }) {
	if (!poolId) {
		return (
			<div className="flex items-center gap-2">
				<TokenAvatar
					iconUrl={iconUrl}
					symbol={symbol}
					className="w-4 h-4 rounded-md"
					fallbackClassName="text-[10px] bg-card"
				/>
				<span className="text-foreground/60">{symbol}</span>
			</div>
		)
	}

	return (
		<Link href={`/meme/${poolId}`} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
			<TokenAvatar
				iconUrl={iconUrl}
				symbol={symbol}
				className="w-4 h-4 rounded-md"
				fallbackClassName="text-[10px] bg-card"
			/>
			<span className="text-foreground/60 transition-colors">{symbol}</span>
		</Link>
	)
}
