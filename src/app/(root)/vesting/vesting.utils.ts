import { CoinMetadata } from "@mysten/sui/client"

export interface VestingPosition {
	id: string
	owner: string
	coinType: string
	lockedAmount: string
	claimedAmount: string
	startTime: number
	duration: number
	endTime: number
	claimableAmount: string
}


export const formatDuration = (ms: number): string => {
	const days = Math.floor(ms / (1000 * 60 * 60 * 24))
	const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
	const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60))

	const parts = []
	if (days > 0) parts.push(`${days}d`)
	if (hours > 0) parts.push(`${hours}h`)
	if (minutes > 0) parts.push(`${minutes}m`)

	return parts.length > 0 ? parts.join(" ") : "0m"
}

export const parseVestingDuration = (value: string, unit: string): number => {
	const num = parseInt(value)
	if (isNaN(num) || num <= 0) return 0

	switch (unit) {
		case "minutes":
			return num * 60 * 1000
		case "hours":
			return num * 60 * 60 * 1000
		case "days":
			return num * 24 * 60 * 60 * 1000
		case "weeks":
			return num * 7 * 24 * 60 * 60 * 1000
		case "months":
			return num * 30 * 24 * 60 * 60 * 1000
		default:
			return 0
	}
}