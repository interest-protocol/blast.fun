import { NextResponse } from "next/server"
import { fetchNoodlesSearchTokens } from "@/lib/noodles/client"

export const revalidate = 60

/**
 * Token search. Noodles global-search only.
 */
export async function GET(request: Request) {
	const { searchParams } = new URL(request.url)
	const q = searchParams.get("q") ?? ""

	if (!q.trim()) {
		return NextResponse.json([], {
			headers: {
				"Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
			},
		})
	}

	try {
		const noodlesResults = await fetchNoodlesSearchTokens(q)
		const withType = (noodlesResults ?? []).map((r) => ({ ...r, type: "coin" as const }))
		return NextResponse.json(withType, {
			headers: {
				"Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
			},
		})
	} catch (error) {
		console.error("Search tokens error:", error)
		return NextResponse.json([], {
			headers: {
				"Cache-Control": "public, s-maxage=10, stale-while-revalidate=30",
			},
		})
	}
}
