import { useEffect, useState } from "react"

export interface TokenProtectionSettings {
	sniperProtection?: boolean
	requireTwitter?: boolean
	revealTraderIdentity?: boolean
	maxHoldingPercent?: string | null
	minFollowerCount?: string | null
}

export function useTokenProtection(poolId: string, isProtected?: boolean) {
	const [settings, setSettings] = useState<TokenProtectionSettings | null>(null)
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		if (!poolId || !isProtected) {
			setSettings(null)
			return
		}

		const fetchSettings = async () => {
			setIsLoading(true)
			setError(null)

			try {
				const response = await fetch(`/api/token-protection/settings/${poolId}`)
				if (response.ok) {
					const data = await response.json()
					setSettings(data.settings || null)
				} else {
					setSettings(null)
				}
			} catch (err) {
				console.error("Failed to fetch token protection settings:", err)
				setError("Failed to load protection settings")
				setSettings(null)
			} finally {
				setIsLoading(false)
			}
		}

		fetchSettings()
	}, [poolId, isProtected])

	return { settings, isLoading, error }
}
