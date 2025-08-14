"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { navigationItems } from "@/constants/navigation"
import { cn } from "@/utils"
import { useCustomNavigation } from "@/hooks/use-custom-navigation"
import { Lock } from "lucide-react"

export function MobileNavigation() {
	const pathname = usePathname()

	const { hideMainNav } = useCustomNavigation()
	if (hideMainNav) {
		return null
	}

	return (
		<div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl border-t border-border/50">
			<nav className="flex justify-evenly items-center w-full h-16 px-2">
				{navigationItems.map((item) => {
					const isActive = pathname === item.href
					const Icon = item.icon
					const isLaunchButton = item.label === "LAUNCH"

					if (isLaunchButton) {
						return (
							<div
								key={item.href}
								className="group flex flex-col justify-center items-center gap-1 py-2 px-4 min-w-0 relative cursor-not-allowed opacity-50"
							>
								<Lock
									className="h-5 w-5 text-muted-foreground"
								/>
								<span
									className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground"
								>
									{item.label}
								</span>
							</div>
						)
					}

					return (
						<Link
							key={item.href}
							href={item.href}
							className="group flex flex-col justify-center items-center gap-1 py-2 px-4 min-w-0 relative"
						>
							<Icon
								className={cn(
									"h-5 w-5 transition-all duration-300",
									isActive ? "text-destructive scale-110" : "text-muted-foreground group-active:scale-95"
								)}
							/>
							<span
								className={cn(
									"text-[10px] font-mono uppercase tracking-wider transition-colors duration-300",
									isActive ? "text-destructive font-semibold" : "text-muted-foreground"
								)}
							>
								{item.label}
							</span>
						</Link>
					)
				})}
			</nav>
		</div>
	)
}