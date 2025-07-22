import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isValidSuiAddress } from "@mysten/sui/utils";

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

		// derive unique launch count
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

			// get follower data
			try {
				const twitterResponse = await fetch(
					`https://api.twitterapi.io/twitter/user/info?userName=${twitterHandle}`,
					{
						headers: {
							"X-API-Key": process.env.TWITTER_API_IO_KEY!,
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
		}

		// band the values
		const bandTrustedFollowers = (count: number): string => {
			if (count === 0) return "0";
			if (count < 10) return "<10";
			if (count < 50) return "<50";
			if (count < 100) return "<100";
			if (count < 250) return "<250";
			if (count < 500) return "<500";
			if (count < 1000) return "<1K";
			if (count < 5000) return "<5K";
			if (count < 10000) return "<10K";
			return ">10K";
		};

		const bandFollowerCount = (count: number): string => {
			if (count === 0) return "0";
			if (count < 100) return "<100";
			if (count < 500) return "<500";
			if (count < 1000) return "<1K";
			if (count < 5000) return "<5K";
			if (count < 10000) return "<10K";
			if (count < 50000) return "<50K";
			if (count < 100000) return "<100K";
			if (count < 500000) return "<500K";
			if (count < 1000000) return "<1M";
			return ">1M";
		};

		// only return banded values as to not leak the creator of this token
		return NextResponse.json({
			launchCount: launchCount,
			trustedFollowers: bandTrustedFollowers(trustedFollowerCount),
			followers: bandFollowerCount(followerCount),
		});
	} catch (error) {
		console.error("Error fetching creator data:", error);
		return NextResponse.json(
			{ error: "Failed to fetch creator data" },
			{ status: 500 }
		);
	}
}