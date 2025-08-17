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
        const iconUrl = pool.coinMetadata?.iconUrl || pool.metadata?.iconUrl || pool.iconUrl
        
        // Format large numbers with K/M
        const formatNumber = (num: number) => {
          if (num >= 1000000) {
            return `$${(num / 1000000).toFixed(2)}M`
          } else if (num >= 1000) {
            return `$${(num / 1000).toFixed(2)}K`
          }
          return `$${num.toFixed(2)}`
        }
        
        // Simple centered layout
        const centerX = 570  // Base center position
        
        // Individual X positions for fine-tuning
        const tokenX = centerX + 50      // Ticker X position (can adjust independently)
        const tokenY = 140
        
        const pnlPercentX = centerX + 50  // PNL percentage X position (can adjust independently)
        const pnlPercentY = 200
        
        const iconSize = 120  // Bigger icon
        const iconX = centerX - 200  // Position icon to the left of ticker
        const iconY = 80  // Vertically centered with ticker
        
        const labelsY = 280
        const valuesY = 310
        
        const entryX = 360
        const soldX = 500
        const holdingX = 640
        
        // Draw token icon if available
        if (iconUrl) {
          const tokenImg = new Image()
          tokenImg.crossOrigin = "anonymous"
          tokenImg.onload = () => {
            // Draw circular clipping mask
            ctx.save()
            ctx.beginPath()
            ctx.arc(iconX + iconSize/2, iconY + iconSize/2, iconSize/2, 0, Math.PI * 2)
            ctx.closePath()
            ctx.clip()
            
            // Draw the icon
            ctx.drawImage(tokenImg, iconX, iconY, iconSize, iconSize)
            ctx.restore()
          }
          tokenImg.onerror = () => {
            // If icon fails to load, draw a placeholder circle
            ctx.fillStyle = "#2a4e7c"
            ctx.beginPath()
            ctx.arc(iconX + iconSize/2, iconY + iconSize/2, iconSize/2, 0, Math.PI * 2)
            ctx.fill()
          }
          tokenImg.src = iconUrl
        } else {
          // Draw placeholder circle if no icon URL
          ctx.fillStyle = "#2a4e7c"
          ctx.beginPath()
          ctx.arc(iconX + iconSize/2, iconY + iconSize/2, iconSize/2, 0, Math.PI * 2)
          ctx.fill()
        }
        
        // Token ticker (large, centered at top)
        ctx.fillStyle = "#ffffff"
        ctx.font = "bold 48px monospace"
        ctx.textAlign = "center"
        ctx.fillText(`$${symbol.toUpperCase()}`, tokenX, tokenY)
        
        // PNL Percentage (large, centered)
        const isProfit = pnlData.totalPnl >= 0
        ctx.fillStyle = isProfit ? "#00ff88" : "#ff5555"
        ctx.font = "bold 56px monospace"
        ctx.textAlign = "center"
        const pnlSign = isProfit ? "+" : ""
        ctx.fillText(`${pnlSign}${pnlData.totalPnlPercentage.toFixed(2)}%`, pnlPercentX, pnlPercentY)
        
        // Bottom section - Entry, Sold, Holding
        ctx.fillStyle = "#888888"
        ctx.font = "20px monospace"
        ctx.textAlign = "center"
        ctx.fillText("Entry", entryX, labelsY)
        ctx.fillText("Sold", soldX, labelsY)
        ctx.fillText("Holding", holdingX, labelsY)
        
        // Values for Entry, Sold, Holding
        ctx.fillStyle = "#ffffff"
        ctx.font = "24px monospace"
        ctx.textAlign = "center"
        
        // Format and draw entry price with custom subscript
        const drawEntryPrice = () => {
          if (pnlData.entryPrice === 0) {
            ctx.fillText("$0.00", entryX, valuesY)
          } else if (pnlData.entryPrice < 0.01) {
            // Count leading zeros after decimal
            const str = pnlData.entryPrice.toFixed(20)
            const match = str.match(/^0\.0*/)
            if (match) {
              const zeros = match[0].length - 2 // Subtract "0."
              const significantDigits = pnlData.entryPrice.toFixed(20).replace(/^0\.0*/, '').substring(0, 2)
              
              // Draw "$0.0" part
              ctx.font = "24px monospace"
              const beforeText = "$0.0"
              const beforeWidth = ctx.measureText(beforeText).width
              const subscriptText = zeros.toString()
              const afterText = significantDigits
              
              // Calculate total width for centering
              ctx.font = "24px monospace"
              const totalTextWidth = ctx.measureText(beforeText).width
              ctx.font = "14px monospace"
              const subscriptWidth = ctx.measureText(subscriptText).width
              ctx.font = "24px monospace"
              const afterWidth = ctx.measureText(afterText).width
              const totalWidth = totalTextWidth + subscriptWidth + afterWidth
              
              // Start position for centered text
              const startX = entryX - totalWidth / 2
              
              // Draw main text
              ctx.textAlign = "left"
              ctx.font = "24px monospace"
              ctx.fillStyle = "#ffffff"
              ctx.fillText(beforeText, startX, valuesY)
              
              // Draw subscript (smaller and lower)
              ctx.font = "14px monospace"
              ctx.fillStyle = "#ffffff"
              ctx.fillText(subscriptText, startX + beforeWidth, valuesY + 8)  // +8 pixels lower
              
              // Draw significant digits
              ctx.font = "24px monospace"
              ctx.fillText(afterText, startX + beforeWidth + subscriptWidth, valuesY)
              
              ctx.textAlign = "center"
            } else {
              ctx.fillText(`$${pnlData.entryPrice.toFixed(2)}`, entryX, valuesY)
            }
          } else {
            ctx.fillText(`$${pnlData.entryPrice.toFixed(2)}`, entryX, valuesY)
          }
        }
        
        // Draw entry price with custom subscript
        drawEntryPrice()
        
        // Sold amount with K/M formatting
        ctx.fillText(formatNumber(pnlData.totalSold), soldX, valuesY)
        
        // Holding amount with K/M formatting
        ctx.fillText(formatNumber(pnlData.totalHolding), holdingX, valuesY)
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

  // Calculate stats for button display
  const [buttonStats, setButtonStats] = useState<{
    bought: number
    sold: number
    holding: number
    pnl: number
  } | null>(null)

  useEffect(() => {
    const fetchButtonStats = async () => {
      try {
        const yourTestAddress = "0xd6eb850fdab4143fa973ab119a1b27d5db8744cb8ef7a88125fd33a6ab85b351"
        const userAddress = address || yourTestAddress
        const coinType = pool.coinType || pool.innerState
        
        if (!coinType) return
        
        const stats = await nexaClient.getMarketStats(userAddress, coinType)
        if (!stats) return
        
        const decimals = pool.coinMetadata?.decimals || pool.metadata?.decimals || 9
        const suiPrice = pool.marketData?.suiPrice || 3.8
        
        // Convert to SUI amounts
        const boughtInSui = stats.usdBought / suiPrice
        const soldInSui = stats.usdSold / suiPrice
        const holdingInSui = (Math.abs(stats.currentHolding) / Math.pow(10, decimals)) * (pool.marketData?.coinPrice || 0) / suiPrice
        const pnlInSui = (stats.usdSold + holdingInSui * suiPrice - stats.usdBought) / suiPrice
        
        setButtonStats({
          bought: boughtInSui,
          sold: soldInSui,
          holding: holdingInSui,
          pnl: pnlInSui
        })
      } catch (err) {
        console.error("Error fetching button stats:", err)
      }
    }
    
    fetchButtonStats()
  }, [address, pool])

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        variant="outline"
        className="w-full p-2"
      >
        <div className="grid grid-cols-4 gap-2 w-full text-center">
          <div>
            <div className="text-[10px] text-muted-foreground">Bought</div>
            <div className="text-xs font-mono">
              {buttonStats ? buttonStats.bought.toFixed(2) : "0.00"}
            </div>
          </div>
          <div>
            <div className="text-[10px] text-muted-foreground">Sold</div>
            <div className="text-xs font-mono text-red-500">
              {buttonStats ? buttonStats.sold.toFixed(2) : "0.00"}
            </div>
          </div>
          <div>
            <div className="text-[10px] text-muted-foreground">Holding</div>
            <div className="text-xs font-mono">
              {buttonStats ? buttonStats.holding.toFixed(2) : "0.00"}
            </div>
          </div>
          <div>
            <div className="text-[10px] text-muted-foreground">PnL</div>
            <div className={`text-xs font-mono ${buttonStats && buttonStats.pnl >= 0 ? "text-green-500" : "text-red-500"}`}>
              {buttonStats ? `${buttonStats.pnl >= 0 ? "+" : ""}${buttonStats.pnl.toFixed(2)}` : "+0.00"}
            </div>
          </div>
        </div>
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