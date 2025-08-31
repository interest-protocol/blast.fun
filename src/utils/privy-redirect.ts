// @dev: Utility for handling Privy authentication redirects
// Since we're using Nexa's Privy App ID, we can only redirect to whitelisted URLs
// This utility saves the original page and redirects back after auth

const REDIRECT_KEY = "privy_auth_redirect"

export const privyRedirect = {
  // @dev: Save the current page URL before starting auth
  saveCurrentPage: () => {
    if (typeof window === "undefined") return
    
    const currentPath = window.location.pathname + window.location.search
    // Only save if not on homepage
    if (currentPath !== "/" && currentPath !== "") {
      localStorage.setItem(REDIRECT_KEY, currentPath)
    }
  },

  // @dev: Get and clear the saved redirect URL
  getAndClearRedirect: (): string | null => {
    if (typeof window === "undefined") return null
    
    const redirect = localStorage.getItem(REDIRECT_KEY)
    if (redirect) {
      localStorage.removeItem(REDIRECT_KEY)
    }
    return redirect
  },

  // @dev: Check if we have a pending redirect
  hasPendingRedirect: (): boolean => {
    if (typeof window === "undefined") return false
    return !!localStorage.getItem(REDIRECT_KEY)
  },

  // @dev: Clear any pending redirect (for cleanup)
  clearRedirect: () => {
    if (typeof window === "undefined") return
    localStorage.removeItem(REDIRECT_KEY)
  }
}