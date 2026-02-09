import type { TokenListItemInput } from "@/lib/enhance-token"

// @dev: Process tokens to replace icon URLs with backend URLs (no Redis caching)
export function processTokenIconUrls<T extends TokenListItemInput>(tokens: T[]): T[] {
	return tokens.map((token) => ({
		...token,
		iconUrl: `/api/coin/${encodeURIComponent(token.coinType)}/image`,
		icon_url: undefined,
		treasuryCapOwner: token.treasuryCapOwner
			? { ...(token.treasuryCapOwner as Record<string, unknown>), iconUrl: undefined }
			: undefined
	})) as T[]
}