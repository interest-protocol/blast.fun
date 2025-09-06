import { prisma } from "@/lib/prisma"
import { CACHE_PREFIX, CACHE_TTL, redisGet, redisSetEx } from "@/lib/redis/client"
import type { TokenCreator } from "@/types/token"
import { formatAmountWithSuffix } from "@/utils/format"

export async function fetchCreatorData(params: {
	creatorAddressOrHandle?: string
	poolId?: string
	twitterHandle?: string | null
}): Promise<TokenCreator> {
	try {
		let creatorAddress: string | undefined
		let finalTwitterHandle = params.twitterHandle
		let finalTwitterId: string | null = null
		let hideIdentity = false

		// @dev: if poolId is provided, fetch creator address from tokenLaunches
		if (params.poolId) {
			// First try to find by poolId
			const tokenLaunch = await prisma.tokenLaunches.findFirst({
				where: { poolObjectId: params.poolId },
				select: {
					creatorAddress: true,
					hideIdentity: true,
					twitterUserId: true,
					twitterUsername: true,
				},
			})

			if (tokenLaunch) {
				creatorAddress = tokenLaunch.creatorAddress
				hideIdentity = tokenLaunch.hideIdentity
				finalTwitterId = tokenLaunch.twitterUserId
				finalTwitterHandle = tokenLaunch.twitterUsername
			} else if (params.creatorAddressOrHandle) {
				// @dev: Fallback to creatorAddress if no tokenLaunch found by poolId
				// This is important for tokens that don't have tokenLaunch records
				creatorAddress = params.creatorAddressOrHandle
			}
		} else if (params.creatorAddressOrHandle) {
			creatorAddress = params.creatorAddressOrHandle

			// @dev: if twitterHandle is provided and matches creatorAddressOrHandle,
			// we need to find the actual creator address
			if (params.twitterHandle && params.creatorAddressOrHandle === params.twitterHandle) {
				const tokenLaunch = await prisma.tokenLaunches.findFirst({
					where: { twitterUsername: params.twitterHandle },
					select: {
						creatorAddress: true,
						hideIdentity: true,
						twitterUserId: true,
					},
				})

				if (tokenLaunch) {
					creatorAddress = tokenLaunch.creatorAddress
					hideIdentity = tokenLaunch.hideIdentity
					finalTwitterId = tokenLaunch.twitterUserId
				}
			}
		}

		if (!creatorAddress) {
			throw new Error("No creatorAddress or poolId provided")
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
		hideIdentity = tokenLaunches.some((launch) => launch.hideIdentity)

		// get twitter handle and id if not hiding identity
		finalTwitterHandle = hideIdentity ? null : finalTwitterHandle
		finalTwitterId = hideIdentity ? null : finalTwitterId
		if (!hideIdentity && tokenLaunches.length > 0) {
			if (!finalTwitterHandle) {
				const launchWithTwitter = tokenLaunches.find((l) => l.twitterUsername)
				if (launchWithTwitter) {
					finalTwitterHandle = launchWithTwitter.twitterUsername
				}
			}
			if (!finalTwitterId) {
				const launchWithTwitterId = tokenLaunches.find((l) => l.twitterUserId)
				if (launchWithTwitterId) {
					finalTwitterId = launchWithTwitterId.twitterUserId
				}
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
				const res = await fetch(`https://giverep.com/api/trust-count/user-count/${finalTwitterHandle}`)

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
				const fxTwitterResponse = await fetch(`https://api.fxtwitter.com/${finalTwitterHandle}`)

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

		// @dev: If followers is 0 but trusted followers is not 0, it likely means the handle changed
		// Set trusted followers to 0 as well to avoid showing misleading data
		if (followerCount === 0 && trustedFollowerCount > 0) {
			trustedFollowerCount = 0
		}

		const trustedFollowerThresholds = [10, 50, 100, 250, 500, 1000, 5000, 10000, 25000]
		const followerThresholds = [100, 500, 1000, 5000, 10000, 25000, 50000, 100000, 500000, 1000000]

		const creatorData: TokenCreator = {
			address: creatorAddress,
			launchCount,
			trustedFollowers: hideIdentity
				? bandValue(trustedFollowerCount, trustedFollowerThresholds)
				: formatFollowerCount(trustedFollowerCount),
			followers: hideIdentity ? bandValue(followerCount, followerThresholds) : formatFollowerCount(followerCount),
			twitterHandle: finalTwitterHandle,
			twitterId: finalTwitterId,
			hideIdentity,
		}

		// Only cache if we have non-zero follower count
		// This ensures we don't cache failed API calls or users with genuinely 0 followers
		if (creatorData.followers !== "0") {
			await redisSetEx(cacheKey, CACHE_TTL.CREATOR_DATA, JSON.stringify(creatorData))
		}

		return creatorData
	} catch (error) {
		console.error("Error fetching creator data:", error)
		return {
			address: "",
			launchCount: 0,
			trustedFollowers: "0",
			followers: "0",
			twitterHandle: null,
			twitterId: null,
			hideIdentity: false,
		}
	}
}
