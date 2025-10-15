"use client"

import { ToolCard } from "./_components/tool-card"
import { toolItems } from "@/constants/tools"

export default function ToolsPage() {
	return (
		<div className="space-y-8">
			<div className="space-y-2">
				<h1 className="font-mono text-3xl uppercase tracking-wider font-bold">
					Tools
				</h1>
				<p className="text-muted-foreground">
					Powerful utilities for managing your tokens and conducting on-chain operations
				</p>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
				{toolItems.map((tool) => (
					<ToolCard key={tool.title} {...tool} />
				))}
			</div>
		</div>
	)
}