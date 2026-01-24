import { FC } from "react";

import TokenAvatar from "@/components/tokens/token-avatar";
import { TokenInfoProps } from "./token-info.types";

const TokenInfo: FC<TokenInfoProps> = ({
    iconUrl,
    tokenName,
    tokenSymbol,
}) => (
    <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
        <TokenAvatar iconUrl={iconUrl} symbol={tokenSymbol} className="w-8 h-8 md:w-10 md:h-10 rounded-lg flex-shrink-0" enableHover={false} />
        <div className="text-left min-w-0">
            <p className="font-mono text-xs md:text-sm font-semibold truncate">{tokenName}</p>
            <p className="font-mono text-xs text-muted-foreground">{tokenSymbol}</p>
        </div>
    </div>
)

export default TokenInfo;