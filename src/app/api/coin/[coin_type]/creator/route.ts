import { NextResponse } from "next/server"
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

export async function GET(
	_request: Request,
	{ params }: { params: Promise<{ coin_type: string }> }
) {
	const { coin_type } = await params

	if (!coin_type) {
		return NextResponse.json({ error: "Coin type is required" }, { status: 400 })
	}

	try {
		// @dev: Get creator address from the token launch or pool data
		const tokenLaunch = await prisma.tokenLaunches.findFirst({
			where: {
				coinType: coin_type
			},
			select: {
				poolObjectId: true,
				creatorAddress: true,
				twitterUsername: true,
				twitterUserId: true,
				hideIdentity: true
			}
		})

		if (!tokenLaunch?.creatorAddress) {
			const response = new Response(null, { status: 204 })
			// @dev: Set CDN cache headers for 1 hour (3600 seconds)
			response.headers.set('Cache-Control', 'public, max-age=3600, s-maxage=3600')
			response.headers.set('CDN-Cache-Control', 'public, max-age=3600')
			response.headers.set('Vercel-CDN-Cache-Control', 'public, max-age=3600')
			return response
		}

		const creatorAddress = tokenLaunch.creatorAddress

		// @dev: Get all launches by this creator for launch count
		const allLaunches = await prisma.tokenLaunches.findMany({
			where: {
				creatorAddress: creatorAddress
			},
			select: {
				poolObjectId: true,
				creatorAddress: true,
				twitterUsername: true,
				twitterUserId: true,
				hideIdentity: true
			}
		})

		const launchCount = allLaunches.length
		const hideIdentity = allLaunches.some(l => l.hideIdentity)

		let twitterHandle = null
		let twitterId = null
		let followerCount = 0
		let trustedFollowerCount = 0
		let followers = "0"
		let trustedFollowers = "0"

		// @dev: Try to get twitter handle from launches if available
		if (allLaunches.length > 0) {
			const launchWithTwitter = allLaunches.find(l => l.twitterUsername)
			if (launchWithTwitter && launchWithTwitter.twitterUsername) {
				twitterHandle = launchWithTwitter.twitterUsername
				twitterId = launchWithTwitter.twitterUserId

				// @dev: Fetch follower counts regardless of hideIdentity (we'll band them later if needed)
				try {
					const [giveRepRes, fxTwitterRes] = await Promise.all([
						fetch(`https://giverep.com/api/trust-count/user-count/${twitterHandle}`),
						fetch(`https://api.fxtwitter.com/${twitterHandle}`)
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

		// @dev: If followers is 0 but trusted followers is not 0, it likely means the handle changed
		// set trusted followers to 0 as well to avoid showing misleading data
		if (followerCount === 0 && trustedFollowerCount > 0) {
			trustedFollowerCount = 0
		}

		// @dev: Define thresholds for banding
		const trustedFollowerThresholds = [10, 50, 100, 250, 500, 1000, 5000, 10000, 25000]
		const followerThresholds = [100, 500, 1000, 5000, 10000, 25000, 50000, 100000, 500000, 1000000]

		// @dev: Format counts based on hideIdentity flag
		if (hideIdentity) {
			followers = bandValue(followerCount, followerThresholds)
			trustedFollowers = bandValue(trustedFollowerCount, trustedFollowerThresholds)
			twitterHandle = null
			twitterId = null
		} else {
			// @dev: Show actual values when not hiding identity
			followers = formatFollowerCount(followerCount)
			trustedFollowers = formatFollowerCount(trustedFollowerCount)
		}

		const creatorData = {
			launchCount,
			followers,
			trustedFollowers,
			twitterHandle: hideIdentity ? null : twitterHandle,
			twitterId: hideIdentity ? null : twitterId
		}

		const response = NextResponse.json(creatorData)
		
		// @dev: Set CDN cache headers for 1 hour (3600 seconds)
		response.headers.set('Cache-Control', 'public, max-age=3600, s-maxage=3600')
		response.headers.set('CDN-Cache-Control', 'public, max-age=3600')
		response.headers.set('Vercel-CDN-Cache-Control', 'public, max-age=3600')

		return response

	} catch (error) {
		console.error("Error fetching creator data:", error)
		return NextResponse.json({ error: "Internal server error" }, { status: 500 })
	}
}