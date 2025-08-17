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
      
      // Get decimals from coin metadata, default to 9 if not available
      const decimals = pool.coinMetadata?.decimals || pool.metadata?.decimals || 9
      
      // Calculate average entry price per token
      // amountBought is in smallest units, convert to actual tokens
      const tokensBought = stats.amountBought / Math.pow(10, decimals)
      const entryPrice = tokensBought > 0 ? stats.usdBought / tokensBought : 0
      
      // Get current market price from pool data
      const currentPrice = pool.marketData?.coinPrice || 0
      
      // Calculate current holding value
      // currentHolding is in smallest units, convert to actual tokens
      const holdingInTokens = Math.abs(stats.currentHolding) / Math.pow(10, decimals)
      const currentHoldingValue = holdingInTokens * currentPrice
      
      // Calculate PNL
      // Total PNL = Value from sold tokens + Current holding value - Total investment
      const totalPnl = stats.usdSold + currentHoldingValue - stats.usdBought
      
      // Calculate PNL percentage based on total investment
      const totalPnlPercentage = stats.usdBought > 0 ? (totalPnl / stats.usdBought) * 100 : 0
      
      console.log("PNL Calculation:", {
        stats,
        currentPrice,
        currentHoldingValue,
        totalPnl,
        totalPnlPercentage
      })
      
      setPnlData({
        totalPnl: totalPnl,
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

    // Set canvas size to fit dialog better (16:9 aspect ratio, smaller)
    const width = 800
    const height = 450
    
    canvas.width = width
    canvas.height = height
    canvas.style.width = `${width}px`
    canvas.style.height = `${height}px`

    // Load and draw background image
    const bgImg = new Image()
    bgImg.onload = () => {
      // Draw background image
      ctx.drawImage(bgImg, 0, 0, width, height)

      const drawTextContent = () => {
        const symbol = pool.coinMetadata?.symbol || pool.metadata?.symbol || "UNKNOWN"
        const name = pool.coinMetadata?.name || pool.metadata?.name || symbol
        
        // Master base position
        const masterBaseX = 600  // Master X position
        const masterBaseY = 150  // Master Y position
        
        // Individual base positions for each section (relative to master)
        const tokenBase = {
          x: masterBaseX + 45,  // Token/Name position (centered at right)
          y: masterBaseY - 40   // Higher up
        }
        
        const pnlPercentBase = {
          x: masterBaseX + 45,  // PNL percentage position
          y: masterBaseY + 15   // Below token name
        }
        
        const investedBase = {
          x: masterBaseX - 110,  // Invested position (left side)
          labelY: masterBaseY + 50,
          amountY: masterBaseY + 73,
          usdY: masterBaseY + 88
        }
        
        const pnlBase = {
          x: masterBaseX + 45,  // PNL position (right aligned with token)
          labelY: masterBaseY + 50,
          amountY: masterBaseY + 73,
          usdY: masterBaseY + 88
        }
        
        const entryBase = {
          x: masterBaseX - 120,  // Entry position
          labelY: masterBaseY + 185,  // Labels at Y=335
          valueY: masterBaseY + 205   // Values at Y=355
        }
        
        const soldBase = {
          x: masterBaseX - 5,  // Sold position
          labelY: masterBaseY + 185,  // Labels at Y=335
          valueY: masterBaseY + 205   // Values at Y=355
        }
        
        const holdingBase = {
          x: masterBaseX + 85,  // Holding position
          labelY: masterBaseY + 185,  // Labels at Y=335
          valueY: masterBaseY + 205   // Values at Y=355
        }
        
        // Token ticker (large, at top)
        ctx.fillStyle = "#ffffff"
        ctx.font = "bold 32px monospace"
        ctx.textAlign = "center"
        ctx.fillText(`$${symbol.toUpperCase()}`, tokenBase.x, tokenBase.y)
        
        // Token full name (smaller, below ticker)
        ctx.fillStyle = "#888888"
        ctx.font = "14px monospace"
        ctx.textAlign = "center"
        const displayName = name.length > 25 ? name.substring(0, 22) + "..." : name
        ctx.fillText(displayName, tokenBase.x, tokenBase.y + 22)
        
        // PNL Percentage (below token pair)
        const isProfit = pnlData.totalPnl >= 0
        ctx.fillStyle = isProfit ? "#00ff88" : "#ff5555"
        ctx.font = "bold 36px monospace"
        const pnlSign = isProfit ? "+" : ""
        ctx.fillText(`${pnlSign}${pnlData.totalPnlPercentage.toFixed(2)}%`, pnlPercentBase.x, pnlPercentBase.y)
        
        // Labels for Invested and PNL (bigger, gray)
        ctx.fillStyle = "#888888"
        ctx.font = "16px monospace"
        ctx.textAlign = "center"
        ctx.fillText("Invested", investedBase.x, investedBase.labelY)
        ctx.fillText("PNL", pnlBase.x, pnlBase.labelY)
        
        // Invested amount with SUI icon
        ctx.fillStyle = "#00aaff"
        ctx.font = "24px monospace"
        const investedSui = (pnlData.totalBought || 0) / (pool.marketData?.suiPrice || 1)
        ctx.fillText(`💧${investedSui.toFixed(2)}`, investedBase.x, investedBase.amountY)
        ctx.fillStyle = "#888888"
        ctx.font = "14px monospace"
        ctx.fillText(`($${(pnlData.totalBought || 0).toFixed(2)})`, investedBase.x, investedBase.usdY)
        
        // PNL amount with SUI icon
        ctx.fillStyle = isProfit ? "#00ff88" : "#ff5555"
        ctx.font = "24px monospace"
        const pnlInSui = pnlData.totalPnl / (pool.marketData?.suiPrice || 1)
        ctx.fillText(`💧${pnlInSui.toFixed(2)}`, pnlBase.x, pnlBase.amountY)
        ctx.fillStyle = "#888888"
        ctx.font = "14px monospace"
        ctx.fillText(`($${pnlData.totalPnl.toFixed(2)})`, pnlBase.x, pnlBase.usdY)
        
        // Reset alignment
        ctx.textAlign = "left"
        
        // Labels for Entry, Sold, Holding
        ctx.fillStyle = "#888888"
        ctx.font = "16px monospace"
        ctx.textAlign = "center"
        ctx.fillText("Entry", entryBase.x, entryBase.labelY)
        ctx.fillText("Sold", soldBase.x, soldBase.labelY)
        ctx.fillText("Holding", holdingBase.x, holdingBase.labelY)
        
        // Values positioned to align with the background template
        ctx.fillStyle = "#ffffff"
        ctx.font = "18px monospace"
        ctx.textAlign = "center"
        
        // Format entry price with subscript for small values
        const formatEntryPrice = () => {
          if (pnlData.entryPrice === 0) {
            return "$0.00"
          } else if (pnlData.entryPrice < 0.01) {
            // Count leading zeros after decimal
            const str = pnlData.entryPrice.toFixed(20)
            const match = str.match(/^0\.0*/)
            if (match) {
              const zeros = match[0].length - 2 // Subtract "0."
              const significantDigits = pnlData.entryPrice.toFixed(20).replace(/^0\.0*/, '').substring(0, 2)
              return `$0.0{${zeros}}${significantDigits}`
            }
          }
          return `$${pnlData.entryPrice.toFixed(6)}`
        }
        
        const entryPriceText = formatEntryPrice()
        
        // Handle subscript notation for entry price
        if (entryPriceText.includes('{')) {
          const parts = entryPriceText.split('{')
          const beforeSubscript = parts[0] // "$0.0"
          const afterParts = parts[1].split('}')
          const subscriptNum = afterParts[0] // number of zeros
          const afterSubscript = afterParts[1] // significant digits
          
          // Calculate total width for centering
          ctx.font = "18px monospace"
          const beforeWidth = ctx.measureText(beforeSubscript).width
          ctx.font = "16px monospace"
          const subscriptWidth = ctx.measureText(subscriptNum).width
          ctx.font = "18px monospace"
          const afterWidth = ctx.measureText(afterSubscript).width
          const totalWidth = beforeWidth + subscriptWidth + afterWidth
          
          // Start position for centered text
          const startX = entryBase.x - totalWidth / 2
          
          // Draw "$0.0"
          ctx.textAlign = "left"
          ctx.font = "18px monospace"
          ctx.fillText(beforeSubscript, startX, entryBase.valueY)
          
          // Draw subscript number
          ctx.font = "16px monospace"
          ctx.fillStyle = "#ffffff"
          ctx.fillText(subscriptNum, startX + beforeWidth, entryBase.valueY + 3)
          
          // Draw significant digits
          ctx.font = "18px monospace"
          ctx.fillStyle = "#ffffff"
          ctx.fillText(afterSubscript, startX + beforeWidth + subscriptWidth, entryBase.valueY)
          
          ctx.textAlign = "center"
        } else {
          ctx.fillText(entryPriceText, entryBase.x, entryBase.valueY)
        }
        
        ctx.font = "18px monospace"
        ctx.fillStyle = "#ffffff"
        ctx.fillText(`$${pnlData.totalSold.toFixed(2)}`, soldBase.x, soldBase.valueY)
        ctx.fillText(`$${pnlData.totalHolding.toFixed(2)}`, holdingBase.x, holdingBase.valueY)
      }

      // Draw text content
      drawTextContent()
    }
    
    bgImg.onerror = () => {
      console.error("Failed to load background image")
      // Fallback to black background
      ctx.fillStyle = "#000000"
      ctx.fillRect(0, 0, width, height)
    }
    
    bgImg.src = "/logo/blast_card.png"
  }

  useEffect(() => {
    if (isOpen) {
      // Always fetch fresh data when opening
      fetchPnlData()
    }
  }, [isOpen])

  useEffect(() => {
    if (pnlData && canvasRef.current && isOpen) {
      // Add a small delay to ensure canvas is mounted
      setTimeout(() => {
        drawPnlCard()
      }, 100)
    }
  }, [pnlData, isOpen])

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
        <DialogContent className="sm:max-w-[850px] p-4">
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