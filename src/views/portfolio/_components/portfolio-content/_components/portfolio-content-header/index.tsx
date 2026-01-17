"use client"

import { FC } from "react"
import { Gift } from "lucide-react"

import { Button } from "@/components/ui/button"
import { PortfolioContentHeaderProps } from "./portfolio-content-header.types"

const PortfolioContentHeader: FC<PortfolioContentHeaderProps> = ({
    onOpenRewards
}) => {
    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="font-hegarty text-2xl uppercase tracking-wider">
                        PORTFOLIO
                    </h1>
                    <p className="font-mono text-sm text-muted-foreground mt-1">
                        Monitor your holdings and current performance.
                    </p>
                </div>
                <Button
                    variant="outline"
                    onClick={onOpenRewards}
                    className="font-mono uppercase tracking-wider flex items-center gap-2 border-2"
                >
                    <Gift className="h-4 w-4" />
                    CLAIM REWARDS
                </Button>
            </div>
        </div>
    )
}

export default PortfolioContentHeader