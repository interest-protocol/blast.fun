import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
	try {
		const searchParams = request.nextUrl.searchParams
		const sortOn = searchParams.get('sortOn') || 'totalVolume'
		const timeRange = searchParams.get('timeRange') || '24h'
		const skip = searchParams.get('skip') ? parseInt(searchParams.get('skip')!) : undefined
		const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined

		const now = Date.now()
		let startTime: number
		const endTime: number = now
		
		// @dev: reward cycles - 14 day periods starting Sep 5th
		const PROGRAM_START = new Date('2025-09-05T00:00:00Z').getTime()
		const TWO_WEEKS_MS = 14 * 24 * 60 * 60 * 1000
		
		// @dev: calculate current cycle
		const cycleNumber = Math.floor((now - PROGRAM_START) / TWO_WEEKS_MS)
		const currentCycleStart = PROGRAM_START + (cycleNumber * TWO_WEEKS_MS)
		
		switch(timeRange) {
			case '24h':
				startTime = now - (24 * 60 * 60 * 1000)
				break
			case '7d':
				startTime = now - (7 * 24 * 60 * 60 * 1000)
				break
			case '14d':
				// @dev: show current reward cycle
				startTime = currentCycleStart
				break
			case 'all':
				// @dev: show all time from program start
				startTime = PROGRAM_START
				break
			default:
				startTime = now - (24 * 60 * 60 * 1000)
		}

		const { nexaServerClient } = await import('@/lib/nexa-server')
		const data = await nexaServerClient.getLeaderboard({
			sortOn: sortOn as 'totalVolume' | 'tradeCount',
			startTime,
			endTime,
			skip,
			limit
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