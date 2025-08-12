"use client"

import Header from "@/components/layout/header"
import { MobileNavigation } from "@/components/layout/mobile-nav"
import { TokenTabsHeader } from "@/components/layout/token-tabs-header"
import { Ticker } from "@/components/shared/ticker"
import { usePathname } from "next/navigation"

export default function Layout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	const pathname = usePathname()
	const isTokenPage = pathname.startsWith("/meme/")

	return (
		<div className="flex flex-col h-screen overflow-hidden">
			<Ticker />
			<Header />
			<TokenTabsHeader />

			<main className="flex-1 overflow-hidden pb-16 lg:pb-0">
				{isTokenPage ? (
					children
				) : (
					<div className="p-3 sm:p-4 md:p-6 h-full overflow-auto">{children}</div>
				)}
			</main>

			<MobileNavigation />
		</div>
	)
}
