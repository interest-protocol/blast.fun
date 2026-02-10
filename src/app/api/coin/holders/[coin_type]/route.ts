import { NextRequest, NextResponse } from "next/server";
import { blockVisionService } from "@/services/blockvision.service";
import { redisGet, redisSetEx } from "@/lib/redis/client";

export const dynamic = "force-dynamic";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ coin_type: string }> }
) {
    try {
        const { coin_type } = await params;
        const coinType = decodeURIComponent(coin_type);
        const { searchParams } = new URL(request.url);
        const limit = Math.min(Number(searchParams.get("limit")) || 50, 100);

        const cacheKey = `coin:holders:${coinType}:${limit}`;
        const cached = await redisGet(cacheKey);

        if (cached) {
            return NextResponse.json(JSON.parse(cached), {
                headers: {
                    "Cache-Control": "public, s-maxage=15, stale-while-revalidate=30",
                },
            });
        }

        const holdersResponse = await blockVisionService.getCoinHolders(coinType, limit);

        if (!holdersResponse.success || !holdersResponse.data) {
            return NextResponse.json(
                {
                    holders: [],
                    timestamp: Date.now(),
                    source: "blockvision",
                },
                {
                    headers: {
                        "Cache-Control": "public, s-maxage=15, stale-while-revalidate=30",
                    },
                }
            );
        }

        const response = {
            holders: holdersResponse.data,
            timestamp: Date.now(),
            source: "blockvision" as const,
        };

        await redisSetEx(cacheKey, 5, JSON.stringify(response));

        return NextResponse.json(response, {
            headers: {
                "Cache-Control": "public, s-maxage=15, stale-while-revalidate=30",
            },
        });
    } catch (error) {
        console.error("Error fetching coin holders:", error);
        return NextResponse.json(
            { error: "Failed to fetch coin holders", holders: [], timestamp: Date.now(), source: "blockvision" },
            { status: 500 }
        );
    }
}
