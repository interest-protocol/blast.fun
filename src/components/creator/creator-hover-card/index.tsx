"use client"

import { FC } from "react";
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from "@/components/ui/hover-card"
import CreatorStatsGrid from "./components/creator-stats-grid"
import { CreatorHoverCardProps } from "./creator-hover-card.types"
import { useCreatorDisplayName } from "./_hooks/use-creator-display-name"
import CreatorHoverCardHeader from "./components/creator-hover-card-header"

const CreatorHoverCard: FC<CreatorHoverCardProps> = ({
    twitterHandle,
    walletAddress,
    children,
    data,
}) => {
    const displayName = useCreatorDisplayName({
        twitterHandle,
        walletAddress,
    })

    return (
        <HoverCard>
            <HoverCardTrigger asChild>
                {children}
            </HoverCardTrigger>
            <HoverCardContent className="w-80 p-0 bg-background/50 backdrop-blur-sm
             border-2 border-border/40 shadow-2xl select-none" sideOffset={5}>
                <div className="p-4">
                    <CreatorHoverCardHeader displayName={displayName} />
                    <CreatorStatsGrid data={data} />
                </div>
            </HoverCardContent>
        </HoverCard>
    );
}

export default CreatorHoverCard;