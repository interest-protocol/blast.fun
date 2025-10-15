"use client"

import { LucideIcon } from "lucide-react"
import Link from "next/link"
import { Card } from "@/components/ui/card"

interface ToolCardProps {
	title: string
	description: string
	icon: LucideIcon
	href: string
	comingSoon?: boolean
}

export function ToolCard({
	title,
	description,
	icon: Icon,
	href,
	comingSoon = false,
}: ToolCardProps) {
	const content = (
		<Card className="h-full p-6 transition-colors hover:border-muted-foreground/50">
			<div className="flex flex-col h-full">
				{comingSoon && (
					<div className="mb-3 self-end">
						<span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground/60 bg-secondary px-2 py-1 rounded">
							Coming Soon
						</span>
					</div>
				)}

				<div className="mb-4">
					<div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-secondary">
						<Icon className="w-6 h-6 text-foreground" />
					</div>
				</div>

				<div className="flex-1">
					<h3 className="text-lg font-semibold text-foreground mb-2">
						{title}
					</h3>
					<p className="text-sm text-muted-foreground leading-relaxed">
						{description}
					</p>
				</div>
			</div>
		</Card>
	)

	if (comingSoon) {
		return <div className="opacity-60 cursor-not-allowed">{content}</div>
	}

	return (
		<Link href={href} className="group">
			{content}
		</Link>
	)
}
