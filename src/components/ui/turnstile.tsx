"use client"

import { useEffect, useRef, useState } from "react"
import { env } from "@/env"

interface TurnstileOptions {
	sitekey: string
	callback: (token: string) => void
	"error-callback"?: () => void
	"expired-callback"?: () => void
	theme?: "light" | "dark" | "auto"
	size?: "normal" | "compact"
}

interface TurnstileProps {
	onVerify: (token: string) => void
	onError?: () => void
	onExpire?: () => void
	onLoad?: () => void
	onReset?: () => void
	className?: string
	theme?: "light" | "dark" | "auto"
	size?: "normal" | "compact"
	refreshTrigger?: number
}

declare global {
	interface Window {
		turnstile?: {
			render: (element: HTMLElement, options: TurnstileOptions) => string
			remove: (widgetId: string) => void
			reset: (widgetId: string) => void
		}
	}
}

export function Turnstile({
	onVerify,
	onError,
	onExpire,
	onLoad,
	onReset,
	className = "",
	theme = "auto",
	size = "normal",
	refreshTrigger = 0
}: TurnstileProps) {
	const ref = useRef<HTMLDivElement>(null)
	const [isLoaded, setIsLoaded] = useState(false)

	useEffect(() => {
		const script = document.createElement("script")
		script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js"
		script.async = true
		script.onload = () => {
			setIsLoaded(true)
			onLoad?.()
		}
		document.head.appendChild(script)

		return () => {
			document.head.removeChild(script)
		}
	}, [onLoad])

	useEffect(() => {
		if (!isLoaded || !ref.current || !window.turnstile) return

		// Clear the container before rendering
		if (ref.current) {
			ref.current.innerHTML = ''
		}

		const id = window.turnstile.render(ref.current, {
			sitekey: env.NEXT_PUBLIC_CF_TURNSTILE_SITE_KEY,
			callback: onVerify,
			"error-callback": onError,
			"expired-callback": onExpire,
			theme,
			size
		})

		// Call onReset when refresh is triggered and widget is rendered
		if (refreshTrigger > 0) {
			onReset?.()
		}

		return () => {
			if (id && window.turnstile) {
				try {
					window.turnstile.remove(id)
				} catch (error) {
					// Ignore removal errors
					console.warn('Turnstile removal error:', error)
				}
			}
		}
	}, [isLoaded, onVerify, onError, onExpire, theme, size, refreshTrigger, onReset])

	return (
		<div 
			ref={ref} 
			className={`turnstile-container ${className}`}
			style={{
				width: '100%',
				minHeight: '65px',
				display: 'flex',
				justifyContent: 'center',
				alignItems: 'center'
			}}
		/>
	)
}