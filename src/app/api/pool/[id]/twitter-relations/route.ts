import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { isValidSuiObjectId } from "@mysten/sui/utils"

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const { id: poolId } = await params
		
		if (!isValidSuiObjectId(poolId)) {
			return NextResponse.json(
				{ error: "Invalid pool ID" },
				{ status: 400 }
			)
		}

		// First check if the pool has revealTraderIdentity enabled
		const poolSettings = await prisma.tokenProtectionSettings.findUnique({
			where: { poolId },
			select: { settings: true }
		})

		// Check if pool has protection settings and revealTraderIdentity is enabled
		const settings = poolSettings?.settings as {
			sniperProtection?: boolean
			requireTwitter?: boolean
			revealTraderIdentity?: boolean
			maxHoldingPercent?: string | null
		} | null

		if (!settings?.revealTraderIdentity) {
			// Return empty relations if reveal identity is not enabled
			// This prevents exposing trader identities when not authorized
			return NextResponse.json({
				poolId,
				relations: [],
				total: 0,
				message: "Trader identities are not revealed for this pool"
			})
		}

		// Only fetch relations if revealTraderIdentity is true
		const relations = await prisma.twitterAccountUserBuyRelation.findMany({
			where: { poolId },
			select: {
				id: true,
				twitterUserId: true,
				twitterUsername: true,
				address: true,
				purchases: true,
				createdAt: true,
				updatedAt: true
			},
			orderBy: {
				createdAt: 'desc'
			}
		})

		// Transform the data to include parsed purchases
		const processedRelations = relations.map(relation => ({
			...relation,
			purchases: relation.purchases as any // Purchases is stored as JSON
		}))

		const response = NextResponse.json({
			poolId,
			relations: processedRelations,
			total: processedRelations.length
		})

		// @dev: Cache for 10 seconds to reduce database load
		response.headers.set('Cache-Control', 'public, s-maxage=10, stale-while-revalidate=30')
		
		return response

	} catch (error) {
		console.error("Error fetching Twitter relations:", error)
		return NextResponse.json(
			{ error: "Failed to fetch Twitter relations" },
			{ status: 500 }
		)
	}
}