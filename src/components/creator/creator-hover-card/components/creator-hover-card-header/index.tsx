import { FC } from "react"
import { CreatorHoverCardHeaderProps } from "./creator-hover-card-header.types"

const CreatorHoverCardHeader: FC<CreatorHoverCardHeaderProps> = ({ displayName }) => {
    return (
        <div className="flex items-center justify-between mb-4 pb-3 border-b-2 border-dashed border-border/20">
            <div>
                <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                    CREATOR IDENTITY
                </p>
                <p className="font-mono text-sm uppercase tracking-wider text-foreground/80 mt-1">
                    {displayName}
                </p>
            </div>
        </div>
    );
}

export default CreatorHoverCardHeader;