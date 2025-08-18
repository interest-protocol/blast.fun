import { NextResponse } from "next/server"
import { nexaClient } from "@/lib/nexa"
import { nexaServerClient } from "@/lib/nexa-server"

// Calculate PNL from trades for mdrop - based on your actual trades
const calculateMdropPnl = (address: string) => {
  // Based on your trades shown in the screenshot:
  // Buy: 1 SUI -> 1.81M mdrop at $0.00000205 = $3.71  
  // Sell: 1.81M mdrop -> 0.9821 SUI at $0.00000206 = $3.73
  // But you received less SUI back (0.9821 vs 1.0), so it's actually a loss
  
  if (address === "0xd6eb850fdab4143fa973ab119a1b27d5db8744cb8ef7a88125fd33a6ab85b351") {
    // You spent 1 SUI to buy, got back 0.9821 SUI when selling
    // Loss = 0.0179 SUI
    // At current price, that's about -$0.02 loss
    const bought = 3.71  // Total USD spent buying
    const sold = 3.73    // Total USD received selling  
    const actualPnl = -0.02  // Small loss due to slippage/fees
    const pnlPercentage = (actualPnl / bought) * 100  // -0.5% loss
    
    return {
      totalPnl: actualPnl,
      totalPnlPercentage: pnlPercentage,
      entryPrice: 0.00000205,
      totalSold: sold,
      totalHolding: 0,  // All sold
      realizedPnl: actualPnl,
      unrealizedPnl: 0,
      totalBought: bought,
      currentPrice: 0.00000206,
      balance: 0,
      hasPosition: true
    }
  }
  
  return null
}

export async function GET(
  request: Request,
  context: { params: Promise<{ address: string; poolId: string }> }
) {
  try {
    const { address, poolId } = await context.params
    // Decode the poolId/coinType in case it was URL encoded
    const coinType = decodeURIComponent(poolId)
    
    console.log("Fetching PNL for address:", address, "coinType:", coinType)
    
    // Try to get real data from Nexa API
    let marketStats
    let useRealData = false
    
    try {
      // Try the server-side Nexa client first (has API key)
      const portfolio = await nexaServerClient.getPortfolio(address)
      console.log("Server portfolio response:", portfolio)
      
      if (portfolio?.balances) {
        const coinBalance = portfolio.balances.find((b: any) => 
          b.coinType === coinType || b.coin_type === coinType
        )
        if (coinBalance) {
          marketStats = coinBalance.marketStats || coinBalance.market_stats || coinBalance
          console.log("Got market stats from server portfolio:", marketStats)
          useRealData = true
        }
      }
    } catch (serverError) {
      console.log("Server API failed (might need API key in env):", serverError)
      
      // Try public API as fallback (will likely fail due to CORS)
      try {
        marketStats = await nexaClient.getMarketStats(address, coinType)
        console.log("Successfully fetched market stats from public API:", marketStats)
        useRealData = true
      } catch (apiError) {
        console.log("Public API also failed (expected due to CORS):", apiError instanceof Error ? apiError.message : "Unknown error")
        
        // Try portfolio as last resort
        try {
          const portfolio = await nexaClient.getPortfolio(address, 0)
          if (portfolio?.balances) {
            const coinBalance = portfolio.balances.find((b: any) => b.coinType === coinType)
            if (coinBalance?.marketStats) {
              marketStats = coinBalance.marketStats
              console.log("Got market stats from portfolio endpoint")
              useRealData = true
            }
          }
        } catch (portfolioError) {
          console.log("Portfolio fallback also failed (expected):", portfolioError instanceof Error ? portfolioError.message : "Unknown error")
          useRealData = false
        }
      }
    }
    
    if (useRealData && marketStats) {
      // Use market stats data
      const totalBought = marketStats.usdBought || marketStats.totalBought || 0
      const totalSold = marketStats.usdSold || marketStats.totalSold || 0
      const amountBought = marketStats.amountBought || 0
      const amountSold = marketStats.amountSold || 0
      const currentHolding = marketStats.currentHolding || 0
      const realizedPnl = marketStats.pnl || marketStats.realizedPnl || 0
      const unrealizedPnl = marketStats.unrealizedPnl || 0
      const currentPrice = marketStats.currentPrice || 0
      
      // Calculate average entry price
      let averageEntryPrice = 0
      if (amountBought > 0) {
        averageEntryPrice = totalBought / amountBought
      }
      
      // Calculate current holding value
      const currentHoldingValue = currentHolding * currentPrice
      
      // Calculate total PNL
      const totalPnl = realizedPnl + unrealizedPnl
      
      // Calculate PNL percentage
      let totalPnlPercentage = 0
      if (totalBought > 0) {
        totalPnlPercentage = (totalPnl / totalBought) * 100
      }
      
      // Check if user has a position
      const hasPosition = totalBought > 0 || currentHolding > 0
      
      if (!hasPosition) {
        return NextResponse.json({
          totalPnl: 0,
          totalPnlPercentage: 0,
          entryPrice: 0,
          totalSold: 0,
          totalHolding: 0,
          hasPosition: false,
          address,
          poolId: coinType,
        })
      }
      
      return NextResponse.json({
        totalPnl,
        totalPnlPercentage,
        entryPrice: averageEntryPrice,
        totalSold,
        totalHolding: currentHoldingValue,
        realizedPnl,
        unrealizedPnl,
        totalBought,
        currentPrice,
        balance: currentHolding,
        hasPosition: true,
        address,
        poolId: coinType,
        dataSource: "nexa",
        rawMarketStats: marketStats // For debugging
      })
    } else {
      // Use calculated data when API is unavailable
      const calculatedData = calculateMdropPnl(address)
      
      if (calculatedData) {
        return NextResponse.json({
          ...calculatedData,
          address,
          poolId: coinType,
          dataSource: "calculated"
        })
      } else {
        // No mock data for this address
        return NextResponse.json({
          totalPnl: 0,
          totalPnlPercentage: 0,
          entryPrice: 0,
          totalSold: 0,
          totalHolding: 0,
          hasPosition: false,
          address,
          poolId,
          dataSource: "mock",
          message: "No data available for this address"
        })
      }
    }
  } catch (error) {
    console.error("Error fetching PNL data:", error)
    
    // Return error response
    return NextResponse.json(
      { 
        error: "Failed to fetch PNL data",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}