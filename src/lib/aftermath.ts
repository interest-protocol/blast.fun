import { Transaction } from "@mysten/sui/transactions"
import { SUI_TYPE_ARG } from "@mysten/sui/utils"
import { Aftermath } from "aftermath-ts-sdk"
import { env } from "@/env"

let aftermathInstance: Aftermath | null = null

async function getAftermath(): Promise<Aftermath> {
	if (!aftermathInstance) {
		aftermathInstance = new Aftermath("MAINNET")
		await aftermathInstance.init()
	}

	return aftermathInstance
}

export interface SwapQuoteParams {
	coinInType: string
	coinOutType: string
	amountIn: bigint
	slippagePercentage?: number
}

export interface SwapParams extends SwapQuoteParams {
	address: string
	referrer?: string
}

export async function getSwapQuote({ coinInType, coinOutType, amountIn, slippagePercentage = 1 }: SwapQuoteParams) {
	try {
		const af = await getAftermath()
		const router = af.Router()

		const route = await router.getCompleteTradeRouteGivenAmountIn({
			coinInType,
			coinOutType,
			coinInAmount: amountIn,
		})

		if (!route) {
			throw new Error("No route found for swap")
		}

		const slippageMultiplier = 1 - slippagePercentage / 100
		const minAmountOut = BigInt(Math.floor(Number(route.coinOut.amount) * slippageMultiplier))

		return {
			route,
			amountOut: route.coinOut.amount,
			minAmountOut,
			priceImpact: route.spotPrice,
		}
	} catch (error) {
		console.error("Failed to get swap quote:", error)
		throw error
	}
}

export async function executeSwap({
	coinInType,
	coinOutType,
	amountIn,
	address,
	slippagePercentage = 1,
	referrer,
}: SwapParams): Promise<Transaction> {
	try {
		const af = await getAftermath()
		const router = af.Router()

		const route = await router.getCompleteTradeRouteGivenAmountIn({
			coinInType,
			coinOutType,
			coinInAmount: amountIn,
			referrer,
			externalFee: {
				recipient: env.NEXT_PUBLIC_FEE_ADDRESS,
				feePercentage: 0.01,
			},
		})

		if (!route) {
			throw new Error("No route found for swap")
		}

		const tx = await router.getTransactionForCompleteTradeRoute({
			walletAddress: address,
			completeRoute: route,
			slippage: slippagePercentage / 100,
		})

		return tx
	} catch (error) {
		console.error("Failed to execute swap:", error)
		throw error
	}
}

export async function buyMigratedToken({
	tokenType,
	suiAmount,
	address,
	slippagePercentage = 1,
	referrer,
}: {
	tokenType: string
	suiAmount: bigint
	address: string
	slippagePercentage?: number
	referrer?: string
}): Promise<Transaction> {
	return executeSwap({
		coinInType: SUI_TYPE_ARG,
		coinOutType: tokenType,
		amountIn: suiAmount,
		address,
		slippagePercentage,
		referrer,
	})
}

export async function sellMigratedToken({
	tokenType,
	tokenAmount,
	address,
	slippagePercentage = 1,
	referrer,
}: {
	tokenType: string
	tokenAmount: bigint
	address: string
	slippagePercentage?: number
	referrer?: string
}): Promise<Transaction> {
	try {
		const af = await getAftermath()
		const router = af.Router()

		const route = await router.getCompleteTradeRouteGivenAmountIn({
			coinInType: tokenType,
			coinOutType: SUI_TYPE_ARG,
			coinInAmount: tokenAmount,
			referrer,
			externalFee: {
				recipient: env.NEXT_PUBLIC_FEE_ADDRESS,
				feePercentage: 0.01,
			},
		})

		if (!route) {
			throw new Error("No route found for swap")
		}

		const tx = await router.getTransactionForCompleteTradeRoute({
			walletAddress: address,
			completeRoute: route,
			slippage: slippagePercentage / 100,
		})

		return tx
	} catch (error) {
		console.error("Failed to sell migrated token:", error)
		throw error
	}
}

export async function getBuyQuote(tokenType: string, suiAmount: bigint, slippagePercentage = 1) {
	return getSwapQuote({
		coinInType: SUI_TYPE_ARG,
		coinOutType: tokenType,
		amountIn: suiAmount,
		slippagePercentage,
	})
}

export async function getSellQuote(tokenType: string, tokenAmount: bigint, slippagePercentage = 1) {
	return getSwapQuote({
		coinInType: tokenType,
		coinOutType: SUI_TYPE_ARG,
		amountIn: tokenAmount,
		slippagePercentage,
	})
}
