import { createClient, RedisClientType } from "redis"
import { env } from "@/env"

let redisClient: RedisClientType | null = null
let isConnecting = false

export async function getRedisClient(): Promise<RedisClientType | null> {
	if (redisClient?.isReady) {
		return redisClient
	}

	if (!env.REDIS_URL) {
		console.warn("Redis URL not configured, caching disabled")
		return null
	}

	if (isConnecting) {
		while (isConnecting) {
			await new Promise(resolve => setTimeout(resolve, 10))
		}

		return redisClient
	}

	try {
		isConnecting = true

		redisClient = createClient({
			url: env.REDIS_URL,
			socket: {
				connectTimeout: 5000,
				reconnectStrategy: (retries) => {
					if (retries > 3) {
						console.error("Redis reconnection failed after 3 attempts")
						return false
					}
					return Math.min(retries * 100, 3000)
				}
			}
		})

		redisClient.on("error", (error) => {
			console.error("Redis client error:", error)
		})

		await redisClient.connect()

		return redisClient
	} catch (error) {
		console.error("Failed to initialize Redis client:", error)
		redisClient = null
		return null
	} finally {
		isConnecting = false
	}
}

export async function withRedis<T>(
	operation: (client: RedisClientType) => Promise<T>
): Promise<T | null> {
	const client = await getRedisClient()
	if (!client) {
		return null
	}

	try {
		return await operation(client)
	} catch (error) {
		console.error("Redis operation failed:", error)
		return null
	}
}

export async function redisGet(key: string): Promise<string | null> {
	return withRedis(async (client) => {
		return await client.get(key)
	})
}

export async function redisSet(
	key: string,
	value: string,
	ttl?: number
): Promise<boolean> {
	const result = await withRedis(async (client) => {
		if (ttl) {
			return await client.setEx(key, ttl, value)
		}

		return await client.set(key, value)
	})

	return result === "OK"
}

export async function redisSetEx(
	key: string,
	ttl: number,
	value: string
): Promise<boolean> {
	const result = await withRedis(async (client) => {
		return await client.setEx(key, ttl, value)
	})

	return result === "OK"
}

export async function redisDel(key: string): Promise<boolean> {
	const result = await withRedis(async (client) => {
		return await client.del(key)
	})

	return result === 1
}

export const CACHE_TTL = {
	COIN_METADATA: 43200, // 12 hours
	MARKET_DATA: 120, // 2 minutes
	NSFW_CHECK: 86400 * 30, // 30 days
	POOL_DATA: 300, // 5 minutes
	CREATOR_DATA: 14400, // 4 hours
	BONDING_PROGRESS: 30, // 30 seconds
} as const

export const CACHE_PREFIX = {
	COIN_METADATA: "coin_meta:",
	MARKET_DATA: "market_data:",
	NSFW_CHECK: "nsfw:",
	POOL_DATA: "pool_data:",
	CREATOR_DATA: "creator_data:",
	BONDING_PROGRESS: "bonding_progress:",
} as const