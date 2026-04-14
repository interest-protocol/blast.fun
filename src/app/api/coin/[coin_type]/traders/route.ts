import { NextResponse } from "next/server";
import { fetchNoodlesCoinTraders } from "@/lib/noodles/client";
import type { FetchNoodlesCoinTradersParams } from "@/lib/noodles/client";

export const revalidate = 30;

const VALID_PERIODS = new Set(["30d", "7d", "3d", "1d"]);
const VALID_SORT_FIELDS = new Set([
	"tx_buy",
	"tx_sell",
	"total_tx",
	"amount_buy",
	"amount_sell",
	"vol_buy",
	"vol_sell",
	"pnl",
]);
const VALID_SORT_DIRECTIONS = new Set(["asc", "desc"]);

export async function GET(request: Request, { params }: { params: Promise<{ coin_type: string }> }) {
	try {
		const { coin_type } = await params;
		const coinType = decodeURIComponent(coin_type);
		const { searchParams } = new URL(request.url);

		const period = searchParams.get("period") || "7d";
		if (!VALID_PERIODS.has(period)) {
			return NextResponse.json({ error: "Invalid period" }, { status: 400 });
		}

		const sortField = searchParams.get("sortField") || "pnl";
		const sortDirection = searchParams.get("sortDirection") || "desc";

		const fetchParams: FetchNoodlesCoinTradersParams = {
			coinType,
			period: period as FetchNoodlesCoinTradersParams["period"],
			limit: Number(searchParams.get("limit") || 20),
			offset: Number(searchParams.get("offset") || 0),
			sortField: VALID_SORT_FIELDS.has(sortField) ? (sortField as FetchNoodlesCoinTradersParams["sortField"]) : "pnl",
			sortDirection: VALID_SORT_DIRECTIONS.has(sortDirection) ? (sortDirection as "asc" | "desc") : "desc",
		};

		const res = await fetchNoodlesCoinTraders(fetchParams);
		if (!res) {
			return NextResponse.json({ traders: [] });
		}

		return NextResponse.json({ traders: res.data ?? [] });
	} catch (error) {
		console.error("Error fetching coin traders:", error);
		return NextResponse.json({ traders: [] }, { status: 500 });
	}
}
