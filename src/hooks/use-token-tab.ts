import { useEffect } from "react"
import { useTokenTabs } from "@/stores/token-tabs"
import type { Token } from "@/types/token"

export function useTokenTab(pool: Token | null | undefined) {
	const { addTab } = useTokenTabs()

	useEffect(() => {
		if (!pool) return

		const bondingCurve = typeof pool.pool?.bondingCurve === "number" 
			? pool.pool.bondingCurve 
			: parseFloat(pool.pool?.bondingCurve || "0") || 0

		addTab({
			poolId: pool.pool?.poolId || pool.id,
			name: pool.metadata?.name || "Unknown",
			symbol: pool.metadata?.symbol || "???",
			iconUrl: pool.metadata?.icon_url,
			bondingCurve,
		})
	}, [pool, addTab])
}