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
				const isLaunch = item.href === "/launch"
				
				// Still allow navigation to launch page to show the disabled state
				return (
					<Link
						key={item.href}
						href={item.href}
						className={cn(
							"group relative px-5 py-2.5 rounded-xl transition-all duration-300",
							isLaunch ? "hover:bg-yellow-500/10" : "hover:bg-destructive/10",
							isActive && !isLaunch && "bg-destructive/15",
							isActive && isLaunch && "bg-yellow-500/10"
						)}
					>
						<span className={cn(
							"relative z-10 flex items-center gap-2.5 font-mono text-xs uppercase tracking-wider transition-all duration-300",
							isActive && !isLaunch ? "text-destructive font-bold" : 
							isLaunch ? "text-yellow-500/60" : 
							"text-muted-foreground hover:text-foreground"
						)}>
							{isLaunch ? (
								<Lock className="h-3.5 w-3.5 text-yellow-500/60" />
							) : (
								<item.icon className={cn(
									"h-4 w-4 transition-all duration-300",
									isActive && "text-destructive",
									"group-hover:scale-110"
								)} />
							)}
							{item.label}
							{isLaunch && (
								<span className="text-[8px] bg-yellow-500/20 px-1.5 py-0.5 rounded text-yellow-500">
									SOON
								</span>
							)}
						</span>

						{/* Active indicator */}
						{isActive && !isLaunch && (
							<div className="absolute inset-0 bg-gradient-to-r from-destructive/0 via-destructive/10 to-destructive/0 rounded-xl" />
						)}
					</Link>
				)
			})}
		</nav>
	)
}
