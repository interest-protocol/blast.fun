import { NextRequest, NextResponse } from "next/server";
import { fetchCreatorData } from "@/lib/fetch-creator-data";
import { isValidSuiAddress } from "@mysten/sui/utils";
import { prisma } from "@/lib/prisma";

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ handle: string }> }
) {
	try {
		const { handle } = await params;

		const isWalletAddress = isValidSuiAddress(handle);

		// if it's a twitter handle, we need to find the wallet address
		if (!isWalletAddress) {
			const tokenLaunch = await prisma.tokenLaunches.findFirst({
				where: { twitterUsername: handle },
				select: { creatorAddress: true }
			});

			if (tokenLaunch) {
				const creatorData = await fetchCreatorData(
					tokenLaunch.creatorAddress,
					handle
				);
				return NextResponse.json(creatorData);
			}

			// no launches found for this twitter handle, but still try to get follower data
			let followerCount = 0;

			// try to fetch follower data from fxtwitter
			try {
				const fxTwitterResponse = await fetch(
					`https://api.fxtwitter.com/${handle}`
				);

				if (fxTwitterResponse.ok) {
					const fxTwitterData = await fxTwitterResponse.json();
					if (fxTwitterData && fxTwitterData.user && fxTwitterData.user.followers) {
						followerCount = fxTwitterData.user.followers || 0;
					}
				}
			} catch (error) {
				console.error("Error fetching fxTwitter data:", error);
			}

			// format the follower count with suffix
			const formatFollowerCount = (num: number): string => {
				if (num === 0) return "0";
				if (num < 1000) return num.toString();
				if (num < 1000000) return `${(num / 1000).toFixed(1).replace(/\.0$/, '')}K`;
				if (num < 1000000000) return `${(num / 1000000).toFixed(1).replace(/\.0$/, '')}M`;
				return `${(num / 1000000000).toFixed(1).replace(/\.0$/, '')}B`;
			};

			return NextResponse.json({
				launchCount: 0,
				trustedFollowers: 0,
				followers: formatFollowerCount(followerCount),
				twitterHandle: handle
			});
		}

		const creatorData = await fetchCreatorData(handle, null, isWalletAddress);
		return NextResponse.json(creatorData);
	} catch (error) {
		console.error("Error fetching creator data:", error);
		return NextResponse.json(
			{ error: "Failed to fetch creator data" },
			{ status: 500 }
		);
	}
}