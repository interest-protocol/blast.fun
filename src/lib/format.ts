export function formatNumber(value: number): string {
	if (!isFinite(value) || value === 0) return "0"
	
	// For large numbers
	if (Math.abs(value) >= 1000000000) {
		return (value / 1000000000).toFixed(2) + "B"
	} else if (Math.abs(value) >= 1000000) {
		return (value / 1000000).toFixed(2) + "M"
	} else if (Math.abs(value) >= 1000) {
		return (value / 1000).toFixed(2) + "K"
	} else if (Math.abs(value) >= 1) {
		return value.toFixed(2)
	} else {
		// For small decimals, keep significant digits
		return value.toFixed(4)
	}
}

export function formatPrice(value: number): string {
	if (!isFinite(value) || value === 0) return "$0"
	
	// For very small prices (less than 0.01)
	if (value < 0.01) {
		const str = value.toExponential(20)
		const [mantissa, exponent] = str.split('e')
		const exp = parseInt(exponent)
		
		if (exp < -2) {
			// Count zeros after decimal point
			const zeros = Math.abs(exp + 1)
			// Get the significant digits
			const significantDigits = parseFloat(mantissa) * Math.pow(10, 4)
			const formatted = significantDigits.toFixed(0).padStart(4, '0')
			
			// Convert number to subscript
			const subscript = zeros.toString().split('').map(d => 
				String.fromCharCode(0x2080 + parseInt(d))
			).join('')
			
			return `$0.0${subscript}${formatted}`
		}
		return `$${value.toFixed(6)}`
	}
	
	// For normal prices
	if (value >= 1000000) {
		return `$${(value / 1000000).toFixed(2)}M`
	} else if (value >= 1000) {
		return `$${(value / 1000).toFixed(2)}K`
	} else {
		return `$${value.toFixed(2)}`
	}
}

export function formatTokenAmount(amount: string, decimals: number = 9): string {
	const value = parseFloat(amount) / Math.pow(10, decimals)
	
	if (!isFinite(value) || value === 0) return "0"
	
	// For large amounts
	if (value >= 1000000000) {
		return (value / 1000000000).toFixed(2) + "B"
	} else if (value >= 1000000) {
		return (value / 1000000).toFixed(2) + "M"
	} else if (value >= 1000) {
		return (value / 1000).toFixed(2) + "K"
	} else if (value >= 1) {
		return value.toFixed(2)
	} else {
		// For small amounts, show up to 4 decimal places
		return value.toFixed(4)
	}
}