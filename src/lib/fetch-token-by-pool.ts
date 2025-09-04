"use server"

import { apolloClient } from "@/lib/apollo-client"
import { GET_POOL } from "@/graphql/pools"
import { CONFIG_KEYS } from "@interest-protocol/memez-fun-sdk"
import { isValidSuiObjectId } from "@mysten/sui/utils"

export async function fetchTokenByPool(poolId: string): Promise<{
  id: string
  coinType: string
  treasuryCap?: string
  metadata?: {
    name?: string
    symbol?: string
    description?: string
    icon_url?: string
    [key: string]: any
  }
  creatorAddress?: string
  bondingCurve?: string
  coinBalance?: string
  quoteBalance?: string
  migrated?: boolean
  canMigrate?: boolean
  nsfw?: boolean
  lastTradeAt?: string
  publicKey?: string
  innerState?: any
  burnTax?: string
  virtualLiquidity?: string
  targetQuoteLiquidity?: string
  curve?: string
  coinIpxTreasuryCap?: string
  canonical?: boolean
  migrationWitness?: string
  config?: any
  updatedAt?: string
  market?: any
} | null> {
	try {
		if (!isValidSuiObjectId(poolId)) {
			return null
		}

		const { data } = await apolloClient.query({
			query: GET_POOL,
			variables: { poolId },
			context: {
				headers: {
					"config-key": CONFIG_KEYS.mainnet.XPUMP
				}
			},
			fetchPolicy: "network-only"
		})

		if (!data?.pool) {
			return null
		}

		const pool = data.pool
		return pool
	} catch (error) {
		console.error("Error fetching token:", error)
		return null
	}
}