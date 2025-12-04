"use client"

import { ArrowLeft } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import AirdropTools from "./_components/airdrop-tools"

export default function AirdropPage() {
	return (
		<div className="flex flex-col gap-4 lg:h-full lg:min-h-0">
			<div className="lg:flex-shrink-0">
				<Link href="/tools">
					<Button variant="ghost" size="sm" className="gap-2 font-mono uppercase tracking-wider">
						<ArrowLeft className="h-4 w-4" />
						Back to Tools
					</Button>
				</Link>
			</div>

			<div className="lg:flex-1 lg:min-h-0">
				<AirdropTools />
			</div>
		</div>
	)
}
