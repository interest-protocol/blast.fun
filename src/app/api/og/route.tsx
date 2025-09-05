import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'
import { getDataUri, isDataUriHash } from '@/lib/image-cache'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url)
		
		// @dev: Get parameters from URL
		const coinName = searchParams.get('name') || 'BLAST.FUN'
		const rawCoinImage = searchParams.get('image')
		const marketCap = searchParams.get('marketCap') || ''
		
		// @dev: Resolve cached data URIs
		const coinImage = rawCoinImage && isDataUriHash(rawCoinImage) 
			? getDataUri(rawCoinImage) 
			: rawCoinImage
		
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
						backgroundColor: '#0a0a0a',
						fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
						overflow: 'hidden',
					}}
				>
					{/* Left panel with BLAST.fun branding */}
					<div
						style={{
							display: 'flex',
							width: '500px',
							height: '630px',
							flexDirection: 'column',
							alignItems: 'flex-start',
							justifyContent: 'space-between',
							backgroundColor: '#111111',
							padding: '60px 50px',
							position: 'relative',
						}}
					>
						{/* BLAST.fun logo */}
						<div
							style={{
								display: 'flex',
								alignItems: 'center',
								gap: '12px',
								marginBottom: '40px',
							}}
						>
							<div
								style={{
									color: '#ff1e2f',
									fontSize: '32px',
									fontWeight: '900',
									letterSpacing: '-1px',
								}}
							>
								BLAST.FUN
							</div>
						</div>

						{/* Token symbol/name */}
						<div
							style={{
								display: 'flex',
								flexDirection: 'column',
								alignItems: 'flex-start',
								marginTop: 'auto',
								marginBottom: 'auto',
							}}
						>
							<h1
								style={{
									fontSize: '90px',
									fontWeight: '900',
									color: 'white',
									margin: '0',
									lineHeight: '1',
									letterSpacing: '-3px',
									wordBreak: 'break-all',
								}}
							>
								{coinName.split(' ')[0].slice(0, 8).toUpperCase()}
							</h1>
							<p
								style={{
									fontSize: '24px',
									color: '#888888',
									margin: '10px 0 0 0',
									fontWeight: '500',
								}}
							>
								{coinName}
							</p>
							<p
								style={{
									fontSize: '18px',
									color: '#666666',
									margin: '5px 0 0 0',
									fontWeight: '400',
								}}
							>
								Your Gateway to SUI Memecoins
							</p>
						</div>

						{/* Market cap */}
						{marketCap && (
							<div
								style={{
									display: 'flex',
									flexDirection: 'column',
									alignItems: 'flex-start',
									marginTop: '40px',
								}}
							>
								<div
									style={{
										fontSize: '16px',
										color: '#888888',
										fontWeight: '500',
										marginBottom: '8px',
									}}
								>
									Market Cap
								</div>
								<div
									style={{
										fontSize: '32px',
										color: '#ff1e2f',
										fontWeight: '700',
									}}
								>
									{marketCap}
								</div>
							</div>
						)}
					</div>

					{/* Right panel with token logo */}
					<div
						style={{
							display: 'flex',
							width: '700px',
							height: '630px',
							alignItems: 'center',
							justifyContent: 'center',
							background: 'linear-gradient(135deg, #ff6b35 0%, #f7931e 100%)',
							padding: '0',
							position: 'relative',
							overflow: 'hidden',
						}}
					>
						{/* Background pattern */}
						<div
							style={{
								position: 'absolute',
								top: '0',
								left: '0',
								right: '0',
								bottom: '0',
								opacity: '0.1',
								display: 'flex',
								flexWrap: 'wrap',
								alignItems: 'flex-start',
								justifyContent: 'space-around',
								padding: '20px',
								fontSize: '48px',
								fontWeight: '900',
								color: 'white',
								lineHeight: '1.5',
								transform: 'rotate(-15deg)',
							}}
						>
							{Array.from({ length: 24 }, (_, i) => (
								<div key={i} style={{ margin: '8px' }}>BLAST</div>
							))}
						</div>

						{/* Token logo circle */}
						<div
							style={{
								display: 'flex',
								width: '280px',
								height: '280px',
								alignItems: 'center',
								justifyContent: 'center',
								borderRadius: '999px',
								backgroundColor: 'rgba(255, 255, 255, 0.95)',
								border: '8px solid white',
								boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
								position: 'relative',
								zIndex: 1,
							}}
						>
							{coinImage ? (
								<img
									src={coinImage}
									alt={coinName}
									width={240}
									height={240}
									style={{
										width: '240px',
										height: '240px',
										borderRadius: '999px',
										objectFit: 'cover',
									}}
								/>
							) : (
								<div
									style={{
										fontSize: '80px',
										fontWeight: 'bold',
										color: '#ff6b35',
										textAlign: 'center',
									}}
								>
									{coinName.slice(0, 3).toUpperCase()}
								</div>
							)}
						</div>
					</div>
				</div>
			),
			{
				width: 1200,
				height: 630,
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