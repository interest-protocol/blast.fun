"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Logo } from "../ui/logo"
import { UserDropdown } from "../user/user-dropdown"
import { TradeTicker } from "./trade-ticker"
import { navigationItems } from "@/constants/navigation"
import { cn } from "@/utils"
import { useMounted } from "@/hooks/use-mounted"

export default function Header() {
	const pathname = usePathname()
	const mounted = useMounted()

	return (
		<header className="sticky top-0 z-50 border-b border-border/30">
			<div className="h-8 bg-card/50 border-b border-border/30">
				<TradeTicker />
			</div>

			<div className="h-12 px-4 flex items-center gap-6">
				<Link href="/" className="group flex items-center gap-2">
					<Logo className="size-8 text-foreground group-hover:text-destructive transition-colors duration-200" />
					<span className="hidden sm:inline-block font-mono font-black text-lg text-foreground group-hover:text-destructive transition-colors duration-200">
						BLAST.FUN
					</span>
				</Link>

				<div className="hidden lg:flex items-center gap-2">
					{navigationItems.map((item) => {
						const Icon = item.icon
						const isActive = mounted && pathname === item.href
						return (
							<Link
								key={item.href}
								href={item.href}
								className={cn(
									"flex items-center gap-2 px-2 h-9 text-xs font-mono font-semibold uppercase rounded-lg transition-all",
									isActive
										? "text-foreground bg-destructive/10 border border-destructive/30"
										: "text-muted-foreground hover:text-foreground hover:bg-accent/50 border border-transparent"
								)}
							>
								<Icon className="size-3.5" />
								{item.label}
							</Link>
						)
					})}
				</div>

				<div className="flex-1" />

				<div className="flex-shrink-0 flex items-center gap-2">
					<UserDropdown />
				</div>
			</div>
		</header>
	)
}
