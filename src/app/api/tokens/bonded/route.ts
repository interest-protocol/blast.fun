import { NextResponse } from "next/server"
import { enhanceTokens } from "@/lib/enhance-token"
import { processTokenIconUrls } from "@/lib/process-token-icon-urls"

export const revalidate = 5

export async function GET(request: Request) {
	try {
		const { searchParams } = new URL(request.url)
		const params = new URLSearchParams()
		searchParams.forEach((value, key) => params.append(key, value))

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

		// get protection, create data and process token images
		const enhancedTokens = await enhanceTokens(tokens)
		const processedTokens = processTokenIconUrls(enhancedTokens)

		return NextResponse.json(processedTokens, {
			headers: {
				"Cache-Control": "public, s-maxage=5, stale-while-revalidate=59"
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