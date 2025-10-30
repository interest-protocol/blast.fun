import { formatAmount } from "@/utils/format"
import { POW_9 } from "./farms.const"

export function parseInputAmount(input: string): bigint {
	if (!input || input === "") return 0n

	const cleanInput = input.replace(/,/g, "")
	const floatValue = parseFloat(cleanInput)

	if (isNaN(floatValue)) return 0n

	return BigInt(Math.floor(floatValue * Number(POW_9)))
}

export function formatTokenAmount(amount: bigint, decimals = 9): string {
	return formatAmount(amount, decimals) || "0.00"
}