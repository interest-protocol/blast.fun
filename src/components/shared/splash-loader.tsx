"use client"

import { AnimatePresence, motion } from "motion/react"
import { useEffect, useState } from "react"
import { Logo } from "@/components/ui/logo"

const loadingMessages = [
	"LOADING::TERMINAL",
	"CONNECTING::BLOCKCHAIN",
	"FETCHING::DATA",
	"PREPARING::INTERFACE",
]

export function SplashLoader() {
	const [messageIndex, setMessageIndex] = useState(0)

	useEffect(() => {
		const messageInterval = setInterval(() => {
			setMessageIndex((prev) => (prev + 1) % loadingMessages.length)
		}, 1200)

		return () => clearInterval(messageInterval)
	}, [])

	return (
		<div className="fixed z-[1000] inset-0 flex items-center justify-center bg-background overflow-hidden select-none">
			<div className="absolute inset-0">
				<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-foreground/5 blur-3xl rounded-full" />
			</div>

			<div className="relative flex flex-col items-center space-y-6">
				<motion.div
					initial={{ opacity: 0, y: -20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5 }}
					className="relative"
				>
					<div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full opacity-50" />
					<Logo className="relative w-16 h-16 text-foreground/80 animate-bounce" />
				</motion.div>

				<motion.h1
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: 0.2, duration: 0.5 }}
					className="font-mono font-bold text-2xl uppercase tracking-wider text-foreground/80"
				>
					XCTASY.FUN
				</motion.h1>

				<AnimatePresence mode="wait">
					<motion.p
						key={messageIndex}
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -10 }}
						transition={{ duration: 0.3 }}
						className="font-mono text-xs uppercase tracking-wider text-muted-foreground"
					>
						{loadingMessages[messageIndex]}
					</motion.p>
				</AnimatePresence>
			</div>
		</div>
	)
}