"use client"

import { FC } from "react"

import { Card } from "@/components/ui/card"
import { cn } from "@/utils"
import { StatCardProps } from "./stats-card.types"

export const StatCard: FC<StatCardProps> = ({
  title,
  value,
  icon,
  color = "text-foreground/80",
  description,
  className
}) => {
  return (
    <Card className={cn("p-3 md:p-6 border-2 bg-background/50 backdrop-blur-sm", className)}>
      <div className="flex flex-col md:flex-row md:items-start md:justify-between">
        <div className="space-y-1 md:space-y-2">
          <div className="flex items-center justify-between md:block">
            <p className="font-mono text-[10px] md:text-xs uppercase tracking-wider text-muted-foreground">
              {title}
            </p>
            {icon && <div className="md:hidden">{icon}</div>}
          </div>
          <p className={cn("font-mono text-base md:text-2xl font-bold", color)}>
            {value}
          </p>
          {description && (
            <p className="font-mono text-xs md:text-sm text-muted-foreground/60">
              {description}
            </p>
          )}
        </div>
        {icon && <div className="hidden md:block">{icon}</div>}
      </div>
    </Card>
  )
}
