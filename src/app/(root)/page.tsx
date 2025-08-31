"use client"

import { NewlyCreated } from "@/components/tokens/newly-created"
import { NearGraduation } from "@/components/tokens/near-graduation"
import { GraduatedComplete } from "@/components/tokens/graduated-complete"
import { MobileTokenList } from "@/components/tokens/mobile-token-list"
import { PrivyRedirectHandler } from "@/components/auth/privy-redirect-handler"

export default function DiscoveryPage() {
	return (
		<>
			{/* @dev: Handle Privy auth redirects */}
			<PrivyRedirectHandler />
			
			{/* Desktop view - hidden on mobile */}
			<div className="hidden lg:grid h-full grid-cols-1 lg:grid-cols-3 gap-4">
				<NewlyCreated pollInterval={10000} />
				<NearGraduation pollInterval={10000} />
				<GraduatedComplete pollInterval={30000} />
			</div>

			{/* Mobile view - hidden on desktop */}
			<div className="lg:hidden h-full">
				<MobileTokenList />
			</div>
		</>
	)
}