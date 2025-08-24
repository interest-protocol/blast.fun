import { type ReactNode, createElement } from "react"
import { MIST_PER_SUI } from "@mysten/sui/utils"
import BigNumber from "bignumber.js"

export const formatAmount = (amount: string | number | bigint | undefined) => {
	if (amount == null) {
		return undefined
	}

	let bn = new BigNumber(amount.toString())
	bn = bn.shiftedBy(-9)

	return bn.decimalPlaces(2, BigNumber.ROUND_DOWN).toFormat(2)
}

export const formatMistToSui = (mist: string | number | bigint | undefined): string => {
	if (!mist) return "0.00"

	const mistBigInt = BigInt(mist)
	const suiValue = Number(mistBigInt) / Number(MIST_PER_SUI)

	return suiValue.toFixed(2)
}

export const formatAmountWithSuffix = (amount: string | number | bigint | undefined, shift = 9): string => {
	if (amount == null) return "0"

	const bn = new BigNumber(amount.toString()).shiftedBy(-shift)
	const value = bn.toNumber()

	if (!isFinite(value)) return "0"

	const thresholds = [
		{ min: 1e9, suffix: "B", divisor: 1e9 },
		{ min: 1e6, suffix: "M", divisor: 1e6 },
		{ min: 1e3, suffix: "K", divisor: 1e3 },
		{ min: 1, suffix: "", divisor: 1 },
		{ min: 0, suffix: "", divisor: 1, decimals: 4 },
	]

	const {
		suffix,
		divisor,
		decimals: minDecimals,
	} = thresholds.find((t) => value >= t.min) || thresholds[thresholds.length - 1]
	const scaled = value / divisor

	// get decimal places based on scaled value
	const decimals = minDecimals !== undefined ? minDecimals : scaled >= 100 ? 0 : scaled >= 10 ? 1 : 2

	// remove trailing zeros
	const formatted = parseFloat(scaled.toFixed(decimals)).toString()

	return `${formatted}${suffix}`
}

export const formatNumberWithSuffix = (value: number | undefined): string => {
	if (value == null || !isFinite(value)) return "0"

	const thresholds = [
		{ min: 1e9, suffix: "B", divisor: 1e9 },
		{ min: 1e6, suffix: "M", divisor: 1e6 },
		{ min: 1e3, suffix: "K", divisor: 1e3 },
		{ min: 1, suffix: "", divisor: 1 },
		{ min: 0, suffix: "", divisor: 1, decimals: 4 },
	]

	const {
		suffix,
		divisor,
		decimals: minDecimals,
	} = thresholds.find((t) => value >= t.min) || thresholds[thresholds.length - 1]
	const scaled = value / divisor

	// get decimal places based on scaled value
	const decimals = minDecimals !== undefined ? minDecimals : scaled >= 100 ? 0 : scaled >= 10 ? 1 : 2

	// remove trailing zeros
	const formatted = parseFloat(scaled.toFixed(decimals)).toString()

	return `${formatted}${suffix}`
}

export const formatSmallPrice = (value: number | undefined): ReactNode => {
	if (!value || value === 0) return "0"

	if (value < 0.01) {
		const str = value.toString()
		const match = str.match(/^0\.0*/)
		if (match) {
			const zeros = match[0].length - 2 // -2 for "0."
			if (zeros > 2) {
				const significantPart = str.substring(match[0].length)
				const digits = significantPart.substring(0, 4)

				return createElement(
					'span',
					null,
					'0.0',
					createElement('sub', { style: { fontSize: '0.75em' } }, zeros),
					digits
				)
			}
		}

		return value.toFixed(4).replace(/\.?0+$/, '')
	}

	return formatNumberWithSuffix(value)
}
