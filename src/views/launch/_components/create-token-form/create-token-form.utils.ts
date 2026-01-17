import z from "zod"

export const tokenSchema = z.object({
	name: z.string().min(3, "Minimum 3 characters"),
	symbol: z
		.string()
		.min(2, "Minimum 2 characters")
		.max(10, "Maximum 10 characters")
		.regex(/^[a-zA-Z][\x21-\x7E]*$/),
	description: z.string().min(10, "Minimum 10 characters").max(256, "Maximum 256 characters"),
	imageUrl: z.string().optional(),
	website: z.union([
		z.literal(""),
		z.string().url("Invalid URL")
	]).optional(),
	telegram: z.union([
		z.literal(""),
		z.string().url("Invalid URL")
	]).optional(),
	twitter: z.union([
		z.literal(""),
		z.string().url("Invalid URL")
	]).optional(),
	hideIdentity: z.boolean(),
	sniperProtection: z.boolean(),
	requireTwitter: z.boolean(),
	revealTraderIdentity: z.boolean(),
	minFollowerCount: z.string().optional().refine(
		(val) => !val || Number(val) >= 0,
		"Must be a positive number"
	),
	maxHoldingPercent: z.string().optional().refine(
		(val) => !val || (Number(val) >= 0.1 && Number(val) <= 100),
		"Must be between 0.1% and 100%"
	),
	devBuyAmount: z.string().optional().refine(
		(val) => !val || Number(val) >= 0,
		"Must be a positive number"
	),
	burnTax: z.string().optional().refine(
		(val) => !val || (Number(val) >= 0 && Number(val) <= 60),
		"Must be between 0% and 60%"
	),
})
