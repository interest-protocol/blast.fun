import { FC, Suspense } from "react"
import { Loader2 } from "lucide-react"

import VestingContent from "./_components/vesting-content";

const Vesting: FC = () => {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        }>
            <VestingContent />
        </Suspense>
    );
}

export default Vesting;