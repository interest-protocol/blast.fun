export function parseFormattedNumber(str: string): number {
    // Handle banded values like "10K-25K", ">1M", "<100"
    let cleanStr = str
    
    if (cleanStr.includes('-')) {
        // For ranges, use the lower bound
        cleanStr = cleanStr.split('-')[0]
    } else if (cleanStr.startsWith('>') || cleanStr.startsWith('<')) {
        // For > or < indicators, extract the number
        cleanStr = cleanStr.substring(1)
    }

    cleanStr = cleanStr.replace(/,/g, '')
    const match = cleanStr.match(/^(\d+\.?\d*)([KMB])?$/i)
    if (!match) return 0

    const num = parseFloat(match[1])
    const suffix = match[2]?.toUpperCase()

    switch (suffix) {
        case 'K': return num * 1000
        case 'M': return num * 1000000
        case 'B': return num * 1000000000
        default: return num
    }
}

export function getTrustedFollowersColor(count: number): string {
    if (count >= 10000) return "6, 182, 212" 
    if (count >= 5000) return "234, 179, 8" 
    if (count >= 1000) return "168, 85, 247" 
    if (count >= 500) return "59, 130, 246" 
    if (count >= 100) return "34, 197, 94" 
    return "100, 116, 139"
}