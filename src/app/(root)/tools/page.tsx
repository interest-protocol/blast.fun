"use client"

import { ToolCard } from "./_components/tool-card"
import { toolItems } from "@/constants/tools"

export default function ToolsPage() {
	return (
		<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
			{toolItems.map((tool) => (
				<ToolCard key={tool.title} {...tool} />
			))}
		</div>
	)
}