import { useEffect, useState } from "react"

export interface TopHolder {
  rank: number
  user: string
  balance: number
  percentage: number
  isCreator: boolean
}

interface TopHoldersData {
  coinType: string
  creatorAddress: string
  holders: TopHolder[]
  totalHoldings: number
  timestamp: number
}

export function useTopHolders(coinType: string | undefined) {
  const [data, setData] = useState<TopHoldersData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!coinType) return

    let cancelled = false
    let intervalId: NodeJS.Timeout | null = null

    const fetchHolders = async () => {
      try {
        const response = await fetch(`/api/tokens/${coinType}/holders`)
        
        if (!response.ok) {
          throw new Error(`Failed to fetch: ${response.status}`)
        }

        const holdersData = await response.json()
        
        if (!cancelled) {
          setData(holdersData)
          setIsLoading(false)
          setError(null)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error('Failed to fetch holders'))
          setIsLoading(false)
        }
      }
    }

    // Initial fetch
    fetchHolders()

    // Set up polling every 3 seconds
    intervalId = setInterval(fetchHolders, 3000)

    return () => {
      cancelled = true
      if (intervalId) {
        clearInterval(intervalId)
      }
    }
  }, [coinType])

  return { data, isLoading, error }
}