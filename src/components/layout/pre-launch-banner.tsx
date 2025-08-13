"use client"

import { AlertTriangle, X } from "lucide-react"
import { useState, useEffect } from "react"
import { cn } from "@/utils"

export function PreLaunchBanner() {
	const [isVisible, setIsVisible] = useState(true)
	const [isMinimized, setIsMinimized] = useState(false)

	// Check localStorage for banner state
	useEffect(() => {
		const bannerState = localStorage.getItem("prelaunch-banner-minimized")
		if (bannerState === "true") {
			setIsMinimized(true)
		}
	}, [])

	const handleMinimize = () => {
		setIsMinimized(!isMinimized)
		localStorage.setItem("prelaunch-banner-minimized", (!isMinimized).toString())
	}

	if (!isVisible) return null

	return (
		<div
			className={cn(
				"fixed top-0 left-0 right-0 z-50 transition-all duration-300",
				"bg-yellow-500/10 border-b border-yellow-500/20 backdrop-blur-sm",
				isMinimized ? "py-1" : "py-2"
			)}
		>
			<div className="container mx-auto px-4 relative">
				<div className="flex items-center justify-center">
					<div className="flex items-center gap-2">
						<AlertTriangle className={cn(
							"text-yellow-500 flex-shrink-0",
							isMinimized ? "h-3 w-3" : "h-4 w-4"
						)} />
						<span className={cn(
							"font-mono font-bold text-yellow-500 uppercase",
							isMinimized ? "text-[10px]" : "text-xs sm:text-sm"
						)}>
							PRE-LAUNCH::TESTING
						</span>
					</div>

				</div>
				
				{/* Minimize button positioned absolutely */}
				<button
					onClick={handleMinimize}
					className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-yellow-500/10 rounded transition-colors"
					aria-label={isMinimized ? "Expand banner" : "Minimize banner"}
				>
					<div className={cn(
						"h-3 w-3 text-yellow-500/60 hover:text-yellow-500 transition-transform",
						isMinimized ? "rotate-180" : ""
					)}>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
						>
							<polyline points="6 9 12 15 18 9" />
						</svg>
					</div>
				</button>
			</div>
		</div>
	)
}