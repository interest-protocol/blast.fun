import { NextRequest, NextResponse } from "next/server";
import { fetchCreatorData } from "@/lib/fetch-creator-data";
import { isValidSuiAddress } from "@mysten/sui/utils";

export async function GET(
	_request: NextRequest,
	{ params }: { params: Promise<{ handle: string }> }
) {
	try {
		const { handle } = await params;
		const isWalletAddress = isValidSuiAddress(handle);
		
		const creatorData = await fetchCreatorData({
			creatorAddressOrHandle: handle,
			twitterHandle: isWalletAddress ? null : handle
		});
		
		return NextResponse.json(creatorData);
	} catch (error) {
		console.error("Error fetching creator data:", error);
		return NextResponse.json(
			{ error: "Failed to fetch creator data" },
			{ status: 500 }
		);
	}
}