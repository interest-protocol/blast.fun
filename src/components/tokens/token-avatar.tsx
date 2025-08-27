"use client"

import { useState } from "react"
import { cn } from "@/utils"
import Image from "next/image"

interface TokenAvatarProps {
	iconUrl?: string
	symbol?: string
	name?: string
	className?: string
	fallbackClassName?: string
	enableNSFWCheck?: boolean
}

export function TokenAvatar({
	iconUrl,
	symbol,
	name,
	className = "w-12 h-12 rounded",
	fallbackClassName = "",
	enableNSFWCheck = true,
}: TokenAvatarProps) {
	const [imageError, setImageError] = useState(false)
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
		<Image
			src={iconUrl}
			alt={symbol || name || "Token"}
			unoptimized
			className={cn(
				"shadow-md object-cover",
				className
			)}
			onError={() => setImageError(true)}
		/>
	)
}
