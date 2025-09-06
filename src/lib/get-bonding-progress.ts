export interface BondingProgressData {
	progress: number
	migrated: boolean
	migrationPending: boolean
}

export async function getBondingProgress(coinType: string): Promise<BondingProgressData> {
	const response = await fetch(`/api/tokens/${coinType}/bonding-progress`)

	if (!response.ok) {
		throw new Error(`Failed to fetch bonding progress: ${response.status}`)
	}

	return response.json()
}
