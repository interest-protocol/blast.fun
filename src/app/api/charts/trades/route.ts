import { NextRequest, NextResponse } from 'next/server'
import { memezChartService } from '@/services/memez-chart-service'

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams
        const coinType = searchParams.get('coinType')
        const limit = parseInt(searchParams.get('limit') || '50')
        
        if (!coinType) {
            return NextResponse.json(
                { error: 'Missing coinType parameter' },
                { status: 400 }
            )
        }

        if (limit < 1 || limit > 1000) {
            return NextResponse.json(
                { error: 'Limit must be between 1 and 1000' },
                { status: 400 }
            )
        }

        const trades = await memezChartService.fetchTrades(coinType, limit)

        return NextResponse.json(trades, {
            headers: {
                'Cache-Control': 'public, s-maxage=10, stale-while-revalidate=30',
            },
        })
    } catch (error) {
        console.error('Trades API error:', error)
        return NextResponse.json(
            { error: 'Failed to fetch trades' },
            { status: 500 }
        )
    }
}