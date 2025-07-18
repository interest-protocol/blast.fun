import { NextRequest, NextResponse } from 'next/server'
import { memezChartService } from '@/services/memez-chart-service'

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams
        const coinType = searchParams.get('coinType')
        const interval = searchParams.get('interval') || '1h'
        
        if (!coinType) {
            return NextResponse.json(
                { error: 'Missing coinType parameter' },
                { status: 400 }
            )
        }

        const validIntervals = ['1m', '5m', '15m', '30m', '1h', '4h', '1d']
        if (!validIntervals.includes(interval)) {
            return NextResponse.json(
                { error: 'Invalid interval parameter' },
                { status: 400 }
            )
        }

        const chartData = await memezChartService.getChartData(
            coinType, 
            interval as any
        )

        // Add cache headers for CDN and browser caching
        return NextResponse.json(chartData, {
            headers: {
                'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
            },
        })
    } catch (error) {
        console.error('Chart API error:', error)
        return NextResponse.json(
            { error: 'Failed to fetch chart data' },
            { status: 500 }
        )
    }
}