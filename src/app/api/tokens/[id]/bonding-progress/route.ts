import { NextRequest, NextResponse } from "next/server"
import { apolloClient } from "@/lib/apollo-client"
import { GET_POOL } from "@/graphql/pools"
import { CONFIG_KEYS } from "@interest-protocol/memez-fun-sdk"
import { redis } from "@/lib/redis/client"

const CACHE_TTL = 30 // 30 seconds cache

export async function GET(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
	try {
		const poolId = params.id
		const cacheKey = `bonding-progress:${poolId}`

		// Check cache first
		if (redis) {
			const cached = await redis.get(cacheKey)
			if (cached) {
				return NextResponse.json(JSON.parse(cached))
			}
		}

		// Fetch from GraphQL
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
			return NextResponse.json({ error: "Pool not found" }, { status: 404 })
		}

		const response = {
			poolId: data.pool.poolId,
			bondingCurve: data.pool.bondingCurve,
			migrated: data.pool.migrated,
			updatedAt: new Date().toISOString()
		}

		// Cache the response
		if (redis) {
			await redis.set(cacheKey, JSON.stringify(response), "EX", CACHE_TTL)
		}

		return NextResponse.json(response)
	} catch (error) {
		console.error("Error fetching bonding progress:", error)
		return NextResponse.json(
			{ error: "Failed to fetch bonding progress" },
			{ status: 500 }
		)
	}
}