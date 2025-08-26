import { prisma } from "@/lib/prisma"
import { formatAmountWithSuffix } from "@/utils/format"
import { redisGet, redisSetEx, CACHE_TTL, CACHE_PREFIX } from "@/lib/redis/client"
import type { CreatorData } from "@/types/pool"

export async function fetchCreatorData(
	creatorAddressOrHandle: string,
	twitterHandle?: string | null
): Promise<CreatorData> {
	try {
		// determine if we need to find the creator address from twitter handle
		let creatorAddress = creatorAddressOrHandle
		let finalTwitterHandle = twitterHandle
		let hideIdentity = false

		// @dev: if twitterHandle is provided and matches creatorAddressOrHandle, 
		// we need to find the actual creator address
		if (twitterHandle && creatorAddressOrHandle === twitterHandle) {
			const tokenLaunch = await prisma.tokenLaunches.findFirst({
				where: { twitterUsername: twitterHandle },
				select: { 
					creatorAddress: true,
					hideIdentity: true 
				}
			})

			if (tokenLaunch) {
				creatorAddress = tokenLaunch.creatorAddress
				hideIdentity = tokenLaunch.hideIdentity
			}
		}

		const cacheKey = `${CACHE_PREFIX.CREATOR_DATA}${creatorAddress}`

		// First, get basic data we always need
		const tokenLaunches = await prisma.tokenLaunches.findMany({
			where: { creatorAddress },
			select: {
				twitterUserId: true,
				twitterUsername: true,
				creatorAddress: true,
				hideIdentity: true,
			},
		})

		const launchCount = tokenLaunches.length

		// check if any launch has hideIdentity set to true
		hideIdentity = tokenLaunches.some(launch => launch.hideIdentity)

		// get twitter handle if not hiding identity
		finalTwitterHandle = hideIdentity ? null : finalTwitterHandle
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
			// Fetch trusted followers from GiveRep
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

			// Use fxtwitter as the primary and only source for follower count
			try {
				const fxTwitterResponse = await fetch(
					`https://api.fxtwitter.com/${finalTwitterHandle}`
				)

				if (fxTwitterResponse.ok) {
					const fxTwitterData = await fxTwitterResponse.json()
					if (fxTwitterData && fxTwitterData.user) {
						followerCount = fxTwitterData.user.followers || 0
					}
				} else {
					console.error(`fxTwitter returned status ${fxTwitterResponse.status} for @${finalTwitterHandle}`)
				}
			} catch (error) {
				console.error(`Error fetching fxTwitter data for @${finalTwitterHandle}:`, error)
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