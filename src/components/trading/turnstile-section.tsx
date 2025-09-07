"use client"

import { useTurnstile } from "@/context/turnstile.context"
import { Turnstile } from "@/components/ui/turnstile"
import { cn } from "@/utils"

interface TurnstileSectionProps {
	className?: string
}

export function TurnstileSection({ className }: TurnstileSectionProps) {
	const { setToken, resetToken, refreshTrigger, isRequired } = useTurnstile()

	if (!isRequired) {
		return null
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