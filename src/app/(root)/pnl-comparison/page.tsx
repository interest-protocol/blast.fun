"use client"

import { useEffect, useRef } from "react"

export default function PnlComparisonPage() {
  const exampleCanvasRef = useRef<HTMLCanvasElement>(null)
  const currentCanvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    // Draw example card (matching the reference)
    const drawExample = () => {
      const canvas = exampleCanvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext("2d")
      if (!ctx) return

      canvas.width = 800
      canvas.height = 450

      // Load background
      const bgImg = new Image()
      bgImg.onload = () => {
        ctx.drawImage(bgImg, 0, 0, 800, 450)

        // Draw text matching example positions
        // Token pair
        ctx.fillStyle = "#ffffff"
        ctx.font = "bold 32px monospace"
        ctx.textAlign = "center"
        ctx.fillText("$ZAZA/SUI", 495, 75)

        // PNL percentage
        ctx.fillStyle = "#00ff88"
        ctx.font = "bold 36px monospace"
        ctx.fillText("+24.60%", 495, 115)

        // Labels
        ctx.fillStyle = "#888888"
        ctx.font = "11px monospace"
        ctx.fillText("Invested", 370, 145)
        ctx.fillText("PNL", 500, 145)

        // Invested amount
        ctx.fillStyle = "#00aaff"
        ctx.font = "18px monospace"
        ctx.fillText("💧50.00", 370, 168)
        ctx.fillStyle = "#888888"
        ctx.font = "10px monospace"
        ctx.fillText("($194.88)", 370, 183)

        // PNL amount
        ctx.fillStyle = "#00ff88"
        ctx.font = "18px monospace"
        ctx.fillText("💧8.32", 500, 168)
        ctx.fillStyle = "#888888"
        ctx.font = "10px monospace"
        ctx.fillText("($24.88)", 500, 183)

        // Bottom labels
        ctx.fillStyle = "#888888"
        ctx.font = "11px monospace"
        ctx.fillText("Entry", 340, 210)
        ctx.fillText("Sold", 460, 210)
        ctx.fillText("Holding", 550, 210)

        // Bottom values
        ctx.fillStyle = "#ffffff"
        ctx.font = "14px monospace"
        ctx.fillText("$0.0000345", 340, 230)
        ctx.fillText("$0.00", 460, 230)
        ctx.fillText("$219.28", 550, 230)
      }
      bgImg.src = "/logo/blast_card.png"
    }

    // Draw current implementation
    const drawCurrent = () => {
      const canvas = currentCanvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext("2d")
      if (!ctx) return

      canvas.width = 800
      canvas.height = 450

      const bgImg = new Image()
      bgImg.onload = () => {
        ctx.drawImage(bgImg, 0, 0, 800, 450)

        // Current positioning from our component (updated)
        ctx.fillStyle = "#ffffff"
        ctx.font = "bold 32px monospace"
        ctx.textAlign = "center"
        ctx.fillText("$CPI/SUI", 495, 75)

        ctx.fillStyle = "#ff5555"
        ctx.font = "bold 36px monospace"
        ctx.fillText("-63.41%", 495, 115)

        ctx.fillStyle = "#888888"
        ctx.font = "11px monospace"
        ctx.fillText("Invested", 370, 145)
        ctx.fillText("PNL", 500, 145)

        ctx.fillStyle = "#00aaff"
        ctx.font = "18px monospace"
        ctx.fillText("💧19.02", 370, 168)
        ctx.fillStyle = "#888888"
        ctx.font = "10px monospace"
        ctx.fillText("($73.40)", 370, 183)

        ctx.fillStyle = "#ff5555"
        ctx.font = "18px monospace"
        ctx.fillText("💧-12.06", 500, 168)
        ctx.fillStyle = "#888888"
        ctx.font = "10px monospace"
        ctx.fillText("(-$46.34)", 500, 183)

        ctx.fillStyle = "#888888"
        ctx.font = "11px monospace"
        ctx.fillText("Entry", 340, 210)
        ctx.fillText("Sold", 460, 210)
        ctx.fillText("Holding", 550, 210)

        ctx.fillStyle = "#ffffff"
        ctx.font = "14px monospace"
        ctx.fillText("$0.0256221", 340, 230)
        ctx.fillText("$0.00", 460, 230)
        ctx.fillText("$26.86", 550, 230)
      }
      bgImg.src = "/logo/blast_card.png"
    }

    drawExample()
    drawCurrent()
  }, [])

  return (
    <div className="min-h-screen bg-background p-8">
      <h1 className="text-2xl font-bold mb-8">PNL Card Position Comparison</h1>
      
      <div className="grid grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl mb-4">Example (Target)</h2>
          <canvas ref={exampleCanvasRef} className="border" />
          <div className="mt-4 text-sm space-y-1">
            <p>Token: x=495, y=75</p>
            <p>PNL%: x=495, y=115</p>
            <p>Invested: x=370, y=145/168</p>
            <p>PNL: x=500, y=145/168</p>
            <p>Entry: x=340, y=210/230</p>
            <p>Sold: x=460, y=210/230</p>
            <p>Holding: x=550, y=210/230</p>
          </div>
        </div>
        
        <div>
          <h2 className="text-xl mb-4">Current Implementation</h2>
          <canvas ref={currentCanvasRef} className="border" />
          <div className="mt-4 text-sm space-y-1">
            <p>Token: x=495, y=75</p>
            <p>PNL%: x=495, y=115</p>
            <p>Invested: x=370, y=145/168</p>
            <p>PNL: x=500, y=145/168</p>
            <p>Entry: x=340, y=210/230</p>
            <p>Sold: x=460, y=210/230</p>
            <p>Holding: x=550, y=210/230</p>
          </div>
        </div>
      </div>

      <div className="mt-8 p-4 bg-muted rounded">
        <h3 className="font-bold mb-2">Position Status:</h3>
        <ul className="text-sm space-y-1">
          <li>✅ Token pair: Aligned at x=495</li>
          <li>✅ PNL%: Aligned at y=115</li>
          <li>✅ Invested: Aligned at x=370</li>
          <li>✅ PNL: Aligned at x=500</li>
          <li>✅ Entry: Aligned at x=340</li>
          <li>✅ Sold: Aligned at x=460</li>
          <li>✅ Holding: Aligned at x=550</li>
        </ul>
      </div>
    </div>
  )
}