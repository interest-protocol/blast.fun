"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { navigationItems } from "@/constants/navigation"
import { cn } from "@/utils"

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
						className="group relative px-4 py-2 transition-all duration-300"
					>
						{/* Cyberpunk active border effect */}
						{isActive && (
							<>
								<div className="absolute bottom-0 left-0 right-0 h-[2px] bg-destructive" />
								<div className="absolute bottom-0 left-0 right-0 h-[2px] bg-destructive/50 blur-sm" />
							</>
						)}

						<span className={cn(
							"relative z-10 flex items-center gap-2 font-mono text-xs uppercase tracking-wider transition-all duration-200",
							isActive
								? "text-primary"
								: "text-muted-foreground/70 group-hover:text-foreground/90"
						)}>
							<item.icon className={cn(
								"h-4 w-4 transition-all duration-300",
								isActive
									? "text-primary"
									: "text-muted-foreground/70 group-hover:text-foreground/90"
							)} />
							{item.label}
						</span>
					</Link>
				)
			})}
		</nav>
	)
}
