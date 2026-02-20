"use client"

import { FC } from "react"
import { Wrench } from "lucide-react"
import { cn } from "@/utils"

interface MaintenanceSectionProps {
	title?: string
	message?: string
	className?: string
	compact?: boolean
}

export const MaintenanceSection: FC<MaintenanceSectionProps> = ({
	title = "UNDER_MAINTENANCE",
	message = "This section is temporarily unavailable. Data source is being updated.",
	className,
	compact = false,
}) => (
	<div
		className={cn(
			"rounded-lg border border-amber-500/30 bg-amber-500/5 text-center",
			compact ? "p-4" : "p-8",
			className
		)}
		role="status"
		aria-label="Under maintenance"
	>
		<Wrench className={cn("mx-auto text-amber-500/80", compact ? "h-6 w-6 mb-2" : "h-8 w-8 mb-3")} />
		<p className="font-mono text-xs uppercase text-amber-600 dark:text-amber-400">{title}</p>
		{!compact && (
			<p className="mt-2 font-mono text-xs text-muted-foreground max-w-sm mx-auto">{message}</p>
		)}
	</div>
)
