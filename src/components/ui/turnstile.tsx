"use client"

import { useEffect, useRef, useState } from "react"
import { env } from "@/env"

interface TurnstileProps {
	onVerify: (token: string) => void
	onError?: () => void
	onExpire?: () => void
	onLoad?: () => void
	className?: string
	theme?: "light" | "dark" | "auto"
	size?: "normal" | "compact"
}

declare global {
	interface Window {
		turnstile?: {
			render: (element: HTMLElement, options: any) => string
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
	className = "",
	theme = "auto",
	size = "normal"
}: TurnstileProps) {
	const ref = useRef<HTMLDivElement>(null)
	const [widgetId, setWidgetId] = useState<string | null>(null)
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

		const id = window.turnstile.render(ref.current, {
			sitekey: env.NEXT_PUBLIC_CF_TURNSTILE_SITE_KEY,
			callback: onVerify,
			"error-callback": onError,
			"expired-callback": onExpire,
			theme,
			size
		})

		setWidgetId(id)

		return () => {
			if (id && window.turnstile) {
				window.turnstile.remove(id)
			}
		}
	}, [isLoaded, onVerify, onError, onExpire, theme, size])

	const reset = () => {
		if (widgetId && window.turnstile) {
			window.turnstile.reset(widgetId)
		}
	}

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