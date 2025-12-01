export const PROGRAM_START = new Date("2025-09-05T00:00:00Z").getTime()
export const FIRST_CYCLE_END = new Date("2025-09-15T00:00:00Z").getTime()
export const TWO_WEEKS_MS = 14 * 24 * 60 * 60 * 1000

export const getCurrentCycle = (timestamp: number): number => {
  if (timestamp < FIRST_CYCLE_END) return 0
  return Math.floor((timestamp - FIRST_CYCLE_END) / TWO_WEEKS_MS) + 1
}

export const getAvailableCycles = (currentCycleNumber: number): number[] => Array.from({ length: currentCycleNumber + 1 }, (_, i) => i)

export const getCycleDateRange = (cycle: number): string => {
  let cycleStart: Date
  let cycleEnd: Date

  if (cycle === 0) {
    cycleStart = new Date("2025-09-01T00:00:00Z")
    cycleEnd = new Date("2025-09-14T23:59:59Z")
  } else {
    const start = FIRST_CYCLE_END + (cycle - 1) * TWO_WEEKS_MS
    cycleStart = new Date(start)
    cycleEnd = new Date(start + TWO_WEEKS_MS - 1)
  }

  const formatDate = (date: Date) => {
    const month = date.toLocaleString("en-US", { month: "short" })
    const day = date.getDate()
    return `${month} ${day}`
  }

  return `${formatDate(cycleStart)} - ${formatDate(cycleEnd)}`
}

export const exportToCSV = (
  data: Array<{ user: string; totalVolume: number; tradeCount: number }>,
  suinsNames: Record<string, string | null> | undefined,
  timeRange: string,
  cycleNumber?: number,
) => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, "0")
  const day = String(now.getDate()).padStart(2, "0")
  const hours = String(now.getHours()).padStart(2, "0")
  const minutes = String(now.getMinutes()).padStart(2, "0")
  const timestamp = `${year}${month}${day}_${hours}${minutes}`

  const rangeMap: Record<string, string> = {
    "24h": "24h",
    "7d": "7d",
    "14d": "cycle",
    all: "all",
  }

  const filename = `${timestamp}_${rangeMap[timeRange] || "export"}.csv`

  const headers = ["address", "suins", "volume", "trades"]
  const rows = data.map((entry) => {
    const suinsName = suinsNames?.[entry.user] || ""
    return [entry.user, suinsName, (entry.totalVolume || 0).toString(), (entry.tradeCount || 0).toString()]
  })

  const csvContent = [headers.join(","), ...rows.map((row) => row.map((cell) => `"${cell}"`).join(","))].join("\n")

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
  const link = document.createElement("a")
  const url = URL.createObjectURL(blob)
  link.setAttribute("href", url)
  link.setAttribute("download", filename)
  link.style.display = "none"
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export const copyToClipboard = (
  data: Array<{ user: string; totalVolume: number; tradeCount: number }>,
  suinsNames: Record<string, string | null> | undefined,
  onSuccess: () => void,
  onError: (error: Error) => void,
) => {
  const headers = ["address", "suins", "volume", "trades"]
  const rows = data.map((entry) => {
    const suinsName = suinsNames?.[entry.user] || ""
    return [entry.user, suinsName, (entry.totalVolume || 0).toString(), (entry.tradeCount || 0).toString()].join("\t")
  })

  const tsvContent = [headers.join("\t"), ...rows].join("\n")

  navigator.clipboard.writeText(tsvContent).then(onSuccess).catch(onError)
}
