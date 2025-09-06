"use client"

import { AnimatePresence, motion } from "motion/react"
import { useEffect, useState } from "react"
import { Logo } from "@/components/ui/logo"

const loadingMessages = ["LOADING::TERMINAL", "CONNECTING::BLOCKCHAIN", "FETCHING::DATA", "PREPARING::INTERFACE"]

export function SplashLoader() {
	const [messageIndex, setMessageIndex] = useState(0)

	useEffect(() => {
		const messageInterval = setInterval(() => {
			setMessageIndex((prev) => (prev + 1) % loadingMessages.length)
		}, 1200)

		return () => clearInterval(messageInterval)
	}, [])

	return (
		<div className="fixed inset-0 z-[1000] flex select-none items-center justify-center overflow-hidden bg-background">
			<div className="absolute inset-0">
				<div className="-translate-x-1/2 -translate-y-1/2 absolute top-1/2 left-1/2 h-96 w-96 rounded-full bg-foreground/5 blur-3xl" />
			</div>

			<div className="relative flex flex-col items-center space-y-6">
				<motion.div
					initial={{ opacity: 0, y: -20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5 }}
					className="relative"
				>
					<div className="absolute inset-0 rounded-full bg-primary/20 opacity-50 blur-2xl" />
					<Logo className="relative h-16 w-16 animate-bounce text-foreground/80" />
				</motion.div>

				<motion.h1
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: 0.2, duration: 0.5 }}
					className="font-bold font-mono text-2xl text-foreground/80 uppercase tracking-wider"
				>
					BLAST.FUN
				</motion.h1>

				<AnimatePresence mode="wait">
					<motion.p
						key={messageIndex}
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -10 }}
						transition={{ duration: 0.3 }}
						className="font-mono text-muted-foreground text-xs uppercase tracking-wider"
					>
						{loadingMessages[messageIndex]}
					</motion.p>
				</AnimatePresence>
			</div>
		</div>
	)
}
