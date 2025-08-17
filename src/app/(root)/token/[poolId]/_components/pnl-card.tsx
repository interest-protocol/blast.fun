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
import { nexaClient, type MarketStats } from "@/lib/nexa"

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
      const yourTestAddress = "0xd6eb850fdab4143fa973ab119a1b27d5db8744cb8ef7a88125fd33a6ab85b351"
      const userAddress = address || yourTestAddress
      
      // Use coinType for the API call
      const coinType = pool.coinType || pool.innerState
      console.log("Fetching PNL for address:", userAddress, "coinType:", coinType)
      
      if (!coinType) {
        throw new Error("Missing coinType for PNL calculation")
      }
      
      // Use the real Nexa API
      const stats = await nexaClient.getMarketStats(userAddress, coinType)
      
      // If no stats returned or no trades, show zero values
      if (!stats || (stats.buyTrades === 0 && stats.sellTrades === 0)) {
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
      
      // Calculate entry price (average buy price)
      const entryPrice = stats.buyTrades > 0 ? stats.usdBought / stats.amountBought : 0
      
      // Calculate PNL percentage
      const totalPnlPercentage = stats.usdBought > 0 ? (stats.pnl / stats.usdBought) * 100 : 0
      
      // Get current market price from pool data
      const currentPrice = pool.marketData?.coinPrice || 0
      
      // Calculate current holding value in USD
      const currentHoldingValue = Math.abs(stats.currentHolding) * currentPrice / 1e9 // Assuming 9 decimals
      
      setPnlData({
        totalPnl: stats.pnl,
        totalPnlPercentage: totalPnlPercentage,
        entryPrice: entryPrice,
        totalSold: stats.usdSold,
        totalHolding: currentHoldingValue,
        hasPosition: true,
        totalBought: stats.usdBought,
        currentPrice: currentPrice,
        balance: stats.currentHolding
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
      
      // Format entry price with subscript for small values
      const formatEntryPrice = () => {
        if (pnlData.entryPrice === 0) {
          return "$0.00"
        } else if (pnlData.entryPrice < 0.0001) {
          // Count leading zeros after decimal
          const str = pnlData.entryPrice.toFixed(20)
          const match = str.match(/^0\.0*/)
          if (match) {
            const zeros = match[0].length - 2 // Subtract "0."
            const significantDigits = pnlData.entryPrice.toFixed(20).replace(/^0\.0*/, '').substring(0, 4)
            return `$0.0{${zeros}}${significantDigits}`
          }
        }
        return `$${pnlData.entryPrice.toFixed(6)}`
      }
      
      const entryPriceText = formatEntryPrice()
      
      // Handle subscript notation for entry price
      if (entryPriceText.includes('{')) {
        const parts = entryPriceText.split('{')
        const beforeSubscript = parts[0]
        const afterParts = parts[1].split('}')
        const subscriptNum = afterParts[0]
        const afterSubscript = afterParts[1]
        
        // Draw main part
        ctx.fillText(beforeSubscript, 150, statsY + 90)
        
        // Measure width of main part
        const mainWidth = ctx.measureText(beforeSubscript).width
        
        // Draw subscript (smaller font)
        ctx.font = "40px monospace"
        ctx.fillText(subscriptNum, 150 + mainWidth, statsY + 100)
        
        // Measure subscript width
        const subscriptWidth = ctx.measureText(subscriptNum).width
        
        // Draw remaining digits (back to normal font)
        ctx.font = "65px monospace"
        ctx.fillText(afterSubscript, 150 + mainWidth + subscriptWidth, statsY + 90)
      } else {
        ctx.fillText(entryPriceText, 150, statsY + 90)
      }
      
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