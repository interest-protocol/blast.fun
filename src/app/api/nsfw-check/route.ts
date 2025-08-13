import { NextRequest, NextResponse } from "next/server"
import { getRedisClient, CACHE_PREFIX, CACHE_TTL } from "@/lib/redis/client"

interface NSFWPrediction {
	isSafe: boolean
	labels: Array<{
		confidence: number
		name: string
		parentName: string
		taxonomyLevel: number
	}>
}

interface NSFWCheckResponse {
	predictions?: NSFWPrediction
	statusCode?: number
	code?: string
	error?: string
	message?: string
}

const NSFW_CHECKER_API = "https://api.interestlabs.io/v1/nsfw"
const REQUEST_TIMEOUT = 5000

function getCacheKey(imageUrl: string): string {
	return `${CACHE_PREFIX.NSFW_CHECK}${imageUrl}`
}

export async function POST(request: NextRequest) {
	try {
		const body = await request.json()
		const { url: imageUrl } = body

		if (!imageUrl) {
			return NextResponse.json({ isSafe: true })
		}

		const redis = getRedisClient()
		if (redis) {
			try {
				const cached = await redis.get<{ isSafe: boolean }>(getCacheKey(imageUrl))
				if (cached) {
					return NextResponse.json({ isSafe: cached.isSafe })
				}
			} catch (error) {
				console.error("Redis get error:", error)
			}
		}

		const controller = new AbortController()
		const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT)

		const response = await fetch(NSFW_CHECKER_API, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ url: imageUrl }),
			signal: controller.signal,
		})

		clearTimeout(timeoutId)

		if (!response.ok) {
			console.error(`NSFW API error: ${response.status}`)
			return NextResponse.json({ isSafe: true })
		}

		const data: NSFWCheckResponse = await response.json()

		if (data.error || data.statusCode) {
			console.error("NSFW check error:", data.message || data.error)
			return NextResponse.json({ isSafe: true })
		}

		const isSafe = data.predictions?.isSafe ?? true
		if (redis) {
			try {
				await redis.setex(getCacheKey(imageUrl), CACHE_TTL.NSFW_CHECK, { isSafe })
			} catch (error) {
				console.error("Redis set error:", error)
			}
		}

		return NextResponse.json({ isSafe })
	} catch (error) {
		console.error("Failed to check image NSFW status:", error)
		return NextResponse.json({ isSafe: true })
	}
}

export async function GET() {
	return NextResponse.json({ error: "Method not allowed" }, { status: 405 })
}