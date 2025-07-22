"use client"

import { Terminal } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { cn } from "@/utils"
import { formatDigest, getTxExplorerUrl } from "@/utils/transaction"
import { LogEntry } from "../_hooks/use-launch-coin"

interface TerminalDialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	logs: LogEntry[]
	isLaunching: boolean
	result: {
		poolObjectId: string
		poolTxDigest: string
	} | null
}

export function TerminalDialog({ open, onOpenChange, logs, isLaunching, result }: TerminalDialogProps) {
	const logsEndRef = useRef<HTMLDivElement>(null)
	const [cursorBlink, setCursorBlink] = useState(true)

	useEffect(() => {
		if (logs.length > 0) {
			logsEndRef.current?.scrollIntoView({ behavior: "smooth" })
		}
	}, [logs])

	useEffect(() => {
		const interval = setInterval(() => {
			setCursorBlink((prev) => !prev)
		}, 500)
		return () => clearInterval(interval)
	}, [])

	const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
		if (e.key === "Escape" && !isLaunching) {
			onOpenChange(false)
		}
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent
				className={cn(
					"fixed p-0 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-[600px]",
					"animate-in slide-in-from-bottom-4 fade-in",
					"[&>button:first-of-type]:hidden"
				)}
				onKeyDown={handleKeyDown}
			>
				<div className="relative">
					<div className="absolute inset-0 bg-primary/15 blur-3xl rounded-lg" />
					<div
						className={cn(
							"relative bg-background backdrop-blur-md rounded-lg",
							"font-mono text-xs shadow-2xl select-none"
						)}
					>
						{/* Terminal Header */}
						<div className="flex items-center gap-2 px-4 py-3 border-b border-primary/20">
							<div className="flex gap-1.5">
								<div className="w-3 h-3 rounded-full bg-red-500/80" />
								<div className="w-3 h-3 rounded-full bg-yellow-500/80" />
								<div className="w-3 h-3 rounded-full bg-green-500/80" />
							</div>
							<Terminal className="h-3 w-3 text-primary/80 ml-2" />
							<span className="text-primary/80 font-bold uppercase">DEPLOYMENT::TERMINAL</span>
							<div className="flex-1" />
							<span className="text-muted-foreground/80 font-medium text-[10px] uppercase mr-2">
								{!isLaunching && "ESC TO CLOSE"}
							</span>
						</div>

						{/* Terminal Body */}
						<div className="p-4">
							<div className="space-y-1 max-h-[400px] overflow-y-auto overflow-x-hidden">
								{logs.map((log, index) => (
									<div
										key={index}
										className={cn(
											"flex gap-2 animate-in slide-in-from-left-2",
											log.type === "error" && "text-destructive",
											log.type === "success" && "text-green-500",
											log.type === "warning" && "text-yellow-500"
										)}
									>
										<span className="text-muted-foreground/80 flex-shrink-0">[{log.timestamp}]</span>
										<span className="font-medium break-all">{log.message}</span>
									</div>
								))}

								{isLaunching && (
									<div className="flex gap-2 mt-2">
										<span className="text-muted-foreground/80">[--:--:--]</span>
										<span className="font-medium text-primary">
											PROCESSING
											<span
												className={cn(
													"inline-block w-2 h-4 bg-primary ml-1",
													cursorBlink ? "opacity-100" : "opacity-0"
												)}
											/>
										</span>
									</div>
								)}

								{result && (
									<>
										<div className="text-muted-foreground/80 mt-3">
											<span>{"─".repeat(50)}</span>
										</div>
										<div className="mt-2 space-y-1">
											<div className="text-green-500">DEPLOYMENT::COMPLETE</div>
											<div>
												<a
													href={getTxExplorerUrl(result.poolTxDigest)}
													target="_blank"
													rel="noopener noreferrer"
													className="text-primary hover:underline"
												>
													VIEW::ON::EXPLORER
												</a>
											</div>
										</div>
									</>
								)}

								<div ref={logsEndRef} />
							</div>
						</div>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	)
}
