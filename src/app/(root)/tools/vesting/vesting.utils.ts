import type { Vesting } from "@interest-protocol/memez-fun-sdk"

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
	isDestroyed: boolean
}

interface VestingActionState {
	claimableAmount: string
	hasStarted: boolean
	isFullyUnlocked: boolean
}

export const isVestingActionDisabled = ({ claimableAmount, hasStarted, isFullyUnlocked }: VestingActionState): boolean =>
	!hasStarted || (!isFullyUnlocked && (!claimableAmount || claimableAmount === "0"))

export const toVestingPosition = (vesting: Vesting, currentTime = Date.now()): VestingPosition => {
	const startTime = Number(vesting.start)
	const duration = Number(vesting.duration)
	const endTime = startTime + duration
	const totalAmount = vesting.balance + vesting.released
	const elapsed = Math.max(0, Math.min(currentTime - startTime, duration))
	const vestedAmount = duration > 0 ? (totalAmount * BigInt(elapsed)) / BigInt(duration) : totalAmount
	const claimableAmount = vestedAmount > vesting.released ? vestedAmount - vesting.released : 0n

	return {
		id: vesting.objectId,
		owner: vesting.owner,
		coinType: vesting.coinType,
		lockedAmount: totalAmount.toString(),
		claimedAmount: vesting.released.toString(),
		claimableAmount: claimableAmount.toString(),
		startTime,
		duration,
		endTime,
		isDestroyed: false,
	}
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
