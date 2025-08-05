"use client"

import { useEffect, useState } from "react"

interface RelativeAgeProps {
	timestamp: number
	className?: string
}

export function RelativeAge({ timestamp, className }: RelativeAgeProps) {
	const [age, setAge] = useState("")

	useEffect(() => {
		const formatAge = () => {
			const seconds = Math.floor((Date.now() - timestamp) / 1000)

			if (seconds < 60) return `${seconds}s ago`

			const minutes = Math.floor(seconds / 60)
			if (minutes < 60) return `${minutes}m ago`

			const hours = Math.floor(minutes / 60)
			if (hours < 24) return `${hours}h ago`

			return `${Math.floor(hours / 24)}d ago`
		}

		setAge(formatAge())

		const secondsOld = Math.floor((Date.now() - timestamp) / 1000)
		if (secondsOld >= 3600) {
			return
		}

		const interval = setInterval(() => {
			const newAge = formatAge()
			setAge(newAge)

			const currentSeconds = Math.floor((Date.now() - timestamp) / 1000)
			if (currentSeconds >= 3600) {
				clearInterval(interval)
			}
		}, 1000)

		return () => clearInterval(interval)
	}, [timestamp])

	return <span className={className}>{age}</span>
}