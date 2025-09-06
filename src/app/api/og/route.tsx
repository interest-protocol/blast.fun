import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'
import { getDataUri, isDataUriHash } from '@/lib/image-cache'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url)
		
		// @dev: Load custom font from public directory
		let fontData: ArrayBuffer | null = null
		try {
			const fontUrl = `${request.url.split('/api/')[0]}/font/Mach OT W03 Wide Black.ttf`
			const fontResponse = await fetch(fontUrl)
			if (fontResponse.ok) {
				fontData = await fontResponse.arrayBuffer()
			}
		} catch (error) {
			console.warn('Failed to load custom font, using fallback')
		}
		
		// @dev: Get parameters from URL
		const coinName = searchParams.get('name') || 'BLAST.FUN'
		const rawCoinImage = searchParams.get('image')
		
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
				coinImage = `${request.url.split('/api/')[0]}${rawCoinImage}`
			}
		}
		
		return new ImageResponse(
			(
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
								src={`${request.url.split('/api/')[0]}/logo/blast-bg.png`}
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
									fontFamily: 'Mach',
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
									fontFamily: 'Mach',
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
			),
			{
				width: 1200,
				height: 630,
				fonts: fontData ? [
					{
						name: 'Mach',
						data: fontData,
						style: 'normal',
						weight: 900,
					},
				] : [],
				headers: {
					'Content-Type': 'image/png',
					'Cache-Control': 'public, max-age=31536000, immutable',
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