import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isValidSuiAddress } from "@mysten/sui/utils";
import { formatAmountWithSuffix } from "@/utils/format";
import { env } from "@/env";
import { redisGet, redisSetEx, CACHE_TTL, CACHE_PREFIX } from "@/lib/redis/client";

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ handle: string }> }
) {
	try {
		const { handle } = await params;

		const isWalletAddress = isValidSuiAddress(handle);
		const tokenLaunches = await prisma.tokenLaunches.findMany({
			where: isWalletAddress
				? { creatorAddress: handle }
				: { twitterUsername: handle },
			select: {
				twitterUserId: true,
				twitterUsername: true,
				creatorAddress: true,
			},
		});

		const launchCount = tokenLaunches.length;

		let trustedFollowerCount = 0;
		let followerCount = 0;
		let twitterHandle: string | null = isWalletAddress ? null : handle;

		if (isWalletAddress && tokenLaunches.length > 0) {
			const launchWithTwitter = tokenLaunches.find(l => l.twitterUsername);
			if (launchWithTwitter) {
				twitterHandle = launchWithTwitter.twitterUsername;
			}
		}

		if (twitterHandle) {
			const cacheKey = `${CACHE_PREFIX.TWITTER_FOLLOWERS}${twitterHandle.toLowerCase()}`;
			const cacheTTL = CACHE_TTL.TWITTER_FOLLOWERS;

			const cachedData = await redisGet(cacheKey);
			if (cachedData) {
				try {
					const cached = JSON.parse(cachedData);
					trustedFollowerCount = cached.trustedFollowerCount;
					followerCount = cached.followerCount;
				} catch (error) {
					console.error("Failed to parse cached data:", error);
				}
			} else {
				try {
					const res = await fetch(
						`https://giverep.com/api/trust-count/user-count/${twitterHandle}`
					);

					if (res.ok) {
						const giveRepData = await res.json();
						if (giveRepData.success && giveRepData.data) {
							trustedFollowerCount = giveRepData.data.trustedFollowerCount || 0;
						}
					}
				} catch (error) {
					console.error("Error fetching GiveRep data:", error);
				}

				try {
					const twitterResponse = await fetch(
						`https://api.twitterapi.io/twitter/user/info?userName=${twitterHandle}`,
						{
							headers: {
								"X-API-Key": env.TWITTER_API_IO_KEY,
							},
						}
					);

					if (twitterResponse.ok) {
						const twitterData = await twitterResponse.json();
						if (twitterData.status === "success" && twitterData.data) {
							followerCount = twitterData.data.followers || 0;
						}
					}
				} catch (error) {
					console.error("Error fetching Twitter data:", error);
				}

				if (trustedFollowerCount > 0 || followerCount > 0) {
					await redisSetEx(
						cacheKey,
						cacheTTL,
						JSON.stringify({ trustedFollowerCount, followerCount })
					);
				}
			}
		}

		const formatFollowerCount = (num: number): string => {
			return formatAmountWithSuffix(BigInt(num) * BigInt(10 ** 9));
		};

		const bandValue = (count: number, thresholds: number[]): string => {
			if (count === 0) return "0";

			for (let i = 0; i < thresholds.length; i++) {
				if (count < thresholds[i]) {
					if (i === 0) {
						return `<${formatFollowerCount(thresholds[i])}`;
					}

					const prevThreshold = thresholds[i - 1];
					return `${formatFollowerCount(prevThreshold)}-${formatFollowerCount(thresholds[i])}`;
				}
			}

			const lastThreshold = thresholds[thresholds.length - 1];
			return `>${formatFollowerCount(lastThreshold)}`;
		};

		const trustedFollowerThresholds = [10, 50, 100, 250, 500, 1000, 5000, 10000, 25000];
		const followerThresholds = [100, 500, 1000, 5000, 10000, 25000, 50000, 100000, 500000, 1000000];

		const bandTrustedFollowers = (count: number): string => bandValue(count, trustedFollowerThresholds);
		const bandFollowerCount = (count: number): string => bandValue(count, followerThresholds);

		return NextResponse.json({
			launchCount: launchCount,
			trustedFollowers: isWalletAddress
				? bandTrustedFollowers(trustedFollowerCount)
				: formatFollowerCount(trustedFollowerCount),
			followers: isWalletAddress
				? bandFollowerCount(followerCount)
				: formatFollowerCount(followerCount),
		});
	} catch (error) {
		console.error("Error fetching creator data:", error);
		return NextResponse.json(
			{ error: "Failed to fetch creator data" },
			{ status: 500 }
		);
	}
}