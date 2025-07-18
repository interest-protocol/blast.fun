'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { datafeedService } from '@/services/datafeed'

interface DatafeedTestProps {
    coinType: string
}

export function DatafeedTest({ coinType }: DatafeedTestProps) {
    const [testResults, setTestResults] = useState<string[]>([])
    const [isLoading, setIsLoading] = useState(false)

    const runTests = async () => {
        setIsLoading(true)
        setTestResults([])
        const results: string[] = []

        try {
            // Test 1: Search for "meme" tokens
            results.push('🧪 TEST 1: Searching for "meme" tokens...')
            const memeTokens = await datafeedService.searchSymbols('meme', 5)
            results.push(`✅ Found ${memeTokens.length} meme tokens`)
            if (memeTokens.length > 0) {
                results.push('📋 First token:', JSON.stringify(memeTokens[0], null, 2))
            }

            // Test 2: Search with current coin type
            results.push('\n🧪 TEST 2: Searching with current coin type...')
            results.push(`Coin type: ${coinType}`)
            const symbolInfo = await datafeedService.findSymbolByCoinType(coinType)
            if (symbolInfo) {
                results.push('✅ Found symbol info:', JSON.stringify(symbolInfo, null, 2))
            } else {
                results.push('❌ No symbol found for this coin type')
            }

            // Test 3: Try to get history for a known token
            if (memeTokens.length > 0) {
                results.push('\n🧪 TEST 3: Getting history for first meme token...')
                const history = await datafeedService.getHistory(memeTokens[0].type, '1D', 7)
                results.push(`📊 Got ${history.length} candles`)
                if (history.length > 0) {
                    results.push('🕯️ Latest candle:', JSON.stringify(history[history.length - 1], null, 2))
                }
            }

            // Test 4: Direct API test
            results.push('\n🧪 TEST 4: Direct API endpoint test...')
            const directUrl = 'https://datafeed-rest-production.up.railway.app/api/v1/datafeed/symbols?limit=3'
            const directResponse = await fetch(directUrl)
            results.push(`📡 Direct API status: ${directResponse.status}`)
            if (directResponse.status === 500) {
                results.push('❌ API is returning 500 error - service temporarily unavailable')
                results.push('💡 This explains why charts cannot be displayed')
            } else if (directResponse.ok) {
                const directData = await directResponse.json()
                results.push(`✅ Direct API returned ${directData.length} items`)
            }
            
            // Test 5: Check alternative endpoints
            results.push('\n🧪 TEST 5: Testing if API has any working endpoints...')
            const healthCheck = await fetch('https://datafeed-rest-production.up.railway.app/health').catch(() => null)
            if (healthCheck) {
                results.push(`🏥 Health endpoint status: ${healthCheck.status}`)
            } else {
                results.push('❌ No health endpoint available')
            }

        } catch (error) {
            results.push(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }

        setTestResults(results)
        setIsLoading(false)
    }

    return (
        <Card className="border-2 bg-background/50 backdrop-blur-sm">
            <CardHeader className="pb-4 border-b">
                <CardTitle className="text-lg font-mono uppercase tracking-wider">
                    DATAFEED::DEBUG
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
                <Button
                    onClick={runTests}
                    disabled={isLoading}
                    className="w-full font-mono uppercase mb-4"
                >
                    {isLoading ? 'TESTING...' : 'RUN::TESTS'}
                </Button>
                
                {testResults.length > 0 && (
                    <div className="bg-background/30 border rounded p-4 font-mono text-xs whitespace-pre-wrap overflow-auto max-h-96">
                        {testResults.join('\n')}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}