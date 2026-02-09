import { NextResponse } from "next/server"
import { coinMetadataApi } from "@/lib/coin-metadata-api"
import { fetchNoodlesCoinDetail } from "@/lib/noodles/client"

export async function GET(
	_request: Request,
	{ params }: { params: Promise<{ coin_type: string }> }
) {
	const { coin_type } = await params

	if (!coin_type) {
		return NextResponse.json({ error: "Coin type is required" }, { status: 400 })
	}

	const decodedCoinType = decodeURIComponent(coin_type)

	try {
		let iconUrl: string | undefined

		try {
			const noodlesDetail = await fetchNoodlesCoinDetail(decodedCoinType)
			if (noodlesDetail?.data?.coin?.logo) {
				iconUrl = noodlesDetail.data.coin.logo
			}
		} catch (error) {
			console.error("Failed to fetch coin logo from Noodles:", error)
		}

		if (!iconUrl) {
			try {
				const metadata = await coinMetadataApi.getCoinMetadata(decodedCoinType)
				if (metadata?.iconUrl) {
					iconUrl = metadata.iconUrl
				}
			} catch (error) {
				console.error("Failed to fetch coin metadata from fallback API:", error)
			}
		}

		if (!iconUrl) {
			const response = new Response(null, { status: 404 })
			response.headers.set('Cache-Control', 'public, max-age=60, s-maxage=60')
			response.headers.set('CDN-Cache-Control', 'public, max-age=60')
			response.headers.set('Vercel-CDN-Cache-Control', 'public, max-age=60')
			return response
		}

		// @dev: Check if it's a base64 image
		if (iconUrl.startsWith('data:image/')) {
			// @dev: Extract the base64 data and content type
			const [header, base64Data] = iconUrl.split(',')
			const mimeMatch = header.match(/data:([^;]+)/)
			const mimeType = mimeMatch ? mimeMatch[1] : 'image/png'
			
			// @dev: Convert base64 to buffer
			const buffer = Buffer.from(base64Data, 'base64')
			
			const response = new Response(buffer, {
				status: 200,
				headers: {
					'Content-Type': mimeType,
					'Cache-Control': 'public, max-age=1800, s-maxage=1800', // 30 min cache
					'CDN-Cache-Control': 'public, max-age=1800',
					'Vercel-CDN-Cache-Control': 'public, max-age=1800'
				}
			})
			
			return response
		} else {
			// @dev: For regular URLs, redirect to the actual image
			const response = NextResponse.redirect(iconUrl, { status: 302 })
			
			// @dev: Set cache headers for 30 minutes as requested
			response.headers.set('Cache-Control', 'public, max-age=1800, s-maxage=1800')
			response.headers.set('CDN-Cache-Control', 'public, max-age=1800')
			response.headers.set('Vercel-CDN-Cache-Control', 'public, max-age=1800')

			return response
		}

	} catch (error) {
		console.error("Error fetching icon URL from Redis:", error)
		return NextResponse.json({ error: "Internal server error" }, { status: 500 })
	}
}