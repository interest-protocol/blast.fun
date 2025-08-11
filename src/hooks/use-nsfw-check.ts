import { useEffect, useState } from "react"
import { nsfwChecker } from "@/lib/nsfw-checker"

interface UseNSFWCheckOptions {
	enabled?: boolean
	fallbackBehavior?: "blur" | "hide" | "show"
}

interface UseNSFWCheckResult {
	isSafe: boolean | null
	isLoading: boolean
	error: Error | null
	shouldBlur: boolean
	shouldHide: boolean
}

export function useNSFWCheck(
	imageUrl: string | undefined,
	options: UseNSFWCheckOptions = {}
): UseNSFWCheckResult {
	const { enabled = true, fallbackBehavior = "blur" } = options

	const [isSafe, setIsSafe] = useState<boolean | null>(null)
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState<Error | null>(null)

	useEffect(() => {
		if (!imageUrl || !enabled) {
			setIsSafe(true)
			return
		}

		let cancelled = false
		const checkImage = async () => {
			try {
				setIsLoading(true)
				setError(null)

				const result = await nsfwChecker.checkImage(imageUrl)

				if (!cancelled) {
					setIsSafe(result)
				}
			} catch (err) {
				if (!cancelled) {
					setError(err instanceof Error ? err : new Error("Failed to check image"))

					// on error, apply fallback behavior
					setIsSafe(fallbackBehavior === "show")
				}
			} finally {
				if (!cancelled) {
					setIsLoading(false)
				}
			}
		}

		checkImage()

		return () => {
			cancelled = true
		}
	}, [imageUrl, enabled, fallbackBehavior])

	const shouldBlur = isSafe === false && fallbackBehavior === "blur"
	const shouldHide = isSafe === false && fallbackBehavior === "hide"

	return {
		isSafe,
		isLoading,
		error,
		shouldBlur,
		shouldHide,
	}
}

export function useNSFWBatchCheck(
	imageUrls: string[],
	options: UseNSFWCheckOptions = {}
): {
	results: Map<string, boolean>
	isLoading: boolean
	error: Error | null
} {
	const { enabled = true } = options

	const [results, setResults] = useState<Map<string, boolean>>(new Map())
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState<Error | null>(null)

	useEffect(() => {
		if (!imageUrls.length || !enabled) {
			setResults(new Map())
			return
		}

		let cancelled = false

		const checkImages = async () => {
			try {
				setIsLoading(true)
				setError(null)

				const checkResults = await nsfwChecker.checkImages(imageUrls)

				if (!cancelled) {
					setResults(checkResults)
				}
			} catch (err) {
				if (!cancelled) {
					setError(err instanceof Error ? err : new Error("Failed to check images"))

					// on error, mark all as safe
					const safeResults = new Map<string, boolean>()
					imageUrls.forEach(url => safeResults.set(url, true))
					setResults(safeResults)
				}
			} finally {
				if (!cancelled) {
					setIsLoading(false)
				}
			}
		}

		checkImages()

		return () => {
			cancelled = true
		}
	}, [JSON.stringify(imageUrls), enabled])

	return {
		results,
		isLoading,
		error,
	}
}