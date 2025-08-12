"use client"

import { SplashLoader } from "@/components/shared/splash-loader";
import { Logo } from "@/components/ui/logo";
import { useTokenWithMetadata } from "@/hooks/pump/use-token-with-metadata"
import { useBreakpoint } from "@/hooks/use-breakpoint";
import { useTokenTab } from "@/hooks/use-token-tab";
import { useMarketData } from "@/hooks/use-market-data";
import MobileTokenView from "./mobile-token-view";
import { TokenHeader } from "./token-header";
import { ReferralShare } from "./referral-share";
import { CreatorDetails } from "./creator-details";
import { MigrationFees } from "./migration-fees";
import { TradeTerminal } from "./trade-terminal";
import {
    ResizablePanelGroup,
    ResizablePanel,
    ResizableHandle,
} from "@/components/ui/resizable";
import { NexaChart } from "@/components/shared/nexa-chart";
import { TokenTabs } from "./token-tabs";

export default function TokenLayout({ poolId }: { poolId: string }) {
    const { data, isLoading, error } = useTokenWithMetadata(poolId);
    const { isMobile } = useBreakpoint();
    const { data: marketData } = useMarketData(data?.coinType);

    useTokenTab(data);

    if (isLoading) {
        return <SplashLoader />
    }

    if (error || !data) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center">
                    <Logo className="w-12 h-12 mx-auto mb-4 animate-bounce" />
                    <h1 className="font-mono font-semibold text-xl uppercase text-muted-foreground">TOKEN_NOT_FOUND</h1>
                    <p className="font-mono text-xs uppercase text-muted-foreground/60 mt-2">
                        {poolId || "[UNKNOWN]"}
                    </p>
                </div>
            </div>
        )
    }

    if (isMobile) {
        return <MobileTokenView pool={data} />
    }

    return (
        <div className="w-full h-full flex">
            <div className="flex-1 flex flex-col">
                <TokenHeader pool={data} />

                {/* Chart and Tabs */}
                <ResizablePanelGroup
                    direction="vertical"
                    className="flex-1"
                >
                    <ResizablePanel defaultSize={60} minSize={30}>
                        <NexaChart pool={data} />
                    </ResizablePanel>

                    <ResizableHandle withHandle />

                    <ResizablePanel defaultSize={40} minSize={20}>
                        <TokenTabs pool={data} marketData={marketData} className="h-full" />
                    </ResizablePanel>
                </ResizablePanelGroup>
            </div>

            <div className="w-[400px] border-l flex flex-col h-full">
                <CreatorDetails pool={data} />

                {data.migrated && (
                    <MigrationFees pool={data} />
                )}

                {!data.migrated && (
                    <ReferralShare pool={data} />
                )}

                <TradeTerminal pool={data} />
            </div>
        </div>
    )
}