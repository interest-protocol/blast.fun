import { FC } from "react"
import { Users } from "lucide-react"

import { ProtectionBadges } from "@/components/shared/protection-badges"
import { RelativeAge } from "@/components/shared/relative-age"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { formatNumberWithSuffix } from "@/utils/format"
import CreatorHoverCard from "@/components/creator/creator-hover-card"
import { TokenCardMainContentProps } from "./token-card-main-content.types"
import { CreatorDisplay } from "@/components/creator/creator-display"
import { socialIcons } from "./token-card-main-content.data"

const TokenCardMainContent: FC<TokenCardMainContentProps> = ({ token }) => {
    const socialLinks = socialIcons
        .map((item) => ({
            href: token[item.key as keyof typeof token] as string | undefined,
            icon: item.icon,
            tooltip: item.label,
        }))
        .filter((link) => !!link.href)

    const showProtection =
        token.isProtected ||
        token.protectionSettings ||
        (typeof token.burnTax === "number" && token.burnTax > 0)

    return (
        <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-center gap-2">
                <h3 className="font-mono font-bold text-xs sm:text-sm uppercase 
                tracking-wider text-foreground/90 truncate">
                    {token.name || "[UNNAMED]"}
                </h3>
                {showProtection && (
                    <ProtectionBadges
                        protectionSettings={token.protectionSettings}
                        isProtected={!!token.isProtected}
                        burnTax={token.burnTax}
                        size="sm"
                    />
                )}
            </div>

            <div className="flex flex-wrap items-center gap-2 font-mono text-xs sm:gap-3">
                {token.marketCap > 0 && (
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <div className="flex items-center gap-1">
                                <span className="text-[9px] text-muted-foreground/60 uppercase
                                 tracking-wider sm:text-[10px]">MC</span>
                                <span className="font-semibold text-[11px] text-green-500/90 sm:text-xs">
                                    ${formatNumberWithSuffix(token.marketCap)}
                                </span>
                            </div>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p className="font-mono text-xs uppercase">MARKET CAP</p>
                        </TooltipContent>
                    </Tooltip>
                )}

                {(token.buyVolume + token.sellVolume) > 0 && (
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <div className="flex items-center gap-1">
                                <span className="text-[9px] text-muted-foreground/60 uppercase
                                 tracking-wider sm:text-[10px]">VOL</span>
                                <span className="font-semibold text-[11px] text-purple-500/90 sm:text-xs">
                                    ${formatNumberWithSuffix(token.buyVolume + token.sellVolume)}
                                </span>
                            </div>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p className="font-mono text-xs uppercase">24H VOLUME</p>
                        </TooltipContent>
                    </Tooltip>
                )}

                {token.holdersCount > 0 && (
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <div className="flex items-center gap-1">
                                <Users className="h-3 w-3 text-muted-foreground/60" />
                                <span className="font-semibold text-[11px] text-foreground/70 sm:text-xs">
                                    {formatNumberWithSuffix(token.holdersCount)}
                                </span>
                            </div>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p className="font-mono text-xs uppercase">HOLDERS</p>
                        </TooltipContent>
                    </Tooltip>
                )}
            </div>

            <div className="flex flex-col gap-1 font-mono text-[10px] sm:flex-row sm:items-center sm:gap-1.5 sm:text-xs">
                <div className="flex items-center gap-1.5">
                    <RelativeAge
                        timestamp={token.createdAt}
                        className="font-medium text-muted-foreground/60 uppercase tracking-wide"
                    />
                    <span className="hidden text-muted-foreground/40 sm:inline">·</span>

                    <div className="flex items-center gap-1">
                        <span className="hidden text-muted-foreground/60 uppercase tracking-wide sm:inline">by</span>
                        <CreatorHoverCard
                            walletAddress={token.dev}
                            twitterHandle={token.creatorData?.twitterHandle}
                            twitterId={token.creatorData?.twitterId}
                            data={token.creatorData}
                        >
                            <span>
                                <CreatorDisplay
                                    walletAddress={token.dev}
                                    twitterHandle={token.creatorData?.twitterHandle}
                                    twitterId={token.creatorData?.twitterId}
                                    className="cursor-pointer text-foreground/80 transition-colors hover:text-foreground"
                                />
                            </span>
                        </CreatorHoverCard>
                    </div>
                </div>

                {socialLinks.length > 0 && (
                    <>
                        <span className="hidden text-muted-foreground/40 sm:inline">·</span>
                        <div className="flex items-center gap-1.5">
                            {socialLinks.map((link, i) => {
                                const Icon = link.icon
                                return (
                                    <Tooltip key={i}>
                                        <TooltipTrigger asChild>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    e.preventDefault()
                                                    window.open(link.href, "_blank", "noopener,noreferrer")
                                                }}
                                                className="text-muted-foreground/60 hover:text-primary transition-colors p-0.5 hover:bg-accent/20 rounded-md"
                                            >
                                                <Icon className="h-3 w-3" />
                                            </button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p className="font-mono text-xs uppercase">{link.tooltip}</p>
                                        </TooltipContent>
                                    </Tooltip>
                                )
                            })}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default TokenCardMainContent;