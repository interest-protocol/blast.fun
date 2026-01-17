"use client"

import { useState, useCallback } from "react"
import { suiClient } from "@/lib/sui-client"

export interface Launch {
  coinType: string
  poolObjectId: string
  creatorAddress: string
  twitterUsername: string
}

export interface TokenWithMetadata extends Launch {
  name?: string
  symbol?: string
  iconUrl?: string | null
  description?: string
}

export const useSearchCreator = () => {
  const [query, setQuery] = useState("")
  const [loading, setLoading] = useState(false)
  const [tokens, setTokens] = useState<TokenWithMetadata[]>([])
  const [searched, setSearched] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const search = useCallback(async (input: string) => {
    const trimmed = input.trim()
    if (!trimmed) return

    setLoading(true)
    setError(null)
    setSearched(true)

    try {
      const response = await fetch(`/api/search/creator?q=${encodeURIComponent(trimmed)}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to search")
      }

      const launches: Launch[] = data.launches || []

      // Fetch metadata
      const tokensWithMetadata = await Promise.all(
        launches.map(async (launch) => {
          try {
            const metadata = await suiClient.getCoinMetadata({ coinType: launch.coinType })
            return {
              ...launch,
              name: metadata?.name,
              symbol: metadata?.symbol,
              iconUrl: metadata?.iconUrl,
              description: metadata?.description,
            }
          } catch {
            return launch
          }
        })
      )

      setTokens(tokensWithMetadata)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error while searching")
      setTokens([])
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    query,
    setQuery,
    loading,
    tokens,
    searched,
    error,
    search,
  }
}
