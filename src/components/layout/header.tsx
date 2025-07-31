"use client"

import Link from "next/link"
import { useApp } from "@/context/app.context"
import Balance from "../balance"
import { ThemeSwitcher } from "../shared/theme-switcher"
import { UserDropdown } from "../user/user-dropdown"
import { DesktopNav } from "./desktop-nav"
import { Logo } from "../ui/logo"
import { AudioToggle } from "../audio/audio-toggle"

export default function Header() {
	const { isConnected } = useApp()

	return (
		<header className="flex h-14 sticky top-0 border-b-2 bg-background/80 backdrop-blur-md z-50">
			<div className="3xl:px-0 top-0 z-[90] mx-auto flex w-full max-w-9xl shrink-0 items-center justify-between px-3 lg:grid lg:grid-cols-3">
				<div className="flex items-center gap-2">
					<Link href="/" className="group flex items-center gap-2">
						<Logo className="h-8 w-8 group-hover:text-foreground/70" />
						<span className="font-mono font-bold text-lg sm:text-xl uppercase tracking-wider group-hover:text-foreground/70 transition-colors duration-300">
							XTERM.FUN
						</span>
					</Link>
				</div>

				<div className="hidden lg:flex justify-center">
					<DesktopNav />
				</div>

				<div className="flex items-center justify-end gap-2 sm:gap-3">
					{isConnected && (
						<>
							<Balance className="hidden sm:block" />
							<div className="hidden sm:block h-6 w-[1px] bg-foreground/20" />
						</>
					)}

					<UserDropdown />
					<div className="hidden sm:block h-6 w-[1px] bg-foreground/20" />
					<AudioToggle />
					<ThemeSwitcher />
				</div>
			</div>
		</header>
	)
}
