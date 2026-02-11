import { normalizeStructTag } from "@mysten/sui/utils"
import { CONFIG_KEYS } from "@interest-protocol/memez-fun-sdk"
import { env } from "@/env"
import { apolloClient } from "@/lib/apollo-client"
import { enhanceTokens } from "@/lib/enhance-token"
import { mapNoodlesCoinToToken } from "@/lib/noodles/map-noodles-to-token"
import { NOODLES_API_BASE } from "@/lib/noodles/types"
import { processTokenIconUrls } from "@/lib/process-token-icon-urls"
import { GET_POOLS_BATCH } from "@/graphql/pools"
import type { NoodlesCoinListItem } from "./types"

const POOLS_BATCH_SIZE = 50

export type BlastPoolInfo = {
	poolId: string
	creatorAddress: string
	isProtected: boolean
	bondingCurve: number
	migrated: boolean
}

/**
 * Fetch list from Noodles (coin-new, coin-list, or coin-top), filter to Blast coins only
 * via GraphQL GET_POOLS_BATCH, optionally filter by bondingCurve/migrated, enrich and process.
 */
export async function fetchNoodlesTokensWithBlastFilter(
	noodlesEndpoint: "coin-new" | "coin-list" | "coin-top",
	body: {
		pagination: { offset: number; limit: number }
		filters?: Record<string, unknown>
		sort_by?: string
		order?: string
	},
	predicate?: (pool: BlastPoolInfo) => boolean
) {
	const apiKey = env.NOODLES_API_KEY
	if (!apiKey) return null

	const url = `${NOODLES_API_BASE}/api/v1/partner/${noodlesEndpoint}`
	const res = await fetch(url, {
		method: "POST",
		headers: {
			Accept: "application/json",
			"Content-Type": "application/json",
			"x-api-key": apiKey,
			"x-chain": "sui",
		},
		body: JSON.stringify(body),
		next: { revalidate: 1 },
	})

	if (!res.ok) return null

	const json = (await res.json()) as { data?: NoodlesCoinListItem[] }
	const rawList = Array.isArray(json?.data) ? json.data : []
	const mappedTokens = rawList.map((item) => mapNoodlesCoinToToken(item))

	const coinTypes = mappedTokens.map((t) => t.coinType).filter(Boolean)
	const blastPoolByCoin = new Map<string, BlastPoolInfo>()

	for (let i = 0; i < coinTypes.length; i += POOLS_BATCH_SIZE) {
		const chunk = coinTypes.slice(i, i + POOLS_BATCH_SIZE)
		if (chunk.length === 0) continue
		try {
			const { data } = await apolloClient.query({
				query: GET_POOLS_BATCH,
				variables: { coinTypes: chunk },
				context: { headers: { "config-key": CONFIG_KEYS.mainnet.XPUMP } },
				fetchPolicy: "network-only",
			})
			const pools =
				(data as {
					pools?: {
						pools?: Array<{
							coinType?: string
							poolId?: string
							creatorAddress?: string
							publicKey?: string
							bondingCurve?: number
							migrated?: boolean
						}>
					}
				})?.pools?.pools ?? []
			for (const pool of pools) {
				if (!pool.coinType) continue
				const bondingCurve = typeof pool.bondingCurve === "number" ? pool.bondingCurve : 0
				const migrated = !!pool.migrated
				const info: BlastPoolInfo = {
					poolId: pool.poolId ?? "",
					creatorAddress: pool.creatorAddress ?? "",
					isProtected: !!pool.publicKey,
					bondingCurve,
					migrated,
				}
				if (!predicate || predicate(info)) {
					blastPoolByCoin.set(normalizeStructTag(pool.coinType), info)
				}
			}
		} catch (e) {
			console.warn("GET_POOLS_BATCH error:", e)
		}
	}

	const filtered = mappedTokens
		.filter((t) => t.coinType && blastPoolByCoin.has(normalizeStructTag(t.coinType)))
		.map((t) => {
			const pool = t.coinType ? blastPoolByCoin.get(normalizeStructTag(t.coinType)) : null
			if (!pool) return t
			return { ...t, poolId: pool.poolId, dev: pool.creatorAddress, isProtected: pool.isProtected }
		})

	const enhanced = await enhanceTokens(filtered)
	return processTokenIconUrls(enhanced)
}
