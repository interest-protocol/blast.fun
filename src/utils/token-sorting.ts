import type { Token, TokenSortOption } from '@/types/token'

/**
 * Robust field accessor that handles multiple data structure patterns
 */
function getFieldValue(token: Token, field: string): number {
	// @dev: Try market object first, then fallback to direct property
	const marketValue = (token.market as any)?.[field]
	const directValue = (token as any)[field]
	return marketValue || directValue || 0
}

/**
 * Get timestamp value for date/time based sorting
 */
function getTimestampValue(token: Token, field: 'createdAt' | 'lastTradeAt'): number {
	const value = token[field]
	if (!value) return 0
	
	if (field === 'lastTradeAt') {
		// @dev: Handle string vs number timestamps
		return typeof value === 'string' ? new Date(value).getTime() : value
	}
	
	// @dev: createdAt is typically a number
	return typeof value === 'number' ? value : new Date(value).getTime()
}

/**
 * Unified token sorting function used by both desktop and mobile components
 */
export function sortTokens(tokens: Token[], sortBy: TokenSortOption): Token[] {
	if (!tokens || tokens.length === 0) return []

	const sortedTokens = [...tokens]

	switch (sortBy) {
		case "bondingProgress":
			return sortedTokens.sort((a, b) => {
				const aBonding = getFieldValue(a, 'bondingProgress')
				const bBonding = getFieldValue(b, 'bondingProgress')
				return bBonding - aBonding
			})

		case "marketCap":
			return sortedTokens.sort((a, b) => {
				const aMarketCap = getFieldValue(a, 'marketCap')
				const bMarketCap = getFieldValue(b, 'marketCap')
				return bMarketCap - aMarketCap
			})

		case "date":
			return sortedTokens.sort((a, b) => {
				const aDate = getTimestampValue(a, 'createdAt')
				const bDate = getTimestampValue(b, 'createdAt')
				return bDate - aDate
			})

		case "volume":
			return sortedTokens.sort((a, b) => {
				const aVolume = getFieldValue(a, 'volume24h')
				const bVolume = getFieldValue(b, 'volume24h')
				return bVolume - aVolume
			})

		case "holders":
			return sortedTokens.sort((a, b) => {
				const aHolders = getFieldValue(a, 'holdersCount')
				const bHolders = getFieldValue(b, 'holdersCount')
				return bHolders - aHolders
			})

		case "lastTrade":
			return sortedTokens.sort((a, b) => {
				const aTimestamp = getTimestampValue(a, 'lastTradeAt')
				const bTimestamp = getTimestampValue(b, 'lastTradeAt')
				return bTimestamp - aTimestamp
			})

		case "liquidity":
			return sortedTokens.sort((a, b) => {
				const aLiquidity = getFieldValue(a, 'liquidity')
				const bLiquidity = getFieldValue(b, 'liquidity')
				return bLiquidity - aLiquidity
			})

		case "devHoldings":
			return sortedTokens.sort((a, b) => {
				const aDevHoldings = getFieldValue(a, 'devHoldings')
				const bDevHoldings = getFieldValue(b, 'devHoldings')
				return aDevHoldings - bDevHoldings // Lower is better for dev holdings
			})

		case "top10Holdings":
			return sortedTokens.sort((a, b) => {
				const aTop10Holdings = getFieldValue(a, 'top10Holdings')
				const bTop10Holdings = getFieldValue(b, 'top10Holdings')
				return aTop10Holdings - bTop10Holdings // Lower is better for top10 holdings
			})

		default:
			return sortedTokens
	}
}

/**
 * Get default sort option based on tab type
 */
export function getDefaultSort(tabType: 'new' | 'graduating' | 'graduated'): TokenSortOption {
	switch (tabType) {
		case 'graduating':
			return 'bondingProgress'
		case 'graduated':
			return 'marketCap'
		case 'new':
		default:
			return 'date'
	}
}

/**
 * Apply default sorting based on tab type when no specific sort is selected
 */
export function applyDefaultSort(tokens: Token[], tabType: 'new' | 'graduating' | 'graduated'): Token[] {
	const defaultSort = getDefaultSort(tabType)
	return sortTokens(tokens, defaultSort)
}