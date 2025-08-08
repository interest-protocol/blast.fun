import { useEffect } from "react"
import { useTokenTabs } from "@/stores/token-tabs"
import type { PoolWithMetadata } from "@/types/pool"

export function useTokenTab(pool: PoolWithMetadata | null | undefined) {
	const { addTab, setActiveTab } = useTokenTabs()

	useEffect(() => {
		if (!pool) return

		const bondingCurve = typeof pool.bondingCurve === "number" 
			? pool.bondingCurve 
			: parseFloat(pool.bondingCurve) || 0

		addTab({
			poolId: pool.poolId,
			name: pool.coinMetadata?.name || "Unknown",
			symbol: pool.coinMetadata?.symbol || "???",
			iconUrl: pool.coinMetadata?.iconUrl,
			bondingCurve,
		})

		setActiveTab(pool.poolId)
	}, [pool, addTab, setActiveTab])
}