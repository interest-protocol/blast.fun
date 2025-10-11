// @dev: Process tokens to replace icon URLs with backend URLs (no Redis caching)
export function processTokenIconUrls(tokens: any[]): any[] {
	return tokens.map((token: any) => ({
		...token,
		iconUrl: `/api/coin/${token.coinType}/image`,
		icon_url: undefined,
		treasuryCapOwner: token.treasuryCapOwner ? {
			...token.treasuryCapOwner,
			iconUrl: undefined,
		} : undefined
	}))
}