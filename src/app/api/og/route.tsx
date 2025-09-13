import { ImageResponse } from "next/og"
import { NextRequest } from "next/server"
import { getDataUri, isDataUriHash } from "@/lib/image-cache"

export const runtime = "edge"

export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url)
		
		// @dev: Get base URL from the request
		const baseUrl = request.url.split('/api/')[0]
		
		// @dev: Check if coinType is provided
		const coinType = searchParams.get('coinType')
		let coinName = searchParams.get('name') || 'BLAST.FUN'
		let rawCoinImage = searchParams.get('image')
		
		// @dev: Fetch the actual image data if coinType is provided
		let imageData: string | null = null
		if (coinType && !rawCoinImage) {
			try {
				// @dev: Fetch the image from the coin API endpoint
				const imageUrl = `${baseUrl}/api/coin/${encodeURIComponent(coinType)}/image`
				const imageResponse = await fetch(imageUrl)
				
				if (imageResponse.ok) {
					const contentType = imageResponse.headers.get('content-type')
					if (contentType && contentType.startsWith('image/')) {
						// @dev: Convert image to base64 data URI
						const buffer = await imageResponse.arrayBuffer()
						const base64 = Buffer.from(buffer).toString('base64')
						imageData = `data:${contentType};base64,${base64}`
						rawCoinImage = imageData
					}
				}
			} catch (error) {
				console.warn('Failed to fetch coin image:', error)
			}
			
			// @dev: If name is not provided, extract from coinType (last part after ::)
			if (!searchParams.get('name')) {
				const parts = coinType.split('::')
				if (parts.length > 2) {
					coinName = parts[2] || coinName
				}
			}
		}
		
		// @dev: Resolve cached data URIs or use direct URLs
		let coinImage: string | null = null
		if (rawCoinImage && rawCoinImage.length > 0) {
			if (isDataUriHash(rawCoinImage)) {
				// @dev: Try to get from cache
				const cached = getDataUri(rawCoinImage)
				if (cached) {
					coinImage = cached
				}
			} else if (rawCoinImage.startsWith('data:image/')) {
				// @dev: Direct data URI
				coinImage = rawCoinImage
			} else if (rawCoinImage.startsWith('http') || rawCoinImage.startsWith('https')) {
				// @dev: External URL - use directly
				coinImage = rawCoinImage
			} else if (rawCoinImage.startsWith('//')) {
				// @dev: Protocol-relative URL
				coinImage = `https:${rawCoinImage}`
			} else if (rawCoinImage.startsWith('/')) {
				// @dev: Relative URL
				coinImage = `${baseUrl}${rawCoinImage}`
			}
		}
		
		// @dev: Check if this is the main page (no coinType) or a token page
		const isMainPage = !coinType && coinName === 'BLAST.FUN'
		
		return new ImageResponse(
			(
				isMainPage ? (
					// @dev: Full-width card for main page
					<div
						style={{
							display: 'flex',
							height: '630px',
							width: '1200px',
							alignItems: 'center',
							justifyContent: 'center',
							backgroundColor: '#000000',
							fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
							overflow: 'hidden',
						}}
					>
						<div
							style={{
								display: 'flex',
								flexDirection: 'column',
								alignItems: 'center',
								gap: '32px',
							}}
						>
							{/* Mushroom cloud logo */}
							<img
								src={`${baseUrl}/logo/blast-bg.png`}
								alt="BLAST.FUN"
								width={120}
								height={120}
								style={{
									width: '120px',
									height: '120px',
									objectFit: 'contain',
								}}
							/>
							<div
								style={{
									color: '#ffffff',
									fontSize: '72px',
									fontFamily: 'system-ui, -apple-system, sans-serif',
									fontWeight: '900',
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
							fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
							overflow: 'hidden',
						}}
					>
						{/* Left panel with BLAST.FUN branding */}
						<div
							style={{
								display: 'flex',
								width: '600px',
								height: '630px',
								flexDirection: 'column',
								alignItems: 'center',
								justifyContent: 'center',
								backgroundColor: '#000000',
								padding: '40px',
								position: 'relative',
							}}
						>
							{/* BLAST.FUN logo with mushroom cloud icon */}
							<div
								style={{
									display: 'flex',
									flexDirection: 'column',
									alignItems: 'center',
									gap: '24px',
								}}
							>
								{/* Mushroom cloud logo */}
								<img
									src={`${baseUrl}/logo/blast-bg.png`}
									alt="BLAST.FUN"
									width={80}
									height={80}
									style={{
										width: '80px',
										height: '80px',
										objectFit: 'contain',
									}}
								/>
								<div
									style={{
										color: '#ffffff',
										fontSize: '42px',
										fontFamily: 'system-ui, -apple-system, sans-serif',
										fontWeight: '900',
										letterSpacing: '-1px',
									}}
								>
									BLAST.FUN
								</div>
							</div>
						</div>

						{/* Right panel with solid red background and token info */}
						<div
							style={{
								display: 'flex',
								width: '600px',
								height: '630px',
								flexDirection: 'column',
								alignItems: 'center',
								justifyContent: 'center',
								backgroundColor: '#850000',
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

							{/* Token name */}
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
										fontFamily: 'system-ui, -apple-system, sans-serif',
										fontWeight: '900',
										color: '#ffffff',
										margin: '0',
										lineHeight: '1',
										letterSpacing: '-2px',
										textTransform: 'uppercase',
									}}
								>
									{coinName.split(' ')[0].slice(0, 12).toUpperCase()}
								</h1>
								<p
									style={{
										fontSize: '28px',
										fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
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
			},
		)
	} catch (error) {
		console.error("Error generating OG image:", error)
		
		// @dev: Return a simple error response
		return new Response("Failed to generate image", {
			status: 500,
		})
	}
}