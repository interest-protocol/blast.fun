import { prisma } from "@/lib/prisma"
import { env } from "@/env"
import { formatAmountWithSuffix } from "@/utils/format"
import { redisGet, redisSetEx, CACHE_TTL, CACHE_PREFIX } from "@/lib/redis/client"
import type { CreatorData } from "@/types/pool"

export async function fetchCreatorData(
	creatorAddress: string,
	twitterHandle?: string | null,
	hideIdentity?: boolean
): Promise<CreatorData> {
	try {
		const cacheKey = `${CACHE_PREFIX.CREATOR_DATA}${creatorAddress}`
		
		// First, get basic data we always need
		const tokenLaunches = await prisma.tokenLaunches.findMany({
			where: { creatorAddress },
			select: {
				twitterUserId: true,
				twitterUsername: true,
				creatorAddress: true,
			},
		})

		const launchCount = tokenLaunches.length

		// get twitter handle if not provided and not hiding identity
		let finalTwitterHandle = hideIdentity ? null : twitterHandle
		if (!hideIdentity && !finalTwitterHandle && tokenLaunches.length > 0) {
			const launchWithTwitter = tokenLaunches.find(l => l.twitterUsername)
			if (launchWithTwitter) {
				finalTwitterHandle = launchWithTwitter.twitterUsername
			}
		}

		// Check cache only if we have a twitter handle (otherwise we can't fetch followers anyway)
		if (finalTwitterHandle) {
			const cachedData = await redisGet(cacheKey)
			if (cachedData) {
				try {
					const parsed = JSON.parse(cachedData)
					// Only use cache if followers is not "0"
					if (parsed.followers !== "0") {
						return parsed
					}
					// If followers is "0", continue to fetch fresh data
				} catch (error) {
					console.error("Failed to parse cached creator data:", error)
				}
			}
		}

		let trustedFollowerCount = 0
		let followerCount = 0

		// fetch Twitter followers data if we have a handle
		if (finalTwitterHandle) {
			try {
				const res = await fetch(
					`https://giverep.com/api/trust-count/user-count/${finalTwitterHandle}`
				)

				if (res.ok) {
					const giveRepData = await res.json()
					if (giveRepData.success && giveRepData.data) {
						trustedFollowerCount = giveRepData.data.trustedFollowerCount || 0
					}
				}
			} catch (error) {
				console.error("Error fetching GiveRep data:", error)
			}

			try {
				const twitterResponse = await fetch(
					`https://api.twitterapi.io/twitter/user/info?userName=${finalTwitterHandle}`,
					{
						headers: {
							"X-API-Key": env.TWITTER_API_IO_KEY,
						},
					}
				)

				if (twitterResponse.ok) {
					const twitterData = await twitterResponse.json()
					if (twitterData.status === "success" && twitterData.data) {
						followerCount = twitterData.data.followers || 0
					}
				}
			} catch (error) {
				console.error("Error fetching Twitter data:", error)
			}

			// Use fxtwitter as fallback when follower count is 0
			if (followerCount === 0) {
				try {
					const fxTwitterResponse = await fetch(
						`https://api.fxtwitter.com/${finalTwitterHandle}`
					)

					if (fxTwitterResponse.ok) {
						const fxTwitterData = await fxTwitterResponse.json()
						if (fxTwitterData && fxTwitterData.user && fxTwitterData.user.followers) {
							followerCount = fxTwitterData.user.followers || 0
						}
					}
				} catch (error) {
					console.error("Error fetching fxTwitter data:", error)
				}
			}
		}

		// format the follower counts
		const formatFollowerCount = (num: number): string => {
			return formatAmountWithSuffix(BigInt(num) * BigInt(10 ** 9))
		}

		// band values when identity is hidden
		const bandValue = (count: number, thresholds: number[]): string => {
			if (count === 0) return "0"

			for (let i = 0; i < thresholds.length; i++) {
				if (count < thresholds[i]) {
					if (i === 0) {
						return `<${formatFollowerCount(thresholds[i])}`
					}

					const prevThreshold = thresholds[i - 1]
					return `${formatFollowerCount(prevThreshold)}-${formatFollowerCount(thresholds[i])}`
				}
			}

			const lastThreshold = thresholds[thresholds.length - 1]
			return `>${formatFollowerCount(lastThreshold)}`
		}

		const trustedFollowerThresholds = [10, 50, 100, 250, 500, 1000, 5000, 10000, 25000]
		const followerThresholds = [100, 500, 1000, 5000, 10000, 25000, 50000, 100000, 500000, 1000000]

		const creatorData: CreatorData = {
			launchCount,
			trustedFollowers: hideIdentity
				? bandValue(trustedFollowerCount, trustedFollowerThresholds)
				: formatFollowerCount(trustedFollowerCount),
			followers: hideIdentity
				? bandValue(followerCount, followerThresholds)
				: formatFollowerCount(followerCount),
			twitterHandle: finalTwitterHandle
		}

		// Only cache if we have non-zero follower count
		// This ensures we don't cache failed API calls or users with genuinely 0 followers
		if (creatorData.followers !== "0") {
			await redisSetEx(
				cacheKey,
				CACHE_TTL.CREATOR_DATA,
				JSON.stringify(creatorData)
			)
		}

		return creatorData
	} catch (error) {
		console.error("Error fetching creator data:", error)
		return {
			launchCount: 0,
			trustedFollowers: "0",
			followers: "0",
			twitterHandle: null
		}
	}
}