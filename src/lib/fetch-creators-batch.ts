import { prisma } from "@/lib/prisma"
import { formatAmountWithSuffix } from "@/utils/format"

function formatFollowerCount(num: number): string {
	return formatAmountWithSuffix(BigInt(num) * BigInt(10 ** 9))
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

export async function fetchCreatorsBatch(tokens: any[], poolMap: Map<string, any>) {
	const creatorAddresses = [
		...new Set(
			tokens
				.map((token: any) => {
					const pool = poolMap.get(token.coinType)
					return pool?.creatorAddress || token.dev
				})
				.filter(Boolean)
		),
	]

	if (creatorAddresses.length === 0) {
		return new Map()
	}

	const tokenLaunches = await prisma.tokenLaunches.findMany({
		where: {
			OR: [
				{ creatorAddress: { in: creatorAddresses } },
				{ poolObjectId: { in: tokens.map((t: any) => poolMap.get(t.coinType)?.poolId || t.id).filter(Boolean) } },
			],
		},
		select: {
			poolObjectId: true,
			creatorAddress: true,
			twitterUsername: true,
			twitterUserId: true,
			hideIdentity: true,
		},
	})

	// lookup maps
	const launchesByCreator = new Map<string, any[]>()
	tokenLaunches.forEach((launch) => {
		const existing = launchesByCreator.get(launch.creatorAddress) || []
		existing.push(launch)
		launchesByCreator.set(launch.creatorAddress, existing)
	})

	const creatorDataMap = new Map()
	for (const address of creatorAddresses) {
		const launches = launchesByCreator.get(address) || []
		const launchCount = launches.length
		const hideIdentity = launches.some((l) => l.hideIdentity)

		let twitterHandle = null
		let twitterId = null
		let followerCount = 0
		let trustedFollowerCount = 0
		let followers = "0"
		let trustedFollowers = "0"

		// @dev: always try to get twitter handle from launches if available
		if (launches.length > 0) {
			const launchWithTwitter = launches.find((l) => l.twitterUsername)
			if (launchWithTwitter) {
				twitterHandle = launchWithTwitter.twitterUsername
				twitterId = launchWithTwitter.twitterUserId

				// @dev: fetch follower counts regardless of hideIdentity (we'll band them later if needed)
				try {
					const [giveRepRes, fxTwitterRes] = await Promise.all([
						fetch(`https://giverep.com/api/trust-count/user-count/${twitterHandle}`),
						fetch(`https://api.fxtwitter.com/${twitterHandle}`),
					])

					if (giveRepRes.ok) {
						const giveRepData = await giveRepRes.json()
						if (giveRepData.success && giveRepData.data) {
							trustedFollowerCount = giveRepData.data.trustedFollowerCount || 0
						}
					}

					if (fxTwitterRes.ok) {
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

		creatorDataMap.set(address, {
			launchCount,
			followers,
			trustedFollowers,
			twitterHandle: hideIdentity ? null : twitterHandle,
			twitterId: hideIdentity ? null : twitterId,
		})
	}

	return creatorDataMap
}
