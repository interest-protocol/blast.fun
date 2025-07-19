import { useCallback, useRef, useState } from "react"
import copyToClipboard from "copy-to-clipboard"

export function useClipboard(timeout = 2000) {
	const [copied, setCopied] = useState(false)

	const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

	const copy = (data: string) => {
		clearTimeout(timerRef.current)
		setCopied(true)
		copyToClipboard(data)
		timerRef.current = setTimeout(() => setCopied(false), timeout)
	}

	const reset = useCallback(() => {
		clearTimeout(timerRef.current)
		setCopied(false)
	}, [])

	return {
		copied,
		copy,
		reset,
	}
}
