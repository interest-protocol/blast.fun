import { NextResponse } from "next/server";
import { blockVisionService } from "@/services/blockvision.service";
import { nexaClient } from "@/lib/nexa";
import { redisGet, redisSetEx } from "@/lib/redis/client";
import type { CoinHolder } from "@/types/blockvision";

export const dynamic = "force-dynamic";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ coin_type: string }> }
) {
    try {
        const { coin_type } = await params;
        const coinType = decodeURIComponent(coin_type);
        console.log(`📊 Fetching holders for coin: ${coinType}`);

        // @dev: Check Redis cache first
        const cacheKey = `coin:holders:${coinType}`;
        const cached = await redisGet(cacheKey);

        if (cached) {
            console.log(`✅ Returning cached holders data for ${coinType}`);
            return NextResponse.json(JSON.parse(cached), {
                headers: {
                    "Cache-Control":
                        "public, s-maxage=15, stale-while-revalidate=30",
                },
            });
        }

        // @dev: Try Nexa API first, fallback to BlockVision
        let holders: CoinHolder[] = [];
        let isFromNexa = false;

        try {
            console.log(`🔄 Trying Nexa API for holders: ${coinType}`);
            const nexaResponse = await nexaClient.getHolders(coinType, 50, 0);

            if (nexaResponse && nexaResponse.length > 0) {
                // @dev: Map Nexa API response to CoinHolder format
                holders = nexaResponse.map(
                    (holder: any): CoinHolder => ({
                        account: holder.user,
                        balance: holder.balanceScaled.toString(),
                        percentage: (holder.percentage / 100).toString(),
                        name: "",
                        image: "",
                        website: "",
                    })
                );
                isFromNexa = true;
                console.log(`✅ Got ${holders.length} holders from Nexa API`);
            } else {
                throw new Error("No holders data from Nexa API");
            }
            const coinMetadata = await nexaClient.getCoinMetadata(coinType);
            if (!coinMetadata) {
                throw new Error("No coin metadata from Nexa API");
            }
            const totalSupply = coinMetadata?.supply;

            const trueBurnedSupply = totalSupply
                ? String(
                      (1000000000000000000n - BigInt(totalSupply)) / 10n ** 9n
                  )
                : "0";

            // Add true_burn as a separate holder if there's actually burned supply
            if (parseFloat(trueBurnedSupply) > 0) {
                holders.push({
                    account: "true_burn",
                    balance: trueBurnedSupply,
                    percentage: (
                        Number(trueBurnedSupply) / 1_000_000_000
                    ).toString(),
                    name: "",
                    image: "",
                    website: "",
                });
            }
        } catch (nexaError) {
            console.log(
                `⚠️ Nexa API failed, falling back to BlockVision: ${nexaError}`
            );

            try {
                const holdersResponse = await blockVisionService.getCoinHolders(
                    coinType,
                    50
                );

                if (!holdersResponse.success || !holdersResponse.data) {
                    console.error(
                        `❌ Both APIs failed. BlockVision error: ${holdersResponse.error}`
                    );
                    return NextResponse.json(
                        {
                            error:
                                holdersResponse.error ||
                                "Failed to fetch holders from both APIs",
                        },
                        { status: 500 }
                    );
                }

                holders = holdersResponse.data;
                console.log(
                    `✅ Got ${holders.length} holders from BlockVision API (fallback)`
                );
            } catch (blockVisionError) {
                console.error(
                    `❌ Both APIs failed. BlockVision error: ${blockVisionError}`
                );
                return NextResponse.json(
                    { error: "Failed to fetch holders from both APIs" },
                    { status: 500 }
                );
            }
        }

        const response = {
            holders,
            timestamp: Date.now(),
            source: isFromNexa ? "nexa" : "blockvision",
        };

        // @dev: Cache for 5 seconds in Redis
        await redisSetEx(cacheKey, 5, JSON.stringify(response));

        console.log(
            `✅ Fetched and cached ${
                holders.length
            } holders for ${coinType} from ${
                isFromNexa ? "Nexa" : "BlockVision"
            }`
        );

        // @dev: Return with edge cache headers (15 seconds)
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
