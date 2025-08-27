import { NextRequest, NextResponse } from "next/server"
import { apolloClient } from "@/lib/apollo-client"
import { GET_POOL } from "@/graphql/pools"
import { CONFIG_KEYS } from "@interest-protocol/memez-fun-sdk"
import { isValidSuiObjectId } from "@mysten/sui/utils"
import { processPoolData } from "@/lib/process-pool-data"
import type { GetPoolResponse, GetPoolVariables } from "@/types/graphql"

export async function GET(
	_request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const { id: poolId } = await params
		if (!isValidSuiObjectId(poolId)) {
			return NextResponse.json(
				{ error: "Invalid token ID" },
				{ status: 400 }
			)
		}

		const { data } = await apolloClient.query<GetPoolResponse, GetPoolVariables>({
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
			return NextResponse.json(
				{ error: "Token not found" },
				{ status: 404 }
			)
		}

		const pool = data.pool
		
		// Process the pool using the shared function
		const processedPool = await processPoolData(pool)

		// edge cache headers for prod performance
		return NextResponse.json(
			processedPool,
		)
	} catch (error) {
		console.error("Error fetching token:", error)
		return NextResponse.json(
			{ error: "Failed to fetch token data" },
			{ status: 500 }
		)
	}
}