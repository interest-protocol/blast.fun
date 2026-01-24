import { FC } from "react";

import { FarmInfoHeaderProps } from "./farm-info-header.types";
import TokenAvatar from "@/components/tokens/token-avatar";
import { formatNumberWithSuffix } from "@/utils/format";

const FarmInfoHeader: FC<FarmInfoHeaderProps> = ({
    tokenName,
    tokenSymbol,
    metadata,
    tvlAmount,
    tvlUsd,
    stakeTokenPrice,
}) => {
    return (
        <div className="flex items-start sm:items-center justify-between gap-3 sm:gap-4 mb-3 sm:mb-4 pb-3 sm:pb-4 border-b border-border/30">
            <div className="flex items-center gap-3 sm:gap-4">
                <TokenAvatar
                    iconUrl={metadata?.iconUrl}
                    symbol={tokenSymbol}
                    className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg"
                    enableHover={false}
                />
                <div>
                    <h2 className="font-mono text-lg sm:text-xl font-bold">{tokenName}</h2>
                    <p className="font-mono text-xs sm:text-sm text-muted-foreground">{tokenSymbol}</p>
                </div>
            </div>
            <div className="text-right flex-shrink-0">
                <p className="font-mono text-xs text-muted-foreground uppercase tracking-wider mb-1">TVL</p>
                <p className="font-mono text-lg font-semibold">
                    {formatNumberWithSuffix(tvlAmount)} <span className="text-muted-foreground text-sm">{tokenSymbol}</span>
                </p>
                {stakeTokenPrice > 0 && (
                    <p className="font-mono text-xs text-muted-foreground">${formatNumberWithSuffix(tvlUsd)}</p>
                )}
            </div>
        </div>
    );
}
export default FarmInfoHeader