"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { navigationItems } from "@/constants/navigation"
import { cn } from "@/utils"
import { Lock } from "lucide-react"

export function DesktopNav() {
	const pathname = usePathname()

	return (
		<nav className="hidden lg:flex items-center gap-1">
			{navigationItems.map((item) => {
				const isActive = pathname === item.href

				return (
					<Link
						key={item.href}
						href={item.href}
						className={cn(
							"group relative px-5 py-2.5 rounded-xl transition-all duration-300",
							"hover:bg-destructive/10",
							isActive && "bg-destructive/15"
						)}
					>
						<span className={cn(
							"relative z-10 flex items-center gap-2.5 font-mono text-xs uppercase tracking-wider transition-all duration-300",
							isActive ? "text-destructive font-bold" : "text-muted-foreground hover:text-foreground"
						)}>
							<item.icon className={cn(
								"h-4 w-4 transition-all duration-300",
								isActive && "text-destructive",
								"group-hover:scale-110"
							)} />
							{item.label}
						</span>

						{/* Active indicator */}
						{isActive && (
							<div className="absolute inset-0 bg-gradient-to-r from-destructive/0 via-destructive/10 to-destructive/0 rounded-xl" />
						)}
					</Link>
				)
			})}
		</nav>
	)
}
