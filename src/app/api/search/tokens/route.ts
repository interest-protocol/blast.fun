import { NextResponse } from "next/server"
import { fetchNoodlesSearchTokens } from "@/lib/noodles/client"

const BLUEFIN_SEARCH_BASE =
	"https://spot.api.sui-prod.bluefin.io/internal-api/insidex"

export const revalidate = 60

/**
 * Token search. Noodles global-search (scope=coin) first, Bluefin fallback.
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
		if (noodlesResults.length > 0) {
			const withType = noodlesResults.map((r) => ({ ...r, type: "coin" as const }))
			return NextResponse.json(withType, {
				headers: {
					"Cache-Control":
						"public, s-maxage=60, stale-while-revalidate=120",
				},
			})
		}

		const bluefinRes = await fetch(
			`${BLUEFIN_SEARCH_BASE}/search/query/${encodeURIComponent(q)}?platform=xpump`,
			{
				headers: { Accept: "application/json" },
				next: { revalidate: 60 },
			}
		)

		if (!bluefinRes.ok) {
			return NextResponse.json([], {
				headers: {
					"Cache-Control":
						"public, s-maxage=60, stale-while-revalidate=120",
				},
			})
		}

		const bluefinData = await bluefinRes.json()
		const list = Array.isArray(bluefinData) ? bluefinData : []
		return NextResponse.json(list, {
			headers: {
				"Cache-Control":
					"public, s-maxage=60, stale-while-revalidate=120",
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
