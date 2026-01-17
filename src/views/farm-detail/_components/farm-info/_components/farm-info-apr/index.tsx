import { FC } from "react";

import { FarmInfoAprProps } from "./farm-info-apr.types";
import { Skeleton } from "@/components/ui/skeleton";

const FarmInfoApr: FC<FarmInfoAprProps> = ({ apr , isLoading}) => {
    const formatPercentage = (value: number): string => {
        if (value >= 1000000) {
            return `${(value / 1000000).toFixed(2)}M`
        }

        if (value >= 1000) {
            return `${(value / 1000).toFixed(2)}K`
        }

        return value.toFixed(2)
    }

    return (
        <div className="p-3 sm:p-4 rounded-lg border shadow-sm bg-muted/10">
            <p className="font-mono text-xs text-muted-foreground uppercase tracking-wider mb-2">APR</p>
            {isLoading ? (
                <Skeleton className="h-6 sm:h-8 w-20 sm:w-24" />
            ) : (
                <p className="font-mono text-xl sm:text-2xl font-bold text-green-500">{formatPercentage(apr)}%</p>
            )}
        </div>
    );
}
export default FarmInfoApr;