// @dev: Process tokens to cache icon URLs and remove duplicate icon URLs
export async function processTokenIconUrls(tokens: any[]): Promise<any[]> {
	const processedTokens = await Promise.all(
		tokens.map(async (token: any) => {
			const originalIconUrl = token.icon_url
			return {
				...token,
				icon_url: originalIconUrl,
				iconUrl: undefined,
				treasuryCapOwner: {
					...token.treasuryCapOwner,
					iconUrl: undefined,
				},
			}
		})
	)
	return processedTokens
}