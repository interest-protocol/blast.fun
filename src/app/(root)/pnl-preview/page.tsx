"use client"

import { useEffect, useRef } from "react"

export default function PnlPreviewPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size
    canvas.width = 800
    canvas.height = 450

    // Load background
    const bgImg = new Image()
    bgImg.onload = () => {
      ctx.drawImage(bgImg, 0, 0, 800, 450)

      // Test data
      const pnlData = {
        totalPnl: -15.21,
        totalPnlPercentage: -80.05,
        entryPrice: 0.0256221,
        totalSold: 0,
        totalHolding: 14.84,
        totalBought: 73.40
      }

      // Master base position
      const masterBaseX = 500
      const masterBaseY = 150

      // Individual base positions
      const tokenBase = {
        x: masterBaseX + 35,
        y: masterBaseY - 15
      }

      const pnlPercentBase = {
        x: masterBaseX + 35,
        y: masterBaseY + 45
      }

      const investedBase = {
        x: masterBaseX - 90,
        labelY: masterBaseY + 95,
        amountY: masterBaseY + 118,
        usdY: masterBaseY + 133
      }

      const pnlBase = {
        x: masterBaseX + 35,
        labelY: masterBaseY + 95,
        amountY: masterBaseY + 118,
        usdY: masterBaseY + 133
      }

      const entryBase = {
        x: masterBaseX - 120,
        labelY: masterBaseY + 185,
        valueY: masterBaseY + 205
      }

      const soldBase = {
        x: masterBaseX - 5,
        labelY: masterBaseY + 185,
        valueY: masterBaseY + 205
      }

      const holdingBase = {
        x: masterBaseX + 85,
        labelY: masterBaseY + 185,
        valueY: masterBaseY + 205
      }

      // Draw token
      ctx.fillStyle = "#ffffff"
      ctx.font = "bold 32px monospace"
      ctx.textAlign = "center"
      ctx.fillText("$CPI", tokenBase.x, tokenBase.y)

      ctx.fillStyle = "#888888"
      ctx.font = "14px monospace"
      ctx.fillText("CABAL PRICE INDEX", tokenBase.x, tokenBase.y + 20)

      // Draw PNL percentage
      ctx.fillStyle = "#ff5555"
      ctx.font = "bold 36px monospace"
      ctx.fillText("-80.05%", pnlPercentBase.x, pnlPercentBase.y)

      // Labels
      ctx.fillStyle = "#888888"
      ctx.font = "11px monospace"
      ctx.fillText("Invested", investedBase.x, investedBase.labelY)
      ctx.fillText("PNL", pnlBase.x, pnlBase.labelY)

      // Amounts
      ctx.fillStyle = "#00aaff"
      ctx.font = "18px monospace"
      ctx.fillText("💧19.01", investedBase.x, investedBase.amountY)
      ctx.fillStyle = "#888888"
      ctx.font = "10px monospace"
      ctx.fillText("($73.40)", investedBase.x, investedBase.usdY)

      ctx.fillStyle = "#ff5555"
      ctx.font = "18px monospace"
      ctx.fillText("💧-15.21", pnlBase.x, pnlBase.amountY)
      ctx.fillStyle = "#888888"
      ctx.font = "10px monospace"
      ctx.fillText("(-$58.75)", pnlBase.x, pnlBase.usdY)

      // Bottom labels and values
      ctx.fillStyle = "#888888"
      ctx.font = "11px monospace"
      ctx.fillText("Entry", entryBase.x, entryBase.labelY)
      ctx.fillText("Sold", soldBase.x, soldBase.labelY)
      ctx.fillText("Holding", holdingBase.x, holdingBase.labelY)

      ctx.fillStyle = "#ffffff"
      ctx.font = "14px monospace"
      ctx.fillText("$0.0256221", entryBase.x, entryBase.valueY)
      ctx.fillText("$0.00", soldBase.x, soldBase.valueY)
      ctx.fillText("$14.84", holdingBase.x, holdingBase.valueY)

      // Debug: Draw position markers
      ctx.fillStyle = "red"
      ctx.fillRect(entryBase.x - 2, entryBase.labelY - 2, 4, 4)
      ctx.fillRect(soldBase.x - 2, soldBase.labelY - 2, 4, 4)
      ctx.fillRect(holdingBase.x - 2, holdingBase.labelY - 2, 4, 4)
    }
    bgImg.src = "/logo/blast_card.png"
  }, [])

  return (
    <div className="min-h-screen bg-background p-8">
      <h1 className="text-2xl font-bold mb-8">PNL Card Preview (Canvas Direct)</h1>
      
      <div className="space-y-4">
        <canvas
          ref={canvasRef}
          className="border border-border rounded"
          style={{ imageRendering: "pixelated" }}
        />
        
        <div className="p-4 bg-muted rounded">
          <h3 className="font-bold mb-2">Debug Info:</h3>
          <p className="text-sm">Canvas size: 800x450</p>
          <p className="text-sm">Entry/Sold/Holding Y: 335 (label), 355 (value)</p>
          <p className="text-sm text-red-500">Red dots mark the text positions</p>
        </div>
      </div>
    </div>
  )
}