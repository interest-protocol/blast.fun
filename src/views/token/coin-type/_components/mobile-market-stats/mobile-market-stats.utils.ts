// Format price display - show actual decimals instead of scientific notation
export const formatPrice = (price: number) => {
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