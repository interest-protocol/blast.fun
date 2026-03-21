"use client"

import { TokenModule } from "./token-module"
import { TokenPageErrorBoundary } from "./token-page-error-boundary"
import type { Token } from "@/types/token"

interface TokenPageWrapperProps {
	pool: Token
	referral?: string
}

export function TokenPageWrapper({ pool, referral }: TokenPageWrapperProps) {
	return (
		<TokenPageErrorBoundary>
			<TokenModule pool={pool} referral={referral} />
		</TokenPageErrorBoundary>
	)
}
