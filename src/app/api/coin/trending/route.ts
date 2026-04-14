import { NextResponse } from "next/server";
import { fetchNoodlesCoinTrending } from "@/lib/noodles/client";

export const revalidate = 30;

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url);
	const period = (searchParams.get("period") as "30m" | "1h" | "4h" | "6h" | "24h") || "24h";

	try {
		const coins = await fetchNoodlesCoinTrending({
			scorePeriod: period,
			limit: 20,
			offset: 0,
		});

		return NextResponse.json(
			{ coins: coins ?? [] },
			{
				headers: {
					"Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
				},
			}
		);
	} catch (error) {
		console.error("Error fetching trending coins:", error);
		return NextResponse.json({ coins: [] }, { status: 200 });
	}
}
