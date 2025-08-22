"use client"

import type { PoolWithMetadata } from "@/types/pool"
import { formatNumberWithSuffix } from "@/utils/format"

interface MobileMarketStatsProps {
	pool: PoolWithMetadata
}

export function MobileMarketStats({ pool }: MobileMarketStatsProps) {
	const marketData = pool.marketData
	
	// Calculate 24h price change
	const currentPrice = marketData?.coinPrice || 0
	const price24hAgo = marketData?.price1DayAgo || currentPrice
	const priceChange24h = price24hAgo > 0 ? ((currentPrice - price24hAgo) / price24hAgo) * 100 : 0
	
	// Format price display - show actual decimals instead of scientific notation
	const formatPrice = (price: number) => {
		if (price === 0) return "0.00"
		
		// For larger numbers, use standard formatting
		if (price >= 1) return price.toFixed(2)
		if (price >= 0.01) return price.toFixed(4)
		
		// For smaller numbers, determine how many decimal places needed
		// Convert to string to find first non-zero digit
		const priceStr = price.toString()
		
		// Check if it's in scientific notation (e.g., "2.05e-6")
		if (priceStr.includes('e-')) {
			// Parse the exponent to determine decimal places needed
			const parts = priceStr.split('e-')
			const exponent = Math.abs(parseInt(parts[1]))
			
			// Show enough decimals to display the significant digits
			const decimals = exponent + 2 // Show at least 2 significant digits after zeros
			
			// Format with the calculated decimal places
			let formatted = price.toFixed(Math.min(decimals, 12)) // Cap at 12 decimals
			
			// Remove trailing zeros after significant digits
			formatted = formatted.replace(/(\.\d*?[1-9]\d?)0+$/, '$1')
			
			return formatted
		}
		
		// For regular small numbers
		if (price >= 0.0001) return price.toFixed(6)
		if (price >= 0.000001) return price.toFixed(8)
		
		// Default: show up to 10 decimals and trim trailing zeros
		let formatted = price.toFixed(10)
		formatted = formatted.replace(/(\.\d*?[1-9]\d?)0+$/, '$1')
		return formatted
	}
	
	return (
		<div className="w-full flex border-b border-border justify-between items-center">
			<div className="w-full flex flex-col items-center justify-center py-2 border-r border-border">
				<p className="text-[10px] text-muted-foreground">Price</p>
				<div className="text-xs flex items-baseline">
					<span>$</span>
					{(() => {
						const formatted = formatPrice(currentPrice)
						// Check if price has leading zeros after decimal
						const match = formatted.match(/^0\.(0+)(.+)$/)
						if (match) {
							// match[1] is the leading zeros, match[2] is the significant part
							const zeros = match[1]
							const significant = match[2]
							const zeroCount = zeros.length
							
							return (
								<>
									<span>0.</span>
									<sub className="text-[8px] text-muted-foreground">{zeroCount}</sub>
									<span>{significant}</span>
								</>
							)
						}
						// Regular price display
						return <span>{formatted}</span>
					})()}
				</div>
			</div>
			<div className="w-full flex flex-col items-center justify-center py-2 border-r border-border">
				<p className="text-[10px] text-muted-foreground">24h</p>
				<p className={`text-xs ${priceChange24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
					{priceChange24h >= 0 ? '+' : ''}{priceChange24h.toFixed(2)}%
				</p>
			</div>
			<div className="w-full flex flex-col items-center justify-center py-2 border-r border-border">
				<p className="text-[10px] text-muted-foreground">Market Cap</p>
				<p className="text-xs text-yellow-500">
					${formatNumberWithSuffix(marketData?.marketCap || 0)}
				</p>
			</div>
			<div className="w-full flex flex-col items-center justify-center py-2">
				<p className="text-[10px] text-muted-foreground">24h Vol</p>
				<p className="text-xs text-purple-500">
					${formatNumberWithSuffix(marketData?.coin24hTradeVolumeUsd || 0)}
				</p>
			</div>
		</div>
	)
}