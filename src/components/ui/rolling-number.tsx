"use client"

import { memo, useEffect, useRef, useState } from "react"
import { cn } from "@/utils"

interface RollingDigitProps {
	digit: string
	previousDigit: string
	delay: number
}

const RollingDigit = memo(({ digit, previousDigit, delay }: RollingDigitProps) => {
	const [isAnimating, setIsAnimating] = useState(false)
	const [currentDigit, setCurrentDigit] = useState(digit)

	useEffect(() => {
		if (digit !== previousDigit && !isNaN(Number(digit))) {
			setIsAnimating(true)

			const timer = setTimeout(() => {
				setCurrentDigit(digit)
				setTimeout(() => setIsAnimating(false), 300)
			}, delay)

			return () => clearTimeout(timer)
		} else {
			// update without animation
			setCurrentDigit(digit)
		}
	}, [digit, previousDigit, delay])

	// non-numeric characters (like decimal point) don't animate
	if (isNaN(Number(digit))) {
		return <span className="inline-block">{digit}</span>
	}

	return (
		<span className="relative inline-block h-[1em] w-[0.6em] overflow-hidden">
			<span
				className={cn(
					"absolute inset-0 flex flex-col transition-transform duration-300 ease-out",
					isAnimating && "-translate-y-[1em]"
				)}
			>
				<span className="flex h-[1em] items-center justify-center">
					{isAnimating ? previousDigit : currentDigit}
				</span>
				<span className="flex h-[1em] items-center justify-center">{currentDigit}</span>
			</span>
		</span>
	)
})

RollingDigit.displayName = "RollingDigit"

interface RollingNumberProps {
	value: number
	formatFn?: (value: number) => string
	className?: string
	staggerDelay?: number
	direction?: "ltr" | "rtl"
	prefix?: string
}

export function RollingNumber({
	value,
	formatFn = (v) => (v > 0.01 ? v.toFixed(4) : v.toFixed(8)),
	className,
	staggerDelay = 30,
	direction = "rtl",
	prefix,
}: RollingNumberProps) {
	const [digits, setDigits] = useState<string[]>([])
	const [previousDigits, setPreviousDigits] = useState<string[]>([])
	const previousValueRef = useRef<string>("")

	useEffect(() => {
		const formatted = formatFn(value)
		const newDigits = formatted.split("")

		// first render; set the digits without animation
		if (previousValueRef.current === "") {
			setDigits(newDigits)
			setPreviousDigits(newDigits)
			previousValueRef.current = formatted
			return
		}

		const oldDigits = previousValueRef.current.split("")

		// no need to pad, just use the arrays as is
		setPreviousDigits(oldDigits)
		setDigits(newDigits)
		previousValueRef.current = formatted
	}, [value, formatFn])

	const getDelay = (index: number) => {
		if (digits[index] === previousDigits[index]) return 0

		let firstChanged = -1
		for (let i = 0; i < digits.length; i++) {
			if (digits[i] !== previousDigits[i] && !isNaN(Number(digits[i]))) {
				firstChanged = i
				break
			}
		}

		if (firstChanged === -1) return 0

		// stagger from the first changed digit
		if (direction === "rtl") {
			// right to left
			const distanceFromEnd = digits.length - 1 - index
			const distanceFromFirstChanged = digits.length - 1 - firstChanged
			if (index >= firstChanged) {
				return (distanceFromFirstChanged - distanceFromEnd) * staggerDelay
			}
		} else {
			// left to right
			if (index >= firstChanged) {
				return (index - firstChanged) * staggerDelay
			}
		}

		return 0
	}

	return (
		<span className={cn("inline-flex items-center font-mono tabular-nums", className)}>
			{prefix && <span className="inline-block">{prefix}</span>}
			{digits.map((digit, index) => (
				<RollingDigit
					key={index}
					digit={digit}
					previousDigit={previousDigits[index] || digit}
					delay={getDelay(index)}
				/>
			))}
		</span>
	)
}
