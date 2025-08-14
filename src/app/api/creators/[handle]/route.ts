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
			} else {
				// no launches found for this twitter handle
				return NextResponse.json({
					launchCount: 0,
					trustedFollowers: "0",
					followers: "0",
					twitterHandle: handle
				});
			}
		}

		const creatorData = await fetchCreatorData(handle);
		return NextResponse.json(creatorData);
	} catch (error) {
		console.error("Error fetching creator data:", error);
		return NextResponse.json(
			{ error: "Failed to fetch creator data" },
			{ status: 500 }
		);
	}
}