import { Redis } from "@upstash/redis"
import { env } from "@/env"

let redisClient: Redis | null = null

export function getRedisClient(): Redis | null {
	if (redisClient !== null) {
		return redisClient
	}

	if (!env.UPSTASH_REDIS_REST_URL || !env.UPSTASH_REDIS_REST_TOKEN) {
		console.warn("Redis credentials not configured, caching disabled")
		return null
	}

	try {
		redisClient = new Redis({
			url: env.UPSTASH_REDIS_REST_URL,
			token: env.UPSTASH_REDIS_REST_TOKEN,
		})

		return redisClient
	} catch (error) {
		console.error("Failed to initialize Redis client:", error)
		return null
	}
}

export const CACHE_TTL = {
	TOKEN_METADATA: 86400 * 30, // 30 days for metadata (it never changes)
	NSFW_CHECK: 86400 * 30, // 30 days
	POOL_DATA: 300, // 5 minutes for market data
	TWITTER_FOLLOWERS: 28800, // 8 hours for twitter follower data
} as const

export const CACHE_PREFIX = {
	TOKEN_METADATA: "token_meta:",
	NSFW_CHECK: "nsfw:",
	POOL_DATA: "pool_data:",
	TWITTER_FOLLOWERS: "twitter_followers:",
} as const