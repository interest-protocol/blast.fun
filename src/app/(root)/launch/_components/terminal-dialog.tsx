"use client"

import { ArrowRight, Terminal } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { cn } from "@/utils"
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
	pendingToken: {
		treasuryCapObjectId: string
		txDigest: string
	} | null
	onResume?: () => void
}

export function TerminalDialog({
	open,
	onOpenChange,
	logs,
	isLaunching,
	result,
	pendingToken,
	onResume,
}: TerminalDialogProps) {
	const logsEndRef = useRef<HTMLDivElement>(null)
	const [cursorBlink, setCursorBlink] = useState(true)
	const router = useRouter()

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
					"-translate-x-1/2 -translate-y-1/2 fixed top-1/2 left-1/2 w-[90vw] max-w-[600px] p-0",
					"slide-in-from-bottom-4 fade-in animate-in",
					"[&>button:first-of-type]:hidden"
				)}
				onKeyDown={handleKeyDown}
			>
				<div className="relative">
					<div className="absolute inset-0 rounded-lg bg-primary/15 blur-3xl" />
					<div
						className={cn(
							"relative rounded-lg bg-background backdrop-blur-md",
							"select-none font-mono text-xs shadow-2xl"
						)}
					>
						{/* Terminal Header */}
						<div className="flex items-center gap-2 border-primary/20 border-b px-4 py-3">
							<div className="flex gap-1.5">
								<div className="h-3 w-3 rounded-full bg-red-500/80" />
								<div className="h-3 w-3 rounded-full bg-yellow-500/80" />
								<div className="h-3 w-3 rounded-full bg-green-500/80" />
							</div>
							<Terminal className="ml-2 h-3 w-3 text-primary/80" />
							<span className="font-bold text-primary/80 uppercase">DEPLOYMENT::TERMINAL</span>
							<div className="flex-1" />
							<span className="mr-2 font-medium text-[10px] text-muted-foreground/80 uppercase">
								{!isLaunching && "ESC TO CLOSE"}
							</span>
						</div>

						{/* Terminal Body */}
						<div className="p-4">
							<div className="max-h-[400px] space-y-1 overflow-y-auto overflow-x-hidden">
								{logs.map((log, index) => (
									<div
										key={index}
										className={cn(
											"slide-in-from-left-2 flex animate-in gap-2",
											log.type === "error" && "text-destructive",
											log.type === "success" && "text-green-500",
											log.type === "warning" && "text-yellow-500"
										)}
									>
										<span className="flex-shrink-0 text-muted-foreground/80">[{log.timestamp}]</span>
										<span className="break-all font-medium">{log.message}</span>
									</div>
								))}

								{isLaunching && (
									<div className="mt-2 flex gap-2">
										<span className="text-muted-foreground/80">[--:--:--]</span>
										<span className="font-medium text-primary">
											PROCESSING
											<span
												className={cn(
													"ml-1 inline-block h-4 w-2 bg-primary",
													cursorBlink ? "opacity-100" : "opacity-0"
												)}
											/>
										</span>
									</div>
								)}

								{result && (
									<>
										<div className="mt-3 text-muted-foreground/80">
											<span>{"─".repeat(50)}</span>
										</div>
										<div className="mt-2 space-y-1">
											<div className="text-green-500">DEPLOYMENT::COMPLETE</div>
										</div>
										<div className="mt-4 flex justify-center">
											<button
												onClick={() => router.push(`/token/${result.poolObjectId}`)}
												className="flex items-center gap-2 rounded border border-primary/50 bg-primary/20 px-6 py-2 font-mono text-primary text-xs uppercase transition-all hover:bg-primary/30 hover:shadow-[0_0_20px_rgba(0,255,0,0.3)]"
											>
												GO TO TOKEN PAGE <ArrowRight className="h-3 w-3" />
											</button>
										</div>
									</>
								)}

								{/* Recovery */}
								{!result && !isLaunching && pendingToken && onResume && (
									<div className="mt-3 rounded border border-amber-500/50 bg-amber-500/5 p-3">
										<div className="flex items-center justify-between gap-3">
											<div className="flex flex-1 items-center gap-2">
												<Terminal className="h-3 w-3 flex-shrink-0 text-amber-500" />
												<div className="flex-1">
													<div className="font-medium text-amber-500 text-xs">
														RECOVERY::AVAILABLE
													</div>
													<div className="text-[10px] text-muted-foreground">
														TREASURY::{pendingToken.treasuryCapObjectId.slice(0, 6)}...
														{pendingToken.treasuryCapObjectId.slice(-4)}
													</div>
												</div>
											</div>
											<button
												onClick={onResume}
												className="rounded border border-amber-500/50 bg-amber-500/20 px-3 py-1 font-mono text-amber-500 text-xs uppercase transition-colors hover:bg-amber-500/30"
											>
												RETRY
											</button>
										</div>
									</div>
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
