import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
	try {
		const searchParams = request.nextUrl.searchParams
		const query = searchParams.get('q')

		if (!query) {
			return NextResponse.json({ error: "Missing query parameter" }, { status: 400 })
		}

		// @dev: Detect if query is address (more than 20 chars and starts with 0x)
		const isAddress = query.length > 20 && query.startsWith('0x')

		let launches: { coinType: string; poolObjectId: string; creatorAddress: string; twitterUsername: string }[] = []

		if (isAddress) {
			// @dev: Search by creator address
			launches = await prisma.tokenLaunches.findMany({
				where: {
					creatorAddress: query
				},
				select: {
					coinType: true,
					poolObjectId: true,
					creatorAddress: true,
					twitterUsername: true
				},
				orderBy: {
					createdAt: 'desc'
				}
			})
		} else {
			// @dev: Search by Twitter handle (remove @ if present)
			const handle = query.startsWith('@') ? query.slice(1) : query
			launches = await prisma.tokenLaunches.findMany({
				where: {
					twitterUsername: {
						equals: handle,
						mode: 'insensitive'
					}
				},
				select: {
					coinType: true,
					poolObjectId: true,
					creatorAddress: true,
					twitterUsername: true
				},
				orderBy: {
					createdAt: 'desc'
				}
			})
		}

		return NextResponse.json({ launches })
	} catch (error) {
		console.error("Search creator API error:", error)
		return NextResponse.json(
			{ error: "Failed to search tokens by creator" },
			{ status: 500 }
		)
	}
}