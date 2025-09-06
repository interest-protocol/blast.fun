"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { navigationItems } from "@/constants/navigation"
import { useCustomNavigation } from "@/hooks/use-custom-navigation"
import { cn } from "@/utils"

export function MobileNavigation() {
	const pathname = usePathname()

	const { hideMainNav } = useCustomNavigation()
	if (hideMainNav) {
		return null
	}

	return (
		<div className="fixed right-0 bottom-0 left-0 z-50 border-border/50 border-t bg-background/95 backdrop-blur-xl lg:hidden">
			<nav className="flex h-16 w-full items-center justify-evenly px-2">
				{navigationItems
					.filter((item) => item.label !== "TOOLS")
					.map((item) => {
						const isActive = pathname === item.href
						const Icon = item.icon

						return (
							<Link
								key={item.href}
								href={item.href}
								className="group relative flex min-w-0 flex-col items-center justify-center gap-1 px-4 py-2"
							>
								<Icon
									className={cn(
										"h-5 w-5 transition-all duration-300",
										isActive ? "text-primary" : "text-muted-foreground/60 group-active:scale-95"
									)}
								/>
								<span
									className={cn(
										"font-mono text-[10px] uppercase tracking-wider transition-all duration-300",
										isActive ? "font-semibold text-primary/90" : "text-muted-foreground/60"
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
