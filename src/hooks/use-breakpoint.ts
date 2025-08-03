"use client"

import { useState, useEffect } from "react"

const breakpoints = {
	sm: 640,
	md: 768,
	lg: 1024,
	xl: 1280,
	"2xl": 1536,
} as const

export function useBreakpoint() {
	const [windowSize, setWindowSize] = useState({
		width: typeof window !== "undefined" ? window.innerWidth : 0,
		height: typeof window !== "undefined" ? window.innerHeight : 0,
	})

	useEffect(() => {
		const handleResize = () => {
			setWindowSize({
				width: window.innerWidth,
				height: window.innerHeight,
			})
		}

		window.addEventListener("resize", handleResize)
		handleResize()

		return () => window.removeEventListener("resize", handleResize)
	}, [])

	const isMobile = windowSize.width < breakpoints.lg
	const isTablet = windowSize.width >= breakpoints.md && windowSize.width < breakpoints.lg
	const isDesktop = windowSize.width >= breakpoints.lg

	const isAbove = (breakpoint: keyof typeof breakpoints) => {
		return windowSize.width >= breakpoints[breakpoint]
	}

	const isBelow = (breakpoint: keyof typeof breakpoints) => {
		return windowSize.width < breakpoints[breakpoint]
	}

	return {
		isMobile,
		isTablet,
		isDesktop,
		isAbove,
		isBelow,
		width: windowSize.width,
		height: windowSize.height,
	}
}