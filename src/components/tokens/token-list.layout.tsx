"use client"

import { memo, ReactNode } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/utils"

interface TokenListLayoutProps {
	title: string
	children: ReactNode
	className?: string
	headerClassName?: string
	scrollClassName?: string
	glowColor?: "blue" | "pink" | "gold"
	headerAction?: ReactNode
}

export const TokenListLayout = memo(function TokenListLayout({
	title,
	children,
	className,
	headerClassName,
	scrollClassName,
	glowColor = "blue",
	headerAction
}: TokenListLayoutProps) {
	const textGlowStyles = {
		blue: "text-blue-400 drop-shadow-[0_0_15px_rgba(59,130,246,0.7)] animate-pulse",
		pink: "text-pink-400 drop-shadow-[0_0_15px_rgba(236,72,153,0.7)] animate-pulse",
		gold: "text-yellow-600 drop-shadow-[0_0_15px_rgba(202,138,4,0.7)] animate-pulse"
	}

	return (
		<div className={cn("bg-card/20 border border-border/50 rounded-xl flex flex-col min-h-0 overflow-hidden", className)}>
			<div className={cn("px-4 py-3 border-b border-border/50 flex-shrink-0 flex items-center justify-between", headerClassName)}>
				<h2 className={cn(
					"font-mono text-xs uppercase tracking-wider font-bold",
					textGlowStyles[glowColor]
				)}>
					{title}
				</h2>
				{headerAction && (
					<div className="ml-auto">
						{headerAction}
					</div>
				)}
			</div>
			<ScrollArea className={cn("flex-1 overflow-hidden", scrollClassName)}>
				<div className="divide-y divide-border/30">
					{children}
				</div>
			</ScrollArea>
		</div>
	)
})