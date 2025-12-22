import { FC } from "react"
import { Rocket, Users } from "lucide-react"

import CreatorStatCard from "../creator-stat-card"
import TrustedFollowersCard from "../trusted-followers-card"
import { CreatorStatsGridProps } from "./creator-stats-grid.types"

const CreatorStatsGrid: FC<CreatorStatsGridProps> = ({ data }) => {
    if (!data) {
        return (
            <div className="text-center py-6">
                <p className="font-mono text-xs uppercase text-muted-foreground">
                    DATA::UNAVAILABLE
                </p>
            </div>
        )
    }

    return (
        <div className="flex gap-2">
            <CreatorStatCard
                icon={Rocket}
                value={data.launchCount}
                label="TOKENS"
                glowColor="primary"
                borderColor="primary"
                iconColor="primary"
            />

            <TrustedFollowersCard count={data.trustedFollowers} />

            <CreatorStatCard
                icon={Users}
                value={data.followers}
                label="FOLLOWERS"
                glowColor="blue-500"
                borderColor="blue-500"
                iconColor="blue-500"
            />
        </div>
    );
}

export default CreatorStatsGrid;