"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Logo } from "../ui/logo"
import { UserDropdown } from "../user/user-dropdown"
import { TradeTicker } from "./trade-ticker"
import { SearchToken } from "../shared/search-token"
import { navigationItems } from "@/constants/navigation"
import { cn } from "@/utils"
import { useMounted } from "@/hooks/use-mounted"

export default function Header() {
	const pathname = usePathname()
	const mounted = useMounted()

	return (
		<header className="sticky top-0 z-50 bg-background/95 backdrop-blur-xl border-b border-border/50">
			<div className="h-16 px-4 xl:px-8 flex items-center gap-4">
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
									"flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-semibold uppercase rounded-lg transition-all",
									isActive
										? "text-foreground bg-destructive/10 border border-destructive/30"
										: "text-muted-foreground hover:text-foreground hover:bg-accent/50"
								)}
							>
								<Icon className="h-3.5 w-3.5" />
								<span className="hidden xl:inline">{item.label}</span>
							</Link>
						)
					})}
				</div>

				<TradeTicker />

				<div className="flex-shrink-0 flex items-center gap-2">
					<SearchToken mode="header" />
					<UserDropdown />
				</div>
			</div>
		</header>
	)
}
