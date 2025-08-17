"use client"

import { usePathname } from "next/navigation"

interface CustomNavConfig {
	pathPattern: RegExp
	hideMainNav: boolean
}

const customNavConfigs: CustomNavConfig[] = [
	{
		pathPattern: /^\/token\/[^\/]+$/,  // /token/[poolId]
		hideMainNav: true
	},
]

export function useCustomNavigation() {
	const pathname = usePathname()

	const config = customNavConfigs.find(config =>
		config.pathPattern.test(pathname)
	)

	return {
		hasCustomNav: !!config,
		hideMainNav: config?.hideMainNav ?? false
	}
}