"use client"

import { Turnstile } from "@/components/ui/turnstile"
import { useTurnstile } from "@/context/turnstile.context"
import { cn } from "@/utils"
import { CheckCircle2 } from "lucide-react"

interface TurnstileSectionProps {
	className?: string
}

export function TurnstileSection({ className }: TurnstileSectionProps) {
	const { setToken, resetToken, refreshTrigger, isRequired, isSlushWallet } = useTurnstile()

	if (!isRequired) {
		return null
	}

	// @dev: Show special message for Slush wallet users
	if (isSlushWallet) {
		return (
			<div className={cn("p-3 rounded-lg border border-green-500/30 bg-green-500/5", className)}>
				<div className="flex items-center gap-2 justify-center text-green-600 dark:text-green-400">
					<CheckCircle2 className="h-5 w-5" />
					<span className="text-sm font-medium">Slush Wallet detected - Verification bypassed</span>
				</div>
			</div>
		)
	}

	return (
		<div className={cn("p-2 rounded-lg border border-border/30 bg-muted/5", className)}>
			<div className="flex flex-col items-center">
				<div className="w-full max-w-sm">
					<Turnstile
						onVerify={setToken}
						onError={resetToken}
						onExpire={resetToken}
						onReset={resetToken}
						refreshTrigger={refreshTrigger}
						className="w-full"
						theme="auto"
						size="normal"
					/>
				</div>
			</div>
		</div>
	)
}