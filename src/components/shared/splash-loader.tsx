"use client"

import type { ReactNode } from "react"
import { motion, AnimatePresence } from "motion/react"
import { useEffect, useState } from "react"

const systemMessages = [
	"INITIALIZING::SYSTEM",
	"LOADING::PROTOCOLS",
	"VERIFYING::IDENTITY",
	"ESTABLISHING::CONNECTION",
	"SYNCING::BLOCKCHAIN",
	"INDEXING::DATA",
	"PREPARING::INTERFACE",
]

export function SplashLoader() {
	const [messageIndex, setMessageIndex] = useState(0)
	const [progress, setProgress] = useState(0)
	const [glitchText, setGlitchText] = useState("X::PUMP")

	useEffect(() => {
		const messageInterval = setInterval(() => {
			setMessageIndex((prev) => (prev + 1) % systemMessages.length)
		}, 800)

		const progressInterval = setInterval(() => {
			setProgress((prev) => Math.min(prev + Math.random() * 20, 100))
		}, 200)

		const glitchInterval = setInterval(() => {
			const glitchChars = "!@#$%^&*()_+-=[]{}|;:,.<>?"
			const originalText = "X::PUMP"
			let glitched = ""

			for (let i = 0; i < originalText.length; i++) {
				if (Math.random() > 0.8) {
					glitched += glitchChars[Math.floor(Math.random() * glitchChars.length)]
				} else {
					glitched += originalText[i]
				}
			}

			setGlitchText(glitched)

			setTimeout(() => setGlitchText(originalText), 100)
		}, 1500)

		return () => {
			clearInterval(messageInterval)
			clearInterval(progressInterval)
			clearInterval(glitchInterval)
		}
	}, [])

	return (
		<div className="fixed z-[1000] inset-0 flex items-center justify-center bg-background overflow-hidden select-none">
			{/* Atmospheric effects */}
			<div className="absolute inset-0">
				<div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/15 blur-3xl rounded-full animate-pulse" />
				<div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/10 blur-3xl rounded-full animate-pulse delay-1000" />
			</div>

			<div className="relative flex flex-col items-center space-y-8">
				{/* Logo */}
				<motion.div
					initial={{ opacity: 0, scale: 0.8 }}
					animate={{ opacity: 1, scale: 1 }}
					transition={{ delay: 0.2, duration: 0.8 }}
					className="relative"
				>
					<div className="absolute inset-0 bg-primary/20 blur-xl rounded-full opacity-60" />
					<h1 className="relative font-mono font-bold text-6xl uppercase tracking-wider text-foreground/80">
						{glitchText}
					</h1>
				</motion.div>

				{/* Progress */}
				<motion.div
					initial={{ opacity: 0, width: 0 }}
					animate={{ opacity: 1, width: "300px" }}
					transition={{ delay: 0.4, duration: 0.6 }}
					className="w-full max-w-xs"
				>
					<div className="h-1 bg-foreground/10 relative overflow-hidden">
						<motion.div
							className="absolute top-0 left-0 h-full bg-primary/80"
							style={{ width: `${progress}%` }}
							transition={{ duration: 0.3 }}
						/>
					</div>
					<p className="font-mono text-xs uppercase text-muted-foreground/80 mt-2 text-center">
						PROGRESS::{Math.floor(progress)}%
					</p>
				</motion.div>

				{/* Messages */}
				<AnimatePresence mode="wait">
					<motion.div
						key={messageIndex}
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -10 }}
						transition={{ duration: 0.3 }}
						className="text-center space-y-2"
					>
						<p className="font-mono font-bold text-sm uppercase tracking-wider text-primary/80">
							{systemMessages[messageIndex]}
						</p>
					</motion.div>
				</AnimatePresence>
			</div>
		</div>
	)
}
