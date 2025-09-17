import { ImageResponse } from "next/og"
import { NextRequest } from "next/server"
import { getDataUri, isDataUriHash } from "@/lib/image-cache"

export const runtime = "edge"

export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url)

		// @dev: Get base URL from the request
		const baseUrl = request.url.split('/api/')[0]

		// @dev: Get parameters from URL
		const coinName = searchParams.get("name") || "BLAST.FUN"
		const coinTicker = searchParams.get("ticker") || ""
		const rawCoinImage = searchParams.get("image")

		// @dev: Resolve cached data URIs or use direct URLs
		let coinImage: string | null = null
		if (rawCoinImage && rawCoinImage.length > 0) {
			if (isDataUriHash(rawCoinImage)) {
				// @dev: Try to get from cache
				const cached = getDataUri(rawCoinImage)
				if (cached) {
					coinImage = cached
				}
			} else if (rawCoinImage.startsWith("data:image/")) {
				// @dev: Direct data URI
				coinImage = rawCoinImage
			} else if (rawCoinImage.startsWith("http") || rawCoinImage.startsWith("https")) {
				// @dev: External URL - use directly
				coinImage = rawCoinImage
			} else if (rawCoinImage.startsWith("//")) {
				// @dev: Protocol-relative URL
				coinImage = `https:${rawCoinImage}`
			} else if (rawCoinImage.startsWith("/")) {
				// @dev: Relative URL
				coinImage = `${baseUrl}${rawCoinImage}`
			}
		}

		// @dev: Check if this is the main page (no coin image) or a token page
		const isMainPage = !coinImage || coinName === 'BLAST.FUN'

		return new ImageResponse(
			(
				isMainPage ? (
					// @dev: Full-width card for main page with helmet image
					<div
						style={{
							display: 'flex',
							height: '630px',
							width: '1200px',
							alignItems: 'stretch',
							justifyContent: 'flex-start',
							flexDirection: 'row',
							backgroundColor: '#000000',
							fontFamily: 'Geist, Inter, system-ui, -apple-system, sans-serif',
							overflow: 'hidden',
						}}
					>
						{/* Left side with helmet image */}
						<div
							style={{
								display: 'flex',
								width: '600px',
								height: '630px',
								alignItems: 'center',
								justifyContent: 'center',
								backgroundColor: '#000000',
								padding: '0',
								position: 'relative',
								overflow: 'hidden',
							}}
						>
							<img
								src={`${baseUrl}/logo/blast-helmet.png`}
								alt="BLAST.FUN"
								width={600}
								height={630}
								style={{
									width: '600px',
									height: '630px',
									objectFit: 'cover',
								}}
							/>
						</div>

						{/* Right side with BLAST.FUN text */}
						<div
							style={{
								display: 'flex',
								width: '600px',
								height: '630px',
								flexDirection: 'column',
								alignItems: 'center',
								justifyContent: 'center',
								backgroundColor: '#0a0a0a',
								padding: '60px',
							}}
						>
							<div
								style={{
									color: '#ffffff',
									fontSize: '72px',
									fontFamily: 'Geist, Inter, system-ui, -apple-system, sans-serif',
									fontWeight: '800',
									letterSpacing: '-2px',
								}}
							>
								BLAST.FUN
							</div>
						</div>
					</div>
				) : (
					// @dev: Split layout for token pages
					<div
						style={{
							display: 'flex',
							height: '630px',
							width: '1200px',
							alignItems: 'stretch',
							justifyContent: 'flex-start',
							flexDirection: 'row',
							backgroundColor: '#000000',
							fontFamily: 'Geist, Inter, system-ui, -apple-system, sans-serif',
							overflow: 'hidden',
						}}
					>
						{/* Left panel with BLAST.FUN helmet */}
						<div
							style={{
								display: 'flex',
								width: '600px',
								height: '630px',
								alignItems: 'center',
								justifyContent: 'center',
								backgroundColor: '#000000',
								padding: '0',
								position: 'relative',
								overflow: 'hidden',
							}}
						>
							{/* BLAST.FUN helmet image - full size */}
							<img
								src={`${baseUrl}/logo/blast-helmet.png`}
								alt="BLAST.FUN"
								width={600}
								height={630}
								style={{
									width: '600px',
									height: '630px',
									objectFit: 'cover',
								}}
							/>
						</div>

						{/* Right panel with solid dark background and token info */}
						<div
							style={{
								display: 'flex',
								width: '600px',
								height: '630px',
								flexDirection: 'column',
								alignItems: 'center',
								justifyContent: 'center',
								backgroundColor: '#0a0a0a',
								padding: '60px',
								position: 'relative',
								overflow: 'hidden',
							}}
						>
							{/* Coin image display */}
							{coinImage && (
								<div
									style={{
										display: 'flex',
										width: '300px',
										height: '300px',
										alignItems: 'center',
										justifyContent: 'center',
										borderRadius: '999px',
										backgroundColor: '#ffffff',
										border: '8px solid rgba(255, 255, 255, 0.2)',
										marginBottom: '40px',
										position: 'relative',
										overflow: 'hidden',
									}}
								>
									<img
										src={coinImage}
										alt={coinName}
										width={284}
										height={284}
										style={{
											width: '284px',
											height: '284px',
											borderRadius: '999px',
											objectFit: 'cover',
										}}
									/>
								</div>
							)}

							{/* Token name and ticker */}
							<div
								style={{
									display: 'flex',
									flexDirection: 'column',
									alignItems: 'center',
									gap: '8px',
								}}
							>
								<h1
									style={{
										fontSize: '64px',
										fontFamily: 'Geist, Inter, system-ui, -apple-system, sans-serif',
										fontWeight: '800',
										color: '#ffffff',
										margin: '0',
										lineHeight: '1',
										letterSpacing: '-2px',
										textTransform: 'uppercase',
									}}
								>
									{(coinTicker || coinName.split(' ')[0]).slice(0, 12).toUpperCase()}
								</h1>
								<p
									style={{
										fontSize: '28px',
										fontFamily: 'Geist, Inter, system-ui, -apple-system, sans-serif',
										color: 'rgba(255, 255, 255, 0.9)',
										margin: '0',
										fontWeight: '400',
										textTransform: 'uppercase',
										letterSpacing: '2px',
									}}
								>
									{coinName}
								</p>
							</div>
						</div>
					</div>
				)
			),
			{
				width: 1200,
				height: 630,
				headers: {
					"Content-Type": "image/png",
					"Cache-Control": "public, max-age=31536000, immutable",
				},
			}
		)
	} catch (e: any) {
		console.log(`${e.message}`)
		return new Response(`Failed to generate the image`, {
			status: 500,
		})
	}
}