import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
	try {
		const searchParams = request.nextUrl.searchParams
		const sortOn = searchParams.get('sortOn') || 'totalVolume'
		const timeRange = searchParams.get('timeRange') || '24h'
		const cycleParam = searchParams.get('cycle')
		const skip = searchParams.get('skip') ? parseInt(searchParams.get('skip')!) : undefined
		const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined

		const now = Date.now()
		let startTime: number
		let endTime: number = now

		// @dev: reward cycles - first cycle is Sep 5-14 (10 days), then 14-day cycles
		const PROGRAM_START = new Date('2025-09-05T00:00:00Z').getTime()
		const FIRST_CYCLE_END = new Date('2025-09-15T00:00:00Z').getTime()
		const TWO_WEEKS_MS = 14 * 24 * 60 * 60 * 1000

		// @dev: calculate current cycle (cycle 0 = Sep 5-14, cycle 1+ = 14-day periods)
		const getCurrentCycle = (timestamp: number) => {
			if (timestamp < FIRST_CYCLE_END) return 0
			return Math.floor((timestamp - FIRST_CYCLE_END) / TWO_WEEKS_MS) + 1
		}

		const getCycleTimeRange = (cycle: number) => {
			if (cycle === 0) {
				return { start: PROGRAM_START, end: FIRST_CYCLE_END }
			}
			const start = FIRST_CYCLE_END + ((cycle - 1) * TWO_WEEKS_MS)
			const end = start + TWO_WEEKS_MS
			return { start, end }
		}

		const currentCycleNumber = getCurrentCycle(now)

		switch(timeRange) {
			case '24h':
				startTime = now - (24 * 60 * 60 * 1000)
				break
			case '7d':
				startTime = now - (7 * 24 * 60 * 60 * 1000)
				break
			case '14d':
				// @dev: use specified cycle or current cycle
				const targetCycle = cycleParam ? parseInt(cycleParam) : currentCycleNumber
				const cycleRange = getCycleTimeRange(targetCycle)
				startTime = cycleRange.start
				endTime = cycleRange.end
				break
			case 'all':
				// @dev: show all time from program start
				startTime = PROGRAM_START
				break
			default:
				startTime = now - (24 * 60 * 60 * 1000)
		}

		return NextResponse.json([])
	} catch (error) {
		console.error('Failed to fetch leaderboard:', error)
		return NextResponse.json(
			{ error: 'Failed to fetch leaderboard', leaderboard: [] },
			{ status: 500 }
		)
	}
}