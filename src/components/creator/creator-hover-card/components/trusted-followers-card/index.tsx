import { FC } from "react"
import { UserCheck } from "lucide-react"

import { TrustedFollowersCardProps } from "./trusted-followers-card.types"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { getTrustedFollowersColor, parseFormattedNumber } from "../../creator-hover-card.utils"

const TrustedFollowersCard: FC<TrustedFollowersCardProps> = ({ count }) =>{
    const parsedCount = parseFormattedNumber(count)
    const colorRgb = getTrustedFollowersColor(parsedCount)

    const handleBorderColor = (e: React.MouseEvent<HTMLDivElement>) => {
        e.currentTarget.style.borderColor = `rgba(${colorRgb}, 0.4)`
    }

    const handleBorderReset = (e: React.MouseEvent<HTMLDivElement>) => {
        e.currentTarget.style.borderColor = ''
    }

    return (
        <Tooltip delayDuration={2000}>
            <TooltipTrigger asChild>
                <div className="relative group flex-1 cursor-help">
                    <div
                        className="absolute inset-0 blur-xl rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        style={{ backgroundColor: `rgba(${colorRgb}, 0.2)` }}
                    />
                    <div
                        className="relative p-2.5 border-2 border-dashed border-border/20 bg-background/50 backdrop-blur-sm rounded transition-all duration-300"
                        onMouseEnter={handleBorderColor}
                        onMouseLeave={handleBorderReset}
                        style={{ "--tw-border-opacity": 1 } as React.CSSProperties}
                    >
                        <UserCheck
                            className="h-4 w-4 mb-1"
                            style={{ color: `rgba(${colorRgb}, 0.8)` }}
                        />
                        <p className="font-mono text-sm font-bold text-foreground/80 whitespace-nowrap">
                            {count}
                        </p>
                        <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                            TRUSTED
                        </p>
                    </div>
                </div>
            </TooltipTrigger>
            <TooltipContent className="max-w-[250px]">
                <p className="text-xs">
                    Followers actively engaged in crypto and verified by the community
                </p>
            </TooltipContent>
        </Tooltip>
    );
}

export default TrustedFollowersCard;