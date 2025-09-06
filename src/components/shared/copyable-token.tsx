"use client"

import { Check, Copy } from "lucide-react"
import { useClipboard } from "@/hooks/use-clipboard"
import { cn } from "@/utils"

interface CopyableTokenProps {
	symbol: string
	coinType: string
	className?: string
}

export function CopyableToken({ symbol, coinType, className }: CopyableTokenProps) {
	const { copy, copied } = useClipboard()

	return (
		<div
			className={cn(
				"flex items-center gap-1 transition-all duration-300",
				"text-muted-foreground hover:text-foreground",
				className
			)}
			onClick={(e) => {
				e.stopPropagation()
				e.preventDefault()
				copy(coinType)
			}}
		>
			<span className="font-mono text-xs uppercase">{symbol}</span>

			{copied ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
		</div>
	)
}
