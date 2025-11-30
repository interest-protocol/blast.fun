"use client"

import { FC } from "react"
import { Skeleton } from "@/components/ui/skeleton"

import { FarmAprProps } from "./farm-apr.types"

const FarmApr: FC<FarmAprProps> = ({ apr, isLoading = false }) => (
    <div className="flex flex-col items-end">
        <p className="font-mono text-xs text-muted-foreground uppercase tracking-wider">APR</p>
        {isLoading ? (
            <Skeleton className="h-6 md:h-7 w-20" />
        ) : (
            <p className="font-mono text-lg md:text-xl font-bold text-green-500">{apr.toFixed(2)}%</p>
        )}
    </div>
)

export default FarmApr