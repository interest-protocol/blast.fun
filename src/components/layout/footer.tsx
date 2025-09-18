"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ThemeSwitcher } from "../shared/theme-switcher"
import { TradeSettings } from "@/app/(root)/token/[coinType]/_components/trade-settings"
import { Settings } from "lucide-react"
import { BsTelegram, BsTwitterX } from "react-icons/bs"
import { Button } from "../ui/button"
import { cn } from "@/utils"
import { navigationItems } from "@/constants/navigation"
import { useMounted } from "@/hooks/use-mounted"

const socialLinks = [
	{ href: "https://x.com/blastdotfun", icon: BsTwitterX, label: "X" },
	// { href: "https://t.me/blastfun", icon: BsTelegram, label: "Telegram" }
]

export function Footer() {
	const pathname = usePathname()
	const [tradeSettingsOpen, setTradeSettingsOpen] = useState(false)
	const mounted = useMounted()

	return (
		<>
			<div className="hidden lg:block fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-xl border-t">
				<div className="h-12 px-3 flex items-center justify-between">
					{/* nav */}
					<div className="flex items-center gap-2">
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
									<span className="hidden sm:inline">{item.label}</span>
								</Link>
							)
						})}
					</div>

					{/* socials */}
					<div className="flex items-center gap-1">
						{/* trade preset settings */}
						<Button
							variant="ghost"
							size="icon"
							className="h-8 w-8 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all"
							onClick={() => setTradeSettingsOpen(true)}
						>
							<Settings className="h-3.5 w-3.5" />
						</Button>

						<ThemeSwitcher />
						<div className="hidden md:block w-px h-5 bg-border/30 mx-1" />

						{/* socials */}
						<div className="hidden md:flex items-center gap-1">
							{socialLinks.map((link) => (
								<Link
									key={link.label}
									href={link.href}
									target="_blank"
									rel="noopener noreferrer"
									className="inline-flex items-center justify-center h-8 w-8 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all"
								>
									<link.icon className="h-3.5 w-3.5" />
								</Link>
							))}
						</div>
					</div>
				</div>
			</div>

			<TradeSettings open={tradeSettingsOpen} onOpenChange={setTradeSettingsOpen} />
		</>
	)
}