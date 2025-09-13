import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ poolId: string }> }
) {
	try {
		const { poolId } = await params
		const poolSettings = await prisma.tokenProtectionSettings.findUnique({
			where: { poolId },
			select: { settings: true }
		})

		const response = NextResponse.json(
			{ settings: poolSettings ? poolSettings.settings : null },
			{
				headers: {
					"Cache-Control": "public, s-maxage=3600, stale-while-revalidate=60"
				}
			}
		)
		return response
	} catch (error) {
		console.error("Error fetching pool settings:", error)
		return NextResponse.json(
			{ error: "Failed to fetch settings" },
			{ status: 500 }
		)
	}
}