import { prisma } from "@/lib/prisma"
import { formatAmountWithSuffix } from "@/utils/format"
import { redisGet, redisSetEx } from "@/lib/redis/client"

const TRUSTED_FOLLOWERS_TTL = 43200 // 12 hours in seconds
const API_TIMEOUT = 5000 // 5 seconds timeout for external API calls

function formatFollowerCount(num: number): string {
	return formatAmountWithSuffix(BigInt(num) * BigInt(10 ** 9))
}

// @dev: Fetch with timeout to prevent hanging requests
async function fetchWithTimeout(url: string, timeout: number = API_TIMEOUT): Promise<Response> {
	const controller = new AbortController()
	const timeoutId = setTimeout(() => controller.abort(), timeout)

	try {
		const response = await fetch(url, { signal: controller.signal })
		clearTimeout(timeoutId)
		return response
	} catch (error) {
		clearTimeout(timeoutId)
		throw error
	}
}

function bandValue(count: number, thresholds: number[]): string {
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

export async function fetchCreatorsBatch(tokens: any[]) {
	const creatorAddresses = [...new Set(tokens.map((token: any) => token.dev).filter(Boolean))]

	if (creatorAddresses.length === 0) {
		return new Map()
	}

	const tokenLaunches = await prisma.tokenLaunches.findMany({
		where: {
			OR: [
				{ creatorAddress: { in: creatorAddresses } },
				{ poolObjectId: { in: tokens.map((t: any) => t.poolId).filter(Boolean) } }
			]
		},
		select: {
			poolObjectId: true,
			creatorAddress: true,
			twitterUsername: true,
			twitterUserId: true,
			hideIdentity: true
		}
	})

	// lookup maps
	const launchesByCreator = new Map<string, any[]>()
	tokenLaunches.forEach(launch => {
		const existing = launchesByCreator.get(launch.creatorAddress) || []
		existing.push(launch)
		launchesByCreator.set(launch.creatorAddress, existing)
	})

	// @dev: Process all creators in parallel instead of sequentially
	const creatorDataEntries = await Promise.all(
		creatorAddresses.map(async (address) => {
			const launches = launchesByCreator.get(address) || []
			const launchCount = launches.length
			const hideIdentity = launches.some(l => l.hideIdentity)

			let twitterHandle = null
			let twitterId = null
			let followerCount = 0
			let trustedFollowerCount = 0
			let followers = "0"
			let trustedFollowers = "0"

			// @dev: always try to get twitter handle from launches if available
			if (launches.length > 0) {
				const launchWithTwitter = launches.find(l => l.twitterUsername)
				if (launchWithTwitter && launchWithTwitter.twitterUsername) {
					twitterHandle = launchWithTwitter.twitterUsername
					twitterId = launchWithTwitter.twitterUserId

					// @dev: Try to get trusted follower count from Redis cache first
					const trustedFollowersCacheKey = `giverep:trusted_followers:${twitterHandle}`
					const cachedTrustedFollowers = await redisGet(trustedFollowersCacheKey)

					try {
						const [giveRepRes, fxTwitterRes] = await Promise.all([
							// @dev: Skip GiveRep API call if we have cached data
							cachedTrustedFollowers
								? Promise.resolve(null)
								: fetchWithTimeout(`https://giverep.com/api/trust-count/user-count/${twitterHandle}`),
							fetchWithTimeout(`https://api.fxtwitter.com/${twitterHandle}`)
						])

						// @dev: Use cached trusted followers or fetch fresh data
						if (cachedTrustedFollowers) {
							trustedFollowerCount = parseInt(cachedTrustedFollowers, 10) || 0
						} else if (giveRepRes && giveRepRes.ok) {
							const giveRepData = await giveRepRes.json()
							if (giveRepData.success && giveRepData.data) {
								trustedFollowerCount = giveRepData.data.trustedFollowerCount || 0
								// @dev: Cache the result for 12 hours
								await redisSetEx(trustedFollowersCacheKey, TRUSTED_FOLLOWERS_TTL, trustedFollowerCount.toString())
							}
						}

						if (fxTwitterRes && fxTwitterRes.ok) {
							const fxTwitterData = await fxTwitterRes.json()
							if (fxTwitterData?.user) {
								followerCount = fxTwitterData.user.followers || 0
							}
						}
					} catch (error) {
						console.error(`Error fetching Twitter data for ${twitterHandle}:`, error)
					}
				}
			}

			// @dev: if followers is 0 but trusted followers is not 0, it likely means the handle changed
			// set trusted followers to 0 as well to avoid showing misleading data
			if (followerCount === 0 && trustedFollowerCount > 0) {
				trustedFollowerCount = 0
			}

			// @dev: define thresholds for banding
			const trustedFollowerThresholds = [10, 50, 100, 250, 500, 1000, 5000, 10000, 25000]
			const followerThresholds = [100, 500, 1000, 5000, 10000, 25000, 50000, 100000, 500000, 1000000]

			// @dev: format counts based on hideIdentity flag
			if (hideIdentity) {
				followers = bandValue(followerCount, followerThresholds)
				trustedFollowers = bandValue(trustedFollowerCount, trustedFollowerThresholds)
				twitterHandle = null
				twitterId = null
			} else {
				// @dev: show actual values when not hiding identity
				followers = formatFollowerCount(followerCount)
				trustedFollowers = formatFollowerCount(trustedFollowerCount)
			}

			return [address, {
				launchCount,
				followers,
				trustedFollowers,
				twitterHandle: hideIdentity ? null : twitterHandle,
				twitterId: hideIdentity ? null : twitterId
			}] as const
		})
	)

	const creatorDataMap = new Map(creatorDataEntries)
	return creatorDataMap
}