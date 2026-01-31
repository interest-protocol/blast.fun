export const parseFormattedNumber = (str: string): number => {
  const cleanStr = str.replace(/,/g, '')
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

export const getColorRgb = (count: number): string => {
  if (count >= 10000) return "6, 182, 212" // cyan-500
  if (count >= 5000) return "234, 179, 8" // yellow-500
  if (count >= 1000) return "168, 85, 247" // purple-500
  if (count >= 500) return "59, 130, 246" // blue-500
  if (count >= 100) return "34, 197, 94" // green-500
  return "100, 116, 139" // slate-500
}