import { NextResponse } from "next/server"
import { enhanceTokensWithTimeout } from "@/lib/token-response-handler"

export const revalidate = 5

export async function GET(request: Request) {
	try {
		const { searchParams } = new URL(request.url)

		// @dev: forward any filter params from client
		const params = new URLSearchParams()
		searchParams.forEach((value, key) => {
			params.append(key, value)
		})

		const response = await fetch(
			`https://spot.api.sui-prod.bluefin.io/internal-api/insidex/memezone/bonded?platforms=xpump&${params}`,
			{
				headers: {
					"Accept": "application/json"
				},
				next: { revalidate: 1 }
			}
		)

		if (!response.ok) {
			throw new Error(`Bluefin API error: ${response.status}`)
		}

		const tokens = await response.json()
		
		// @dev: Try to enhance tokens with a timeout (bonded tokens are always migrated)
		const { tokens: processedTokens, isEnhanced } = await enhanceTokensWithTimeout(tokens, {
			enhancementTimeout: 500,
			creatorTimeout: 200,
			isBonded: true
		})

		return NextResponse.json(processedTokens, {
			headers: {
				"Cache-Control": "public, s-maxage=5, stale-while-revalidate=59",
				"X-Data-Status": isEnhanced ? "enhanced" : "basic"
			}
		})
	} catch (error) {
		console.error("API error:", error)
		return NextResponse.json(
			{ error: "Failed to fetch tokens" },
			{ status: 500 }
		)
	}
}