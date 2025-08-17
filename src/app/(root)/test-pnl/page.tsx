"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { PnlCard } from "@/app/(root)/token/[poolId]/_components/pnl-card"

// Mock pool data for testing
const mockPool = {
  coinType: "0xd3f57df427c941776ebb0cdbdbce9088f7a963703f9637f49178c36f72300d52::cpi::CPI",
  coinMetadata: {
    symbol: "CPI",
    name: "Cabal Price Index",
    decimals: 9
  },
  marketData: {
    coinPrice: 0.00009016,
    suiPrice: 3.80
  }
}

export default function TestPnlPage() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold">PNL Card Test Page</h1>
        
        <div className="space-y-4">
          <p className="text-muted-foreground">
            Click the button below to test the PNL card with example data
          </p>
          
          <Button
            onClick={() => setIsOpen(true)}
            variant="outline"
            className="w-full max-w-sm font-mono text-xs uppercase"
          >
            Open PNL Card
          </Button>
        </div>

        <PnlCard pool={mockPool as any} />
        
        <div className="mt-8 p-4 border rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Test Data Used:</h2>
          <ul className="space-y-2 text-sm">
            <li>Token: $CPI (Cabal Price Index)</li>
            <li>Current Price: $0.00009016</li>
            <li>SUI Price: $3.80</li>
            <li>Test Address: 0xd6eb850fdab4143fa973ab119a1b27d5db8744cb8ef7a88125fd33a6ab85b351</li>
          </ul>
        </div>

        <div className="mt-8 p-4 border rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Expected Output:</h2>
          <p className="text-sm text-muted-foreground">
            The PNL card should match the design in /public/logo/blast_card_example.png
          </p>
        </div>
      </div>
    </div>
  )
}