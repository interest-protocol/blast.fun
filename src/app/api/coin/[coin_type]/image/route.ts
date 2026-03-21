import { NextResponse } from "next/server"
import { fetchNoodlesCoinDetail } from "@/lib/noodles/client"

export async function GET(
	_request: Request,
	{ params }: { params: Promise<{ coin_type: string }> }
) {
	const { coin_type } = await params

	if (!coin_type) {
		return NextResponse.json({ error: "Coin type is required" }, { status: 400 })
	}

	try {
		const detail = await fetchNoodlesCoinDetail(decodeURIComponent(coin_type))
		const iconUrl = detail?.data?.coin?.logo

		if (!iconUrl) {
			const response = new Response(null, { status: 404 })
			response.headers.set("Cache-Control", "public, max-age=60, s-maxage=60")
			response.headers.set("CDN-Cache-Control", "public, max-age=60")
			response.headers.set("Vercel-CDN-Cache-Control", "public, max-age=60")
			return response
		}

		if (iconUrl.startsWith("data:image/")) {
			const [header, base64Data] = iconUrl.split(",")
			const mimeMatch = header.match(/data:([^;]+)/)
			const mimeType = mimeMatch ? mimeMatch[1] : "image/png"
			const buffer = Buffer.from(base64Data, "base64")

			return new Response(buffer, {
				status: 200,
				headers: {
					"Content-Type": mimeType,
					"Cache-Control": "public, max-age=1800, s-maxage=1800",
					"CDN-Cache-Control": "public, max-age=1800",
					"Vercel-CDN-Cache-Control": "public, max-age=1800"
				}
			})
		}

		const response = NextResponse.redirect(iconUrl, { status: 302 })
		response.headers.set("Cache-Control", "public, max-age=1800, s-maxage=1800")
		response.headers.set("CDN-Cache-Control", "public, max-age=1800")
		response.headers.set("Vercel-CDN-Cache-Control", "public, max-age=1800")
		return response
	} catch (error) {
		console.error("Error fetching coin image:", error)
		return NextResponse.json({ error: "Internal server error" }, { status: 500 })
	}
}
