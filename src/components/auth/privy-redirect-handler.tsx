"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { usePrivyAuth } from "@/hooks/privy/use-privy-auth"
import { privyRedirect } from "@/utils/privy-redirect"

export function PrivyRedirectHandler() {
  const router = useRouter()
  const { isAuthenticated, isReady } = usePrivyAuth()
  
  useEffect(() => {
    // @dev: Only check for redirect after Privy is ready and user is authenticated
    if (isReady && isAuthenticated) {
      const redirect = privyRedirect.getAndClearRedirect()
      if (redirect) {
        // @dev: Small delay to ensure auth state is fully settled
        setTimeout(() => {
          router.push(redirect)
        }, 100)
      }
    }
  }, [isReady, isAuthenticated, router])
  
  // @dev: This component doesn't render anything
  return null
}