"use client"

import { useState } from "react"
import { cn } from "@/utils"

interface TokenAvatarProps {
	iconUrl?: string
	symbol?: string
	name?: string
	className?: string
	fallbackClassName?: string
}

export function TokenAvatar({
	iconUrl,
	symbol,
	name,
	className = "w-12 h-12 rounded",
	fallbackClassName = "",
}: TokenAvatarProps) {
	const [imageError, setImageError] = useState(false)

	// Get display character for fallback
	const displayChar = symbol?.[0]?.toUpperCase() || name?.[0]?.toUpperCase() || "?"

	if (!iconUrl || imageError) {
		return (
			<div
				className={cn(
					"flex items-center justify-center shadow-md bg-card border border-dashed text-foreground/80 font-mono font-bold",
					className,
					fallbackClassName
				)}
			>
				{displayChar}
			</div>
		)
	}

	return (
		<img
			src={iconUrl}
			alt={symbol || name || "Token"}
			className={cn("object-cover", className)}
			onError={() => setImageError(true)}
		/>
	)
}
