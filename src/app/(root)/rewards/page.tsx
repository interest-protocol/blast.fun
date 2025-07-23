"use client"

import { constructMetadata } from "@/lib/metadata";
import { Skull } from "lucide-react"

export const metadata = constructMetadata({
	title: "Rewards",
});

export default function RewardsPage() {
	return (
		<div className="container max-w-2xl mx-auto flex flex-col items-center justify-center min-h-[calc(100vh-12rem)]">
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
