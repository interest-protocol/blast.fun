"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/utils"
import { navigationItems } from "@/constants/navigation"

export function MobileNav() {
	const pathname = usePathname()

	return (
		<div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-t-2">
			<nav className="flex justify-evenly items-center w-full h-14 px-2">
				{navigationItems.map((item) => {
					const isActive = pathname === item.href
					const Icon = item.icon

					return (
						<Link
							key={item.href}
							href={item.href}
							className="group flex flex-col justify-center items-center gap-1 py-2 px-4 min-w-0"
						>
							<div className="relative">
								<Icon
									className={cn(
										"h-5 w-5 transition-all duration-300",
										isActive ? "text-primary" : "text-muted-foreground group-active:text-foreground/80"
									)}
								/>

								{/* Glow effect on active */}
								{isActive && <div className="absolute inset-0 bg-primary/20 blur-md" />}
							</div>
							<span
								className={cn(
									"text-[10px] font-mono uppercase tracking-wider transition-colors duration-300",
									isActive ? "text-primary" : "text-muted-foreground group-active:text-foreground/80"
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
