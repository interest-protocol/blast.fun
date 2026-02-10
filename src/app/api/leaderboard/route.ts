import { NextRequest, NextResponse } from "next/server"

/**
 * Leaderboard. Noodles has no equivalent; returns empty list so UI does not depend on Nexa.
 */
export async function GET(request: NextRequest) {
	try {
		const _searchParams = request.nextUrl.searchParams
		return NextResponse.json({ leaderboard: [] })
	} catch (error) {
		console.error("Failed to fetch leaderboard:", error)
		return NextResponse.json(
			{ error: "Failed to fetch leaderboard", leaderboard: [] },
			{ status: 500 }
		)
	}
}