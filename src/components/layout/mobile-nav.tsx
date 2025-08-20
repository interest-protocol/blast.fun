"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { navigationItems } from "@/constants/navigation"
import { cn } from "@/utils"
import { useCustomNavigation } from "@/hooks/use-custom-navigation"

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

					return (
						<Link
							key={item.href}
							href={item.href}
							className="group flex flex-col justify-center items-center gap-1 py-2 px-4 min-w-0 relative"
						>
							<Icon
								className={cn(
									"h-5 w-5 transition-all duration-300",
									isActive 
										? "text-primary" 
										: "text-muted-foreground/60 group-active:scale-95"
								)}
							/>
							<span
								className={cn(
									"text-[10px] font-mono uppercase tracking-wider transition-all duration-300",
									isActive 
										? "text-primary/90 font-semibold" 
										: "text-muted-foreground/60"
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