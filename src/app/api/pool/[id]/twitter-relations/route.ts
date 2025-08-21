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

		// Fetch all TwitterAccountUserBuyRelation records for this pool
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

		return NextResponse.json({
			poolId,
			relations: processedRelations,
			total: processedRelations.length
		})

	} catch (error) {
		console.error("Error fetching Twitter relations:", error)
		return NextResponse.json(
			{ error: "Failed to fetch Twitter relations" },
			{ status: 500 }
		)
	}
}