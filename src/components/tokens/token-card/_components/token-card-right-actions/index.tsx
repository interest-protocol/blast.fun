import { FC } from "react";

import QuickBuy from "@/components/tokens/quick-buy"
import CopyableToken from "@/components/shared/copyable-token"
import { TokenCardRightActionsProps } from "./token-card-right-actions.types";

const TokenCardRightActions: FC<TokenCardRightActionsProps> = ({ symbol, coinType, pool, column }) => {
    return (
        <div className="flex-shrink-0 ml-auto flex flex-col items-end gap-2">
            <CopyableToken symbol={symbol || "[???]"} coinType={coinType} className="text-xs" />
            <QuickBuy pool={pool} column={column} />
        </div>
    );
}

export default TokenCardRightActions;