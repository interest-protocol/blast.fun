import { Rocket, Users, UserCheck } from "lucide-react";

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { getColorRgb, parseFormattedNumber } from "../../creator-detailts.utils";

import { CreatorStatsProps } from "./creator-stats.types"

const CreatorStats = ({ data }: CreatorStatsProps) => {
    if (!data) {
        return (
            <div className="text-center py-3">
                <p className="font-mono text-xs uppercase text-muted-foreground">
                    DATA UNAVAILABLE
                </p>
            </div>
        )
    }

    return (
        <div className="flex gap-2">
            {/* Tokens Launched */}
            <div className="relative flex-1 group">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-primary/5 blur-sm rounded-lg opacity-75 group-hover:opacity-100 transition-opacity" />
                <div className="relative p-2.5 border border-primary/20 bg-background/80 backdrop-blur-sm rounded-lg hover:border-primary/40 transition-colors">
                    <div className="flex items-center justify-between mb-1">
                        <Rocket className="h-3.5 w-3.5 text-primary" />
                        <p className="font-mono text-sm font-bold text-foreground">
                            {data.launchCount}
                        </p>
                    </div>
                    <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                        Tokens
                    </p>
                </div>
            </div>

            {/* Trusted Followers */}
            <Tooltip>
                <TooltipTrigger asChild>
                    <div className="relative flex-1 cursor-help group">
                        {(() => {
                            const trustedCount = parseFormattedNumber(data.trustedFollowers)
                            const colorRgb = getColorRgb(trustedCount)
                            return (
                                <>
                                    <div
                                        className="absolute inset-0 blur-sm rounded-lg opacity-75 group-hover:opacity-100 transition-opacity"
                                        style={{ background: `linear-gradient(to bottom right, rgba(${colorRgb}, 0.15), rgba(${colorRgb}, 0.05))` }}
                                    />
                                    <div
                                        className="relative p-2.5 border bg-background/80 backdrop-blur-sm rounded-lg hover:border-opacity-60 transition-all"
                                        style={{ borderColor: `rgba(${colorRgb}, 0.3)` }}
                                    >
                                        <div className="flex items-center justify-between mb-1">
                                            <UserCheck
                                                className="h-3.5 w-3.5"
                                                style={{ color: `rgb(${colorRgb})` }}
                                            />
                                            <p className="font-mono text-sm font-bold text-foreground">
                                                {data.trustedFollowers}
                                            </p>
                                        </div>
                                        <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                                            Trusted
                                        </p>
                                    </div>
                                </>
                            )
                        })()}
                    </div>
                </TooltipTrigger>
                <TooltipContent className="max-w-[250px]">
                    <p className="text-xs">
                        Followers actively engaged in crypto and verified by the community
                    </p>
                </TooltipContent>
            </Tooltip>

            {/* Total Followers */}
            <div className="relative flex-1 group">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-blue-500/5 blur-sm rounded-lg opacity-75 group-hover:opacity-100 transition-opacity" />
                <div className="relative p-2.5 border border-blue-500/20 bg-background/80 backdrop-blur-sm rounded-lg hover:border-blue-500/40 transition-colors">
                    <div className="flex items-center justify-between mb-1">
                        <Users className="h-3.5 w-3.5 text-blue-500" />
                        <p className="font-mono text-sm font-bold text-foreground">
                            {data.followers}
                        </p>
                    </div>
                    <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                        Followers
                    </p>
                </div>
            </div>
        </div>
    );
}

export default CreatorStats;