"use client"

import { useState, useEffect, useRef, Suspense } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Loader2, Copy, Download } from "lucide-react"
import toast from "react-hot-toast"
import { useApp } from "@/context/app.context"
import type { PoolWithMetadata } from "@/types/pool"

interface PnlData {
  totalPnl: number
  totalPnlPercentage: number
  entryPrice: number
  totalSold: number
  totalHolding: number
  hasPosition?: boolean
  realizedPnl?: number
  unrealizedPnl?: number
  totalBought?: number
  currentPrice?: number
  balance?: number
}

interface PnlCardProps {
  pool: PoolWithMetadata
}

export function PnlCard({ pool }: PnlCardProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [pnlData, setPnlData] = useState<PnlData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { address } = useApp()

  const fetchPnlData = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      // Use actual user address if connected, otherwise use test address
      // For now, using your actual address for testing
      const yourTestAddress = "0xd6eb850fdab4143fa973ab119a1b27d5db8744cb8ef7a88125fd33a6ab85b351"
      const fallbackAddress = "0x8506c3f396f0868299fe9fcf6ba1e2398cb7e6e0469158243903a66b876f21dc"
      const userAddress = address || yourTestAddress  // Will use connected wallet when available
      
      // Use coinType for the API call
      const coinType = pool.coinType || pool.innerState
      console.log("Fetching PNL for address:", userAddress, "coinType:", coinType, "pool data:", pool)
      
      const response = await fetch(`/api/nexa/pnl/${userAddress}/${encodeURIComponent(coinType)}`)
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to fetch PNL data")
      }
      
      const data = await response.json()
      
      // Even if no position, show the card with 0 values
      if (!data.hasPosition) {
        setPnlData({
          totalPnl: 0,
          totalPnlPercentage: 0,
          entryPrice: 0,
          totalSold: 0,
          totalHolding: 0,
          hasPosition: false
        })
        return
      }
      
      setPnlData({
        totalPnl: data.totalPnl || 0,
        totalPnlPercentage: data.totalPnlPercentage || 0,
        entryPrice: data.entryPrice || 0,
        totalSold: data.totalSold || 0,
        totalHolding: data.totalHolding || 0,
        hasPosition: data.hasPosition,
        realizedPnl: data.realizedPnl,
        unrealizedPnl: data.unrealizedPnl,
        totalBought: data.totalBought,
        currentPrice: data.currentPrice,
        balance: data.balance
      })
    } catch (err) {
      console.error("Error fetching PNL:", err)
      setError(err instanceof Error ? err.message : "Failed to load PNL data")
      setPnlData(null)
    } finally {
      setIsLoading(false)
    }
  }

  const drawPnlCard = () => {
    const canvas = canvasRef.current
    if (!canvas || !pnlData) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size for high resolution
    const scale = 2 // For retina displays
    const width = 1920
    const height = 1080
    
    canvas.width = width
    canvas.height = height
    canvas.style.width = `${width / scale / 2}px`
    canvas.style.height = `${height / scale / 2}px`

    // Black background
    ctx.fillStyle = "#000000"
    ctx.fillRect(0, 0, width, height)

    const drawTextContent = () => {
      const symbol = pool.coinMetadata?.symbol || pool.metadata?.symbol || "UNKNOWN"
      const name = pool.coinMetadata?.name || pool.metadata?.name || "Unknown Token"
      
      // Token symbol with $ prefix (big and white)
      ctx.fillStyle = "#ffffff"
      ctx.font = "bold 100px monospace"
      ctx.fillText(`$${symbol.toUpperCase()}`, 700, 320)
      
      // Token name (smaller, secondary color)
      ctx.fillStyle = "#888888"
      ctx.font = "60px monospace"
      ctx.fillText(name.toLowerCase(), 700, 420)
      
      // PNL Amount
      const isProfit = pnlData.totalPnl >= 0
      ctx.fillStyle = isProfit ? "#00ff88" : "#ff5555"
      ctx.font = "bold 130px monospace"
      const pnlSign = isProfit ? "+" : "-"
      ctx.fillText(`${pnlSign}$${Math.abs(pnlData.totalPnl).toFixed(2)}`, 700, 580)
      
      // PNL Percentage
      ctx.fillStyle = isProfit ? "#00ff88" : "#ff5555"
      ctx.font = "85px monospace"
      const percentageText = `(${pnlSign === '+' ? '' : '-'}${Math.abs(pnlData.totalPnlPercentage).toFixed(1)}%)`
      ctx.fillText(percentageText, 1250, 580)
      
      // Stats section at bottom
      const statsY = 820
      const statsSpacing = 450
      
      // Labels
      ctx.fillStyle = "#666666"
      ctx.font = "55px monospace"
      ctx.fillText("entry", 150, statsY)
      ctx.fillText("sold", 150 + statsSpacing, statsY)
      ctx.fillText("holding", 150 + statsSpacing * 2, statsY)
      
      // Values
      ctx.fillStyle = "#ffffff"
      ctx.font = "65px monospace"
      ctx.fillText(`$${pnlData.entryPrice.toFixed(6)}`, 150, statsY + 90)
      ctx.fillText(`$${pnlData.totalSold.toFixed(2)}`, 150 + statsSpacing, statsY + 90)
      ctx.fillText(`$${pnlData.totalHolding.toFixed(2)}`, 150 + statsSpacing * 2, statsY + 90)
      
      // Footer
      ctx.fillStyle = "#444444"
      ctx.font = "35px monospace"
      ctx.fillText("Traded on blast.fun", 150, height - 80)
    }

    // Draw text content first
    drawTextContent()

    // Then try to load and draw the icon
    const img = new Image()
    img.onload = () => {
      // Clear and redraw everything with the icon
      ctx.fillStyle = "#000000"
      ctx.fillRect(0, 0, width, height)
      
      // Draw icon on the left side
      const iconSize = 420
      const iconX = 120
      const iconY = 280
      
      ctx.imageSmoothingEnabled = false // For pixel art style
      ctx.drawImage(img, iconX, iconY, iconSize, iconSize)
      
      // Redraw text content
      drawTextContent()
    }
    
    img.onerror = () => {
      console.error("Failed to load blast icon")
    }
    
    img.src = "/logo/blast_card_icon.png"
  }

  useEffect(() => {
    if (isOpen && !pnlData) {
      fetchPnlData()
    }
  }, [isOpen])

  useEffect(() => {
    if (pnlData && canvasRef.current) {
      drawPnlCard()
    }
  }, [pnlData])

  const handleCopy = async () => {
    const canvas = canvasRef.current
    if (!canvas) return

    try {
      canvas.toBlob(async (blob) => {
        if (!blob) return
        
        const item = new ClipboardItem({ "image/png": blob })
        await navigator.clipboard.write([item])
        
        toast.success("PNL card copied to clipboard")
      })
    } catch (err) {
      console.error("Failed to copy:", err)
      toast.error("Failed to copy. Please try downloading instead")
    }
  }

  const handleDownload = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const link = document.createElement("a")
    link.download = `pnl-${pool.coinMetadata?.symbol || "token"}.png`
    link.href = canvas.toDataURL()
    link.click()
    
    toast.success("PNL card downloaded")
  }

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        variant="outline"
        className="w-full font-mono text-xs uppercase"
      >
        View PNL Card
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle className="font-mono uppercase">PNL Card</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col items-center space-y-4">
            {isLoading ? (
              <div className="flex items-center justify-center h-[200px]">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : error ? (
              <div className="text-center text-muted-foreground h-[200px] flex items-center justify-center">
                <div className="text-sm">{error}</div>
              </div>
            ) : (
              <>
                <canvas
                  ref={canvasRef}
                  className="border border-border rounded"
                  style={{ imageRendering: "pixelated" }}
                />
                
                <div className="flex gap-2 w-full">
                  <Button
                    onClick={handleCopy}
                    variant="outline"
                    className="flex-1"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                  <Button
                    onClick={handleDownload}
                    variant="outline"
                    className="flex-1"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}