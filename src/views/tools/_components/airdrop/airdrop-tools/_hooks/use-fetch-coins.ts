import { useEffect, useState } from "react"
import toast from "react-hot-toast"

import { WalletCoin } from "@/types/blockvision"

export const useFetchCoins = (address?: string) =>{
  const [coins, setCoins] = useState<WalletCoin[]>([])
  const [loading, setLoading] = useState<boolean>(false)

  useEffect(() => {
    if (!address) {
      setCoins([])
      return
    }

    let mounted = true
    const fetchCoins = async () => {
      setLoading(true)
      try {
        const res = await fetch("/api/wallet/coins", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ address }),
        })

        if (!res.ok) throw new Error("Failed to fetch coins")
        const data = await res.json()

        if (!mounted) return
        if (data?.success && Array.isArray(data.coins)) {
          setCoins(data.coins)
        } else {
          setCoins([])
        }
      } catch (err) {
        console.error("useFetchCoins error:", err)
        toast.error("Failed to load wallet coins")
        setCoins([])
      } finally {
        if (mounted) setLoading(false)
      }
    }

    fetchCoins()
    return () => {
      mounted = false
    }
  }, [address])

  return { coins, loading, setCoins }
}
