"use client"

import { forwardRef, useMemo } from "react";
import { useResolveSuiNSName } from "@mysten/dapp-kit";
import { CreatorDisplayProps } from "./creator-display.types";
import { useCreatorDisplayData } from "./_hooks/use-display-data";

export const CreatorDisplay = forwardRef<
	HTMLButtonElement | HTMLAnchorElement,
	CreatorDisplayProps
>(({
	twitterHandle,
	twitterId,
	walletAddress,
	className = "",
	onClick,
	asLink = true,
	...props
}, ref) => {
	const { data: resolvedDomain } = useResolveSuiNSName(
		!twitterHandle && walletAddress ? walletAddress : null
	)

	const displayData = useCreatorDisplayData({
		twitterHandle,
		twitterId,
		walletAddress,
	})

	const handleClick = (e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => {
		if (onClick) {
			onClick(e)
		} else if (displayData.href && asLink) {
			e.stopPropagation()
			e.preventDefault()
			window.open(displayData.href, "_blank", "noopener,noreferrer")
		}
	}

	if (asLink && displayData.href) {
		return (
			<button
				ref={ref as React.Ref<HTMLButtonElement>}
				onClick={handleClick}
				className={`hover:underline bg-transparent border-none p-0 cursor-pointer ${className}`}
				{...props}
			>
				{displayData.display}
			</button>
		)
	}

	return (
		<button
			ref={ref as React.Ref<HTMLButtonElement>}
			onClick={handleClick}
			className={`${displayData.type === 'twitter' ? 'hover:underline' : ''} ${className}`}
			{...props}
		>
			{displayData.display}
		</button>
	)
})

CreatorDisplay.displayName = "CreatorDisplay";