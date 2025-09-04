import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
	try {
		const searchParams = request.nextUrl.searchParams
		const sortOn = searchParams.get('sortOn') || 'volume'
		const timeRange = searchParams.get('timeRange') || '1d'
		
		const now = Date.now()
		let startTime: number
		switch(timeRange) {
			case '1d':
				startTime = now - 24 * 60 * 60 * 1000
				break
			case '1w':
				startTime = now - 7 * 24 * 60 * 60 * 1000
				break
			case '1m':
				startTime = now - 30 * 24 * 60 * 60 * 1000
				break
			default:
				startTime = now - 24 * 60 * 60 * 1000
		}

		const { nexaServerClient } = await import('@/lib/nexa-server')
		const data = await nexaServerClient.getLeaderboard({
			sortOn: sortOn as 'volume' | 'trades',
			startTime,
			endTime: now
		})
		
		return NextResponse.json(data)
	} catch (error) {
		console.error('Failed to fetch leaderboard:', error)
		return NextResponse.json(
			{ error: 'Failed to fetch leaderboard', leaderboard: [] },
			{ status: 500 }
		)
	}
}