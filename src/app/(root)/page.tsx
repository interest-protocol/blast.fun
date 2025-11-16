"use client";

import { NewlyCreated } from "@/components/tokens/newly-created";
import { NearGraduation } from "@/components/tokens/near-graduation";
import { GraduatedComplete } from "@/components/tokens/graduated-complete";
import { MobileTokenList } from "@/components/tokens/mobile-token-list";
import { SearchToken } from "@/components/shared/search-token";
import { useBreakpoint } from "@/hooks/use-breakpoint";

export default function DiscoveryPage() {
    const { isMobile } = useBreakpoint();

    if (isMobile) {
        return (
            <>
                <div className="h-full">
                    <MobileTokenList />
                </div>
                <SearchToken />
            </>
        );
    }

    return (
        <>
            <div className="h-full grid grid-cols-1 lg:grid-cols-3 gap-4">
                <NewlyCreated pollInterval={10000} />
                <NearGraduation pollInterval={10000} />
                <GraduatedComplete pollInterval={30000} />
            </div>
            <SearchToken />
        </>
    );
}
