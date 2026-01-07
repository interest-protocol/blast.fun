"use client";

import { NewlyCreated } from "@/components/tokens/newly-created";
import { NearGraduation } from "@/components/tokens/near-graduation";
import { GraduatedComplete } from "@/components/tokens/graduated-complete";
import { MobileTokenList } from "@/components/tokens/mobile-token-list";
import { SearchToken } from "@/components/shared/search-token";

export default function DiscoveryPage() {
    return (
        <>
            <div className="block lg:hidden">
                <div className="h-full">
                    <MobileTokenList />
                </div>
               
            </div>

            <div className="hidden lg:grid h-full grid-cols-1 lg:grid-cols-3 gap-4">
                <NewlyCreated pollInterval={10000} />
                <NearGraduation pollInterval={10000} />
                <GraduatedComplete pollInterval={30000} />
            </div>
        </>
    );
}
