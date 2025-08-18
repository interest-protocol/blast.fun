import { useEffect, useState } from "react"

interface BondingProgressData {
  coinType: string
  progress: number
  totalBought: number
  totalSold: number
  netAmount: number
  targetAmount: number
  migrated: boolean
  migrationPending: boolean
  timestamp: number
}

export function useBondingProgress(coinType: string | undefined) {
  const [data, setData] = useState<BondingProgressData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!coinType) return

    let cancelled = false
    let intervalId: NodeJS.Timeout | null = null

    const fetchProgress = async () => {
      try {
        const response = await fetch(`/api/tokens/${coinType}/bonding-progress`)
        
        if (!response.ok) {
          throw new Error(`Failed to fetch: ${response.status}`)
        }

        const progressData = await response.json()
        
        if (!cancelled) {
          setData(progressData)
          setIsLoading(false)
          setError(null)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error('Failed to fetch bonding progress'))
          setIsLoading(false)
        }
      }
    }

    // Initial fetch
    fetchProgress()

    // Set up polling every 3 seconds
    intervalId = setInterval(fetchProgress, 3000)

    return () => {
      cancelled = true
      if (intervalId) {
        clearInterval(intervalId)
      }
    }
  }, [coinType])

  return { data, isLoading, error }
}