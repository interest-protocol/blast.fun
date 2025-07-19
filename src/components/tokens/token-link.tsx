'use client';

import Link from "next/link";
import { useState } from "react";

function TokenAvatar({ iconUrl, symbol }: { iconUrl?: string; symbol: string }) {
	const [imageError, setImageError] = useState(false)

	if (!iconUrl || imageError) {
		return (
			<div className="w-4 h-4 rounded-md bg-card flex items-center justify-center text-[10px] font-bold">
				{symbol[0]?.toUpperCase() || "?"}
			</div>
		)
	}

	return (
		<img
			src={iconUrl}
			alt={symbol}
			className="w-4 h-4 rounded-md"
			onError={() => setImageError(true)}
		/>
	)
}

export function TokenLink({
	iconUrl,
	symbol,
	poolId
}: {
	iconUrl?: string
	symbol: string
	poolId?: string
}) {
	if (!poolId) {
		return (
			<div className="flex items-center gap-2">
				<TokenAvatar iconUrl={iconUrl} symbol={symbol} />
				<span className="text-foreground/60">{symbol}</span>
			</div>
		)
	}

	return (
		<Link
			href={`/pool/${poolId}`}
			className="flex items-center gap-2 hover:opacity-80 transition-opacity"
		>
			<TokenAvatar iconUrl={iconUrl} symbol={symbol} />
			<span className="text-foreground/60 transition-colors">{symbol}</span>
		</Link>
	)
}