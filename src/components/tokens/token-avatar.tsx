"use client"

import { useState } from "react"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { cn } from "@/utils"

interface TokenAvatarProps {
	iconUrl?: string
	symbol?: string
	name?: string
	className?: string
	fallbackClassName?: string
	enableHover?: boolean
}

export function TokenAvatar({
	iconUrl,
	symbol,
	name,
	className = "w-12 h-12 rounded",
	fallbackClassName = "",
	enableHover = true,
}: TokenAvatarProps) {
	const [imageError, setImageError] = useState(false)
	const [preloadHover, setPreloadHover] = useState(false)
	const displayChar = symbol?.[0]?.toUpperCase() || name?.[0]?.toUpperCase() || "?"

	const renderFallback = () => (
		<div
			className={cn(
				"flex items-center justify-center border border-dashed bg-card font-bold font-mono text-foreground/80 shadow-md",
				className,
				fallbackClassName
			)}
		>
			{displayChar}
		</div>
	)

	const renderImage = () => (
		<>
			<img
				src={iconUrl}
				alt={symbol || name || "Token"}
				className={cn("object-cover shadow-md", className)}
				onError={() => setImageError(true)}
			/>
			{preloadHover && <link rel="preload" as="image" href={iconUrl} />}
		</>
	)

	if (!iconUrl || imageError) {
		return renderFallback()
	}

	if (!enableHover) {
		return renderImage()
	}

	return (
		<HoverCard openDelay={200} closeDelay={100}>
			<HoverCardTrigger asChild>
				<div className="cursor-pointer" onMouseEnter={() => setPreloadHover(true)}>
					{renderImage()}
				</div>
			</HoverCardTrigger>
			<HoverCardContent className="w-auto border-2 bg-background/95 p-1.5 backdrop-blur-sm" side="top" sideOffset={5}>
				<div className="relative">
					<img
						src={iconUrl}
						alt={symbol || name || "Token"}
						className="h-[150px] w-[150px] rounded-md object-cover"
					/>
					{symbol && (
						<div className="absolute right-1 bottom-1 left-1 rounded bg-black/60 px-2 py-1 backdrop-blur-sm">
							<p className="truncate text-center font-bold font-mono text-white text-xs">{symbol}</p>
						</div>
					)}
				</div>
			</HoverCardContent>
		</HoverCard>
	)
}
