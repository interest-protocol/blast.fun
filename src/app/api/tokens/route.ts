import { NextRequest, NextResponse } from "next/server"
import { apolloClient } from "@/lib/apollo-client"
import { GET_POOLS } from "@/graphql/pools"
import { CONFIG_KEYS } from "@interest-protocol/memez-fun-sdk"
import { processMultiplePools } from "@/lib/process-pool-data"

export async function GET(request: NextRequest) {
	try {
		const searchParams = request.nextUrl.searchParams

		const page = Number(searchParams.get("page")) || 1
		const pageSize = Math.min(Number(searchParams.get("pageSize")) || 30, 100)
		const category = searchParams.get("category") as "new" | "graduating" | "graduated" | null
		const sortField = searchParams.get("sortField") || "createdAt"
		const sortDirection = searchParams.get("sortDirection") || "DESC"

		let filters: any = {}

		// @dev: addresses to exclude from graduated tokens
		const skipAddresses = [
			"0xd2420ad33ab5e422becf2fa0e607e1dde978197905b87d070da9ffab819071d6",
			"0xbbf31f4075625942aa967daebcafe0b1c90e6fa9305c9064983b5052ec442ef7",
			"0xd6eb850fdab4143fa973ab119a1b27d5db8744cb8ef7a88125fd33a6ab85b351",
			"0xfaac5bf9dd7da0706425a88413c7467b1f00a1df730ca71eca229950196a657b",
		]

		switch (category) {
			case "graduating":
				filters = {
					migrated: false,
					minBondingCurve: 50
				}
				break
			case "graduated":
				filters = {
					migrated: true
				}
				break
			case "new":
				filters = {
					migrated: false
				}
				break
			default:
				break
		}

		const { data } = await apolloClient.query({
			query: GET_POOLS,
			variables: {
				page: page,
				pageSize: pageSize,
				sortField: sortField,
				sortDirection: sortDirection,
				filters: Object.keys(filters).length > 0 ? filters : undefined
			},
			context: {
				headers: {
					"config-key": CONFIG_KEYS.mainnet.XPUMP
				}
			},
			fetchPolicy: "network-only"
		})

		if (!data?.pools?.pools) {
			throw new Error("No pools data received")
		}

		const allPools = data.pools.pools

		// filter out test creator addresses first
		let filteredPools = allPools
		filteredPools = allPools.filter((pool: any) =>
			!skipAddresses.includes(pool.creatorAddress)
		)

		// apply category-specific filters
		if (category === "new") {
			filteredPools = filteredPools.filter((pool: any) => pool.bondingCurve < 50)
		} else if (category === "graduated") {
			filteredPools = filteredPools.filter((pool: any) => pool.migrated === true)
		}

		// Process all pools using the shared function
		const processedPools = await processMultiplePools(filteredPools)

		return NextResponse.json(
			{
				pools: processedPools,
				total: filteredPools.length,
				page,
				pageSize
			},
			{
				headers: {
					'Cache-Control': 's-maxage=3, stale-while-revalidate'
				}
			}
		)
	} catch (error: any) {
		console.error("Error fetching tokens:", error)
		return NextResponse.json(
			{ error: "Failed to fetch tokens" },
			{ status: 500 }
		)
	}
}