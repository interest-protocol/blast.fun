"use client"

import { PnlCard } from "@/app/(root)/token/[poolId]/_components/pnl-card"
import type { PoolWithMetadata } from "@/types/pool"

export default function TestPnlPage() {
  // Mock pool data for testing with valid coinType
  const mockPoolWithCoinType: PoolWithMetadata = {
    poolId: "test-pool",
    coinType: "0xd3f57df427c941776ebb0cdbdbce9088f7a963703f9637f49178c36f72300d52::cpi::CPI",
    innerState: "0xd3f57df427c941776ebb0cdbdbce9088f7a963703f9637f49178c36f72300d52::cpi::CPI",
    migrated: false,
    coinMetadata: {
      symbol: "CPI",
      name: "Cabal Price Index",
      decimals: 9,
      iconUrl: "/logo/blast.png"
    },
    metadata: {
      symbol: "CPI", 
      name: "Cabal Price Index",
      decimals: 9,
      iconUrl: "/logo/blast.png"
    },
    marketData: {
      coinPrice: 0.00009016,
      marketCap: 90160
    }
  } as PoolWithMetadata

  // Mock pool without coinType to test error handling (should show zeros)
  const mockPoolNoCoinType: PoolWithMetadata = {
    poolId: "test-pool-2",
    coinType: undefined,
    innerState: undefined,
    migrated: false,
    coinMetadata: {
      symbol: "TEST",
      name: "Test Token",
      decimals: 9,
      iconUrl: "/logo/blast.png"
    },
    metadata: {
      symbol: "TEST",
      name: "Test Token", 
      decimals: 9,
      iconUrl: "/logo/blast.png"
    },
    marketData: {
      coinPrice: 0.001,
      marketCap: 1000
    }
  } as PoolWithMetadata

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold">PNL Card Test Page</h1>
        
        <div className="space-y-8">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Test Case 1: Valid Pool with CoinType</h2>
            <p className="text-sm text-muted-foreground">
              Should fetch and display actual PNL data from the API
            </p>
            <div className="max-w-md">
              <PnlCard pool={mockPoolWithCoinType} />
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Test Case 2: Pool without CoinType</h2>
            <p className="text-sm text-muted-foreground">
              Should handle gracefully and show $0.00 for all values
            </p>
            <div className="max-w-md">
              <PnlCard pool={mockPoolNoCoinType} />
            </div>
          </div>
        </div>
        
        <div className="mt-8 p-4 border rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Test Details:</h2>
          <ul className="space-y-2 text-sm">
            <li><strong>Test Pool 1:</strong> $CPI (Cabal Price Index) - Has valid coinType</li>
            <li><strong>Test Pool 2:</strong> $TEST - Missing coinType (error case)</li>
            <li><strong>Test Address:</strong> 0xd6eb850fdab4143fa973ab119a1b27d5db8744cb8ef7a88125fd33a6ab85b351</li>
            <li><strong>Expected Behavior:</strong></li>
            <li className="ml-4">- Pool 1: Shows actual trading data or zeros if no trades</li>
            <li className="ml-4">- Pool 2: Shows all zeros due to missing coinType</li>
          </ul>
        </div>

        <div className="mt-8 p-4 border rounded-lg bg-muted">
          <h2 className="text-xl font-semibold mb-4">Error Handling Verification:</h2>
          <p className="text-sm">
            The second card should display "$0.00" for all values without throwing any JSON parsing errors.
            This confirms the error handling is working correctly when the API returns empty or invalid data.
          </p>
        </div>
      </div>
    </div>
  )
}