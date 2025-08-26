"use client"

import { useResolveSuiNSName } from "@mysten/dapp-kit"
import { formatAddress } from "@mysten/sui/utils"
import { forwardRef, useMemo } from "react"

interface CreatorDisplayProps extends React.HTMLAttributes<HTMLElement> {
	twitterHandle?: string
	walletAddress?: string
	className?: string
	onClick?: (e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => void
	asLink?: boolean
}

export const CreatorDisplay = forwardRef<
	HTMLButtonElement | HTMLAnchorElement,
	CreatorDisplayProps
>(({
	twitterHandle,
	walletAddress,
	className = "",
	onClick,
	asLink = true,
	...props
}, ref) => {
	const { data: resolvedDomain } = useResolveSuiNSName(
		!twitterHandle && walletAddress ? walletAddress : null
	)

	const displayData = useMemo(() => {
		// priority: handle > resolved domain > wallet address
		if (twitterHandle) {
			return {
				display: `@${twitterHandle}`,
				href: `https://x.com/${twitterHandle}`,
				type: 'twitter' as const
			}
		}

		if (resolvedDomain) {
			return {
				display: resolvedDomain,
				href: null,
				type: 'domain' as const
			}
		}

		return {
			display: formatAddress(walletAddress || ""),
			href: null,
			type: 'wallet' as const
		}
	}, [twitterHandle, resolvedDomain, walletAddress])

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
			<a
				ref={ref as React.Ref<HTMLAnchorElement>}
				href={displayData.href}
				target="_blank"
				rel="noopener noreferrer"
				onClick={handleClick}
				className={`hover:underline ${className}`}
				{...props}
			>
				{displayData.display}
			</a>
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

CreatorDisplay.displayName = "CreatorDisplay"