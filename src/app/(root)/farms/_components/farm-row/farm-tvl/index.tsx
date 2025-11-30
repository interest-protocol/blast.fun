import { FC } from "react";
import { FarmTvlProps } from "./farm-tvl.types";
import { formatNumberWithSuffix } from "@/utils/format";

export const FarmTvl: FC<FarmTvlProps> = ({ tvlAmount, tvlUsd, tokenSymbol, stakeTokenPrice }) => (
    <div className="hidden md:flex flex-col items-end min-w-[120px]">
        <p className="font-mono text-xs text-muted-foreground uppercase tracking-wider">TVL</p>
        <p className="font-mono text-sm font-semibold">{formatNumberWithSuffix(tvlAmount)} {tokenSymbol}</p>
        {stakeTokenPrice > 0 && (
            <p className="font-mono text-xs text-muted-foreground">${formatNumberWithSuffix(tvlUsd)}</p>
        )}
    </div>
)