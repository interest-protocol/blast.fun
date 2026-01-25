import { FC, memo } from "react";
import Link from "next/link";

import TokenCardContainer from "./_components/token-card-container"
import { TokenCardProps } from "./token-card.types"
import TokenCardAvatarSection from "./_components/token-card-avatar-section";
import TokenCardMainContent from "./_components/token-card-main-content";
import TokenCardRightActions from "./_components/token-card-right-actions";

const TokenCard: FC<TokenCardProps> = memo(function TokenCard({
    pool: token,
    hasRecentTrade = false,
    column,
}) {
    const bondingProgress = (token.bondingProgress || 0) * 100;

    return (
        <Link href={`/token/${token.coinType}`} className="cursor-default">
            <TokenCardContainer hasRecentTrade={hasRecentTrade}>
                <div className="relative p-3 sm:p-2">
                    <div className="flex items-center gap-3 sm:gap-2.5">
                        <TokenCardAvatarSection
                            iconUrl={token.iconUrl}
                            symbol={token.symbol}
                            name={token.name}
                            bondingProgress={bondingProgress}
                        />

                        <TokenCardMainContent token={token} />

                        <TokenCardRightActions
                            symbol={token.symbol}
                            coinType={token.coinType}
                            pool={token}
                            column={column}
                        />
                    </div>
                </div>
            </TokenCardContainer>
        </Link>
    );
})

export default TokenCard; 