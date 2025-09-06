"use client"

import { useEffect, useState } from "react"

const breakpoints = {
	sm: 640,
	md: 768,
	lg: 1024,
	xl: 1280,
	"2xl": 1536,
} as const

export function useBreakpoint() {
	// @dev: Initialize with desktop view to match server-side rendering
	const [windowSize, setWindowSize] = useState(() => {
		if (typeof window !== "undefined") {
			return {
				width: window.innerWidth,
				height: window.innerHeight,
			}
		}
		return {
			width: 1920,
			height: 1080,
		}
	})
	const [isHydrated, setIsHydrated] = useState(false)

	useEffect(() => {
		setIsHydrated(true)
		const handleResize = () => {
			setWindowSize({
				width: window.innerWidth,
				height: window.innerHeight,
			})
		}

		// @dev: Set actual window size after hydration
		handleResize()
		window.addEventListener("resize", handleResize)

		return () => window.removeEventListener("resize", handleResize)
	}, [])

	// @dev: Always return desktop view during SSR to prevent hydration mismatch
	const isMobile = isHydrated ? windowSize.width < breakpoints.lg : false
	const isTablet = isHydrated ? windowSize.width >= breakpoints.md && windowSize.width < breakpoints.lg : false
	const isDesktop = isHydrated ? windowSize.width >= breakpoints.lg : true

	const isAbove = (breakpoint: keyof typeof breakpoints) => {
		return isHydrated ? windowSize.width >= breakpoints[breakpoint] : true
	}

	const isBelow = (breakpoint: keyof typeof breakpoints) => {
		return isHydrated ? windowSize.width < breakpoints[breakpoint] : false
	}

	return {
		isMobile,
		isTablet,
		isDesktop,
		isAbove,
		isBelow,
		width: windowSize.width,
		height: windowSize.height,
		isHydrated,
	}
}
