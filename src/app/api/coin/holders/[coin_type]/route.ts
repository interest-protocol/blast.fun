import { NextResponse } from "next/server";
import { blockVisionService } from "@/services/blockvision.service";
import { redisGet, redisSetEx } from "@/lib/redis/client";

export const dynamic = "force-dynamic";

export async function GET(
    _request: Request,
    { params }: { params: Promise<{ coin_type: string }> }
) {
    try {
        const { coin_type } = await params;
        const coinType = decodeURIComponent(coin_type);

        const cacheKey = `coin:holders:${coinType}`;
        const cached = await redisGet(cacheKey);

        if (cached) {
            return NextResponse.json(JSON.parse(cached), {
                headers: {
                    "Cache-Control":
                        "public, s-maxage=15, stale-while-revalidate=30",
                },
            });
        }

        const holdersResponse = await blockVisionService.getCoinHolders(
            coinType,
            50
        );

        if (!holdersResponse.success || !holdersResponse.data) {
            return NextResponse.json(
                {
                    error:
                        holdersResponse.error ||
                        "Failed to fetch holders",
                },
                { status: 500 }
            );
        }

        const holders = holdersResponse.data;

        const response = {
            holders,
            timestamp: Date.now(),
            source: "blockvision",
        };

        await redisSetEx(cacheKey, 5, JSON.stringify(response));

        return NextResponse.json(response, {
            headers: {
                "Cache-Control":
                    "public, s-maxage=15, stale-while-revalidate=30",
            },
        });
    } catch (error) {
        console.error("Error fetching coin holders:", error);
        return NextResponse.json(
            { error: "Failed to fetch coin holders" },
            { status: 500 }
        );
    }
}
