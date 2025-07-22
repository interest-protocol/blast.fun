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

export const formatMistToSui = (mist: bigint | number | undefined): string => {
	if (!mist) return "0.00"

	const mistBigInt = BigInt(mist)
	const suiValue = Number(mistBigInt) / Number(MIST_PER_SUI)

	return suiValue.toFixed(2)
}

export const formatAmountWithSuffix = (amount: string | number | bigint | undefined): string => {
	if (amount == null) return "0"

	const bn = new BigNumber(amount.toString()).shiftedBy(-9)
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

export function calculateTokenPrice(pool: { quoteBalance: string; coinBalance: string; coinMetadata?: { decimals?: number } }): number {
	const quoteBalance = parseFloat(pool.quoteBalance)
	const coinBalance = parseFloat(pool.coinBalance)
	const decimals = pool.coinMetadata?.decimals || 9
	
	if (coinBalance === 0 || isNaN(coinBalance) || isNaN(quoteBalance)) return 0
	
	// For bonding curve AMMs, the price is the ratio of reserves
	// Price = (quote balance / coin balance) * (10^decimals / 10^9)
	// This gives us the price of 1 token in SUI
	const price = (quoteBalance / coinBalance) * (Math.pow(10, decimals) / Math.pow(10, 9))
	
	return price
}

export function calculateMarketCap(pool: { quoteBalance: string; coinBalance: string; coinMetadata?: { decimals?: number } }): number {
	const price = calculateTokenPrice(pool)
	// Market cap = 1 billion * price (in SUI)
	// Convert to smallest unit (MIST) for formatAmountWithSuffix
	const marketCapInSui = 1_000_000_000 * price
	const marketCapInMist = marketCapInSui * Math.pow(10, 9)
	return marketCapInMist
}
