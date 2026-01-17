import { FC } from "react";

import { NewlyCreated } from "@/components/tokens/newly-created";
import { NearGraduation } from "@/components/tokens/near-graduation";
import { GraduatedComplete } from "@/components/tokens/graduated-complete";
import { MobileTokenList } from "@/components/tokens/mobile-token-list";

const Discovery: FC = () => (
    <>
        <div className="block lg:hidden">
            <MobileTokenList />
        </div>

        <div className="hidden lg:grid h-full grid-cols-1 lg:grid-cols-3 gap-4">
            <NewlyCreated pollInterval={10000} />
            <NearGraduation pollInterval={10000} />
            <GraduatedComplete pollInterval={30000} />
        </div>
    </>
);

export default Discovery;
