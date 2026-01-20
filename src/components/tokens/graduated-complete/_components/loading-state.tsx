import { memo } from "react";
import { TokenCardSkeleton } from "../../token-card.skeleton";

export const LoadingState = memo(() => (
    <>
        {[...Array(8)].map((_, i) => (
            <TokenCardSkeleton key={i} />
        ))}
    </>
));
LoadingState.displayName = "LoadingState";