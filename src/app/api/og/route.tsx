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

		// @dev: Load custom font
		const fontData = await fetch(`${baseUrl}/fonts/BBHSansHegarty-Regular.ttf`).then(res => res.arrayBuffer())

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
					// @dev: Main page - use blast metadata background
					<div
						style={{
							display: 'flex',
							height: '630px',
							width: '1200px',
							position: 'relative',
						}}
					>
						<img
							src={`${baseUrl}/assets/blast-metadata.png`}
							alt="BLAST.FUN"
							width={1200}
							height={630}
							style={{
								width: '1200px',
								height: '630px',
								objectFit: 'cover',
							}}
						/>
					</div>
				) : (
					// @dev: Token page - PNL card style with background
					<div
						style={{
							display: 'flex',
							height: '630px',
							width: '1200px',
							position: 'relative',
							backgroundColor: '#000000',
						}}
					>
						{/* Background image */}
						<img
							src={`${baseUrl}/assets/pnl-card-default.png`}
							alt=""
							width={1200}
							height={630}
							style={{
								position: 'absolute',
								top: 0,
								left: 0,
								width: '1200px',
								height: '630px',
								objectFit: 'cover',
							}}
						/>

						{/* Gradient overlay */}
						<div
							style={{
								position: 'absolute',
								top: 0,
								left: 0,
								width: '1200px',
								height: '630px',
								background: 'linear-gradient(to bottom, rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.7))',
							}}
						/>

						{/* Content container */}
						<div
							style={{
								position: 'relative',
								display: 'flex',
								flexDirection: 'row',
								alignItems: 'center',
								justifyContent: 'center',
								width: '1200px',
								height: '630px',
								padding: '80px',
								gap: '80px',
								fontFamily: '"BB Sans Hegarty", sans-serif',
							}}
						>
							{/* Blast logo */}
							<img
								src={`${baseUrl}/logo/blast.svg`}
								alt="Blast"
								width={180}
								height={180}
								style={{
									position: 'absolute',
									top: '40px',
									right: '40px',
									width: '180px',
									height: 'auto',
									opacity: 0.6,
									filter: 'brightness(0) invert(1)',
								}}
							/>

							{/* Token name and ticker - LEFT SIDE */}
							<div
								style={{
									display: 'flex',
									flexDirection: 'column',
									alignItems: 'flex-start',
									gap: '24px',
									flex: 1,
								}}
							>
								<div
									style={{
										fontSize: '96px',
										fontWeight: '900',
										color: '#ffffff',
										margin: '0',
										lineHeight: '1',
										letterSpacing: '-3px',
										textTransform: 'uppercase',
										fontFamily: '"BB Sans Hegarty", sans-serif',
									}}
								>
									{(coinTicker || coinName.split(' ')[0]).slice(0, 12).toUpperCase()}
								</div>
								<div
									style={{
										fontSize: '40px',
										color: 'rgba(255, 255, 255, 0.9)',
										margin: '0',
										fontWeight: '400',
										textTransform: 'uppercase',
										letterSpacing: '2px',
										fontFamily: '"BB Sans Hegarty", sans-serif',
									}}
								>
									{coinName}
								</div>
							</div>

							{/* Coin image - RIGHT SIDE */}
							{coinImage && (
								<div
									style={{
										display: 'flex',
										width: '360px',
										height: '360px',
										alignItems: 'center',
										justifyContent: 'center',
										borderRadius: '16px',
										backgroundColor: '#ffffff',
										border: '4px solid rgba(255, 255, 255, 0.3)',
										overflow: 'hidden',
									}}
								>
									<img
										src={coinImage}
										alt={coinName}
										width={360}
										height={360}
										style={{
											width: '360px',
											height: '360px',
											objectFit: 'cover',
										}}
									/>
								</div>
							)}
						</div>
					</div>
				)
			),
			{
				width: 1200,
				height: 630,
				fonts: [
					{
						name: 'BB Sans Hegarty',
						data: fontData,
						style: 'normal',
						weight: 400,
					},
				],
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