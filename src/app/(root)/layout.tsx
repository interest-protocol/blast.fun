import Header from "@/components/layout/header"
import { Ticker } from "@/components/shared/ticker"
import { MobileNav } from "@/components/layout/mobile-nav"

export default function Layout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	return (
		<div className="flex flex-col h-screen overflow-hidden">
			<Ticker />
			<Header />

			<main className="flex-1 overflow-y-auto pb-14 md:pb-0">
				<div className="mx-auto max-w-7xl px-4 py-6">{children}</div>
			</main>

			<MobileNav />
		</div>
	)
}
