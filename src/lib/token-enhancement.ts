// @dev: Shared utility for token data enhancement

export function formatBasicToken(token: any) {
	return {
		...token,
		poolId: token.id,
		creatorAddress: token.dev,
		metadata: {
			name: token.name,
			symbol: token.symbol,
			description: token.description,
			icon_url: token.iconUrl || token.icon_url
		},
		marketCap: token.marketCap || 0,
		holdersCount: token.holdersCount || 0,
		volume24h: (token.buyVolume || 0) + (token.sellVolume || 0),
		buyVolume: token.buyVolume || 0,
		sellVolume: token.sellVolume || 0,
		liquidity: token.liquidity || 0,
		price: token.price || 0,
		bondingCurve: (token.bondingProgress || 0) * 100,
		bondingProgress: (token.bondingProgress || 0) * 100,
		migrated: false,
		isProtected: false,
		isEnhanced: false
	}
}

export function formatEnhancedToken(
	token: any,
	pool: any,
	creatorData: any,
	protectionSettings: any,
	options: { isBonded?: boolean } = {}
) {
	const creatorAddress = pool?.creatorAddress || token.dev
	
	return {
		...token,
		poolId: pool?.poolId || token.id,
		creatorAddress,
		metadata: pool?.metadata || {
			name: token.name,
			symbol: token.symbol,
			description: token.description,
			icon_url: token.iconUrl || token.icon_url
		},
		marketCap: token.marketCap || 0,
		holdersCount: token.holdersCount || 0,
		volume24h: (token.buyVolume || 0) + (token.sellVolume || 0),
		buyVolume: token.buyVolume || 0,
		sellVolume: token.sellVolume || 0,
		liquidity: token.liquidity || 0,
		price: token.price || 0,
		bondingCurve: options.isBonded ? 100 : (pool?.bondingCurve || ((token.bondingProgress || 0) * 100)),
		bondingProgress: options.isBonded ? 100 : (pool?.migrated ? 100 : ((token.bondingProgress || 0) * 100)),
		migrated: options.isBonded ? true : (pool?.migrated || false),
		isProtected: !!pool?.publicKey,
		burnTax: pool?.burnTax,
		protectionSettings: pool?.publicKey ? protectionSettings : undefined,
		creatorData,
		isEnhanced: true
	}
}