import { FC } from "react";
import { CreatorStatCardProps } from "./creator-stat-card.types"

const CreatorStatCard: FC<CreatorStatCardProps> = ({
    icon: Icon,
    value,
    label,
    glowColor = "primary",
    borderColor = "primary",
    iconColor = "primary",
}) => {
    return(
        <div className = "relative group flex-1" >
            <div
                className={`absolute inset-0 bg-${glowColor}/20 blur-xl rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
            />
            <div
                className={`relative p-2.5 border-2 border-dashed border-border/20 bg-background/50 backdrop-blur-sm rounded transition-all duration-300 group-hover:border-${borderColor}/40`}
            >
                <Icon className={`h-4 w-4 text-${iconColor}/80 mb-1`} />
                <p className="font-mono text-sm font-bold text-foreground/80 whitespace-nowrap">
                    {value}
                </p>
                <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                    {label}
                </p>
            </div>
        </div >
    );
}

export default CreatorStatCard;