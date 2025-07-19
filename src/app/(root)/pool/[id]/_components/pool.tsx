'use client';

import { SplashLoader } from "@/components/shared/splash-loader";
import { Card, CardContent } from "@/components/ui/card";
import { usePoolWithMetadata } from "@/hooks/pump/use-pool-with-metadata";
import { Skull } from "lucide-react";
import { PoolHeader } from "./pool-header";
import { TradingTerminal } from "./trading-terminal";
import { BondingProgress } from "./bonding-progress";

export default function Pool({ poolId }: { poolId: string }) {
    const { pool, loading, error } = usePoolWithMetadata(poolId, {
        skip: !poolId
    });

    if (loading) {
        return (
            <SplashLoader />
        )
    }

    if (error || !pool) {
        return (
            <div className="container mx-auto px-4 py-8">
                <Card className="border-2 bg-background/50 backdrop-blur-sm shadow-2xl">
                    <CardContent className="py-12">
                        <div className="text-center">
                            <Skull className="w-12 h-12 mx-auto text-foreground/20 mb-4" />
                            <p className="font-mono text-sm uppercase text-muted-foreground">
                                ERROR::POOL_NOT_FOUND
                            </p>
                            <p className="font-mono text-xs uppercase text-muted-foreground/60 mt-2">
                                POOL_ID::{poolId || '[UNKNOWN]'}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            <div className="grid lg:grid-cols-3 gap-8 items-start">
                <div className="lg:col-span-2">
                    <div className="space-y-4">
                        <PoolHeader pool={pool} />

                        <div className="space-y-6">
                            {/* Tradingview Advanced/Lightweight Chart */}
                            {/* Component which will handle: Holders, Top Holders, etc */}
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-1 space-y-6">
                    <TradingTerminal pool={pool} />
                    <BondingProgress pool={pool} />
                </div>
            </div>
        </div>
    )
}