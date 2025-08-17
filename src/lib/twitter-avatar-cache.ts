/**
 * Simple in-memory cache for Twitter avatar URLs
 * This prevents redundant API calls during the same session
 */

interface CacheEntry {
  url: string
  timestamp: number
}

class TwitterAvatarCache {
  private cache = new Map<string, CacheEntry>()
  private readonly TTL = 60 * 60 * 1000 // 1 hour in milliseconds

  get(username: string): string | null {
    const entry = this.cache.get(username)
    
    if (!entry) return null
    
    // Check if cache entry is still valid
    if (Date.now() - entry.timestamp > this.TTL) {
      this.cache.delete(username)
      return null
    }
    
    return entry.url
  }

  set(username: string, url: string): void {
    this.cache.set(username, {
      url,
      timestamp: Date.now()
    })
  }

  clear(): void {
    this.cache.clear()
  }
}

// Singleton instance
export const avatarCache = new TwitterAvatarCache()