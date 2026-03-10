"use server"

import { isValidSuiObjectId } from "@mysten/sui/utils"
import { pumpSdk } from "@/lib/memez/sdk"

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

		const poolData = await pumpSdk.getPumpPool(poolId)
		if (!poolData) {
			return null
		}

		return {
			id: poolId,
			coinType: poolData.memeCoinType,
		}
	} catch (error) {
		console.error("Error fetching token:", error)
		return null
	}
}
