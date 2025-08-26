"use client"

import Link from "next/link"
import { useApp } from "@/context/app.context"
import Balance from "../balance"
import { ThemeSwitcher } from "../shared/theme-switcher"
import { UserDropdown } from "../user/user-dropdown"
import { DesktopNav } from "./desktop-nav"
import { SearchToken } from "../shared/search-token"
import { Logo } from "../ui/logo"
import { AudioToggle } from "../audio/audio-toggle"
import { Wrench } from "lucide-react"

export default function Header() {
	const { isConnected } = useApp()

	return (
		<header className="sticky top-0 z-50 bg-background/95 backdrop-blur-xl border-b border-border/50">
			<div className="h-16 px-4 xl:px-8 flex items-center justify-between">
				{/* Logo and Navigation */}
				<div className="flex items-center gap-8 xl:gap-12">
					<Link href="/" className="group flex items-center gap-2.5">
						<Logo className="h-8 w-8 text-destructive group-hover:text-destructive/80 transition-colors" />
						<span className="hidden sm:inline-block font-black text-lg text-foreground group-hover:text-destructive transition-colors">
							BLAST.FUN
						</span>
					</Link>

					<DesktopNav />
				</div>

				{/* Actions */}
				<div className="flex items-center gap-2">
					<SearchToken />
					<UserDropdown />
					{/* Utility Icon (below xl screens) */}
					<Link 
						href="/utility" 
						
						className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 size-9 rounded-xl ease-in-out duration-300 transition-all"
					>
						<Wrench className="h-4 w-4 text-muted-foreground" />
					</Link>
					<AudioToggle />
					<ThemeSwitcher />
				</div>
			</div>
		</header>
	)
}
