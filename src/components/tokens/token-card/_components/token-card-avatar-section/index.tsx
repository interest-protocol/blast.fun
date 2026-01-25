import { FC } from "react";

import { TokenCardAvatarSectionProps } from "./token-card-avatar-section.tyoes";
import TokenAvatar from "@/components/tokens/token-avatar";

const TokenCardAvatarSection: FC<TokenCardAvatarSectionProps> = ({
    iconUrl,
    symbol,
    name,
    bondingProgress,
}) => {
    const progressColor =
        bondingProgress >= 100
            ? "rgb(202, 138, 4)"
            : bondingProgress >= 30
                ? "rgb(236, 72, 153)"
                : "rgb(59, 130, 246)"

    const bgGradient =
        bondingProgress >= 100
            ? "from-yellow-600/30 to-amber-600/30"
            : bondingProgress >= 30
                ? "from-pink-400/30 to-rose-500/30"
                : "from-blue-400/30 to-cyan-500/30"

    return (
        <div className="flex-shrink-0">
            <div className="h-[48px] w-[48px] sm:h-[56px] sm:w-[56px]">
                <div className="relative h-full w-full overflow-hidden rounded-md">
                    <div className={`absolute inset-0 rounded-md bg-gradient-to-br ${bgGradient}`} />

                    <div
                        className="absolute inset-0 rounded-md"
                        style={{
                            background: `conic-gradient(${progressColor} ${Math.min(bondingProgress, 100)}%,
                             transparent ${Math.min(
                                bondingProgress,
                                100
                            )}%)`,
                        }}
                    />

                    <div className="absolute inset-[3px] flex items-center justify-center overflow-hidden 
                    rounded bg-background">
                        <TokenAvatar
                            iconUrl={iconUrl}
                            symbol={symbol}
                            name={name}
                            className="h-full w-full object-cover"
                            fallbackClassName="w-full h-full flex items-center justify-center"
                            enableHover={true}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default TokenCardAvatarSection;