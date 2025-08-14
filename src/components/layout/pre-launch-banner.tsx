"use client"

import { AlertTriangle, X } from "lucide-react"
import { useState, useEffect } from "react"
import { cn } from "@/utils"

export function PreLaunchBanner() {
	const [isVisible, setIsVisible] = useState(true)

	if (!isVisible) return null

	return (
		<div
			className={cn(
				"fixed py-2 top-0 left-0 right-0 z-50 transition-all duration-300",
				"bg-yellow-500/10 border-b border-yellow-500/20 backdrop-blur-sm"
			)}
		>
			<div className="container mx-auto px-4 relative">
				<div className="flex items-center justify-center">
					<div className="flex items-center gap-2">
						<AlertTriangle className={cn(
							"text-yellow-500 flex-shrink-0 h-4 w-4"
						)} />
						<span className="font-mono font-bold text-yellow-500 uppercase text-xs sm:text-sm">
							PRE-LAUNCH::TESTING
						</span>
					</div>
				</div>
			</div>
		</div>
	)
}