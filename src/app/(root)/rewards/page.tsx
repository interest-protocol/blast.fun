"use client"

import { Skull } from "lucide-react"

export default function RewardsPage() {
	return (
		<div className="h-[calc(100vh-theme(spacing.16)-theme(spacing.12)-theme(spacing.14))] md:h-[calc(100vh-theme(spacing.16)-theme(spacing.12))] flex items-center justify-center">
			<div className="text-center">
				<Skull className="w-16 h-16 mx-auto text-foreground/20 mb-4" />
				<h1 className="font-mono text-2xl font-bold uppercase tracking-wider text-foreground/80 mb-2">
					COMING::SOON
				</h1>
				<p className="font-mono text-sm uppercase text-muted-foreground">
					REWARDS::PROGRAM::UNDER::CONSTRUCTION
				</p>
			</div>
		</div>
	)
}
